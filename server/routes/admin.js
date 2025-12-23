const express = require('express');
const { body, validationResult } = require('express-validator');
const Election = require('../models/Election');
const User = require('../models/User');
const Vote = require('../models/Vote');
const VoteRecord = require('../models/VoteRecord');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Create election
router.post('/elections', [
  body('title').trim().isLength({ min: 1 }),
  body('description').trim().isLength({ min: 1 }),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('candidates').isArray({ min: 2 })
], adminAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, startDate, endDate, candidates } = req.body;

    const election = new Election({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      candidates: candidates.map(candidate => ({
        name: candidate.name,
        description: candidate.description || '',
        imageUrl: candidate.imageUrl || ''
      })),
      createdBy: req.user._id,
      status: 'active'
    });

    await election.save();

    res.status(201).json({
      message: 'Election created successfully',
      election
    });
  } catch (error) {
    console.error('Create election error:', error);
    res.status(500).json({ message: 'Server error creating election' });
  }
});

// Get all elections (admin view)
router.get('/elections', adminAuth, async (req, res) => {
  try {
    const elections = await Election.find()
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    const electionsWithStats = elections.map(election => ({
      ...election.toObject(),
      currentStatus: election.currentStatus
    }));

    res.json(electionsWithStats);
  } catch (error) {
    console.error('Get admin elections error:', error);
    res.status(500).json({ message: 'Server error fetching elections' });
  }
});

// Update election
router.put('/elections/:id', [
  body('title').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601()
], adminAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Don't allow updates if voting has started
    if (election.totalVotes > 0) {
      return res.status(400).json({ 
        message: 'Cannot update election after voting has started' 
      });
    }

    Object.assign(election, req.body);
    await election.save();

    res.json({
      message: 'Election updated successfully',
      election
    });
  } catch (error) {
    console.error('Update election error:', error);
    res.status(500).json({ message: 'Server error updating election' });
  }
});

// Delete election
router.delete('/elections/:id', adminAuth, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Don't allow deletion if voting has started
    if (election.totalVotes > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete election after voting has started' 
      });
    }

    await Election.findByIdAndDelete(req.params.id);

    res.json({ message: 'Election deleted successfully' });
  } catch (error) {
    console.error('Delete election error:', error);
    res.status(500).json({ message: 'Server error deleting election' });
  }
});

// Get election analytics
router.get('/elections/:id/analytics', adminAuth, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Get vote distribution by time
    const votes = await Vote.find({ electionId: election._id })
      .sort({ timestamp: 1 });

    const hourlyVotes = {};
    votes.forEach(vote => {
      const hour = new Date(vote.timestamp).getHours();
      hourlyVotes[hour] = (hourlyVotes[hour] || 0) + 1;
    });

    // Get total registered users vs voters
    const totalUsers = await User.countDocuments({ role: 'voter', isActive: true });
    const totalVoters = await VoteRecord.countDocuments({ electionId: election._id });

    const analytics = {
      electionId: election._id,
      title: election.title,
      totalVotes: election.totalVotes,
      totalUsers,
      totalVoters,
      turnoutPercentage: totalUsers > 0 ? ((totalVoters / totalUsers) * 100).toFixed(2) : 0,
      hourlyDistribution: hourlyVotes,
      candidateResults: election.candidates.map(candidate => ({
        name: candidate.name,
        votes: candidate.voteCount,
        percentage: election.totalVotes > 0 
          ? ((candidate.voteCount / election.totalVotes) * 100).toFixed(2)
          : 0
      }))
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

// Get all users (admin view)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ role: 'voter' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Toggle user active status
router.patch('/users/:id/toggle-status', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error updating user status' });
  }
});

module.exports = router;