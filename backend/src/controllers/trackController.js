const TrackService = require('../services/trackService');
const UserTrack = require('../models/UserTrack');

class TrackController {
  static async getAllTracks(req, res, next) {
    try {
      const tracks = await TrackService.getAllTracks();
      res.json({ tracks });
    } catch (error) {
      next(error);
    }
  }

  static async getUserTracks(req, res, next) {
    try {
      const tracks = await TrackService.getUserTracks(req.userId);
      res.json({ tracks });
    } catch (error) {
      next(error);
    }
  }

  static async getActiveTrack(req, res, next) {
    try {
      const activeTrack = await TrackService.getActiveTrack(req.userId);
      res.json({ track: activeTrack });
    } catch (error) {
      next(error);
    }
  }

  static async selectActiveTrack(req, res, next) {
    try {
      const { trackId } = req.body;

      if (!trackId) {
        return res.status(400).json({ error: 'Track ID is required' });
      }

      const activeTrack = await TrackService.selectActiveTrack(req.userId, trackId);

      res.json({
        message: 'Active track updated successfully',
        track: activeTrack
      });
    } catch (error) {
      next(error);
    }
  }

  static async enrollInTrack(req, res, next) {
    try {
      const { trackId } = req.body;

      if (!trackId) {
        return res.status(400).json({ error: 'Track ID is required' });
      }

      const result = await TrackService.enrollInTrack(req.userId, trackId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getModulesByTrack(req, res, next) {
    try {
      const { slug } = req.params;
      const { level } = req.query;
      const modules = await TrackService.getModulesBySlug(slug, level);
      res.json(modules);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TrackController;
