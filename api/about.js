const express = require('express');
const cors = require('cors');
const About = require('../models/About');

const app = express();

// CORS configuration
app.use(cors({
  origin: '*',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Get about info
app.get('/', async (req, res) => {
  try {
    let aboutData = await About.findOne();
    
    if (!aboutData) {
      // Create default about data if none exists
      aboutData = new About({
        aboutText: 'I am a passionate full-stack developer with expertise in modern web technologies. I love building scalable applications and solving complex problems.',
        aboutSectionTitle: 'About Me',
        aboutHighlights: [
          'Full-Stack Expertise: Proficient in both frontend and backend development',
          'Modern Technologies: Experience with React, Node.js, TypeScript, and cloud platforms',
          'Problem Solving: Strong analytical skills and creative approach to technical challenges',
          'Team Collaboration: Excellent communication and collaboration skills',
        ],
        experience: '5+ years of experience in web development',
        education: 'Bachelor\'s degree in Computer Science',
        location: 'Remote / Worldwide',
        email: 'contact@abdulraheem.dev',
        projectsCompleted: '25+',
        yearsExperience: '5+',
        technologies: '15+',
        certifications: '8'
      });
      await aboutData.save();
    }

    res.json({
      success: true,
      data: aboutData
    });
  } catch (error) {
    console.error('Error fetching about data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch about data'
    });
  }
});

// Update about info (admin only)
app.put('/', async (req, res) => {
  try {
    const {
      aboutText,
      aboutSectionTitle,
      aboutHighlights,
      experience,
      education,
      location,
      email,
      projectsCompleted,
      yearsExperience,
      technologies,
      certifications
    } = req.body;

    let aboutData = await About.findOne();
    
    if (aboutData) {
      // Update existing data
      Object.assign(aboutData, {
        aboutText,
        aboutSectionTitle,
        aboutHighlights,
        experience,
        education,
        location,
        email,
        projectsCompleted,
        yearsExperience,
        technologies,
        certifications
      });
      
      await aboutData.save();
    } else {
      // Create new data
      aboutData = new About({
        aboutText,
        aboutSectionTitle,
        aboutHighlights,
        experience,
        education,
        location,
        email,
        projectsCompleted,
        yearsExperience,
        technologies,
        certifications
      });
      
      await aboutData.save();
    }

    res.json({
      success: true,
      data: aboutData,
      message: 'About data updated successfully'
    });
  } catch (error) {
    console.error('Error updating about data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update about data'
    });
  }
});

module.exports = app; 