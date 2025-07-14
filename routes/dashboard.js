const express = require('express');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const Contact = require('../models/Contact');
const User = require('../models/User');
const PortfolioView = require('../models/PortfolioView');
const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get counts
    const [
      totalProjects,
      featuredProjects,
      activeProjects,
      totalSkills,
      activeSkills,
      totalContacts,
      unreadContacts,
      totalUsers
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ featured: true }),
      Project.countDocuments({ status: 'active' }),
      Skill.countDocuments(),
      Skill.countDocuments({ isActive: true }),
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'unread' }),
      User.countDocuments()
    ]);

    // Get portfolio views (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const portfolioViews = await PortfolioView.countDocuments({
      timestamp: { $gte: thirtyDaysAgo }
    });

    // Get recent activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      recentProjects,
      recentContacts,
      recentUsers
    ] = await Promise.all([
      Project.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Contact.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    ]);

    // Get contact status breakdown
    const contactStats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const contactStatusBreakdown = {
      unread: 0,
      read: 0,
      replied: 0,
      archived: 0
    };

    contactStats.forEach(stat => {
      contactStatusBreakdown[stat._id] = stat.count;
    });

    // Get project status breakdown
    const projectStats = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const projectStatusBreakdown = {
      active: 0,
      inactive: 0,
      archived: 0
    };

    projectStats.forEach(stat => {
      projectStatusBreakdown[stat._id] = stat.count;
    });

    // Get top skills by category
    const topSkills = await Skill.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$category',
          skills: {
            $push: {
              name: '$skills.name',
              level: '$skills.level'
            }
          },
          avgLevel: { $avg: '$skills.level' }
        }
      },
      { $sort: { avgLevel: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalProjects,
          featuredProjects,
          activeProjects,
          totalSkills,
          activeSkills,
          totalContacts,
          unreadContacts,
          totalUsers,
          portfolioViews
        },
        recent: {
          projects: recentProjects,
          contacts: recentContacts,
          users: recentUsers
        },
        breakdown: {
          contacts: contactStatusBreakdown,
          projects: projectStatusBreakdown
        },
        topSkills
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get recent activity
router.get('/recent-activity', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [recentProjects, recentContacts, recentUsers, recentViews] = await Promise.all([
      Project.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('title status createdAt'),
      Contact.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('firstName lastName email subject status createdAt'),
      User.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('firstName lastName email role createdAt'),
      PortfolioView.find()
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .select('page ipAddress timestamp')
    ]);

    // Combine and sort all activities
    const activities = [
      ...recentProjects.map(p => ({
        type: 'project',
        action: 'created',
        title: p.title,
        status: p.status,
        timestamp: p.createdAt,
        icon: '📁'
      })),
      ...recentContacts.map(c => ({
        type: 'contact',
        action: 'received',
        title: `${c.firstName} ${c.lastName}`,
        subtitle: c.subject,
        status: c.status,
        timestamp: c.createdAt,
        icon: '📧'
      })),
      ...recentUsers.map(u => ({
        type: 'user',
        action: 'registered',
        title: u.fullName || u.email,
        role: u.role,
        timestamp: u.createdAt,
        icon: '👤'
      })),
      ...recentViews.map(v => ({
        type: 'view',
        action: 'visited',
        title: `Portfolio ${v.page}`,
        subtitle: `IP: ${v.ipAddress}`,
        timestamp: v.timestamp,
        icon: '👁️'
      }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, parseInt(limit));

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

// Get system health
router.get('/health', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Test database connection
    await Project.findOne().select('_id');
    const dbResponseTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: {
          status: 'connected',
          responseTime: `${dbResponseTime}ms`
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      success: false,
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      }
    });
  }
});

module.exports = router; 