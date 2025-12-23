const express = require('express');
const { body, validationResult } = require('express-validator');
const Election = require('../models/Election');
const VoteRecord = require('../models/VoteRecord');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all active elections
router.get('/', auth, async (req, res) => {
  try {
    const now = new Date();
    const elections = await Election.find({
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('createdBy', 'firstName lastName');

    console.log(`📊 Found ${elections.length} active elections for user: ${req.user.email}`);

    // Check if user has voted in each election
    const electionsWithVoteStatus = await Promise.all(
      elections.map(async (election) => {
        const voteRecord = await VoteRecord.findOne({
          userId: req.user._id,
          electionId: election._id
        });

        const hasVoted = !!voteRecord;
        console.log(`🗳️ Election "${election.title}": User has voted = ${hasVoted}`);

        return {
          ...election.toObject(),
          hasVoted,
          currentStatus: election.currentStatus
        };
      })
    );

    res.json(electionsWithVoteStatus);
  } catch (error) {
    console.error('Get elections error:', error);
    res.status(500).json({ message: 'Server error fetching elections' });
  }
});

// Get election by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');

    if (!election) {
      console.log(`❌ Election not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Election not found' });
    }

    console.log(`📊 Election found: "${election.title}"`);
    console.log(`📊 Election status: ${election.status}`);
    console.log(`📊 Election dates: ${election.startDate} to ${election.endDate}`);
    console.log(`📊 Current status: ${election.currentStatus}`);

    // Check if user has voted
    const voteRecord = await VoteRecord.findOne({
      userId: req.user._id,
      electionId: election._id
    });

    const hasVoted = !!voteRecord;
    console.log(`🗳️ User ${req.user.email} has voted: ${hasVoted}`);

    res.json({
      ...election.toObject(),
      hasVoted,
      currentStatus: election.currentStatus
    });
  } catch (error) {
    console.error('Get election error:', error);
    res.status(500).json({ message: 'Server error fetching election' });
  }
});

// Get election results
router.get('/:id/results', auth, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Only show results if election is completed or user is admin
    const now = new Date();
    if (now < election.endDate && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Results not available until election ends' 
      });
    }

    const results = {
      electionId: election._id,
      title: election.title,
      totalVotes: election.totalVotes,
      candidates: election.candidates.map(candidate => ({
        _id: candidate._id,
        name: candidate.name,
        voteCount: candidate.voteCount,
        percentage: election.totalVotes > 0 
          ? ((candidate.voteCount / election.totalVotes) * 100).toFixed(2)
          : 0
      })),
      status: election.currentStatus,
      endDate: election.endDate
    };

    res.json(results);
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ message: 'Server error fetching results' });
  }
});

module.exports = router;