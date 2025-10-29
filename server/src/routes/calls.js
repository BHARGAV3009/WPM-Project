const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Call = require('../models/Call');
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

// Initiate a call
router.post('/initiate', authenticateToken, async (req, res) => {
  try {
    const { receiverId, callType } = req.body; // callType: 'voice' or 'video'
    const callerId = req.user.id;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Create call record
    const call = new Call({
      callerId,
      receiverId,
      callType,
      status: 'ringing',
      startTime: new Date()
    });

    await call.save();

    res.json({
      success: true,
      call: {
        id: call._id,
        callerId: call.callerId,
        receiverId: call.receiverId,
        callType: call.callType,
        status: call.status
      }
    });
  } catch (error) {
    console.error('Call initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate call'
    });
  }
});

// Accept a call
router.post('/accept/:callId', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    const call = await Call.findById(callId);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    if (call.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to accept this call'
      });
    }

    call.status = 'accepted';
    call.acceptedAt = new Date();
    await call.save();

    res.json({
      success: true,
      message: 'Call accepted',
      call: {
        id: call._id,
        callerId: call.callerId,
        receiverId: call.receiverId,
        callType: call.callType,
        status: call.status
      }
    });
  } catch (error) {
    console.error('Call acceptance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept call'
    });
  }
});

// Reject a call
router.post('/reject/:callId', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    const call = await Call.findById(callId);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    if (call.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to reject this call'
      });
    }

    call.status = 'rejected';
    call.endedAt = new Date();
    await call.save();

    res.json({
      success: true,
      message: 'Call rejected'
    });
  } catch (error) {
    console.error('Call rejection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject call'
    });
  }
});

// End a call
router.post('/end/:callId', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    const call = await Call.findById(callId);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    if (call.callerId.toString() !== userId && call.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to end this call'
      });
    }

    call.status = 'ended';
    call.endedAt = new Date();
    call.duration = call.endedAt - call.startTime;
    await call.save();

    res.json({
      success: true,
      message: 'Call ended',
      call: {
        id: call._id,
        duration: call.duration,
        status: call.status
      }
    });
  } catch (error) {
    console.error('Call end error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end call'
    });
  }
});

// Get call history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const calls = await Call.find({
      $or: [{ callerId: userId }, { receiverId: userId }]
    })
    .populate('callerId', 'name profilePicture')
    .populate('receiverId', 'name profilePicture')
    .sort({ startTime: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json({
      success: true,
      calls
    });
  } catch (error) {
    console.error('Call history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch call history'
    });
  }
});

module.exports = router;