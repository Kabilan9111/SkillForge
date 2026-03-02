const db = require('../config/database');

class Video {
  static async create(title, description, videoUrl, thumbnailUrl, durationSeconds, level, tags, moduleId, uploadedBy) {
    const createdAt = new Date().toISOString();
    const tagsStr = Array.isArray(tags) ? tags.join(',') : tags;
    
    const result = await db.run(
      `INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, level, tags, module_id, uploaded_by, created_at, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(display_order), 0) + 1 FROM videos))`,
      [title, description, videoUrl, thumbnailUrl, durationSeconds, level, tagsStr, moduleId, uploadedBy, createdAt]
    );
    
    return result.lastID;
  }

  static async findAll(level = null) {
    let query = `
      SELECT v.*, u.full_name as uploaded_by_name, m.title as module_title
      FROM videos v
      LEFT JOIN users u ON v.uploaded_by = u.id
      LEFT JOIN modules m ON v.module_id = m.id
    `;
    
    const params = [];
    if (level) {
      query += ` WHERE v.level = ?`;
      params.push(level);
    }
    
    query += ` ORDER BY v.display_order ASC, v.created_at DESC`;
    
    return await db.all(query, params);
  }

  static async findById(id) {
    return await db.get(
      `SELECT v.*, u.full_name as uploaded_by_name, m.title as module_title
       FROM videos v
       LEFT JOIN users u ON v.uploaded_by = u.id
       LEFT JOIN modules m ON v.module_id = m.id
       WHERE v.id = ?`,
      [id]
    );
  }

  static async findByTags(tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    const conditions = tagArray.map(() => `v.tags LIKE ?`).join(' OR ');
    const params = tagArray.map(tag => `%${tag}%`);
    
    return await db.all(
      `SELECT v.*, u.full_name as uploaded_by_name
       FROM videos v
       LEFT JOIN users u ON v.uploaded_by = u.id
       WHERE ${conditions}
       ORDER BY v.display_order ASC`,
      params
    );
  }

  static async delete(id) {
    await db.run(`DELETE FROM videos WHERE id = ?`, [id]);
  }
}

module.exports = Video;
