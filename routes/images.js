const express = require('express');
const { adminAuth } = require('../middleware/auth');
const { uploadImage, handleUploadError } = require('../middleware/upload');
const Image = require('../models/Image');
const Project = require('../models/Project');
const router = express.Router();

// Upload image (admin only)
router.post('/upload', adminAuth, uploadImage, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `img_${timestamp}_${req.file.originalname}`;

    // Create new image document
    const newImage = new Image({
      filename: filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer,
      uploadedBy: req.user._id
    });

    const savedImage = await newImage.save();

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        id: savedImage._id,
        filename: savedImage.filename,
        originalName: savedImage.originalName,
        size: savedImage.size,
        url: savedImage.url,
        uploadedAt: savedImage.createdAt
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Serve image by ID
router.get('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    if (!image.isActive) {
      return res.status(404).json({ error: 'Image not available' });
    }

    // Set appropriate headers
    res.set({
      'Content-Type': image.mimetype,
      'Content-Length': image.size,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'ETag': `"${image._id}"`
    });

    res.send(image.data);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

// Get all images for admin (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, projectId } = req.query;
    
    let query = { isActive: true };
    
    if (projectId) {
      query.projectId = projectId;
    }

    const images = await Image.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-data'); // Don't include binary data in list

    const count = await Image.countDocuments(query);

    res.json({
      success: true,
      data: images,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalImages: count,
        hasNext: page * limit < count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Delete image (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Check if image is associated with any project
    const projectUsingImage = await Project.findOne({ image: image.url });
    if (projectUsingImage) {
      return res.status(400).json({ 
        error: 'Cannot delete image. It is currently being used by a project.' 
      });
    }

    // Soft delete by setting isActive to false
    image.isActive = false;
    await image.save();

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Update image metadata (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { filename, projectId } = req.body;
    
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    if (filename) {
      image.filename = filename;
    }
    
    if (projectId !== undefined) {
      image.projectId = projectId || null;
    }

    await image.save();

    res.json({
      success: true,
      message: 'Image updated successfully',
      data: {
        id: image._id,
        filename: image.filename,
        originalName: image.originalName,
        size: image.size,
        url: image.url,
        projectId: image.projectId,
        updatedAt: image.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

module.exports = router; 