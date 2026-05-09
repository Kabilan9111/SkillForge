const path = require('path');
const crypto = require('crypto');
const diffLib = require('diff');
const { ProjectWorkspace, ProjectFile, ProjectCommit, ProjectAIReview } = require('../models/ProjectWorkspace');
const db = require('../config/database');
const aiReviewEngine = require('../services/projectWorkspace/aiReviewEngine');

// --------------- helpers ---------------
function countLines(content) {
    if (!content || content.startsWith('[binary')) return 0;
    return content.split('\n').length;
}

function computeFileDiff(oldContent, newContent) {
    const oldText = (oldContent && !oldContent.startsWith('[binary')) ? oldContent : '';
    const newText = (newContent && !newContent.startsWith('[binary')) ? newContent : '';
    let additions = 0;
    let deletions = 0;
    try {
        const changes = diffLib.diffLines(oldText, newText);
        for (const part of changes) {
            const lines = (part.value.match(/\n/g) || []).length + (part.value.endsWith('\n') ? 0 : 1);
            if (part.added) additions += lines;
            else if (part.removed) deletions += lines;
        }
    } catch (e) {
        // fallback: treat everything as added
        additions = countLines(newText);
    }
    return { additions, deletions };
}

class ProjectWorkspaceController {
    /**
     * Create new project
     */
    static async createProject(req, res) {
        try {
            const { name, description, techStack, contributors } = req.body;
            const userId = req.user?.id || 1;

            const ProjectInvite = require('../models/ProjectInvite');
            await ProjectInvite.initTables();

            const projectId = await ProjectWorkspace.create(userId, name, description, techStack);

            // Add owner as accepted contributor
            await ProjectInvite.addContributor(projectId, userId, 'accepted');

            // Handle invites
            if (Array.isArray(contributors)) {
                for (const c of contributors) {
                    if (c.email) {
                        await ProjectInvite.createInvite(
                            c.email, projectId, userId, 
                            req.user?.full_name || 'A user', 
                            name
                        );
                    } else if (c.userId || c.id) {
                        // existing user -> add to contributors directly
                        await ProjectInvite.addContributor(projectId, c.userId || c.id, 'pending');
                    }
                }
            }

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

            const ProjectInvite = require('../models/ProjectInvite');
            const db = require('../config/database');
            for (let project of projects) {
               const contributors = await ProjectInvite.getContributors(project.id);
               const enrichedContributors = [];
               for (let c of contributors) {
                   if (c.status === 'accepted') {
                      const u = await db.get('SELECT id, full_name as name, avatar_url as avatarUrl FROM users WHERE id = ?', [c.user_id]);
                      if (u) enrichedContributors.push(u);
                   }
               }
               project.contributors = enrichedContributors;
            }

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

            const ProjectInvite = require('../models/ProjectInvite');
            const contributors = await ProjectInvite.getContributors(id);
            // try mapping with user data
            const db = require('../config/database');
            const enrichedContributors = [];
            for (let c of contributors) {
                if (c.status === 'accepted') {
                   const u = await db.get('SELECT id, full_name as name, avatar_url as avatarUrl FROM users WHERE id = ?', [c.user_id]);
                   if (u) enrichedContributors.push(u);
                }
            }
            project.contributors = enrichedContributors;

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
     * Create commit — computes real line-by-line additions/deletions via diff
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
            const uncommitted = await db.all(
                `SELECT id, file_path, file_name, file_type, file_size, file_content FROM projects_files
                 WHERE project_id = ? AND (commit_hash IS NULL OR commit_hash = '')`,
                [id]
            );

            // If no uncommitted files, commit ALL current (first commit case)
            const filesToCommit = uncommitted.length > 0 ? uncommitted : await db.all(
                `SELECT id, file_path, file_name, file_type, file_size, file_content FROM projects_files WHERE project_id = ?`,
                [id]
            );

            if (filesToCommit.length === 0) {
                return res.status(400).json({ success: false, error: 'No files to commit' });
            }

            // Get the most recent previous commit to diff against
            const prevCommit = await db.get(
                `SELECT commit_hash FROM projects_commits WHERE project_id = ? ORDER BY created_at DESC LIMIT 1`,
                [id]
            );

            // Build a map of previous file contents keyed by file_path
            const prevContentMap = {};
            if (prevCommit) {
                const prevFiles = await db.all(
                    `SELECT file_path, file_content FROM projects_files WHERE project_id = ? AND commit_hash = ?`,
                    [id, prevCommit.commit_hash]
                );
                prevFiles.forEach(f => { prevContentMap[f.file_path] = f.file_content || ''; });
            }

            // Compute per-file diffs
            let totalAdditions = 0;
            let totalDeletions = 0;
            let totalLines = 0;
            const fileDiffs = [];

            for (const f of filesToCommit) {
                const prevContent = prevContentMap[f.file_path] || '';
                const newContent = f.file_content || '';
                const { additions, deletions } = computeFileDiff(prevContent, newContent);
                totalAdditions += additions;
                totalDeletions += deletions;
                totalLines += countLines(newContent);
                fileDiffs.push({
                    path: f.file_path,
                    name: f.file_name,
                    type: f.file_type,
                    size: f.file_size,
                    lines: countLines(newContent),
                    additions,
                    deletions,
                    isNew: !prevContentMap[f.file_path]
                });
            }

            // Generate 40-char SHA1, display the first 7
            const commitHash = crypto.createHash('sha1')
                .update(`${id}-${userId}-${Date.now()}-${message}`)
                .digest('hex')
                .substring(0, 7);

            await db.run(
                `INSERT INTO projects_commits
                   (project_id, user_id, commit_hash, message, files_count, total_lines, additions, deletions, file_diffs, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
                [id, userId, commitHash, message.trim(), filesToCommit.length,
                 totalLines, totalAdditions, totalDeletions, JSON.stringify(fileDiffs)]
            );

            // Tag files with this commit hash
            const fileIds = filesToCommit.map(f => f.id);
            await db.run(
                `UPDATE projects_files SET commit_hash = ? WHERE id IN (${fileIds.map(() => '?').join(',')})`,
                [commitHash, ...fileIds]
            );

            await db.run(
                `UPDATE projects_workspace SET updated_at = datetime('now') WHERE id = ?`, [id]
            );

            // Trigger AI review asynchronously — does NOT block the commit response
            setImmediate(() => {
                aiReviewEngine.runReview(id, commitHash)
                    .catch(e => console.error('[Commit] AI review failed:', e.message));
            });

            res.json({
                success: true,
                commit: {
                    commitHash,
                    message: message.trim(),
                    filesCount: filesToCommit.length,
                    totalLines,
                    additions: totalAdditions,
                    deletions: totalDeletions,
                    files: fileDiffs.slice(0, 10)
                }
            });
        } catch (error) {
            console.error('Create commit error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get commit history — includes additions/deletions/file_diffs
     */
    static async getCommits(req, res) {
        try {
            const { id } = req.params;
            const limit = parseInt(req.query.limit) || 50;

            const commits = await db.all(
                `SELECT * FROM projects_commits WHERE project_id = ? ORDER BY created_at DESC LIMIT ?`,
                [id, limit]
            );

            const commitsWithFiles = await Promise.all((commits || []).map(async (commit) => {
                // Parse stored file_diffs JSON (new commits have this)
                let fileDiffs = [];
                try { fileDiffs = JSON.parse(commit.file_diffs || '[]'); } catch(e) {}

                // Fallback for legacy commits that have no file_diffs: reconstruct from files table
                if (fileDiffs.length === 0) {
                    const files = await db.all(
                        `SELECT file_name, file_path, file_type, file_size, file_content
                         FROM projects_files WHERE project_id = ? AND commit_hash = ? ORDER BY file_path LIMIT 20`,
                        [id, commit.commit_hash]
                    );
                    fileDiffs = files.map(f => ({
                        name: f.file_name,
                        path: f.file_path,
                        type: f.file_type,
                        size: f.file_size,
                        lines: countLines(f.file_content),
                        additions: countLines(f.file_content),
                        deletions: 0,
                        isNew: true
                    }));
                }

                // Accurate file count from DB
                const { cnt: realFilesCount } = await db.get(
                    `SELECT COUNT(*) as cnt FROM projects_files WHERE project_id = ? AND commit_hash = ?`,
                    [id, commit.commit_hash]
                ) || { cnt: commit.files_count || 0 };

                return {
                    id: commit.id,
                    commit_hash: commit.commit_hash,
                    message: commit.message,
                    files_count: realFilesCount || commit.files_count || 0,
                    total_lines: commit.total_lines || 0,
                    additions: commit.additions || 0,
                    deletions: commit.deletions || 0,
                    created_at: commit.created_at,
                    files: fileDiffs.slice(0, 10)
                };
            }));

            res.json({ success: true, commits: commitsWithFiles });
        } catch (error) {
            console.error('Get commits error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get commit details — direct DB query, no stub
     */
    static async getCommitDetails(req, res) {
        try {
            const { hash } = req.params;
            const commit = await db.get(
                `SELECT * FROM projects_commits WHERE commit_hash = ?`, [hash]
            );
            if (!commit) {
                return res.status(404).json({ success: false, error: 'Commit not found' });
            }
            let fileDiffs = [];
            try { fileDiffs = JSON.parse(commit.file_diffs || '[]'); } catch(e) {}

            res.json({
                success: true,
                commit: {
                    ...commit,
                    files: fileDiffs,
                    file_diffs: undefined
                }
            });
        } catch (error) {
            console.error('Get commit details error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get commit diff — computes live diff between two commits from stored file contents
     */
    static async getCommitDiff(req, res) {
        try {
            const { hash } = req.params;
            const { compareWith } = req.query;
            if (!compareWith) {
                return res.status(400).json({ success: false, error: 'compareWith parameter required' });
            }

            const commitA = await db.get(`SELECT * FROM projects_commits WHERE commit_hash = ?`, [hash]);
            const commitB = await db.get(`SELECT * FROM projects_commits WHERE commit_hash = ?`, [compareWith]);
            if (!commitA || !commitB) {
                return res.status(404).json({ success: false, error: 'One or both commits not found' });
            }

            // Get files for both commits
            const filesA = await db.all(
                `SELECT file_path, file_content FROM projects_files WHERE project_id = ? AND commit_hash = ?`,
                [commitA.project_id, hash]
            );
            const filesB = await db.all(
                `SELECT file_path, file_content FROM projects_files WHERE project_id = ? AND commit_hash = ?`,
                [commitA.project_id, compareWith]
            );

            const mapA = {};
            filesA.forEach(f => { mapA[f.file_path] = f.file_content || ''; });
            const mapB = {};
            filesB.forEach(f => { mapB[f.file_path] = f.file_content || ''; });

            const allPaths = new Set([...Object.keys(mapA), ...Object.keys(mapB)]);
            const diffs = [];
            for (const fpath of allPaths) {
                const { additions, deletions } = computeFileDiff(mapB[fpath] || '', mapA[fpath] || '');
                diffs.push({ path: fpath, additions, deletions });
            }

            res.json({ success: true, diff: { from: compareWith, to: hash, files: diffs } });
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

            const review = await db.get(
                `SELECT * FROM projects_ai_reviews WHERE commit_hash = ?`, [hash]
            );

            // Not started → auto-trigger analysis, return 404 so frontend shows "pending"
            if (!review) {
                const commitRow = await db.get(
                    `SELECT project_id FROM projects_commits WHERE commit_hash = ?`, [hash]
                );
                if (commitRow) {
                    setImmediate(() =>
                        aiReviewEngine.runReview(commitRow.project_id, hash)
                            .catch(e => console.error('[AIReview] auto-trigger failed:', e.message))
                    );
                }
                return res.status(404).json({ success: false, error: 'AI review is being generated. Retry in a few seconds.' });
            }

            // Still running → tell frontend to retry
            if (review.status === 'in_progress') {
                return res.status(202).json({ success: false, status: 'in_progress', error: 'Analysis in progress. Please retry shortly.' });
            }

            // Failed → re-trigger automatically
            if (review.status === 'failed') {
                const commitRow = await db.get(
                    `SELECT project_id FROM projects_commits WHERE commit_hash = ?`, [hash]
                );
                if (commitRow) {
                    setImmediate(() =>
                        aiReviewEngine.runReview(commitRow.project_id, hash)
                            .catch(e => console.error('[AIReview] retry failed:', e.message))
                    );
                }
                return res.status(500).json({ success: false, error: 'Analysis failed — retrying automatically. Please retry in a moment.' });
            }

            // Complete → parse and return
            if (review.review_data && typeof review.review_data === 'string') {
                try { review.review_data = JSON.parse(review.review_data); } catch (e) {}
            }

            res.json({ success: true, review });
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
            const commitRow = await db.get(
                `SELECT project_id FROM projects_commits WHERE commit_hash = ?`, [hash]
            );
            if (!commitRow) {
                return res.status(404).json({ success: false, error: 'Commit not found' });
            }
            setImmediate(() =>
                aiReviewEngine.runReview(commitRow.project_id, hash)
                    .catch(e => console.error('[AIReview] manual trigger failed:', e.message))
            );
            res.json({ success: true, message: 'AI review triggered. Check back in a few seconds.' });
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
     * Get file content — direct DB query
     */
    static async getFileContent(req, res) {
        try {
            const { id, hash } = req.params;
            const { path: filePath } = req.query;

            if (!filePath) {
                return res.status(400).json({ success: false, error: 'File path required' });
            }

            const file = await db.get(
                `SELECT file_content, file_name, file_type, file_size FROM projects_files
                 WHERE project_id = ? AND commit_hash = ? AND file_path = ?`,
                [id, hash, filePath]
            );

            if (!file) {
                return res.status(404).json({ success: false, error: 'File not found' });
            }

            res.json({
                success: true,
                content: file.file_content || '',
                name: file.file_name,
                type: file.file_type,
                size: file.file_size,
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
            const commitA = await db.get(`SELECT * FROM projects_commits WHERE commit_hash = ?`, [hash1]);
            const commitB = await db.get(`SELECT * FROM projects_commits WHERE commit_hash = ?`, [hash2]);
            if (!commitA || !commitB) {
                return res.status(404).json({ success: false, error: 'One or both commits not found' });
            }

            const filesA = await db.all(
                `SELECT file_path, file_content FROM projects_files WHERE project_id = ? AND commit_hash = ?`,
                [commitA.project_id, hash1]
            );
            const filesB = await db.all(
                `SELECT file_path, file_content FROM projects_files WHERE project_id = ? AND commit_hash = ?`,
                [commitA.project_id, hash2]
            );

            const mapA = {}; filesA.forEach(f => { mapA[f.file_path] = f.file_content || ''; });
            const mapB = {}; filesB.forEach(f => { mapB[f.file_path] = f.file_content || ''; });
            const allPaths = new Set([...Object.keys(mapA), ...Object.keys(mapB)]);
            const diffs = [];
            let totalAdd = 0, totalDel = 0;
            for (const fpath of allPaths) {
                const { additions, deletions } = computeFileDiff(mapB[fpath] || '', mapA[fpath] || '');
                totalAdd += additions; totalDel += deletions;
                diffs.push({ path: fpath, additions, deletions });
            }

            res.json({
                success: true,
                evaluation: { from: hash2, to: hash1, totalAdditions: totalAdd, totalDeletions: totalDel, files: diffs }
            });
        } catch (error) {
            console.error('Compare commits error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get project trends (last N commits with stats)
     */
    static async getProjectTrends(req, res) {
        try {
            const { id } = req.params;
            const limit = parseInt(req.query.limit) || 20;

            const commits = await db.all(
                `SELECT commit_hash, message, files_count, total_lines, additions, deletions, created_at
                 FROM projects_commits WHERE project_id = ? ORDER BY created_at ASC LIMIT ?`,
                [id, limit]
            );

            res.json({ success: true, trends: commits || [] });
        } catch (error) {
            console.error('Get trends error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get aggregated project stats
     */
    static async getProjectStats(req, res) {
        try {
            const { id } = req.params;
            const stats = await db.get(
                `SELECT
                   COUNT(*) as total_commits,
                   SUM(additions) as total_additions,
                   SUM(deletions) as total_deletions,
                   SUM(total_lines) as total_lines,
                   MAX(created_at) as last_commit_at
                 FROM projects_commits WHERE project_id = ?`,
                [id]
            );
            const fileCount = await db.get(
                `SELECT COUNT(DISTINCT file_path) as total_files FROM projects_files WHERE project_id = ?`,
                [id]
            );

            res.json({
                success: true,
                stats: {
                    totalCommits: stats?.total_commits || 0,
                    totalAdditions: stats?.total_additions || 0,
                    totalDeletions: stats?.total_deletions || 0,
                    totalLines: stats?.total_lines || 0,
                    totalFiles: fileCount?.total_files || 0,
                    lastCommitAt: stats?.last_commit_at || null
                }
            });
        } catch (error) {
            console.error('Get project stats error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get 90-day commit activity for heatmap / graph
     */
    static async getProjectActivity(req, res) {
        try {
            const { id } = req.params;
            const rows = await db.all(
                `SELECT date(created_at) as day, COUNT(*) as count,
                        SUM(additions) as additions, SUM(deletions) as deletions
                 FROM projects_commits
                 WHERE project_id = ? AND created_at >= date('now', '-90 days')
                 GROUP BY day ORDER BY day ASC`,
                [id]
            );
            res.json({ success: true, activity: rows || [] });
        } catch (error) {
            console.error('Get activity error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = ProjectWorkspaceController;
