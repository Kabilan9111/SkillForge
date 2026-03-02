/**
 * Coder's DNA API Routes
 * All routes require JWT authentication.
 *
 * POST  /api/coders-dna/telemetry         — ingest session telemetry
 * GET   /api/coders-dna/profile           — full DNA profile + badges
 * GET   /api/coders-dna/sessions          — session history
 * GET   /api/coders-dna/problems          — problem list (with warfare mode)
 * GET   /api/coders-dna/problems/:slug    — single problem
 * POST  /api/coders-dna/ai-feedback       — AI analysis of code + behavior
 * GET   /api/coders-dna/hiring-radar      — recruiter-facing summary
 * GET   /api/coders-dna/warfare-modes     — available warfare mode descriptors
 */
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const {
  ingestTelemetry,
  getDNAProfile,
  getSessionHistory,
  getProblems,
  getProblem,
  getAIFeedback,
  getHiringRadar,
  getWarfareModes
} = require('../controllers/codersDnaController');

// All routes require authentication
router.use(auth);

router.post('/telemetry',       ingestTelemetry);
router.get('/profile',          getDNAProfile);
router.get('/sessions',         getSessionHistory);
router.get('/problems',         getProblems);
router.get('/problems/:slug',   getProblem);
router.post('/ai-feedback',     getAIFeedback);
router.get('/hiring-radar',     getHiringRadar);
router.get('/warfare-modes',    getWarfareModes);

module.exports = router;
