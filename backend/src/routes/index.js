const express = require('express');
const router = express.Router();

const authRoutes             = require('./authRoutes');
const userRoutes             = require('./userRoutes');
const trackRoutes            = require('./trackRoutes');
const roadmapRoutes          = require('./roadmapRoutes');
const progressRoutes         = require('./progressRoutes');
const practiceRoutes         = require('./practiceRoutes');
const skillGapRoutes         = require('./skillGapRoutes');
const interviewRoutes        = require('./interviewRoutes');
const projectsRoutes         = require('./projectsRoutes');
const videoRoutes            = require('./videoRoutes');
const projectWorkspaceRoutes = require('./projectWorkspaceRoutes');
const codersDnaRoutes        = require('./codersDnaRoutes');
const projectAnalyzerRoutes  = require('./projectAnalyzerRoutes');

// Mount routes
router.use('/auth',             authRoutes);
router.use('/user',             userRoutes);
router.use('/track',            trackRoutes);
router.use('/roadmap',          roadmapRoutes);
router.use('/progress',         progressRoutes);
router.use('/practice',         practiceRoutes);
router.use('/skill-gap',        skillGapRoutes);
router.use('/interview',        interviewRoutes);
router.use('/projects',         projectsRoutes);
router.use('/videos',           videoRoutes);
router.use('/workspace',        projectWorkspaceRoutes);
router.use('/coders-dna',       codersDnaRoutes);
router.use('/project-analyzer', projectAnalyzerRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'SkillForge Backend API'
  });
});

module.exports = router;

