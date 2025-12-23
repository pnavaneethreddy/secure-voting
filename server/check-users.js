const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voting_system');
    console.log('Connected to MongoDB');

    const users = await User.find({}).select('email firstName lastName role isActive');
    
    console.log('\n📋 Users in database:');
    console.log('─'.repeat(60));
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('💡 Run "npm run seed" to create test accounts');
    } else {
      users.forEach(user => {
        console.log(`${user.role === 'admin' ? '👨‍💼' : '👤'} ${user.email} | ${user.firstName} ${user.lastName} | ${user.role} | ${user.isActive ? 'Active' : 'Inactive'}`);
      });
    }
    
    console.log('─'.repeat(60));
    console.log(`Total users: ${users.length}`);
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await mongoose.connection.close();
  }
};

checkUsers();