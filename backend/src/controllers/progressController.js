const ProgressService = require('../services/progressService');
const UserTrack = require('../models/UserTrack');

class ProgressController {
  static async getProgressForActiveTrack(req, res, next) {
    try {
      const activeTrack = await UserTrack.getActiveTrack(req.userId);

      if (!activeTrack) {
        return res.status(404).json({ 
          error: 'No active track found. Please select a track first.' 
        });
      }

      const progress = await ProgressService.getProgressSummary(req.userId, activeTrack.track_id);

      res.json({
        trackId: activeTrack.track_id,
        trackName: activeTrack.name,
        progress
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProgressForTrack(req, res, next) {
    try {
      const trackId = parseInt(req.params.trackId);

      if (!trackId) {
        return res.status(400).json({ error: 'Invalid track ID' });
      }

      const progress = await ProgressService.getProgressSummary(req.userId, trackId);

      res.json({ trackId, progress });
    } catch (error) {
      next(error);
    }
  }

  static async markModuleComplete(req, res, next) {
    try {
      const { moduleId, trackId } = req.body;

      if (!moduleId) {
        return res.status(400).json({ error: 'Module ID is required' });
      }

      // If trackId not provided, use active track
      let targetTrackId = trackId;
      if (!targetTrackId) {
        const activeTrack = await UserTrack.getActiveTrack(req.userId);
        if (!activeTrack) {
          return res.status(404).json({ 
            error: 'No active track found. Please specify trackId or select an active track.' 
          });
        }
        targetTrackId = activeTrack.track_id;
      }

      const result = await ProgressService.markModuleComplete(
        req.userId, 
        targetTrackId, 
        moduleId
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getPlacementReadiness(req, res, next) {
    try {
      const trackId = req.query.trackId 
        ? parseInt(req.query.trackId)
        : null;

      let targetTrackId = trackId;
      
      if (!targetTrackId) {
        const activeTrack = await UserTrack.getActiveTrack(req.userId);
        if (!activeTrack) {
          return res.status(404).json({ 
            error: 'No active track found. Please specify trackId or select an active track.' 
          });
        }
        targetTrackId = activeTrack.track_id;
      }

      const readiness = await ProgressService.getPlacementReadiness(req.userId, targetTrackId);

      res.json({
        trackId: targetTrackId,
        placementReadiness: readiness
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProgressController;
