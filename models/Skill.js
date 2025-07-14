const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Skill category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  skills: [{
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true
    },
    level: {
      type: Number,
      required: [true, 'Skill level is required'],
      min: [0, 'Level cannot be less than 0'],
      max: [100, 'Level cannot exceed 100']
    },
    icon: {
      type: String,
      default: null
    }
  }],
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  additionalTechnologies: {
    type: [String],
    default: []
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
skillSchema.index({ category: 1, order: 1 });
skillSchema.index({ isActive: 1 });

module.exports = mongoose.model('Skill', skillSchema); 