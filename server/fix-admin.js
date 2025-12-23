const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const fixAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voting_system');
    console.log('Connected to MongoDB');

    // Delete all existing admin accounts
    await User.deleteMany({ role: 'admin' });
    console.log('🗑️ Deleted all existing admin accounts');

    // Create a completely fresh admin with manual password hashing
    console.log('🔐 Creating fresh admin account...');
    
    const plainPassword = 'admin123';
    console.log(`🔐 Plain password: ${plainPassword}`);
    
    // Hash password manually with explicit salt rounds
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    console.log(`🔐 Hashed password: ${hashedPassword}`);
    
    // Test the hash immediately
    const testMatch = await bcrypt.compare(plainPassword, hashedPassword);
    console.log(`🔐 Hash test: ${testMatch ? '✅ PASS' : '❌ FAIL'}`);
    
    if (!testMatch) {
      throw new Error('Password hash test failed!');
    }

    // Create admin user
    const admin = new User({
      email: 'admin@votingsystem.com',
      password: hashedPassword, // Use pre-hashed password
      firstName: 'Admin',
      lastName: 'User',
      studentId: 'ADMIN001',
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    // Save without triggering the pre-save hook (to avoid double hashing)
    await admin.save();
    console.log('✅ Admin account created successfully');

    // Test login immediately
    console.log('\n🧪 Testing login immediately...');
    const savedAdmin = await User.findOne({ email: 'admin@votingsystem.com' });
    const loginTest = await bcrypt.compare(plainPassword, savedAdmin.password);
    console.log(`🔐 Login test: ${loginTest ? '✅ SUCCESS' : '❌ FAILED'}`);

    console.log('\n🎉 Admin account ready!');
    console.log('📧 Email: admin@votingsystem.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error fixing admin:', error);
  } finally {
    await mongoose.connection.close();
  }
};

fixAdmin();