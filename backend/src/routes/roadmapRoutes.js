const express = require('express');
const router = express.Router();
const RoadmapController = require('../controllers/roadmapController');
const auth = require('../middleware/auth');

// All roadmap routes require authentication
router.use(auth);

router.get('/', RoadmapController.getRoadmapForActiveTrack);
router.get('/:trackId', RoadmapController.getRoadmapForTrack);

module.exports = router;
