const FileManager = require('./fileManager');

class DiffEngine {
    /**
     * Compare two commits
     */
    async compareCommits(projectId, commit1Hash, commit2Hash, files1, files2) {
        const changes = {
            added: [],
            modified: [],
            deleted: [],
            renamed: [],
            totalChanges: 0,
            linesAdded: 0,
            linesRemoved: 0
        };

        // Create hash maps for faster lookup
        const files1Map = new Map(files1.map(f => [f.file_path, f]));
        const files2Map = new Map(files2.map(f => [f.file_path, f]));

        // Find deleted files (in commit1 but not in commit2)
        for (const [path, file] of files1Map) {
            if (!files2Map.has(path)) {
                changes.deleted.push({
                    path,
                    file: file.file_name,
                    size: file.file_size,
                    linesRemoved: file.lines_of_code
                });
                changes.linesRemoved += file.lines_of_code;
            }
        }

        // Find added and modified files
        for (const [path, file2] of files2Map) {
            const file1 = files1Map.get(path);
            
            if (!file1) {
                // File added
                changes.added.push({
                    path,
                    file: file2.file_name,
                    size: file2.file_size,
                    linesAdded: file2.lines_of_code
                });
                changes.linesAdded += file2.lines_of_code;
            } else if (file1.content_hash !== file2.content_hash) {
                // File modified
                const diff = await this.generateFileDiff(
                    projectId,
                    commit1Hash,
                    commit2Hash,
                    path,
                    file1,
                    file2
                );
                
                changes.modified.push(diff);
                changes.linesAdded += diff.linesAdded;
                changes.linesRemoved += diff.linesRemoved;
            }
        }

        changes.totalChanges = changes.added.length + changes.modified.length + changes.deleted.length;

        return changes;
    }

    /**
     * Generate file-level diff
     */
    async generateFileDiff(projectId, commit1Hash, commit2Hash, filePath, file1, file2) {
        try {
            const content1 = await FileManager.getFileContent(projectId, commit1Hash, filePath);
            const content2 = await FileManager.getFileContent(projectId, commit2Hash, filePath);

            const lines1 = content1.split('\n');
            const lines2 = content2.split('\n');

            const diff = this.computeLineDiff(lines1, lines2);

            return {
                path: filePath,
                file: file2.file_name,
                oldSize: file1.file_size,
                newSize: file2.file_size,
                linesAdded: diff.added,
                linesRemoved: diff.removed,
                chunks: diff.chunks
            };
        } catch (error) {
            console.error(`Diff generation failed for ${filePath}:`, error);
            return {
                path: filePath,
                file: file2.file_name,
                error: 'Could not generate diff',
                linesAdded: 0,
                linesRemoved: 0,
                chunks: []
            };
        }
    }

    /**
     * Compute line-by-line diff using simple algorithm
     */
    computeLineDiff(lines1, lines2) {
        const chunks = [];
        let added = 0;
        let removed = 0;

        // Simple diff: Myers algorithm simplified
        const lcs = this.longestCommonSubsequence(lines1, lines2);
        
        let i = 0, j = 0;
        let currentChunk = null;

        for (const [line1Idx, line2Idx] of lcs) {
            // Lines removed
            while (i < line1Idx) {
                if (!currentChunk) {
                    currentChunk = {
                        oldStart: i + 1,
                        newStart: j + 1,
                        lines: []
                    };
                }
                currentChunk.lines.push({
                    type: 'removed',
                    content: lines1[i],
                    oldLineNumber: i + 1
                });
                removed++;
                i++;
            }

            // Lines added
            while (j < line2Idx) {
                if (!currentChunk) {
                    currentChunk = {
                        oldStart: i + 1,
                        newStart: j + 1,
                        lines: []
                    };
                }
                currentChunk.lines.push({
                    type: 'added',
                    content: lines2[j],
                    newLineNumber: j + 1
                });
                added++;
                j++;
            }

            // Unchanged line
            if (currentChunk && currentChunk.lines.length > 0) {
                chunks.push(currentChunk);
                currentChunk = null;
            }

            i++;
            j++;
        }

        // Remaining lines
        while (i < lines1.length) {
            if (!currentChunk) {
                currentChunk = {
                    oldStart: i + 1,
                    newStart: j + 1,
                    lines: []
                };
            }
            currentChunk.lines.push({
                type: 'removed',
                content: lines1[i],
                oldLineNumber: i + 1
            });
            removed++;
            i++;
        }

        while (j < lines2.length) {
            if (!currentChunk) {
                currentChunk = {
                    oldStart: i + 1,
                    newStart: j + 1,
                    lines: []
                };
            }
            currentChunk.lines.push({
                type: 'added',
                content: lines2[j],
                newLineNumber: j + 1
            });
            added++;
            j++;
        }

        if (currentChunk && currentChunk.lines.length > 0) {
            chunks.push(currentChunk);
        }

        return { added, removed, chunks };
    }

    /**
     * Longest Common Subsequence (for diff algorithm)
     */
    longestCommonSubsequence(arr1, arr2) {
        const m = arr1.length;
        const n = arr2.length;
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (arr1[i - 1] === arr2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        // Backtrack to find LCS
        const lcs = [];
        let i = m, j = n;
        while (i > 0 && j > 0) {
            if (arr1[i - 1] === arr2[j - 1]) {
                lcs.unshift([i - 1, j - 1]);
                i--;
                j--;
            } else if (dp[i - 1][j] > dp[i][j - 1]) {
                i--;
            } else {
                j--;
            }
        }

        return lcs;
    }

    /**
     * Format diff as unified diff format
     */
    formatUnifiedDiff(diff) {
        const lines = [];
        lines.push(`diff --git a/${diff.path} b/${diff.path}`);
        lines.push(`--- a/${diff.path}`);
        lines.push(`+++ b/${diff.path}`);

        for (const chunk of diff.chunks) {
            lines.push(`@@ -${chunk.oldStart},${chunk.lines.filter(l => l.type !== 'added').length} +${chunk.newStart},${chunk.lines.filter(l => l.type !== 'removed').length} @@`);
            
            for (const line of chunk.lines) {
                const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';
                lines.push(`${prefix}${line.content}`);
            }
        }

        return lines.join('\n');
    }
}

module.exports = new DiffEngine();
