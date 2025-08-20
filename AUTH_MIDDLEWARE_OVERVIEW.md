# Authentication Middleware Overview

## File Structure

### `auth.js` - Core Authentication Middleware
Contains all authentication utilities and middleware functions.

### `authValidation.js` - Validation Rules
Contains express-validator rules for input validation and sanitization.

## Key Features

### 🔐 JWT Token Management
- **Access Tokens**: 24-hour expiration (configurable)
- **Refresh Tokens**: 7-day expiration for token renewal
- **Multiple Token Sources**: Authorization header, cookies, or query parameters
- **Token Verification**: Automatic expiration and validity checking

### 🔒 Password Security
- **bcrypt Hashing**: 10 salt rounds by default (configurable)
- **Secure Comparison**: Timing-attack resistant password verification
- **Strong Password Requirements**: Enforced through validation rules

### 🛡️ Security Features
- **Rate Limiting**: Configurable attempt limits with time windows
- **Input Sanitization**: XSS and injection protection
- **Ownership Verification**: Resource-level access control
- **Optional Authentication**: Flexible middleware for public/private routes

### ✅ Validation System
- **Comprehensive Rules**: Registration, login, password changes, profile updates
- **Parameter Validation**: User IDs, agent IDs, pagination, search queries
- **Custom Validators**: Database-aware validation for uniqueness and existence
- **Error Extraction**: Standardized error handling and response formatting

## Usage Examples

### Basic Authentication Middleware
```javascript
const { verifyToken, requireAuth } = require('./auth');

// Protect a route
app.get('/protected', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// Alternative syntax
app.get('/protected', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
```

### Optional Authentication
```javascript
const { optionalVerifyToken } = require('./auth');

// Route works for both authenticated and anonymous users
app.get('/public', optionalVerifyToken, (req, res) => {
  if (req.user) {
    res.json({ user: req.user, personalized: true });
  } else {
    res.json({ user: null, personalized: false });
  }
});
```

### Resource Ownership
```javascript
const { requireOwnership } = require('./auth');

// Only allow users to modify their own agents
app.put('/agents/:agentId', verifyToken, requireOwnership, (req, res) => {
  // User can only modify agents they own
});
```

### Input Validation
```javascript
const { registerValidation, getValidationErrors } = require('./authValidation');
const { getValidationErrors } = require('./auth');

app.post('/register', registerValidation, (req, res) => {
  const errors = getValidationErrors(req);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  // Process registration
});
```

### Rate Limiting
```javascript
const { checkRateLimit } = require('./auth');

const loginAttempts = {};

app.post('/login', (req, res) => {
  const email = req.body.email;
  
  if (checkRateLimit(loginAttempts, email, 5, 15 * 60 * 1000)) {
    return res.status(429).json({ message: 'Too many login attempts' });
  }
  
  // Process login
});
```

## Configuration

### Environment Variables
```bash
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
```

### Default Settings
- **JWT Secret**: Falls back to development key if not set
- **Token Expiration**: 24 hours for access tokens, 7 days for refresh tokens
- **Password Salt Rounds**: 10 rounds for bcrypt hashing
- **Rate Limiting**: 5 attempts per 15 minutes by default

## Security Best Practices

1. **Environment Variables**: Always set JWT_SECRET in production
2. **HTTPS Only**: Use HTTPS in production for token transmission
3. **Token Storage**: Store tokens securely (httpOnly cookies recommended)
4. **Password Requirements**: Enforce strong password policies
5. **Rate Limiting**: Implement rate limiting on authentication endpoints
6. **Input Validation**: Always validate and sanitize user input
7. **Error Messages**: Don't leak sensitive information in error responses

## Integration Points

The authentication middleware is designed to work seamlessly with:
- **Express.js**: Standard middleware integration
- **Database Layer**: Custom validators for database operations
- **Frontend**: JWT token handling and refresh mechanisms
- **API Routes**: Protected and public endpoint management
