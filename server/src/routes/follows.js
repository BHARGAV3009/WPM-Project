const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Follow = require('../models/Follow');
const { hashPhoneNumber } = require('../utils/phoneHash');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Discover contacts using phone numbers
router.post('/discover', authenticateToken, async (req, res) => {
  try {
    const { phoneNumbers } = req.body; // Array of phone numbers
    const userId = req.user.id;

    if (!phoneNumbers || !Array.isArray(phoneNumbers)) {
      return res.status(400).json({
        success: false,
        message: 'Phone numbers array is required'
      });
    }

    // Hash the phone numbers for comparison
    const hashedNumbers = phoneNumbers.map(phone => hashPhoneNumber(phone));

    // Find users with matching phone hashes
    const contacts = await User.find({
      phoneHash: { $in: hashedNumbers },
      _id: { $ne: userId } // Exclude current user
    }).select('name phoneNumber profilePicture status');

    // Check which contacts are already followed
    const followedUserIds = await Follow.find({
      followerId: userId,
      followingId: { $in: contacts.map(c => c._id) }
    }).select('followingId');

    const followedIds = followedUserIds.map(f => f.followingId.toString());

    // Add follow status to each contact
    const contactsWithFollowStatus = contacts.map(contact => ({
      id: contact._id,
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      profilePicture: contact.profilePicture,
      status: contact.status,
      isFollowing: followedIds.includes(contact._id.toString())
    }));

    res.json({
      success: true,
      contacts: contactsWithFollowStatus
    });
  } catch (error) {
    console.error('Contact discovery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to discover contacts'
    });
  }
});

// Follow a user
router.post('/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId: followingId } = req.params;
    const followerId = req.user.id;

    if (followerId === followingId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      });
    }

    // Check if user exists
    const userToFollow = await User.findById(followingId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      followerId,
      followingId
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user'
      });
    }

    // Create follow relationship
    const follow = new Follow({
      followerId,
      followingId
    });

    await follow.save();

    res.json({
      success: true,
      message: 'Successfully followed user',
      follow: {
        id: follow._id,
        followerId: follow.followerId,
        followingId: follow.followingId,
        createdAt: follow.createdAt
      }
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to follow user'
    });
  }
});

// Unfollow a user
router.delete('/unfollow/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId: followingId } = req.params;
    const followerId = req.user.id;

    const follow = await Follow.findOneAndDelete({
      followerId,
      followingId
    });

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: 'Follow relationship not found'
      });
    }

    res.json({
      success: true,
      message: 'Successfully unfollowed user'
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unfollow user'
    });
  }
});

// Get followers list
router.get('/followers', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const followers = await Follow.find({ followingId: userId })
      .populate('followerId', 'name profilePicture status lastSeen')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      success: true,
      followers: followers.map(f => ({
        id: f.followerId._id,
        name: f.followerId.name,
        profilePicture: f.followerId.profilePicture,
        status: f.followerId.status,
        lastSeen: f.followerId.lastSeen,
        followedAt: f.createdAt
      }))
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch followers'
    });
  }
});

// Get following list
router.get('/following', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const following = await Follow.find({ followerId: userId })
      .populate('followingId', 'name profilePicture status lastSeen')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      success: true,
      following: following.map(f => ({
        id: f.followingId._id,
        name: f.followingId.name,
        profilePicture: f.followingId.profilePicture,
        status: f.followingId.status,
        lastSeen: f.followingId.lastSeen,
        followedAt: f.createdAt
      }))
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch following list'
    });
  }
});

// Get follow suggestions
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Get users that the current user is not following
    const followingIds = await Follow.find({ followerId: userId }).select('followingId');
    const followingIdList = followingIds.map(f => f.followingId);

    const suggestions = await User.find({
      _id: { $nin: [...followingIdList, userId] }
    })
    .select('name profilePicture status')
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      suggestions: suggestions.map(user => ({
        id: user._id,
        name: user.name,
        profilePicture: user.profilePicture,
        status: user.status
      }))
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suggestions'
    });
  }
});

module.exports = router;