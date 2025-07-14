# Backend Deployment Guide for Vercel

This guide will help you deploy the portfolio backend API to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Database**: Set up a MongoDB database (MongoDB Atlas recommended)
3. **Environment Variables**: Prepare your environment variables

## Environment Variables

Set these environment variables in your Vercel project settings:

### Required Variables
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio_db
JWT_SECRET=your-super-secret-jwt-key-here
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=your-admin-password
```

### Optional Variables
```
NODE_ENV=production
PORT=5001
```

### Email Configuration (if using contact form)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Deployment Steps

### 1. Connect to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Navigate to backend directory: `cd backend`

### 2. Deploy

```bash
# Deploy to Vercel
vercel

# Follow the prompts:
# - Set up and deploy: Yes
# - Which scope: Select your account
# - Link to existing project: No
# - Project name: portfolio-backend (or your preferred name)
# - Directory: ./ (current directory)
```

### 3. Set Environment Variables

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all the environment variables listed above

### 4. Redeploy

After setting environment variables, redeploy:

```bash
vercel --prod
```

## Configuration Files

### vercel.json
The `vercel.json` file is already configured for:
- API routes routing
- Node.js build settings
- Function timeout (30 seconds)
- Production environment

### CORS Configuration
Update the CORS origins in `server.js` with your actual frontend and dashboard domains:

```javascript
origin: [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:3002',
  'https://your-frontend-domain.vercel.app',
  'https://your-dashboard-domain.vercel.app'
]
```

## Database Setup

### MongoDB Atlas (Recommended)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Get your connection string
5. Add it to Vercel environment variables

### Local MongoDB (Development)

For local development, you can use:
```
MONGODB_URI=mongodb://localhost:27017/portfolio_db
```

## File Uploads

The backend now stores files in the database instead of the filesystem, making it compatible with Vercel's serverless environment:

- **Resumes**: Stored as Buffer in MongoDB
- **Images**: Stored as Buffer in MongoDB
- **No file system dependencies**

## API Endpoints

Your API will be available at:
```
https://your-project-name.vercel.app/api/
```

### Health Check
```
GET https://your-project-name.vercel.app/api/health
```

### Available Routes
- `/api/auth` - Authentication
- `/api/projects` - Projects management
- `/api/skills` - Skills management
- `/api/contact` - Contact form
- `/api/about` - About section
- `/api/footer` - Footer content
- `/api/dashboard` - Dashboard data
- `/api/images` - Image management
- `/api/resume` - Resume management
- `/api/analytics` - Analytics

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB URI in environment variables
   - Ensure MongoDB Atlas IP whitelist includes Vercel IPs

2. **CORS Errors**
   - Update CORS origins in server.js with your actual domains
   - Ensure frontend is making requests to the correct API URL

3. **Function Timeout**
   - Large file uploads may timeout
   - Consider reducing file size limits or optimizing uploads

4. **Environment Variables Not Working**
   - Redeploy after setting environment variables
   - Check variable names match exactly

### Logs

View deployment logs in Vercel dashboard:
1. Go to your project
2. Click on latest deployment
3. Check Function Logs for errors

## Performance Optimization

1. **Database Indexing**: Ensure MongoDB collections have proper indexes
2. **File Size Limits**: Keep uploads under 5MB
3. **Connection Pooling**: MongoDB connection is optimized for serverless
4. **Caching**: Consider implementing Redis for caching (separate service)

## Security

1. **JWT Secret**: Use a strong, unique JWT secret
2. **MongoDB Security**: Enable MongoDB Atlas security features
3. **Rate Limiting**: Already configured (100 requests per 15 minutes)
4. **CORS**: Only allow trusted domains
5. **Helmet**: Security headers are enabled

## Monitoring

1. **Vercel Analytics**: Monitor API usage and performance
2. **MongoDB Atlas**: Monitor database performance
3. **Error Tracking**: Consider adding error tracking service

## Support

For issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints with Postman or similar tool
4. Check MongoDB connection and data 