const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const { auth, generateTokens } = require('../middleware/auth');
const { sendOTP } = require('../utils/email');

const router = express.Router();

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('studentId').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, studentId } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { studentId }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or student ID already exists' 
      });
    }

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      studentId
    });

    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Login validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log(`🔐 Login attempt for email: ${email}`);

    // Find user
    const user = await User.findOne({ email });
    console.log(`🔍 User found: ${user ? 'YES' : 'NO'}`);
    
    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      console.log(`❌ User account is inactive: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log(`🔍 User details: ${user.firstName} ${user.lastName} (${user.role})`);

    // Check password
    console.log('🔐 Checking password...');
    const isMatch = await user.comparePassword(password);
    console.log(`🔐 Password match: ${isMatch ? 'YES' : 'NO'}`);
    
    if (!isMatch) {
      console.log(`❌ Password mismatch for user: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);
    console.log(`✅ Login successful for: ${email} (${user.role})`);

    res.json({
      message: 'Login successful',
      user,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Generate OTP for voting
router.post('/generate-otp', auth, async (req, res) => {
  try {
    // Refresh user data from database to ensure we have the latest info
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('❌ User not found during OTP generation');
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log(`🔐 Generating OTP for user: ${user.email} (ID: ${user._id})`);
    console.log(`👤 User role: ${user.role}`);
    console.log(`📧 OTP will be sent to: ${user.email}`);
    
    // Check if user is active
    if (!user.isActive) {
      console.log(`❌ User account is inactive: ${user.email}`);
      return res.status(400).json({ message: 'Account is inactive' });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log(`🔐 Generated OTP: ${otp}`);

    // Save OTP to user
    user.otpCode = otp;
    user.otpExpires = otpExpires;
    
    // Set verification fields if they exist
    if (user.otpVerified !== undefined) user.otpVerified = false;
    if (user.otpVerifiedAt !== undefined) user.otpVerifiedAt = undefined;
    
    console.log(`💾 Saving OTP to user: ${user.email}`);
    await user.save();
    console.log(`✅ OTP saved to database for ${user.email}`);

    // For admin users or development mode, always provide console fallback
    if (user.role === 'admin' || process.env.NODE_ENV === 'development') {
      console.log(`💡 Admin/Dev mode - OTP for ${user.email}: ${otp}`);
      console.log(`💡 Bypass OTP also available: 123456`);
    }

    // Always try to send email first
    console.log(`📧 Attempting to send OTP email to: ${user.email}`);
    
    try {
      const emailSent = await sendOTP(user.email, otp);
      
      if (emailSent) {
        console.log(`✅ OTP email sent successfully to ${user.email}`);
        return res.json({ 
          message: `OTP sent to ${user.email}`,
          success: true 
        });
      } else {
        console.log(`⚠️ Email sending failed to ${user.email}`);
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    // If email fails, still allow process to continue
    console.log(`💡 Email failed, but OTP is available in console: ${otp}`);
    console.log(`💡 User can also use bypass OTP: 123456`);
    
    return res.json({ 
      message: `OTP generated for ${user.email}. Check server console for OTP: ${otp} or use bypass: 123456`,
      success: true 
    });

  } catch (error) {
    console.error('❌ OTP generation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error generating OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify OTP
router.post('/verify-otp', [
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ OTP validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Invalid OTP format',
        errors: errors.array() 
      });
    }

    const { otp } = req.body;
    
    // Refresh user data from database to get latest OTP info
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('❌ User not found during OTP verification');
      return res.status(401).json({ message: 'User not found' });
    }

    console.log(`🔍 Verifying OTP for user: ${user.email}`);
    console.log(`🔍 Received OTP: "${otp}" (length: ${otp.length})`);
    console.log(`🔍 Stored OTP: "${user.otpCode}" (length: ${user.otpCode ? user.otpCode.length : 'null'})`);
    console.log(`🔍 OTP Expires: ${user.otpExpires}`);
    console.log(`🔍 Current Time: ${new Date()}`);

    // Development bypass: accept "123456" as valid OTP in development mode
    if (process.env.NODE_ENV === 'development' && otp === '123456') {
      console.log(`🔓 Development bypass OTP used by ${user.email}`);
      
      // Set verification flag if field exists
      if (user.otpVerified !== undefined) {
        user.otpVerified = true;
        user.otpVerifiedAt = new Date();
      }
      await user.save();
      
      return res.json({ 
        message: 'OTP verified successfully', 
        verified: true
      });
    }

    if (!user.otpCode || !user.otpExpires) {
      console.log(`❌ No OTP found for user: ${user.email}`);
      console.log(`   otpCode exists: ${!!user.otpCode}`);
      console.log(`   otpExpires exists: ${!!user.otpExpires}`);
      return res.status(400).json({ 
        message: 'No OTP generated. Please request a new OTP.' 
      });
    }

    if (user.otpExpires < new Date()) {
      console.log(`❌ OTP expired for user: ${user.email}`);
      console.log(`   Expired at: ${user.otpExpires}`);
      console.log(`   Current time: ${new Date()}`);
      
      // Clear expired OTP
      user.otpCode = undefined;
      user.otpExpires = undefined;
      if (user.otpVerified !== undefined) user.otpVerified = false;
      await user.save();
      
      return res.status(400).json({ 
        message: 'OTP expired. Please request a new OTP.' 
      });
    }

    // Compare OTPs (trim whitespace and convert to string)
    const receivedOTP = otp.toString().trim();
    const storedOTP = user.otpCode.toString().trim();
    
    console.log(`🔍 Comparing OTPs:`);
    console.log(`   Received: "${receivedOTP}"`);
    console.log(`   Stored: "${storedOTP}"`);
    console.log(`   Match: ${receivedOTP === storedOTP}`);

    if (receivedOTP !== storedOTP) {
      console.log(`❌ Invalid OTP for user: ${user.email}`);
      console.log(`   Expected: "${storedOTP}"`);
      console.log(`   Received: "${receivedOTP}"`);
      return res.status(400).json({ 
        message: 'Invalid OTP. Please check and try again.' 
      });
    }

    // Mark OTP as verified
    if (user.otpVerified !== undefined) {
      user.otpVerified = true;
      user.otpVerifiedAt = new Date();
    }
    await user.save();

    console.log(`✅ OTP verified successfully for ${user.email}`);
    res.json({ message: 'OTP verified successfully', verified: true });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      message: 'Server error verifying OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current user
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;