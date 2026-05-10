'use strict';

/**
 * =========================================================
 * STATIC ANALYZER — Real Code Quality Engine
 * =========================================================
 * Performs deep static analysis on source files:
 * - Security vulnerability detection
 * - Architecture quality scoring
 * - Maintainability analysis
 * - Performance patterns
 * - Reliability indicators
 * - Technical debt estimation
 * =========================================================
 */

const CODE_EXTS = new Set([
  'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cs', 'rb', 'go',
  'php', 'cpp', 'c', 'rs', 'vue', 'svelte',
]);

function isCodeFile(f) {
  const ext = getExt(f.file_name);
  return CODE_EXTS.has(ext) && f.file_content && !f.file_content.startsWith('[binary');
}

function getExt(fileName) {
  if (!fileName) return '';
  const dot = fileName.lastIndexOf('.');
  return dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : '';
}

function getLines(content) {
  return (content || '').split('\n');
}

// ─── Security Analysis ────────────────────────────────────────────────────────

const SECURITY_PATTERNS = [
  {
    id: 'hardcoded_secret',
    severity: 'critical',
    pattern: /(?:api[_-]?key|secret[_-]?key|api[_-]?secret|auth[_-]?token|access[_-]?token)\s*[:=]\s*['"`][a-zA-Z0-9_\-\.]{12,}/i,
    message: 'Hardcoded API key or secret detected',
  },
  {
    id: 'hardcoded_password',
    severity: 'critical',
    pattern: /password\s*[:=]\s*['"`][^'"`\s]{4,}/i,
    message: 'Hardcoded password value detected',
  },
  {
    id: 'eval_usage',
    severity: 'high',
    pattern: /\beval\s*\(/,
    message: 'Use of eval() is a security risk — enables arbitrary code execution',
  },
  {
    id: 'inner_html',
    severity: 'medium',
    pattern: /\.innerHTML\s*=/,
    message: 'Direct innerHTML assignment — potential XSS vulnerability',
  },
  {
    id: 'document_write',
    severity: 'medium',
    pattern: /document\.write\s*\(/,
    message: 'document.write() usage — potential XSS risk',
  },
  {
    id: 'sql_concatenation',
    severity: 'high',
    pattern: /(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE).{0,60}\+\s*(?:req\.|user\.|params\.|body\.|query\.)/i,
    message: 'Possible SQL injection via string concatenation',
  },
  {
    id: 'no_https',
    severity: 'low',
    pattern: /http:\/\/(?!localhost)[a-z0-9]/i,
    message: 'Non-HTTPS URL detected in source',
  },
  {
    id: 'console_log_sensitive',
    severity: 'low',
    pattern: /console\.log\s*\(.*(?:password|token|secret|key|auth)/i,
    message: 'Sensitive data potentially logged to console',
  },
  {
    id: 'jwt_secret_weak',
    severity: 'medium',
    pattern: /jwt\.sign\s*\(.*['"`](?:secret|key|password|12345|dev|development)['"`]/i,
    message: 'Weak or default JWT secret detected',
  },
  {
    id: 'cors_wildcard',
    severity: 'medium',
    pattern: /cors\s*\(\s*\{[^}]*origin\s*:\s*['"`]\*['"`]/,
    message: 'CORS wildcard (*) origin — too permissive for production',
  },
  {
    id: 'localstorage_sensitive',
    severity: 'medium',
    pattern: /localStorage\.setItem\s*\(.*(?:password|token|secret)/i,
    message: 'Sensitive data stored in localStorage — use HttpOnly cookies instead',
  },
  {
    id: 'exec_usage',
    severity: 'high',
    pattern: /(?:child_process|exec|spawn|execSync)\s*\(.*(?:req\.|body\.|params\.)/i,
    message: 'Shell command execution with user input — command injection risk',
  },
];

function analyzeSecurityForFile(file) {
  const issues = [];
  const lines = getLines(file.file_content);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const rule of SECURITY_PATTERNS) {
      if (rule.pattern.test(line)) {
        issues.push({
          rule: rule.id,
          severity: rule.severity,
          message: rule.message,
          file: file.file_path,
          line: i + 1,
          snippet: line.trim().substring(0, 100),
        });
      }
    }
  }

  return issues;
}

// ─── Architecture Analysis ────────────────────────────────────────────────────

function analyzeArchitecture(files, structure, techStack) {
  const codeFiles = files.filter(isCodeFile);
  const issues = [];
  const strengths = [];
  let score = 70;

  // Check folder organization
  const paths = files.map(f => f.file_path || '');
  const hasComponents = paths.some(p => p.toLowerCase().includes('/components/'));
  const hasPages = paths.some(p => p.toLowerCase().includes('/pages/') || p.toLowerCase().includes('/app/') || p.toLowerCase().includes('/views/'));
  const hasServices = paths.some(p => p.toLowerCase().includes('/services/') || p.toLowerCase().includes('/lib/') || p.toLowerCase().includes('/utils/'));
  const hasControllers = paths.some(p => p.toLowerCase().includes('/controllers/'));
  const hasModels = paths.some(p => p.toLowerCase().includes('/models/'));
  const hasRoutes = paths.some(p => p.toLowerCase().includes('/routes/'));
  const hasHooks = paths.some(p => p.toLowerCase().includes('/hooks/'));
  const hasMiddleware = paths.some(p => p.toLowerCase().includes('/middleware/'));
  const hasPrisma = paths.some(p => p.toLowerCase().includes('prisma/'));

  // Bonuses
  if (hasComponents) { score += 5; strengths.push('Component-based architecture with dedicated components directory'); }
  if (hasPages) { score += 3; strengths.push('Clear page/view separation follows routing conventions'); }
  if (hasServices) { score += 5; strengths.push('Service layer abstraction separates business logic'); }
  if (hasControllers && hasRoutes) { score += 8; strengths.push('MVC-style separation with controllers and routes'); }
  if (hasModels) { score += 4; strengths.push('Data model layer properly isolated'); }
  if (hasHooks) { score += 4; strengths.push('Custom hooks pattern promotes logic reusability'); }
  if (hasMiddleware) { score += 3; strengths.push('Middleware architecture for cross-cutting concerns'); }
  if (hasPrisma) { score += 3; strengths.push('Type-safe ORM layer with Prisma schema'); }
  if (structure.hasTests) { score += 10; strengths.push('Test suite present — quality gate is established'); }
  if (structure.hasDocker) { score += 5; strengths.push('Docker containerization ensures deployment consistency'); }
  if (structure.hasCI) { score += 5; strengths.push('CI/CD pipeline automates quality checks'); }
  if (structure.hasReadme) { score += 3; strengths.push('README documentation improves onboarding'); }

  // Deductions
  if (structure.largeFiles.length > 0) {
    score -= Math.min(15, structure.largeFiles.length * 3);
    issues.push(`${structure.largeFiles.length} oversized files detected (>300 lines) — split into smaller modules`);
  }
  if (!hasComponents && !hasPages && structure.totalFiles > 10) {
    score -= 8;
    issues.push('No clear folder organization detected — consider components/pages/services structure');
  }
  if (!structure.hasTests && structure.totalFiles > 5) {
    score -= 10;
    issues.push('No test files found — add unit tests to prevent regressions');
  }
  if (!structure.hasDocker && structure.totalFiles > 15) {
    score -= 5;
    issues.push('No Docker configuration — containerization improves deployment reliability');
  }
  if (structure.maxDepth > 8) {
    score -= 5;
    issues.push(`Deep nesting detected (${structure.maxDepth} levels) — flatten structure for maintainability`);
  }

  // Check for circular-import risk indicators in large file clusters
  const jsFiles = codeFiles.filter(f => ['js','jsx','ts','tsx'].includes(getExt(f.file_name)));
  const duplicateImports = detectDuplicatePatterns(jsFiles);
  if (duplicateImports > 3) {
    score -= 8;
    issues.push(`${duplicateImports} duplicate code patterns detected — extract shared utilities`);
  }

  const modularityLevel = score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low';

  return {
    architectureScore: Math.max(10, Math.min(100, Math.round(score))),
    modularityLevel,
    strengths,
    weaknesses: issues,
    hasComponents, hasPages, hasServices, hasControllers, hasModels,
    hasHooks, hasMiddleware, hasTests: structure.hasTests,
  };
}

function detectDuplicatePatterns(jsFiles) {
  // Count files with very similar import sets (simplified heuristic)
  const importSets = jsFiles.map(f => {
    const imports = (f.file_content || '').match(/(?:import|require)\s*\([^)]+\)|import\s+[^;]+from\s+['"][^'"]+['"]/g) || [];
    return new Set(imports.map(i => i.trim()));
  });

  let duplicateScore = 0;
  for (let i = 0; i < importSets.length; i++) {
    for (let j = i + 1; j < Math.min(importSets.length, i + 10); j++) {
      const a = importSets[i];
      const b = importSets[j];
      const intersection = [...a].filter(x => b.has(x)).length;
      const union = new Set([...a, ...b]).size;
      if (union > 0 && intersection / union > 0.8 && a.size > 3) {
        duplicateScore++;
      }
    }
  }
  return duplicateScore;
}

// ─── Maintainability Analysis ─────────────────────────────────────────────────

function analyzeMaintainability(files, structure) {
  const codeFiles = files.filter(isCodeFile);
  let score = 65;
  const issues = [];
  const strengths = [];

  // Check for TypeScript (major maintainability boost)
  const hasTS = files.some(f => ['ts', 'tsx'].includes(getExt(f.file_name)));
  if (hasTS) { score += 15; strengths.push('TypeScript provides compile-time type safety and self-documentation'); }

  // README and documentation
  if (structure.hasReadme) { score += 5; strengths.push('README provides project context'); }

  // Config and environment management
  if (structure.hasDotEnv) { score += 5; strengths.push('.env.example documents required configuration'); }

  // Large functions detection
  let largeFunctionCount = 0;
  let totalFunctions = 0;
  let commentRatio = 0;
  let totalCodeLines = 0;
  let totalCommentLines = 0;

  for (const f of codeFiles.slice(0, 30)) { // sample up to 30 files
    const lines = getLines(f.file_content);
    let inFunction = false;
    let funcLineCount = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      // Simple comment counting
      if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('*')) {
        totalCommentLines++;
      }
      totalCodeLines++;

      // Function detection (simplified)
      if (/(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\(|=>\s*\{|\bdef\s+\w+)/.test(trimmed)) {
        totalFunctions++;
        if (inFunction && funcLineCount > 50) largeFunctionCount++;
        inFunction = true;
        funcLineCount = 0;
      }
      if (inFunction) funcLineCount++;
    }
  }

  commentRatio = totalCodeLines > 0 ? totalCommentLines / totalCodeLines : 0;

  if (commentRatio > 0.15) { score += 8; strengths.push('Good code documentation with comments'); }
  if (largeFunctionCount > 5) {
    score -= Math.min(15, largeFunctionCount * 2);
    issues.push(`${largeFunctionCount} large functions detected (>50 lines) — refactor into smaller units`);
  }
  if (structure.largeFiles.length > 3) {
    score -= 8;
    issues.push(`${structure.largeFiles.length} oversized files — aim for files under 200 lines`);
  }

  if (structure.hasTests) { score += 12; }

  const duplicationRisk = score < 55 ? 'High' : score < 70 ? 'Medium' : 'Low';

  return {
    maintainabilityScore: Math.max(10, Math.min(100, Math.round(score))),
    duplicationRisk,
    largeFunctionCount,
    commentRatio: Math.round(commentRatio * 100),
    hasTypeScript: hasTS,
    strengths,
    issues,
    readabilityAssessment: score >= 75
      ? 'Code is generally readable and follows consistent patterns'
      : score >= 55
        ? 'Code readability is moderate — improve naming conventions and add comments'
        : 'Code readability needs significant improvement — add documentation and refactor complex functions',
  };
}

// ─── Performance Analysis ─────────────────────────────────────────────────────

function analyzePerformance(files, techStack) {
  let score = 70;
  const issues = [];
  const strengths = [];
  const techNames = techStack.map(t => t.name);

  for (const f of files.filter(isCodeFile)) {
    const c = f.file_content || '';

    if (/SELECT \*/i.test(c)) {
      score -= 3;
      issues.push({ file: f.file_path, issue: 'SELECT * query — fetch only required columns' });
    }
    if (/setInterval\s*\(.*,\s*(?:[1-9]\d{0,2})\s*\)/.test(c)) {
      issues.push({ file: f.file_path, issue: 'Short setInterval detected — may cause performance issues' });
    }
    if (/for\s*\(.*\.length/.test(c)) {
      score -= 1;
    }
    // N+1 query risk
    if (/\.map\s*\([^)]+\)\s*\.then|await.*\.map\s*\(/.test(c)) {
      score -= 3;
      issues.push({ file: f.file_path, issue: 'Possible N+1 query pattern — use batch loading' });
    }
    // Missing memoization
    if (/useEffect\s*\(/.test(c) && !/useMemo|useCallback/.test(c) && /\.map\s*\(/.test(c)) {
      score -= 2;
      issues.push({ file: f.file_path, issue: 'Heavy computations in render without useMemo/useCallback' });
    }
  }

  if (techNames.includes('Redis')) { score += 8; strengths.push('Redis caching layer for improved response times'); }
  if (techNames.includes('Vite')) { score += 5; strengths.push('Vite provides fast build times and HMR'); }
  if (techNames.includes('TanStack Query')) { score += 5; strengths.push('TanStack Query handles caching and deduplication automatically'); }

  // Unique issues only
  const uniqueIssues = [...new Map(issues.map(i => [i.issue, i])).values()].slice(0, 5);

  return {
    performanceScore: Math.max(10, Math.min(100, Math.round(score))),
    scalingRiskLevel: score >= 75 ? 'Low' : score >= 55 ? 'Medium' : 'High',
    bottleneckIssues: uniqueIssues,
    strengths,
    estimatedRiskAtScale: {
      '10k': score >= 70 ? 'Moderate — should handle with current architecture' : 'High — requires optimization before scaling',
      '100k': score >= 80 ? 'Manageable with horizontal scaling' : 'Significant risk — requires caching, CDN, and DB optimization',
    },
  };
}

// ─── Reliability Analysis ─────────────────────────────────────────────────────

function analyzeReliability(files, structure, techStack) {
  let score = 55;
  const issues = [];
  const techNames = techStack.map(t => t.name);

  if (structure.hasTests) {
    score += 20;
  } else {
    issues.push('No test coverage detected — add unit and integration tests');
  }

  // Check error handling
  let hasTryCatch = false;
  let hasErrorMiddleware = false;
  let hasInputValidation = false;

  for (const f of files.filter(isCodeFile)) {
    const c = f.file_content || '';
    if (/try\s*\{/.test(c)) hasTryCatch = true;
    if (/error.*middleware|app\.use\s*\(.*err|next\s*\(\s*err/.test(c)) hasErrorMiddleware = true;
    if (/joi\.|zod\.|yup\.|express-validator|body\s*\(.*required/.test(c)) hasInputValidation = true;
  }

  if (hasTryCatch) { score += 8; }
  else { issues.push('Missing try/catch error handling in critical paths'); }

  if (hasErrorMiddleware) { score += 7; }
  else if (techNames.includes('Express.js')) { issues.push('No Express error handling middleware detected'); }

  if (hasInputValidation) { score += 5; }
  else { issues.push('No input validation library detected — add Zod or Joi for runtime safety'); }

  if (techNames.includes('Testing (Jest/Vitest)')) { score += 5; }

  return {
    reliabilityScore: Math.max(10, Math.min(100, Math.round(score))),
    hasTests: structure.hasTests,
    hasTryCatch,
    hasErrorMiddleware,
    hasInputValidation,
    testCoverageEstimate: structure.hasTests ? 'Partial coverage detected' : 'No tests found',
    errorHandlingQuality: hasTryCatch && hasErrorMiddleware ? 'Good' : hasTryCatch ? 'Basic' : 'Needs improvement',
    loggingQuality: files.some(f => (f.file_content || '').includes('console.log') || (f.file_content || '').includes('winston') || (f.file_content || '').includes('pino')) ? 'Present' : 'Not detected',
    issues,
  };
}

// ─── Overall scoring ──────────────────────────────────────────────────────────

function computeOverallScore(security, architecture, maintainability, performance, reliability) {
  // Weighted average
  return Math.round(
    security.securityScore     * 0.25 +
    architecture.architectureScore * 0.25 +
    maintainability.maintainabilityScore * 0.20 +
    performance.performanceScore  * 0.15 +
    reliability.reliabilityScore  * 0.15
  );
}

// ─── Main analysis function ───────────────────────────────────────────────────

function analyze(files, parsed) {
  const techStack = parsed?.techStack || [];
  const structure = parsed?.structure || { totalFiles: 0, totalLines: 0, languages: [] };

  // Security issues
  const allSecurityIssues = [];
  for (const f of files.filter(isCodeFile)) {
    allSecurityIssues.push(...analyzeSecurityForFile(f));
  }

  const criticalIssues = allSecurityIssues.filter(i => i.severity === 'critical');
  const highIssues = allSecurityIssues.filter(i => i.severity === 'high');
  const mediumIssues = allSecurityIssues.filter(i => i.severity === 'medium');
  const lowIssues = allSecurityIssues.filter(i => i.severity === 'low');

  let secScore = 90;
  secScore -= criticalIssues.length * 20;
  secScore -= highIssues.length * 10;
  secScore -= mediumIssues.length * 5;
  secScore -= lowIssues.length * 2;

  const security = {
    securityScore: Math.max(10, Math.min(100, Math.round(secScore))),
    criticalIssues: criticalIssues.slice(0, 5),
    highIssues: highIssues.slice(0, 5),
    mediumIssues: mediumIssues.slice(0, 8),
    totalIssues: allSecurityIssues.length,
    securitySummary: criticalIssues.length > 0
      ? `${criticalIssues.length} critical security issue(s) found — immediate remediation required`
      : highIssues.length > 0
        ? `${highIssues.length} high-severity security concern(s) detected`
        : allSecurityIssues.length === 0
          ? 'No obvious security vulnerabilities detected in static scan'
          : `${allSecurityIssues.length} minor security suggestions available`,
  };

  const architecture   = analyzeArchitecture(files, structure, techStack);
  const maintainability = analyzeMaintainability(files, structure);
  const performance    = analyzePerformance(files, techStack);
  const reliability    = analyzeReliability(files, structure, techStack);

  const overallScore = computeOverallScore(security, architecture, maintainability, performance, reliability);
  const technicalDebtScore = Math.round(100 - overallScore);
  const refactorEffort = overallScore >= 75 ? 'Low' : overallScore >= 55 ? 'Medium' : 'High';

  return {
    overallScore,
    security,
    architecture,
    maintainability,
    performance,
    reliability,
    technicalDebtScore,
    refactorEffortEstimate: refactorEffort,
    systemComplexityIndex: Math.round((100 - maintainability.maintainabilityScore + structure.maxDepth * 2) / 2),
    totalIssuesFound: allSecurityIssues.length + architecture.weaknesses.length + maintainability.issues.length,
  };
}

module.exports = { analyze };
