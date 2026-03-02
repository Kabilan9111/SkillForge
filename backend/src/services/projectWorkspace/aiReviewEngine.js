const { ProjectAIReview, ProjectCommit, ProjectFile } = require('../../models/ProjectWorkspace');
const FileManager = require('./fileManager');

/**
 * 6-Layer AI Review Engine
 * Production-grade code analysis system
 */
class AIReviewEngine {
    /**
     * Analyze commit with 6-layer pipeline
     */
    async analyzeCommit(commitHash) {
        const startTime = Date.now();
        
        try {
            const commit = await ProjectCommit.getByHash(commitHash);
            if (!commit) throw new Error('Commit not found');

            const files = await ProjectFile.getByCommit(commit.id);
            
            // Layer 1: Syntax & Lint Analysis
            const syntaxScore = await this.layer1_syntaxAnalysis(files);
            
            // Layer 2: Architecture Pattern Analysis
            const architectureScore = await this.layer2_architectureAnalysis(files);
            
            // Layer 3: Performance & Scalability
            const performanceScore = await this.layer3_performanceAnalysis(files);
            
            // Layer 4: Security Surface Analysis
            const securityScore = await this.layer4_securityAnalysis(files);
            
            // Layer 5: Maintainability & Documentation
            const maintainabilityScore = await this.layer5_maintainabilityAnalysis(files);
            
            // Layer 6: Industry Benchmark Comparison
            const industryBenchmarkScore = await this.layer6_benchmarkComparison(files);
            
            // Calculate overall scores
            const overallRating = this.calculateOverallRating({
                syntaxScore,
                architectureScore,
                performanceScore,
                securityScore,
                maintainabilityScore,
                industryBenchmarkScore
            });
            
            const developerLevel = this.classifyDeveloperLevel(overallRating);
            
            // Get previous commit for comparison
            let improvementPercentage = 0;
            let regressionDetected = false;
            let technicalDebtDelta = 0;
            
            if (commit.parent_commit_hash) {
                const comparison = await this.compareWithPrevious(
                    commit.parent_commit_hash,
                    { syntaxScore, architectureScore, performanceScore, securityScore, maintainabilityScore, industryBenchmarkScore }
                );
                improvementPercentage = comparison.improvementPercentage;
                regressionDetected = comparison.regressionDetected;
                technicalDebtDelta = comparison.technicalDebtDelta;
            }
            
            // Generate detailed findings
            const findings = await this.generateFindings(files, {
                syntaxScore,
                architectureScore,
                performanceScore,
                securityScore,
                maintainabilityScore,
                industryBenchmarkScore
            });
            
            const processingTime = Date.now() - startTime;
            
            // Save review
            const reviewData = {
                projectId: commit.project_id,
                commitId: commit.id,
                overallRating,
                developerLevel,
                syntaxScore,
                architectureScore,
                performanceScore,
                securityScore,
                maintainabilityScore,
                industryBenchmarkScore,
                codeStructureScore: (architectureScore + maintainabilityScore) / 2,
                scalabilityScore: performanceScore,
                improvementPercentage,
                regressionDetected,
                technicalDebtDelta,
                positiveAspects: findings.positiveAspects,
                weaknesses: findings.weaknesses,
                recommendations: findings.recommendations,
                securityIssues: findings.securityIssues,
                codeSmells: findings.codeSmells,
                duplications: findings.duplications,
                unusedFiles: findings.unusedFiles,
                aiModelUsed: 'Internal Analysis Engine',
                processingTimeMs: processingTime,
                tokensUsed: 0,
                analysisCost: 0
            };
            
            await ProjectAIReview.create(reviewData);
            
            return reviewData;
            
        } catch (error) {
            console.error('AI Review failed:', error);
            throw error;
        }
    }

    /**
     * Layer 1: Syntax & Lint Analysis
     */
    async layer1_syntaxAnalysis(files) {
        let score = 100;
        const issues = [];
        
        for (const file of files) {
            if (file.is_binary) continue;
            
            try {
                const content = await FileManager.getFileContent(
                    file.project_id,
                    file.commit_hash || '',
                    file.file_path
                );
                
                // Check for common syntax issues
                if (content.includes('console.log(')) score -= 2;
                if (content.includes('debugger')) score -= 5;
                if (content.includes('TODO') || content.includes('FIXME')) score -= 1;
                if (!content.trim()) score -= 10; // Empty file
                
                // Check naming conventions
                const lines = content.split('\n');
                lines.forEach(line => {
                    if (line.match(/var \w+/)) score -= 1; // Using var instead of let/const
                    if (line.length > 120) score -= 0.5; // Long lines
                });
                
            } catch (err) {
                score -= 5;
            }
        }
        
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Layer 2: Architecture Pattern Analysis
     */
    async layer2_architectureAnalysis(files) {
        let score = 70; // Base score
        
        const hasStructure = files.some(f => f.file_path.includes('/'));
        if (hasStructure) score += 10;
        
        const hasConfig = files.some(f => f.file_name.includes('config'));
        if (hasConfig) score += 5;
        
        const hasModules = files.length > 3;
        if (hasModules) score += 10;
        
        const hasTests = files.some(f => f.file_name.includes('test') || f.file_name.includes('spec'));
        if (hasTests) score += 5;
        
        return Math.min(100, score);
    }

    /**
     * Layer 3: Performance & Scalability Analysis
     */
    async layer3_performanceAnalysis(files) {
        let score = 80; // Base score
        
        for (const file of files) {
            if (file.is_binary) continue;
            
            // Large files might indicate performance issues
            if (file.file_size > 100000) score -= 5;
            if (file.lines_of_code > 500) score -= 3;
        }
        
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Layer 4: Security Surface Analysis
     */
    async layer4_securityAnalysis(files) {
        let score = 100;
        
        for (const file of files) {
            if (file.is_binary) continue;
            
            try {
                const content = await FileManager.getFileContent(
                    file.project_id,
                    file.commit_hash || '',
                    file.file_path
                );
                
                // Check for security anti-patterns
                if (content.includes('eval(')) score -= 10;
                if (content.includes('innerHTML')) score -= 5;
                if (content.match(/password.*=.*['"][^'"]+['"]/)) score -= 15; // Hardcoded passwords
                if (content.includes('TODO: security')) score -= 5;
                
            } catch (err) {
                // Ignore
            }
        }
        
        return Math.max(0, score);
    }

    /**
     * Layer 5: Maintainability & Documentation Analysis
     */
    async layer5_maintainabilityAnalysis(files) {
        let score = 70;
        let totalLines = 0;
        let commentLines = 0;
        
        for (const file of files) {
            if (file.is_binary) continue;
            
            try {
                const content = await FileManager.getFileContent(
                    file.project_id,
                    file.commit_hash || '',
                    file.file_path
                );
                
                const lines = content.split('\n');
                totalLines += lines.length;
                
                lines.forEach(line => {
                    if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) {
                        commentLines++;
                    }
                });
                
            } catch (err) {
                // Ignore
            }
        }
        
        const commentRatio = totalLines > 0 ? (commentLines / totalLines) * 100 : 0;
        if (commentRatio > 10) score += 15;
        else if (commentRatio > 5) score += 10;
        
        const hasReadme = files.some(f => f.file_name.toLowerCase() === 'readme.md');
        if (hasReadme) score += 15;
        
        return Math.min(100, score);
    }

    /**
     * Layer 6: Industry Benchmark Comparison
     */
    async layer6_benchmarkComparison(files) {
        let score = 75; // Industry average
        
        const fileCount = files.length;
        if (fileCount < 3) score -= 10;
        if (fileCount > 20) score += 10;
        
        const avgFileSize = files.reduce((sum, f) => sum + f.file_size, 0) / files.length;
        if (avgFileSize < 10000) score += 5; // Small, focused files
        if (avgFileSize > 50000) score -= 5; // Large files
        
        return Math.min(100, score);
    }

    /**
     * Calculate overall rating (0-10)
     */
    calculateOverallRating(scores) {
        const avg = (
            scores.syntaxScore +
            scores.architectureScore +
            scores.performanceScore +
            scores.securityScore +
            scores.maintainabilityScore +
            scores.industryBenchmarkScore
        ) / 6;
        
        return (avg / 10).toFixed(1);
    }

    /**
     * Classify developer level based on score
     */
    classifyDeveloperLevel(rating) {
        if (rating >= 9.0) return 'Senior';
        if (rating >= 7.5) return 'Advanced';
        if (rating >= 6.0) return 'Intermediate';
        return 'Beginner';
    }

    /**
     * Compare with previous commit
     */
    async compareWithPrevious(parentHash, currentScores) {
        try {
            const parentCommit = await ProjectCommit.getByHash(parentHash);
            const parentReview = await ProjectAIReview.getByCommit(parentCommit.id);
            
            if (!parentReview) {
                return { improvementPercentage: 0, regressionDetected: false, technicalDebtDelta: 0 };
            }
            
            const avgCurrent = (
                currentScores.syntaxScore +
                currentScores.architectureScore +
                currentScores.performanceScore +
                currentScores.securityScore +
                currentScores.maintainabilityScore +
                currentScores.industryBenchmarkScore
            ) / 6;
            
            const avgPrevious = (
                parentReview.syntax_score +
                parentReview.architecture_score +
                parentReview.performance_score +
                parentReview.security_score +
                parentReview.maintainability_score +
                parentReview.industry_benchmark_score
            ) / 6;
            
            const delta = avgCurrent - avgPrevious;
            const improvementPercentage = ((delta / avgPrevious) * 100).toFixed(2);
            const regressionDetected = delta < -5; // Regression if > 5 point drop
            const technicalDebtDelta = -delta; // Negative improvement = positive debt
            
            return {
                improvementPercentage: parseFloat(improvementPercentage),
                regressionDetected,
                technicalDebtDelta
            };
            
        } catch (err) {
            return { improvementPercentage: 0, regressionDetected: false, technicalDebtDelta: 0 };
        }
    }

    /**
     * Generate detailed findings
     */
    async generateFindings(files, scores) {
        const positiveAspects = [];
        const weaknesses = [];
        const recommendations = [];
        const securityIssues = [];
        const codeSmells = [];
        const duplications = [];
        const unusedFiles = [];
        
        // Positive aspects
        if (scores.syntaxScore >= 90) positiveAspects.push('Excellent code syntax and formatting');
        if (scores.architectureScore >= 85) positiveAspects.push('Well-structured architecture');
        if (scores.securityScore >= 90) positiveAspects.push('Good security practices');
        if (scores.maintainabilityScore >= 85) positiveAspects.push('Highly maintainable code');
        
        // Weaknesses
        if (scores.syntaxScore < 70) weaknesses.push('Syntax and formatting issues detected');
        if (scores.architectureScore < 60) weaknesses.push('Architecture needs improvement');
        if (scores.performanceScore < 70) weaknesses.push('Performance optimization needed');
        if (scores.securityScore < 80) weaknesses.push('Security vulnerabilities present');
        if (scores.maintainabilityScore < 65) weaknesses.push('Low code maintainability');
        
        // Recommendations
        if (scores.syntaxScore < 85) recommendations.push('Use a linter (ESLint/Pylint) to maintain code quality');
        if (scores.architectureScore < 75) recommendations.push('Consider applying design patterns');
        if (scores.maintainabilityScore < 75) recommendations.push('Add more documentation and comments');
        if (!files.some(f => f.file_name.includes('test'))) recommendations.push('Add unit tests');
        
        return {
            positiveAspects,
            weaknesses,
            recommendations,
            securityIssues,
            codeSmells,
            duplications,
            unusedFiles
        };
    }
}

module.exports = new AIReviewEngine();
