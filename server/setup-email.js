#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 ChatsApp Email Setup');
console.log('======================');
console.log('');
console.log('This will help you configure Gmail for OTP emails.');
console.log('');

rl.question('Enter your Gmail address: ', (email) => {
  console.log('');
  console.log('For Gmail, you need to use an App-Specific Password:');
  console.log('1. Go to https://myaccount.google.com/');
  console.log('2. Click "Security" in the left sidebar');
  console.log('3. Enable 2-Step Verification if not already enabled');
  console.log('4. Go to https://myaccount.google.com/apppasswords');
  console.log('5. Select "Mail" and "Windows Computer" (or your device)');
  console.log('6. Copy the 16-character password that Google generates');
  console.log('');
  
  rl.question('Enter your Gmail App-Specific Password (16 characters): ', (password) => {
    // Update the config.env file
    const configPath = path.join(__dirname, 'config.env');
    
    try {
      let configContent = fs.readFileSync(configPath, 'utf8');
      
      // Replace the email credentials
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
      console.log('Next steps:');
      console.log('1. Restart your server: npm start');
      console.log('2. Test the OTP functionality by logging in with wrong typing pattern');
      console.log('');
      
    } catch (error) {
      console.error('❌ Error updating configuration:', error.message);
      console.log('');
      console.log('Please manually update server/config.env with:');
      console.log(`EMAIL_USER=${email}`);
      console.log(`EMAIL_PASSWORD=${password}`);
    }
    
    rl.close();
  });
});
