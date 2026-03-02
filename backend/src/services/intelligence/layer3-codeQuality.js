/**
 * ========================================================================
 * LAYER 3: CODE QUALITY & ENGINEERING STANDARDS ENGINE
 * ========================================================================
 * 
 * Microsoft/Google-level code quality intelligence
 * 
 * Analyzes:
 * - Complexity metrics (cyclomatic, cognitive)
 * - Modularity & architecture patterns
 * - Dependency management
 * - Test coverage & quality
 * - Security hygiene
 * - Code maintainability
 * - Engineering best practices
 * 
 * Output: Engineering Maturity Score (0-100)
 */

const fs = require('fs').promises;
const path = require('path');

class CodeQualityEngine {
  constructor(options = {}) {
    this.options = {
      enableDetailedAnalysis: true,
      securityChecks: true,
      architectureAnalysis: true,
      ...options
    };

    // Engineering standards thresholds (Microsoft/Google level)
    this.thresholds = {
      complexity: {
        excellent: 10,    // Cyclomatic complexity < 10
        good: 15,
        acceptable: 20,
        poor: 30
      },
      modularity: {
        excellent: 0.8,   // High cohesion, low coupling
        good: 0.6,
        acceptable: 0.4
      },
      testCoverage: {
        excellent: 80,    // 80%+ coverage
        good: 60,
        acceptable: 40
      },
      maintainability: {
        excellent: 80,    // Maintainability index > 80
        good: 65,
        acceptable: 50
      }
    };

    // Security patterns and anti-patterns
    this.securityPatterns = {
      good: [
        /bcrypt\.|scrypt\.|argon2/,           // Password hashing
        /helmet\(/,                            // Security headers
        /express-validator/,                   // Input validation
        /csrf.*token/i,                        // CSRF protection
        /sanitize|escape/i,                    // Input sanitization
        /jwt\.verify/,                         // JWT validation
        /crypto\.randomBytes/,                 // Secure random
        /https\.createServer/,                 // HTTPS
        /rate.*limit/i,                        // Rate limiting
        /content.*security.*policy/i           // CSP
      ],
      bad: [
        /eval\(/,                              // eval usage
        /innerHTML\s*=/,                       // XSS vulnerability
        /dangerouslySetInnerHTML/,             // React XSS
        /exec\(.*\+/,                          // Command injection
        /PASSWORD|SECRET.*=.*['"][^'"]+['"]/,  // Hardcoded secrets
        /api.*key.*=.*['"][^'"]+['"]/i,        // Hardcoded API keys
        /\.sql\(.*\+/,                         // SQL injection
        /process\.env\.NODE_TLS_REJECT_UNAUTHORIZED.*=.*['"]0['"]/  // TLS bypass
      ]
    };

    // Architecture patterns
    this.architecturePatterns = {
      microservices: [
        /service.*registry/i,
        /api.*gateway/i,
        /message.*queue|rabbitmq|kafka/i,
        /service.*discovery/i,
        /load.*balancer/i
      ],
      designPatterns: [
        /factory|singleton|observer|strategy|decorator/i,
        /repository.*pattern/i,
        /dependency.*injection/i,
        /middleware/i,
        /controller.*service.*repository/i
      ],
      cleanCode: [
        /interface|abstract/i,
        /\.test\.|\.spec\./,
        /config|constants|utils/,
        /enum|type|interface/,
        /@deprecated|@override|@param/
      ]
    };
  }

  /**
   * Main analysis entry point
   */
  async analyze(projects, resumeData) {
    console.log('🔬 Layer 3: Code Quality & Engineering Standards Analysis');

    const analysis = {
      engineeringMaturityScore: 0,
      complexityAnalysis: {},
      modularityScore: 0,
      testCoverageAnalysis: {},
      securityHygiene: {},
      architectureInsights: {},
      maintainabilityIndex: 0,
      technicalDebt: {},
      recommendations: []
    };

    if (!projects || projects.length === 0) {
      console.log('⚠️  No projects available for code quality analysis');
      return this.generateFallbackAnalysis(resumeData);
    }

    // Analyze each project
    for (const project of projects) {
      await this.analyzeProject(project, analysis);
    }

    // Calculate aggregate scores
    analysis.engineeringMaturityScore = this.calculateEngineeringMaturity(analysis);
    analysis.recommendations = this.generateRecommendations(analysis);
    analysis.overallRating = this.getRatingLevel(analysis.engineeringMaturityScore);

    return analysis;
  }

  /**
   * Analyze individual project
   */
  async analyzeProject(project, analysis) {
    try {
      const projectPath = project.path || project.directory;
      if (!projectPath) return;

      // 1. Complexity Analysis
      const complexityMetrics = await this.analyzeComplexity(projectPath);
      this.mergeComplexity(analysis, complexityMetrics);

      // 2. Modularity Analysis
      const modularityMetrics = await this.analyzeModularity(projectPath);
      this.mergeModularity(analysis, modularityMetrics);

      // 3. Test Coverage Detection
      const testMetrics = await this.detectTestCoverage(projectPath);
      this.mergeTestCoverage(analysis, testMetrics);

      // 4. Security Hygiene
      const securityMetrics = await this.analyzeSecurityHygiene(projectPath);
      this.mergeSecurity(analysis, securityMetrics);

      // 5. Architecture Patterns
      const architectureMetrics = await this.detectArchitecturePatterns(projectPath);
      this.mergeArchitecture(analysis, architectureMetrics);

      // 6. Maintainability Index
      const maintainabilityMetrics = this.calculateMaintainability(
        complexityMetrics,
        modularityMetrics,
        testMetrics
      );
      this.mergeMaintainability(analysis, maintainabilityMetrics);

    } catch (error) {
      console.error(`Error analyzing project ${project.name}:`, error.message);
    }
  }

  /**
   * COMPLEXITY ANALYSIS
   * Analyze cyclomatic and cognitive complexity
   */
  async analyzeComplexity(projectPath) {
    const metrics = {
      totalFiles: 0,
      totalLines: 0,
      avgComplexity: 0,
      highComplexityFiles: [],
      complexityDistribution: {
        simple: 0,    // < 10
        moderate: 0,  // 10-20
        complex: 0,   // 20-30
        veryComplex: 0 // > 30
      }
    };

    try {
      const files = await this.getCodeFiles(projectPath);
      metrics.totalFiles = files.length;

      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const lines = content.split('\n').filter(l => l.trim()).length;
          metrics.totalLines += lines;

          // Calculate cyclomatic complexity (simplified)
          const complexity = this.calculateCyclomaticComplexity(content);

          if (complexity.max > 20) {
            metrics.highComplexityFiles.push({
              file: path.basename(file),
              complexity: complexity.max,
              functions: complexity.functions
            });
          }

          // Classify complexity
          if (complexity.avg < 10) metrics.complexityDistribution.simple++;
          else if (complexity.avg < 20) metrics.complexityDistribution.moderate++;
          else if (complexity.avg < 30) metrics.complexityDistribution.complex++;
          else metrics.complexityDistribution.veryComplex++;

        } catch (err) {
          // Skip file
        }
      }

      // Calculate average
      const total = Object.values(metrics.complexityDistribution).reduce((a, b) => a + b, 0);
      metrics.avgComplexity = total > 0 
        ? (metrics.complexityDistribution.simple * 5 + 
           metrics.complexityDistribution.moderate * 15 + 
           metrics.complexityDistribution.complex * 25 + 
           metrics.complexityDistribution.veryComplex * 35) / total
        : 0;

    } catch (error) {
      console.error('Complexity analysis error:', error.message);
    }

    return metrics;
  }

  /**
   * Calculate cyclomatic complexity (simplified heuristic)
   */
  calculateCyclomaticComplexity(code) {
    const decisionPoints = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bwhile\s*\(/g,
      /\bfor\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\?\s*.*\s*:/g,  // Ternary
      /&&|\|\|/g        // Logical operators
    ];

    let totalComplexity = 0;
    const functionMatches = code.match(/function\s+\w+|=>\s*{|async\s+\w+/g) || [];
    const functionCount = Math.max(functionMatches.length, 1);

    decisionPoints.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) totalComplexity += matches.length;
    });

    return {
      total: totalComplexity,
      avg: Math.round(totalComplexity / functionCount),
      max: totalComplexity,
      functions: functionCount
    };
  }

  /**
   * MODULARITY ANALYSIS
   * Analyze code structure, cohesion, coupling
   */
  async analyzeModularity(projectPath) {
    const metrics = {
      moduleCount: 0,
      avgModuleSize: 0,
      cohesionScore: 0,
      couplingScore: 0,
      directoryStructure: 'flat',
      separationOfConcerns: false
    };

    try {
      const files = await this.getCodeFiles(projectPath);
      metrics.moduleCount = files.length;

      // Detect directory structure
      const hasStructure = files.some(f => 
        f.includes('/controllers/') || 
        f.includes('/services/') || 
        f.includes('/models/') ||
        f.includes('/components/') ||
        f.includes('/utils/')
      );

      if (hasStructure) {
        metrics.directoryStructure = 'layered';
        metrics.separationOfConcerns = true;
        metrics.cohesionScore = 0.7;
        metrics.couplingScore = 0.3;
      }

      // Analyze imports/dependencies
      let totalImports = 0;
      let totalExports = 0;

      for (const file of files.slice(0, 50)) { // Sample first 50 files
        try {
          const content = await fs.readFile(file, 'utf-8');
          const imports = (content.match(/import .* from|require\(/g) || []).length;
          const exports = (content.match(/export |module\.exports/g) || []).length;
          
          totalImports += imports;
          totalExports += exports;
        } catch (err) {
          // Skip
        }
      }

      // Calculate coupling (lower is better)
      const sampledFiles = Math.min(files.length, 50);
      const avgImportsPerFile = totalImports / sampledFiles;
      metrics.couplingScore = Math.min(avgImportsPerFile / 10, 1); // Normalize to 0-1

      // Calculate cohesion (higher is better)
      if (totalExports > 0) {
        const exportRatio = totalExports / sampledFiles;
        metrics.cohesionScore = Math.min(exportRatio / 5, 1);
      }

    } catch (error) {
      console.error('Modularity analysis error:', error.message);
    }

    return metrics;
  }

  /**
   * TEST COVERAGE DETECTION
   * Detect test files and estimate coverage
   */
  async detectTestCoverage(projectPath) {
    const metrics = {
      hasTests: false,
      testFiles: 0,
      testFrameworks: [],
      estimatedCoverage: 0,
      testTypes: {
        unit: false,
        integration: false,
        e2e: false
      }
    };

    try {
      const files = await this.getAllFiles(projectPath);
      
      // Detect test files
      const testFiles = files.filter(f => 
        /\.(test|spec)\.(js|ts|jsx|tsx)$/.test(f) ||
        /\/__tests__\//.test(f) ||
        /\/test\//.test(f)
      );

      metrics.testFiles = testFiles.length;
      metrics.hasTests = testFiles.length > 0;

      // Read package.json to detect frameworks
      try {
        const packagePath = path.join(projectPath, 'package.json');
        const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf-8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        if (deps.jest || deps['@jest/core']) metrics.testFrameworks.push('Jest');
        if (deps.mocha) metrics.testFrameworks.push('Mocha');
        if (deps.jasmine) metrics.testFrameworks.push('Jasmine');
        if (deps.cypress) metrics.testFrameworks.push('Cypress');
        if (deps['@testing-library/react']) metrics.testFrameworks.push('React Testing Library');
        if (deps.vitest) metrics.testFrameworks.push('Vitest');

      } catch (err) {
        // No package.json
      }

      // Estimate coverage based on test file ratio
      const codeFiles = files.filter(f => 
        /\.(js|ts|jsx|tsx)$/.test(f) &&
        !/\.(test|spec)\./.test(f) &&
        !/node_modules|dist|build/.test(f)
      );

      if (codeFiles.length > 0) {
        const ratio = testFiles.length / codeFiles.length;
        metrics.estimatedCoverage = Math.min(Math.round(ratio * 100), 100);
      }

      // Detect test types
      if (testFiles.length > 0) {
        const testContent = await Promise.all(
          testFiles.slice(0, 10).map(f => 
            fs.readFile(f, 'utf-8').catch(() => '')
          )
        );
        const allContent = testContent.join('\n');

        metrics.testTypes.unit = /describe|it\(|test\(/i.test(allContent);
        metrics.testTypes.integration = /integration|api.*test|supertest/i.test(allContent);
        metrics.testTypes.e2e = /cypress|playwright|puppeteer|selenium/i.test(allContent);
      }

    } catch (error) {
      console.error('Test coverage analysis error:', error.message);
    }

    return metrics;
  }

  /**
   * SECURITY HYGIENE ANALYSIS
   * Detect security patterns and vulnerabilities
   */
  async analyzeSecurityHygiene(projectPath) {
    const metrics = {
      securityScore: 100,
      goodPractices: [],
      vulnerabilities: [],
      securityToolsUsed: [],
      hasSecurityMiddleware: false,
      hasDependencyScanning: false
    };

    try {
      const files = await this.getCodeFiles(projectPath);

      for (const file of files.slice(0, 100)) { // Sample first 100 files
        try {
          const content = await fs.readFile(file, 'utf-8');

          // Check for good security practices
          this.securityPatterns.good.forEach(pattern => {
            if (pattern.test(content)) {
              const match = content.match(pattern);
              if (match && !metrics.goodPractices.includes(match[0])) {
                metrics.goodPractices.push(match[0]);
              }
            }
          });

          // Check for vulnerabilities
          this.securityPatterns.bad.forEach(pattern => {
            if (pattern.test(content)) {
              const match = content.match(pattern);
              if (match) {
                metrics.vulnerabilities.push({
                  file: path.basename(file),
                  issue: match[0],
                  severity: 'HIGH'
                });
                metrics.securityScore -= 5;
              }
            }
          });

        } catch (err) {
          // Skip file
        }
      }

      // Check package.json for security tools
      try {
        const packagePath = path.join(projectPath, 'package.json');
        const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf-8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        if (deps.helmet) metrics.securityToolsUsed.push('helmet');
        if (deps['express-validator']) metrics.securityToolsUsed.push('express-validator');
        if (deps.snyk || deps['@snyk/protect']) metrics.securityToolsUsed.push('snyk');
        if (deps.eslint && deps['eslint-plugin-security']) {
          metrics.securityToolsUsed.push('eslint-security');
        }

        metrics.hasSecurityMiddleware = metrics.securityToolsUsed.length > 0;
        metrics.hasDependencyScanning = deps.snyk || deps['npm-audit'] ? true : false;

      } catch (err) {
        // No package.json
      }

      metrics.securityScore = Math.max(0, Math.min(100, metrics.securityScore));

    } catch (error) {
      console.error('Security analysis error:', error.message);
    }

    return metrics;
  }

  /**
   * ARCHITECTURE PATTERN DETECTION
   * Detect microservices, design patterns, clean code
   */
  async detectArchitecturePatterns(projectPath) {
    const metrics = {
      patterns: [],
      architectureStyle: 'monolithic',
      designPatterns: [],
      hasDocumentation: false,
      hasAPIDocumentation: false
    };

    try {
      const files = await this.getAllFiles(projectPath);
      const allContent = [];

      // Sample files for pattern detection
      for (const file of files.slice(0, 50)) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          allContent.push(content);
        } catch (err) {
          // Skip
        }
      }

      const combinedContent = allContent.join('\n');

      // Detect microservices patterns
      let microserviceIndicators = 0;
      this.architecturePatterns.microservices.forEach(pattern => {
        if (pattern.test(combinedContent)) {
          microserviceIndicators++;
          metrics.patterns.push(pattern.source);
        }
      });

      if (microserviceIndicators >= 2) {
        metrics.architectureStyle = 'microservices';
      }

      // Detect design patterns
      this.architecturePatterns.designPatterns.forEach(pattern => {
        if (pattern.test(combinedContent)) {
          metrics.designPatterns.push(pattern.source);
        }
      });

      // Detect clean code practices
      this.architecturePatterns.cleanCode.forEach(pattern => {
        if (pattern.test(combinedContent)) {
          metrics.patterns.push(pattern.source);
        }
      });

      // Check for documentation
      metrics.hasDocumentation = files.some(f => 
        /readme\.md|documentation\.md|docs\//i.test(f)
      );

      metrics.hasAPIDocumentation = files.some(f => 
        /swagger|openapi|api.*docs/i.test(f)
      ) || /swagger|openapi/.test(combinedContent);

    } catch (error) {
      console.error('Architecture analysis error:', error.message);
    }

    return metrics;
  }

  /**
   * MAINTAINABILITY INDEX
   * Calculate maintainability index (0-100)
   */
  calculateMaintainability(complexity, modularity, tests) {
    // Microsoft formula (simplified)
    const complexityScore = Math.max(0, 100 - (complexity.avgComplexity * 2));
    const modularityScore = (modularity.cohesionScore * 100);
    const testScore = tests.estimatedCoverage;

    const maintainabilityIndex = 
      (complexityScore * 0.4) + 
      (modularityScore * 0.3) + 
      (testScore * 0.3);

    return {
      index: Math.round(maintainabilityIndex),
      complexityContribution: complexityScore,
      modularityContribution: modularityScore,
      testContribution: testScore
    };
  }

  /**
   * Calculate overall engineering maturity score
   */
  calculateEngineeringMaturity(analysis) {
    const weights = {
      complexity: 0.20,
      modularity: 0.15,
      tests: 0.25,
      security: 0.25,
      architecture: 0.15
    };

    // Complexity score (inverse - lower complexity is better)
    const complexityScore = analysis.complexityAnalysis.avgComplexity
      ? Math.max(0, 100 - (analysis.complexityAnalysis.avgComplexity * 2))
      : 50;

    // Modularity score
    const modularityScore = (analysis.modularityScore || 0.5) * 100;

    // Test score
    const testScore = analysis.testCoverageAnalysis.estimatedCoverage || 0;

    // Security score
    const securityScore = analysis.securityHygiene.securityScore || 50;

    // Architecture score
    const architectureScore = this.calculateArchitectureScore(analysis.architectureInsights);

    const totalScore = 
      (complexityScore * weights.complexity) +
      (modularityScore * weights.modularity) +
      (testScore * weights.tests) +
      (securityScore * weights.security) +
      (architectureScore * weights.architecture);

    return Math.round(totalScore);
  }

  calculateArchitectureScore(architecture) {
    let score = 50; // Base score

    if (architecture.architectureStyle === 'microservices') score += 20;
    if (architecture.designPatterns && architecture.designPatterns.length > 0) {
      score += Math.min(architecture.designPatterns.length * 5, 20);
    }
    if (architecture.hasDocumentation) score += 5;
    if (architecture.hasAPIDocumentation) score += 5;

    return Math.min(score, 100);
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    // Complexity recommendations
    if (analysis.complexityAnalysis.avgComplexity > 20) {
      recommendations.push({
        category: 'Complexity',
        priority: 'HIGH',
        issue: `High cyclomatic complexity (${analysis.complexityAnalysis.avgComplexity})`,
        action: 'Refactor complex functions, extract methods, simplify conditional logic',
        impact: 'Improves maintainability and reduces bug density'
      });
    }

    // Test coverage recommendations
    if (analysis.testCoverageAnalysis.estimatedCoverage < 60) {
      recommendations.push({
        category: 'Testing',
        priority: 'CRITICAL',
        issue: `Low test coverage (${analysis.testCoverageAnalysis.estimatedCoverage}%)`,
        action: 'Implement unit tests for core business logic, add integration tests',
        impact: 'Reduces production bugs by 40-60%'
      });
    }

    // Security recommendations
    if (analysis.securityHygiene.vulnerabilities.length > 0) {
      recommendations.push({
        category: 'Security',
        priority: 'CRITICAL',
        issue: `${analysis.securityHygiene.vulnerabilities.length} security vulnerabilities detected`,
        action: 'Review and fix security issues, implement security middleware',
        impact: 'Prevents data breaches and security incidents'
      });
    }

    // Architecture recommendations
    if (!analysis.architectureInsights.hasDocumentation) {
      recommendations.push({
        category: 'Documentation',
        priority: 'MEDIUM',
        issue: 'Missing technical documentation',
        action: 'Add README, architecture diagrams, API documentation',
        impact: 'Improves team collaboration and onboarding'
      });
    }

    return recommendations;
  }

  /**
   * Generate fallback analysis when no projects available
   */
  generateFallbackAnalysis(resumeData) {
    return {
      engineeringMaturityScore: 50,
      complexityAnalysis: { avgComplexity: 15, estimatedLevel: 'moderate' },
      modularityScore: 0.5,
      testCoverageAnalysis: { hasTests: false, estimatedCoverage: 0 },
      securityHygiene: { securityScore: 50, hasSecurityAwareness: false },
      architectureInsights: { architectureStyle: 'unknown', patterns: [] },
      maintainabilityIndex: 50,
      recommendations: [
        {
          category: 'Projects',
          priority: 'HIGH',
          issue: 'No code samples available for analysis',
          action: 'Upload project repositories to enable code quality analysis',
          impact: 'Enables precise technical skill validation'
        }
      ],
      overallRating: 'Intermediate',
      note: 'Analysis based on resume only. Upload projects for detailed code quality insights.'
    };
  }

  getRatingLevel(score) {
    if (score >= 85) return 'Expert';
    if (score >= 70) return 'Advanced';
    if (score >= 55) return 'Intermediate';
    return 'Developing';
  }

  /**
   * Helper methods
   */
  async getCodeFiles(dir) {
    const files = await this.getAllFiles(dir);
    return files.filter(f => 
      /\.(js|ts|jsx|tsx|py|java|cpp|c|go|rs)$/.test(f) &&
      !/node_modules|dist|build|\.next|\.git/.test(f)
    );
  }

  async getAllFiles(dir, fileList = []) {
    try {
      const files = await fs.readdir(dir, { withFileTypes: true });
      
      for (const file of files) {
        const filePath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
          if (!file.name.startsWith('.') && 
              !['node_modules', 'dist', 'build', '.git'].includes(file.name)) {
            await this.getAllFiles(filePath, fileList);
          }
        } else {
          fileList.push(filePath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or permission denied
    }

    return fileList;
  }

  // Merge helper methods
  mergeComplexity(analysis, metrics) {
    if (!analysis.complexityAnalysis.avgComplexity) {
      analysis.complexityAnalysis = metrics;
    } else {
      // Average with existing
      const count = analysis.complexityCount || 1;
      analysis.complexityAnalysis.avgComplexity = 
        (analysis.complexityAnalysis.avgComplexity * count + metrics.avgComplexity) / (count + 1);
      analysis.complexityCount = count + 1;
    }
  }

  mergeModularity(analysis, metrics) {
    if (!analysis.modularityScore) {
      analysis.modularityScore = metrics.cohesionScore;
      analysis.modularityDetails = metrics;
    } else {
      analysis.modularityScore = (analysis.modularityScore + metrics.cohesionScore) / 2;
    }
  }

  mergeTestCoverage(analysis, metrics) {
    if (!analysis.testCoverageAnalysis.hasTests) {
      analysis.testCoverageAnalysis = metrics;
    } else {
      analysis.testCoverageAnalysis.testFiles += metrics.testFiles;
      analysis.testCoverageAnalysis.hasTests = analysis.testCoverageAnalysis.hasTests || metrics.hasTests;
      analysis.testCoverageAnalysis.testFrameworks = [
        ...new Set([
          ...(analysis.testCoverageAnalysis.testFrameworks || []),
          ...metrics.testFrameworks
        ])
      ];
    }
  }

  mergeSecurity(analysis, metrics) {
    if (!analysis.securityHygiene.securityScore) {
      analysis.securityHygiene = metrics;
    } else {
      analysis.securityHygiene.securityScore = 
        (analysis.securityHygiene.securityScore + metrics.securityScore) / 2;
      analysis.securityHygiene.vulnerabilities.push(...metrics.vulnerabilities);
      analysis.securityHygiene.goodPractices.push(...metrics.goodPractices);
    }
  }

  mergeArchitecture(analysis, metrics) {
    if (!analysis.architectureInsights.patterns) {
      analysis.architectureInsights = metrics;
    } else {
      analysis.architectureInsights.patterns.push(...metrics.patterns);
      analysis.architectureInsights.designPatterns.push(...metrics.designPatterns);
    }
  }

  mergeMaintainability(analysis, metrics) {
    if (!analysis.maintainabilityIndex) {
      analysis.maintainabilityIndex = metrics.index;
      analysis.maintainabilityDetails = metrics;
    } else {
      analysis.maintainabilityIndex = (analysis.maintainabilityIndex + metrics.index) / 2;
    }
  }
}

module.exports = { CodeQualityEngine };
