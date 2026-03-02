const { ProjectCommit, ProjectFile, ProjectWorkspace } = require('../../models/ProjectWorkspace');
const FileManager = require('./fileManager');
const DiffEngine = require('./diffEngine');

class CommitManager {
    /**
     * Create new commit with files
     */
    async createCommit(projectId, authorId, message, files) {
        try {
            // Calculate commit statistics
            const stats = this.calculateStats(files);
            
            // Create commit record
            const commitData = {
                filesChanged: files.length,
                linesAdded: stats.linesAdded,
                linesRemoved: stats.linesRemoved,
                snapshotPath: '', // Will be set after file storage
            };
            
            const { id: commitId, commitHash } = await ProjectCommit.create(
                projectId,
                authorId,
                message,
                commitData
            );
            
            // Move files to commit directory
            await FileManager.commitFiles(projectId, commitHash, files);
            
            // Save file records
            for (const file of files) {
                await ProjectFile.add(projectId, commitId, file.filePath, file.fileName, file);
            }
            
            // Update project stats
            const totalCommits = await this.getCommitCount(projectId);
            const projectSize = await FileManager.getProjectSize(projectId);
            
            await ProjectWorkspace.updateStats(projectId, {
                totalCommits,
                repositorySize: projectSize,
                lastCommitAt: new Date().toISOString()
            });
            
            // Clean staging
            await FileManager.cleanStaging(projectId);
            
            return {
                commitId,
                commitHash,
                stats: {
                    filesChanged: files.length,
                    ...stats
                }
            };
        } catch (error) {
            console.error('Commit creation failed:', error);
            throw error;
        }
    }

    /**
     * Get commit with files
     */
    async getCommitDetails(commitHash) {
        const commit = await ProjectCommit.getByHash(commitHash);
        if (!commit) return null;
        
        const files = await ProjectFile.getByCommit(commit.id);
        
        return {
            ...commit,
            files: FileManager.buildFileTree(files)
        };
    }

    /**
     * Get commit history for project
     */
    async getCommitHistory(projectId, limit = 50) {
        return await ProjectCommit.getByProject(projectId, limit);
    }

    /**
     * Get diff between two commits
     */
    async getCommitDiff(commitHash1, commitHash2) {
        const commit1 = await ProjectCommit.getByHash(commitHash1);
        const commit2 = await ProjectCommit.getByHash(commitHash2);
        
        if (!commit1 || !commit2) {
            throw new Error('Commit not found');
        }
        
        const files1 = await ProjectFile.getByCommit(commit1.id);
        const files2 = await ProjectFile.getByCommit(commit2.id);
        
        return await DiffEngine.compareCommits(
            commit1.project_id,
            commitHash1,
            commitHash2,
            files1,
            files2
        );
    }

    /**
     * Rollback to previous commit
     */
    async rollbackToCommit(projectId, targetCommitHash, authorId) {
        const targetCommit = await ProjectCommit.getByHash(targetCommitHash);
        if (!targetCommit) {
            throw new Error('Target commit not found');
        }
        
        // Get files from target commit
        const targetFiles = await ProjectFile.getByCommit(targetCommit.id);
        
        // Create new commit with same files (rollback commit)
        const rollbackMessage = `Rollback to commit ${targetCommitHash.slice(0, 7)}`;
        
        const filesData = [];
        for (const file of targetFiles) {
            const content = await FileManager.getFileContent(
                projectId,
                targetCommitHash,
                file.file_path
            );
            
            filesData.push({
                fileName: file.file_name,
                filePath: file.file_path,
                fileType: file.file_type,
                fileSize: file.file_size,
                contentHash: file.content_hash,
                isBinary: file.is_binary,
                linesOfCode: file.lines_of_code,
                content
            });
        }
        
        return await this.createCommit(projectId, authorId, rollbackMessage, filesData);
    }

    /**
     * Calculate commit statistics
     */
    calculateStats(files) {
        let linesAdded = 0;
        let linesRemoved = 0;
        
        // For new files, all lines are "added"
        files.forEach(file => {
            if (!file.isBinary) {
                linesAdded += file.linesOfCode || 0;
            }
        });
        
        return { linesAdded, linesRemoved };
    }

    /**
     * Get total commit count
     */
    async getCommitCount(projectId) {
        const commits = await ProjectCommit.getByProject(projectId, 1000);
        return commits.length;
    }

    /**
     * Get commits between two hashes
     */
    async getCommitRange(projectId, fromHash, toHash) {
        const allCommits = await ProjectCommit.getByProject(projectId);
        
        const fromIndex = allCommits.findIndex(c => c.commit_hash === fromHash);
        const toIndex = allCommits.findIndex(c => c.commit_hash === toHash);
        
        if (fromIndex === -1 || toIndex === -1) {
            throw new Error('Commit range invalid');
        }
        
        return allCommits.slice(Math.min(fromIndex, toIndex), Math.max(fromIndex, toIndex) + 1);
    }
}

module.exports = new CommitManager();
