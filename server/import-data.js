const mongoose = require('mongoose');
const fs = require('fs');
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

    // Get database collections directly (bypass Mongoose models)
    const db = mongoose.connection.db;
    
    // Clear existing data
    await db.collection('users').deleteMany({});
    await db.collection('elections').deleteMany({});
    await db.collection('votes').deleteMany({});
    await db.collection('voterecords').deleteMany({});
    console.log('🧹 Cleared existing data');

    // Import data directly to collections (bypass validation)
    if (exportData.users.length > 0) {
      await db.collection('users').insertMany(exportData.users);
      console.log(`✅ Imported ${exportData.users.length} users`);
    }

    if (exportData.elections.length > 0) {
      await db.collection('elections').insertMany(exportData.elections);
      console.log(`✅ Imported ${exportData.elections.length} elections`);
    }

    if (exportData.votes.length > 0) {
      await db.collection('votes').insertMany(exportData.votes);
      console.log(`✅ Imported ${exportData.votes.length} votes`);
    }

    if (exportData.voteRecords.length > 0) {
      await db.collection('voterecords').insertMany(exportData.voteRecords);
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
