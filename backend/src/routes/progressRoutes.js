const express = require('express');
const router = express.Router();
const ProgressController = require('../controllers/progressController');
const auth = require('../middleware/auth');

// All progress routes require authentication
router.use(auth);

router.get('/', ProgressController.getProgressForActiveTrack);
router.get('/track/:trackId', ProgressController.getProgressForTrack);
router.post('/complete', ProgressController.markModuleComplete);
router.get('/placement-readiness', ProgressController.getPlacementReadiness);

module.exports = router;
