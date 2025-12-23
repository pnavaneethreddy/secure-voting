const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voting_system');
    console.log('Connected to MongoDB');

    const testEmail = 'admin@votingsystem.com';
    const testPassword = 'admin123';

    console.log(`🧪 Testing login for: ${testEmail}`);
    console.log(`🧪 Testing password: ${testPassword}`);

    // Find user
    const user = await User.findOne({ email: testEmail });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('✅ User found:');
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Password hash exists: ${!!user.password}`);

    // Test password
    console.log('\n🔐 Testing password comparison...');
    const isMatch = await user.comparePassword(testPassword);
    console.log(`🔐 Password match: ${isMatch ? '✅ YES' : '❌ NO'}`);

    if (isMatch) {
      console.log('\n🎉 Login should work! Try again in the browser.');
    } else {
      console.log('\n❌ Password issue detected. Creating new admin...');
      
      // Delete old admin and create new one
      await User.deleteOne({ email: testEmail });
      
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      const newAdmin = new User({
        email: testEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        studentId: 'ADMIN999',
        role: 'admin',
        isVerified: true,
        isActive: true
      });

      await newAdmin.save();
      console.log('✅ New admin created with fresh password hash');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

testLogin();