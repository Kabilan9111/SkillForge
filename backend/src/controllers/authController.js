const AuthService = require('../services/authService');

class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await AuthService.login(email, password);

      const ProjectInvite = require('../models/ProjectInvite');
      try {
        await ProjectInvite.processPendingInvitesForEmail(email, result.user.id);
      } catch (err) {
        console.error('Error processing invites on login:', err);
      }

      res.json({
        message: 'Login successful',
        user: result.user,
        token: result.token
      });
    } catch (error) {
      next(error);
    }
  }

  static async register(req, res, next) {
    try {
      const { institutionId, email, password, fullName } = req.body;

      if (!institutionId || !email || !password || !fullName) {
        return res.status(400).json({ 
          error: 'Institution ID, email, password, and full name are required' 
        });
      }

      const result = await AuthService.register(institutionId, email, password, fullName);

      const ProjectInvite = require('../models/ProjectInvite');
      try {
        await ProjectInvite.processPendingInvitesForEmail(email, result.user.id);
      } catch (err) {
        console.error('Error processing invites on register:', err);
      }

      res.status(201).json({
        message: 'Registration successful',
        user: result.user,
        token: result.token
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyToken(req, res) {
    // If we reach here, the auth middleware has already verified the token
    res.json({
      valid: true,
      user: req.user
    });
  }
}

module.exports = AuthController;
