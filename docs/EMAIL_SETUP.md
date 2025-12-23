# Email Setup Guide

## Gmail Configuration (Recommended)

To send real OTP emails, you need to set up Gmail with an App Password:

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the setup process to enable 2FA

### Step 2: Generate App Password

1. In Google Account Settings → Security
2. Under "Signing in to Google", click **App passwords**
3. Select app: **Mail**
4. Select device: **Other (Custom name)**
5. Enter name: **Voting System**
6. Click **Generate**
7. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update Environment Variables

Update your `server/.env` file:

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

**Important**: Use the 16-character App Password, NOT your regular Gmail password!

### Step 4: Test Email

Restart your server and test the OTP generation. You should see:
```
✅ Email sent successfully to user@email.com. Message ID: <message-id>
```

## Alternative Email Providers

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your_email@outlook.com
EMAIL_PASS=your_password
```

### Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your_email@yahoo.com
EMAIL_PASS=your_app_password
```

### Custom SMTP
```env
EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

## Development Mode

If you don't want to set up email immediately:

1. Remove `EMAIL_USER` and `EMAIL_PASS` from `.env`
2. The system will log emails to console
3. Use bypass OTP: `123456`

## Troubleshooting

### "Failed to send OTP"
- Check if 2FA is enabled on Gmail
- Verify you're using App Password, not regular password
- Ensure EMAIL_USER and EMAIL_PASS are correct in .env
- Restart the server after changing .env

### "Invalid credentials"
- Double-check the App Password (16 characters)
- Make sure there are no extra spaces
- Try generating a new App Password

### "Connection refused"
- Check your internet connection
- Verify EMAIL_HOST and EMAIL_PORT
- Some networks block SMTP ports

## Security Notes

- Never commit .env files to version control
- App Passwords are safer than regular passwords
- Revoke App Passwords you're not using
- Use environment variables in production