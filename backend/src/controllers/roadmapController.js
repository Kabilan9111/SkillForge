const RoadmapService = require('../services/roadmapService');
const UserTrack = require('../models/UserTrack');

class RoadmapController {
  static async getRoadmapForActiveTrack(req, res, next) {
    try {
      // Get level from query parameter (MANDATORY)
      const level = req.query.level;

      if (!level) {
        return res.status(400).json({ 
          error: 'Level parameter is required. Must be one of: beginner, intermediate, advanced' 
        });
      }

      // Get user's active track
      const activeTrack = await UserTrack.getActiveTrack(req.userId);

      if (!activeTrack) {
        return res.status(404).json({ 
          error: 'No active track found. Please select a track first.' 
        });
      }

      const roadmap = await RoadmapService.getRoadmapForTrackAndLevel(req.userId, activeTrack.track_id, level);

      res.json({
        trackId: activeTrack.track_id,
        trackName: activeTrack.name,
        trackSlug: activeTrack.slug,
        level,
        roadmap
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRoadmapForTrack(req, res, next) {
    try {
      const trackId = parseInt(req.params.trackId);
      const level = req.query.level;

      if (!trackId) {
        return res.status(400).json({ error: 'Invalid track ID' });
      }

      // Level parameter is MANDATORY
      if (!level) {
        return res.status(400).json({ 
          error: 'Level parameter is required. Must be one of: beginner, intermediate, advanced' 
        });
      }

      // Verify user is enrolled in this track
      const isEnrolled = await UserTrack.isEnrolled(req.userId, trackId);

      if (!isEnrolled) {
        return res.status(403).json({ 
          error: 'You must be enrolled in this track to view its roadmap' 
        });
      }

      const roadmap = await RoadmapService.getRoadmapForTrackAndLevel(req.userId, trackId, level);

      res.json({ trackId, level, roadmap });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RoadmapController;
