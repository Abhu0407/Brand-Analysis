const express = require('express');
const router = express.Router();
const Mention = require('../models/mention');
const { auth } = require('../middleware/auth');

// Get all mentions with optional filters
router.get('/', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '100');
    const skip = parseInt(req.query.skip || '0');
    const brand = req.query.brand;
    const platform = req.query.platform;
    const sentiment = req.query.sentiment;
    
    // Build query
    const query = {};
    if (brand) query.brand = brand;
    if (platform) query.platform = platform;
    if (sentiment) query.sentiment = sentiment;
    
    const items = await Mention.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Mention.countDocuments(query);
    
    res.json({
      mentions: items,
      total,
      limit,
      skip
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sentiment statistics
router.get('/sentiment', auth, async (req, res) => {
  try {
    const brand = req.query.brand;
    const query = brand ? { brand } : {};
    
    const [positive, negative, neutral] = await Promise.all([
      Mention.countDocuments({ ...query, sentiment: 'positive' }),
      Mention.countDocuments({ ...query, sentiment: 'negative' }),
      Mention.countDocuments({ ...query, sentiment: 'neutral' })
    ]);
    
    res.json({ positive, negative, neutral });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get platform distribution
router.get('/platforms', auth, async (req, res) => {
  try {
    const brand = req.query.brand;
    const query = brand ? { brand } : {};
    
    const platforms = await Mention.aggregate([
      { $match: query },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const result = {};
    platforms.forEach(p => {
      result[p._id] = p.count;
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sentiment trend over time
router.get('/trend', auth, async (req, res) => {
  try {
    const brand = req.query.brand;
    const days = parseInt(req.query.days || '7');
    const query = brand ? { brand } : {};
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    query.createdAt = { $gte: startDate };
    
    const trend = await Mention.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sentiment: '$sentiment'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);
    
    // Transform to date-based structure
    const dateMap = {};
    trend.forEach(item => {
      const date = item._id.date;
      if (!dateMap[date]) {
        dateMap[date] = { date, positive: 0, negative: 0, neutral: 0 };
      }
      dateMap[date][item._id.sentiment] = item.count;
    });
    
    const result = Object.values(dateMap).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific mention by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const mention = await Mention.findById(req.params.id).lean();
    if (!mention) {
      return res.status(404).json({ error: 'Mention not found' });
    }
    res.json(mention);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
