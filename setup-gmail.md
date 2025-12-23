# Gmail Setup for OTP Emails

## Quick Setup Steps:

### 1. Enable 2-Factor Authentication
- Go to: https://myaccount.google.com/security
- Click "2-Step Verification" → Turn On
- Follow the setup process

### 2. Generate App Password
- Go to: https://myaccount.google.com/apppasswords
- Select app: "Mail"
- Select device: "Other (Custom name)"
- Enter: "Voting System"
- Click "Generate"
- **Copy the 16-character password** (like: `abcd efgh ijkl mnop`)

### 3. Update .env file
Replace `your_gmail_app_password_here` in `server/.env` with your App Password:

```
EMAIL_PASS=abcd efgh ijkl mnop
```

### 4. Re-seed Database
```bash
npm run seed
```

### 5. Test the System
1. Login with: `chinnugdpl@gmail.com` / `password123`
2. Vote in an election
3. Check your Gmail inbox for the OTP!

## How it Works:
- When you login as `chinnugdpl@gmail.com`, the OTP will be sent to your actual Gmail
- Other test users will use console logging (since they're not real emails)
- Admin account: `chinnugdpl+admin@gmail.com` (Gmail will deliver to your main inbox)

## Test Flow:
1. **Login**: `chinnugdpl@gmail.com` / `password123`
2. **Vote**: Select candidate → Next
3. **Check Gmail**: You'll receive real OTP email
4. **Enter OTP**: From your email
5. **Complete Vote**: Success!

The system correctly sends OTP to the **logged-in user's email address** - now it will be your real Gmail! 📧