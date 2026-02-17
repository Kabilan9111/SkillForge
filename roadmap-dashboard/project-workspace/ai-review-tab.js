/**
 * AI REVIEW TAB - Intelligence Dashboard
 */

window.AIReviewTab = class AIReviewTab {
    constructor(container, project, apiBase) {
        this.container = container;
        this.project = project;
        this.apiBase = apiBase;
        this.review = null;
        this.render();
    }

    async render() {
        this.container.innerHTML = `
            <div class="ai-review-tab">
                <div class="review-header">
                    <div class="review-title">
                        <h2>AI Code Analysis</h2>
                        <select id="commit-selector">
                            <option value="">Select commit...</option>
                        </select>
                    </div>
                    <button class="btn-primary" id="trigger-review">
                        🤖 Run AI Analysis
                    </button>
                </div>
                <div class="review-content" id="review-content">
                    <div class="empty-state">
                        <div class="empty-icon">🤖</div>
                        <p>Select a commit and run AI analysis</p>
                    </div>
                </div>
            </div>
        `;

        await this.loadCommits();
        this.attachEventListeners();
    }

    async loadCommits() {
        try {
            const res = await fetch(`${this.apiBase}/projects/${this.project.id}/commits`);
            const data = await res.json();
            if (data.success) {
                const selector = document.getElementById('commit-selector');
                selector.innerHTML = '<option value="">Select commit...</option>' +
                    data.commits.map(c => `
                        <option value="${c.commit_hash}">
                            ${c.commit_hash.substring(0, 7)} - ${c.commit_message}
                        </option>
                    `).join('');
            }
        } catch (err) {
            console.error('Failed to load commits:', err);
        }
    }

    attachEventListeners() {
        document.getElementById('commit-selector').addEventListener('change', async (e) => {
            if (e.target.value) {
                await this.loadReview(e.target.value);
            }
        });

        document.getElementById('trigger-review').addEventListener('click', async () => {
            const commitHash = document.getElementById('commit-selector').value;
            if (!commitHash) {
                alert('Please select a commit first');
                return;
            }
            await this.triggerReview(commitHash);
        });
    }

    async loadReview(commitHash) {
        try {
            const res = await fetch(`${this.apiBase}/commits/${commitHash}/ai-review`);
            const data = await res.json();
            if (data.success && data.review) {
                this.review = data.review;
                this.renderReview();
            } else {
                document.getElementById('review-content').innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">⚠️</div>
                        <p>No AI review found for this commit</p>
                        <button class="btn-primary" onclick="document.getElementById('trigger-review').click()">
                            Run Analysis
                        </button>
                    </div>
                `;
            }
        } catch (err) {
            console.error('Failed to load review:', err);
        }
    }

    async triggerReview(commitHash) {
        try {
            document.getElementById('review-content').innerHTML = '<div class="loading">Running AI analysis...</div>';
            
            const res = await fetch(`${this.apiBase}/commits/${commitHash}/ai-review/trigger`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.success) {
                this.review = data.review;
                this.renderReview();
            }
        } catch (err) {
            console.error('Failed to trigger review:', err);
            alert('AI analysis failed');
        }
    }

    renderReview() {
        const r = this.review;
        const content = document.getElementById('review-content');

        content.innerHTML = `
            <div class="review-dashboard">
                <!-- Overall Rating -->
                <div class="rating-card primary">
                    <div class="rating-header">
                        <h3>Overall Rating</h3>
                        <span class="rating-badge ${this.getRatingClass(r.overall_rating)}">
                            ${r.developer_level}
                        </span>
                    </div>
                    <div class="rating-meter">
                        <div class="meter-bar">
                            <div class="meter-fill" style="width: ${(r.overall_rating / 10) * 100}%"></div>
                        </div>
                        <div class="meter-value">${r.overall_rating.toFixed(1)} / 10</div>
                    </div>
                    ${r.improvement_percentage > 0 ? `
                        <div class="rating-change positive">
                            ↑ ${r.improvement_percentage.toFixed(1)}% improvement from previous
                        </div>
                    ` : r.improvement_percentage < 0 ? `
                        <div class="rating-change negative">
                            ↓ ${Math.abs(r.improvement_percentage).toFixed(1)}% regression from previous
                        </div>
                    ` : ''}
                </div>

                <!-- 6-Layer Scores -->
                <div class="scores-grid">
                    ${this.renderScoreCard('Syntax & Lint', r.syntax_score, '📝', 'syntax')}
                    ${this.renderScoreCard('Architecture', r.architecture_score, '🏗️', 'architecture')}
                    ${this.renderScoreCard('Performance', r.performance_score, '⚡', 'performance')}
                    ${this.renderScoreCard('Security', r.security_score, '🔒', 'security')}
                    ${this.renderScoreCard('Maintainability', r.maintainability_score, '🔧', 'maintainability')}
                    ${this.renderScoreCard('Industry Benchmark', r.benchmark_score, '🎯', 'benchmark')}
                </div>

                <!-- Findings -->
                <div class="findings-section">
                    ${this.renderFindings('✅ Positive Aspects', r.positive_aspects, 'positive')}
                    ${this.renderFindings('⚠️ Weaknesses', r.weaknesses, 'warning')}
                    ${this.renderFindings('💡 Recommendations', r.recommendations, 'info')}
                    ${r.security_issues?.length ? this.renderFindings('🔴 Security Issues', r.security_issues, 'danger') : ''}
                    ${r.code_smells?.length ? this.renderFindings('👃 Code Smells', r.code_smells, 'warning') : ''}
                </div>
            </div>
        `;
    }

    renderScoreCard(title, score, icon, category) {
        const percentage = score || 0;
        return `
            <div class="score-card ${category}">
                <div class="score-header">
                    <span class="score-icon">${icon}</span>
                    <span class="score-title">${title}</span>
                </div>
                <div class="score-value">${percentage}</div>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="score-label">${this.getScoreLabel(percentage)}</div>
            </div>
        `;
    }

    renderFindings(title, items, type) {
        if (!items || items.length === 0) return '';
        
        return `
            <div class="findings-card ${type}">
                <h4>${title}</h4>
                <ul>
                    ${items.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    getRatingClass(rating) {
        if (rating >= 8) return 'excellent';
        if (rating >= 6) return 'good';
        if (rating >= 4) return 'average';
        return 'poor';
    }

    getScoreLabel(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 75) return 'Good';
        if (score >= 60) return 'Average';
        if (score >= 40) return 'Below Average';
        return 'Poor';
    }
};
