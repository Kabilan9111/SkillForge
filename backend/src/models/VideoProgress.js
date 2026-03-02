const db = require('../config/database');

class VideoProgress {
  static async upsert(userId, videoId, progressSeconds, progressPercentage, completed) {
    const lastWatchedAt = new Date().toISOString();
    const completedAt = completed ? new Date().toISOString() : null;
    
    const existing = await db.get(
      `SELECT id FROM video_progress WHERE user_id = ? AND video_id = ?`,
      [userId, videoId]
    );

    if (existing) {
      await db.run(
        `UPDATE video_progress 
         SET progress_seconds = ?, progress_percentage = ?, completed = ?, last_watched_at = ?, completed_at = ?
         WHERE user_id = ? AND video_id = ?`,
        [progressSeconds, progressPercentage, completed ? 1 : 0, lastWatchedAt, completedAt, userId, videoId]
      );
      return existing.id;
    } else {
      const result = await db.run(
        `INSERT INTO video_progress (user_id, video_id, progress_seconds, progress_percentage, completed, last_watched_at, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, videoId, progressSeconds, progressPercentage, completed ? 1 : 0, lastWatchedAt, completedAt]
      );
      return result.lastID;
    }
  }

  static async findByUserAndVideo(userId, videoId) {
    return await db.get(
      `SELECT * FROM video_progress WHERE user_id = ? AND video_id = ?`,
      [userId, videoId]
    );
  }

  static async findByUser(userId) {
    return await db.all(
      `SELECT vp.*, v.title, v.thumbnail_url, v.duration_seconds
       FROM video_progress vp
       JOIN videos v ON vp.video_id = v.id
       WHERE vp.user_id = ?
       ORDER BY vp.last_watched_at DESC`,
      [userId]
    );
  }

  static async isVideoCompleted(userId, videoId) {
    const progress = await db.get(
      `SELECT completed FROM video_progress WHERE user_id = ? AND video_id = ?`,
      [userId, videoId]
    );
    return progress && progress.completed === 1;
  }
}

module.exports = VideoProgress;
