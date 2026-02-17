/**
 * EVALUATE TAB - Metrics & Trends Visualization
 */

window.EvaluateTab = class EvaluateTab {
    constructor(container, project, apiBase) {
        this.container = container;
        this.project = project;
        this.apiBase = apiBase;
        this.commits = [];
        this.render();
    }

    async render() {
        this.container.innerHTML = `
            <div class="evaluate-tab">
                <div class="evaluate-header">
                    <h2>Project Evaluation</h2>
                    <div class="evaluate-controls">
                        <button class="btn-primary" id="compare-commits-btn">
                            📊 Compare Commits
                        </button>
                        <button class="btn-secondary" id="view-trends-btn">
                            📈 View Trends
                        </button>
                    </div>
                </div>

                <div class="comparison-selector" id="comparison-selector" style="display: none;">
                    <div class="selector-group">
                        <label>Base Commit</label>
                        <select id="base-commit"></select>
                    </div>
                    <div class="selector-group">
                        <label>Compare Commit</label>
                        <select id="compare-commit"></select>
                    </div>
                    <button class="btn-primary" id="run-comparison">Compare</button>
                    <button class="btn-secondary" id="cancel-comparison">Cancel</button>
                </div>

                <div class="evaluate-content" id="evaluate-content">
                    <div class="empty-state">
                        <div class="empty-icon">📊</div>
                        <p>Compare commits or view project trends</p>
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
                this.commits = data.commits || [];
                this.populateSelectors();
            }
        } catch (err) {
            console.error('Failed to load commits:', err);
        }
    }

    populateSelectors() {
        const baseSelect = document.getElementById('base-commit');
        const compareSelect = document.getElementById('compare-commit');
        const options = this.commits.map(c => `
            <option value="${c.commit_hash}">
                ${c.commit_hash.substring(0, 7)} - ${c.commit_message}
            </option>
        `).join('');
        
        baseSelect.innerHTML = options;
        compareSelect.innerHTML = options;
        if (this.commits.length > 1) {
            compareSelect.selectedIndex = 1;
        }
    }

    attachEventListeners() {
        document.getElementById('compare-commits-btn').addEventListener('click', () => {
            document.getElementById('comparison-selector').style.display = 'flex';
            document.getElementById('evaluate-content').innerHTML = '';
        });

        document.getElementById('cancel-comparison').addEventListener('click', () => {
            document.getElementById('comparison-selector').style.display = 'none';
        });

        document.getElementById('run-comparison').addEventListener('click', async () => {
            const base = document.getElementById('base-commit').value;
            const compare = document.getElementById('compare-commit').value;
            if (base && compare) {
                await this.compareCommits(base, compare);
            }
        });

        document.getElementById('view-trends-btn').addEventListener('click', async () => {
            await this.viewTrends();
        });
    }

    async compareCommits(baseHash, compareHash) {
        try {
            document.getElementById('evaluate-content').innerHTML = '<div class="loading">Comparing commits...</div>';
            
            const res = await fetch(`${this.apiBase}/commits/${baseHash}/compare/${compareHash}`);
            const data = await res.json();
            if (data.success) {
                this.renderComparison(data.evaluation);
                document.getElementById('comparison-selector').style.display = 'none';
            }
        } catch (err) {
            console.error('Comparison failed:', err);
            alert('Failed to compare commits');
        }
    }

    renderComparison(evaluation) {
        const content = document.getElementById('evaluate-content');
        const deltas = evaluation.deltas;

        content.innerHTML = `
            <div class="evaluation-dashboard">
                <!-- Health Score -->
                <div class="health-card">
                    <h3>Code Health Score</h3>
                    <div class="health-meter">
                        <div class="health-ring" style="--health: ${evaluation.health_score}">
                            <span class="health-value">${evaluation.health_score}</span>
                        </div>
                    </div>
                    <div class="health-status ${evaluation.trend}">
                        ${this.getTrendIcon(evaluation.trend)} ${evaluation.trend.toUpperCase()}
                    </div>
                </div>

                <!-- Deltas Grid -->
                <div class="deltas-grid">
                    ${this.renderDeltaCard('Quality', deltas.quality, '⭐')}
                    ${this.renderDeltaCard('Performance', deltas.performance, '⚡')}
                    ${this.renderDeltaCard('Security', deltas.security, '🔒')}
                    ${this.renderDeltaCard('Complexity', deltas.complexity, '🧩')}
                    ${this.renderDeltaCard('Maintainability', deltas.maintainability, '🔧')}
                    ${this.renderDeltaCard('Architecture', deltas.architecture, '🏗️')}
                </div>

                <!-- Improvements & Regressions -->
                <div class="changes-section">
                    ${evaluation.improvements?.length ? this.renderChangesList('✅ Improvements', evaluation.improvements, 'positive') : ''}
                    ${evaluation.regressions?.length ? this.renderChangesList('⚠️ Regressions', evaluation.regressions, 'negative') : ''}
                </div>

                <!-- Detailed Metrics -->
                <div class="metrics-table">
                    <h4>Detailed Metrics Comparison</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>Base</th>
                                <th>Current</th>
                                <th>Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderMetricRow('Overall Rating', deltas.quality.base, deltas.quality.current, deltas.quality.change)}
                            ${this.renderMetricRow('Syntax Score', deltas.syntax?.base || 0, deltas.syntax?.current || 0, deltas.syntax?.change || 0)}
                            ${this.renderMetricRow('Architecture Score', deltas.architecture.base, deltas.architecture.current, deltas.architecture.change)}
                            ${this.renderMetricRow('Security Score', deltas.security.base, deltas.security.current, deltas.security.change)}
                            ${this.renderMetricRow('Performance Score', deltas.performance.base, deltas.performance.current, deltas.performance.change)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderDeltaCard(title, delta, icon) {
        const isPositive = delta.change > 0;
        const isNegative = delta.change < 0;
        const changeClass = isPositive ? 'positive' : isNegative ? 'negative' : 'neutral';

        return `
            <div class="delta-card ${changeClass}">
                <div class="delta-header">
                    <span class="delta-icon">${icon}</span>
                    <span class="delta-title">${title}</span>
                </div>
                <div class="delta-value">
                    ${isPositive ? '↑' : isNegative ? '↓' : '→'} ${Math.abs(delta.changePercent).toFixed(1)}%
                </div>
                <div class="delta-details">
                    <span>${delta.base.toFixed(1)}</span>
                    <span class="arrow">→</span>
                    <span>${delta.current.toFixed(1)}</span>
                </div>
            </div>
        `;
    }

    renderChangesList(title, changes, type) {
        return `
            <div class="changes-list ${type}">
                <h4>${title}</h4>
                <ul>
                    ${changes.map(change => `<li>${change}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    renderMetricRow(metric, base, current, change) {
        const changeClass = change > 0 ? 'positive' : change < 0 ? 'negative' : '';
        return `
            <tr>
                <td>${metric}</td>
                <td>${base.toFixed(1)}</td>
                <td>${current.toFixed(1)}</td>
                <td class="${changeClass}">
                    ${change > 0 ? '+' : ''}${change.toFixed(1)}
                </td>
            </tr>
        `;
    }

    async viewTrends() {
        try {
            document.getElementById('evaluate-content').innerHTML = '<div class="loading">Loading trends...</div>';
            
            const res = await fetch(`${this.apiBase}/projects/${this.project.id}/trends`);
            const data = await res.json();
            if (data.success) {
                this.renderTrends(data.trends);
            }
        } catch (err) {
            console.error('Failed to load trends:', err);
            alert('Failed to load trends');
        }
    }

    renderTrends(trends) {
        const content = document.getElementById('evaluate-content');

        content.innerHTML = `
            <div class="trends-dashboard">
                <h3>Project Trends Over Time</h3>
                
                <div class="trend-cards">
                    <div class="trend-card">
                        <div class="trend-label">Current Rating</div>
                        <div class="trend-value">${trends.currentRating?.toFixed(1) || 'N/A'} / 10</div>
                    </div>
                    <div class="trend-card">
                        <div class="trend-label">Total Commits</div>
                        <div class="trend-value">${trends.totalCommits || 0}</div>
                    </div>
                    <div class="trend-card">
                        <div class="trend-label">Average Rating</div>
                        <div class="trend-value">${trends.averageRating?.toFixed(1) || 'N/A'}</div>
                    </div>
                    <div class="trend-card">
                        <div class="trend-label">Trend</div>
                        <div class="trend-value ${trends.overallTrend}">
                            ${this.getTrendIcon(trends.overallTrend)} ${trends.overallTrend?.toUpperCase() || 'N/A'}
                        </div>
                    </div>
                </div>

                <div class="timeline-chart">
                    <h4>Quality Timeline</h4>
                    ${this.renderTimelineChart(trends.timeline)}
                </div>

                ${trends.insights?.length ? `
                    <div class="insights-section">
                        <h4>📊 Key Insights</h4>
                        <ul>
                            ${trends.insights.map(insight => `<li>${insight}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderTimelineChart(timeline) {
        if (!timeline || timeline.length === 0) {
            return '<div class="empty-state"><p>Not enough data</p></div>';
        }

        const maxRating = 10;
        const chartHeight = 200;

        return `
            <div class="chart-container">
                ${timeline.map((point, idx) => {
                    const height = (point.rating / maxRating) * chartHeight;
                    return `
                        <div class="chart-bar">
                            <div class="bar-fill" style="height: ${height}px" title="${point.rating.toFixed(1)}"></div>
                            <div class="bar-label">${new Date(point.timestamp).toLocaleDateString()}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    getTrendIcon(trend) {
        switch(trend) {
            case 'improving': return '📈';
            case 'declining': return '📉';
            case 'stable': return '➡️';
            default: return '❓';
        }
    }
};
