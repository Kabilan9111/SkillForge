const path = require('path');
const { ProjectWorkspace, ProjectFile, ProjectCommit, ProjectAIReview } = require('../models/ProjectWorkspace');
const FileManager = require('../services/projectWorkspace/fileManager');
const CommitManager = require('../services/projectWorkspace/commitManager');
const AIReviewEngine = require('../services/projectWorkspace/aiReviewEngine');
const EvaluationEngine = require('../services/projectWorkspace/evaluationEngine');
const db = require('../config/database');

class ProjectWorkspaceController {
    /**
     * Create new project
     */
    static async createProject(req, res) {
        try {
            const { name, description, techStack } = req.body;
            const userId = req.user?.id || 1;

            const projectId = await ProjectWorkspace.create(userId, name, description, techStack);

            res.status(201).json({
                success: true,
                projectId,
                message: 'Project created successfully'
            });
        } catch (error) {
            console.error('Create project error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get user's projects
     */
    static async getUserProjects(req, res) {
        try {
            const userId = req.user?.id || 1;
            const projects = await ProjectWorkspace.getUserProjects(userId);

            res.json({
                success: true,
                projects
            });
        } catch (error) {
            console.error('Get projects error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get project details
     */
    static async getProject(req, res) {
        try {
            const { id } = req.params;
            const project = await ProjectWorkspace.getById(id);

            if (!project) {
                return res.status(404).json({ success: false, error: 'Project not found' });
            }

            res.json({
                success: true,
                project
            });
        } catch (error) {
            console.error('Get project error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Upload files to project
     */
    static async uploadFiles(req, res) {
        try {
            const { id } = req.params;
            const files = req.files;

            if (!files || files.length === 0) {
                return res.status(400).json({ success: false, error: 'No files uploaded' });
            }

            const binaryExts = new Set(['.jpg','.jpeg','.png','.gif','.bmp','.ico','.svg',
                '.pdf','.zip','.tar','.gz','.rar','.7z',
                '.exe','.dll','.so','.bin','.wasm',
                '.mp3','.mp4','.wav','.ogg','.webm','.avi','.mov']);

            const processedFiles = [];

            for (const file of files) {
                const ext = path.extname(file.originalname).toLowerCase();
                const isBinary = binaryExts.has(ext);
                const filePath = file.originalname; // browser sets webkitRelativePath as the filename
                const fileName = path.basename(filePath);
                const content = isBinary
                    ? '[binary file — content not stored]'
                    : (file.buffer ? file.buffer.toString('utf8') : '');

                await db.run(
                    `INSERT INTO projects_files
                     (project_id, file_path, file_name, file_type, file_size, file_content, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
                    [id, filePath, fileName, ext.slice(1) || 'txt', file.size, content]
                );

                processedFiles.push({ name: fileName, path: filePath, size: file.size, type: ext.slice(1) || 'txt' });
            }

            // Bump project updated_at
            await db.run(
                `UPDATE projects_workspace SET updated_at = datetime('now') WHERE id = ?`,
                [id]
            );

            res.json({
                success: true,
                filesProcessed: processedFiles.length,
                files: processedFiles
            });
        } catch (error) {
            console.error('Upload files error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Create commit
     */
    static async createCommit(req, res) {
        try {
            const { id } = req.params;
            const { message } = req.body;
            const userId = req.user?.id || 1;

            if (!message || !message.trim()) {
                return res.status(400).json({ success: false, error: 'Commit message is required' });
            }

            // Get all uncommitted files for this project
            const files = await db.all(
                `SELECT id, file_path, file_name, file_type, file_size, file_content FROM projects_files
                 WHERE project_id = ? AND (commit_hash IS NULL OR commit_hash = '')`,
                [id]
            );

            // If no uncommitted files, commit ALL current files (first commit case)
            const filesToCommit = files.length > 0 ? files : await db.all(
                `SELECT id, file_path, file_name, file_type, file_size, file_content FROM projects_files WHERE project_id = ?`,
                [id]
            );

            const filesCount = filesToCommit.length;

            // Compute real line counts from file content
            let totalLines = 0;
            for (const f of filesToCommit) {
                if (f.file_content && !f.file_content.startsWith('[binary')) {
                    totalLines += (f.file_content.match(/\n/g) || []).length + 1;
                }
            }

            // Generate commit hash
            const crypto = require('crypto');
            const commitHash = crypto.createHash('sha1')
                .update(`${id}-${userId}-${Date.now()}-${message}`)
                .digest('hex')
                .substring(0, 7);

            await db.run(
                `INSERT INTO projects_commits (project_id, user_id, commit_hash, message, files_count, total_lines, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
                [id, userId, commitHash, message.trim(), filesCount, totalLines]
            );

            // Tag files with this commit hash
            if (filesToCommit.length > 0) {
                const fileIds = filesToCommit.map(f => f.id);
                await db.run(
                    `UPDATE projects_files SET commit_hash = ? WHERE id IN (${fileIds.map(() => '?').join(',')})`,
                    [commitHash, ...fileIds]
                );
            }

            await db.run(
                `UPDATE projects_workspace SET updated_at = datetime('now') WHERE id = ?`, [id]
            );

            // Build file summary list (up to 10 for response)
            const fileList = filesToCommit.slice(0, 10).map(f => ({
                name: f.file_name,
                path: f.file_path,
                type: f.file_type,
                size: f.file_size,
                lines: f.file_content && !f.file_content.startsWith('[binary')
                    ? (f.file_content.match(/\n/g) || []).length + 1
                    : 0
            }));

            res.json({
                success: true,
                commit: { commitHash, message: message.trim(), filesCount, totalLines, files: fileList }
            });
        } catch (error) {
            console.error('Create commit error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get commit history
     */
    static async getCommits(req, res) {
        try {
            const { id } = req.params;
            const limit = parseInt(req.query.limit) || 50;

            const commits = await db.all(
                `SELECT * FROM projects_commits WHERE project_id = ? ORDER BY created_at DESC LIMIT ?`,
                [id, limit]
            );

            // Attach file list to each commit (with backfill for legacy commits)
            const commitsWithFiles = await Promise.all((commits || []).map(async (commit) => {
                let files = await db.all(
                    `SELECT file_name, file_path, file_type, file_size, file_content
                     FROM projects_files WHERE project_id = ? AND commit_hash = ? ORDER BY file_path LIMIT 20`,
                    [id, commit.commit_hash]
                );

                // Fallback for old commits: use project files and backfill
                if (files.length === 0) {
                    files = await db.all(
                        `SELECT file_name, file_path, file_type, file_size, file_content
                         FROM projects_files WHERE project_id = ? ORDER BY file_path LIMIT 20`,
                        [id]
                    );
                    if (files.length > 0) {
                        await db.run(
                            `UPDATE projects_files SET commit_hash = ? WHERE project_id = ? AND (commit_hash IS NULL OR commit_hash = '')`,
                            [commit.commit_hash, id]
                        );
                        // Only recompute if total_lines is missing (preserve existing files_count)
                        if (!commit.total_lines) {
                            const allFiles = await db.all(
                                `SELECT file_content FROM projects_files WHERE project_id = ?`, [id]
                            );
                            const totalLines = allFiles.reduce((sum, f) => {
                                if (f.file_content && !f.file_content.startsWith('[binary')) {
                                    return sum + (f.file_content.match(/\n/g) || []).length + 1;
                                }
                                return sum;
                            }, 0);
                            const realCount = commit.files_count || allFiles.length;
                            if (totalLines > 0) {
                                await db.run(
                                    `UPDATE projects_commits SET total_lines = ? WHERE id = ?`,
                                    [totalLines, commit.id]
                                );
                                commit.total_lines = totalLines;
                            }
                            commit.files_count = realCount;
                        }
                    }
                }

                return {
                    ...commit,
                    // Always use actual DB count, not stored value (guards against stale data)
                    files_count: (await db.get(
                        `SELECT COUNT(*) as cnt FROM projects_files WHERE project_id = ? AND commit_hash = ?`,
                        [id, commit.commit_hash]
                    ))?.cnt || commit.files_count || 0,
                    files: files.map(f => ({
                        name: f.file_name,
                        path: f.file_path,
                        type: f.file_type,
                        size: f.file_size,
                        lines: f.file_content && !f.file_content.startsWith('[binary')
                            ? (f.file_content.match(/\n/g) || []).length + 1
                            : 0
                    }))
                };
            }));

            res.json({
                success: true,
                commits: commitsWithFiles
            });
        } catch (error) {
            console.error('Get commits error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get commit details
     */
    static async getCommitDetails(req, res) {
        try {
            const { hash } = req.params;

            const commit = await CommitManager.getCommitDetails(hash);

            if (!commit) {
                return res.status(404).json({ success: false, error: 'Commit not found' });
            }

            res.json({
                success: true,
                commit
            });
        } catch (error) {
            console.error('Get commit details error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get commit diff
     */
    static async getCommitDiff(req, res) {
        try {
            const { hash } = req.params;
            const { compareWith } = req.query;

            if (!compareWith) {
                return res.status(400).json({ success: false, error: 'compareWith parameter required' });
            }

            const diff = await CommitManager.getCommitDiff(hash, compareWith);

            res.json({
                success: true,
                diff
            });
        } catch (error) {
            console.error('Get diff error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get AI review for commit
     */
    static async getAIReview(req, res) {
        try {
            const { hash } = req.params;

            const commit = await ProjectCommit.getByHash(hash);
            if (!commit) {
                return res.status(404).json({ success: false, error: 'Commit not found' });
            }

            const review = await ProjectAIReview.getByCommit(commit.id);

            if (!review) {
                return res.status(404).json({ success: false, error: 'AI review not found' });
            }

            res.json({
                success: true,
                review
            });
        } catch (error) {
            console.error('Get AI review error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Trigger AI review manually
     */
    static async triggerAIReview(req, res) {
        try {
            const { hash } = req.params;

            // Start review in background
            AIReviewEngine.analyzeCommit(hash).catch(err => {
                console.error('AI review failed:', err);
            });

            res.json({
                success: true,
                message: 'AI review started'
            });
        } catch (error) {
            console.error('Trigger AI review error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get file tree
     */
    static async getFileTree(req, res) {
        try {
            const { id } = req.params;

            const files = await db.all(
                `SELECT file_path, file_name, file_type, file_size, file_content, created_at FROM projects_files WHERE project_id = ? ORDER BY file_path`,
                [id]
            );

            res.json({
                success: true,
                files: files || [],
                tree: files || []
            });
        } catch (error) {
            console.error('Get file tree error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get file content
     */
    static async getFileContent(req, res) {
        try {
            const { id, hash } = req.params;
            const { path: filePath } = req.query;

            if (!filePath) {
                return res.status(400).json({ success: false, error: 'File path required' });
            }

            const content = await FileManager.getFileContent(id, hash, filePath);

            res.json({
                success: true,
                content,
                path: filePath
            });
        } catch (error) {
            console.error('Get file content error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Compare two commits
     */
    static async compareCommits(req, res) {
        try {
            const { hash1, hash2 } = req.params;

            const evaluation = await EvaluationEngine.compareCommits(hash1, hash2);

            res.json({
                success: true,
                evaluation
            });
        } catch (error) {
            console.error('Compare commits error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get project trends
     */
    static async getProjectTrends(req, res) {
        try {
            const { id } = req.params;
            const limit = parseInt(req.query.limit) || 20;

            const trends = await EvaluationEngine.getProjectTrends(id, limit);

            res.json({
                success: true,
                trends
            });
        } catch (error) {
            console.error('Get trends error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = ProjectWorkspaceController;
