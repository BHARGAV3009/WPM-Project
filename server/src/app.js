// Import core modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import database connection
const { connectDB } = require('./config/db');

// ✅ Initialize Gmail email service (important for OTP)
require('./utils/emailService');

// Import route files
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const messagesRoutes = require('./routes/messages');
const statusesRoutes = require('./routes/statuses');
const callsRoutes = require('./routes/calls');
const followsRoutes = require('./routes/follows');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware setup
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:4200',
  credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/statuses', statusesRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api/follows', followsRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('✅ Server is running and Email Service is active 🚀');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
