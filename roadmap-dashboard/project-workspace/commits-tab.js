/**
 * COMMITS TAB - Timeline & Diff Viewer
 */

window.CommitsTab = class CommitsTab {
    constructor(container, project, apiBase) {
        this.container = container;
        this.project = project;
        this.apiBase = apiBase;
        this.commits = [];
        this.selectedCommit = null;
        this.render();
    }

    async render() {
        this.container.innerHTML = `
            <div class="commits-tab">
                <div class="commits-panel">
                    <div class="commits-toolbar">
                        <button class="btn-primary" id="create-commit-btn">
                            💾 Create Commit
                        </button>
                        <button class="btn-secondary" id="refresh-commits">🔄</button>
                    </div>
                    <div class="commit-input" id="commit-input" style="display: none;">
                        <input type="text" id="commit-message" placeholder="Commit message">
                        <button class="btn-primary btn-sm" id="submit-commit">Commit</button>
                        <button class="btn-secondary btn-sm" id="cancel-commit">Cancel</button>
                    </div>
                    <div class="commits-timeline" id="commits-timeline">
                        <div class="loading">Loading commits...</div>
                    </div>
                </div>
                <div class="diff-viewer">
                    <div class="diff-header">
                        <span id="diff-title">Select a commit to view changes</span>
                    </div>
                    <div class="diff-content" id="diff-content">
                        <div class="empty-state">
                            <div class="empty-icon">🔍</div>
                            <p>Select a commit from the timeline</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        await this.loadCommits();
        this.attachEventListeners();
    }

    async loadCommits() {
        try {
            const res = await fetch(`${this.apiBase}/projects/${this.project.id}/commits`);
            const data = await res.json();
            if (data.success) {
                this.commits = data.commits || [];
                this.renderTimeline();
            }
        } catch (err) {
            console.error('Failed to load commits:', err);
            document.getElementById('commits-timeline').innerHTML = '<div class="error">Failed to load commits</div>';
        }
    }

    renderTimeline() {
        const timeline = document.getElementById('commits-timeline');

        if (this.commits.length === 0) {
            timeline.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <p>No commits yet</p>
                    <button class="btn-primary" onclick="document.getElementById('create-commit-btn').click()">
                        Create First Commit
                    </button>
                </div>
            `;
            return;
        }

        timeline.innerHTML = this.commits.map((commit, idx) => `
            <div class="commit-card" data-hash="${commit.commit_hash}">
                <div class="commit-dot"></div>
                <div class="commit-line"></div>
                <div class="commit-details">
                    <div class="commit-header">
                        <span class="commit-message">${commit.commit_message}</span>
                        <span class="commit-hash">${commit.commit_hash.substring(0, 7)}</span>
                    </div>
                    <div class="commit-meta">
                        <span class="commit-author">👤 ${commit.author_name || 'Unknown'}</span>
                        <span class="commit-date">🕐 ${this.formatDate(commit.created_at)}</span>
                        <span class="commit-files">📁 ${commit.total_files} files</span>
                        <span class="commit-lines">
                            <span class="additions">+${commit.total_lines}</span>
                        </span>
                    </div>
                    <div class="commit-actions">
                        <button class="btn-sm btn-secondary" onclick="window.commitsTab.viewDiff('${commit.commit_hash}')">
                            View Changes
                        </button>
                        ${idx > 0 ? `
                            <button class="btn-sm btn-secondary" onclick="window.commitsTab.compareToPrevious('${commit.commit_hash}', '${this.commits[idx-1].commit_hash}')">
                                Compare ◀
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        // Store reference for inline onclick handlers
        window.commitsTab = this;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    attachEventListeners() {
        document.getElementById('create-commit-btn').addEventListener('click', () => {
            document.getElementById('commit-input').style.display = 'flex';
            document.getElementById('commit-message').focus();
        });

        document.getElementById('cancel-commit').addEventListener('click', () => {
            document.getElementById('commit-input').style.display = 'none';
            document.getElementById('commit-message').value = '';
        });

        document.getElementById('submit-commit').addEventListener('click', async () => {
            await this.createCommit();
        });

        document.getElementById('refresh-commits').addEventListener('click', async () => {
            await this.loadCommits();
        });
    }

    async createCommit() {
        const message = document.getElementById('commit-message').value.trim();
        if (!message) {
            alert('Commit message required');
            return;
        }

        try {
            const res = await fetch(`${this.apiBase}/projects/${this.project.id}/commits`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            const data = await res.json();
            if (data.success) {
                alert('Commit created successfully');
                document.getElementById('commit-input').style.display = 'none';
                document.getElementById('commit-message').value = '';
                await this.loadCommits();
            } else {
                alert(data.message || 'Commit failed');
            }
        } catch (err) {
            console.error('Commit failed:', err);
            alert('Failed to create commit');
        }
    }

    async viewDiff(commitHash) {
        try {
            const res = await fetch(`${this.apiBase}/commits/${commitHash}/diff`);
            const data = await res.json();
            if (data.success) {
                this.renderDiff(commitHash, data.diff);
            }
        } catch (err) {
            console.error('Failed to load diff:', err);
        }
    }

    async compareToPrevious(currentHash, previousHash) {
        try {
            const res = await fetch(`${this.apiBase}/commits/${previousHash}/compare/${currentHash}`);
            const data = await res.json();
            if (data.success) {
                this.renderDiff(`${previousHash.substring(0,7)}...${currentHash.substring(0,7)}`, data.diff);
            }
        } catch (err) {
            console.error('Failed to compare commits:', err);
        }
    }

    renderDiff(title, diff) {
        document.getElementById('diff-title').textContent = title;
        const diffContent = document.getElementById('diff-content');

        if (!diff || (!diff.added && !diff.modified && !diff.deleted)) {
            diffContent.innerHTML = '<div class="empty-state"><p>No changes</p></div>';
            return;
        }

        let html = '<div class="diff-summary">';
        html += `<span class="diff-stat added">+${diff.added?.length || 0} added</span>`;
        html += `<span class="diff-stat modified">${diff.modified?.length || 0} modified</span>`;
        html += `<span class="diff-stat deleted">-${diff.deleted?.length || 0} deleted</span>`;
        html += '</div>';

        // Added files
        if (diff.added?.length) {
            html += '<div class="diff-section"><h4>Added Files</h4>';
            diff.added.forEach(file => {
                html += `<div class="diff-file added">
                    <div class="diff-file-header">+ ${file.path}</div>
                    ${this.renderFileDiff(file.diff)}
                </div>`;
            });
            html += '</div>';
        }

        // Modified files
        if (diff.modified?.length) {
            html += '<div class="diff-section"><h4>Modified Files</h4>';
            diff.modified.forEach(file => {
                html += `<div class="diff-file modified">
                    <div class="diff-file-header">~ ${file.path}</div>
                    ${this.renderFileDiff(file.diff)}
                </div>`;
            });
            html += '</div>';
        }

        // Deleted files
        if (diff.deleted?.length) {
            html += '<div class="diff-section"><h4>Deleted Files</h4>';
            diff.deleted.forEach(file => {
                html += `<div class="diff-file deleted">
                    <div class="diff-file-header">- ${file.path}</div>
                </div>`;
            });
            html += '</div>';
        }

        diffContent.innerHTML = html;
    }

    renderFileDiff(chunks) {
        if (!chunks || chunks.length === 0) return '<div class="diff-empty">No changes</div>';

        return chunks.map(chunk => `
            <div class="diff-chunk">
                ${chunk.lines.map(line => `
                    <div class="diff-line ${line.type}">
                        <span class="line-num">${line.lineNumber || ''}</span>
                        <span class="line-content">${this.escapeHtml(line.content)}</span>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
