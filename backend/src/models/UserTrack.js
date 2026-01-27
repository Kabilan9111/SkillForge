const db = require('../config/database');

class UserTrack {
  static async enrollUser(userId, trackId) {
    // Check if already enrolled
    const existing = await db.get(
      `SELECT * FROM user_tracks WHERE user_id = ? AND track_id = ?`,
      [userId, trackId]
    );

    if (existing) {
      return existing.id;
    }

    // If this is first track, make it active
    const userTracks = await db.all(
      `SELECT * FROM user_tracks WHERE user_id = ?`,
      [userId]
    );

    const isActive = userTracks.length === 0 ? 1 : 0;

    const sql = `
      INSERT INTO user_tracks (user_id, track_id, is_active, enrolled_at)
      VALUES (?, ?, ?, datetime('now'))
    `;
    const result = await db.run(sql, [userId, trackId, isActive]);
    return result.lastID;
  }

  static async setActiveTrack(userId, trackId) {
    // Verify user is enrolled in this track
    const enrollment = await db.get(
      `SELECT * FROM user_tracks WHERE user_id = ? AND track_id = ?`,
      [userId, trackId]
    );

    if (!enrollment) {
      throw new Error('User not enrolled in this track');
    }

    // Deactivate all tracks for this user
    await db.run(`UPDATE user_tracks SET is_active = 0 WHERE user_id = ?`, [userId]);

    // Activate the selected track
    await db.run(
      `UPDATE user_tracks SET is_active = 1 WHERE user_id = ? AND track_id = ?`,
      [userId, trackId]
    );
  }

  static async getActiveTrack(userId) {
    const sql = `
      SELECT ut.*, t.name, t.slug, t.description, t.color
      FROM user_tracks ut
      JOIN tracks t ON ut.track_id = t.id
      WHERE ut.user_id = ? AND ut.is_active = 1
    `;
    return await db.get(sql, [userId]);
  }

  static async getUserTracks(userId) {
    const sql = `
      SELECT ut.*, t.name, t.slug, t.description, t.color
      FROM user_tracks ut
      JOIN tracks t ON ut.track_id = t.id
      WHERE ut.user_id = ?
      ORDER BY t.display_order
    `;
    return await db.all(sql, [userId]);
  }

  static async isEnrolled(userId, trackId) {
    const result = await db.get(
      `SELECT id FROM user_tracks WHERE user_id = ? AND track_id = ?`,
      [userId, trackId]
    );
    return !!result;
  }
}

module.exports = UserTrack;
