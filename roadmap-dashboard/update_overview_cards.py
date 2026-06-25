import os

html_file = "index.html"
with open(html_file, "r", encoding="utf-8") as f:
    content = f.read()

old_start = '<!-- Arena Overview -->'
old_end = '<!-- Ready to Battle -->'

if old_start in content and old_end in content:
    s_idx = content.find(old_start)
    e_idx = content.find(old_end)
    
    new_overview_html = """<!-- Arena Overview -->
                        <div class="section-label">ARENA OVERVIEW</div>
                        <div class="arena-overview-grid">
                            
                            <!-- Card 1: Your Rating with 3D Ruby Diamond -->
                            <div class="overview-card rating-card-special">
                                <div class="rating-diamond-art">
                                    <svg viewBox="0 0 120 120" class="diamond-svg">
                                       <defs>
                                          <radialGradient id="redGlow" cx="50%" cy="50%" r="50%">
                                             <stop offset="0%" stop-color="#ff4d4f" stop-opacity="0.8"/>
                                             <stop offset="100%" stop-color="#ff4d4f" stop-opacity="0"/>
                                          </radialGradient>
                                          <linearGradient id="rubyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                             <stop offset="0%" stop-color="#ff7875"/>
                                             <stop offset="50%" stop-color="#cf1322"/>
                                             <stop offset="100%" stop-color="#820014"/>
                                          </linearGradient>
                                       </defs>
                                       <!-- Pedestal -->
                                       <ellipse cx="60" cy="102" rx="36" ry="10" fill="url(#redGlow)"/>
                                       <polygon points="32,96 88,96 94,106 26,106" fill="#121212" stroke="#2a2a2a" stroke-width="1"/>
                                       <polygon points="38,90 82,90 88,96 32,96" fill="#1f1f1f"/>
                                       <!-- Red Ruby Diamond -->
                                       <polygon points="60,25 92,52 60,90 28,52" fill="url(#rubyGrad)" filter="drop-shadow(0 0 18px rgba(255,77,79,0.7))"/>
                                       <polygon points="60,25 92,52 60,52" fill="#ff4d4f" opacity="0.75"/>
                                       <polygon points="60,25 28,52 60,52" fill="#ff9c9e" opacity="0.85"/>
                                       <polygon points="60,90 92,52 60,52" fill="#a8071a" opacity="0.9"/>
                                       <polygon points="60,90 28,52 60,52" fill="#cf1322" opacity="0.85"/>
                                       <!-- Floating red sparks -->
                                       <circle cx="30" cy="35" r="1.5" fill="#ff4d4f" filter="blur(0.5px)"/>
                                       <circle cx="92" cy="40" r="2" fill="#ff4d4f" filter="blur(1px)"/>
                                       <circle cx="85" cy="72" r="1.2" fill="#ff7875"/>
                                       <circle cx="35" cy="78" r="1.5" fill="#ff4d4f"/>
                                    </svg>
                                </div>
                                <div class="rating-text-meta">
                                    <div class="oc-header">Your Rating</div>
                                    <div class="oc-value text-accent" style="font-size: 2.3rem; font-weight: 850; line-height: 1.05; margin: 4px 0;">1872</div>
                                    <div class="diamond-badge-row">
                                        <i class="fas fa-gem" style="color: #3b82f6;"></i> <span style="font-size: 0.85rem; font-weight: 600; color: #cbd5e1;">Diamond II</span>
                                    </div>
                                    <div class="oc-sub" style="margin-top: 6px;">Top 2.5% of developers</div>
                                </div>
                            </div>

                            <!-- Card 2: Win Rate with Pink-Green Gradient Ring -->
                            <div class="overview-card center-stat-card">
                                <div class="card-corner-icon"><i class="fas fa-crosshairs"></i></div>
                                <div class="oc-header" style="margin-bottom: 6px;">Win Rate</div>
                                <div class="win-rate-ring-wrap">
                                    <svg viewBox="0 0 36 36" class="circular-chart pink-green-chart">
                                       <defs>
                                          <linearGradient id="pinkGreenGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                                             <stop offset="0%" stop-color="#ff4d4f"/>
                                             <stop offset="45%" stop-color="#ec4899"/>
                                             <stop offset="100%" stop-color="#22c55e"/>
                                          </linearGradient>
                                       </defs>
                                       <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                                       <path class="circle gradient-ring" stroke-dasharray="78, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="url(#pinkGreenGrad)" filter="drop-shadow(0 0 6px rgba(34,197,94,0.4))"/>
                                       <text x="18" y="20.5" class="percentage" style="font-size: 0.68rem; font-weight: 800; fill: white;">78%</text>
                                    </svg>
                                </div>
                                <div class="oc-sub" style="margin-top: 8px;">32 Wins • 9 Losses</div>
                            </div>

                            <!-- Card 3: Win Streak with Intense Red Neon Glow -->
                            <div class="overview-card center-stat-card">
                                <div class="card-corner-icon fire-corner"><i class="fas fa-fire"></i></div>
                                <div class="oc-header" style="margin-bottom: 4px;">Win Streak</div>
                                <div class="oc-value streak-glow">6</div>
                                <div class="oc-sub" style="margin-top: 6px;">Best: 12</div>
                            </div>

                            <!-- Card 4: Global Rank Worldwide -->
                            <div class="overview-card center-stat-card">
                                <div class="card-corner-icon medal-corner"><i class="fas fa-medal"></i></div>
                                <div class="oc-header" style="margin-bottom: 4px;">Global Rank</div>
                                <div class="oc-value" style="font-size: 2.6rem; font-weight: 850; color: white;">#293</div>
                                <div class="oc-sub" style="margin-top: 6px;">Top 2.1% worldwide</div>
                            </div>

                        </div>

                        """
    content = content[:s_idx] + new_overview_html + content[e_idx:]
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(content)
    print("Overview HTML updated.")

css_file = "coding-arena-styles.css"
with open(css_file, "r", encoding="utf-8") as f:
    css = f.read()

overview_css = """

/* ==========================================================================
   PIXEL-EXACT ARENA OVERVIEW STYLES (100% BENCHMARK MATCH)
   ========================================================================== */

.arena-overview-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-top: 8px;
}

.overview-card {
    background: #0D1117;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 16px;
    padding: 24px;
    position: relative;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
    transition: all 0.25s ease;
    overflow: hidden;
}

.overview-card:hover {
    transform: translateY(-4px);
    border-color: rgba(255,255,255,0.15);
    box-shadow: 0 14px 32px rgba(0,0,0,0.6);
}

/* Card 1: Special Rating Card Flex Layout */
.rating-card-special {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 18px 22px;
}

.rating-diamond-art {
    width: 95px;
    height: 95px;
    flex-shrink: 0;
}

.diamond-svg {
    width: 100%;
    height: 100%;
    animation: pulseDiamond 3s infinite alternate ease-in-out;
}

@keyframes pulseDiamond {
    0% { transform: scale(1); filter: brightness(1); }
    100% { transform: scale(1.05); filter: brightness(1.15); }
}

.rating-text-meta {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.diamond-badge-row {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.25);
    padding: 3px 10px;
    border-radius: 20px;
    width: fit-content;
}

/* Card 2, 3, 4 Centered Sizing */
.center-stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 20px;
    text-align: center;
}

.card-corner-icon {
    position: absolute;
    top: 18px;
    left: 18px;
    color: rgba(255,255,255,0.25);
    font-size: 1.1rem;
}

.card-corner-icon.fire-corner {
    color: #ff4d4f;
    filter: drop-shadow(0 0 8px rgba(255,77,79,0.5));
}

.card-corner-icon.medal-corner {
    color: #f59e0b;
    filter: drop-shadow(0 0 8px rgba(245,158,11,0.5));
}

.win-rate-ring-wrap {
    width: 76px;
    height: 76px;
    margin: 6px 0;
}

.circular-chart.pink-green-chart .circle-bg {
    stroke: rgba(255,255,255,0.06);
    stroke-width: 3.5;
}

.circular-chart.pink-green-chart .gradient-ring {
    stroke-width: 3.5;
    stroke-linecap: round;
    animation: ringDraw 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes ringDraw {
    0% { stroke-dasharray: 0, 100; }
    100% { stroke-dasharray: 78, 100; }
}

.streak-glow {
    font-size: 2.8rem;
    font-weight: 900;
    color: #ff4d4f;
    text-shadow: 0 0 25px rgba(255,77,79,0.65), 0 0 50px rgba(255,77,79,0.3);
    line-height: 1.05;
    margin: 4px 0;
}
"""

with open(css_file, "a", encoding="utf-8") as f:
    f.write(overview_css)

print("Overview CSS updated.")
