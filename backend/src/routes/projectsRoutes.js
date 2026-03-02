/**
 * Projects Workspace API Routes
 * Backend endpoints for project management, version control, and AI code review
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const Project = require('../models/Project');
const Commit = require('../models/Commit');
const AIReview = require('../models/AIReview');

// ==================== PROJECT CRUD ====================

/**
 * @route   GET /api/projects
 * @desc    Get all projects for authenticated user
 * @access  Public (with optional auth)
 */
router.get('/', optionalAuth, async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.user.id })
            .sort({ updatedAt: -1 })
            .populate('latestCommit')
            .populate('latestReview');
        
        res.json({
            success: true,
            projects
        });
    } catch (error) {
        console.error('[Projects API] Error fetching projects:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch projects'
        });
    }
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID
 * @access  Private
 */
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        res.json({
            success: true,
            project
        });
    } catch (error) {
        console.error('[Projects API] Error fetching project:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch project'
        });
    }
});

/**
 * @route   POST /api/projects
 * @desc    Create new project
 * @access  Private
 */
router.post('/', optionalAuth, async (req, res) => {
    try {
        const { name, description, techStack, projectType } = req.body;
        
        // Validation
        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Project name is required'
            });
        }
        
        // Check for duplicate name
        const existingProject = await Project.findOne({
            userId: req.user.id,
            name: name.toLowerCase()
        });
        
        if (existingProject) {
            return res.status(400).json({
                success: false,
                error: 'A project with this name already exists'
            });
        }
        
        // Create project
        const project = new Project({
            userId: req.user.id,
            name: name.trim(),
            description: description?.trim() || 'No description provided',
            techStack: Array.isArray(techStack) ? techStack : techStack?.split(',').map(t => t.trim()).filter(Boolean),
            projectType: projectType || 'other',
            status: 'planning',
            files: {
                'README.md': {
                    path: 'README.md',
                    content: `# ${name}\n\n${description || ''}\n\n## Tech Stack\n${techStack}\n\n## Getting Started\n\nAdd your project files and commit changes to track progress.`,
                    size: 0,
                    lastModified: new Date()
                }
            }
        });
        
        await project.save();
        
        res.status(201).json({
            success: true,
            project
        });
    } catch (error) {
        console.error('[Projects API] Error creating project:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create project'
        });
    }
});

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private
 */
router.put('/:id', optionalAuth, async (req, res) => {
    try {
        const { name, description, techStack, status, files } = req.body;
        
        const project = await Project.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        // Update fields
        if (name) project.name = name.trim();
        if (description !== undefined) project.description = description.trim();
        if (techStack) project.techStack = Array.isArray(techStack) ? techStack : techStack.split(',').map(t => t.trim()).filter(Boolean);
        if (status) project.status = status;
        if (files) project.files = files;
        
        project.updatedAt = new Date();
        await project.save();
        
        res.json({
            success: true,
            project
        });
    } catch (error) {
        console.error('[Projects API] Error updating project:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update project'
        });
    }
});

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  Private
 */
router.delete('/:id', optionalAuth, async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        // Delete related commits and reviews
        await Commit.deleteMany({ projectId: req.params.id });
        await AIReview.deleteMany({ projectId: req.params.id });
        
        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('[Projects API] Error deleting project:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete project'
        });
    }
});

// ==================== VERSION CONTROL ====================

/**
 * @route   GET /api/projects/:id/commits
 * @desc    Get commit history for project
 * @access  Private
 */
router.get('/:id/commits', optionalAuth, async (req, res) => {
    try {
        const commits = await Commit.find({ projectId: req.params.id })
            .sort({ timestamp: -1 })
            .limit(50);
        
        res.json({
            success: true,
            commits
        });
    } catch (error) {
        console.error('[Projects API] Error fetching commits:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch commits'
        });
    }
});

/**
 * @route   POST /api/projects/:id/commit
 * @desc    Create new commit
 * @access  Private
 */
router.post('/:id/commit', optionalAuth, async (req, res) => {
    try {
        const { message, changes, snapshot, triggerAiReview } = req.body;
        
        const project = await Project.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Commit message is required'
            });
        }
        
        if (!changes || !snapshot) {
            return res.status(400).json({
                success: false,
                error: 'Changes and snapshot are required'
            });
        }
        
        // Create commit
        const commit = new Commit({
            projectId: req.params.id,
            userId: req.user.id,
            hash: generateCommitHash(),
            message: message.trim(),
            author: req.user.name || 'You',
            changes: changes || { added: [], modified: [], deleted: [] },
            snapshot: snapshot || project.files
        });
        
        await commit.save();
        
        // Update project
        project.totalCommits++;
        project.latestCommit = commit._id;
        project.updatedAt = new Date();
        
        if (project.status === 'planning') {
            project.status = 'in-progress';
        }
        
        await project.save();
        
        // Trigger AI review if requested
        if (triggerAiReview) {
            // Queue AI review job (use background worker)
            await queueAIReview(project._id, commit._id);
        }
        
        res.status(201).json({
            success: true,
            commit: {
                id: commit._id,
                projectId: commit.projectId,
                hash: commit.hash,
                message: commit.message,
                author: commit.author,
                timestamp: commit.timestamp,
                changes: commit.changes,
                snapshot: commit.snapshot
            },
            aiReviewQueued: triggerAiReview || false,
            message: triggerAiReview ? 'Commit created, AI review queued' : 'Commit created successfully'
        });
    } catch (error) {
        console.error('[Projects API] Error creating commit:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create commit'
        });
    }
});

/**
 * @route   POST /api/projects/:id/rollback/:commitId
 * @desc    Rollback project to specific commit
 * @access  Private
 */
router.post('/:id/rollback/:commitId', optionalAuth, async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        const commit = await Commit.findOne({
            _id: req.params.commitId,
            projectId: req.params.id
        });
        
        if (!commit || !commit.snapshot) {
            return res.status(404).json({
                success: false,
                error: 'Commit snapshot not found'
            });
        }
        
        // Restore files from snapshot
        project.files = commit.snapshot;
        project.updatedAt = new Date();
        
        // Remove commits after this one
        await Commit.deleteMany({
            projectId: req.params.id,
            timestamp: { $gt: commit.timestamp }
        });
        
        // Recalculate total commits
        const remainingCommits = await Commit.countDocuments({ projectId: req.params.id });
        project.totalCommits = remainingCommits;
        
        await project.save();
        
        res.json({
            success: true,
            message: 'Project rolled back successfully',
            project
        });
    } catch (error) {
        console.error('[Projects API] Error rolling back:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to rollback project'
        });
    }
});

// ==================== AI CODE REVIEW ====================

/**
 * @route   GET /api/projects/:id/reviews
 * @desc    Get AI review history for project
 * @access  Private
 */
router.get('/:id/reviews', optionalAuth, async (req, res) => {
    try {
        const reviews = await AIReview.find({ projectId: req.params.id })
            .sort({ timestamp: -1 })
            .populate('commitId');
        
        res.json({
            success: true,
            reviews
        });
    } catch (error) {
        console.error('[Projects API] Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reviews'
        });
    }
});

/**
 * @route   POST /api/projects/:id/review
 * @desc    Trigger AI code review (manual)
 * @access  Private
 */
router.post('/:id/review', optionalAuth, async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            userId: req.user.id
        }).populate('latestCommit');
        
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        if (!project.latestCommit) {
            return res.status(400).json({
                success: false,
                error: 'No commits found. Commit your code first.'
            });
        }
        
        // Queue AI review
        const reviewJob = await queueAIReview(project._id, project.latestCommit._id);
        
        res.json({
            success: true,
            message: 'AI review queued',
            jobId: reviewJob.id
        });
    } catch (error) {
        console.error('[Projects API] Error triggering review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to trigger AI review'
        });
    }
});

/**
 * @route   GET /api/projects/:id/evolution
 * @desc    Get project evolution metrics
 * @access  Private
 */
router.get('/:id/evolution', optionalAuth, async (req, res) => {
    try {
        const reviews = await AIReview.find({ projectId: req.params.id })
            .sort({ timestamp: 1 });
        
        if (reviews.length < 2) {
            return res.json({
                success: true,
                message: 'Not enough data for evolution analysis',
                reviews
            });
        }
        
        const firstReview = reviews[0];
        const latestReview = reviews[reviews.length - 1];
        
        const evolution = {
            overallChange: latestReview.overallScore - firstReview.overallScore,
            codeHealthChange: latestReview.sections.codeHealth.score - firstReview.sections.codeHealth.score,
            architectureChange: latestReview.sections.architecture.score - firstReview.sections.architecture.score,
            securityChange: latestReview.sections.security.score - firstReview.sections.security.score,
            scalabilityChange: latestReview.sections.scalability.score - firstReview.sections.scalability.score,
            reviewCount: reviews.length,
            timeSpan: latestReview.timestamp - firstReview.timestamp,
            reviews
        };
        
        res.json({
            success: true,
            evolution
        });
    } catch (error) {
        console.error('[Projects API] Error fetching evolution:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch evolution data'
        });
    }
});

// ==================== HELPERS ====================

function generateCommitHash() {
    return Math.random().toString(36).substring(2, 9);
}

async function queueAIReview(projectId, commitId) {
    // In production, use a job queue (Bull, BullMQ, etc.)
    // For now, process immediately
    const project = await Project.findById(projectId);
    const commit = await Commit.findById(commitId);
    
    if (!project || !commit) {
        throw new Error('Project or commit not found');
    }
    
    // Run AI analysis (integrate with OpenAI/Claude API here)
    const analysis = await analyzeProjectWithAI(project, commit);
    
    // Save review
    const review = new AIReview({
        projectId,
        commitId,
        userId: project.userId,
        overallScore: analysis.overallScore,
        sections: analysis.sections,
        verdict: analysis.verdict
    });
    
    await review.save();
    
    // Update project
    project.latestAiScore = analysis.overallScore;
    project.latestReview = review._id;
    await project.save();
    
    return { id: review._id, status: 'completed' };
}

async function analyzeProjectWithAI(project, commit) {
    // Placeholder - integrate with actual AI API (OpenAI, Claude, etc.)
    // This should call the real AI analysis logic from projects-workspace.js
    
    // For now, return simulated analysis
    return {
        overallScore: 75,
        sections: {
            codeHealth: { score: 80, issues: [], summary: 'Good' },
            architecture: { score: 75, issues: [], summary: 'Adequate' },
            security: { score: 70, issues: [], summary: 'Needs improvement' },
            scalability: { score: 75, issues: [], summary: 'Good' }
        },
        verdict: {
            level: '💼 Junior Developer Level',
            justification: 'Solid project with room for improvement'
        }
    };
}

module.exports = router;
