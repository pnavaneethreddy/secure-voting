const express = require('express');
const { body, validationResult } = require('express-validator');
const Election = require('../models/Election');
const VoteRecord = require('../models/VoteRecord');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all elections (including past ones) - fallback route
router.get('/all', auth, async (req, res) => {
  try {
    console.log('🚀 All Elections API called by user:', req.user.email);
    
    // Get all elections regardless of status or date
    const allElections = await Election.find({})
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 }); // Sort by newest first

    console.log(`📊 Found ${allElections.length} total elections (all statuses)`);

    // Add vote status for each election
    const electionsWithVoteStatus = await Promise.all(
      allElections.map(async (election) => {
        // Try ObjectId query first
        let voteRecord = await VoteRecord.findOne({
          userId: req.user._id,
          electionId: election._id
        });

        // If not found, try fallback method
        if (!voteRecord) {
          const allVoteRecords = await VoteRecord.find({});
          voteRecord = allVoteRecords.find(record => 
            record.userId.toString() === req.user._id.toString() &&
            record.electionId.toString() === election._id.toString()
          );
        }

        const hasVoted = !!voteRecord;
        const now = new Date();
        const isActive = election.status === 'active' && 
                        election.startDate <= now && 
                        election.endDate >= now;

        return {
          ...election.toObject(),
          hasVoted,
          currentStatus: election.currentStatus,
          isCurrentlyActive: isActive
        };
      })
    );

    console.log('✅ Returning all elections to frontend:', electionsWithVoteStatus.length);
    res.json(electionsWithVoteStatus);
  } catch (error) {
    console.error('Get all elections error:', error);
    res.status(500).json({ message: 'Server error fetching all elections' });
  }
});

// Get all active elections
router.get('/', auth, async (req, res) => {
  try {
    console.log('🚀 Elections API called by user:', req.user.email);
    const now = new Date();
    console.log(`🕐 Current time: ${now}`);
    
    // Get all active elections first, then filter in JavaScript to handle timezone issues
    const allActiveElections = await Election.find({
      status: 'active'
    }).populate('createdBy', 'firstName lastName');

    console.log(`📊 Found ${allActiveElections.length} total active elections`);

    // Filter elections that are currently running
    const currentElections = allActiveElections.filter(election => {
      const isCurrentlyActive = election.startDate <= now && election.endDate >= now;
      console.log(`🗳️ Election "${election.title}": Currently active = ${isCurrentlyActive}`);
      console.log(`   Start: ${election.startDate}, End: ${election.endDate}`);
      return isCurrentlyActive;
    });

    console.log(`📊 Found ${currentElections.length} currently active elections for user: ${req.user.email}`);

    // Check if user has voted in each election
    const electionsWithVoteStatus = await Promise.all(
      currentElections.map(async (election) => {
        // Try ObjectId query first
        let voteRecord = await VoteRecord.findOne({
          userId: req.user._id,
          electionId: election._id
        });

        // If not found, try fallback method
        if (!voteRecord) {
          const allVoteRecords = await VoteRecord.find({});
          voteRecord = allVoteRecords.find(record => 
            record.userId.toString() === req.user._id.toString() &&
            record.electionId.toString() === election._id.toString()
          );
        }

        const hasVoted = !!voteRecord;
        console.log(`🗳️ Election "${election.title}": User has voted = ${hasVoted}`);

        return {
          ...election.toObject(),
          hasVoted,
          currentStatus: election.currentStatus,
          isCurrentlyActive: true // Since we already filtered for currently active elections
        };
      })
    );

    console.log('✅ Returning elections to frontend:', electionsWithVoteStatus.length);
    res.json(electionsWithVoteStatus);
  } catch (error) {
    console.error('Get elections error:', error);
    res.status(500).json({ message: 'Server error fetching elections' });
  }
});

// Get election by ID
router.get('/:id', auth, async (req, res) => {
  try {
    console.log(`🔍 Fetching election ID: ${req.params.id}`);
    
    // Find election using multiple methods to handle ObjectId issues
    let election = await Election.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');
    
    if (!election) {
      // Try finding by string comparison if ObjectId fails
      const allElections = await Election.find({}).populate('createdBy', 'firstName lastName');
      election = allElections.find(e => e._id.toString() === req.params.id);
    }

    if (!election) {
      console.log(`❌ Election not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Election not found' });
    }

    console.log(`📊 Election found: "${election.title}"`);
    console.log(`📊 Election status: ${election.status}`);
    console.log(`📊 Election dates: ${election.startDate} to ${election.endDate}`);
    console.log(`📊 Current status: ${election.currentStatus}`);

    // Check if user has voted
    let voteRecord = await VoteRecord.findOne({
      userId: req.user._id,
      electionId: election._id
    });

    // If not found, try fallback method
    if (!voteRecord) {
      const allVoteRecords = await VoteRecord.find({});
      voteRecord = allVoteRecords.find(record => 
        record.userId.toString() === req.user._id.toString() &&
        record.electionId.toString() === election._id.toString()
      );
    }

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
    console.log(`🔍 Fetching results for election ID: ${req.params.id}`);
    
    // Find election using multiple methods to handle ObjectId issues
    let election = await Election.findById(req.params.id);
    
    if (!election) {
      // Try finding by string comparison if ObjectId fails
      const allElections = await Election.find({});
      election = allElections.find(e => e._id.toString() === req.params.id);
    }

    if (!election) {
      console.log(`❌ Election not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Election not found' });
    }

    console.log(`✅ Election found: "${election.title}"`);
    console.log(`📊 Status: ${election.status}, Total votes: ${election.totalVotes}`);

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
      totalVotes: election.totalVotes || 0,
      candidates: election.candidates.map(candidate => ({
        _id: candidate._id,
        name: candidate.name,
        voteCount: candidate.voteCount || 0,
        percentage: (election.totalVotes && election.totalVotes > 0)
          ? ((candidate.voteCount || 0) / election.totalVotes * 100).toFixed(2)
          : 0
      })),
      status: election.currentStatus,
      endDate: election.endDate
    };

    console.log(`📊 Returning results:`, JSON.stringify(results, null, 2));
    res.json(results);
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ message: 'Server error fetching results' });
  }
});

module.exports = router;
