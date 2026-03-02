const express = require('express');
const router = express.Router();
const TrackController = require('../controllers/trackController');
const auth = require('../middleware/auth');

// Public routes
router.get('/:slug/modules', TrackController.getModulesByTrack);

// All other track routes require authentication
router.use(auth);

router.get('/all', TrackController.getAllTracks);
router.get('/user', TrackController.getUserTracks);
router.get('/active', TrackController.getActiveTrack);
router.post('/select', TrackController.selectActiveTrack);
router.post('/enroll', TrackController.enrollInTrack);

module.exports = router;
