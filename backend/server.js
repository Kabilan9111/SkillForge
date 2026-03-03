require('dotenv').config();
const path = require('path');
const express = require('express');

// Absolute base path
const BASE_PATH = __dirname;
// Frontend lives one level up in roadmap-dashboard/
const FRONTEND_PATH = path.join(BASE_PATH, '..', 'roadmap-dashboard');

// Core imports
const config = require(path.join(BASE_PATH, 'src/config/config'));
const database = require(path.join(BASE_PATH, 'src/config/database'));
const routes = require(path.join(BASE_PATH, 'src/routes'));
const errorHandler = require(path.join(BASE_PATH, 'src/middleware/errorHandler'));
const initializeDatabase = require(path.join(BASE_PATH, 'src/scripts/initDatabase'));
const CodersDNA = require(path.join(BASE_PATH, 'src/models/CodersDNA'));

const app = express();

// =====================
// Body parsing
// =====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// Serve frontend static files
// =====================
app.use(express.static(FRONTEND_PATH));

// Request logging (development only)
if (config.env === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// =====================
// API Routes (must come BEFORE SPA fallback)
// =====================
app.use('/api', routes);

// =====================
// Error Handling
// =====================
app.use(errorHandler);

// =====================
// API 404 — must be BEFORE SPA fallback so unknown /api/* never returns HTML
// =====================
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// =====================
// Multi-page + SPA Fallback
// =====================

// Named pages (clean URLs without .html extension)
app.get('/workspace', (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, 'workspace.html'));
});
app.get('/dna-dashboard', (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, 'dna-dashboard.html'));
});

// Catch-all fallback → index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
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

    // Ensure workspace tables exist (created once, never dropped by initDatabase)
    await database.run(`
      CREATE TABLE IF NOT EXISTS projects_workspace (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        tech_stack TEXT,
        visibility TEXT DEFAULT 'private',
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);
    await database.run(`
      CREATE TABLE IF NOT EXISTS projects_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        file_name TEXT,
        file_type TEXT,
        file_size INTEGER DEFAULT 0,
        file_content TEXT,
        commit_hash TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    await database.run(`
      CREATE TABLE IF NOT EXISTS projects_commits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        commit_hash TEXT NOT NULL UNIQUE,
        message TEXT NOT NULL,
        files_count INTEGER DEFAULT 0,
        total_lines INTEGER DEFAULT 0,
        additions INTEGER DEFAULT 0,
        deletions INTEGER DEFAULT 0,
        file_diffs TEXT DEFAULT '[]',
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    await database.run(`
      CREATE TABLE IF NOT EXISTS projects_ai_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        commit_hash TEXT NOT NULL,
        overall_score INTEGER DEFAULT 0,
        review_data TEXT DEFAULT '{}',
        model_version TEXT DEFAULT 'pending',
        status TEXT DEFAULT 'in_progress',
        code_quality TEXT,
        security TEXT,
        performance TEXT,
        maintainability TEXT,
        suggestions TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(project_id, commit_hash)
      )
    `);
    console.log('✓ Workspace tables ready');

    // Coder's DNA Engine setup
    await CodersDNA.initSchema();
    await CodersDNA.seedProblems();

    app.listen(config.port, () => {
      console.log('\n🚀 SkillForge – Unified Full-Stack Server');
      console.log(`📍 Environment : ${config.env}`);
      console.log(`🌐 App          : http://localhost:${config.port}`);
      console.log(`🔌 API          : http://localhost:${config.port}/api`);
      console.log(`💚 Health       : http://localhost:${config.port}/api/health\n`);
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
