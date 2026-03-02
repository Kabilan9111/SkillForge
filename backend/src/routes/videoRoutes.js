const express = require('express');
const router = express.Router();
const VideoController = require('../controllers/videoController');
const auth = require('../middleware/auth');

// Public routes (with optional auth for progress data)
router.get('/', VideoController.getAllVideos);
router.get('/:id', VideoController.getVideoById);

// User routes (require authentication)
router.post('/:id/progress', auth.required, VideoController.updateProgress);
router.get('/:id/notes', auth.required, VideoController.getVideoNotes);

// Admin routes (require authentication + admin role)
// TEMPORARY: Upload without auth (no login system yet)
router.post('/', VideoController.uploadVideo);
router.put('/:id/notes', auth.required, auth.admin, VideoController.upsertVideoNotes);
router.delete('/:id', auth.required, auth.admin, VideoController.deleteVideo);

module.exports = router;
