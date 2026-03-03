/**
 * SkillForge — Coder's DNA Dashboard
 * Phase 8: Radar chart, volatility graph, badge display, hiring radar, AI feedback.
 * Depends on Chart.js (loaded via CDN in dna-dashboard.html).
 */

const DNADashboard = (function () {
  'use strict';

  const API      = '/api/coders-dna';
  let radarChart = null;
  let trendChart = null;

  // ─── AUTH ──────────────────────────────────────────────────────────────

  function getToken() {
    // Use AuthHelper if available (it validates token structure)
    if (window.AuthHelper && typeof window.AuthHelper.getToken === 'function') {
      return window.AuthHelper.getToken();
    }
    const t = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!t || t === 'undefined' || t === 'null') return null;
    if (t.split('.').length !== 3) return null;
    return t;
  }

  function redirectToLogin(reason = 'unauthenticated') {
    // Stop any ongoing loading state
    showLoading(false);
    // Redirect to the main app login page
    window.location.href = `index.html?reason=${encodeURIComponent(reason)}`;
  }

  async function apiFetch(path, opts = {}) {
    const token = getToken();

    // Guard: never send a null/undefined Bearer token
    if (!token) {
      redirectToLogin('no_token');
      throw new Error('Not authenticated');
    }

    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(opts.headers || {})
      }
    });

    if (res.status === 401) {
      // Token invalid or expired — clear it and go to login
      if (window.AuthHelper) window.AuthHelper.removeToken();
      else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
      }
      redirectToLogin('session_expired');
      throw new Error('Session expired. Redirecting to login...');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // ─── INIT ──────────────────────────────────────────────────────────────

  async function init() {
    // Auth guard: check token before any API call
    const token = getToken();
    if (!token) {
      showLoading(false);
      showAuthRequired();
      return;
    }

    // Validate token is not expired client-side
    if (window.AuthHelper && !window.AuthHelper.isAuthenticated()) {
      showLoading(false);
      showAuthRequired('Your session has expired.');
      return;
    }

    showLoading(true);
    try {
      const [profileData, hiringData, sessionsData] = await Promise.all([
        apiFetch('/profile'),
        apiFetch('/hiring-radar'),
        apiFetch('/sessions?limit=50')
      ]);

      renderOverallScore(profileData.profile);
      renderRadarChart(profileData.radarData);
      renderIndexBars(profileData.profile);
      renderAnalyticalSummary(profileData.profile.analyticalSummary);
      renderBadges(profileData.badgeCatalog);
      renderHiringRadar(hiringData);
      renderTrendChart(sessionsData.sessions);
      renderWarfareModes();
      showLoading(false);
    } catch (err) {
      showLoading(false);
      // Don't show 401 redirect errors as UI errors — redirect already happened
      if (!err.message.includes('Redirecting to login') && !err.message.includes('Not authenticated')) {
        showError(err.message);
      }
    }
  }

  // ─── OVERALL SCORE ────────────────────────────────────────────────────

  function renderOverallScore(profile) {
    const el = document.getElementById('dna-overall-score');
    if (!el) return;
    el.textContent = profile.overallDNAScore || '—';

    const sessEl = document.getElementById('dna-sessions-count');
    if (sessEl) sessEl.textContent = `${profile.sessionsCounted || 0} sessions`;

    const readEl = document.getElementById('dna-readiness');
    if (readEl) {
      const r = profile.interviewReadiness || 0;
      readEl.textContent = `${r}% interview ready`;
      readEl.style.color = r >= 70 ? 'var(--dna-success)' : r >= 45 ? 'var(--dna-warning)' : 'var(--dna-danger)';
    }
  }

  // ─── RADAR CHART ─────────────────────────────────────────────────────

  function renderRadarChart(radarData) {
    const canvas = document.getElementById('dna-radar-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (radarChart) { radarChart.destroy(); radarChart = null; }

    const ctx = canvas.getContext('2d');
    radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: radarData.labels,
        datasets: [{
          label: 'DNA Profile',
          data: radarData.values,
          backgroundColor: 'rgba(0, 212, 255, 0.12)',
          borderColor:     '#00d4ff',
          borderWidth: 2,
          pointBackgroundColor: '#00d4ff',
          pointBorderColor: '#0a0c10',
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 25,
              display: false
            },
            grid:        { color: 'rgba(30, 37, 53, 0.8)' },
            angleLines:  { color: 'rgba(30, 37, 53, 0.8)' },
            pointLabels: {
              color: '#64748b',
              font: { size: 11, family: "'JetBrains Mono', monospace" }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.raw}/100`
            }
          }
        }
      }
    });
  }

  // ─── INDEX BARS ───────────────────────────────────────────────────────

  const INDEX_KEYS = [
    { key: 'planningDepth',         label: 'Planning Depth' },
    { key: 'stability',             label: 'Stability' },
    { key: 'debugEfficiency',       label: 'Debug Efficiency' },
    { key: 'optimizationReflex',    label: 'Optimization Reflex' },
    { key: 'cognitiveAdaptability', label: 'Adaptability' },
    { key: 'learningVelocity',      label: 'Learning Velocity' }
  ];

  function renderIndexBars(profile) {
    const container = document.getElementById('dna-index-list');
    if (!container) return;

    container.innerHTML = INDEX_KEYS.map(({ key, label }) => {
      const val = profile[key] || 0;
      const tier = val >= 65 ? 'high' : val >= 40 ? 'medium' : 'low';
      return `
        <div class="dna-index-row">
          <span class="dna-index-label">${label}</span>
          <div class="dna-index-bar-wrap">
            <div class="dna-index-bar ${tier}" style="width:${val}%"></div>
          </div>
          <span class="dna-index-val">${val}</span>
        </div>
      `;
    }).join('');

    // Also render volatility
    const volEl = document.getElementById('dna-volatility');
    if (volEl) {
      const v = profile.volatilityIndex || 0;
      volEl.textContent = `σ ${v}%`;
      volEl.style.color = v < 15 ? 'var(--dna-success)' : v < 30 ? 'var(--dna-warning)' : 'var(--dna-danger)';
    }
  }

  // ─── TREND CHART ─────────────────────────────────────────────────────

  function renderTrendChart(sessions) {
    const canvas = document.getElementById('dna-trend-chart');
    if (!canvas || typeof Chart === 'undefined' || !sessions.length) return;

    const sorted   = [...sessions].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const labels   = sorted.map((_, i) => `#${i + 1}`);
    const passData = sorted.map(s => Math.round(s.test_pass_ratio * 100));
    const stabData = sorted.map(s => {
      const bp = Math.min(s.backspace_count, 50) / 50;
      return Math.round((1 - bp) * 100);
    });

    if (trendChart) { trendChart.destroy(); trendChart = null; }

    const ctx = canvas.getContext('2d');
    trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Pass Rate %',
            data: passData,
            borderColor: '#00d4ff',
            backgroundColor: 'rgba(0,212,255,0.06)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5
          },
          {
            label: 'Stability %',
            data: stabData,
            borderColor: '#7c4dff',
            backgroundColor: 'rgba(124,77,255,0.06)',
            borderWidth: 2,
            tension: 0.3,
            fill: false,
            pointRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        scales: {
          x: {
            ticks: { color: '#64748b', font: { size: 9 } },
            grid:  { color: 'rgba(30,37,53,0.6)' }
          },
          y: {
            min: 0,
            max: 100,
            ticks: { color: '#64748b', font: { size: 9 } },
            grid:  { color: 'rgba(30,37,53,0.6)' }
          }
        },
        plugins: {
          legend: {
            labels: { color: '#64748b', font: { size: 10 }, boxWidth: 12 }
          }
        }
      }
    });
  }

  // ─── ANALYTICAL SUMMARY ──────────────────────────────────────────────

  function renderAnalyticalSummary(lines = []) {
    const el = document.getElementById('dna-summary-list');
    if (!el) return;
    if (!lines.length) {
      el.innerHTML = '<li>Solve more problems to generate behavioral analysis.</li>';
      return;
    }
    el.innerHTML = lines.map(l => `<li>${l}</li>`).join('');
  }

  // ─── BADGE SVG EMBLEMS (3D Metallic Shield Architecture) ────────────────

  // Unique suffix for gradient IDs to prevent cross-badge SVG collisions
  function _bid() { return (++_bid._n).toString(36); }
  _bid._n = 0;

  // 3D metallic shield factory — called by each badge function
  function _shield(rimTop, rimMid, rimDark, bodyLight, bodyDark, accentColor, emblem, laurelColor) {
    const n = _bid();
    const laurel = laurelColor ? `
      <g opacity="0.9">
        <ellipse cx="16" cy="68" rx="5.5" ry="3" fill="${laurelColor}" transform="rotate(-38 16 68)"/>
        <ellipse cx="14" cy="60" rx="5" ry="2.8" fill="${laurelColor}" transform="rotate(-28 14 60)"/>
        <ellipse cx="14" cy="52" rx="4.5" ry="2.5" fill="${laurelColor}" transform="rotate(-15 14 52)"/>
        <ellipse cx="16" cy="44" rx="4" ry="2.2" fill="${laurelColor}" transform="rotate(-5 16 44)"/>
      </g>
      <g opacity="0.9">
        <ellipse cx="64" cy="68" rx="5.5" ry="3" fill="${laurelColor}" transform="rotate(38 64 68)"/>
        <ellipse cx="66" cy="60" rx="5" ry="2.8" fill="${laurelColor}" transform="rotate(28 66 60)"/>
        <ellipse cx="66" cy="52" rx="4.5" ry="2.5" fill="${laurelColor}" transform="rotate(15 66 52)"/>
        <ellipse cx="64" cy="44" rx="4" ry="2.2" fill="${laurelColor}" transform="rotate(5 64 44)"/>
      </g>` : '';
    return `<svg viewBox="0 0 80 88" xmlns="http://www.w3.org/2000/svg" class="badge-emblem">
  <defs>
    <linearGradient id="rim${n}" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0%" stop-color="${rimTop}"/>
      <stop offset="38%" stop-color="${rimMid}"/>
      <stop offset="100%" stop-color="${rimDark}"/>
    </linearGradient>
    <radialGradient id="body${n}" cx="38%" cy="28%" r="72%">
      <stop offset="0%" stop-color="${bodyLight}"/>
      <stop offset="100%" stop-color="${bodyDark}"/>
    </radialGradient>
    <radialGradient id="spec${n}" cx="30%" cy="20%" r="50%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.22)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
    <radialGradient id="shade${n}" cx="60%" cy="88%" r="55%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.6)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
    <filter id="drop${n}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="rgba(0,0,0,0.85)"/>
    </filter>
    <filter id="glow${n}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  ${laurel}
  <!-- Outer rim (metallic gradient) -->
  <path d="M40 4 L74 18 L74 48 Q74 75 40 86 Q6 75 6 48 L6 18 Z"
    fill="url(#rim${n})" filter="url(#drop${n})"/>
  <!-- Inner shield body -->
  <path d="M40 11 L67 23 L67 48 Q67 70 40 79 Q13 70 13 48 L13 23 Z"
    fill="url(#body${n})"/>
  <!-- Inner bevel accent -->
  <path d="M40 13 L65 25 L65 48 Q65 68 40 77 Q15 68 15 48 L15 25 Z"
    fill="none" stroke="${accentColor}" stroke-width="0.8" stroke-opacity="0.35"/>
  <!-- Emblem content -->
  ${emblem}
  <!-- Specular top-left highlight -->
  <path d="M40 11 L67 23 L67 48 Q67 70 40 79 Q13 70 13 48 L13 23 Z"
    fill="url(#spec${n})" pointer-events="none"/>
  <!-- Bottom depth shadow -->
  <path d="M40 11 L67 23 L67 48 Q67 70 40 79 Q13 70 13 48 L13 23 Z"
    fill="url(#shade${n})" pointer-events="none"/>
  <!-- Rim top highlight stroke -->
  <path d="M40 4 L74 18" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M40 4 L6 18" stroke="rgba(255,255,255,0.22)" stroke-width="0.8" fill="none" stroke-linecap="round"/>
</svg>`;
  }

  // Tier rim configs: [rimTop, rimMid, rimDark, bodyLight, bodyDark, accentHex]
  const T = {
    bronze:   ['#d4843a','#a05420','#4a1e04','#2a0e02','#0a0200','#d47030'],
    silver:   ['#e8e8e8','#a0a0a0','#404040','#282828','#0c0c0c','#c0c0c0'],
    gold:     ['#ffe066','#c89000','#4a3000','#1c1200','#080400','#d4a400'],
    platinum: ['#d0e4ff','#7898c0','#283444','#0c1828','#040810','#88aacc'],
    diamond:  ['#c8f0ff','#50b8e0','#084060','#04182a','#020810','#50c8f0']
  };

  const BADGE_SVG = {

    'initiate': () => _shield(...T.bronze,
      `<polygon points="40,24 52,40 40,62 28,40" fill="#7a1810" stroke="#e03020" stroke-width="1"/>
      <polygon points="40,24 52,40 46,38" fill="#cc2818"/>
      <polygon points="40,24 28,40 34,38" fill="#aa2010"/>
      <polygon points="52,40 40,62 43,52" fill="#601008"/>
      <polygon points="28,40 40,62 37,52" fill="#7a1010"/>
      <circle cx="40" cy="42" r="5" fill="#ff3020" opacity="0.9"/>
      <circle cx="40" cy="42" r="2.5" fill="#fff" opacity="0.85"/>`
    ),

    'pattern-explorer': () => _shield(...T.bronze,
      `<circle cx="40" cy="48" r="17" fill="none" stroke="#4480cc" stroke-width="1.2"/>
      <line x1="40" y1="31" x2="40" y2="65" stroke="#5590dd" stroke-width="1.2"/>
      <line x1="23" y1="48" x2="57" y2="48" stroke="#5590dd" stroke-width="1.2"/>
      <line x1="28" y1="35" x2="52" y2="61" stroke="#4480cc" stroke-width="0.9" stroke-opacity="0.7"/>
      <line x1="52" y1="35" x2="28" y2="61" stroke="#4480cc" stroke-width="0.9" stroke-opacity="0.7"/>
      <circle cx="40" cy="48" r="4.5" fill="#cc2020" stroke="#ff3030" stroke-width="0.8"/>
      <circle cx="40" cy="48" r="2" fill="#fff" opacity="0.9"/>
      <polygon points="40,32 42,37 38,37" fill="#ffd700"/>`
    ),

    'structured-thinker': () => _shield(...T.silver,
      `<polygon points="40,25 55,47 40,60 25,47" fill="#120808" stroke="#cc2020" stroke-width="1.2"/>
      <polygon points="40,30 51,47 40,56 29,47" fill="#200c0c" stroke="#ee3030" stroke-width="0.8"/>
      <polygon points="40,35 46,47 34,47" fill="#ee3030" opacity="0.8"/>
      <circle cx="40" cy="25" r="2" fill="#cc2020"/>
      <circle cx="55" cy="47" r="2" fill="#cc2020"/>
      <circle cx="40" cy="60" r="2" fill="#cc2020"/>
      <circle cx="25" cy="47" r="2" fill="#cc2020"/>
      <circle cx="40" cy="42" r="3" fill="#ff4040" opacity="0.9"/>
      <circle cx="40" cy="42" r="1.5" fill="#fff" opacity="0.85"/>`
    ),

    'debug-apprentice': () => _shield(...T.bronze,
      `<ellipse cx="40" cy="50" rx="12" ry="9" fill="#1a0400" stroke="#cc1818" stroke-width="1"/>
      <ellipse cx="40" cy="42" rx="9" ry="8" fill="#200604" stroke="#cc1818" stroke-width="1"/>
      <line x1="31" y1="40" x2="24" y2="33" stroke="#882020" stroke-width="1.4"/>
      <line x1="49" y1="40" x2="56" y2="33" stroke="#882020" stroke-width="1.4"/>
      <line x1="29" y1="46" x2="21" y2="46" stroke="#882020" stroke-width="1.4"/>
      <line x1="51" y1="46" x2="59" y2="46" stroke="#882020" stroke-width="1.4"/>
      <line x1="31" y1="52" x2="25" y2="59" stroke="#882020" stroke-width="1.4"/>
      <line x1="49" y1="52" x2="55" y2="59" stroke="#882020" stroke-width="1.4"/>
      <circle cx="36" cy="40" r="3" fill="#ff2020"/>
      <circle cx="44" cy="40" r="3" fill="#ff2020"/>
      <circle cx="35.5" cy="39.5" r="1.2" fill="#ffaa00"/>
      <circle cx="43.5" cy="39.5" r="1.2" fill="#ffaa00"/>`
    ),

    'consistent-builder': () => _shield(...T.silver,
      `<!-- wrench handle -->
      <rect x="37" y="44" width="6" height="22" rx="2" fill="#686868" stroke="#a0a0a0" stroke-width="0.8" transform="rotate(-25 40 55)"/>
      <!-- wrench head -->
      <ellipse cx="29" cy="34" rx="7" ry="5" fill="#505050" stroke="#909090" stroke-width="1" transform="rotate(-25 29 34)"/>
      <ellipse cx="29" cy="34" rx="4" ry="2.5" fill="#242424" transform="rotate(-25 29 34)"/>
      <!-- hammer handle -->
      <rect x="37" y="44" width="6" height="22" rx="2" fill="#606060" stroke="#949494" stroke-width="0.8" transform="rotate(25 40 55)"/>
      <!-- hammer head -->
      <rect x="50" y="26" width="14" height="10" rx="2" fill="#585860" stroke="#9898a8" stroke-width="1"/>
      <!-- cross bolt center -->
      <circle cx="40" cy="54" r="4.5" fill="#cc2020" stroke="#ff3030" stroke-width="0.8"/>
      <circle cx="40" cy="54" r="2" fill="#ff4040"/>`
    ),

    'strategic-planner': () => _shield(...T.gold,
      `<!-- chess knight (simplified head profile) -->
      <path d="M33,64 L47,64 L47,62 L45,57 L49,50 L48,43 L43,36 L40,30 L37,30 L33,36 L32,44 L35,52 L33,57 Z"
        fill="#1c1400" stroke="#c8a000" stroke-width="1"/>
      <path d="M37,30 L40,26 L43,30 L42,36 L40,34 L38,36 Z" fill="#c8a000" opacity="0.9"/>
      <path d="M33,36 L37,36 L37,42 L33,42 Z" fill="#a88000" opacity="0.7"/>
      <circle cx="44" cy="39" r="2.5" fill="#cc8800"/>
      <circle cx="44" cy="39" r="1.2" fill="#ff2020"/>
      <rect x="30" y="62" width="20" height="3" rx="1" fill="#aa8800"/>`
    ),

    'rapid-debugger': () => _shield(...T.silver,
      `<!-- armored beetle mask -->
      <ellipse cx="40" cy="50" rx="13" ry="11" fill="#220840" stroke="#9944ee" stroke-width="1.2"/>
      <!-- horns -->
      <path d="M35,38 L32,25 L36,28 L38,38" fill="#381260" stroke="#9944ee" stroke-width="0.8"/>
      <path d="M45,38 L48,25 L44,28 L42,38" fill="#381260" stroke="#9944ee" stroke-width="0.8"/>
      <!-- center spine -->
      <ellipse cx="40" cy="49" rx="8" ry="7" fill="#2e0a52" stroke="#bb66ff" stroke-width="0.8"/>
      <line x1="40" y1="40" x2="40" y2="60" stroke="#9944ee" stroke-width="0.9"/>
      <!-- lightning bolts -->
      <path d="M24,28 L28,39 L24,41 L30,54" stroke="#ffee00" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M56,28 L52,39 L56,41 L50,54" stroke="#ffee00" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <!-- eyes -->
      <circle cx="36" cy="45" r="3.5" fill="#7700cc"/>
      <circle cx="44" cy="45" r="3.5" fill="#7700cc"/>
      <circle cx="36" cy="45" r="2" fill="#cc88ff"/>
      <circle cx="44" cy="45" r="2" fill="#cc88ff"/>`
    ),

    'optimization-seeker': () => _shield(...T.gold,
      `<!-- Rising bar chart -->
      <rect x="20" y="60" width="8" height="14" rx="1" fill="#886600" opacity="0.85"/>
      <rect x="30" y="53" width="8" height="21" rx="1" fill="#aa8800"/>
      <rect x="40" y="44" width="8" height="30" rx="1" fill="#cc9900"/>
      <rect x="50" y="36" width="8" height="38" rx="1" fill="#ffaa00"/>
      <!-- Top bar highlight -->
      <rect x="50" y="36" width="8" height="4" rx="1" fill="rgba(255,255,255,0.25)"/>
      <!-- Arrow up -->
      <polygon points="54,24 48,34 60,34" fill="#ffd700"/>
      <rect x="52" y="32" width="4" height="8" fill="#ffd700"/>
      <!-- Baseline -->
      <line x1="18" y1="74" x2="60" y2="74" stroke="#aa8800" stroke-width="1.2"/>`
    ),

    'edge-case-hunter': () => _shield(...T.silver,
      `<!-- Giant glowing eye -->
      <ellipse cx="40" cy="50" rx="17" ry="11" fill="#1a0008" stroke="#cc0030" stroke-width="1.4"/>
      <ellipse cx="40" cy="50" rx="12" ry="8" fill="#320010" stroke="#ee1040" stroke-width="1"/>
      <ellipse cx="40" cy="50" rx="8.5" ry="6" fill="#880020"/>
      <ellipse cx="40" cy="50" rx="5.5" ry="6.5" fill="#080002"/>
      <circle cx="40" cy="50" r="3" fill="#ff0030" opacity="0.9"/>
      <circle cx="37.5" cy="47" r="1.5" fill="#fff" opacity="0.9"/>
      <path d="M23,50 Q40,38 57,50" stroke="#881020" stroke-width="1" fill="none"/>
      <path d="M23,50 Q40,62 57,50" stroke="#661018" stroke-width="1" fill="none"/>`
    ),

    'adaptive-solver': () => _shield(...T.gold,
      `<!-- 3D cube fragments reassembling -->
      <polygon points="40,27 56,27 62,37 46,37" fill="#0a1c38" stroke="#4488cc" stroke-width="0.9"/>
      <polygon points="34,34 40,27 40,47 34,54" fill="#0c2448" stroke="#4488cc" stroke-width="0.9"/>
      <polygon points="40,47 56,47 62,37 46,37" fill="#122c58" stroke="#66aaee" stroke-width="1"/>
      <!-- fragment top-right drifting -->
      <polygon points="58,24 66,28 64,36 56,32" fill="#1a3468" stroke="#88ccff" stroke-width="0.8" opacity="0.75"/>
      <!-- fragment bottom-left -->
      <polygon points="22,52 30,48 28,58 20,58" fill="#1a3468" stroke="#88ccff" stroke-width="0.8" opacity="0.65"/>
      <!-- core glow orb -->
      <circle cx="46" cy="40" r="5" fill="#3366ff" opacity="0.9"/>
      <circle cx="46" cy="40" r="2.5" fill="#aaddff"/>`
    ),

    'algorithmic-engineer': () => _shield(...T.gold,
      `<!-- Circuit board with glowing nodes -->
      <rect x="22" y="30" width="36" height="36" rx="2" fill="#021808" stroke="#009933" stroke-width="1"/>
      <line x1="22" y1="40" x2="58" y2="40" stroke="#009933" stroke-width="0.7" stroke-opacity="0.6"/>
      <line x1="22" y1="50" x2="58" y2="50" stroke="#009933" stroke-width="0.7" stroke-opacity="0.6"/>
      <line x1="22" y1="60" x2="58" y2="60" stroke="#009933" stroke-width="0.7" stroke-opacity="0.6"/>
      <line x1="34" y1="30" x2="34" y2="66" stroke="#009933" stroke-width="0.7" stroke-opacity="0.5"/>
      <line x1="46" y1="30" x2="46" y2="66" stroke="#009933" stroke-width="0.7" stroke-opacity="0.5"/>
      <!-- nodes -->
      <circle cx="34" cy="40" r="3" fill="#00cc44"/>
      <circle cx="46" cy="40" r="3" fill="#00cc44"/>
      <circle cx="34" cy="60" r="3" fill="#00cc44"/>
      <circle cx="46" cy="60" r="3" fill="#00cc44"/>
      <circle cx="40" cy="50" r="4.5" fill="#00ff66"/>
      <circle cx="40" cy="50" r="2.2" fill="#fff"/>
      <!-- IC chip overlay -->
      <rect x="35" y="44" width="10" height="12" rx="1.5" fill="#021808" stroke="#00cc44" stroke-width="0.9"/>`
    ),

    'systems-thinker': () => _shield(...T.silver,
      `<!-- Atomic orbital model -->
      <circle cx="40" cy="50" r="5.5" fill="#881818" stroke="#ff3030" stroke-width="1.2"/>
      <circle cx="40" cy="50" r="3" fill="#ff2020"/>
      <circle cx="40" cy="50" r="1.5" fill="#fff" opacity="0.85"/>
      <!-- 3 orbits -->
      <ellipse cx="40" cy="50" rx="18" ry="7" fill="none" stroke="#cc2020" stroke-width="1.2"/>
      <ellipse cx="40" cy="50" rx="18" ry="7" fill="none" stroke="#aa2020" stroke-width="1"
        transform="rotate(60 40 50)"/>
      <ellipse cx="40" cy="50" rx="18" ry="7" fill="none" stroke="#aa2020" stroke-width="1"
        transform="rotate(120 40 50)"/>
      <!-- electron dots -->
      <circle cx="58" cy="50" r="2.2" fill="#ff4040"/>
      <circle cx="31" cy="36" r="2.2" fill="#ff4040"/>
      <circle cx="31" cy="64" r="2.2" fill="#ff4040"/>`
    ),

    'cognitive-stable': () => _shield(...T.platinum,
      `<!-- Temple pillars with brain -->
      <rect x="21" y="46" width="5" height="22" rx="1" fill="#7888a8"/>
      <rect x="30" y="46" width="5" height="22" rx="1" fill="#8898b8"/>
      <rect x="39" y="46" width="5" height="22" rx="1" fill="#9aaacf"/>
      <rect x="48" y="46" width="5" height="22" rx="1" fill="#8898b8"/>
      <rect x="57" y="46" width="5" height="22" rx="1" fill="#7888a8"/>
      <!-- entablature -->
      <rect x="18" y="42" width="47" height="5" rx="1" fill="#9aaccc"/>
      <rect x="16" y="67" width="51" height="3.5" rx="1" fill="#8898b8"/>
      <!-- pediment -->
      <polygon points="40,27 67,42 13,42" fill="#6878a0" stroke="#9aaccc" stroke-width="0.8"/>
      <!-- brain glow in pediment -->
      <path d="M35,33 Q33,29 37,27 Q40,25 43,27 Q47,29 45,33 Q49,35 47,38 Q43,40 40,38 Q37,40 33,38 Q31,35 35,33 Z"
        fill="#cc1818" opacity="0.88"/>
      <circle cx="40" cy="33" r="2" fill="#ff3030" opacity="0.9"/>`
    ),

    'architect': () => _shield(...T.gold,
      `<!-- Elite temple with 5 columns -->
      <rect x="17" y="65" width="46" height="5" rx="1" fill="#aa8800"/>
      <rect x="19" y="61" width="42" height="5" rx="1" fill="#bb9900"/>
      <rect x="22" y="42" width="5" height="20" rx="1" fill="#886600"/>
      <rect x="30" y="42" width="5" height="20" rx="1" fill="#aa8800"/>
      <rect x="38" y="42" width="5" height="20" rx="1" fill="#ccaa00"/>
      <rect x="46" y="42" width="5" height="20" rx="1" fill="#aa8800"/>
      <rect x="54" y="42" width="5" height="20" rx="1" fill="#886600"/>
      <rect x="20" y="37" width="41" height="6" rx="1" fill="#ccaa00"/>
      <polygon points="40,23 62,37 18,37" fill="#aa8800" stroke="#eecc00" stroke-width="0.9"/>
      <!-- pediment star -->
      <polygon points="40,26 42,32 48,32 43,36 45,42 40,38 35,42 37,36 32,32 38,32"
        fill="#ffd700"/>`
    , '#c8a000'),

    'grandmaster': () => _shield(...T.diamond,
      `<!-- DNA double helix -->
      <path d="M33,67 Q46,59 33,49 Q20,39 33,29" fill="none" stroke="#ffd700" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M47,67 Q34,59 47,49 Q60,39 47,29" fill="none" stroke="#9944ff" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Rungs -->
      <line x1="33" y1="62" x2="47" y2="62" stroke="#ffd700" stroke-width="1.6" stroke-opacity="0.85"/>
      <line x1="35" y1="56" x2="45" y2="56" stroke="#bb66ff" stroke-width="1.6" stroke-opacity="0.85"/>
      <line x1="33" y1="49" x2="47" y2="49" stroke="#ffd700" stroke-width="1.6" stroke-opacity="0.85"/>
      <line x1="35" y1="42" x2="45" y2="42" stroke="#bb66ff" stroke-width="1.6" stroke-opacity="0.85"/>
      <line x1="33" y1="35" x2="47" y2="35" stroke="#ffd700" stroke-width="1.6" stroke-opacity="0.85"/>`
    , '#c8a000'),
  };

  function getBadgeSVG(badgeId, badgeName) {
    const key = (badgeId || badgeName || '').toLowerCase();
    if (/initiate/.test(key))                return BADGE_SVG['initiate']();
    if (/pattern|explorer/.test(key))        return BADGE_SVG['pattern-explorer']();
    if (/struct|think/.test(key))            return BADGE_SVG['structured-thinker']();
    if (/debug.*app|apprentice/.test(key))   return BADGE_SVG['debug-apprentice']();
    if (/build|consistent/.test(key))        return BADGE_SVG['consistent-builder']();
    if (/plan|strategic/.test(key))          return BADGE_SVG['strategic-planner']();
    if (/rapid|debug/.test(key))             return BADGE_SVG['rapid-debugger']();
    if (/optim/.test(key))                   return BADGE_SVG['optimization-seeker']();
    if (/edge|hunt/.test(key))               return BADGE_SVG['edge-case-hunter']();
    if (/adapt|solver/.test(key))            return BADGE_SVG['adaptive-solver']();
    if (/algo|engineer/.test(key))           return BADGE_SVG['algorithmic-engineer']();
    if (/system/.test(key))                  return BADGE_SVG['systems-thinker']();
    if (/cogni|stable/.test(key))            return BADGE_SVG['cognitive-stable']();
    if (/architect/.test(key))               return BADGE_SVG['architect']();
    if (/grand|master|dna/.test(key))        return BADGE_SVG['grandmaster']();
    return BADGE_SVG['initiate']();
  }

  // ─── BADGES ──────────────────────────────────────────────────────────

  function renderBadges(catalog = []) {
    const grid = document.getElementById('dna-badge-grid');
    if (!grid) return;

    if (!catalog.length) {
      grid.innerHTML = '<div class="dna-empty"><span class="empty-icon">🏅</span><p>Complete sessions to unlock badges.</p></div>';
      return;
    }

    const tierGlowColors = {
      bronze:'rgba(205,100,30,0.65)', silver:'rgba(180,180,180,0.55)',
      gold:'rgba(255,200,0,0.65)', platinum:'rgba(180,210,255,0.55)', diamond:'rgba(100,210,255,0.75)'
    };
    grid.innerHTML = catalog.map((b, i) => {
      const badgeJson = JSON.stringify(b).replace(/"/g, '&quot;');
      return `
      <div class="dna-badge-item ${b.unlocked ? 'unlocked' : 'locked'} tier-${b.tier || 'bronze'}"
           style="animation-delay:${i * 0.05}s"
           title="Double-click for 3D view"
           data-badge="${badgeJson}"
           ondblclick="window.Badge3DViewer&&Badge3DViewer.open(JSON.parse(this.dataset.badge))"
           ${b.unlocked ? `onclick="DNADashboard.previewBadge(JSON.parse(this.dataset.badge))"` : ''}>
        <div class="badge-glow" style="background:radial-gradient(circle, ${tierGlowColors[b.tier]||tierGlowColors.bronze} 0%, transparent 70%)"></div>
        <div class="badge-pulse-ring"></div>
        ${getBadgeSVG(b.id, b.name)}
        <span class="badge-name">${b.name}</span>
        <span class="badge-tier">${b.tier || 'bronze'}</span>
        <span class="badge-desc">${b.unlocked ? (b.description || '') : '???'}</span>
      </div>`;
    }).join('');
  }

  // ─── UNLOCK CINEMATIC ─────────────────────────────────────────────────

  function triggerUnlockCinematic(badge) {
    // Remove existing overlay
    const existing = document.getElementById('dna-unlock-overlay');
    if (existing) existing.remove();

    const tierColors = {
      bronze:   { glow: '#cd7f32', text: '#e09040', bg: '#2a1a0a' },
      silver:   { glow: '#c0c0c0', text: '#d0d0d0', bg: '#181c28' },
      gold:     { glow: '#ffd700', text: '#ffd700', bg: '#201a00' },
      platinum: { glow: '#e0e0e0', text: '#e5e5e5', bg: '#141e2e' },
      diamond:  { glow: '#89cff0', text: '#89cff0', bg: '#091422' }
    };
    const tc = tierColors[badge.tier] || tierColors.gold;

    // Ember positions
    const embers = Array.from({length: 12}, (_, i) => {
      const left = 20 + Math.random() * 60;
      const delay = (Math.random() * 1.5).toFixed(2);
      const dur   = (1.2 + Math.random() * 1.2).toFixed(2);
      const dx    = (-20 + Math.random() * 40).toFixed(0);
      return `<div class="dna-ember" style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;--dx:${dx}px;background:${tc.glow};box-shadow:0 0 4px ${tc.glow}"></div>`;
    }).join('');

    const el = document.createElement('div');
    el.id = 'dna-unlock-overlay';
    el.innerHTML = `
      <div class="dna-unlock-embers">${embers}</div>
      <div class="dna-unlock-title">New Achievement Unlocked</div>
      <div class="dna-unlock-badge-wrap">
        <div class="dna-unlock-burst" style="background:radial-gradient(circle,${tc.glow}60 0%,transparent 70%)"></div>
        ${getBadgeSVG(badge.id, badge.name)}
      </div>
      <div class="dna-unlock-name" style="color:${tc.text};text-shadow:0 0 30px ${tc.glow}80,0 0 60px ${tc.glow}40">
        ${badge.name}
      </div>
      <div class="dna-unlock-desc">${badge.description || ''}</div>
      <div class="dna-unlock-tier-badge" style="color:${tc.text};border-color:${tc.glow}60;background:${tc.bg}">
        ${badge.tier.toUpperCase()} TIER
      </div>
      <div class="dna-unlock-close-hint">click anywhere to close</div>`;

    document.body.appendChild(el);
    el.classList.add('closing');

    // Close on click or after 4s
    const close = () => { el.style.animation = 'unlock-overlay-out 0.4s ease forwards'; setTimeout(() => el.remove(), 400); };
    el.addEventListener('click', close);
    setTimeout(close, 4000);
  }

  function previewBadge(badgeJson) {
    try {
      const badge = typeof badgeJson === 'string' ? JSON.parse(badgeJson) : badgeJson;
      triggerUnlockCinematic(badge);
    } catch(e) {}
  }


  // ─── HIRING RADAR ─────────────────────────────────────────────────────

  function renderHiringRadar(data) {
    const grid = document.getElementById('dna-hiring-grid');
    if (!grid) return;

    const cells = [
      { label: 'Hiring Score',        value: data.hiringRadarScore,   sub: '/100' },
      { label: 'Reliability Index',   value: data.reliabilityIndex,   sub: '% consistent' },
      { label: 'Pressure Resilience', value: data.pressureResilience, sub: '/100' },
      { label: 'Interview Readiness', value: data.interviewReadiness, sub: '%' },
      { label: 'Sessions',            value: data.sessionsCounted,    sub: 'completed' },
      { label: 'Badges',              value: data.badgeCount,         sub: 'unlocked' }
    ];

    grid.innerHTML = cells.map(c => `
      <div class="dna-hiring-cell">
        <span class="cell-label">${c.label}</span>
        <span class="cell-value">${c.value ?? '—'}</span>
        <span class="cell-sub">${c.sub}</span>
      </div>
    `).join('');

    // Strength zones
    const strengths = document.getElementById('dna-strength-zones');
    if (strengths && data.strengthZones?.length) {
      strengths.textContent = data.strengthZones.join(' · ');
    }

    // Strategic summary
    const summary = document.getElementById('dna-hiring-summary');
    if (summary && data.analyticalSummary?.length) {
      summary.textContent = data.analyticalSummary[0] || '';
    }
  }

  // ─── WARFARE MODES ────────────────────────────────────────────────────

  async function renderWarfareModes() {
    const grid = document.getElementById('dna-warfare-grid');
    if (!grid) return;
    try {
      const data = await apiFetch('/warfare-modes');
      grid.innerHTML = data.modes.map(m => `
        <div class="dna-warfare-card" data-mode="${m.id}"
             onclick="DNADashboard.selectWarfareMode('${m.id}', this)">
          <div class="wf-icon">${m.icon}</div>
          <div class="wf-name">${m.name}</div>
          <div class="wf-desc">${m.description}</div>
          <div class="wf-bonus">Score bonus ${m.scoreBonus}</div>
        </div>
      `).join('');
    } catch { /**/ }
  }

  let selectedWarfareMode = null;

  function selectWarfareMode(mode, el) {
    selectedWarfareMode = mode;
    document.querySelectorAll('.dna-warfare-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
  }

  // ─── AI FEEDBACK PANEL ────────────────────────────────────────────────

  async function loadAIFeedback(code = '', telemetry = {}) {
    const panel = document.getElementById('dna-ai-feedback');
    if (!panel) return;

    panel.innerHTML = '<div class="dna-loading"><div class="dna-spinner"></div> Analyzing...</div>';

    try {
      const data = await apiFetch('/ai-feedback', {
        method: 'POST',
        body: JSON.stringify({ code, telemetry })
      });
      const f = data.feedback;
      panel.innerHTML = `
        <div class="dna-summary-list" style="margin-bottom:1rem">
          <h4 style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--dna-text-muted);margin-bottom:0.5rem">Behavioral Signals</h4>
          ${f.behavioralSignals.length
            ? f.behavioralSignals.map(s => `<div style="padding:0.5rem;background:var(--dna-surface2);border-left:3px solid var(--dna-warning);font-size:0.78rem;color:var(--dna-text-muted);margin-bottom:0.4rem;">${s}</div>`).join('')
            : '<div style="font-size:0.78rem;color:var(--dna-text-muted)">No significant behavioral concerns detected.</div>'
          }
        </div>
        <div style="margin-bottom:1rem">
          <h4 style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--dna-text-muted);margin-bottom:0.5rem">Code Analysis</h4>
          <div style="font-size:0.78rem;color:var(--dna-text-muted)">Detected complexity: <strong style="color:var(--dna-accent)">${f.codeStructure.detectedComplexity}</strong></div>
          ${f.codeStructure.issues.map(i => `<div style="margin-top:0.4rem;padding:0.5rem;background:var(--dna-surface2);border-left:3px solid var(--dna-danger);font-size:0.78rem;color:var(--dna-text-muted);">${i}</div>`).join('') || ''}
        </div>
        <div>
          <h4 style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--dna-text-muted);margin-bottom:0.5rem">Optimization Paths</h4>
          ${f.optimizationSuggestions.map(s => `<div style="margin-top:0.4rem;padding:0.5rem;background:var(--dna-surface2);border-left:3px solid var(--dna-success);font-size:0.78rem;color:var(--dna-text-muted);">${s}</div>`).join('') || '<div style="font-size:0.78rem;color:var(--dna-text-muted)">No additional optimizations identified.</div>'}
        </div>
        <div style="margin-top:1rem;padding:0.8rem;background:var(--dna-surface2);border-radius:4px;border:1px solid var(--dna-border)">
          <span style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--dna-text-muted)">Interview Readiness: </span>
          <strong style="color:${f.interviewReadinessScore >= 70 ? 'var(--dna-success)' : f.interviewReadinessScore >= 45 ? 'var(--dna-warning)' : 'var(--dna-danger)'};font-size:0.88rem;">${f.interviewReadinessLabel}</strong>
        </div>
      `;
    } catch (err) {
      panel.innerHTML = `<div class="dna-empty"><p>${err.message}</p></div>`;
    }
  }

  // ─── LOADING / ERROR ─────────────────────────────────────────────────

  function showLoading(show) {
    const el = document.getElementById('dna-loading-overlay');
    if (el) el.style.display = show ? 'flex' : 'none';
  }

  function showError(msg) {
    const el = document.getElementById('dna-error-msg');
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    } else {
      console.error('[DNA Dashboard]', msg);
    }
  }

  function showAuthRequired(message) {
    message = message || '';
    showLoading(false);
    const overlay = document.getElementById('dna-loading-overlay');
    if (overlay) overlay.style.display = 'none';
    const errorEl = document.getElementById('dna-error-msg');
    if (errorEl) errorEl.style.display = 'none';
    const wrapper = document.querySelector('.dna-wrapper') || document.body;
    wrapper.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:80vh;padding:1rem;">
        <div style="background:var(--dna-surface,#111);border:1px solid var(--dna-border,#222);
                    border-radius:8px;padding:2.5rem 2rem;width:100%;max-width:380px;text-align:center;">
          <div style="font-size:2.5rem;margin-bottom:1rem;">&#x1F9EC;</div>
          <h2 style="color:var(--dna-text,#e0e0e0);font-size:1.1rem;margin:0 0 0.4rem;">Coder's DNA</h2>
          <p style="color:var(--dna-text-muted,#666);font-size:0.8rem;margin:0 0 1.8rem;">
            ${message || 'Sign in to access your behavioral profile.'}
          </p>
          <form id="dna-login-form" onsubmit="DNADashboard.handleLogin(event)" autocomplete="on">
            <div style="margin-bottom:0.9rem;text-align:left;">
              <label style="display:block;font-size:0.72rem;color:var(--dna-text-muted,#666);
                            letter-spacing:0.06em;text-transform:uppercase;margin-bottom:0.35rem;">
                Email
              </label>
              <input id="dna-login-email" type="email" placeholder="you@example.com" required
                style="width:100%;box-sizing:border-box;background:var(--dna-surface2,#1a1a1a);
                       border:1px solid var(--dna-border,#333);border-radius:4px;
                       color:var(--dna-text,#e0e0e0);padding:0.6rem 0.75rem;
                       font-family:inherit;font-size:0.85rem;outline:none;" />
            </div>
            <div style="margin-bottom:1.4rem;text-align:left;">
              <label style="display:block;font-size:0.72rem;color:var(--dna-text-muted,#666);
                            letter-spacing:0.06em;text-transform:uppercase;margin-bottom:0.35rem;">
                Password
              </label>
              <input id="dna-login-password" type="password" placeholder="••••••••" required
                style="width:100%;box-sizing:border-box;background:var(--dna-surface2,#1a1a1a);
                       border:1px solid var(--dna-border,#333);border-radius:4px;
                       color:var(--dna-text,#e0e0e0);padding:0.6rem 0.75rem;
                       font-family:inherit;font-size:0.85rem;outline:none;" />
            </div>
            <div id="dna-login-error"
              style="display:none;color:#ff5555;font-size:0.78rem;margin-bottom:0.9rem;
                     background:rgba(255,85,85,0.08);border:1px solid rgba(255,85,85,0.25);
                     border-radius:4px;padding:0.5rem 0.75rem;text-align:left;"></div>
            <button type="submit" id="dna-login-btn"
              style="width:100%;background:var(--dna-accent,#00e5ff);color:#000;border:none;
                     padding:0.75rem;border-radius:4px;cursor:pointer;font-family:inherit;
                     font-size:0.85rem;font-weight:700;letter-spacing:0.04em;">
              Sign In
            </button>
          </form>
        </div>
      </div>`;
  }

  async function handleLogin(e) {
    e.preventDefault();
    const emailEl  = document.getElementById('dna-login-email');
    const passEl   = document.getElementById('dna-login-password');
    const errEl    = document.getElementById('dna-login-error');
    const btn      = document.getElementById('dna-login-btn');
    const email    = emailEl ? emailEl.value.trim() : '';
    const password = passEl  ? passEl.value : '';

    if (errEl) errEl.style.display = 'none';
    if (btn)   { btn.disabled = true; btn.textContent = 'Signing in…'; }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || 'Login failed');

      const token = data.token;
      if (!token) throw new Error('Server did not return a token');

      // Store token using AuthHelper if available, else raw localStorage
      if (window.AuthHelper && typeof window.AuthHelper.setToken === 'function') {
        window.AuthHelper.setToken(token);
      } else {
        localStorage.setItem('authToken', token);
      }
      if (data.user) localStorage.setItem('userData', JSON.stringify(data.user));

      // Reload the page so the full dashboard HTML is restored and init() runs fresh
      window.location.reload();
    } catch (err) {
      if (btn)  { btn.disabled = false; btn.textContent = 'Sign In'; }
      if (errEl) { errEl.textContent = err.message; errEl.style.display = 'block'; }
    }
  }

  // ─── PUBLIC API ──────────────────────────────────────────────────────

  // Listen for new badge events from the telemetry tracker
  window.addEventListener('dna:updated', (e) => {
    const { newBadgesEarned } = e.detail || {};
    if (newBadgesEarned && newBadgesEarned.length) {
      // Fire cinematic for each new badge sequentially
      newBadgesEarned.forEach((badge, i) => {
        setTimeout(() => triggerUnlockCinematic(badge), i * 4500);
      });
    }
  });

  return {
    init,
    handleLogin,
    previewBadge,
    triggerUnlockCinematic,
    loadAIFeedback,
    selectWarfareMode,
    getSelectedWarfareMode: () => selectedWarfareMode
  };

})();

window.DNADashboard = DNADashboard;

// Auto-init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', DNADashboard.init);
} else {
  DNADashboard.init();
}
