const express = require('express');
const PortfolioView = require('../models/PortfolioView');
const router = express.Router();

// Track portfolio view
router.post('/track-view', async (req, res) => {
  try {
    const { page = 'home', sessionId } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers.referer || '';

    // Check if this is a unique view (same IP, different session, or first visit)
    const existingView = await PortfolioView.findOne({
      ipAddress,
      sessionId,
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    const isUnique = !existingView;

    const view = new PortfolioView({
      ipAddress,
      userAgent,
      referrer,
      page,
      sessionId,
      isUnique
    });

    await view.save();

    res.json({
      success: true,
      message: 'View tracked successfully',
      data: { isUnique }
    });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ success: false, message: 'Failed to track view' });
  }
});

// Get portfolio analytics (admin only)
router.get('/analytics', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate;
    switch (period) {
      case '1d':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get total views
    const totalViews = await PortfolioView.countDocuments({
      timestamp: { $gte: startDate }
    });

    // Get unique views
    const uniqueViews = await PortfolioView.countDocuments({
      timestamp: { $gte: startDate },
      isUnique: true
    });

    // Get views by page
    const pageViews = await PortfolioView.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$page',
          count: { $sum: 1 },
          uniqueCount: { $sum: { $cond: ['$isUnique', 1, 0] } }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get daily views for the last 7 days
    const dailyViews = await PortfolioView.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          },
          count: { $sum: 1 },
          uniqueCount: { $sum: { $cond: ['$isUnique', 1, 0] } }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get top referrers
    const topReferrers = await PortfolioView.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          referrer: { $ne: '' }
        }
      },
      {
        $group: {
          _id: '$referrer',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        totalViews,
        uniqueViews,
        pageViews,
        dailyViews,
        topReferrers
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

module.exports = router; 