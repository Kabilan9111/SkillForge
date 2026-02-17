/**
 * ========================================================================
 * DEVELOPER CAPABILITY INTELLIGENCE - FRONTEND VISUALIZATIONS
 * ========================================================================
 * 
 * Elite visualization components for 5-layer intelligence system:
 * 1. Skill Radar Chart (Multi-axis capability mapping)
 * 2. Market Readiness Dashboard (Specific job roles)
 * 3. Weakness Heatmap (High-risk areas)
 * 4. Career Trajectory Projection (Timeline visualization)
 * 5. Skill Authenticity Index (Claimed vs Demonstrated)
 * 6. Confidence Degradation Alerts (Dynamic alerts)
 */

(function() {
    'use strict';

    /**
     * Main render function - replaces old skill gap UI
     */
    window.renderCapabilityIntelligence = function(intelligenceData) {
        const container = document.getElementById('intelligence-results');
        if (!container) return;

        container.innerHTML = `
            <div class="capability-intelligence-dashboard">
                <!-- Header: Overall Intelligence Score -->
                <div class="ci-header">
                    <div class="ci-score-orb">
                        <div class="score-ring">
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/>
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#d00000" stroke-width="8" 
                                    stroke-dasharray="${(intelligenceData.intelligence.overallScore / 100) * 283} 283"
                                    transform="rotate(-90 50 50)" stroke-linecap="round"/>
                            </svg>
                            <div class="score-value">
                                <span class="score-num">${intelligenceData.intelligence.overallScore}</span>
                                <span class="score-label">Intelligence Score</span>
                            </div>
                        </div>
                    </div>
                    <div class="ci-summary">
                        <h2>Developer Capability Intelligence Report</h2>
                        <div class="ci-badges">
                            <span class="badge badge-market">${intelligenceData.intelligence.marketReadiness}</span>
                            <span class="badge badge-authenticity">Authenticity: ${intelligenceData.intelligence.skillAuthenticity}%</span>
                            <span class="badge badge-competitive">Rank: ${intelligenceData.intelligence.competitivenessIndex}/100</span>
                        </div>
                  </div>
                </div>

                <!-- Section 1: Skill Radar Chart -->
                <div class="ci-section">
                    <h3><i class="fas fa-chart-radar"></i> Multi-Axis Capability Map</h3>
                    <div id="radar-chart-container" class="viz-container"></div>
                </div>

                <!-- Section 2: Market Readiness (Multiple Roles) -->
                <div class="ci-section">
                    <h3><i class="fas fa-briefcase"></i> Market Readiness Analysis</h3>
                    <div id="market-readiness-container" class="viz-container"></div>
                </div>

                <!-- Section 3: Weakness Heatmap -->
                <div class="ci-section">
                    <h3><i class="fas fa-fire"></i> Risk Heatmap</h3>
                    <div id="heatmap-container" class="viz-container"></div>
                </div>

                <!-- Section 4: Career Trajectory -->
                <div class="ci-section">
                    <h3><i class="fas fa-chart-line"></i> Career Trajectory Projection</h3>
                    <div id="trajectory-container" class="viz-container"></div>
                </div>

                <!-- Section 5: Authenticity Index -->
                <div class="ci-section">
                    <h3><i class="fas fa-shield-check"></i> Skill Authenticity Validation</h3>
                    <div id="authenticity-container" class="viz-container"></div>
                </div>

                <!-- Section 6: Degradation Alerts -->
                ${intelligenceData.visualizations.degradationAlerts.length > 0 ? `
                <div class="ci-section ci-alerts">
                    <h3><i class="fas fa-exclamation-triangle"></i> Confidence Degradation Alerts</h3>
                    <div id="alerts-container" class="viz-container"></div>
                </div>
                ` : ''}

                <!-- Action Center -->
                <div class="ci-action-center">
                    <h3>Recommended Actions</h3>
                    <div class="action-grid">
                        ${intelligenceData.intelligence.criticalActions.slice(0, 3).map((action, index) => `
                            <div class="action-card">
                                <div class="action-priority">#${index + 1}</div>
                                <div class="action-text">${action}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Render each visualization
        renderRadarChart(intelligenceData.visualizations.radarChart);
        renderMarketReadiness(intelligenceData.visualizations.marketReadinessScores);
        renderHeatmap(intelligenceData.visualizations.weaknessHeatmap);
        renderTrajectory(intelligenceData.visualizations.careerTrajectory);
        renderAuthenticity(intelligenceData.visualizations.authenticityIndex);
        
        if (intelligenceData.visualizations.degradationAlerts.length > 0) {
            renderAlerts(intelligenceData.visualizations.degradationAlerts);
        }
    };

    /**
     * 1. Skill Radar Chart
     */
    function renderRadarChart(data) {
        const container = document.getElementById('radar-chart-container');
        if (!container || !data || data.length === 0) return;

        const maxValue = 100;
        const centerX = 250;
        const centerY = 250;
        const radius = 200;
        const angleStep = (2 * Math.PI) / data.length;

        let pathData = '';
        let gridHTML = '';

        // Draw concentric circles (grid)
        for (let i = 1; i <= 5; i++) {
            const r = (radius / 5) * i;
            gridHTML += `<circle cx="${centerX}" cy="${centerY}" r="${r}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`;
        }

        // Draw axes and build path
        data.forEach((item, index) => {
            const angle = angleStep * index - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            // Axis line
            gridHTML += `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;

            // Label
            const labelX = centerX + (radius + 30) * Math.cos(angle);
            const labelY = centerY + (radius + 30) * Math.sin(angle);
            gridHTML += `<text x="${labelX}" y="${labelY}" fill="#aaa" font-size="12" text-anchor="middle">${item.axis}</text>`;

            // Data point
            const dataRadius = (item.value / maxValue) * radius;
            const dataX = centerX + dataRadius * Math.cos(angle);
            const dataY = centerY + dataRadius * Math.sin(angle);

            if (index === 0) {
                pathData += `M ${dataX} ${dataY}`;
            } else {
                pathData += ` L ${dataX} ${dataY}`;
            }
        });
        pathData += ' Z';

        container.innerHTML = `
            <svg width="500" height="500" viewBox="0 0 500 500">
                ${gridHTML}
                <path d="${pathData}" fill="rgba(208, 0, 0, 0.2)" stroke="#d00000" stroke-width="2"/>
            </svg>
        `;
    }

    /**
     * 2. Market Readiness (Multiple Roles)
     */
    function renderMarketReadiness(roles) {
        const container = document.getElementById('market-readiness-container');
        if (!container || !roles || roles.length === 0) return;

        container.innerHTML = roles.map(role => `
            <div class="readiness-row">
                <div class="role-info">
                    <div class="role-name">${role.role}</div>
                    <div class="role-level">${role.readinessLevel}</div>
                </div>
                <div class="role-bar">
                    <div class="bar-fill" style="width: ${role.alignmentScore}%; background: ${getBarColor(role.alignmentScore)}"></div>
                    <span class="bar-value">${role.alignmentScore}%</span>
                </div>
                <div class="role-gaps">${role.gaps} gaps</div>
            </div>
        `).join('');
    }

    /**
     * 3. Weakness Heatmap
     */
    function renderHeatmap(heatmapData) {
        const container = document.getElementById('heatmap-container');
        if (!container || !heatmapData || heatmapData.length === 0) return;

        container.innerHTML = `
            <div class="heatmap-grid">
                ${heatmapData.map(item => `
                    <div class="heatmap-cell" style="background: ${getHeatColor(item.riskLevel)}; border-left: 3px solid ${item.color}">
                        <div class="cell-label">${item.category}</div>
                        <div class="cell-risk">Risk: ${item.riskLevel}%</div>
                        <div class="cell-gaps">
                            ${item.criticalGaps > 0 ? `<span class="gap-critical">${item.criticalGaps} critical</span>` : ''}
                            ${item.highGaps > 0 ? `<span class="gap-high">${item.highGaps} high</span>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * 4. Career Trajectory
     */
    function renderTrajectory(trajectoryData) {
        const container = document.getElementById('trajectory-container');
        if (!container || !trajectoryData) return;

        container.innerHTML = `
            <div class="trajectory-timeline">
                ${trajectoryData.timeline.map((point, index) => `
                    <div class="timeline-point ${index === 0 ? 'active' : ''}">
                        <div class="point-marker"></div>
                        <div class="point-card">
                            <div class="point-period">${point.period}</div>
                            <div class="point-metrics">
                                <div class="metric">
                                    <span class="metric-label">Alignment</span>
                                    <span class="metric-value">${point.alignment}%</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Depth</span>
                                    <span class="metric-value">${point.depth}%</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Salary</span>
                                    <span class="metric-value">$${(point.salary / 1000).toFixed(0)}k</span>
                                </div>
                            </div>
                            <div class="point-readiness">${point.readiness}</div>
                        </div>
                    </div>
                `).join('')}
            </div>

            ${trajectoryData.milestones && trajectoryData.milestones.length > 0 ? `
            <div class="trajectory-milestones">
                <h4>Key Milestones</h4>
                ${trajectoryData.milestones.map(milestone => `
                    <div class="milestone">
                        <div class="milestone-month">Month ${milestone.month}</div>
                        <div class="milestone-content">
                            <div class="milestone-title">${milestone.title}</div>
                            <div class="milestone-desc">${milestone.description}</div>
                            <div class="milestone-impact">${milestone.impact}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        `;
    }

    /**
     * 5. Authenticity Index
     */
    function renderAuthenticity(authData) {
        const container = document.getElementById('authenticity-container');
        if (!container || !authData) return;

        container.innerHTML = `
            <div class="authenticity-dashboard">
                <div class="auth-score-panel">
                    <div class="auth-score ${authData.score >= 75 ? 'high' : authData.score >= 50 ? 'medium' : 'low'}">
                        ${authData.score}%
                    </div>
                    <div class="auth-status">${authData.status}</div>
                </div>
                <div class="auth-breakdown">
                    <div class="breakdown-item">
                        <i class="fas fa-check-circle" style="color: #10b981"></i>
                        <span>${authData.verified || 0} Verified Skills</span>
                    </div>
                    <div class="breakdown-item">
                        <i class="fas fa-exclamation-circle" style="color: #ef4444"></i>
                        <span>${authData.mismatches || 0} Mismatches Detected</span>
                    </div>
                    <div class="breakdown-item">
                        <i class="fas fa-folder" style="color: #6b7280"></i>
                        <span>${authData.projectCount || 0} Projects Analyzed</span>
                    </div>
                </div>

                ${authData.flaggedClaims && authData.flaggedClaims.length > 0 ? `
                <div class="auth-warnings">
                    <h4><i class="fas fa-flag"></i> Flagged Claims</h4>
                    ${authData.flaggedClaims.slice(0, 3).map(claim => `
                        <div class="warning-item">
                            <div class="warning-skill">${claim.skill}</div>
                            <div class="warning-details">
                                Claimed: <strong>${claim.claimed}</strong> | 
                                Detected: <strong>${claim.detected}</strong>
                            </div>
                            <div class="warning-severity severity-${claim.severity}">${claim.severity.toUpperCase()}</div>
                        </div>
                    `).join('')}
                </div>
                ` : `
                <div class="auth-success">
                    <i class="fas fa-shield-check"></i>
                    <p>All skills validated against project work</p>
                </div>
                `}
            </div>
        `;
    }

    /**
     * 6. Degradation Alerts
     */
    function renderAlerts(alerts) {
        const container = document.getElementById('alerts-container');
        if (!container || !alerts || alerts.length === 0) return;

        container.innerHTML = alerts.map(alert => `
            <div class="alert-card severity-${alert.severity}">
                <div class="alert-icon">
                    <i class="fas ${getAlertIcon(alert.type)}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.message}</div>
                    <div class="alert-impact">${alert.impact}</div>
                    <div class="alert-action"><strong>Action:</strong> ${alert.action}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Helper Functions
     */
    function getBarColor(score) {
        if (score >= 85) return '#10b981';
        if (score >= 70) return '#3b82f6';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    }

    function getHeatColor(risk) {
        if (risk >= 70) return 'rgba(239, 68, 68, 0.15)';
        if (risk >= 40) return 'rgba(245, 158, 11, 0.15)';
        return 'rgba(16, 185, 129, 0.1)';
    }

    function getAlertIcon(type) {
        const icons = {
            'stagnation': 'fa-pause-circle',
            'declining_momentum': 'fa-arrow-trend-down',
            'shallow_knowledge': 'fa-layer-group'
        };
        return icons[type] || 'fa-exclamation-triangle';
    }

})();
