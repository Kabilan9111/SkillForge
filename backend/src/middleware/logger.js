'use strict';

/**
 * Structured Logger — SkillForge Backend
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides a lightweight structured logger that writes:
 *   • Human-readable output to stdout in development
 *   • JSON-lines to logs/backend.jsonl in all environments
 *
 * Usage:
 *   const logger = require('../middleware/logger');
 *   logger.info('user.login', { userId, email });
 *   logger.error('db.query_failed', { query, error: err.message });
 *
 *   // Child logger with bound context
 *   const log = logger.child({ requestId, userId });
 *   log.info('api.start', { endpoint });
 */

const fs   = require('fs');
const path = require('path');

// ── Log directory ─────────────────────────────────────────────────────────────
const LOG_DIR  = path.join(__dirname, '..', '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'backend.jsonl');

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

let _fileStream = null;

function _getFileStream() {
    if (!_fileStream) {
        _fileStream = fs.createWriteStream(LOG_FILE, { flags: 'a', encoding: 'utf8' });
        _fileStream.on('error', err => process.stderr.write(`[logger] file error: ${err.message}\n`));
    }
    return _fileStream;
}

// ── Colour helpers (stdout only) ──────────────────────────────────────────────
const IS_TTY = process.stdout.isTTY;
const COLOURS = {
    RESET:    IS_TTY ? '\x1b[0m'  : '',
    GRAY:     IS_TTY ? '\x1b[90m' : '',
    GREEN:    IS_TTY ? '\x1b[32m' : '',
    YELLOW:   IS_TTY ? '\x1b[33m' : '',
    RED:      IS_TTY ? '\x1b[31m' : '',
    MAGENTA:  IS_TTY ? '\x1b[35m' : '',
    CYAN:     IS_TTY ? '\x1b[36m' : '',
};

const LEVEL_COLOR = {
    debug: COLOURS.GRAY,
    info:  COLOURS.GREEN,
    warn:  COLOURS.YELLOW,
    error: COLOURS.RED,
};

// ── Level filter ──────────────────────────────────────────────────────────────
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL = LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ?? LEVELS.info;

// ── Core write ────────────────────────────────────────────────────────────────

function _write(level, event, data = {}, ctx = {}) {
    if ((LEVELS[level] ?? 99) < MIN_LEVEL) return;

    const record = {
        ts:     new Date().toISOString(),
        level,
        event,
        ...ctx,
        ...data,
    };

    // JSON file (always)
    _getFileStream().write(JSON.stringify(record) + '\n');

    // Human console (non-test environments)
    if (process.env.NODE_ENV !== 'test') {
        const colour = LEVEL_COLOR[level] || '';
        const ts     = record.ts.slice(11, 23); // HH:MM:SS.mmm
        const extra  = Object.keys({ ...data, ...ctx }).length
            ? `  ${COLOURS.GRAY}${JSON.stringify({ ...ctx, ...data })}${COLOURS.RESET}`
            : '';
        process.stdout.write(
            `${COLOURS.GRAY}${ts}${COLOURS.RESET}  ${colour}${level.toUpperCase().padEnd(5)}${COLOURS.RESET}  ${COLOURS.CYAN}${event}${COLOURS.RESET}${extra}\n`
        );
    }
}

// ── Express request logger (middleware) ───────────────────────────────────────

function requestLogger(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const ms      = Date.now() - start;
        const level   = res.statusCode >= 500 ? 'error'
                      : res.statusCode >= 400 ? 'warn'
                      : 'info';
        _write(level, 'http.request', {
            method:     req.method,
            path:       req.path,
            status:     res.statusCode,
            ms,
            userId:     req.userId || null,
            ip:         req.ip,
        });
    });
    next();
}

// ── Logger API ────────────────────────────────────────────────────────────────

const logger = {
    debug: (event, data)  => _write('debug', event, data),
    info:  (event, data)  => _write('info',  event, data),
    warn:  (event, data)  => _write('warn',  event, data),
    error: (event, data)  => _write('error', event, data),

    /**
     * Create a child logger with bound context fields.
     * @param {object} ctx - Fields merged into every log record from this child.
     */
    child(ctx) {
        return {
            debug: (event, data) => _write('debug', event, data, ctx),
            info:  (event, data) => _write('info',  event, data, ctx),
            warn:  (event, data) => _write('warn',  event, data, ctx),
            error: (event, data) => _write('error', event, data, ctx),
        };
    },

    /** Express middleware: logs every HTTP request with status + latency */
    requestLogger,
};

module.exports = logger;
