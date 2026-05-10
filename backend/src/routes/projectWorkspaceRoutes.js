const express = require('express');
const router = express.Router();
const multer = require('multer');
const ProjectWorkspaceController = require('../controllers/projectWorkspaceController');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Multer error handler middleware
function handleMulterError(err, req, res, next) {
    if (err) {
        return res.status(400).json({ success: false, error: err.message || 'Upload error' });
    }
    next();
}

const uploadMiddleware = (req, res, next) =>
    upload.any()(req, res, err => handleMulterError(err, req, res, next));

// ========================================
// PROJECT ROUTES
// ========================================

// Create project
router.post('/projects', ProjectWorkspaceController.createProject);

// Get user's projects
router.get('/projects', ProjectWorkspaceController.getUserProjects);

// Get project details — both /projects/:id and /:id
router.get('/projects/:id', ProjectWorkspaceController.getProject);
router.get('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', ProjectWorkspaceController.getProject);
router.get('/:id([0-9]+)', ProjectWorkspaceController.getProject);

// ========================================
// FILE ROUTES — both /projects/:id/... and /:id/...
// ========================================

// Upload files
router.post('/projects/:id/files', uploadMiddleware, ProjectWorkspaceController.uploadFiles);
router.post('/:id/files',          uploadMiddleware, ProjectWorkspaceController.uploadFiles);

// Get file tree
router.get('/projects/:id/files', ProjectWorkspaceController.getFileTree);
router.get('/:id/files',          ProjectWorkspaceController.getFileTree);

// Get file content
router.get('/projects/:id/commits/:hash/files', ProjectWorkspaceController.getFileContent);
router.get('/:id/commits/:hash/files',          ProjectWorkspaceController.getFileContent);

// ========================================
// COMMIT ROUTES — both /projects/:id/... and /:id/...
// ========================================

// Create commit
router.post('/projects/:id/commits', ProjectWorkspaceController.createCommit);
router.post('/:id/commits',          ProjectWorkspaceController.createCommit);

// Get commit history
router.get('/projects/:id/commits', ProjectWorkspaceController.getCommits);
router.get('/:id/commits',          ProjectWorkspaceController.getCommits);

// Get commit details
router.get('/commits/:hash', ProjectWorkspaceController.getCommitDetails);

// Get commit diff
router.get('/commits/:hash/diff', ProjectWorkspaceController.getCommitDiff);

// ========================================
// ANALYSIS & EVALUATION ROUTES
// ========================================

// Get latest AI analysis for project
router.get('/projects/:id/analysis', ProjectWorkspaceController.getAnalysis);
router.get('/:id/analysis',          ProjectWorkspaceController.getAnalysis);

// Get latest evaluation for project
router.get('/projects/:id/evaluation', ProjectWorkspaceController.getEvaluation);
router.get('/:id/evaluation',          ProjectWorkspaceController.getEvaluation);

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
router.get('/:id/trends',          ProjectWorkspaceController.getProjectTrends);

// Get aggregated project stats
router.get('/projects/:id/stats', ProjectWorkspaceController.getProjectStats);
router.get('/:id/stats',          ProjectWorkspaceController.getProjectStats);

// Get 90-day commit activity
router.get('/projects/:id/activity', ProjectWorkspaceController.getProjectActivity);
router.get('/:id/activity',          ProjectWorkspaceController.getProjectActivity);

module.exports = router;
