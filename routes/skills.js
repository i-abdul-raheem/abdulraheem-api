const express = require('express');
const { body, validationResult } = require('express-validator');
const Skill = require('../models/Skill');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all skills
router.get('/', async (req, res) => {
  try {
    const { category, limit } = req.query;
    
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }

    let skillsQuery = Skill.find(query).sort({ order: 1, createdAt: -1 });

    if (limit) {
      skillsQuery = skillsQuery.limit(parseInt(limit));
    }

    const skills = await skillsQuery;
    const count = await Skill.countDocuments(query);

    res.json({
      success: true,
      data: skills,
      count
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// Get additional technologies (public)
router.get('/additional-technologies', async (req, res) => {
  try {
    // Get any skill category that has additionalTechnologies
    const skillWithAdditionalTech = await Skill.findOne({ 
      additionalTechnologies: { $exists: true } 
    });
    
    const additionalTechnologies = skillWithAdditionalTech?.additionalTechnologies || [];

    res.json({
      success: true,
      data: additionalTechnologies
    });
  } catch (error) {
    console.error('Error fetching additional technologies:', error);
    res.status(500).json({ error: 'Failed to fetch additional technologies' });
  }
});

// Update additional technologies (admin only)
router.put('/additional-technologies', adminAuth, [
  body('additionalTechnologies').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { additionalTechnologies } = req.body;

    // Find the first skill category or create one if none exists
    let skillCategory = await Skill.findOne();
    
    if (!skillCategory) {
      skillCategory = new Skill({
        category: 'General Skills',
        skills: [],
        additionalTechnologies: additionalTechnologies || []
      });
    } else {
      skillCategory.additionalTechnologies = additionalTechnologies || [];
    }

    await skillCategory.save();

    res.json({
      success: true,
      message: 'Additional technologies updated successfully',
      data: skillCategory.additionalTechnologies
    });
  } catch (error) {
    console.error('Error updating additional technologies:', error);
    res.status(500).json({ error: 'Failed to update additional technologies' });
  }
});

// Get single skill category
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      return res.status(404).json({ error: 'Skill category not found' });
    }

    res.json({
      success: true,
      data: skill
    });
  } catch (error) {
    console.error('Error fetching skill:', error);
    res.status(500).json({ error: 'Failed to fetch skill' });
  }
});

// Create new skill category (admin only)
router.post('/', adminAuth, [
  body('category').notEmpty().trim().isLength({ min: 2, max: 50 }),
  body('skills').isArray({ min: 1 }),
  body('skills.*.name').notEmpty().trim(),
  body('skills.*.level').isInt({ min: 0, max: 100 }),
  body('skills.*.icon').optional().trim(),
  body('order').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, skills, order = 0 } = req.body;

    const newSkill = new Skill({
      category,
      skills,
      order
    });

    const savedSkill = await newSkill.save();

    res.status(201).json({
      success: true,
      message: 'Skill category created successfully',
      data: savedSkill
    });
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json({ error: 'Failed to create skill category' });
  }
});

// Update skill category (admin only)
router.put('/:id', adminAuth, [
  body('category').optional().trim().isLength({ min: 2, max: 50 }),
  body('skills').optional().isArray({ min: 1 }),
  body('skills.*.name').optional().trim(),
  body('skills.*.level').optional().isInt({ min: 0, max: 100 }),
  body('skills.*.icon').optional().trim(),
  body('order').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updatedSkill = await Skill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedSkill) {
      return res.status(404).json({ error: 'Skill category not found' });
    }

    res.json({
      success: true,
      message: 'Skill category updated successfully',
      data: updatedSkill
    });
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ error: 'Failed to update skill category' });
  }
});

// Delete skill category (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const deletedSkill = await Skill.findByIdAndDelete(req.params.id);
    
    if (!deletedSkill) {
      return res.status(404).json({ error: 'Skill category not found' });
    }

    res.json({
      success: true,
      message: 'Skill category deleted successfully',
      data: deletedSkill
    });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ error: 'Failed to delete skill category' });
  }
});

module.exports = router; 