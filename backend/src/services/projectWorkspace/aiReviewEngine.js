'use strict';

const crypto = require('crypto');
const db     = require('../../config/database');

// ─── helpers ────────────────────────────────────────────────────────────────
const EXT_LANG = {
  js:'JavaScript', jsx:'React/JSX', ts:'TypeScript', tsx:'React/TSX',
  py:'Python', java:'Java', cs:'C#', rb:'Ruby', go:'Go', php:'PHP',
  cpp:'C++', c:'C', rs:'Rust', swift:'Swift', kt:'Kotlin',
  html:'HTML', css:'CSS', scss:'SCSS', sass:'SASS',
  json:'JSON', yml:'YAML', yaml:'YAML', md:'Markdown',
  sql:'SQL', sh:'Shell', bash:'Bash', dockerfile:'Docker',
  xml:'XML', toml:'TOML', env:'Config',
};
const CODE_EXTS = new Set(['js','jsx','ts','tsx','py','java','cs','rb','go','php','cpp','c','rs','swift','kt']);

function detectTech(files) {
  const langs = {};
  const techSet = new Set();
  let totalLines = 0;

  for (const f of files) {
    const ext = (f.file_type || '').toLowerCase().replace('.', '');
    const lang = EXT_LANG[ext];
    if (lang) { langs[lang] = (langs[lang] || 0) + 1; }
    const lines = f.file_content ? f.file_content.split('\n').length : 0;
    totalLines += lines;

    // tech detection from filenames
    const name = (f.file_name || '').toLowerCase();
    if (name === 'package.json') techSet.add('Node.js');
    if (name === 'requirements.txt' || name === 'setup.py') techSet.add('Python');
    if (name === 'dockerfile' || name.endsWith('dockerfile')) techSet.add('Docker');
    if (name === 'docker-compose.yml' || name === 'docker-compose.yaml') techSet.add('Docker Compose');
    if (name === 'angular.json') techSet.add('Angular');
    if (name === 'vite.config.js' || name === 'vite.config.ts') techSet.add('Vite');
    if (name === 'next.config.js' || name === 'next.config.ts') techSet.add('Next.js');
    if (name === 'tailwind.config.js') techSet.add('TailwindCSS');

    const content = f.file_content || '';
    if (content.includes('react') || content.includes('useState')) techSet.add('React');
    if (content.includes('express()') || content.includes("require('express')")) techSet.add('Express.js');
    if (content.includes('mongoose') || content.includes('mongodb')) techSet.add('MongoDB');
    if (content.includes('sequelize') || content.includes("'sqlite'") || content.includes('"sqlite"')) techSet.add('SQLite');
    if (content.includes('postgresql') || content.includes('pg.Pool')) techSet.add('PostgreSQL');
    if (content.includes('prisma')) techSet.add('Prisma');
    if (content.includes('redux') || content.includes('createSlice')) techSet.add('Redux');
    if (content.includes('jest') || content.includes('describe(') || content.includes("it('")) techSet.add('Jest');
  }

  return {
    languages: Object.entries(langs).sort((a,b)=>b[1]-a[1]).map(([lang,count])=>({ lang, count })),
    techStack: [...techSet],
    totalFiles: files.length,
    totalLines,
  };
}

function scoreProject(files, tech) {
  const total = files.length;
  if (total === 0) return { architecture: 50, security: 60, performance: 55, maintainability: 55, overall: 55 };

  let secScore = 80;
  let archScore = 60;
  let perfScore = 70;
  let maintScore = 65;

  for (const f of files) {
    const c = f.file_content || '';
    // security deductions
    if (/api[_-]?key\s*=\s*['"][^'"]{8,}/i.test(c)) secScore -= 10;
    if (/password\s*=\s*['"][^'"]{4,}/i.test(c)) secScore -= 8;
    if (/eval\s*\(/.test(c)) secScore -= 5;
    if (/innerHTML\s*=/.test(c)) secScore -= 3;
    // perf deductions
    if (/SELECT \*/i.test(c)) perfScore -= 3;
    if (/for\s*\(.*\.length/i.test(c)) perfScore -= 2;
    // arch bonuses
    if (/index\.js|index\.ts/.test(f.file_name)) archScore += 2;
    if (/\.test\.|\.spec\./.test(f.file_name)) maintScore += 3;
    if (/README/i.test(f.file_name)) maintScore += 4;
  }

  // bonuses for diverse tech
  if (tech.techStack.includes('Docker')) archScore += 5;
  if (tech.techStack.includes('Jest')) maintScore += 8;
  if (tech.techStack.includes('TypeScript')) maintScore += 5;
  if (total > 10) archScore += 5;
  if (total > 25) archScore += 5;

  // clamp
  const clamp = v => Math.max(10, Math.min(100, Math.round(v)));
  secScore  = clamp(secScore);
  archScore = clamp(archScore);
  perfScore = clamp(perfScore);
  maintScore = clamp(maintScore);
  const overall = clamp((secScore*0.3 + archScore*0.25 + perfScore*0.2 + maintScore*0.25));

  return { security: secScore, architecture: archScore, performance: perfScore, maintainability: maintScore, overall };
}

function generateSWOT(tech, scores) {
  const strengths = [];
  const weaknesses = [];
  const opportunities = [];
  const threats = [];

  if (tech.techStack.includes('TypeScript')) strengths.push('TypeScript enforces type safety and reduces runtime errors');
  if (tech.techStack.includes('React')) strengths.push('React component architecture enables reusable UI patterns');
  if (tech.techStack.includes('Docker')) strengths.push('Docker containerization ensures deployment consistency');
  if (tech.techStack.includes('Jest')) strengths.push('Test suite present — quality gate is established');
  if (tech.totalFiles > 20) strengths.push('Substantial codebase with clear module separation');
  if (scores.architecture > 70) strengths.push('Architecture score indicates well-structured codebase');

  if (scores.security < 70) weaknesses.push('Security posture needs hardening — credentials/eval detected');
  if (scores.maintainability < 65) weaknesses.push('Maintainability needs improvement — reduce code complexity');
  if (!tech.techStack.includes('Jest') && !tech.techStack.includes('Docker')) weaknesses.push('No testing or containerization detected');
  if (tech.totalLines < 200 && tech.totalFiles > 5) weaknesses.push('Low line-to-file ratio suggests thin implementations');

  if (tech.techStack.includes('Node.js')) opportunities.push('Leverage Node.js ecosystem for serverless or microservice evolution');
  if (tech.techStack.includes('React')) opportunities.push('React Native migration path available for mobile expansion');
  opportunities.push('CI/CD pipeline integration would automate quality gates');
  opportunities.push('Add OpenAPI/Swagger documentation to improve API discoverability');

  if (scores.security < 60) threats.push('Security vulnerabilities could expose sensitive data');
  threats.push('Technical debt accumulation risk if refactoring is deferred');
  if (!tech.techStack.includes('Docker')) threats.push('Environment inconsistency risk without containerization');
  threats.push('Scalability limits may surface under production load without load testing');

  return { strengths, weaknesses, opportunities, threats };
}

function generateSuggestions(tech, scores, files) {
  const suggestions = [];
  if (scores.security < 75) suggestions.push({ priority: 'HIGH', category: 'Security', text: 'Move API keys and secrets to environment variables. Use dotenv and never commit .env files.' });
  if (!tech.techStack.includes('Jest')) suggestions.push({ priority: 'HIGH', category: 'Testing', text: 'Add Jest unit tests. Target at least 60% coverage for business logic functions.' });
  if (!tech.techStack.includes('Docker')) suggestions.push({ priority: 'MEDIUM', category: 'DevOps', text: 'Containerize the application with Docker for reproducible deployments.' });
  if (scores.maintainability < 70) suggestions.push({ priority: 'MEDIUM', category: 'Code Quality', text: 'Break large functions into smaller, single-responsibility units. Aim for functions under 30 lines.' });
  if (scores.performance < 70) suggestions.push({ priority: 'MEDIUM', category: 'Performance', text: 'Replace SELECT * with specific column selectors. Add database indices for frequently queried fields.' });
  suggestions.push({ priority: 'LOW', category: 'Documentation', text: 'Expand README with setup instructions, API endpoints, and architecture diagram.' });
  if (tech.techStack.includes('React') && !tech.techStack.includes('Redux')) suggestions.push({ priority: 'LOW', category: 'State Management', text: 'Consider React Query or Zustand for cleaner async state management as features grow.' });
  return suggestions;
}

// ─── main engine ─────────────────────────────────────────────────────────────
class AIReviewEngine {

  async ensureTables() {
    if (this._ready) return;
    // Drop integer constraint — recreate with TEXT project_id
    await db.run(`
      CREATE TABLE IF NOT EXISTS workspace_ai_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id TEXT NOT NULL,
        commit_hash TEXT NOT NULL,
        overall_score INTEGER DEFAULT 0,
        review_data TEXT DEFAULT '{}',
        model_version TEXT DEFAULT 'static-analyzer-v1',
        status TEXT DEFAULT 'complete',
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(project_id, commit_hash)
      )
    `);
    await db.run(`
      CREATE TABLE IF NOT EXISTS workspace_evaluation (
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
      )
    `);
    this._ready = true;
  }

  async runReview(projectId, commitHash) {
    await this.ensureTables();
    try {
      // Mark in_progress
      await db.run(
        `INSERT OR REPLACE INTO workspace_ai_reviews
           (project_id, commit_hash, overall_score, review_data, model_version, status, created_at)
         VALUES (?, ?, 0, '{}', 'in_progress', 'in_progress', datetime('now'))`,
        [projectId, commitHash]
      );

      // Load files from workspace_files (UUID-keyed)
      let files = await db.all(
        `SELECT file_path, file_name, file_type, file_size, file_content
         FROM workspace_files WHERE project_id = ? AND commit_hash = ?`,
        [projectId, commitHash]
      );
      if (files.length === 0) {
        files = await db.all(
          `SELECT file_path, file_name, file_type, file_size, file_content
           FROM workspace_files WHERE project_id = ?`,
          [projectId]
        );
      }

      const tech   = detectTech(files);
      const scores = scoreProject(files, tech);
      const swot   = generateSWOT(tech, scores);
      const suggestions = generateSuggestions(tech, scores, files);

      const deployCategory =
        scores.overall >= 80 ? 'Production-Ready' :
        scores.overall >= 65 ? 'Pre-Production' :
        scores.overall >= 45 ? 'Prototype' : 'High Risk';

      const result = {
        projectId,
        commitHash,
        analyzedAt: new Date().toISOString(),
        modelVersion: 'static-analyzer-v2',
        overallScore: scores.overall,
        details: {
          fileCount: tech.totalFiles,
          totalLines: tech.totalLines,
          languages: tech.languages,
        },
        techStack: { detected: tech.techStack, primary: tech.languages[0]?.lang || 'Unknown' },
        security: {
          securityScore: scores.security,
          criticalIssues: [],
          securitySummary: scores.security >= 75
            ? 'No critical security vulnerabilities detected in static scan.'
            : 'Potential credential exposure or unsafe patterns detected. Review flagged files.',
        },
        architecture: {
          architectureScore: scores.architecture,
          modularityLevel: scores.architecture >= 75 ? 'High' : scores.architecture >= 55 ? 'Medium' : 'Low',
          couplingRisk: Math.round(100 - scores.architecture),
          architecturalWeaknesses: scores.architecture < 70 ? ['Insufficient module separation detected'] : [],
          refactorRecommendations: ['Extract reusable utility functions into shared modules'],
        },
        maintainability: {
          maintainabilityScore: scores.maintainability,
          duplicationRisk: scores.maintainability >= 75 ? 'Low' : 'Medium',
          readabilityAssessment: scores.maintainability >= 70 ? 'Code is generally readable with consistent patterns' : 'Readability could be improved with better naming and smaller functions',
        },
        performance: {
          performanceScore: scores.performance,
          scalingRiskLevel: scores.performance >= 75 ? 'Low' : scores.performance >= 55 ? 'Medium' : 'High',
          bottleneckIndicators: scores.performance < 70 ? ['Potential N+1 query patterns detected'] : [],
          estimatedRiskAtScale: { '10k': 'Moderate risk', '100k': 'High risk without optimisation' },
        },
        reliability: {
          reliabilityScore: Math.round((scores.maintainability + scores.security) / 2),
          testCoverageEstimate: tech.techStack.includes('Jest') ? 'Partial (tests present)' : 'None detected',
          errorHandlingQuality: 'Needs improvement',
          loggingQuality: 'Basic',
        },
        productionReadiness: {
          productionReadinessIndex: scores.overall,
          deploymentCategory: deployCategory,
          topBlockingIssues: swot.weaknesses.slice(0, 3),
          executiveSummary: `${tech.totalFiles} files, ${tech.totalLines.toLocaleString()} lines analyzed. Tech stack: ${tech.techStack.slice(0,4).join(', ') || 'Undetected'}. Overall readiness: ${deployCategory}.`,
        },
        swot,
        suggestions,
        technicalDebtScore: Math.round(100 - scores.overall),
        refactorEffortEstimate: scores.overall >= 75 ? 'Low' : scores.overall >= 55 ? 'Medium' : 'High',
        systemComplexityIndex: Math.round((100 - scores.maintainability + (tech.totalFiles > 20 ? 10 : 0)) / 2),
      };

      await db.run(
        `UPDATE workspace_ai_reviews
         SET overall_score = ?, review_data = ?, model_version = ?, status = 'complete'
         WHERE project_id = ? AND commit_hash = ?`,
        [scores.overall, JSON.stringify(result), 'static-analyzer-v2', projectId, commitHash]
      );

      // Generate and store evaluation
      await this._runEvaluation(projectId, commitHash, scores, tech);

      console.log(`[AIReview] done hash=${commitHash} score=${scores.overall} deploy=${deployCategory}`);
      return result;
    } catch (err) {
      console.error('[AIReview] Failed:', err.message);
      await db.run(
        `UPDATE workspace_ai_reviews SET status = 'failed' WHERE project_id = ? AND commit_hash = ?`,
        [projectId, commitHash]
      ).catch(() => {});
      throw err;
    }
  }

  async _runEvaluation(projectId, commitHash, scores, tech) {
    const innovation = Math.min(100, Math.round(
      (tech.techStack.length * 5) + (scores.architecture * 0.4) + (scores.performance * 0.2)
    ));
    const scalability = Math.round((scores.performance * 0.5) + (scores.architecture * 0.3) + (tech.techStack.includes('Docker') ? 15 : 0));
    const maturity = Math.round((scores.maintainability * 0.4) + (scores.security * 0.3) + (tech.techStack.includes('Jest') ? 15 : 0) + (tech.totalFiles > 15 ? 10 : 0));
    const overall = Math.round((scores.overall * 0.4) + (innovation * 0.2) + (Math.min(100,scalability) * 0.2) + (Math.min(100,maturity) * 0.2));

    const evalData = {
      scores: {
        codeQuality: scores.overall,
        complexity: Math.max(10, 100 - scores.maintainability),
        innovation: Math.min(100, innovation),
        scalability: Math.min(100, scalability),
        maturity: Math.min(100, maturity),
        overall: Math.min(100, overall),
      },
      insights: {
        topStrength: tech.techStack[0] ? `Strong use of ${tech.techStack[0]}` : 'Solid file organization',
        primaryRisk: scores.security < 70 ? 'Security hardening required' : 'Scalability planning needed',
        nextMilestone: scores.overall >= 75 ? 'Add CI/CD pipeline' : 'Improve test coverage first',
      },
    };

    await db.run(
      `INSERT OR REPLACE INTO workspace_evaluation
         (project_id, commit_hash, code_quality, complexity, innovation, scalability, maturity, overall, eval_data, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [projectId, commitHash,
       evalData.scores.codeQuality, evalData.scores.complexity,
       evalData.scores.innovation, evalData.scores.scalability,
       evalData.scores.maturity, evalData.scores.overall,
       JSON.stringify(evalData)]
    );
  }

  async getReview(projectId, commitHash) {
    await this.ensureTables();
    return db.get(
      `SELECT * FROM workspace_ai_reviews WHERE project_id = ? AND commit_hash = ?`,
      [projectId, commitHash]
    );
  }

  async getLatestReview(projectId) {
    await this.ensureTables();
    return db.get(
      `SELECT * FROM workspace_ai_reviews WHERE project_id = ? ORDER BY created_at DESC LIMIT 1`,
      [projectId]
    );
  }

  async getLatestEvaluation(projectId) {
    await this.ensureTables();
    return db.get(
      `SELECT * FROM workspace_evaluation WHERE project_id = ? ORDER BY created_at DESC LIMIT 1`,
      [projectId]
    );
  }
}

module.exports = new AIReviewEngine();
