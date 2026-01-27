require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

// Absolute base path (THIS is the key fix)
const BASE_PATH = __dirname;

// Core imports (fixed paths)
const config = require(path.join(BASE_PATH, 'src/config/config'));
const database = require(path.join(BASE_PATH, 'src/config/database'));
const routes = require(path.join(BASE_PATH, 'src/routes'));
const errorHandler = require(path.join(BASE_PATH, 'src/middleware/errorHandler'));
const initializeDatabase = require(path.join(BASE_PATH, 'src/scripts/initDatabase'));

const app = express();

// =====================
// Middleware
// =====================
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development only)
if (config.env === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// =====================
// Routes
// =====================
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SkillForge Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      user: '/api/user',
      tracks: '/api/track',
      roadmap: '/api/roadmap',
      progress: '/api/progress'
    }
  });
});

// =====================
// Error Handling
// =====================

// Error handler (must be before 404)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// =====================
// Server Bootstrap
// =====================
const startServer = async () => {
  try {
    await database.connect();
    console.log('✓ Database connected');

    await initializeDatabase();
    console.log('✓ Database schema ready');

    app.listen(config.port, () => {
      console.log('\n🚀 SkillForge Backend running');
      console.log(`📍 Environment : ${config.env}`);
      console.log(`🌐 API         : http://localhost:${config.port}/api`);
      console.log(`💚 Health      : http://localhost:${config.port}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// =====================
// Graceful Shutdown
// =====================
const shutdown = async () => {
  console.log('\nShutting down gracefully...');
  await database.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start server
startServer();

module.exports = app;
