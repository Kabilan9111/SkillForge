/**
 * LAYER 2: NLP EXTRACTION - Deterministic Skill Detection
 * 
 * Integrates Amazon Comprehend and Azure Text Analytics for:
 * - Named Entity Recognition (NER)
 * - Key phrase extraction
 * - Syntax analysis
 * - Explicit skill mention detection
 * 
 * @module NLPExtractionLayer
 */

const {
  ComprehendClient,
  DetectEntitiesCommand,
  DetectKeyPhrasesCommand,
  DetectSyntaxCommand
} = require('@aws-sdk/client-comprehend');

const { TextAnalyticsClient, AzureKeyCredential } = require('@azure/ai-text-analytics');

class NLPExtractionLayer {
  constructor(config = {}) {
    this.provider = config.provider || process.env.NLP_PROVIDER || 'aws';
    this.batchSize = config.batchSize || parseInt(process.env.NLP_BATCH_SIZE) || 25;
    this.maxTextLength = config.maxTextLength || parseInt(process.env.NLP_MAX_TEXT_LENGTH) || 5000;
    
    // Initialize providers
    if (this.provider === 'aws' || config.enableFallback) {
      this.initAWSComprehend();
    }
    
    if (this.provider === 'azure' || config.enableFallback) {
      this.initAzureTextAnalytics();
    }
    
    this.auditLogger = config.auditLogger || console;
    
    // Load skill taxonomy for matching
    this.skillTaxonomy = this.loadSkillTaxonomy();
  }

  /**
   * Initialize AWS Comprehend client
   */
  initAWSComprehend() {
    try {
      this.awsClient = new ComprehendClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
      
      this.auditLogger.info('✅ AWS Comprehend initialized');
    } catch (error) {
      this.auditLogger.error('❌ Failed to initialize AWS Comprehend:', error.message);
    }
  }

  /**
   * Initialize Azure Text Analytics client
   */
  initAzureTextAnalytics() {
    try {
      const endpoint = process.env.AZURE_TEXT_ANALYTICS_ENDPOINT;
      const apiKey = process.env.AZURE_TEXT_ANALYTICS_KEY;
      
      if (endpoint && apiKey) {
        this.azureClient = new TextAnalyticsClient(
          endpoint,
          new AzureKeyCredential(apiKey)
        );
        this.auditLogger.info('✅ Azure Text Analytics initialized');
      }
    } catch (error) {
      this.auditLogger.error('❌ Failed to initialize Azure Text Analytics:', error.message);
    }
  }

  /**
   * Extract entities and skills from document
   * 
   * @param {Object} documentData - Output from Layer 1 (Document AI)
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Extracted entities and skills
   */
  async extractSkills(documentData, options = {}) {
    const startTime = Date.now();
    
    this.auditLogger.info('🔍 Starting NLP skill extraction...');
    
    try {
      // Prepare text sections
      const textSections = this.prepareTextSections(documentData);
      
      // Extract entities and key phrases
      let entities = [];
      let keyPhrases = [];
      let skillMentions = [];
      let apiCalls = 0;
      let totalCost = 0;
      
      if (this.provider === 'aws' && this.awsClient) {
        const awsResult = await this.extractWithAWS(textSections);
        entities = awsResult.entities;
        keyPhrases = awsResult.keyPhrases;
        apiCalls = awsResult.apiCalls;
        totalCost = awsResult.cost;
      } else if (this.provider === 'azure' && this.azureClient) {
        const azureResult = await this.extractWithAzure(textSections);
        entities = azureResult.entities;
        keyPhrases = azureResult.keyPhrases;
        apiCalls = azureResult.apiCalls;
        totalCost = azureResult.cost;
      }
      
      // Match extracted entities against skill taxonomy
      skillMentions = this.matchSkills(entities, keyPhrases, documentData.rawText);
      
      // Calculate skill frequency and locations
      const skillAnalysis = this.analyzeSkillMentions(skillMentions, documentData);
      
      const processingTime = Date.now() - startTime;
      
      // Structure output
      const output = {
        layerId: 'nlp-extraction',
        provider: this.provider,
        entities,
        keyPhrases,
        skillMentions,
        skillAnalysis,
        metadata: {
          totalEntities: entities.length,
          totalKeyPhrases: keyPhrases.length,
          totalSkills: skillMentions.length,
          processingTime,
          timestamp: new Date().toISOString()
        },
        auditTrail: {
          layer: 2,
          name: 'NLP Extraction',
          service: this.provider === 'aws' ? 'Amazon Comprehend' : 'Azure Text Analytics',
          startTime: new Date(startTime).toISOString(),
          endTime: new Date().toISOString(),
          duration: processingTime,
          apiCalls,
          cost: totalCost.toFixed(4),
          success: true
        }
      };
      
      this.auditLogger.info(`✅ NLP extraction complete: ${skillMentions.length} skills detected in ${processingTime}ms`);
      
      return output;
      
    } catch (error) {
      this.auditLogger.error(`❌ NLP extraction failed: ${error.message}`);
      
      // Try fallback provider if enabled
      if (options.enableFallback && this.provider === 'aws' && this.azureClient) {
        this.auditLogger.info('🔄 Falling back to Azure Text Analytics...');
        const originalProvider = this.provider;
        this.provider = 'azure';
        const result = await this.extractSkills(documentData, { enableFallback: false });
        this.provider = originalProvider;
        return result;
      }
      
      throw error;
    }
  }

  /**
   * Prepare text sections for NLP processing
   */
  prepareTextSections(documentData) {
    const sections = [];
    
    // Full text (for context)
    if (documentData.rawText) {
      sections.push({
        type: 'full_text',
        text: this.truncateText(documentData.rawText),
        priority: 1
      });
    }
    
    // Skills section (highest priority)
    if (documentData.sections?.skills?.text) {
      sections.push({
        type: 'skills_section',
        text: this.truncateText(documentData.sections.skills.text),
        priority: 10
      });
    }
    
    // Experience section
    if (documentData.sections?.experience?.text) {
      sections.push({
        type: 'experience_section',
        text: this.truncateText(documentData.sections.experience.text),
        priority: 8
      });
    }
    
    // Projects section
    if (documentData.sections?.projects?.text) {
      sections.push({
        type: 'projects_section',
        text: this.truncateText(documentData.sections.projects.text),
        priority: 7
      });
    }
    
    // Summary section
    if (documentData.sections?.summary?.text) {
      sections.push({
        type: 'summary_section',
        text: this.truncateText(documentData.sections.summary.text),
        priority: 5
      });
    }
    
    return sections;
  }

  /**
   * Extract entities with AWS Comprehend
   */
  async extractWithAWS(textSections) {
    const entities = [];
    const keyPhrases = [];
    let apiCalls = 0;
    
    for (const section of textSections) {
      if (!section.text || section.text.length < 10) continue;
      
      // Detect entities
      const entitiesCommand = new DetectEntitiesCommand({
        Text: section.text,
        LanguageCode: process.env.AWS_COMPREHEND_LANGUAGE || 'en'
      });
      
      const entitiesResponse = await this.awsClient.send(entitiesCommand);
      apiCalls++;
      
      entitiesResponse.Entities?.forEach(entity => {
        entities.push({
          text: entity.Text,
          type: this.normalizeEntityType(entity.Type),
          score: entity.Score,
          beginOffset: entity.BeginOffset,
          endOffset: entity.EndOffset,
          sectionType: section.type,
          priority: section.priority
        });
      });
      
      // Detect key phrases
      const keyPhrasesCommand = new DetectKeyPhrasesCommand({
        Text: section.text,
        LanguageCode: process.env.AWS_COMPREHEND_LANGUAGE || 'en'
      });
      
      const keyPhrasesResponse = await this.awsClient.send(keyPhrasesCommand);
      apiCalls++;
      
      keyPhrasesResponse.KeyPhrases?.forEach(phrase => {
        keyPhrases.push({
          text: phrase.Text,
          score: phrase.Score,
          beginOffset: phrase.BeginOffset,
          endOffset: phrase.EndOffset,
          sectionType: section.type
        });
      });
    }
    
    // Calculate cost (AWS Comprehend: $0.0001 per unit, 1 unit = 100 characters)
    const totalCharacters = textSections.reduce((sum, s) => sum + s.text.length, 0);
    const units = Math.ceil(totalCharacters / 100);
    const cost = units * (parseFloat(process.env.AWS_COMPREHEND_COST_PER_UNIT) || 0.0001);
    
    return { entities, keyPhrases, apiCalls, cost };
  }

  /**
   * Extract entities with Azure Text Analytics
   */
  async extractWithAzure(textSections) {
    const entities = [];
    const keyPhrases = [];
    let apiCalls = 0;
    
    const documents = textSections.map((section, index) => ({
      id: String(index),
      language: 'en',
      text: section.text
    }));
    
    // Recognize entities
    const entitiesResults = await this.azureClient.recognizeEntities(documents);
    apiCalls++;
    
    entitiesResults.forEach((result, index) => {
      if (!result.error) {
        result.entities.forEach(entity => {
          entities.push({
            text: entity.text,
            type: this.normalizeEntityType(entity.category),
            score: entity.confidenceScore,
            beginOffset: entity.offset,
            endOffset: entity.offset + entity.length,
            sectionType: textSections[index].type,
            priority: textSections[index].priority
          });
        });
      }
    });
    
    // Extract key phrases
    const keyPhrasesResults = await this.azureClient.extractKeyPhrases(documents);
    apiCalls++;
    
    keyPhrasesResults.forEach((result, index) => {
      if (!result.error) {
        result.keyPhrases.forEach(phrase => {
          keyPhrases.push({
            text: phrase,
            score: 0.9, // Azure doesn't provide scores for key phrases
            sectionType: textSections[index].type
          });
        });
      }
    });
    
    const cost = 0.002; // Azure cost estimation
    
    return { entities, keyPhrases, apiCalls, cost };
  }

  /**
   * Match extracted entities against skill taxonomy
   */
  matchSkills(entities, keyPhrases, fullText) {
    const skillMatches = [];
    const matched = new Set();
    
    // Match entities
    entities.forEach(entity => {
      const normalizedText = entity.text.toLowerCase().trim();
      
      // Check against skill taxonomy
      for (const [category, skills] of Object.entries(this.skillTaxonomy)) {
        for (const [skill, variants] of Object.entries(skills)) {
          const allVariants = [skill.toLowerCase(), ...variants.map(v => v.toLowerCase())];
          
          if (allVariants.includes(normalizedText) && !matched.has(skill)) {
            skillMatches.push({
              skill,
              category,
              detectedAs: entity.text,
              confidence: entity.score,
              source: 'entity_extraction',
              sectionType: entity.sectionType,
              priority: entity.priority,
              location: {
                beginOffset: entity.beginOffset,
                endOffset: entity.endOffset
              }
            });
            matched.add(skill);
          }
        }
      }
    });
    
    // Match key phrases
    keyPhrases.forEach(phrase => {
      const normalizedPhrase = phrase.text.toLowerCase().trim();
      
      for (const [category, skills] of Object.entries(this.skillTaxonomy)) {
        for (const [skill, variants] of Object.entries(skills)) {
          const allVariants = [skill.toLowerCase(), ...variants.map(v => v.toLowerCase())];
          
          if (allVariants.some(v => normalizedPhrase.includes(v)) && !matched.has(skill)) {
            skillMatches.push({
              skill,
              category,
              detectedAs: phrase.text,
              confidence: phrase.score,
              source: 'key_phrase_extraction',
              sectionType: phrase.sectionType,
              location: {
                beginOffset: phrase.beginOffset,
                endOffset: phrase.endOffset
              }
            });
            matched.add(skill);
          }
        }
      }
    });
    
    return skillMatches;
  }

  /**
   * Analyze skill mentions (frequency, locations, context)
   */
  analyzeSkillMentions(skillMentions, documentData) {
    const analysis = {};
    
    skillMentions.forEach(mention => {
      if (!analysis[mention.skill]) {
        analysis[mention.skill] = {
          skill: mention.skill,
          category: mention.category,
          count: 0,
          locations: [],
          confidence: mention.confidence,
          detectedVariants: [],
          sectionTypes: new Set()
        };
      }
      
      analysis[mention.skill].count++;
      analysis[mention.skill].detectedVariants.push(mention.detectedAs);
      analysis[mention.skill].sectionTypes.add(mention.sectionType);
      
      if (mention.location) {
        analysis[mention.skill].locations.push({
          section: mention.sectionType,
          offset: mention.location.beginOffset
        });
      }
    });
    
    // Convert to array and sort by priority
    return Object.values(analysis)
      .map(item => ({
        ...item,
        sectionTypes: Array.from(item.sectionTypes),
        confidence: Math.min(0.99, item.confidence + (item.count * 0.02)) // Boost confidence based on frequency
      }))
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Load skill taxonomy for matching
   */
  loadSkillTaxonomy() {
    // Comprehensive skill taxonomy with variants
    return {
      'Programming Languages': {
        'JavaScript': ['JS', 'ECMAScript', 'ES6', 'ES2015'],
        'TypeScript': ['TS'],
        'Python': ['Python3', 'Python 3'],
        'Java': ['Java SE', 'Java EE', 'J2EE'],
        'C++': ['CPP', 'C Plus Plus'],
        'C#': ['CSharp', 'C Sharp'],
        'Go': ['Golang'],
        'Rust': [],
        'Ruby': [],
        'PHP': [],
        'Swift': [],
        'Kotlin': [],
        'Scala': [],
        'R': [],
        'SQL': ['Structured Query Language'],
        'Bash': ['Shell Scripting', 'Shell']
      },
      'Frontend': {
        'React': ['React.js', 'ReactJS'],
        'Vue': ['Vue.js', 'VueJS'],
        'Angular': ['AngularJS'],
        'Svelte': [],
        'Next.js': ['NextJS'],
        'Nuxt.js': ['NuxtJS'],
        'HTML': ['HTML5'],
        'CSS': ['CSS3'],
        'Sass': ['SCSS'],
        'Less': [],
        'Tailwind CSS': ['TailwindCSS'],
        'Bootstrap': [],
        'Material UI': ['MUI'],
        'Chakra UI': [],
        'Redux': ['Redux Toolkit'],
        'MobX': [],
        'Webpack': [],
        'Vite': [],
        'Parcel': []
      },
      'Backend': {
        'Node.js': ['NodeJS', 'Node'],
        'Express': ['Express.js'],
        'Django': [],
        'Flask': [],
        'FastAPI': [],
        'Spring Boot': ['Spring'],
        'ASP.NET': ['.NET', 'dotnet'],
        'Ruby on Rails': ['Rails'],
        'Laravel': [],
        'Symfony': [],
        'Nest.js': ['NestJS'],
        'Fastify': [],
        'GraphQL': [],
        'REST API': ['RESTful API', 'REST'],
        'gRPC': [],
        'WebSocket': ['WebSockets']
      },
      'Databases': {
        'MongoDB': ['Mongo'],
        'PostgreSQL': ['Postgres'],
        'MySQL': [],
        'SQLite': [],
        'Redis': [],
        'Elasticsearch': ['Elastic'],
        'Cassandra': [],
        'DynamoDB': [],
        'Oracle': ['Oracle DB'],
        'SQL Server': ['MSSQL', 'Microsoft SQL Server'],
        'Firebase': ['Firestore']
      },
      'Cloud & DevOps': {
        'AWS': ['Amazon Web Services'],
        'Azure': ['Microsoft Azure'],
        'GCP': ['Google Cloud Platform', 'Google Cloud'],
        'Docker': [],
        'Kubernetes': ['K8s'],
        'CI/CD': ['Continuous Integration', 'Continuous Deployment'],
        'Jenkins': [],
        'GitHub Actions': [],
        'GitLab CI': [],
        'Terraform': [],
        'Ansible': [],
        'CloudFormation': [],
        'Helm': [],
        'Nginx': [],
        'Apache': []
      },
      'ML & Data': {
        'TensorFlow': [],
        'PyTorch': [],
        'Scikit-learn': ['sklearn'],
        'Keras': [],
        'Pandas': [],
        'NumPy': [],
        'Matplotlib': [],
        'Seaborn': [],
        'Jupyter': ['Jupyter Notebook'],
        'Apache Spark': ['Spark'],
        'Hadoop': [],
        'Airflow': [],
        'Kafka': []
      },
      'Testing': {
        'Jest': [],
        'Mocha': [],
        'Chai': [],
        'Cypress': [],
        'Selenium': [],
        'Playwright': [],
        'JUnit': [],
        'PyTest': [],
        'Testing Library': ['React Testing Library'],
        'Vitest': []
      },
      'Tools': {
        'Git': [],
        'GitHub': [],
        'GitLab': [],
        'Bitbucket': [],
        'Jira': [],
        'Confluence': [],
        'VS Code': ['Visual Studio Code'],
        'IntelliJ': ['IntelliJ IDEA'],
        'Postman': [],
        'Figma': [],
        'Sketch': []
      }
    };
  }

  /**
   * Normalize entity type across providers
   */
  normalizeEntityType(type) {
    const typeMapping = {
      'TITLE': 'JOB_TITLE',
      'ORGANIZATION': 'COMPANY',
      'COMMERCIAL_ITEM': 'TECHNOLOGY',
      'OTHER': 'SKILL'
    };
    
    return typeMapping[type] || type;
  }

  /**
   * Truncate text to max length
   */
  truncateText(text) {
    if (text.length <= this.maxTextLength) return text;
    return text.substring(0, this.maxTextLength) + '...';
  }
}

module.exports = { NLPExtractionLayer };
