const nodemailer = require('nodemailer');
require('dotenv').config();

// ✅ Check if email credentials exist and are valid
const hasEmailCredentials =
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASSWORD &&
  process.env.EMAIL_USER !== 'your_email@gmail.com' &&
  process.env.EMAIL_PASSWORD !== 'your_app_specific_password';

let transporter = null;

if (hasEmailCredentials) {
  // Create transporter for Gmail SMTP
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Gmail App Password
    },
  });

  // Verify the connection
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email transporter error:', error.message);
    } else {
      console.log('✅ Email transporter ready (Gmail SMTP active)');
    }
  });
} else {
  console.log('⚠️  Email credentials not configured. OTP emails will NOT be sent.');
  console.log('   1️⃣ Update EMAIL_USER and EMAIL_PASSWORD in .env');
  console.log('   2️⃣ Use Gmail App Password (not your Gmail login password)');
  console.log('   3️⃣ Restart the server after saving changes.');
}

/**
 * Send OTP Email
 * @param {string} email - Recipient email address
 * @param {string} otp - OTP code
 * @param {string} userName - User name for personalization
 * @returns {Promise<boolean>} success status
 */
const sendOTPEmail = async (email, otp, userName = 'User') => {
  try {
    // Always print OTP for debugging
    console.log('📧 ===========================================');
    console.log(`📧 OTP Generated for: ${userName}`);
    console.log(`📧 Email: ${email}`);
    console.log(`📧 OTP Code: ${otp}`);
    console.log(`📧 Expires in: 5 minutes`);
    console.log(`📧 Generated at: ${new Date().toLocaleString()}`);
    console.log('📧 ===========================================');

    // Check if email service is ready
    if (!transporter) {
      console.log('⚠️  Email service not configured - OTP shown in console only');
      console.log('   Run: node setup-gmail.js (or configure .env properly)');
      return true; // Skip sending but avoid breaking flow
    }

    console.log('📤 Sending OTP email via Gmail SMTP...');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'ChatsApp - Your OTP Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #0d7377 0%, #25d366 100%);
                padding: 20px;
                border-radius: 10px;
              }
              .content {
                background: white;
                border-radius: 8px;
                padding: 30px;
              }
              .header {
                text-align: center;
                color: #0d7377;
                margin-bottom: 20px;
              }
              .otp-box {
                background: #f0f0f0;
                border: 2px solid #0d7377;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
              }
              .otp-code {
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 2px;
                color: #0d7377;
                font-family: 'Courier New', monospace;
              }
              .footer {
                text-align: center;
                font-size: 12px;
                color: #999;
                margin-top: 20px;
              }
              .warning {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 10px;
                margin: 15px 0;
                border-radius: 4px;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <div class="header">
                  <h1>🔐 ChatsApp Verification</h1>
                </div>
                <p>Hello <strong>${userName}</strong>,</p>
                <p>Your biometric authentication didn’t match. 
                We've sent you a One-Time Password (OTP) to verify your identity and complete your login.</p>
                <div class="otp-box">
                  <p>Your OTP Code:</p>
                  <div class="otp-code">${otp}</div>
                </div>
                <p><strong>How to use this code:</strong></p>
                <ul>
                  <li>This OTP will expire in 5 minutes</li>
                  <li>Do not share this code with anyone</li>
                  <li>Enter this code in the OTP verification field on your login screen</li>
                </ul>
                <div class="warning">
                  <strong>⚠️ Security Notice:</strong> 
                  If you didn't request this OTP, someone may be trying to access your account. 
                  Please change your password immediately.
                </div>
                <p>Thank you for using ChatsApp!<br/>The ChatsApp Team</p>
                <div class="footer">
                  <p>This is an automated message. Please do not reply to this email.</p>
                  <p>&copy; 2025 ChatsApp. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    return false;
  }
};

module.exports = { sendOTPEmail, transporter };
