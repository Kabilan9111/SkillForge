require('dotenv').config();
const path = require('path');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

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
const logger = require(path.join(BASE_PATH, 'src/middleware/logger'));
const cors = require('cors');

const app = express();

// =====================
// CORS — allow Live Server (5500) and any localhost port during development
// =====================
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any localhost / 127.0.0.1 origin regardless of port
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('CORS: origin not allowed — ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// =====================
// Body parsing
// =====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// Serve frontend static files
// =====================
app.use(express.static(FRONTEND_PATH));

// =====================
// Structured request logging (all environments)
// =====================
app.use(logger.requestLogger);

// =====================
// AI Engine Proxy (Python FastAPI on port 8001)
// All /api/ai/* requests are forwarded to the SkillForge AI Engine
// =====================
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8001';
app.use(
  '/api/ai',
  createProxyMiddleware({
    target: AI_ENGINE_URL,
    changeOrigin: true,
    // Express strips the mount prefix (/api/ai) before passing req.url to the proxy,
    // so pathRewrite sees only the remainder (e.g. "/pipeline/analyze").
    // We prepend /api/ to reach the AI engine's /api/* routes.
    pathRewrite: { '^/': '/api/' },
    on: {
      error: (err, req, res) => {
        console.warn('[AI Proxy] AI Engine unavailable:', err.message);
        res.status(503).json({
          error: 'AI Engine unavailable',
          message: 'The Python AI Engine (port 8001) is not running. Start it with: python main.py',
          ai_engine_url: AI_ENGINE_URL,
        });
      },
    },
  })
);

// AI Engine health passthrough
app.get('/api/ai-engine/status', async (req, res) => {
  const axios = require('axios');
  try {
    const { data } = await axios.get(`${AI_ENGINE_URL}/health`, { timeout: 3000 });
    res.json({ online: true, ...data });
  } catch {
    res.json({ online: false, url: AI_ENGINE_URL, message: 'AI Engine not running' });
  }
});

// =====================
// API Routes (must come BEFORE SPA fallback)
// =====================
app.use('/api', routes);

// =====================
// API 404 — must be BEFORE SPA fallback so unknown /api/* never returns HTML
// =====================
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// =====================
// Error Handling (after API routes and 404, before SPA)
// =====================
app.use(errorHandler);

// =====================
// Multi-page + SPA Fallback
// =====================

// Named pages (clean URLs without .html extension)
app.get('/login', (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, 'login.html'));
});
app.get('/workspace', (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, 'workspace.html'));
});
app.get('/dna-dashboard', (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, 'dna-dashboard.html'));
});

const ProjectInvite = require(path.join(BASE_PATH, 'src/models/ProjectInvite'));
app.get('/invite/:token', async (req, res) => {
    try {
        const token = req.params.token;
        const invite = await ProjectInvite.getInviteByToken(token);
        if (!invite) return res.redirect('/login');
        
        // As a pure backend API, we handle the workflow by redirecting or providing endpoints
        // Since we can't check localStorage, we redirect to a unified entry point or login
        // Assuming a cookie 'token' might exist, but usually it's in localStorage.
        // We'll redirect to workspace with an ?invite=... query param, but the instruction says:
        // "If not logged in: redirect to signup"
        // Since we can't check frontend state from backend GET, we redirect to login/signup.
        res.redirect(`/login?invite_token=${token}`);
    } catch (err) {
        res.redirect('/login');
    }
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

    // UUID-keyed workspace tables for localStorage-generated projects
    await database.run(`
      CREATE TABLE IF NOT EXISTS workspace_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id TEXT NOT NULL,
        commit_hash TEXT,
        file_path TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_type TEXT,
        file_size INTEGER DEFAULT 0,
        file_content TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    await database.run(`
      CREATE TABLE IF NOT EXISTS workspace_commits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id TEXT NOT NULL,
        user_id INTEGER DEFAULT 0,
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
    await database.run(`CREATE INDEX IF NOT EXISTS idx_wfiles_project ON workspace_files(project_id)`);
    await database.run(`CREATE INDEX IF NOT EXISTS idx_wcommits_project ON workspace_commits(project_id)`);
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
