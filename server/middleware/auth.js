const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to find user with multiple methods to handle ObjectId issues
    let user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      // Try finding by string comparison if ObjectId fails
      const allUsers = await User.find({}).select('-password');
      user = allUsers.find(u => u._id.toString() === decoded.userId);
    }
    
    if (!user || !user.isActive) {
      console.log(`❌ User not found or inactive for token: ${decoded.userId}`);
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    console.log(`🔐 Authenticated user: ${user.email} (ID: ${user._id})`);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Authorization failed' });
  }
};

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

module.exports = { auth, adminAuth, generateTokens };