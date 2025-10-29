const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const User = require('../models/User');
const { hashPhoneNumber } = require('../utils/phoneHash');
const router = express.Router();

const AVATAR_UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'avatars');

/**
 * Ensure avatar upload directory exists
 */
function ensureAvatarDirectory() {
  if (!fs.existsSync(AVATAR_UPLOAD_DIR)) {
    fs.mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true });
  }
}

ensureAvatarDirectory();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    ensureAvatarDirectory();
    cb(null, AVATAR_UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.userId || req.body.userId}_${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// Serve static avatars
router.use('/avatars', express.static(AVATAR_UPLOAD_DIR));

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        status: user.status,
        lastSeen: user.lastSeen,
        publicKey: user.publicKey
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// Update user profile
router.put('/profile', upload.single('profilePicture'), async (req, res) => {
  try {
    const { userId, name, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (status) user.status = status;

    if (req.file) {
      // Convert Windows backslashes to forward slashes for URLs
      const relativePath = path.relative(path.join(__dirname, '..', '..'), req.file.path).replace(/\\/g, '/');
      user.profilePicture = `/uploads/${relativePath}`;
    }
    
    await user.save();
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// Find contacts (by array of phone numbers)
router.post('/find-contacts', async (req, res) => {
  try {
    const { phoneNumbers } = req.body;
    
    if (!phoneNumbers || !Array.isArray(phoneNumbers)) {
      return res.status(400).json({
        success: false,
        message: 'Phone numbers array is required'
      });
    }
    
    // Hash all phone numbers for lookup
    const phoneHashes = phoneNumbers.map(phone => hashPhoneNumber(phone));
    
    // Find users by phone hashes
    const users = await User.find({
      phoneHash: { $in: phoneHashes }
    }).select('name phoneNumber profilePicture status publicKey');
    
    res.json({
      success: true,
      contacts: users
    });
  } catch (error) {
    console.error('Find contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while finding contacts'
    });
  }
});

// Search user by phone number
router.get('/search-by-phone/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
    
    // Hash the phone number
    const phoneHash = hashPhoneNumber(phoneNumber);
    
    // Find user by phone hash
    const user = await User.findOne({
      phoneHash: phoneHash
    }).select('-password -phoneHash -typingPattern');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        user: null
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        status: user.status,
        publicKey: user.publicKey
      }
    });
  } catch (error) {
    console.error('Search by phone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching user'
    });
  }
});

module.exports = router;