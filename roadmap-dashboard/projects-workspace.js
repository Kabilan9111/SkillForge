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
    const API_BASE_URL = 'http://localhost:3000/api';

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

    // Backend is the single source of truth — no localStorage
    function loadState() {
        state.projects = [];
        state.commits = [];
        state.aiReviews = [];
        state.backendFiles = [];
        state.backendCommits = [];
    }

    function saveState() { /* no-op: all persistence is backend-side */ }

    // ==================== AUTH HELPERS ====================
    function getAuthHeaders() {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token') || '';
        return { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
    }

    function getAuthHeadersNoContentType() {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token') || '';
        return { 'Authorization': 'Bearer ' + token };
    }

    // ==================== BACKEND DATA LOADERS ====================
    async function loadProjects() {
        try {
            const r = await fetch(`${API_BASE_URL}/workspace/projects`, { headers: getAuthHeaders() });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const d = await r.json();
            state.projects = Array.isArray(d.projects) ? d.projects : (Array.isArray(d) ? d : []);
        } catch (e) {
            console.error('[Projects] loadProjects error:', e);
            state.projects = [];
        }
    }

    async function loadProjectFiles() {
        if (!state.currentProject) return;
        try {
            const r = await fetch(`${API_BASE_URL}/workspace/projects/${state.currentProject.id}/files`, { headers: getAuthHeaders() });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const d = await r.json();
            state.backendFiles = Array.isArray(d.files) ? d.files : [];
            // Build object map for file viewer
            state.currentProject.files = {};
            state.backendFiles.forEach(f => {
                state.currentProject.files[f.file_path] = {
                    content: f.file_content || '',
                    size: f.file_size || (f.file_content ? f.file_content.length : 0),
                    lastModified: f.created_at || Date.now()
                };
            });
        } catch (e) {
            console.error('[Projects] loadProjectFiles error:', e);
            state.backendFiles = [];
        }
    }

    async function loadProjectCommits() {
        if (!state.currentProject) return;
        try {
            const r = await fetch(`${API_BASE_URL}/workspace/projects/${state.currentProject.id}/commits`, { headers: getAuthHeaders() });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const d = await r.json();
            const raw = Array.isArray(d.commits) ? d.commits : [];
            state.backendCommits = raw.map(c => ({
                id:           c.id,
                hash:         c.commit_hash || c.hash || '',
                message:      c.message || '',
                author:       c.author_name || c.author || 'You',
                timestamp:    c.created_at ? new Date(c.created_at).getTime() : Date.now(),
                linesAdded:   c.additions   ?? c.linesAdded   ?? 0,
                linesDeleted: c.deletions   ?? c.linesDeleted ?? 0,
                filesCount:   c.files_count ?? c.filesCount   ?? 0,
                files:        Array.isArray(c.files) ? c.files : []
            }));
        } catch (e) {
            console.error('[Projects] loadProjectCommits error:', e);
            state.backendCommits = [];
        }
    }

    async function loadProjectStats() {
        if (!state.currentProject) return;
        try {
            const r = await fetch(`${API_BASE_URL}/workspace/projects/${state.currentProject.id}/stats`, { headers: getAuthHeaders() });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const d = await r.json();
            const s = d.stats || d;
            state.currentProject._stats = {
                totalCommits:   s.totalCommits   || s.total_commits   || 0,
                totalFiles:     s.totalFiles     || s.total_files     || 0,
                totalAdditions: s.totalAdditions || s.total_additions || 0,
                totalDeletions: s.totalDeletions || s.total_deletions || 0,
                lastCommitAt:   s.lastCommitAt   || s.last_commit_at  || null
            };
        } catch (e) {
            console.error('[Projects] loadProjectStats error:', e);
            if (state.currentProject) state.currentProject._stats = {};
        }
    }

    // ==================== DOM REFERENCES ====================
    const dom = {
        // Grid view
        createProjectBtn: null,
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
        loadState();
        setupEventListeners();

        // Initial render if on projects page
        if (document.getElementById('projects-page')?.classList.contains('active')) {
            await showProjectsGrid();
        }

        console.log('[Projects] Ready');
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

        try {
            const r = await fetch(`${API_BASE_URL}/workspace/projects`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ name, description, techStack, projectType })
            });
            const d = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(d.error || d.message || `HTTP ${r.status}`);

            closeCreateProjectModal();
            showNotification(`Project "${name}" created successfully!`, 'success');
            await showProjectsGrid();
        } catch (err) {
            console.error('[Projects] createProject error:', err);
            showNotification(`Failed to create project: ${err.message}`, 'error');
        }
    }

    // ==================== PROJECTS GRID ====================
    function renderProjectsGrid() {
        console.log('[Projects] renderProjectsGrid() called');
        
        // Ensure DOM elements are cached (in case we navigated to this page)
        if (!dom.projectsGrid) {
            dom.projectsGrid = document.getElementById('projects-grid-view');
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
        dom.projectsGrid.classList.remove('hidden');
        if (dom.projectDetailView) dom.projectDetailView.classList.add('hidden');
        
        if (state.projects.length === 0) {
            console.log('[Projects] No projects found, rendering empty state');
            dom.projectsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-folder-open fa-3x"></i>
                    <h3>No Projects Yet</h3>
                    <p>Create your first project to start building your portfolio</p>
                    <button class="btn btn-primary" onclick="window.ProjectsWorkspace.openCreateModal()">
                        <i class="fas fa-plus"></i> Create Project
                    </button>
                </div>
            `;
            return;
        }
        
        console.log('[Projects] Rendering', state.projects.length, 'projects');
        
        dom.projectsGrid.innerHTML = state.projects.map(project => {
            const techStack = Array.isArray(project.tech_stack) ? project.tech_stack : [];
            const totalCommits = project.total_commits || 0;
            const totalFiles   = project.total_files   || 0;
            const lastActivity = project.last_commit_at
                ? formatTimeAgo(new Date(project.last_commit_at).getTime())
                : formatTimeAgo(new Date(project.created_at || project.createdAt).getTime());

            return `
                <div class="project-card" onclick="window.ProjectsWorkspace.openProject('${project.id}')">
                    <div class="project-card-header">
                        <div>
                            <h3 class="project-card-title">${escapeHtml(project.name)}</h3>
                            <p class="project-card-desc">${escapeHtml(project.description || '')}</p>
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
                            <span><i class="fas fa-code-branch"></i> ${totalCommits} commits</span>
                            <span><i class="fas fa-file-code"></i> ${totalFiles} files</span>
                            <span><i class="fas fa-clock"></i> ${lastActivity}</span>
                        </div>
                        <span class="project-status-badge ${project.status || 'planning'}">${formatStatus(project.status || 'planning')}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function showProjectsGrid() {
        await loadProjects();
        renderProjectsGrid();
    }

    // ==================== PROJECT DETAIL VIEW ====================
    async function openProject(projectId) {
        if (!dom.projectsGrid || !dom.projectDetailView) return;

        try {
            const r = await fetch(`${API_BASE_URL}/workspace/projects/${projectId}`, { headers: getAuthHeaders() });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const d = await r.json();
            state.currentProject = d.project || d;
        } catch (e) {
            console.error('[Projects] openProject fetch error:', e);
            showNotification('Failed to load project: ' + e.message, 'error');
            return;
        }

        state.currentView = 'detail';
        state.backendFiles = [];
        state.backendCommits = [];

        dom.projectsGrid.classList.add('hidden');
        dom.projectDetailView.classList.remove('hidden');

        renderProjectDetail();

        await Promise.all([loadProjectFiles(), loadProjectCommits()]);
        await loadProjectStats();

        renderProjectDetail();
        switchProjectTab('files');
    }

    function renderProjectDetail() {
        if (!state.currentProject) return;

        const project = state.currentProject;
        const _s = project._stats || {};

        if (dom.detailProjectTitle) dom.detailProjectTitle.textContent = project.name;
        if (dom.detailProjectStatus) {
            const status = project.status || 'planning';
            dom.detailProjectStatus.textContent = formatStatus(status);
            dom.detailProjectStatus.className = `project-status-badge ${status}`;
        }
        if (dom.detailProjectCreated) {
            const ts = project.created_at || project.createdAt;
            dom.detailProjectCreated.textContent = ts ? `Created ${formatTimeAgo(new Date(ts).getTime())}` : 'Unknown creation date';
        }

        const totalCommits = _s.totalCommits ?? (state.backendCommits || []).length;
        if (dom.commitsCount) dom.commitsCount.textContent = totalCommits;
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

        const files = (state.backendFiles || []).map(f => f.file_path || f.path).filter(Boolean).sort();

        if (files.length === 0) {
            dom.fileTree.innerHTML = '<p class="text-muted" style="padding:1rem">No files uploaded yet. Use \"Upload Files\" to add files then commit.</p>';
            return;
        }

        const tree = buildFileTree(files);
        dom.fileTree.innerHTML = renderTreeNode(tree);

        dom.fileTree.querySelectorAll('.file-tree-item').forEach(item => {
            item.addEventListener('click', () => {
                const filePath = item.dataset.path;
                if (filePath) selectFile(filePath);
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

        const file = state.currentProject.files && state.currentProject.files[filePath];
        if (!file) {
            dom.fileViewer.innerHTML = `<div class="file-viewer-empty" style="padding:2rem;color:var(--text-muted)"><i class="fas fa-file-slash"></i> File content not available.</div>`;
            return;
        }

        const content = file.content || '';
        const isBinary = content.startsWith('[binary');
        const ext = filePath.split('.').pop().toLowerCase();
        const language = getLanguageFromExt(ext);

        dom.fileViewer.innerHTML = `
            <div class="file-viewer-header">
                <div class="file-viewer-title">
                    <i class="fas fa-${getFileIcon(filePath)}"></i>
                    <span>${escapeHtml(filePath)}</span>
                </div>
                <span class="text-muted">${formatFileSize(file.size || content.length)}</span>
            </div>
            <div class="file-content">
                ${isBinary
                    ? `<div style="padding:2rem;color:var(--text-muted);text-align:center"><i class="fas fa-file-archive fa-2x"></i><p style="margin-top:1rem">Binary file — preview not available</p></div>`
                    : `<pre><code class="language-${language}">${escapeHtml(content)}</code></pre>`}
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
    function uploadFiles() {
        if (!state.currentProject) {
            showNotification('No project selected', 'error');
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.webkitdirectory = true;

        input.onchange = async (e) => {
            const rawFiles = Array.from(e.target.files);
            if (rawFiles.length === 0) return;

            const excludePatterns = [
                /node_modules/i, /\.git\//i, /dist\//i, /build\//i,
                /\.next\//i, /\.vscode\//i, /__pycache__/i, /venv\//i
            ];

            const files = rawFiles.filter(f => {
                const p = f.webkitRelativePath || f.name;
                return !excludePatterns.some(rx => rx.test(p));
            });

            if (files.length === 0) {
                showNotification('No eligible files found after filtering', 'warning');
                return;
            }

            if (files.length > 10000) {
                showNotification(`Too many files (${files.length}). Maximum 10,000.`, 'error');
                return;
            }

            showNotification(`Uploading ${files.length} files to server...`, 'info', 3000);

            const formData = new FormData();
            for (const file of files) {
                const relativePath = file.webkitRelativePath || file.name;
                formData.append('files', new File([file], relativePath, { type: file.type }));
            }

            try {
                if (dom.uploadFilesBtn) {
                    dom.uploadFilesBtn.disabled = true;
                    dom.uploadFilesBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
                }

                const r = await fetch(
                    `${API_BASE_URL}/workspace/projects/${state.currentProject.id}/files`,
                    { method: 'POST', headers: getAuthHeadersNoContentType(), body: formData }
                );

                const d = await r.json().catch(() => ({}));

                if (!r.ok) {
                    const reason = d.reason || d.error || `HTTP ${r.status}`;
                    throw new Error(reason);
                }

                showNotification(`${files.length} files uploaded. Commit to save a snapshot.`, 'success');
                await loadProjectFiles();
                renderFileTree();

            } catch (err) {
                console.error('[Projects] Upload error:', err);
                showNotification(`Upload failed: ${err.message}`, 'error');
            } finally {
                if (dom.uploadFilesBtn) {
                    dom.uploadFilesBtn.disabled = false;
                    dom.uploadFilesBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Files';
                }
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
        if (!state.currentProject) {
            showNotification('No project selected', 'warning');
            return;
        }

        const fileCount = (state.backendFiles || []).length;
        if (fileCount === 0) {
            showNotification('No files uploaded yet. Upload files before committing.', 'warning');
            return;
        }

        if (dom.commitModal) dom.commitModal.classList.remove('hidden');
        if (dom.commitMessageInput) dom.commitMessageInput.value = '';

        if (dom.changedFilesSummary) {
            dom.changedFilesSummary.innerHTML = `
                <strong>${fileCount} file${fileCount !== 1 ? 's' : ''} in project snapshot</strong>
                <p style="color:var(--text-muted);font-size:.85rem;margin-top:.5rem">
                    A commit will snapshot all ${fileCount} files, calculate diffs, and generate a real SHA hash on the server.
                </p>`;
        }
    }

    function closeCommitModal() {
        if (dom.commitModal) dom.commitModal.classList.add('hidden');
    }

    async function confirmCommit() {
        const message = dom.commitMessageInput?.value.trim();
        if (!message) {
            showNotification('Please enter a commit message', 'error');
            return;
        }
        if (!state.currentProject) {
            showNotification('No project selected', 'error');
            return;
        }

        if (dom.confirmCommitBtn) {
            dom.confirmCommitBtn.disabled = true;
            dom.confirmCommitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Committing...';
        }

        try {
            const r = await fetch(
                `${API_BASE_URL}/workspace/projects/${state.currentProject.id}/commits`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ message })
                }
            );

            const d = await r.json().catch(() => ({}));

            if (!r.ok) {
                const reason = d.reason || d.error || d.message || `HTTP ${r.status}`;
                throw new Error(reason);
            }

            closeCommitModal();
            showNotification('Committed successfully!', 'success');

            await loadProjectCommits();
            await loadProjectStats();

            const totalCommits = state.currentProject._stats?.totalCommits ?? state.backendCommits.length;
            if (dom.commitsCount) dom.commitsCount.textContent = totalCommits;

            renderCommitsTimeline();

        } catch (error) {
            console.error('[Projects] Commit failed:', error);
            showNotification(`Commit failed: ${error.message}`, 'error');
        } finally {
            if (dom.confirmCommitBtn) {
                dom.confirmCommitBtn.disabled = false;
                dom.confirmCommitBtn.innerHTML = '<i class="fas fa-check"></i> Commit & Push';
            }
        }
    }

    // ==================== COMMITS TIMELINE ====================
    function renderCommitsTimeline() {
        if (!dom.commitsTimeline || !state.currentProject) return;

        const commits = (state.backendCommits || []).slice().sort((a, b) => b.timestamp - a.timestamp);

        if (commits.length === 0) {
            dom.commitsTimeline.innerHTML = `
                <div class="commits-empty-state">
                    <div class="empty-activity-grid">
                        ${renderActivityGrid([])}
                    </div>
                    <div class="empty-state-content">
                        <i class="fas fa-rocket fa-3x"></i>
                        <h3>Your coding journey starts here</h3>
                        <p>Upload files and make your first commit to track progress</p>
                        <div class="empty-state-hint">
                            <i class="fas fa-lightbulb"></i>
                            <span>Tip: Upload files first, then commit to snapshot your project</span>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        const _s = state.currentProject._stats || {};
        const totalFiles   = _s.totalFiles   ?? (state.backendFiles?.length   || 0);
        const totalAdded   = _s.totalAdditions  ?? commits.reduce((s, c) => s + (c.linesAdded   || 0), 0);
        const totalDeleted = _s.totalDeletions  ?? commits.reduce((s, c) => s + (c.linesDeleted || 0), 0);
        const lastCommitAt = _s.lastCommitAt  ?? commits[0]?.timestamp;
        const timeAgo = lastCommitAt ? formatTimeAgo(typeof lastCommitAt === 'string' ? new Date(lastCommitAt).getTime() : lastCommitAt) : 'never';

        dom.commitsTimeline.innerHTML = `
            <div class="commit-activity-section">
                <h3 class="activity-title"><i class="fas fa-chart-line"></i> Commit Activity</h3>
                ${renderActivityGrid(commits)}
            </div>

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
                    <div class="stat-value">+${totalAdded}</div>
                    <div class="stat-label">Lines Added</div>
                </div>
                <div class="momentum-stat">
                    <div class="stat-value">${timeAgo}</div>
                    <div class="stat-label">Last Activity</div>
                </div>
            </div>

            <div class="commits-timeline-modern">
                ${commits.map((commit, index) => renderCommitCard(commit, index, commits.length)).join('')}
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
                return sum + (c.linesAdded || 0) + (c.linesDeleted || 0);
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
                        const total = c.filesCount || 0;
                        return `
                            <div class="tooltip-commit-item">
                                <div class="tooltip-commit-hash">#${hash}</div>
                                <div class="tooltip-commit-msg">${msg}</div>
                                <div class="tooltip-commit-files">${total} files &nbsp; <span style="color:#4caf50">+${c.linesAdded||0}</span> <span style="color:#f44336">-${c.linesDeleted||0}</span></div>
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
    
    function renderCommitCard(commit, index, totalCount) {
        const linesAdded   = commit.linesAdded   || 0;
        const linesDeleted = commit.linesDeleted || 0;
        const filesCount   = commit.filesCount   || 0;
        const seqNum = (totalCount || 1) - index;

        const accentClass = linesAdded > linesDeleted + 5 ? 'accent-add'
            : linesDeleted > linesAdded + 5 ? 'accent-delete'
            : 'accent-modify';

        const files = Array.isArray(commit.files) ? commit.files : [];

        return `
            <div class="commit-card ${accentClass}" data-commit-id="${commit.id}">
                <div class="commit-card-header">
                    <div class="commit-sequence">#${seqNum}</div>
                    <div class="commit-message-modern">${escapeHtml(commit.message || 'No message')}</div>
                </div>

                <div class="commit-metadata">
                    <div class="commit-author">
                        <i class="fas fa-user-circle"></i>
                        <span>${escapeHtml(commit.author || 'You')}</span>
                    </div>
                    <div class="commit-time">
                        <i class="fas fa-clock"></i>
                        <span>${formatTimeAgo(commit.timestamp)}</span>
                    </div>
                    <div class="commit-hash-modern" onclick="copyCommitHash('${commit.hash}')" title="Click to copy">
                        <i class="fas fa-hashtag"></i>
                        <code>${(commit.hash || 'unknown').substring(0, 8)}</code>
                        <i class="fas fa-copy copy-icon"></i>
                    </div>
                </div>

                <div class="commit-changes-modern">
                    <div class="changes-summary">
                        <span class="change-stat change-add"><i class="fas fa-plus-circle"></i> +${linesAdded}</span>
                        <span class="change-stat change-del"><i class="fas fa-minus-circle"></i> -${linesDeleted}</span>
                        <span class="change-total">${filesCount} file${filesCount !== 1 ? 's' : ''} changed</span>
                    </div>
                    ${files.length > 0 ? `<div class="commit-file-chips">${files.slice(0, 5).map(f => `<span class="file-chip">${escapeHtml(typeof f === 'string' ? f.split('/').pop() : (f.path || f).split('/').pop())}</span>`).join('')}${files.length > 5 ? `<span class="file-chip">+${files.length - 5} more</span>` : ''}</div>` : ''}
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
        showNotification('Rollback is not available in server-side mode. Use git to manage file history.', 'info', 5000);
    }

    // ==================== AI CODE REVIEW ====================
    // AI review is server-side only. Results fetched via renderAIReview().
    // Backend route: GET /workspace/commits/:hash/ai-review

    // ==================== AI REVIEW RENDERING ====================
    async function renderAIReview() {
        if (!dom.aiReviewContainer || !state.currentProject) return;

        const commits = state.backendCommits || [];
        const latestCommit = commits[0];

        if (!latestCommit) {
            dom.aiReviewContainer.innerHTML = `
                <div class="ai-idle-state">
                    <div class="ai-core-status">
                        <div class="ai-core-indicator">
                            <div class="ai-core-ring"></div>
                            <div class="ai-core-ring-2"></div>
                            <div class="ai-core-center"><i class="fas fa-brain"></i></div>
                        </div>
                        <div class="ai-core-label">AI REVIEW ENGINE</div>
                        <div class="ai-core-state">STANDBY</div>
                        <div class="ai-core-sublabel">No commits yet — commit your files to trigger analysis</div>
                    </div>
                </div>`;
            return;
        }

        dom.aiReviewContainer.innerHTML = `
            <div style="text-align:center;padding:3rem">
                <i class="fas fa-spinner fa-spin fa-2x" style="color:var(--accent-red)"></i>
                <p style="margin-top:1rem;color:var(--text-muted)">Fetching AI review for commit ${latestCommit.hash}...</p>
            </div>`;

        try {
            const r = await fetch(API_BASE_URL + '/workspace/commits/' + latestCommit.hash + '/ai-review', {
                headers: getAuthHeaders()
            });

            // In-progress → show loading spinner and auto-retry after 4s
            if (r.status === 202) {
                dom.aiReviewContainer.innerHTML = `
                    <div style="text-align:center;padding:3rem">
                        <i class="fas fa-spinner fa-spin fa-2x" style="color:var(--accent-red)"></i>
                        <p style="margin-top:1rem;color:var(--text-muted)">AI analysis in progress for commit <code>${latestCommit.hash}</code>...</p>
                        <p style="color:var(--text-muted);font-size:.85rem;margin-top:.5rem">Auto-refreshing in 4 seconds</p>
                    </div>`;
                setTimeout(() => renderAIReview(), 4000);
                return;
            }

            if (r.status === 404) {
                dom.aiReviewContainer.innerHTML = `
                    <div class="ai-idle-state">
                        <div class="ai-core-status">
                            <div class="ai-core-indicator">
                                <div class="ai-core-ring"></div>
                                <div class="ai-core-ring-2"></div>
                                <div class="ai-core-center"><i class="fas fa-brain"></i></div>
                            </div>
                            <div class="ai-core-label">AI REVIEW ENGINE</div>
                            <div class="ai-core-state">PENDING</div>
                            <div class="ai-core-sublabel">Review for commit <code>${latestCommit.hash}</code> is being processed...</div>
                        </div>
                        <div class="ai-cta-panel" style="margin-top:2rem">
                            <div class="ai-cta-content">
                                <div class="ai-cta-title">AWAITING ANALYSIS</div>
                                <div class="ai-cta-desc">AI review runs automatically after each commit. Auto-refreshing in 5 seconds.</div>
                            </div>
                            <button class="btn btn-primary" onclick="window.ProjectsWorkspace.refreshAIReview()" style="margin-top:1rem">
                                <i class="fas fa-sync"></i> Refresh Now
                            </button>
                        </div>
                    </div>`;
                setTimeout(() => renderAIReview(), 5000);
                return;
            }

            if (!r.ok) throw new Error('HTTP ' + r.status);
            const d = await r.json();
            if (!d.success || !d.review) throw new Error('No review data');

            const review = d.review;
            const reviewData = typeof review.review_data === 'string'
                ? JSON.parse(review.review_data)
                : (review.review_data || {});

            _renderAIReviewResult(latestCommit.hash, review, reviewData);

        } catch (e) {
            console.error('[Projects] AI review fetch error:', e);
            dom.aiReviewContainer.innerHTML = `
                <div style="padding:2rem;text-align:center">
                    <i class="fas fa-exclamation-triangle fa-2x" style="color:#f44336"></i>
                    <p style="margin-top:1rem;color:var(--text-muted)">Failed to load AI review: ${escapeHtml(e.message)}</p>
                    <button class="btn btn-secondary" onclick="window.ProjectsWorkspace.refreshAIReview()" style="margin-top:1rem">
                        <i class="fas fa-sync"></i> Retry
                    </button>
                </div>`;
        }
    }

    function _renderAIReviewResult(hash, review, reviewData) {
        // Support both legacy flat format and new enterprise 6-layer format
        const isEnterprise = !!(reviewData.productionReadiness || reviewData.security);

        if (!isEnterprise) {
            // ── Legacy fallback render ─────────────────────────────────────────
            const score      = reviewData.overallScore || review.overall_score || 0;
            const scoreColor = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#D00000';
            const circ       = +(2 * Math.PI * 54).toFixed(2);
            const offset     = +(circ * (1 - score / 100)).toFixed(2);
            const ts         = review.created_at ? new Date(review.created_at).getTime() : Date.now();
            dom.aiReviewContainer.innerHTML = `
                <div class="ai-ultra-dashboard">
                    <header class="ultra-header">
                        <div class="header-titles">
                            <h1 class="eng-title">AI REVIEW ENGINE</h1>
                            <div class="eng-sub">Commit: <code>${escapeHtml(hash)}</code> &nbsp;&bull;&nbsp; ${formatTimeAgo(ts)}</div>
                        </div>
                        <div class="rating-orb-container">
                            <div class="rating-orb">
                                <svg class="orb-svg" viewBox="0 0 120 120">
                                    <circle class="orb-bg" cx="60" cy="60" r="54"/>
                                    <circle class="orb-progress" cx="60" cy="60" r="54"
                                        stroke="${scoreColor}"
                                        style="stroke-dasharray:${circ};stroke-dashoffset:${offset}" />
                                </svg>
                                <div class="orb-value"><span class="val-num">${score}</span><span class="val-max">/100</span></div>
                            </div>
                        </div>
                    </header>
                </div>`;
            return;
        }

        // ── Enterprise 6-Layer Dashboard ──────────────────────────────────────
        const sec   = reviewData.security          || {};
        const arch  = reviewData.architecture      || {};
        const maint = reviewData.maintainability   || {};
        const perf  = reviewData.performance       || {};
        const rel   = reviewData.reliability       || {};
        const prod  = reviewData.productionReadiness || {};

        const pri          = prod.productionReadinessIndex || reviewData.overallScore || review.overall_score || 0;
        const deployCategory = prod.deploymentCategory || 'Unknown';
        const debtScore    = reviewData.technicalDebtScore    || 0;
        const refactorEff  = reviewData.refactorEffortEstimate || 'N/A';
        const complexity   = reviewData.systemComplexityIndex  || 0;
        const ts           = review.created_at ? new Date(review.created_at).getTime() : Date.now();
        const modelVer     = review.model_version || 'static-analyzer-v2';

        const priColor  = pri >= 78 ? '#10B981' : pri >= 55 ? '#F59E0B' : '#ef4444';
        const circ      = +(2 * Math.PI * 54).toFixed(2);
        const offset    = +(circ * (1 - pri / 100)).toFixed(2);

        const categoryClass = {
            'Production-Ready': 'deploy-green',
            'Pre-Production':   'deploy-yellow',
            'Prototype':        'deploy-orange',
            'High Risk':        'deploy-red'
        }[deployCategory] || 'deploy-orange';

        function scoreBar(score, total) {
            const s = Number(score) || 0;
            const c = s >= 75 ? '#10B981' : s >= 55 ? '#F59E0B' : '#ef4444';
            return `<div class="ent-score-bar-wrap">
                <div class="ent-score-bar" style="width:${s}%;background:${c}"></div>
                <span class="ent-score-num" style="color:${c}">${s}</span>
            </div>`;
        }

        function issueList(items, colorClass) {
            if (!Array.isArray(items) || items.length === 0)
                return `<div class="ent-no-issues">None detected</div>`;
            return items.slice(0, 4).map(item =>
                `<div class="ent-issue-item ${colorClass}">
                    <span class="ent-issue-label">${escapeHtml(item.file ? item.file.split('/').pop() : (item.file || ''))}</span>
                    <span class="ent-issue-text">${escapeHtml(item.issue || '')}</span>
                    ${item.line ? `<span class="ent-issue-line">L${item.line}</span>` : ''}
                </div>`
            ).join('');
        }

        function tagList(items) {
            if (!Array.isArray(items) || items.length === 0) return '<span class="ent-tag dim">None</span>';
            return items.slice(0, 5).map(s => `<span class="ent-tag">${escapeHtml(String(s))}</span>`).join('');
        }

        function metricPill(label, value, color) {
            return `<div class="ent-pill" style="border-color:${color || '#444'}">
                <span class="ent-pill-val" style="color:${color || '#aaa'}">${escapeHtml(String(value))}</span>
                <span class="ent-pill-lbl">${escapeHtml(label)}</span>
            </div>`;
        }

        const riskColors = { 'Low': '#10B981', 'Medium': '#F59E0B', 'High': '#ef4444', 'None': '#aaa' };

        dom.aiReviewContainer.innerHTML = `
        <div class="ent-dashboard">

            <!-- ── HEADER ── -->
            <div class="ent-header">
                <div class="ent-header-left">
                    <div class="ent-engine-label">ENTERPRISE AI REVIEW ENGINE</div>
                    <div class="ent-commit-ref">Commit <code>${escapeHtml(hash)}</code> &bull; ${formatTimeAgo(ts)} &bull; <span class="ent-model">${escapeHtml(modelVer)}</span></div>
                    <div class="ent-details-row">
                        <span>${reviewData.details?.codeFileCount || 0} code files</span>
                        <span>&bull;</span>
                        <span>${(reviewData.details?.totalLines || 0).toLocaleString()} lines</span>
                        <span>&bull;</span>
                        <span>${(reviewData.details?.languages || []).map(l=>l.lang.toUpperCase()).slice(0,3).join(' / ') || 'N/A'}</span>
                    </div>
                </div>
                <div class="ent-pri-orb-wrap">
                    <div class="ent-pri-orb">
                        <svg viewBox="0 0 120 120" class="ent-orb-svg">
                            <circle class="orb-bg" cx="60" cy="60" r="54"/>
                            <circle class="orb-progress" cx="60" cy="60" r="54"
                                stroke="${priColor}"
                                style="stroke-dasharray:${circ};stroke-dashoffset:${offset}"/>
                        </svg>
                        <div class="ent-orb-inner">
                            <span class="ent-orb-num" style="color:${priColor}">${pri}</span>
                            <span class="ent-orb-sub">/100</span>
                        </div>
                    </div>
                    <div class="ent-deploy-badge ${categoryClass}">${escapeHtml(deployCategory)}</div>
                </div>
            </div>

            <!-- ── TOP BLOCKING ISSUES ── -->
            ${Array.isArray(prod.topBlockingIssues) && prod.topBlockingIssues.length > 0 ? `
            <div class="ent-blocking-issues">
                <div class="ent-section-title">TOP BLOCKING ISSUES</div>
                <div class="ent-blocking-list">
                    ${prod.topBlockingIssues.map(issue => {
                        const isRed = issue.includes('[CRITICAL') || issue.includes('[HIGH');
                        const isYellow = issue.includes('[MEDIUM') || issue.includes('[ARCHITECTURE');
                        const cls = isRed ? 'block-red' : isYellow ? 'block-yellow' : 'block-blue';
                        return `<div class="ent-block-item ${cls}">${escapeHtml(issue)}</div>`;
                    }).join('')}
                </div>
            </div>` : ''}

            <!-- ── 6 PANELS GRID ── -->
            <div class="ent-panels-grid">

                <!-- SECURITY -->
                <div class="ent-panel panel-security">
                    <div class="ent-panel-header">
                        <i class="fas fa-shield-alt"></i>
                        <span>SECURITY</span>
                        ${scoreBar(sec.securityScore)}
                    </div>
                    <div class="ent-panel-body">
                        <div class="ent-issue-counts">
                            <div class="ent-cnt cnt-red"><span>${(sec.criticalIssues||[]).length}</span><small>Critical</small></div>
                            <div class="ent-cnt cnt-orange"><span>${(sec.highIssues||[]).length}</span><small>High</small></div>
                            <div class="ent-cnt cnt-yellow"><span>${(sec.mediumIssues||[]).length}</span><small>Medium</small></div>
                        </div>
                        ${(sec.criticalIssues||[]).length > 0 ? `
                        <div class="ent-sub-label">Critical</div>
                        ${issueList(sec.criticalIssues, 'issue-red')}` : ''}
                        ${(sec.highIssues||[]).length > 0 ? `
                        <div class="ent-sub-label">High</div>
                        ${issueList(sec.highIssues, 'issue-orange')}` : ''}
                        ${(sec.mediumIssues||[]).length > 0 ? `
                        <div class="ent-sub-label">Medium</div>
                        ${issueList(sec.mediumIssues, 'issue-yellow')}` : ''}
                        ${(sec.criticalIssues||[]).length === 0 && (sec.highIssues||[]).length === 0 && (sec.mediumIssues||[]).length === 0 ?
                            `<div class="ent-no-issues">No vulnerabilities detected</div>` : ''}
                        <div class="ent-summary-text">${escapeHtml(sec.securitySummary || '')}</div>
                    </div>
                </div>

                <!-- ARCHITECTURE -->
                <div class="ent-panel panel-arch">
                    <div class="ent-panel-header">
                        <i class="fas fa-sitemap"></i>
                        <span>ARCHITECTURE</span>
                        ${scoreBar(arch.architectureScore)}
                    </div>
                    <div class="ent-panel-body">
                        <div class="ent-metrics-row">
                            ${metricPill('Modularity', arch.modularityLevel || 'N/A', riskColors[arch.modularityLevel] || '#aaa')}
                            ${metricPill('Coupling Risk', arch.couplingRisk != null ? arch.couplingRisk : 'N/A',
                                arch.couplingRisk >= 0.5 ? '#ef4444' : arch.couplingRisk >= 0.2 ? '#F59E0B' : '#10B981')}
                        </div>
                        ${(arch.architecturalWeaknesses||[]).length > 0 ? `
                        <div class="ent-sub-label">Weaknesses</div>
                        ${tagList(arch.architecturalWeaknesses)}` : ''}
                        ${(arch.refactorRecommendations||[]).length > 0 ? `
                        <div class="ent-sub-label" style="margin-top:.75rem">Recommendations</div>
                        <ul class="ent-rec-list">${(arch.refactorRecommendations||[]).slice(0,3).map(r=>`<li>${escapeHtml(r)}</li>`).join('')}</ul>` : ''}
                    </div>
                </div>

                <!-- MAINTAINABILITY -->
                <div class="ent-panel panel-maint">
                    <div class="ent-panel-header">
                        <i class="fas fa-tools"></i>
                        <span>MAINTAINABILITY</span>
                        ${scoreBar(maint.maintainabilityScore)}
                    </div>
                    <div class="ent-panel-body">
                        <div class="ent-metrics-row">
                            ${metricPill('Large Functions', maint.largeFunctionCount != null ? maint.largeFunctionCount : 'N/A',
                                maint.largeFunctionCount >= 5 ? '#ef4444' : maint.largeFunctionCount >= 2 ? '#F59E0B' : '#10B981')}
                            ${metricPill('Duplication', maint.duplicationRisk || 'N/A', riskColors[maint.duplicationRisk] || '#aaa')}
                        </div>
                        ${(maint.codeSmellIndicators||[]).length > 0 ? `
                        <div class="ent-sub-label">Code Smells</div>
                        ${tagList(maint.codeSmellIndicators)}` : ''}
                        ${maint.readabilityAssessment ? `
                        <div class="ent-readability">${escapeHtml(maint.readabilityAssessment)}</div>` : ''}
                    </div>
                </div>

                <!-- PERFORMANCE -->
                <div class="ent-panel panel-perf">
                    <div class="ent-panel-header">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>PERFORMANCE</span>
                        ${scoreBar(perf.performanceScore)}
                    </div>
                    <div class="ent-panel-body">
                        <div class="ent-metrics-row">
                            ${metricPill('Scaling Risk', perf.scalingRiskLevel || 'N/A', riskColors[perf.scalingRiskLevel] || '#aaa')}
                            ${metricPill('Bottlenecks', (perf.bottleneckIndicators||[]).length,
                                (perf.bottleneckIndicators||[]).length >= 4 ? '#ef4444' :
                                (perf.bottleneckIndicators||[]).length >= 2 ? '#F59E0B' : '#10B981')}
                        </div>
                        ${(perf.bottleneckIndicators||[]).length > 0 ? `
                        <div class="ent-sub-label">Bottlenecks</div>
                        <ul class="ent-rec-list">${(perf.bottleneckIndicators||[]).slice(0,4).map(b=>`<li>${escapeHtml(b)}</li>`).join('')}</ul>` : ''}
                        ${perf.estimatedRiskAtScale ? `
                        <div class="ent-scale-grid">
                            <div class="ent-scale-cell"><span class="ent-scale-label">10K req/s</span><span class="ent-scale-val">${escapeHtml(perf.estimatedRiskAtScale['10k']||'N/A')}</span></div>
                            <div class="ent-scale-cell"><span class="ent-scale-label">100K req/s</span><span class="ent-scale-val">${escapeHtml(perf.estimatedRiskAtScale['100k']||'N/A')}</span></div>
                        </div>` : ''}
                    </div>
                </div>

                <!-- RELIABILITY -->
                <div class="ent-panel panel-rel">
                    <div class="ent-panel-header">
                        <i class="fas fa-heartbeat"></i>
                        <span>RELIABILITY</span>
                        ${scoreBar(rel.reliabilityScore)}
                    </div>
                    <div class="ent-panel-body">
                        <div class="ent-rel-row"><span class="ent-rel-key">Test Coverage</span><span class="ent-rel-val">${escapeHtml(rel.testCoverageEstimate||'N/A')}</span></div>
                        <div class="ent-rel-row"><span class="ent-rel-key">Error Handling</span><span class="ent-rel-val">${escapeHtml(rel.errorHandlingQuality||'N/A')}</span></div>
                        <div class="ent-rel-row"><span class="ent-rel-key">Logging</span><span class="ent-rel-val">${escapeHtml(rel.loggingQuality||'N/A')}</span></div>
                        ${(rel.reliabilityConcerns||[]).length > 0 ? `
                        <div class="ent-sub-label" style="margin-top:.75rem">Concerns</div>
                        <ul class="ent-rec-list">${(rel.reliabilityConcerns||[]).slice(0,3).map(c=>`<li>${escapeHtml(c)}</li>`).join('')}</ul>` : ''}
                    </div>
                </div>

                <!-- EXECUTIVE SUMMARY (spans) -->
                <div class="ent-panel panel-exec">
                    <div class="ent-panel-header">
                        <i class="fas fa-file-alt"></i>
                        <span>EXECUTIVE SUMMARY</span>
                    </div>
                    <div class="ent-panel-body">
                        <pre class="ent-exec-text">${escapeHtml(prod.executiveSummary||'No summary available.')}</pre>
                    </div>
                </div>

            </div>

            <!-- ── BONUS METRICS FOOTER ── -->
            <div class="ent-bonus-footer">
                <div class="ent-bonus-card">
                    <div class="ent-bonus-label">TECHNICAL DEBT SCORE</div>
                    <div class="ent-bonus-val" style="color:${debtScore>=50?'#ef4444':debtScore>=25?'#F59E0B':'#10B981'}">${debtScore}/100</div>
                    <div class="ent-bonus-sub">${debtScore >= 50 ? 'High — prioritize debt reduction' : debtScore >= 25 ? 'Moderate — schedule refactor sprint' : 'Low — healthy debt level'}</div>
                </div>
                <div class="ent-bonus-card">
                    <div class="ent-bonus-label">REFACTOR EFFORT</div>
                    <div class="ent-bonus-val" style="color:${refactorEff==='High'?'#ef4444':refactorEff==='Medium'?'#F59E0B':'#10B981'}">${escapeHtml(refactorEff)}</div>
                    <div class="ent-bonus-sub">${refactorEff==='High'?'Major overhaul needed':refactorEff==='Medium'?'1–2 sprint refactor cycle':'Targeted fixes sufficient'}</div>
                </div>
                <div class="ent-bonus-card">
                    <div class="ent-bonus-label">SYSTEM COMPLEXITY INDEX</div>
                    <div class="ent-bonus-val" style="color:${complexity>=70?'#ef4444':complexity>=40?'#F59E0B':'#10B981'}">${complexity}/100</div>
                    <div class="ent-bonus-sub">${complexity>=70?'High complexity — hard to extend':complexity>=40?'Moderate — manageable with discipline':'Low — straightforward codebase'}</div>
                </div>
                <div class="ent-bonus-card">
                    <div class="ent-bonus-label">ANALYZED BY</div>
                    <div class="ent-bonus-val" style="color:#888;font-size:.9rem">${escapeHtml(modelVer)}</div>
                    <div class="ent-bonus-sub">Processing: ${reviewData.processingMs || 'N/A'}ms</div>
                </div>
            </div>

        </div>`;
    }

    // ==================== EVOLUTION TRACKING ====================
    function renderEvolution() {
        if (!dom.evolutionDashboard || !state.currentProject) return;

        const commits = (state.backendCommits || []).slice().sort((a, b) => a.timestamp - b.timestamp);

        if (commits.length < 2) {
            dom.evolutionDashboard.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line fa-3x" style="color:var(--text-muted)"></i>
                    <p style="color:white;margin-top:1rem">Insufficient Data</p>
                    <p class="text-muted">Make at least 2 commits to see evolution tracking.</p>
                </div>`;
            return;
        }

        const totalAdded   = commits.reduce((s, c) => s + (c.linesAdded   || 0), 0);
        const totalDeleted = commits.reduce((s, c) => s + (c.linesDeleted || 0), 0);

        dom.evolutionDashboard.innerHTML = `
            <div class="evolution-metrics">
                ${renderMetricCard('Total Commits', commits.length, commits.length - 1)}
                ${renderMetricCard('Files Tracked', state.backendFiles ? state.backendFiles.length : 0, 0)}
                ${renderMetricCard('Lines Added',   totalAdded,   0)}
                ${renderMetricCard('Lines Removed', totalDeleted, 0)}
            </div>
            <div class="evolution-timeline">
                <h3 style="margin-bottom:2rem;text-transform:uppercase;letter-spacing:.1em;font-size:1rem;color:var(--text-muted)">Commit History</h3>
                ${commits.map((c, i) => `
                    <div class="evolution-item" style="padding:1.5rem;border-left:2px solid #d00000;margin-bottom:1rem;background:var(--matte-surface);border:1px solid var(--border-subtle);border-left-width:2px">
                        <div style="display:flex;justify-content:space-between;align-items:center">
                            <div>
                                <strong style="color:white;font-size:.9rem">#${i + 1} ${escapeHtml(c.message || '')}</strong>
                                <code style="margin-left:1rem;font-size:.8rem;color:var(--text-muted)">${escapeHtml(c.hash || '')}</code>
                            </div>
                            <span style="color:var(--text-muted);font-size:.8rem">${formatTimeAgo(c.timestamp)}</span>
                        </div>
                        <div style="margin-top:.5rem;font-size:.85rem;color:var(--text-muted)">
                            <span style="color:#4caf50">+${c.linesAdded || 0}</span> /
                            <span style="color:#f44336">-${c.linesDeleted || 0}</span> &nbsp;
                            ${c.filesCount || 0} files
                        </div>
                    </div>`).join('')}
            </div>`;
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

        if (!confirm('Mark this project as complete?')) return;

        state.currentProject.status = 'completed';
        showNotification('Project marked as complete!', 'success');
        renderProjectDetail();
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
        refreshAIReview: () => renderAIReview()
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('[ProjectsWorkspace] Module loaded');
})();
