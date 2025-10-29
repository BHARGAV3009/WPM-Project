const express = require('express');
const Status = require('../models/Status');
const User = require('../models/User');
const router = express.Router();

// Create a new status
router.post('/', async (req, res) => {
  try {
    const { userId, content, mediaUrl, mediaType } = req.body;
    
    const status = new Status({
      user: userId,
      content,
      mediaUrl,
      mediaType
    });
    
    await status.save();
    
    res.status(201).json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Create status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating status'
    });
  }
});

// Get statuses from following users
router.get('/following/:userId', async (req, res) => {
  try {
    const Follow = require('../models/Follow');

    // Get users that the current user is following
    const follows = await Follow.find({ follower: req.params.userId }).select('following');
    const followingIds = follows.map(f => f.following);

    // Find active statuses (not expired) from following users
    const statuses = await Status.find({
      user: { $in: followingIds },
      expiresAt: { $gt: new Date() }
    }).populate('user', 'name profilePicture phoneNumber')
      .sort({ createdAt: -1 });

    // Group statuses by user
    const statusesByUser = {};
    statuses.forEach(status => {
      const userId = status.user._id.toString();
      if (!statusesByUser[userId]) {
        statusesByUser[userId] = {
          user: status.user,
          statuses: []
        };
      }
      statusesByUser[userId].statuses.push(status);
    });

    res.json({
      success: true,
      statusesByUser: Object.values(statusesByUser)
    });
  } catch (error) {
    console.error('Get following statuses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statuses'
    });
  }
});

// Mark status as viewed
router.put('/view/:statusId', async (req, res) => {
  try {
    const { statusId } = req.params;
    const { userId } = req.body;
    
    const status = await Status.findById(statusId);
    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Status not found'
      });
    }
    
    // Check if user already viewed this status
    const alreadyViewed = status.viewers.some(viewer => 
      viewer.user.toString() === userId
    );
    
    if (!alreadyViewed) {
      status.viewers.push({
        user: userId,
        viewedAt: Date.now()
      });
      
      await status.save();
    }
    
    res.json({
      success: true,
      message: 'Status marked as viewed'
    });
  } catch (error) {
    console.error('View status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking status as viewed'
    });
  }
});

// Get my statuses with viewer information
router.get('/my/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const statuses = await Status.find({
      user: userId,
      expiresAt: { $gt: new Date() }
    }).populate('viewers.user', 'name profilePicture phoneNumber')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      statuses
    });
  } catch (error) {
    console.error('Get my statuses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statuses'
    });
  }
});

module.exports = router;