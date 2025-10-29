const mongoose = require('mongoose');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/chatsapp')
  .then(() => {
    console.log('🔍 Checking user typing patterns...');
    console.log('=====================================');
    
    User.find({})
      .then(users => {
        users.forEach(user => {
          console.log(`👤 ${user.name} (${user.phoneNumber})`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Has typing pattern: ${user.typingPattern ? 'YES' : 'NO'}`);
          if (user.typingPattern) {
            console.log(`   Pattern: ${JSON.stringify(user.typingPattern)}`);
          }
          console.log('   ---');
        });
        
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
