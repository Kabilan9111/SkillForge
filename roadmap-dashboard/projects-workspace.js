/**
 * ========================================
 * PROJECTS WORKSPACE - AI-Augmented Version Control
 * ========================================
 * GitHub-like project management with intelligent code review
 * - Version control with commits and rollback
 * - AI code analysis and career-readiness evaluation
 * - Project evolution tracking
 */

(function() {
    'use strict';

    // ==================== CONFIGURATION ====================
    const API_BASE_URL = 'http://localhost:5000/api';

    // ==================== STATE ====================
    const state = {
        projects: [],
        currentProject: null,
        currentView: 'grid', // 'grid' | 'detail'
        selectedFile: null,
        commits: [],
        aiReviews: [],
        pendingChanges: new Map() // Track uncommitted changes
    };

    // Load projects from backend API
    async function loadState() {
        try {
            // First check and migrate any localStorage projects
            await migrateLocalStorageProjects();
            
            // Fetch from backend (send auth token if available)
            const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('skillforge_token');
            const fetchHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await fetch(`${API_BASE_URL}/workspace/projects`, { headers: fetchHeaders });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    state.projects = data.projects || [];
                    console.log('[Projects] Loaded', state.projects.length, 'projects from backend');
                } else {
                    console.warn('[Projects] API returned error:', data.error);
                    state.projects = [];
                }
            } else {
                console.warn('[Projects] Failed to fetch projects:', response.status);
                state.projects = [];
            }
        } catch (error) {
            console.error('[Projects] Error loading projects:', error);
            state.projects = [];
        }
    }
    
    // Migrate localStorage projects to backend
    async function migrateLocalStorageProjects() {
        try {
            const localProjects = localStorage.getItem('skillforge_projects');
            if (!localProjects) return;
            
            const projects = JSON.parse(localProjects);
            if (!Array.isArray(projects) || projects.length === 0) return;
            
            console.log('[Projects] Found', projects.length, 'projects in localStorage, migrating...');
            
            for (const project of projects) {
                try {
                    const response = await fetch(`${API_BASE_URL}/workspace/projects`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: project.name,
                            description: project.description || '',
                            techStack: project.techStack || []
                        })
                    });
                    
                    if (response.ok) {
                        console.log('[Projects] Migrated:', project.name);
                    }
                } catch (err) {
                    console.error('[Projects] Failed to migrate:', project.name, err);
                }
            }
            
            // Clear localStorage after successful migration
            localStorage.removeItem('skillforge_projects');
            console.log('[Projects] Migration complete');
            
        } catch (error) {
            console.error('[Projects] Migration error:', error);
        }
    }

    function saveState() {
        try {
            localStorage.setItem('skillforge_projects', JSON.stringify(state.projects));
            localStorage.setItem('skillforge_commits', JSON.stringify(state.commits));
            localStorage.setItem('skillforge_ai_reviews', JSON.stringify(state.aiReviews));
        } catch (e) {
            console.error('[Projects] Error saving state:', e);
        }
    }

    // ==================== DOM REFERENCES ====================
    const dom = {
        // Grid view
        createProjectBtn: null,
        projectsGridView: null,
        projectsGrid: null,
        
        // Detail view
        projectDetailView: null,
        backToProjectsBtn: null,
        detailProjectTitle: null,
        detailProjectStatus: null,
        detailProjectCreated: null,
        uploadFilesBtn: null,
        commitPushBtn: null,
        markCompleteBtn: null,
        
        // Tabs
        projectTabs: null,
        tabFiles: null,
        tabCommits: null,
        tabAiReview: null,
        tabEvolution: null,
        
        // File browser
        fileTree: null,
        fileViewer: null,
        
        // Commits
        commitsTimeline: null,
        commitsCount: null,
        
        // AI Review
        aiReviewContainer: null,
        
        // Evolution
        evolutionDashboard: null,
        
        // Modals
        createProjectModal: null,
        closeCreateProjectModal: null,
        newProjectName: null,
        newProjectDesc: null,
        newProjectTech: null,
        newProjectType: null,
        confirmCreateProjectBtn: null,
        cancelCreateProjectBtn: null,
        
        commitModal: null,
        closeCommitModal: null,
        commitMessageInput: null,
        triggerAiReviewCheckbox: null,
        confirmCommitBtn: null,
        cancelCommitBtn: null,
        changedFilesSummary: null
    };

    function cacheDOMElements() {
        dom.createProjectBtn = document.getElementById('create-project-btn');
        dom.projectsGridView = document.getElementById('projects-grid-view');
        dom.projectsGrid = document.querySelector('.projects-grid');
        
        dom.projectDetailView = document.getElementById('project-detail-view');
        dom.backToProjectsBtn = document.getElementById('back-to-projects-btn');
        dom.detailProjectTitle = document.getElementById('detail-project-title');
        dom.detailProjectStatus = document.getElementById('detail-project-status');
        dom.detailProjectCreated = document.getElementById('detail-project-created');
        dom.uploadFilesBtn = document.getElementById('upload-files-btn');
        dom.commitPushBtn = document.getElementById('commit-push-btn');
        dom.markCompleteBtn = document.getElementById('mark-complete-btn');
        
        dom.projectTabs = document.querySelectorAll('.project-tab');
        dom.tabFiles = document.getElementById('tab-files');
        dom.tabCommits = document.getElementById('tab-commits');
        dom.tabAiReview = document.getElementById('tab-ai-review');
        dom.tabEvolution = document.getElementById('tab-evolution');
        
        dom.fileTree = document.getElementById('file-tree');
        dom.fileViewer = document.getElementById('file-viewer');
        dom.commitsTimeline = document.getElementById('commits-timeline');
        dom.commitsCount = document.getElementById('commits-count');
        dom.aiReviewContainer = document.getElementById('ai-review-content');
        dom.evolutionDashboard = document.getElementById('evolution-timeline');
        
        dom.createProjectModal = document.getElementById('create-project-modal');
        dom.newProjectName = document.getElementById('new-project-name');
        dom.newProjectDesc = document.getElementById('new-project-desc');
        dom.newProjectTech = document.getElementById('new-project-tech');
        dom.newProjectType = document.getElementById('new-project-type');

        dom.commitModal = document.getElementById('commit-modal');
        dom.commitMessageInput = document.getElementById('commit-message');
        dom.triggerAiReviewCheckbox = document.getElementById('trigger-ai-review');
        dom.changedFilesSummary = document.getElementById('changed-files-summary');
    }

    // ==================== INITIALIZATION ====================
    async function init() {
        console.log('[Projects] Initializing...');
        cacheDOMElements();
        await loadState(); // Load projects from backend
        setupEventListeners();

        // Handle browser back/forward
        window.addEventListener('popstate', function(e) {
            if (e.state && e.state.projectId) {
                openProject(e.state.projectId);
            } else {
                renderProjectsGrid();
            }
        });

        // If workspace.html loaded with ?project=ID, open that project directly
        const urlParams = new URLSearchParams(window.location.search);
        const projectIdParam = urlParams.get('project');
        if (projectIdParam) {
            await openProject(parseInt(projectIdParam, 10));
            return;
        }

        // Initial render if on projects page (SPA mode)
        if (document.getElementById('projects-page') && document.getElementById('projects-page').classList.contains('active')) {
            renderProjectsGrid();
        }

        // If on workspace.html standalone (no project param), show grid
        if (document.getElementById('projects-grid-view') && !projectIdParam) {
            renderProjectsGrid();
        }

        console.log('[Projects] Ready with', state.projects.length, 'projects');
    }

    function setupEventListeners() {
        // Create project
        if (dom.createProjectBtn) {
            dom.createProjectBtn.addEventListener('click', openCreateProjectModal);
        }
        
        if (dom.closeCreateProjectModal) {
            dom.closeCreateProjectModal.addEventListener('click', closeCreateProjectModal);
        }
        
        if (dom.confirmCreateProjectBtn) {
            dom.confirmCreateProjectBtn.addEventListener('click', createProject);
        }
        
        if (dom.cancelCreateProjectBtn) {
            dom.cancelCreateProjectBtn.addEventListener('click', closeCreateProjectModal);
        }
        
        // Back to projects
        if (dom.backToProjectsBtn) {
            dom.backToProjectsBtn.addEventListener('click', showProjectsGrid);
        }
        
        // Project actions
        if (dom.uploadFilesBtn) {
            dom.uploadFilesBtn.addEventListener('click', uploadFiles);
        }
        
        if (dom.commitPushBtn) {
            dom.commitPushBtn.addEventListener('click', openCommitModal);
        }
        
        if (dom.markCompleteBtn) {
            dom.markCompleteBtn.addEventListener('click', markProjectComplete);
        }
        
        // Tabs
        dom.projectTabs.forEach(tab => {
            tab.addEventListener('click', () => switchProjectTab(tab.dataset.tab));
        });
        
        // Commit modal
        if (dom.closeCommitModal) {
            dom.closeCommitModal.addEventListener('click', closeCommitModal);
        }
        
        if (dom.confirmCommitBtn) {
            dom.confirmCommitBtn.addEventListener('click', confirmCommit);
        }
        
        if (dom.cancelCommitBtn) {
            dom.cancelCommitBtn.addEventListener('click', closeCommitModal);
        }
    }

    // ==================== PROJECT CREATION ====================
    function openCreateProjectModal() {
        if (dom.createProjectModal) {
            dom.createProjectModal.classList.remove('hidden');
        }
        
        // Clear form
        if (dom.newProjectName) dom.newProjectName.value = '';
        if (dom.newProjectDesc) dom.newProjectDesc.value = '';
        if (dom.newProjectTech) dom.newProjectTech.value = '';
        if (dom.newProjectType) dom.newProjectType.value = 'fullstack';
    }

    function closeCreateProjectModal() {
        if (dom.createProjectModal) {
            dom.createProjectModal.classList.add('hidden');
        }
    }

    async function createProject() {
        const name = dom.newProjectName?.value.trim();
        const description = dom.newProjectDesc?.value.trim() || 'No description provided';
        const techStack = dom.newProjectTech?.value.trim() || '';
        const projectType = dom.newProjectType?.value || 'other';
        
        if (!name) {
            showNotification('Please enter a project name', 'error');
            return;
        }
        
        // Check for duplicate names
        if (state.projects.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            showNotification('A project with this name already exists', 'error');
            return;
        }
        
        // Disable create button while submitting
        const submitBtn = document.querySelector('#create-project-modal .btn-primary');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Creating...'; }

        try {
            const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('skillforge_token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${API_BASE_URL}/workspace/projects`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name,
                    description,
                    techStack: techStack.split(',').map(t => t.trim()).filter(Boolean)
                })
            });
            
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `HTTP ${response.status}`);
            }
            
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Unknown error');
            }
            
            closeCreateProjectModal();
            showNotification(`Project "${name}" created!`, 'success');

            // Redirect to the new project workspace
            const newId = data.projectId || data.project?.id;
            if (newId) {
                window.location.href = `workspace.html?project=${newId}`;
            } else {
                await loadState();
                renderProjectsGrid();
            }
        } catch (error) {
            console.error('[Projects] Create error:', error);
            showNotification('Failed to create project: ' + error.message, 'error');
        } finally {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fas fa-plus"></i> Create Project'; }
        }
    }

    // ==================== PROJECTS GRID ====================
    function renderProjectsGrid() {
        console.log('[Projects] renderProjectsGrid() called');
        
        // Ensure DOM elements are cached (in case we navigated to this page)
        if (!dom.projectsGrid) {
            dom.projectsGridView = document.getElementById('projects-grid-view');
            dom.projectsGrid = document.querySelector('.projects-grid');
        }
        if (!dom.projectDetailView) {
            dom.projectDetailView = document.getElementById('project-detail-view');
        }
        
        console.log('[Projects] Elements found:', { grid: !!dom.projectsGrid, detail: !!dom.projectDetailView });
        
        if (!dom.projectsGrid) {
            console.error('[Projects] Projects grid element not found');
            return;
        }
        
        state.currentView = 'grid';
        // Show entire grid-view page, hide detail page
        if (dom.projectsGridView) dom.projectsGridView.classList.remove('hidden');
        dom.projectsGrid.classList.remove('hidden');
        if (dom.projectDetailView) dom.projectDetailView.classList.add('hidden');
        // Clean up URL
        history.replaceState(null, '', window.location.pathname);
        
        if (state.projects.length === 0) {
            console.log('[Projects] No projects found, rendering empty state');
            dom.projectsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-folder-open fa-3x"></i>
                    <h3>No Projects Yet</h3>
                    <p>Create your first project workspace to start building your portfolio</p>
                    <a href="workspace.html" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Create Project Workspace
                    </a>
                </div>
            `;
            return;
        }
        
        console.log('[Projects] Rendering', state.projects.length, 'projects');
        
        dom.projectsGrid.innerHTML = state.projects.map(project => {
            const createdDate = new Date(project.created_at).toLocaleDateString();
            const techStack = project.tech_stack ? (Array.isArray(project.tech_stack) ? project.tech_stack : JSON.parse(project.tech_stack || '[]')) : [];
            
            return `
                <div class="project-card" onclick="window.ProjectsWorkspace.openProject(${project.id})">
                    <div class="project-card-header">
                        <div>
                            <h3 class="project-card-title">${escapeHtml(project.project_name || project.name || 'Untitled')}</h3>
                            <p class="project-card-desc">${escapeHtml(project.description || 'No description')}</p>
                        </div>
                    </div>
                    <div class="project-card-meta">
                        ${techStack.slice(0, 3).map(tech => 
                            `<span class="project-tech-badge">${escapeHtml(tech)}</span>`
                        ).join('')}
                        ${techStack.length > 3 ? `<span class="project-tech-badge">+${techStack.length - 3} more</span>` : ''}
                    </div>
                    <div class="project-card-footer">
                        <div class="project-stats">
                            <span><i class="fas fa-code-branch"></i> ${project.total_commits || 0} commits</span>
                            <span><i class="fas fa-file-code"></i> ${project.total_files || 0} files</span>
                        </div>
                        <span class="project-date">Created: ${createdDate}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function showProjectsGrid() {
        renderProjectsGrid();
    }

    // ==================== BACKEND DATA LOADERS ====================
    async function loadProjectFiles() {
        if (!state.currentProject) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/workspace/projects/${state.currentProject.id}/files`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.files) {
                    state.currentProject.files = {};
                    data.files.forEach(file => {
                        state.currentProject.files[file.file_path] = {
                            path: file.file_path,
                            content: file.file_content || '',
                            size: file.file_size || 0,
                            lastModified: new Date(file.created_at).getTime()
                        };
                    });
                }
            }
        } catch (error) {
            console.error('[Projects] Error loading files:', error);
        }
    }
    
    async function loadProjectCommits() {
        if (!state.currentProject) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/workspace/projects/${state.currentProject.id}/commits`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.commits) {
                    state.commits = state.commits.filter(c => c.projectId !== state.currentProject.id);
                    data.commits.forEach(commit => {
                        state.commits.push({
                            id: commit.id,
                            projectId: state.currentProject.id,
                            hash: commit.commit_hash,
                            message: commit.message,
                            timestamp: new Date(commit.created_at).getTime(),
                            author: 'You',
                            filesCount: commit.files_count || 0,
                            linesAdded: commit.total_lines || 0,
                            files: commit.files || [],
                            // Keep changes compat for activity chart impact calculation
                            changes: {
                                added: Array(commit.files_count || 0).fill(null),
                                modified: [],
                                deleted: []
                            }
                        });
                    });
                }
            }
        } catch (error) {
            console.error('[Projects] Error loading commits:', error);
        }
    }

    // ==================== PROJECT DETAIL VIEW ====================
    async function openProject(projectId) {
        // Re-cache in case we navigated here directly (URL param path)
        if (!dom.projectsGridView) cacheDOMElements();

        // Try to find project in state; if not loaded yet, fetch directly from backend
        let project = state.projects.find(p => p.id === projectId);
        if (!project) {
            try {
                const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('skillforge_token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const r = await fetch(`${API_BASE_URL}/workspace/projects/${projectId}`, { headers });
                if (r.ok) {
                    const d = await r.json();
                    if (d.success && d.project) project = d.project;
                }
            } catch(e) { console.error('[Projects] Failed to fetch project:', e); }
        }
        if (!project) {
            console.error('[Projects] Project not found:', projectId);
            return;
        }
        
        state.currentProject = project;
        state.currentProject.files = state.currentProject.files || {};
        state.currentView = 'detail';

        // Update URL without page reload
        const newUrl = window.location.pathname + '?project=' + projectId;
        history.pushState({ projectId }, project.name, newUrl);
        
        // Load files and commits from backend
        await Promise.all([
            loadProjectFiles(),
            loadProjectCommits()
        ]);
        
        // Hide entire grid-view page, show detail page
        if (dom.projectsGridView) dom.projectsGridView.classList.add('hidden');
        dom.projectDetailView.classList.remove('hidden');
        
        renderProjectDetail();
    }

    function renderProjectDetail() {
        if (!state.currentProject) return;
        
        const project = state.currentProject;
        
        // Update header
        if (dom.detailProjectTitle) dom.detailProjectTitle.textContent = project.name;
        if (dom.detailProjectStatus) {
            dom.detailProjectStatus.textContent = formatStatus(project.status);
            dom.detailProjectStatus.className = `project-status-badge ${project.status}`;
        }
        if (dom.detailProjectCreated) {
            dom.detailProjectCreated.textContent = `Created ${formatDate(project.created_at || project.createdAt)}`;
        }
        
        // Update commits count
        const commits = state.commits.filter(c => c.projectId === project.id);
        if (dom.commitsCount) dom.commitsCount.textContent = commits.length;
        
        // Render default tab (files)
        switchProjectTab('files');
    }

    function switchProjectTab(tabName) {
        // Update tab buttons
        dom.projectTabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Update tab content
        [dom.tabFiles, dom.tabCommits, dom.tabAiReview, dom.tabEvolution].forEach(pane => {
            if (pane) pane.classList.add('hidden');
        });
        
        const activePane = document.getElementById(`tab-${tabName}`);
        if (activePane) activePane.classList.remove('hidden');
        
        // Render content based on tab
        switch (tabName) {
            case 'files':
                renderFileTree();
                break;
            case 'commits':
                renderCommitsTimeline();
                break;
            case 'ai-review':
                renderAIReview();
                break;
            case 'evolution':
                renderEvolution();
                break;
        }
    }

    // ==================== FILE MANAGEMENT ====================
    function renderFileTree() {
        if (!dom.fileTree || !state.currentProject) return;
        
        const files = Object.keys(state.currentProject.files).sort();
        
        if (files.length === 0) {
            dom.fileTree.innerHTML = '<p class="text-muted" style="padding: 1rem;">No files uploaded yet</p>';
            return;
        }
        
        // Build tree structure
        const tree = buildFileTree(files);
        dom.fileTree.innerHTML = renderTreeNode(tree);
        
        // Attach click handlers
        dom.fileTree.querySelectorAll('.file-tree-item').forEach(item => {
            item.addEventListener('click', () => {
                const filePath = item.dataset.path;
                if (filePath) {
                    selectFile(filePath);
                }
            });
        });
    }

    function buildFileTree(filePaths) {
        const tree = { name: 'root', type: 'folder', children: {} };
        
        filePaths.forEach(path => {
            const parts = path.split('/');
            let current = tree;
            
            parts.forEach((part, index) => {
                if (index === parts.length - 1) {
                    // File
                    current.children[part] = { name: part, type: 'file', path };
                } else {
                    // Folder
                    if (!current.children[part]) {
                        current.children[part] = { name: part, type: 'folder', children: {} };
                    }
                    current = current.children[part];
                }
            });
        });
        
        return tree;
    }

    function renderTreeNode(node, level = 0) {
        if (node.type === 'file') {
            const icon = getFileIcon(node.name);
            return `
                <div class="file-tree-item" data-path="${node.path}" style="padding-left: ${level * 1.5}rem">
                    <i class="fas fa-${icon}"></i>
                    <span>${escapeHtml(node.name)}</span>
                </div>
            `;
        }
        
        if (node.type === 'folder' && node.name !== 'root') {
            let html = `
                <div class="file-tree-item folder" style="padding-left: ${level * 1.5}rem">
                    <i class="fas fa-folder"></i>
                    <span>${escapeHtml(node.name)}</span>
                </div>
            `;
            
            Object.values(node.children).forEach(child => {
                html += renderTreeNode(child, level + 1);
            });
            
            return html;
        }
        
        // Root
        return Object.values(node.children).map(child => renderTreeNode(child, level)).join('');
    }

    function getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const iconMap = {
            js: 'file-code', jsx: 'file-code', ts: 'file-code', tsx: 'file-code',
            py: 'file-code', java: 'file-code', cpp: 'file-code', c: 'file-code',
            html: 'file-code', css: 'file-code', scss: 'file-code',
            json: 'file-code', xml: 'file-code', yaml: 'file-code', yml: 'file-code',
            md: 'file-alt', txt: 'file-alt',
            png: 'file-image', jpg: 'file-image', gif: 'file-image', svg: 'file-image',
            pdf: 'file-pdf',
            zip: 'file-archive', tar: 'file-archive', gz: 'file-archive'
        };
        
        return iconMap[ext] || 'file';
    }

    function selectFile(filePath) {
        state.selectedFile = filePath;
        
        // Update active state
        dom.fileTree.querySelectorAll('.file-tree-item').forEach(item => {
            if (item.dataset.path === filePath) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        renderFileViewer(filePath);
    }

    function renderFileViewer(filePath) {
        if (!dom.fileViewer || !state.currentProject) return;
        
        const file = state.currentProject.files[filePath];
        if (!file) return;
        
        const ext = filePath.split('.').pop().toLowerCase();
        const language = getLanguageFromExt(ext);
        
        dom.fileViewer.innerHTML = `
            <div class="file-viewer-header">
                <div class="file-viewer-title">
                    <i class="fas fa-${getFileIcon(filePath)}"></i>
                    <span>${escapeHtml(filePath)}</span>
                </div>
                <span class="text-muted">${formatFileSize(file.size || file.content.length)}</span>
            </div>
            <div class="file-content">
                <pre><code class="language-${language}">${escapeHtml(file.content)}</code></pre>
            </div>
        `;
    }

    function getLanguageFromExt(ext) {
        const langMap = {
            js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
            py: 'python', java: 'java', cpp: 'cpp', c: 'c',
            html: 'html', css: 'css', scss: 'scss',
            json: 'json', xml: 'xml', yaml: 'yaml', yml: 'yaml',
            md: 'markdown', txt: 'plaintext'
        };
        
        return langMap[ext] || 'plaintext';
    }

    // ==================== FILE UPLOAD ====================
    async function uploadFiles() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.webkitdirectory = true; // Allow folder upload
        
        input.onchange = async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;
            
            // FILTER OUT node_modules, .git, build folders
            const excludePatterns = [
                /node_modules/i,
                /\.git\//i,
                /dist\//i,
                /build\//i,
                /\.next\//i,
                /\.vscode\//i,
                /__pycache__/i,
                /\.pytest_cache/i,
                /venv\//i,
                /\.env$/i
            ];
            
            const filteredFiles = files.filter(file => {
                const path = file.webkitRelativePath || file.name;
                return !excludePatterns.some(pattern => pattern.test(path));
            });
            
            const excludedCount = files.length - filteredFiles.length;
            if (excludedCount > 0) {
                showNotification(`Excluded ${excludedCount} files (node_modules, .git, build folders). Uploading ${filteredFiles.length} files...`, 'warning', 4000);
            } else {
                showNotification(`Uploading ${filteredFiles.length} files...`, 'info');
            }
            
            // Limit check
            if (filteredFiles.length > 1000) {
                showNotification(`Too many files (${filteredFiles.length}). Maximum 1,000 files.`, 'error');
                return;
            }
            
            try {
                // Upload to backend
                const formData = new FormData();
                for (const file of filteredFiles) {
                    formData.append('files', file, file.webkitRelativePath || file.name);
                }
                
                const response = await fetch(`${API_BASE_URL}/workspace/projects/${state.currentProject.id}/files`, {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error('Upload failed');
                }
                
                const data = await response.json();
if (!data.success) {
                    throw new Error(data.error || 'Unknown error');
                }
                
                showNotification(`${filteredFiles.length} files uploaded successfully!`, 'success');
                
                // Reload file tree
                await loadProjectFiles();
                renderFileTree();
                
                // Mark all uploaded files as pending changes
                for (const file of filteredFiles) {
                    const filePath = file.webkitRelativePath || file.name;
                    state.pendingChanges.set(filePath, 'added');
                }
                
                // Enable commit button
                if (dom.commitPushBtn) dom.commitPushBtn.disabled = false;
                
            } catch (error) {
                console.error('[Projects] Upload error:', error);
                showNotification('Upload failed: ' + error.message, 'error');
            }
        };
        
        input.click();
    }

    function readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    // ==================== VERSION CONTROL ====================
    function openCommitModal() {
        if (!state.currentProject || state.pendingChanges.size === 0) {
            showNotification('No changes to commit', 'warning');
            return;
        }
        
        if (dom.commitModal) dom.commitModal.classList.remove('hidden');
        
        // Show changed files
        if (dom.changedFilesSummary) {
            const changes = Array.from(state.pendingChanges.entries());
            dom.changedFilesSummary.innerHTML = `
                <strong>Changes (${changes.length} files):</strong>
                <ul>
                    ${changes.map(([path, status]) => `
                        <li class="file-${status}">
                            <i class="fas fa-${status === 'added' ? 'plus' : status === 'modified' ? 'edit' : 'minus'}"></i>
                            ${escapeHtml(path)}
                        </li>
                    `).join('')}
                </ul>
            `;
        }
        
        // Clear commit message
        if (dom.commitMessageInput) dom.commitMessageInput.value = '';
    }

    function closeCommitModal() {
        if (dom.commitModal) dom.commitModal.classList.add('hidden');
    }

    async function confirmCommit() {
        const message = dom.commitMessageInput?.value.trim();
        const triggerAi = dom.triggerAiReviewCheckbox?.checked || false;
        
        if (!message) {
            showNotification('Please enter a commit message', 'error');
            return;
        }
        
        if (!state.currentProject) {
            showNotification('No project selected', 'error');
            return;
        }
        
        // Disable button to prevent double-submit
        if (dom.confirmCommitBtn) {
            dom.confirmCommitBtn.disabled = true;
            dom.confirmCommitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Committing...';
        }
        
        try {
            // Create commit on backend
            const response = await fetch(`${API_BASE_URL}/workspace/projects/${state.currentProject.id}/commits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            
            if (!response.ok) {
                throw new Error('Commit failed');
            }
            
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Unknown error');
            }
            
            closeCommitModal();
            showNotification('Changes committed successfully!', 'success');
            
            // Reload commits
            await loadProjectCommits();
            renderCommitsTimeline();
            
            // Clear pending changes
            state.pendingChanges.clear();
            if (dom.commitPushBtn) dom.commitPushBtn.disabled = true;
            
        } catch (error) {
            console.error('[Projects] Commit failed:', error);
            showNotification(`Commit failed: ${error.message}`, 'error');
            
        } finally {
            // Re-enable button
            if (dom.confirmCommitBtn) {
                dom.confirmCommitBtn.disabled = false;
                dom.confirmCommitBtn.innerHTML = '<i class="fas fa-check"></i> Commit & Push';
            }
        }
    }

    function generateCommitHash() {
        return Math.random().toString(36).substring(2, 9);
    }

    // ==================== COMMITS TIMELINE ====================
    function renderCommitsTimeline() {
        if (!dom.commitsTimeline || !state.currentProject) return;
        
        const commits = state.commits
            .filter(c => c.projectId === state.currentProject.id)
            .sort((a, b) => b.timestamp - a.timestamp);
        
        if (commits.length === 0) {
            dom.commitsTimeline.innerHTML = `
                <div class="commits-empty-state">
                    <div class="empty-activity-grid">
                        ${renderActivityGrid([])}
                    </div>
                    <div class="empty-state-content">
                        <i class="fas fa-rocket fa-3x"></i>
                        <h3>Your coding journey starts here</h3>
                        <p>Make your first commit to see your progress come alive</p>
                        <div class="empty-state-hint">
                            <i class="fas fa-lightbulb"></i>
                            <span>Tip: Each commit builds your momentum and tracks your evolution</span>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        // Calculate project momentum stats
        const totalFiles = Object.keys(state.currentProject.files).length;
        const lastCommit = commits[0];
        const timeAgo = formatTimeAgo(lastCommit.timestamp);
        const totalAdditions = commits.reduce((sum, c) => sum + (c.changes?.added?.length || 0), 0);
        const totalModifications = commits.reduce((sum, c) => sum + (c.changes?.modified?.length || 0), 0);
        
        dom.commitsTimeline.innerHTML = `
            <!-- Activity Heatmap -->
            <div class="commit-activity-section">
                <h3 class="activity-title">
                    <i class="fas fa-chart-line"></i> Commit Activity
                </h3>
                ${renderActivityGrid(commits)}
            </div>
            
            <!-- Project Momentum Stats -->
            <div class="project-momentum">
                <div class="momentum-stat">
                    <div class="stat-value">${commits.length}</div>
                    <div class="stat-label">Total Commits</div>
                </div>
                <div class="momentum-stat">
                    <div class="stat-value">${totalFiles}</div>
                    <div class="stat-label">Files</div>
                </div>
                <div class="momentum-stat">
                    <div class="stat-value">${commits.reduce((s, c) => s + (c.linesAdded || 0), 0).toLocaleString()}</div>
                    <div class="stat-label">Lines Added</div>
                </div>
                <div class="momentum-stat">
                    <div class="stat-value">${timeAgo}</div>
                    <div class="stat-label">Last Activity</div>
                </div>
            </div>
            
            <!-- Commit Cards -->
            <div class="commits-timeline-modern">
                ${commits.map((commit, index) => renderCommitCard(commit, index)).join('')}
            </div>
        `;
    }
    
    function renderActivityGrid(commits) {
        const now = new Date();
        const days = 90;
        const activityData = [];
        
        // Create activity map
        const activityMap = {};
        commits.forEach(commit => {
            const date = new Date(commit.timestamp).toISOString().split('T')[0];
            if (!activityMap[date]) activityMap[date] = [];
            activityMap[date].push(commit);
        });
        
        // Generate 90-day data
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayCommits = activityMap[dateStr] || [];
            const count = dayCommits.length;
            
            const impact = dayCommits.reduce((sum, c) => {
                const changes = c.changes || { added: [], modified: [], deleted: [] };
                return sum + changes.added.length + changes.modified.length + changes.deleted.length;
            }, 0);
            
            const recencyFactor = 1 - (i / days) * 0.4;
            
            activityData.push({
                date: dateStr,
                count,
                impact,
                commits: dayCommits,
                recencyFactor,
                dayIndex: i,
                monthDay: date.getDate(),
                month: date.toLocaleDateString('en-US', { month: 'short' })
            });
        }
        
        // Store data for canvas rendering
        const canvasId = `timeline-canvas-${Date.now()}`;
        setTimeout(() => initEnergyTimeline(canvasId, activityData), 100);
        
        return `
            <div class="cinematic-timeline-container">
                <canvas id="${canvasId}" class="energy-timeline-canvas"></canvas>
                <div class="timeline-labels">
                    <span class="timeline-label-start">90 days ago</span>
                    <span class="timeline-label-end">Today</span>
                </div>
                <div id="timeline-tooltip" class="timeline-glassmorphism-tooltip"></div>
            </div>
        `;
    }
    
    // Cinematic Energy Timeline Renderer
    function initEnergyTimeline(canvasId, activityData) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        
        // Set canvas size
        const updateSize = () => {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = 250 * window.devicePixelRatio;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = '250px';
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        
        const width = canvas.width / window.devicePixelRatio;
        const height = 250;
        const padding = 40;
        const baselineY = height * 0.7;
        const maxSpikeHeight = height * 0.5;
        
        // Calculate max impact for scaling
        const maxImpact = Math.max(...activityData.map(d => d.impact), 1);
        
        // Animation state
        let animationProgress = 0;
        const animationDuration = 2000;
        let startTime = null;
        let particles = [];
        let shockwaves = [];
        let hoveredSpike = null;
        
        // Spike data with positions
        const spikes = activityData.map((day, i) => {
            const x = padding + (i / (activityData.length - 1)) * (width - padding * 2);
            const spikeHeight = day.impact > 0 ? (day.impact / maxImpact) * maxSpikeHeight : 0;
            const isMostRecent = i === activityData.length - 1 && day.count > 0;
            
            // Color storytelling: cold blue -> electric cyan
            let color;
            if (isMostRecent) {
                color = { r: 0, g: 240, b: 255 }; // Electric Cyan
            } else if (day.recencyFactor > 0.8) {
                color = { r: 50, g: 180, b: 255 }; // Bright Blue
            } else if (day.recencyFactor > 0.6) {
                color = { r: 80, g: 120, b: 220 }; // Muted Blue
            } else if (day.recencyFactor > 0.4) {
                color = { r: 100, g: 100, b: 200 }; // Deep Blue
            } else {
                color = { r: 80, g: 80, b: 120 }; // Desaturated Purple
            }
            
            return { ...day, x, spikeHeight, color, isMostRecent };
        });
        
        // Enhanced particle system
        class Particle {
            constructor(x, y, isSparkle = false) {
                this.x = x;
                this.y = y;
                this.isSparkle = isSparkle;
                
                if (isSparkle) {
                    // Sparks drift upward with slight angle
                    this.vy = -1.2 - Math.random() * 1.5;
                    this.vx = (Math.random() - 0.5) * 0.8;
                    this.life = 1;
                    this.decay = 0.008 + Math.random() * 0.012;
                    this.size = 2 + Math.random() * 3;
                } else {
                    this.vy = -0.3 - Math.random() * 0.5;
                    this.vx = (Math.random() - 0.5) * 0.3;
                    this.life = 1;
                    this.decay = 0.01 + Math.random() * 0.01;
                    this.size = 1 + Math.random() * 2;
                }
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.life -= this.decay;
                return this.life > 0;
            }
            
            draw(ctx) {
                ctx.globalAlpha = this.life * (this.isSparkle ? 0.8 : 0.5);
                
                if (this.isSparkle) {
                    // Sparkle with glow
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#d00000';
                    ctx.fillStyle = '#ff1a1a';
                } else {
                    ctx.fillStyle = '#7000ff'; /* Purple dust */
                }
                
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            }
        }
        
        // Shockwave ripple effect
        class Shockwave {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.radius = 0;
                this.maxRadius = 60;
                this.speed = 3;
                this.life = 1;
            }
            
            update() {
                this.radius += this.speed;
                this.life = 1 - (this.radius / this.maxRadius);
                return this.radius < this.maxRadius;
            }
            
            draw(ctx) {
                ctx.globalAlpha = this.life * 0.6;
                ctx.strokeStyle = '#d00000';
                ctx.lineWidth = 2;
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#d00000';
                
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            }
        }
        
        // Drawing functions
        function drawBaseline(progress, time) {
            const timelineLength = width - padding * 2;
            const endX = padding + timelineLength * progress;
            
            // Animated pulse traveling along timeline
            const pulsePos = (time / 2000) % 1; // 2-second cycle
            const pulseX = padding + timelineLength * pulsePos;
            
            // Wave distortion along baseline
            ctx.beginPath();
            for (let x = padding; x <= endX; x += 2) {
                const waveOffset = Math.sin((x - padding) / 40 + time / 1000) * 2;
                const y = baselineY + waveOffset;
                
                if (x === padding) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            // Dynamic gradient intensity
            const gradient = ctx.createLinearGradient(padding, baselineY, endX, baselineY);
            const intensityShift = Math.sin(time / 2000) * 0.15 + 0.25;
            gradient.addColorStop(0, `rgba(112, 0, 255, ${intensityShift})`); /* Purple start */
            gradient.addColorStop(0.7, `rgba(208, 0, 0, ${intensityShift + 0.1})`); /* Red mid */
            gradient.addColorStop(1, `rgba(255, 26, 26, ${intensityShift + 0.2})`); /* Bright Red end */
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2.5;
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'rgba(208, 0, 0, 0.4)';
            ctx.stroke();
            
            // Traveling pulse glow
            if (progress >= 1) {
                ctx.shadowBlur = 30;
                ctx.shadowColor = '#d00000';
                ctx.fillStyle = '#ff1a1a';
                ctx.globalAlpha = 0.7;
                ctx.beginPath();
                ctx.arc(pulseX, baselineY, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
            
            // Brighten timeline near hovered spike
            if (hoveredSpike && progress >= 1) {
                const hoverGradient = ctx.createRadialGradient(hoveredSpike.x, baselineY, 0, hoveredSpike.x, baselineY, 100);
                hoverGradient.addColorStop(0, 'rgba(208, 0, 0, 0.3)');
                hoverGradient.addColorStop(1, 'rgba(208, 0, 0, 0)');
                ctx.fillStyle = hoverGradient;
                ctx.fillRect(hoveredSpike.x - 100, baselineY - 50, 200, 100);
            }
            
            ctx.shadowBlur = 0;
        }
        
        function drawSpike(spike, progress, time) {
            if (spike.count === 0) return;
            
            const spikeProgress = Math.min(progress * activityData.length - spike.dayIndex, 1);
            if (spikeProgress <= 0) return;
            
            // Organic growth with easeOutElastic for latest spike
            let eased;
            if (spike.isMostRecent && spikeProgress < 1) {
                // Elastic easing for dramatic growth
                const p = 0.3;
                eased = Math.pow(2, -10 * spikeProgress) * Math.sin((spikeProgress - p / 4) * (2 * Math.PI) / p) + 1;
                eased = Math.max(0, Math.min(1, eased));
            } else {
                eased = 1 - Math.pow(1 - spikeProgress, 3);
            }
            
            const currentHeight = spike.spikeHeight * eased;
            
            const { r, g, b } = spike.color;
            const gradient = ctx.createLinearGradient(spike.x, baselineY, spike.x, baselineY - currentHeight);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
            gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, 0.6)`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.3)`);
            
            // Enhanced glow for latest or hovered spike
            const isHovered = hoveredSpike && hoveredSpike.x === spike.x;
            const baseGlow = spike.isMostRecent ? 35 : 15;
            const hoverBoost = isHovered ? 20 : 0;
            ctx.shadowBlur = baseGlow + hoverBoost;
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(spike.x - 4, baselineY);
            ctx.lineTo(spike.x - 4, baselineY - currentHeight);
            ctx.lineTo(spike.x + 4, baselineY - currentHeight);
            ctx.lineTo(spike.x + 4, baselineY);
            ctx.closePath();
            ctx.fill();
            
            // Latest spike: strong core glow + outer bloom + halo
            if (spike.isMostRecent && spikeProgress >= 1) {
                const pulse = Math.sin(time / 600) * 0.25 + 0.75;
                
                // Outer bloom (large halo)
                ctx.shadowBlur = 60 * pulse;
                ctx.shadowColor = '#d00000';
                const haloGradient = ctx.createRadialGradient(spike.x, baselineY - currentHeight, 0, spike.x, baselineY - currentHeight, 40 * pulse);
                haloGradient.addColorStop(0, `rgba(208, 0, 0, ${0.8 * pulse})`);
                haloGradient.addColorStop(0.5, `rgba(208, 0, 0, ${0.3 * pulse})`);
                haloGradient.addColorStop(1, 'rgba(208, 0, 0, 0)');
                ctx.fillStyle = haloGradient;
                ctx.beginPath();
                ctx.arc(spike.x, baselineY - currentHeight, 40 * pulse, 0, Math.PI * 2);
                ctx.fill();
                
                // Core glow (intense center)
                ctx.shadowBlur = 40 * pulse;
                ctx.fillStyle = `rgba(255, 50, 50, ${0.95 * pulse})`;
                ctx.beginPath();
                ctx.arc(spike.x, baselineY - currentHeight, 6, 0, Math.PI * 2);
                ctx.fill();
                
                // Pulsing ring
                ctx.strokeStyle = `rgba(208, 0, 0, ${0.7 * pulse})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(spike.x, baselineY - currentHeight, 12 * pulse, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            ctx.shadowBlur = 0;
        }
        
        // Vignette brightening around "today"
        function drawVignette(time) {
            const latestSpike = spikes[spikes.length - 1];
            if (!latestSpike || latestSpike.count === 0) return;
            
            const pulse = Math.sin(time / 800) * 0.2 + 0.3;
            const vignetteGradient = ctx.createRadialGradient(latestSpike.x, baselineY, 0, latestSpike.x, baselineY, 150);
            vignetteGradient.addColorStop(0, `rgba(208, 0, 0, ${0.08 * pulse})`);
            vignetteGradient.addColorStop(0.6, `rgba(208, 0, 0, ${0.03 * pulse})`);
            vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = vignetteGradient;
            ctx.fillRect(0, 0, width, height);
        }
        
        // Animation loop
        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const time = timestamp;
            animationProgress = Math.min(elapsed / animationDuration, 1);
            
            // Clear canvas
            ctx.fillStyle = 'rgba(5, 5, 5, 0.3)';
            ctx.fillRect(0, 0, width, height);
            
            // Draw vignette (background layer)
            if (animationProgress >= 1) {
                drawVignette(time);
            }
            
            // Draw baseline with pulse
            drawBaseline(animationProgress, time);
            
            // Draw spikes
            spikes.forEach(spike => drawSpike(spike, animationProgress, time));
            
            // Particle generation and shockwave for latest spike
            if (animationProgress >= 1) {
                const latestSpike = spikes[spikes.length - 1];
                
                if (latestSpike && latestSpike.count > 0) {
                    // Sparkle particles drifting upward
                    if (Math.random() < 0.15) {
                        particles.push(new Particle(
                            latestSpike.x + (Math.random() - 0.5) * 8,
                            baselineY - latestSpike.spikeHeight,
                            true
                        ));
                    }
                }
                
                // Trigger shockwave on spike completion
                const latestSpikeProgress = Math.min(animationProgress * activityData.length - latestSpike.dayIndex, 1);
                if (latestSpikeProgress >= 0.99 && latestSpikeProgress <= 1.01 && shockwaves.length === 0) {
                    shockwaves.push(new Shockwave(latestSpike.x, baselineY));
                }
            }
            
            // Update and draw shockwaves
            shockwaves = shockwaves.filter(sw => sw.update());
            shockwaves.forEach(sw => sw.draw(ctx));
            
            // Update and draw particles
            particles = particles.filter(p => p.update());
            particles.forEach(p => p.draw(ctx));
            
            requestAnimationFrame(animate);
        }
        
        animate(0);
        
        // Tooltip interaction with hover state
        const tooltip = document.getElementById('timeline-tooltip');
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            let foundSpike = null;
            
            for (const spike of spikes) {
                if (spike.count === 0) continue;
                const dx = mouseX - spike.x;
                const dy = mouseY - (baselineY - spike.spikeHeight);
                if (Math.abs(dx) < 12 && dy > -15 && dy < spike.spikeHeight + 15) {
                    foundSpike = spike;
                    break;
                }
            }
            
            hoveredSpike = foundSpike;
            
            if (hoveredSpike) {
                const tooltipContent = `
                    <div class="tooltip-glass-header">
                        <span class="tooltip-date-glass">${hoveredSpike.monthDay} ${hoveredSpike.month}</span>
                        <span class="tooltip-commits-glass">${hoveredSpike.count} commit${hoveredSpike.count !== 1 ? 's' : ''}</span>
                    </div>
                    ${hoveredSpike.commits.map(c => {
                        const hash = (c.hash || 'xxxxxx').substring(0, 7);
                        const msg = (c.message || 'No message').substring(0, 60);
                        const changes = c.changes || { added: [], modified: [], deleted: [] };
                        const total = changes.added.length + changes.modified.length + changes.deleted.length;
                        return `
                            <div class="tooltip-commit-item">
                                <div class="tooltip-commit-hash">#${hash}</div>
                                <div class="tooltip-commit-msg">${msg}</div>
                                <div class="tooltip-commit-files">${total} files changed</div>
                            </div>
                        `;
                    }).join('')}
                `;
                
                tooltip.innerHTML = tooltipContent;
                tooltip.style.display = 'block';
                tooltip.style.opacity = '1';
                tooltip.style.left = Math.min(mouseX + 15, width - 300) + 'px';
                tooltip.style.top = (mouseY - 20) + 'px';
                canvas.style.cursor = 'pointer';
            } else {
                tooltip.style.opacity = '0';
                setTimeout(() => { tooltip.style.display = 'none'; }, 300);
                canvas.style.cursor = 'default';
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
            setTimeout(() => { tooltip.style.display = 'none'; }, 300);
        });
    }
    
    function renderCommitCard(commit, index) {
        const filesCount = commit.filesCount || 0;
        const linesAdded = commit.linesAdded || 0;
        const files = commit.files || [];
        const allCommits = state.commits.filter(c => c.projectId === state.currentProject.id);
        const commitNumber = allCommits.length - index;

        // Diff bar: show proportion of file types
        const typeColors = { js: '#f1e05a', jsx: '#f1e05a', ts: '#3178c6', tsx: '#3178c6',
            py: '#3572A5', java: '#b07219', css: '#563d7c', html: '#e34c26',
            md: '#083fa1', json: '#292929', cpp: '#f34b7d', c: '#555555' };
        const typeCounts = {};
        files.forEach(f => { typeCounts[f.type] = (typeCounts[f.type] || 0) + 1; });
        const typeEntries = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
        const diffBarHtml = typeEntries.length > 0 ? `
            <div class="diff-bar" title="File types">
                ${typeEntries.map(([type, count]) =>
                    `<div class="diff-bar-segment" style="width:${Math.ceil(count/filesCount*100)}%;background:${typeColors[type]||'#666'}" title="${count} .${type} file${count>1?'s':''}"></div>`
                ).join('')}
            </div>` : '';

        // File list (up to 8 shown)
        const shownFiles = files.slice(0, 8);
        const hiddenCount = Math.max(0, filesCount - shownFiles.length);
        const fileListHtml = shownFiles.length > 0 ? `
            <div class="commit-file-list">
                ${shownFiles.map(f => `
                    <div class="commit-file-item">
                        <span class="file-type-dot" style="background:${typeColors[f.type]||'#666'}"></span>
                        <span class="commit-file-name">${escapeHtml(f.path || f.name)}</span>
                        ${f.lines > 0 ? `<span class="file-lines">+${f.lines.toLocaleString()}</span>` : ''}
                    </div>`).join('')}
                ${hiddenCount > 0 ? `<div class="commit-file-more">+${hiddenCount} more file${hiddenCount>1?'s':''}</div>` : ''}
            </div>` : '';

        return `
            <div class="commit-card-gh" data-commit-id="${commit.id}">
                <div class="commit-gh-left">
                    <div class="commit-dot"></div>
                    <div class="commit-line"></div>
                </div>
                <div class="commit-gh-body">
                    <div class="commit-gh-header">
                        <span class="commit-gh-message">${escapeHtml(commit.message || 'No message')}</span>
                        <span class="commit-seq">#${commitNumber}</span>
                    </div>
                    <div class="commit-gh-meta">
                        <span class="commit-gh-author">
                            <span class="author-avatar">${(commit.author||'Y')[0].toUpperCase()}</span>
                            ${escapeHtml(commit.author || 'You')}
                        </span>
                        <span class="commit-gh-sep">committed</span>
                        <span class="commit-gh-time">${formatTimeAgo(commit.timestamp)}</span>
                        <span class="commit-gh-branch"><i class="fas fa-code-branch"></i> main</span>
                        <span class="commit-gh-hash" onclick="window.ProjectsWorkspace.copyHash('${commit.hash}')" title="Click to copy full hash">
                            <i class="fas fa-code"></i> ${commit.hash}
                            <i class="fas fa-copy" style="opacity:.5;font-size:.7rem"></i>
                        </span>
                    </div>
                    <div class="commit-gh-stats">
                        <span class="stat-files"><i class="fas fa-file-code"></i> ${filesCount} file${filesCount!==1?'s':''} changed</span>
                        ${linesAdded > 0 ? `<span class="stat-additions"><span class="plus-icon">+</span>${linesAdded.toLocaleString()} additions</span>` : ''}
                        ${diffBarHtml}
                    </div>
                    ${fileListHtml}
                    <div class="commit-gh-actions">
                        <button class="btn-gh-action" onclick="window.ProjectsWorkspace.rollbackToCommit('${commit.id}')">
                            <i class="fas fa-history"></i> Rollback
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function formatTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
        return `${Math.floor(seconds / 2592000)}mo ago`;
    }
    
    function copyCommitHash(hash) {
        navigator.clipboard.writeText(hash).then(() => {
            showNotification('Commit hash copied!', 'success');
        }).catch(() => {
            showNotification('Failed to copy', 'error');
        });
    }

    function rollbackToCommit(commitId) {
        if (!confirm('Are you sure? This will restore your project to this commit state and discard all subsequent changes.')) {
            return;
        }
        
        const commit = state.commits.find(c => c.id === commitId);
        if (!commit || !commit.snapshot) {
            showNotification('Commit snapshot not found', 'error');
            return;
        }
        
        // Restore files from snapshot
        state.currentProject.files = JSON.parse(JSON.stringify(commit.snapshot));
        state.currentProject.updatedAt = Date.now();
        
        // Remove commits after this one
        const commitIndex = state.commits.findIndex(c => c.id === commitId);
        state.commits = state.commits.slice(0, commitIndex + 1);
        
        state.currentProject.totalCommits = state.commits.filter(c => c.projectId === state.currentProject.id).length;
        
        saveState();
        showNotification('Project rolled back successfully', 'success');
        
        renderFileTree();
        renderCommitsTimeline();
    }

    // ==================== AI CODE REVIEW ====================
    async function runAIReview(commit) {
        const project = state.currentProject;
        if (!project) return;
        
        // Analyze project
        const analysis = await analyzeProject(project, commit);
        
        const review = {
            id: generateId(),
            projectId: project.id,
            commitId: commit.id,
            timestamp: Date.now(),
            overallScore: analysis.overallScore,
            finalRating: analysis.finalRating,
            sections: analysis.sections,
            layers: analysis.layers,
            verdict: analysis.verdict,
            swot: analysis.swot
        };
        
        state.aiReviews.push(review);
        project.latestAiScore = analysis.overallScore;
        saveState();
        
        showNotification('AI review complete! Check the AI Review tab.', 'success');
        
        // Auto-switch to AI review tab
        switchProjectTab('ai-review');
    }

    async function analyzeProject(project, commit) {
        // Simulate AI analysis delay
        await sleep(2000);
        
        const files = Object.values(project.files);
        const totalLines = files.reduce((sum, f) => sum + (f.content.split('\n').length), 0);
        
        // Analyze code health (existing)
        const codeHealth = analyzeCodeHealth(files);
        const architecture = analyzeArchitecture(files, project);
        const security = analyzeSecurity(files);
        const scalability = analyzeScalability(files, project);
        
        // Calculate overall score
        const overallScore = Math.round(
            (codeHealth.score * 0.3 +
             architecture.score * 0.25 +
             security.score * 0.25 +
             scalability.score * 0.2)
        );
        
        // 6-LAYER ANALYSIS (NEW)
        const layer1 = {...codeHealth}; // Code Structure & Readability
        const layer2 = {...architecture}; // Architecture & Design
        const layer3 = {...scalability}; // Performance & Scalability
        const layer4 = {...security}; // Security & Reliability
        const layer5 = analyzeMaintainability(files, project); // Maintainability
        const layer6 = analyzeIndustryBenchmark(files, totalLines); // Industry Benchmarking
        
        // Calculate /10 rating
        const rawScore = (
            layer1.score * 0.15 +
            layer2.score * 0.25 +
            layer3.score * 0.20 +
            layer4.score * 0.20 +
            layer5.score * 0.15 +
            layer6.score * 0.05
        );
        const finalRating = (rawScore / 10).toFixed(1);
        
        // Determine career readiness (existing)
        const verdict = determineVerdict(overallScore, codeHealth, architecture, security);
        
        // Update verdict with new rating format
        verdict.rating = finalRating;
        verdict.justification = `Rating: ${finalRating}/10 — ` + verdict.justification.replace(/^.*?Verdict:/, '').trim();
        
        // Generate SWOT
        const swot = generateProjectSWOT(layer1, layer2, layer3, layer4, layer5, layer6);
        
        return {
            overallScore,
            finalRating,
            sections: {
                codeHealth,
                architecture,
                security,
                scalability
            },
            layers: {
                layer1,
                layer2,
                layer3,
                layer4,
                layer5,
                layer6
            },
            verdict,
            swot
        };
    }

    function analyzeCodeHealth(files) {
        const issues = [];
        let score = 100;
        
        files.forEach(file => {
            const lines = file.content.split('\n');
            
            // Check for very long files
            if (lines.length > 500) {
                issues.push({
                    severity: 'warning',
                    title: `${file.path} is too large (${lines.length} lines)`,
                    description: 'Files over 500 lines become hard to maintain. Consider splitting into smaller modules.',
                    file: file.path
                });
                score -= 5;
            }
            
            // Check for console.log
            const consoleLogs = file.content.match(/console\.log/g);
            if (consoleLogs && consoleLogs.length > 3) {
                issues.push({
                    severity: 'warning',
                    title: `${file.path} has ${consoleLogs.length} console.log statements`,
                    description: 'Excessive console logging. Use proper logging framework or remove debug logs.',
                    file: file.path,
                    snippet: 'console.log(...)'
                });
                score -= 3;
            }
            
            // Check for TODO comments
            const todos = file.content.match(/\/\/\s*TODO/gi);
            if (todos && todos.length > 0) {
                issues.push({
                    severity: 'info',
                    title: `${file.path} has ${todos.length} TODO comments`,
                    description: 'Unfinished work detected. Complete these before marking project as done.',
                    file: file.path
                });
                score -= 2;
            }
            
            // Check for commented code
            const commentedCodeLines = lines.filter(line => 
                line.trim().startsWith('//') && line.length > 50
            ).length;
            
            if (commentedCodeLines > 10) {
                issues.push({
                    severity: 'warning',
                    title: `${file.path} has significant commented code`,
                    description: 'Remove dead code. Use version control to track history, not comments.',
                    file: file.path
                });
                score -= 5;
            }
        });
        
        return {
            score: Math.max(0, score),
            issues,
            summary: score >= 80 ? 'Code health looks good!' : 
                     score >= 60 ? 'Some improvements needed' :
                     'Significant code quality issues detected'
        };
    }

    function analyzeArchitecture(files, project) {
        const issues = [];
        let score = 100;
        
        // Check for proper structure
        const hasReadme = files.some(f => f.path.toLowerCase() === 'readme.md');
        if (!hasReadme) {
            issues.push({
                severity: 'critical',
                title: 'Missing README.md',
                description: 'Every project needs documentation. Add README with setup instructions, features, and tech stack.'
            });
            score -= 15;
        }
        
        // Check for config files
        const hasPackageJson = files.some(f => f.path === 'package.json');
        const hasRequirements = files.some(f => f.path === 'requirements.txt');
        
        if (!hasPackageJson && !hasRequirements && project.projectType !== 'other') {
            issues.push({
                severity: 'warning',
                title: 'No dependency management file',
                description: 'Add package.json or requirements.txt to define dependencies.'
            });
            score -= 10;
        }
        
        // Check folder structure
        const folders = [...new Set(files.map(f => f.path.split('/')[0]))];
        if (folders.length < 2) {
            issues.push({
                severity: 'warning',
                title: 'Flat project structure',
                description: 'Organize code into folders (src/, components/, utils/, etc.) for better maintainability.'
            });
            score -= 10;
        }
        
        // Check for test files
        const hasTests = files.some(f => 
            f.path.includes('test') || f.path.includes('spec') || f.path.includes('.test.')
        );
        
        if (!hasTests) {
            issues.push({
                severity: 'critical',
                title: 'No tests found',
                description: 'Production-ready projects need automated tests. Add unit/integration tests.'
            });
            score -= 20;
        }
        
        return {
            score: Math.max(0, score),
            issues,
            summary: score >= 80 ? 'Well-structured project' : 
                     score >= 60 ? 'Structure needs improvement' :
                     'Poor project organization'
        };
    }

    function analyzeSecurity(files) {
        const issues = [];
        let score = 100;
        
        files.forEach(file => {
            // Check for hardcoded credentials
            const hasApiKey = file.content.match(/api[_-]?key\s*=\s*['"][a-zA-Z0-9]{20,}['"]/i);
            const hasPassword = file.content.match(/password\s*=\s*['"][^'"]+['"]/i);
            const hasSecret = file.content.match(/secret\s*=\s*['"][a-zA-Z0-9]{20,}['"]/i);
            
            if (hasApiKey || hasPassword || hasSecret) {
                issues.push({
                    severity: 'critical',
                    title: `Hardcoded credentials in ${file.path}`,
                    description: 'NEVER commit API keys, passwords, or secrets. Use environment variables (.env file).',
                    file: file.path,
                    snippet: 'API_KEY = "sk-1234..."  ❌'
                });
                score -= 30;
            }
            
            // Check for SQL injection risk
            if (file.content.includes('SELECT') && file.content.match(/\+\s*['"].*['"]\s*\+/)) {
                issues.push({
                    severity: 'critical',
                    title: `Potential SQL injection in ${file.path}`,
                    description: 'String concatenation in SQL queries is dangerous. Use parameterized queries or ORMs.',
                    file: file.path
                });
                score -= 25;
            }
            
            // Check for eval usage
            if (file.content.includes('eval(')) {
                issues.push({
                    severity: 'critical',
                    title: `eval() usage in ${file.path}`,
                    description: 'eval() is a security risk. Never execute untrusted code.',
                    file: file.path
                });
                score -= 20;
            }
        });
        
        // Check for .env file
        const hasEnv = files.some(f => f.path === '.env' || f.path === '.env.example');
        if (!hasEnv && files.length > 5) {
            issues.push({
                severity: 'warning',
                title: 'No .env file found',
                description: 'Use .env for configuration. Add .env.example with dummy values to repository.'
            });
            score -= 10;
        }
        
        return {
            score: Math.max(0, score),
            issues,
            summary: score >= 80 ? 'No critical security issues' : 
                     score >= 60 ? 'Some security concerns' :
                     'CRITICAL security vulnerabilities detected'
        };
    }

    function analyzeScalability(files, project) {
        const issues = [];
        let score = 100;
        
        files.forEach(file => {
            // Check for N+1 query pattern
            const hasLoop = file.content.match(/for\s*\(/g) || file.content.match(/\.forEach\(/g);
            const hasQuery = file.content.match(/\.find|\.findOne|SELECT/g);
            
            if (hasLoop && hasQuery) {
                issues.push({
                    severity: 'warning',
                    title: `Potential N+1 query in ${file.path}`,
                    description: 'Database queries inside loops are inefficient. Use batch queries or joins.',
                    file: file.path
                });
                score -= 10;
            }
            
            // Check for synchronous file operations
            if (file.content.includes('readFileSync') || file.content.includes('writeFileSync')) {
                issues.push({
                    severity: 'warning',
                    title: `Blocking I/O in ${file.path}`,
                    description: 'Synchronous file operations block the event loop. Use async versions.',
                    file: file.path
                });
                score -= 10;
            }
        });
        
        // Check for caching
        const hasCaching = files.some(f => 
            f.content.includes('cache') || f.content.includes('redis') || f.content.includes('memcached')
        );
        
        if (!hasCaching && files.length > 10) {
            issues.push({
                severity: 'info',
                title: 'No caching detected',
                description: 'For scalability, consider adding caching (Redis, in-memory) for frequently accessed data.'
            });
            score -= 5;
        }
        
        return {
            score: Math.max(0, score),
            issues,
            summary: score >= 80 ? 'Good scalability patterns' : 
                     score >= 60 ? 'Some scalability concerns' :
                     'Scalability issues detected'
        };
    }

    function determineVerdict(overallScore, codeHealth, architecture, security) {
        let level = '';
        let justification = '';
        
        if (overallScore >= 85 && security.score >= 80 && architecture.score >= 80) {
            level = '🏆 Production-Ready';
            justification = `This project demonstrates professional-level engineering. Code is clean (${codeHealth.score}/100), architecture is solid (${architecture.score}/100), security is properly handled (${security.score}/100). **Verdict:** This would pass code review at most tech companies. Ready for deployment and portfolio showcase.`;
        } else if (overallScore >= 70 && security.score >= 70) {
            level = '💼 Junior Developer Level';
            justification = `Solid foundational work with ${overallScore}/100 overall score. Core functionality works, but there are improvement areas. **Verdict:** Shows promise and good fundamentals. With refinements in ${architecture.score < 80 ? 'architecture' : 'code organization'} and ${security.score < 80 ? 'security practices' : 'testing'}, this would be interview-ready. Currently suitable for junior roles.`;
        } else if (overallScore >= 55) {
            level = '📚 Internship-Ready';
            justification = `Good learning project (${overallScore}/100) that shows effort and understanding of basics. However, ${security.score < 60 ? 'critical security issues' : 'architectural gaps'} prevent production readiness. **Verdict:** Demonstrates learning progress but needs significant refinement for professional work. Good for internship applications with clear improvement plan.`;
        } else {
            level = '🎓 Hobby/Learning Project';
            justification = `Early-stage project (${overallScore}/100) with fundamental issues. ${security.score < 50 ? 'Security vulnerabilities present' : ''}. ${architecture.score < 50 ? 'Needs better structure' : ''}. **Verdict:** Keep building and learning, but this project is not yet suitable for professional portfolio. Focus on fixing critical issues before showcasing to employers.`;
        }
        
        return { level, justification };
    }

    // 🔹 Layer 5: Maintainability Analysis
    function analyzeMaintainability(files, project) {
        let score = 85;
        const issues = [];
        const positives = [];

        // Check for documentation
        const hasReadme = files.some(f => f.path.toLowerCase().includes('readme'));
        const hasComments = files.some(f => f.content.includes('//') || f.content.includes('/*'));
        
        if (hasReadme) {
            positives.push('✅ README documentation found');
        } else {
            score -= 15;
            issues.push('⚠️ No README documentation');
        }

        if (hasComments) {
            positives.push('✅ Code comments present');
        } else {
            score -= 10;
            issues.push('⚠️ Lacks inline documentation');
        }

        // Check for test files
        const hasTests = files.some(f => 
            f.path.includes('test') || f.path.includes('spec') || 
            f.content.includes('describe(') || f.content.includes('it(')
        );
        
        if (hasTests) {
            positives.push('✅ Test files detected');
        } else {
            score -= 20;
            issues.push('⚠️ No test coverage detected');
        }

        // Check for configuration files
        const hasConfig = files.some(f => 
            f.path.includes('config') || f.path.includes('.env') || 
            f.path.includes('settings')
        );
        
        if (hasConfig) {
            positives.push('✅ Configuration management');
        }

        return {
            score: Math.max(0, Math.min(100, score)),
            issues: issues,
            positives: positives,
            summary: `Maintainability: ${score}/100 - ${issues.length > 0 ? 'Needs better documentation and testing' : 'Well documented and maintainable'}`
        };
    }

    // 🔹 Layer 6: Industry Benchmark Analysis
    function analyzeIndustryBenchmark(files, totalLines) {
        let score = 75;
        const insights = [];

        // Lines of code assessment
        if (totalLines < 100) {
            score -= 20;
            insights.push('⚠️ Very small codebase (<100 lines) - expand functionality');
        } else if (totalLines < 500) {
            score -= 10;
            insights.push('⚠️ Small project (<500 lines) - consider adding features');
        } else if (totalLines < 2000) {
            insights.push('✅ Moderate-sized project (500-2000 lines)');
        } else {
            score += 10;
            insights.push('✅ Substantial codebase (2000+ lines)');
        }

        // Technology stack depth
        const techKeywords = ['api', 'database', 'auth', 'frontend', 'backend', 'middleware'];
        const techCount = techKeywords.filter(tech => 
            files.some(f => f.content.toLowerCase().includes(tech))
        ).length;

        if (techCount >= 4) {
            score += 15;
            insights.push('✅ Full-stack implementation detected');
        } else if (techCount >= 2) {
            insights.push('✅ Multi-layer architecture');
        } else {
            score -= 10;
            insights.push('⚠️ Limited technology stack - consider expanding');
        }

        // Modern practices
        const modernPractices = ['async', 'await', 'promise', 'class', 'const', 'let', 'arrow function'];
        const modernCount = modernPractices.filter(practice => 
            files.some(f => f.content.toLowerCase().includes(practice))
        ).length;

        if (modernCount >= 4) {
            insights.push('✅ Modern coding practices');
        } else {
            score -= 5;
            insights.push('⚠️ Consider adopting modern JavaScript features');
        }

        return {
            score: Math.max(0, Math.min(100, score)),
            insights: insights,
            benchmark: score >= 80 ? '🏆 Industry-standard' : score >= 60 ? '💼 Professional-grade' : '📚 Entry-level',
            summary: `Industry Benchmark: ${score}/100 - ${insights.length} key factors analyzed`
        };
    }

    // 🔹 Generate SWOT Analysis
    function generateProjectSWOT(layer1, layer2, layer3, layer4, layer5, layer6) {
        const strengths = [];
        const weaknesses = [];
        const opportunities = [];
        const threats = [];

        // Analyze strengths from high-scoring layers
        if (layer1.score >= 80) strengths.push('Clean, maintainable code');
        if (layer2.score >= 80) strengths.push('Solid architecture design');
        if (layer3.score >= 80) strengths.push('Secure implementation');
        if (layer4.score >= 80) strengths.push('Scalable foundation');
        if (layer5.score >= 80) strengths.push('Well-documented codebase');
        if (layer6.score >= 80) strengths.push('Industry-standard practices');

        // Identify weaknesses from low-scoring layers
        if (layer1.score < 60) weaknesses.push('Code quality needs improvement');
        if (layer2.score < 60) weaknesses.push('Architecture requires refactoring');
        if (layer3.score < 60) weaknesses.push('Security vulnerabilities present');
        if (layer4.score < 60) weaknesses.push('Scalability concerns');
        if (layer5.score < 60) weaknesses.push('Lacks documentation/testing');
        if (layer6.score < 60) weaknesses.push('Below industry standards');

        // Opportunities based on current state
        if (layer5.score < 80) opportunities.push('Add comprehensive testing');
        if (layer2.score < 80) opportunities.push('Implement design patterns');
        if (layer3.score < 80) opportunities.push('Enhance security measures');
        if (layer6.score < 80) opportunities.push('Adopt modern best practices');
        opportunities.push('Portfolio optimization');
        opportunities.push('Feature expansion');

        // Threats based on weaknesses
        if (layer3.score < 70) threats.push('Security audit failures');
        if (layer4.score < 70) threats.push('Performance bottlenecks at scale');
        if (layer5.score < 70) threats.push('Maintenance challenges');
        if (layer6.score < 60) threats.push('May not meet employer expectations');

        // Ensure we have at least 2 items in each category
        if (strengths.length === 0) strengths.push('Foundation established', 'Learning progress');
        if (weaknesses.length === 0) weaknesses.push('Minor improvements needed');
        if (opportunities.length < 2) opportunities.push('Continuous improvement', 'Feature expansion');
        if (threats.length === 0) threats.push('Competition in job market', 'Rapid technology changes');

        return {
            strengths: strengths.slice(0, 4),
            weaknesses: weaknesses.slice(0, 4),
            opportunities: opportunities.slice(0, 4),
            threats: threats.slice(0, 4)
        };
    }

    // ==================== AI REVIEW RENDERING ====================
    function renderAIReview() {
        if (!dom.aiReviewContainer || !state.currentProject) return;
        
        const reviews = state.aiReviews
            .filter(r => r.projectId === state.currentProject.id)
            .sort((a, b) => b.timestamp - a.timestamp);
        
        // EMPTY STATE - PRE-ANALYSIS
        if (reviews.length === 0) {
            const projectFileCount = state.currentProject.files ? Object.keys(state.currentProject.files).length : 0;
            const hasCommits = state.commits.filter(c => c.projectId === state.currentProject.id).length > 0;
            
            dom.aiReviewContainer.innerHTML = `
                <div class="ai-idle-state">
                    <!-- Central AI Core Status -->
                    <div class="ai-core-status">
                        <div class="ai-core-indicator">
                            <div class="ai-core-ring"></div>
                            <div class="ai-core-ring-2"></div>
                            <div class="ai-core-center">
                                <i class="fas fa-brain"></i>
                            </div>
                        </div>
                        <div class="ai-core-label">AI REVIEW ENGINE</div>
                        <div class="ai-core-state">STANDBY</div>
                        <div class="ai-core-sublabel">Intelligence pipeline armed and ready</div>
                    </div>

                    <!-- System Telemetry Grid -->
                    <div class="ai-telemetry-grid">
                        <div class="telemetry-panel">
                            <div class="telemetry-header">
                                <span class="telemetry-label">Files Indexed</span>
                                <i class="fas fa-folder-open"></i>
                            </div>
                            <div class="telemetry-value">${projectFileCount}</div>
                            <div class="telemetry-status">Ready for analysis</div>
                        </div>
                        
                        <div class="telemetry-panel">
                            <div class="telemetry-header">
                                <span class="telemetry-label">Architecture Scan</span>
                                <i class="fas fa-project-diagram"></i>
                            </div>
                            <div class="telemetry-value">${hasCommits ? 'READY' : 'IDLE'}</div>
                            <div class="telemetry-status">${hasCommits ? 'Topology mapped' : 'Awaiting commit trigger'}</div>
                        </div>
                        
                        <div class="telemetry-panel">
                            <div class="telemetry-header">
                                <span class="telemetry-label">Risk Engine</span>
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <div class="telemetry-value">ARMED</div>
                            <div class="telemetry-status">Threat detection primed</div>
                        </div>
                        
                        <div class="telemetry-panel">
                            <div class="telemetry-header">
                                <span class="telemetry-label">Review Pipeline</span>
                                <i class="fas fa-stream"></i>
                            </div>
                            <div class="telemetry-value">0</div>
                            <div class="telemetry-status">No queued operations</div>
                        </div>
                    </div>

                    <!-- Call to Action -->
                    <div class="ai-cta-panel">
                        <div class="ai-cta-icon">
                            <i class="fas fa-${hasCommits ? 'shield-alt' : 'code-branch'}"></i>
                        </div>
                        <div class="ai-cta-content">
                            <div class="ai-cta-title">${hasCommits ? 'SYSTEM ARMED' : 'COMMIT REQUIRED'}</div>
                            <div class="ai-cta-desc">${hasCommits ? 'Intelligence pipeline ready. Enable "Trigger AI review" on next commit to initiate analysis.' : 'Enable "Trigger AI review" during commit to initiate deep intelligence analysis'}</div>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        const latestReview = reviews[0];
        const sections = latestReview.sections;
        
        // Check if we have 6-layer data
        const has6Layers = latestReview.layers && latestReview.finalRating && latestReview.swot;
        
        if (has6Layers) {
            // RENDER ULTRA-PREMIUM 2075 AI UI
            const { layers, finalRating, verdict, swot } = latestReview;
            
            // Helper for Layer Slab
            const renderUltraLayer = (num, title, shortDesc, layerData) => {
                const score = layerData.score;
                const scoreColor = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#D00000';
                
                return `
                <div class="ultra-layer-slab">
                    <div class="slab-left">
                        <div class="slab-num">${num}</div>
                    </div>
                    <div class="slab-center">
                        <div class="slab-title">${title}</div>
                        <div class="slab-desc">${shortDesc}</div>
                    </div>
                    <div class="slab-right">
                        <div class="micro-meter-container">
                            <svg class="micro-meter" viewBox="0 0 36 36">
                                <path class="meter-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path class="meter-val" stroke="${scoreColor}" stroke-dasharray="${score}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div class="meter-text">${score}</div>
                        </div>
                    </div>
                    
                    <!-- Hover Reveal -->
                    <div class="slab-reveal">
                        <div class="reveal-content">
                            <div class="reveal-header">DIAGNOSTIC INSIGHTS</div>
                            <div class="reveal-list">
                                ${layerData.issues ? layerData.issues.slice(0, 2).map(i => 
                                    `<div class="reveal-item"><i class="fas fa-caret-right"></i> ${escapeHtml(i.title || i)}</div>`
                                ).join('') : '<div class="reveal-item">System nominal. No alerts.</div>'}
                            </div>
                        </div>
                    </div>
                </div>
                `;
            };

            dom.aiReviewContainer.innerHTML = `
                <div class="ai-ultra-dashboard">
                    <div class="ultra-vignette"></div>
                    <div class="ultra-scanline"></div>
                    
                    <!-- SECTION 1: HEADER -->
                    <header class="ultra-header">
                        <div class="header-titles">
                            <h1 class="eng-title">AI REVIEW ENGINE</h1>
                            <div class="eng-sub">SkillForge Intelligence Diagnostic v2075.4</div>
                        </div>
                        
                        <div class="rating-orb-container">
                            <div class="rating-orb">
                                <svg class="orb-svg" viewBox="0 0 120 120">
                                    <circle class="orb-bg" cx="60" cy="60" r="54"/>
                                    <circle class="orb-progress" cx="60" cy="60" r="54" 
                                        stroke="${finalRating >= 8 ? '#10B981' : '#D00000'}"
                                        style="stroke-dasharray: ${2 * Math.PI * 54}; stroke-dashoffset: ${2 * Math.PI * 54 * (1 - finalRating/10)}" />
                                </svg>
                                <div class="orb-value">
                                    <span class="val-num">${finalRating}</span>
                                    <span class="val-max">/10</span>
                                </div>
                                <div class="orb-glow"></div>
                            </div>
                            <div class="orb-label">Advanced Developer Signal</div>
                        </div>
                    </header>

                    <!-- SECTION 2: 6-LAYER SYSTEM -->
                    <section class="ultra-layers-section">
                        ${renderUltraLayer('01', 'CODE STRUCTURE', 'Pattern & Syntax Compliance', layers.layer1)}
                        ${renderUltraLayer('02', 'SYSTEM ARCHITECTURE', 'Modularity & Flow Analysis', layers.layer2)}
                        ${renderUltraLayer('03', 'SCALABILITY MATRIX', 'Resource Efficiency Projection', layers.layer3)}
                        ${renderUltraLayer('04', 'SECURITY PROTOCOLS', 'Threat Surface Inspection', layers.layer4)}
                        ${renderUltraLayer('05', 'MAINTAINABILITY INDEX', 'Technical Debt Assessment', layers.layer5)}
                        ${renderUltraLayer('06', 'INDUSTRY BENCHMARK', 'Global Standard Comparison', layers.layer6)}
                    </section>
                    
                    <!-- SECTION 3: SIGNALS -->
                    <section class="ultra-signals">
                        <div class="signal-row">
                            <div class="signal-category">POSITIVE SIGNALS</div>
                            <div class="signal-chips">
                                ${swot.strengths.slice(0,3).map(s => `<div class="signal-chip green">${s}</div>`).join('')}
                            </div>
                        </div>
                        <div class="signal-row">
                            <div class="signal-category">RISK FLAGS</div>
                            <div class="signal-chips">
                                ${swot.weaknesses.slice(0,3).map(w => `<div class="signal-chip red">${w}</div>`).join('')}
                            </div>
                        </div>
                    </section>

                    <!-- SECTION 4: SWOT CORE (MANDATORY) -->
                    <section class="ultra-swot-core">
                        <div class="swot-orbit">
                            <div class="swot-quadrant q-nw" id="swot-s">
                                <span class="quad-letter">S</span>
                                <div class="quad-panel panel-s">
                                    <div class="panel-head">STRENGTHS</div>
                                    <div class="panel-body">
                                        ${swot.strengths.map(s => `<div>${s}</div>`).join('')}
                                    </div>
                                </div>
                            </div>
                            <div class="swot-quadrant q-ne" id="swot-w">
                                <span class="quad-letter">W</span>
                                <div class="quad-panel panel-w">
                                    <div class="panel-head">WEAKNESSES</div>
                                    <div class="panel-body">
                                        ${swot.weaknesses.map(w => `<div>${w}</div>`).join('')}
                                    </div>
                                </div>
                            </div>
                            <div class="swot-quadrant q-sw" id="swot-o">
                                <span class="quad-letter">O</span>
                                <div class="quad-panel panel-o">
                                    <div class="panel-head">OPPORTUNITIES</div>
                                    <div class="panel-body">
                                        ${swot.opportunities.map(o => `<div>${o}</div>`).join('')}
                                    </div>
                                </div>
                            </div>
                            <div class="swot-quadrant q-se" id="swot-t">
                                <span class="quad-letter">T</span>
                                <div class="quad-panel panel-t">
                                    <div class="panel-head">THREATS</div>
                                    <div class="panel-body">
                                        ${swot.threats.map(t => `<div>${t}</div>`).join('')}
                                    </div>
                                </div>
                            </div>
                            <!-- Core Aesthetic Details -->
                            <div class="swot-crosshair"></div>
                            <div class="swot-pulse"></div>
                        </div>
                    </section>

                    <!-- SECTION 5: FINAL VERDICT -->
                    <footer class="ultra-verdict">
                        <div class="verdict-main">OVERALL SIGNAL: ${verdict.level.split(' ').slice(1).join(' ').toUpperCase()}</div>
                        <div class="verdict-sub">${verdict.justification.split('.')[0]}. ${verdict.justification.split('.')[1] || ''}</div>
                    </footer>
                </div>
            `;
            return; // Exit early with ULTRA UI
        }
        
        // FALLBACK: Old 4-layer UI for older reviews
        // MOCK / DERIVED DATA GENERATION (To be replaced by real AI API response)
        const confidenceScore = (latestReview.overallScore * 0.9 + 5).toFixed(1); // Mock confidence logic
        
        // Get files from current project
        const projectFiles = state.currentProject.files || [];
        const projectDomain = determineDomain(projectFiles); // Helper inference
        const techStack = detectTechStack(projectFiles); // Helper inference
        const complexity = calculateComplexity(projectFiles); // Helper inference
        
        // Extract top issues for recommendations
        const allIssues = [
            ...sections.codeHealth.issues, 
            ...sections.architecture.issues,
            ...sections.security.issues,
            ...sections.scalability.issues
        ];
        
        const criticalIssues = allIssues.filter(i => i.severity === 'critical');
        const warningIssues = allIssues.filter(i => i.severity === 'warning');
        const recommendations = [...criticalIssues, ...warningIssues].slice(0, 3); // Top 3

        // RENDER CONSOLE INTERFACE
        dom.aiReviewContainer.innerHTML = `
            <div class="ai-console-container">
                <!-- 1. SYSTEM STATUS HEADER -->
                <div class="ai-system-header">
                    <div class="ai-status-indicator">
                        <div class="ai-pulse-dot"></div>
                        <span>AI Review Engine: Active</span>
                        <span class="ai-timestamp">// ${formatDate(latestReview.timestamp).toUpperCase()}</span>
                    </div>
                    <div class="ai-confidence-group">
                        <div class="ai-confidence-score">${confidenceScore}%</div>
                        <span class="ai-confidence-label">Confidence Rating</span>
                    </div>
                </div>

                <!-- 2. PROJECT INTELLIGENCE SUMMARY -->
                <div class="ai-intelligence-grid">
                    <div class="ai-info-card">
                        <span class="ai-card-label">Detected Domain</span>
                        <div class="ai-card-value">${projectDomain}</div>
                    </div>
                    <div class="ai-info-card">
                        <span class="ai-card-label">Tech Stack</span>
                        <div class="ai-card-value">${techStack}</div>
                    </div>
                    <div class="ai-info-card">
                        <span class="ai-card-label">Complexity Analysis</span>
                        <div class="ai-card-value">${complexity}</div>
                    </div>
                </div>

                <!-- 3. CODE & ARCHITECTURE REVIEW -->
                <div class="ai-review-grid">
                    <div class="ai-review-column">
                        <div class="ai-section-title">
                            <span>Key Strengths Detected</span>
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        ${renderStrengthsList(sections)}
                    </div>
                    <div class="ai-review-column">
                        <div class="ai-section-title">
                            <span>Critical Weaknesses</span>
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        ${renderWeaknessesList(allIssues.filter(i => i.severity === 'critical').slice(0, 3))}
                    </div>
                </div>

                <!-- 4. PRODUCTION READINESS SCORECARD -->
                <div class="ai-readiness-scorecard">
                    <div class="scorecard-row">
                        <span class="scorecard-label">Maintainability</span>
                        <div class="scorecard-bar-container">
                            <div class="scorecard-bar" style="width: ${sections.codeHealth.score}%"></div>
                        </div>
                        <div class="scorecard-value">${sections.codeHealth.score}</div>
                    </div>
                    <div class="scorecard-row">
                        <span class="scorecard-label">System Architecture</span>
                        <div class="scorecard-bar-container">
                            <div class="scorecard-bar" style="width: ${sections.architecture.score}%"></div>
                        </div>
                        <div class="scorecard-value">${sections.architecture.score}</div>
                    </div>
                    <div class="scorecard-row">
                        <span class="scorecard-label">Security Posture</span>
                        <div class="scorecard-bar-container">
                            <div class="scorecard-bar" style="width: ${sections.security.score}%"></div>
                        </div>
                        <div class="scorecard-value">${sections.security.score}</div>
                    </div>
                    <div class="scorecard-row">
                        <span class="scorecard-label">Scalability Limit</span>
                        <div class="scorecard-bar-container">
                            <div class="scorecard-bar" style="width: ${sections.scalability.score}%"></div>
                        </div>
                        <div class="scorecard-value">${sections.scalability.score}</div>
                    </div>
                </div>

                <!-- 5. AI RECOMMENDATIONS -->
                <div class="ai-recs-container">
                    <div class="ai-section-title">
                        <span>Strategic Recommendations</span>
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    ${recommendations.length > 0 ? recommendations.map(rec => `
                        <div class="rec-item ${rec.severity === 'warning' ? 'low-priority' : ''}">
                            <div class="rec-priority">${rec.severity === 'critical' ? 'IMMEDIATE' : 'DEFERRABLE'}</div>
                            <div class="rec-content">
                                <strong>${escapeHtml(rec.title)}</strong>
                                <p>${escapeHtml(rec.description)}</p>
                            </div>
                        </div>
                    `).join('') : '<div class="rec-item"><div class="rec-content"><p>No critical actions required. Maintain current trajectory.</p></div></div>'}
                </div>

                <!-- 6. AI CONFIDENCE STATEMENT -->
                <div class="ai-confidence-box">
                    <div class="ai-confidence-text">
                        ${latestReview.verdict.justification}
                    </div>
                </div>
            </div>
        `;
    }

    // Helper Functions for Mock AI Data
    function determineDomain(files) {
        if (files.some(f => f.path.includes('server') || f.path.includes('api'))) return 'Backend / API Systems';
        if (files.some(f => f.path.includes('html') || f.path.includes('css'))) return 'Frontend / UI';
        return 'General Software Engineering';
    }

    function detectTechStack(files) {
        const stack = [];
        if (files.some(f => f.path.endsWith('.js'))) stack.push('JavaScript');
        if (files.some(f => f.path.endsWith('.ts'))) stack.push('TypeScript');
        if (files.some(f => f.path.endsWith('.py'))) stack.push('Python');
        if (files.some(f => f.path.endsWith('.html'))) stack.push('HTML5');
        return stack.join(' / ') || 'Unknown Stack';
    }

    function calculateComplexity(files) {
        const totalLines = files.reduce((acc, f) => acc + (f.content.match(/\n/g) || []).length, 0);
        if (totalLines > 2000) return 'Enterprise High';
        if (totalLines > 500) return 'Standard Module';
        return 'Low Latency / Script';
    }

    function renderStrengthsList(sections) {
        // Mock generation of strengths based on high scores
        const strengths = [];
        if (sections.codeHealth.score > 70) strengths.push({ type: 'Code', text: 'Clean formatting and variable naming conventions observed.' });
        if (sections.security.score > 70) strengths.push({ type: 'Security', text: 'Input sanitization logic appears active and robust.' });
        if (sections.architecture.score > 70) strengths.push({ type: 'Arch', text: 'Modular component separation detected.' });
        
        if (strengths.length === 0) strengths.push({ type: 'General', text: 'Basic functional requirements met.' });

        return strengths.map(s => `
            <div class="ai-finding-item strength">
                <div class="ai-finding-header">
                    <span class="ai-finding-type">${s.type}</span>
                    <i class="fas fa-check" style="color: white; font-size: 0.7rem;"></i>
                </div>
                <div class="ai-finding-text">${s.text}</div>
            </div>
        `).join('');
    }

    function renderWeaknessesList(issues) {
        if (!issues || issues.length === 0) {
            return `
                <div class="ai-finding-item">
                     <span class="text-muted" style="font-size: 0.8rem;">No critical weaknesses exploited.</span>
                </div>
            `;
        }
        
        return issues.map(issue => `
            <div class="ai-finding-item weakness">
                <div class="ai-finding-header">
                    <span class="ai-finding-type">Risk Detected</span>
                    <i class="fas fa-times" style="color: var(--accent-red); font-size: 0.7rem;"></i>
                </div>
                <div class="ai-finding-text">${escapeHtml(issue.title)}</div>
            </div>
        `).join('');
    }

    // REMOVED LEGACY RENDER FUNCTION - renderReviewSection is no longer used directly in this new layout logic.
    /* function renderReviewSection(title, section, icon) { ... } */

    // ==================== EVOLUTION TRACKING ====================
    function renderEvolution() {
        if (!dom.evolutionDashboard || !state.currentProject) return;
        
        const reviews = state.aiReviews
            .filter(r => r.projectId === state.currentProject.id)
            .sort((a, b) => a.timestamp - b.timestamp);
        
        if (reviews.length < 2) {
            dom.evolutionDashboard.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line fa-3x" style="color: var(--text-muted);"></i>
                    <p style="color: white; margin-top: 1rem;">Insufficient Data for Evolution Tracking</p>
                    <p class="text-muted">Minimum of 2 AI analysis cycles required to generate improvements vector.</p>
                </div>
            `;
            return;
        }
        
        const firstReview = reviews[0];
        const latestReview = reviews[reviews.length - 1];
        
        const overallChange = latestReview.overallScore - firstReview.overallScore;
        const codeHealthChange = latestReview.sections.codeHealth.score - firstReview.sections.codeHealth.score;
        const archChange = latestReview.sections.architecture.score - firstReview.sections.architecture.score;
        const securityChange = latestReview.sections.security.score - firstReview.sections.security.score;
        
        dom.evolutionDashboard.innerHTML = `
            <div class="evolution-metrics">
                ${renderMetricCard('Overall Quality', latestReview.overallScore, overallChange)}
                ${renderMetricCard('Code Health', latestReview.sections.codeHealth.score, codeHealthChange)}
                ${renderMetricCard('Architecture', latestReview.sections.architecture.score, archChange)}
                ${renderMetricCard('Security', latestReview.sections.security.score, securityChange)}
            </div>
            
            <div class="evolution-timeline">
                <h3 style="margin-bottom: 2rem; text-transform: uppercase; letter-spacing: 0.1em; font-size: 1rem; color: var(--text-muted);">Review History</h3>
                ${reviews.map((review, index) => {
                    const score = review.overallScore;
                    const scoreColor = score >= 80 ? 'var(--accent-red-bright)' : score >= 60 ? '#ffaa00' : 'var(--accent-red)';
                    
                    return `
                    <div class="evolution-item" style="padding: 1.5rem; border-left: 2px solid ${scoreColor}; margin-bottom: 1.5rem; background: var(--matte-surface); border: 1px solid var(--border-subtle); border-left-width: 2px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: white; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.9rem;">Analysis Cycle #${index + 1}</strong>
                                <span class="text-muted" style="margin-left: 1rem; font-family: 'Roboto Mono'; font-size: 0.8rem;">${formatDate(review.timestamp)}</span>
                            </div>
                            <div style="font-size: 2rem; font-weight: 700; color: ${scoreColor}; letter-spacing: -0.05em;">${review.overallScore}</div>
                        </div>
                        <p class="text-muted" style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">${review.verdict.level}</p>
                    </div>
                `}).join('')}
            </div>
        `;
    }

    function renderMetricCard(label, value, change) {
        const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
        const trendIcon = change > 0 ? 'arrow-up' : change < 0 ? 'arrow-down' : 'minus';
        
        return `
            <div class="evolution-metric-card">
                <div class="metric-value">${value}</div>
                <div class="metric-label">${label}</div>
                <div class="metric-trend ${trend}">
                    <i class="fas fa-${trendIcon}"></i>
                    ${change > 0 ? '+' : ''}${change} from first review
                </div>
            </div>
        `;
    }

    // ==================== PROJECT COMPLETION ====================
    function markProjectComplete() {
        if (!state.currentProject) return;
        
        if (state.currentProject.status === 'completed') {
            showNotification('Project is already marked as complete', 'info');
            return;
        }
        
        const latestReview = state.aiReviews
            .filter(r => r.projectId === state.currentProject.id)
            .pop();
        
        if (!latestReview) {
            if (!confirm('No AI review found. Mark complete anyway?')) return;
        }
        
        state.currentProject.status = 'completed';
        state.currentProject.completedAt = Date.now();
        saveState();
        
        showNotification('Project marked as complete! 🎉', 'success');
        
        // Generate final report if AI review exists
        if (latestReview) {
            generateFinalReport(latestReview);
        }
        
        renderProjectDetail();
    }

    function generateFinalReport(review) {
        console.log('[Projects] Final Evaluation Report:', review.verdict);
        showNotification(`Final Assessment: ${review.verdict.level}`, 'info', 5000);
    }

    // ==================== UTILITIES ====================
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString();
    }

    function formatStatus(status) {
        const statusMap = {
            'planning': 'Planning',
            'in-progress': 'In Progress',
            'completed': 'Completed',
            'not-started': 'Not Started'
        };
        return statusMap[status] || status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function escapeHtml(text) {
        if (typeof text !== 'string') text = String(text);
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function showNotification(message, type = 'info', duration = 3000) {
        // Reuse existing notification system if available
        if (typeof showFeedback === 'function') {
            showFeedback(message, type);
            return;
        }
        
        // Fallback toast
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // ==================== PUBLIC API ====================
    window.ProjectsWorkspace = {
        init,
        renderProjectsGrid,
        openProject,
        openCreateModal: openCreateProjectModal,
        closeCreateModal: closeCreateProjectModal,
        createProject,
        closeCommitModal,
        commitChanges: confirmCommit,
        rollbackToCommit,
        copyHash: copyCommitHash
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('[ProjectsWorkspace] Module loaded');
})();
