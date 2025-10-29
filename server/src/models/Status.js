const mongoose = require('mongoose');

const StatusSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String
  },
  mediaUrl: {
    type: String
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'text'],
    required: true
  },
  viewers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      // Status expires after 24 hours
      const now = new Date();
      return new Date(now.setHours(now.getHours() + 24));
    }
  }
}, {
  timestamps: true
});

// Add TTL index to automatically delete expired statuses
StatusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Status', StatusSchema);