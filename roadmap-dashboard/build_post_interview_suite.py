import os

# 1. CSS for Post-Interview Suite
post_css = """
/* =========================================================
   PROMPT 3: EXECUTIVE EVALUATION DOSSIER & ENTERPRISE SUITE
   ========================================================= */

.wr-results-view {
    background: #050505;
    color: #fff;
    min-height: calc(100vh - 48px);
    display: flex;
    flex-direction: column;
    gap: 18px;
    animation: wrLiveEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.wr-res-topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #101010;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 16px 24px;
    flex-wrap: wrap;
    gap: 12px;
}

.wr-res-title-group {
    display: flex;
    align-items: center;
    gap: 14px;
}

.wr-res-badge {
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid #10B981;
    color: #10B981;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1px;
}

.wr-res-title {
    font-size: 20px;
    font-weight: 900;
    margin: 0;
    letter-spacing: -0.5px;
}

.wr-res-actions {
    display: flex;
    gap: 10px;
    align-items: center;
}

.wr-btn-secondary {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
}

.wr-btn-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
}

.wr-btn-primary {
    background: #FF4D4F;
    border: none;
    color: #fff;
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 0 20px rgba(255, 77, 79, 0.3);
    display: flex;
    align-items: center;
    gap: 8px;
}

.wr-btn-primary:hover {
    background: #ff6b6d;
    box-shadow: 0 0 30px rgba(255, 77, 79, 0.5);
}

/* NAVIGATION TABS */
.wr-res-nav {
    display: flex;
    gap: 8px;
    background: #0e0e0e;
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 8px;
    border-radius: 14px;
    overflow-x: auto;
    scrollbar-width: none;
}

.wr-res-tab {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
}

.wr-res-tab:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.04);
}

.wr-res-tab.active {
    background: #181818;
    color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

/* TAB PANELS */
.wr-res-panel {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

/* SCORECARD & DECISION GRID */
.wr-decision-hero {
    display: grid;
    grid-template-columns: 340px minmax(0, 1fr);
    gap: 18px;
}

@media (max-width: 1000px) {
    .wr-decision-hero {
        grid-template-columns: 1fr;
    }
}

.wr-decision-card {
    background: linear-gradient(135deg, #101010, #161616);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 18px;
    padding: 24px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 0 40px rgba(16, 185, 129, 0.08);
}

.wr-hire-tag {
    font-size: 24px;
    font-weight: 900;
    color: #10B981;
    margin: 8px 0;
    letter-spacing: -0.5px;
}

.wr-overall-num {
    font-size: 64px;
    font-weight: 900;
    font-family: 'JetBrains Mono', monospace;
    color: #fff;
    line-height: 1;
}

.wr-metrics-grid {
    background: #101010;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 24px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
}

.wr-metric-box {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 14px;
    padding: 16px;
}

.wr-metric-box-title {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 8px;
}

.wr-metric-box-val {
    font-size: 24px;
    font-weight: 800;
    font-family: 'JetBrains Mono', monospace;
    color: #fff;
}

.wr-feedback-deck {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 18px;
}

.wr-fb-card {
    background: #101010;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 20px;
}

.wr-fb-title {
    font-size: 14px;
    font-weight: 800;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.wr-fb-item {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.02);
    border-left: 3px solid #FF4D4F;
    padding: 10px 14px;
    border-radius: 0 8px 8px 0;
    margin-bottom: 10px;
    line-height: 1.5;
}

.wr-fb-item.green { border-color: #10B981; }
.wr-fb-item.yellow { border-color: #F59E0B; }

.wr-ideal-answer {
    background: #101010;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 24px;
}

/* REPLAY TAB */
.wr-replay-player {
    background: #101010;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.wr-scrubber-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    position: relative;
    cursor: pointer;
}

.wr-scrubber-fill {
    height: 100%;
    background: #FF4D4F;
    border-radius: 4px;
    width: 48%;
}

.wr-scrubber-marker {
    position: absolute;
    top: -6px;
    width: 4px;
    height: 20px;
    background: #F59E0B;
    border-radius: 2px;
}

/* TRANSCRIPT TAB */
.wr-transcript-box {
    background: #101010;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 24px;
    max-height: 550px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.wr-trans-row {
    display: flex;
    gap: 14px;
    padding: 12px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.02);
}

.wr-trans-row.highlight {
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.2);
}

.wr-trans-row.mistake {
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.2);
}

/* ROADMAP & DOSSIER CARDS */
.wr-plan-deck {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
}

@media (max-width: 900px) {
    .wr-plan-deck { grid-template-columns: 1fr; }
}

.wr-plan-card {
    background: #101010;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 22px;
}

.wr-badge-item {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 18px;
    display: flex;
    align-items: center;
    gap: 16px;
}
"""

with open("war-room-styles.css", "r", encoding="utf-8") as f:
    existing_css = f.read()

if ".wr-results-view" not in existing_css:
    with open("war-room-styles.css", "a", encoding="utf-8") as f:
        f.write("\n" + post_css)
    print("Appended Post-Interview Suite CSS to war-room-styles.css")
else:
    print("Post-Interview Suite CSS already present.")

# 2. HTML for Post-Interview Suite
post_html = """
                <!-- ==========================================
                     EXECUTIVE EVALUATION DOSSIER (PROMPT 3)
                     ========================================== -->
                <div id="wr-results-view" class="wr-results-view hidden">
                    
                    <!-- 1. HEADER BAR -->
                    <div class="wr-res-topbar">
                        <div class="wr-res-title-group">
                            <div class="wr-res-badge">DOSSIER #EV-2035</div>
                            <div>
                                <h2 class="wr-res-title">EXECUTIVE EVALUATION DOSSIER</h2>
                                <span style="font-size:12px; color:rgba(255,255,255,0.6);">Staff Software Engineer Track • Google Cloud Infrastructure Bar</span>
                            </div>
                        </div>

                        <div class="wr-res-actions">
                            <button class="wr-btn-secondary" id="wr-btn-back-race">
                                <i class="fas fa-satellite-dish"></i> Return to Race Control
                            </button>
                            <button class="wr-btn-secondary" onclick="alert('📑 Generating Executive Candidate PDF Dossier...')">
                                <i class="fas fa-file-pdf" style="color:#FF4D4F;"></i> Export PDF
                            </button>
                            <button class="wr-btn-primary" onclick="alert('🔗 Candidate Dossier Link copied to clipboard! Shareable with VP of Engineering.')">
                                <i class="fas fa-share-alt"></i> Share Dossier Link
                            </button>
                        </div>
                    </div>

                    <!-- 2. EXECUTIVE NAVIGATION TABS -->
                    <div class="wr-res-nav">
                        <button class="wr-res-tab active" data-res="scorecard"><i class="fas fa-chart-pie"></i> Scorecard & Decision</button>
                        <button class="wr-res-tab" data-res="replay"><i class="fas fa-history"></i> Telemetry Replay</button>
                        <button class="wr-res-tab" data-res="transcript"><i class="fas fa-file-alt"></i> Searchable Transcript</button>
                        <button class="wr-res-tab" data-res="roadmap"><i class="fas fa-route"></i> Improvement Roadmap</button>
                        <button class="wr-res-tab" data-res="reports"><i class="fas fa-briefcase"></i> Recruiter Reports Suite</button>
                        <button class="wr-res-tab" data-res="history"><i class="fas fa-layer-group"></i> Interview History</button>
                        <button class="wr-res-tab" data-res="achievements"><i class="fas fa-trophy"></i> Achievements</button>
                        <button class="wr-res-tab" data-res="leaderboards"><i class="fas fa-globe"></i> Global Leaderboards</button>
                        <button class="wr-res-tab" data-res="settings"><i class="fas fa-cog"></i> Neural Rig Settings</button>
                    </div>

                    <!-- 3. PANELS CONTAINER -->
                    <div class="wr-res-content">
                        
                        <!-- PANEL 1: SCORECARD & DECISION -->
                        <div id="wr-panel-scorecard" class="wr-res-panel">
                            <div class="wr-decision-hero">
                                <div class="wr-decision-card">
                                    <div>
                                        <span style="font-size:11px; font-weight:700; color:rgba(255,255,255,0.5); text-transform:uppercase;">HIRING COMMITTEE DECISION</span>
                                        <div class="wr-hire-tag">STRONG HIRE</div>
                                        <span style="font-size:12px; color:rgba(255,255,255,0.7); display:block; margin-top:4px;">Target Level: L6 Staff Architect</span>
                                    </div>

                                    <div style="margin:20px 0;">
                                        <span style="font-size:11px; color:rgba(255,255,255,0.5); text-transform:uppercase; font-weight:700;">OVERALL COMPOSITE INDEX</span>
                                        <div style="display:flex; align-items:baseline; gap:10px;">
                                            <span class="wr-overall-num">94</span>
                                            <span style="font-size:20px; font-weight:800; color:#10B981;">A+ Grade</span>
                                        </div>
                                    </div>

                                    <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.08); padding:14px; border-radius:12px; font-size:12px; line-height:1.5; color:rgba(255,255,255,0.85);">
                                        <strong style="color:#10B981;">Executive Rationale:</strong> Candidate exhibited flawless mastery of distributed CRDT state reconciliation and clearly communicated CAP theorem edge trade-offs under rigorous interrogation.
                                    </div>
                                </div>

                                <div class="wr-metrics-grid">
                                    <div class="wr-metric-box">
                                        <div class="wr-metric-box-title">Technical Depth</div>
                                        <div class="wr-metric-box-val" style="color:#10B981;">96/100</div>
                                        <div style="font-size:11px; color:rgba(255,255,255,0.5); margin-top:4px;">Top 2% Bar</div>
                                    </div>
                                    <div class="wr-metric-box">
                                        <div class="wr-metric-box-title">System Design</div>
                                        <div class="wr-metric-box-val" style="color:#10B981;">95/100</div>
                                        <div style="font-size:11px; color:rgba(255,255,255,0.5); margin-top:4px;">Global Edge Consensus</div>
                                    </div>
                                    <div class="wr-metric-box">
                                        <div class="wr-metric-box-title">Communication</div>
                                        <div class="wr-metric-box-val" style="color:#3B82F6;">94/100</div>
                                        <div style="font-size:11px; color:rgba(255,255,255,0.5); margin-top:4px;">142 WPM Ideal Cadence</div>
                                    </div>
                                    <div class="wr-metric-box">
                                        <div class="wr-metric-box-title">Confidence & Voice</div>
                                        <div class="wr-metric-box-val" style="color:#F59E0B;">92/100</div>
                                        <div style="font-size:11px; color:rgba(255,255,255,0.5); margin-top:4px;">Executive Presence</div>
                                    </div>
                                    <div class="wr-metric-box">
                                        <div class="wr-metric-box-title">Leadership Bar</div>
                                        <div class="wr-metric-box-val" style="color:#EC4899;">90/100</div>
                                        <div style="font-size:11px; color:rgba(255,255,255,0.5); margin-top:4px;">Trade-off Ownership</div>
                                    </div>
                                    <div class="wr-metric-box">
                                        <div class="wr-metric-box-title">Code Quality</div>
                                        <div class="wr-metric-box-val" style="color:#10B981;">94/100</div>
                                        <div style="font-size:11px; color:rgba(255,255,255,0.5); margin-top:4px;">Zero Concurrency Bugs</div>
                                    </div>
                                </div>
                            </div>

                            <!-- AI FEEDBACK DECK -->
                            <div class="wr-feedback-deck">
                                <div class="wr-fb-card">
                                    <div class="wr-fb-title" style="color:#10B981;"><i class="fas fa-check-circle"></i> Exceptional Strengths</div>
                                    <div class="wr-fb-item green">Exhibited complete command of local token estimation combined with async CRDT background sync.</div>
                                    <div class="wr-fb-item green">Pushback against executive lead was diplomatic yet assertive regarding network partition risks.</div>
                                </div>

                                <div class="wr-fb-card">
                                    <div class="wr-fb-title" style="color:#F59E0B;"><i class="fas fa-exclamation-triangle"></i> Areas for Refinement</div>
                                    <div class="wr-fb-item yellow">Minor hesitation on Redis split-brain election timeouts during cross-datacenter fiber cuts.</div>
                                    <div class="wr-fb-item yellow">Could explicitly quantify memory overhead per node earlier in the estimation phase.</div>
                                </div>

                                <div class="wr-fb-card">
                                    <div class="wr-fb-title" style="color:#FF4D4F;"><i class="fas fa-lightbulb"></i> Actionable Interview Tips</div>
                                    <div class="wr-fb-item">Always state CAP theorem availability requirements before writing code primitives.</div>
                                    <div class="wr-fb-item">Cite specific industry reference topologies (e.g. Stripe or Cloudflare edge limiters).</div>
                                </div>
                            </div>

                            <!-- IDEAL SENIOR ENGINEER ANSWER -->
                            <div class="wr-ideal-answer">
                                <h3 style="font-size:16px; font-weight:800; color:#fff; margin:0 0 12px 0;"><i class="fas fa-star" style="color:#F59E0B;"></i> Ideal Senior / Staff Architect Benchmark Answer</h3>
                                <p style="font-size:13px; color:rgba(255,255,255,0.8); line-height:1.6; margin-bottom:14px;">
                                    "To achieve 100M requests/sec across global edge nodes without cross-region locking latency, we implement a two-tiered architecture: <strong>L1 Edge Memory Token Bucket</strong> synchronized asynchronously via <strong>Redis Cluster CRDTs (Conflict-Free Replicated Data Types)</strong>. If an edge node gets partitioned, it falls back to local leaky-bucket quotas based on historical traffic weights, ensuring zero downtime while guaranteeing 99.999% global rate adherence."
                                </p>
                                <div style="display:flex; gap:12px;">
                                    <span style="font-size:11px; background:rgba(255,255,255,0.05); padding:6px 12px; border-radius:6px; color:#10B981; font-weight:700;">✓ Matched by Candidate: 94%</span>
                                    <span style="font-size:11px; background:rgba(255,255,255,0.05); padding:6px 12px; border-radius:6px; color:#aaa;">Complexity: O(1) Edge Evaluation</span>
                                </div>
                            </div>
                        </div>

                        <!-- PANEL 2: TELEMETRY REPLAY -->
                        <div id="wr-panel-replay" class="wr-res-panel hidden">
                            <div class="wr-replay-player">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-weight:800; font-size:15px;"><i class="fas fa-video" style="color:#FF4D4F;"></i> Synchronized Session Playback Deck</span>
                                    <div style="display:flex; gap:8px;">
                                        <button class="wr-btn-secondary" style="padding:6px 12px; font-size:12px;">1.0x Speed</button>
                                        <button class="wr-btn-secondary" style="padding:6px 12px; font-size:12px;">Replay Whiteboard</button>
                                        <button class="wr-btn-secondary" style="padding:6px 12px; font-size:12px;">Replay Code</button>
                                    </div>
                                </div>

                                <div style="height:320px; background:#080808; border-radius:14px; border:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;">
                                    <div style="text-align:center;">
                                        <i class="fas fa-play-circle" style="font-size:64px; color:rgba(255,77,79,0.8); cursor:pointer;" onclick="alert('Playing synchronized telemetry & video stream...')"></i>
                                        <div style="margin-top:12px; font-weight:700; font-size:14px;">14:22 / 30:38 • Phase 2 Deep Architecture Interrogation</div>
                                    </div>
                                </div>

                                <div>
                                    <div style="display:flex; justify-content:space-between; font-size:11px; color:#aaa; margin-bottom:8px;">
                                        <span>00:00 - Introduction</span>
                                        <span style="color:#F59E0B;">14:22 - Lua Atomic Locking Fix ⭐</span>
                                        <span>30:38 - End</span>
                                    </div>
                                    <div class="wr-scrubber-bar">
                                        <div class="wr-scrubber-fill"></div>
                                        <div class="wr-scrubber-marker" style="left:48%;" title="Highlight Moment"></div>
                                        <div class="wr-scrubber-marker" style="left:22%; background:#EF4444;" title="Hesitation Point"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- PANEL 3: SEARCHABLE TRANSCRIPT -->
                        <div id="wr-panel-transcript" class="wr-res-panel hidden">
                            <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
                                <input type="text" placeholder="🔍 Search transcript keywords (e.g. CRDT, Redis, failover)..." style="flex:1; background:#101010; border:1px solid rgba(255,255,255,0.1); padding:10px 16px; border-radius:10px; color:#fff;">
                                <div style="display:flex; gap:8px;">
                                    <button class="wr-btn-secondary" style="padding:8px 14px; font-size:12px;" onclick="alert('Exported full conversation transcript as JSON/TXT')"><i class="fas fa-download"></i> Export</button>
                                    <button class="wr-btn-secondary" style="padding:8px 14px; font-size:12px;" onclick="alert('Copied transcript to clipboard')"><i class="fas fa-copy"></i> Copy</button>
                                </div>
                            </div>

                            <div class="wr-transcript-box">
                                <div class="wr-trans-row">
                                    <span style="color:#FF4D4F; font-weight:700; min-width:80px;">02:14 • AI:</span>
                                    <span style="color:rgba(255,255,255,0.85);">"Let's begin. How would you design a distributed rate limiter handling 100 million requests per second globally?"</span>
                                </div>
                                <div class="wr-trans-row highlight">
                                    <span style="color:#10B981; font-weight:700; min-width:80px;">03:05 • You:</span>
                                    <span style="color:#fff;"><strong>[⭐ EXECUTIVE HIGHLIGHT]</strong> "At 100M req/sec, synchronous quorum locks across regions violate latency SLOs. I propose edge L1 token estimation coupled with background CRDT gossip synchronization."</span>
                                </div>
                                <div class="wr-trans-row mistake">
                                    <span style="color:#F59E0B; font-weight:700; min-width:80px;">18:40 • You:</span>
                                    <span style="color:rgba(255,255,255,0.85);"><strong>[⚠️ MINOR HESITATION]</strong> "If fiber connection drops, election timeout would take roughly... around 500 milliseconds before shard promotion."</span>
                                </div>
                            </div>
                        </div>

                        <!-- PANEL 4: IMPROVEMENT ROADMAP -->
                        <div id="wr-panel-roadmap" class="wr-res-panel hidden">
                            <div class="wr-plan-deck">
                                <div class="wr-plan-card" style="border-top:3px solid #FF4D4F;">
                                    <h4 style="font-size:16px; font-weight:800; margin:0 0 12px 0;">⚡ 7-Day Precision Sprint</h4>
                                    <p style="font-size:12px; color:rgba(255,255,255,0.7); line-height:1.5;">Master Redis Lua atomic execution and split-brain election timeouts.</p>
                                    <button class="wr-btn-secondary" style="width:100%; justify-content:center; margin-top:16px; font-size:12px;" onclick="alert('Launching 7-Day Sprint Plan...')">Start Sprint</button>
                                </div>
                                <div class="wr-plan-card" style="border-top:3px solid #10B981;">
                                    <h4 style="font-size:16px; font-weight:800; margin:0 0 12px 0;">🗺️ 30-Day Staff Deep Dive</h4>
                                    <p style="font-size:12px; color:rgba(255,255,255,0.7); line-height:1.5;">Architect multi-region active-active database replication topologies.</p>
                                    <button class="wr-btn-secondary" style="width:100%; justify-content:center; margin-top:16px; font-size:12px;" onclick="alert('Enrolled in 30-Day Staff Deep Dive!')">View Modules</button>
                                </div>
                                <div class="wr-plan-card" style="border-top:3px solid #3B82F6;">
                                    <h4 style="font-size:16px; font-weight:800; margin:0 0 12px 0;">⚔️ Arena Battle Simulation</h4>
                                    <p style="font-size:12px; color:rgba(255,255,255,0.7); line-height:1.5;">Challenge live AI evaluators in head-to-head architectural showdowns.</p>
                                    <button class="wr-btn-primary" style="width:100%; justify-content:center; margin-top:16px; font-size:12px;" onclick="alert('Entering Arena Battle Queue...')">Launch Arena</button>
                                </div>
                            </div>
                        </div>

                        <!-- PANEL 5: RECRUITER REPORTS SUITE -->
                        <div id="wr-panel-reports" class="wr-res-panel hidden">
                            <div class="wr-plan-deck">
                                <div class="wr-plan-card">
                                    <h4 style="font-size:16px; font-weight:800; margin:0 0 10px 0;"><i class="fas fa-user-tie" style="color:#10B981;"></i> Executive Recruiter Dossier</h4>
                                    <p style="font-size:12px; color:rgba(255,255,255,0.7); margin-bottom:16px;">Summary tailored for Talent Acquisition & Hiring Managers. Highlights L6 Staff competencies & team leadership readiness.</p>
                                    <button class="wr-btn-primary" style="width:100%; justify-content:center;" onclick="alert('Recruiter Dossier Generated!')">Generate Report</button>
                                </div>
                                <div class="wr-plan-card">
                                    <h4 style="font-size:16px; font-weight:800; margin:0 0 10px 0;"><i class="fas fa-file-invoice" style="color:#3B82F6;"></i> Candidate Growth Dossier</h4>
                                    <p style="font-size:12px; color:rgba(255,255,255,0.7); margin-bottom:16px;">Comprehensive technical feedback deck with code diffs, latency charts, and personal practice benchmarks.</p>
                                    <button class="wr-btn-secondary" style="width:100%; justify-content:center;" onclick="alert('Candidate Dossier Downloaded!')">Download Dossier</button>
                                </div>
                                <div class="wr-plan-card">
                                    <h4 style="font-size:16px; font-weight:800; margin:0 0 10px 0;"><i class="fas fa-link" style="color:#FF4D4F;"></i> Secure Verification Link</h4>
                                    <p style="font-size:12px; color:rgba(255,255,255,0.7); margin-bottom:16px;">Cryptographically verified public report card URL with tamper-proof telemetry signatures.</p>
                                    <button class="wr-btn-secondary" style="width:100%; justify-content:center;" onclick="alert('Copied URL: https://skillforge.ai/verify/dossier-ev-2035')">Copy Public Link</button>
                                </div>
                            </div>
                        </div>

                        <!-- PANEL 6: INTERVIEW HISTORY -->
                        <div id="wr-panel-history" class="wr-res-panel hidden">
                            <div style="background:#101010; border:1px solid rgba(255,255,255,0.08); border-radius:18px; padding:24px;">
                                <h4 style="font-size:16px; font-weight:800; margin:0 0 16px 0;">📈 Longitudinal Telemetry Trend (Past 12 Sessions)</h4>
                                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px;">
                                    <div class="wr-metric-box"><div class="wr-metric-box-title">Average Score</div><div class="wr-metric-box-val" style="color:#10B981;">92.4%</div></div>
                                    <div class="wr-metric-box"><div class="wr-metric-box-title">Best Company Bar</div><div class="wr-metric-box-val">Stripe L3</div></div>
                                    <div class="wr-metric-box"><div class="wr-metric-box-title">Strongest Topic</div><div class="wr-metric-box-val" style="font-size:18px; color:#3B82F6;">Distributed Edge</div></div>
                                    <div class="wr-metric-box"><div class="wr-metric-box-title">Improvement Delta</div><div class="wr-metric-box-val" style="color:#10B981;">+14.2%</div></div>
                                </div>
                            </div>
                        </div>

                        <!-- PANEL 7: ACHIEVEMENTS -->
                        <div id="wr-panel-achievements" class="wr-res-panel hidden">
                            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:16px;">
                                <div class="wr-badge-item" style="border-color:#10B981;">
                                    <i class="fas fa-trophy" style="font-size:32px; color:#10B981;"></i>
                                    <div><div style="font-weight:800;">Top 5% Architect</div><div style="font-size:12px; color:#aaa;">Global Staff Leaderboard</div></div>
                                </div>
                                <div class="wr-badge-item" style="border-color:#FF4D4F;">
                                    <i class="fas fa-fire" style="font-size:32px; color:#FF4D4F;"></i>
                                    <div><div style="font-weight:800;">14-Day Rig Streak</div><div style="font-size:12px; color:#aaa;">Unstoppable Momentum</div></div>
                                </div>
                                <div class="wr-badge-item" style="border-color:#3B82F6;">
                                    <i class="fas fa-comment-dots" style="font-size:32px; color:#3B82F6;"></i>
                                    <div><div style="font-weight:800;">Flawless Cadence</div><div style="font-size:12px; color:#aaa;">Perfect Executive Voice</div></div>
                                </div>
                            </div>
                        </div>

                        <!-- PANEL 8: LEADERBOARDS -->
                        <div id="wr-panel-leaderboards" class="wr-res-panel hidden">
                            <div style="background:#101010; border:1px solid rgba(255,255,255,0.08); border-radius:18px; padding:24px;">
                                <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
                                    <span style="font-weight:800; font-size:16px;">🌐 Global Race Control Leaderboard</span>
                                    <span style="font-size:12px; color:#10B981; font-weight:700;">Your Rank: #4 Global</span>
                                </div>
                                <div style="display:flex; flex-direction:column; gap:8px;">
                                    <div style="display:flex; justify-content:space-between; padding:12px; background:rgba(255,255,255,0.02); border-radius:8px;"><span>#1 Alex Mercer (Principal @ Apple)</span><strong style="color:#10B981;">99.2%</strong></div>
                                    <div style="display:flex; justify-content:space-between; padding:12px; background:rgba(255,255,255,0.02); border-radius:8px;"><span>#2 Sarah Chen (Staff @ OpenAI)</span><strong style="color:#10B981;">98.5%</strong></div>
                                    <div style="display:flex; justify-content:space-between; padding:12px; background:rgba(255,77,79,0.15); border:1px solid #FF4D4F; border-radius:8px;"><span>#4 You (Staff Candidate @ Google)</span><strong style="color:#fff;">94.0%</strong></div>
                                </div>
                            </div>
                        </div>

                        <!-- PANEL 9: SETTINGS -->
                        <div id="wr-panel-settings" class="wr-res-panel hidden">
                            <div style="background:#101010; border:1px solid rgba(255,255,255,0.08); border-radius:18px; padding:24px; display:grid; grid-template-columns:1fr 1fr; gap:18px;">
                                <div>
                                    <label style="font-size:12px; font-weight:700; color:#aaa; display:block; margin-bottom:6px;">AI Evaluator Strictness</label>
                                    <select style="width:100%; background:#181818; border:1px solid rgba(255,255,255,0.1); color:#fff; padding:10px; border-radius:8px;">
                                        <option>Staff / Principal Bar (Unforgiving)</option>
                                        <option>Senior Engineer Bar (Balanced)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="font-size:12px; font-weight:700; color:#aaa; display:block; margin-bottom:6px;">Voice Synthesis Engine</label>
                                    <select style="width:100%; background:#181818; border:1px solid rgba(255,255,255,0.1); color:#fff; padding:10px; border-radius:8px;">
                                        <option>Neural HD-Audio (Elena Vance)</option>
                                        <option>Neural HD-Audio (Marcus Thorne)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                    </div>
                </div> <!-- End wr-results-view -->
"""

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

if 'id="wr-results-view"' not in html:
    # Target right after End wr-live-engine closing div and floating coach
    target_point = """                <!-- FLOATING AI COACH POD -->
                <div class="wr-floating-coach hidden" id="wr-floating-coach">
                    <div class="wr-coach-top">
                        <span>🤖 AI Strategic Coach</span>
                        <i class="fas fa-times" style="cursor:pointer;" onclick="document.getElementById('wr-floating-coach').classList.add('hidden')"></i>
                    </div>
                    <div class="wr-coach-banner" id="wr-coach-msg">
                        Pro Tip: Explicitly mention CAP Theorem network partition assumptions before detailing Redis Lua script locking!
                    </div>
                    <div class="wr-coach-pills">
                        <button class="wr-coach-pill" onclick="triggerCoach('Hint: Mention consistent hashing rings to balance shard load uniformly.')">💡 Hint</button>
                        <button class="wr-coach-pill" onclick="triggerCoach('Clarification: Interviewer wants to know about split-brain election timeouts.')">🔍 Clarify</button>
                        <button class="wr-coach-pill" onclick="triggerCoach('Example: Cite Stripe or Discord snowflake ID rate limiting patterns.')">📋 Example</button>
                        <button class="wr-coach-pill" onclick="triggerCoach('Session paused for 60 seconds strategic break.')">⏸️ Pause</button>
                        <button class="wr-coach-pill" onclick="triggerCoach('AI repeating question with emphasized architectural constraints.')">🔄 Repeat</button>
                        <button class="wr-coach-pill" onclick="triggerCoach('Skipping follow-up challenge to advance to Phase 3 Scalability.')">⏭️ Skip</button>
                    </div>
                </div>
            </section>"""
    
    replacement_point = """                <!-- FLOATING AI COACH POD -->
                <div class="wr-floating-coach hidden" id="wr-floating-coach">
                    <div class="wr-coach-top">
                        <span>🤖 AI Strategic Coach</span>
                        <i class="fas fa-times" style="cursor:pointer;" onclick="document.getElementById('wr-floating-coach').classList.add('hidden')"></i>
                    </div>
                    <div class="wr-coach-banner" id="wr-coach-msg">
                        Pro Tip: Explicitly mention CAP Theorem network partition assumptions before detailing Redis Lua script locking!
                    </div>
                    <div class="wr-coach-pills">
                        <button class="wr-coach-pill" onclick="triggerCoach('Hint: Mention consistent hashing rings to balance shard load uniformly.')">💡 Hint</button>
                        <button class="wr-coach-pill" onclick="triggerCoach('Clarification: Interviewer wants to know about split-brain election timeouts.')">🔍 Clarify</button>
                        <button class="wr-coach-pill" onclick="triggerCoach('Example: Cite Stripe or Discord snowflake ID rate limiting patterns.')">📋 Example</button>
                        <button class="wr-coach-pill" onclick="triggerCoach('Session paused for 60 seconds strategic break.')">⏸️ Pause</button>
                        <button class="wr-coach-pill" onclick="triggerCoach('AI repeating question with emphasized architectural constraints.')">🔄 Repeat</button>
                        <button class="wr-coach-pill" onclick="triggerCoach('Skipping follow-up challenge to advance to Phase 3 Scalability.')">⏭️ Skip</button>
                    </div>
                </div>
""" + post_html + "\n            </section>"

    html = html.replace(target_point, replacement_point, 1)
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Successfully injected Post-Interview Suite HTML into index.html")
else:
    print("Post-Interview Suite HTML already present.")

# 3. JS interactions for Post-Interview Suite
post_js = """
    // PROMPT 3: POST-INTERVIEW SUITE INTERACTIONS
    function setupResultsView() {
        const finishBtn = document.getElementById('wr-btn-finish');
        const liveEngine = document.getElementById('wr-live-engine');
        const resultsView = document.getElementById('wr-results-view');
        const floatingCoach = document.getElementById('wr-floating-coach');
        const backRaceBtn = document.getElementById('wr-btn-back-race');
        const configView = document.getElementById('wr-config-view');

        if (finishBtn && liveEngine && resultsView) {
            finishBtn.addEventListener('click', () => {
                liveEngine.classList.add('hidden');
                if (floatingCoach) floatingCoach.classList.add('hidden');
                resultsView.classList.remove('hidden');
                window.scrollTo(0, 0);
            });
        }

        if (backRaceBtn && resultsView && configView) {
            backRaceBtn.addEventListener('click', () => {
                resultsView.classList.add('hidden');
                configView.classList.remove('hidden');
                window.scrollTo(0, 0);
            });
        }

        // Tab Switching inside Results View
        document.querySelectorAll('.wr-res-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.wr-res-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const target = tab.getAttribute('data-res');
                document.querySelectorAll('.wr-res-panel').forEach(p => p.classList.add('hidden'));
                const targetPanel = document.getElementById(`wr-panel-${target}`);
                if (targetPanel) targetPanel.classList.remove('hidden');
            });
        });
    }

    setTimeout(setupResultsView, 400);
"""

with open("war-room.js", "r", encoding="utf-8") as f:
    js_content = f.read()

if "setupResultsView" not in js_content:
    with open("war-room.js", "a", encoding="utf-8") as f:
        f.write("\n" + post_js)
    print("Appended Post-Interview Suite JS logic to war-room.js")
else:
    print("Post-Interview Suite JS logic already present.")
