const express = require('express');
const router = express.Router();
const About = require('../models/About');
const { adminAuth } = require('../middleware/auth');

// GET about information (public)
router.get('/', async (req, res) => {
  try {
    let about = await About.findOne();
    
    if (!about) {
      // Create default about data if none exists
      about = new About({
        name: 'Your Name',
        title: 'Full Stack Developer',
        subtitle: 'Passionate about creating amazing web experiences',
        description: 'A dedicated developer with expertise in modern web technologies.',
        email: 'your.email@example.com',
        aboutText: 'I am a passionate developer with experience in building modern web applications. I love working with cutting-edge technologies and creating user-friendly solutions.',
        aboutSectionTitle: 'Full-Stack Software Engineer',
        aboutHighlights: [
          'Full-Stack Expertise: Proficient in both frontend and backend development',
          'Modern Technologies: Experience with React, Node.js, TypeScript, and cloud platforms',
          'Problem Solving: Strong analytical skills and creative approach to technical challenges',
          'Team Collaboration: Excellent communication and collaboration skills'
        ],
        experience: '5+ years of experience in web development',
        education: 'Bachelor\'s degree in Computer Science',
        technologyTags: ['React', 'Node.js', 'TypeScript', 'Next.js', 'Express.js'],
        projectsCompleted: '25+',
        yearsExperience: '5+',
        technologies: '15+',
        certifications: '8'
      });
      await about.save();
    }

    res.json({
      success: true,
      data: about
    });
  } catch (error) {
    console.error('Error fetching about data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch about data'
    });
  }
});

// PUT update about information (admin only)
router.put('/', adminAuth, async (req, res) => {
  try {
    const {
      name,
      title,
      subtitle,
      description,
      email,
      location,
      github,
      linkedin,
      twitter,
      website,
      avatar,
      aboutText,
      aboutSectionTitle,
      aboutHighlights,
      experience,
      education,
      technologyTags,
      projectsCompleted,
      yearsExperience,
      technologies,
      certifications
    } = req.body;

    // Validate required fields
    if (!name || !title || !description || !email || !aboutText) {
      return res.status(400).json({
        success: false,
        error: 'Name, title, description, email, and about text are required'
      });
    }

    let about = await About.findOne();
    
    if (about) {
      // Update existing about data
      about.name = name;
      about.title = title;
      about.subtitle = subtitle || '';
      about.description = description;
      about.email = email;
      about.location = location || '';
      about.github = github || '';
      about.linkedin = linkedin || '';
      about.twitter = twitter || '';
      about.website = website || '';
      about.avatar = avatar || '';
      about.aboutText = aboutText;
      about.aboutSectionTitle = aboutSectionTitle || 'Full-Stack Software Engineer';
      about.aboutHighlights = aboutHighlights || [
        'Full-Stack Expertise: Proficient in both frontend and backend development',
        'Modern Technologies: Experience with React, Node.js, TypeScript, and cloud platforms',
        'Problem Solving: Strong analytical skills and creative approach to technical challenges',
        'Team Collaboration: Excellent communication and collaboration skills'
      ];
      about.experience = experience || '';
      about.education = education || '';
      about.technologyTags = technologyTags || ['React', 'Node.js', 'TypeScript', 'Next.js', 'Express.js'];
      about.projectsCompleted = projectsCompleted || '25+';
      about.yearsExperience = yearsExperience || '5+';
      about.technologies = technologies || '15+';
      about.certifications = certifications || '8';
      
      await about.save();
    } else {
      // Create new about data
      about = new About({
        name,
        title,
        subtitle: subtitle || '',
        description,
        email,
        location: location || '',
        github: github || '',
        linkedin: linkedin || '',
        twitter: twitter || '',
        website: website || '',
        avatar: avatar || '',
        aboutText,
        aboutSectionTitle: aboutSectionTitle || 'Full-Stack Software Engineer',
        aboutHighlights: aboutHighlights || [
          'Full-Stack Expertise: Proficient in both frontend and backend development',
          'Modern Technologies: Experience with React, Node.js, TypeScript, and cloud platforms',
          'Problem Solving: Strong analytical skills and creative approach to technical challenges',
          'Team Collaboration: Excellent communication and collaboration skills'
        ],
        experience: experience || '',
        education: education || '',
        technologyTags: technologyTags || ['React', 'Node.js', 'TypeScript', 'Next.js', 'Express.js'],
        projectsCompleted: projectsCompleted || '25+',
        yearsExperience: yearsExperience || '5+',
        technologies: technologies || '15+',
        certifications: certifications || '8'
      });
      
      await about.save();
    }

    res.json({
      success: true,
      data: about,
      message: 'About information updated successfully'
    });
  } catch (error) {
    console.error('Error updating about data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update about data'
    });
  }
});

module.exports = router; 