/**
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║  CAREER INTELLIGENCE ENGINE — Frontend Module                     ║
 * ║  Enterprise 6-Layer Resume Analysis Dashboard                     ║
 * ╚════════════════════════════════════════════════════════════════════╝
 *
 *  Handles:
 *   • Mode tab switching (Skill Gap ↔ Career Intelligence)
 *   • CI form file upload + validation
 *   • POST /api/skill-gap/career-intelligence
 *   • 6-layer results dashboard rendering
 */

(function () {
    'use strict';

    // ─── Config ───────────────────────────────────────────────────────────────
    const CI_API = () => (typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '/api') + '/skill-gap/career-intelligence';

    // ─── State ────────────────────────────────────────────────────────────────
    let ciFile    = null;
    let ciResult  = null;

    // ─── DOM helpers ──────────────────────────────────────────────────────────
    const $  = id  => document.getElementById(id);
    const qs = sel => document.querySelector(sel);

    // ──────────────────────────────────────────────────────────────────────────
    // INIT — runs after page loads
    // ──────────────────────────────────────────────────────────────────────────
    function init() {
        setupModeTabs();
        setupCIForm();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // MODE TABS
    // ──────────────────────────────────────────────────────────────────────────
    function setupModeTabs() {
        const tabSkillGap = $('sg-tab-skill-gap');
        const tabCI       = $('sg-tab-career-intel');

        if (!tabSkillGap || !tabCI) return;

        tabSkillGap.addEventListener('click', () => activateMode('skill-gap'));
        tabCI.addEventListener('click',       () => activateMode('career-intelligence'));
    }

    function activateMode(mode) {
        const tabSG  = $('sg-tab-skill-gap');
        const tabCI  = $('sg-tab-career-intel');
        const sgContent = $('sg-skill-gap-content');
        const ciInput   = $('ci-input-section');
        const ciResults = $('ci-results-section');
        const ciLoading = $('ci-loading');

        if (mode === 'skill-gap') {
            tabSG.classList.add('active');
            tabCI.classList.remove('active');
            if (sgContent) sgContent.style.display = '';
            if (ciInput)   ciInput.style.display   = 'none';
            if (ciResults) ciResults.style.display = 'none';
            if (ciLoading) ciLoading.style.display  = 'none';
        } else {
            tabCI.classList.add('active');
            tabSG.classList.remove('active');
            if (sgContent) sgContent.style.display = 'none';
            if (ciInput)   ciInput.style.display   = '';
            if (ciLoading) ciLoading.style.display  = 'none';
            // keep ci-results visible if we already have a result
            if (ciResults && !ciResult) ciResults.style.display = 'none';
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // CI FORM  —  file upload + analyze button
    // ──────────────────────────────────────────────────────────────────────────
    function setupCIForm() {
        const browseBtn = $('ci-browse-btn');
        const fileInput = $('ci-resume-input');
        const dropZone  = $('ci-drop-zone');
        const removeBtn = $('ci-remove-file');
        const analyzeBtn = $('ci-analyze-btn');

        if (!fileInput) return;

        browseBtn?.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
        dropZone?.addEventListener('click',  ()  => fileInput.click());

        fileInput.addEventListener('change', e => {
            if (e.target.files[0]) handleCIFileUpload(e.target.files[0]);
        });

        dropZone?.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
        dropZone?.addEventListener('dragleave', ()  => dropZone.classList.remove('drag-over'));
        dropZone?.addEventListener('drop', e => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            if (e.dataTransfer.files[0]) handleCIFileUpload(e.dataTransfer.files[0]);
        });

        removeBtn?.addEventListener('click', clearCIFile);
        analyzeBtn?.addEventListener('click', runCareerIntelligence);
    }

    function handleCIFileUpload(file) {
        const validExt = ['.pdf', '.doc', '.docx'];
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!validExt.includes(ext)) {
            showNotice('Invalid file type. Please upload PDF or DOC/DOCX.', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showNotice('File exceeds 5 MB limit.', 'error');
            return;
        }

        ciFile = file;

        const dropZone  = $('ci-drop-zone');
        const fileInfo  = $('ci-file-info');
        const fileName  = $('ci-file-name');
        const analyzeBtn = $('ci-analyze-btn');

        if (dropZone)  dropZone.style.display  = 'none';
        if (fileInfo)  fileInfo.style.display  = 'flex';
        if (fileName)  fileName.textContent     = file.name;
        if (analyzeBtn) analyzeBtn.disabled     = false;
    }

    function clearCIFile() {
        ciFile = null;
        const dropZone  = $('ci-drop-zone');
        const fileInfo  = $('ci-file-info');
        const analyzeBtn = $('ci-analyze-btn');
        const fileInput = $('ci-resume-input');

        if (dropZone)  dropZone.style.display  = '';
        if (fileInfo)  fileInfo.style.display  = 'none';
        if (analyzeBtn) analyzeBtn.disabled    = true;
        if (fileInput)  fileInput.value        = '';
    }

    // ──────────────────────────────────────────────────────────────────────────
    // API CALL
    // ──────────────────────────────────────────────────────────────────────────
    async function runCareerIntelligence() {
        if (!ciFile) { showNotice('Please upload a resume first.', 'error'); return; }

        const targetSalary      = parseFloat($('ci-target-salary')?.value)  || 100000;
        const targetRole        = $('ci-target-role')?.value                || 'Software Engineer';
        const location          = $('ci-location')?.value                   || 'Remote';
        const yearsOfExperience = parseFloat($('ci-yoe')?.value)            || 3;

        // Show loading
        $('ci-input-section').style.display = 'none';
        $('ci-results-section').style.display = 'none';
        $('ci-loading').style.display = '';
        animateCILayers();

        try {
            const formData = new FormData();
            formData.append('resume',             ciFile);
            formData.append('targetSalary',        targetSalary.toString());
            formData.append('targetRole',          targetRole);
            formData.append('location',            location);
            formData.append('yearsOfExperience',   yearsOfExperience.toString());

            const headers = {};
            if (typeof AuthHelper !== 'undefined') {
                const token = AuthHelper.getToken();
                if (token) headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(CI_API(), {
                method:  'POST',
                headers,
                body:    formData,
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || `Server error ${response.status}`);
            }

            ciResult = await response.json();

            // Finish loading animation
            await finishCIAnimation();

            // Render results
            $('ci-loading').style.display   = 'none';
            $('ci-results-section').style.display = '';
            renderCIResults(ciResult);

        } catch (err) {
            console.error('Career Intelligence error:', err);
            $('ci-loading').style.display   = 'none';
            $('ci-input-section').style.display = '';
            showNotice(`Analysis failed: ${err.message}`, 'error');
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // LOADING ANIMATION
    // ──────────────────────────────────────────────────────────────────────────
    const LAYER_DELAYS = [600, 900, 900, 700, 800, 1000];

    let _activeLayerTimeout = null;

    function animateCILayers() {
        for (let i = 1; i <= 6; i++) setCILayerState(i, 'pending');
        let acc = 300;
        for (let i = 1; i <= 6; i++) {
            const layerNum = i;
            setTimeout(() => setCILayerState(layerNum, 'active'), acc);
            acc += LAYER_DELAYS[i - 1];
        }
    }

    async function finishCIAnimation() {
        for (let i = 1; i <= 6; i++) {
            setCILayerState(i, 'done');
            await sleep(120);
        }
        await sleep(400);
    }

    function setCILayerState(num, state) {
        const el = $(`ci-layer-${num}`);
        if (!el) return;
        const dot = el.querySelector('.ci-layer-state');
        if (!dot) return;

        el.setAttribute('data-state', state);
        if (state === 'pending') { dot.className = 'ci-layer-state pending'; dot.textContent = '•'; }
        if (state === 'active')  { dot.className = 'ci-layer-state active';  dot.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }
        if (state === 'done')    { dot.className = 'ci-layer-state done';    dot.innerHTML = '<i class="fas fa-check"></i>'; }
    }

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    // ──────────────────────────────────────────────────────────────────────────
    // RENDER RESULTS DASHBOARD
    // ──────────────────────────────────────────────────────────────────────────
    function renderCIResults(data) {
        const container = $('ci-results-section');
        if (!container) return;

        const {
            layers, addOns, meta, overallReadinessScore, finalVerdict, verdictColor,
            verdictDescription, immediatePriorityActions,
            readinessScore, salaryProbability, gapSeverity, authenticityScore, projectionTimelineMonths,
            capabilityMatrix, skillDiagnostics, salaryFeasibility, authenticityDetail,
            marketSignals, growthTrajectory, maturityRadar, improvementRoadmap,
        } = data;
        const { layer1, layer2, layer3, layer4, layer5, layer6 } = layers;

        container.innerHTML = `

            <!-- ═══ VERDICT BANNER ═══ -->
            <div class="ci-verdict-banner" style="border-color: ${verdictColor};">
                <div class="ci-verdict-left">
                    <div class="ci-readiness-ring">
                        <svg viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="10"/>
                            <circle cx="60" cy="60" r="54" fill="none" stroke="${verdictColor}" stroke-width="10"
                                stroke-dasharray="${2 * Math.PI * 54}"
                                stroke-dashoffset="${2 * Math.PI * 54 * (1 - (readinessScore || overallReadinessScore) / 100)}"
                                stroke-linecap="round"
                                transform="rotate(-90 60 60)"/>
                        </svg>
                        <div class="ci-ring-inner">
                            <span class="ci-ring-score">${readinessScore || overallReadinessScore}</span>
                            <span class="ci-ring-label">/ 100</span>
                        </div>
                    </div>
                    <div class="ci-verdict-text">
                        <div class="ci-verdict-label" style="color:${verdictColor}">${finalVerdict}</div>
                        <div class="ci-verdict-desc">${verdictDescription}</div>
                        <div class="ci-verdict-meta">
                            <span><i class="fas fa-briefcase"></i> ${meta.targetRole}</span>
                            <span><i class="fas fa-dollar-sign"></i> $${meta.targetSalary.toLocaleString()}</span>
                            <span><i class="fas fa-clock"></i> ${meta.yearsOfExperience} yrs exp</span>
                            ${meta.location ? `<span><i class="fas fa-map-marker-alt"></i> ${meta.location}</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="ci-addon-metrics">
                    ${ciMetricBadge('Hiring Probability', addOns.hiringProbabilityPercent + '%', 'fas fa-user-check', '#4facfe')}
                    ${ciMetricBadge('ATS Score', addOns.atsOptimizationScore + '/100', 'fas fa-robot', '#00d68f')}
                    ${ciMetricBadge('Recruiter Attention', addOns.recruiterAttentionScore + '/100', 'fas fa-eye', '#f7971e')}
                    ${ciMetricBadge('Confidence Index', addOns.confidenceIndex + '/100', 'fas fa-shield-alt', '#a29bfe')}
                </div>
            </div>

            <!-- ═══ STRUCTURED OUTPUT SCORECARD ═══ -->
            ${renderStructuredScorecard(data)}

            <!-- ═══ PRIORITY ACTIONS ═══ -->
            ${immediatePriorityActions && immediatePriorityActions.length > 0 ? `
            <div class="ci-priority-actions card">
                <h4 class="ci-section-title"><i class="fas fa-exclamation-triangle"></i> Immediate Priority Actions</h4>
                <div class="ci-actions-list">
                    ${immediatePriorityActions.map(a => `
                        <div class="ci-action-item ci-priority-${(a.priority||'').toLowerCase()}">
                            <span class="ci-priority-badge">${a.priority}</span>
                            <div class="ci-action-body">
                                <div class="ci-action-text">${a.action}</div>
                                <div class="ci-action-impact"><i class="fas fa-bolt"></i> ${a.impact}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>` : ''}

            <!-- ═══ DUAL PANELS — RADAR + CAPABILITY MATRIX ═══ -->
            <div class="ci-dual-panel-row">
                ${maturityRadar ? renderMaturityRadar(maturityRadar) : ''}
                ${capabilityMatrix ? renderCapabilityMatrix(capabilityMatrix) : ''}
            </div>

            <!-- ═══ SKILL DEPTH DIAGNOSTICS ═══ -->
            ${skillDiagnostics ? renderSkillDepthDiagnostics(skillDiagnostics) : ''}

            <!-- ═══ SALARY FEASIBILITY ═══ -->
            ${salaryFeasibility ? renderSalaryFeasibility(salaryFeasibility) : ''}

            <!-- ═══ DUAL PANELS — AUTHENTICITY + MARKET SIGNALS ═══ -->
            <div class="ci-dual-panel-row">
                ${authenticityDetail ? renderAuthenticityPanel(authenticityDetail) : ''}
                ${marketSignals ? renderMarketSignals(marketSignals) : ''}
            </div>

            <!-- ═══ GROWTH TRAJECTORY ═══ -->
            ${growthTrajectory ? renderGrowthTrajectory(growthTrajectory) : ''}

            <!-- ═══ IMPROVEMENT ROADMAP ═══ -->
            ${improvementRoadmap && improvementRoadmap.length > 0 ? renderImprovementRoadmap(improvementRoadmap) : ''}

            <!-- ═══ SECTION TITLE: LAYER ANALYSIS ═══ -->
            <div class="ci-section-divider">
                <span>Detailed Layer Analysis</span>
            </div>

            <!-- ═══ 5-LAYER PANELS GRID ═══ -->
            <div class="ci-panels-grid">
                ${renderLayer1Panel(layer1)}
                ${renderLayer2Panel(layer2)}
                ${renderLayer3Panel(layer3)}
                ${renderLayer4Panel(layer4)}
                ${renderLayer5Panel(layer5)}
            </div>

            <!-- ═══ LAYER 6 — RESUME RECONSTRUCTION ═══ -->
            ${renderLayer6Panel(layer6)}

            <!-- BACK BUTTON -->
            <div class="ci-back-row">
                <button class="btn btn-outline" id="ci-back-btn">
                    <i class="fas fa-arrow-left"></i> New Analysis
                </button>
            </div>
        `;

        // Bind back button
        $('ci-back-btn')?.addEventListener('click', () => {
            ciResult = null;
            clearCIFile();
            $('ci-results-section').style.display = 'none';
            $('ci-input-section').style.display   = '';
        });

        // Animate all score bars
        requestAnimationFrame(() => {
            container.querySelectorAll('.ci-bar-fill[data-score]').forEach(bar => {
                const score = parseInt(bar.dataset.score, 10);
                bar.style.width = Math.min(100, score) + '%';
            });
        });
    }

    // ─── Structured Scorecard ─────────────────────────────────────────────────
    function renderStructuredScorecard(data) {
        const s = n => (n === undefined || n === null) ? '—' : n;
        const sev = data.gapSeverity || '—';
        const sevColor = sev === 'Minimal' ? '#00d68f' : sev === 'Moderate' ? '#f7971e' : sev === 'Significant' ? '#ff6b6b' : '#ff4757';
        return `
        <div class="ci-scorecard-grid">
            ${ciScorecardCell('Readiness Score', s(data.readinessScore), '/100', '#4facfe')}
            ${ciScorecardCell('Salary Feasibility', s(data.salaryProbability), '%', '#00d68f')}
            ${ciScorecardCell('Gap Severity', sev, '', sevColor)}
            ${ciScorecardCell('Authenticity', s(data.authenticityScore), '/100', '#a29bfe')}
            ${ciScorecardCell('Path to Target', s(data.projectionTimelineMonths), ' months', '#f7971e')}
        </div>`;
    }

    function ciScorecardCell(label, value, unit, color) {
        return `
        <div class="ci-scorecard-cell" style="border-top-color:${color}">
            <div class="ci-scorecard-val" style="color:${color}">${value}<span class="ci-scorecard-unit">${unit}</span></div>
            <div class="ci-scorecard-label">${label}</div>
        </div>`;
    }

    // ─── Maturity Radar (SVG Hexagon) ─────────────────────────────────────────
    function renderMaturityRadar(radar) {
        if (!radar || !radar.axes) return '';
        const axes = radar.axes;
        const labels = {
            depth: 'Skill Depth', breadth: 'Breadth', architecture: 'Architecture',
            collaboration: 'Collaboration', innovation: 'Innovation', productionOwnership: 'Prod Ownership',
        };
        const keys   = Object.keys(labels);
        const scores = keys.map(k => Math.min(100, Math.max(0, axes[k] || 0)));
        const N      = keys.length;
        const size   = 180;
        const cx     = size / 2;
        const cy     = size / 2;
        const maxR   = (size / 2) - 28;

        function polar(i, r) {
            const angle = (Math.PI * 2 * i / N) - Math.PI / 2;
            return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
        }

        // Grid rings
        const gridRings = [25, 50, 75, 100].map(pct => {
            const r = maxR * (pct / 100);
            const pts = keys.map((_, i) => polar(i, r));
            return `<polygon points="${pts.map(p => `${p.x},${p.y}`).join(' ')}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>`;
        }).join('');

        // Axes lines
        const axisLines = keys.map((_, i) => {
            const end = polar(i, maxR);
            return `<line x1="${cx}" y1="${cy}" x2="${end.x}" y2="${end.y}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
        }).join('');

        // Data polygon
        const dataPoints = scores.map((s, i) => polar(i, maxR * (s / 100)));
        const polygon = `<polygon points="${dataPoints.map(p => `${p.x},${p.y}`).join(' ')}" fill="rgba(79,172,254,0.22)" stroke="#4facfe" stroke-width="2"/>`;

        // Dots
        const dots = dataPoints.map((p, i) => {
            const color = scores[i] >= 70 ? '#00d68f' : scores[i] >= 45 ? '#f7971e' : '#ff6b6b';
            return `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${color}" stroke="#1a1a2e" stroke-width="1.5"/>`;
        }).join('');

        // Labels with score
        const labelEls = keys.map((k, i) => {
            const pos      = polar(i, maxR + 20);
            const score    = scores[i];
            const color    = score >= 70 ? '#00d68f' : score >= 45 ? '#f7971e' : '#ff6b6b';
            const anchor   = pos.x < cx - 5 ? 'end' : pos.x > cx + 5 ? 'start' : 'middle';
            return `<text x="${pos.x}" y="${pos.y}" text-anchor="${anchor}" fill="${color}" font-size="8.5" dominant-baseline="middle">${labels[k]} ${score}</text>`;
        }).join('');

        return `
        <div class="ci-new-panel ci-panel-half">
            <div class="ci-panel-header">
                <span class="ci-panel-num">R1</span>
                <div class="ci-panel-title-group">
                    <span class="ci-panel-title">Engineering Maturity Radar</span>
                    <span class="ci-panel-sub">${radar.maturityTier || ''} · Overall ${radar.overallMaturityScore || '—'}/100</span>
                </div>
                ${ciScorePill(radar.overallMaturityScore || 0)}
            </div>
            <div class="ci-panel-body ci-radar-body">
                <svg viewBox="0 0 ${size} ${size}" class="ci-radar-svg">
                    ${gridRings}
                    ${axisLines}
                    ${polygon}
                    ${dots}
                    ${labelEls}
                </svg>
                <div class="ci-radar-legend">
                    ${(radar.radarDimensions || []).map(d => `
                        <div class="ci-radar-row ${d.status}">
                            <span class="ci-radar-dot"></span>
                            <span class="ci-radar-dim">${d.label}</span>
                            <span class="ci-radar-score">${d.score}</span>
                            <span class="ci-radar-bench">/ ${d.benchmark}</span>
                        </div>`).join('')}
                </div>
            </div>
        </div>`;
    }

    // ─── Capability Matrix Heatmap ─────────────────────────────────────────────
    function renderCapabilityMatrix(cm) {
        if (!cm || !cm.gaps) return '';
        const dimLabels = {
            systemDesign: 'System Design', cloudInfra: 'Cloud Infra', scalability: 'Scalability',
            security: 'Security', testingMaturity: 'Testing', performanceOpt: 'Performance',
            collaboration: 'Collaboration', codeQuality: 'Code Quality',
        };
        return `
        <div class="ci-new-panel ci-panel-half">
            <div class="ci-panel-header">
                <span class="ci-panel-num">R2</span>
                <div class="ci-panel-title-group">
                    <span class="ci-panel-title">Capability Matrix</span>
                    <span class="ci-panel-sub">${cm.targetRole} · ${cm.salaryTier} tier · Current ${cm.overallCapabilityScore}/100</span>
                </div>
                ${ciScorePill(cm.overallCapabilityScore)}
            </div>
            <div class="ci-panel-body">
                <div class="ci-matrix-header-row">
                    <span>Dimension</span><span>Required</span><span>Current</span><span>Gap</span>
                </div>
                ${cm.gaps.map(g => {
                    const sevColor = g.severity === 'blocking' ? '#ff4757' : g.severity === 'limiting' ? '#ff6b6b' : g.severity === 'optimization' ? '#f7971e' : '#00d68f';
                    const curColor = g.current >= g.required ? '#00d68f' : g.current >= g.required * 0.75 ? '#f7971e' : '#ff6b6b';
                    return `
                    <div class="ci-matrix-row">
                        <span class="ci-matrix-dim">${dimLabels[g.dimension] || g.dimension}</span>
                        <span class="ci-matrix-req">${g.required}</span>
                        <span class="ci-matrix-cur" style="color:${curColor}">${g.current}</span>
                        <span class="ci-matrix-gap" style="color:${sevColor}">
                            ${g.delta > 0 ? '-' + g.delta : '✓'}
                            <span class="ci-sev-badge ci-sev-${g.severity}">${g.severity}</span>
                        </span>
                    </div>`;
                }).join('')}
                ${cm.blockingGaps.length > 0 ? `<div class="ci-matrix-footer">Blocking: ${cm.blockingGaps.join(', ')}</div>` : ''}
            </div>
        </div>`;
    }

    // ─── Skill Depth Diagnostics ──────────────────────────────────────────────
    function renderSkillDepthDiagnostics(sd) {
        if (!sd || !sd.gaps || sd.gaps.length === 0) return '';
        return `
        <div class="ci-new-panel ci-panel-full">
            <div class="ci-panel-header">
                <span class="ci-panel-num">R3</span>
                <div class="ci-panel-title-group">
                    <span class="ci-panel-title">Skill Depth Diagnostics</span>
                    <span class="ci-panel-sub">${sd.criticalCount} critical · ${sd.highCount} high · ${sd.mediumCount} medium gaps</span>
                </div>
            </div>
            <div class="ci-panel-body">
                <div class="ci-depth-grid">
                    ${sd.gaps.map(g => {
                        const sevColor = g.severity === 'Critical' ? '#ff4757' : g.severity === 'High' ? '#ff6b6b' : g.severity === 'Medium' ? '#f7971e' : '#00d68f';
                        const curPct   = Math.min(100, Math.round((g.current / Math.max(1, g.required)) * 100));
                        return `
                        <div class="ci-depth-card">
                            <div class="ci-depth-card-header">
                                <span class="ci-depth-skill">${g.skill}</span>
                                <span class="ci-sev-badge ci-sev-${g.severity.toLowerCase()}" style="background:${sevColor}22; color:${sevColor}">${g.severity}</span>
                            </div>
                            <div class="ci-depth-bar-wrap">
                                <div class="ci-depth-bar-bg">
                                    <div class="ci-depth-bar-fill" data-score="${curPct}" style="width:0%; background:${sevColor}"></div>
                                    <div class="ci-depth-bar-required" style="left:${g.required}%"></div>
                                </div>
                                <div class="ci-depth-scores">
                                    <span>Now: <b style="color:${sevColor}">${g.current}</b></span>
                                    <span>Need: <b>${g.required}</b></span>
                                    <span>Δ: <b style="color:${sevColor}">-${g.delta}</b></span>
                                </div>
                            </div>
                            <div class="ci-depth-path">${g.learningPath}</div>
                            <div class="ci-depth-project"><i class="fas fa-code-branch"></i> ${g.projectRec}</div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        </div>`;
    }

    // ─── Salary Feasibility ───────────────────────────────────────────────────
    function renderSalaryFeasibility(sf) {
        if (!sf) return '';
        const isRealistic = sf.isRealistic;
        const statusColor = isRealistic ? '#00d68f' : '#ff6b6b';
        return `
        <div class="ci-new-panel ci-panel-full">
            <div class="ci-panel-header">
                <span class="ci-panel-num">R4</span>
                <div class="ci-panel-title-group">
                    <span class="ci-panel-title">Salary Feasibility Projection</span>
                    <span class="ci-panel-sub">Target $${(sf.targetSalary||0).toLocaleString()} · Gap $${(sf.gapAmount||0).toLocaleString()} (${sf.gapPercent||0}%) · Timeline ${sf.projectionTimelineMonths} months</span>
                </div>
            </div>
            <div class="ci-panel-body">
                <div class="ci-feasibility-top">
                    <div class="ci-feasibility-status" style="color:${statusColor}">
                        <i class="fas ${isRealistic ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                        ${isRealistic ? 'Target is Achievable' : 'Target Requires Significant Upskilling'}
                    </div>
                    <div class="ci-feasibility-meta-row">
                        ${ciTag('Current Est.', '$' + (sf.currentEstimatedValue||0).toLocaleString(), 'neutral')}
                        ${ciTag('12-mo Reachable', '$' + (sf.twelveMoReachable||0).toLocaleString(), 'info')}
                        ${ciTag('Timeline', sf.timeline || sf.projectionTimelineMonths + ' months', isRealistic ? 'success' : 'warn')}
                        ${sf.geoNote ? ciTag('Geo', sf.geoNote.replace('Location multiplier: ','').split(' ')[0], 'neutral') : ''}
                    </div>
                    ${sf.adjustedRecommendation ? `<div class="ci-feasibility-rec"><i class="fas fa-lightbulb"></i> ${sf.adjustedRecommendation}</div>` : ''}
                </div>
                ${sf.requiredSkillDeltas && sf.requiredSkillDeltas.length > 0 ? `
                <div class="ci-feasibility-skills">
                    <div class="ci-findings-label warn">Skills Required to Bridge Gap</div>
                    ${sf.requiredSkillDeltas.map(s => `
                        <div class="ci-feasibility-skill-row">
                            <span class="ci-feas-skill-name">${s.skill}</span>
                            <span class="ci-feas-weeks">${s.estimatedWeeks}w</span>
                            <span class="ci-feas-action">${s.action}</span>
                        </div>`).join('')}
                </div>` : ''}
                ${!isRealistic && sf.progressionPath && sf.progressionPath.length > 0 ? `
                <div class="ci-progression-path">
                    <div class="ci-findings-label info">Recommended Progression Path</div>
                    <div class="ci-prog-steps">
                        ${sf.progressionPath.map((s, i) => `
                            <div class="ci-prog-step">
                                <div class="ci-prog-num">${s.step}</div>
                                <div class="ci-prog-info">
                                    <div class="ci-prog-role">${s.role}</div>
                                    <div class="ci-prog-sal">${s.salary} · ${s.timeline}</div>
                                </div>
                                ${i < sf.progressionPath.length - 1 ? '<div class="ci-prog-arrow">→</div>' : ''}
                            </div>`).join('')}
                    </div>
                </div>` : ''}
            </div>
        </div>`;
    }

    // ─── Authenticity Panel ───────────────────────────────────────────────────
    function renderAuthenticityPanel(auth) {
        if (!auth) return '';
        const color = auth.totalScore >= 70 ? '#00d68f' : auth.totalScore >= 45 ? '#f7971e' : '#ff6b6b';
        return `
        <div class="ci-new-panel ci-panel-half">
            <div class="ci-panel-header">
                <span class="ci-panel-num">R5</span>
                <div class="ci-panel-title-group">
                    <span class="ci-panel-title">Authenticity Detection</span>
                    <span class="ci-panel-sub">Depth signals · Credibility indicators</span>
                </div>
                ${ciScorePill(auth.totalScore)}
            </div>
            <div class="ci-panel-body">
                <div class="ci-auth-ring-row">
                    <div class="ci-mini-ring">
                        <svg viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8"/>
                            <circle cx="40" cy="40" r="32" fill="none" stroke="${color}" stroke-width="8"
                                stroke-dasharray="${2 * Math.PI * 32}"
                                stroke-dashoffset="${2 * Math.PI * 32 * (1 - auth.totalScore / 100)}"
                                stroke-linecap="round" transform="rotate(-90 40 40)"/>
                        </svg>
                        <div class="ci-mini-ring-inner"><span style="color:${color}">${auth.totalScore}</span></div>
                    </div>
                    <div class="ci-auth-level" style="color:${color}">${auth.level}</div>
                </div>
                <div class="ci-auth-counts">
                    ${ciTag('Depth Signals', auth.depthSignalsFound, 'success')}
                    ${ciTag('Shallow Signals', auth.shallowSignalsFound, auth.shallowSignalsFound > 2 ? 'error' : 'neutral')}
                    ${ciTag('Brand Signals', auth.brandSignalsFound, auth.brandSignalsFound > 0 ? 'success' : 'neutral')}
                </div>
                ${auth.flags && auth.flags.length > 0 ? `
                <div class="ci-findings">
                    ${auth.flags.map(f => `
                        <div class="ci-finding-item ${f.type === 'positive' ? 'success' : f.type === 'info' ? 'neutral' : 'error'}">
                            ${f.type === 'positive' ? '✓' : f.type === 'info' ? 'ℹ' : '⚠'} ${f.msg}
                        </div>`).join('')}
                </div>` : ''}
            </div>
        </div>`;
    }

    // ─── Market Signals ───────────────────────────────────────────────────────
    function renderMarketSignals(ms) {
        if (!ms) return '';
        const color = ms.marketSignalScore >= 65 ? '#00d68f' : ms.marketSignalScore >= 40 ? '#f7971e' : '#ff6b6b';
        return `
        <div class="ci-new-panel ci-panel-half">
            <div class="ci-panel-header">
                <span class="ci-panel-num">R6</span>
                <div class="ci-panel-title-group">
                    <span class="ci-panel-title">Market Signal Analysis</span>
                    <span class="ci-panel-sub">Brand strength · Stack competitiveness · Signal level</span>
                </div>
                ${ciScorePill(ms.marketSignalScore)}
            </div>
            <div class="ci-panel-body">
                <div class="ci-stat-row">
                    ${ciStatBar('Brand Strength', ms.brandStrengthScore)}
                    ${ciStatBar('Stack Competitiveness', ms.stackCompetitivenessScore)}
                    ${ciStatBar('Seniority Signal', ms.senioritySignalStrength)}
                    ${ciStatBar('Impact Signal', ms.impactSignalStrength)}
                </div>
                ${ms.signals && ms.signals.length > 0 ? `
                <div class="ci-findings">
                    ${ms.signals.map(s => `
                        <div class="ci-finding-item ${s.type === 'positive' ? 'success' : 'error'}">
                            ${s.type === 'positive' ? '✓' : '⚠'} <b>${s.signal}</b> — ${s.detail}
                        </div>`).join('')}
                </div>` : ''}
            </div>
        </div>`;
    }

    // ─── Growth Trajectory ────────────────────────────────────────────────────
    function renderGrowthTrajectory(gt) {
        if (!gt) return '';
        const riskColor = gt.stagnationRisk === 'High' ? '#ff4757' : gt.stagnationRisk === 'Medium-High' ? '#ff6b6b' : gt.stagnationRisk === 'Medium' ? '#f7971e' : '#00d68f';
        return `
        <div class="ci-new-panel ci-panel-full">
            <div class="ci-panel-header">
                <span class="ci-panel-num">R7</span>
                <div class="ci-panel-title-group">
                    <span class="ci-panel-title">Growth Trajectory Modeling</span>
                    <span class="ci-panel-sub">2-year projection · Stagnation risk · Accelerator levers</span>
                </div>
            </div>
            <div class="ci-panel-body">
                <div class="ci-growth-top">
                    <div class="ci-growth-metric">
                        <div class="ci-growth-val">$${(gt.currentEstimatedValue||0).toLocaleString()}</div>
                        <div class="ci-growth-label">Current Est. Value</div>
                    </div>
                    <div class="ci-growth-arrow">→</div>
                    <div class="ci-growth-metric highlighted">
                        <div class="ci-growth-val green">$${(gt.projected2yrValue||0).toLocaleString()}</div>
                        <div class="ci-growth-label">2-yr Projection</div>
                    </div>
                    <div class="ci-growth-meta">
                        ${ciTag('Projected Level', gt.projectedLevel || '—', 'info')}
                        ${ciTag('Annual Growth', '+' + (gt.annualGrowthRateEstimate||0) + '%', 'success')}
                        ${ciTag('Stagnation Risk', gt.stagnationRisk, gt.riskOfStagnation ? 'error' : 'success')}
                    </div>
                </div>
                ${gt.stagnationReasons && gt.stagnationReasons.length > 0 ? `
                <div class="ci-findings">
                    <div class="ci-findings-label error">Stagnation Risk Factors</div>
                    ${gt.stagnationReasons.map(r => `<div class="ci-finding-item error">⚡ ${r}</div>`).join('')}
                </div>` : ''}
                ${gt.accelerators && gt.accelerators.length > 0 ? `
                <div class="ci-growth-accelerators">
                    <div class="ci-findings-label success">Growth Accelerators</div>
                    <div class="ci-acc-grid">
                        ${gt.accelerators.map(a => `
                            <div class="ci-acc-card">
                                <div class="ci-acc-lever">${a.lever}</div>
                                <div class="ci-acc-action">${a.action}</div>
                                <div class="ci-acc-unlock"><i class="fas fa-unlock"></i> ${a.salaryUnlock}</div>
                            </div>`).join('')}
                    </div>
                </div>` : ''}
            </div>
        </div>`;
    }

    // ─── Improvement Roadmap ──────────────────────────────────────────────────
    function renderImprovementRoadmap(roadmap) {
        if (!roadmap || roadmap.length === 0) return '';
        const priorityColors = { blocking: '#ff4757', high: '#ff6b6b', medium: '#f7971e', low: '#00d68f' };
        return `
        <div class="ci-new-panel ci-panel-full">
            <div class="ci-panel-header">
                <span class="ci-panel-num">R8</span>
                <div class="ci-panel-title-group">
                    <span class="ci-panel-title">Structured Improvement Roadmap</span>
                    <span class="ci-panel-sub">${roadmap.length} phases · Prioritized upskilling path</span>
                </div>
            </div>
            <div class="ci-panel-body">
                <div class="ci-roadmap-phases">
                    ${roadmap.map(phase => {
                        const pc = priorityColors[phase.priority] || '#4facfe';
                        return `
                        <div class="ci-roadmap-phase" style="border-left-color:${pc}">
                            <div class="ci-roadmap-phase-header">
                                <span class="ci-roadmap-phase-num" style="background:${pc}22; color:${pc}">Phase ${phase.phase}</span>
                                <span class="ci-roadmap-phase-title">${phase.title}</span>
                                <span class="ci-roadmap-phase-dur"><i class="fas fa-clock"></i> ${phase.duration}</span>
                                <span class="ci-priority-badge" style="background:${pc}22;color:${pc}">${phase.priority}</span>
                            </div>
                            <div class="ci-roadmap-items">
                                ${(phase.items||[]).map(item => `
                                    <div class="ci-roadmap-item">
                                        <div class="ci-roadmap-item-skill">${item.skill} <span class="ci-roadmap-weeks">${item.weeks}w</span></div>
                                        <div class="ci-roadmap-item-action">${item.action}</div>
                                        <div class="ci-roadmap-item-proof"><i class="fas fa-check-circle"></i> ${item.proof}</div>
                                    </div>`).join('')}
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        </div>`;
    }

    // ─── Layer panel renderers ────────────────────────────────────────────────
    function renderLayer1Panel(l) {
        return `
        <div class="ci-panel">
            <div class="ci-panel-header">
                <span class="ci-panel-num">01</span>
                <div class="ci-panel-title-group">
                    <span class="ci-panel-title">Market Positioning</span>
                    <span class="ci-panel-sub">Seniority · Role Alignment · Keyword Density</span>
                </div>
                ${ciScorePill(l.roleAlignmentScore)}
            </div>
            <div class="ci-panel-body">
                <div class="ci-stat-row">
                    ${ciStatBar('Role Alignment', l.roleAlignmentScore)}
                    ${ciStatBar('Salary Alignment', l.salaryAlignmentScore)}
                </div>
                <div class="ci-tags-row">
                    ${ciTag('Market Level', l.currentMarketLevel, 'info')}
                    ${ciTag('Competitiveness', l.marketCompetitiveness,
                        l.marketCompetitiveness === 'High' ? 'success' :
                        l.marketCompetitiveness === 'Medium' ? 'warn' : 'error')}
                    ${ciTag('Keyword Density', l.keywordDensity, 'neutral')}
                </div>
                ${l.positioningFlaws.length > 0 ? `
                <div class="ci-findings">
                    <div class="ci-findings-label error">Positioning Flaws</div>
                    ${l.positioningFlaws.map(f => `<div class="ci-finding-item error">⚠ ${f}</div>`).join('')}
                </div>` : ''}
                ${l.strategicObservations.length > 0 ? `
                <div class="ci-findings">
                    <div class="ci-findings-label success">Strengths</div>
                    ${l.strategicObservations.map(o => `<div class="ci-finding-item success">✓ ${o}</div>`).join('')}
                </div>` : ''}
            </div>
        </div>`;
    }

    function renderLayer2Panel(l) {
        return `
        <div class="ci-panel">
            <div class="ci-panel-header">
                <span class="ci-panel-num">02</span>
                <div class="ci-panel-title-group">
                    <span class="ci-panel-title">Skill Depth</span>
                    <span class="ci-panel-sub">Core Skills · Production Evidence · Stack Maturity</span>
                </div>
                ${ciScorePill(l.coreStrengthScore)}
            </div>
            <div class="ci-panel-body">
                <div class="ci-stat-row">
                    ${ciStatBar('Core Strength', l.coreStrengthScore)}
                    ${ciStatBar('Production Evidence', l.productionEvidenceScore)}
                    ${ciStatBar('Cloud / AI Score', l.cloudAndAIScore)}
                </div>
                <div class="ci-tags-row">
                    ${ciTag('Stack Maturity', l.stackMaturityLevel,
                        l.stackMaturityLevel === 'Production-Grade' ? 'success' :
                        l.stackMaturityLevel === 'Intermediate' ? 'warn' : 'neutral')}
                </div>
                <p class="ci-body-note">${l.depthVsBreadthAnalysis}</p>
                ${l.detectedCoreSkills.length > 0 ? `
                <div class="ci-skill-chips">
                    <div class="ci-chips-label">Detected Core Skills</div>
                    <div class="ci-chips">
                        ${l.detectedCoreSkills.map(s => `<span class="ci-chip success">${s}</span>`).join('')}
                    </div>
                </div>` : ''}
                ${l.missingCriticalSkillsForTargetSalary.length > 0 ? `
                <div class="ci-skill-chips">
                    <div class="ci-chips-label">Missing for Target Salary</div>
                    <div class="ci-chips">
                        ${l.missingCriticalSkillsForTargetSalary.map(s => `<span class="ci-chip error">${s}</span>`).join('')}
                    </div>
                </div>` : ''}
                ${l.cloudAIToolsDetected && l.cloudAIToolsDetected.length > 0 ? `
                <div class="ci-skill-chips">
                    <div class="ci-chips-label">Cloud / AI Tools Detected</div>
                    <div class="ci-chips">
                        ${l.cloudAIToolsDetected.map(s => `<span class="ci-chip info">${s}</span>`).join('')}
                    </div>
                </div>` : ''}
            </div>
        </div>`;
    }

    function renderLayer3Panel(l) {
        return `
        <div class="ci-panel">
            <div class="ci-panel-header">
                <span class="ci-panel-num">03</span>
                <div class="ci-panel-title-group">
                    <span class="ci-panel-title">Impact Validation</span>
                    <span class="ci-panel-sub">Metrics · Ownership · Leadership Signals</span>
                </div>
                ${ciScorePill(l.impactScore)}
            </div>
            <div class="ci-panel-body">
                <div class="ci-stat-row">
                    ${ciStatBar('Impact Score', l.impactScore)}
                    ${ciStatBar('Leadership Signals', l.leadershipSignalStrength)}
                </div>
                <div class="ci-tags-row">
                    ${ciTag('Quantified Achievements', l.quantifiedAchievementCount + ' found',
                        l.quantifiedAchievementCount >= 5 ? 'success' :
                        l.quantifiedAchievementCount >= 2 ? 'warn' : 'error')}
                    ${l.scaleReferences.length > 0 ? ciTag('Scale References', l.scaleReferences.join(', '), 'info') : ''}
                </div>
                ${l.topMetricsDetected && l.topMetricsDetected.length > 0 ? `
                <div class="ci-findings">
                    <div class="ci-findings-label success">Metrics Detected</div>
                    ${l.topMetricsDetected.map(m => `<div class="ci-finding-item neutral">"…${m}…"</div>`).join('')}
                </div>` : ''}
                ${l.weakAchievementStatements.length > 0 ? `
                <div class="ci-findings">
                    <div class="ci-findings-label error">Weak Statements to Fix</div>
                    ${l.weakAchievementStatements.map(s => `<div class="ci-finding-item error">"${s.substring(0,100)}…"</div>`).join('')}
                </div>` : ''}
                ${l.improvementGuidelines.length > 0 ? `
                <div class="ci-findings">
                    <div class="ci-findings-label warn">Guidelines</div>
                    ${l.improvementGuidelines.map(g => `<div class="ci-finding-item warn">→ ${g}</div>`).join('')}
                </div>` : ''}
            </div>
        </div>`;
    }

    function renderLayer4Panel(l) {
        return `
        <div class="ci-panel">
            <div class="ci-panel-header">
                <span class="ci-panel-num">04</span>
                <div class="ci-panel-title-group">
                    <span class="ci-panel-title">Architecture Signals</span>
                    <span class="ci-panel-sub">System Design · Scalability · DevOps Maturity</span>
                </div>
                ${ciScorePill(l.architectureExposureScore)}
            </div>
            <div class="ci-panel-body">
                <div class="ci-stat-row">
                    ${ciStatBar('Architecture Exposure', l.architectureExposureScore)}
                    ${ciStatBar('DevOps Score', l.devopsScore)}
                </div>
                <div class="ci-tags-row">
                    ${ciTag('System Design', l.systemDesignMaturity,
                        l.architectureExposureScore >= 65 ? 'success' :
                        l.architectureExposureScore >= 40 ? 'warn' : 'error')}
                    ${ciTag('Scalability', l.scalabilityReadiness,
                        l.scalabilityReadiness === 'Scale-Ready' ? 'success' :
                        l.scalabilityReadiness === 'Scale-Aware' ? 'warn' : 'error')}
                </div>
                ${l.architectureKeywordsFound.length > 0 ? `
                <div class="ci-skill-chips">
                    <div class="ci-chips-label">Architecture Terms Found</div>
                    <div class="ci-chips">
                        ${l.architectureKeywordsFound.map(k => `<span class="ci-chip info">${k}</span>`).join('')}
                    </div>
                </div>` : ''}
                ${l.missingArchitectureSignals.length > 0 ? `
                <div class="ci-skill-chips">
                    <div class="ci-chips-label">High-Value Signals Missing</div>
                    <div class="ci-chips">
                        ${l.missingArchitectureSignals.map(k => `<span class="ci-chip error">${k}</span>`).join('')}
                    </div>
                </div>` : ''}
                ${l.devopsKeywordsFound.length > 0 ? `
                <div class="ci-skill-chips">
                    <div class="ci-chips-label">DevOps / Ops Signals</div>
                    <div class="ci-chips">
                        ${l.devopsKeywordsFound.map(k => `<span class="ci-chip neutral">${k}</span>`).join('')}
                    </div>
                </div>` : ''}
            </div>
        </div>`;
    }

    function renderLayer5Panel(l) {
        const gapColors = {
            'Minimal':     '#00d68f',
            'Moderate':    '#f7971e',
            'Significant': '#ff6b6b',
            'Critical':    '#ff4757',
        };
        const gapColor = gapColors[l.gapSeverity] || '#ff6b6b';
        const gap = l.compensationGapAmount > 0
            ? `-$${l.compensationGapAmount.toLocaleString()}`
            : '✓ On Target';

        return `
        <div class="ci-panel">
            <div class="ci-panel-header">
                <span class="ci-panel-num">05</span>
                <div class="ci-panel-title-group">
                    <span class="ci-panel-title">Compensation Gap</span>
                    <span class="ci-panel-sub">Current Value · Target Gap · Bridge Timeline</span>
                </div>
                ${ciScorePill(l.compensationReadinessScore)}
            </div>
            <div class="ci-panel-body">
                <div class="ci-comp-grid">
                    <div class="ci-comp-cell">
                        <div class="ci-comp-label">Target Salary</div>
                        <div class="ci-comp-value green">$${l.targetSalary.toLocaleString()}</div>
                    </div>
                    <div class="ci-comp-cell">
                        <div class="ci-comp-label">Est. Current Market</div>
                        <div class="ci-comp-value">$${l.estimatedCurrentMarketValue.toLocaleString()}</div>
                    </div>
                    <div class="ci-comp-cell">
                        <div class="ci-comp-label">Gap</div>
                        <div class="ci-comp-value" style="color:${gapColor}">${gap}</div>
                    </div>
                    <div class="ci-comp-cell">
                        <div class="ci-comp-label">Bridge Timeline</div>
                        <div class="ci-comp-value warn">${l.estimatedTimeToBridgeGap}</div>
                    </div>
                </div>
                <div class="ci-tags-row">
                    ${ciTag('Gap Severity', l.gapSeverity,
                        l.gapSeverity === 'Minimal' ? 'success' :
                        l.gapSeverity === 'Moderate' ? 'warn' :
                        l.gapSeverity === 'Significant' ? 'error' : 'critical')}
                    ${ciTag('Required Tier', l.salaryTierRequiredLevel, 'info')}
                </div>
                ${ciStatBar('Compensation Readiness', l.compensationReadinessScore)}
                ${l.blockingFactors.length > 0 ? `
                <div class="ci-findings">
                    <div class="ci-findings-label error">Blocking Factors</div>
                    ${l.blockingFactors.map(b => `<div class="ci-finding-item error">⛔ ${b}</div>`).join('')}
                </div>` : '<div class="ci-finding-item success" style="margin-top:12px">✓ No critical blocking factors identified</div>'}
            </div>
        </div>`;
    }

    function renderLayer6Panel(l) {
        return `
        <div class="ci-reconstruction-panel card">
            <div class="ci-recon-header">
                <span class="ci-panel-num">06</span>
                <div class="ci-panel-title-group">
                    <span class="ci-panel-title">Resume Reconstruction</span>
                    <span class="ci-panel-sub">AI-optimized summary, skills, bullets, and strategic achievements</span>
                </div>
            </div>

            <!-- Optimized Summary -->
            <div class="ci-recon-block">
                <div class="ci-recon-block-title"><i class="fas fa-quote-left"></i> Optimized Professional Summary</div>
                <div class="ci-recon-quote">${l.optimizedProfessionalSummary}</div>
            </div>

            <!-- Skills Section -->
            ${l.optimizedSkillsSection.length > 0 ? `
            <div class="ci-recon-block">
                <div class="ci-recon-block-title"><i class="fas fa-layer-group"></i> Organized Skills Section</div>
                <div class="ci-skills-grid">
                    ${l.optimizedSkillsSection.map(cat => `
                        <div class="ci-skills-cat">
                            <div class="ci-skills-cat-label">${cat.category}</div>
                            <div class="ci-chips">
                                ${cat.skills.map(s => `<span class="ci-chip success">${s}</span>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>` : ''}

            <!-- Bullet Rewrites -->
            ${l.optimizedProjectBullets && l.optimizedProjectBullets.filter(b => b.strengthened).length > 0 ? `
            <div class="ci-recon-block">
                <div class="ci-recon-block-title"><i class="fas fa-edit"></i> Bullet Rewrites (Weak → Strong)</div>
                ${l.optimizedProjectBullets.filter(b => b.strengthened).map(b => `
                    <div class="ci-bullet-pair">
                        <div class="ci-bullet-before"><span class="ci-bullet-badge before">BEFORE</span> ${b.original}</div>
                        <div class="ci-bullet-after"><span class="ci-bullet-badge after">AFTER</span> ${b.improved}</div>
                    </div>
                `).join('')}
            </div>` : ''}

            <!-- Strategic Achievements -->
            ${l.addedStrategicAchievements.length > 0 ? `
            <div class="ci-recon-block">
                <div class="ci-recon-block-title"><i class="fas fa-star"></i> Strategic Achievements to Add</div>
                <div class="ci-achievements-list">
                    ${l.addedStrategicAchievements.map(a => `<div class="ci-achievement-item">${a}</div>`).join('')}
                </div>
            </div>` : ''}

            <!-- Upgrade Notes -->
            ${l.positioningUpgradeNotes.length > 0 ? `
            <div class="ci-recon-block">
                <div class="ci-recon-block-title"><i class="fas fa-chevron-up"></i> Positioning Upgrade Notes</div>
                <div class="ci-upgrade-notes">
                    ${l.positioningUpgradeNotes.map(n => `<div class="ci-upgrade-note">→ ${n}</div>`).join('')}
                </div>
            </div>` : ''}
        </div>`;
    }

    // ─── Small UI helpers ─────────────────────────────────────────────────────
    function ciScorePill(score) {
        const color = score >= 70 ? '#00d68f' : score >= 45 ? '#f7971e' : '#ff6b6b';
        return `<div class="ci-score-pill" style="border-color:${color}; color:${color}">${score}</div>`;
    }

    function ciStatBar(label, score) {
        const color = score >= 70 ? '#00d68f' : score >= 45 ? '#f7971e' : '#ff6b6b';
        return `
        <div class="ci-stat-bar-item">
            <div class="ci-stat-bar-label">${label}</div>
            <div class="ci-bar-track">
                <div class="ci-bar-fill" data-score="${score}" style="width:0%; background:${color};"></div>
            </div>
            <div class="ci-stat-bar-val" style="color:${color}">${score}</div>
        </div>`;
    }

    function ciTag(label, value, type) {
        const classes = { success: 'ci-tag-success', warn: 'ci-tag-warn', error: 'ci-tag-error', info: 'ci-tag-info', neutral: 'ci-tag-neutral', critical: 'ci-tag-error' };
        return `<div class="ci-tag ${classes[type] || 'ci-tag-neutral'}"><span class="ci-tag-label">${label}</span><span class="ci-tag-val">${value}</span></div>`;
    }

    function ciMetricBadge(label, value, iconClass, color) {
        return `
        <div class="ci-addon-badge">
            <div class="ci-addon-icon" style="color:${color}"><i class="${iconClass}"></i></div>
            <div class="ci-addon-val" style="color:${color}">${value}</div>
            <div class="ci-addon-label">${label}</div>
        </div>`;
    }

    // ─── Utility ──────────────────────────────────────────────────────────────
    function showNotice(msg, type) {
        if (typeof showFeedback === 'function') {
            showFeedback(msg, type);
            return;
        }
        console.warn('[CI]', msg);
    }

    // ─── Boot ─────────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for app.js page-load hook
    window.CareerIntelligence = { init, activateMode };

})();
