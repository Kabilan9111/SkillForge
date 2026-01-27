const db = require('../config/database');

class UserProgress {
  static async markComplete(userId, trackId, moduleId) {
    // Check if already completed
    const existing = await db.get(
      `SELECT * FROM user_progress WHERE user_id = ? AND track_id = ? AND module_id = ?`,
      [userId, trackId, moduleId]
    );

    if (existing) {
      return existing.id;
    }

    const sql = `
      INSERT INTO user_progress (user_id, track_id, module_id, status, completed_at)
      VALUES (?, ?, ?, 'completed', datetime('now'))
    `;
    const result = await db.run(sql, [userId, trackId, moduleId]);
    return result.lastID;
  }

  static async isModuleCompleted(userId, trackId, moduleId) {
    const result = await db.get(
      `SELECT id FROM user_progress WHERE user_id = ? AND track_id = ? AND module_id = ? AND status = 'completed'`,
      [userId, trackId, moduleId]
    );
    return !!result;
  }

  static async getCompletedModules(userId, trackId) {
    const sql = `
      SELECT up.*, m.title, m.category, m.sequence_order
      FROM user_progress up
      JOIN modules m ON up.module_id = m.id
      WHERE up.user_id = ? AND up.track_id = ? AND up.status = 'completed'
      ORDER BY up.completed_at
    `;
    return await db.all(sql, [userId, trackId]);
  }

  static async getProgressSummary(userId, trackId) {
    const totalModules = await db.get(
      `SELECT COUNT(*) as count FROM modules WHERE track_id = ?`,
      [trackId]
    );

    const completedModules = await db.get(
      `SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND track_id = ? AND status = 'completed'`,
      [userId, trackId]
    );

    const categoryProgress = await db.all(`
      SELECT 
        m.category,
        COUNT(DISTINCT m.id) as total,
        COUNT(DISTINCT up.module_id) as completed
      FROM modules m
      LEFT JOIN user_progress up ON m.id = up.module_id 
        AND up.user_id = ? 
        AND up.track_id = ?
        AND up.status = 'completed'
      WHERE m.track_id = ?
      GROUP BY m.category
    `, [userId, trackId, trackId]);

    return {
      totalModules: totalModules.count,
      completedModules: completedModules.count,
      completionPercentage: totalModules.count > 0 
        ? Math.round((completedModules.count / totalModules.count) * 100)
        : 0,
      categoryProgress
    };
  }

  static async getPlacementReadiness(userId, trackId) {
    const summary = await this.getProgressSummary(userId, trackId);
    
    // Calculate placement readiness based on completion
    // Requirements: 80% overall, minimum categories completed
    const readinessScore = summary.completionPercentage;
    
    const categoryRequirements = {
      'fundamentals': 90,
      'data-structures': 80,
      'algorithms': 75,
      'projects': 60,
      'practice': 70
    };

    const categoryStatus = {};
    let allCategoriesMet = true;

    for (const cat of summary.categoryProgress) {
      const required = categoryRequirements[cat.category] || 70;
      const categoryPercentage = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
      const met = categoryPercentage >= required;
      
      categoryStatus[cat.category] = {
        percentage: categoryPercentage,
        required,
        met
      };

      if (!met && categoryRequirements[cat.category]) {
        allCategoriesMet = false;
      }
    }

    const isPlacementReady = readinessScore >= 80 && allCategoriesMet;

    return {
      readinessScore,
      isPlacementReady,
      categoryStatus,
      recommendation: isPlacementReady 
        ? 'Ready for placement opportunities'
        : 'Continue completing modules to reach placement readiness'
    };
  }
}

module.exports = UserProgress;
