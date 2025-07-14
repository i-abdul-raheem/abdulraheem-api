const mongoose = require('mongoose');

const portfolioViewSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  referrer: {
    type: String,
    default: ''
  },
  page: {
    type: String,
    default: 'home'
  },
  sessionId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isUnique: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for efficient queries
portfolioViewSchema.index({ timestamp: -1 });
portfolioViewSchema.index({ sessionId: 1 });
portfolioViewSchema.index({ ipAddress: 1, timestamp: -1 });

module.exports = mongoose.model('PortfolioView', portfolioViewSchema); 