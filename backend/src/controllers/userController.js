const User = require('../models/User');
const ProgressService = require('../services/progressService');

class UserController {
  static async getCurrentUser(req, res, next) {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove password
      delete user.password;

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  static async getUserTracksWithProgress(req, res, next) {
    try {
      const progressData = await ProgressService.getUserProgressForAllTracks(req.userId);

      res.json({ tracks: progressData });
    } catch (error) {
      next(error);
    }
  }

  static async getUserProfile(req, res, next) {
    try {
      const user = await User.findById(req.userId);
      const tracksProgress = await ProgressService.getUserProgressForAllTracks(req.userId);

      delete user.password;

      res.json({
        user,
        tracks: tracksProgress
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
