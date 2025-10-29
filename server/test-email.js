#!/usr/bin/env node

const path = require('path');
const nodemailer = require('nodemailer');

// Load environment variables from config.env
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

console.log('🔍 Testing Email Configuration');
console.log('==============================');
console.log('');

console.log('Environment Variables:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configured***' : 'NOT SET');
console.log('');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.log('❌ Email credentials not configured properly');
  process.exit(1);
}

// Test the email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function testEmail() {
  try {
    console.log('🧪 Testing Gmail SMTP connection...');
    await transporter.verify();
    console.log('✅ Gmail SMTP connection successful!');
    
    console.log('📤 Sending test OTP email...');
    const testMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'ChatsApp - Test OTP Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #25d366;">🔐 ChatsApp OTP Test</h2>
          <p>This is a test OTP email to verify email configuration.</p>
          <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Test OTP Code:</h3>
            <div style="font-size: 32px; font-weight: bold; color: #25d366; text-align: center; letter-spacing: 2px;">1234</div>
          </div>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p style="color: #666; font-size: 12px;">
            This is a test email from ChatsApp email service.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(testMailOptions);
    console.log('✅ Test OTP email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Sent to: ${process.env.EMAIL_USER}`);
    console.log('');
    console.log('🎉 Email service is working correctly!');
    console.log('   OTP emails will now be sent to users.');
    
  } catch (error) {
    console.log('❌ Email test failed:');
    console.log(`   Error: ${error.message}`);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check if Gmail App Password is correct');
    console.log('2. Verify 2-Step Verification is enabled');
    console.log('3. Try generating a new App Password');
  }
}

testEmail();
