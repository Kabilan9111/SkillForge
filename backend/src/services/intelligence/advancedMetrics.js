/**
 * ========================================================================
 * ADVANCED METRICS CALCULATION ENGINE
 * ========================================================================
 * 
 * Enterprise-level intelligence metrics
 * 
 * Calculates:
 * - Developer Capability Index (DCI) – Overall technical capability (0-100)
 * - Engineering Maturity Score – Code quality and practices (0-100)
 * - Architectural Thinking Score – System design capability (0-100)
 * - Scalability Readiness – Ability to build scalable systems (0-100)
 * - Security Hygiene Index – Security awareness and practices (0-100)
 * - Maintainability Index – Code maintainability (0-100)
 * - Industry Competitiveness Index – Market positioning (0-100)
 * - Technical Depth Score – Expertise level (0-100)
 * - Production Readiness Score – Ready for professional work (0-100)
 * 
 * Like Microsoft/Google internal engineering metrics
 */

class AdvancedMetricsEngine {
  constructor() {
    // Weights for DCI calculation (total = 1.0)
    this.dciWeights = {
      skillBreadth: 0.15,        // How many skills
      skillDepth: 0.25,          // How deep is expertise
      codeQuality: 0.20,         // Engineering standards
      architecture: 0.15,        // System design thinking
      authentication: 0.10,      // Validates claims
      marketAlignment: 0.15      // Industry readiness
    };

    // Industry benchmarks (from real market data)
    this.industryBenchmarks = {
      FAANG: {
        dci: 85,
        engineeringMaturity: 90,
        architectureScore: 85,
        testCoverage: 80,
        securityHygiene: 95
      },
      startup: {
        dci: 75,
        engineeringMaturity: 70,
        architectureScore: 70,
        testCoverage: 60,
        securityHygiene: 75
      },
      midsize: {
        dci: 70,
        engineeringMaturity: 75,
        architectureScore: 65,
        testCoverage: 65,
        securityHygiene: 80
      },
      junior: {
        dci: 50,
        engineeringMaturity: 55,
        architectureScore: 45,
        testCoverage: 40,
        securityHygiene: 60
      }
    };
  }

  /**
   * Calculate all advanced metrics from intelligence layers
   */
  calculateAllMetrics(intelligenceData) {
    const {
      layer1, // Structured parsing
      layer2, // Depth detection
      layer3, // Code quality
      layer4, // Industry benchmark
      layer5, // Commit validation
      layer6  // Career projection
    } = intelligenceData;

    const metrics = {
      // Primary Metrics
      developerCapabilityIndex: this.calculateDCI(intelligenceData),
      engineeringMaturityScore: layer3?.engineeringMaturityScore || 0,
      architecturalThinkingScore: this.calculateArchitecturalThinking(intelligenceData),
      scalabilityReadiness: this.calculateScalabilityReadiness(intelligenceData),
      securityHygieneIndex: layer3?.securityHygiene?.securityScore || 0,
      maintainabilityIndex: layer3?.maintainabilityIndex || 0,
      industryCompetitivenessIndex: this.calculateIndustryCompetitiveness(intelligenceData),
      
      // Secondary Metrics
      technicalDepthScore: this.calculateTechnicalDepth(layer2),
      productionReadinessScore: this.calculateProductionReadiness(intelligenceData),
      innovationPotential: this.calculateInnovationPotential(intelligenceData),
      collaborationScore: this.calculateCollaborationScore(intelligenceData),
      learningVelocity: this.calculateLearningVelocity(layer6),
      
      // Composite Scores
      technicalExcellence: this.calculateTechnicalExcellence(intelligenceData),
      careerMomentum: this.calculateCareerMomentum(layer6),
      
      // Insights
      overallRating: '',
      competitiveStanding: '',
      readinessLevel: '',
      marketPosition: '',
      
      // Detailed Breakdown
      breakdown: {}
    };

    // Add ratings
    metrics.overallRating = this.getRatingLevel(metrics.developerCapabilityIndex);
    metrics.competitiveStanding = this.getCompetitiveStanding(metrics.industryCompetitivenessIndex);
    metrics.readinessLevel = this.getReadinessLevel(metrics.productionReadinessScore);
    metrics.marketPosition = this.getMarketPosition(intelligenceData);

    // Add detailed breakdown
    metrics.breakdown = this.generateBreakdown(intelligenceData, metrics);

    return metrics;
  }

  /**
   * DEVELOPER CAPABILITY INDEX (DCI)
   * Microsoft/Google-style comprehensive capability score
   */
  calculateDCI(intelligenceData) {
    const { layer1, layer2, layer3, layer4, layer5 } = intelligenceData;

    // 1. Skill Breadth (0-100)
    const breadthScore = this.calculateSkillBreadth(layer1);

    // 2. Skill Depth (0-100)
    const depthScore = this.calculateAverageDepth(layer2);

    // 3. Code Quality (0-100)
    const qualityScore = layer3?.engineeringMaturityScore || 50;

    // 4. Architecture (0-100)
    const architectureScore = this.calculateArchitecturalThinking({
      layer1, layer2, layer3, layer4, layer5
    });

    // 5. Authenticity (0-100)
    const authScore = layer5?.authenticityScore || 50;

    // 6. Market Alignment (0-100)
    const marketScore = this.calculateMarketAlignment(layer4);

    // Weighted DCI
    const dci = 
      (breadthScore * this.dciWeights.skillBreadth) +
      (depthScore * this.dciWeights.skillDepth) +
      (qualityScore * this.dciWeights.codeQuality) +
      (architectureScore * this.dciWeights.architecture) +
      (authScore * this.dciWeights.authentication) +
      (marketScore * this.dciWeights.marketAlignment);

    return Math.round(dci);
  }

  /**
   * Calculate skill breadth score
   */
  calculateSkillBreadth(layer1) {
    if (!layer1?.normalizedSkills) return 50;

    const skillCount = layer1.normalizedSkills.length;
    const categories = layer1.capabilityGraph?.categories || {};
    const categoryCount = Object.keys(categories).length;

    // More skills = higher breadth, but with diminishing returns
    const countScore = Math.min((skillCount / 30) * 100, 100);
    
    // More diverse categories = higher breadth
    const diversityScore = Math.min((categoryCount / 8) * 100, 100);

    // Weighted average
    return (countScore * 0.6) + (diversityScore * 0.4);
  }

  /**
   * Calculate average depth across all skills
   */
  calculateAverageDepth(layer2) {
    if (!layer2?.classified) return 50;

    const { expert, applied, intermediate, surface } = layer2.classified;

    const expertCount = expert?.length || 0;
    const appliedCount = applied?.length || 0;
    const intermediateCount = intermediate?.length || 0;
    const surfaceCount = surface?.length || 0;

    const total = expertCount + appliedCount + intermediateCount + surfaceCount;
    if (total === 0) return 50;

    // Weighted depth score
    const depthScore = 
      (expertCount * 100 + 
       appliedCount * 75 + 
       intermediateCount * 50 + 
       surfaceCount * 25) / total;

    return Math.round(depthScore);
  }

  /**
   * ARCHITECTURAL THINKING SCORE
   * Measures system design and architecture capability
   */
  calculateArchitecturalThinking(intelligenceData) {
    const { layer1, layer2, layer3, layer5 } = intelligenceData;

    let score = 0;

    // 1. Architecture keywords in skills (20 points)
    const architectureSkills = [
      'System Design', 'Microservices', 'API Design', 'Database Design',
      'Scalability', 'Load Balancing', 'Caching', 'Message Queues',
      'Event-Driven', 'Service Mesh', 'API Gateway'
    ];

    const detectedArchSkills = layer1?.normalizedSkills?.filter(skill =>
      architectureSkills.some(arch => skill.toLowerCase().includes(arch.toLowerCase()))
    ) || [];

    score += Math.min((detectedArchSkills.length / architectureSkills.length) * 20, 20);

    // 2. Architecture patterns in code (30 points)
    if (layer3?.architectureInsights) {
      const patterns = layer3.architectureInsights.designPatterns?.length || 0;
      score += Math.min((patterns / 5) * 30, 30);

      if (layer3.architectureInsights.architectureStyle === 'microservices') {
        score += 20;
      } else if (layer3.architectureInsights.architectureStyle === 'layered') {
        score += 10;
      }
    }

    // 3. Depth of architecture skills (20 points)
    if (layer2?.classified) {
      const archExpertSkills = layer2.classified.expert?.filter(s =>
        architectureSkills.some(arch => s.skill?.toLowerCase().includes(arch.toLowerCase()))
      ) || [];
      score += Math.min((archExpertSkills.length / 3) * 20, 20);
    }

    // 4. Project complexity indicators (30 points)
    if (layer5?.projectInsights) {
      const complexityScore = layer5.projectInsights.averageComplexity || 0;
      score += (complexityScore / 100) * 30;
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * SCALABILITY READINESS
   * Can they build systems that scale?
   */
  calculateScalabilityReadiness(intelligenceData) {
    const { layer1, layer2, layer3 } = intelligenceData;

    let score = 0;

    // Scalability-related skills
    const scalabilitySkills = [
      'Redis', 'Memcached', 'Kafka', 'RabbitMQ', 'Load Balancing',
      'Horizontal Scaling', 'Caching', 'CDN', 'Database Sharding',
      'Microservices', 'Container Orchestration', 'Kubernetes', 'Docker'
    ];

    const detectedScalabilitySkills = layer1?.normalizedSkills?.filter(skill =>
      scalabilitySkills.some(s => skill.toLowerCase().includes(s.toLowerCase()))
    ) || [];

    // Skill presence (40 points)
    score += Math.min((detectedScalabilitySkills.length / scalabilitySkills.length) * 40, 40);

    // Depth of scalability skills (30 points)
    if (layer2?.classified) {
      const expertScalabilitySkills = layer2.classified.expert?.filter(s =>
        scalabilitySkills.some(sc => s.skill?.toLowerCase().includes(sc.toLowerCase()))
      ) || [];
      score += Math.min((expertScalabilitySkills.length / 4) * 30, 30);
    }

    // Architecture evidence (30 points)
    if (layer3?.architectureInsights) {
      if (layer3.architectureInsights.architectureStyle === 'microservices') {
        score += 20;
      }
      const hasScalabilityPatterns = layer3.architectureInsights.patterns?.some(p =>
        /load.*balanc|cache|queue|scale/i.test(p)
      );
      if (hasScalabilityPatterns) score += 10;
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * INDUSTRY COMPETITIVENESS INDEX
   * How competitive are they in the job market?
   */
  calculateIndustryCompetitiveness(intelligenceData) {
    const { layer4 } = intelligenceData;

    if (!layer4?.bestFit) return 50;

    // Based on best role alignment
    const alignmentScore = layer4.bestFit.alignmentScore || 50;

    // Bonus for high alignment with multiple roles
    const allRoles = layer4.roleComparisons || [];
    const highAlignmentRoles = allRoles.filter(r => (r.alignmentScore || 0) >= 75);
    const versatilityBonus = Math.min(highAlignmentRoles.length * 5, 20);

    // Compensation tier bonus
    let compensationBonus = 0;
    if (layer4.compensationEstimate) {
      const avgComp = (layer4.compensationEstimate.range.low + layer4.compensationEstimate.range.high) / 2;
      if (avgComp >= 150000) compensationBonus = 15;
      else if (avgComp >= 120000) compensationBonus = 10;
      else if (avgComp >= 90000) compensationBonus = 5;
    }

    return Math.min(Math.round(alignmentScore + versatilityBonus + compensationBonus), 100);
  }

  /**
   * TECHNICAL DEPTH SCORE
   * Measures expertise level
   */
  calculateTechnicalDepth(layer2) {
    if (!layer2?.classified) return 50;

    const expertCount = layer2.classified.expert?.length || 0;
    const appliedCount = layer2.classified.applied?.length || 0;
    const totalSkills = 
      expertCount + 
      (layer2.classified.applied?.length || 0) +
      (layer2.classified.intermediate?.length || 0) +
      (layer2.classified.surface?.length || 0);

    if (totalSkills === 0) return 50;

    // Percentage of expert + applied skills
    const deepSkillsRatio = (expertCount + appliedCount) / totalSkills;
    const depthScore = deepSkillsRatio * 100;

    // Bonus for having multiple expert skills
    const expertBonus = Math.min(expertCount * 5, 20);

    return Math.min(Math.round(depthScore + expertBonus), 100);
  }

  /**
   * PRODUCTION READINESS SCORE
   * Can they contribute to production immediately?
   */
  calculateProductionReadiness(intelligenceData) {
    const { layer2, layer3, layer5 } = intelligenceData;

    let score = 0;

    // 1. Code quality (30 points)
    if (layer3?.engineeringMaturityScore) {
      score += (layer3.engineeringMaturityScore / 100) * 30;
    } else {
      score += 15; // Default
    }

    // 2. Test coverage (20 points)
    if (layer3?.testCoverageAnalysis) {
      score += (layer3.testCoverageAnalysis.estimatedCoverage / 100) * 20;
    }

    // 3. Security awareness (20 points)
    if (layer3?.securityHygiene) {
      score += (layer3.securityHygiene.securityScore / 100) * 20;
    } else {
      score += 10;
    }

    // 4. Skill depth (20 points)
    const depthScore = this.calculateTechnicalDepth(layer2);
    score += (depthScore / 100) * 20;

    // 5. Authenticity (10 points)
    if (layer5?.authenticityScore) {
      score += (layer5.authenticityScore / 100) * 10;
    } else {
      score += 5;
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * INNOVATION POTENTIAL
   * Ability to learn and build new things
   */
  calculateInnovationPotential(intelligenceData) {
    const { layer1, layer2, layer6 } = intelligenceData;

    let score = 50; // Base score

    // 1. Skill diversity (25 points)
    if (layer1?.capabilityGraph) {
      const categoryCount = Object.keys(layer1.capabilityGraph.categories || {}).length;
      score += Math.min((categoryCount / 8) * 25, 25);
    }

    // 2. Learning velocity (25 points)
    if (layer6?.growthMetrics) {
      const growthRate = layer6.growthMetrics.skillGrowthRate || 0;
      score += Math.min(growthRate * 5, 25);
    }

    // 3. Emerging tech adoption (25 points)
    const emergingTech = [
      'AI', 'Machine Learning', 'Blockchain', 'Web3', 'Rust', 'Go',
      'GraphQL', 'Next.js', 'Svelte', 'Edge Computing', 'Serverless'
    ];
    const adoptedEmergingTech = layer1?.normalizedSkills?.filter(skill =>
      emergingTech.some(tech => skill.toLowerCase().includes(tech.toLowerCase()))
    ) || [];
    score += Math.min((adoptedEmergingTech.length / emergingTech.length) * 25, 25);

    // 4. Project experimentation (25 points)
    if (layer2?.classified) {
      const expertInEmergingTech = layer2.classified.expert?.filter(s =>
        emergingTech.some(tech => s.skill?.toLowerCase().includes(tech.toLowerCase()))
      ) || [];
      score += Math.min(expertInEmergingTech.length * 10, 25);
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * COLLABORATION SCORE
   * Team player indicators
   */
  calculateCollaborationScore(intelligenceData) {
    const { layer1, layer3, layer5 } = intelligenceData;

    let score = 50; // Base

    // 1. Version control (20 points)
    const hasGit = layer1?.normalizedSkills?.some(s => /git/i.test(s));
    if (hasGit) score += 20;

    // 2. Code review & documentation (30 points)
    if (layer3?.architectureInsights) {
      if (layer3.architectureInsights.hasDocumentation) score += 15;
      if (layer3.architectureInsights.hasAPIDocumentation) score += 15;
    }

    // 3. Testing (shows consideration for team) (20 points)
    if (layer3?.testCoverageAnalysis) {
      score += (layer3.testCoverageAnalysis.estimatedCoverage / 100) * 20;
    }

    // 4. Project commits (30 points)
    if (layer5?.projectInsights) {
      const commitFrequency = layer5.projectInsights.commitFrequency || 0;
      score += Math.min(commitFrequency, 30);
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * LEARNING VELOCITY
   * How fast are they learning?
   */
  calculateLearningVelocity(layer6) {
    if (!layer6?.growthMetrics) return 50;

    const growthRate = layer6.growthMetrics.skillGrowthRate || 0;
    
    // Skills per month
    if (growthRate >= 3) return 100; // Fast learner
    if (growthRate >= 2) return 80;  // Good pace
    if (growthRate >= 1) return 60;  // Steady
    if (growthRate >= 0.5) return 40; // Slow
    return 20; // Stagnant
  }

  /**
   * TECHNICAL EXCELLENCE
   * Composite of depth + quality + architecture
   */
  calculateTechnicalExcellence(intelligenceData) {
    const depthScore = this.calculateTechnicalDepth(intelligenceData.layer2);
    const qualityScore = intelligenceData.layer3?.engineeringMaturityScore || 50;
    const architectureScore = this.calculateArchitecturalThinking(intelligenceData);

    return Math.round((depthScore + qualityScore + architectureScore) / 3);
  }

  /**
   * CAREER MOMENTUM
   * Growth trajectory
   */
  calculateCareerMomentum(layer6) {
    if (!layer6?.projections) return 50;

    const currentAlignment = layer6.analysis?.currentState?.alignment || 50;
    const sixMonthAlignment = layer6.projections.sixMonth?.projectedAlignment || currentAlignment;
    const oneYearAlignment = layer6.projections.oneYear?.projectedAlignment || sixMonthAlignment;

    // Calculate momentum
    const shortTermGrowth = sixMonthAlignment - currentAlignment;
    const longTermGrowth = oneYearAlignment - currentAlignment;

    const momentum = (shortTermGrowth * 2 + longTermGrowth) / 3;

    // Convert to 0-100 scale
    return Math.min(Math.max(50 + momentum * 2, 0), 100);
  }

  /**
   * Calculate market alignment
   */
  calculateMarketAlignment(layer4) {
    if (!layer4?.bestFit) return 50;
    return layer4.bestFit.alignmentScore || 50;
  }

  /**
   * Helper: Get rating level
   */
  getRatingLevel(dci) {
    if (dci >= 90) return 'World-Class Engineer';
    if (dci >= 85) return 'Senior/Staff Level';
    if (dci >= 75) return 'Mid-Senior Level';
    if (dci >= 65) return 'Mid-Level Engineer';
    if (dci >= 55) return 'Junior-to-Mid Level';
    if (dci >= 45) return 'Junior Engineer';
    return 'Entry Level';
  }

  /**
   * Helper: Get competitive standing
   */
  getCompetitiveStanding(competitiveness) {
    if (competitiveness >= 85) return 'Top 10% - Highly Competitive';
    if (competitiveness >= 75) return 'Top 25% - Competitive';
    if (competitiveness >= 60) return 'Top 50% - Above Average';
    if (competitiveness >= 45) return 'Average - Meeting Baseline';
    return 'Below Average - Needs Improvement';
  }

  /**
   * Helper: Get readiness level
   */
  getReadinessLevel(readiness) {
    if (readiness >= 85) return 'Production Ready - Can Start Immediately';
    if (readiness >= 70) return 'Nearly Ready - 1-2 Months';
    if (readiness >= 55) return 'Developing - 3-6 Months';
    return 'Building Foundations - 6+ Months';
  }

  /**
   * Helper: Get market position
   */
  getMarketPosition(intelligenceData) {
    const dci = this.calculateDCI(intelligenceData);

    if (dci >= 85) {
      return {
        tier: 'FAANG/Top-Tier',
        confidence: 'High',
        targetCompanies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix'],
        salary: '$140k - $250k+'
      };
    } else if (dci >= 75) {
      return {
        tier: 'Mid-to-Large Tech',
        confidence: 'High',
        targetCompanies: ['Stripe', 'Databricks', 'Uber', 'Airbnb', 'Spotify'],
        salary: '$120k - $200k'
      };
    } else if (dci >= 65) {
      return {
        tier: 'Startup/Scale-up',
        confidence: 'Moderate',
        targetCompanies: ['Series B-D Startups', 'Regional Tech Hubs'],
        salary: '$90k - $150k'
      };
    } else {
      return {
        tier: 'Entry Level/Internship',
        confidence: 'Moderate',
        targetCompanies: ['Early-stage startups', 'Junior positions'],
        salary: '$60k - $90k'
      };
    }
  }

  /**
   * Generate detailed breakdown
   */
  generateBreakdown(intelligenceData, metrics) {
    return {
      dci: {
        score: metrics.developerCapabilityIndex,
        components: {
          skillBreadth: Math.round(this.calculateSkillBreadth(intelligenceData.layer1)),
          skillDepth: this.calculateAverageDepth(intelligenceData.layer2),
          codeQuality: intelligenceData.layer3?.engineeringMaturityScore || 50,
          architecture: metrics.architecturalThinkingScore,
          authenticity: intelligenceData.layer5?.authenticityScore || 50,
          marketAlignment: this.calculateMarketAlignment(intelligenceData.layer4)
        }
      },
      strengths: this.identifyStrengths(metrics),
      weaknesses: this.identifyWeaknesses(metrics),
      recommendations: this.generateMetricRecommendations(metrics)
    };
  }

  /**
   * Identify strengths
   */
  identifyStrengths(metrics) {
    const strengths = [];

    if (metrics.technicalDepthScore >= 75) {
      strengths.push('Deep technical expertise');
    }
    if (metrics.engineeringMaturityScore >= 75) {
      strengths.push('High code quality standards');
    }
    if (metrics.architecturalThinkingScore >= 75) {
      strengths.push('Strong system design skills');
    }
    if (metrics.securityHygieneIndex >= 80) {
      strengths.push('Excellent security practices');
    }
    if (metrics.innovationPotential >= 75) {
      strengths.push('High innovation potential');
    }

    return strengths.length > 0 ? strengths : ['Foundation building in progress'];
  }

  /**
   * Identify weaknesses
   */
  identifyWeaknesses(metrics) {
    const weaknesses = [];

    if (metrics.testCoverageScore < 60) {
      weaknesses.push('Low test coverage');
    }
    if (metrics.architecturalThinkingScore < 50) {
      weaknesses.push('Limited system design experience');
    }
    if (metrics.securityHygieneIndex < 60) {
      weaknesses.push('Security hygiene needs improvement');
    }
    if (metrics.learningVelocity < 50) {
      weaknesses.push('Slow skill acquisition rate');
    }

    return weaknesses;
  }

  /**
   * Generate recommendations
   */
  generateMetricRecommendations(metrics) {
    const recommendations = [];

    if (metrics.developerCapabilityIndex < 70) {
      recommendations.push({
        metric: 'Developer Capability Index',
        action: 'Focus on depth: Master 3-5 core skills to expert level',
        impact: '+15-20 DCI points',
        priority: 'HIGH'
      });
    }

    if (metrics.architecturalThinkingScore < 60) {
      recommendations.push({
        metric: 'Architectural Thinking',
        action: 'Study system design: Take courses on microservices, scalability patterns',
        impact: '+20-25 architecture points',
        priority: 'HIGH'
      });
    }

    if (metrics.securityHygieneIndex < 70) {
      recommendations.push({
        metric: 'Security Hygiene',
        action: 'Learn security best practices: OWASP Top 10, secure coding',
        impact: '+15-20 security points',
        priority: 'CRITICAL'
      });
    }

    return recommendations;
  }
}

module.exports = { AdvancedMetricsEngine };
