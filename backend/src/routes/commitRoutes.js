/**
 * ========================================
 * PRODUCTION-GRADE COMMIT HANDLER
 * ========================================
 * Git-style version control with:
 * - Content-addressable blob storage
 * - Tree objects for directory structure
 * - Transactional commits
 * - Storage quota enforcement
 * - Async AI review queue
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const crypto = require('crypto');
const zlib = require('zlib');
const { promisify } = require('util');

const gzipAsync = promisify(zlib.gzip);
const gunzipAsync = promisify(zlib.gunzip);

// Models
const Project = require('../models/Project');
const Commit = require('../models/Commit');
const Tree = require('../models/Tree');
const Blob = require('../models/Blob');
const AIReview = require('../models/AIReview');

// Job queue (if available)
let aiReviewQueue = null;
try {
    const Queue = require('bull');
    aiReviewQueue = new Queue('ai-reviews', {
        redis: { port: 6379, host: '127.0.0.1' }
    });
    console.log('[Commit] AI review queue initialized');
} catch (error) {
    console.warn('[Commit] Bull queue not available, using fallback');
}

// ==================== COMMIT CREATION ====================

/**
 * POST /api/projects/:id/commit
 * Create new commit with transactional guarantees
 */
router.post('/:id/commit', async (req, res) => {
    const startTime = Date.now();
    const session = await mongoose.startSession();
    
    try {
        await session.startTransaction();
        
        const { message, changes, files, triggerAiReview } = req.body;
        const projectId = req.params.id;
        const userId = req.userId || req.user?.id;
        
        // ==================== VALIDATION ====================
        
        if (!message || message.trim().length === 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                error: 'Commit message is required'
            });
        }
        
        if (!changes || !changes.added && !changes.modified && !changes.deleted) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                error: 'No changes to commit'
            });
        }
        
        const totalChanges = (changes.added?.length || 0) + 
                           (changes.modified?.length || 0) + 
                           (changes.deleted?.length || 0);
        
        if (totalChanges === 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                error: 'No file changes detected'
            });
        }
        
        if (!files || Object.keys(files).length === 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                error: 'File contents are required'
            });
        }
        
        // ==================== LOAD PROJECT ====================
        
        const project = await Project.findOne({
            _id: projectId,
            userId: userId
        }).session(session);
        
        if (!project) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        // ==================== STORAGE QUOTA CHECK ====================
        
        const commitSize = calculateCommitSize(files);
        
        if (req.user && req.user.storageQuota) {
            const userStorage = req.user.usedStorage || 0;
            
            if (userStorage + commitSize > req.user.storageQuota) {
                await session.abortTransaction();
                return res.status(413).json({
                    success: false,
                    error: 'Storage quota exceeded',
                    quota: req.user.storageQuota,
                    used: userStorage,
                    required: commitSize
                });
            }
        }
        
        // ==================== CREATE BLOB OBJECTS ====================
        
        console.log(`[Commit] Creating blobs for ${Object.keys(files).length} files`);
        
        const blobs = [];
        
        for (const [path, fileData] of Object.entries(files)) {
            // Hash content (SHA-256)
            const hash = crypto.createHash('sha256')
                .update(fileData.content)
                .digest('hex');
            
            // Check if blob already exists (deduplication)
            let blob = await Blob.findOne({ hash }).session(session);
            
            if (!blob) {
                // Compress content
                const compressed = await gzipAsync(Buffer.from(fileData.content, 'utf8'));
                
                // Create new blob
                blob = new Blob({
                    projectId,
                    hash,
                    content: compressed,
                    encoding: 'gzip',
                    size: fileData.content.length,
                    compressedSize: compressed.length,
                    mimeType: getMimeType(path),
                    refCount: 0
                });
                
                await blob.save({ session });
                
                console.log(`[Commit] Created blob: ${hash.substring(0, 8)} (${fileData.content.length} bytes → ${compressed.length} bytes)`);
            }
            
            // Increment reference count
            blob.refCount += 1;
            await blob.save({ session });
            
            blobs.push({
                path,
                blobId: blob._id,
                hash,
                size: fileData.size || fileData.content.length
            });
        }
        
        console.log(`[Commit] Created/referenced ${blobs.length} blobs`);
        
        // ==================== CREATE TREE OBJECT ====================
        
        const tree = new Tree({
            projectId,
            entries: blobs.map(b => ({
                path: b.path,
                type: 'file',
                blobId: b.blobId,
                mode: '100644',
                size: b.size
            }))
        });
        
        await tree.save({ session });
        
        console.log(`[Commit] Created tree: ${tree._id}`);
        
        // ==================== CREATE COMMIT ====================
        
        const commit = new Commit({
            projectId,
            userId,
            hash: generateCommitHash(),
            message: message.trim(),
            author: {
                name: req.user?.name || 'Anonymous',
                email: req.user?.email || 'anonymous@skillforge.dev'
            },
            parentCommits: project.headCommit ? [project.headCommit] : [],
            branch: 'main',
            tree: tree._id,
            changes: {
                added: changes.added || [],
                modified: changes.modified || [],
                deleted: changes.deleted || []
            },
            filesChanged: totalChanges,
            insertions: calculateInsertions(files, changes),
            deletions: calculateDeletions(files, changes)
        });
        
        await commit.save({ session });
        
        console.log(`[Commit] Created commit: ${commit.hash}`);
        
        // ==================== UPDATE PROJECT ====================
        
        project.headCommit = commit._id;
        project.totalCommits = (project.totalCommits || 0) + 1;
        project.totalSize = (project.totalSize || 0) + commitSize;
        project.updatedAt = new Date();
        
        if (project.status === 'planning') {
            project.status = 'in-progress';
        }
        
        await project.save({ session });
        
        // ==================== UPDATE USER STORAGE ====================
        
        if (req.user && req.user.usedStorage !== undefined) {
            req.user.usedStorage = (req.user.usedStorage || 0) + commitSize;
            await req.user.save({ session });
        }
        
        // ==================== COMMIT TRANSACTION ====================
        
        await session.commitTransaction();
        
        const duration = Date.now() - startTime;
        console.log(`[Commit] Transaction committed in ${duration}ms`);
        
        // ==================== QUEUE AI REVIEW (ASYNC) ====================
        
        let aiReviewQueued = false;
        
        if (triggerAiReview && project.aiReviewEnabled !== false) {
            try {
                if (aiReviewQueue) {
                    // Use Bull queue if available
                    await aiReviewQueue.add(
                        {
                            projectId: project._id.toString(),
                            commitId: commit._id.toString(),
                            userId: userId
                        },
                        {
                            attempts: 3,
                            backoff: {
                                type: 'exponential',
                                delay: 2000
                            },
                            timeout: 300000, // 5 minutes
                            removeOnComplete: true
                        }
                    );
                    
                    aiReviewQueued = true;
                    console.log(`[Commit] AI review queued for commit ${commit.hash}`);
                } else {
                    // Fallback: trigger immediately (not recommended for production)
                    console.warn('[Commit] No queue available, triggering AI review synchronously');
                    queueAIReviewFallback(project._id, commit._id, userId).catch(err => {
                        console.error('[Commit] AI review fallback failed:', err);
                    });
                    aiReviewQueued = true;
                }
            } catch (queueError) {
                console.error('[Commit] Failed to queue AI review:', queueError);
                // Don't fail commit if AI queueing fails
            }
        }
        
        // ==================== RESPONSE ====================
        
        res.status(201).json({
            success: true,
            commit: {
                id: commit._id,
                hash: commit.hash,
                message: commit.message,
                author: commit.author,
                timestamp: commit.timestamp,
                changes: commit.changes,
                filesChanged: commit.filesChanged,
                insertions: commit.insertions,
                deletions: commit.deletions
            },
            aiReviewQueued,
            stats: {
                blobsCreated: blobs.length,
                commitSize,
                duration
            }
        });
        
    } catch (error) {
        await session.abortTransaction();
        console.error('[Commit] Error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to create commit',
            message: error.message
        });
    } finally {
        await session.endSession();
    }
});

// ==================== GET COMMIT TREE ====================

/**
 * GET /api/commits/:id/tree
 * Get file tree for a commit (inflate tree + blobs)
 */
router.get('/:id/tree', async (req, res) => {
    try {
        const commit = await Commit.findById(req.params.id).populate('tree');
        
        if (!commit) {
            return res.status(404).json({
                success: false,
                error: 'Commit not found'
            });
        }
        
        if (!commit.tree) {
            return res.status(404).json({
                success: false,
                error: 'Tree not found for commit'
            });
        }
        
        // Inflate tree (load blob contents)
        const tree = await inflateTree(commit.tree);
        
        res.json({
            success: true,
            tree: {
                id: commit.tree._id,
                entries: tree
            }
        });
        
    } catch (error) {
        console.error('[Tree] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load tree'
        });
    }
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate commit hash (SHA-1 style)
 */
function generateCommitHash() {
    return crypto.randomBytes(20).toString('hex');
}

/**
 * Calculate total commit size
 */
function calculateCommitSize(files) {
    let size = 0;
    for (const fileData of Object.values(files)) {
        size += fileData.content?.length || 0;
    }
    return size;
}

/**
 * Calculate insertions (lines added)
 */
function calculateInsertions(files, changes) {
    let insertions = 0;
    
    // Count lines in added files
    if (changes.added) {
        for (const path of changes.added) {
            if (files[path]) {
                insertions += files[path].content.split('\n').length;
            }
        }
    }
    
    // For modified files, would need old content for accurate count
    // Simplified: count total lines
    if (changes.modified) {
        for (const path of changes.modified) {
            if (files[path]) {
                insertions += files[path].content.split('\n').length;
            }
        }
    }
    
    return insertions;
}

/**
 * Calculate deletions (lines removed)
 */
function calculateDeletions(files, changes) {
    // Would need old content for accurate count
    // Simplified: return 0 for now
    return 0;
}

/**
 * Get MIME type from file path
 */
function getMimeType(path) {
    const ext = path.split('.').pop().toLowerCase();
    const mimeTypes = {
        'js': 'text/javascript',
        'jsx': 'text/javascript',
        'ts': 'text/typescript',
        'tsx': 'text/typescript',
        'json': 'application/json',
        'html': 'text/html',
        'css': 'text/css',
        'md': 'text/markdown',
        'txt': 'text/plain',
        'py': 'text/x-python',
        'java': 'text/x-java',
        'cpp': 'text/x-c++',
        'c': 'text/x-c',
        'go': 'text/x-go',
        'rs': 'text/x-rust'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Inflate tree (load blob contents)
 */
async function inflateTree(tree) {
    const entries = [];
    
    for (const entry of tree.entries) {
        if (entry.type === 'file' && entry.blobId) {
            const blob = await Blob.findById(entry.blobId);
            
            if (blob) {
                // Decompress content
                let content = blob.content;
                if (blob.encoding === 'gzip') {
                    const decompressed = await gunzipAsync(blob.content);
                    content = decompressed.toString('utf8');
                } else {
                    content = blob.content.toString('utf8');
                }
                
                entries.push({
                    path: entry.path,
                    content,
                    hash: blob.hash,
                    size: blob.size,
                    lastModified: entry.lastModified || tree.createdAt
                });
            }
        }
    }
    
    return entries;
}

/**
 * Fallback AI review (if no queue available)
 */
async function queueAIReviewFallback(projectId, commitId, userId) {
    // Create review record
    const review = new AIReview({
        projectId,
        commitId,
        userId,
        status: 'queued'
    });
    await review.save();
    
    // In production, this should be a background job
    // For now, just mark as queued
    console.log(`[AI Review] Created review ${review._id} (fallback mode)`);
    
    return review;
}

module.exports = router;
