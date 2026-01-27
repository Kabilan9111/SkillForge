const Module = require('../models/Module');
const UserProgress = require('../models/UserProgress');
const UserTrack = require('../models/UserTrack');

class ProgressService {
  static async getProgressSummary(userId, trackId) {
    return await UserProgress.getProgressSummary(userId, trackId);
  }

  static async markModuleComplete(userId, trackId, moduleId) {
    // Verify module exists and belongs to the track
    const module = await Module.findById(moduleId);
    
    if (!module) {
      throw { status: 404, message: 'Module not found' };
    }

    if (module.track_id !== trackId) {
      throw { status: 400, message: 'Module does not belong to this track' };
    }

    // Verify user is enrolled in this track
    const isEnrolled = await UserTrack.isEnrolled(userId, trackId);
    
    if (!isEnrolled) {
      throw { status: 403, message: 'User not enrolled in this track' };
    }

    // Check if already completed
    const isAlreadyCompleted = await UserProgress.isModuleCompleted(userId, trackId, moduleId);
    
    if (isAlreadyCompleted) {
      return { 
        message: 'Module already completed',
        alreadyCompleted: true
      };
    }

    // CRITICAL: Validate prerequisites are met
    const prerequisites = await Module.getPrerequisites(moduleId);
    
    for (const prereq of prerequisites) {
      const isPrereqCompleted = await UserProgress.isModuleCompleted(userId, trackId, prereq.id);
      
      if (!isPrereqCompleted) {
        throw { 
          status: 403, 
          message: `Cannot complete this module. Prerequisite "${prereq.title}" must be completed first.`,
          missingPrerequisite: prereq.title
        };
      }
    }

    // Mark module as complete
    await UserProgress.markComplete(userId, trackId, moduleId);

    // Get updated progress
    const progress = await UserProgress.getProgressSummary(userId, trackId);

    return {
      message: 'Module completed successfully',
      moduleId,
      progress
    };
  }

  static async getPlacementReadiness(userId, trackId) {
    // Verify user is enrolled in this track
    const isEnrolled = await UserTrack.isEnrolled(userId, trackId);
    
    if (!isEnrolled) {
      throw { status: 403, message: 'User not enrolled in this track' };
    }

    return await UserProgress.getPlacementReadiness(userId, trackId);
  }

  static async getUserProgressForAllTracks(userId) {
    const userTracks = await UserTrack.getUserTracks(userId);
    
    const progressData = await Promise.all(
      userTracks.map(async (track) => {
        const progress = await UserProgress.getProgressSummary(userId, track.track_id);
        return {
          trackId: track.track_id,
          trackName: track.name,
          trackSlug: track.slug,
          isActive: track.is_active === 1,
          ...progress
        };
      })
    );

    return progressData;
  }
}

module.exports = ProgressService;
