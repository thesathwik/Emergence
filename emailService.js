const nodemailer = require('nodemailer');
const crypto = require('crypto');
const https = require('https');

// SendGrid configuration for Emergence - trying multiple connection options
const getEmailConfig = () => {
  // Try SMTP first, fall back to API if needed
  return {
    host: 'smtp.sendgrid.net',
    port: 465, // Try secure port first
    secure: true, // Use SSL
    auth: {
      user: 'apikey', // This is the literal string 'apikey' for SendGrid
      pass: process.env.SENDGRID_API_KEY // Your SendGrid API key
    },
    connectionTimeout: 30000, // Increased timeout
    greetingTimeout: 30000,
    socketTimeout: 30000,
    pool: true,
    maxConnections: 5,
    maxMessages: 100
  };
};

const getEmailConfigFallback = () => {
  // Fallback configuration with different port
  return {
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    requireTLS: true
  };
};

// Create primary transporter
let transporter = nodemailer.createTransport(getEmailConfig());

// Create fallback transporter
let fallbackTransporter = null;

// Generate verification token
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// SendGrid Web API fallback function
async function sendEmailViaWebAPI(email, name, token, baseUrl) {
  return new Promise((resolve, reject) => {
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

    const emailData = {
      personalizations: [{
        to: [{ email: email, name: name }],
        subject: 'Welcome to Emergence - Please verify your email'
      }],
      from: {
        email: process.env.FROM_EMAIL || 'emergence.a2a@gmail.com',
        name: 'Emergence Platform'
      },
      reply_to: {
        email: process.env.FROM_EMAIL || 'emergence.a2a@gmail.com',
        name: 'Emergence Support'
      },
      categories: ['email-verification', 'user-onboarding'],
      custom_args: {
        purpose: 'email_verification',
        user_type: 'new_registration'
      },
      content: [{
        type: 'text/plain',
        value: `Welcome to Emergence!

Hi ${name},

Thank you for joining Emergence, the AI agent sharing platform. To complete your registration and start uploading your own AI agents, please verify your email address.

Verify your email: ${verificationUrl}

This verification link will expire in 24 hours for security reasons.

If you didn't create an account with Emergence, you can safely ignore this email.

---
Emergence Platform
AI Agent Marketplace
https://emergence-production.up.railway.app

This is an automated message. Please do not reply to this email.`
      }, {
        type: 'text/html',
        value: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Emergence</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">Emergence</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">AI Agent Marketplace</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; font-weight: 400;">Welcome to Emergence!</h2>

                            <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                                Hi <strong>${name}</strong>,
                            </p>

                            <p style="color: #666666; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                                Thank you for joining Emergence, the premier platform for sharing and discovering AI agents. To complete your registration and start uploading your own agents, please verify your email address.
                            </p>

                            <!-- CTA Button -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="padding: 25px 0;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px;">
                                                    <a href="${verificationUrl}" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px;">
                                                        Verify Email Address
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #666666; line-height: 1.6; margin: 25px 0 20px 0; font-size: 14px;">
                                If the button above doesn't work, copy and paste this link into your browser:
                            </p>

                            <p style="color: #667eea; word-break: break-all; margin: 0 0 25px 0; font-size: 14px; background-color: #f8f9fa; padding: 15px; border-radius: 4px; border-left: 3px solid #667eea;">
                                ${verificationUrl}
                            </p>

                            <p style="color: #888888; line-height: 1.6; margin: 0 0 20px 0; font-size: 14px;">
                                <strong>Security Note:</strong> This verification link will expire in 24 hours. If you didn't create an account with Emergence, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                            <p style="color: #6c757d; margin: 0 0 10px 0; font-size: 14px; text-align: center;">
                                <strong>Emergence Platform</strong><br>
                                AI Agent Marketplace
                            </p>
                            <p style="color: #6c757d; margin: 0; font-size: 12px; text-align: center;">
                                This is an automated message. Please do not reply to this email.<br>
                                Need help? Visit our support center at emergence-production.up.railway.app
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `
      }]
    };

    const postData = JSON.stringify(emailData);

    const options = {
      hostname: 'api.sendgrid.com',
      port: 443,
      path: '/v3/mail/send',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Email sent successfully via SendGrid Web API');
          resolve({ success: true, method: 'web_api' });
        } else {
          console.error('❌ SendGrid Web API error:', res.statusCode, data);
          reject(new Error(`SendGrid API error: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ SendGrid Web API request error:', error);
      reject(error);
    });

    req.setTimeout(30000, () => {
      console.error('❌ SendGrid Web API timeout');
      req.destroy();
      reject(new Error('Web API request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

// Send verification email with timeout protection
async function sendVerificationEmail(email, name, token, baseUrl) {
  console.log('SendGrid configuration check:', {
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET',
    BASE_URL: baseUrl,
    FROM_EMAIL: process.env.FROM_EMAIL || 'emergence.a2a@gmail.com'
  });

  // Wrap the entire email sending process with a timeout
  return Promise.race([
    sendEmailWithFallbacks(email, name, token, baseUrl),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email sending timeout after 45 seconds')), 45000)
    )
  ]);
}

// Internal function to handle email sending with fallbacks
async function sendEmailWithFallbacks(email, name, token, baseUrl) {
  // Check if SendGrid API key is set up
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not set up. Skipping email send.');
    console.log('Verification URL would be:', `${baseUrl}/verify-email?token=${token}`);
    return {
      success: false,
      message: 'SendGrid API key not configured',
      verificationUrl: `${baseUrl}/verify-email?token=${token}`
    };
  }

  // Skip SMTP entirely for production - go straight to Web API
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;

  if (isProduction) {
    console.log('🚀 Production environment detected - using SendGrid Web API directly');
    try {
      await sendEmailViaWebAPI(email, name, token, baseUrl);
      console.log('✅ Verification email sent successfully via Web API');
      return { success: true, method: 'web_api' };
    } catch (webApiError) {
      console.error('❌ SendGrid Web API error:', webApiError.message);
      return {
        success: false,
        message: 'Email service temporarily unavailable. Please use the manual verification link.',
        error: webApiError.message,
        verificationUrl: `${baseUrl}/verify-email?token=${token}`
      };
    }
  }

  // Development environment - try SMTP first, then Web API
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Emergence Platform" <${process.env.FROM_EMAIL || 'emergence.a2a@gmail.com'}>`,
    to: email,
    subject: 'Verify your email address - Emergence',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Emergence</h1>
        </div>

        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to Emergence!</h2>

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi ${name},
          </p>

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for registering with Emergence! To complete your registration and start uploading agents,
            please verify your email address by clicking the button below:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 15px 30px;
                      text-decoration: none;
                      border-radius: 5px;
                      display: inline-block;
                      font-weight: bold;">
              Verify Email Address
            </a>
          </div>

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>

          <p style="color: #667eea; word-break: break-all; margin-bottom: 20px;">
            ${verificationUrl}
          </p>

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This verification link will expire in 24 hours for security reasons.
          </p>

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you didn't create an account with Emergence, you can safely ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated email from Emergence. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  };

  try {
    console.log('Attempting to send email with primary configuration (port 465)...');
    // Try primary transporter first
    await transporter.verify();
    console.log('✅ Primary SMTP connection verified. Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent successfully via primary:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (primaryError) {
    console.warn('❌ Primary SMTP failed:', primaryError.message);

    try {
      // Try fallback configuration
      console.log('Attempting fallback configuration (port 587)...');
      if (!fallbackTransporter) {
        fallbackTransporter = nodemailer.createTransport(getEmailConfigFallback());
      }

      await fallbackTransporter.verify();
      console.log('✅ Fallback SMTP connection verified. Sending email...');
      const info = await fallbackTransporter.sendMail(mailOptions);
      console.log('✅ Verification email sent successfully via fallback:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (fallbackError) {
      console.error('❌ Both SMTP configurations failed');
      console.error('Primary error:', primaryError.message);
      console.error('Fallback error:', fallbackError.message);

      try {
        // Final attempt: Use SendGrid Web API
        console.log('Attempting SendGrid Web API as final fallback...');
        await sendEmailViaWebAPI(email, name, token, baseUrl);
        console.log('✅ Verification email sent successfully via Web API');
        return { success: true, method: 'web_api' };
      } catch (webApiError) {
        console.error('❌ All email methods failed');
        console.error('Web API error:', webApiError.message);

        // Return graceful error with manual verification URL
        return {
          success: false,
          message: 'Email service temporarily unavailable. Please use the manual verification link.',
          error: webApiError.message,
          verificationUrl: verificationUrl
        };
      }
    }
  }
}

// Send password reset email (for future use)
async function sendPasswordResetEmail(email, name, token, baseUrl) {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"Emergence Platform" <${process.env.FROM_EMAIL || 'emergence.a2a@gmail.com'}>`,
    to: email,
    subject: 'Reset your password - Emergence',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Emergence</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi ${name},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block; 
                      font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you didn't request a password reset, you can safely ignore this email.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This reset link will expire in 1 hour for security reasons.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated email from Emergence. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

// Test email configuration
async function testEmailConfig() {
  try {
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  testEmailConfig
};
