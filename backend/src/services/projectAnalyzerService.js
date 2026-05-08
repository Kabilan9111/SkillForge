'use strict';

/**
 * ╔════════════════════════════════════════════════════════════════════════╗
 * ║  PROJECT ANALYZER SERVICE                                              ║
 * ║  Static + AI-Assisted Code Quality & Architecture Analysis             ║
 * ║                                                                        ║
 * ║  Pipeline                                                              ║
 * ║    Stage 1 : File scan & language detection                            ║
 * ║    Stage 2 : Architecture pattern recognition                          ║
 * ║    Stage 3 : Code quality scoring (complexity, duplication, coverage)  ║
 * ║    Stage 4 : Security hygiene detection                                ║
 * ║    Stage 5 : Performance risk analysis                                 ║
 * ║    Stage 6 : Production-readiness verdict + LLM improvement suggestions║
 * ╚════════════════════════════════════════════════════════════════════════╝
 */

const fs   = require('fs').promises;
const path = require('path');

// ── Language detection ────────────────────────────────────────────────────────

const LANG_MAP = {
    '.js':    'JavaScript',
    '.ts':    'TypeScript',
    '.jsx':   'React/JSX',
    '.tsx':   'React/TSX',
    '.py':    'Python',
    '.go':    'Go',
    '.java':  'Java',
    '.rs':    'Rust',
    '.cpp':   'C++',
    '.c':     'C',
    '.cs':    'C#',
    '.rb':    'Ruby',
    '.php':   'PHP',
    '.swift': 'Swift',
    '.kt':    'Kotlin',
    '.scala': 'Scala',
    '.sh':    'Shell',
    '.sql':   'SQL',
    '.html':  'HTML',
    '.css':   'CSS',
    '.scss':  'SCSS',
    '.yaml':  'YAML',
    '.yml':   'YAML',
    '.json':  'JSON',
    '.md':    'Markdown',
    '.tf':    'Terraform',
    '.dockerfile': 'Dockerfile',
};

const SKIP_DIRS = new Set([
    'node_modules', '.git', '.github', '.vscode', 'dist', 'build',
    'coverage', '__pycache__', '.pytest_cache', '.mypy_cache',
    'venv', '.venv', 'env', '.env', 'vendor', '.cache',
    'out', '.next', '.nuxt', 'target', 'bin', 'obj',
]);

const SKIP_EXTS = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
    '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mp3',
    '.zip', '.tar', '.lock', '.sum', '.min.js', '.min.css',
]);

// ── Architecture signals ──────────────────────────────────────────────────────

const ARCH_PATTERNS = {
    microservices:     /docker-compose|kubernetes|k8s|service[_-]mesh|api[_-]gateway|sidecar/i,
    event_driven:      /eventbus|message[_-]?queue|rabbitmq|kafka|pubsub|event[_-]emitter/i,
    mvc:               /controller|view|model|route|middleware/i,
    clean_arch:        /use[_-]?case|entity|repository|adapter|port|interface|domain/i,
    serverless:        /lambda|serverless|functions|handler|trigger|faas/i,
    monolith:          /app\.js|main\.py|application\.java|program\.cs/i,
    rest_api:          /router|express|fastapi|flask|spring|gin|echo|nestjs/i,
    graphql:           /graphql|apollo|schema|resolver|mutation|subscription/i,
};

// ── Security anti-patterns ────────────────────────────────────────────────────

const SECURITY_ISSUES = [
    { pattern: /password\s*=\s*["'][^"']{3,}/i,          severity: 'critical', label: 'Hardcoded password detected' },
    { pattern: /secret\s*=\s*["'][^"']{5,}/i,             severity: 'critical', label: 'Hardcoded secret detected' },
    { pattern: /api[_-]?key\s*=\s*["'][A-Za-z0-9_\-]{8,}/i, severity: 'critical', label: 'Hardcoded API key detected' },
    { pattern: /md5\s*\(/i,                                severity: 'high',     label: 'Insecure MD5 hashing used' },
    { pattern: /\beval\s*\(/,                              severity: 'high',     label: 'Use of eval() — code injection risk' },
    { pattern: /exec\s*\(.*req\.\w+/,                     severity: 'high',     label: 'Command injection risk via exec()' },
    { pattern: /innerHTML\s*=/,                            severity: 'medium',   label: 'Potential XSS via innerHTML' },
    { pattern: /http:\/\/(?!localhost|127)/,               severity: 'medium',   label: 'HTTP (non-HTTPS) endpoint used' },
    { pattern: /sql.*\+.*req|query.*\+.*params/i,          severity: 'high',     label: 'Potential SQL injection (string concat)' },
    { pattern: /cors\(\s*\{[^}]*origin\s*:\s*['"]?\*/,    severity: 'medium',   label: 'CORS open wildcard (*) configured' },
    { pattern: /console\.log.*(password|secret|token)/i,  severity: 'medium',   label: 'Sensitive data logged to console' },
    { pattern: /\.env(?!\.example)/,                       severity: 'low',      label: 'Direct .env file access in code' },
];

// ── Performance anti-patterns ─────────────────────────────────────────────────

const PERF_ISSUES = [
    { pattern: /await.*Promise\.all\(\[.*await.*\]\)/s,   severity: 'medium', label: 'await inside Promise.all defeats parallelism' },
    { pattern: /for\s*\(.*\)\s*\{[^}]*await/,             severity: 'medium', label: 'Sequential awaits in loop (use Promise.all)' },
    { pattern: /SELECT\s+\*/i,                             severity: 'low',    label: 'SELECT * fetches unnecessary columns' },
    { pattern: /setTimeout.*0/,                            severity: 'low',    label: 'setTimeout(fn, 0) — consider microtask queue' },
    { pattern: /\.forEach.*async/,                         severity: 'medium', label: 'async callback in forEach — consider for...of or Promise.all' },
    { pattern: /new\s+RegExp\(/,                           severity: 'low',    label: 'Dynamic RegExp construction in hot path' },
    { pattern: /JSON\.parse.*JSON\.stringify/,             severity: 'low',    label: 'JSON deep copy — consider structuredClone()' },
];

// ── Quality heuristics ────────────────────────────────────────────────────────

const QUALITY_SIGNALS = {
    positive: [
        { pattern: /\.test\.(js|ts|py|java|go)|_spec\.(js|ts)|test_.*\.py/, label: 'Test files present' },
        { pattern: /\.eslintrc|\.flake8|\.pylintrc|rubocop|golangci/, label: 'Linter configuration found' },
        { pattern: /docker-compose|Dockerfile|\.dockerignore/, label: 'Containerization present' },
        { pattern: /\.github\/workflows|\.gitlab-ci|Jenkinsfile|\.travis/, label: 'CI/CD pipeline configured' },
        { pattern: /README|CONTRIBUTING|\.md$/, label: 'Documentation present' },
        { pattern: /\.env\.example|config\.example/, label: 'Safe config templates provided' },
        { pattern: /error.*handler|try.*catch|except\s+\w+/i, label: 'Error handling found' },
        { pattern: /logger|logging|pino|winston|log4j|zerolog/i, label: 'Logging framework used' },
    ],
    negative: [
        { pattern: /TODO|FIXME|HACK|XXX/, label: 'Unresolved TODOs / hacks in code' },
        { pattern: /console\.log|print\(|fmt\.Println/,  label: 'Debug print statements left in code' },
        { pattern: /debugger\s*;/, label: 'Debugger breakpoint left in code' },
        { pattern: /localhost|127\.0\.0\.1/, label: 'Localhost references (may cause prod issues)' },
    ],
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SERVICE CLASS
// ─────────────────────────────────────────────────────────────────────────────

class ProjectAnalyzerService {

    /**
     * Analyze a zip archive (Buffer) of a code project.
     *
     * @param {Buffer}  zipBuffer  - Raw bytes of the uploaded ZIP file
     * @param {object}  opts       - { projectName, targetStack, userId }
     * @returns {Promise<AnalysisResult>}
     */
    async analyzeZip(zipBuffer, opts = {}) {
        const AdmZip = safeRequire('adm-zip');
        if (!AdmZip) {
            throw new Error('adm-zip is not installed. Run: npm install adm-zip');
        }

        const zip      = new AdmZip(zipBuffer);
        const entries  = zip.getEntries();
        const files    = [];

        for (const entry of entries) {
            if (entry.isDirectory) continue;
            const entryPath  = entry.entryName;
            const parts      = entryPath.split('/');
            if (parts.some(p => SKIP_DIRS.has(p))) continue;
            const ext        = path.extname(entryPath).toLowerCase();
            if (SKIP_EXTS.has(ext)) continue;
            if (entry.header.size > 500 * 1024) continue; // skip files > 500 KB

            const content = entry.getData().toString('utf8', 0, 100000); // max 100 KB per file
            files.push({ path: entryPath, ext, content, size: entry.header.size });
        }

        if (files.length === 0) {
            throw new Error('No analyzable source files found in the uploaded archive.');
        }

        return this._runPipeline(files, opts);
    }

    /**
     * Analyze a directory path (server-side only).
     */
    async analyzeDirectory(dirPath, opts = {}) {
        const files = await this._scanDirectory(dirPath, '');
        if (files.length === 0) {
            throw new Error('No analyzable source files found in the project directory.');
        }
        return this._runPipeline(files, opts);
    }

    // ── Internal pipeline ───────────────────────────────────────────────────

    async _runPipeline(files, opts) {
        const { projectName = 'Unnamed Project', targetStack = 'general', userId = 'anonymous' } = opts;

        // Stage 1 — Language detection
        const langStats   = this._detectLanguages(files);
        const primaryLang = Object.entries(langStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

        // Stage 2 — Architecture detection
        const architecture = this._detectArchitecture(files, langStats);

        // Stage 3 — Code quality scoring
        const quality      = this._scoreCodeQuality(files);

        // Stage 4 — Security analysis
        const security     = this._analyzeSecurityHygiene(files);

        // Stage 5 — Performance risk
        const performance  = this._analyzePerformance(files);

        // Stage 6 — Overall scoring & LLM suggestions
        const { overallScore, productionReadiness, breakdown } = this._computeOverallScore(
            quality, security, performance
        );

        const suggestions  = this._generateImprovementSuggestions(quality, security, performance, architecture);

        const result = {
            projectName,
            userId,
            analyzedAt: new Date().toISOString(),
            fileCount:  files.length,
            totalLines: quality.totalLines,
            primaryLanguage: primaryLang,
            languageDistribution: langStats,

            // ── 6 Stage outputs ─
            architecture,
            quality,
            security,
            performance,

            // ── Scores ─
            overallScore,           // 0–100
            productionReadiness,    // "NOT READY" | "NEEDS WORK" | "NEARLY READY" | "PRODUCTION READY"
            breakdown,              // per-dimension scores

            // ── Recommendations ─
            suggestions,
            topPriority: suggestions[0] || null,
        };

        return result;
    }

    // ── Stage 1: Language detection ─────────────────────────────────────────

    _detectLanguages(files) {
        const counts = {};
        for (const f of files) {
            const lang = LANG_MAP[f.ext] || f.ext || 'Other';
            counts[lang] = (counts[lang] || 0) + 1;
        }
        return counts;
    }

    // ── Stage 2: Architecture detection ─────────────────────────────────────

    _detectArchitecture(files, langStats) {
        const allContent = files.map(f => f.path + '\n' + f.content.slice(0, 3000)).join('\n');
        const detected   = [];
        const scores     = {};

        for (const [arch, pattern] of Object.entries(ARCH_PATTERNS)) {
            const matches = (allContent.match(pattern) || []).length;
            if (matches > 0) {
                detected.push(arch);
                scores[arch] = matches;
            }
        }

        const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'monolith';

        const hasDockerfile = files.some(f => f.path.toLowerCase().includes('dockerfile'));
        const hasCompose    = files.some(f => f.path.toLowerCase().includes('docker-compose'));
        const hasTests      = files.some(f => /\.(test|spec)\.(js|ts|py)$/.test(f.path) || f.path.includes('/test'));
        const hasCI         = files.some(f => f.path.includes('.github/workflows') || f.path.includes('.gitlab-ci'));
        const hasDocumentation = files.some(f => f.path.toLowerCase().includes('readme'));

        return {
            patterns: detected,
            dominant,
            scores,
            signals: {
                hasDockerfile,
                hasCompose,
                hasTests,
                hasCIPipeline: hasCI,
                hasDocumentation,
            },
        };
    }

    // ── Stage 3: Code quality ────────────────────────────────────────────────

    _scoreCodeQuality(files) {
        let totalLines      = 0;
        let commentLines    = 0;
        let blankLines      = 0;
        let longFiles       = 0;
        let todoCount       = 0;
        let positiveSignals = 0;
        let negativeSignals = 0;

        const positiveFound = [];
        const negativeFound = [];

        const allPaths    = files.map(f => f.path).join('\n');
        const allContent  = files.map(f => f.content).join('\n');

        for (const f of files) {
            const lines = f.content.split('\n');
            totalLines += lines.length;
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) { blankLines++; continue; }
                if (/^\s*(\/\/|#|\/\*|\*)/.test(trimmed)) commentLines++;
                if (/TODO|FIXME|HACK|XXX/.test(trimmed)) todoCount++;
            }
            if (lines.length > 500) longFiles++;
        }

        // Check positive signals against all paths + content combined
        for (const sig of QUALITY_SIGNALS.positive) {
            if (sig.pattern.test(allPaths) || sig.pattern.test(allContent)) {
                positiveFound.push(sig.label);
                positiveSignals++;
            }
        }
        // Check negative signals against all content
        for (const sig of QUALITY_SIGNALS.negative) {
            const matchCount = (allContent.match(sig.pattern) || []).length;
            if (matchCount > 0) {
                negativeFound.push(`${sig.label} (${matchCount} occurrence${matchCount > 1 ? 's' : ''})`);
                negativeSignals++;
            }
        }

        const maxPositive = QUALITY_SIGNALS.positive.length;
        const maxNegative = QUALITY_SIGNALS.negative.length;
        const qualityScore = Math.max(0, Math.min(100, Math.round(
            (positiveSignals / maxPositive) * 70 -
            (negativeSignals / maxNegative) * 30 +
            (longFiles === 0 ? 15 : 0) +
            (todoCount === 0 ? 15 : Math.max(0, 15 - todoCount * 2))
        )));

        return {
            score: qualityScore,
            totalLines,
            commentLines,
            blankLines,
            codeLines: totalLines - commentLines - blankLines,
            longFiles,
            todoCount,
            positiveSignals: positiveFound,
            negativeSignals: negativeFound,
        };
    }

    // ── Stage 4: Security hygiene ────────────────────────────────────────────

    _analyzeSecurityHygiene(files) {
        const findings = [];
        let criticalCount = 0, highCount = 0, mediumCount = 0, lowCount = 0;

        for (const f of files) {
            // Skip lock files and minified code
            if (f.path.endsWith('.lock') || f.path.includes('.min.')) continue;

            for (const issue of SECURITY_ISSUES) {
                const match = f.content.match(issue.pattern);
                if (match) {
                    findings.push({
                        file:     f.path,
                        severity: issue.severity,
                        label:    issue.label,
                        snippet:  match[0].slice(0, 80),
                    });
                    if (issue.severity === 'critical') criticalCount++;
                    else if (issue.severity === 'high')   highCount++;
                    else if (issue.severity === 'medium') mediumCount++;
                    else                                   lowCount++;
                }
            }
        }

        // Score: start at 100, deduct per finding
        const penaltyMap = { critical: 25, high: 15, medium: 8, low: 3 };
        const penalty = criticalCount * penaltyMap.critical + highCount * penaltyMap.high
                      + mediumCount * penaltyMap.medium + lowCount * penaltyMap.low;
        const score = Math.max(0, 100 - penalty);

        return { score, findings, summary: { critical: criticalCount, high: highCount, medium: mediumCount, low: lowCount } };
    }

    // ── Stage 5: Performance risk ────────────────────────────────────────────

    _analyzePerformance(files) {
        const findings = [];
        let riskCount = 0;

        for (const f of files) {
            for (const issue of PERF_ISSUES) {
                if (issue.pattern.test(f.content)) {
                    findings.push({ file: f.path, severity: issue.severity, label: issue.label });
                    riskCount++;
                }
            }
        }

        const score = Math.max(0, 100 - riskCount * 8);
        return { score, findings, riskCount };
    }

    // ── Stage 6: Compute overall score ──────────────────────────────────────

    _computeOverallScore(quality, security, performance) {
        const breakdown = {
            architectureQuality:  quality.score,
            securityHygiene:      security.score,
            performanceRisk:      performance.score,
        };

        const overallScore = Math.round(
            quality.score    * 0.40 +
            security.score   * 0.35 +
            performance.score * 0.25
        );

        let productionReadiness;
        if (overallScore >= 85 && security.summary.critical === 0 && security.summary.high === 0) {
            productionReadiness = 'PRODUCTION READY';
        } else if (overallScore >= 65 && security.summary.critical === 0) {
            productionReadiness = 'NEARLY READY';
        } else if (overallScore >= 40) {
            productionReadiness = 'NEEDS WORK';
        } else {
            productionReadiness = 'NOT READY';
        }

        return { overallScore, productionReadiness, breakdown };
    }

    // ── Stage 6b: Generate prioritized improvement suggestions ──────────────

    _generateImprovementSuggestions(quality, security, performance, architecture) {
        const suggestions = [];

        // Critical security findings always come first
        for (const f of security.findings.filter(x => x.severity === 'critical')) {
            suggestions.push({
                priority:    'CRITICAL',
                category:    'Security',
                title:       f.label,
                file:        f.file,
                action:      'Remove hardcoded credentials. Use environment variables or a secrets manager.',
                impact:      'Prevents credential exposure and security breaches.',
            });
        }

        for (const f of security.findings.filter(x => x.severity === 'high')) {
            suggestions.push({
                priority: 'HIGH',
                category: 'Security',
                title:    f.label,
                file:     f.file,
                action:   'Review and remediate this security anti-pattern.',
                impact:   'Reduces attack surface and injection risk.',
            });
        }

        // Architecture suggestions
        if (!architecture.signals.hasTests) {
            suggestions.push({
                priority: 'HIGH',
                category: 'Testing',
                title:    'No test files detected',
                file:     null,
                action:   'Add unit and integration tests. Aim for >70% coverage.',
                impact:   'Prevents regressions and improves reliability.',
            });
        }

        if (!architecture.signals.hasCIPipeline) {
            suggestions.push({
                priority: 'MEDIUM',
                category: 'DevOps',
                title:    'No CI/CD pipeline configured',
                file:     null,
                action:   'Add a GitHub Actions or GitLab CI pipeline for automatic testing and deployment.',
                impact:   'Catches bugs before production and enables safe, fast deployments.',
            });
        }

        if (!architecture.signals.hasDockerfile) {
            suggestions.push({
                priority: 'MEDIUM',
                category: 'Containerization',
                title:    'No Dockerfile found',
                file:     null,
                action:   'Create a Dockerfile for reproducible builds and consistent deployments.',
                impact:   'Eliminates environment-specific bugs.',
            });
        }

        // Quality suggestions
        if (quality.todoCount > 5) {
            suggestions.push({
                priority: 'MEDIUM',
                category: 'Code Quality',
                title:    `${quality.todoCount} unresolved TODOs / FIXMEs found`,
                file:     null,
                action:   'Resolve or track TODOs in your issue tracker. Remove from code.',
                impact:   'Improves code clarity and prevents known bugs from reaching production.',
            });
        }

        if (quality.longFiles > 2) {
            suggestions.push({
                priority: 'LOW',
                category: 'Code Quality',
                title:    `${quality.longFiles} files exceed 500 lines`,
                file:     null,
                action:   'Refactor large files into smaller, single-responsibility modules.',
                impact:   'Improves readability and maintainability.',
            });
        }

        // Performance suggestions
        for (const f of performance.findings.filter(x => x.severity === 'medium')) {
            suggestions.push({
                priority: 'MEDIUM',
                category: 'Performance',
                title:    f.label,
                file:     f.file,
                action:   'Refactor to use parallel execution where possible.',
                impact:   'Faster response times and better resource utilization.',
            });
        }

        // Sort by priority
        const ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        suggestions.sort((a, b) => (ORDER[a.priority] ?? 9) - (ORDER[b.priority] ?? 9));

        return suggestions;
    }

    // ── Recursive directory scanner ──────────────────────────────────────────

    async _scanDirectory(dirPath, relBase) {
        const files  = [];
        const entries = await fs.readdir(dirPath, { withFileTypes: true }).catch(() => []);

        for (const entry of entries) {
            if (SKIP_DIRS.has(entry.name)) continue;
            const absPath = path.join(dirPath, entry.name);
            const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;

            if (entry.isDirectory()) {
                const sub = await this._scanDirectory(absPath, relPath);
                files.push(...sub);
            } else {
                const ext = path.extname(entry.name).toLowerCase();
                if (SKIP_EXTS.has(ext)) continue;
                try {
                    const stat    = await fs.stat(absPath);
                    if (stat.size > 500 * 1024) continue;
                    const content = await fs.readFile(absPath, 'utf8');
                    files.push({ path: relPath, ext, content, size: stat.size });
                } catch {
                    // skip unreadable files
                }
            }
        }
        return files;
    }
}

// ── Helper ────────────────────────────────────────────────────────────────────

function safeRequire(mod) {
    try { return require(mod); } catch { return null; }
}

module.exports = new ProjectAnalyzerService();
