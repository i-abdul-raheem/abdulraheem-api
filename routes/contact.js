const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const ContactSettings = require('../models/ContactSettings');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Submit contact form
router.post('/', [
  body('firstName').notEmpty().trim().isLength({ min: 2, max: 50 }),
  body('lastName').notEmpty().trim().isLength({ min: 2, max: 50 }),
  body('email').isEmail().normalizeEmail(),
  body('subject').notEmpty().trim().isLength({ min: 5, max: 100 }),
  body('message').notEmpty().trim().isLength({ min: 10, max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, subject, message } = req.body;

    const newContact = new Contact({
      firstName,
      lastName,
      email,
      subject,
      message,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    const savedContact = await newContact.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! I\'ll get back to you soon.',
      data: {
        id: savedContact._id,
        firstName: savedContact.firstName,
        lastName: savedContact.lastName,
        email: savedContact.email,
        subject: savedContact.subject,
        createdAt: savedContact.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET contact settings (public - no auth required)
router.get('/settings', async (req, res) => {
  try {
    let settings = await ContactSettings.findOne();
    
    if (!settings) {
      // Create default settings if none exists
      settings = new ContactSettings({
        email: 'your.email@example.com',
        contactTitle: 'Get In Touch',
        contactSubtitle: "Let's work together",
        contactDescription: "I'm always interested in hearing about new opportunities and exciting projects.",
        formEnabled: true,
        autoReplyEnabled: false,
        autoReplyMessage: "Thank you for your message! I'll get back to you soon."
      });
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching contact settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact settings'
    });
  }
});

// PUT update contact settings (admin only)
router.put('/settings', adminAuth, async (req, res) => {
  try {
    const {
      email,
      phone,
      address,
      city,
      country,
      contactTitle,
      contactSubtitle,
      contactDescription,
      formEnabled,
      autoReplyEnabled,
      autoReplyMessage
    } = req.body;

    // Validate required fields
    if (!email || !contactTitle) {
      return res.status(400).json({
        success: false,
        error: 'Email and contact title are required'
      });
    }

    let settings = await ContactSettings.findOne();
    
    if (settings) {
      // Update existing settings
      settings.email = email;
      settings.phone = phone || '';
      settings.address = address || '';
      settings.city = city || '';
      settings.country = country || '';
      settings.contactTitle = contactTitle;
      settings.contactSubtitle = contactSubtitle || '';
      settings.contactDescription = contactDescription || '';
      settings.formEnabled = formEnabled !== undefined ? formEnabled : true;
      settings.autoReplyEnabled = autoReplyEnabled !== undefined ? autoReplyEnabled : false;
      settings.autoReplyMessage = autoReplyMessage || '';
      
      await settings.save();
    } else {
      // Create new settings
      settings = new ContactSettings({
        email,
        phone: phone || '',
        address: address || '',
        city: city || '',
        country: country || '',
        contactTitle,
        contactSubtitle: contactSubtitle || '',
        contactDescription: contactDescription || '',
        formEnabled: formEnabled !== undefined ? formEnabled : true,
        autoReplyEnabled: autoReplyEnabled !== undefined ? autoReplyEnabled : false,
        autoReplyMessage: autoReplyMessage || ''
      });
      
      await settings.save();
    }

    res.json({
      success: true,
      data: settings,
      message: 'Contact settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating contact settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update contact settings'
    });
  }
});

// Get all contact messages (admin only)
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contact messages' });
  }
});

// Get single contact message (admin only)
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact message' });
  }
});

// Update contact message status (admin only)
router.patch('/:id/status', [
  body('status').isIn(['unread', 'read', 'replied', 'archived']),
  body('replyMessage').optional().trim().isLength({ min: 1, max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, replyMessage } = req.body;
    
    const updateData = { status };
    
    if (status === 'replied' && replyMessage) {
      updateData.replyMessage = replyMessage;
      updateData.repliedAt = new Date();
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedContact) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    res.json({
      success: true,
      message: 'Contact message status updated successfully',
      data: updatedContact
    });
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({ error: 'Failed to update contact message status' });
  }
});

// Delete contact message (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!deletedContact) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    res.json({
      success: true,
      message: 'Contact message deleted successfully',
      data: deletedContact
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact message' });
  }
});

module.exports = router; 