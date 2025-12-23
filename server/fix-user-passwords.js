const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixUserPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get the users collection directly to bypass model hooks
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Find users with missing passwords
    const users = await usersCollection.find({}).toArray();
    
    console.log('📋 Fixing user passwords...');
    
    for (const user of users) {
      if (!user.password || user.password === null || user.password === undefined) {
        console.log(`🔧 Fixing password for: ${user.email}`);
        
        // Set default password based on email
        let defaultPassword = 'password123';
        if (user.email === 'chinnugdpl@gmail.com') defaultPassword = 'chinnu';
        if (user.email === 'admin@votingsystem.com') defaultPassword = 'admin123';
        if (user.email.includes('23b81a62f2')) defaultPassword = 'navaneeth';
        if (user.email.includes('saralagdpl')) defaultPassword = 'sarala';
        if (user.email.includes('akhil')) defaultPassword = 'akhil';
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        // Update directly in database
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        
        console.log(`✅ Updated ${user.email} with password: ${defaultPassword}`);
      } else {
        console.log(`✅ ${user.email} already has a password`);
      }
    }
    
    console.log('🎉 All user passwords fixed!');
    
    // Test the specific user
    const testUser = await usersCollection.findOne({ email: 'chinnugdpl@gmail.com' });
    if (testUser && testUser.password) {
      const isValid = await bcrypt.compare('chinnu', testUser.password);
      console.log(`🧪 Test login for chinnugdpl@gmail.com: ${isValid ? 'SUCCESS' : 'FAILED'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

fixUserPasswords();