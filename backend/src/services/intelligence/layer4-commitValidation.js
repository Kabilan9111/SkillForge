/**
 * ========================================================================
 * LAYER 4: COMMIT-BASED CROSS VALIDATION ENGINE
 * ========================================================================
 * 
 * THE SECRET WEAPON
 * 
 * Cross-check resume claims with actual uploaded project commits:
 * - Architecture patterns
 * - Complexity metrics
 * - Code quality indicators
 * 
 * Example:
 * Resume says: "Microservices experience"
 * Commits show: Single monolithic CRUD app
 * Flag: "Claim mismatch detected"
 * 
 * This validates authenticity.
 */

const fs = require('fs').promises;
const path = require('path');

class CommitCrossValidationEngine {
  constructor(options = {}) {
    this.auditLogger = options.auditLogger;
    this.projectWorkspaceService = options.projectWorkspaceService;
    
    // Architecture patterns
    this.architecturePatterns = this.buildArchitecturePatterns();
    
    // Complexity indicators
    this.complexityIndicators = this.buildComplexityIndicators();
    
    this.log('✅ Commit Cross-Validation Engine initialized');
  }

  /**
   * Cross-validate resume claims against actual project commits
   */
  async analyze(resumeSkills, depthAnalysis, userId) {
    this.log('📊 Layer 4: Commit Cross-Validation - Starting...');
    
    const startTime = Date.now();
    
    // Fetch user's project commits
    const projects = await this.fetchUserProjects(userId);
    
    if (!projects || projects.length === 0) {
      this.log('⚠️ No projects found for cross-validation');
      return {
        validated: false,
        reason: 'No projects available',
        recommendation: 'Upload projects to enable skill validation',
        processingTime: Date.now() - startTime
      };
    }

    // Analyze all projects
    const projectAnalyses = [];
    for (const project of projects) {
      const analysis = await this.analyzeProject(project);
      projectAnalyses.push(analysis);
    }

    // Cross-validate each skill
    const validationResults = [];
    
    for (const skillData of depthAnalysis.skills) {
      const validation = this.validateSkill(
        skillData,
        projectAnalyses
      );
      validationResults.push(validation);
    }

    // Calculate authenticity metrics
    const authenticityScore = this.calculateAuthenticityScore(validationResults);
    
    // Identify mismatches
    const mismatches = validationResults.filter(v => v.status === 'mismatch');
    const verified = validationResults.filter(v => v.status === 'verified');
    const unverifiable = validationResults.filter(v => v.status === 'unverifiable');
    
    const processingTime = Date.now() - startTime;
    
    this.log(`✅ Layer 4 Complete: ${verified.length} verified, ${mismatches.length} mismatches detected (${processingTime}ms)`);
    
    return {
      validated: true,
      authenticityScore,
      projectCount: projects.length,
      validationResults,
      summary: {
        verified: verified.length,
        mismatches: mismatches.length,
        unverifiable: unverifiable.length
      },
      mismatches: mismatches.map(m => ({
        skill: m.skill,
        claimed: m.claimedLevel,
        detected: m.detectedLevel,
        severity: m.severity,
        evidence: m.evidence
      })),
      projectInsights: this.generateProjectInsights(projectAnalyses),
      processingTime
    };
  }

  /**
   * Fetch user's projects from workspace
   */
  async fetchUserProjects(userId) {
    try {
      if (!this.projectWorkspaceService) {
        // Fallback: Read from database
        const db = require('../../config/database');
        const projects = await db.all(
          'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
          [userId]
        );
        return projects || [];
      }
      
      return await this.projectWorkspaceService.getUserProjects(userId);
    } catch (error) {
      this.log(`⚠️ Error fetching projects: ${error.message}`);
      return [];
    }
  }

  /**
   * Analyze a single project
   */
  async analyzeProject(project) {
    const analysis = {
      projectId: project.id,
      projectName: project.name,
      fileCount: 0,
      technologies: new Set(),
      architecturePatterns: [],
      complexityMetrics: {
        totalFiles: 0,
        totalLines: 0,
        avgComplexity: 0
      },
      detectedSkills: []
    };

    try {
      // Parse project files
      const files = typeof project.files === 'string' 
        ? JSON.parse(project.files) 
        : project.files || {};
      
      analysis.fileCount = Object.keys(files).length;
      
      // Analyze each file
      for (const [filename, content] of Object.entries(files)) {
        const fileAnalysis = this.analyzeFile(filename, content);
        
        // Collect technologies
        fileAnalysis.technologies.forEach(tech => analysis.technologies.add(tech));
        
        // Collect patterns
        analysis.architecturePatterns.push(...fileAnalysis.patterns);
        
        // Update metrics
        analysis.complexityMetrics.totalFiles++;
        analysis.complexityMetrics.totalLines += fileAnalysis.lines;
      }

      // Detect architecture style
      analysis.architectureStyle = this.detectArchitectureStyle(analysis);
      
      // Calculate complexity score
      analysis.complexityScore = this.calculateComplexityScore(analysis);
      
      // Extract detected skills
      analysis.detectedSkills = Array.from(analysis.technologies);
      
    } catch (error) {
      this.log(`⚠️ Error analyzing project ${project.name}: ${error.message}`);
    }

    return analysis;
  }

  /**
   * Analyze a single file
   */
  analyzeFile(filename, content) {
    const analysis = {
      filename,
      technologies: [],
      patterns: [],
      lines: 0
    };

    if (!content) return analysis;

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    
    // Count lines
    analysis.lines = contentStr.split('\n').length;

    // Detect technologies from filename
    const ext = path.extname(filename).toLowerCase();
    const techMap = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.py': 'Python',
      '.java': 'Java',
      '.go': 'Go',
      '.rb': 'Ruby',
      '.php': 'PHP',
      '.jsx': 'React',
      '.tsx': 'React',
      '.vue': 'Vue',
      '.html': 'HTML',
      '.css': 'CSS',
      '.scss': 'SCSS',
      '.sql': 'SQL',
      '.yml': 'Docker',
      '.yaml': 'Kubernetes',
      'dockerfile': 'Docker'
    };

    if (techMap[ext]) {
      analysis.technologies.push(techMap[ext]);
    }

    // Detect patterns in content
    analysis.patterns = this.detectPatternsInCode(contentStr, filename);

    return analysis;
  }

  /**
   * Detect architecture patterns in code
   */
  detectPatternsInCode(content, filename) {
    const patterns = [];
    const lower = content.toLowerCase();

    // Microservices patterns
    if (lower.includes('microservice') || lower.includes('service mesh') || 
        lower.includes('api gateway')) {
      patterns.push({ type: 'microservices', confidence: 0.8 });
    }

    // REST API patterns
    if (lower.includes('@app.route') || lower.includes('app.get') || 
        lower.includes('router.') || lower.includes('express()')) {
      patterns.push({ type: 'rest-api', confidence: 0.9 });
    }

    // Database patterns
    if (lower.includes('mongoose') || lower.includes('sequelize') || 
        lower.includes('sqlalchemy') || lower.includes('prisma')) {
      patterns.push({ type: 'orm', confidence: 0.85 });
    }

    // Authentication
    if (lower.includes('jwt') || lower.includes('oauth') || 
        lower.includes('passport') || lower.includes('bcrypt')) {
      patterns.push({ type: 'authentication', confidence: 0.9 });
    }

    // Testing
    if (filename.includes('.test.') || filename.includes('.spec.') ||
        lower.includes('describe(') || lower.includes('it(')) {
      patterns.push({ type: 'testing', confidence: 0.95 });
    }

    // Async/Await
    if (lower.includes('async ') || lower.includes('await ')) {
      patterns.push({ type: 'async-programming', confidence: 0.9 });
    }

    // CI/CD
    if (filename.includes('.github/workflows') || filename.includes('ci.yml')) {
      patterns.push({ type: 'ci-cd', confidence: 1.0 });
    }

    // Docker
    if (filename.toLowerCase().includes('dockerfile') || lower.includes('docker-compose')) {
      patterns.push({ type: 'containerization', confidence: 1.0 });
    }

    return patterns;
  }

  /**
   * Detect overall architecture style
   */
  detectArchitectureStyle(analysis) {
    const patternTypes = analysis.architecturePatterns.map(p => p.type);
    
    // Microservices
    if (patternTypes.includes('microservices') || 
        (patternTypes.includes('docker') && analysis.fileCount > 5)) {
      return 'microservices';
    }

    // Monolithic + REST API
    if (patternTypes.includes('rest-api') && analysis.fileCount < 10) {
      return 'monolithic-api';
    }

    // Full-stack
    if (analysis.detectedSkills.includes('React') && 
        (analysis.detectedSkills.includes('Node.js') || analysis.detectedSkills.includes('Python'))) {
      return 'full-stack';
    }

    // Simple CRUD
    if (patternTypes.includes('orm') && analysis.fileCount < 5) {
      return 'crud-app';
    }

    return 'unknown';
  }

  /**
   * Calculate project complexity score
   */
  calculateComplexityScore(analysis) {
    let score = 0;

    // File count (max 20 points)
    score += Math.min(analysis.fileCount * 2, 20);

    // Lines of code (max 20 points)
    score += Math.min(analysis.complexityMetrics.totalLines / 100, 20);

    // Architecture patterns (max 30 points)
    score += Math.min(analysis.architecturePatterns.length * 5, 30);

    // Technology diversity (max 30 points)
    score += Math.min(analysis.technologies.size * 3, 30);

    return Math.min(Math.round(score), 100);
  }

  /**
   * Validate a single skill against project evidence
   */
  validateSkill(skillData, projectAnalyses) {
    const validation = {
      skill: skillData.skill,
      claimedLevel: skillData.depthLevel,
      detectedLevel: 'none',
      status: 'unverifiable', // verified | mismatch | unverifiable
      evidence: [],
      confidence: 0,
      severity: 'low' // low | medium | high | critical
    };

    // Check if skill appears in any project
    let foundInProjects = false;
    let maxComplexity = 0;

    for (const project of projectAnalyses) {
      if (this.skillPresentInProject(skillData.skill, project)) {
        foundInProjects = true;
        maxComplexity = Math.max(maxComplexity, project.complexityScore);
        
        validation.evidence.push({
          projectName: project.projectName,
          usage: this.describeSkillUsage(skillData.skill, project),
          complexity: project.complexityScore
        });
      }
    }

    if (!foundInProjects) {
      validation.status = 'unverifiable';
      validation.detectedLevel = 'none';
      
      // If claimed as expert/applied but not in projects - RED FLAG
      if (skillData.depthLevel === 'expert' || skillData.depthLevel === 'applied') {
        validation.status = 'mismatch';
        validation.severity = 'high';
        validation.confidence = 0.8;
      }
      
      return validation;
    }

    // Determine detected level from project complexity
    if (maxComplexity >= 70) {
      validation.detectedLevel = 'expert';
    } else if (maxComplexity >= 50) {
      validation.detectedLevel = 'applied';
    } else if (maxComplexity >= 30) {
      validation.detectedLevel = 'intermediate';
    } else {
      validation.detectedLevel = 'surface';
    }

    // Compare claimed vs detected
    const levelMap = { surface: 1, intermediate: 2, applied: 3, expert: 4 };
    const claimedNum = levelMap[skillData.depthLevel] || 0;
    const detectedNum = levelMap[validation.detectedLevel] || 0;

    if (Math.abs(claimedNum - detectedNum) <= 1) {
      validation.status = 'verified';
      validation.confidence = 0.9;
      validation.severity = 'low';
    } else if (claimedNum > detectedNum) {
      validation.status = 'mismatch';
      validation.confidence = 0.8;
      validation.severity = claimedNum - detectedNum >= 2 ? 'high' : 'medium';
    } else {
      // Detected higher than claimed (underselling)
      validation.status = 'verified';
      validation.confidence = 0.95;
      validation.severity = 'low';
    }

    return validation;
  }

  /**
   * Check if skill is present in project
   */
  skillPresentInProject(skill, project) {
    const skillLower = skill.toLowerCase();
    
    // Direct match
    if (project.detectedSkills.some(s => s.toLowerCase().includes(skillLower))) {
      return true;
    }

    // Pattern match
    const patternMap = {
      'microservices': ['microservices'],
      'docker': ['containerization', 'docker'],
      'kubernetes': ['kubernetes', 'k8s'],
      'ci/cd': ['ci-cd'],
      'testing': ['testing'],
      'rest api': ['rest-api'],
      'authentication': ['authentication']
    };

    const relatedPatterns = patternMap[skillLower] || [];
    const projectPatterns = project.architecturePatterns.map(p => p.type);
    
    return relatedPatterns.some(rp => projectPatterns.includes(rp));
  }

  /**
   * Describe how skill is used in project
   */
  describeSkillUsage(skill, project) {
    const patterns = project.architecturePatterns.map(p => p.type);
    
    if (patterns.length === 0) {
      return 'Basic usage detected';
    }

    return `Used in ${project.architectureStyle} architecture with ${patterns.slice(0, 3).join(', ')}`;
  }

  /**
   * Calculate authenticity score
   */
  calculateAuthenticityScore(validationResults) {
    if (validationResults.length === 0) return 0;

    const verified = validationResults.filter(v => v.status === 'verified').length;
    const total = validationResults.length;
    
    const baseScore = (verified / total) * 100;
    
    // Penalize for high-severity mismatches
    const highSeverityMismatches = validationResults.filter(
      v => v.status === 'mismatch' && v.severity === 'high'
    ).length;
    
    const penalty = highSeverityMismatches * 10;
    
    return Math.max(Math.round(baseScore - penalty), 0);
  }

  /**
   * Generate project insights
   */
  generateProjectInsights(projectAnalyses) {
    if (projectAnalyses.length === 0) {
      return {
        summary: 'No projects analyzed',
        recommendations: ['Upload projects to enable validation']
      };
    }

    const avgComplexity = projectAnalyses.reduce((sum, p) => sum + p.complexityScore, 0) / projectAnalyses.length;
    const allTech = new Set();
    projectAnalyses.forEach(p => p.detectedSkills.forEach(s => allTech.add(s)));
    
    const insights = {
      projectCount: projectAnalyses.length,
      avgComplexity: Math.round(avgComplexity),
      techStack: Array.from(allTech),
      dominantArchitecture: this.findDominantArchitecture(projectAnalyses),
      recommendations: []
    };

    // Generate recommendations
    if (avgComplexity < 40) {
      insights.recommendations.push('Build more complex projects to demonstrate advanced skills');
    }
    
    if (projectAnalyses.length < 3) {
      insights.recommendations.push('Add more projects to strengthen skill validation');
    }

    if (!projectAnalyses.some(p => p.architecturePatterns.some(pat => pat.type === 'testing'))) {
      insights.recommendations.push('Add unit tests to projects to showcase professional practices');
    }

    return insights;
  }

  /**
   * Find dominant architecture pattern
   */
  findDominantArchitecture(projectAnalyses) {
    const styles = projectAnalyses.map(p => p.architectureStyle);
    const counts = {};
    
    styles.forEach(style => {
      counts[style] = (counts[style] || 0) + 1;
    });

    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return dominant ? dominant[0] : 'unknown';
  }

  /**
   * Build architecture patterns
   */
  buildArchitecturePatterns() {
    return {
      microservices: {
        indicators: ['service', 'gateway', 'mesh', 'api'],
        complexity: 'high'
      },
      monolithic: {
        indicators: ['app.py', 'server.js', 'main'],
        complexity: 'medium'
      },
      serverless: {
        indicators: ['lambda', 'function', 'trigger'],
        complexity: 'medium'
      }
    };
  }

  /**
   * Build complexity indicators
   */
  buildComplexityIndicators() {
    return {
      testing: { weight: 15, patterns: ['test', 'spec', 'jest', 'pytest'] },
      cicd: { weight: 10, patterns: ['github/workflows', '.gitlab-ci', 'jenkins'] },
      docker: { weight: 10, patterns: ['dockerfile', 'docker-compose'] },
      database: { weight: 10, patterns: ['models', 'schema', 'migration'] },
      auth: { weight: 10, patterns: ['auth', 'jwt', 'oauth'] }
    };
  }

  log(message) {
    if (this.auditLogger) {
      this.auditLogger.info(message);
    } else {
      console.log(message);
    }
  }
}

module.exports = { CommitCrossValidationEngine };
