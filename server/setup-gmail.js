#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('📧 ChatsApp Gmail Email Setup');
console.log('=============================');
console.log('');
console.log('This will help you configure Gmail SMTP for OTP emails.');
console.log('');

async function setupEmail() {
  try {
    console.log('📋 Gmail Setup Requirements:');
    console.log('1. Enable 2-Step Verification on your Gmail account');
    console.log('2. Generate an App-Specific Password');
    console.log('');
    console.log('🔗 Links:');
    console.log('- Enable 2-Step: https://myaccount.google.com/security');
    console.log('- App Passwords: https://myaccount.google.com/apppasswords');
    console.log('');

    rl.question('Enter your Gmail address: ', async (email) => {
      if (!email.includes('@gmail.com')) {
        console.log('❌ Please enter a valid Gmail address');
        rl.close();
        return;
      }

      console.log('');
      console.log('🔐 For Gmail, you need an App-Specific Password:');
      console.log('1. Go to https://myaccount.google.com/apppasswords');
      console.log('2. Select "Mail" and "Windows Computer" (or your device)');
      console.log('3. Copy the 16-character password that Google generates');
      console.log('');

      rl.question('Enter your Gmail App-Specific Password (16 characters): ', async (password) => {
        if (password.length !== 16) {
          console.log('❌ App-Specific Password should be 16 characters long');
          rl.close();
          return;
        }

        console.log('');
        console.log('🧪 Testing email configuration...');

        // Test the email configuration
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: email,
            pass: password
          }
        });

        try {
          await transporter.verify();
          console.log('✅ Gmail SMTP connection successful!');
          
          // Send a test email
          console.log('📤 Sending test email...');
          const testMailOptions = {
            from: email,
            to: email, // Send to yourself for testing
            subject: 'ChatsApp - Email Configuration Test',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #25d366;">🎉 ChatsApp Email Test</h2>
                <p>Congratulations! Your Gmail SMTP is configured correctly.</p>
                <p>This means OTP emails will now be sent to users when they request them.</p>
                <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3>Test Details:</h3>
                  <p><strong>From:</strong> ${email}</p>
                  <p><strong>To:</strong> ${email}</p>
                  <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <p style="color: #666; font-size: 12px;">
                  This is an automated test email from ChatsApp.
                </p>
              </div>
            `
          };

          const info = await transporter.sendMail(testMailOptions);
          console.log('✅ Test email sent successfully!');
          console.log(`📧 Message ID: ${info.messageId}`);
          console.log(`📧 Check your inbox: ${email}`);
          
          // Update the config file
          const configPath = path.join(__dirname, 'config.env');
          let configContent = fs.readFileSync(configPath, 'utf8');
          
          configContent = configContent.replace(
            /EMAIL_USER=.*/,
            `EMAIL_USER=${email}`
          );
          configContent = configContent.replace(
            /EMAIL_PASSWORD=.*/,
            `EMAIL_PASSWORD=${password}`
          );
          
          fs.writeFileSync(configPath, configContent);
          
          console.log('');
          console.log('✅ Email configuration updated successfully!');
          console.log('');
          console.log('🚀 Next steps:');
          console.log('1. Restart your server: npm start');
          console.log('2. Test OTP functionality in your app');
          console.log('3. OTP emails will now be sent to users');
          console.log('');
          
        } catch (error) {
          console.log('❌ Gmail SMTP test failed:');
          console.log(`   Error: ${error.message}`);
          console.log('');
          console.log('🔧 Troubleshooting:');
          console.log('1. Make sure 2-Step Verification is enabled');
          console.log('2. Verify the App-Specific Password is correct');
          console.log('3. Check if "Less secure app access" is enabled');
          console.log('4. Try generating a new App-Specific Password');
        }
        
        rl.close();
      });
    });
  } catch (error) {
    console.error('Setup error:', error);
    rl.close();
  }
}

setupEmail();
