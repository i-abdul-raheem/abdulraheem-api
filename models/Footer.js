const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    trim: true,
    default: ''
  }
});

const quickLinkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  }
});

const contactInfoSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  }
});

const footerSchema = new mongoose.Schema({
  copyright: {
    type: String,
    required: true,
    trim: true,
    default: '© 2025 Your Name. All rights reserved.'
  },
  tagline: {
    type: String,
    trim: true,
    default: 'Building amazing digital experiences'
  },
  description: {
    type: String,
    trim: true,
    default: 'Passionate developer creating innovative solutions for the web.'
  },
  socialLinks: [socialLinkSchema],
  quickLinks: [quickLinkSchema],
  contactInfo: {
    type: contactInfoSchema,
    default: () => ({})
  }
}, {
  timestamps: true
});

// Ensure only one footer document exists
footerSchema.index({}, { unique: true });

module.exports = mongoose.model('Footer', footerSchema); 