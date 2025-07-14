const mongoose = require('mongoose');

const projectsSettingsSchema = new mongoose.Schema({
  projectsTitle: {
    type: String,
    required: true,
    trim: true,
    default: 'Featured Projects'
  },
  projectsSubtitle: {
    type: String,
    required: true,
    trim: true,
    default: 'A showcase of my recent work, demonstrating my skills in full-stack development and problem-solving.'
  },
  viewAllButtonText: {
    type: String,
    trim: true,
    default: 'View All Projects'
  },
  viewAllButtonUrl: {
    type: String,
    trim: true,
    default: '/projects'
  },
  showViewAllButton: {
    type: Boolean,
    default: true
  },
  maxFeaturedProjects: {
    type: Number,
    default: 6,
    min: 1,
    max: 12
  }
}, {
  timestamps: true
});

// Ensure only one projects settings document exists
projectsSettingsSchema.index({}, { unique: true });

module.exports = mongoose.model('ProjectsSettings', projectsSettingsSchema); 