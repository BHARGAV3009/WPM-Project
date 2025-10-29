const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./models/Message');
const path = require('path');

// Load environment variables from config.env if .env doesn't exist
try {
  require('dotenv').config();
} catch (error) {
  console.log('Loading environment from config.env...');
  require('dotenv').config({ path: path.join(__dirname, '../config.env') });
}

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:4200',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
  
  socket.on('sendMessage', async (data) => {
    try {
      // Broadcast to both sender and receiver (message is already saved via HTTP POST)
      io.to(data.receiverId).emit('newMessage', {
        ...data,
        _id: data._id,
        createdAt: data.createdAt
      });
      
      // Also emit back to sender to update their chat
      io.to(data.senderId).emit('messageSent', {
        ...data,
        _id: data._id,
        createdAt: data.createdAt
      });
      
      console.log(`Message sent from ${data.senderId} to ${data.receiverId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('messageError', { message: 'Failed to send message' });
    }
  });
  
  socket.on('typing', (data) => {
    io.to(data.receiverId).emit('userTyping', data.senderId);
  });
  
  socket.on('stopTyping', (data) => {
    io.to(data.receiverId).emit('userStopTyping', data.senderId);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});