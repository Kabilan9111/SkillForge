const Module = require('../models/Module');
const UserProgress = require('../models/UserProgress');

class RoadmapService {
  static async getRoadmapForTrackAndLevel(userId, trackId, level) {
    // Validate level parameter
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    if (!validLevels.includes(level)) {
      throw { status: 400, message: 'Invalid level. Must be one of: beginner, intermediate, advanced' };
    }

    // Get modules for the specific track AND level
    const modules = await Module.findByTrackAndLevel(trackId, level);

    // Get user's completed modules for this track
    const completedModules = await UserProgress.getCompletedModules(userId, trackId);
    const completedModuleIds = new Set(completedModules.map(m => m.module_id));

    // Build roadmap with completion status and unlock status
    const roadmap = modules.map(module => {
      const isCompleted = completedModuleIds.has(module.id);
      
      // Check if module is unlocked
      // Module is unlocked if all prerequisites are completed
      let isUnlocked = true;
      if (module.prerequisites && module.prerequisites.length > 0) {
        isUnlocked = module.prerequisites.every(prereqId => 
          completedModuleIds.has(prereqId)
        );
      }

      return {
        id: module.id,
        trackId: module.track_id,
        level: module.level,
        title: module.title,
        description: module.description,
        category: module.category,
        estimatedHours: module.estimated_hours,
        sequenceOrder: module.sequence_order,
        prerequisites: module.prerequisites,
        isCompleted,
        isUnlocked,
        status: isCompleted ? 'completed' : (isUnlocked ? 'unlocked' : 'locked')
      };
    });

    return roadmap;
  }
}

module.exports = RoadmapService;
