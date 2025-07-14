const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  github: {
    type: String,
    trim: true,
    default: ''
  },
  linkedin: {
    type: String,
    trim: true,
    default: ''
  },
  twitter: {
    type: String,
    trim: true,
    default: ''
  },
  website: {
    type: String,
    trim: true,
    default: ''
  },
  avatar: {
    type: String,
    trim: true,
    default: ''
  },
  aboutText: {
    type: String,
    required: true,
    trim: true
  },
  aboutSectionTitle: {
    type: String,
    trim: true,
    default: 'Full-Stack Software Engineer'
  },
  aboutHighlights: {
    type: [String],
    default: [
      'Full-Stack Expertise: Proficient in both frontend and backend development',
      'Modern Technologies: Experience with React, Node.js, TypeScript, and cloud platforms',
      'Problem Solving: Strong analytical skills and creative approach to technical challenges',
      'Team Collaboration: Excellent communication and collaboration skills'
    ]
  },
  experience: {
    type: String,
    trim: true,
    default: ''
  },
  education: {
    type: String,
    trim: true,
    default: ''
  },
  technologyTags: {
    type: [String],
    default: ['React', 'Node.js', 'TypeScript', 'Next.js', 'Express.js']
  },

  projectsCompleted: {
    type: String,
    trim: true,
    default: '25+'
  },
  yearsExperience: {
    type: String,
    trim: true,
    default: '5+'
  },
  technologies: {
    type: String,
    trim: true,
    default: '15+'
  },
  certifications: {
    type: String,
    trim: true,
    default: '8'
  }
}, {
  timestamps: true
});

// Ensure only one about document exists
aboutSchema.index({}, { unique: true });

module.exports = mongoose.model('About', aboutSchema); 