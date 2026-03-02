/**
 * Context-Aware Skill Intelligence Engine
 * Performs evidence-based skill inference with transparent reasoning
 * Mimics senior technical recruiter + interview coach evaluation
 * 
 * Supports two evaluation modes:
 * 1. BALANCED (default): Fair assessment, transparent reasoning
 * 2. STRICT: Interview-grade, production-evidence required
 */
class SkillProficiencyAnalyzer {
    constructor(mode = 'balanced') {
        this.evaluationMode = mode; // 'balanced' or 'strict'
        
        // Confidence level thresholds (aligned with real-world expectations)
        this.thresholds = {
            advanced: { minScore: 80, minEvidence: 3, minConfidence: 0.85, minDepth: 'expert' },
            demonstrated: { minScore: 65, minEvidence: 2, minConfidence: 0.75, minDepth: 'advanced' },
            implied: { minScore: 50, minEvidence: 1, minConfidence: 0.60, minDepth: 'intermediate' },
            explicit: { minScore: 40, minEvidence: 1, minConfidence: 0.50, minDepth: 'basic' }
        };
        
        // STRICT mode thresholds (interview-grade, production-evidence required)
        this.strictThresholds = {
            mastered: { minScore: 85, minEvidence: 3, minConfidence: 0.90, requiresProduction: true, requiresMetrics: true },
            developing: { minScore: 70, minEvidence: 2, minConfidence: 0.75, requiresProduction: true },
            basicExposure: { minScore: 50, minEvidence: 1, minConfidence: 0.60, allowsSkillsList: false },
            notDetected: { maxScore: 49 }
        };

        // Context depth indicators (aligned with engineering career progression)
        this.depthIndicators = {
            expert: {
                keywords: [
                    'architected', 'designed from scratch', 'led development', 'mentored team',
                    'optimized at scale', 'scaled to millions', 'production-grade architecture',
                    'enterprise-scale', 'high-traffic systems', 'distributed systems',
                    'performance tuning', 'capacity planning', 'system design', 'tech lead',
                    'established best practices', 'drove adoption', 'technical strategy'
                ],
                weight: 100,
                label: 'Advanced'
            },
            advanced: {
                keywords: [
                    'implemented', 'developed', 'built', 'integrated', 'deployed to production',
                    'configured', 'automated', 'managed', 'maintained production', 'migrated',
                    'production environment', 'live system', 'real-time processing', 'scalable',
                    'deployed', 'released', 'shipped to production', 'production-ready',
                    'ci/cd pipeline', 'containerized', 'orchestrated', 'monitored'
                ],
                weight: 80,
                label: 'Demonstrated'
            },
            intermediate: {
                keywords: [
                    'used in projects', 'worked with', 'utilized', 'applied', 'contributed to',
                    'assisted in', 'participated', 'supported', 'helped develop',
                    'collaborated on', 'experience with', 'hands-on', 'practical experience'
                ],
                weight: 60,
                label: 'Implied'
            },
            basic: {
                keywords: [
                    'learned', 'studied', 'exposed to', 'familiar with', 'basic knowledge',
                    'academic project', 'coursework', 'tutorial', 'online course',
                    'self-taught', 'learning', 'exploring', 'introduction to'
                ],
                weight: 40,
                label: 'Explicit'
            }
        };

        // Section weight multipliers
        this.sectionWeights = {
            experience: 1.5,    // Highest weight - real work experience
            projects: 1.3,      // High weight - practical application
            skills: 1.0,        // Standard weight - explicit listing
            summary: 1.2,       // Good weight - self-assessment
            education: 0.8,     // Lower weight - academic only
            certifications: 1.4, // High weight - validated knowledge
            other: 0.5          // Minimal weight
        };

        // Quantifiable impact patterns
        this.impactPatterns = [
            /\d+%\s*(improvement|increase|reduction|decrease|faster|better)/i,
            /\d+[kmb]?\+?\s*(users?|requests?|transactions?|records?)/i,
            /\d+\s*years?/i,
            /\d+\s*months?/i,
            /reduced\s+.*?\s+by\s+\d+/i,
            /improved\s+.*?\s+by\s+\d+/i,
            /increased\s+.*?\s+by\s+\d+/i
        ];
    }

    /**
     * Analyze skill with context-aware intelligence and transparent reasoning
     */
    analyzeProficiency(skill, evidence, sections) {
        if (!evidence || evidence.length === 0) {
            return {
                level: 'Not Detected',
                category: 'missing',
                score: 0,
                confidence: 0,
                reasoning: this.generateNotDetectedReasoning(skill),
                coachingTip: this.generateCoachingTip(skill, 'missing', 'Not Detected')
            };
        }

        // Calculate multiple scoring dimensions
        const frequencyScore = this.calculateFrequencyScore(evidence);
        const depthAnalysis = this.calculateDepthScore(evidence);
        const contextScore = this.calculateContextScore(evidence, sections);
        const placementScore = this.calculatePlacementScore(evidence);
        const impactScore = this.calculateImpactScore(evidence);
        const recencyScore = this.calculateRecencyScore(evidence, sections);

        // Weighted composite score (adjusted for realistic expectations)
        const compositeScore = Math.round(
            frequencyScore * 0.15 +
            depthAnalysis.score * 0.30 +  // Depth is most important
            contextScore * 0.25 +
            placementScore * 0.15 +
            impactScore * 0.10 +
            recencyScore * 0.05
        );

        // Calculate average confidence
        const avgConfidence = evidence.reduce((sum, e) => sum + e.confidence, 0) / evidence.length;

        // Determine confidence level with context
        const confidenceLevel = this.determineConfidenceLevel(
            compositeScore,
            evidence.length,
            avgConfidence,
            depthAnalysis.deepestLevel,
            skill
        );

        return {
            level: confidenceLevel.level,
            category: confidenceLevel.category,
            score: compositeScore,
            confidence: Math.round(avgConfidence * 100) / 100,
            depthLevel: depthAnalysis.deepestLevel,
            breakdown: {
                frequency: frequencyScore,
                depth: depthAnalysis.score,
                context: contextScore,
                placement: placementScore,
                impact: impactScore,
                recency: recencyScore
            },
            reasoning: this.generateTransparentReasoning(
                skill,
                confidenceLevel.level,
                evidence,
                compositeScore,
                depthAnalysis,
                sections
            ),
            coachingTip: this.generateCoachingTip(skill, confidenceLevel.category, confidenceLevel.level),
            evidenceSummary: this.summarizeEvidence(evidence)
        };
    }

    /**
     * STRICT MODE: Interview-grade analysis requiring production evidence
     * Applies negative inference and conservative scoring
     */
    analyzeStrictMode(skill, evidence, sections) {
        if (!evidence || evidence.length === 0) {
            return {
                state: 'Not Detected',
                score: 0,
                confidence: 0,
                evidenceQuality: 'none',
                justification: `${skill} not mentioned in resume`,
                evidenceLines: [],
                negativeInference: true
            };
        }

        // Check for skills-list-only mentions (instant disqualification in strict mode)
        const hasProductionEvidence = this.hasProductionContext(evidence);
        const hasMeasurableOutcome = this.hasMeasurableOutcome(evidence);
        const isSkillsListOnly = this.isSkillsListOnly(evidence, sections);

        if (isSkillsListOnly && !hasProductionEvidence) {
            return {
                state: 'Not Detected',
                score: 0,
                confidence: 0.20,
                evidenceQuality: 'skills-list-only',
                justification: `${skill} listed in skills section but no hands-on usage demonstrated`,
                evidenceLines: this.extractEvidenceLines(evidence),
                negativeInference: true,
                downgradeReason: 'Skills list mention without production context'
            };
        }

        // Calculate strict scoring
        const frequencyScore = this.calculateFrequencyScore(evidence);
        const depthAnalysis = this.calculateDepthScore(evidence);
        const contextScore = this.calculateContextScore(evidence, sections);
        const impactScore = this.calculateImpactScore(evidence);

        // Weighted for strict mode (depth + impact matter most)
        const compositeScore = Math.round(
            depthAnalysis.score * 0.40 +  // Production depth critical
            impactScore * 0.30 +           // Measurable outcomes required
            contextScore * 0.20 +
            frequencyScore * 0.10
        );

        // Apply strict classification
        const classification = this.classifyStrictMode(
            compositeScore,
            evidence.length,
            depthAnalysis,
            hasProductionEvidence,
            hasMeasurableOutcome
        );

        return {
            state: classification.state,
            score: classification.score,
            confidence: Math.round((evidence.reduce((sum, e) => sum + e.confidence, 0) / evidence.length) * 100) / 100,
            evidenceQuality: classification.evidenceQuality,
            justification: this.generateStrictJustification(skill, classification, evidence, hasProductionEvidence, hasMeasurableOutcome),
            evidenceLines: this.extractEvidenceLines(evidence),
            breakdown: {
                depth: depthAnalysis.score,
                impact: impactScore,
                context: contextScore,
                frequency: frequencyScore
            },
            productionEvidence: hasProductionEvidence,
            measurableOutcome: hasMeasurableOutcome,
            negativeInference: !hasProductionEvidence
        };
    }

    /**
     * Check if evidence shows production/deployment context
     */
    hasProductionContext(evidence) {
        const productionKeywords = [
            'deployed', 'production', 'live', 'released', 'shipped',
            'implemented', 'built', 'developed', 'architected', 'configured',
            'automated', 'migrated', 'optimized', 'scaled', 'maintained'
        ];

        return evidence.some(e => {
            const line = e.line.toLowerCase();
            return productionKeywords.some(kw => line.includes(kw));
        });
    }

    /**
     * Check if evidence includes measurable outcomes
     */
    hasMeasurableOutcome(evidence) {
        return evidence.some(e => {
            return this.impactPatterns.some(pattern => pattern.test(e.line));
        });
    }

    /**
     * Check if skill is only mentioned in skills list
     */
    isSkillsListOnly(evidence, sections) {
        // If all evidence comes from skills section only
        const nonSkillsEvidence = evidence.filter(e => 
            !['skills', 'skills_section', 'summary'].includes(e.source.toLowerCase())
        );
        
        return nonSkillsEvidence.length === 0;
    }

    /**
     * Classify skill in strict mode
     */
    classifyStrictMode(score, evidenceCount, depthAnalysis, hasProduction, hasMetrics) {
        const { mastered, developing, basicExposure } = this.strictThresholds;

        // MASTERED: Production evidence + metrics + expert depth
        if (score >= mastered.minScore && 
            evidenceCount >= mastered.minEvidence && 
            hasProduction && hasMetrics &&
            depthAnalysis.deepestLevel === 'expert') {
            return {
                state: 'Mastered',
                score: score,
                evidenceQuality: 'production-proven'
            };
        }

        // DEVELOPING: Production evidence + advanced depth
        if (score >= developing.minScore && 
            evidenceCount >= developing.minEvidence && 
            hasProduction &&
            (depthAnalysis.deepestLevel === 'advanced' || depthAnalysis.deepestLevel === 'expert')) {
            return {
                state: 'Developing',
                score: Math.min(score, 79), // Cap at 79
                evidenceQuality: 'production-verified'
            };
        }

        // BASIC EXPOSURE: Some evidence but no production context
        if (score >= basicExposure.minScore && 
            evidenceCount >= basicExposure.minEvidence) {
            return {
                state: 'Basic Exposure',
                score: Math.min(score, 60), // Cap at 60
                evidenceQuality: 'weak-implicit'
            };
        }

        // NOT DETECTED: Insufficient evidence
        return {
            state: 'Not Detected',
            score: 0,
            evidenceQuality: 'insufficient'
        };
    }

    /**
     * Generate justification for strict mode
     */
    generateStrictJustification(skill, classification, evidence, hasProduction, hasMetrics) {
        const evidenceSources = [...new Set(evidence.map(e => e.source))].join(', ');

        switch (classification.state) {
            case 'Mastered':
                return `${skill} demonstrated at expert level with production deployment and measurable impact across ${evidenceSources}`;

            case 'Developing':
                return `${skill} used in production context with ${evidence.length} pieces of evidence in ${evidenceSources}${!hasMetrics ? ', but lacks quantifiable metrics' : ''}`;

            case 'Basic Exposure':
                return `${skill} mentioned ${evidence.length} time(s) in ${evidenceSources} but no production usage or deployment context found`;

            case 'Not Detected':
            default:
                return `${skill} insufficient evidence for interview-grade validation`;
        }
    }

    /**
     * Extract evidence lines for strict mode
     */
    extractEvidenceLines(evidence) {
        return evidence.map(e => ({
            line: e.line.length > 100 ? e.line.substring(0, 100) + '...' : e.line,
            source: e.source,
            type: e.type,
            lineNumber: e.lineNumber
        }));
    }

    /**
     * Calculate frequency score (0-100) based on number of mentions
     */
    calculateFrequencyScore(evidence) {
        const count = evidence.length;
        if (count >= 5) return 100;
        if (count >= 4) return 90;
        if (count >= 3) return 75;
        if (count >= 2) return 60;
        return 40;
    }

    /**
     * Calculate depth score with detailed analysis
     */
    calculateDepthScore(evidence) {
        let expertCount = 0;
        let advancedCount = 0;
        let intermediateCount = 0;
        let basicCount = 0;
        let deepestLevel = 'basic';
        const matchedIndicators = [];

        evidence.forEach(e => {
            const line = e.line.toLowerCase();
            
            if (this.depthIndicators.expert.keywords.some(ind => line.includes(ind))) {
                expertCount++;
                deepestLevel = 'expert';
                const matched = this.depthIndicators.expert.keywords.find(ind => line.includes(ind));
                if (matched) matchedIndicators.push({ level: 'expert', indicator: matched });
            } else if (this.depthIndicators.advanced.keywords.some(ind => line.includes(ind))) {
                advancedCount++;
                if (deepestLevel !== 'expert') deepestLevel = 'advanced';
                const matched = this.depthIndicators.advanced.keywords.find(ind => line.includes(ind));
                if (matched) matchedIndicators.push({ level: 'advanced', indicator: matched });
            } else if (this.depthIndicators.intermediate.keywords.some(ind => line.includes(ind))) {
                intermediateCount++;
                if (deepestLevel === 'basic') deepestLevel = 'intermediate';
                const matched = this.depthIndicators.intermediate.keywords.find(ind => line.includes(ind));
                if (matched) matchedIndicators.push({ level: 'intermediate', indicator: matched });
            } else if (this.depthIndicators.basic.keywords.some(ind => line.includes(ind))) {
                basicCount++;
                const matched = this.depthIndicators.basic.keywords.find(ind => line.includes(ind));
                if (matched) matchedIndicators.push({ level: 'basic', indicator: matched });
            }
        });

        // Weight different depth levels
        const depthScore = (
            expertCount * this.depthIndicators.expert.weight +
            advancedCount * this.depthIndicators.advanced.weight +
            intermediateCount * this.depthIndicators.intermediate.weight +
            basicCount * this.depthIndicators.basic.weight
        ) / evidence.length;

        return {
            score: Math.min(100, Math.round(depthScore)),
            deepestLevel: deepestLevel,
            distribution: { expertCount, advancedCount, intermediateCount, basicCount },
            indicators: matchedIndicators.slice(0, 3) // Top 3 matched indicators
        };
    }

    /**
     * Calculate context score based on technical richness
     */
    calculateContextScore(evidence, sections) {
        let totalContextScore = 0;

        evidence.forEach(e => {
            let contextScore = 50; // Base score

            const line = e.line.toLowerCase();

            // Bonus for specific technical actions
            if (/built|developed|implemented|created|designed/i.test(line)) {
                contextScore += 15;
            }

            // Bonus for quantifiable metrics
            if (this.impactPatterns.some(pattern => pattern.test(line))) {
                contextScore += 20;
            }

            // Bonus for production/real-world context
            if (/production|live|deployed|released|launched/i.test(line)) {
                contextScore += 15;
            }

            // Bonus for team/scale context
            if (/team|users|scale|enterprise|distributed/i.test(line)) {
                contextScore += 10;
            }

            // Bonus for technical depth indicators
            if (/architecture|optimization|performance|security|scalability/i.test(line)) {
                contextScore += 15;
            }

            totalContextScore += Math.min(100, contextScore);
        });

        return Math.round(totalContextScore / evidence.length);
    }

    /**
     * Calculate placement score based on where skill appears
     */
    calculatePlacementScore(evidence) {
        let weightedScore = 0;
        let totalWeight = 0;

        evidence.forEach(e => {
            const weight = this.sectionWeights[e.source] || 0.5;
            const baseScore = e.type === 'explicit' ? 100 : 
                            e.type === 'implicit' ? 80 : 60; // inferred
            
            weightedScore += baseScore * weight;
            totalWeight += weight;
        });

        return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
    }

    /**
     * Calculate impact score based on quantifiable achievements
     */
    calculateImpactScore(evidence) {
        let impactCount = 0;

        evidence.forEach(e => {
            if (this.impactPatterns.some(pattern => pattern.test(e.line))) {
                impactCount++;
            }
        });

        // Score based on percentage of evidence with impact
        const impactPercentage = (impactCount / evidence.length) * 100;
        
        if (impactPercentage >= 50) return 100;
        if (impactPercentage >= 30) return 80;
        if (impactPercentage >= 15) return 60;
        return 40;
    }

    /**
     * Calculate recency score (prioritize recent experience)
     */
    calculateRecencyScore(evidence, sections) {
        // Check if skill appears in recent/current role
        const experienceLines = sections?.experience?.lines || [];
        if (experienceLines.length === 0) return 50; // Default if no experience

        // Get line numbers from first 5 lines of experience (most recent)
        const recentLines = experienceLines.slice(0, 5).map(l => l.lineNumber);
        
        const appearsInRecent = evidence.some(e => 
            recentLines.includes(e.lineNumber)
        );

        return appearsInRecent ? 100 : 70;
    }

    /**
     * Determine confidence level with context-aware logic
     */
    determineConfidenceLevel(score, evidenceCount, avgConfidence, depthLevel, skill) {
        const { advanced, demonstrated, implied, explicit } = this.thresholds;

        // Advanced: Expert-level usage in production context
        if (score >= advanced.minScore && 
            evidenceCount >= advanced.minEvidence && 
            avgConfidence >= advanced.minConfidence &&
            depthLevel === 'expert') {
            return { level: 'Advanced', category: 'core', color: 'success' };
        }

        // Demonstrated: Production-level practical experience
        if (score >= demonstrated.minScore && 
            evidenceCount >= demonstrated.minEvidence && 
            avgConfidence >= demonstrated.minConfidence &&
            (depthLevel === 'advanced' || depthLevel === 'expert')) {
            return { level: 'Demonstrated', category: 'core', color: 'success' };
        }

        // Implied: Solid practical usage, but not production-depth
        if (score >= implied.minScore && 
            evidenceCount >= implied.minEvidence && 
            avgConfidence >= implied.minConfidence) {
            return { level: 'Implied', category: 'developing', color: 'info' };
        }

        // Explicit: Mentioned but limited evidence of depth
        if (score >= explicit.minScore && evidenceCount >= 1) {
            return { level: 'Explicit', category: 'developing', color: 'warning' };
        }

        return { level: 'Not Detected', category: 'missing', color: 'danger' };
    }

    /**
     * Generate transparent, recruiter-style reasoning
     */
    generateTransparentReasoning(skill, level, evidence, score, depthAnalysis, sections) {
        const count = evidence.length;
        const sources = [...new Set(evidence.map(e => e.source))];
        const explicitCount = evidence.filter(e => e.type === 'explicit').length;
        const implicitCount = evidence.filter(e => e.type === 'implicit').length;
        const inferredCount = evidence.filter(e => e.type === 'inferred').length;
        const { deepestLevel, distribution, indicators } = depthAnalysis;

        // Build contextual reasoning
        let reasoning = '';
        
        switch (level) {
            case 'Advanced':
                reasoning = `**Production-Level Expertise**: ${skill} shows expert-level proficiency `;
                reasoning += `with ${count} pieces of evidence across ${sources.length > 1 ? sources.join(', ') : sources[0]}. `;
                
                if (distribution.expertCount > 0) {
                    reasoning += `Resume demonstrates ${distribution.expertCount > 1 ? 'multiple instances' : 'evidence'} of `;
                    reasoning += `advanced responsibilities like "${indicators[0]?.indicator || 'system architecture'}", `;
                    reasoning += `indicating leadership or ownership of ${skill} in production environments. `;
                }
                
                if (explicitCount > 0 && implicitCount > 0) {
                    reasoning += `Skill is both explicitly listed and demonstrated through concrete work experience. `;
                }
                
                reasoning += `**Assessment**: Ready for senior-level interviews. Score: ${score}/100.`;
                break;

            case 'Demonstrated':
                reasoning = `**Solid Production Experience**: ${skill} is well-demonstrated `;
                reasoning += `with ${count} reference${count > 1 ? 's' : ''} in ${sources.length > 1 ? sources.join(', ') : sources[0]}. `;
                
                if (distribution.advancedCount > 0 || distribution.expertCount > 0) {
                    reasoning += `Resume shows practical application through phrases like `;
                    const topIndicators = indicators.slice(0, 2).map(i => `"${i.indicator}"`).join(' and ');
                    reasoning += `${topIndicators}, `;
                    reasoning += `indicating hands-on production experience. `;
                }
                
                if (explicitCount > 0) {
                    reasoning += `Listed in skills section and reinforced through work experience. `;
                }
                
                reasoning += `**Assessment**: Strong foundation, ready for mid-level roles. `;
                reasoning += `Score: ${score}/100.`;
                break;

            case 'Implied':
                reasoning = `**Working Knowledge**: ${skill} appears ${count} time${count > 1 ? 's' : ''} `;
                reasoning += `in ${sources.length > 1 ? 'multiple sections' : sources[0]}. `;
                
                if (distribution.intermediateCount > 0) {
                    reasoning += `Evidence suggests practical usage through `;
                    reasoning += `phrases like "${indicators[0]?.indicator || 'worked with'}", `;
                    reasoning += `but lacks production-depth indicators. `;
                }
                
                if (inferredCount > 0 && explicitCount === 0) {
                    reasoning += `Skill is inferred from related technologies or workflows mentioned. `;
                }
                
                if (explicitCount > 0 && implicitCount === 0) {
                    reasoning += `Listed in skills but not demonstrated in project descriptions. `;
                }
                
                reasoning += `**Assessment**: Developing skill, consider highlighting specific use cases or projects. `;
                reasoning += `Score: ${score}/100.`;
                break;

            case 'Explicit':
                reasoning = `**Basic Exposure**: ${skill} mentioned ${count} time${count > 1 ? 's' : ''} `;
                reasoning += `but with limited depth indicators. `;
                
                if (distribution.basicCount > 0) {
                    reasoning += `Context suggests foundational knowledge through `;
                    reasoning += `phrases like "${indicators[0]?.indicator || 'familiar with'}" `;
                    reasoning += `rather than production experience. `;
                }
                
                if (sources.includes('education')) {
                    reasoning += `Primarily from academic or learning context. `;
                }
                
                reasoning += `**Assessment**: Entry-level familiarity. `;
                reasoning += `To strengthen: add specific projects, quantifiable results, or production use cases. `;
                reasoning += `Score: ${score}/100.`;
                break;

            default:
                reasoning = this.generateNotDetectedReasoning(skill);
        }

        return reasoning;
    }

    /**
     * Generate reasoning for not detected skills
     */
    generateNotDetectedReasoning(skill) {
        return `**Not Detected**: ${skill} was not found in resume. ` +
               `No explicit mentions in skills section, no implicit demonstrations in work experience, ` +
               `and no evidence in project descriptions. This doesn't necessarily mean you lack the skill—` +
               `it may simply not be prominently featured. Consider adding if relevant to target role.`;
    }

    /**
     * Generate coaching-style tips
     */
    generateCoachingTip(skill, category, level) {
        const tips = {
            core: {
                advanced: `✓ Strong signal for ${skill}. Highlight this in interviews and lead with it in your pitch.`,
                demonstrated: `✓ Solid experience with ${skill}. Consider quantifying impact (e.g., "reduced latency by X%" or "improved throughput").`
            },
            developing: {
                implied: `△ ${skill} shows potential. Strengthen by describing specific production scenarios, tools used, or measurable outcomes.`,
                explicit: `△ ${skill} is listed but underdeveloped. Add concrete examples: Which projects? What scale? What results?`
            },
            missing: `✗ ${skill} not detected. If you have experience, add it to skills section + describe real-world usage in projects. If learning, consider adding "Currently Exploring" section.`
        };

        if (category === 'missing') return tips.missing;
        if (category === 'core') {
            return level === 'Advanced' ? tips.core.advanced : tips.core.demonstrated;
        }
        return level === 'Implied' ? tips.developing.implied : tips.developing.explicit;
    }

    /**
     * Summarize evidence for quick review
     */
    summarizeEvidence(evidence) {
        const summary = {
            total: evidence.length,
            byType: {
                explicit: evidence.filter(e => e.type === 'explicit').length,
                implicit: evidence.filter(e => e.type === 'implicit').length,
                inferred: evidence.filter(e => e.type === 'inferred').length
            },
            sections: [...new Set(evidence.map(e => e.source))],
            topEvidence: evidence
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, 3)
                .map(e => ({
                    type: e.type,
                    source: e.source,
                    context: e.line.length > 80 ? e.line.substring(0, 80) + '...' : e.line,
                    confidence: Math.round(e.confidence * 100) + '%'
                }))
        };

        return summary;
    }
}

module.exports = new SkillProficiencyAnalyzer();
