const db = require('../config/database');

class Module {
  static async findByTrackAndLevel(trackId, level) {
    const sql = `
      SELECT m.*, 
             GROUP_CONCAT(mp.prerequisite_id) as prerequisite_ids
      FROM modules m
      LEFT JOIN module_prerequisites mp ON m.id = mp.module_id
      WHERE m.track_id = ? AND m.level = ?
      GROUP BY m.id
      ORDER BY m.sequence_order
    `;
    const modules = await db.all(sql, [trackId, level]);
    
    // Parse prerequisite_ids into array
    return modules.map(module => ({
      ...module,
      prerequisites: module.prerequisite_ids 
        ? module.prerequisite_ids.split(',').map(id => parseInt(id))
        : []
    }));
  }

  static async findById(id) {
    const sql = `SELECT * FROM modules WHERE id = ?`;
    return await db.get(sql, [id]);
  }

  static async getPrerequisites(moduleId) {
    const sql = `
      SELECT m.*
      FROM modules m
      JOIN module_prerequisites mp ON m.id = mp.prerequisite_id
      WHERE mp.module_id = ?
      ORDER BY m.sequence_order
    `;
    return await db.all(sql, [moduleId]);
  }

  static async create(trackId, level, title, description, category, estimatedHours, sequenceOrder) {
    const sql = `
      INSERT INTO modules (track_id, level, title, description, category, estimated_hours, sequence_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await db.run(sql, [trackId, level, title, description, category, estimatedHours, sequenceOrder]);
    return result.lastID;
  }

  static async addPrerequisite(moduleId, prerequisiteId) {
    const sql = `INSERT INTO module_prerequisites (module_id, prerequisite_id) VALUES (?, ?)`;
    await db.run(sql, [moduleId, prerequisiteId]);
  }
}

module.exports = Module;
