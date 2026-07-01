import os

css_content = """/* =========================================================
   SKILLFORGE WAR ROOM — EXECUTIVE INTERVIEW CENTER
   Layout Architecture & Responsive Grid Refinement
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

/* Override default .page-view constraints to prevent horizontal clipping */
#mock-interview-page.page-view {
    background-color: var(--wr-bg);
    color: var(--wr-text);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    min-height: 100vh;
    padding: 24px 28px !important;
    max-width: 1500px !important;
    width: 100%;
    margin: 0 auto;
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
    height: 500px;
    background: radial-gradient(circle at 50% -10%, rgba(255, 77, 79, 0.15) 0%, rgba(5, 5, 5, 0) 70%);
    pointer-events: none;
    z-index: 0;
}

.wr-container {
    width: 100%;
    max-width: 1460px;
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
    flex-wrap: wrap;
    gap: 24px;
    padding: 32px 36px;
    background: linear-gradient(135deg, rgba(20, 20, 20, 0.8) 0%, rgba(10, 10, 10, 0.9) 100%);
    border: 1px solid var(--wr-border);
    border-radius: 20px;
    backdrop-filter: blur(20px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    margin-bottom: 28px;
    position: relative;
    overflow: hidden;
}

.wr-hero::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 350px;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 77, 79, 0.04));
    pointer-events: none;
}

.wr-hero-left {
    flex: 1;
    min-width: 320px;
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
    margin-bottom: 16px;
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
    font-size: clamp(36px, 4vw, 48px);
    font-weight: 800;
    letter-spacing: -1.5px;
    line-height: 1.05;
    margin: 0 0 10px 0;
    background: linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.7) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.wr-hero-subtitle {
    font-size: clamp(14px, 1.5vw, 16px);
    color: var(--wr-text-mut);
    margin: 0;
    font-weight: 400;
}

.wr-hero-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 28px;
    align-items: center;
}

.wr-stat-box {
    text-align: right;
    position: relative;
    padding-left: 20px;
    border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.wr-stat-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(26px, 3vw, 32px);
    font-weight: 700;
    color: var(--wr-text);
    line-height: 1;
    margin-bottom: 4px;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
}

.wr-stat-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--wr-text-mut);
    font-weight: 600;
}

/* ==========================================
   LAYOUT GRID ARCHITECTURE
   ========================================== */
.wr-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 28px;
    align-items: start;
    width: 100%;
}

.wr-main-col {
    min-width: 0; /* Critical to prevent grid child blowout */
}

/* Responsive Grid Adaptation */
@media (max-width: 1280px) {
    .wr-layout {
        grid-template-columns: minmax(0, 1fr) 300px;
        gap: 20px;
    }
}

@media (max-width: 1200px) {
    .wr-layout {
        grid-template-columns: 1fr;
    }
    .wr-sidebar {
        position: relative !important;
        top: 0 !important;
        height: auto !important;
        overflow-y: visible !important;
    }
}

/* Section Headers */
.wr-section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.wr-section-title {
    font-size: 18px;
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
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
    margin-bottom: 32px;
}

.wr-cat-card {
    background: var(--wr-card);
    border: 1px solid var(--wr-border);
    border-radius: 16px;
    padding: 18px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
}

.wr-cat-card:hover, .wr-cat-card.active {
    background: var(--wr-card-hover);
    border-color: var(--wr-border-hover);
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 77, 79, 0.15);
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
    margin-bottom: 12px;
}

.wr-cat-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
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
    font-size: 15px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: var(--wr-text);
}

.wr-cat-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
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
    gap: 14px;
    overflow-x: auto;
    padding-bottom: 10px;
    margin-bottom: 32px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.wr-company-card {
    min-width: 190px;
    background: var(--wr-card);
    border: 1px solid var(--wr-border);
    border-radius: 16px;
    padding: 18px;
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
    margin-bottom: 12px;
}

.wr-company-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 15px;
    color: #fff;
}

.wr-company-name {
    font-size: 15px;
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
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 14px;
    margin-bottom: 32px;
}

.wr-persona-card {
    background: var(--wr-card);
    border: 1px solid var(--wr-border);
    border-radius: 16px;
    padding: 18px;
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
    gap: 12px;
    margin-bottom: 12px;
}

.wr-persona-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.1);
}

.wr-persona-info h4 {
    font-size: 14px;
    font-weight: 700;
    margin: 0 0 3px 0;
}

.wr-persona-info span {
    font-size: 11px;
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
    border-radius: 18px;
    padding: 24px;
    margin-bottom: 32px;
}

.wr-config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
}

.wr-config-item label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--wr-text-mut);
    margin-bottom: 8px;
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
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
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
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.wr-toggle-label {
    font-size: 13px;
    font-weight: 600;
}

.wr-switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 22px;
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
    height: 16px;
    width: 16px;
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
    transform: translateX(18px);
}

.wr-range-container {
    padding-top: 4px;
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
    font-size: 11px;
    color: var(--wr-text-mut);
    margin-top: 6px;
}

/* ==========================================
   6. READY CARD (Cinematic Launchpad)
   ========================================== */
.wr-ready-card {
    background: linear-gradient(145deg, #121212 0%, #0a0a0a 100%);
    border: 1px solid rgba(255, 77, 79, 0.3);
    border-radius: 20px;
    padding: 28px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(255, 77, 79, 0.15);
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
    gap: 24px;
    align-items: center;
}

@media (max-width: 900px) {
    .wr-ready-grid {
        grid-template-columns: 1fr;
    }
}

.wr-ready-info h3 {
    font-size: 24px;
    font-weight: 800;
    margin: 0 0 14px 0;
    letter-spacing: -0.8px;
}

.wr-ready-specs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.wr-spec-box {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 12px;
    border-radius: 10px;
}

.wr-spec-box span {
    display: block;
    font-size: 10px;
    color: var(--wr-text-mut);
    text-transform: uppercase;
    margin-bottom: 3px;
}

.wr-spec-box strong {
    font-size: 14px;
    color: #fff;
}

.wr-ready-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.wr-prob-gauge {
    margin-bottom: 16px;
}

.wr-prob-title {
    font-size: 11px;
    color: var(--wr-text-mut);
    text-transform: uppercase;
    margin-bottom: 6px;
}

.wr-prob-num {
    font-size: 36px;
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
    padding: 16px 28px;
    font-size: 16px;
    font-weight: 800;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 10px 25px rgba(255, 77, 79, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    letter-spacing: 0.5px;
}

.wr-start-btn:hover {
    transform: scale(1.03) translateY(-2px);
    box-shadow: 0 15px 35px rgba(255, 77, 79, 0.6);
    background: #ff3336;
}

/* ==========================================
   7. RIGHT SIDEBAR (STICKY TELEMETRY ARCHITECTURE)
   ========================================== */
.wr-sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: sticky;
    top: 24px;
    height: calc(100vh - 48px);
    overflow-y: auto;
    scrollbar-width: none; /* Hide scrollbar Firefox */
    -ms-overflow-style: none; /* Hide scrollbar Edge */
    padding-right: 4px;
}

.wr-sidebar::-webkit-scrollbar {
    display: none; /* Hide scrollbar Chrome/Safari */
}

.wr-side-card {
    background: var(--wr-card);
    border: 1px solid var(--wr-border);
    border-radius: 16px;
    padding: 18px;
    flex-shrink: 0;
}

.wr-side-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--wr-text);
    margin: 0 0 12px 0;
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
    border-radius: 10px;
    padding: 14px;
}

.wr-mission-box h5 {
    font-size: 13px;
    margin: 0 0 4px 0;
    color: var(--wr-accent);
}

.wr-mission-box p {
    font-size: 12px;
    margin: 0;
    color: #ddd;
    line-height: 1.4;
}

.wr-streak-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.03);
    padding: 10px 12px;
    border-radius: 8px;
}

.wr-radar-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.wr-radar-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.wr-radar-top {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    font-weight: 600;
}

.wr-radar-progress {
    height: 5px;
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
    gap: 10px;
}

.wr-rec-item {
    display: flex;
    gap: 8px;
    font-size: 11px;
    line-height: 1.4;
    color: #ccc;
    background: rgba(255, 255, 255, 0.02);
    padding: 8px 10px;
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
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.wr-sched-item:last-child {
    border-bottom: none;
}

.wr-sched-info h6 {
    font-size: 12px;
    margin: 0 0 2px 0;
    font-weight: 600;
}

.wr-sched-info span {
    font-size: 10px;
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
    padding: 36px;
    max-width: 500px;
    width: 90%;
    text-align: center;
    box-shadow: 0 0 60px rgba(255, 77, 79, 0.3);
}
"""

with open("war-room-styles.css", "w", encoding="utf-8") as f:
    f.write(css_content)
print("Updated war-room-styles.css with exact responsive CSS Grid & Sticky Sidebar architecture.")
