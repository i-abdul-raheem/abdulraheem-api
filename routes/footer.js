const express = require('express');
const router = express.Router();
const Footer = require('../models/Footer');
const { adminAuth } = require('../middleware/auth');

// GET footer information (public)
router.get('/', async (req, res) => {
  try {
    let footer = await Footer.findOne();
    
    if (!footer) {
      // Create default footer data if none exists
      footer = new Footer({
        copyright: '© 2025 Your Name. All rights reserved.',
        tagline: 'Building amazing digital experiences',
        description: 'Passionate developer creating innovative solutions for the web.',
        socialLinks: [],
        quickLinks: [],
        contactInfo: {
          email: '',
          phone: '',
          address: ''
        }
      });
      await footer.save();
    }

    res.json({
      success: true,
      data: footer
    });
  } catch (error) {
    console.error('Error fetching footer data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch footer data'
    });
  }
});

// PUT update footer information (admin only)
router.put('/', adminAuth, async (req, res) => {
  try {
    const {
      copyright,
      tagline,
      description,
      socialLinks,
      quickLinks,
      contactInfo
    } = req.body;

    // Validate required fields
    if (!copyright) {
      return res.status(400).json({
        success: false,
        error: 'Copyright text is required'
      });
    }

    let footer = await Footer.findOne();
    
    if (footer) {
      // Update existing footer data
      footer.copyright = copyright;
      footer.tagline = tagline || '';
      footer.description = description || '';
      footer.socialLinks = socialLinks || [];
      footer.quickLinks = quickLinks || [];
      footer.contactInfo = contactInfo || {
        email: '',
        phone: '',
        address: ''
      };
      
      await footer.save();
    } else {
      // Create new footer data
      footer = new Footer({
        copyright,
        tagline: tagline || '',
        description: description || '',
        socialLinks: socialLinks || [],
        quickLinks: quickLinks || [],
        contactInfo: contactInfo || {
          email: '',
          phone: '',
          address: ''
        }
      });
      
      await footer.save();
    }

    res.json({
      success: true,
      data: footer,
      message: 'Footer information updated successfully'
    });
  } catch (error) {
    console.error('Error updating footer data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update footer data'
    });
  }
});

module.exports = router; 