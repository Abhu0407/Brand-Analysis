const express = require('express');
const router = express.Router();
const collectors = require('../collectors/collector-manager');
const { auth } = require('../middleware/auth');

// Get status of all collectors
router.get('/status', auth, async (req, res) => {
  try {
    const status = collectors.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if a specific brand is being monitored
router.get('/status/:brand', auth, async (req, res) => {
  try {
    const { brand } = req.params;
    const isRunning = collectors.isRunning(brand);
    res.json({ brand, isRunning });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start monitoring a brand
router.post('/start', auth, async (req, res) => {
  try {
    const { brand } = req.body;
    if(!brand) {
      return res.status(400).json({error:'brand required'});
    }
    const started = collectors.startBrand(brand);
    if(started) {
      res.json({status:'started', brand, message: `Started monitoring ${brand}`});
    } else {
      res.json({status:'already_running', brand, message: `Already monitoring ${brand}`});
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop monitoring a brand
router.post('/stop', auth, async (req, res) => {
  try {
    const { brand } = req.body;
    if(!brand) {
      return res.status(400).json({error:'brand required'});
    }
    const stopped = collectors.stopBrand(brand);
    if(stopped) {
      res.json({status:'stopped', brand, message: `Stopped monitoring ${brand}`});
    } else {
      res.json({status:'not_running', brand, message: `Not currently monitoring ${brand}`});
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
