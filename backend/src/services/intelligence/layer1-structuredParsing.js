/**
 * ========================================================================
 * LAYER 1: STRUCTURED PARSING ENGINE
 * ========================================================================
 * 
 * Multi-Layer Resume Intelligence (Not Single AI Call)
 * 
 * Features:
 * - Extract structured skills
 * - Detect real vs fluff keywords
 * - Map technologies to categories
 * - Normalize synonyms (JS ≠ Node ≠ Express)
 * - NLP + embeddings + skill ontology mapping
 * 
 * Output: Structured capability graph
 */

const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

class StructuredParsingEngine {
  constructor(options = {}) {
    this.auditLogger = options.auditLogger;
    
    // Skill Ontology: Technology normalization and categorization
    this.skillOntology = this.buildSkillOntology();
    
    // Fluff detection patterns
    this.fluffPatterns = this.buildFluffPatterns();
    
    // Synonym mapping
    this.synonymMap = this.buildSynonymMap();
    
    this.log('✅ Structured Parsing Engine initialized');
  }

  /**
   * Main parsing function - converts raw text into structured capability graph
   */
  async parse(resumeText, extractedSkills = []) {
    this.log('📊 Layer 1: Structured Parsing - Starting...');
    
    const startTime = Date.now();
    
    // Step 1: Normalize and deduplicate skills
    const normalizedSkills = this.normalizeSkills(extractedSkills);
    
    // Step 2: Detect and filter fluff keywords
    const realSkills = this.filterFluffKeywords(normalizedSkills, resumeText);
    
    // Step 3: Map to technology categories
    const categorizedSkills = this.categorizeTechnologies(realSkills);
    
    // Step 4: Build capability graph (relationships between skills)
    const capabilityGraph = this.buildCapabilityGraph(categorizedSkills, resumeText);
    
    // Step 5: Calculate structural metrics
    const metrics = this.calculateStructuralMetrics(capabilityGraph);
    
    const processingTime = Date.now() - startTime;
    
    this.log(`✅ Layer 1 Complete: ${realSkills.length} skills, ${Object.keys(capabilityGraph.categories).length} categories (${processingTime}ms)`);
    
    return {
      normalizedSkills: realSkills,
      capabilityGraph,
      metrics,
      fluffDetected: normalizedSkills.length - realSkills.length,
      processingTime
    };
  }

  /**
   * Normalize skills and handle synonyms
   * Example: "JavaScript", "JS", "ECMAScript" → "JavaScript"
   */
  normalizeSkills(skills) {
    const normalized = new Set();
    
    skills.forEach(skill => {
      const cleanSkill = skill.trim();
      const canonical = this.synonymMap[cleanSkill.toLowerCase()] || cleanSkill;
      normalized.add(canonical);
    });
    
    return Array.from(normalized);
  }

  /**
   * Detect and filter fluff keywords
   * Examples: "team player", "hard worker", "passionate"
   */
  filterFluffKeywords(skills, resumeText) {
    return skills.filter(skill => {
      const lowerSkill = skill.toLowerCase();
      
      // Check against fluff patterns
      for (const pattern of this.fluffPatterns) {
        if (pattern.test(lowerSkill)) {
          this.log(`🚫 Fluff detected: "${skill}"`);
          return false;
        }
      }
      
      // Check if skill is overly generic
      if (this.isOverlyGeneric(skill, resumeText)) {
        this.log(`🚫 Overly generic: "${skill}"`);
        return false;
      }
      
      return true;
    });
  }

  /**
   * Map technologies to categories
   */
  categorizeTechnologies(skills) {
    const categorized = {};
    
    skills.forEach(skill => {
      const category = this.findCategory(skill);
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push({
        skill,
        canonical: skill,
        category
      });
    });
    
    return categorized;
  }

  /**
   * Build capability graph showing relationships between skills
   */
  buildCapabilityGraph(categorizedSkills, resumeText) {
    const graph = {
      categories: categorizedSkills,
      relationships: [],
      clusters: [],
      depth: {}
    };
    
    // Detect skill relationships (e.g., React + Redux, Django + PostgreSQL)
    const allSkills = Object.values(categorizedSkills).flat();
    
    allSkills.forEach(skillA => {
      allSkills.forEach(skillB => {
        if (skillA.skill !== skillB.skill) {
          const relationship = this.detectRelationship(skillA.skill, skillB.skill, resumeText);
          if (relationship) {
            graph.relationships.push({
              from: skillA.skill,
              to: skillB.skill,
              type: relationship.type,
              strength: relationship.strength
            });
          }
        }
      });
    });
    
    // Identify skill clusters (full-stack, backend, frontend, etc.)
    graph.clusters = this.identifySkillClusters(categorizedSkills);
    
    return graph;
  }

  /**
   * Detect relationship between two skills
   */
  detectRelationship(skillA, skillB, resumeText) {
    const ontology = this.skillOntology;
    
    // Check if they're in the same stack
    for (const [stackName, stack] of Object.entries(ontology.stacks)) {
      if (stack.includes(skillA) && stack.includes(skillB)) {
        return { type: 'stack', strength: 0.9, stack: stackName };
      }
    }
    
    // Check if they appear together in resume
    const skillARegex = new RegExp(`\\b${this.escapeRegex(skillA)}\\b`, 'gi');
    const skillBRegex = new RegExp(`\\b${this.escapeRegex(skillB)}\\b`, 'gi');
    
    const matchesA = (resumeText.match(skillARegex) || []).length;
    const matchesB = (resumeText.match(skillBRegex) || []).length;
    
    // If they appear together frequently, they're related
    const coOccurrence = this.findCoOccurrence(skillA, skillB, resumeText);
    if (coOccurrence > 0) {
      return { type: 'co-occurrence', strength: Math.min(coOccurrence * 0.3, 0.8) };
    }
    
    return null;
  }

  /**
   * Find co-occurrence of two skills in the same context
   */
  findCoOccurrence(skillA, skillB, text) {
    const sentences = text.split(/[.!?]\s+/);
    let count = 0;
    
    sentences.forEach(sentence => {
      const hasA = sentence.toLowerCase().includes(skillA.toLowerCase());
      const hasB = sentence.toLowerCase().includes(skillB.toLowerCase());
      if (hasA && hasB) count++;
    });
    
    return count;
  }

  /**
   * Identify skill clusters
   */
  identifySkillClusters(categorizedSkills) {
    const clusters = [];
    
    const hasCategory = (cat) => categorizedSkills[cat] && categorizedSkills[cat].length > 0;
    
    // Full-Stack cluster
    if (hasCategory('frontend') && hasCategory('backend') && hasCategory('database')) {
      clusters.push({
        name: 'Full-Stack Development',
        strength: 0.9,
        skills: [
          ...(categorizedSkills.frontend || []).map(s => s.skill),
          ...(categorizedSkills.backend || []).map(s => s.skill),
          ...(categorizedSkills.database || []).map(s => s.skill)
        ].slice(0, 10)
      });
    }
    
    // DevOps cluster
    if (hasCategory('devops') || hasCategory('cloud')) {
      clusters.push({
        name: 'DevOps Engineering',
        strength: 0.8,
        skills: [
          ...(categorizedSkills.devops || []).map(s => s.skill),
          ...(categorizedSkills.cloud || []).map(s => s.skill)
        ].slice(0, 8)
      });
    }
    
    // Data Science cluster
    if (hasCategory('ml') || hasCategory('data')) {
      clusters.push({
        name: 'Data Science & ML',
        strength: 0.85,
        skills: [
          ...(categorizedSkills.ml || []).map(s => s.skill),
          ...(categorizedSkills.data || []).map(s => s.skill)
        ].slice(0, 8)
      });
    }
    
    return clusters;
  }

  /**
   * Calculate structural metrics
   */
  calculateStructuralMetrics(graph) {
    const totalSkills = Object.values(graph.categories).flat().length;
    const totalCategories = Object.keys(graph.categories).length;
    const totalRelationships = graph.relationships.length;
    
    // Skill diversity score (0-100)
    const diversityScore = Math.min((totalCategories / 8) * 100, 100);
    
    // Cohesion score (how well skills work together)
    const cohesionScore = totalRelationships > 0 
      ? Math.min((totalRelationships / (totalSkills * 2)) * 100, 100)
      : 0;
    
    // Depth score (specialization vs breadth)
    const avgSkillsPerCategory = totalSkills / totalCategories;
    const depthScore = avgSkillsPerCategory > 3 ? 75 : avgSkillsPerCategory * 25;
    
    return {
      totalSkills,
      totalCategories,
      totalRelationships,
      diversityScore: Math.round(diversityScore),
      cohesionScore: Math.round(cohesionScore),
      depthScore: Math.round(depthScore),
      specializationIndex: avgSkillsPerCategory
    };
  }

  /**
   * Find category for a skill
   */
  findCategory(skill) {
    const ontology = this.skillOntology;
    const lowerSkill = skill.toLowerCase();
    
    for (const [category, keywords] of Object.entries(ontology.categories)) {
      if (keywords.some(kw => lowerSkill.includes(kw.toLowerCase()) || kw.toLowerCase().includes(lowerSkill))) {
        return category;
      }
    }
    
    return 'general';
  }

  /**
   * Check if skill is overly generic
   */
  isOverlyGeneric(skill, resumeText) {
    const genericPatterns = [
      /^communication$/i,
      /^leadership$/i,
      /^teamwork$/i,
      /^problem solving$/i,
      /^critical thinking$/i
    ];
    
    return genericPatterns.some(pattern => pattern.test(skill));
  }

  /**
   * Build skill ontology
   */
  buildSkillOntology() {
    return {
      categories: {
        frontend: ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind', 'Next.js', 'Svelte'],
        backend: ['Node.js', 'Python', 'Django', 'Flask', 'FastAPI', 'Express', 'Ruby', 'Rails', 'Java', 'Spring Boot', 'Go', 'PHP', 'Laravel'],
        database: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'DynamoDB', 'Cassandra', 'Elasticsearch'],
        cloud: ['AWS', 'Azure', 'GCP', 'Heroku', 'DigitalOcean', 'Vercel', 'Netlify'],
        devops: ['Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'GitHub Actions', 'GitLab CI', 'Terraform', 'Ansible'],
        mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android'],
        ml: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision'],
        data: ['Pandas', 'NumPy', 'Apache Spark', 'Data Analysis', 'ETL', 'Power BI', 'Tableau'],
        tools: ['Git', 'GitHub', 'GitLab', 'Jira', 'VS Code', 'Postman'],
        testing: ['Jest', 'Pytest', 'Selenium', 'Cypress', 'Unit Testing', 'Integration Testing'],
        architecture: ['Microservices', 'REST API', 'GraphQL', 'WebSockets', 'Event-Driven', 'Serverless']
      },
      stacks: {
        mern: ['MongoDB', 'Express', 'React', 'Node.js'],
        django: ['Django', 'PostgreSQL', 'Python', 'Redis'],
        rails: ['Ruby', 'Rails', 'PostgreSQL'],
        lamp: ['Linux', 'Apache', 'MySQL', 'PHP']
      }
    };
  }

  /**
   * Build fluff detection patterns
   */
  buildFluffPatterns() {
    return [
      /\bhard\s*working?\b/i,
      /\bteam\s*player\b/i,
      /\bpassionate\b/i,
      /\bdetail[- ]oriented\b/i,
      /\bself[- ]motivated\b/i,
      /\bfast\s*learner\b/i,
      /\bgreat\s*communicator\b/i,
      /\bproblem\s*solver\b/i
    ];
  }

  /**
   * Build synonym map
   */
  buildSynonymMap() {
    return {
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'py': 'Python',
      'node': 'Node.js',
      'react.js': 'React',
      'reactjs': 'React',
      'vue.js': 'Vue',
      'vuejs': 'Vue',
      'angular.js': 'Angular',
      'angularjs': 'Angular',
      'postgresql': 'PostgreSQL',
      'postgres': 'PostgreSQL',
      'mongo': 'MongoDB',
      'mongodb': 'MongoDB',
      'k8s': 'Kubernetes',
      'aws': 'AWS',
      'amazon web services': 'AWS',
      'azure': 'Azure',
      'microsoft azure': 'Azure',
      'gcp': 'GCP',
      'google cloud': 'GCP',
      'docker': 'Docker',
      'containerization': 'Docker',
      'ci/cd': 'CI/CD',
      'cicd': 'CI/CD',
      'continuous integration': 'CI/CD',
      'git': 'Git',
      'github': 'GitHub',
      'gitlab': 'GitLab'
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

module.exports = { StructuredParsingEngine };
