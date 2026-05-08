const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // ── Demo token: skip DB lookup, synthesise user object ──────────────────
    if (decoded.demo === true) {
      req.user = {
        id:               0,
        email:            decoded.email,
        full_name:        'SkillForge Admin',
        role:             'admin',
        institution_id:   decoded.institutionId || 1,
        institution_name: 'SkillForge Demo Institution',
        demo:             true,
      };
      req.userId        = 0;
      req.institutionId = decoded.institutionId || 1;
      return next();
    }

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;
    req.institutionId = user.institution_id;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Admin middleware
auth.admin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

// Optional auth - attach user if token exists, but don't require it
auth.optional = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next(); // No token, continue without user
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    // Demo token shortcut
    if (decoded.demo === true) {
      req.user = {
        id: 0, email: decoded.email, full_name: 'SkillForge Admin',
        role: 'admin', institution_id: decoded.institutionId || 1,
        institution_name: 'SkillForge Demo Institution', demo: true,
      };
      req.userId = 0;
      req.institutionId = decoded.institutionId || 1;
      return next();
    }

    const user = await User.findById(decoded.userId);

    if (user) {
      req.user = user;
      req.userId = user.id;
      req.institutionId = user.institution_id;
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};

// Required auth
auth.required = auth;

module.exports = auth;
