# Email Verification Setup

This application now includes email verification to ensure only verified users can upload agents. Follow these steps to set up email functionality.

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Email Configuration (for email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Base URL for email verification links
BASE_URL=http://localhost:3001

# Node Environment
NODE_ENV=development
```

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `SMTP_PASS`

## Other Email Providers

### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

### Custom SMTP Server
```bash
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Testing Email Configuration

You can test your email configuration by running:

```bash
node -e "
const { testEmailConfig } = require('./emailService');
testEmailConfig().then(result => {
  console.log('Email config test result:', result);
  process.exit(result ? 0 : 1);
});
"
```

## Email Verification Flow

1. **User Registration**: When a user registers, they receive a verification email
2. **Email Verification**: User clicks the link in the email to verify their account
3. **Upload Access**: Only verified users can upload agents
4. **Resend Verification**: Users can request a new verification email if needed

## Security Features

- **Token Expiration**: Verification tokens expire after 24 hours
- **Rate Limiting**: Registration and login attempts are rate-limited
- **Secure Tokens**: Verification tokens are cryptographically secure
- **Database Storage**: Tokens are stored securely in the database

## Troubleshooting

### Email Not Sending
- Check your SMTP credentials
- Ensure your email provider allows SMTP access
- Check firewall/network settings
- Verify the `BASE_URL` is correct

### Verification Links Not Working
- Ensure `BASE_URL` matches your actual server URL
- Check that the verification route is accessible
- Verify database migrations have been run

### Database Issues
- Run the application to trigger automatic database migrations
- Check that the new verification columns were added to the users table

## Production Deployment

For production deployment:

1. Use a production email service (SendGrid, Mailgun, etc.)
2. Set `NODE_ENV=production`
3. Use a strong `JWT_SECRET`
4. Set `BASE_URL` to your production domain
5. Consider using environment-specific email templates
