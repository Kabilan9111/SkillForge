'use strict';

/**
 * ============================================================
 * ENTERPRISE STATIC CODE ANALYZER  v2.0
 * ============================================================
 * 6-layer analysis: Security · Architecture · Maintainability
 *                   Performance · Reliability · Production Readiness
 * + Bonus: Technical Debt · Refactor Effort · System Complexity
 *
 * Supports: JS/TS/JSX/TSX, Python, Java, C/C++, Go, Ruby, Rust,
 *           PHP, C#, Kotlin, Swift, Scala
 * No external API dependencies — pure static analysis.
 * ============================================================
 */

const CODE_EXTS = new Set([
  'js', 'jsx', 'ts', 'tsx',
  'py', 'java', 'cs', 'rb',
  'go', 'php', 'cpp', 'c',
  'rs', 'kt', 'swift', 'scala'
]);

// === MAIN ENTRY =============================================================
function analyze(files) {
  const allFiles = files || [];
  const codeFiles = allFiles.filter(f => {
    const ext = (f.file_type || (f.file_path || '').split('.').pop() || '').toLowerCase();
    return CODE_EXTS.has(ext) && f.file_content && !f.file_content.startsWith('[binary');
  });

  const totalFiles    = allFiles.length;
  const codeFileCount = codeFiles.length;
  const totalLines    = codeFiles.reduce((s, f) => s + countLines(f.file_content), 0);

  const langMap = {};
  codeFiles.forEach(f => {
    const ext = (f.file_type || (f.file_path || '').split('.').pop() || 'unknown').toLowerCase();
    langMap[ext] = (langMap[ext] || 0) + 1;
  });
  const languages = Object.entries(langMap)
    .map(([lang, count]) => ({ lang, count }))
    .sort((a, b) => b.count - a.count);

  const securityLayer       = analyzeSecurityLayer(codeFiles);
  const architectureLayer   = analyzeArchitectureLayer(allFiles, codeFiles);
  const maintainability     = analyzeMaintainabilityLayer(codeFiles);
  const performance         = analyzePerformanceLayer(codeFiles);
  const reliability         = analyzeReliabilityLayer(allFiles, codeFiles);
  const productionReadiness = computeProductionReadiness(
    securityLayer, architectureLayer, maintainability, performance, reliability
  );
  const technicalDebtScore     = computeTechnicalDebt(securityLayer, maintainability, architectureLayer);
  const refactorEffortEstimate = computeRefactorEffort(technicalDebtScore, codeFileCount, totalLines);
  const systemComplexityIndex  = computeSystemComplexity(codeFiles, maintainability, architectureLayer);

  return {
    security:          securityLayer,
    architecture:      architectureLayer,
    maintainability,
    performance,
    reliability,
    productionReadiness,
    technicalDebtScore,
    refactorEffortEstimate,
    systemComplexityIndex,
    overallScore: productionReadiness.productionReadinessIndex,
    details: { fileCount: totalFiles, codeFileCount, totalLines, languages }
  };
}

// === UTILITIES ==============================================================
function countLines(content) { return content ? content.split('\n').length : 0; }
function clampScore(n) { return Math.max(0, Math.min(100, Math.round(n))); }
function getExt(file) {
  return (file.file_type || (file.file_path || '').split('.').pop() || '').toLowerCase();
}
function lineNumbers(content, re) {
  const hits = [];
  content.split('\n').forEach((line, i) => { if (re.test(line)) hits.push(i + 1); });
  return hits;
}

// === LAYER 1 — SECURITY =====================================================
const SEC_CRITICAL = [
  { re: /password\s*[=:]\s*["'][^"']{3,}/i,               issue: 'Hardcoded password' },
  { re: /api[_-]?key\s*[=:]\s*["'][a-zA-Z0-9_\-]{10,}/i,  issue: 'Hardcoded API key' },
  { re: /secret\s*[=:]\s*["'][^"']{8,}/i,                 issue: 'Hardcoded secret' },
  { re: /\beval\s*\(/,                                     issue: 'eval() arbitrary code execution' },
  { re: /exec\s*\(\s*[`"'].*\$\{/,                         issue: 'Shell injection via template literal' },
  { re: /token\s*[=:]\s*["'][a-zA-Z0-9_\-\.]{20,}/i,      issue: 'Hardcoded token' },
];
const SEC_HIGH = [
  { re: /innerHTML\s*=[^=]/,                               issue: 'innerHTML assignment — XSS risk' },
  { re: /document\.write\s*\(/,                            issue: 'document.write() — XSS risk' },
  { re: /pickle\.loads\s*\(/,                              issue: 'pickle.loads() — unsafe deserialization' },
  { re: /password.*query|query.*password/i,                issue: 'Password in DB query — SQL injection risk' },
  { re: /dangerouslySetInnerHTML/,                         issue: 'dangerouslySetInnerHTML — XSS risk (React)' },
  { re: /subprocess\.call\s*\(.*shell\s*=\s*True/,        issue: 'subprocess shell=True — command injection' },
  { re: /Runtime\.getRuntime\(\)\.exec\(/,                 issue: 'Runtime.exec() — command injection (Java)' },
];
const SEC_MEDIUM = [
  { re: /md5\s*\(|sha1\s*\(/i,                             issue: 'Weak hash: MD5/SHA-1 — use SHA-256 or bcrypt' },
  { re: /process\.env\.\w+\s*\|\|\s*["'][a-zA-Z0-9]{4,}/, issue: 'Env var with hardcoded insecure fallback' },
  { re: /cors[^)]*origin\s*:\s*['"`]\*/,                   issue: 'CORS wildcard origin — allows all domains' },
  { re: /Math\.random\(\)/,                                issue: 'Math.random() — not cryptographically secure' },
  { re: /http:\/\/(?!localhost|127\.0\.0\.1|::1)/,         issue: 'Non-HTTPS external URL' },
  { re: /setTimeout\s*\(\s*["'`]/,                         issue: 'String passed to setTimeout — eval-equivalent' },
];

function analyzeSecurityLayer(codeFiles) {
  const criticalIssues = [], highIssues = [], mediumIssues = [];
  codeFiles.forEach(f => {
    const content = f.file_content || '';
    const fileRef = f.file_path || f.file_name || 'unknown';
    SEC_CRITICAL.forEach(({ re, issue }) => {
      lineNumbers(content, re).forEach(line => criticalIssues.push({ file: fileRef, line, issue }));
    });
    SEC_HIGH.forEach(({ re, issue }) => {
      const lines = lineNumbers(content, re);
      if (lines.length) highIssues.push({ file: fileRef, line: lines[0], issue, occurrences: lines.length });
    });
    SEC_MEDIUM.forEach(({ re, issue }) => {
      if (re.test(content)) mediumIssues.push({ file: fileRef, issue });
    });
  });

  const securityScore = clampScore(
    100 - criticalIssues.length * 28 - highIssues.length * 14 - mediumIssues.length * 6
  );
  let securitySummary;
  if (criticalIssues.length > 0)
    securitySummary = `${criticalIssues.length} critical vulnerability(ies) — hardcoded credentials or RCE risk. Remediate before any deployment.`;
  else if (highIssues.length > 0)
    securitySummary = `${highIssues.length} high-severity vulnerability(ies) (XSS/injection). ${mediumIssues.length} medium concern(s). Must fix before production.`;
  else if (mediumIssues.length > 0)
    securitySummary = `No critical/high vulnerabilities. ${mediumIssues.length} medium concern(s) to resolve before production.`;
  else
    securitySummary = 'No security vulnerabilities detected. Passes baseline security checks.';

  return {
    securityScore,
    criticalIssues: criticalIssues.slice(0, 10),
    highIssues:     highIssues.slice(0, 10),
    mediumIssues:   mediumIssues.slice(0, 10),
    securitySummary
  };
}

// === LAYER 2 — ARCHITECTURE =================================================
function analyzeArchitectureLayer(allFiles, codeFiles) {
  const paths = allFiles.map(f => (f.file_path || '').toLowerCase());
  const hasFolders   = paths.some(p => p.includes('/'));
  const hasSrcDir    = paths.some(p => p.startsWith('src/') || p.includes('/src/'));
  const hasLayerSep  = paths.some(p => /\/(controllers?|services?|models?|routes?|helpers?|utils?|middleware)\//i.test(p));
  const hasCI        = paths.some(p => /\.github|ci\.yml|\.travis|jenkins/i.test(p));
  const hasConfig    = paths.some(p => /package\.json|requirements\.txt|pom\.xml|go\.mod|cargo\.toml|gemfile/i.test(p));
  const maxDepth     = paths.reduce((m, p) => Math.max(m, p.split('/').length - 1), 0);
  const godFiles     = codeFiles.filter(f => countLines(f.file_content) > 300);
  const godFileCount = godFiles.length;
  const couplingRisk = codeFiles.length > 0 ? parseFloat((godFileCount / codeFiles.length).toFixed(2)) : 0;

  let modularityLevel = 'Low';
  if (hasSrcDir && hasLayerSep && godFileCount === 0) modularityLevel = 'High';
  else if (hasFolders && godFileCount <= 2)            modularityLevel = 'Medium';

  let architectureScore = 50;
  if (hasFolders)  architectureScore += 10;
  if (hasSrcDir)   architectureScore += 10;
  if (hasLayerSep) architectureScore += 15;
  if (hasConfig)   architectureScore += 5;
  if (hasCI)       architectureScore += 5;
  architectureScore -= Math.min(30, Math.round(couplingRisk * 40));  // coupling ratio penalty, capped at 30
  architectureScore  = clampScore(architectureScore);

  const architecturalWeaknesses = [];
  if (godFileCount > 0)    architecturalWeaknesses.push(`${godFileCount} God file(s) >300 lines — violates Single Responsibility`);
  if (!hasLayerSep)        architecturalWeaknesses.push('No controllers/services/models layer separation detected');
  if (!hasSrcDir && codeFiles.length > 5) architecturalWeaknesses.push('Source files scattered in root — no src/ directory');
  if (!hasCI)              architecturalWeaknesses.push('No CI/CD pipeline configuration detected');
  if (maxDepth > 6)        architecturalWeaknesses.push(`Excessive folder nesting depth: ${maxDepth} levels`);

  const refactorRecommendations = [];
  if (godFileCount > 0)    refactorRecommendations.push('Break God files into focused, single-responsibility modules');
  if (!hasLayerSep)        refactorRecommendations.push('Introduce controllers / services / models separation');
  if (!hasSrcDir)          refactorRecommendations.push('Reorganize source files under a src/ directory');
  if (!hasCI)              refactorRecommendations.push('Add GitHub Actions for automated testing and linting on every push');
  refactorRecommendations.push('Apply Dependency Injection to decouple business logic from infrastructure');

  return {
    architectureScore,
    modularityLevel,
    couplingRisk,
    architecturalWeaknesses,
    refactorRecommendations: refactorRecommendations.slice(0, 5)
  };
}

// === LAYER 3 — MAINTAINABILITY ==============================================
const SMELL_PATTERNS = [
  { re: /\/\/\s*TODO\b/i,             smell: 'Unresolved TODO comments' },
  { re: /\/\/\s*FIXME\b/i,           smell: 'FIXME comments (unresolved debt)' },
  { re: /\/\/\s*HACK\b/i,            smell: 'HACK comments (known workarounds)' },
  { re: /\bvar\s+[a-zA-Z_]/,         smell: 'var declarations (prefer let/const)' },
  { re: /[^=!<>]==[^=]/,             smell: 'Loose equality == (prefer ===)' },
  { re: /:\s*any[\s;,)]/,            smell: 'TypeScript :any type annotations' },
  { re: /console\.(log|debug)\s*\(/, smell: 'Debug console.log in production code' },
  { re: /catch\s*\([^)]*\)\s*\{\s*\}/, smell: 'Empty catch blocks (errors swallowed)' },
];

function analyzeMaintainabilityLayer(codeFiles) {
  const codeSmellIndicators = [];
  const smellSeen = new Set();
  codeFiles.forEach(f => {
    SMELL_PATTERNS.forEach(({ re, smell }) => {
      if (!smellSeen.has(smell) && re.test(f.file_content || '')) {
        codeSmellIndicators.push(smell);
        smellSeen.add(smell);
      }
    });
  });

  let largeFunctionCount = 0;
  let totalFunctions = 0;
  codeFiles.forEach(f => {
    const content = f.file_content || '';
    totalFunctions += ((content.match(/function\s+\w+|=>\s*\{|\bdef\s+\w+/g)) || []).length;
    const lines = content.split('\n');
    let depth = 0, fnStart = -1;
    lines.forEach((line, idx) => {
      const opens  = (line.match(/\{/g) || []).length;
      const closes = (line.match(/\}/g) || []).length;
      if (fnStart < 0 && opens > 0) { fnStart = idx; depth = opens - closes; }
      else if (fnStart >= 0) {
        depth += opens - closes;
        if (depth <= 0) { if (idx - fnStart > 50) largeFunctionCount++; fnStart = -1; }
      }
    });
  });

  const totalLines    = codeFiles.reduce((s, f) => s + countLines(f.file_content), 0);
  const commentLines  = codeFiles.reduce((s, f) => {
    return s + (f.file_content || '').split('\n').filter(l => /^\s*(\/\/|#|\/\*|\*|''')/.test(l)).length;
  }, 0);
  const commentRatio  = totalLines > 0 ? commentLines / totalLines : 0;

  const lineCounts = codeFiles.map(f => countLines(f.file_content));
  const buckets = {};
  lineCounts.forEach(n => { const k = Math.floor(n / 15); buckets[k] = (buckets[k] || 0) + 1; });
  const maxBucket = Math.max(...Object.values(buckets), 0);
  const duplicationRisk = maxBucket >= 3 ? 'High' : maxBucket >= 2 ? 'Medium' : 'Low';

  let maintainabilityScore = 75;
  maintainabilityScore -= codeSmellIndicators.length * 5;
  maintainabilityScore -= Math.min(20, largeFunctionCount * 4);
  maintainabilityScore += Math.min(12, Math.round(commentRatio * 50));
  if (duplicationRisk === 'High')   maintainabilityScore -= 10;
  if (duplicationRisk === 'Medium') maintainabilityScore -= 5;
  maintainabilityScore = clampScore(maintainabilityScore);

  let readabilityAssessment;
  if (maintainabilityScore >= 75)      readabilityAssessment = 'Good — generally readable with adequate documentation';
  else if (maintainabilityScore >= 55) readabilityAssessment = 'Moderate — code smells present; refactoring recommended';
  else if (maintainabilityScore >= 35) readabilityAssessment = 'Poor — significant refactoring required for long-term maintainability';
  else                                 readabilityAssessment = 'Critical — codebase is difficult to maintain; immediate action required';

  return { maintainabilityScore, largeFunctionCount, duplicationRisk, codeSmellIndicators, readabilityAssessment };
}

// === LAYER 4 — PERFORMANCE ==================================================
const BOTTLENECK_PATTERNS = [
  { re: /for\s*\([^)]+\)[^{]*\{[^}]*for\s*\(/,         issue: 'Nested loops — O(n²) complexity risk' },
  { re: /\.forEach[^{]*\{[^}]*\.forEach/,               issue: 'Nested forEach — O(n²) iteration' },
  { re: /SELECT\s+\*\s+FROM/i,                          issue: 'SELECT * — expensive at scale' },
  { re: /JSON\.parse\(JSON\.stringify\(/,               issue: 'Deep clone via JSON.parse/stringify — expensive' },
  { re: /while\s*\(\s*true\s*\)/,                       issue: 'while(true) — potential infinite loop' },
  { re: /setInterval\s*\(\s*(function|\()/,             issue: 'setInterval without clearInterval — memory leak risk' },
  { re: /readFileSync|writeFileSync|execSync/,          issue: 'Synchronous I/O — blocks event loop (Node.js)' },
  { re: /\.filter\(.*\)\.map\(|\.map\(.*\)\.filter\(/, issue: 'Chained filter+map — consider single reduce pass' },
];

function analyzePerformanceLayer(codeFiles) {
  const bottleneckIndicators = [];
  const seen = new Set();
  codeFiles.forEach(f => {
    BOTTLENECK_PATTERNS.forEach(({ re, issue }) => {
      if (!seen.has(issue) && re.test(f.file_content || '')) {
        bottleneckIndicators.push(`${issue} [${f.file_path || f.file_name}]`);
        seen.add(issue);
      }
    });
  });

  const scalingRiskLevel = bottleneckIndicators.length >= 4 ? 'High'
                         : bottleneckIndicators.length >= 2 ? 'Medium' : 'Low';

  let performanceScore = 78;
  performanceScore -= bottleneckIndicators.length * 8;
  performanceScore  = clampScore(performanceScore);

  const estimatedRiskAtScale = {
    '10k': scalingRiskLevel === 'Low'
      ? 'Stable — no critical bottlenecks detected'
      : 'Latency degradation expected from identified bottlenecks',
    '100k': bottleneckIndicators.length >= 2
      ? 'High probability of service degradation — bottlenecks must be resolved'
      : 'Manageable with horizontal scaling and connection pooling'
  };

  return { performanceScore, scalingRiskLevel, bottleneckIndicators: bottleneckIndicators.slice(0, 8), estimatedRiskAtScale };
}

// === LAYER 5 — RELIABILITY ==================================================
function analyzeReliabilityLayer(allFiles, codeFiles) {
  const testFiles = allFiles.filter(f =>
    /test|spec|__tests__|_test\.py/i.test(f.file_path || '')
  );
  const hasTests = testFiles.length > 0;

  let tryCatchCount = 0, emptyCatchCount = 0, loggingCount = 0, unhandledPromises = 0;
  codeFiles.forEach(f => {
    const c = f.file_content || '';
    tryCatchCount    += (c.match(/try\s*\{/g) || []).length;
    emptyCatchCount  += (c.match(/catch\s*\([^)]*\)\s*\{\s*\}/g) || []).length;
    unhandledPromises += (c.match(/\.then\((?![^)]*\.catch)/g) || []).length;
    loggingCount     += (c.match(/console\.(error|warn|log|info)|logger\.(error|warn|info)/g) || []).length;
  });

  const totalFns = codeFiles.reduce((s, f) =>
    s + ((f.file_content || '').match(/function\s+\w+|=>\s*\{|\bdef\s+\w+/g) || []).length, 0);

  let errorHandlingQuality;
  if (tryCatchCount === 0)                                 errorHandlingQuality = 'None — no try/catch blocks found';
  else if (emptyCatchCount > tryCatchCount * 0.4)          errorHandlingQuality = 'Poor — majority of catch blocks are empty';
  else if (tryCatchCount >= Math.max(3, totalFns * 0.15)) errorHandlingQuality = 'Comprehensive — consistent error handling';
  else                                                     errorHandlingQuality = 'Partial — error handling present but inconsistent';

  let loggingQuality;
  if (loggingCount === 0)                                  loggingQuality = 'Absent — no logging detected';
  else if (loggingCount < 3)                               loggingQuality = 'Minimal — insufficient for production diagnostics';
  else if (codeFiles.some(f => /logger\./i.test(f.file_content || '')))
                                                           loggingQuality = 'Structured — logger library in use';
  else                                                     loggingQuality = 'Debug-only — console.log; not suitable for production monitoring';

  const testCoverageEstimate = !hasTests ? 'None detected (0%)'
    : testFiles.length === 1 ? '~10-20% estimated (minimal)'
    : testFiles.length <= 3  ? '~25-40% estimated (partial)'
    : '~50%+ estimated (reasonable — run coverage tool to confirm)';

  const reliabilityConcerns = [];
  if (!hasTests)               reliabilityConcerns.push('No test suite — regressions are undetectable');
  if (emptyCatchCount > 0)     reliabilityConcerns.push(`${emptyCatchCount} empty catch block(s) suppressing errors silently`);
  if (unhandledPromises > 0)   reliabilityConcerns.push(`${unhandledPromises} potential unhandled promise(s)`);
  if (loggingQuality === 'Absent') reliabilityConcerns.push('No logging — incidents cannot be diagnosed in production');

  let reliabilityScore = 60;
  if (hasTests)            reliabilityScore += 20;
  reliabilityScore -= emptyCatchCount * 5;
  reliabilityScore -= Math.min(15, unhandledPromises * 3);
  if (loggingQuality.startsWith('Structured')) reliabilityScore += 10;
  if (loggingQuality.startsWith('Absent'))     reliabilityScore -= 10;
  reliabilityScore = clampScore(reliabilityScore);

  return { reliabilityScore, testCoverageEstimate, errorHandlingQuality, loggingQuality, reliabilityConcerns };
}

// === LAYER 6 — PRODUCTION READINESS =========================================
function computeProductionReadiness(security, architecture, maintainability, performance, reliability) {
  const pri = clampScore(
    security.securityScore        * 0.30 +
    architecture.architectureScore * 0.20 +
    maintainability.maintainabilityScore * 0.20 +
    performance.performanceScore   * 0.15 +
    reliability.reliabilityScore   * 0.15
  );

  let deploymentCategory;
  if (security.criticalIssues.length > 0)  deploymentCategory = 'High Risk';
  else if (security.highIssues.length > 0) deploymentCategory = 'Prototype';
  else if (pri >= 78)                       deploymentCategory = 'Production-Ready';
  else if (pri >= 55)                       deploymentCategory = 'Pre-Production';
  else                                      deploymentCategory = 'Prototype';

  const topBlockingIssues = [];
  security.criticalIssues.slice(0, 2).forEach(i => topBlockingIssues.push(`[CRITICAL SECURITY] ${i.issue} — ${i.file}`));
  security.highIssues.slice(0, 2).forEach(i => topBlockingIssues.push(`[HIGH SECURITY] ${i.issue} — ${i.file}`));
  if (security.mediumIssues.length && topBlockingIssues.length < 4)
    topBlockingIssues.push(`[MEDIUM SECURITY] ${security.mediumIssues[0].issue}`);
  architecture.architecturalWeaknesses.slice(0, 1).forEach(w => {
    if (topBlockingIssues.length < 5) topBlockingIssues.push(`[ARCHITECTURE] ${w}`);
  });
  reliability.reliabilityConcerns.slice(0, 1).forEach(c => {
    if (topBlockingIssues.length < 5) topBlockingIssues.push(`[RELIABILITY] ${c}`);
  });

  const executiveSummary = [
    `Production Readiness: ${pri}/100 — ${deploymentCategory}.`,
    `Security: ${security.securityScore}/100. ${security.criticalIssues.length} critical, ${security.highIssues.length} high, ${security.mediumIssues.length} medium issue(s).`,
    `Architecture: ${architecture.architectureScore}/100 — ${architecture.modularityLevel} modularity, coupling risk ${architecture.couplingRisk}.`,
    `Maintainability: ${maintainability.maintainabilityScore}/100. ${maintainability.largeFunctionCount} oversized function(s), ${maintainability.duplicationRisk} duplication risk.`,
    `Performance: ${performance.performanceScore}/100, ${performance.scalingRiskLevel} scaling risk. ${performance.bottleneckIndicators.length} bottleneck(s) found.`,
    `Reliability: ${reliability.reliabilityScore}/100. Test coverage: ${reliability.testCoverageEstimate}.`
  ].join('\n');

  return { productionReadinessIndex: pri, deploymentCategory, topBlockingIssues: topBlockingIssues.slice(0, 5), executiveSummary };
}

// === BONUS METRICS ==========================================================
function computeTechnicalDebt(security, maintainability, architecture) {
  return clampScore(
    Math.max(0, 70 - security.securityScore) * 0.35 +
    Math.max(0, 70 - maintainability.maintainabilityScore) * 0.35 +
    Math.max(0, 70 - architecture.architectureScore) * 0.30
  );
}

function computeRefactorEffort(debtScore, fileCount, totalLines) {
  const total = debtScore * 0.7 + Math.min(40, (fileCount / 10) + (totalLines / 5000) * 20) * 0.3;
  return total >= 50 ? 'High' : total >= 25 ? 'Medium' : 'Low';
}

function computeSystemComplexity(codeFiles, maintainability, architecture) {
  return clampScore(
    Math.min(40, codeFiles.length * 1.5) +
    maintainability.largeFunctionCount * 3 +
    architecture.couplingRisk * 40
  );
}

module.exports = { analyze };
