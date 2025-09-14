const dns = require('dns').promises;
const { promisify } = require('util');

/**
 * Basic email format validation
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email format is valid
 */
function isValidEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if email domain has valid MX records (email server)
 * @param {string} email - Email address to check
 * @returns {Promise<boolean>} - True if domain has MX records
 */
async function hasValidMXRecord(email) {
  try {
    const domain = email.split('@')[1];
    if (!domain) return false;
    
    const mxRecords = await dns.resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch (error) {
    console.log(`MX record check failed for ${email}:`, error.message);
    return false;
  }
}

/**
 * Comprehensive email validation
 * @param {string} email - Email address to validate
 * @returns {Promise<{isValid: boolean, reason?: string}>} - Validation result
 */
async function validateEmail(email) {
  // Step 1: Basic format validation
  if (!isValidEmailFormat(email)) {
    return {
      isValid: false,
      reason: 'Invalid email format'
    };
  }

  // Step 2: Check for common disposable email domains
  const disposableDomains = [
    '10minutemail.com', 'guerrillamail.com', 'tempmail.org', 'mailinator.com',
    'yopmail.com', 'throwaway.email', 'temp-mail.org', 'fakeinbox.com',
    'sharklasers.com', 'getairmail.com', 'mailnesia.com', 'maildrop.cc',
    'mailmetrash.com', 'trashmail.com', 'mailnull.com', 'spam4.me',
    'bccto.me', 'chacuo.net', 'dispostable.com', 'mailnesia.com'
  ];
  
  const domain = email.split('@')[1].toLowerCase();
  if (disposableDomains.includes(domain)) {
    return {
      isValid: false,
      reason: 'Disposable email addresses are not allowed'
    };
  }

  // Step 3: Check if domain has MX records (optional - can be disabled for performance)
  const checkMX = process.env.CHECK_MX_RECORDS !== 'false'; // Default to true
  if (checkMX) {
    const hasMX = await hasValidMXRecord(email);
    if (!hasMX) {
      return {
        isValid: false,
        reason: 'Email domain does not have valid mail servers'
      };
    }
  }

  return {
    isValid: true
  };
}

/**
 * Validate email during registration
 * @param {string} email - Email address to validate
 * @returns {Promise<{isValid: boolean, reason?: string}>} - Validation result
 */
async function validateEmailForRegistration(email) {
  const result = await validateEmail(email);
  
  if (!result.isValid) {
    return result;
  }

  // Additional checks for registration
  const domain = email.split('@')[1].toLowerCase();
  
  // Check for very short domains (likely fake)
  if (domain.length < 3) {
    return {
      isValid: false,
      reason: 'Invalid email domain'
    };
  }

  // Check for numeric-only domains (likely fake)
  if (/^\d+$/.test(domain.split('.')[0])) {
    return {
      isValid: false,
      reason: 'Invalid email domain'
    };
  }

  return {
    isValid: true
  };
}

module.exports = {
  validateEmail,
  validateEmailForRegistration,
  isValidEmailFormat,
  hasValidMXRecord
};
