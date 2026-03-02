/**
 * ========================================================================
 * DEVELOPER CAPABILITY INTELLIGENCE SYSTEM
 * Main Orchestrator - Production-Level AI Skill Intelligence Engine
 * ========================================================================
 * 
 * Enterprise-grade 6-layer AI evaluation pipeline:
 * 
 * Layer 1: Resume & Profile Semantic Parsing
 * Layer 2: Code Evidence Verification (Depth Detection)
 * Layer 3: Code Quality & Engineering Standards
 * Layer 4: Industry Role Benchmark Matching
 * Layer 5: Commit-Based Cross Validation (Growth Trajectory Intelligence)
 * Layer 6: Skill Authenticity Index & Career Projection
 * 
 * Advanced Metrics Engine:
 * - Developer Capability Index (DCI)
 * - Engineering Maturity Score
 * - Architectural Thinking Score
 * - Scalability Readiness
 * - Security Hygiene Index
 * - Maintainability Index
 * - Industry Competitiveness Index
 * 
 * This is not a resume checker.
 * This is Developer Intelligence Infrastructure.
 * Built for scale: 1M+ developers.
 */

const { StructuredParsingEngine } = require('./layer1-structuredParsing');
const { DepthDetectionEngine } = require('./layer2-depthDetection');
const { CodeQualityEngine } = require('./layer3-codeQuality');
const { IndustryBenchmarkEngine } = require('./layer3-industryBenchmark');
const { CommitCrossValidationEngine } = require('./layer4-commitValidation');
const { CareerProjectionEngine } = require('./layer5-careerProjection');
const { AdvancedMetricsEngine } = require('./advancedMetrics');
const { AuditLogger } = require('../multiAI/auditLogger');
const { v4: uuidv4 } = require('uuid');

class DeveloperCapabilityIntelligence {
  constructor(options = {}) {
    this.analysisId = null;
    this.auditLogger = options.auditLogger || new AuditLogger({ logLevel: 'info' });

    // Initialize all 6 layers
    this.layer1 = new StructuredParsingEngine({ auditLogger: this.auditLogger });
    this.layer2 = new DepthDetectionEngine({ auditLogger: this.auditLogger });
    this.layer3 = new CodeQualityEngine({ auditLogger: this.auditLogger }); // NEW: Code Quality
    this.layer4 = new IndustryBenchmarkEngine({ auditLogger: this.auditLogger });
    this.layer5 = new CommitCrossValidationEngine({
      auditLogger: this.auditLogger,
      projectWorkspaceService: options.projectWorkspaceService
    });
    this.layer6 = new CareerProjectionEngine({ auditLogger: this.auditLogger });

    // Initialize Advanced Metrics Engine
    this.metricsEngine = new AdvancedMetricsEngine();

    this.log('✅ Enterprise AI Skill Intelligence Engine initialized (6 layers + Advanced Metrics)');
  }

  /**
   * MAIN ANALYSIS PIPELINE
   * 
   * Execute complete 6-layer enterprise intelligence analysis
   */
  async analyzeCapability(resumeData, userId, options = {}) {
    this.analysisId = uuidv4();
    const startTime = Date.now();

    this.log('\n' + '='.repeat(80));
    this.log(`🧠 PRODUCTION-LEVEL AI SKILL INTELLIGENCE ENGINE`);
    this.log(`Analysis ID: ${this.analysisId}`);
    this.log(`User ID: ${userId}`);
    this.log('='.repeat(80) + '\n');

    try {
      const result = {
        analysisId: this.analysisId,
        timestamp: new Date().toISOString(),
        userId,
        layers: {},
        advancedMetrics: {}
      };

      // =====================================================
      // LAYER 1: Resume & Profile Semantic Parsing
      // =====================================================
      this.log('🔹 Layer 1: Resume & Profile Semantic Parsing...');
      const layer1Result = await this.layer1.parse(
        resumeData.text,
        resumeData.extractedSkills || []
      );
      result.layers.layer1 = layer1Result;

      // =====================================================
      // LAYER 2: Code Evidence Verification (Depth Detection)
      // =====================================================
      this.log('🔹 Layer 2: Code Evidence Verification...');
      const layer2Result = await this.layer2.analyze(
        resumeData.text,
        layer1Result.normalizedSkills,
        resumeData.structure || {}
      );
      result.layers.layer2 = layer2Result;

      // =====================================================
      // LAYER 3: Code Quality & Engineering Standards
      // =====================================================
      this.log('🔹 Layer 3: Code Quality & Engineering Standards...');
      const projects = options.projects || [];
      const layer3Result = await this.layer3.analyze(projects, resumeData);
      result.layers.layer3 = layer3Result;

      // =====================================================
      // LAYER 4: Industry Role Benchmark Matching
      // =====================================================
      this.log('🔹 Layer 4: Industry Role Benchmark Matching...');
      const layer4Result = await this.layer4.analyze(
        layer1Result.normalizedSkills,
        layer2Result
      );
      result.layers.layer4 = layer4Result;

      // =====================================================
      // LAYER 5: Commit-Based Cross Validation
      // =====================================================
      this.log('🔹 Layer 5: Commit-Based Cross Validation...');
      const layer5Result = await this.layer5.analyze(
        layer1Result.normalizedSkills,
        layer2Result,
        userId
      );
      result.layers.layer5 = layer5Result;

      // =====================================================
      // LAYER 6: Skill Authenticity & Career Projection
      // =====================================================
      this.log('🔹 Layer 6: Career Projection & Authenticity...');
      const layer6Result = await this.layer6.analyze(
        {
          totalSkills: layer1Result.normalizedSkills.length,
          depthScore: layer2Result.summary.depthScore,
          diversityScore: layer1Result.metrics.diversityScore
        },
        layer4Result,
        layer5Result,
        options.historicalData
      );
      result.layers.layer6 = layer6Result;

      // =====================================================
      // ADVANCED METRICS CALCULATION
      // =====================================================
      this.log('🔹 Calculating Advanced Enterprise Metrics...');
      result.advancedMetrics = this.metricsEngine.calculateAllMetrics(result.layers);

      // =====================================================
      // SYNTHESIZE FINAL INTELLIGENCE REPORT
      // =====================================================
      result.intelligence = this.synthesizeIntelligence(result.layers, result.advancedMetrics);

      // =====================================================
      // VISUALIZATIONS DATA
      // =====================================================
      result.visualizations = this.prepareVisualizations(result.layers, result.advancedMetrics);

      const totalTime = Date.now() - startTime;
      result.processingTime = totalTime;

      this.log('\n' + '='.repeat(80));
      this.log(`✅ ENTERPRISE INTELLIGENCE ANALYSIS COMPLETE`);
      this.log(`Total Processing Time: ${totalTime}ms`);
      this.log(`Developer Capability Index (DCI): ${result.advancedMetrics.developerCapabilityIndex}/100`);
      this.log(`Engineering Maturity: ${result.advancedMetrics.engineeringMaturityScore}/100`);
      this.log(`Market Readiness: ${result.intelligence.marketReadiness}`);
      this.log(`Overall Rating: ${result.advancedMetrics.overallRating}`);
      this.log('='.repeat(80) + '\n');

      return {
        success: true,
        ...result
      };

    } catch (error) {
      this.log(`❌ Analysis failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Synthesize intelligence from all layers + advanced metrics
   * ✅ FIXED: Populates strongAreas, weaknessAreas, criticalGaps, skillsWithEvidence
   */
  synthesizeIntelligence(layers, advancedMetrics) {
    // ✅ FIX: Use layers.layer4 (layers.benchmark does NOT exist)
    const layer1 = layers.layer1;
    const layer2 = layers.layer2;
    const layer4 = layers.layer4;
    const layer5 = layers.layer5;
    const layer6 = layers.layer6;

    // =====================================================
    // BUILD STRONG AREAS (skills well demonstrated)
    // =====================================================
    const strongAreas = (layer4.bestFit.strengths || []).map(s => {
      const depthData = (layer2.skills || []).find(d =>
        d.skill && s.skill && d.skill.toLowerCase() === s.skill.toLowerCase()
      );
      return {
        skill: s.skill,
        reason: s.reason || 'Demonstrated in resume',
        depthLevel: depthData ? depthData.depthLevel : 'applied',
        depthScore: depthData ? depthData.depthScore : 60,
        category: this._getSkillCategory(s.skill, layer1),
        confidence: depthData ? Math.round(depthData.depthScore) : 65,
        marketDemand: 'High'
      };
    });

    // =====================================================
    // BUILD WEAKNESS AREAS (present but shallow)
    // =====================================================
    const weaknessAreas = (layer4.bestFit.gaps || [])
      .filter(g => g.priority === 'HIGH')
      .map(g => {
        const depthData = (layer2.skills || []).find(d =>
          d.skill && g.skill && d.skill.toLowerCase().includes(g.skill.toLowerCase())
        );
        return {
          skill: g.skill,
          priority: 'High Impact',
          reason: g.reason || 'Needs deeper demonstration',
          depthLevel: depthData ? depthData.depthLevel : 'surface',
          category: this._getSkillCategory(g.skill, layer1),
          confidence: depthData ? Math.round(depthData.depthScore * 0.5) : 30,
          weeksToBridge: 4,
          marketDemand: 'High'
        };
      });

    // =====================================================
    // BUILD CRITICAL GAPS (completely missing)
    // =====================================================
    const criticalGaps = (layer4.bestFit.gaps || [])
      .filter(g => g.priority === 'CRITICAL')
      .map(g => ({
        skill: g.skill,
        priority: 'Critical',
        reason: g.reason || 'Required for this role',
        depthLevel: 'not-detected',
        category: this._getSkillCategory(g.skill, layer1),
        confidence: 0,
        weeksToBridge: this._estimateWeeksToBridge(g.skill),
        marketDemand: 'Very High',
        learningPath: `Start with ${g.skill} fundamentals → build a project → add to portfolio`
      }));

    // =====================================================
    // BUILD SKILLS WITH EVIDENCE (all detected skills)
    // =====================================================
    const allDetectedSkills = layer1.normalizedSkills || [];
    const skillsWithEvidence = allDetectedSkills.map(skill => {
      const depthData = (layer2.skills || []).find(d =>
        d.skill && d.skill.toLowerCase() === skill.toLowerCase()
      );
      const isStrong = strongAreas.some(s => s.skill.toLowerCase() === skill.toLowerCase());
      const isWeak = weaknessAreas.some(w => w.skill.toLowerCase() === skill.toLowerCase());
      const priority = isStrong ? 'Strong' : isWeak ? 'High Impact' : 'Optional';
      const confidence = depthData ? Math.round(depthData.depthScore) : 50;
      return {
        skill,
        priority,
        confidence,
        depthLevel: depthData ? depthData.depthLevel : 'surface',
        category: this._getSkillCategory(skill, layer1),
        reason: isStrong
          ? 'Demonstrated with evidence in resume'
          : isWeak
            ? 'Mentioned but needs deeper demonstration'
            : 'Detected in resume',
        marketImpact: isStrong ? 'Competitive advantage' : 'Foundational',
        evidenceCount: depthData ? (depthData.evidenceCount || 1) : 1
      };
    });

    // =====================================================
    // OVERALL CAPABILITY SCORE
    // =====================================================
    const overallCapability = advancedMetrics.developerCapabilityIndex ||
      Math.round(
        (strongAreas.length / Math.max(strongAreas.length + criticalGaps.length, 1)) * 100
      );

    const intelligence = {
      // ✅ PRIMARY FIELDS (read by backend route & frontend)
      strongAreas,
      weaknessAreas,
      criticalGaps,
      skillsWithEvidence,
      overallCapability,

      // Advanced Metrics
      developerCapabilityIndex: advancedMetrics.developerCapabilityIndex,
      engineeringMaturityScore: advancedMetrics.engineeringMaturityScore,
      architecturalThinkingScore: advancedMetrics.architecturalThinkingScore,
      scalabilityReadiness: advancedMetrics.scalabilityReadiness,
      securityHygieneIndex: advancedMetrics.securityHygieneIndex,
      industryCompetitivenessIndex: advancedMetrics.industryCompetitivenessIndex,
      productionReadinessScore: advancedMetrics.productionReadinessScore,

      // Legacy compatibility
      overallScore: overallCapability,
      overallRating: advancedMetrics.overallRating,
      competitiveStanding: advancedMetrics.competitiveStanding,
      readinessLevel: advancedMetrics.readinessLevel,
      marketPosition: advancedMetrics.marketPosition,
      strengthAreas: strongAreas.map(s => s.skill),
      improvementAreas: weaknessAreas.map(w => ({ skill: w.skill, priority: w.priority })),

      // Market readiness
      marketReadiness: layer4.bestFit.readinessLevel || 'Developing',
      skillAuthenticity: layer5.validated ? layer5.authenticityScore : 50,
      careerTrajectory: layer6 && layer6.projections && layer6.projections.oneYear
        ? `${layer6.projections.oneYear.readinessLevel} in 12 months`
        : 'Continuous growth trajectory',

      // Insights
      keyInsights: [
        `Best role match: ${layer4.bestFit.role} (${layer4.bestFit.alignmentScore}% alignment)`,
        `${strongAreas.length} skills strongly demonstrated`,
        `${criticalGaps.length} critical gaps to bridge for job readiness`,
        `${(layer2.classified && layer2.classified.expert) ? layer2.classified.expert.length : 0} expert-level skills validated`,
        `Engineering Maturity: ${advancedMetrics.engineeringMaturityScore}/100`
      ],
      criticalActions: criticalGaps.slice(0, 3).map(g =>
        `Learn ${g.skill} — ${g.reason} (est. ${g.weeksToBridge}w)`
      ),

      // Role alignment data
      bestRoleMatch: {
        role: layer4.bestFit.role,
        alignmentScore: layer4.bestFit.alignmentScore,
        readinessLevel: layer4.bestFit.readinessLevel,
        gaps: layer4.bestFit.gaps.length,
        strengths: layer4.bestFit.strengths.length
      },
      topRoleMatches: (layer4.topThree || []).map(r => ({
        role: r.role,
        alignmentScore: r.alignmentScore,
        readinessLevel: r.readinessLevel,
        gapCount: r.gaps ? r.gaps.length : 0
      })),
      marketInsights: layer4.marketInsights || {},
      compensationEstimate: layer4.compensationEstimate || {}
    };

    return intelligence;
  }

  /**
   * Get skill category from layer1 capability graph
   */
  _getSkillCategory(skill, layer1) {
    if (!layer1 || !layer1.capabilityGraph) return 'general';
    const categories = layer1.capabilityGraph.categories || {};
    for (const [cat, skills] of Object.entries(categories)) {
      if ((skills || []).some(s => s.skill && s.skill.toLowerCase() === skill.toLowerCase())) {
        return cat;
      }
    }
    return 'general';
  }

  /**
   * Estimate weeks to bridge a skill gap
   */
  _estimateWeeksToBridge(skill) {
    const complexSkills = ['System Design', 'Distributed Systems', 'Kubernetes', 'Machine Learning', 'GraphQL', 'Microservices'];
    const mediumSkills = ['TypeScript', 'Docker', 'AWS', 'PostgreSQL', 'Testing', 'CI/CD', 'Redis'];
    if (complexSkills.some(s => skill.toLowerCase().includes(s.toLowerCase()))) return 8;
    if (mediumSkills.some(s => skill.toLowerCase().includes(s.toLowerCase()))) return 4;
    return 2;
  }

  /**
   * Prepare data for elite quantum dashboard visualizations
   */
  prepareVisualizations(layers, advancedMetrics) {
    return {
      // PRIMARY VISUALIZATIONS

      // 1. Skill Radar Chart (Multi-axis capability mapping)
      radarChart: this.buildRadarChartData(layers),

      // 2. Market Readiness Dashboard (Role alignment bars)
      marketReadinessScores: this.buildMarketReadinessData(layers),

      // 3. Weakness Heatmap (Risk-colored category grid)
      weaknessHeatmap: this.buildHeatmapData(layers),

      // 4. Career Trajectory Timeline (Multi-period projection)
      careerTrajectory: this.buildTrajectoryData(layers),

      // 5. Skill Authenticity Index (Claimed vs Demonstrated)
      authenticityIndex: this.buildAuthenticityData(layers),

      // 6. Confidence Degradation Alerts
      degradationAlerts: layers.layer6?.projections?.degradationAlerts || [],

      // ADVANCED METRICS VISUALIZATIONS

      // 7. Developer Capability Index (DCI) Breakdown
      dciBreakdown: advancedMetrics.breakdown.dci,

      // 8. Engineering Excellence Dashboard
      engineeringExcellence: {
        maturityScore: advancedMetrics.engineeringMaturityScore,
        architectureScore: advancedMetrics.architecturalThinkingScore,
        scalabilityScore: advancedMetrics.scalabilityReadiness,
        securityScore: advancedMetrics.securityHygieneIndex,
        maintainabilityScore: advancedMetrics.maintainabilityIndex
      },

      // 9. Code Quality Insights (Layer 3)
      codeQuality: {
        complexity: layers.layer3.complexityAnalysis,
        modularity: layers.layer3.modularityScore,
        testCoverage: layers.layer3.testCoverageAnalysis,
        security: layers.layer3.securityHygiene,
        architecture: layers.layer3.architectureInsights,
        recommendations: layers.layer3.recommendations
      },

      // 10. Production Readiness Meter
      productionReadiness: {
        score: advancedMetrics.productionReadinessScore,
        level: advancedMetrics.readinessLevel,
        components: this.buildProductionReadinessComponents(advancedMetrics)
      },

      // 11. Innovation Potential & Learning Velocity
      innovation: {
        potential: advancedMetrics.innovationPotential,
        learningVelocity: advancedMetrics.learningVelocity,
        careerMomentum: advancedMetrics.careerMomentum
      },

      // 12. Market Position & Competitiveness
      marketPosition: {
        tier: advancedMetrics.marketPosition.tier,
        confidence: advancedMetrics.marketPosition.confidence,
        targetCompanies: advancedMetrics.marketPosition.targetCompanies,
        salary: advancedMetrics.marketPosition.salary,
        competitiveStanding: advancedMetrics.competitiveStanding
      }
    };
  }

  /**
   * Build radar chart data
   */
  buildRadarChartData(layers) {
    const categories = Object.keys(layers.layer1.capabilityGraph.categories);
    const data = [];

    categories.forEach(category => {
      const skills = layers.layer1.capabilityGraph.categories[category] || [];
      const depthScores = skills.map(s => {
        const depthData = layers.layer2.skills.find(d => d.skill === s.skill);
        return depthData ? depthData.depthScore : 0;
      });

      const avgScore = depthScores.length > 0
        ? depthScores.reduce((a, b) => a + b, 0) / depthScores.length
        : 0;

      data.push({
        axis: category,
        value: Math.round(avgScore),
        skillCount: skills.length
      });
    });

    return data;
  }

  /**
   * Build market readiness data
   */
  buildMarketReadinessData(layers) {
    return layers.layer4.allMatches.map(match => ({
      role: match.role,
      alignmentScore: match.alignmentScore,
      readinessLevel: match.readinessLevel,
      requiredMatched: match.required.matched.length,
      requiredTotal: match.required.matched.length + match.required.missing.length,
      gaps: match.gaps.length
    }));
  }

  /**
   * Build weakness heatmap
   */
  buildHeatmapData(layers) {
    const heatmap = [];

    // Map categories to gap severity
    const categories = Object.keys(layers.layer1.capabilityGraph.categories);

    categories.forEach(category => {
      const categorySkills = layers.layer1.capabilityGraph.categories[category] || [];
      const gaps = layers.layer4.bestFit.gaps.filter(g =>
        categorySkills.some(s => s.skill.toLowerCase().includes(g.skill.toLowerCase()))
      );

      const criticalGaps = gaps.filter(g => g.priority === 'CRITICAL').length;
      const highGaps = gaps.filter(g => g.priority === 'HIGH').length;

      // Risk level: 0-100
      const riskLevel = (criticalGaps * 20) + (highGaps * 10);

      heatmap.push({
        category,
        riskLevel: Math.min(riskLevel, 100),
        criticalGaps,
        highGaps,
        color: riskLevel > 60 ? 'red' : riskLevel > 30 ? 'orange' : 'green'
      });
    });

    return heatmap;
  }

  /**
   * Build career trajectory data
   */
  buildTrajectoryData(layers) {
    const proj = layers.layer6.projections;

    return {
      timeline: [
        {
          period: 'Current',
          alignment: proj.current.industryAlignment,
          depth: proj.current.depthScore,
          readiness: proj.current.readinessLevel,
          salary: proj.current.estimatedSalary
        },
        {
          period: '6 Months',
          alignment: proj.sixMonth.projectedAlignment,
          depth: proj.sixMonth.projectedDepth,
          readiness: proj.sixMonth.readinessLevel,
          salary: layers.layer6.projections.compensationTrajectory[1].average
        },
        {
          period: '1 Year',
          alignment: proj.oneYear.projectedAlignment,
          depth: proj.oneYear.projectedDepth,
          readiness: proj.oneYear.readinessLevel,
          salary: layers.layer6.projections.compensationTrajectory[2].average
        }
      ],
      milestones: proj.milestones,
      skillTimeline: proj.skillTimeline
    };
  }

  /**
   * Build authenticity index data
   */
  buildAuthenticityData(layers) {
    if (!layers.layer5.validated) {
      return {
        score: 50,
        status: 'Unverifiable',
        message: 'No projects available for validation'
      };
    }

    const validation = layers.layer5;

    return {
      score: validation.authenticityScore,
      verified: validation.summary.verified,
      mismatches: validation.summary.mismatches,
      unverifiable: validation.summary.unverifiable,
      status: validation.authenticityScore >= 75 ? 'High Authenticity' :
        validation.authenticityScore >= 50 ? 'Moderate Authenticity' :
          'Low Authenticity',
      flaggedClaims: validation.mismatches,
      projectCount: validation.projectCount
    };
  }

  /**
   * Build production readiness components
   */
  buildProductionReadinessComponents(advancedMetrics) {
    return {
      codeQuality: advancedMetrics.engineeringMaturityScore,
      testCoverage: advancedMetrics.maintainabilityIndex,
      securityAwareness: advancedMetrics.securityHygieneIndex,
      skillDepth: advancedMetrics.technicalDepthScore,
      authenticity: advancedMetrics.industryCompetitivenessIndex
    };
  }

  log(message) {
    this.auditLogger.info(message);
  }
}

module.exports = { DeveloperCapabilityIntelligence };
