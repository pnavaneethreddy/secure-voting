# Email Alternatives (No 2FA Required)

## Why Gmail Requires 2FA

Google disabled "Less Secure App Access" in May 2022 for security reasons. Now Gmail requires:
- 2-Factor Authentication enabled
- App Passwords instead of regular passwords

## Alternative Solutions

### Option 1: Use Mailtrap (Recommended for Development)

**Free email testing service - No 2FA required**

1. Sign up at [mailtrap.io](https://mailtrap.io)
2. Create a new inbox
3. Get SMTP credentials from the inbox settings

Update your `server/.env`:
```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_username
EMAIL_PASS=your_mailtrap_password
```

**Benefits:**
- ✅ No 2FA required
- ✅ Free tier available
- ✅ Web interface to view emails
- ✅ Perfect for development/testing

### Option 2: Use Outlook/Hotmail

**Microsoft email - No App Password needed**

Update your `server/.env`:
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your_email@outlook.com
EMAIL_PASS=your_regular_password
```

### Option 3: Use SendGrid

**Professional email service - Free tier**

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API key
3. Install SendGrid package: `npm install @sendgrid/mail`

Update `server/utils/email.js`:
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    const msg = {
      to,
      from: 'noreply@votingsystem.com',
      subject,
      html,
    };
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('SendGrid error:', error);
    return false;
  }
};
```

### Option 4: Console Logging (Current Setup)

**No email setup required - Perfect for immediate testing**

Just remove email credentials from `.env`:
```env
# EMAIL_USER=
# EMAIL_PASS=
```

The system will:
- ✅ Log OTP to server console
- ✅ Allow bypass OTP: `123456`
- ✅ Work immediately without any setup

## Quick Setup for Mailtrap (Recommended)

1. **Sign up**: Go to [mailtrap.io](https://mailtrap.io) and create free account
2. **Create inbox**: Click "Add Inbox" → Name it "Voting System"
3. **Get credentials**: Click on inbox → SMTP Settings → Copy credentials
4. **Update .env**:
   ```env
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_USER=your_mailtrap_username
   EMAIL_PASS=your_mailtrap_password
   ```
5. **Test**: Restart server and try voting - emails will appear in Mailtrap inbox!

## Current Working Solution

Your system already works perfectly with console logging:

1. **Login**: `chinnugdpl@gmail.com` / `password123`
2. **Vote**: Select candidate → Next
3. **Check console**: Look for `🔐 Generated OTP for chinnugdpl@gmail.com: 123456`
4. **Use OTP**: Enter the OTP from console OR use bypass `123456`
5. **Success**: Vote completed!

## Recommendation

For immediate testing: **Keep current setup** (console logging)
For production: **Use Mailtrap** (free, no 2FA, web interface)
For real deployment: **Set up Gmail 2FA** (most reliable)
