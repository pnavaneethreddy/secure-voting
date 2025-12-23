const { sendOTP } = require('./utils/email');
require('dotenv').config();

const testEmail = async () => {
  console.log('🧪 Testing email configuration...');
  console.log('Email User:', process.env.EMAIL_USER);
  console.log('Email Pass:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email credentials not configured');
    console.log('Please set EMAIL_USER and EMAIL_PASS in server/.env');
    return;
  }
  
  const testOTP = '123456';
  const testEmail = process.env.EMAIL_USER; // Send to yourself for testing
  
  console.log(`📧 Sending test OTP to ${testEmail}...`);
  
  try {
    const result = await sendOTP(testEmail, testOTP);
    if (result) {
      console.log('✅ Email sent successfully!');
      console.log('Check your inbox for the test OTP email.');
    } else {
      console.log('❌ Email sending failed');
    }
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
};

testEmail();