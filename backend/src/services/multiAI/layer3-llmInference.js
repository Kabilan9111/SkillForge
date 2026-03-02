/**
 * LAYER 3: LLM INFERENCE - Contextual & Implicit Skill Discovery
 * 
 * Integrates OpenAI GPT-4 and Claude Opus for:
 * - Implicit skill inference from context
 * - Proficiency level assessment
 * - Years of experience estimation
 * - Project complexity analysis
 * 
 * @module LLMInferenceLayer
 */

const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

class LLMInferenceLayer {
  constructor(config = {}) {
    this.provider = config.provider || process.env.LLM_PROVIDER || 'openai';
    this.temperature = config.temperature || parseFloat(process.env.OPENAI_TEMPERATURE) || 0.3;
    this.maxTokens = config.maxTokens || parseInt(process.env.OPENAI_MAX_TOKENS) || 2000;
    this.retryAttempts = config.retryAttempts || parseInt(process.env.LLM_RETRY_ATTEMPTS) || 3;
    this.retryDelay = config.retryDelay || parseInt(process.env.LLM_RETRY_DELAY) || 1000;
    
    // Initialize providers
    if (this.provider === 'openai' || config.enableFallback) {
      this.initOpenAI();
    }
    
    if (this.provider === 'anthropic' || config.enableFallback) {
      this.initAnthropic();
    }
    
    this.auditLogger = config.auditLogger || console;
  }

  /**
   * Initialize OpenAI client
   */
  initOpenAI() {
    try {
      this.openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      this.openaiModel = process.env.OPENAI_MODEL || 'gpt-4-turbo-2024-04-09';
      this.auditLogger.info('✅ OpenAI client initialized');
    } catch (error) {
      this.auditLogger.error('❌ Failed to initialize OpenAI:', error.message);
    }
  }

  /**
   * Initialize Anthropic Claude client
   */
  initAnthropic() {
    try {
      this.anthropicClient = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
      
      this.anthropicModel = process.env.ANTHROPIC_MODEL || 'claude-opus-3-5-sonnet-20250122';
      this.auditLogger.info('✅ Anthropic Claude client initialized');
    } catch (error) {
      this.auditLogger.error('❌ Failed to initialize Anthropic:', error.message);
    }
  }

  /**
   * Infer implicit skills and assess proficiency
   * 
   * @param {Object} documentData - Output from Layer 1
   * @param {Object} nlpData - Output from Layer 2
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Inferred skills and proficiency assessment
   */
  async inferSkills(documentData, nlpData, options = {}) {
    const startTime = Date.now();
    
    this.auditLogger.info('🧠 Starting LLM inference...');
    
    try {
      // Prepare context for LLM
      const context = this.prepareContext(documentData, nlpData);
      
      // Build prompt
      const prompt = this.buildInferencePrompt(context);
      
      // Call LLM
      let result;
      let tokenUsage;
      
      if (this.provider === 'openai' && this.openaiClient) {
        ({ result, tokenUsage } = await this.inferWithOpenAI(prompt));
      } else if (this.provider === 'anthropic' && this.anthropicClient) {
        ({ result, tokenUsage } = await this.inferWithClaude(prompt));
      } else {
        throw new Error(`Invalid LLM provider: ${this.provider}`);
      }
      
      // Parse and validate LLM response
      const inference = this.parseInferenceResult(result);
      
      // Calculate costs
      const cost = this.calculateCost(tokenUsage);
      
      const processingTime = Date.now() - startTime;
      
      // Structure output
      const output = {
        layerId: 'llm-inference',
        provider: this.provider,
        model: this.provider === 'openai' ? this.openaiModel : this.anthropicModel,
        temperature: this.temperature,
        inferredSkills: inference.inferredSkills,
        proficiencyLevels: inference.proficiencyLevels,
        yearsExperience: inference.yearsExperience,
        contextAnalysis: inference.contextAnalysis,
        metadata: {
          totalInferred: inference.inferredSkills.length,
          avgConfidence: this.calculateAvgConfidence(inference.inferredSkills),
          processingTime,
          timestamp: new Date().toISOString()
        },
        auditTrail: {
          layer: 3,
          name: 'LLM Inference',
          service: this.provider === 'openai' ? `OpenAI ${this.openaiModel}` : `Anthropic ${this.anthropicModel}`,
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
      
      this.auditLogger.info(`✅ LLM inference complete: ${inference.inferredSkills.length} skills inferred in ${processingTime}ms`);
      
      return output;
      
    } catch (error) {
      this.auditLogger.error(`❌ LLM inference failed: ${error.message}`);
      
      // Try fallback provider if enabled
      if (options.enableFallback && this.provider === 'openai' && this.anthropicClient) {
        this.auditLogger.info('🔄 Falling back to Claude...');
        const originalProvider = this.provider;
        this.provider = 'anthropic';
        const result = await this.inferSkills(documentData, nlpData, { enableFallback: false });
        this.provider = originalProvider;
        return result;
      }
      
      throw error;
    }
  }

  /**
   * Prepare context for LLM
   */
  prepareContext(documentData, nlpData) {
    return {
      fullText: documentData.rawText,
      sections: {
        summary: documentData.sections?.summary?.text || '',
        skills: documentData.sections?.skills?.text || '',
        experience: documentData.sections?.experience?.text || '',
        projects: documentData.sections?.projects?.text || '',
        education: documentData.sections?.education?.text || ''
      },
      explicitSkills: nlpData.skillAnalysis.map(s => ({
        skill: s.skill,
        category: s.category,
        mentions: s.count,
        confidence: s.confidence
      }))
    };
  }

  /**
   * Build inference prompt for LLM
   */
  buildInferencePrompt(context) {
    return `You are an expert technical recruiter and skill analyst. Analyze this resume to infer implicit skills and assess proficiency levels.

**RESUME SUMMARY:**
${context.sections.summary || 'Not provided'}

**SKILLS SECTION:**
${context.sections.skills || 'Not provided'}

**EXPERIENCE:**
${context.sections.experience?.substring(0, 2000) || 'Not provided'}

**PROJECTS:**
${context.sections.projects?.substring(0, 1000) || 'Not provided'}

**EXPLICITLY DETECTED SKILLS:**
${context.explicitSkills.map(s => `- ${s.skill} (${s.category}): mentioned ${s.mentions}x`).join('\n')}

**YOUR TASK:**

1. **Infer Implicit Skills**: Identify technical skills NOT explicitly mentioned but strongly implied by:
   - Technologies used together (e.g., React → State Management, Testing)
   - Architectures described (e.g., Microservices → API Design, Docker)
   - Responsibilities (e.g., "led team" → Leadership, Agile)
   - Projects built (e.g., E-commerce → Payment Integration, Security)

2. **Assess Proficiency Levels**: For ALL skills (explicit + inferred), determine:
   - **Beginner** (0-1 years): Basic knowledge, limited projects
   - **Intermediate** (1-3 years): Solid understanding, multiple projects
   - **Advanced** (3-5 years): Expert-level, complex systems, leadership
   - **Expert** (5+ years): Industry authority, innovation, mentoring

3. **Estimate Experience**: Years working with each skill based on:
   - Project duration and complexity
   - Role seniority and responsibilities
   - Technology adoption timelines
   - Depth of knowledge demonstrated

**CRITICAL RULES:**
- Be CONSERVATIVE: Only infer skills with strong evidence
- Provide clear REASONING for each inference
- Assign realistic CONFIDENCE scores (0.0 to 1.0)
- Consider technology stacks and common pairings
- Account for job titles and responsibilities

**OUTPUT FORMAT (JSON):**
\`\`\`json
{
  "inferredSkills": [
    {
      "skill": "State Management",
      "category": "Frontend",
      "reasoning": "Candidate mentions React extensively with complex UI projects. State management is essential for React apps at this scale.",
      "evidence": ["React experience", "Complex dashboards", "Real-time data"],
      "confidence": 0.78,
      "proficiency": "Intermediate"
    }
  ],
  "proficiencyLevels": {
    "React": {
      "level": "Advanced",
      "confidence": 0.92,
      "yearsEstimate": 3.5,
      "reasoning": "Multiple React projects over 3+ years, complex implementations, team leadership"
    },
    "Node.js": {
      "level": "Intermediate",
      "confidence": 0.85,
      "yearsEstimate": 2.0,
      "reasoning": "Built REST APIs and backend services, but no microservices or advanced patterns mentioned"
    }
  },
  "contextAnalysis": {
    "overallSeniority": "Mid-Senior Level",
    "primaryStack": "Full-Stack JavaScript (MERN)",
    "strongestAreas": ["Frontend Development", "React Ecosystem"],
    "emergingSkills": ["Cloud Infrastructure", "CI/CD"],
    "gaps": ["Testing", "Security Best Practices"]
  }
}
\`\`\`

Analyze carefully and provide comprehensive, evidence-based insights.`;
  }

  /**
   * Infer skills with OpenAI GPT-4
   */
  async inferWithOpenAI(prompt) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await this.openaiClient.chat.completions.create({
          model: this.openaiModel,
          messages: [
            {
              role: 'system',
              content: 'You are an expert technical recruiter and skill analyst. Respond only with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          response_format: { type: 'json_object' }
        });
        
        const result = response.choices[0].message.content;
        const tokenUsage = {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens
        };
        
        return { result, tokenUsage };
        
      } catch (error) {
        lastError = error;
        this.auditLogger.warn(`⚠️ OpenAI attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < this.retryAttempts) {
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }
    
    throw new Error(`OpenAI failed after ${this.retryAttempts} attempts: ${lastError.message}`);
  }

  /**
   * Infer skills with Anthropic Claude
   */
  async inferWithClaude(prompt) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await this.anthropicClient.messages.create({
          model: this.anthropicModel,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
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
        
      } catch (error) {
        lastError = error;
        this.auditLogger.warn(`⚠️ Claude attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < this.retryAttempts) {
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }
    
    throw new Error(`Claude failed after ${this.retryAttempts} attempts: ${lastError.message}`);
  }

  /**
   * Parse and validate LLM inference result
   */
  parseInferenceResult(result) {
    try {
      // Extract JSON from markdown code blocks if present
      let jsonText = result;
      const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
      
      const parsed = JSON.parse(jsonText);
      
      // Validate structure
      if (!parsed.inferredSkills || !parsed.proficiencyLevels) {
        throw new Error('Invalid inference result structure');
      }
      
      // Ensure all fields are present
      return {
        inferredSkills: parsed.inferredSkills || [],
        proficiencyLevels: parsed.proficiencyLevels || {},
        yearsExperience: this.extractYearsExperience(parsed.proficiencyLevels),
        contextAnalysis: parsed.contextAnalysis || {}
      };
      
    } catch (error) {
      this.auditLogger.error('❌ Failed to parse LLM result:', error.message);
      this.auditLogger.debug('Raw result:', result);
      
      // Return empty structure on parse failure
      return {
        inferredSkills: [],
        proficiencyLevels: {},
        yearsExperience: {},
        contextAnalysis: {}
      };
    }
  }

  /**
   * Extract years of experience from proficiency levels
   */
  extractYearsExperience(proficiencyLevels) {
    const yearsExp = {};
    
    Object.entries(proficiencyLevels).forEach(([skill, data]) => {
      if (data.yearsEstimate) {
        yearsExp[skill] = data.yearsEstimate;
      }
    });
    
    return yearsExp;
  }

  /**
   * Calculate average confidence
   */
  calculateAvgConfidence(inferredSkills) {
    if (inferredSkills.length === 0) return 0;
    
    const sum = inferredSkills.reduce((acc, skill) => acc + (skill.confidence || 0), 0);
    return sum / inferredSkills.length;
  }

  /**
   * Calculate API cost
   */
  calculateCost(tokenUsage) {
    if (this.provider === 'openai') {
      const costPer1K = parseFloat(process.env.OPENAI_GPT4_COST_PER_1K_TOKENS) || 0.01;
      return (tokenUsage.totalTokens / 1000) * costPer1K;
    } else if (this.provider === 'anthropic') {
      const costPer1K = parseFloat(process.env.ANTHROPIC_COST_PER_1K_TOKENS) || 0.015;
      return (tokenUsage.totalTokens / 1000) * costPer1K;
    }
    
    return 0;
  }

  /**
   * Sleep helper for retries
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { LLMInferenceLayer };
