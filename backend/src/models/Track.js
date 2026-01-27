const db = require('../config/database');

class Track {
  static async findAll() {
    const sql = `SELECT * FROM tracks ORDER BY display_order`;
    return await db.all(sql);
  }

  static async findById(id) {
    const sql = `SELECT * FROM tracks WHERE id = ?`;
    return await db.get(sql, [id]);
  }

  static async findBySlug(slug) {
    const sql = `SELECT * FROM tracks WHERE slug = ?`;
    return await db.get(sql, [slug]);
  }
}

module.exports = Track;
