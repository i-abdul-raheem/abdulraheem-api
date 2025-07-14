const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('../config/database');
const { errorHandler, notFound } = require('../middleware/errorHandler');
require('dotenv').config();

const app = express();

// Global error handlers for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  console.error('Stack trace:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
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
app.use('/', limiter);

// CORS configuration
app.use(cors({
  origin: '*',
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
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Portfolio API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid
  });
});

// API Routes - mounted without /api prefix since Vercel handles that
app.use('/auth', require('../routes/auth'));
app.use('/projects', require('../routes/projects'));
app.use('/skills', require('../routes/skills'));
app.use('/contact', require('../routes/contact'));
app.use('/about', require('../routes/about'));
app.use('/footer', require('../routes/footer'));
app.use('/dashboard', require('../routes/dashboard'));
app.use('/images', require('../routes/images'));
app.use('/resume', require('../routes/resume'));
app.use('/analytics', require('../routes/analytics'));

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
  }
};

// Initialize database connection
connectToDatabase();

module.exports = app;