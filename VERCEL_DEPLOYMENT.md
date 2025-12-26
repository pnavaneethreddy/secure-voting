# 🚀 Vercel Deployment Guide

## Overview
Deploy your Secure Voting System on Vercel with:
- **Frontend**: React app (static build)
- **Backend**: Vercel Serverless Functions
- **Database**: MongoDB Atlas

## Step 1: Deploy to Vercel

### Method 1: Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your repository: `pnavaneethreddy/secure-voting`
5. Configure settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install`

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from your project directory
vercel

# Follow the prompts:
# - Link to existing project? N
# - Project name: secure-voting-system
# - Directory: ./
# - Override settings? N
```

## Step 2: Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```env
MONGODB_URI=mongodb+srv://votingadmin:Chinnu%402006pnr@votingcluster.cujzama.mongodb.net/voting_system?retryWrites=true&w=majority&appName=VotingCluster
JWT_SECRET=d3468a371fe331da07328a04a5cf3d22ba04c8cc97141a7c42a3d8b10c4cf5aa
JWT_REFRESH_SECRET=8871764f7864f3c5882b3e1cdd2d4eecd83718673c6720175da0c1bcbb76c7e4
ENCRYPTION_KEY=ca2744d18c3b2337c8a621b65a97567c
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=voter5093@gmail.com
EMAIL_PASS=iebadkhomygnxxnf
NODE_ENV=production
CLIENT_URL=https://your-vercel-app.vercel.app
```

**Note**: Update `CLIENT_URL` with your actual Vercel URL after deployment.

## Step 3: Test Deployment

1. Visit your Vercel URL (e.g., `https://secure-voting-123.vercel.app`)
2. Test API endpoints:
   - `https://your-app.vercel.app/api/health`
   - Registration and login
3. Test admin login:
   - Email: `admin@votingsystem.com`
   - Password: `admin123`

## Key Features of Vercel Setup

✅ **Full-Stack**: Frontend + Backend on same domain
✅ **Serverless**: Backend runs as Vercel Functions
✅ **Auto-scaling**: Handles traffic automatically
✅ **HTTPS**: Automatic SSL certificates
✅ **CDN**: Global content delivery
✅ **Git Integration**: Auto-deploy on push

## API Endpoints

All API endpoints available at:
- `https://your-app.vercel.app/api/auth/*`
- `https://your-app.vercel.app/api/elections/*`
- `https://your-app.vercel.app/api/votes/*`
- `https://your-app.vercel.app/api/admin/*`

## Vercel Configuration

Your `vercel.json` is configured for:
- **Frontend Build**: React app in `client/build`
- **Backend Functions**: Node.js server in `server/index.js`
- **Routing**: API routes to `/api/*`, static files served properly

## Troubleshooting

### Build Errors
- Check Vercel build logs in dashboard
- Ensure all dependencies are in package.json
- Verify build command works locally

### Function Timeout
- Vercel Functions have 10s timeout (Hobby) / 60s (Pro)
- Optimize database queries for faster response

### Environment Variables
- Add all variables in Vercel dashboard
- Redeploy after adding new variables

## Monitoring

### Vercel Analytics
- Enable in Project Settings → Analytics
- Monitor function performance and usage

### Function Logs
- View in Vercel Dashboard → Functions tab
- Real-time logs for debugging

## Your Live URLs

After deployment:
- **Main App**: `https://your-project-name.vercel.app`
- **Admin Panel**: `https://your-project-name.vercel.app/admin`
- **API Health**: `https://your-project-name.vercel.app/api/health`

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Add environment variables
3. ✅ Update CLIENT_URL with actual domain
4. ✅ Test all functionality
5. 🔄 Set up custom domain (optional)
6. 🔄 Configure monitoring

Your secure voting system is ready for Vercel deployment! 🎉