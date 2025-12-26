# Development Guide

## Email Configuration for Development

### Option 1: No Email Setup (Recommended for Testing)

The system automatically detects development mode and provides these features:

1. **Console Logging**: OTP codes are logged to the server console (secure - not visible to users)
2. **Development Bypass**: Use `123456` as a universal OTP in development mode
3. **Email Simulation**: Emails are simulated and logged server-side only

**Important**: OTP codes are NEVER displayed in the frontend for security. Check your server console or use the bypass code `123456`.

### Option 2: Gmail Setup (For Full Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Update server/.env**:
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_16_character_app_password
   ```

### Option 3: Test Email Service (Ethereal)

For development testing without real email:

```javascript
// Add to server/utils/email.js for testing
const testAccount = await nodemailer.createTestAccount();
const transporter = nodemailer.createTransporter({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
});
```

## Development Features

### OTP Testing

1. **Universal Bypass OTP**: `123456`
   - Works in development mode only
   - No email configuration required
   - Secure - not visible to end users

2. **Console Logging**:
   - Check server console for real OTP codes
   - Format: `🔐 DEVELOPMENT OTP for user@email.com: 685413`
   - Emails are simulated and logged server-side

3. **Security**:
   - OTP never displayed in frontend/browser
   - Only logged in server console (secure)
   - User sees their email address for confirmation

### Test Accounts

After running `npm run seed`:

```
Admin: admin@university.edu / admin123
Voters: 
  - john.doe@university.edu / password123
  - jane.smith@university.edu / password123
  - mike.johnson@university.edu / password123
  - sarah.wilson@university.edu / password123
  - david.brown@university.edu / password123
```

### Development Workflow

1. **Start the system**:
   ```bash
   npm run dev
   ```

2. **Login as a voter**:
   - Use any seeded voter account
   - Navigate to an active election

3. **Test voting process**:
   - Select a candidate
   - Click "Next: Verify Identity"
   - Check server console for OTP or use `123456`
   - Complete the vote

4. **Test admin features**:
   - Login as admin
   - Create/manage elections
   - View analytics and results

### Debugging

#### Common Issues

1. **"Failed to send OTP"**:
   - Check if `NODE_ENV=development` in server/.env
   - Use bypass OTP `123456`
   - Check server console for logged OTP

2. **Database Connection**:
   - Ensure MongoDB is running
   - Check `MONGODB_URI` in server/.env

3. **CORS Errors**:
   - Verify `CLIENT_URL` in server/.env
   - Check proxy setting in client/package.json

#### Server Console Output

Look for these messages:
```
📧 Development mode: Email will be logged to console
📧 EMAIL SIMULATION (Development Mode)
To: user@example.com
Subject: Voting System - OTP Verification
Content: Your One-Time Password (OTP) for secure voting is: 123456
```

### Environment Variables

**Development server/.env**:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/voting_system
JWT_SECRET=generated_by_setup
JWT_REFRESH_SECRET=generated_by_setup
ENCRYPTION_KEY=generated_by_setup
CLIENT_URL=http://localhost:3000

# Optional - only if you want real emails
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Testing Checklist

- [ ] User registration and login
- [ ] Election listing and details
- [ ] Vote casting with OTP (use `123456`)
- [ ] Real-time results updates
- [ ] Admin election management
- [ ] User management (admin)
- [ ] Analytics and reporting

### Production Preparation

Before deploying:

1. Set `NODE_ENV=production`
2. Configure real email service
3. Use strong JWT secrets
4. Set up MongoDB Atlas
5. Configure HTTPS
6. Remove development bypasses
