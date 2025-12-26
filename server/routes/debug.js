const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Debug route to check current user
router.get('/whoami', auth, (req, res) => {
  const user = req.user;
  console.log('🔍 Debug - Current user:', {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role
  });
  
  res.json({
    message: 'Current logged-in user',
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    }
  });
});

// Debug route to check database counts
router.get('/db-stats', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const Election = require('../models/Election');
    const Vote = require('../models/Vote');
    const VoteRecord = require('../models/VoteRecord');

    const stats = {
      users: await User.countDocuments(),
      elections: await Election.countDocuments(),
      votes: await Vote.countDocuments(),
      voteRecords: await VoteRecord.countDocuments(),
      timestamp: new Date()
    };

    console.log('📊 Database stats requested:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error getting database stats:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
