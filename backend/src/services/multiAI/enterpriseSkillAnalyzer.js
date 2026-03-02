/**
 * ENTERPRISE MULTI-AI SKILL ANALYZER - MAIN ORCHESTRATOR
 * 
 * Orchestrates all 6 layers of the elite skill analysis pipeline:
 * 1. Document AI (Google/Azure)
 * 2. NLP Extraction (AWS Comprehend/Azure)
 * 3. LLM Inference (OpenAI GPT-4/Claude)
 * 4. Market Intelligence (LinkedIn/Lightcast/O*NET)
 * 5. Confidence Engine (Rules-based scoring)
 * 6. Arbitration (Independent LLM validation)
 * 
 * @module EnterpriseSkillAnalyzer
 */

const { DocumentAILayer } = require('./layer1-documentAI');
const { NLPExtractionLayer } = require('./layer2-nlpExtraction');
const { LLMInferenceLayer } = require('./layer3-llmInference');
const { MarketIntelligenceLayer } = require('./layer4-marketIntelligence');
const { ConfidenceAndArbitrationEngine } = require('./layer5-6-confidenceArbitration');
const { AuditLogger } = require('./auditLogger');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const fs = require('fs').promises;

class EnterpriseSkillAnalyzer {
  constructor(config = {}) {
    this.analysisId = null;
    this.enableFallback = config.enableFallback !== false;
    
    // Initialize audit logger
    this.auditLogger = new AuditLogger({
      logLevel: process.env.AUDIT_LOG_LEVEL || 'info',
      retentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS) || 90
    });
    
    // Initialize all layers
    this.initializeLayers();
    
    // Cost tracking
    this.totalCost = 0;
    this.budgetLimit = parseFloat(process.env.DAILY_BUDGET_USD) || 50.00;
    
    this.auditLogger.info('🚀 Enterprise Skill Analyzer initialized');
  }

  /**
   * Initialize all 6 layers
   */
  initializeLayers() {
    this.layer1 = new DocumentAILayer({
      auditLogger: this.auditLogger,
      enableFallback: this.enableFallback
    });
    
    this.layer2 = new NLPExtractionLayer({
      auditLogger: this.auditLogger,
      enableFallback: this.enableFallback
    });
    
    this.layer3 = new LLMInferenceLayer({
      auditLogger: this.auditLogger,
      enableFallback: this.enableFallback
    });
    
    this.layer4 = new MarketIntelligenceLayer({
      auditLogger: this.auditLogger
    });
    
    this.layer5and6 = new ConfidenceAndArbitrationEngine({
      auditLogger: this.auditLogger
    });
    
    this.auditLogger.info('✅ All 6 layers initialized successfully');
  }

  /**
   * MAIN ANALYSIS PIPELINE
   * 
   * Orchestrates complete 6-layer analysis
   * 
   * @param {string} filePath - Path to resume file
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Complete skill assessment
   */
  async analyzeResume(filePath, options = {}) {
    const startTime = Date.now();
    this.analysisId = uuidv4();
    
    this.auditLogger.info(`\n${'='.repeat(80)}`);
    this.auditLogger.info(`🎯 STARTING ENTERPRISE SKILL ANALYSIS: ${this.analysisId}`);
    this.auditLogger.info(`${'='.repeat(80)}\n`);
    
    try {
      // Calculate file hash for audit trail
      const fileHash = await this.calculateFileHash(filePath);
      
      // Check budget before proceeding
      await this.checkBudget();
      
      // LAYER 1: Document AI Processing
      this.auditLogger.info('📄 LAYER 1: Document AI Processing...');
      const layer1Data = await this.layer1.processDocument(filePath, {
        enableFallback: this.enableFallback
      });
      this.auditLogger.info(`✅ Layer 1 complete - Confidence: ${(layer1Data.confidence * 100).toFixed(1)}%\n`);
      
      // LAYER 2: NLP Extraction
      this.auditLogger.info('🔍 LAYER 2: NLP Skill Extraction...');
      const layer2Data = await this.layer2.extractSkills(layer1Data, {
        enableFallback: this.enableFallback
      });
      this.auditLogger.info(`✅ Layer 2 complete - ${layer2Data.metadata.totalSkills} skills detected\n`);
      
      // LAYER 3: LLM Inference
      this.auditLogger.info('🧠 LAYER 3: LLM Inference...');
      const layer3Data = await this.layer3.inferSkills(layer1Data, layer2Data, {
        enableFallback: this.enableFallback
      });
      this.auditLogger.info(`✅ Layer 3 complete - ${layer3Data.metadata.totalInferred} skills inferred\n`);
      
      // LAYER 4: Market Intelligence
      this.auditLogger.info('📊 LAYER 4: Market Intelligence...');
      const allSkills = this.collectUniqueSkills(layer2Data, layer3Data);
      const targetRole = options.targetRole || 'Software Engineer';
      const layer4Data = await this.layer4.validateSkills(allSkills, targetRole, {
        enableFallback: this.enableFallback
      });
      this.auditLogger.info(`✅ Layer 4 complete - Market data for ${layer4Data.metadata.totalSkills} skills\n`);
      
      // LAYER 5 & 6: Confidence Scoring + Arbitration
      this.auditLogger.info('⚖️ LAYER 5 & 6: Confidence Scoring + Arbitration...');
      const finalAssessment = await this.layer5and6.analyzeAndArbitrate(
        layer1Data,
        layer2Data,
        layer3Data,
        layer4Data,
        options
      );
      this.auditLogger.info(`✅ Layers 5 & 6 complete - ${finalAssessment.metadata.totalSkills} skills assessed\n`);
      
      // Calculate total cost
      this.totalCost = this.calculateTotalCost([
        layer1Data.auditTrail,
        layer2Data.auditTrail,
        layer3Data.auditTrail,
        layer4Data.auditTrail,
        ...finalAssessment.auditTrail.layers.map(l => l.auditTrail)
      ]);
      
      const totalTime = Date.now() - startTime;
      
      // Build comprehensive result
      const result = {
        analysisId: this.analysisId,
        timestamp: new Date().toISOString(),
        resume: {
          fileName: layer1Data.metadata.fileName,
          fileHash,
          fileSize: layer1Data.metadata.fileSize
        },
        finalAssessment: finalAssessment.finalAssessment,
        skillBreakdown: this.buildSkillBreakdown(finalAssessment),
        marketInsights: this.buildMarketInsights(layer4Data, finalAssessment),
        metadata: {
          totalSkills: finalAssessment.metadata.totalSkills,
          strongSkills: finalAssessment.metadata.strongSkills,
          needsImprovement: finalAssessment.metadata.needsImprovement,
          notDemonstrated: finalAssessment.metadata.notDemonstrated,
          avgConfidence: finalAssessment.metadata.avgConfidence,
          overallQuality: finalAssessment.arbitration.overallQuality,
          totalTime,
          totalCost: this.totalCost.toFixed(4)
        },
        auditTrail: this.buildAuditTrail({
          layer1Data,
          layer2Data,
          layer3Data,
          layer4Data,
          finalAssessment,
          fileHash,
          totalTime
        }),
        warnings: finalAssessment.arbitration.warnings || [],
        conflicts: finalAssessment.arbitration.conflictsResolved || []
      };
      
      // Log audit trail
      await this.auditLogger.logAnalysis(result);
      
      // Check cost alerts
      await this.checkCostAlert();
      
      this.auditLogger.info(`\n${'='.repeat(80)}`);
      this.auditLogger.info(`✅ ANALYSIS COMPLETE: ${this.analysisId}`);
      this.auditLogger.info(`   Skills: ${result.metadata.totalSkills} (${result.metadata.strongSkills} strong)`);
      this.auditLogger.info(`   Cost: $${result.metadata.totalCost}`);
      this.auditLogger.info(`   Time: ${(totalTime / 1000).toFixed(2)}s`);
      this.auditLogger.info(`${'='.repeat(80)}\n`);
      
      return result;
      
    } catch (error) {
      this.auditLogger.error(`❌ ANALYSIS FAILED: ${error.message}`);
      await this.auditLogger.logError(this.analysisId, error);
      throw error;
    }
  }

  /**
   * Collect unique skills from layers 2 and 3
   */
  collectUniqueSkills(layer2Data, layer3Data) {
    const skillsSet = new Set();
    
    layer2Data.skillAnalysis?.forEach(s => skillsSet.add(s.skill));
    layer3Data.inferredSkills?.forEach(s => skillsSet.add(s.skill));
    Object.keys(layer3Data.proficiencyLevels || {}).forEach(s => skillsSet.add(s));
    
    return Array.from(skillsSet);
  }

  /**
   * Build skill breakdown for UI
   */
  buildSkillBreakdown(finalAssessment) {
    const skills = finalAssessment.finalAssessment.skills;
    
    return {
      byCategory: this.groupByCategory(skills),
      byClassification: {
        strong: skills.filter(s => s.finalClassification === 'Strong'),
        needsImprovement: skills.filter(s => s.finalClassification === 'Needs Improvement'),
        notDemonstrated: skills.filter(s => s.finalClassification === 'Not Demonstrated')
      },
      topSkills: skills
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10),
      needsReview: skills.filter(s => s.manualReviewNeeded)
    };
  }

  /**
   * Group skills by category
   */
  groupByCategory(skills) {
    const grouped = {};
    
    skills.forEach(skill => {
      const category = skill.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(skill);
    });
    
    return grouped;
  }

  /**
   * Build market insights summary
   */
  buildMarketInsights(layer4Data, finalAssessment) {
    return {
      roleAlignment: layer4Data.roleAlignment,
      avgMarketDemand: layer4Data.metadata.avgMarketDemand,
      avgSalaryImpact: layer4Data.metadata.avgSalaryImpact,
      topDemandSkills: layer4Data.aggregateStats?.topDemandSkills || [],
      criticalGaps: layer4Data.roleAlignment?.criticalGaps || [],
      recommendations: layer4Data.roleAlignment?.recommendations || []
    };
  }

  /**
   * Build comprehensive audit trail
   */
  buildAuditTrail(data) {
    return {
      analysisId: this.analysisId,
      timestamp: new Date().toISOString(),
      resumeHash: data.fileHash,
      layers: [
        data.layer1Data.auditTrail,
        data.layer2Data.auditTrail,
        data.layer3Data.auditTrail,
        data.layer4Data.auditTrail,
        ...data.finalAssessment.auditTrail.layers.map(l => l.auditTrail)
      ],
      decisionChain: this.buildDecisionChain(data.finalAssessment),
      totalCost: this.totalCost.toFixed(4),
      totalTime: data.totalTime,
      qualityScore: data.finalAssessment.arbitration.overallQuality
    };
  }

  /**
   * Build decision chain for each skill
   */
  buildDecisionChain(finalAssessment) {
    return finalAssessment.confidenceAnalysis.skills.map(skill => ({
      skill: skill.skill,
      layer1: { detected: skill.evidenceBreakdown.documentAI > 0, confidence: skill.evidenceBreakdown.documentAI },
      layer2: { detected: skill.evidenceBreakdown.nlpExplicit > 0, confidence: skill.evidenceBreakdown.nlpExplicit, mentions: skill.mentions },
      layer3: { proficiency: skill.proficiencyLevel, confidence: skill.evidenceBreakdown.llmInference },
      layer4: { marketDemand: skill.evidenceBreakdown.marketValidation * 100, salaryImpact: skill.evidenceBreakdown.marketValidation },
      layer5: { finalScore: skill.finalConfidence, classification: skill.classification },
      layer6: { validated: true, notes: finalAssessment.finalAssessment.skills.find(s => s.skill === skill.skill)?.arbitrationNotes }
    }));
  }

  /**
   * Calculate total cost across all layers
   */
  calculateTotalCost(auditTrails) {
    return auditTrails.reduce((sum, trail) => {
      const cost = parseFloat(trail.cost) || 0;
      return sum + cost;
    }, 0);
  }

  /**
   * Calculate file hash for audit trail
   */
  async calculateFileHash(filePath) {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  /**
   * Check budget before analysis
   */
  async checkBudget() {
    const todayCost = await this.auditLogger.getTodayCost();
    
    if (todayCost >= this.budgetLimit) {
      throw new Error(`Daily budget limit reached: $${todayCost.toFixed(2)} / $${this.budgetLimit.toFixed(2)}`);
    }
    
    this.auditLogger.info(`💰 Budget check: $${todayCost.toFixed(2)} / $${this.budgetLimit.toFixed(2)} used today`);
  }

  /**
   * Check if cost alert should be sent
   */
  async checkCostAlert() {
    const todayCost = await this.auditLogger.getTodayCost();
    const threshold = this.budgetLimit * 0.8; // 80% threshold
    
    if (todayCost >= threshold) {
      this.auditLogger.warn(`⚠️ COST ALERT: $${todayCost.toFixed(2)} / $${this.budgetLimit.toFixed(2)} (${((todayCost / this.budgetLimit) * 100).toFixed(1)}% of daily budget)`);
      // TODO: Send email alert if configured
    }
  }

  /**
   * Export audit trail to file
   */
  async exportAuditTrail(analysisId, format = 'json') {
    return await this.auditLogger.exportAuditTrail(analysisId, format);
  }

  /**
   * Get analysis statistics
   */
  async getStatistics(days = 30) {
    return await this.auditLogger.getStatistics(days);
  }
}

module.exports = { EnterpriseSkillAnalyzer };
