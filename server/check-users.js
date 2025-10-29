const mongoose = require('mongoose');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/chatsapp')
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Check if there are any users
    User.find({})
      .then(users => {
        console.log(`Found ${users.length} users in database:`);
        users.forEach(user => {
          console.log(`- ${user.name} (${user.phoneNumber}) - ${user.email}`);
        });
        
        if (users.length === 0) {
          console.log('\nNo users found. You need to register a user first.');
          console.log('Go to http://localhost:4200/signup to create an account.');
        }
        
        mongoose.disconnect();
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        mongoose.disconnect();
      });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
