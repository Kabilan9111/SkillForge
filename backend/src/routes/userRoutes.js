const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const auth = require('../middleware/auth');

// All user routes require authentication
router.use(auth);

router.get('/me', UserController.getCurrentUser);
router.get('/profile', UserController.getUserProfile);
router.get('/tracks', UserController.getUserTracksWithProgress);

module.exports = router;
