const mongoose = require('mongoose');
const crypto = require('crypto');

const voteSchema = new mongoose.Schema({
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  // Anonymous voter hash - cannot be traced back to user
  voterHash: {
    type: String,
    required: true
  },
  // Encrypted vote data
  encryptedVote: {
    type: String,
    required: true
  },
  // Vote verification hash
  verificationHash: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one vote per voter per election
voteSchema.index({ electionId: 1, voterHash: 1 }, { unique: true });

// Static method to create anonymous voter hash
voteSchema.statics.createVoterHash = function(userId, electionId, salt) {
  return crypto
    .createHash('sha256')
    .update(userId + electionId + salt)
    .digest('hex');
};

// Static method to encrypt vote
voteSchema.statics.encryptVote = function(candidateId, key) {
  const algorithm = 'aes-256-cbc';
  // Ensure key is 32 bytes for aes-256
  const keyBuffer = Buffer.from(key.padEnd(32, '0').substring(0, 32));
  // Generate a random IV (initialization vector)
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
  let encrypted = cipher.update(candidateId, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV + encrypted data (we need IV for decryption)
  return iv.toString('hex') + ':' + encrypted;
};

// Static method to decrypt vote (for admin verification only)
voteSchema.statics.decryptVote = function(encryptedVote, key) {
  const algorithm = 'aes-256-cbc';
  // Ensure key is 32 bytes for aes-256
  const keyBuffer = Buffer.from(key.padEnd(32, '0').substring(0, 32));
  
  // Split IV and encrypted data
  const parts = encryptedVote.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  
  const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

module.exports = mongoose.model('Vote', voteSchema);