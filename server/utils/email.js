const nodemailer = require('nodemailer');

let transporter = null;

// Create transporter based on environment (lazy initialization)
const getTransporter = () => {
  if (transporter !== null) {
    return transporter;
  }

  console.log('🔧 Creating email transporter...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
  
  // Check if email credentials are provided
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  No email credentials provided. Using console logging for development.');
    transporter = false; // Mark as unavailable
    return null;
  }

  console.log(`📧 Creating Gmail transporter for: ${process.env.EMAIL_USER}`);

  try {
    transporter = nodemailer.createTransport({
      service: 'gmail', // Use Gmail service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('✅ Email transporter created successfully');
    return transporter;
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    transporter = false; // Mark as failed
    return null;
  }
};

const sendEmail = async (to, subject, html) => {
  try {
    const emailTransporter = getTransporter();
    
    // If no transporter, use console logging in development
    if (!emailTransporter) {
      if (process.env.NODE_ENV === 'development') {
        console.log('\n📧 EMAIL SIMULATION (Development Mode)');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('Content:', html.replace(/<[^>]*>/g, '')); // Strip HTML tags
        console.log('─'.repeat(50));
        return true;
      }
      return false;
    }

    const mailOptions = {
      from: `"Secure Voting System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    console.log(`📧 Sending email to ${to}...`);
    const info = await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    console.error('Error details:', error.message);
    
    // In development, fall back to console logging
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📧 EMAIL FALLBACK (Development Mode)');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Content:', html.replace(/<[^>]*>/g, ''));
      console.log('Error:', error.message);
      console.log('─'.repeat(50));
      return true;
    }
    
    return false;
  }
};

const sendOTP = async (email, otp) => {
  console.log(`📧 sendOTP called for: ${email} with OTP: ${otp}`);
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Voting System - OTP Verification</h2>
      <p>Your One-Time Password (OTP) for secure voting is:</p>
      <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;
  
  console.log(`📧 Calling sendEmail for: ${email}`);
  const result = await sendEmail(email, 'Voting System - OTP Verification', html);
  console.log(`📧 sendEmail result for ${email}: ${result}`);
  
  return result;
};

const sendVoteConfirmation = async (email, electionTitle) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Vote Confirmation</h2>
      <p>Your vote has been successfully recorded for:</p>
      <h3>${electionTitle}</h3>
      <p>Thank you for participating in the democratic process!</p>
      <p><strong>Important:</strong> Your vote is anonymous and cannot be changed once submitted.</p>
    </div>
  `;
  
  return sendEmail(email, 'Vote Confirmation - ' + electionTitle, html);
};

module.exports = { sendEmail, sendOTP, sendVoteConfirmation };
