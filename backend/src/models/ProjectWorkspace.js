const db = require('../config/database');
const crypto = require('crypto');

class ProjectWorkspace {
    /**
     * Create new project workspace
     */
    static async create(userId, name, description, techStack) {
        const result = await db.run(
            `INSERT INTO projects_workspace (user_id, name, description, tech_stack, created_at, updated_at)
             VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [userId, name, description, JSON.stringify(techStack || [])]
        );
        return result.lastID;
    }

    /**
     * Get project by ID
     */
    static async getById(projectId) {
        const row = await db.get(
            `SELECT pw.*, u.full_name as owner_username
             FROM projects_workspace pw
             LEFT JOIN users u ON pw.user_id = u.id
             WHERE pw.id = ?`,
            [projectId]
        );
        if (row && row.tech_stack) {
            try { row.tech_stack = JSON.parse(row.tech_stack); } catch(e) { row.tech_stack = []; }
        }
        return row;
    }

    /**
     * Get all projects for user
     */
    static async getUserProjects(userId) {
        const rows = await db.all(
            `SELECT pw.*,
               (SELECT COUNT(*) FROM projects_commits pc WHERE pc.project_id = pw.id) AS total_commits,
               (SELECT COUNT(DISTINCT pf.file_path) FROM projects_files pf WHERE pf.project_id = pw.id) AS total_files,
               (SELECT MAX(pc2.created_at) FROM projects_commits pc2 WHERE pc2.project_id = pw.id) AS last_commit_at
             FROM projects_workspace pw
             WHERE pw.user_id = ? 
             OR pw.id IN (
                 SELECT project_id FROM project_contributors WHERE user_id = ? AND status = 'accepted'
             )
             ORDER BY pw.updated_at DESC`,
            [userId, userId]
        );
        rows.forEach(row => {
            if (row.tech_stack) {
                try { row.tech_stack = JSON.parse(row.tech_stack); } catch(e) { row.tech_stack = []; }
            }
        });
        return rows;
    }

    /**
     * Update project
     */
    static async update(projectId, updates) {
        const allowedFields = ['name', 'description', 'tech_stack', 'visibility', 'status'];
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = ?`);
                values.push(key === 'tech_stack' ? JSON.stringify(value) : value);
            }
        }

        if (fields.length === 0) return;

        fields.push("updated_at = datetime('now')");
        values.push(projectId);

        const result = await db.run(
            `UPDATE projects_workspace SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result.changes;
    }

    /**
     * Delete project
     */
    static async delete(projectId) {
        const result = await db.run(
            'DELETE FROM projects_workspace WHERE id = ?',
            [projectId]
        );
        return result.changes;
    }

    /**
     * Update project stats
     */
    static async updateStats(projectId, stats) {
        const fields = [];
        const values = [];

        if (stats.totalCommits !== undefined) {
            fields.push('total_commits = ?');
            values.push(stats.totalCommits);
        }
        if (stats.repositorySize !== undefined) {
            fields.push('repository_size = ?');
            values.push(stats.repositorySize);
        }
        if (stats.lastCommitAt) {
            fields.push('last_commit_at = ?');
            values.push(stats.lastCommitAt);
        }

        if (fields.length === 0) return;

        fields.push("updated_at = datetime('now')");
        values.push(projectId);

        const result = await db.run(
            `UPDATE projects_workspace SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result.changes;
    }
}

class ProjectFile {
    /**
     * Add file to project
     */
    static async add(projectId, commitId, filePath, fileName, fileData) {
        const contentHash = crypto.createHash('sha256').update(fileData.content || '').digest('hex');
        
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO project_files 
                (project_id, commit_id, file_path, file_name, file_type, file_size, content_hash, storage_path, is_binary, lines_of_code)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                projectId, commitId, filePath, fileName,
                fileData.fileType, fileData.fileSize, contentHash,
                fileData.storagePath, fileData.isBinary ? 1 : 0,
                fileData.linesOfCode || 0
            ];
            
            db.run(sql, values, function(err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    }

    /**
     * Get files for commit
     */
    static async getByCommit(commitId) {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM project_files WHERE commit_id = ? AND is_deleted = 0 ORDER BY file_path',
                [commitId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                }
            );
        });
    }

    /**
     * Get file tree for project (latest commit)
     */
    static async getTree(projectId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT pf.* FROM project_files pf
                INNER JOIN project_commits pc ON pf.commit_id = pc.id
                WHERE pf.project_id = ? AND pf.is_deleted = 0
                AND pc.commit_timestamp = (
                    SELECT MAX(commit_timestamp) FROM project_commits WHERE project_id = ?
                )
                ORDER BY pf.file_path
            `;
            
            db.all(sql, [projectId, projectId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    /**
     * Mark file as deleted
     */
    static async markDeleted(fileId) {
        return new Promise((resolve, reject) => {
            db.run('UPDATE project_files SET is_deleted = 1 WHERE id = ?', [fileId], function(err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }
}

class ProjectCommit {
    /**
     * Create new commit
     */
    static async create(projectId, authorId, message, metadata) {
        const commitHash = crypto.createHash('sha1')
            .update(`${projectId}-${Date.now()}-${message}`)
            .digest('hex');

        return new Promise((resolve, reject) => {
            // Get parent commit
            db.get(
                'SELECT commit_hash FROM project_commits WHERE project_id = ? ORDER BY commit_timestamp DESC LIMIT 1',
                [projectId],
                (err, row) => {
                    if (err) return reject(err);
                    
                    const parentHash = row ? row.commit_hash : null;
                    
                    const sql = `
                        INSERT INTO project_commits 
                        (project_id, commit_hash, parent_commit_hash, commit_message, author_id, 
                         files_changed, lines_added, lines_removed, snapshot_path, metadata)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    
                    const values = [
                        projectId, commitHash, parentHash, message, authorId,
                        metadata.filesChanged || 0,
                        metadata.linesAdded || 0,
                        metadata.linesRemoved || 0,
                        metadata.snapshotPath || '',
                        JSON.stringify(metadata || {})
                    ];
                    
                    db.run(sql, values, function(err) {
                        if (err) return reject(err);
                        resolve({ id: this.lastID, commitHash, parentHash });
                    });
                }
            );
        });
    }

    /**
     * Get commit by hash
     */
    static async getByHash(commitHash) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT pc.*, u.username as author_name
                FROM project_commits pc
                JOIN users u ON pc.author_id = u.id
                WHERE pc.commit_hash = ?
            `;
            
            db.get(sql, [commitHash], (err, row) => {
                if (err) return reject(err);
                if (row && row.metadata) {
                    row.metadata = JSON.parse(row.metadata);
                }
                resolve(row);
            });
        });
    }

    /**
     * Get commits for project  
     */
    static async getByProject(projectId, limit = 50) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT pc.*, u.username as author_name
                FROM project_commits pc
                JOIN users u ON pc.author_id = u.id
                WHERE pc.project_id = ?
                ORDER BY pc.commit_timestamp DESC
                LIMIT ?
            `;
            
            db.all(sql, [projectId, limit], (err, rows) => {
                if (err) return reject(err);
                rows.forEach(row => {
                    if (row.metadata) row.metadata = JSON.parse(row.metadata);
                });
                resolve(rows);
            });
        });
    }

    /**
     * Get commit by ID
     */
    static async getById(commitId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT pc.*, u.username as author_name
                FROM project_commits pc
                JOIN users u ON pc.author_id = u.id
                WHERE pc.id = ?
            `;
            
            db.get(sql, [commitId], (err, row) => {
                if (err) return reject(err);
                if (row && row.metadata) {
                    row.metadata = JSON.parse(row.metadata);
                }
                resolve(row);
            });
        });
    }
}

class ProjectAIReview {
    /**
     * Save AI review result
     */
    static async create(reviewData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO project_ai_reviews (
                    project_id, commit_id, overall_rating, developer_level,
                    syntax_score, architecture_score, performance_score, 
                    security_score, maintainability_score, industry_benchmark_score,
                    code_structure_score, scalability_score,
                    improvement_percentage, regression_detected, technical_debt_delta,
                    positive_aspects, weaknesses, recommendations, 
                    security_issues, code_smells, duplications, unused_files,
                    ai_model_used, processing_time_ms, tokens_used, analysis_cost
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                reviewData.projectId, reviewData.commitId,
                reviewData.overallRating, reviewData.developerLevel,
                reviewData.syntaxScore, reviewData.architectureScore,
                reviewData.performanceScore, reviewData.securityScore,
                reviewData.maintainabilityScore, reviewData.industryBenchmarkScore,
                reviewData.codeStructureScore, reviewData.scalabilityScore,
                reviewData.improvementPercentage, reviewData.regressionDetected ? 1 : 0,
                reviewData.technicalDebtDelta,
                JSON.stringify(reviewData.positiveAspects || []),
                JSON.stringify(reviewData.weaknesses || []),
                JSON.stringify(reviewData.recommendations || []),
                JSON.stringify(reviewData.securityIssues || []),
                JSON.stringify(reviewData.codeSmells || []),
                JSON.stringify(reviewData.duplications || []),
                JSON.stringify(reviewData.unusedFiles || []),
                reviewData.aiModelUsed || 'GPT-4',
                reviewData.processingTimeMs || 0,
                reviewData.tokensUsed || 0,
                reviewData.analysisCost || 0
            ];
            
            db.run(sql, values, function(err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    }

    /**
     * Get AI review for commit
     */
    static async getByCommit(commitId) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM project_ai_reviews WHERE commit_id = ?', [commitId], (err, row) => {
                if (err) return reject(err);
                if (row) {
                    const jsonFields = ['positive_aspects', 'weaknesses', 'recommendations', 
                                      'security_issues', 'code_smells', 'duplications', 'unused_files'];
                    jsonFields.forEach(field => {
                        if (row[field]) row[field] = JSON.parse(row[field]);
                    });
                }
                resolve(row);
            });
        });
    }

    /**
     * Get latest review for project
     */
    static async getLatestByProject(projectId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM project_ai_reviews 
                WHERE project_id = ? 
                ORDER BY review_timestamp DESC 
                LIMIT 1
            `;
            
            db.get(sql, [projectId], (err, row) => {
                if (err) return reject(err);
                if (row) {
                    const jsonFields = ['positive_aspects', 'weaknesses', 'recommendations', 
                                      'security_issues', 'code_smells', 'duplications', 'unused_files'];
                    jsonFields.forEach(field => {
                        if (row[field]) row[field] = JSON.parse(row[field]);
                    });
                }
                resolve(row);
            });
        });
    }
}

module.exports = {
    ProjectWorkspace,
    ProjectFile,
    ProjectCommit,
    ProjectAIReview
};
