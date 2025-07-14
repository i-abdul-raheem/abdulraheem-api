# Production Environment Setup

This guide helps you set up the backend for production deployment.

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

### Required Variables

```bash
# Server Configuration
PORT=5001
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=7d

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio_db

# Admin Credentials (for initial setup - change after first login)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### Security Best Practices

1. **JWT_SECRET**: 
   - Use a strong, random string (at least 32 characters)
   - Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Never commit to version control

2. **MONGODB_URI**:
   - Use MongoDB Atlas for production
   - Enable network access restrictions
   - Use strong authentication
   - Enable encryption at rest

3. **Admin Credentials**:
   - Change default admin credentials after first login
   - Use strong passwords
   - Consider using environment-specific admin accounts

## Production Checklist

### Before Deployment

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong JWT_SECRET
- [ ] Configure MongoDB Atlas with proper security
- [ ] Update admin credentials
- [ ] Test all endpoints
- [ ] Verify CORS settings for production domains
- [ ] Set up monitoring and logging

### Security Measures

- [ ] Helmet.js security headers (already configured)
- [ ] Rate limiting (already configured)
- [ ] Input validation (already configured)
- [ ] CORS restrictions (update with production domains)
- [ ] JWT token expiration
- [ ] MongoDB connection security

### Performance Optimization

- [ ] Database indexing
- [ ] Connection pooling
- [ ] File size limits
- [ ] Response compression
- [ ] Caching strategies

## Deployment Platforms

### Vercel (Recommended)

1. Follow the `DEPLOYMENT.md` guide
2. Set environment variables in Vercel dashboard
3. Deploy using `vercel --prod`

### Other Platforms

For other platforms (Heroku, Railway, etc.), ensure:
- Environment variables are properly set
- MongoDB connection string is accessible
- Port configuration is correct
- Build process includes all dependencies

## Monitoring

### Health Checks

Monitor the health endpoint: `GET /api/health`

### Logs

- Application logs
- Error tracking
- Performance monitoring
- Database query monitoring

### Alerts

Set up alerts for:
- Server errors
- Database connection issues
- High response times
- Failed authentication attempts

## Backup Strategy

### Database

- MongoDB Atlas automated backups
- Regular manual backups
- Test restore procedures

### Application

- Version control (Git)
- Environment configuration backup
- Documentation backup

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB URI
   - Verify network access
   - Check authentication

2. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Validate token format

3. **CORS Errors**
   - Update CORS origins
   - Check request headers
   - Verify domain configuration

### Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test endpoints individually
4. Review security configuration 