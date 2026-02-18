// ============================================
// QUANTUM INTELLIGENCE VISUALIZATION ENGINE
// Renders Elite 2075-level Dashboard Components
// ============================================

/**
 * Main entry point: Render complete Quantum Dashboard
 * @param {object} intelligenceData - Full API response with layers, metrics, visualizations
 * @param {string} containerId - Target container ID
 */
function renderQuantumDashboard(intelligenceData, containerId = 'quantum-dashboard') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('❌ Quantum dashboard container not found:', containerId);
        return;
    }
    
    console.log('🎨 Rendering Quantum Intelligence Dashboard...');
    console.log('📊 Data:', intelligenceData);
    
    // Extract data
    const advancedMetrics = intelligenceData.advancedMetrics || {};
    const intelligence = intelligenceData.intelligence || {};
    const visualizations = intelligenceData.visualizations || {};
    const analysis = intelligenceData.analysis || {};
    
    // Build dashboard HTML
    const dashboardHTML = `
        <div class="quantum-dashboard">
            <!-- Header -->
            <div class="quantum-header">
                <h1 class="quantum-title">Developer Capability Intelligence</h1>
                <p class="quantum-subtitle">Enterprise-Grade AI Assessment • 6-Layer Analysis • ${advancedMetrics.totalSkills || 0} Skills Evaluated</p>
            </div>
            
            <!-- DCI Hero Card -->
            <div class="dci-hero-card" id="dci-hero-section">
                <!-- Will be populated by renderDCIHeroCard() -->
            </div>
            
            <!-- Main Visualization Grid -->
            <div class="quantum-viz-grid">
                <!-- Row 1: Radar + Market Readiness -->
                <div class="skill-radar-panel" id="skill-radar-panel">
                    <h3 class="panel-title">
                        <i class="fas fa-radar"></i> Multi-Dimensional Skill Radar
                    </h3>
                    <div class="panel-content" id="radar-chart"></div>
                </div>
                
                <div class="market-readiness-panel" id="market-readiness-panel">
                    <h3 class="panel-title">
                        <i class="fas fa-briefcase"></i> Market Readiness by Role
                    </h3>
                    <div class="panel-content" id="market-readiness-bars"></div>
                </div>
                
                <!-- Row 2: Heatmap + Trajectory -->
                <div class="weakness-heatmap-panel" id="weakness-heatmap-panel">
                    <h3 class="panel-title">
                        <i class="fas fa-th"></i> Skill Gap Heatmap
                    </h3>
                    <div class="panel-content" id="weakness-heatmap"></div>
                </div>
                
                <div class="career-trajectory-panel" id="career-trajectory-panel">
                    <h3 class="panel-title">
                        <i class="fas fa-chart-line"></i> Career Growth Trajectory
                    </h3>
                    <div class="panel-content" id="career-trajectory"></div>
                </div>
                
                <!-- Row 3: Code Quality + Production Readiness -->
                <div class="code-quality-panel" id="code-quality-panel">
                    <h3 class="panel-title">
                        <i class="fas fa-code"></i> Engineering Excellence Metrics
                    </h3>
                    <div class="panel-content" id="code-quality-metrics"></div>
                </div>
                
                <div class="production-readiness-panel" id="production-readiness-panel">
                    <h3 class="panel-title">
                        <i class="fas fa-rocket"></i> Production Readiness Score
                    </h3>
                    <div class="panel-content" id="production-readiness-meter"></div>
                </div>
                
                <!-- Row 4: Market Position + Authenticity -->
                <div class="market-position-panel" id="market-position-panel">
                    <h3 class="panel-title">
                        <i class="fas fa-building"></i> Industry Market Position
                    </h3>
                    <div class="panel-content" id="market-position-display"></div>
                </div>
                
                <div class="authenticity-panel" id="authenticity-panel">
                    <h3 class="panel-title">
                        <i class="fas fa-shield-alt"></i> Skill Authenticity Score
                    </h3>
                    <div class="panel-content" id="authenticity-ring"></div>
                </div>
            </div>
            
            <!-- Interactive Skill Cards -->
            <div class="interactive-skills-section" id="interactive-skills-section">
                <h2 class="section-title">
                    <i class="fas fa-layer-group"></i> Interactive Skill Intelligence Panels
                </h2>
                <div class="skill-cards-grid" id="skill-cards-grid">
                    <!-- Will be populated by renderInteractiveSkillCards() -->
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = dashboardHTML;
    
    // Render each component
    renderDCIHeroCard(advancedMetrics);
    renderSkillRadarChart(visualizations.radarChart || {});
    renderMarketReadinessBars(visualizations.marketReadiness || {});
    renderWeaknessHeatmap(visualizations.weaknessHeatmap || {});
    renderCareerTrajectory(visualizations.careerTrajectory || {});
    renderCodeQualityMetrics(visualizations.codeQuality || {});
    renderProductionReadinessMeter(visualizations.productionReadiness || {});
    renderMarketPositionDisplay(advancedMetrics.marketPosition || {});
    renderAuthenticityRing(visualizations.authenticityScore || {});
    renderInteractiveSkillCards(intelligence);
    
    // Trigger animations
    triggerPulseAnimations();
    
    console.log('✅ Quantum Dashboard rendered successfully!');
}

/**
 * Render DCI Hero Card with animated orb + 6 metric cards
 */
function renderDCIHeroCard(metrics) {
    const container = document.getElementById('dci-hero-section');
    if (!container) return;
    
    const dci = metrics.dci || 75;
    const rating = metrics.rating || 'Mid-Level';
    const breakdown = metrics.breakdown || {};
    
    // 6 Key Metrics
    const keyMetrics = [
        { 
            label: 'Engineering Maturity', 
            value: metrics.engineeringMaturity || 70, 
            icon: 'fa-cogs', 
            color: 'cyan' 
        },
        { 
            label: 'Architectural Thinking', 
            value: metrics.architecturalThinking || 68, 
            icon: 'fa-sitemap', 
            color: 'purple' 
        },
        { 
            label: 'Code Quality', 
            value: breakdown.codeQuality || 72, 
            icon: 'fa-code', 
            color: 'green' 
        },
        { 
            label: 'Security Hygiene', 
            value: metrics.securityHygiene || 75, 
            icon: 'fa-shield-alt', 
            color: 'gold' 
        },
        { 
            label: 'Innovation Potential', 
            value: metrics.innovationPotential || 70, 
            icon: 'fa-lightbulb', 
            color: 'orange' 
        },
        { 
            label: 'Learning Velocity', 
            value: metrics.learningVelocity || 65, 
            icon: 'fa-rocket', 
            color: 'crimson' 
        }
    ];
    
    const html = `
        <div class="dci-orb-container">
            <div class="dci-orb">
                <div class="orb-inner">
                    <div class="dci-score-display">
                        <div class="dci-score-number">${dci}</div>
                        <div class="dci-score-label">DCI Score</div>
                        <div class="dci-score-rating">${rating}</div>
                    </div>
                </div>
                <div class="orb-ring orb-ring-1"></div>
                <div class="orb-ring orb-ring-2"></div>
                <div class="orb-ring orb-ring-3"></div>
            </div>
        </div>
        
        <div class="dci-metrics-grid">
            ${keyMetrics.map(metric => `
                <div class="dci-metric-card" data-color="${metric.color}">
                    <div class="metric-icon">
                        <i class="fas ${metric.icon}"></i>
                    </div>
                    <div class="metric-content">
                        <div class="metric-label">${metric.label}</div>
                        <div class="metric-value">${metric.value}</div>
                        <div class="metric-bar">
                            <div class="metric-bar-fill" style="width: ${metric.value}%"></div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Render SVG Radar Chart
 */
function renderSkillRadarChart(data) {
    const container = document.getElementById('radar-chart');
    if (!container) return;
    
    const dimensions = data.dimensions || [
        { axis: 'Technical Depth', value: 75 },
        { axis: 'Breadth', value: 70 },
        { axis: 'Code Quality', value: 72 },
        { axis: 'Architecture', value: 68 },
        { axis: 'Collaboration', value: 80 },
        { axis: 'Innovation', value: 65 }
    ];
    
    const size = 400;
    const center = size / 2;
    const maxRadius = center - 60;
    const levels = 5;
    const angleSlice = (Math.PI * 2) / dimensions.length;
    
    // Generate polygon points
    const points = dimensions.map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const radius = (d.value / 100) * maxRadius;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        return `${x},${y}`;
    }).join(' ');
    
    // Generate level circles
    const levelCircles = Array.from({ length: levels }, (_, i) => {
        const r = ((i + 1) / levels) * maxRadius;
        return `<circle cx="${center}" cy="${center}" r="${r}" class="radar-level" />`;
    }).join('');
    
    // Generate axis lines and labels
    const axes = dimensions.map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x2 = center + Math.cos(angle) * maxRadius;
        const y2 = center + Math.sin(angle) * maxRadius;
        const labelX = center + Math.cos(angle) * (maxRadius + 30);
        const labelY = center + Math.sin(angle) * (maxRadius + 30);
        
        return `
            <line x1="${center}" y1="${center}" x2="${x2}" y2="${y2}" class="radar-axis" />
            <text x="${labelX}" y="${labelY}" class="radar-label" text-anchor="middle">
                ${d.axis}
            </text>
        `;
    }).join('');
    
    const svg = `
        <svg width="${size}" height="${size}" class="radar-chart-svg">
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#00c8ff;stop-opacity:0.6" />
                    <stop offset="100%" style="stop-color:#9d4edd;stop-opacity:0.3" />
                </linearGradient>
            </defs>
            
            ${levelCircles}
            ${axes}
            
            <polygon points="${points}" class="radar-data-area" fill="url(#radarGradient)" filter="url(#glow)" />
            
            ${dimensions.map((d, i) => {
                const angle = angleSlice * i - Math.PI / 2;
                const radius = (d.value / 100) * maxRadius;
                const x = center + Math.cos(angle) * radius;
                const y = center + Math.sin(angle) * radius;
                return `<circle cx="${x}" cy="${y}" r="5" class="radar-point" />`;
            }).join('')}
        </svg>
    `;
    
    container.innerHTML = svg;
}

/**
 * Render Market Readiness Bars
 */
function renderMarketReadinessBars(data) {
    const container = document.getElementById('market-readiness-bars');
    if (!container) return;
    
    const roles = data.roles || [
        { role: 'Junior Developer', readiness: 85, salary: '$60-80k' },
        { role: 'Mid-Level Engineer', readiness: 70, salary: '$80-120k' },
        { role: 'Senior Engineer', readiness: 50, salary: '$120-160k' },
        { role: 'Staff Engineer', readiness: 35, salary: '$160-200k' },
        { role: 'Principal Engineer', readiness: 20, salary: '$200k+' }
    ];
    
    const html = roles.map(role => `
        <div class="readiness-role-item" data-readiness="${role.readiness}">
            <div class="role-info">
                <div class="role-name">${role.role}</div>
                <div class="role-salary">${role.salary}</div>
            </div>
            <div class="readiness-bar-container">
                <div class="readiness-bar-fill" style="width: ${role.readiness}%">
                    <span class="readiness-percentage">${role.readiness}%</span>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

/**
 * Render Weakness Heatmap
 */
function renderWeaknessHeatmap(data) {
    const container = document.getElementById('weakness-heatmap');
    if (!container) return;
    
    const gaps = data.gaps || [
        { skill: 'System Design', severity: 'high', impact: 85 },
        { skill: 'Microservices', severity: 'high', impact: 80 },
        { skill: 'Docker/K8s', severity: 'medium', impact: 70 },
        { skill: 'Cloud (AWS)', severity: 'medium', impact: 65 },
        { skill: 'CI/CD', severity: 'medium', impact: 60 },
        { skill: 'Testing', severity: 'low', impact: 40 },
        { skill: 'Security', severity: 'medium', impact: 55 },
        { skill: 'Performance', severity: 'low', impact: 35 }
    ];
    
    const html = `
        <div class="heatmap-grid">
            ${gaps.map(gap => `
                <div class="heatmap-cell" data-severity="${gap.severity}" title="${gap.skill} - ${gap.severity}">
                    <div class="heatmap-skill-name">${gap.skill}</div>
                    <div class="heatmap-impact">${gap.impact}</div>
                </div>
            `).join('')}
        </div>
        <div class="heatmap-legend">
            <div class="legend-item">
                <span class="legend-color" data-severity="high"></span> High Impact
            </div>
            <div class="legend-item">
                <span class="legend-color" data-severity="medium"></span> Medium Impact
            </div>
            <div class="legend-item">
                <span class="legend-color" data-severity="low"></span> Low Impact
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Render Career Trajectory Timeline
 */
function renderCareerTrajectory(data) {
    const container = document.getElementById('career-trajectory');
    if (!container) return;
    
    const milestones = data.milestones || [
        { period: 'Current', role: 'Mid-Level', salary: '$95k', year: '2026' },
        { period: '6 Months', role: 'Senior', salary: '$130k', year: '2026' },
        { period: '1 Year', role: 'Senior+', salary: '$145k', year: '2027' },
        { period: '2 Years', role: 'Staff', salary: '$170k', year: '2028' }
    ];
    
    const html = `
        <div class="trajectory-timeline">
            ${milestones.map((milestone, index) => `
                <div class="trajectory-node" data-period="${index}">
                    <div class="node-dot"></div>
                    <div class="node-content">
                        <div class="node-period">${milestone.period}</div>
                        <div class="node-role">${milestone.role}</div>
                        <div class="node-salary">${milestone.salary}</div>
                    </div>
                </div>
            `).join('')}
            <div class="trajectory-line"></div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Render Code Quality Metrics
 */
function renderCodeQualityMetrics(data) {
    const container = document.getElementById('code-quality-metrics');
    if (!container) return;
    
    const metrics = [
        { label: 'Complexity', value: data.complexity || 72, icon: 'fa-project-diagram' },
        { label: 'Modularity', value: data.modularity || 75, icon: 'fa-cubes' },
        { label: 'Test Coverage', value: data.testCoverage || 65, icon: 'fa-vial' },
        { label: 'Security', value: data.security || 70, icon: 'fa-lock' },
        { label: 'Architecture', value: data.architecture || 68, icon: 'fa-drafting-compass' }
    ];
    
    const html = metrics.map(metric => `
        <div class="quality-metric-item">
            <div class="metric-icon-small">
                <i class="fas ${metric.icon}"></i>
            </div>
            <div class="metric-details">
                <div class="metric-label-small">${metric.label}</div>
                <div class="metric-bar-small">
                    <div class="metric-bar-fill-small" style="width: ${metric.value}%"></div>
                </div>
                <div class="metric-value-small">${metric.value}/100</div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

/**
 * Render Production Readiness Meter (Arc)
 */
function renderProductionReadinessMeter(data) {
    const container = document.getElementById('production-readiness-meter');
    if (!container) return;
    
    const score = data.score || 75;
    const components = data.components || {
        codeQuality: 72,
        testCoverage: 65,
        securityAwareness: 70,
        skillDepth: 80,
        authenticity: 85
    };
    
    // Calculate arc path (semicircle)
    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    const startAngle = -180;
    const endAngle = 0;
    const scoreAngle = startAngle + ((score / 100) * 180);
    
    const html = `
        <svg width="200" height="120" class="readiness-arc-svg">
            <defs>
                <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#ff006e" />
                    <stop offset="50%" style="stop-color:#ffd60a" />
                    <stop offset="100%" style="stop-color:#00ff88" />
                </linearGradient>
            </defs>
            
            <!-- Background arc -->
            <path d="M 20,100 A 80,80 0 0,1 180,100" stroke="#1a1a2e" stroke-width="12" fill="none" />
            
            <!-- Progress arc -->
            <path d="M 20,100 A 80,80 0 0,1 ${centerX + radius * Math.cos((scoreAngle * Math.PI) / 180)},${centerY + radius * Math.sin((scoreAngle * Math.PI) / 180)}" 
                  stroke="url(#arcGradient)" stroke-width="12" fill="none" stroke-linecap="round" />
            
            <!-- Center score -->
            <text x="100" y="90" text-anchor="middle" class="arc-score-text">${score}</text>
            <text x="100" y="110" text-anchor="middle" class="arc-label-text">Ready</text>
        </svg>
        
        <div class="readiness-components">
            ${Object.entries(components).map(([key, value]) => `
                <div class="component-chip" title="${key}: ${value}%">
                    <span class="chip-label">${key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span class="chip-value">${value}%</span>
                </div>
            `).join('')}
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Render Market Position Display
 */
function renderMarketPositionDisplay(data) {
    const container = document.getElementById('market-position-display');
    if (!container) return;
    
    const tier = data.tier || 'Mid-Level (Tier 3)';
    const salaryRange = data.salaryRange || '$80k - $120k';
    const targetCompanies = data.targetCompanies || ['Mid-size Tech', 'Series C-D Startups', 'Enterprise'];
    const competitiveStanding = data.competitiveStanding || 'Above Average';
    
    const html = `
        <div class="market-tier-display">
            <div class="tier-badge">${tier}</div>
            <div class="salary-range">${salaryRange}</div>
            <div class="competitive-standing">${competitiveStanding}</div>
        </div>
        
        <div class="target-companies">
            <div class="companies-label">Target Companies:</div>
            <div class="companies-chips">
                ${targetCompanies.map(company => `
                    <span class="company-chip">${company}</span>
                `).join('')}
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Render Authenticity Ring (Circular Progress)
 */
function renderAuthenticityRing(data) {
    const container = document.getElementById('authenticity-ring');
    if (!container) return;
    
    const score = data.score || 82;
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    
    const html = `
        <svg width="160" height="160" class="authenticity-ring-svg">
            <defs>
                <linearGradient id="authGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#00ff88" />
                    <stop offset="100%" style="stop-color:#00c8ff" />
                </linearGradient>
            </defs>
            
            <!-- Background circle -->
            <circle cx="80" cy="80" r="${radius}" stroke="#1a1a2e" stroke-width="10" fill="none" />
            
            <!-- Progress circle -->
            <circle cx="80" cy="80" r="${radius}" 
                    stroke="url(#authGradient)" 
                    stroke-width="10" 
                    fill="none"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${offset}"
                    transform="rotate(-90 80 80)"
                    stroke-linecap="round" />
            
            <!-- Center text -->
            <text x="80" y="75" text-anchor="middle" class="auth-score-text">${score}%</text>
            <text x="80" y="95" text-anchor="middle" class="auth-label-text">Verified</text>
        </svg>
    `;
    
    container.innerHTML = html;
}

/**
 * Render Interactive Skill Cards with Evidence Panels
 */
function renderInteractiveSkillCards(intelligence) {
    const container = document.getElementById('skill-cards-grid');
    if (!container) return;
    
    const skills = intelligence.skillsWithEvidence || [];
    
    if (skills.length === 0) {
        container.innerHTML = '<p class="no-skills-message">No skill evidence data available</p>';
        return;
    }
    
    const html = skills.slice(0, 12).map((skill, index) => {
        const evidenceList = Array.isArray(skill.evidence) 
            ? skill.evidence.slice(0, 3)
            : (skill.evidence ? [skill.evidence] : ['Code commits', 'Project work', 'Documentation']);
        
        return `
            <div class="interactive-skill-card" data-skill-index="${index}">
                <div class="skill-card-header">
                    <div class="skill-name">${skill.skill || skill.name || 'Unknown Skill'}</div>
                    <div class="skill-level" data-level="${skill.level || 'intermediate'}">
                        ${skill.level || 'Intermediate'}
                    </div>
                </div>
                <div class="skill-card-body">
                    <div class="skill-confidence">
                        <span class="confidence-label">Confidence:</span>
                        <span class="confidence-value">${Math.round((skill.confidence || 0.75) * 100)}%</span>
                    </div>
                    <div class="skill-depth-indicator">
                        <div class="depth-bar">
                            <div class="depth-fill" style="width: ${(skill.depthScore || 70)}%"></div>
                        </div>
                        <span class="depth-label">${skill.depth || 'Applied'} Level</span>
                    </div>
                </div>
                <div class="skill-evidence-panel">
                    <div class="evidence-title">Evidence Detected:</div>
                    <ul class="evidence-list">
                        ${evidenceList.map(evidence => `
                            <li class="evidence-item">
                                <i class="fas fa-check-circle"></i> ${evidence}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
    
    // Add hover interactions
    addSkillCardInteractions();
}

/**
 * Add hover interactions to skill cards
 */
function addSkillCardInteractions() {
    const cards = document.querySelectorAll('.interactive-skill-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(8px)';
            const evidence = this.querySelector('.skill-evidence-panel');
            if (evidence) {
                evidence.style.maxHeight = '300px';
                evidence.style.opacity = '1';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
            const evidence = this.querySelector('.skill-evidence-panel');
            if (evidence) {
                evidence.style.maxHeight = '0';
                evidence.style.opacity = '0';
            }
        });
    });
}

/**
 * Trigger pulse animations for orbs and nodes
 */
function triggerPulseAnimations() {
    // Orb pulse
    const orb = document.querySelector('.dci-orb');
    if (orb) {
        orb.classList.add('pulsing');
    }
    
    // Trajectory nodes pulse
    const nodes = document.querySelectorAll('.node-dot');
    nodes.forEach((node, index) => {
        setTimeout(() => {
            node.classList.add('pulse-dot');
        }, index * 200);
    });
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderQuantumDashboard };
}
