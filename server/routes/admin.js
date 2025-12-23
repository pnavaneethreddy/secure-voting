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
    console.log(`📝 Update election request for ID: ${req.params.id}`);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Find election with ObjectId handling
    let election = await Election.findById(req.params.id);
    
    if (!election) {
      // Try finding by string comparison if ObjectId fails
      const allElections = await Election.find({});
      election = allElections.find(e => e._id.toString() === req.params.id);
    }
    
    if (!election) {
      console.log(`❌ Election not found for update: ${req.params.id}`);
      return res.status(404).json({ message: 'Election not found' });
    }

    console.log(`✅ Election found for update: "${election.title}"`);

    // Don't allow updates if voting has started
    if (election.totalVotes > 0) {
      console.log(`❌ Cannot update election with votes: ${election.totalVotes} votes cast`);
      return res.status(400).json({ 
        message: 'Cannot update election after voting has started' 
      });
    }

    // Update using Mongoose updateOne method
    const updateData = { ...req.body };
    
    // Convert date strings to Date objects if present
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    
    const updateResult = await Election.updateOne(
      { _id: election._id },
      { $set: updateData }
    );
    
    if (updateResult.modifiedCount === 1) {
      // Fetch updated election
      const updatedElection = await Election.findById(election._id);
      console.log(`✅ Election "${election.title}" updated successfully`);
      
      res.json({
        message: 'Election updated successfully',
        election: updatedElection
      });
    } else {
      console.log(`❌ Failed to update election: ${req.params.id}, updateResult:`, updateResult);
      res.status(500).json({ message: 'Failed to update election' });
    }
  } catch (error) {
    console.error('Update election error:', error);
    res.status(500).json({ message: 'Server error updating election' });
  }
});

// Delete election
router.delete('/elections/:id', adminAuth, async (req, res) => {
  try {
    console.log(`🗑️ Delete election request for ID: ${req.params.id}`);
    
    // Get raw election data from database to handle mixed ObjectId types
    const db = require('mongoose').connection.db;
    const rawElections = await db.collection('elections').find({}).toArray();
    
    // Find election by matching string representation of ID
    const election = rawElections.find(e => e._id.toString() === req.params.id);
    
    if (!election) {
      console.log(`❌ Election not found for deletion: ${req.params.id}`);
      return res.status(404).json({ message: 'Election not found' });
    }

    console.log(`✅ Election found for deletion: "${election.title}"`);
    console.log(`   ID: ${election._id} (Type: ${typeof election._id})`);
    console.log(`   Votes: ${election.totalVotes}`);

    // Admin can delete elections even with votes, but we'll clean up related data
    if (election.totalVotes > 0) {
      console.log(`⚠️ Admin deleting election with ${election.totalVotes} votes - cleaning up related data`);
      
      // Delete related votes and vote records
      try {
        const voteDeleteResult = await db.collection('votes').deleteMany({ 
          electionId: election._id 
        });
        console.log(`🧹 Deleted ${voteDeleteResult.deletedCount} votes`);
        
        const voteRecordDeleteResult = await db.collection('voterecords').deleteMany({ 
          electionId: election._id 
        });
        console.log(`🧹 Deleted ${voteRecordDeleteResult.deletedCount} vote records`);
      } catch (cleanupError) {
        console.error('⚠️ Error cleaning up votes:', cleanupError);
        // Continue with election deletion even if cleanup fails
      }
    }

    // Delete the election
    const deleteResult = await db.collection('elections').deleteOne({ 
      _id: election._id 
    });
    
    console.log(`🧪 Delete operation result:`, deleteResult);
    
    if (deleteResult.deletedCount === 1) {
      console.log(`✅ Election "${election.title}" deleted successfully`);
      res.json({ 
        message: election.totalVotes > 0 
          ? `Election deleted successfully. ${election.totalVotes} votes were also removed.`
          : 'Election deleted successfully'
      });
    } else {
      console.log(`❌ Failed to delete election: ${req.params.id}`);
      res.status(500).json({ message: 'Failed to delete election' });
    }
  } catch (error) {
    console.error('Delete election error:', error);
    res.status(500).json({ message: 'Server error deleting election' });
  }
});

// Get election analytics
router.get('/elections/:id/analytics', adminAuth, async (req, res) => {
  try {
    console.log(`📊 Analytics request for election ID: ${req.params.id}`);
    
    // Find election with ObjectId handling
    let election = await Election.findById(req.params.id);
    
    if (!election) {
      // Try finding by string comparison if ObjectId fails
      const allElections = await Election.find({});
      election = allElections.find(e => e._id.toString() === req.params.id);
    }
    
    if (!election) {
      console.log(`❌ Election not found for analytics: ${req.params.id}`);
      return res.status(404).json({ message: 'Election not found' });
    }

    console.log(`✅ Election found for analytics: "${election.title}"`);

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

    console.log(`📊 Analytics generated for "${election.title}": ${election.totalVotes} total votes`);
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