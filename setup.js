#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🗳️  Setting up Secure Digital Voting System...\n');

// Generate secure keys
const jwtSecret = crypto.randomBytes(32).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(32).toString('hex');
const encryptionKey = crypto.randomBytes(16).toString('hex').padEnd(32, '0');

// Create server .env file
const serverEnvContent = `PORT=5000
MONGO_URI=mongodb://localhost:27017/voting_system
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
ENCRYPTION_KEY=${encryptionKey}
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
NODE_ENV=development
CLIENT_URL=http://localhost:3000`;

// Create client .env file
const clientEnvContent = `REACT_APP_API_URL=http://localhost:5000`;

// Write .env files
try {
  fs.writeFileSync(path.join(__dirname, 'server', '.env'), serverEnvContent);
  console.log('✅ Created server/.env with secure keys');
  
  fs.writeFileSync(path.join(__dirname, 'client', '.env'), clientEnvContent);
  console.log('✅ Created client/.env');
  
  console.log('\n📋 Next steps:');
  console.log('1. Update server/.env with your MongoDB URI and email credentials');
  console.log('2. Install dependencies: npm run install-all');
  console.log('3. Start development: npm run dev');
  console.log('\n📚 Documentation:');
  console.log('- Security: docs/SECURITY.md');
  console.log('- Deployment: docs/DEPLOYMENT.md');
  console.log('- API: docs/API.md');
  console.log('\n🔐 Security keys have been generated automatically.');
  console.log('Keep your .env files secure and never commit them to version control!');
  
} catch (error) {
  console.error('❌ Error creating .env files:', error.message);
  process.exit(1);
}
