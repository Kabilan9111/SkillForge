/**
 * ========================================================================
 * LAYER 5: PREDICTIVE CAREER PROJECTION ENGINE
 * ========================================================================
 * 
 * BILLION-DOLLAR BEHAVIOR
 * 
 * Based on current growth trajectory, predict:
 * - 6-month improvement path
 * - 1-year readiness
 * - Estimated compensation tier
 * - Industry competitiveness index
 * 
 * This makes SkillForge a predictive intelligence system.
 */

class CareerProjectionEngine {
  constructor(options = {}) {
    this.auditLogger = options.auditLogger;
    
    // Growth models
    this.growthModels = this.buildGrowthModels();
    
    // Industry trajectories  
    this.industryTrajectories = this.buildIndustryTrajectories();
    
    this.log('✅ Career Projection Engine initialized');
  }

  /**
   * Generate multi-timeline career projections
   */
  async analyze(currentState, benchmarkData, validationData, historicalData = null) {
    this.log('📊 Layer 5: Career Projection - Starting...');
    
    const startTime = Date.now();
    
    // Calculate current competitiveness
    const currentCompetitiveness = this.calculateCompetitiveness(currentState, benchmarkData);
    
    // Determine growth rate from historical data or estimate
    const growthRate = historicalData 
      ? this.calculateHistoricalGrowthRate(historicalData)
      : this.estimateGrowthRate(currentState, benchmarkData);
    
    // Generate projections
    const projections = {
      current: this.buildCurrentSnapshot(currentState, benchmarkData, currentCompetitiveness),
      sixMonth: this.project6Months(currentState, benchmarkData, growthRate, validationData),
      oneYear: this.project1Year(currentState, benchmarkData, growthRate, validationData),
      twoYear: this.project2Years(currentState, benchmarkData, growthRate, validationData)
    };
    
    // Career milestones
    projections.milestones = this.generateMilestones(projections, benchmarkData);
    
    // Skill acquisition timeline
    projections.skillTimeline = this.buildSkillTimeline(benchmarkData.bestFit.gaps, growthRate);
    
    // Compensation trajectory
    projections.compensationTrajectory = this.projectCompensation(
      benchmarkData.compensationEstimate,
      growthRate,
      currentState
    );
    
    // Confidence degradation alerts
    projections.degradationAlerts = this.buildDegradationAlerts(growthRate, currentState);
    
    const processingTime = Date.now() - startTime;
    
    this.log(`✅ Layer 5 Complete: Projected to ${projections.oneYear.readinessLevel} in 12 months (${processingTime}ms)`);
    
    return {
      projections,
      growthRate,
      recommendations: this.generateRecommendations(projections, benchmarkData),
      processingTime
    };
  }

  /**
   * Build current snapshot
   */
  buildCurrentSnapshot(currentState, benchmarkData, competitiveness) {
    return {
      timestamp: new Date().toISOString(),
      skillCount: currentState.totalSkills || 0,
      depthScore: currentState.depthScore || 0,
      industryAlignment: benchmarkData.bestFit.alignmentScore,
      readinessLevel: benchmarkData.bestFit.readinessLevel,
      competitivenessIndex: competitiveness.index,
      marketPosition: competitiveness.marketPosition,
      estimatedSalary: benchmarkData.compensationEstimate.range.average
    };
  }

  /**
   * 6-month projection
   */
  project6Months(currentState, benchmarkData, growthRate, validationData) {
    const currentAlignment = benchmarkData.bestFit.alignmentScore;
    const criticalGaps = benchmarkData.bestFit.gaps.filter(g => g.priority === 'CRITICAL').length;
    
    // Estimate skills that can be learned
    const skillsToLearn = Math.floor(6 * growthRate.skillsPerMonth);
    const gapsClosed = Math.min(skillsToLearn, criticalGaps);
    
    // Project alignment increase
    const alignmentIncrease = gapsClosed * 10; // Each critical skill adds ~10%
    const projectedAlignment = Math.min(currentAlignment + alignmentIncrease, 100);
    
    // Project depth score improvement
    const depthImprovement = skillsToLearn * 5;
    const projectedDepth = Math.min((currentState.depthScore || 50) + depthImprovement, 100);
    
    // Determine new readiness level
    const readinessLevel = this.determineReadiness(projectedAlignment, gapsClosed, criticalGaps);
    
    return {
      timeline: '6 months',
      skillsAcquired: skillsToLearn,
      gapsClosed,
      projectedAlignment,
      projectedDepth,
      readinessLevel,
      confidence: this.calculateProjectionConfidence(growthRate, 6),
      keyAchievements: this.identifyKeyAchievements(skillsToLearn, gapsClosed, 6)
    };
  }

  /**
   * 1-year projection
   */
  project1Year(currentState, benchmarkData, growthRate, validationData) {
    const currentAlignment = benchmarkData.bestFit.alignmentScore;
    const criticalGaps = benchmarkData.bestFit.gaps.filter(g => g.priority === 'CRITICAL').length;
    const highGaps = benchmarkData.bestFit.gaps.filter(g => g.priority === 'HIGH').length;
    
    // Estimate skills that can be learned
    const skillsToLearn = Math.floor(12 * growthRate.skillsPerMonth);
    const criticalClosed = Math.min(skillsToLearn * 0.6, criticalGaps);
    const highClosed = Math.min(skillsToLearn * 0.4, highGaps);
    const totalGapsClosed = Math.floor(criticalClosed + highClosed);
    
    // Project alignment
    const alignmentIncrease = (criticalClosed * 10) + (highClosed * 5);
    const projectedAlignment = Math.min(currentAlignment + alignmentIncrease, 100);
    
    // Project depth score
    const depthImprovement = skillsToLearn * 5;
    const projectedDepth = Math.min((currentState.depthScore || 50) + depthImprovement, 100);
    
    // Authenticity score improvement
    const authenticityImprovement = validationData?.validated 
      ? Math.min(validationData.authenticityScore + 20, 100)
      : 60;
    
    const readinessLevel = this.determineReadiness(projectedAlignment, criticalClosed, criticalGaps);
    
    return {
      timeline: '1 year',
      skillsAcquired: skillsToLearn,
      gapsClosed: totalGapsClosed,
      projectedAlignment,
      projectedDepth,
      authenticityScore: authenticityImprovement,
      readinessLevel,
      confidence: this.calculateProjectionConfidence(growthRate, 12),
      keyAchievements: this.identifyKeyAchievements(skillsToLearn, totalGapsClosed, 12),
      expectedRole: this.projectRole(projectedAlignment, benchmarkData)
    };
  }

  /**
   * 2-year projection
   */
  project2Years(currentState, benchmarkData, growthRate, validationData) {
    const skillsToLearn = Math.floor(24 * growthRate.skillsPerMonth);
    const projectedAlignment = Math.min(benchmarkData.bestFit.alignmentScore + (skillsToLearn * 4), 100);
    const projectedDepth = Math.min((currentState.depthScore || 50) + (skillsToLearn * 5), 100);
    
    return {
      timeline: '2 years',
      skillsAcquired: skillsToLearn,
      projectedAlignment,
      projectedDepth,
      readinessLevel: projectedAlignment >= 85 ? 'Senior Level Ready' : 'Experienced Professional',
      confidence: this.calculateProjectionConfidence(growthRate, 24),
      expectedRole: projectedAlignment >= 85 
        ? 'Senior ' + benchmarkData.bestFit.role
        : benchmarkData.bestFit.role
    };
  }

  /**
   * Calculate competitiveness index
   */
  calculateCompetitiveness(currentState, benchmarkData) {
    const alignment = benchmarkData.bestFit.alignmentScore;
    const depth = currentState.depthScore || 50;
    const diversity = currentState.diversityScore || 50;
    
    // Competitiveness index (0-100)
    const index = Math.round((alignment * 0.5) + (depth * 0.3) + (diversity * 0.2));
    
    // Market position
    let marketPosition;
    if (index >= 85) marketPosition = 'Top 10% (Elite)';
    else if (index >= 70) marketPosition = 'Top 25% (Strong)';
    else if (index >= 50) marketPosition = 'Top 50% (Competitive)';
    else if (index >= 30) marketPosition = 'Developing (Bottom 50%)';
    else marketPosition = 'Entry Level (Bottom 30%)';
    
    return { index, marketPosition };
  }

  /**
   * Calculate historical growth rate
   */
  calculateHistoricalGrowthRate(historicalData) {
    // Analyze past skill acquisition
    const months = historicalData.length;
    const skillsAdded = historicalData[historicalData.length - 1].skills - historicalData[0].skills;
    const skillsPerMonth = skillsAdded / months;
    
    // Growth velocity (accelerating, steady, declining)
    const recentGrowth = historicalData.slice(-3).reduce((sum, d, i, arr) => {
      if (i === 0) return 0;
      return sum + (d.skills - arr[i-1].skills);
    }, 0) / 3;
    
    const earlyGrowth = historicalData.slice(0, 3).reduce((sum, d, i, arr) => {
      if (i === 0) return 0;
      return sum + (d.skills - arr[i-1].skills);
    }, 0) / 3;
    
    let velocity = 'steady';
    if (recentGrowth > earlyGrowth * 1.2) velocity = 'accelerating';
    else if (recentGrowth < earlyGrowth * 0.8) velocity = 'declining';
    
    return {
      skillsPerMonth: Math.max(skillsPerMonth, 0.5),
      velocity,
      confidence: 0.9
    };
  }

  /**
   * Estimate growth rate (no historical data)
   */
  estimateGrowthRate(currentState, benchmarkData) {
    // Base rate: 1-2 skills per month for average learner
    let baseRate = 1.5;
    
    // Adjust based on current level
    if (benchmarkData.bestFit.alignmentScore < 30) {
      baseRate = 1.0; // Beginner: slower
    } else if (benchmarkData.bestFit.alignmentScore > 70) {
      baseRate = 2.0; // Advanced: faster
    }
    
    return {
      skillsPerMonth: baseRate,
      velocity: 'estimated',
      confidence: 0.6
    };
  }

  /**
   * Determine readiness level from alignment
   */
  determineReadiness(alignment, criticalClosed, totalCritical) {
    if (alignment >= 85 && criticalClosed === totalCritical) {
      return 'Job Ready';
    } else if (alignment >= 70) {
      return 'Nearly Ready (1-2 months)';
    } else if (alignment >= 50) {
      return 'Developing (3-6 months)';
    } else {
      return 'Foundation Building';
    }
  }

  /**
   * Calculate projection confidence
   */
  calculateProjectionConfidence(growthRate, months) {
    const baseConfidence = growthRate.confidence || 0.7;
    
    // Confidence decreases over time
    const timeDecay = Math.max(0.4, 1 - (months / 36));
    
    return Math.round(baseConfidence * timeDecay * 100);
  }

  /**
   * Identify key achievements
   */
  identifyKeyAchievements(skillsLearned, gapsClosed, months) {
    const achievements = [];
    
    if (gapsClosed >= 3) {
      achievements.push(`Closed ${gapsClosed} critical skill gaps`);
    }
    
    if (skillsLearned >= 6) {
      achievements.push(`Acquired ${skillsLearned} new technical skills`);
    }
    
    if (months >= 12) {
      achievements.push('Built production-ready portfolio');
      achievements.push('Competitive for mid-level positions');
    } else if (months >= 6) {
      achievements.push('Built project portfolio');
      achievements.push('Ready for junior positions');
    }
    
    return achievements;
  }

  /**
   * Project expected role
   */
  projectRole(projectedAlignment, benchmarkData) {
    if (projectedAlignment >= 85) {
      return benchmarkData.bestFit.role;
    } else if (projectedAlignment >= 70) {
      return 'Junior ' + benchmarkData.bestFit.role;
    } else {
      return 'Entry-level positions in related fields';
    }
  }

  /**
   * Generate career milestones
   */
  generateMilestones(projections, benchmarkData) {
    const milestones = [];
    
    // Milestone 1: First major gap closed
    milestones.push({
      month: 2,
      title: 'First Critical Skills Acquired',
      description: `Learn ${benchmarkData.bestFit.gaps.slice(0, 2).map(g => g.skill).join(', ')}`,
      impact: 'Foundation established'
    });
    
    // Milestone 2: Portfolio projects
    milestones.push({
      month: 4,
      title: 'Portfolio Development',
      description: 'Complete 2-3 projects demonstrating new skills',
      impact: 'Practical experience validated'
    });
    
    // Milestone 3: Job ready
    if (projections.oneYear.readinessLevel === 'Job Ready') {
      milestones.push({
        month: 10,
        title: 'Job Application Ready',
        description: 'All critical skills acquired, portfolio complete',
        impact: 'Ready to apply for target roles'
      });
    }
    
    return milestones;
  }

  /**
   * Build skill timeline
   */
  buildSkillTimeline(gaps, growthRate) {
    const timeline = [];
    const criticalGaps = gaps.filter(g => g.priority === 'CRITICAL');
    const highGaps = gaps.filter(g => g.priority === 'HIGH');
    
    let currentMonth = 0;
    
    // Phase 1: Critical skills (first 6 months)
    criticalGaps.slice(0, Math.ceil(6 * growthRate.skillsPerMonth)).forEach((gap, index) => {
      const month = Math.floor(index / growthRate.skillsPerMonth) + 1;
      timeline.push({
        month,
        phase: 'Critical Skills',
        skill: gap.skill,
        priority: gap.priority,
        estimatedWeeks: Math.ceil(4 / growthRate.skillsPerMonth)
      });
    });
    
    // Phase 2: High-priority skills (6-12 months)
    highGaps.slice(0, Math.ceil(6 * growthRate.skillsPerMonth)).forEach((gap, index) => {
      const month = 6 + Math.floor(index / growthRate.skillsPerMonth) + 1;
      timeline.push({
        month,
        phase: 'High-Impact Skills',
        skill: gap.skill,
        priority: gap.priority,
        estimatedWeeks: Math.ceil(3 / growthRate.skillsPerMonth)
      });
    });
    
    return timeline;
  }

  /**
   * Project compensation trajectory
   */
  projectCompensation(currentEstimate, growthRate, currentState) {
    const trajectory = [];
    
    // Current
    trajectory.push({
      timeline: 'Current',
      low: currentEstimate.range.low,
      average: currentEstimate.range.average,
      high: currentEstimate.range.high,
      tier: currentEstimate.tier
    });
    
    // 6 months
    const sixMonthMultiplier = 1 + (growthRate.skillsPerMonth * 6 * 0.02);
    trajectory.push({
      timeline: '6 months',
      low: Math.round(currentEstimate.range.low * sixMonthMultiplier),
      average: Math.round(currentEstimate.range.average * sixMonthMultiplier),
      high: Math.round(currentEstimate.range.high * sixMonthMultiplier),
      tier: currentEstimate.tier
    });
    
    // 1 year
    const oneYearMultiplier = 1 + (growthRate.skillsPerMonth * 12 * 0.02);
    trajectory.push({
      timeline: '1 year',
      low: Math.round(currentEstimate.range.low * oneYearMultiplier),
      average: Math.round(currentEstimate.range.average * oneYearMultiplier),
      high: Math.round(currentEstimate.range.high * oneYearMultiplier),
      tier: this.projectTier(currentEstimate.tier, oneYearMultiplier)
    });
    
    return trajectory;
  }

  /**
   * Project compensation tier
   */
  projectTier(currentTier, multiplier) {
    if (multiplier >= 1.3) {
      return currentTier.includes('Entry') ? 'Junior' : 'Mid-Level';
    }
    return currentTier;
  }

  /**
   * Build degradation alerts
   */
  buildDegradationAlerts(growthRate, currentState) {
    const alerts = [];
    
    // If no growth detected
    if (growthRate.skillsPerMonth < 0.5) {
      alerts.push({
        type: 'stagnation',
        severity: 'high',
        message: 'Skill growth has stalled',
        impact: 'Competitive gap will widen by 15-20% over next 6 months',
        action: 'Commit to learning 2-3 new skills per month'
      });
    }
    
    // If declining velocity
    if (growthRate.velocity === 'declining') {
      alerts.push({
        type: 'declining_momentum',
        severity: 'medium',
        message: 'Learning velocity is decreasing',
        impact: 'Time to job-readiness will extend by 3-6 months',
        action: 'Increase learning consistency and project work'
      });
    }
    
    // If low depth
    if (currentState.depthScore < 40) {
      alerts.push({
        type: 'shallow_knowledge',
        severity: 'medium',
        message: 'Most skills are surface-level',
        impact: 'Interview performance may suffer',
        action: 'Build projects to deepen practical experience'
      });
    }
    
    return alerts;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(projections, benchmarkData) {
    const recommendations = [];
    
    // Based on current state
    if (projections.current.competitivenessIndex < 50) {
      recommendations.push({
        priority: 'IMMEDIATE',
        category: 'Skill Development',
        action: `Focus on ${benchmarkData.bestFit.gaps.slice(0, 3).map(g => g.skill).join(', ')}`,
        expectedImprovement: '+20-30 points in competitiveness'
      });
    }
    
    // Based on 6-month projection
    if (projections.sixMonth.readinessLevel !== 'Job Ready') {
      recommendations.push({
        priority: 'HIGH',
        category: 'Portfolio Building',
        action: 'Build 2-3 projects showcasing target skills',
        expectedImprovement: 'Job-ready status in 6 months'
      });
    }
    
    // Based on degradation alerts
    if (projections.degradationAlerts.length > 0) {
      recommendations.push({
        priority: 'URGENT',
        category: 'Consistency',
        action: 'Establish regular learning routine (10+ hours/week)',
        expectedImprovement: 'Prevent skill gap widening'
      });
    }
    
    return recommendations;
  }

  /**
   * Build growth models
   */
  buildGrowthModels() {
    return {
      aggressive: { skillsPerMonth: 3, confidence: 0.6 },
      moderate: { skillsPerMonth: 2, confidence: 0.75 },
      conservative: { skillsPerMonth: 1, confidence: 0.85 }
    };
  }

  /**
   * Build industry trajectories
   */
  buildIndustryTrajectories() {
    return {
      'software-engineering': {
        entryToMid: 18, // months
        midToSenior: 36
      },
      'data-science': {
        entryToMid: 24,
        midToSenior: 48
      }
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

module.exports = { CareerProjectionEngine };
