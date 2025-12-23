const mongoose = require('mongoose');
const fs = require('fs');
const User = require('./models/User');
const Election = require('./models/Election');
const Vote = require('./models/Vote');
const VoteRecord = require('./models/VoteRecord');
require('dotenv').config();

const importData = async () => {
  try {
    // Check if export file exists
    if (!fs.existsSync('database-export.json')) {
      console.log('❌ database-export.json not found. Run export-data.js first.');
      return;
    }

    // Read export data
    const exportData = JSON.parse(fs.readFileSync('database-export.json', 'utf8'));
    
    // Connect to cloud MongoDB (update MONGODB_URI in .env first)
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to cloud MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Election.deleteMany({});
    await Vote.deleteMany({});
    await VoteRecord.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Import data
    if (exportData.users.length > 0) {
      await User.insertMany(exportData.users);
      console.log(`✅ Imported ${exportData.users.length} users`);
    }

    if (exportData.elections.length > 0) {
      await Election.insertMany(exportData.elections);
      console.log(`✅ Imported ${exportData.elections.length} elections`);
    }

    if (exportData.votes.length > 0) {
      await Vote.insertMany(exportData.votes);
      console.log(`✅ Imported ${exportData.votes.length} votes`);
    }

    if (exportData.voteRecords.length > 0) {
      await VoteRecord.insertMany(exportData.voteRecords);
      console.log(`✅ Imported ${exportData.voteRecords.length} vote records`);
    }

    console.log('🎉 Data import completed successfully!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.connection.close();
  }
};

importData();