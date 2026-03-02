const db = require('../config/database');

class VideoNotes {
  static async create(videoId, content, timestamps) {
    const createdAt = new Date().toISOString();
    const timestampsStr = JSON.stringify(timestamps);
    
    const result = await db.run(
      `INSERT INTO video_notes (video_id, content, timestamps, created_at)
       VALUES (?, ?, ?, ?)`,
      [videoId, content, timestampsStr, createdAt]
    );
    
    return result.lastID;
  }

  static async findByVideoId(videoId) {
    const notes = await db.get(
      `SELECT * FROM video_notes WHERE video_id = ?`,
      [videoId]
    );
    
    if (notes && notes.timestamps) {
      notes.timestamps = JSON.parse(notes.timestamps);
    }
    
    return notes;
  }

  static async update(videoId, content, timestamps) {
    const updatedAt = new Date().toISOString();
    const timestampsStr = JSON.stringify(timestamps);
    
    await db.run(
      `UPDATE video_notes SET content = ?, timestamps = ?, updated_at = ? WHERE video_id = ?`,
      [content, timestampsStr, updatedAt, videoId]
    );
  }

  static async upsert(videoId, content, timestamps) {
    const existing = await db.get(
      `SELECT id FROM video_notes WHERE video_id = ?`,
      [videoId]
    );

    if (existing) {
      await this.update(videoId, content, timestamps);
      return existing.id;
    } else {
      return await this.create(videoId, content, timestamps);
    }
  }
}

module.exports = VideoNotes;
