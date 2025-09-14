const { body, param, query } = require('express-validator');

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 100 })
    .withMessage('Email must be less than 100 characters'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for password change
 */
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)'),
  
  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

/**
 * Validation rules for password reset request
 */
const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

/**
 * Validation rules for password reset with token
 */
const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)'),
  
  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

/**
 * Validation rules for user profile update
 */
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 100 })
    .withMessage('Email must be less than 100 characters')
];

/**
 * Validation rules for refresh token
 */
const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

/**
 * Validation rules for user ID parameter
 */
const userIdValidation = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer')
];

/**
 * Validation rules for agent ID parameter
 */
const agentIdValidation = [
  param('agentId')
    .isInt({ min: 1 })
    .withMessage('Agent ID must be a positive integer')
];

/**
 * Validation rules for pagination query parameters
 */
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

/**
 * Validation rules for search query
 */
const searchValidation = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
];

/**
 * Validation rules for category filter
 */
const categoryValidation = [
  query('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters')
];

/**
 * Sanitize user input for security
 */
const sanitizeUserInput = [
  body('name')
    .trim()
    .escape(),
  
  body('email')
    .trim()
    .toLowerCase(),
  
  body('description')
    .optional()
    .trim()
    .escape(),
  
  body('category')
    .optional()
    .trim()
    .escape()
];

/**
 * Custom validation for unique email
 * This should be used with the database helper
 */
const validateUniqueEmail = (dbHelpers) => {
  return body('email')
    .custom(async (email) => {
      try {
        const existingUser = await dbHelpers.getUserByEmail(email);
        if (existingUser) {
          throw new Error('Email already exists');
        }
        return true;
      } catch (error) {
        throw new Error('Email validation failed');
      }
    });
};

/**
 * Custom validation for existing user
 */
const validateUserExists = (dbHelpers) => {
  return param('userId')
    .custom(async (userId) => {
      try {
        const user = await dbHelpers.getUserById(userId);
        if (!user) {
          throw new Error('User not found');
        }
        return true;
      } catch (error) {
        throw new Error('User validation failed');
      }
    });
};

/**
 * Custom validation for existing agent
 */
const validateAgentExists = (dbHelpers) => {
  return param('agentId')
    .custom(async (agentId) => {
      try {
        const agent = await dbHelpers.getAgentById(agentId);
        if (!agent) {
          throw new Error('Agent not found');
        }
        return true;
      } catch (error) {
        throw new Error('Agent validation failed');
      }
    });
};

module.exports = {
  // Authentication validations
  registerValidation,
  loginValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
  refreshTokenValidation,
  
  // Parameter validations
  userIdValidation,
  agentIdValidation,
  
  // Query validations
  paginationValidation,
  searchValidation,
  categoryValidation,
  
  // Sanitization
  sanitizeUserInput,
  
  // Custom validations
  validateUniqueEmail,
  validateUserExists,
  validateAgentExists
};
