const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// JWT Secret Key (should be moved to environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate JWT token for user
 * @param {Object} user - User object with id, email, name
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name
  };

  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN 
  });
};

/**
 * Verify JWT token middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || 
                req.cookies?.token || 
                req.query.token;

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please login again.' 
      });
    }
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

/**
 * Optional token verification middleware (doesn't fail if no token)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalVerifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || 
                req.cookies?.token || 
                req.query.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token is invalid but we don't fail the request
      req.user = null;
    }
  } else {
    req.user = null;
  }
  
  next();
};

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @param {number} saltRounds - Number of salt rounds (default: 10)
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password, saltRounds = 10) => {
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Extract validation errors from express-validator
 * @param {Object} req - Express request object
 * @returns {Array} Array of validation errors
 */
const getValidationErrors = (req) => {
  const errors = validationResult(req);
  return errors.array();
};

/**
 * Check if user is authenticated
 * @param {Object} req - Express request object
 * @returns {boolean} True if user is authenticated
 */
const isAuthenticated = (req) => {
  return req.user && req.user.userId;
};

/**
 * Check if user owns the resource (agent)
 * @param {Object} req - Express request object
 * @param {number} agentUserId - User ID of the agent owner
 * @returns {boolean} True if user owns the resource
 */
const isOwner = (req, agentUserId) => {
  return isAuthenticated(req) && req.user.userId === agentUserId;
};

/**
 * Require authentication middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireAuth = (req, res, next) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required.' 
    });
  }
  next();
};

/**
 * Require ownership middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireOwnership = (req, res, next) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required.' 
    });
  }

  const agentUserId = parseInt(req.params.userId || req.body.userId);
  if (!isOwner(req, agentUserId)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. You do not own this resource.' 
    });
  }
  
  next();
};

/**
 * Require verified email middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireVerifiedEmail = (req, res, next) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required.' 
    });
  }

  // Check if user is verified (this will be set in the token during login)
  if (!req.user.isVerified) {
    return res.status(403).json({ 
      success: false, 
      message: 'Email verification required. Please check your email and verify your account before uploading agents.' 
    });
  }
  
  next();
};

/**
 * Rate limiting helper for authentication attempts
 * @param {Object} attempts - Object to store attempt counts
 * @param {string} key - Key to track (usually IP or email)
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} True if rate limit exceeded
 */
const checkRateLimit = (attempts, key, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean old attempts
  if (attempts[key]) {
    attempts[key] = attempts[key].filter(timestamp => timestamp > windowStart);
  } else {
    attempts[key] = [];
  }
  
  // Check if limit exceeded
  if (attempts[key].length >= maxAttempts) {
    return true; // Rate limit exceeded
  }
  
  // Add current attempt
  attempts[key].push(now);
  return false; // Within rate limit
};

/**
 * Generate refresh token
 * @param {Object} user - User object
 * @returns {string} Refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    userId: user.id,
    type: 'refresh'
  };

  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '7d' // Refresh tokens last longer
  });
};

/**
 * Verify refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Object|null} Decoded token payload or null
 */
const verifyRefreshToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    if (decoded.type !== 'refresh') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = {
  // JWT Functions
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  optionalVerifyToken,
  
  // Password Functions
  hashPassword,
  comparePassword,
  
  // Validation Functions
  getValidationErrors,
  
  // Authentication Helpers
  isAuthenticated,
  isOwner,
  requireAuth,
  requireOwnership,
  requireVerifiedEmail,
  
  // Rate Limiting
  checkRateLimit,
  
  // Constants
  JWT_SECRET,
  JWT_EXPIRES_IN
};
