const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const VoteRecord = require('../models/VoteRecord');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendVoteConfirmation } = require('../utils/email');

const router = express.Router();

// Cast vote
router.post('/', [
  body('electionId').isMongoId(),
  body('candidateId').isMongoId(),
  body('otp').isLength({ min: 6, max: 6 })
], auth, async (req, res) => {
  try {
    console.log(`🗳️ Vote casting request received from user: ${req.user.email}`);
    console.log(`📋 Request data:`, { 
      electionId: req.body.electionId, 
      candidateId: req.body.candidateId, 
      otp: req.body.otp?.length ? `${req.body.otp.length} chars` : 'missing'
    });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(`❌ Validation errors:`, errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { electionId, candidateId, otp } = req.body;
    
    // Refresh user data from database to get latest OTP info with ObjectId handling
    let user = await User.findById(req.user._id);
    
    if (!user) {
      // Try finding by string comparison if ObjectId fails
      const allUsers = await User.find({});
      user = allUsers.find(u => u._id.toString() === req.user._id.toString());
    }
    
    if (!user) {
      console.log(`❌ User not found: ${req.user._id}`);
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log(`✅ User found for vote casting: ${user.email}`);

    // Check if OTP was recently verified (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Development bypass or simplified OTP check
    const isDevelopmentBypass = process.env.NODE_ENV === 'development' && otp === '123456';
    
    if (!isDevelopmentBypass) {
      // For existing users without new fields, just check basic OTP
      if (user.otpCode && user.otpExpires) {
        // Check OTP hasn't expired
        if (user.otpExpires < new Date()) {
          return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }
        
        // Verify the OTP matches
        if (user.otpCode !== otp) {
          return res.status(400).json({ message: 'Invalid OTP' });
        }
      } else {
        return res.status(400).json({ 
          message: 'No valid OTP found. Please request a new OTP.' 
        });
      }
    }

    // Get election with ObjectId handling
    let election = await Election.findById(electionId);
    
    if (!election) {
      // Try finding by string comparison if ObjectId fails
      const allElections = await Election.find({});
      election = allElections.find(e => e._id.toString() === electionId);
    }
    
    if (!election) {
      console.log(`❌ Election not found: ${electionId}`);
      return res.status(404).json({ message: 'Election not found' });
    }
    
    console.log(`✅ Election found: "${election.title}"`);
    console.log(`🗳️ Vote casting attempt by ${user.email} for election: ${election.title}`);

    // Check if election is active
    const now = new Date();
    if (now < election.startDate || now > election.endDate) {
      return res.status(400).json({ message: 'Election is not active' });
    }

    // Check if candidate exists
    const candidate = election.candidates.id(candidateId);
    if (!candidate) {
      return res.status(400).json({ message: 'Candidate not found' });
    }

    // Check if user has already voted
    const existingVoteRecord = await VoteRecord.findOne({
      userId: user._id,
      electionId: electionId
    });

    if (existingVoteRecord) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    // Create anonymous voter hash
    const salt = crypto.randomBytes(32).toString('hex');
    const voterHash = Vote.createVoterHash(user._id.toString(), electionId, salt);

    // Encrypt vote
    const encryptedVote = Vote.encryptVote(candidateId, process.env.ENCRYPTION_KEY);

    // Create verification hash
    const verificationHash = crypto
      .createHash('sha256')
      .update(voterHash + encryptedVote + Date.now())
      .digest('hex');

    // Get client IP
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    // Save vote (anonymous)
    const vote = new Vote({
      electionId,
      voterHash,
      encryptedVote,
      verificationHash,
      ipAddress
    });

    console.log('💾 Saving anonymous vote to database...');
    await vote.save();
    console.log('✅ Anonymous vote saved successfully');

    // Record that user has voted (for preventing double voting)
    const voteRecord = new VoteRecord({
      userId: user._id,
      electionId
    });

    console.log('💾 Saving vote record to database...');
    await voteRecord.save();
    console.log('✅ Vote record saved successfully');

    // Update candidate vote count and election total
    console.log(`📊 Updating vote counts - Candidate: ${candidate.name}, Current: ${candidate.voteCount}`);
    candidate.voteCount += 1;
    election.totalVotes += 1;
    
    console.log(`📊 New vote counts - Candidate: ${candidate.voteCount}, Total: ${election.totalVotes}`);
    console.log('💾 Saving election with updated vote counts...');
    await election.save();
    console.log('✅ Election vote counts updated successfully');

    // Clear user's OTP after successful vote
    console.log('🧹 Clearing user OTP after successful vote...');
    user.otpCode = undefined;
    user.otpExpires = undefined;
    if (user.otpVerified !== undefined) user.otpVerified = false;
    if (user.otpVerifiedAt !== undefined) user.otpVerifiedAt = undefined;
    await user.save();
    console.log('✅ User OTP cleared successfully');

    console.log(`✅ Vote cast successfully by ${user.email} for election: ${election.title}`);
    console.log(`📊 Final counts - Candidate "${candidate.name}": ${candidate.voteCount}, Election total: ${election.totalVotes}`);

    // Send confirmation email
    await sendVoteConfirmation(user.email, election.title);

    res.json({
      message: 'Vote cast successfully',
      verificationHash,
      timestamp: vote.timestamp
    });

  } catch (error) {
    console.error('Vote casting error:', error);
    
    // Handle duplicate vote attempt
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate vote detected' 
      });
    }

    res.status(500).json({ 
      message: 'Server error casting vote',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's vote history (just elections they've voted in)
router.get('/history', auth, async (req, res) => {
  try {
    console.log(`📊 Fetching vote history for user: ${req.user.email} (ID: ${req.user._id})`);
    
    // First try with ObjectId
    let voteRecords = await VoteRecord.find({ userId: req.user._id })
      .sort({ votedAt: -1 });
    
    console.log(`📊 Found ${voteRecords.length} vote records with ObjectId query`);
    
    // If no records found, try with string comparison fallback
    if (voteRecords.length === 0) {
      console.log(`🔄 Trying fallback method for vote history...`);
      
      // Get all vote records and filter manually
      const allVoteRecords = await VoteRecord.find({});
      voteRecords = allVoteRecords.filter(record => 
        record.userId.toString() === req.user._id.toString()
      ).sort((a, b) => new Date(b.votedAt) - new Date(a.votedAt));
      
      console.log(`📊 Found ${voteRecords.length} vote records with fallback method`);
    }

    // Manually populate election data to handle orphaned records
    const history = [];
    
    for (const record of voteRecords) {
      try {
        // Try to find the election
        let election = await Election.findById(record.electionId);
        
        if (!election) {
          // Try fallback method
          const allElections = await Election.find({});
          election = allElections.find(e => e._id.toString() === record.electionId.toString());
        }
        
        if (election) {
          history.push({
            electionTitle: election.title,
            electionDescription: election.description,
            votedAt: record.votedAt,
            electionEndDate: election.endDate,
            electionId: election._id
          });
          console.log(`✅ Added election "${election.title}" to history`);
        } else {
          console.log(`⚠️ Skipping orphaned vote record for election ID: ${record.electionId}`);
        }
      } catch (error) {
        console.log(`❌ Error processing vote record: ${error.message}`);
      }
    }

    console.log(`✅ Returning ${history.length} vote history records`);
    res.json(history);
  } catch (error) {
    console.error('Vote history error:', error);
    res.status(500).json({ message: 'Server error fetching vote history' });
  }
});

module.exports = router;
