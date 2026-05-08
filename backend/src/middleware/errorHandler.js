'use strict';

const logger = require('./logger');

/**
 * Global Express error handler.
 * Converts any error thrown or passed via next(err) to a structured JSON response.
 * Logs every error with context.
 */
const errorHandler = (err, req, res, next) => {
    // Default
    let status  = 500;
    let message = 'Internal server error';
    let code    = 'INTERNAL_ERROR';

    // ── JWT / Auth errors ────────────────────────────────────────────
    if (err.name === 'JsonWebTokenError') {
        status  = 401;
        message = 'Invalid authentication token';
        code    = 'INVALID_TOKEN';
    } else if (err.name === 'TokenExpiredError') {
        status  = 401;
        message = 'Authentication token has expired. Please log in again.';
        code    = 'TOKEN_EXPIRED';

    // ── Validation errors ────────────────────────────────────────────
    } else if (err.name === 'ValidationError') {
        status  = 400;
        message = err.message;
        code    = 'VALIDATION_ERROR';

    // ── Multer file errors ───────────────────────────────────────────
    } else if (err.code === 'LIMIT_FILE_SIZE') {
        status  = 413;
        message = 'Uploaded file is too large.';
        code    = 'FILE_TOO_LARGE';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        status  = 400;
        message = 'Unexpected file field in upload.';
        code    = 'UNEXPECTED_FILE';

    // ── SQLite / DB errors ───────────────────────────────────────────
    } else if (err.code === 'SQLITE_CONSTRAINT') {
        status  = 400;
        message = 'A record with that value already exists.';
        code    = 'DB_CONSTRAINT';

    // ── HTTP errors with explicit status ────────────────────────────
    } else if (err.status && err.status < 600) {
        status  = err.status;
        message = err.message || message;
        code    = err.code    || code;
    }

    // ── Log ─────────────────────────────────────────────────────────
    const logLevel = status >= 500 ? 'error' : 'warn';
    logger[logLevel]('http.error', {
        status,
        code,
        message,
        method:  req.method,
        path:    req.path,
        userId:  req.userId  || null,
        ip:      req.ip,
        stack:   status >= 500 ? err.stack : undefined,
    });

    res.status(status).json({
        error: message,
        code,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;

