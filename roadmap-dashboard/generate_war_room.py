import os

css_content = """/* =========================================================
   SKILLFORGE WAR ROOM — EXECUTIVE INTERVIEW CENTER
   Apple Executive Center x Formula 1 Race Control x Linear Design
   ========================================================= */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
    --wr-bg: #050505;
    --wr-card: #101010;
    --wr-card-hover: #141414;
    --wr-border: rgba(255, 255, 255, 0.08);
    --wr-border-hover: rgba(255, 77, 79, 0.4);
    --wr-accent: #FF4D4F;
    --wr-accent-glow: rgba(255, 77, 79, 0.25);
    --wr-text: #FFFFFF;
    --wr-text-mut: rgba(255, 255, 255, 0.55);
    --wr-glass: rgba(16, 16, 16, 0.75);
}

#mock-interview-page {
    background-color: var(--wr-bg);
    color: var(--wr-text);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    min-height: 100vh;
    padding: 32px;
    box-sizing: border-box;
    position: relative;
    overflow-x: hidden;
}

/* Background Laser & Grid Effects */
#mock-interview-page::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 600px;
    background: radial-gradient(circle at 50% -10%, rgba(255, 77, 79, 0.15) 0%, rgba(5, 5, 5, 0) 70%);
    pointer-events: none;
    z-index: 0;
}

.wr-container {
    max-width: 1600px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
}

/* ==========================================
   1. HERO SECTION
   ========================================== */
.wr-hero {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 40px;
    background: linear-gradient(135deg, rgba(20, 20, 20, 0.8) 0%, rgba(10, 10, 10, 0.9) 100%);
    border: 1px solid var(--wr-border);
    border-radius: 20px;
    backdrop-filter: blur(20px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    margin-bottom: 36px;
    position: relative;
    overflow: hidden;
}

.wr-hero::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 400px;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 77, 79, 0.04));
    pointer-events: none;
}

.wr-hero-left {
    max-width: 600px;
}

.wr-badge-live {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 77, 79, 0.12);
    border: 1px solid rgba(255, 77, 79, 0.3);
    color: var(--wr-accent);
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 20px;
}

.wr-live-dot {
    width: 8px;
    height: 8px;
    background-color: var(--wr-accent);
    border-radius: 50%;
    box-shadow: 0 0 10px var(--wr-accent);
    animation: wrPulse 1.5s infinite ease-in-out;
}

@keyframes wrPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.5; }
}

.wr-hero-title {
    font-size: 52px;
    font-weight: 800;
    letter-spacing: -2px;
    line-height: 1.05;
    margin: 0 0 12px 0;
    background: linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.7) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.wr-hero-subtitle {
    font-size: 18px;
    color: var(--wr-text-mut);
    margin: 0;
    font-weight: 400;
}

.wr-hero-stats {
    display: flex;
    gap: 36px;
}

.wr-stat-box {
    text-align: right;
    position: relative;
    padding-left: 24px;
    border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.wr-stat-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 36px;
    font-weight: 700;
    color: var(--wr-text);
    line-height: 1;
    margin-bottom: 6px;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
}

.wr-stat-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--wr-text-mut);
    font-weight: 600;
}

/* ==========================================
   LAYOUT GRID (Main + Right Sidebar)
   ========================================== */
.wr-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 32px;
    align-items: start;
}

@media (max-width: 1400px) {
    .wr-layout {
        grid-template-columns: 1fr;
    }
}

/* Section Headers */
.wr-section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.wr-section-title {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: var(--wr-text);
    display: flex;
    align-items: center;
    gap: 10px;
}

.wr-section-title i {
    color: var(--wr-accent);
}

/* ==========================================
   2. INTERVIEW CATEGORIES
   ========================================== */
.wr-categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    margin-bottom: 40px;
}

.wr-cat-card {
    background: var(--wr-card);
    border: 1px solid var(--wr-border);
    border-radius: 16px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
}

.wr-cat-card:hover, .wr-cat-card.active {
    background: var(--wr-card-hover);
    border-color: var(--wr-border-hover);
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 77, 79, 0.15);
}

.wr-cat-card.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: var(--wr-accent);
    box-shadow: 0 0 12px var(--wr-accent);
}

.wr-cat-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;
}

.wr-cat-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: var(--wr-accent);
}

.wr-rec-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    background: rgba(255, 77, 79, 0.15);
    color: var(--wr-accent);
    border: 1px solid rgba(255, 77, 79, 0.3);
}

.wr-cat-title {
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: var(--wr-text);
}

.wr-cat-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 11px;
    color: var(--wr-text-mut);
}

.wr-cat-pill {
    background: rgba(255, 255, 255, 0.05);
    padding: 3px 8px;
    border-radius: 6px;
}

/* ==========================================
   3. COMPANY SELECTION
   ========================================== */
.wr-companies-scroll {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 12px;
    margin-bottom: 40px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.wr-company-card {
    min-width: 200px;
    background: var(--wr-card);
    border: 1px solid var(--wr-border);
    border-radius: 16px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.25s ease;
    flex-shrink: 0;
}

.wr-company-card:hover, .wr-company-card.active {
    border-color: var(--wr-border-hover);
    transform: translateY(-3px);
    background: var(--wr-card-hover);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.wr-company-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
}

.wr-company-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 16px;
    color: #fff;
}

.wr-company-name {
    font-size: 16px;
    font-weight: 700;
}

.wr-company-diff {
    font-size: 12px;
    color: var(--wr-accent);
    font-weight: 600;
    margin-bottom: 6px;
}

.wr-company-style {
    font-size: 11px;
    color: var(--wr-text-mut);
    line-height: 1.4;
}

/* ==========================================
   4. INTERVIEW PERSONAS
   ========================================== */
.wr-personas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
    margin-bottom: 40px;
}

.wr-persona-card {
    background: var(--wr-card);
    border: 1px solid var(--wr-border);
    border-radius: 16px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.25s ease;
    position: relative;
}

.wr-persona-card:hover, .wr-persona-card.active {
    border-color: var(--wr-border-hover);
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 77, 79, 0.05);
}

.wr-persona-top {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 14px;
}

.wr-persona-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.1);
}

.wr-persona-info h4 {
    font-size: 15px;
    font-weight: 700;
    margin: 0 0 4px 0;
}

.wr-persona-info span {
    font-size: 12px;
    color: var(--wr-text-mut);
}

.wr-persona-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.wr-persona-tag {
    font-size: 11px;
    background: rgba(255, 255, 255, 0.05);
    padding: 4px 8px;
    border-radius: 6px;
    color: #ddd;
}

/* ==========================================
   5. INTERVIEW CONFIGURATION PANEL
   ========================================== */
.wr-config-panel {
    background: var(--wr-card);
    border: 1px solid var(--wr-border);
    border-radius: 20px;
    padding: 28px;
    margin-bottom: 40px;
}

.wr-config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
}

.wr-config-item label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--wr-text-mut);
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.wr-pills-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.wr-pill-btn {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--wr-text);
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.wr-pill-btn:hover, .wr-pill-btn.active {
    background: var(--wr-accent);
    color: #fff;
    border-color: var(--wr-accent);
    box-shadow: 0 0 15px var(--wr-accent-glow);
}

/* Switch & Sliders */
.wr-toggle-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.02);
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.wr-toggle-label {
    font-size: 14px;
    font-weight: 600;
}

.wr-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
}

.wr-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.wr-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.15);
    transition: .3s;
    border-radius: 24px;
}

.wr-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .3s;
    border-radius: 50%;
}

input:checked + .wr-slider {
    background-color: var(--wr-accent);
}

input:checked + .wr-slider:before {
    transform: translateX(20px);
}

.wr-range-container {
    padding-top: 6px;
}

.wr-range-input {
    width: 100%;
    accent-color: var(--wr-accent);
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
}

.wr-range-val {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--wr-text-mut);
    margin-top: 6px;
}

/* ==========================================
   6. READY CARD (Cinematic Launchpad)
   ========================================== */
.wr-ready-card {
    background: linear-gradient(145deg, #121212 0%, #0a0a0a 100%);
    border: 1px solid rgba(255, 77, 79, 0.3);
    border-radius: 24px;
    padding: 36px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 77, 79, 0.15);
}

.wr-ready-card::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 77, 79, 0.08) 0%, transparent 60%);
    pointer-events: none;
}

.wr-ready-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 32px;
    align-items: center;
}

@media (max-width: 900px) {
    .wr-ready-grid {
        grid-template-columns: 1fr;
    }
}

.wr-ready-info h3 {
    font-size: 28px;
    font-weight: 800;
    margin: 0 0 16px 0;
    letter-spacing: -1px;
}

.wr-ready-specs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.wr-spec-box {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 14px;
    border-radius: 12px;
}

.wr-spec-box span {
    display: block;
    font-size: 11px;
    color: var(--wr-text-mut);
    text-transform: uppercase;
    margin-bottom: 4px;
}

.wr-spec-box strong {
    font-size: 15px;
    color: #fff;
}

.wr-ready-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 24px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.wr-prob-gauge {
    margin-bottom: 20px;
}

.wr-prob-title {
    font-size: 12px;
    color: var(--wr-text-mut);
    text-transform: uppercase;
    margin-bottom: 8px;
}

.wr-prob-num {
    font-size: 42px;
    font-weight: 800;
    color: #10B981;
    font-family: 'JetBrains Mono', monospace;
    text-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

.wr-start-btn {
    width: 100%;
    background: var(--wr-accent);
    color: #fff;
    border: none;
    padding: 18px 36px;
    font-size: 18px;
    font-weight: 800;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 10px 30px rgba(255, 77, 79, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    letter-spacing: 0.5px;
}

.wr-start-btn:hover {
    transform: scale(1.03) translateY(-2px);
    box-shadow: 0 15px 40px rgba(255, 77, 79, 0.6);
    background: #ff3336;
}

/* ==========================================
   7. RIGHT SIDEBAR (Telemetry & Missions)
   ========================================== */
.wr-sidebar {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.wr-side-card {
    background: var(--wr-card);
    border: 1px solid var(--wr-border);
    border-radius: 18px;
    padding: 22px;
}

.wr-side-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--wr-text);
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.wr-side-title i {
    color: var(--wr-accent);
}

.wr-mission-box {
    background: linear-gradient(135deg, rgba(255, 77, 79, 0.1) 0%, rgba(20, 20, 20, 0.8) 100%);
    border: 1px solid rgba(255, 77, 79, 0.3);
    border-radius: 12px;
    padding: 16px;
}

.wr-mission-box h5 {
    font-size: 14px;
    margin: 0 0 6px 0;
    color: var(--wr-accent);
}

.wr-mission-box p {
    font-size: 13px;
    margin: 0;
    color: #ddd;
    line-height: 1.4;
}

.wr-streak-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.03);
    padding: 12px;
    border-radius: 10px;
    margin-bottom: 12px;
}

.wr-radar-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.wr-radar-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.wr-radar-top {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 600;
}

.wr-radar-progress {
    height: 6px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    overflow: hidden;
}

.wr-radar-fill {
    height: 100%;
    background: var(--wr-accent);
    border-radius: 4px;
}

.wr-recs-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.wr-rec-item {
    display: flex;
    gap: 10px;
    font-size: 12px;
    line-height: 1.4;
    color: #ccc;
    background: rgba(255, 255, 255, 0.02);
    padding: 10px;
    border-radius: 8px;
}

.wr-rec-item i {
    color: #F59E0B;
    margin-top: 2px;
}

.wr-sched-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.wr-sched-item:last-child {
    border-bottom: none;
}

.wr-sched-info h6 {
    font-size: 13px;
    margin: 0 0 4px 0;
    font-weight: 600;
}

.wr-sched-info span {
    font-size: 11px;
    color: var(--wr-text-mut);
}

/* Simulation Modal */
.wr-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(15px);
    z-index: 99999;
    display: none;
    align-items: center;
    justify-content: center;
}

.wr-modal-content {
    background: #0d0d0d;
    border: 1px solid var(--wr-accent);
    border-radius: 20px;
    padding: 40px;
    max-width: 550px;
    width: 90%;
    text-align: center;
    box-shadow: 0 0 60px rgba(255, 77, 79, 0.3);
}
"""

with open("war-room-styles.css", "w", encoding="utf-8") as f:
    f.write(css_content)
print("Created war-room-styles.css")


js_content = """/**
 * SkillForge WAR ROOM — Executive Interview Center
 * 60 FPS Telemetry & Interactive State Engine
 */

(function() {
    'use strict';

    let currentCategory = 'Technical Coding';
    let currentCompany = 'Google';
    let currentPersona = 'Pressure Interviewer';
    let currentDuration = '45m Standard';
    let currentDifficulty = 'Staff / L6';
    let currentSalary = '$380,000 / yr';
    let baseProbability = 87.4;

    function initWarRoom() {
        animateCounters();
        setupEventListeners();
    }

    function animateCounters() {
        const counters = document.querySelectorAll('.wr-stat-num[data-target]');
        counters.forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-target'));
            const prefix = counter.getAttribute('data-prefix') || '';
            const suffix = counter.getAttribute('data-suffix') || '';
            const duration = 1800;
            const start = performance.now();

            function step(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);
                const currentVal = Math.floor(ease * target);
                
                if (target >= 1000) {
                    counter.textContent = prefix + currentVal.toLocaleString() + suffix;
                } else {
                    counter.textContent = prefix + currentVal + suffix;
                }

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    counter.textContent = prefix + target.toLocaleString() + suffix;
                }
            }
            requestAnimationFrame(step);
        });
    }

    function setupEventListeners() {
        // Categories
        document.querySelectorAll('.wr-cat-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.wr-cat-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                currentCategory = card.dataset.cat;
                updateReadyCard();
            });
        });

        // Companies
        document.querySelectorAll('.wr-company-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.wr-company-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                currentCompany = card.dataset.comp;
                baseProbability = parseFloat(card.dataset.prob || 85.0);
                updateReadyCard();
            });
        });

        // Personas
        document.querySelectorAll('.wr-persona-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.wr-persona-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                currentPersona = card.dataset.persona;
                updateReadyCard();
            });
        });

        // Duration Pills
        document.querySelectorAll('.wr-duration-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('.wr-duration-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                currentDuration = pill.textContent;
                updateReadyCard();
            });
        });

        // Difficulty Pills
        document.querySelectorAll('.wr-diff-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('.wr-diff-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                currentDifficulty = pill.textContent;
                updateReadyCard();
            });
        });

        // Salary Slider
        const salarySlider = document.getElementById('wr-salary-slider');
        const salaryVal = document.getElementById('wr-salary-val');
        if (salarySlider && salaryVal) {
            salarySlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                salaryVal.textContent = '$' + val.toLocaleString() + ' / yr';
                currentSalary = '$' + val.toLocaleString() + ' / yr';
            });
        }

        // Start Button
        const startBtn = document.getElementById('wr-start-btn');
        const modal = document.getElementById('wr-simulation-modal');
        if (startBtn && modal) {
            startBtn.addEventListener('click', () => {
                modal.style.display = 'flex';
                let count = 3;
                const counterEl = document.getElementById('wr-countdown-num');
                const statusEl = document.getElementById('wr-countdown-status');
                
                const interval = setInterval(() => {
                    count--;
                    if (count > 0) {
                        counterEl.textContent = count;
                        statusEl.textContent = "SYNCHRONIZING AI AUDIO CHANNELS & EVALUATOR...";
                    } else if (count === 0) {
                        counterEl.textContent = "LAUNCH!";
                        statusEl.textContent = "ENTERED EXECUTIVE WAR ROOM ENVIRONMENT.";
                    } else {
                        clearInterval(interval);
                        modal.style.display = 'none';
                        alert("Connected to SkillForge War Room! Live session running.");
                    }
                }, 1000);
            });
        }
    }

    function updateReadyCard() {
        const titleEl = document.getElementById('wr-ready-summary');
        const compEl = document.getElementById('wr-ready-comp');
        const personaEl = document.getElementById('wr-ready-persona');
        const diffEl = document.getElementById('wr-ready-diff');
        const probEl = document.getElementById('wr-ready-prob');

        if (titleEl) titleEl.textContent = `${currentDuration} • ${currentCategory} Executive Interview`;
        if (compEl) compEl.textContent = currentCompany;
        if (personaEl) personaEl.textContent = currentPersona;
        if (diffEl) diffEl.textContent = currentDifficulty;
        if (probEl) {
            const prob = (baseProbability + (Math.random() * 3 - 1.5)).toFixed(1);
            probEl.textContent = prob + '%';
        }
    }

    document.addEventListener('DOMContentLoaded', initWarRoom);
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initWarRoom, 100);
    }
})();
"""

with open("war-room.js", "w", encoding="utf-8") as f:
    f.write(js_content)
print("Created war-room.js")


html_snippet = """            <!-- 9. MOCK INTERVIEW (THE WAR ROOM) -->
            <section id="mock-interview-page" class="page-view hidden">
                <div class="wr-container">
                    
                    <!-- 1. HERO SECTION -->
                    <div class="wr-hero">
                        <div class="wr-hero-left">
                            <div class="wr-badge-live">
                                <span class="wr-live-dot"></span>
                                <span>Live Executive Race Control</span>
                            </div>
                            <h1 class="wr-hero-title">WAR ROOM</h1>
                            <p class="wr-hero-subtitle">Train like tomorrow is your dream interview. Executive precision, Formula 1 telemetry, zero bias.</p>
                        </div>
                        <div class="wr-hero-stats">
                            <div class="wr-stat-box">
                                <div class="wr-stat-num" data-target="12500">0</div>
                                <div class="wr-stat-label">Interviews Completed</div>
                            </div>
                            <div class="wr-stat-box">
                                <div class="wr-stat-num" data-target="94" data-suffix="%">0%</div>
                                <div class="wr-stat-label">Success Rate</div>
                            </div>
                            <div class="wr-stat-box">
                                <div class="wr-stat-num" data-target="420">0</div>
                                <div class="wr-stat-label">Companies</div>
                            </div>
                            <div class="wr-stat-box">
                                <div class="wr-stat-num" data-target="75">0</div>
                                <div class="wr-stat-label">AI Interviewers</div>
                            </div>
                        </div>
                    </div>

                    <!-- LAYOUT GRID -->
                    <div class="wr-layout">
                        
                        <!-- MAIN LEFT/CENTER COLUMN -->
                        <div class="wr-main-col">
                            
                            <!-- 2. INTERVIEW CATEGORIES -->
                            <div class="wr-section-head">
                                <div class="wr-section-title"><i class="fas fa-layer-group"></i> Interview Categories</div>
                            </div>
                            <div class="wr-categories-grid">
                                <div class="wr-cat-card active" data-cat="Technical Coding">
                                    <div class="wr-cat-header">
                                        <div class="wr-cat-icon"><i class="fas fa-code"></i></div>
                                        <span class="wr-rec-badge">⚡ Top Priority</span>
                                    </div>
                                    <h4 class="wr-cat-title">Technical Coding</h4>
                                    <div class="wr-cat-meta">
                                        <span class="wr-cat-pill">45 mins</span>
                                        <span class="wr-cat-pill">Hard</span>
                                        <span class="wr-cat-pill">98% Pop.</span>
                                    </div>
                                </div>

                                <div class="wr-cat-card" data-cat="System Design">
                                    <div class="wr-cat-header">
                                        <div class="wr-cat-icon"><i class="fas fa-network-wired"></i></div>
                                        <span class="wr-rec-badge">🔥 High ROI</span>
                                    </div>
                                    <h4 class="wr-cat-title">System Design</h4>
                                    <div class="wr-cat-meta">
                                        <span class="wr-cat-pill">60 mins</span>
                                        <span class="wr-cat-pill">Staff+</span>
                                        <span class="wr-cat-pill">95% Pop.</span>
                                    </div>
                                </div>

                                <div class="wr-cat-card" data-cat="Behavioral & Leadership">
                                    <div class="wr-cat-header">
                                        <div class="wr-cat-icon"><i class="fas fa-user-tie"></i></div>
                                        <span class="wr-rec-badge">💡 Essential</span>
                                    </div>
                                    <h4 class="wr-cat-title">Behavioral & Leadership</h4>
                                    <div class="wr-cat-meta">
                                        <span class="wr-cat-pill">30 mins</span>
                                        <span class="wr-cat-pill">STAR</span>
                                        <span class="wr-cat-pill">92% Pop.</span>
                                    </div>
                                </div>

                                <div class="wr-cat-card" data-cat="AI Engineering">
                                    <div class="wr-cat-header">
                                        <div class="wr-cat-icon"><i class="fas fa-brain"></i></div>
                                        <span class="wr-rec-badge">🚀 Trending</span>
                                    </div>
                                    <h4 class="wr-cat-title">AI & LLM Infra</h4>
                                    <div class="wr-cat-meta">
                                        <span class="wr-cat-pill">45 mins</span>
                                        <span class="wr-cat-pill">Extreme</span>
                                        <span class="wr-cat-pill">89% Pop.</span>
                                    </div>
                                </div>

                                <div class="wr-cat-card" data-cat="Cloud & DevOps">
                                    <div class="wr-cat-header">
                                        <div class="wr-cat-icon"><i class="fas fa-cloud"></i></div>
                                    </div>
                                    <h4 class="wr-cat-title">Cloud & DevOps</h4>
                                    <div class="wr-cat-meta">
                                        <span class="wr-cat-pill">45 mins</span>
                                        <span class="wr-cat-pill">Senior</span>
                                        <span class="wr-cat-pill">84% Pop.</span>
                                    </div>
                                </div>

                                <div class="wr-cat-card" data-cat="Cyber Security">
                                    <div class="wr-cat-header">
                                        <div class="wr-cat-icon"><i class="fas fa-shield-alt"></i></div>
                                    </div>
                                    <h4 class="wr-cat-title">Cyber Security</h4>
                                    <div class="wr-cat-meta">
                                        <span class="wr-cat-pill">45 mins</span>
                                        <span class="wr-cat-pill">Hard</span>
                                        <span class="wr-cat-pill">78% Pop.</span>
                                    </div>
                                </div>
                            </div>

                            <!-- 3. COMPANY SELECTION -->
                            <div class="wr-section-head">
                                <div class="wr-section-title"><i class="fas fa-building"></i> Target Company Simulation</div>
                            </div>
                            <div class="wr-companies-scroll">
                                <div class="wr-company-card active" data-comp="Google" data-prob="88.2">
                                    <div class="wr-company-logo">
                                        <div class="wr-company-icon" style="background: #4285F4;">G</div>
                                        <div class="wr-company-name">Google</div>
                                    </div>
                                    <div class="wr-company-diff">L5 / L6 Staff Level</div>
                                    <div class="wr-company-style">Deep Graph Algorithms & High-Scale Consensus</div>
                                </div>

                                <div class="wr-company-card" data-comp="OpenAI" data-prob="84.5">
                                    <div class="wr-company-logo">
                                        <div class="wr-company-icon" style="background: #10A37F;">AI</div>
                                        <div class="wr-company-name">OpenAI</div>
                                    </div>
                                    <div class="wr-company-diff">Level 5 Member Tech</div>
                                    <div class="wr-company-style">GPU Clustering, PyTorch Scaling & Transformer Ops</div>
                                </div>

                                <div class="wr-company-card" data-comp="Apple" data-prob="89.1">
                                    <div class="wr-company-logo">
                                        <div class="wr-company-icon" style="background: #333;"></div>
                                        <div class="wr-company-name">Apple</div>
                                    </div>
                                    <div class="wr-company-diff">ICT4 Senior Systems</div>
                                    <div class="wr-company-style">Low-Level Kernel, C++ Memory & Hardware Integration</div>
                                </div>

                                <div class="wr-company-card" data-comp="Stripe" data-prob="86.7">
                                    <div class="wr-company-logo">
                                        <div class="wr-company-icon" style="background: #635BFF;">S</div>
                                        <div class="wr-company-name">Stripe</div>
                                    </div>
                                    <div class="wr-company-diff">L3 / L4 Systems Lead</div>
                                    <div class="wr-company-style">Flawless Pragmatic API Design & Idempotency</div>
                                </div>

                                <div class="wr-company-card" data-comp="NVIDIA" data-prob="83.9">
                                    <div class="wr-company-logo">
                                        <div class="wr-company-icon" style="background: #76B900;">NV</div>
                                        <div class="wr-company-name">NVIDIA</div>
                                    </div>
                                    <div class="wr-company-diff">IC6 Principal Architect</div>
                                    <div class="wr-company-style">CUDA Concurrency & Distributed Tensor Rings</div>
                                </div>
                            </div>

                            <!-- 4. INTERVIEW PERSONAS -->
                            <div class="wr-section-head">
                                <div class="wr-section-title"><i class="fas fa-user-astronaut"></i> AI Executive Personas</div>
                            </div>
                            <div class="wr-personas-grid">
                                <div class="wr-persona-card active" data-persona="Pressure Interviewer (Crisp Analytical Voice)">
                                    <div class="wr-persona-top">
                                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" class="wr-persona-avatar" alt="Interviewer">
                                        <div class="wr-persona-info">
                                            <h4>Elena Vance</h4>
                                            <span>Pressure Interviewer</span>
                                        </div>
                                    </div>
                                    <div class="wr-persona-tags">
                                        <span class="wr-persona-tag">🔥 Extreme F1 Pace</span>
                                        <span class="wr-persona-tag">🎙️ Crisp Analytical Voice</span>
                                        <span class="wr-persona-tag">⚡ Rapid Interrogation</span>
                                    </div>
                                </div>

                                <div class="wr-persona-card" data-persona="Senior Engineering Manager (Pragmatic Trade-offs)">
                                    <div class="wr-persona-top">
                                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" class="wr-persona-avatar" alt="Interviewer">
                                        <div class="wr-persona-info">
                                            <h4>Marcus Thorne</h4>
                                            <span>Staff Eng Manager</span>
                                        </div>
                                    </div>
                                    <div class="wr-persona-tags">
                                        <span class="wr-persona-tag">📐 Trade-off Focus</span>
                                        <span class="wr-persona-tag">🎙️ Deep Baritone Voice</span>
                                        <span class="wr-persona-tag">💡 System Scalability</span>
                                    </div>
                                </div>

                                <div class="wr-persona-card" data-persona="Friendly Mentor (Guided Pair Programming)">
                                    <div class="wr-persona-top">
                                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" class="wr-persona-avatar" alt="Interviewer">
                                        <div class="wr-persona-info">
                                            <h4>Sarah Lin</h4>
                                            <span>Principal Mentor</span>
                                        </div>
                                    </div>
                                    <div class="wr-persona-tags">
                                        <span class="wr-persona-tag">🤝 Collaborative</span>
                                        <span class="wr-persona-tag">🎙️ Warm Encouraging</span>
                                        <span class="wr-persona-tag">🌱 Educational Hints</span>
                                    </div>
                                </div>

                                <div class="wr-persona-card" data-persona="Robot Evaluator (Zero Bias Neural Judge)">
                                    <div class="wr-persona-top">
                                        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80" class="wr-persona-avatar" alt="Interviewer">
                                        <div class="wr-persona-info">
                                            <h4>SF-9000 Core</h4>
                                            <span>Neural Algorithmic Judge</span>
                                        </div>
                                    </div>
                                    <div class="wr-persona-tags">
                                        <span class="wr-persona-tag">🤖 Zero Bias Absolute</span>
                                        <span class="wr-persona-tag">🎙️ Synthetic Neural</span>
                                        <span class="wr-persona-tag">⚡ Mathematical Proofs</span>
                                    </div>
                                </div>
                            </div>

                            <!-- 5. INTERVIEW CONFIGURATION PANEL -->
                            <div class="wr-section-head">
                                <div class="wr-section-title"><i class="fas fa-sliders-h"></i> Mission Parameter Configuration</div>
                            </div>
                            <div class="wr-config-panel">
                                <div class="wr-config-grid">
                                    <div class="wr-config-item">
                                        <label>Duration & Pace</label>
                                        <div class="wr-pills-row">
                                            <button class="wr-pill-btn wr-duration-pill">30m Blitz</button>
                                            <button class="wr-pill-btn wr-duration-pill active">45m Standard</button>
                                            <button class="wr-pill-btn wr-duration-pill">60m Deep Dive</button>
                                        </div>
                                    </div>

                                    <div class="wr-config-item">
                                        <label>Target Level</label>
                                        <div class="wr-pills-row">
                                            <button class="wr-pill-btn wr-diff-pill">Senior L5</button>
                                            <button class="wr-pill-btn wr-diff-pill active">Staff / L6</button>
                                            <button class="wr-pill-btn wr-diff-pill">Principal L7</button>
                                        </div>
                                    </div>

                                    <div class="wr-config-item">
                                        <label>Target Total Compensation</label>
                                        <div class="wr-range-container">
                                            <input type="range" class="wr-range-input" id="wr-salary-slider" min="150000" max="650000" step="10000" value="380000">
                                            <div class="wr-range-val">
                                                <span>$150k TC</span>
                                                <strong id="wr-salary-val" style="color:var(--wr-accent);">$380,000 / yr</strong>
                                                <span>$650k+ TC</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="wr-config-item">
                                        <label>Telemetry Sensors</label>
                                        <div style="display:flex; flex-direction:column; gap:10px;">
                                            <div class="wr-toggle-row">
                                                <span class="wr-toggle-label">Neural Ultra-HD Voice</span>
                                                <label class="wr-switch"><input type="checkbox" checked><span class="wr-slider"></span></label>
                                            </div>
                                            <div class="wr-toggle-row">
                                                <span class="wr-toggle-label">Live Excalidraw Whiteboard</span>
                                                <label class="wr-switch"><input type="checkbox" checked><span class="wr-slider"></span></label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 6. READY CARD (Huge Cinematic Launchpad) -->
                            <div class="wr-ready-card">
                                <div class="wr-ready-grid">
                                    <div class="wr-ready-info">
                                        <h3 id="wr-ready-summary">45m Standard • Technical Coding Executive Interview</h3>
                                        <div class="wr-ready-specs">
                                            <div class="wr-spec-box">
                                                <span>Target Company</span>
                                                <strong id="wr-ready-comp">Google</strong>
                                            </div>
                                            <div class="wr-spec-box">
                                                <span>Difficulty & Bar</span>
                                                <strong id="wr-ready-diff">Staff / L6</strong>
                                            </div>
                                            <div class="wr-spec-box">
                                                <span>AI Evaluator</span>
                                                <strong id="wr-ready-persona">Pressure Interviewer</strong>
                                            </div>
                                            <div class="wr-spec-box">
                                                <span>Telemetry Latency</span>
                                                <strong style="color:#10B981;">12ms Real-Time</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="wr-ready-action">
                                        <div class="wr-prob-gauge">
                                            <div class="wr-prob-title">Estimated Hiring Probability</div>
                                            <div class="wr-prob-num" id="wr-ready-prob">88.2%</div>
                                        </div>
                                        <button class="wr-start-btn" id="wr-start-btn">
                                            <span>START INTERVIEW</span>
                                            <i class="fas fa-bolt"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <!-- 7. RIGHT SIDEBAR (Race Control Telemetry) -->
                        <div class="wr-sidebar">
                            
                            <div class="wr-side-card">
                                <h4 class="wr-side-title"><i class="fas fa-flag-checkered"></i> Daily War Room Mission</h4>
                                <div class="wr-mission-box">
                                    <h5>⚡ Survive The Matrix</h5>
                                    <p>Complete a 45m Staff System Design session targeting Google consensus architecture with under 2 hints.</p>
                                </div>
                            </div>

                            <div class="wr-side-card">
                                <h4 class="wr-side-title"><i class="fas fa-fire"></i> Executive Streak</h4>
                                <div class="wr-streak-bar">
                                    <div>
                                        <strong style="font-size: 20px;">7 Days Active 🔥</strong>
                                        <div style="font-size:11px; color:var(--wr-text-mut);">Consistency is L6 leverage</div>
                                    </div>
                                    <div style="color:var(--wr-accent); font-weight:800; font-size:24px;">+450 XP</div>
                                </div>
                            </div>

                            <div class="wr-side-card">
                                <h4 class="wr-side-title"><i class="fas fa-chart-radar"></i> Recent Telemetry Breakdown</h4>
                                <div class="wr-radar-list">
                                    <div class="wr-radar-item">
                                        <div class="wr-radar-top"><span>Clarity & Communication</span><span>94%</span></div>
                                        <div class="wr-radar-progress"><div class="wr-radar-fill" style="width:94%;"></div></div>
                                    </div>
                                    <div class="wr-radar-item">
                                        <div class="wr-radar-top"><span>Distributed Architecture</span><span>91%</span></div>
                                        <div class="wr-radar-progress"><div class="wr-radar-fill" style="width:91%;"></div></div>
                                    </div>
                                    <div class="wr-radar-item">
                                        <div class="wr-radar-top"><span>Algorithm Optimization</span><span>88%</span></div>
                                        <div class="wr-radar-progress"><div class="wr-radar-fill" style="width:88%;"></div></div>
                                    </div>
                                    <div class="wr-radar-item">
                                        <div class="wr-radar-top"><span>Pressure Composure</span><span>96%</span></div>
                                        <div class="wr-radar-progress"><div class="wr-radar-fill" style="width:96%;"></div></div>
                                    </div>
                                </div>
                            </div>

                            <div class="wr-side-card">
                                <h4 class="wr-side-title"><i class="fas fa-brain"></i> AI Strategic Advisory</h4>
                                <div class="wr-recs-list">
                                    <div class="wr-rec-item">
                                        <i class="fas fa-lightbulb"></i>
                                        <span>Focus on Raft Consensus split-brain edge cases before taking Google Staff simulations.</span>
                                    </div>
                                    <div class="wr-rec-item">
                                        <i class="fas fa-shield-alt"></i>
                                        <span>Your communication cadence is excellent under rapid interrogation. Maintain steady vocal pitch.</span>
                                    </div>
                                </div>
                            </div>

                            <div class="wr-side-card">
                                <h4 class="wr-side-title"><i class="fas fa-calendar-check"></i> Upcoming Scheduled Simulations</h4>
                                <div class="wr-sched-item">
                                    <div class="wr-sched-info">
                                        <h6>Google L6 Systems Architecture</h6>
                                        <span>Today • 4:00 PM EST</span>
                                    </div>
                                    <span style="background:rgba(255,77,79,0.15); color:var(--wr-accent); padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700;">LIVE IN 2H</span>
                                </div>
                                <div class="wr-sched-item">
                                    <div class="wr-sched-info">
                                        <h6>OpenAI High-Scale LLM Routing</h6>
                                        <span>Tomorrow • 11:00 AM EST</span>
                                    </div>
                                    <span style="color:var(--wr-text-mut); font-size:11px;">READY</span>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

                <!-- SIMULATION LAUNCH MODAL -->
                <div class="wr-modal-overlay" id="wr-simulation-modal">
                    <div class="wr-modal-content">
                        <div style="font-size:48px; color:var(--wr-accent); margin-bottom:16px;"><i class="fas fa-satellite-dish fa-spin"></i></div>
                        <h2 style="font-size:24px; font-weight:800; margin-bottom:8px;">EXECUTIVE WAR ROOM LAUNCHING</h2>
                        <p style="color:var(--wr-text-mut); font-size:14px; margin-bottom:24px;" id="wr-countdown-status">INITIALIZING NEURAL EVALUATOR CHANNELS...</p>
                        <div id="wr-countdown-num" style="font-size:72px; font-weight:900; color:#fff; font-family:'JetBrains Mono',monospace;">3</div>
                    </div>
                </div>
            </section>"""

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Replace links in <head>
if 'war-room-styles.css' not in html:
    html = html.replace('<link rel="stylesheet" href="video-library.css">', '<link rel="stylesheet" href="video-library.css">\n    <link rel="stylesheet" href="war-room-styles.css?v=1">')

if 'war-room.js' not in html:
    html = html.replace('<script src="video-library.js?v=10"></script>', '<script src="video-library.js?v=10"></script>\n    <script src="war-room.js?v=1"></script>')

# Find existing mock-interview-page section bounds
start_marker = '<!-- 9. MOCK INTERVIEW'
end_marker = '<!-- 10. PROFILE / MY DETAILS PAGE -->'

if start_marker in html and end_marker in html:
    start_idx = html.find(start_marker)
    end_idx = html.find(end_marker)
    new_html = html[:start_idx] + html_snippet + "\n\n            " + html[end_idx:]
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(new_html)
    print("Successfully replaced mock-interview-page inside index.html with the WAR ROOM!")
else:
    print("Could not find markers exact!")
