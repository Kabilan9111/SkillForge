/**
 * ========================================
 * PROJECT STATE MANAGER - Production Grade
 * ========================================
 * Single source of truth for project state
 * - Backend-driven state (no localStorage drift)
 * - Hash-based change detection
 * - Event-driven reactive updates
 * - Automatic .gitignore support
 */

class ProjectStateManager {
    constructor(apiBaseUrl, authTokenGetter) {
        // Config
        this.apiBaseUrl = apiBaseUrl;
        this.getAuthToken = authTokenGetter;
        
        // State
        this.currentProject = null;
        this.commits = [];
        this.aiReviews = [];
        this.workingDirectory = new Map(); // path -> { content, hash, size, lastModified }
        this.headTree = new Map(); // HEAD commit file state
        this.dirtyFiles = new Set(); // Files changed since last commit
        
        // Event emitter
        this.listeners = new Map();
        
        // Default ignore patterns (like .gitignore)
        this.ignorePatterns = [
            /node_modules\//,
            /\.git\//,
            /dist\//,
            /build\//,
            /coverage\//,
            /\.next\//,
            /\.nuxt\//,
            /\.cache\//,
            /\.parcel-cache\//,
            /\.env$/,
            /\.env\..+$/,
            /\.DS_Store$/,
            /Thumbs\.db$/,
            /\.log$/,
            /npm-debug\.log/,
            /yarn-error\.log/,
            /package-lock\.json$/,
            /yarn\.lock$/,
            /pnpm-lock\.yaml$/
        ];
        
        console.log('[StateManager] Initialized');
    }
    
    // ==================== PROJECT LOADING ====================
    
    /**
     * Load project from backend (single source of truth)
     * Call this on page mount, navigation, refresh
     */
    async loadProject(projectId) {
        try {
            console.log(`[StateManager] Loading project: ${projectId}`);
            
            const response = await this.apiCall(`/projects/${projectId}`, 'GET');
            
            if (!response.success || !response.project) {
                throw new Error('Project not found');
            }
            
            // Set project
            this.currentProject = response.project;
            
            // Load HEAD commit tree
            if (response.project.headCommit) {
                await this.loadCommitTree(response.project.headCommit);
            }
            
            // Load recent commits
            await this.loadCommits(projectId);
            
            // Load recent AI reviews
            await this.loadAIReviews(projectId);
            
            // Reset working directory to HEAD
            this.resetWorkingDirectory();
            
            this.emit('project:loaded', this.currentProject);
            
            console.log(`[StateManager] Project loaded: ${this.currentProject.name}`);
            return this.currentProject;
            
        } catch (error) {
            console.error('[StateManager] Failed to load project:', error);
            this.emit('project:error', error.message);
            throw error;
        }
    }
    
    /**
     * Load commit tree (file snapshot at commit)
     */
    async loadCommitTree(commitId) {
        const response = await this.apiCall(`/commits/${commitId}/tree`, 'GET');
        
        if (response.success && response.tree) {
            this.headTree = new Map();
            
            for (const entry of response.tree.entries) {
                this.headTree.set(entry.path, {
                    content: entry.content,
                    hash: entry.hash,
                    size: entry.size,
                    lastModified: entry.lastModified
                });
            }
        }
    }
    
    /**
     * Load commit history
     */
    async loadCommits(projectId, limit = 50) {
        const response = await this.apiCall(`/projects/${projectId}/commits?limit=${limit}`, 'GET');
        
        if (response.success && response.commits) {
            this.commits = response.commits;
            this.emit('commits:loaded', this.commits);
        }
    }
    
    /**
     * Load AI review history
     */
    async loadAIReviews(projectId, limit = 10) {
        const response = await this.apiCall(`/projects/${projectId}/reviews?limit=${limit}`, 'GET');
        
        if (response.success && response.reviews) {
            this.aiReviews = response.reviews;
            this.emit('reviews:loaded', this.aiReviews);
        }
    }
    
    /**
     * Reset working directory to HEAD state
     */
    resetWorkingDirectory() {
        this.workingDirectory = new Map(this.headTree);
        this.dirtyFiles.clear();
        this.emit('workingDirectory:reset');
    }
    
    // ==================== FILE OPERATIONS ====================
    
    /**
     * Update file in working directory
     */
    async updateFile(path, content) {
        if (this.shouldIgnore(path)) {
            console.warn(`[StateManager] Ignoring file: ${path}`);
            return;
        }
        
        const hash = await this.hashContent(content);
        const size = new Blob([content]).size;
        
        // Get previous state
        const headFile = this.headTree.get(path);
        const workingFile = this.workingDirectory.get(path);
        
        // Set in working directory
        this.workingDirectory.set(path, {
            content,
            hash,
            size,
            lastModified: new Date()
        });
        
        // Mark as dirty if changed from HEAD
        if (!headFile || headFile.hash !== hash) {
            this.dirtyFiles.add(path);
        } else {
            this.dirtyFiles.delete(path);
        }
        
        this.emit('file:changed', { path, hash, size });
        this.emit('diff:updated', this.computeDiff());
    }
    
    /**
     * Delete file from working directory
     */
    deleteFile(path) {
        if (this.shouldIgnore(path)) {
            return;
        }
        
        this.workingDirectory.delete(path);
        
        if (this.headTree.has(path)) {
            this.dirtyFiles.add(path);
        }
        
        this.emit('file:deleted', path);
        this.emit('diff:updated', this.computeDiff());
    }
    
    /**
     * Upload multiple files (from directory upload)
     */
    async uploadFiles(fileList) {
        const uploaded = [];
        
        for (const file of fileList) {
            if (this.shouldIgnore(file.webkitRelativePath || file.name)) {
                continue;
            }
            
            const content = await this.readFileAsText(file);
            const path = file.webkitRelativePath || file.name;
            
            await this.updateFile(path, content);
            uploaded.push(path);
        }
        
        this.emit('files:uploaded', uploaded);
        
        return uploaded;
    }
    
    // ==================== DIFF COMPUTATION ====================
    
    /**
     * Compute diff between working directory and HEAD
     * Returns: { added: [], modified: [], deleted: [], total: N }
     */
    computeDiff() {
        const diff = {
            added: [],
            modified: [],
            deleted: [],
            total: 0
        };
        
        // Check for additions and modifications
        for (const [path, workingFile] of this.workingDirectory) {
            if (this.shouldIgnore(path)) continue;
            
            const headFile = this.headTree.get(path);
            
            if (!headFile) {
                diff.added.push({
                    path,
                    size: workingFile.size,
                    hash: workingFile.hash
                });
            } else if (headFile.hash !== workingFile.hash) {
                diff.modified.push({
                    path,
                    oldHash: headFile.hash,
                    newHash: workingFile.hash,
                    oldSize: headFile.size,
                    newSize: workingFile.size
                });
            }
        }
        
        // Check for deletions
        for (const [path, headFile] of this.headTree) {
            if (this.shouldIgnore(path)) continue;
            
            if (!this.workingDirectory.has(path)) {
                diff.deleted.push({
                    path,
                    hash: headFile.hash,
                    size: headFile.size
                });
            }
        }
        
        diff.total = diff.added.length + diff.modified.length + diff.deleted.length;
        
        return diff;
    }
    
    /**
     * Check if there are uncommitted changes
     */
    hasUncommittedChanges() {
        const diff = this.computeDiff();
        return diff.total > 0;
    }
    
    // ==================== COMMIT OPERATIONS ====================
    
    /**
     * Create commit (sends to backend, updates state only on success)
     */
    async createCommit(message, triggerAiReview = false) {
        if (!this.currentProject) {
            throw new Error('No project loaded');
        }
        
        if (!message || message.trim().length === 0) {
            throw new Error('Commit message is required');
        }
        
        const diff = this.computeDiff();
        
        if (diff.total === 0) {
            throw new Error('No changes to commit');
        }
        
        try {
            console.log('[StateManager] Creating commit...');
            this.emit('commit:creating');
            
            // Prepare commit data
            const commitData = {
                message: message.trim(),
                changes: {
                    added: diff.added.map(f => f.path),
                    modified: diff.modified.map(f => f.path),
                    deleted: diff.deleted.map(f => f.path)
                },
                files: this.serializeWorkingDirectory(diff)
            };
            
            // Send to backend
            const response = await this.apiCall(
                `/projects/${this.currentProject.id}/commit`,
                'POST',
                commitData
            );
            
            if (!response.success || !response.commit) {
                throw new Error(response.error || 'Commit failed');
            }
            
            // Update local state ONLY after backend confirms
            const commit = response.commit;
            
            this.commits.unshift(commit);
            this.currentProject.headCommit = commit.id;
            this.currentProject.totalCommits++;
            
            // Update HEAD tree to working directory
            this.headTree = new Map(this.workingDirectory);
            this.dirtyFiles.clear();
            
            this.emit('commit:created', {
                commit,
                aiReviewQueued: response.aiReviewQueued
            });
            
            console.log(`[StateManager] Commit created: ${commit.hash}`);
            
            return commit;
            
        } catch (error) {
            console.error('[StateManager] Commit failed:', error);
            this.emit('commit:error', error.message);
            throw error;
        }
    }
    
    /**
     * Rollback to specific commit
     */
    async rollbackToCommit(commitId) {
        if (!this.currentProject) {
            throw new Error('No project loaded');
        }
        
        if (!confirm('Are you sure? This will discard all changes after this commit.')) {
            return;
        }
        
        try {
            console.log(`[StateManager] Rolling back to commit: ${commitId}`);
            this.emit('rollback:starting');
            
            const response = await this.apiCall(
                `/projects/${this.currentProject.id}/rollback/${commitId}`,
                'POST'
            );
            
            if (!response.success) {
                throw new Error(response.error || 'Rollback failed');
            }
            
            // Reload project state
            await this.loadProject(this.currentProject.id);
            
            this.emit('rollback:completed', commitId);
            
            console.log('[StateManager] Rollback completed');
            
        } catch (error) {
            console.error('[StateManager] Rollback failed:', error);
            this.emit('rollback:error', error.message);
            throw error;
        }
    }
    
    // ==================== AI REVIEW ====================
    
    /**
     * Trigger AI review manually
     */
    async triggerAIReview() {
        if (!this.currentProject || !this.currentProject.headCommit) {
            throw new Error('No commits to review');
        }
        
        try {
            console.log('[StateManager] Triggering AI review...');
            this.emit('ai:triggering');
            
            const response = await this.apiCall(
                `/projects/${this.currentProject.id}/review`,
                'POST'
            );
            
            if (!response.success) {
                throw new Error(response.error || 'AI review failed');
            }
            
            this.emit('ai:queued', response.jobId);
            
            console.log('[StateManager] AI review queued');
            
        } catch (error) {
            console.error('[StateManager] AI review failed:', error);
            this.emit('ai:error', error.message);
            throw error;
        }
    }
    
    /**
     * Poll for AI review status
     */
    async pollAIReviewStatus(reviewId) {
        const response = await this.apiCall(`/reviews/${reviewId}`, 'GET');
        
        if (response.success && response.review) {
            const review = response.review;
            
            if (review.status === 'completed') {
                this.aiReviews.unshift(review);
                this.emit('ai:completed', review);
            } else if (review.status === 'failed') {
                this.emit('ai:failed', review.errorMessage);
            }
            
            return review;
        }
    }
    
    // ==================== HELPERS ====================
    
    /**
     * Hash content using SHA-256
     */
    async hashContent(content) {
        const msgBuffer = new TextEncoder().encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    /**
     * Check if file should be ignored
     */
    shouldIgnore(path) {
        // Check against ignore patterns
        return this.ignorePatterns.some(pattern => {
            if (pattern instanceof RegExp) {
                return pattern.test(path);
            }
            return path === pattern;
        });
    }
    
    /**
     * Serialize working directory for commit
     * Only includes changed files (not entire directory)
     */
    serializeWorkingDirectory(diff) {
        const files = {};
        
        // Add added and modified files
        [...diff.added, ...diff.modified].forEach(item => {
            const file = this.workingDirectory.get(item.path);
            if (file) {
                files[item.path] = {
                    content: file.content,
                    size: file.size,
                    hash: file.hash
                };
            }
        });
        
        return files;
    }
    
    /**
     * Read file as text
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
    
    /**
     * API call helper with auth
     */
    async apiCall(endpoint, method, body = null) {
        const token = this.getAuthToken();
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${this.apiBaseUrl}${endpoint}`, options);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || error.message || `HTTP ${response.status}`);
        }
        
        return await response.json();
    }
    
    // ==================== EVENT SYSTEM ====================
    
    /**
     * Subscribe to events
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }
    
    /**
     * Emit event
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[StateManager] Event ${event} callback error:`, error);
                }
            });
        }
    }
    
    /**
     * Remove all listeners
     */
    clearListeners() {
        this.listeners.clear();
    }
}

// ==================== EXPORT ====================

// Global instance
window.ProjectStateManager = ProjectStateManager;

console.log('[StateManager] Class loaded');
