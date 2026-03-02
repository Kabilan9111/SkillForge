const express = require('express');
const router = express.Router();
const multer = require('multer');
const ProjectWorkspaceController = require('../controllers/projectWorkspaceController');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024  // 10MB per file
    }
});

// Multer error handler middleware
function handleMulterError(err, req, res, next) {
    if (err && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'File too large (max 10MB per file)' });
    }
    if (err) {
        return res.status(400).json({ success: false, error: err.message || 'Upload error' });
    }
    next();
}

// ========================================
// PROJECT ROUTES
// ========================================

// Create project
router.post('/projects', ProjectWorkspaceController.createProject);

// Get user's projects
router.get('/projects', ProjectWorkspaceController.getUserProjects);

// Get project details
router.get('/projects/:id', ProjectWorkspaceController.getProject);

// ========================================
// FILE ROUTES
// ========================================

// Upload files
router.post('/projects/:id/files',
    (req, res, next) => upload.any()(req, res, err => handleMulterError(err, req, res, next)),
    ProjectWorkspaceController.uploadFiles
);

// Get file tree
router.get('/projects/:id/files', ProjectWorkspaceController.getFileTree);

// Get file content
router.get('/projects/:id/commits/:hash/files', ProjectWorkspaceController.getFileContent);

// ========================================
// COMMIT ROUTES
// ========================================

// Create commit
router.post('/projects/:id/commits', ProjectWorkspaceController.createCommit);

// Get commit history
router.get('/projects/:id/commits', ProjectWorkspaceController.getCommits);

// Get commit details
router.get('/commits/:hash', ProjectWorkspaceController.getCommitDetails);

// Get commit diff
router.get('/commits/:hash/diff', ProjectWorkspaceController.getCommitDiff);

// ========================================
// AI REVIEW ROUTES
// ========================================

// Get AI review for commit
router.get('/commits/:hash/ai-review', ProjectWorkspaceController.getAIReview);

// Trigger AI review manually
router.post('/commits/:hash/ai-review/trigger', ProjectWorkspaceController.triggerAIReview);

// ========================================
// EVALUATION ROUTES
// ========================================

// Compare two commits
router.get('/commits/:hash1/compare/:hash2', ProjectWorkspaceController.compareCommits);

// Get project trends
router.get('/projects/:id/trends', ProjectWorkspaceController.getProjectTrends);

module.exports = router;
