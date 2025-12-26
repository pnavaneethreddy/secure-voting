# Setup Guide
*Last updated: December 26, 2025*

## Quick Setup

1. **Initialize the project:**
   ```bash
   npm run setup
   ```

2. **Configure environment variables:**
   - Update `server/.env` with your MongoDB URI and email credentials
   - The setup script generates secure keys automatically

3. **Install dependencies:**
   ```bash
   npm run install-all
   ```

4. **Seed dummy data (optional):**
   ```bash
   npm run seed
   ```

5. **Start development servers:**
   ```bash
   npm run dev
   ```

## Dummy Data

The seeder creates:

### Test Accounts
- **Admin**: `admin@university.edu` / `admin123`
- **Voters**: 
  - `john.doe@university.edu` / `password123`
  - `jane.smith@university.edu` / `password123`
  - `mike.johnson@university.edu` / `password123`
  - `sarah.wilson@university.edu` / `password123`
  - `david.brown@university.edu` / `password123`

### Sample Elections
1. **Student Council President Election** (Active)
   - 3 candidates: Alex Rodriguez, Emily Chen, Marcus Thompson
   - Ends tomorrow

2. **Senior Class Representative Election** (Active)
   - 2 candidates: Jessica Park, Ryan Mitchell
   - Ends in 3 days

3. **Student Activities Board Election** (Upcoming)
   - 4 candidates: Sophia Martinez, James Wilson, Olivia Taylor, Daniel Kim
   - Starts tomorrow

4. **Dormitory Council Election** (Draft)
   - 2 candidates: Ashley Johnson, Tyler Davis
   - For admin testing

## Testing the System

1. **Login as voter** and participate in active elections
2. **Login as admin** to manage elections and view analytics
3. **Test the voting process** with OTP verification
4. **View real-time results** as votes are cast

## Environment Configuration

### Required Environment Variables

**Server (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/voting_system
JWT_SECRET=generated_automatically
JWT_REFRESH_SECRET=generated_automatically
ENCRYPTION_KEY=generated_automatically
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Email Setup (for OTP)

**Gmail:**
1. Enable 2-factor authentication
2. Generate app password
3. Use app password in `EMAIL_PASS`

**Other providers:**
- Update `EMAIL_HOST` and `EMAIL_PORT` accordingly
- Ensure SMTP authentication is enabled

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running locally
   - Or update `MONGODB_URI` to use MongoDB Atlas

2. **Email Sending Failed:**
   - Check email credentials in `.env`
   - Verify SMTP settings for your provider

3. **Port Already in Use:**
   - Change `PORT` in server/.env
   - Update proxy in client/package.json

4. **JWT Errors:**
   - Ensure JWT secrets are set in `.env`
   - Run `npm run setup` to regenerate keys

### Reset Data

To clear all data and reseed:
```bash
npm run seed
```

This will delete all existing users, elections, and votes, then create fresh dummy data.

## Next Steps

1. Customize the dummy data in `server/seeders/dummyData.js`
2. Test the complete voting workflow
3. Explore admin features and analytics
4. Configure for production deployment
