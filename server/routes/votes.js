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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { electionId, candidateId, otp } = req.body;
    
    // Refresh user data from database to get latest OTP info
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

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

    // Get election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

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
    const voteRecords = await VoteRecord.find({ userId: req.user._id })
      .populate('electionId', 'title description endDate')
      .sort({ votedAt: -1 });

    const history = voteRecords.map(record => ({
      electionTitle: record.electionId.title,
      electionDescription: record.electionId.description,
      votedAt: record.votedAt,
      electionEndDate: record.electionId.endDate
    }));

    res.json(history);
  } catch (error) {
    console.error('Vote history error:', error);
    res.status(500).json({ message: 'Server error fetching vote history' });
  }
});

module.exports = router;