# Railway Deployment Configuration

## Environment Variables Required

Set these environment variables in your Railway dashboard:

### Required Variables:
```bash
# SendGrid Email Configuration
SENDGRID_API_KEY=your_new_sendgrid_api_key_here

# Production Base URL
BASE_URL=https://emergence-production.up.railway.app

# Database Configuration
DATABASE_URL=your_railway_database_url

# JWT Secret
JWT_SECRET=your_secure_jwt_secret

# Node Environment
NODE_ENV=production

# Emergence Platform
EMERGENCE_PLATFORM_URL=https://emergence-production.up.railway.app
EMERGENCE_API_KEY=ak_6acbf57b54f4b8bbc
```

## 🔐 SECURITY WARNING

**IMPORTANT**: Never commit API keys to your repository. Always use environment variables.

### Steps to secure your API key:

1. **Go to SendGrid Dashboard** → API Keys
2. **Create a new API key** with "Mail Send" permissions only
3. **Add the API key to Railway environment variables** (not in code)
4. **Never share API keys** in code, messages, or public repositories
5. **Regenerate keys immediately** if accidentally exposed

## Railway Environment Setup

1. **Access Railway Dashboard**: https://railway.app
2. **Go to your project** → Variables tab
3. **Add each environment variable** listed above
4. **Deploy** your application
5. **Test email verification** with a real email address

## Email Verification Flow

1. User registers at: `https://emergence-production.up.railway.app/register`
2. Verification email sent from: `emergence.a2a@gmail.com`
3. User clicks verification link in email
4. Email verification processed at: `https://emergence-production.up.railway.app/verify-email?token=...`
5. User can now login at: `https://emergence-production.up.railway.app/login`

## Testing Checklist

- [ ] Register a new user account
- [ ] Check email inbox for verification message
- [ ] Click verification link
- [ ] Confirm account is verified
- [ ] Login with verified account
- [ ] Test that unverified users cannot login

## SendGrid Configuration Verification

The system will log SendGrid connection status in Railway logs. Check for:
- ✅ "SendGrid configuration check: SENDGRID_API_KEY: SET"
- ✅ "SMTP connection verified. Sending email now..."
- ✅ "Verification email sent successfully"