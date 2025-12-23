# 🚀 Deployment Guide

## Prerequisites

1. **GitHub Account**
2. **Vercel Account** (free tier available)
3. **MongoDB Atlas Account** (free tier available)
4. **Gmail Account** (for email functionality)

## Step-by-Step Deployment

### 1. Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for Vercel
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/voting_system
   ```

### 2. Setup Gmail App Password

1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account Settings → Security → App passwords
3. Generate password for "Mail" → "Other (Custom name)" → "Voting System"
4. Copy the 16-character password

### 3. Push to GitHub

1. **Initialize Git repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Secure Digital Voting System"
   ```

2. **Create GitHub repository:**
   - Go to GitHub and create a new repository
   - Name it: `secure-voting-system`
   - Make it public or private

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/yourusername/secure-voting-system.git
   git branch -M main
   git push -u origin main
   ```

### 4. Deploy to Vercel

1. **Go to [Vercel](https://vercel.com)**
2. **Sign up/Login** with your GitHub account
3. **Import Project:**
   - Click "New Project"
   - Import your `secure-voting-system` repository
   - Framework Preset: "Other"
   - Root Directory: `./`

4. **Configure Build Settings:**
   - Build Command: `npm run vercel-build`
   - Output Directory: `client/build`
   - Install Command: `npm install`

### 5. Set Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voting_system
JWT_SECRET=d3468a371fe331da07328a04a5cf3d22ba04c8cc97141a7c42a3d8b10c4cf5aa
JWT_REFRESH_SECRET=8871764f7864f3c5882b3e1cdd2d4eecd83718673c6720175da0c1bcbb76c7e4
ENCRYPTION_KEY=ca2744d18c3b2337c8a621b65a97567c
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
NODE_ENV=production
```

### 6. Deploy and Test

1. **Deploy:** Vercel will automatically deploy
2. **Get URL:** Copy your Vercel app URL (e.g., `https://secure-voting-system.vercel.app`)
3. **Seed Database:** Run the seeder script locally pointing to production DB
4. **Test:** Visit your live app and test functionality

### 7. Seed Production Database

Run locally with production MongoDB URI:

```bash
# Update server/.env with production MONGODB_URI temporarily
cd server
npm run seed
```

## 🔧 Troubleshooting

### Common Issues

1. **Build Fails:**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in package.json
   - Verify build command is correct

2. **API Routes Don't Work:**
   - Check vercel.json configuration
   - Ensure API routes start with `/api`
   - Verify serverless function limits

3. **Database Connection:**
   - Verify MongoDB Atlas connection string
   - Check IP whitelist (use 0.0.0.0/0 for Vercel)
   - Ensure database user has proper permissions

4. **Email Not Working:**
   - Verify Gmail App Password (not regular password)
   - Check EMAIL_HOST and EMAIL_PORT settings
   - Test email configuration locally first

### Performance Optimization

1. **Enable Vercel Analytics**
2. **Configure Caching Headers**
3. **Optimize Images and Assets**
4. **Use MongoDB Indexes**

## 🔒 Security Checklist

- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Configure proper CORS origins
- [ ] Use MongoDB Atlas with authentication
- [ ] Set up proper email authentication
- [ ] Enable rate limiting
- [ ] Regular security updates

## 📊 Monitoring

1. **Vercel Analytics:** Monitor performance and usage
2. **MongoDB Atlas Monitoring:** Database performance
3. **Error Tracking:** Set up error monitoring
4. **Uptime Monitoring:** Monitor application availability

## 🔄 Updates and Maintenance

1. **Automatic Deployments:** Push to main branch triggers deployment
2. **Environment Variables:** Update in Vercel dashboard
3. **Database Migrations:** Handle schema changes carefully
4. **Backup Strategy:** Regular MongoDB Atlas backups

Your secure voting system is now live and ready for production use! 🎉