const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const electionRoutes = require('./routes/elections');
const voteRoutes = require('./routes/votes');
const adminRoutes = require('./routes/admin');
const debugRoutes = require('./routes/debug');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting - temporarily disabled for debugging
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// Stricter rate limiting for auth endpoints - temporarily disabled
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5 // limit auth attempts
// });

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voting_system')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/debug', debugRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    vercel: process.env.VERCEL ? 'true' : 'false'
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Root endpoint for testing
app.get('/test', (req, res) => {
  res.json({ message: 'Root server endpoint working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  console.error('Error details:', {
    message: err.message,
    name: err.name,
    stack: err.stack
  });
  
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Serve static files from React build (for Vercel deployment)
const path = require('path');

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch all handler: send back React's index.html file for non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      message: 'API endpoint not found',
      path: req.path,
      availableEndpoints: ['/api/auth', '/api/elections', '/api/votes', '/api/admin', '/api/health', '/api/test']
    });
  }
  
  // Serve React app for all other routes
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
