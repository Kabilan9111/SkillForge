/**
 * FILES TAB - GitHub-style File Explorer
 */

window.FilesTab = class FilesTab {
    constructor(container, project, apiBase) {
        this.container = container;
        this.project = project;
        this.apiBase = apiBase;
        this.selectedFile = null;
        this.fileTree = [];
        this.render();
    }

    async render() {
        this.container.innerHTML = `
            <div class="files-tab">
                <div class="files-panel">
                    <div class="files-toolbar">
                        <button class="btn-primary" id="upload-files-btn">
                            ⬆️ Upload Files
                        </button>
                        <input type="file" id="file-input" multiple style="display: none;">
                    </div>
                    <div class="file-tree" id="file-tree">
                        <div class="loading">Loading file tree...</div>
                    </div>
                </div>
                <div class="file-viewer">
                    <div class="file-viewer-header">
                        <span id="file-path">Select a file to view</span>
                        <button class="btn-icon" id="download-file">⬇️</button>
                    </div>
                    <div class="file-content" id="file-content">
                        <div class="empty-state">
                            <div class="empty-icon">📄</div>
                            <p>Select a file from the tree to preview</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        await this.loadFileTree();
        this.attachEventListeners();
    }

    async loadFileTree() {
        try {
            const res = await fetch(`${this.apiBase}/projects/${this.project.id}/files`);
            const data = await res.json();
            if (data.success) {
                this.fileTree = data.tree || [];
                this.renderFileTree();
            }
        } catch (err) {
            console.error('Failed to load file tree:', err);
            document.getElementById('file-tree').innerHTML = '<div class="error">Failed to load files</div>';
        }
    }

    renderFileTree() {
        const treeContainer = document.getElementById('file-tree');
        
        if (this.fileTree.length === 0) {
            treeContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📂</div>
                    <p>No files yet</p>
                    <button class="btn-primary" onclick="document.getElementById('upload-files-btn').click()">
                        Upload Files
                    </button>
                </div>
            `;
            return;
        }

        treeContainer.innerHTML = '<div class="tree-root">' + this.renderTreeNodes(this.fileTree) + '</div>';
    }

    renderTreeNodes(nodes, level = 0) {
        return nodes.map(node => {
            const isFolder = node.type === 'directory';
            const icon = isFolder ? '📁' : this.getFileIcon(node.name);
            const indent = level * 20;

            if (isFolder) {
                return `
                    <div class="tree-node folder" style="padding-left: ${indent}px;">
                        <span class="node-toggle">▶</span>
                        <span class="node-icon">${icon}</span>
                        <span class="node-name">${node.name}</span>
                        <div class="node-children" style="display: none;">
                            ${node.children ? this.renderTreeNodes(node.children, level + 1) : ''}
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="tree-node file" data-path="${node.path}" style="padding-left: ${indent}px;">
                        <span class="node-icon">${icon}</span>
                        <span class="node-name">${node.name}</span>
                        <span class="node-meta">${this.formatFileSize(node.size)}</span>
                    </div>
                `;
            }
        }).join('');
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'js': '📜', 'jsx': '⚛️', 'ts': '📘', 'tsx': '⚛️',
            'py': '🐍', 'java': '☕', 'cpp': '⚙️', 'c': '⚙️',
            'html': '🌐', 'css': '🎨', 'scss': '🎨',
            'json': '📋', 'md': '📝', 'txt': '📄',
            'png': '🖼️', 'jpg': '🖼️', 'gif': '🖼️',
            'pdf': '📕', 'zip': '📦'
        };
        return icons[ext] || '📄';
    }

    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    attachEventListeners() {
        // Upload button
        document.getElementById('upload-files-btn').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });

        // File input
        document.getElementById('file-input').addEventListener('change', async (e) => {
            await this.handleFileUpload(e.target.files);
        });

        // Tree node interactions
        setTimeout(() => {
            // Folder toggle
            document.querySelectorAll('.tree-node.folder .node-toggle').forEach(toggle => {
                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const node = e.target.closest('.tree-node');
                    const children = node.querySelector('.node-children');
                    if (children) {
                        const isHidden = children.style.display === 'none';
                        children.style.display = isHidden ? 'block' : 'none';
                        e.target.textContent = isHidden ? '▼' : '▶';
                    }
                });
            });

            // File click
            document.querySelectorAll('.tree-node.file').forEach(file => {
                file.addEventListener('click', async (e) => {
                    const path = e.currentTarget.dataset.path;
                    await this.loadFileContent(path);
                });
            });
        }, 100);
    }

    async handleFileUpload(files) {
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });

        try {
            const res = await fetch(`${this.apiBase}/projects/${this.project.id}/files`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                alert(`${data.filesProcessed} files uploaded successfully`);
                await this.loadFileTree();
            }
        } catch (err) {
            console.error('Upload failed:', err);
            alert('File upload failed');
        }
    }

    async loadFileContent(path) {
        const latestCommit = this.project.latestCommit;
        if (!latestCommit) {
            alert('No commits yet. Create a commit first.');
            return;
        }

        try {
            const res = await fetch(
                `${this.apiBase}/projects/${this.project.id}/files/content?commitHash=${latestCommit.commit_hash}&path=${encodeURIComponent(path)}`
            );
            const data = await res.json();
            if (data.success) {
                this.displayFileContent(path, data.content);
            }
        } catch (err) {
            console.error('Failed to load file:', err);
        }
    }

    displayFileContent(path, content) {
        document.getElementById('file-path').textContent = path;
        const contentDiv = document.getElementById('file-content');
        
        // Syntax highlighting would go here
        contentDiv.innerHTML = `<pre><code>${this.escapeHtml(content)}</code></pre>`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
