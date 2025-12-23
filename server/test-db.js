const mongoose = require('mongoose');
const User = require('./models/User');
const Election = require('./models/Election');
const Vote = require('./models/Vote');
const VoteRecord = require('./models/VoteRecord');
require('dotenv').config();

const testDatabase = async () => {
  try {
    console.log('🔍 Testing database connection and operations...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voting_system');
    console.log('✅ Connected to MongoDB');

    // Test 1: Check if we can read data
    const userCount = await User.countDocuments();
    const electionCount = await Election.countDocuments();
    const voteCount = await Vote.countDocuments();
    const voteRecordCount = await VoteRecord.countDocuments();

    console.log('\n📊 Current Database State:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Elections: ${electionCount}`);
    console.log(`   Votes: ${voteCount}`);
    console.log(`   Vote Records: ${voteRecordCount}`);

    // Test 2: Try to create and save a test user
    console.log('\n🧪 Testing user creation...');
    const testUser = new User({
      email: 'test@example.com',
      password: 'testpassword',
      firstName: 'Test',
      lastName: 'User',
      studentId: 'TEST001',
      role: 'voter',
      isActive: true
    });

    await testUser.save();
    console.log('✅ Test user created successfully');

    // Test 3: Try to update the test user
    console.log('\n🧪 Testing user update...');
    testUser.otpCode = '123456';
    testUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await testUser.save();
    console.log('✅ Test user updated successfully');

    // Test 4: Verify the update was saved
    const updatedUser = await User.findById(testUser._id);
    console.log(`✅ OTP saved: ${updatedUser.otpCode}`);

    // Test 5: Clean up test user
    await User.findByIdAndDelete(testUser._id);
    console.log('✅ Test user deleted');

    // Test 6: Check MongoDB connection status
    console.log('\n🔍 MongoDB Connection Status:');
    console.log(`   Ready State: ${mongoose.connection.readyState}`); // 1 = connected
    console.log(`   Database Name: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port}`);

    console.log('\n🎉 All database tests passed!');

  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

testDatabase();