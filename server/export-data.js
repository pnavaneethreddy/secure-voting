const mongoose = require('mongoose');
const fs = require('fs');
const User = require('./models/User');
const Election = require('./models/Election');
const Vote = require('./models/Vote');
const VoteRecord = require('./models/VoteRecord');
require('dotenv').config();

const exportData = async () => {
  try {
    // Connect to local MongoDB
    await mongoose.connect('mongodb://localhost:27017/voting_system');
    console.log('✅ Connected to local MongoDB');

    // Export all data
    const users = await User.find({});
    const elections = await Election.find({});
    const votes = await Vote.find({});
    const voteRecords = await VoteRecord.find({});

    const exportData = {
      users,
      elections,
      votes,
      voteRecords,
      exportDate: new Date()
    };

    // Save to JSON file
    fs.writeFileSync('database-export.json', JSON.stringify(exportData, null, 2));
    
    console.log('📊 Export Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Elections: ${elections.length}`);
    console.log(`   Votes: ${votes.length}`);
    console.log(`   Vote Records: ${voteRecords.length}`);
    console.log('✅ Data exported to database-export.json');
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await mongoose.connection.close();
  }
};

exportData();
