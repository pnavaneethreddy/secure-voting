const mongoose = require('mongoose');
const Vote = require('./models/Vote');
require('dotenv').config();

async function checkVotes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    const votes = await Vote.find({});
    console.log('📊 Votes in database:');
    console.log('────────────────────────────────────────');
    
    votes.forEach((vote, i) => {
      console.log(`Vote ${i+1}:`);
      console.log(`   Election ID: ${vote.electionId}`);
      console.log(`   Candidate ID: ${vote.candidateId}`);
      console.log(`   Voter ID: ${vote.voterId}`);
      console.log(`   Timestamp: ${vote.timestamp}`);
      console.log('   ────────────────────────────────────');
    });
    
    console.log(`Total votes: ${votes.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkVotes();
