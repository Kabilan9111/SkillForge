/**
 * ========================================================================
 * LAYER 3: INDUSTRY BENCHMARK MATCHING
 * ========================================================================
 * 
 * Market Readiness Analyzer
 * 
 * Instead of generic "missing skills", compare against:
 * - FAANG Backend Role
 * - Startup Full-Stack Role
 * - DevOps Engineer
 * - ML Engineer
 * - Product Engineer
 * 
 * Score alignment percentage for each role
 */

class IndustryBenchmarkEngine {
  constructor(options = {}) {
    this.auditLogger = options.auditLogger;
    
    // Industry role benchmarks
    this.roleBenchmarks = this.buildRoleBenchmarks();
    
    // Compensation data
    this.compensationData = this.buildCompensationData();
    
    this.log('✅ Industry Benchmark Engine initialized');
  }

  /**
   * Analyze resume against industry benchmarks
   */
  async analyze(detectedSkills, depthAnalysis) {
    this.log('📊 Layer 3: Industry Benchmark Matching - Starting...');
    
    const startTime = Date.now();
    
    // Extract skill set
    const skillSet = this.extractSkillSet(detectedSkills, depthAnalysis);
    
    // Match against all roles
    const roleMatches = [];
    
    for (const [roleName, benchmark] of Object.entries(this.roleBenchmarks)) {
      const match = this.matchAgainstRole(skillSet, benchmark);
      roleMatches.push({
        role: roleName,
        ...match
      });
    }

    // Sort by alignment score
    roleMatches.sort((a, b) => b.alignmentScore - a.alignmentScore);
    
    // Identify best fit
    const bestFit = roleMatches[0];
    const topThree = roleMatches.slice(0, 3);
    
    const processingTime = Date.now() - startTime;
    
    this.log(`✅ Layer 3 Complete: Best fit = ${bestFit.role} (${bestFit.alignmentScore}% match) (${processingTime}ms)`);
    
    return {
      bestFit,
      topThree,
      allMatches: roleMatches,
      marketInsights: this.generateMarketInsights(bestFit, skillSet),
      compensationEstimate: this.estimateCompensation(bestFit, skillSet),
      processingTime
    };
  }

  /**
   * Extract skill set with depth levels
   */
  extractSkillSet(detectedSkills, depthAnalysis) {
    const skillMap = new Map();
    
    depthAnalysis.skills.forEach(skill => {
      skillMap.set(skill.skill, {
        skill: skill.skill,
        depthLevel: skill.depthLevel,
        depthScore: skill.depthScore
      });
    });
    
    return skillMap;
  }

  /**
   * Match skill set against a role benchmark
   */
  matchAgainstRole(skillSet, benchmark) {
    const result = {
      required: {
        matched: [],
        missing: []
      },
      preferred: {
        matched: [],
        missing: []
      },
      bonus: {
        matched: []
      },
      alignmentScore: 0,
      readinessLevel: 'Not Ready',
      gaps: [],
      strengths: []
    };

    // Check required skills
    benchmark.required.forEach(reqSkill => {
      if (this.hasSkill(skillSet, reqSkill, 'applied')) {
        result.required.matched.push(reqSkill);
        result.strengths.push({
          skill: reqSkill,
          reason: 'Required skill - Strong match'
        });
      } else {
        result.required.missing.push(reqSkill);
        result.gaps.push({
          skill: reqSkill,
          priority: 'CRITICAL',
          reason: 'Required for this role'
        });
      }
    });

    // Check preferred skills
    benchmark.preferred.forEach(prefSkill => {
      if (this.hasSkill(skillSet, prefSkill, 'intermediate')) {
        result.preferred.matched.push(prefSkill);
        result.strengths.push({
          skill: prefSkill,
          reason: 'Preferred skill - Good match'
        });
      } else {
        result.preferred.missing.push(prefSkill);
        result.gaps.push({
          skill: prefSkill,
          priority: 'HIGH',
          reason: 'Strongly recommended for competitive edge'
        });
      }
    });

    // Check bonus skills
    benchmark.bonus?.forEach(bonusSkill => {
      if (this.hasSkill(skillSet, bonusSkill, 'surface')) {
        result.bonus.matched.push(bonusSkill);
        result.strengths.push({
          skill: bonusSkill,
          reason: 'Bonus skill - Competitive advantage'
        });
      }
    });

    // Calculate alignment score
    const requiredScore = (result.required.matched.length / benchmark.required.length) * 70;
    const preferredScore = (result.preferred.matched.length / benchmark.preferred.length) * 25;
    const bonusScore = Math.min((result.bonus.matched.length / (benchmark.bonus?.length || 1)) * 5, 5);
    
    result.alignmentScore = Math.round(requiredScore + preferredScore + bonusScore);

    // Determine readiness level
    result.readinessLevel = this.determineReadinessLevel(
      result.alignmentScore,
      result.required.matched.length,
      benchmark.required.length
    );

    return result;
  }

  /**
   * Check if skill exists at minimum depth
   */
  hasSkill(skillSet, targetSkill, minDepth = 'surface') {
    const depthHierarchy = ['surface', 'intermediate', 'applied', 'expert'];
    const minDepthIndex = depthHierarchy.indexOf(minDepth);
    
    for (const [skill, data] of skillSet) {
      if (skill.toLowerCase().includes(targetSkill.toLowerCase()) || 
          targetSkill.toLowerCase().includes(skill.toLowerCase())) {
        const skillDepthIndex = depthHierarchy.indexOf(data.depthLevel);
        if (skillDepthIndex >= minDepthIndex) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Determine readiness level
   */
  determineReadinessLevel(alignmentScore, matchedRequired, totalRequired) {
    if (alignmentScore >= 85 && matchedRequired === totalRequired) {
      return 'Job Ready';
    } else if (alignmentScore >= 70 && matchedRequired >= totalRequired * 0.8) {
      return 'Nearly Ready (1-2 months)';
    } else if (alignmentScore >= 50) {
      return 'Developing (3-6 months)';
    } else if (alignmentScore >= 30) {
      return 'Early Stage (6-12 months)';
    } else {
      return 'Foundation Building (12+ months)';
    }
  }

  /**
   * Generate market insights
   */
  generateMarketInsights(bestFit, skillSet) {
    const insights = {
      primaryRole: bestFit.role,
      marketDemand: this.getMarketDemand(bestFit.role),
      competitiveAdvantages: [],
      developmentAreas: [],
      careerOpportunities: []
    };

    // Identify competitive advantages
    bestFit.strengths.slice(0, 5).forEach(strength => {
      insights.competitiveAdvantages.push({
        skill: strength.skill,
        impact: 'High',
        reason: strength.reason
      });
    });

    // Identify development areas
    bestFit.gaps
      .filter(gap => gap.priority === 'CRITICAL')
      .slice(0, 5)
      .forEach(gap => {
        insights.developmentAreas.push({
          skill: gap.skill,
          urgency: gap.priority,
          impact: 'Critical for role qualification'
        });
      });

    // Career opportunities
    insights.careerOpportunities = this.identifyOpportunities(bestFit, skillSet);

    return insights;
  }

  /**
   * Get market demand for role
   */
  getMarketDemand(role) {
    const demandData = {
      'FAANG Backend Engineer': { level: 'Very High', growth: '+15% YoY', openings: '50,000+' },
      'Startup Full-Stack Engineer': { level: 'High', growth: '+22% YoY', openings: '80,000+' },
      'DevOps Engineer': { level: 'Very High', growth: '+25% YoY', openings: '45,000+' },
      'ML Engineer': { level: 'Extremely High', growth: '+35% YoY', openings: '40,000+' },
      'Product Engineer': { level: 'High', growth: '+18% YoY', openings: '35,000+' },
      'Frontend Engineer': { level: 'High', growth: '+12% YoY', openings: '70,000+' }
    };

    return demandData[role] || { level: 'Moderate', growth: '+10% YoY', openings: '10,000+' };
  }

  /**
   * Identify career opportunities
   */
  identifyOpportunities(bestFit, skillSet) {
    const opportunities = [];

    if (bestFit.alignmentScore >= 70) {
      opportunities.push({
        type: 'Direct Application',
        description: `Apply for ${bestFit.role} positions at mid-size companies`,
        timeline: 'Immediate',
        successRate: '70-80%'
      });
    }

    if (bestFit.alignmentScore >= 50) {
      opportunities.push({
        type: 'Targeted Upskilling',
        description: `Focus on ${bestFit.gaps.slice(0, 3).map(g => g.skill).join(', ')} to reach job-ready status`,
        timeline: '2-3 months',
        successRate: '85-90%'
      });
    }

    opportunities.push({
      type: 'Adjacent Roles',
      description: 'Consider related positions while building core skills',
      timeline: 'Immediate',
      successRate: '60-70%'
    });

    return opportunities;
  }

  /**
   * Estimate compensation tier
   */
  estimateCompensation(bestFit, skillSet) {
    const baseSalary = this.compensationData[bestFit.role] || this.compensationData['Default'];
    
    // Adjust based on alignment score
    const alignmentMultiplier = bestFit.alignmentScore / 100;
    
    // Adjust based on skill depth
    const avgDepth = this.calculateAverageDepth(skillSet);
    const depthMultiplier = avgDepth / 100;
    
    const estimatedLow = Math.round(baseSalary.low * alignmentMultiplier * depthMultiplier);
    const estimatedHigh = Math.round(baseSalary.high * alignmentMultiplier * depthMultiplier);
    
    return {
      currency: 'USD',
      range: {
        low: estimatedLow,
        high: estimatedHigh,
        average: Math.round((estimatedLow + estimatedHigh) / 2)
      },
      factors: {
        roleBase: `${baseSalary.low} - ${baseSalary.high}`,
        alignmentAdjustment: `${Math.round(alignmentMultiplier * 100)}%`,
        depthAdjustment: `${Math.round(depthMultiplier * 100)}%`
      },
      tier: this.getCompensationTier(Math.round((estimatedLow + estimatedHigh) / 2))
    };
  }

  /**
   * Calculate average depth score
   */
  calculateAverageDepth(skillSet) {
    let total = 0;
    let count = 0;
    
    for (const [_, data] of skillSet) {
      total += data.depthScore;
      count++;
    }
    
    return count > 0 ? total / count : 0;
  }

  /**
   * Get compensation tier
   */
  getCompensationTier(avgSalary) {
    if (avgSalary >= 150000) return 'Senior/Staff (Top 10%)';
    if (avgSalary >= 120000) return 'Mid-Senior (Top 25%)';
    if (avgSalary >= 90000) return 'Mid-Level (Top 50%)';
    if (avgSalary >= 65000) return 'Junior (Entry 50%)';
    return 'Entry-Level';
  }

  /**
   * Build role benchmarks
   */
  buildRoleBenchmarks() {
    return {
      'FAANG Backend Engineer': {
        required: ['Python', 'Java', 'System Design', 'Algorithms', 'Data Structures', 'SQL', 'REST API', 'Git'],
        preferred: ['Distributed Systems', 'Microservices', 'Redis', 'Kafka', 'Docker', 'Kubernetes', 'AWS'],
        bonus: ['GraphQL', 'gRPC', 'Terraform', 'Monitoring', 'Security']
      },
      'Startup Full-Stack Engineer': {
        required: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'REST API', 'Git', 'HTML/CSS'],
        preferred: ['TypeScript', 'Next.js', 'MongoDB', 'AWS', 'Docker', 'CI/CD', 'Testing'],
        bonus: ['React Native', 'GraphQL', 'Redis', 'Serverless', 'Analytics']
      },
      'DevOps Engineer': {
        required: ['Docker', 'Kubernetes', 'Linux', 'CI/CD', 'Git', 'AWS', 'Terraform'],
        preferred: ['Jenkins', 'Ansible', 'Monitoring', 'Logging', 'Security', 'Python', 'Bash'],
        bonus: ['Service Mesh', 'GitOps', 'Cloud Security', 'Cost Optimization']
      },
      'ML Engineer': {
        required: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'Data Structures', 'Statistics'],
        preferred: ['Deep Learning', 'NLP', 'Computer Vision', 'MLOps', 'Docker', 'AWS', 'Spark'],
        bonus: ['Transformers', 'Model Deployment', 'A/B Testing', 'Feature Engineering']
      },
      'Product Engineer': {
        required: ['JavaScript', 'React', 'Product Design', 'User Experience', 'REST API', 'Git'],
        preferred: ['TypeScript', 'Analytics', 'A/B Testing', 'Mobile Development', 'SQL'],
        bonus: ['Design Systems', 'Accessibility', 'Performance Optimization', 'SEO']
      },
      'Frontend Engineer': {
        required: ['JavaScript', 'React', 'HTML', 'CSS', 'Git', 'REST API'],
        preferred: ['TypeScript', 'Next.js', 'State Management', 'Testing', 'Webpack', 'Performance'],
        bonus: ['Web Animations', 'WebGL', 'PWA', 'Accessibility', 'SEO']
      }
    };
  }

  /**
   * Build compensation data (2026 market rates)
   */
  buildCompensationData() {
    return {
      'FAANG Backend Engineer': { low: 140000, high: 250000 },
      'Startup Full-Stack Engineer': { low: 90000, high: 160000 },
      'DevOps Engineer': { low: 110000, high: 180000 },
      'ML Engineer': { low: 130000, high: 220000 },
      'Product Engineer': { low: 100000, high: 170000 },
      'Frontend Engineer': { low: 85000, high: 150000 },
      'Default': { low: 70000, high: 120000 }
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

module.exports = { IndustryBenchmarkEngine };
