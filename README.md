# 🗳️ Secure Digital Voting System

A secure, anonymous digital voting platform for university and organization elections with real-time results and comprehensive fraud prevention.

## 🌐 Live Demo

**Frontend**: [https://your-app-name.vercel.app](https://your-app-name.vercel.app)  
**API**: [https://your-app-name.vercel.app/api](https://your-app-name.vercel.app/api)

## ✨ Features

### 🔐 Security & Privacy
- **Anonymous Voting**: Cryptographic separation of voter identity and vote choice
- **Two-Factor Authentication**: OTP verification for vote casting
- **Encrypted Storage**: All votes encrypted before database storage
- **Fraud Prevention**: One vote per user, duplicate detection, audit trails

### 🗳️ Voting Experience
- **Intuitive Interface**: Clean, accessible voting process
- **Real-time Results**: Live vote counting and display
- **Vote Confirmation**: Email confirmations and verification hashes
- **Mobile Responsive**: Works on all devices

### 👨‍💼 Administration
- **Election Management**: Create, update, and monitor elections
- **User Management**: Activate/deactivate users, view statistics
- **Analytics Dashboard**: Detailed voting analytics and turnout data
- **Results Control**: Configure when results are visible

## 🏗️ Tech Stack

- **Frontend**: React 18, Context API, Tailwind CSS, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT tokens, OTP verification
- **Security**: bcrypt, helmet, rate limiting, CORS
- **Email**: Nodemailer with SMTP support
- **Deployment**: Vercel + MongoDB Atlas

## 🚀 Quick Start (Local Development)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/secure-voting-system.git
   cd secure-voting-system
   ```

2. **Setup the project:**
   ```bash
   npm run setup
   ```

3. **Configure environment:**
   - Update `server/.env` with your MongoDB URI and email credentials
   - See `server/.env.example` for all required variables

4. **Install dependencies:**
   ```bash
   npm run install-all
   ```

5. **Seed dummy data:**
   ```bash
   npm run seed
   ```

6. **Start development servers:**
   ```bash
   npm run dev
   ```

## 🌐 Deployment

### Vercel Deployment

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Set Environment Variables** (see below)
4. **Deploy**

### Required Environment Variables

Set these in your Vercel dashboard:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voting_system
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_minimum_32_characters
ENCRYPTION_KEY=your_32_character_encryption_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
NODE_ENV=production
```

## 🧪 Test Accounts

After seeding the database:

- **Admin**: `admin@votingsystem.com` / `admin123`
- **Voter**: `chinnugdpl@gmail.com` / `password123`

## 📚 Documentation

- **[Security Guide](docs/SECURITY.md)** - Security features and best practices
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[API Documentation](docs/API.md)** - Complete API reference
- **[Development Guide](docs/DEVELOPMENT.md)** - Local development setup

## 🔒 Security Features

### Vote Anonymity
- Voter identity hashed with election-specific salt
- Votes encrypted before storage
- No way to trace votes back to voters
- Separate vote records and voter tracking

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- OTP verification for sensitive operations
- Role-based access control (voter/admin)
- Rate limiting and brute force protection

## 🎯 Use Cases

- **University Elections**: Student council, class representatives
- **Organization Voting**: Board elections, policy decisions
- **Community Polls**: Resident associations, clubs
- **Corporate Elections**: Employee representatives, committees

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Issues**: Report bugs and request features via GitHub Issues
- **Documentation**: Check the `docs/` folder for detailed guides
- **Security**: Report security issues privately

## 🙏 Acknowledgments

Built with security and accessibility in mind, following best practices for digital voting systems and democratic processes.