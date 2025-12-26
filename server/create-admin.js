const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voting_system');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@votingsystem.com' });
    if (existingAdmin) {
      console.log('❌ Admin already exists with email: admin@votingsystem.com');
      console.log('💡 Try logging in with: admin@votingsystem.com / admin123');
      return;
    }

    // Create new admin
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = new User({
      email: 'admin@votingsystem.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      studentId: 'ADMIN999',
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    await admin.save();
    console.log('✅ New admin account created successfully!');
    console.log('📧 Email: admin@votingsystem.com');
    console.log('🔑 Password: admin123');
    console.log('💡 You can now login with these credentials');
    
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
  }
};

createAdmin();
