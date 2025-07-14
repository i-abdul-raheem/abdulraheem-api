const mongoose = require('mongoose');

const contactSettingsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
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
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  country: {
    type: String,
    trim: true,
    default: ''
  },
  contactTitle: {
    type: String,
    required: true,
    trim: true,
    default: 'Get In Touch'
  },
  contactSubtitle: {
    type: String,
    trim: true,
    default: "Let's work together"
  },
  contactDescription: {
    type: String,
    trim: true,
    default: "I'm always interested in hearing about new opportunities and exciting projects."
  },
  formEnabled: {
    type: Boolean,
    default: true
  },
  autoReplyEnabled: {
    type: Boolean,
    default: false
  },
  autoReplyMessage: {
    type: String,
    trim: true,
    default: "Thank you for your message! I'll get back to you soon."
  }
}, {
  timestamps: true
});

// Ensure only one contact settings document exists
contactSettingsSchema.index({}, { unique: true });

module.exports = mongoose.model('ContactSettings', contactSettingsSchema); 