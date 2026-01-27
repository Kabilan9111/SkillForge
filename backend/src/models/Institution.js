const db = require('../config/database');

class Institution {
  static async create(name, type, location) {
    const sql = `INSERT INTO institutions (name, type, location, created_at) VALUES (?, ?, ?, datetime('now'))`;
    const result = await db.run(sql, [name, type, location]);
    return result.lastID;
  }

  static async findById(id) {
    const sql = `SELECT * FROM institutions WHERE id = ?`;
    return await db.get(sql, [id]);
  }

  static async findAll() {
    const sql = `SELECT * FROM institutions ORDER BY name`;
    return await db.all(sql);
  }
}

module.exports = Institution;
