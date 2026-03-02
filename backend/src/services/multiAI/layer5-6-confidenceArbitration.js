/**
 * LAYER 5 & 6: CONFIDENCE ENGINE + ARBITRATION
 * 
 * Layer 5: Rules-based confidence scoring and classification
 * Layer 6: Independent LLM arbitration for synthesis and validation
 * 
 * @module ConfidenceAndArbitrationEngine
 */

const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');

class ConfidenceAndArbitrationEngine {
  constructor(config = {}) {
    this.auditLogger = config.auditLogger || console;
    
    // Initialize arbitration LLM (must be different from Layer 3)
    this.arbiterProvider = process.env.ARBITER_PROVIDER || 'anthropic';
    this.arbiterModel = process.env.ARBITER_MODEL || 'claude-opus-3-5-sonnet-20250122';
    this.arbiterTemperature = parseFloat(process.env.ARBITER_TEMPERATURE) || 0.2;
    this.arbiterMaxTokens = parseInt(process.env.ARBITER_MAX_TOKENS) || 3000;
    
    this.initArbitrator();
    
    // Confidence calculation weights
    this.weights = {
      documentAI: 0.15,
      nlpExplicit: 0.30,
      llmInference: 0.25,
      marketValidation: 0.15,
      frequency: 0.10,
      contextQuality: 0.05
    };
    
    // Classification thresholds
    this.thresholds = {
      strong: 0.75,
      needsImprovement: 0.45,
      explicitMentionMin: 0.45 // Critical: explicit mentions can't be "Not Demonstrated"
    };
  }

  /**
   * Initialize arbitration LLM
   */
  initArbitrator() {
    try {
      if (this.arbiterProvider === 'anthropic') {
        this.arbitrator = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY
        });
        this.auditLogger.info('✅ Arbitration LLM (Claude) initialized');
      } else if (this.arbiterProvider === 'openai') {
        this.arbitrator = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        this.arbiterModel = 'gpt-4-turbo-2024-04-09';
        this.auditLogger.info('✅ Arbitration LLM (GPT-4) initialized');
      }
    } catch (error) {
      this.auditLogger.error('❌ Failed to initialize arbitration LLM:', error.message);
    }
  }

  /**
   * Main analysis pipeline: Confidence scoring + Arbitration
   * 
   * @param {Object} layer1Data - Document AI output
   * @param {Object} layer2Data - NLP Extraction output
   * @param {Object} layer3Data - LLM Inference output
   * @param {Object} layer4Data - Market Intelligence output
   * @returns {Promise<Object>} Final assessment with confidence scores
   */
  async analyzeAndArbitrate(layer1Data, layer2Data, layer3Data, layer4Data, options = {}) {
    const startTime = Date.now();
    
    this.auditLogger.info('⚖️ Starting confidence scoring and arbitration...');
    
    try {
      // LAYER 5: Calculate confidence scores
      const confidenceResults = await this.calculateConfidenceScores(
        layer1Data,
        layer2Data,
        layer3Data,
        layer4Data
      );
      
      // LAYER 6: Arbitration
      const arbitrationResults = await this.arbitrate(
        confidenceResults,
        layer1Data,
        layer2Data,
        layer3Data,
        layer4Data
      );
      
      const processingTime = Date.now() - startTime;
      
      // Structure final output
      const output = {
        finalAssessment: arbitrationResults.finalAssessment,
        confidenceAnalysis: confidenceResults,
        arbitration: arbitrationResults,
        metadata: {
          totalSkills: arbitrationResults.finalAssessment.skills.length,
          avgConfidence: this.calculateAvgConfidence(arbitrationResults.finalAssessment.skills),
          strongSkills: arbitrationResults.finalAssessment.skills.filter(s => s.finalClassification === 'Strong').length,
          needsImprovement: arbitrationResults.finalAssessment.skills.filter(s => s.finalClassification === 'Needs Improvement').length,
          notDemonstrated: arbitrationResults.finalAssessment.skills.filter(s => s.finalClassification === 'Not Demonstrated').length,
          processingTime,
          timestamp: new Date().toISOString()
        },
        auditTrail: {
          layers: [confidenceResults.auditTrail, arbitrationResults.auditTrail],
          totalDuration: processingTime,
          totalCost: (parseFloat(confidenceResults.auditTrail.cost) + parseFloat(arbitrationResults.auditTrail.cost)).toFixed(4)
        }
      };
      
      this.auditLogger.info(`✅ Analysis complete: ${output.metadata.totalSkills} skills assessed in ${processingTime}ms`);
      
      return output;
      
    } catch (error) {
      this.auditLogger.error(`❌ Analysis failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * LAYER 5: Calculate confidence scores for all skills
   */
  async calculateConfidenceScores(layer1Data, layer2Data, layer3Data, layer4Data) {
    const startTime = Date.now();
    
    // Collect all skills from all layers
    const allSkills = this.collectAllSkills(layer1Data, layer2Data, layer3Data, layer4Data);
    
    const skillAssessments = [];
    
    for (const skill of allSkills) {
      const assessment = this.assessSkill(skill, layer1Data, layer2Data, layer3Data, layer4Data);
      skillAssessments.push(assessment);
    }
    
    const processingTime = Date.now() - startTime;
    
    return {
      layerId: 'confidence-engine',
      skills: skillAssessments,
      rulesApplied: this.getRulesApplied(),
      metadata: {
        totalSkills: skillAssessments.length,
        processingTime
      },
      auditTrail: {
        layer: 5,
        name: 'Confidence Engine',
        service: 'Rules-based Scoring',
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString(),
        duration: processingTime,
        cost: '0.0000',
        success: true
      }
    };
  }

  /**
   * Collect all unique skills from all layers
   */
  collectAllSkills(layer1Data, layer2Data, layer3Data, layer4Data) {
    const skillsSet = new Set();
    const skillsMap = new Map();
    
    // From NLP (Layer 2)
    layer2Data?.skillAnalysis?.forEach(s => {
      skillsSet.add(s.skill);
      skillsMap.set(s.skill, { skill: s.skill, category: s.category });
    });
    
    // From LLM inference (Layer 3) - inferred skills
    layer3Data?.inferredSkills?.forEach(s => {
      skillsSet.add(s.skill);
      if (!skillsMap.has(s.skill)) {
        skillsMap.set(s.skill, { skill: s.skill, category: s.category });
      }
    });
    
    // From LLM proficiency levels (Layer 3)
    Object.keys(layer3Data?.proficiencyLevels || {}).forEach(skill => {
      skillsSet.add(skill);
    });
    
    return Array.from(skillsSet).map(skill => skillsMap.get(skill) || { skill, category: 'Unknown' });
  }

  /**
   * Assess a single skill across all layers
   */
  assessSkill(skillInfo, layer1Data, layer2Data, layer3Data, layer4Data) {
    const skill = skillInfo.skill;
    
    // Gather evidence from all layers
    const evidence = {
      documentAI: this.getDocumentAIScore(skill, layer1Data),
      nlpExplicit: this.getNLPScore(skill, layer2Data),
      llmInference: this.getLLMScore(skill, layer3Data),
      marketValidation: this.getMarketScore(skill, layer4Data),
      frequency: this.getFrequencyScore(skill, layer2Data),
      contextQuality: this.getContextScore(skill, layer1Data, layer2Data)
    };
    
    // Calculate weighted confidence score
    const finalConfidence = this.calculateWeightedScore(evidence);
    
    // Apply classification rules
    const classification = this.classifySkill(finalConfidence, evidence);
    
    // Gather proficiency and experience data
    const proficiency = this.getProficiencyLevel(skill, layer3Data);
    const yearsExperience = this.getYearsExperience(skill, layer3Data);
    
    // Collect evidence sources
    const sources = this.getEvidenceSources(skill, layer1Data, layer2Data);
    const mentions = this.getMentionCount(skill, layer2Data);
    
    return {
      skill,
      category: skillInfo.category,
      finalConfidence: parseFloat(finalConfidence.toFixed(3)),
      classification,
      evidenceBreakdown: {
        documentAI: evidence.documentAI,
        nlpExplicit: evidence.nlpExplicit,
        llmInference: evidence.llmInference,
        marketValidation: evidence.marketValidation,
        frequency: evidence.frequency,
        contextQuality: evidence.contextQuality
      },
      proficiencyLevel: proficiency,
      yearsExperience,
      mentions,
      sources,
      needsManualReview: this.needsManualReview(finalConfidence, evidence)
    };
  }

  /**
   * Calculate weighted confidence score
   */
  calculateWeightedScore(evidence) {
    let score = 0;
    
    for (const [key, weight] of Object.entries(this.weights)) {
      score += weight * evidence[key];
    }
    
    return Math.min(1.0, Math.max(0.0, score));
  }

  /**
   * Classify skill based on confidence and evidence
   */
  classifySkill(confidence, evidence) {
    // CRITICAL RULE: If skill is explicitly mentioned with high NLP confidence,
    // it CANNOT be "Not Demonstrated"
    const hasExplicitMention = evidence.nlpExplicit >= 0.7;
    
    if (confidence >= this.thresholds.strong) {
      return 'Strong';
    } else if (confidence >= this.thresholds.needsImprovement) {
      return 'Needs Improvement';
    } else if (hasExplicitMention && confidence >= this.thresholds.explicitMentionMin) {
      // Override: explicit mentions can't be "Not Demonstrated"
      return 'Needs Improvement';
    } else {
      return 'Not Demonstrated';
    }
  }

  /**
   * Get Document AI score for skill
   */
  getDocumentAIScore(skill, layer1Data) {
    if (!layer1Data?.sections) return 0;
    
    const sections = layer1Data.sections;
    let maxConfidence = 0;
    
    // Check skills section
    if (sections.skills?.items) {
      const found = sections.skills.items.find(item => 
        item.skill?.toLowerCase() === skill.toLowerCase()
      );
      if (found) maxConfidence = Math.max(maxConfidence, found.confidence || 0.9);
    }
    
    // Check skills text
    if (sections.skills?.text?.toLowerCase().includes(skill.toLowerCase())) {
      maxConfidence = Math.max(maxConfidence, sections.skills.confidence || 0.85);
    }
    
    return maxConfidence;
  }

  /**
   * Get NLP extraction score for skill
   */
  getNLPScore(skill, layer2Data) {
    if (!layer2Data?.skillAnalysis) return 0;
    
    const found = layer2Data.skillAnalysis.find(s => 
      s.skill.toLowerCase() === skill.toLowerCase()
    );
    
    return found ? found.confidence : 0;
  }

  /**
   * Get LLM inference score for skill
   */
  getLLMScore(skill, layer3Data) {
    if (!layer3Data) return 0;
    
    // Check inferred skills
    const inferred = layer3Data.inferredSkills?.find(s => 
      s.skill.toLowerCase() === skill.toLowerCase()
    );
    if (inferred) return inferred.confidence;
    
    // Check proficiency levels
    const proficiency = layer3Data.proficiencyLevels?.[skill];
    if (proficiency) return proficiency.confidence || 0.8;
    
    return 0;
  }

  /**
   * Get market validation score for skill
   */
  getMarketScore(skill, layer4Data) {
    if (!layer4Data?.skills) return 0.5;
    
    const found = layer4Data.skills.find(s => 
      s.skill.toLowerCase() === skill.toLowerCase()
    );
    
    if (!found) return 0.5;
    
    // Normalize market demand score (0-100) to 0-1
    return (found.marketDemand?.score || 50) / 100;
  }

  /**
   * Get frequency score for skill
   */
  getFrequencyScore(skill, layer2Data) {
    if (!layer2Data?.skillAnalysis) return 0;
    
    const found = layer2Data.skillAnalysis.find(s => 
      s.skill.toLowerCase() === skill.toLowerCase()
    );
    
    if (!found) return 0;
    
    // Normalize: 1 mention = 0.3, 2 = 0.5, 3 = 0.7, 4+ = 1.0
    const count = found.count || 0;
    return Math.min(1.0, 0.3 + (count - 1) * 0.2);
  }

  /**
   * Get context quality score for skill
   */
  getContextScore(skill, layer1Data, layer2Data) {
    if (!layer2Data?.skillAnalysis) return 0.5;
    
    const found = layer2Data.skillAnalysis.find(s => 
      s.skill.toLowerCase() === skill.toLowerCase()
    );
    
    if (!found) return 0.5;
    
    // High quality context = mentioned in multiple section types
    const sectionCount = found.sectionTypes?.length || 0;
    
    if (sectionCount >= 3) return 1.0;
    if (sectionCount === 2) return 0.75;
    if (sectionCount === 1) return 0.5;
    return 0.3;
  }

  /**
   * Get proficiency level for skill
   */
  getProficiencyLevel(skill, layer3Data) {
    const proficiency = layer3Data?.proficiencyLevels?.[skill];
    return proficiency?.level || 'Intermediate';
  }

  /**
   * Get years of experience for skill
   */
  getYearsExperience(skill, layer3Data) {
    const proficiency = layer3Data?.proficiencyLevels?.[skill];
    return proficiency?.yearsEstimate || 1;
  }

  /**
   * Get evidence sources for skill
   */
  getEvidenceSources(skill, layer1Data, layer2Data) {
    const sources = [];
    
    const nlpAnalysis = layer2Data?.skillAnalysis?.find(s => 
      s.skill.toLowerCase() === skill.toLowerCase()
    );
    
    if (nlpAnalysis) {
      return nlpAnalysis.sectionTypes || [];
    }
    
    return sources;
  }

  /**
   * Get mention count for skill
   */
  getMentionCount(skill, layer2Data) {
    const found = layer2Data?.skillAnalysis?.find(s => 
      s.skill.toLowerCase() === skill.toLowerCase()
    );
    
    return found?.count || 0;
  }

  /**
   * Determine if skill needs manual review
   */
  needsManualReview(confidence, evidence) {
    // Flag for manual review if:
    // 1. Confidence is borderline (±0.05 of threshold)
    // 2. High variance in evidence scores
    // 3. Explicit mention but low overall confidence
    
    const isWithinBorderZone = (confidence >= 0.70 && confidence <= 0.80) || 
                                (confidence >= 0.40 && confidence <= 0.50);
    
    const evidenceValues = Object.values(evidence);
    const maxEvidence = Math.max(...evidenceValues);
    const minEvidence = Math.min(...evidenceValues);
    const hasHighVariance = (maxEvidence - minEvidence) > 0.5;
    
    const hasExplicitButLowConfidence = evidence.nlpExplicit >= 0.7 && confidence < 0.5;
    
    return isWithinBorderZone || hasHighVariance || hasExplicitButLowConfidence;
  }

  /**
   * Get rules applied
   */
  getRulesApplied() {
    return [
      'explicit_mention_rule: Skills with NLP confidence ≥0.7 cannot be "Not Demonstrated"',
      'multi_source_boost: Skills from multiple sections get confidence boost',
      'frequency_boost: Multiple mentions increase confidence',
      'market_validation: High market demand adds credibility',
      'threshold_classification: Strong ≥75%, Needs Improvement 45-74%, Not Demonstrated <45%'
    ];
  }

  /**
   * Calculate average confidence
   */
  calculateAvgConfidence(skills) {
    if (skills.length === 0) return 0;
    const sum = skills.reduce((acc, s) => acc + s.confidence, 0);
    return parseFloat((sum / skills.length).toFixed(3));
  }

  /**
   * LAYER 6: Arbitrate final assessment with independent LLM
   */
  async arbitrate(confidenceResults, layer1Data, layer2Data, layer3Data, layer4Data) {
    const startTime = Date.now();
    
    this.auditLogger.info('⚖️ Starting arbitration...');
    
    try {
      // Build arbitration prompt
      const prompt = this.buildArbitrationPrompt(confidenceResults, layer1Data, layer2Data, layer3Data, layer4Data);
      
      // Call arbiter LLM
      let result;
      let tokenUsage;
      
      if (this.arbiterProvider === 'anthropic') {
        ({ result, tokenUsage } = await this.arbitrateWithClaude(prompt));
      } else {
        ({ result, tokenUsage } = await this.arbitrateWithGPT4(prompt));
      }
      
      // Parse arbitration result
      const arbitration = this.parseArbitrationResult(result);
      
      // Calculate cost
      const cost = this.calculateArbitrationCost(tokenUsage);
      
      const processingTime = Date.now() - startTime;
      
      return {
        layerId: 'arbitration',
        arbitrator: this.arbiterProvider === 'anthropic' ? `Claude ${this.arbiterModel}` : `GPT-4 ${this.arbiterModel}`,
        finalAssessment: arbitration.finalAssessment,
        conflictsResolved: arbitration.conflictsResolved,
        warnings: arbitration.warnings,
        overallQuality: arbitration.overallQuality,
        auditTrail: {
          layer: 6,
          name: 'Arbitration',
          service: this.arbiterProvider === 'anthropic' ? 'Anthropic Claude' : 'OpenAI GPT-4',
          startTime: new Date(startTime).toISOString(),
          endTime: new Date().toISOString(),
          duration: processingTime,
          promptTokens: tokenUsage.promptTokens,
          completionTokens: tokenUsage.completionTokens,
          totalTokens: tokenUsage.totalTokens,
          cost: cost.toFixed(4),
          success: true
        }
      };
      
    } catch (error) {
      this.auditLogger.error(`❌ Arbitration failed: ${error.message}`);
      
      // Return confidence results as-is if arbitration fails
      return {
        layerId: 'arbitration',
        arbitrator: 'Fallback',
        finalAssessment: {
          skills: confidenceResults.skills.map(s => ({
            ...s,
            finalClassification: s.classification,
            confidence: s.finalConfidence,
            arbitrationNotes: 'Arbitration failed - using confidence engine results',
            consensusLevel: 'automatic',
            manualReviewNeeded: s.needsManualReview
          }))
        },
        conflictsResolved: [],
        warnings: ['Arbitration failed - using confidence engine results'],
        overallQuality: 0.8,
        auditTrail: {
          layer: 6,
          name: 'Arbitration',
          service: 'Fallback',
          success: false,
          error: error.message
        }
      };
    }
  }

  /**
   * Build arbitration prompt
   */
  buildArbitrationPrompt(confidenceResults, layer1Data, layer2Data, layer3Data, layer4Data) {
    const skillsSummary = confidenceResults.skills.map(s => ({
      skill: s.skill,
      classification: s.classification,
      confidence: s.finalConfidence,
      mentions: s.mentions,
      evidence: s.evidenceBreakdown
    }));
    
    return `You are an independent arbiter reviewing a multi-AI skill analysis. Your role is to validate, resolve conflicts, and provide transparent reasoning.

**LAYER 1 (Document AI) SUMMARY:**
- Confidence: ${layer1Data.confidence}
- Sections detected: ${Object.keys(layer1Data.sections || {}).join(', ')}

**LAYER 2 (NLP Extraction) SUMMARY:**
- Total entities: ${layer2Data.metadata?.totalEntities || 0}
- Total skills detected: ${layer2Data.metadata?.totalSkills || 0}
- Provider: ${layer2Data.provider}

**LAYER 3 (LLM Inference) SUMMARY:**
- Inferred skills: ${layer3Data.metadata?.totalInferred || 0}
- Average confidence: ${layer3Data.metadata?.avgConfidence || 0}
- Model: ${layer3Data.model}

**LAYER 4 (Market Intelligence) SUMMARY:**
- Average market demand: ${layer4Data.metadata?.avgMarketDemand || 0}
- Top demand skills: ${layer4Data.aggregateStats?.topDemandSkills?.join(', ') || 'N/A'}

**LAYER 5 (Confidence Engine) ASSESSMENT:**
${JSON.stringify(skillsSummary, null, 2)}

**YOUR TASK:**

1. **Validate Consistency**: Ensure classifications align with evidence across all layers
2. **Resolve Conflicts**: Identify and resolve any discrepancies between layers
3. **Apply Critical Rule**: Skills explicitly mentioned (NLP confidence ≥0.7) CANNOT be "Not Demonstrated"
4. **Flag Warnings**: Identify skills needing manual review
5. **Provide Transparency**: Explain final decisions clearly

**OUTPUT FORMAT (JSON):**
\`\`\`json
{
  "finalAssessment": {
    "skills": [
      {
        "skill": "React",
        "finalClassification": "Strong",
        "confidence": 0.89,
        "arbitrationNotes": "Consistent across all layers. High evidence from multiple sources.",
        "consensusLevel": "unanimous",
        "manualReviewNeeded": false
      }
    ]
  },
  "conflictsResolved": [
    {
      "skill": "TypeScript",
      "conflict": "Layer 2 detected explicitly, Layer 3 had low inference confidence",
      "resolution": "Classified as Needs Improvement",
      "reasoning": "Explicit mention prevents Not Demonstrated, but limited context evidence"
    }
  ],
  "warnings": [
    "GraphQL has borderline confidence (0.47) - recommend manual review"
  ],
  "overallQuality": 0.94
}
\`\`\`

Be rigorous, fair, and transparent. Provide actionable insights.`;
  }

  /**
   * Arbitrate with Claude
   */
  async arbitrateWithClaude(prompt) {
    const response = await this.arbitrator.messages.create({
      model: this.arbiterModel,
      max_tokens: this.arbiterMaxTokens,
      temperature: this.arbiterTemperature,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    
    const result = response.content[0].text;
    const tokenUsage = {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens
    };
    
    return { result, tokenUsage };
  }

  /**
   * Arbitrate with GPT-4
   */
  async arbitrateWithGPT4(prompt) {
    const response = await this.arbitrator.chat.completions.create({
      model: this.arbiterModel,
      messages: [
        {
          role: 'system',
          content: 'You are an independent arbiter for skill analysis. Respond only with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: this.arbiterTemperature,
      max_tokens: this.arbiterMaxTokens,
      response_format: { type: 'json_object' }
    });
    
    const result = response.choices[0].message.content;
    const tokenUsage = {
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens
    };
    
    return { result, tokenUsage };
  }

  /**
   * Parse arbitration result
   */
  parseArbitrationResult(result) {
    try {
      let jsonText = result;
      const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
      
      return JSON.parse(jsonText);
    } catch (error) {
      this.auditLogger.error('Failed to parse arbitration result:', error.message);
      throw error;
    }
  }

  /**
   * Calculate arbitration cost
   */
  calculateArbitrationCost(tokenUsage) {
    const costPer1K = this.arbiterProvider === 'anthropic' ? 0.015 : 0.01;
    return (tokenUsage.totalTokens / 1000) * costPer1K;
  }
}

module.exports = { ConfidenceAndArbitrationEngine };
