const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const trackRoutes = require('./trackRoutes');
const roadmapRoutes = require('./roadmapRoutes');
const progressRoutes = require('./progressRoutes');
const practiceRoutes = require('./practiceRoutes');
const skillGapRoutes = require('./skillGapRoutes');
const interviewRoutes = require('./interviewRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/track', trackRoutes);
router.use('/roadmap', roadmapRoutes);
router.use('/progress', progressRoutes);
router.use('/practice', practiceRoutes);
router.use('/skill-gap', skillGapRoutes);
router.use('/interview', interviewRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'SkillForge Backend API'
  });
});

module.exports = router;
