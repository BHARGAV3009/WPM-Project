const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { hashPhoneNumber } = require('../utils/phoneHash');
const { generateOTP, isOTPExpired, getRemainingTime, formatRemainingTime } = require('../utils/otpGenerator');
const { sendOTPEmail } = require('../utils/emailService');
const router = express.Router();

// Configuration
const OTP_LENGTH = parseInt(process.env.OTP_LENGTH) || 4;
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS) || 5;

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, phoneNumber, password, confirmPassword, publicKey, typingPattern } = req.body;

    let sanitizedTypingPattern = null;
    try {
      sanitizedTypingPattern = typingPattern ? sanitizeTypingPatternInput(typingPattern) : null;
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message
      });
    }

    // Validate required fields
    if (!name || !email || !phoneNumber || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Hash phone number for contact discovery
    const phoneHash = hashPhoneNumber(phoneNumber);

    const existingUser = await User.findOne({ $or: [{ phoneNumber }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone number or email already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      phoneNumber,
      phoneHash,
      password,
      publicKey,
      typingPattern: sanitizedTypingPattern
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { phoneNumber, password, typingPattern } = req.body;

    let sanitizedTypingPattern = null;
    try {
      sanitizedTypingPattern = typingPattern ? sanitizeTypingPatternInput(typingPattern) : null;
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message
      });
    }

    // Find user by phone number
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // If user has a stored typing pattern and provided one, verify biometric
    if (user.typingPattern && sanitizedTypingPattern) {
      // Simple similarity check (in production, use more sophisticated analysis)
      const similarity = calculateTypingSimilarity(user.typingPattern, sanitizedTypingPattern);
      if (similarity < 70) {
        return res.status(401).json({
          success: false,
          message: 'Typing pattern does not match'
        });
      }
    } else if (!user.typingPattern && sanitizedTypingPattern) {
      // First login with typing pattern, store it
      user.typingPattern = sanitizedTypingPattern;
    }

    // Update last seen
    user.lastSeen = Date.now();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        status: user.status,
        publicKey: user.publicKey
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Send OTP when biometric authentication fails
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber, email } = req.body;

    // Validate required fields
    if (!phoneNumber || !email) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and email are required'
      });
    }

    // Find user by phone number
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify email matches
    if (user.email !== email) {
      return res.status(401).json({
        success: false,
        message: 'Email does not match user records'
      });
    }

    // Check if there's an existing unexpired OTP
    const existingOTP = await OTP.findOne({ 
      userId: user._id, 
      email: email,
      verified: false 
    });

    if (existingOTP && !isOTPExpired(existingOTP.createdAt, OTP_EXPIRY_MINUTES)) {
      // OTP still valid, return remaining time
      const remainingSeconds = getRemainingTime(existingOTP.createdAt, OTP_EXPIRY_MINUTES);
      return res.status(200).json({
        success: true,
        message: 'OTP already sent. Please check your email.',
        remainingTime: remainingSeconds,
        formattedTime: formatRemainingTime(remainingSeconds)
      });
    }

    // Generate new OTP
    const newOTP = generateOTP(OTP_LENGTH);

    // Delete old OTPs for this user
    await OTP.deleteMany({ userId: user._id, email: email });

    // Save new OTP to database
    const otpRecord = new OTP({
      userId: user._id,
      email: email,
      otp: newOTP,
      attempts: 0
    });

    await otpRecord.save();

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, newOTP, user.name);

    if (!emailSent) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
      sessionId: otpRecord._id.toString(),
      expiryMinutes: OTP_EXPIRY_MINUTES
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending OTP'
    });
  }
});

// Verify OTP and login
router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    // Validate required fields
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    // Find user
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ 
      userId: user._id,
      verified: false
    });

    if (!otpRecord) {
      return res.status(401).json({
        success: false,
        message: 'No OTP found for this user. Please request a new OTP.'
      });
    }

    // Check if OTP is expired
    if (isOTPExpired(otpRecord.createdAt, OTP_EXPIRY_MINUTES)) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(401).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    // Check OTP attempts
    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(401).json({
        success: false,
        message: 'Maximum OTP attempts exceeded. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      const remainingAttempts = OTP_MAX_ATTEMPTS - otpRecord.attempts;
      return res.status(401).json({
        success: false,
        message: `Incorrect OTP. ${remainingAttempts} attempts remaining.`,
        attemptsRemaining: remainingAttempts
      });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Update last seen
    user.lastSeen = Date.now();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'OTP verified successfully. Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        status: user.status,
        publicKey: user.publicKey
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying OTP'
    });
  }
});

// Helper function to calculate typing similarity
function calculateTypingSimilarity(pattern1, pattern2) {
  if (!pattern1 || !pattern2) return 0;

  // Compare average interval and hold time
  const intervalDiff = Math.abs(pattern1.averageInterval - pattern2.averageInterval);
  const holdTimeDiff = Math.abs(pattern1.averageHoldTime - pattern2.averageHoldTime);

  const intervalSimilarity = Math.max(0, 100 - (intervalDiff / 5));
  const holdTimeSimilarity = Math.max(0, 100 - (holdTimeDiff / 2));

  return (intervalSimilarity * 0.6) + (holdTimeSimilarity * 0.4);
}

function sanitizeTypingPatternInput(input) {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Invalid typing pattern data');
  }

  const { averageInterval, averageHoldTime, patternLength } = input;

  const sanitizedPattern = {
    averageInterval: Number.isFinite(averageInterval) ? Number(averageInterval) : 0,
    averageHoldTime: Number.isFinite(averageHoldTime) ? Number(averageHoldTime) : 0,
    patternLength: Number.isInteger(patternLength) ? patternLength : 0
  };

  if (sanitizedPattern.averageInterval < 0 || sanitizedPattern.averageHoldTime < 0 || sanitizedPattern.patternLength < 0) {
    throw new Error('Typing pattern values must be non-negative numbers');
  }

  return sanitizedPattern;
}

module.exports = router;