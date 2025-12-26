# 🚀 Quick Deployment Commands

## Step 1: Initialize Git and Push to GitHub

```bash
# Initialize Git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Secure Digital Voting System"

# Add your GitHub repository (replace with your username)
git remote add origin https://github.com/YOUR_USERNAME/secure-voting-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with GitHub
3. **Click "New Project"**
4. **Import** your `secure-voting-system` repository
5. **Configure:**
   - Framework Preset: "Other"
   - Build Command: `npm run vercel-build`
   - Output Directory: `client/build`

## Step 3: Set Environment Variables in Vercel

Go to your project → Settings → Environment Variables and add:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voting_system
JWT_SECRET=d3468a371fe331da07328a04a5cf3d22ba04c8cc97141a7c42a3d8b10c4cf5aa
JWT_REFRESH_SECRET=8871764f7864f3c5882b3e1cdd2d4eecd83718673c6720175da0c1bcbb76c7e4
ENCRYPTION_KEY=ca2744d18c3b2337c8a621b65a97567c
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=chinnugdpl@gmail.com
EMAIL_PASS=crhw cpuo rjme pdfc
NODE_ENV=production
```

## Step 4: Setup MongoDB Atlas

1. **Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)**
2. **Create free cluster**
3. **Create database user**
4. **Whitelist all IPs** (0.0.0.0/0)
5. **Get connection string** and update MONGODB_URI above

## Step 5: Deploy!

Click "Deploy" in Vercel - your app will be live in minutes!

## 🎉 Your Live App

After deployment, you'll get a URL like:
`https://secure-voting-system-xyz.vercel.app`

## Test Accounts

- **Admin**: `admin@votingsystem.com` / `admin123`
- **Voter**: `chinnugdpl@gmail.com` / `password123`

## 🔧 Need Help?

Check `DEPLOYMENT.md` for detailed troubleshooting guide!
