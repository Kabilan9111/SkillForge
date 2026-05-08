'use strict';

/**
 * Project Analyzer Routes
 * POST /api/project-analyzer/analyze   — Analyze uploaded code files / ZIP / pasted code
 * POST /api/project-analyzer/text      — Analyze raw code text (pasted snippets)
 * GET  /api/project-analyzer/health    — Health check
 *
 * Requires: Authorization: Bearer <token>
 */

const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs').promises;
const os      = require('os');

const auth               = require('../middleware/auth');
const projectAnalyzer    = require('../services/projectAnalyzerService');
const logger             = require('../middleware/logger');

// ── File upload config ────────────────────────────────────────────────────────

const storage = multer.memoryStorage(); // keep in memory, pass buffer to analyzer

const upload = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024,    // 20 MB max
        files: 20,                      // max 20 files at once
    },
    fileFilter: (req, file, cb) => {
        const allowed = new Set([
            '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go',
            '.rs', '.cpp', '.c', '.cs', '.rb', '.php', '.swift',
            '.kt', '.scala', '.sh', '.sql', '.html', '.css', '.scss',
            '.yaml', '.yml', '.json', '.md', '.tf', '.txt', '.zip',
        ]);
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.has(ext)) return cb(null, true);
        cb(new Error(`File type '${ext}' is not supported.`));
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/project-analyzer/analyze
// Analyze uploaded source code files (supports multi-file and .zip)
// ─────────────────────────────────────────────────────────────────────────────

router.post('/analyze', auth, upload.array('files', 20), async (req, res) => {
    const log = logger.child({ endpoint: 'project-analyzer/analyze', user: req.userId });

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded. Please attach at least one source code file.',
            });
        }

        const { projectName = 'My Project', targetStack = 'general' } = req.body;

        log.info('project_analyzer.start', {
            projectName,
            fileCount: req.files.length,
            totalBytes: req.files.reduce((s, f) => s + f.size, 0),
        });

        // If a single ZIP is uploaded, extract and analyze it
        const zipFile = req.files.length === 1 && req.files[0].originalname.endsWith('.zip')
            ? req.files[0]
            : null;

        let result;

        if (zipFile) {
            // ZIP mode
            result = await projectAnalyzer.analyzeZip(zipFile.buffer, {
                projectName,
                targetStack,
                userId: req.userId,
            });
        } else {
            // Multi-file mode: write to temp dir, analyze, clean up
            const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'skillforge-proj-'));
            try {
                for (const f of req.files) {
                    const dest = path.join(tmpDir, f.originalname.replace(/[^a-zA-Z0-9._\-]/g, '_'));
                    await fs.writeFile(dest, f.buffer);
                }
                result = await projectAnalyzer.analyzeDirectory(tmpDir, {
                    projectName,
                    targetStack,
                    userId: req.userId,
                });
            } finally {
                fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
            }
        }

        log.info('project_analyzer.complete', {
            overallScore:       result.overallScore,
            productionReadiness: result.productionReadiness,
            securityCritical:   result.security.summary.critical,
        });

        res.json({ success: true, ...result });

    } catch (err) {
        log.error('project_analyzer.error', { message: err.message });
        const status = err.message.includes('No analyzable') ? 422 : 500;
        res.status(status).json({
            success: false,
            error:   err.message || 'Project analysis failed',
        });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/project-analyzer/text
// Analyze a pasted code snippet or plain text
// ─────────────────────────────────────────────────────────────────────────────

router.post('/text', auth, express.json(), async (req, res) => {
    const log = logger.child({ endpoint: 'project-analyzer/text', user: req.userId });

    try {
        const { code, language = 'unknown', filename = 'snippet.txt', projectName = 'Code Snippet' } = req.body;

        if (!code || code.trim().length < 20) {
            return res.status(400).json({
                success: false,
                error: 'Code content is required and must be at least 20 characters.',
            });
        }

        log.info('project_analyzer.text_start', { filename, language, codeLen: code.length });

        // Build a single-file structure for the analyzer
        const ext = path.extname(filename) || `.${language}` || '.txt';
        const files = [{ path: filename, ext, content: code, size: code.length }];

        // Directly call the internal pipeline
        const result = await projectAnalyzer._runPipeline(files, {
            projectName,
            targetStack: language,
            userId: req.userId,
        });

        log.info('project_analyzer.text_complete', { overallScore: result.overallScore });
        res.json({ success: true, ...result });

    } catch (err) {
        log.error('project_analyzer.text_error', { message: err.message });
        res.status(500).json({ success: false, error: err.message || 'Code analysis failed' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/project-analyzer/health
// ─────────────────────────────────────────────────────────────────────────────

router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Project Analyzer',
        version: '1.0.0',
        capabilities: [
            'file-upload (source files + .zip)',
            'text-paste (code snippets)',
            'architecture-detection',
            'security-hygiene-scan',
            'performance-analysis',
            'quality-scoring',
            'production-readiness-verdict',
        ],
    });
});

module.exports = router;
