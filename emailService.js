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
        subject: 'Verify your email address - Emergence'
      }],
      from: { email: process.env.FROM_EMAIL || 'emergence.a2a@gmail.com', name: 'Emergence Platform' },
      content: [{
        type: 'text/html',
        value: `
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
