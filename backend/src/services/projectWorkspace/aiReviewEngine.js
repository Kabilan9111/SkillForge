'use strict';
const db = require('../../config/database');
const projectParser = require('./projectParser');
const staticAnalyzer = require('./staticAnalyzer');

class AIReviewEngine {

  async ensureTables() {
    if (this._ready) return;
    await db.run(`CREATE TABLE IF NOT EXISTS workspace_ai_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      commit_hash TEXT NOT NULL,
      overall_score INTEGER DEFAULT 0,
      review_data TEXT DEFAULT '{}',
      model_version TEXT DEFAULT 'static-v3',
      status TEXT DEFAULT 'complete',
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(project_id, commit_hash)
    )`);
    await db.run(`CREATE TABLE IF NOT EXISTS workspace_evaluation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      commit_hash TEXT NOT NULL,
      code_quality INTEGER DEFAULT 0,
      complexity INTEGER DEFAULT 0,
      innovation INTEGER DEFAULT 0,
      scalability INTEGER DEFAULT 0,
      maturity INTEGER DEFAULT 0,
      overall INTEGER DEFAULT 0,
      eval_data TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(project_id, commit_hash)
    )`);
    this._ready = true;
  }

  async runReview(projectId, commitHash) {
    await this.ensureTables();
    try {
      await db.run(
        `INSERT OR REPLACE INTO workspace_ai_reviews
           (project_id,commit_hash,overall_score,review_data,model_version,status,created_at)
         VALUES (?,?,0,'{}','in_progress','in_progress',datetime('now'))`,
        [projectId, commitHash]
      );

      // Load files
      let files = await db.all(
        `SELECT file_path,file_name,file_type,file_size,file_content FROM workspace_files
         WHERE project_id=? AND commit_hash=?`, [projectId, commitHash]
      );
      if (!files.length) {
        files = await db.all(
          `SELECT file_path,file_name,file_type,file_size,file_content FROM workspace_files WHERE project_id=?`,
          [projectId]
        );
      }

      // Parse project structure + run static analysis
      const parsed   = projectParser.parse(files);
      const analyzed = staticAnalyzer.analyze(files, parsed);

      const { projectType, techStack, techByCategory, structure, depCount } = parsed;
      const { security, architecture, maintainability, performance, reliability } = analyzed;
      const overall = analyzed.overallScore;

      const deployCategory =
        overall >= 82 ? 'Production-Ready' :
        overall >= 65 ? 'Pre-Production'   :
        overall >= 45 ? 'Prototype'        : 'High Risk';

      // SWOT
      const swot = this._buildSWOT(techStack, architecture, security, structure, overall);

      // Suggestions
      const suggestions = this._buildSuggestions(techStack, security, architecture, maintainability, performance, reliability, structure);

      // Executive summary
      const executiveSummary = this._buildExecutiveSummary(projectType, techStack, structure, overall, deployCategory, security);

      // Project overview
      const projectOverview = this._buildProjectOverview(projectType, techStack, structure, parsed.depCount);

      const result = {
        projectId, commitHash,
        analyzedAt: new Date().toISOString(),
        modelVersion: 'static-analyzer-v3',
        overallScore: overall,
        details: {
          fileCount: structure.totalFiles,
          totalLines: structure.totalLines,
          codeLines: structure.codeLines,
          languages: structure.languages,
          largeFiles: structure.largeFiles,
          hasTests: structure.hasTests,
          hasDocker: structure.hasDocker,
          hasCI: structure.hasCI,
          apiRouteCount: structure.apiRouteCount,
          componentCount: structure.componentCount,
          testFileCount: structure.testFileCount,
          maxDepth: structure.maxDepth,
          depCount,
        },
        projectType,
        projectOverview,
        techStack: { detected: techStack, byCategory: techByCategory, primary: structure.languages[0]?.lang || 'Unknown' },
        security,
        architecture,
        maintainability,
        performance,
        reliability,
        productionReadiness: {
          productionReadinessIndex: overall,
          deploymentCategory: deployCategory,
          topBlockingIssues: [
            ...security.criticalIssues.slice(0,2).map(i => i.message),
            ...security.highIssues.slice(0,1).map(i => i.message),
            ...architecture.weaknesses.slice(0,2),
            ...reliability.issues.slice(0,1),
          ].slice(0, 5),
          executiveSummary,
        },
        swot,
        suggestions,
        technicalDebtScore: analyzed.technicalDebtScore,
        refactorEffortEstimate: analyzed.refactorEffortEstimate,
        systemComplexityIndex: analyzed.systemComplexityIndex,
        totalIssuesFound: analyzed.totalIssuesFound,
      };

      await db.run(
        `UPDATE workspace_ai_reviews
         SET overall_score=?,review_data=?,model_version='static-v3',status='complete'
         WHERE project_id=? AND commit_hash=?`,
        [overall, JSON.stringify(result), projectId, commitHash]
      );

      await this._runEvaluation(projectId, commitHash, analyzed, parsed);
      console.log(`[AIReview] hash=${commitHash} score=${overall} deploy=${deployCategory} files=${files.length}`);
      return result;
    } catch (err) {
      console.error('[AIReview] Failed:', err.message);
      await db.run(`UPDATE workspace_ai_reviews SET status='failed' WHERE project_id=? AND commit_hash=?`, [projectId, commitHash]).catch(()=>{});
      throw err;
    }
  }

  _buildSWOT(techStack, architecture, security, structure, overall) {
    const names = techStack.map(t => t.name);
    const strengths = [], weaknesses = [], opportunities = [], threats = [];

    // Strengths
    if (names.includes('TypeScript')) strengths.push('TypeScript enforces compile-time type safety, reducing runtime errors significantly');
    if (names.includes('React') || names.includes('Next.js')) strengths.push('Modern component-based frontend architecture enables rapid UI development');
    if (names.includes('Docker')) strengths.push('Docker containerization ensures environment consistency across development and production');
    if (names.includes('Prisma ORM')) strengths.push('Prisma ORM provides type-safe database access and schema migration management');
    if (structure.hasTests) strengths.push('Test suite is present — establishes a regression safety net');
    if (structure.hasCI) strengths.push('CI/CD pipeline automates build and deployment validation');
    if (architecture.architectureScore >= 70) strengths.push('Well-organized codebase with clear module separation');
    if (names.includes('AI/LLM Integration')) strengths.push('AI integration positions the product for next-generation feature capabilities');
    if (structure.apiRouteCount > 5) strengths.push(`${structure.apiRouteCount} API endpoints — comprehensive backend coverage`);
    if (strengths.length === 0) strengths.push('Project demonstrates foundational engineering structure');

    // Weaknesses
    if (security.criticalIssues.length > 0) weaknesses.push(`${security.criticalIssues.length} critical security vulnerabilities require immediate attention`);
    if (!structure.hasTests) weaknesses.push('Absence of test coverage creates regression risk during feature development');
    if (!structure.hasDocker) weaknesses.push('No containerization — deployment consistency is not guaranteed');
    if (structure.largeFiles.length > 0) weaknesses.push(`${structure.largeFiles.length} oversized files indicate monolithic code patterns`);
    if (!names.includes('TypeScript') && structure.totalFiles > 10) weaknesses.push('JavaScript without TypeScript increases runtime error risk at scale');
    if (architecture.architectureScore < 60) weaknesses.push('Module structure lacks clear separation of concerns');
    if (weaknesses.length === 0) weaknesses.push('No critical structural weaknesses detected at this stage');

    // Opportunities
    if (!names.includes('Redis')) opportunities.push('Add Redis caching layer to reduce database load and improve response times');
    if (!names.includes('AI/LLM Integration')) opportunities.push('AI feature integration could significantly differentiate the product');
    if (!structure.hasCI) opportunities.push('CI/CD automation would accelerate safe feature delivery');
    if (names.includes('React') || names.includes('Next.js')) opportunities.push('Progressive Web App (PWA) capabilities could extend reach to mobile users');
    opportunities.push('API documentation with OpenAPI/Swagger would improve developer experience');
    opportunities.push('Analytics and observability instrumentation would enable data-driven decisions');

    // Threats
    if (security.totalIssues > 0) threats.push(`${security.totalIssues} security findings represent potential attack surface`);
    if (!structure.hasTests) threats.push('Without tests, each deployment carries regression risk');
    threats.push('Technical debt accumulation could slow feature velocity over time');
    if (overall < 70) threats.push('Current production readiness score suggests deployment risk');
    if (depCount > 50) threats.push('Large dependency tree increases supply chain attack surface');

    return { strengths, weaknesses, opportunities, threats };
  }

  _buildSuggestions(techStack, security, architecture, maintainability, performance, reliability, structure) {
    const names = techStack.map(t => t.name);
    const suggestions = [];

    if (security.criticalIssues.length > 0)
      suggestions.push({ priority: 'CRITICAL', category: 'Security', icon: '🔴', text: `Fix ${security.criticalIssues.length} critical security issue(s): ${security.criticalIssues[0]?.message}` });
    if (security.highIssues.length > 0)
      suggestions.push({ priority: 'HIGH', category: 'Security', icon: '🟠', text: `Resolve ${security.highIssues.length} high-severity security concern(s). Review flagged patterns.` });
    if (!structure.hasTests)
      suggestions.push({ priority: 'HIGH', category: 'Testing', icon: '🧪', text: 'Add Jest/Vitest unit tests. Target 60%+ coverage for business logic. Use Testing Library for UI components.' });
    if (!structure.hasDocker)
      suggestions.push({ priority: 'HIGH', category: 'DevOps', icon: '🐳', text: 'Add Dockerfile and docker-compose.yml. Containerization eliminates environment discrepancies.' });
    if (!names.includes('TypeScript') && structure.totalFiles > 8)
      suggestions.push({ priority: 'HIGH', category: 'Code Quality', icon: '📘', text: 'Migrate to TypeScript. Type safety prevents entire classes of runtime bugs at minimal migration cost.' });
    if (architecture.weaknesses.length > 0)
      suggestions.push({ priority: 'MEDIUM', category: 'Architecture', icon: '🏗️', text: architecture.weaknesses[0] });
    if (structure.largeFiles.length > 0)
      suggestions.push({ priority: 'MEDIUM', category: 'Maintainability', icon: '✂️', text: `Split ${structure.largeFiles[0]?.name} (${structure.largeFiles[0]?.lines} lines) into focused modules under 200 lines each.` });
    if (!structure.hasCI)
      suggestions.push({ priority: 'MEDIUM', category: 'DevOps', icon: '🔄', text: 'Set up GitHub Actions for automated testing, linting, and deployment on every pull request.' });
    if (!names.includes('Redis') && structure.apiRouteCount > 5)
      suggestions.push({ priority: 'MEDIUM', category: 'Performance', icon: '⚡', text: 'Add Redis caching for expensive queries. Even 5-minute TTL caches can reduce DB load by 80%.' });
    if (performance.bottleneckIssues.length > 0)
      suggestions.push({ priority: 'MEDIUM', category: 'Performance', icon: '🚀', text: performance.bottleneckIssues[0]?.issue || 'Optimize identified performance bottlenecks' });
    if (!structure.hasReadme)
      suggestions.push({ priority: 'LOW', category: 'Documentation', icon: '📖', text: 'Add a comprehensive README with setup instructions, architecture diagram, and API documentation.' });
    if (!structure.hasDotEnv)
      suggestions.push({ priority: 'LOW', category: 'Config', icon: '⚙️', text: 'Add .env.example to document all required environment variables for new developers.' });
    suggestions.push({ priority: 'LOW', category: 'Observability', icon: '📊', text: 'Add structured logging (Winston/Pino) and error tracking (Sentry) for production visibility.' });

    return suggestions;
  }

  _buildProjectOverview(projectType, techStack, structure, depCount) {
    const names = techStack.map(t => t.name);
    const primary = structure.languages[0]?.lang || 'Unknown';
    const hasBackend = names.some(t => ['Express.js','Fastify','Django','Flask','FastAPI'].includes(t));
    const hasFrontend = names.some(t => ['React','Vue.js','Angular','Next.js','Svelte'].includes(t));
    const hasDB = names.some(t => t.toLowerCase().includes('database') || ['MongoDB + Mongoose','PostgreSQL','MySQL','SQLite','Prisma ORM'].includes(t));

    let purpose = `A ${projectType.type.toLowerCase()} built primarily in ${primary}`;
    if (hasFrontend && hasBackend) purpose += ', featuring both a user-facing frontend and a backend API layer';
    if (hasDB) purpose += ' with persistent data storage';
    purpose += '.';

    const maturitySignals = [];
    if (structure.hasTests) maturitySignals.push('automated testing');
    if (structure.hasDocker) maturitySignals.push('containerization');
    if (structure.hasCI) maturitySignals.push('CI/CD automation');
    if (structure.hasReadme) maturitySignals.push('documentation');

    return {
      purpose,
      projectIcon: projectType.icon,
      projectTypeLabel: projectType.type,
      primaryLanguage: primary,
      totalTechnologies: techStack.length,
      totalDependencies: depCount,
      maturitySignals,
      keyMetrics: {
        files: structure.totalFiles,
        lines: structure.totalLines,
        components: structure.componentCount,
        apiRoutes: structure.apiRouteCount,
        testFiles: structure.testFileCount,
      },
      architectureStyle: hasBackend && hasFrontend ? 'Full-Stack' : hasFrontend ? 'Frontend SPA' : hasBackend ? 'Backend API' : 'Library/Utility',
    };
  }

  _buildExecutiveSummary(projectType, techStack, structure, overall, deployCategory, security) {
    const names = techStack.map(t => t.name);
    const hasFrontend = names.some(t => ['React','Vue.js','Angular','Next.js'].includes(t));
    const hasBackend = names.some(t => ['Express.js','Fastify','Django','Flask'].includes(t));
    const tone = overall >= 80 ? 'strong' : overall >= 65 ? 'solid foundational' : overall >= 50 ? 'developing' : 'early-stage';

    let summary = `This ${projectType.type.toLowerCase()} demonstrates ${tone} engineering practices`;
    if (hasFrontend) summary += `, with a well-structured frontend component architecture`;
    if (hasBackend) summary += ` and an API backend serving ${structure.apiRouteCount || 'multiple'} routes`;
    summary += `. Analyzing ${structure.totalFiles} files across ${structure.totalLines.toLocaleString()} lines of code, `;
    summary += `the codebase is assessed as <strong>${deployCategory}</strong> `;
    summary += `with an overall engineering score of <strong>${overall}/100</strong>. `;

    if (security.criticalIssues.length > 0) {
      summary += `⚠️ ${security.criticalIssues.length} critical security issue(s) must be resolved before production deployment. `;
    } else if (overall >= 75) {
      summary += `Security posture is acceptable — no critical vulnerabilities detected. `;
    }
    if (!structure.hasTests) summary += `The absence of automated testing is the primary risk vector. `;
    if (overall >= 75) {
      summary += `With targeted improvements to testing and documentation, this project is approaching production readiness.`;
    } else {
      summary += `Focus areas: ${[!structure.hasTests && 'test coverage', security.criticalIssues.length > 0 && 'security hardening', !structure.hasDocker && 'containerization'].filter(Boolean).join(', ')}.`;
    }

    return summary;
  }

  async _runEvaluation(projectId, commitHash, analyzed, parsed) {
    const { overallScore: qs, security, architecture, maintainability, performance, reliability } = analyzed;
    const { techStack, structure } = parsed;
    const names = techStack.map(t => t.name);

    const innovation = Math.min(100, Math.round(
      (names.length * 4) + (architecture.architectureScore * 0.3) + (names.includes('AI/LLM Integration') ? 15 : 0)
    ));
    const scalability = Math.min(100, Math.round(
      performance.performanceScore * 0.4 + architecture.architectureScore * 0.3 +
      (names.includes('Redis') ? 15 : 0) + (structure.hasDocker ? 10 : 0)
    ));
    const maturity = Math.min(100, Math.round(
      maintainability.maintainabilityScore * 0.35 + security.securityScore * 0.25 +
      (structure.hasTests ? 20 : 0) + (structure.hasDocker ? 10 : 0) + (structure.hasCI ? 10 : 0)
    ));
    const overall = Math.min(100, Math.round(
      qs * 0.35 + innovation * 0.2 + scalability * 0.25 + maturity * 0.2
    ));

    const evalData = {
      scores: { codeQuality: qs, complexity: analyzed.systemComplexityIndex, innovation, scalability, maturity, overall },
      insights: {
        topStrength: architecture.strengths[0] || 'Structured codebase foundation',
        primaryRisk: security.criticalIssues.length > 0 ? 'Critical security vulnerabilities' : !structure.hasTests ? 'Lack of automated testing' : 'Scalability planning needed',
        nextMilestone: overall >= 80 ? 'Add CI/CD and monitoring for production readiness' : overall >= 60 ? 'Improve test coverage and add Docker' : 'Address critical issues and establish test coverage',
      },
      breakdown: { securityWeight: 25, architectureWeight: 25, maintainabilityWeight: 20, performanceWeight: 15, reliabilityWeight: 15 },
    };

    await db.run(
      `INSERT OR REPLACE INTO workspace_evaluation
         (project_id,commit_hash,code_quality,complexity,innovation,scalability,maturity,overall,eval_data,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,datetime('now'))`,
      [projectId, commitHash, qs, analyzed.systemComplexityIndex, innovation, scalability, maturity, overall, JSON.stringify(evalData)]
    );
  }

  async getLatestReview(projectId) {
    await this.ensureTables();
    return db.get(`SELECT * FROM workspace_ai_reviews WHERE project_id=? ORDER BY created_at DESC LIMIT 1`, [projectId]);
  }

  async getLatestEvaluation(projectId) {
    await this.ensureTables();
    return db.get(`SELECT * FROM workspace_evaluation WHERE project_id=? ORDER BY created_at DESC LIMIT 1`, [projectId]);
  }
}

module.exports = new AIReviewEngine();
