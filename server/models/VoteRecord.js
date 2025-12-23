const mongoose = require('mongoose');

// Separate collection to track who has voted (for preventing double voting)
// This is separate from Vote model to maintain anonymity
const voteRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  hasVoted: {
    type: Boolean,
    default: true
  },
  votedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one record per user per election
voteRecordSchema.index({ userId: 1, electionId: 1 }, { unique: true });

module.exports = mongoose.model('VoteRecord', voteRecordSchema);