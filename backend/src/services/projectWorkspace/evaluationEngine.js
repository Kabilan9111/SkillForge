const { ProjectAIReview, ProjectCommit } = require('../../models/ProjectWorkspace');
const db = require('../../config/database');

/**
 * Evaluation Engine - Commit Comparison & Trend Analysis
 */
class EvaluationEngine {
    /**
     * Compare two commits and generate evaluation
     */
    async compareCommits(commitHash1, commitHash2) {
        try {
            const commit1 = await ProjectCommit.getByHash(commitHash1);
            const commit2 = await ProjectCommit.getByHash(commitHash2);

            if (!commit1 || !commit2) {
                throw new Error('Commit not found');
            }

            const review1 = await ProjectAIReview.getByCommit(commit1.id);
            const review2 = await ProjectAIReview.getByCommit(commit2.id);

            if (!review1 || !review2) {
                throw new Error('AI review not found for one or both commits');
            }

            const deltas = this.calculateDeltas(review1, review2);
            const trend = this.determineTrend(deltas);
            const healthScore = this.calculateHealthScore(review2, deltas);

            const evaluation = {
                commit1: {
                    hash: commitHash1,
                    timestamp: commit1.commit_timestamp,
                    overallRating: review1.overall_rating
                },
                commit2: {
                    hash: commitHash2,
                    timestamp: commit2.commit_timestamp,
                    overallRating: review2.overall_rating
                },
                ...deltas,
                trend,
                healthScore,
                improvements: this.identifyImprovements(deltas),
                regressions: this.identifyRegressions(deltas),
                stabilityMetrics: this.calculateStabilityMetrics(review1, review2)
            };

            // Save evaluation
            await this.saveEvaluation(commit1.project_id, commit2.id, commit1.id, evaluation);

            return evaluation;
        } catch (error) {
            console.error('Evaluation comparison failed:', error);
            throw error;
        }
    }

    /**
     * Calculate delta metrics
     */
    calculateDeltas(review1, review2) {
        return {
            qualityDelta: this.calculateDelta(review2.overall_rating, review1.overall_rating),
            performanceDelta: this.calculateDelta(review2.performance_score, review1.performance_score),
            securityDelta: this.calculateDelta(review2.security_score, review1.security_score),
            complexityDelta: this.calculateDelta(review2.maintainability_score, review1.maintainability_score),
            maintainabilityDelta: this.calculateDelta(review2.maintainability_score, review1.maintainability_score),
            architectureDelta: this.calculateDelta(review2.architecture_score, review1.architecture_score),
            syntaxDelta: this.calculateDelta(review2.syntax_score, review1.syntax_score)
        };
    }

    /**
     * Calculate single delta
     */
    calculateDelta(current, previous) {
        const diff = current - previous;
        const percentage = previous > 0 ? ((diff / previous) * 100).toFixed(2) : 0;
        return {
            absolute: parseFloat(diff.toFixed(2)),
            percentage: parseFloat(percentage),
            direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable'
        };
    }

    /**
     * Determine overall trend
     */
    determineTrend(deltas) {
        const avgDelta = (
            deltas.qualityDelta.absolute +
            deltas.performanceDelta.absolute +
            deltas.securityDelta.absolute +
            deltas.maintainabilityDelta.absolute +
            deltas.architectureDelta.absolute +
            deltas.syntaxDelta.absolute
        ) / 6;

        if (avgDelta > 2) return 'improving';
        if (avgDelta < -2) return 'declining';
        return 'stable';
    }

    /**
     * Calculate health score
     */
    calculateHealthScore(latestReview, deltas) {
        const baseScore = (
            latestReview.syntax_score +
            latestReview.architecture_score +
            latestReview.performance_score +
            latestReview.security_score +
            latestReview.maintainability_score +
            latestReview.industry_benchmark_score
        ) / 6;

        // Adjust for trend
        const trendBonus = deltas.qualityDelta.absolute > 0 ? 5 : deltas.qualityDelta.absolute < 0 ? -5 : 0;

        return Math.min(100, Math.max(0, baseScore + trendBonus));
    }

    /**
     * Identify improvements
     */
    identifyImprovements(deltas) {
        const improvements = [];

        Object.entries(deltas).forEach(([key, value]) => {
            if (value.absolute > 1) {
                improvements.push({
                    metric: key.replace('Delta', ''),
                    improvement: value.absolute,
                    percentage: value.percentage,
                    description: this.getImprovementDescription(key, value.absolute)
                });
            }
        });

        return improvements.sort((a, b) => b.improvement - a.improvement);
    }

    /**
     * Identify regressions
     */
    identifyRegressions(deltas) {
        const regressions = [];

        Object.entries(deltas).forEach(([key, value]) => {
            if (value.absolute < -1) {
                regressions.push({
                    metric: key.replace('Delta', ''),
                    regression: Math.abs(value.absolute),
                    percentage: value.percentage,
                    description: this.getRegressionDescription(key, value.absolute),
                    severity: Math.abs(value.absolute) > 10 ? 'high' : Math.abs(value.absolute) > 5 ? 'medium' : 'low'
                });
            }
        });

        return regressions.sort((a, b) => b.regression - a.regression);
    }

    /**
     * Calculate stability metrics
     */
    calculateStabilityMetrics(review1, review2) {
        const variance = Math.abs(review2.overall_rating - review1.overall_rating);
        
        return {
            variance: parseFloat(variance.toFixed(2)),
            consistency: variance < 1 ? 'high' : variance < 2 ? 'medium' : 'low',
            volatility: variance > 3 ? 'high' : variance > 1.5 ? 'medium' : 'low'
        };
    }

    /**
     * Get improvement description
     */
    getImprovementDescription(metric, value) {
        const descriptions = {
            qualityDelta: `Overall code quality improved by ${value.toFixed(1)} points`,
            performanceDelta: `Performance optimization resulted in ${value.toFixed(1)} point gain`,
            securityDelta: `Security hardening improved score by ${value.toFixed(1)} points`,
            complexityDelta: `Code complexity reduced, gained ${value.toFixed(1)} points`,
            maintainabilityDelta: `Maintainability improved by ${value.toFixed(1)} points`,
            architectureDelta: `Architecture restructuring added ${value.toFixed(1)} points`,
            syntaxDelta: `Code quality cleanup gained ${value.toFixed(1)} points`
        };

        return descriptions[metric] || `${metric} improved by ${value.toFixed(1)} points`;
    }

    /**
     * Get regression description
     */
    getRegressionDescription(metric, value) {
        const descriptions = {
            qualityDelta: `Overall quality declined by ${Math.abs(value).toFixed(1)} points`,
            performanceDelta: `Performance degraded by ${Math.abs(value).toFixed(1)} points`,
            securityDelta: `Security score dropped ${Math.abs(value).toFixed(1)} points`,
            complexityDelta: `Code complexity increased, lost ${Math.abs(value).toFixed(1)} points`,
            maintainabilityDelta: `Maintainability decreased by ${Math.abs(value).toFixed(1)} points`,
            architectureDelta: `Architecture issues caused ${Math.abs(value).toFixed(1)} point drop`,
            syntaxDelta: `Code quality regressed by ${Math.abs(value).toFixed(1)} points`
        };

        return descriptions[metric] || `${metric} regressed by ${Math.abs(value).toFixed(1)} points`;
    }

    /**
     * Get project quality trends
     */
    async getProjectTrends(projectId, limit = 20) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    pc.commit_hash,
                    pc.commit_timestamp,
                    par.overall_rating,
                    par.syntax_score,
                    par.architecture_score,
                    par.performance_score,
                    par.security_score,
                    par.maintainability_score,
                    par.industry_benchmark_score
                FROM project_commits pc
                INNER JOIN project_ai_reviews par ON pc.id = par.commit_id
                WHERE pc.project_id = ?
                ORDER BY pc.commit_timestamp DESC
                LIMIT ?
            `;

            db.all(sql, [projectId, limit], (err, rows) => {
                if (err) return reject(err);

                const trends = {
                    timeline: rows.reverse(),
                    averages: this.calculateAverages(rows),
                    trend: this.analyzeTrendDirection(rows)
                };

                resolve(trends);
            });
        });
    }

    /**
     * Calculate averages
     */
    calculateAverages(reviews) {
        if (reviews.length === 0) return null;

        const sum = reviews.reduce((acc, r) => ({
            overall: acc.overall + r.overall_rating,
            syntax: acc.syntax + r.syntax_score,
            architecture: acc.architecture + r.architecture_score,
            performance: acc.performance + r.performance_score,
            security: acc.security + r.security_score,
            maintainability: acc.maintainability + r.maintainability_score,
            benchmark: acc.benchmark + r.industry_benchmark_score
        }), { overall: 0, syntax: 0, architecture: 0, performance: 0, security: 0, maintainability: 0, benchmark: 0 });

        const len = reviews.length;
        return {
            overall: (sum.overall / len).toFixed(2),
            syntax: (sum.syntax / len).toFixed(2),
            architecture: (sum.architecture / len).toFixed(2),
            performance: (sum.performance / len).toFixed(2),
            security: (sum.security / len).toFixed(2),
            maintainability: (sum.maintainability / len).toFixed(2),
            benchmark: (sum.benchmark / len).toFixed(2)
        };
    }

    /**
     * Analyze trend direction  
     */
    analyzeTrendDirection(reviews) {
        if (reviews.length < 2) return 'insufficient-data';

        const first = reviews[0];
        const last = reviews[reviews.length - 1];
        const delta = last.overall_rating - first.overall_rating;

        return delta > 0.5 ? 'upward' : delta < -0.5 ? 'downward' : 'stable';
    }

    /**
     * Save evaluation to database
     */
    async saveEvaluation(projectId, commitIdCurrent, commitIdPrevious, evaluation) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO project_evaluations (
                    project_id, commit_id_current, commit_id_previous,
                    quality_delta, performance_delta, security_delta,
                    complexity_delta, maintainability_delta,
                    overall_trend, health_score,
                    improvements, regressions, stability_metrics
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                projectId, commitIdCurrent, commitIdPrevious,
                evaluation.qualityDelta.absolute,
                evaluation.performanceDelta.absolute,
                evaluation.securityDelta.absolute,
                evaluation.complexityDelta.absolute,
                evaluation.maintainabilityDelta.absolute,
                evaluation.trend,
                evaluation.healthScore,
                JSON.stringify(evaluation.improvements),
                JSON.stringify(evaluation.regressions),
                JSON.stringify(evaluation.stabilityMetrics)
            ];

            db.run(sql, values, function(err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    }
}

module.exports = new EvaluationEngine();
