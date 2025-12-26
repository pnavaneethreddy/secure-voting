const mongoose = require('mongoose');
const Election = require('./models/Election');
const Vote = require('./models/Vote');
require('dotenv').config();

async function checkElections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    const elections = await Election.find({});
    console.log('📊 Elections in database:');
    console.log('────────────────────────────────────────');
    
    for (let i = 0; i < elections.length; i++) {
      const election = elections[i];
      const voteCount = await Vote.countDocuments({ electionId: election._id });
      
      console.log(`${i + 1}. ${election.title}`);
      console.log(`   ID: ${election._id}`);
      console.log(`   Status: ${election.status}`);
      console.log(`   Start: ${election.startDate}`);
      console.log(`   End: ${election.endDate}`);
      console.log(`   Candidates: ${election.candidates.length}`);
      console.log(`   Total Votes: ${voteCount}`);
      console.log('   ────────────────────────────────────');
    }
    
    console.log(`Total elections: ${elections.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkElections();
