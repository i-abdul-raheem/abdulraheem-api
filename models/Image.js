const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required'],
    trim: true
  },
  mimetype: {
    type: String,
    required: [true, 'MIME type is required'],
    trim: true
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [1, 'File size must be at least 1 byte']
  },
  data: {
    type: Buffer,
    required: [true, 'Image data is required']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
imageSchema.index({ uploadedBy: 1, createdAt: -1 });
imageSchema.index({ projectId: 1 });
imageSchema.index({ isActive: 1 });

// Virtual for image URL
imageSchema.virtual('url').get(function() {
  return `/api/images/${this._id}`;
});

// Method to get image as base64
imageSchema.methods.toBase64 = function() {
  return `data:${this.mimetype};base64,${this.data.toString('base64')}`;
};

module.exports = mongoose.model('Image', imageSchema); 