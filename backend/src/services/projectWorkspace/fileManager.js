const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { ProjectFile } = require('../../models/ProjectWorkspace');

class FileManager {
    constructor() {
        this.uploadBaseDir = path.join(__dirname, '../../../uploads/projects');
    }

    /**
     * Process uploaded files and prepare for commit
     */
    async processFiles(projectId, files, commitStaging = false) {
        const stagingDir = commitStaging 
            ? path.join(this.uploadBaseDir, projectId.toString(), 'staging')
            : path.join(this.uploadBaseDir, projectId.toString(), 'temp');

        await this.ensureDirectory(stagingDir);

        const processedFiles = [];

        for (const file of files) {
            const fileData = await this.processFile(file, stagingDir);
            processedFiles.push(fileData);
        }

        return processedFiles;
    }

    /**
     * Process single file
     */
    async processFile(file, targetDir) {
        const content = file.buffer || await fs.readFile(file.path);
        const contentHash = crypto.createHash('sha256').update(content).digest('hex');
        
        // Determine if binary
        const isBinary = this.isBinaryFile(file.mimetype, file.originalname);
        
        // Count lines of code
        const linesOfCode = isBinary ? 0 : content.toString().split('\n').length;
        
        // Store file
        const storagePath = path.join(targetDir, `${contentHash}${path.extname(file.originalname)}`);
        await fs.writeFile(storagePath, content);
        
        return {
            fileName: file.originalname,
            filePath: file.originalname, // Will be updated with proper path
            fileType: path.extname(file.originalname).slice(1),
            fileSize: content.length,
            contentHash,
            storagePath,
            isBinary,
            linesOfCode,
            content: isBinary ? null : content.toString()
        };
    }

    /**
     * Move files from staging to commit directory
     */
    async commitFiles(projectId, commitHash, files) {
        const commitDir = path.join(this.uploadBaseDir, projectId.toString(), 'commits', commitHash, 'files');
        await this.ensureDirectory(commitDir);

        for (const file of files) {
            const targetPath = path.join(commitDir, file.filePath);
            await this.ensureDirectory(path.dirname(targetPath));
            
            // Copy from staging
            if (file.storagePath) {
                await fs.copyFile(file.storagePath, targetPath);
            }
        }

        // Create commit metadata
        const metadata = {
            commitHash,
            timestamp: new Date().toISOString(),
            filesCount: files.length,
            totalSize: files.reduce((sum, f) => sum + f.fileSize, 0),
            files: files.map(f => ({
                path: f.filePath,
                hash: f.contentHash,
                size: f.fileSize
            }))
        };

        await fs.writeFile(
            path.join(this.uploadBaseDir, projectId.toString(), 'commits', commitHash, 'metadata.json'),
            JSON.stringify(metadata, null, 2)
        );

        return commitDir;
    }

    /**
     * Get file content
     */
    async getFileContent(projectId, commitHash, filePath) {
        const fullPath = path.join(
            this.uploadBaseDir, 
            projectId.toString(), 
            'commits', 
            commitHash, 
            'files', 
            filePath
        );
        
        const content = await fs.readFile(fullPath, 'utf-8');
        return content;
    }

    /**
     * Build directory tree from flat file list
     */
    buildFileTree(files) {
        const root = {
            name: 'root',
            type: 'directory',
            children: [],
            path: ''
        };

        files.forEach(file => {
            const parts = file.file_path.split('/');
            let current = root;

            parts.forEach((part, index) => {
                const isFile = index === parts.length - 1;
                
                let existing = current.children.find(c => c.name === part);
                
                if (!existing) {
                    existing = {
                        name: part,
                        type: isFile ? 'file' : 'directory',
                        path: parts.slice(0, index + 1).join('/'),
                        children: isFile ? undefined : [],
                        ...(isFile && {
                            size: file.file_size,
                            type: file.file_type,
                            linesOfCode: file.lines_of_code
                        })
                    };
                    current.children.push(existing);
                }
                
                if (!isFile) {
                    current = existing;
                }
            });
        });

        return root.children;
    }

    /**
     * Calculate project size
     */
    async getProjectSize(projectId) {
        const projectDir = path.join(this.uploadBaseDir, projectId.toString());
        return await this.getDirectorySize(projectDir);
    }

    /**
     * Get directory size recursively
     */
    async getDirectorySize(dirPath) {
        let size = 0;
        
        try {
            const files = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const file of files) {
                const filePath = path.join(dirPath, file.name);
                
                if (file.isDirectory()) {
                    size += await this.getDirectorySize(filePath);
                } else {
                    const stats = await fs.stat(filePath);
                    size += stats.size;
                }
            }
        } catch (err) {
            // Directory doesn't exist yet
            return 0;
        }
        
        return size;
    }

    /**
     * Check if file is binary
     */
    isBinaryFile(mimetype, filename) {
        const binaryExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.zip', '.tar', '.exe', '.dll', '.so'];
        const ext = path.extname(filename).toLowerCase();
        
        if (binaryExtensions.includes(ext)) return true;
        if (mimetype && mimetype.startsWith('image/')) return true;
        if (mimetype && mimetype.startsWith('application/')) return true;
        
        return false;
    }

    /**
     * Ensure directory exists
     */
    async ensureDirectory(dirPath) {
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
    }

    /**
     * Clean staging directory
     */
    async cleanStaging(projectId) {
        const stagingDir = path.join(this.uploadBaseDir, projectId.toString(), 'staging');
        try {
            await fs.rm(stagingDir, { recursive: true, force: true });
        } catch (err) {
            // Ignore if doesn't exist
        }
    }

    /**
     * Get syntax highlighting language
     */
    getSyntaxLanguage(filename) {
        const ext = path.extname(filename).toLowerCase();
        const languageMap = {
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.py': 'python',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.cs': 'csharp',
            '.go': 'go',
            '.rs': 'rust',
            '.rb': 'ruby',
            '.php': 'php',
            '.html': 'html',
            '.css': 'css',
            '.scss': 'scss',
            '.json': 'json',
            '.xml': 'xml',
            '.md': 'markdown',
            '.sql': 'sql',
            '.sh': 'bash',
            '.yml': 'yaml',
            '.yaml': 'yaml'
        };
        
        return languageMap[ext] || 'text';
    }
}

module.exports = new FileManager();
