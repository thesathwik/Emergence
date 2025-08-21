const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../database');
const { 
  generateToken, 
  hashPassword, 
  getValidationErrors,
  checkRateLimit 
} = require('../auth');
const { 
  registerValidation, 
  loginValidation,
  validateUniqueEmail 
} = require('../authValidation');
const { 
  generateVerificationToken, 
  sendVerificationEmail 
} = require('../emailService');

// Rate limiting storage for registration attempts
const registrationAttempts = {};

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = getValidationErrors(req);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    const { name, email, password, confirmPassword } = req.body;

    // Rate limiting check
    const clientIP = req.ip || req.connection.remoteAddress;
    if (checkRateLimit(registrationAttempts, clientIP, 5, 15 * 60 * 1000)) {
      return res.status(429).json({
        success: false,
        message: 'Too many registration attempts. Please try again later.'
      });
    }

    // Check if email already exists
    try {
      const existingUser = await dbHelpers.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }
    } catch (error) {
      console.error('Error checking existing user:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking user existence'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password, 10);

    // Create user data
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash: passwordHash
    };

    // Save user to database
    const newUser = await dbHelpers.createUser(userData);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Save verification token to database
    await dbHelpers.setVerificationToken(newUser.id, verificationToken, expiresAt);

    // Send verification email
    const baseUrl = process.env.BASE_URL || `http://${req.get('host')}`;
    const emailResult = await sendVerificationEmail(newUser.email, newUser.name, verificationToken, baseUrl);
    
    if (!emailResult.success) {
      console.warn('Email verification not sent:', emailResult.message);
      // Log the verification URL for manual verification if needed
      if (emailResult.verificationUrl) {
        console.log('Manual verification URL:', emailResult.verificationUrl);
      }
    }

    // Generate JWT token (user will be unverified initially)
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      isVerified: false
    });

    // Return success response
    let responseMessage = 'User registered successfully.';
    let verificationUrl = null;
    
    if (emailResult.success) {
      responseMessage += ' Please check your email to verify your account.';
    } else {
      responseMessage += ' Email verification failed due to connection issues.';
      if (emailResult.verificationUrl) {
        verificationUrl = emailResult.verificationUrl;
        responseMessage += ' You can manually verify your email using the provided link.';
      }
    }
    
    res.status(201).json({
      success: true,
      message: responseMessage,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isVerified: false
      },
      token: token,
      emailSent: emailResult.success,
      verificationUrl: verificationUrl
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = getValidationErrors(req);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    const { email, password } = req.body;

    // Rate limiting check for login attempts
    const loginAttempts = {};
    const clientIP = req.ip || req.connection.remoteAddress;
    if (checkRateLimit(loginAttempts, clientIP, 5, 15 * 60 * 1000)) {
      return res.status(429).json({
        success: false,
        message: 'Too many login attempts. Please try again later.'
      });
    }

    // Find user by email
    const user = await dbHelpers.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const { comparePassword } = require('../auth');
    const isPasswordValid = await comparePassword(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      isVerified: user.is_verified === 1
    });

    // Return success response
    res.json({
      success: true,
      message: user.is_verified === 1 ? 'Login successful' : 'Login successful. Please verify your email to upload agents.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.is_verified === 1
      },
      token: token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile (requires authentication)
 */
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const { verifyToken } = require('../auth');
    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../auth');
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database
      const user = await dbHelpers.getUserById(decoded.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        }
      });

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/auth/verify-email
 * Verify user email with token
 */
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Verify the token
    const result = await dbHelpers.verifyUserEmail(token);

    if (!result.verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Get the verified user
    const user = await dbHelpers.getUserByVerificationToken(token);
    
    if (!user) {
      // User was already verified or token was invalid
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    res.json({
      success: true,
      message: 'Email verified successfully! You can now upload agents.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: true
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/resend-verification
 * Resend verification email
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await dbHelpers.getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.is_verified === 1) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Update verification token in database
    await dbHelpers.resendVerificationToken(user.id, verificationToken, expiresAt);

    // Send verification email
    const baseUrl = process.env.BASE_URL || `http://${req.get('host')}`;
    const emailResult = await sendVerificationEmail(user.email, user.name, verificationToken, baseUrl);
    
    if (!emailResult.success) {
      console.warn('Email verification not sent:', emailResult.message);
      return res.status(500).json({
        success: false,
        message: 'Email verification not configured. Please contact support.'
      });
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;
