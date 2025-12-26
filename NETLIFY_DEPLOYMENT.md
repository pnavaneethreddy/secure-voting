# 🚀 Netlify Deployment Guide

## Overview
This guide will help you deploy your Secure Voting System using:
- **Frontend**: Netlify (React app)
- **Backend**: Heroku/Railway/Render (Node.js API)
- **Database**: MongoDB Atlas

## Step 1: Deploy Backend First

### Option A: Heroku (Recommended)
1. Create Heroku account at heroku.com
2. Install Heroku CLI
3. Deploy backend:
   ```bash
   # Create Heroku app
   heroku create your-voting-backend
   
   # Set environment variables
   heroku config:set MONGODB_URI="your_mongodb_connection_string"
   heroku config:set JWT_SECRET="d3468a371fe331da07328a04a5cf3d22ba04c8cc97141a7c42a3d8b10c4cf5aa"
   heroku config:set JWT_REFRESH_SECRET="8871764f7864f3c5882b3e1cdd2d4eecd83718673c6720175da0c1bcbb76c7e4"
   heroku config:set ENCRYPTION_KEY="ca2744d18c3b2337c8a621b65a97567c"
   heroku config:set EMAIL_HOST="smtp.gmail.com"
   heroku config:set EMAIL_PORT="587"
   heroku config:set EMAIL_USER="voter5093@gmail.com"
   heroku config:set EMAIL_PASS="iebadkhomygnxxnf"
   heroku config:set NODE_ENV="production"
   heroku config:set CLIENT_URL="https://your-netlify-app.netlify.app"
   
   # Deploy
   git subtree push --prefix server heroku main
   ```

### Option B: Railway
1. Go to railway.app
2. Connect your GitHub repository
3. Select the server folder
4. Add environment variables
5. Deploy

## Step 2: Setup MongoDB Atlas

1. Go to mongodb.com/atlas
2. Create free cluster
3. Create database user
4. Whitelist all IPs (0.0.0.0/0)
5. Get connection string
6. Update backend environment variables

## Step 3: Deploy Frontend to Netlify

### Method 1: GitHub Integration (Recommended)
1. Go to netlify.com
2. Sign up with GitHub
3. Click "New site from Git"
4. Choose your repository: `secure-voting`
5. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/build`
6. Add environment variables:
   - `REACT_APP_API_URL`: Your backend URL (e.g., `https://your-voting-backend.herokuapp.com`)
7. Deploy

### Method 2: Manual Deploy
1. Build the client locally:
   ```bash
   cd client
   npm run build
   ```
2. Drag and drop the `build` folder to Netlify

## Step 4: Update Configuration

1. **Update netlify.toml** with your actual backend URL:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://your-actual-backend-url.herokuapp.com/api/:splat"
     status = 200
     force = true
   ```

2. **Update client/.env.production** with your backend URL:
   ```
   REACT_APP_API_URL=https://your-actual-backend-url.herokuapp.com
   ```

## Step 5: Test Deployment

1. Visit your Netlify URL
2. Test user registration (should send email)
3. Test login with admin credentials:
   - Email: `admin@votingsystem.com`
   - Password: `admin123`
4. Create a test election
5. Test voting functionality

## Environment Variables Summary

### Backend (Heroku/Railway)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voting_system
JWT_SECRET=d3468a371fe331da07328a04a5cf3d22ba04c8cc97141a7c42a3d8b10c4cf5aa
JWT_REFRESH_SECRET=8871764f7864f3c5882b3e1cdd2d4eecd83718673c6720175da0c1bcbb76c7e4
ENCRYPTION_KEY=ca2744d18c3b2337c8a621b65a97567c
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=voter5093@gmail.com
EMAIL_PASS=iebadkhomygnxxnf
NODE_ENV=production
CLIENT_URL=https://your-netlify-app.netlify.app
```

### Frontend (Netlify)
```
REACT_APP_API_URL=https://your-backend-url.herokuapp.com
```

## Troubleshooting

### CORS Issues
If you get CORS errors, update your backend's CORS configuration to include your Netlify URL.

### API Not Found
Make sure the `netlify.toml` redirects are configured correctly with your actual backend URL.

### Build Failures
Check the Netlify build logs and ensure all dependencies are properly installed.

## Security Notes

1. Never commit `.env` files with real credentials
2. Use strong, unique secrets for production
3. Enable HTTPS (automatic with Netlify)
4. Configure proper CORS origins
5. Use MongoDB Atlas with authentication

## Your URLs After Deployment

- **Frontend**: `https://your-app-name.netlify.app`
- **Backend**: `https://your-backend-name.herokuapp.com`
- **Admin Panel**: `https://your-app-name.netlify.app/admin`

## Next Steps

1. Set up custom domain (optional)
2. Configure email templates
3. Set up monitoring and analytics
4. Create backup strategy
5. Plan for scaling

Your secure voting system is now ready for production! 🎉