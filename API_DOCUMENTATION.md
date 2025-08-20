# API Documentation - Authentication Endpoints

## Base URL
```
http://localhost:3001/api/auth
```

## Authentication Endpoints

### 1. User Registration
**POST** `/register`

Register a new user account.

#### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

#### Validation Rules
- **name**: 2-50 characters, letters and spaces only
- **email**: Valid email format, max 100 characters
- **password**: 8-128 characters, must contain:
  - At least one lowercase letter
  - At least one uppercase letter
  - At least one number
  - At least one special character (@$!%*?&)
- **confirmPassword**: Must match password exactly

#### Success Response (201)
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses
- **400**: Validation errors
- **409**: Email already registered
- **429**: Too many registration attempts
- **500**: Server error

#### Example cURL
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

### 2. User Login
**POST** `/login`

Authenticate user and receive JWT token.

#### Request Body
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses
- **400**: Validation errors
- **401**: Invalid email or password
- **429**: Too many login attempts
- **500**: Server error

#### Example cURL
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Get User Profile
**GET** `/me`

Get current user profile (requires authentication).

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Success Response (200)
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-08-20 02:25:38"
  }
}
```

#### Error Responses
- **401**: No token provided or invalid token
- **404**: User not found
- **500**: Server error

#### Example cURL
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. User Logout
**POST** `/logout`

Logout user (client-side token removal).

#### Success Response (200)
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### Example cURL
```bash
curl -X POST http://localhost:3001/api/auth/logout
```

## Security Features

### Rate Limiting
- **Registration**: 5 attempts per 15 minutes per IP
- **Login**: 5 attempts per 15 minutes per IP

### JWT Token
- **Access Token**: 24-hour expiration
- **Refresh Token**: 7-day expiration (for future implementation)
- **Secret**: Configurable via `JWT_SECRET` environment variable

### Password Security
- **Hashing**: bcrypt with 10 salt rounds
- **Requirements**: Strong password policy enforced
- **Storage**: Only hashed passwords stored in database

### Input Validation
- **Email**: Normalized and validated
- **Name**: Sanitized and length-checked
- **Password**: Strength requirements enforced
- **XSS Protection**: Input sanitization

## Error Handling

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "Please provide a valid email address",
      "path": "email",
      "location": "body"
    }
  ]
}
```

### Rate Limiting
```json
{
  "success": false,
  "message": "Too many registration attempts. Please try again later."
}
```

### Authentication Errors
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

## Testing

### Manual Testing with cURL
```bash
# Test registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"SecurePass123!","confirmPassword":"SecurePass123!"}'

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'

# Test profile (replace TOKEN with actual token)
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Validation Testing
```bash
# Test weak password
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"123","confirmPassword":"123"}'

# Test invalid email
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"invalid-email","password":"SecurePass123!","confirmPassword":"SecurePass123!"}'
```
