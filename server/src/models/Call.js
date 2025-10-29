const mongoose = require('mongoose');

const CallSchema = new mongoose.Schema({
  callerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  callType: {
    type: String,
    enum: ['voice', 'video'],
    required: true
  },
  status: {
    type: String,
    enum: ['ringing', 'accepted', 'rejected', 'ended', 'missed'],
    default: 'ringing'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  acceptedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  duration: {
    type: Number, // Duration in milliseconds
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Call', CallSchema);