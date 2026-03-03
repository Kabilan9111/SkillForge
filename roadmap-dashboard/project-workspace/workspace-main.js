/**
 * PROJECT WORKSPACE - Main Container
 * GitHub-like repository workspace with AI-powered intelligence
 */

class ProjectWorkspace {
    constructor(containerId, apiBase) {
        this.container = document.getElementById(containerId);
        this.currentProject = null;
        this.currentTab = 'files';
        this.apiBase = apiBase || '/api/workspace';
        this.projectId = null;
    }

    async init(projectId) {
        this.projectId = projectId;
        await this.loadProject();
        this.renderWorkspace();
        this.attachEventListeners();
    }

    showProjectSelector() {
        this.container.innerHTML = `
            <div class="workspace-container">
                <div class="workspace-header">
                    <h1>Select a Project</h1>
                </div>
                <div class="workspace-content">
                    <div id="project-list">
                        <div class="loading">Loading projects...</div>
                    </div>
                    <button class="btn-primary" id="new-project-btn" style="margin-top: 16px;">
                        ➕ Create New Project
                    </button>
                </div>
            </div>
        `;

        this.loadProjectList();

        document.getElementById('new-project-btn').addEventListener('click', () => {
            this.createNewProject();
        });
    }

    async loadProjectList() {
        const projects = await this.fetchProjects();
        const listDiv = document.getElementById('project-list');
        
        if (projects.length === 0) {
            listDiv.innerHTML = '<div class="empty-state"><p>No projects yet</p></div>';
            return;
        }

        listDiv.innerHTML = projects.map(p => `
            <div class="project-item" onclick="window.location.href='workspace.html?project=${p.id}'">
                <h3>${p.project_name}</h3>
                <p>${p.description || 'No description'}</p>
            </div>
        `).join('');
    }

    async loadProject() {
        if (!this.projectId) {
            console.error('No project ID provided');
            return;
        }
        await this.fetchProjectDetails(this.projectId);
    }

    async fetchProjects() {
        try {
            const res = await fetch(`${this.apiBase}/projects`);
            const data = await res.json();
            return data.success ? data.projects : [];
        } catch (err) {
            console.error('Failed to fetch projects:', err);
            return [];
        }
    }

    async createNewProject() {
        const name = prompt('Enter project name:');
        if (!name) return null;

        const description = prompt('Enter project description (optional):') || '';

        try {
            const res = await fetch(`${this.apiBase}/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description, techStack: [] })
            });
            const data = await res.json();
            if (data.success) {
                // Redirect to workspace with the new project ID
                window.location.href = `workspace.html?project=${data.projectId}`;
                return data.projectId;
            } else {
                alert('Failed to create project: ' + (data.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Failed to create project:', err);
            alert('Failed to create project. Please try again.');
        }
        return null;
    }

    async fetchProjectDetails(projectId) {
        try {
            const res = await fetch(`${this.apiBase}/projects/${projectId}`);
            const data = await res.json();
            if (data.success) {
                this.currentProject = data.project;
            }
        } catch (err) {
            console.error('Failed to fetch project:', err);
        }
    }

    renderWorkspace() {
        const container = document.getElementById('workspace-container') || this.createContainer();
        
        container.innerHTML = `
            <div class="workspace-header">
                <div class="workspace-title">
                    <span class="workspace-icon">📦</span>
                    <h1>${this.currentProject?.name || 'Select Project'}</h1>
                </div>
                <div class="workspace-actions">
                    <button class="btn-icon" id="workspace-settings">⚙️</button>
                </div>
            </div>

            <div class="workspace-tabs">
                <button class="tab ${this.currentTab === 'files' ? 'active' : ''}" data-tab="files">
                    📁 Files
                </button>
                <button class="tab ${this.currentTab === 'commits' ? 'active' : ''}" data-tab="commits">
                    🔄 Commits
                </button>
                <button class="tab ${this.currentTab === 'ai-review' ? 'active' : ''}" data-tab="ai-review">
                    🤖 AI Review
                </button>
                <button class="tab ${this.currentTab === 'evaluate' ? 'active' : ''}" data-tab="evaluate">
                    📊 Evaluate
                </button>
            </div>

            <div class="workspace-content">
                <div id="tab-content"></div>
            </div>
        `;

        this.renderTabContent();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'workspace-container';
        container.className = 'workspace-container';
        document.body.appendChild(container);
        return container;
    }

    renderTabContent() {
        const content = document.getElementById('tab-content');
        
        switch (this.currentTab) {
            case 'files':
                if (window.FilesTab) {
                    new window.FilesTab(content, this.currentProject, this.apiBase);
                } else {
                    content.innerHTML = '<div class="tab-loading">Files tab loading...</div>';
                }
                break;
            case 'commits':
                if (window.CommitsTab) {
                    new window.CommitsTab(content, this.currentProject, this.apiBase);
                } else {
                    content.innerHTML = '<div class="tab-loading">Commits tab loading...</div>';
                }
                break;
            case 'ai-review':
                if (window.AIReviewTab) {
                    new window.AIReviewTab(content, this.currentProject, this.apiBase);
                } else {
                    content. innerHTML = '<div class="tab-loading">AI Review tab loading...</div>';
                }
                break;
            case 'evaluate':
                if (window.EvaluateTab) {
                    new window.EvaluateTab(content, this.currentProject, this.apiBase);
                } else {
                    content.innerHTML = '<div class="tab-loading">Evaluate tab loading...</div>';
                }
                break;
        }
    }

    attachEventListeners() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        this.renderWorkspace();
    }
}

// Initialize workspace when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.projectWorkspace = new ProjectWorkspace();
    });
} else {
    window.projectWorkspace = new ProjectWorkspace();
}
