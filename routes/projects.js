const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const ProjectsSettings = require('../models/ProjectsSettings');
const Image = require('../models/Image');
const { adminAuth } = require('../middleware/auth');
const { uploadImage, handleUploadError } = require('../middleware/upload');
const router = express.Router();

// Get projects settings (public)
router.get('/settings', async (req, res) => {
  try {
    let settings = await ProjectsSettings.findOne();
    
    if (!settings) {
      // Create default settings if none exists
      settings = new ProjectsSettings({
        projectsTitle: 'Featured Projects',
        projectsSubtitle: 'A showcase of my recent work, demonstrating my skills in full-stack development and problem-solving.',
        viewAllButtonText: 'View All Projects',
        viewAllButtonUrl: '/projects',
        showViewAllButton: true,
        maxFeaturedProjects: 6
      });
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching projects settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects settings'
    });
  }
});

// Update projects settings (admin only)
router.put('/settings', adminAuth, async (req, res) => {
  try {
    const {
      projectsTitle,
      projectsSubtitle,
      viewAllButtonText,
      viewAllButtonUrl,
      showViewAllButton,
      maxFeaturedProjects
    } = req.body;

    // Validate required fields
    if (!projectsTitle || !projectsSubtitle) {
      return res.status(400).json({
        success: false,
        error: 'Projects title and subtitle are required'
      });
    }

    let settings = await ProjectsSettings.findOne();
    
    if (settings) {
      // Update existing settings
      settings.projectsTitle = projectsTitle;
      settings.projectsSubtitle = projectsSubtitle;
      settings.viewAllButtonText = viewAllButtonText || 'View All Projects';
      settings.viewAllButtonUrl = viewAllButtonUrl || '/projects';
      settings.showViewAllButton = showViewAllButton !== undefined ? showViewAllButton : true;
      settings.maxFeaturedProjects = maxFeaturedProjects || 6;
      
      await settings.save();
    } else {
      // Create new settings
      settings = new ProjectsSettings({
        projectsTitle,
        projectsSubtitle,
        viewAllButtonText: viewAllButtonText || 'View All Projects',
        viewAllButtonUrl: viewAllButtonUrl || '/projects',
        showViewAllButton: showViewAllButton !== undefined ? showViewAllButton : true,
        maxFeaturedProjects: maxFeaturedProjects || 6
      });
      
      await settings.save();
    }

    res.json({
      success: true,
      data: settings,
      message: 'Projects settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating projects settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update projects settings'
    });
  }
});

// Get all projects
router.get('/', async (req, res) => {
  try {
    const { featured, limit, status = 'active' } = req.query;
    
    let query = {};
    if (status !== 'all') {
      query.status = status;
    }
    if (featured === 'true') {
      query.featured = true;
    }

    let projectsQuery = Project.find(query).sort({ order: 1, createdAt: -1 });

    if (limit) {
      projectsQuery = projectsQuery.limit(parseInt(limit));
    }

    const projects = await projectsQuery;
    const count = await Project.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      count
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project (admin only)
router.post('/', adminAuth, [
  body('title').notEmpty().trim().isLength({ min: 3, max: 100 }),
  body('description').notEmpty().trim().isLength({ min: 10, max: 500 }),
  body('technologies').isArray({ min: 1 }),
  body('github').optional().custom((value) => {
    if (value && value.trim() !== '') {
      const urlRegex = /^https?:\/\/.*/;
      if (!urlRegex.test(value)) {
        throw new Error('GitHub URL must be a valid URL');
      }
    }
    return true;
  }),
  body('live').optional().custom((value) => {
    if (value && value.trim() !== '') {
      const urlRegex = /^https?:\/\/.*/;
      if (!urlRegex.test(value)) {
        throw new Error('Live URL must be a valid URL');
      }
    }
    return true;
  }),
  body('image').optional().isURL(),
  body('featured').optional().isBoolean(),
  body('order').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, technologies, github, live, image, featured = false, order = 0 } = req.body;

    const newProject = new Project({
      title,
      description,
      technologies,
      github: github || '',
      live: live || '',
      image: image || '',
      featured,
      order
    });

    const savedProject = await newProject.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: savedProject
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project (admin only)
router.put('/:id', adminAuth, [
  body('title').optional().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ min: 10, max: 500 }),
  body('technologies').optional().isArray({ min: 1 }),
  body('github').optional().custom((value) => {
    if (value && value.trim() !== '') {
      const urlRegex = /^https?:\/\/.*/;
      if (!urlRegex.test(value)) {
        throw new Error('GitHub URL must be a valid URL');
      }
    }
    return true;
  }),
  body('live').optional().custom((value) => {
    if (value && value.trim() !== '') {
      const urlRegex = /^https?:\/\/.*/;
      if (!urlRegex.test(value)) {
        throw new Error('Live URL must be a valid URL');
      }
    }
    return true;
  }),
  body('image').optional().isURL(),
  body('featured').optional().isBoolean(),
  body('order').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['active', 'inactive', 'archived'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Upload project image (admin only)
router.post('/:id/image', adminAuth, uploadImage, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `project_${req.params.id}_${timestamp}_${req.file.originalname}`;

    // Create new image document
    const newImage = new Image({
      filename: filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer,
      uploadedBy: req.user._id,
      projectId: req.params.id
    });

    const savedImage = await newImage.save();

    // Update project with new image URL
    project.image = savedImage.url;
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Project image uploaded successfully',
      data: {
        id: savedImage._id,
        filename: savedImage.filename,
        originalName: savedImage.originalName,
        size: savedImage.size,
        url: savedImage.url,
        projectId: savedImage.projectId,
        uploadedAt: savedImage.createdAt
      }
    });
  } catch (error) {
    console.error('Error uploading project image:', error);
    res.status(500).json({ error: 'Failed to upload project image' });
  }
});

// Delete project (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    
    if (!deletedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully',
      data: deletedProject
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router; 