# Deployment Guide

## Prerequisites
- Node.js 16+ and npm
- MongoDB database (local or MongoDB Atlas)
- Email service (Gmail, SendGrid, etc.)

## Environment Setup

### Backend (.env)
Create `server/.env` with:
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voting_system
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_minimum_32_characters
ENCRYPTION_KEY=your_32_character_encryption_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=https://your-frontend-domain.com
NODE_ENV=production
```

### Frontend
Update `client/package.json` proxy or create `.env`:
```
REACT_APP_API_URL=https://your-backend-domain.com
```

## Local Development

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```

## Production Deployment

### Option 1: Render + MongoDB Atlas

#### Backend (Render Web Service)
1. Connect your GitHub repository
2. Set build command: `cd server && npm install`
3. Set start command: `cd server && npm start`
4. Add environment variables from above
5. Deploy

#### Frontend (Vercel/Netlify)
1. Connect repository
2. Set build command: `cd client && npm run build`
3. Set publish directory: `client/build`
4. Add environment variables
5. Deploy

### Option 2: Railway

#### Full Stack Deployment
1. Connect GitHub repository
2. Railway will auto-detect and deploy both services
3. Add environment variables
4. Configure custom domains

### Option 3: Docker

#### Dockerfile (Backend)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install --production
COPY server/ .
EXPOSE 5000
CMD ["npm", "start"]
```

#### Dockerfile (Frontend)
```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Database Setup

### MongoDB Atlas
1. Create cluster at mongodb.com
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for development)
4. Get connection string
5. Update MONGODB_URI in environment variables

### Local MongoDB
```bash
# Install MongoDB
# Start MongoDB service
mongod

# Create database
mongo
use voting_system
```

## Email Configuration

### Gmail Setup
1. Enable 2-factor authentication
2. Generate app password
3. Use app password in EMAIL_PASS

### SendGrid (Alternative)
```javascript
// Replace nodemailer config in server/utils/email.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
```

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong, unique JWT secrets
- [ ] Configure CORS for your domain only
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for all secrets
- [ ] Set up monitoring and logging
- [ ] Regular backups of database
- [ ] Keep dependencies updated

## Monitoring

### Health Check Endpoint
```
GET /api/health
```

### Logs to Monitor
- Authentication attempts
- Vote casting events
- Error rates
- Database connection status

## Scaling Considerations

1. **Database**: Use MongoDB replica sets for high availability
2. **Backend**: Deploy multiple instances behind load balancer
3. **Frontend**: Use CDN for static assets
4. **Caching**: Implement Redis for session management
5. **Rate Limiting**: Adjust limits based on user base

## Backup Strategy

1. **Database**: Daily automated backups
2. **Code**: Version control with Git
3. **Environment**: Document all configuration
4. **Recovery**: Test restore procedures regularly