const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

/**
 * Optional Authentication Middleware
 * Allows both authenticated and guest access
 * If auth token is provided, validates and attaches user
 * If no token, creates a guest session
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      try {
        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret);

        // Get user from database
        const user = await User.findById(decoded.userId);

        if (user) {
          // Attach authenticated user
          req.user = user;
          req.userId = user.id;
          req.institutionId = user.institution_id;
          req.isAuthenticated = true;
        }
      } catch (error) {
        // Invalid token - continue as guest
        console.warn('[OptionalAuth] Invalid token, continuing as guest');
      }
    }

    // No token or invalid token - continue as guest
    if (!req.user) {
      req.user = {
        id: 'guest',
        name: 'Guest User'
      };
      req.userId = 'guest';
      req.isAuthenticated = false;
    }

    next();
  } catch (error) {
    console.error('[OptionalAuth] Middleware error:', error);
    // On error, continue as guest
    req.user = {
      id: 'guest',
      name: 'Guest User'
    };
    req.userId = 'guest';
    req.isAuthenticated = false;
    next();
  }
};

module.exports = optionalAuth;
