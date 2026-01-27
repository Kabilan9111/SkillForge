const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(institutionId, email, password, fullName, role = 'student') {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO users (institution_id, email, password, full_name, role, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `;
    const result = await db.run(sql, [institutionId, email, hashedPassword, fullName, role]);
    return result.lastID;
  }

  static async findById(id) {
    const sql = `
      SELECT u.*, i.name as institution_name, i.type as institution_type
      FROM users u
      JOIN institutions i ON u.institution_id = i.id
      WHERE u.id = ?
    `;
    return await db.get(sql, [id]);
  }

  static async findByEmail(email) {
    const sql = `
      SELECT u.*, i.name as institution_name, i.type as institution_type
      FROM users u
      JOIN institutions i ON u.institution_id = i.id
      WHERE u.email = ?
    `;
    return await db.get(sql, [email]);
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateLastLogin(userId) {
    const sql = `UPDATE users SET last_login = datetime('now') WHERE id = ?`;
    await db.run(sql, [userId]);
  }
}

module.exports = User;
