const express = require('express');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const router = express.Router();

// Send a new message
router.post('/', async (req, res) => {
  try {
    const { sender, receiver, content, encryptedContent, mediaUrl, mediaType } = req.body;
    
    const message = new Message({
      sender,
      receiver,
      content,
      encryptedContent,
      mediaUrl,
      mediaType
    });
    
    await message.save();
    
    res.status(201).json({
      success: true,
      message: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
});

// Get conversation between two users
router.get('/conversation/:userId/:otherUserId', async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });
    
    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching conversation'
    });
  }
});

// Mark messages as read
router.put('/read', async (req, res) => {
  try {
    const { messageIds } = req.body;
    
    await Message.updateMany(
      { _id: { $in: messageIds } },
      { 
        read: true,
        readAt: Date.now()
      }
    );
    
    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking messages as read'
    });
  }
});

// Get recent conversations (chat list)
router.get('/recent/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id'
      });
    }

    const objectId = new mongoose.Types.ObjectId(userId);
    
    // Get the most recent message with each user
    const recentMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: objectId },
            { receiver: objectId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', objectId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.sender',
          foreignField: '_id',
          as: 'senderDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.receiver',
          foreignField: '_id',
          as: 'receiverDetails'
        }
      },
      {
        $addFields: {
          'lastMessage.senderDetails': { $arrayElemAt: ['$senderDetails', 0] },
          'lastMessage.receiverDetails': { $arrayElemAt: ['$receiverDetails', 0] }
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          name: '$userDetails.name',
          profilePicture: '$userDetails.profilePicture',
          phoneNumber: '$userDetails.phoneNumber'
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);
    
    res.json({
      success: true,
      conversations: recentMessages
    });
  } catch (error) {
    console.error('Recent conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent conversations'
    });
  }
});

// Start a new chat (create initial conversation)
router.post('/start-chat', async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    // Check if conversation already exists
    const existingMessage = await Message.findOne({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId }
      ]
    });

    if (existingMessage) {
      return res.json({
        success: true,
        message: 'Conversation already exists'
      });
    }

    // Create initial message to establish conversation
    const initialMessage = new Message({
      sender: userId,
      receiver: friendId,
      content: 'Chat started',
      encryptedContent: 'Chat started',
      mediaType: null,
      read: true
    });

    await initialMessage.save();

    res.json({
      success: true,
      message: 'Chat started successfully',
      conversation: initialMessage
    });
  } catch (error) {
    console.error('Start chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting chat'
    });
  }
});

module.exports = router;