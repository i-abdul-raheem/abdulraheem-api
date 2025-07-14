const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Global error handlers for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  console.error('Stack trace:', error.stack);
  // Don't exit the process, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://abdulraheem.vercel.app',
    'https://abdulraheem-dashboard.vercel.app'
  ],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Portfolio API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid
  });
});

// API Routes with error handling
const loadRoutes = () => {
  const routes = [
    { path: '/api/auth', module: './routes/auth' },
    { path: '/api/projects', module: './routes/projects' },
    { path: '/api/skills', module: './routes/skills' },
    { path: '/api/contact', module: './routes/contact' },
    { path: '/api/about', module: './routes/about' },
    { path: '/api/footer', module: './routes/footer' },
    { path: '/api/dashboard', module: './routes/dashboard' },
    { path: '/api/images', module: './routes/images' },
    { path: '/api/resume', module: './routes/resume' },
    { path: '/api/analytics', module: './routes/analytics' }
  ];

  routes.forEach(route => {
    try {
      app.use(route.path, require(route.module));
      console.log(`✅ Route loaded: ${route.path}`);
    } catch (error) {
      console.error(`❌ Error loading route ${route.path}:`, error.message);
      // Continue without the failing route
    }
  });
};

loadRoutes();

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB (for serverless compatibility)
const connectToDatabase = async () => {
  try {
    await connectDB();
    console.log('📦 MongoDB Connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Don't throw error, let the app continue without database
  }
};

// Initialize database connection
connectToDatabase();

// For local development, start the server
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
  });
}

module.exports = app; 