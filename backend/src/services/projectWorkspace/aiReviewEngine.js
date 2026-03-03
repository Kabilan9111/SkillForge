/**
 * ================================================
 * AI REVIEW ENGINE � Auto-Triggered Code Analysis
 * ================================================
 * Triggers automatically after every commit.
 * Uses real static analysis (codeAnalyzer.js).
 * Falls back to OpenAI if API key is configured.
 * All results stored in projects_ai_reviews table.
 */
'use strict';

const db           = require('../../config/database');
const codeAnalyzer = require('./codeAnalyzer');

// --- LLM: only active when a real key is configured --------------------------
const LLM_KEY  = (process.env.OPENAI_API_KEY || '').trim();
const LLM_REAL = LLM_KEY.length > 20 && !LLM_KEY.includes('your-') && !LLM_KEY.includes('placeholder');
const LLM_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

class AIReviewEngine {

  /**
   * Main entry point � called after commit is saved.
   * Runs asynchronously � does NOT block the commit response.
   */
  async runReview(projectId, commitHash) {
    const startMs = Date.now();
    try {
      // Mark in_progress so frontend can poll
      await db.run(
        `INSERT OR REPLACE INTO projects_ai_reviews
           (project_id, commit_hash, overall_score, review_data, model_version, status, created_at)
         VALUES (?, ?, 0, '{}', 'pending', 'in_progress', datetime('now'))`,
        [projectId, commitHash]
      );

      // Load files for this commit
      let files = await db.all(
        `SELECT file_path, file_name, file_type, file_size, file_content
         FROM projects_files WHERE project_id = ? AND commit_hash = ?`,
        [projectId, commitHash]
      );
      if (files.length === 0) {
        files = await db.all(
          `SELECT file_path, file_name, file_type, file_size, file_content
           FROM projects_files WHERE project_id = ?`,
          [projectId]
        );
      }

      // Run real static analysis
      const staticResult = codeAnalyzer.analyze(files);

      // Optionally enhance with LLM
      let finalResult = staticResult;
      if (LLM_REAL && files.length > 0) {
        try {
          finalResult = await this._enhanceWithLLM(staticResult, files);
        } catch (e) {
          console.warn('[AIReview] LLM failed, using static analysis:', e.message);
        }
      }

      // Attach metadata
      finalResult.commitHash   = commitHash;
      finalResult.projectId    = projectId;
      finalResult.analyzedAt   = new Date().toISOString();
      finalResult.processingMs = Date.now() - startMs;
      finalResult.modelVersion = LLM_REAL ? LLM_MODEL : 'static-analyzer-v1';

      // Persist
      const pri = finalResult.productionReadiness
        ? finalResult.productionReadiness.productionReadinessIndex
        : (finalResult.overallScore || 0);
      const secScore   = finalResult.security?.securityScore ?? 0;
      const perfScore  = finalResult.performance?.performanceScore ?? 0;
      const maintScore = finalResult.maintainability?.maintainabilityScore ?? 0;
      const topIssues  = finalResult.productionReadiness?.topBlockingIssues || [];

      await db.run(
        `UPDATE projects_ai_reviews
         SET overall_score   = ?,
             review_data     = ?,
             model_version   = ?,
             status          = 'complete',
             code_quality    = ?,
             security        = ?,
             performance     = ?,
             maintainability = ?,
             suggestions     = ?
         WHERE project_id = ? AND commit_hash = ?`,
        [
          pri,
          JSON.stringify(finalResult),
          finalResult.modelVersion,
          String(finalResult.architecture?.architectureScore ?? 0),
          String(secScore),
          String(perfScore),
          String(maintScore),
          JSON.stringify(topIssues),
          projectId, commitHash
        ]
      );
      finalResult.overallScore = pri;

      console.log(`[AIReview] PRI=${pri}/100 hash=${commitHash} ms=${finalResult.processingMs} deploy=${finalResult.productionReadiness?.deploymentCategory || 'N/A'}`);
      return finalResult;

    } catch (err) {
      console.error('[AIReview] Failed for commit', commitHash, ':', err.message);
      await db.run(
        `UPDATE projects_ai_reviews SET status = 'failed' WHERE commit_hash = ?`,
        [commitHash]
      ).catch(() => {});
      throw err;
    }
  }

  // --- LLM Enhancement -----------------------------------------------------
  async _enhanceWithLLM(staticResult, files) {
    const codeSnippet = this._buildCodeSnippet(files, 8000);
    const pri = staticResult.productionReadiness?.productionReadinessIndex ?? staticResult.overallScore ?? 0;
    const prompt = [
      'You are a principal software engineer performing an enterprise-grade code audit.',
      'No motivational language. Be direct, evidence-based, and file-specific.',
      '',
      'STATIC ANALYSIS CONTEXT:',
      `  Production Readiness Index : ${pri}/100`,
      `  Deployment Category        : ${staticResult.productionReadiness?.deploymentCategory || 'Unknown'}`,
      `  Files                      : ${staticResult.details?.fileCount || 0}`,
      `  Total Lines                : ${(staticResult.details?.totalLines || 0).toLocaleString()}`,
      `  Languages                  : ${(staticResult.details?.languages || []).map(l=>l.lang).join(', ')}`,
      `  Security Score             : ${staticResult.security?.securityScore ?? 0}/100`,
      `  Critical Issues            : ${staticResult.security?.criticalIssues?.length ?? 0}`,
      `  Architecture Score         : ${staticResult.architecture?.architectureScore ?? 0}/100`,
      `  Maintainability Score      : ${staticResult.maintainability?.maintainabilityScore ?? 0}/100`,
      '',
      'CODE SAMPLE (first 8KB):',
      codeSnippet,
      '',
      'Return ONLY valid JSON (no markdown fences, no comments) with this EXACT structure:',
      '{',
      '  "security": {',
      '    "securityScore":number,',
      '    "criticalIssues":[{"file":string,"line":number,"issue":string}],',
      '    "highIssues":[{"file":string,"line":number,"issue":string}],',
      '    "mediumIssues":[{"file":string,"issue":string}],',
      '    "securitySummary":string',
      '  },',
      '  "architecture": {',
      '    "architectureScore":number,',
      '    "modularityLevel":"High|Medium|Low",',
      '    "couplingRisk":number,',
      '    "architecturalWeaknesses":[string],',
      '    "refactorRecommendations":[string]',
      '  },',
      '  "maintainability": {',
      '    "maintainabilityScore":number,',
      '    "largeFunctionCount":number,',
      '    "duplicationRisk":"Low|Medium|High",',
      '    "codeSmellIndicators":[string],',
      '    "readabilityAssessment":string',
      '  },',
      '  "performance": {',
      '    "performanceScore":number,',
      '    "scalingRiskLevel":"Low|Medium|High",',
      '    "bottleneckIndicators":[string],',
      '    "estimatedRiskAtScale":{"10k":string,"100k":string}',
      '  },',
      '  "reliability": {',
      '    "reliabilityScore":number,',
      '    "testCoverageEstimate":string,',
      '    "errorHandlingQuality":string,',
      '    "loggingQuality":string,',
      '    "reliabilityConcerns":[string]',
      '  },',
      '  "productionReadiness": {',
      '    "productionReadinessIndex":number,',
      '    "deploymentCategory":"Prototype|Pre-Production|Production-Ready|High Risk",',
      '    "topBlockingIssues":[string],',
      '    "executiveSummary":string',
      '  },',
      '  "technicalDebtScore":number,',
      '  "refactorEffortEstimate":"Low|Medium|High",',
      '  "systemComplexityIndex":number',
      '}'
    ].join('\n');

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LLM_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: LLM_MODEL, temperature: 0.1, max_tokens: 1800,
        messages: [{ role: 'user', content: prompt }] })
    });
    if (!resp.ok) throw new Error(`OpenAI ${resp.status}`);
    const raw = (await resp.json()).choices?.[0]?.message?.content || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON in LLM response');
    const llm = JSON.parse(match[0]);
    // Merge: LLM overrides static analysis but preserves metadata
    return {
      ...staticResult,
      security:          { ...staticResult.security,          ...llm.security },
      architecture:      { ...staticResult.architecture,      ...llm.architecture },
      maintainability:   { ...staticResult.maintainability,   ...llm.maintainability },
      performance:       { ...staticResult.performance,       ...llm.performance },
      reliability:       { ...staticResult.reliability,       ...llm.reliability },
      productionReadiness: { ...staticResult.productionReadiness, ...llm.productionReadiness },
      technicalDebtScore:    llm.technicalDebtScore    ?? staticResult.technicalDebtScore,
      refactorEffortEstimate: llm.refactorEffortEstimate ?? staticResult.refactorEffortEstimate,
      systemComplexityIndex:  llm.systemComplexityIndex  ?? staticResult.systemComplexityIndex,
      details: staticResult.details
    };
  }

  _buildCodeSnippet(files, maxChars) {
    const codeExts = new Set(['js','jsx','ts','tsx','py','java','cs','rb','go','php','cpp','c','rs']);
    let total = 0;
    const parts = [];
    const sorted = [...files]
      .filter(f => codeExts.has((f.file_type||'').toLowerCase()) && f.file_content && !f.file_content.startsWith('[binary'))
      .sort((a,b) => (a.file_size||0)-(b.file_size||0));
    for (const f of sorted) {
      if (total >= maxChars) break;
      const excerpt = (f.file_content||'').substring(0, Math.min(1500, maxChars - total));
      parts.push(`// FILE: ${f.file_path}\n${excerpt}`);
      total += excerpt.length;
    }
    return parts.join('\n\n') || '// No analyzable code files';
  }

  async getLatestForProject(projectId) {
    return db.get(
      `SELECT * FROM projects_ai_reviews WHERE project_id = ? ORDER BY created_at DESC LIMIT 1`,
      [projectId]
    );
  }

  async getByCommitHash(commitHash) {
    return db.get(
      `SELECT * FROM projects_ai_reviews WHERE commit_hash = ?`,
      [commitHash]
    );
  }
}

module.exports = new AIReviewEngine();
