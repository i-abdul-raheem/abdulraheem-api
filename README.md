# Portfolio Backend API

A robust Node.js/Express.js backend API for portfolio management with MongoDB integration.

## Features

- 🔐 **JWT Authentication** with secure password hashing
- 📊 **MongoDB Integration** with Mongoose ODM
- 🛡️ **Security Middleware** (Helmet, CORS, Rate Limiting)
- 📝 **Input Validation** with express-validator
- 📈 **Dashboard Analytics** with real-time statistics
- 🔒 **Account Lockout** protection against brute force attacks
- 📧 **Contact Form** handling with spam protection
- 🎯 **Skills Management** with categorization
- 📁 **Project Management** with status tracking

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio_dev/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5001
   NODE_ENV=development
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/portfolio_db
   # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/portfolio_db
   
   # Admin Configuration
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=admin123
   
   # Email Configuration (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Database Schema

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String,
  lastName: String,
  role: String (enum: ['admin', 'user']),
  isActive: Boolean,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date
}
```

### Project Model
```javascript
{
  title: String (required),
  description: String (required),
  technologies: [String] (required),
  github: String (URL),
  live: String (URL),
  featured: Boolean,
  image: String,
  order: Number,
  status: String (enum: ['active', 'inactive', 'archived'])
}
```

### Skill Model
```javascript
{
  category: String (required),
  skills: [{
    name: String (required),
    level: Number (0-100, required),
    icon: String
  }],
  order: Number,
  isActive: Boolean
}
```

### Contact Model
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, validated),
  subject: String (required),
  message: String (required),
  status: String (enum: ['unread', 'read', 'replied', 'archived']),
  ipAddress: String,
  userAgent: String,
  repliedAt: Date,
  replyMessage: String
}
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (admin only)
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project (admin only)
- `PUT /api/projects/:id` - Update project (admin only)
- `DELETE /api/projects/:id` - Delete project (admin only)

### Skills
- `GET /api/skills` - Get all skills
- `GET /api/skills/:id` - Get single skill category
- `POST /api/skills` - Create new skill category (admin only)
- `PUT /api/skills/:id` - Update skill category (admin only)
- `DELETE /api/skills/:id` - Delete skill category (admin only)

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contact messages (admin only)
- `GET /api/contact/:id` - Get single contact message (admin only)
- `PATCH /api/contact/:id/status` - Update message status (admin only)
- `DELETE /api/contact/:id` - Delete message (admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-activity` - Get recent activity
- `GET /api/dashboard/health` - System health check

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers
- **Account Lockout**: Temporary lockout after failed attempts

## Error Handling

The API uses consistent error responses:

```javascript
{
  "error": "Error message",
  "errors": [] // Validation errors
}
```

Success responses:

```javascript
{
  "success": true,
  "message": "Success message",
  "data": {} // Response data
}
```

## Development

### Running Tests
```bash
npm test
```

### Database Seeding
```bash
npm run seed
```

### Environment Variables
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5001)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: JWT expiration time
- `ADMIN_EMAIL`: Default admin email
- `ADMIN_PASSWORD`: Default admin password

## Production Deployment

1. **Set environment variables**
   ```bash
   NODE_ENV=production
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-production-jwt-secret
   ```

2. **Install production dependencies**
   ```bash
   npm ci --only=production
   ```

3. **Start the server**
   ```bash
   npm start
   ```

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio_db
   ```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **JWT Token Issues**
   - Check `JWT_SECRET` is set
   - Verify token expiration time

3. **Port Already in Use**
   - Change `PORT` in `.env`
   - Kill existing process on port 5001

### Logs

The server logs important events:
- Database connections
- Authentication attempts
- API requests (with Morgan)
- Error details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 