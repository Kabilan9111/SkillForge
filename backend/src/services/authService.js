const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// ─── Permanent demo account (from .env, never removed) ────────────────────────
const DEMO_EMAIL    = process.env.DEMO_EMAIL    || 'admin@skillforge.dev';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'SkillForge@2026';

class AuthService {
  static async login(email, password) {
    // ── Demo account shortcut ────────────────────────────────────────────────
    // Works without a database row — survives fresh DB resets and demos.
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const token = jwt.sign(
        {
          userId:        0,
          institutionId: 1,
          role:          'admin',
          email:         DEMO_EMAIL,
          demo:          true,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      return {
        user: {
          id:               0,
          email:            DEMO_EMAIL,
          full_name:        'SkillForge Admin',
          role:             'admin',
          institution_id:   1,
          institution_name: 'SkillForge Demo Institution',
          demo:             true,
        },
        token,
      };
    }

    // Find user by email
    const user = await User.findByEmail(email);

    if (!user) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password);

    if (!isValidPassword) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    // Update last login
    await User.updateLastLogin(user.id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        institutionId: user.institution_id,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Remove password from response
    delete user.password;

    return { user, token };
  }

  static async register(institutionId, email, password, fullName) {
    // Check if user already exists
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      throw { status: 400, message: 'User with this email already exists' };
    }

    // Create new user
    const userId = await User.create(institutionId, email, password, fullName);

    // Get the created user
    const user = await User.findById(userId);

    // Generate token
    const token = jwt.sign(
      { 
        userId: user.id,
        institutionId: user.institution_id,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Remove password from response
    delete user.password;

    return { user, token };
  }
}

module.exports = AuthService;
