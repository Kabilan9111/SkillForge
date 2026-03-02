/**
 * ========================================================================
 * LAYER 2: DEPTH DETECTION ENGINE
 * ========================================================================
 * 
 * Distinguishes surface-level mentions from applied expertise
 * 
 * Not just: "Knows Python"
 * But:
 * - Is it mentioned in a project?
 * - Used in backend architecture?
 * - Mentioned with frameworks?
 * - Shallow listing or deep application?
 * 
 * Detection: Surface skill vs Applied skill
 */

class DepthDetectionEngine {
  constructor(options = {}) {
    this.auditLogger = options.auditLogger;
    
    // Depth indicators
    this.depthIndicators = this.buildDepthIndicators();
    
    // Context patterns
    this.contextPatterns = this.buildContextPatterns();
    
    this.log('✅ Depth Detection Engine initialized');
  }

  /**
   * Analyze skill depth across resume
   */
  async analyze(resumeText, normalizedSkills, resumeStructure) {
    this.log('📊 Layer 2: Depth Detection - Starting...');
    
    const startTime = Date.now();
    const depthAnalysis = [];
    
    for (const skill of normalizedSkills) {
      const depth = await this.detectSkillDepth(skill, resumeText, resumeStructure);
      depthAnalysis.push(depth);
    }
    
    // Classify by depth level
    const classified = this.classifyByDepth(depthAnalysis);
    
    const processingTime = Date.now() - startTime;
    
    this.log(`✅ Layer 2 Complete: ${classified.expert.length} expert, ${classified.applied.length} applied, ${classified.surface.length} surface (${processingTime}ms)`);
    
    return {
      skills: depthAnalysis,
      classified,
      processingTime,
      summary: {
        expertSkills: classified.expert.length,
        appliedSkills: classified.applied.length,
        surfaceSkills: classified.surface.length,
        depthScore: this.calculateDepthScore(classified)
      }
    };
  }

  /**
   * Detect depth of a single skill
   */
  async detectSkillDepth(skill, resumeText, resumeStructure) {
    const analysis = {
      skill,
      mentions: 0,
      contexts: [],
      depthLevel: 'surface', // surface | intermediate | applied | expert
      depthScore: 0,
      evidence: {},
      reasoning: []
    };

    // Count total mentions
    const regex = new RegExp(`\\b${this.escapeRegex(skill)}\\b`, 'gi');
    const matches = resumeText.match(regex) || [];
    analysis.mentions = matches.length;

    // Analyze contexts
    const sentences = this.extractSentencesWithSkill(skill, resumeText);
    
    for (const sentence of sentences) {
      const context = this.analyzeContext(sentence, skill);
      analysis.contexts.push(context);
    }

    // Check depth indicators
    analysis.evidence = {
      inProjects: this.isInProjects(skill, resumeStructure),
      withFrameworks: this.isMentionedWithFrameworks(skill, resumeText),
      inArchitecture: this.isInArchitecture(skill, resumeText),
      withComplexity: this.hasComplexityIndicators(skill, resumeText),
      withMetrics: this.hasQuantifiableMetrics(skill, resumeText),
      inMultipleSections: this.appearsInMultipleSections(skill, resumeStructure),
      hasActionVerbs: this.hasActionVerbs(skill, sentences),
      withTechnicalDepth: this.hasTechnicalDepth(skill, sentences)
    };

    // Calculate depth score (0-100)
    analysis.depthScore = this.calculateSkillDepthScore(analysis.evidence, analysis.mentions);
    
    // Determine depth level
    analysis.depthLevel = this.determineDepthLevel(analysis.depthScore, analysis.evidence);
    
    // Generate reasoning
    analysis.reasoning = this.generateDepthReasoning(analysis);

    return analysis;
  }

  /**
   * Calculate depth score for a skill
   */
  calculateSkillDepthScore(evidence, mentions) {
    let score = 0;

    // Base score from mentions (max 20 points)
    score += Math.min(mentions * 5, 20);

    // Evidence-based scoring (80 points)
    if (evidence.inProjects) score += 15;
    if (evidence.withFrameworks) score += 12;
    if (evidence.inArchitecture) score += 15;
    if (evidence.withComplexity) score += 10;
    if (evidence.withMetrics) score += 10;
    if (evidence.inMultipleSections) score += 8;
    if (evidence.hasActionVerbs) score += 5;
    if (evidence.withTechnicalDepth) score += 5;

    return Math.min(score, 100);
  }

  /**
   * Determine depth level from score
   */
  determineDepthLevel(score, evidence) {
    if (score >= 75 && evidence.inProjects && evidence.withComplexity) {
      return 'expert';
    } else if (score >= 50 && evidence.inProjects) {
      return 'applied';
    } else if (score >= 30) {
      return 'intermediate';
    } else {
      return 'surface';
    }
  }

  /**
   * Generate depth reasoning
   */
  generateDepthReasoning(analysis) {
    const reasons = [];
    const { evidence, depthLevel, mentions } = analysis;

    if (depthLevel === 'expert') {
      reasons.push(`✅ Expert-level proficiency detected`);
      if (evidence.inProjects) reasons.push(`Used in ${evidence.inProjects} project(s)`);
      if (evidence.withMetrics) reasons.push(`Quantifiable achievements mentioned`);
      if (evidence.inArchitecture) reasons.push(`Applied in system architecture`);
    } else if (depthLevel === 'applied') {
      reasons.push(`✅ Applied knowledge demonstrated`);
      if (evidence.inProjects) reasons.push(`Mentioned in projects section`);
      if (evidence.withFrameworks) reasons.push(`Used with related frameworks`);
    } else if (depthLevel === 'intermediate') {
      reasons.push(`⚠️ Intermediate understanding indicated`);
      reasons.push(`Mentioned ${mentions} time(s)`);
      if (!evidence.inProjects) reasons.push(`Not found in projects - consider adding project experience`);
    } else {
      reasons.push(`⚠️ Surface-level mention only`);
      reasons.push(`Listed but lacks context or application examples`);
      reasons.push(`Recommendation: Build projects to demonstrate proficiency`);
    }

    return reasons;
  }

  /**
   * Check if skill is mentioned in projects section
   */
  isInProjects(skill, resumeStructure) {
    if (!resumeStructure.sections?.projects) return false;
    
    const projectText = resumeStructure.sections.projects.text || '';
    const regex = new RegExp(`\\b${this.escapeRegex(skill)}\\b`, 'gi');
    const matches = projectText.match(regex) || [];
    
    return matches.length;
  }

  /**
   * Check if skill is mentioned with frameworks
   */
  isMentionedWithFrameworks(skill, resumeText) {
    const frameworks = {
      'Python': ['Django', 'Flask', 'FastAPI', 'Pandas', 'NumPy'],
      'JavaScript': ['React', 'Vue', 'Angular', 'Express', 'Node.js'],
      'Java': ['Spring', 'Hibernate', 'Maven'],
      'Ruby': ['Rails'],
      'PHP': ['Laravel', 'Symfony'],
      'Go': ['Gin', 'Echo'],
      'TypeScript': ['React', 'Angular', 'Vue', 'Next.js']
    };

    const relatedFrameworks = frameworks[skill] || [];
    
    for (const framework of relatedFrameworks) {
      const pattern = new RegExp(`${this.escapeRegex(skill)}.*${this.escapeRegex(framework)}|${this.escapeRegex(framework)}.*${this.escapeRegex(skill)}`, 'i');
      if (pattern.test(resumeText)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if skill is used in architecture descriptions
   */
  isInArchitecture(skill, resumeText) {
    const architectureKeywords = [
      'architecture', 'system', 'design', 'implemented',
      'built', 'developed', 'created', 'engineered',
      'microservices', 'api', 'backend', 'frontend',
      'infrastructure', 'pipeline', 'stack'
    ];

    const sentences = this.extractSentencesWithSkill(skill, resumeText);
    
    for (const sentence of sentences) {
      for (const keyword of architectureKeywords) {
        if (sentence.toLowerCase().includes(keyword)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check for complexity indicators
   */
  hasComplexityIndicators(skill, resumeText) {
    const complexityKeywords = [
      'scalable', 'optimized', 'performance', 'concurrent',
      'distributed', 'async', 'real-time', 'high-traffic',
      'production', 'enterprise', 'security', 'authentication',
      'deployment', 'integration', 'testing'
    ];

    const sentences = this.extractSentencesWithSkill(skill, resumeText);
    
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      for (const keyword of complexityKeywords) {
        if (lower.includes(keyword)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check for quantifiable metrics
   */
  hasQuantifiableMetrics(skill, resumeText) {
    const sentences = this.extractSentencesWithSkill(skill, resumeText);
    
    // Look for numbers, percentages, metrics
    const metricPatterns = [
      /\d+%/,
      /\d+x/,
      /\d+\s*(users|requests|transactions|ms|seconds)/i,
      /improved.*\d+/i,
      /reduced.*\d+/i,
      /increased.*\d+/i
    ];

    for (const sentence of sentences) {
      for (const pattern of metricPatterns) {
        if (pattern.test(sentence)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if skill appears in multiple sections
   */
  appearsInMultipleSections(skill, resumeStructure) {
    let sectionCount = 0;
    const regex = new RegExp(`\\b${this.escapeRegex(skill)}\\b`, 'gi');

    if (resumeStructure.sections) {
      if (resumeStructure.sections.experience?.text?.match(regex)) sectionCount++;
      if (resumeStructure.sections.projects?.text?.match(regex)) sectionCount++;
      if (resumeStructure.sections.skills?.text?.match(regex)) sectionCount++;
      if (resumeStructure.sections.education?.text?.match(regex)) sectionCount++;
    }

    return sectionCount >= 2;
  }

  /**
   * Check for action verbs
   */
  hasActionVerbs(skill, sentences) {
    const actionVerbs = [
      'built', 'developed', 'created', 'designed', 'implemented',
      'architected', 'engineered', 'deployed', 'optimized',
      'managed', 'led', 'maintained', 'scaled', 'integrated'
    ];

    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      for (const verb of actionVerbs) {
        if (lower.includes(verb)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check for technical depth
   */
  hasTechnicalDepth(skill, sentences) {
    const technicalIndicators = [
      'algorithm', 'data structure', 'optimization', 'refactor',
      'debug', 'performance', 'security', 'testing',
      'ci/cd', 'deployment', 'monitoring', 'logging'
    ];

    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      for (const indicator of technicalIndicators) {
        if (lower.includes(indicator)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Extract sentences containing a skill
   */
  extractSentencesWithSkill(skill, text) {
    const sentences = text.split(/[.!?]\n/);
    const regex = new RegExp(`\\b${this.escapeRegex(skill)}\\b`, 'i');
    
    return sentences.filter(s => regex.test(s));
  }

  /**
   * Analyze context of a sentence
   */
  analyzeContext(sentence, skill) {
    return {
      sentence: sentence.substring(0, 150),
      hasActionVerb: this.hasActionVerbs(skill, [sentence]),
      hasMetrics: /\d+/.test(sentence),
      hasComplexity: this.hasComplexityIndicators(skill, sentence)
    };
  }

  /**
   * Classify skills by depth level
   */
  classifyByDepth(depthAnalysis) {
    return {
      expert: depthAnalysis.filter(s => s.depthLevel === 'expert'),
      applied: depthAnalysis.filter(s => s.depthLevel === 'applied'),
      intermediate: depthAnalysis.filter(s => s.depthLevel === 'intermediate'),
      surface: depthAnalysis.filter(s => s.depthLevel === 'surface')
    };
  }

  /**
   * Calculate overall depth score
   */
  calculateDepthScore(classified) {
    const total = classified.expert.length + classified.applied.length + 
                  classified.intermediate.length + classified.surface.length;
    
    if (total === 0) return 0;

    const score = (
      classified.expert.length * 100 +
      classified.applied.length * 70 +
      classified.intermediate.length * 40 +
      classified.surface.length * 10
    ) / total;

    return Math.round(score);
  }

  /**
   * Build depth indicators
   */
  buildDepthIndicators() {
    return {
      expert: ['architected', 'led', 'designed', 'optimized', 'scaled'],
      applied: ['built', 'developed', 'implemented', 'created'],
      intermediate: ['used', 'worked with', 'familiar with'],
      surface: ['knowledge of', 'exposure to', 'basic']
    };
  }

  /**
   * Build context patterns
   */
  buildContextPatterns() {
    return {
      project: /project|built|created|developed/i,
      architecture: /architecture|system|design|infrastructure/i,
      metrics: /\d+%|\d+x|improved|reduced|increased/i,
      complexity: /scalable|distributed|concurrent|production/i
    };
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  log(message) {
    if (this.auditLogger) {
      this.auditLogger.info(message);
    } else {
      console.log(message);
    }
  }
}

module.exports = { DepthDetectionEngine };
