#!/usr/bin/env node

const mongoose = require('mongoose');
const OTP = require('./src/models/OTP');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/chatsapp')
  .then(() => {
    console.log('🔍 Checking recent OTP codes...');
    console.log('=====================================');
    
    // Get the most recent OTP
    OTP.findOne({ verified: false })
      .sort({ createdAt: -1 })
      .populate('userId', 'name phoneNumber email')
      .then(otp => {
        if (otp) {
          console.log(`📧 User: ${otp.userId.name}`);
          console.log(`📧 Phone: ${otp.userId.phoneNumber}`);
          console.log(`📧 Email: ${otp.email}`);
          console.log(`📧 OTP Code: ${otp.otp}`);
          console.log(`📧 Created: ${otp.createdAt}`);
          console.log(`📧 Attempts: ${otp.attempts}`);
          console.log(`📧 Verified: ${otp.verified}`);
          
          // Check if expired
          const now = new Date();
          const createdAt = new Date(otp.createdAt);
          const expiryTime = new Date(createdAt.getTime() + (5 * 60 * 1000)); // 5 minutes
          
          if (now > expiryTime) {
            console.log('❌ OTP has expired');
          } else {
            const remainingSeconds = Math.floor((expiryTime - now) / 1000);
            console.log(`⏰ Expires in: ${remainingSeconds} seconds`);
          }
        } else {
          console.log('❌ No OTP found in database');
        }
        
        mongoose.disconnect();
      })
      .catch(err => {
        console.error('Error fetching OTP:', err);
        mongoose.disconnect();
      });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
