const express = require('express');
const multer = require('multer');
const router = express.Router();
const Resume = require('../models/Resume');
const { adminAuth } = require('../middleware/auth');

// Configure multer for memory storage (Vercel compatible)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Upload resume (Admin only)
router.post('/upload', adminAuth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'resume-' + uniqueSuffix + '.pdf';

    // Create new resume record
    const resume = new Resume({
      filename: filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      fileData: req.file.buffer, // Store file data in database
      isActive: false // New resumes are inactive by default
    });

    await resume.save();

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        id: resume._id,
        filename: resume.filename,
        originalName: resume.originalName,
        size: resume.size,
        isActive: resume.isActive,
        uploadDate: resume.uploadDate
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading resume' });
  }
});

// Get all resumes (Admin only)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: resumes.map(resume => ({
        id: resume._id,
        originalName: resume.originalName,
        size: resume.size,
        isActive: resume.isActive,
        uploadDate: resume.uploadDate
      }))
    });
  } catch (error) {
    console.error('Get all resumes error:', error);
    res.status(500).json({ success: false, message: 'Error fetching resumes' });
  }
});

// Get current active resume info (Public)
router.get('/info', async (req, res) => {
  try {
    const resume = await Resume.findOne({ isActive: true });
    
    if (!resume) {
      return res.json({
        success: true,
        data: null,
        message: 'No active resume available'
      });
    }

    res.json({
      success: true,
      data: {
        id: resume._id,
        originalName: resume.originalName,
        size: resume.size,
        uploadDate: resume.uploadDate
      }
    });
  } catch (error) {
    console.error('Get resume info error:', error);
    res.status(500).json({ success: false, message: 'Error fetching resume info' });
  }
});

// Set resume as active (Admin only)
router.put('/activate/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Deactivate all resumes first
    await Resume.updateMany({}, { isActive: false });
    
    // Activate the selected resume
    const resume = await Resume.findByIdAndUpdate(
      id, 
      { isActive: true }, 
      { new: true }
    );
    
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    res.json({
      success: true,
      message: 'Resume activated successfully',
      data: {
        id: resume._id,
        originalName: resume.originalName,
        isActive: resume.isActive
      }
    });
  } catch (error) {
    console.error('Activate resume error:', error);
    res.status(500).json({ success: false, message: 'Error activating resume' });
  }
});

// Download specific resume (Public)
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findById(id);
    
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    res.setHeader('Content-Type', resume.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${resume.originalName}"`);
    
    // Send file data directly from database
    res.send(resume.fileData);
  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({ success: false, message: 'Error downloading resume' });
  }
});

// Download current active resume (Public)
router.get('/download', async (req, res) => {
  try {
    const resume = await Resume.findOne({ isActive: true });
    
    if (!resume) {
      return res.status(404).json({ success: false, message: 'No active resume found' });
    }

    res.setHeader('Content-Type', resume.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${resume.originalName}"`);
    
    // Send file data directly from database
    res.send(resume.fileData);
  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({ success: false, message: 'Error downloading resume' });
  }
});

// Delete resume (Admin only)
router.delete('/delete/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findById(id);
    
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Don't allow deletion of active resume
    if (resume.isActive) {
      return res.status(400).json({ success: false, message: 'Cannot delete active resume. Please activate another resume first.' });
    }

    // Delete from database (file data is stored in database)
    await Resume.findByIdAndDelete(id);

    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ success: false, message: 'Error deleting resume' });
  }
});

module.exports = router; 