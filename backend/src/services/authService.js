const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class AuthService {
  static async login(email, password) {
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
