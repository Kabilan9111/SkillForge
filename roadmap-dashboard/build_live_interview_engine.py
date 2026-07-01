import os

# 1. Update war-room-styles.css with Live Engine CSS
css_path = "war-room-styles.css"
with open(css_path, "r", encoding="utf-8") as f:
    css = f.read()

live_engine_css = """
/* =========================================================
   LIVE INTERVIEW ENGINE — EXECUTIVE RACE CONTROL
   ========================================================= */

.wr-live-engine {
    background: #050505;
    color: #fff;
    min-height: calc(100vh - 48px);
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: wrLiveEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes wrLiveEnter {
    from { opacity: 0; transform: scale(0.98); }
    to   { opacity: 1; transform: scale(1); }
}

/* 1. TOP NAVBAR */
.wr-live-topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #101010;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 12px 20px;
    flex-wrap: wrap;
    gap: 12px;
}

.wr-live-top-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.wr-back-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
}

.wr-back-btn:hover {
    background: rgba(255, 77, 79, 0.15);
    border-color: #FF4D4F;
}

.wr-live-rec {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #EF4444;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
}

.wr-rec-dot {
    width: 6px;
    height: 6px;
    background: #EF4444;
    border-radius: 50%;
    animation: wrPulse 1s infinite;
}

.wr-live-modes {
    display: flex;
    gap: 6px;
    background: rgba(0, 0, 0, 0.4);
    padding: 4px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    overflow-x: auto;
}

.wr-mode-tab {
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    border: none;
    background: transparent;
}

.wr-mode-tab:hover, .wr-mode-tab.active {
    background: #FF4D4F;
    color: #fff;
    box-shadow: 0 0 12px rgba(255, 77, 79, 0.4);
}

.wr-live-top-right {
    display: flex;
    align-items: center;
    gap: 16px;
}

.wr-end-btn {
    background: #EF4444;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
}

.wr-end-btn:hover {
    background: #DC2626;
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
}

/* 2. THREE-COLUMN LIVE WORKSPACE */
.wr-live-grid {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr) 330px;
    gap: 16px;
    align-items: start;
}

@media (max-width: 1400px) {
    .wr-live-grid {
        grid-template-columns: 260px minmax(0, 1fr) 300px;
    }
}

@media (max-width: 1200px) {
    .wr-live-grid {
        grid-template-columns: 1fr;
    }
}

/* LEFT COLUMN: VIDEOS & CONTROLS */
.wr-live-left {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.wr-video-card {
    background: #101010;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 12px;
    position: relative;
    overflow: hidden;
}

.wr-video-frame {
    width: 100%;
    height: 180px;
    background: linear-gradient(145deg, #181818, #0a0a0a);
    border-radius: 12px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.wr-ai-aura {
    position: absolute;
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 77, 79, 0.35) 0%, transparent 70%);
    animation: wrPulse 2s infinite ease-in-out;
}

.wr-video-avatar {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    border: 2px solid #FF4D4F;
    object-fit: cover;
    z-index: 1;
    box-shadow: 0 0 20px rgba(255, 77, 79, 0.4);
}

.wr-video-tag {
    position: absolute;
    bottom: 8px;
    left: 8px;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.wr-audio-meter {
    display: flex;
    align-items: center;
    gap: 2px;
    height: 10px;
}

.wr-audio-bar {
    width: 2px;
    background: #10B981;
    animation: wrAudioBeat 0.6s infinite ease-in-out alternate;
}

@keyframes wrAudioBeat {
    0% { height: 2px; }
    100% { height: 10px; }
}

.wr-user-video {
    height: 120px;
    background: #141414;
}

.wr-hardware-deck {
    background: #101010;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 14px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}

.wr-hw-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #fff;
    padding: 10px 6px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
}

.wr-hw-btn:hover {
    background: rgba(255, 255, 255, 0.1);
}

.wr-hw-btn.active {
    background: rgba(16, 185, 129, 0.15);
    border-color: #10B981;
    color: #10B981;
}

.wr-timer-card {
    background: #101010;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 14px;
    text-align: center;
}

/* CENTER COLUMN: INTERACTIVE WORKSPACE */
.wr-live-center {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
}

.wr-question-panel {
    background: #101010;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 18px;
}

.wr-question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.wr-question-title {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.4;
    margin: 0 0 12px 0;
    color: #fff;
}

.wr-followup-box {
    background: rgba(255, 255, 255, 0.03);
    border-left: 3px solid #FF4D4F;
    padding: 10px 14px;
    border-radius: 0 8px 8px 0;
    margin-top: 10px;
}

.wr-followup-item {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    margin: 4px 0;
}

.wr-workspace-tabs {
    display: flex;
    gap: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 8px;
}

.wr-ws-tab {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.6);
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
}

.wr-ws-tab:hover, .wr-ws-tab.active {
    background: #181818;
    color: #fff;
    border-color: #FF4D4F;
}

.wr-workspace-area {
    background: #101010;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    min-height: 380px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.wr-ws-topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    background: #141414;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.wr-code-editor {
    flex: 1;
    background: #090909;
    padding: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    line-height: 1.6;
    color: #E5E7EB;
    overflow-y: auto;
    border: none;
    resize: none;
    width: 100%;
}

.wr-code-editor:focus {
    outline: none;
}

/* WHITEBOARD CANVAS */
.wr-canvas-toolbar {
    display: flex;
    gap: 6px;
    padding: 8px 16px;
    background: #141414;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-wrap: wrap;
}

.wr-canvas-tool {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #fff;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 11px;
    cursor: pointer;
}

.wr-canvas-tool:hover, .wr-canvas-tool.active {
    background: #FF4D4F;
    border-color: #FF4D4F;
}

.wr-canvas-grid {
    flex: 1;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
    background-size: 24px 24px;
    background-color: #0c0c0c;
    position: relative;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* RIGHT COLUMN: TELEMETRY ANALYSIS */
.wr-live-right {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.wr-telemetry-panel {
    background: #101010;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 16px;
}

.wr-tel-header {
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.wr-metric-item {
    margin-bottom: 10px;
}

.wr-metric-top {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 4px;
}

.wr-metric-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 4px;
    overflow: hidden;
}

.wr-metric-fill {
    height: 100%;
    background: #FF4D4F;
    border-radius: 4px;
    transition: width 0.5s ease;
}

/* 3. BOTTOM TIMELINE & VOICE WAVEFORM */
.wr-live-bottombar {
    background: #101010;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 16px;
    display: grid;
    grid-template-columns: 240px minmax(0, 1fr) 200px;
    gap: 20px;
    align-items: center;
}

@media (max-width: 1100px) {
    .wr-live-bottombar {
        grid-template-columns: 1fr;
    }
}

.wr-voice-dock {
    display: flex;
    align-items: center;
    gap: 12px;
}

.wr-waveform {
    display: flex;
    align-items: center;
    gap: 3px;
    height: 32px;
}

.wr-wave-bar {
    width: 3px;
    background: #FF4D4F;
    border-radius: 2px;
    animation: wrWaveAnim 0.7s infinite ease-in-out alternate;
}

@keyframes wrWaveAnim {
    0% { height: 6px; opacity: 0.5; }
    100% { height: 28px; opacity: 1; }
}

.wr-timeline-feed {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 10px 14px;
    height: 64px;
    overflow-y: auto;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.wr-msg-ai { color: #FF4D4F; font-weight: 600; }
.wr-msg-user { color: #10B981; font-weight: 600; }
.wr-msg-text { color: rgba(255, 255, 255, 0.85); }

.wr-bottom-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* 4. FLOATING AI COACH POD */
.wr-floating-coach {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 320px;
    background: rgba(16, 16, 16, 0.95);
    border: 1px solid #FF4D4F;
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 77, 79, 0.25);
    z-index: 9999;
    backdrop-filter: blur(15px);
    transition: all 0.3s;
}

.wr-coach-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 700;
    color: #FF4D4F;
}

.wr-coach-banner {
    background: rgba(255, 77, 79, 0.1);
    border-left: 3px solid #FF4D4F;
    padding: 8px 10px;
    border-radius: 0 6px 6px 0;
    font-size: 11px;
    color: #ddd;
    margin-bottom: 12px;
    line-height: 1.4;
}

.wr-coach-pills {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
}

.wr-coach-pill {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    padding: 6px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
}

.wr-coach-pill:hover {
    background: #FF4D4F;
    border-color: #FF4D4F;
}
"""

if ".wr-live-engine" not in css:
    with open(css_path, "a", encoding="utf-8") as f:
        f.write("\n" + live_engine_css)
    print("Appended Live Interview Engine CSS to war-room-styles.css")
else:
    print("Live Interview Engine CSS already present.")

# 2. Update index.html structure
html_path = "index.html"
with open(html_path, "r", encoding="utf-8") as f:
    html = f.read()

# Check if wr-config-view is already wrapped
if '<div id="wr-config-view">' not in html:
    # 1. Wrap wr-container inside wr-config-view
    target_start = '<section id="mock-interview-page" class="page-view hidden">\n                <div class="wr-container">'
    replacement_start = '<section id="mock-interview-page" class="page-view hidden">\n                <div id="wr-config-view">\n                <div class="wr-container">'
    html = html.replace(target_start, replacement_start, 1)
    
    # 2. Close wr-config-view right before SIMULATION LAUNCH MODAL
    modal_start = '                <!-- SIMULATION LAUNCH MODAL -->'
    modal_start_rep = '                </div> <!-- End wr-config-view -->\n\n                <!-- SIMULATION LAUNCH MODAL -->'
    html = html.replace(modal_start, modal_start_rep, 1)
    
    # 3. Insert wr-live-engine right after SIMULATION LAUNCH MODAL before closing </section>
    modal_end_target = """                        <div id="wr-countdown-num" style="font-size:72px; font-weight:900; color:#fff; font-family:'JetBrains Mono',monospace;">3</div>
                    </div>
                </div>
            </section>"""
    
    live_engine_html = """                        <div id="wr-countdown-num" style="font-size:72px; font-weight:900; color:#fff; font-family:'JetBrains Mono',monospace;">3</div>
                    </div>
                </div>

                <!-- ==========================================
                     LIVE INTERVIEW ENGINE VIEW (PROMPT 2)
                     ========================================== -->
                <div id="wr-live-engine" class="wr-live-engine hidden">
                    
                    <!-- 1. TOP BAR -->
                    <div class="wr-live-topbar">
                        <div class="wr-live-top-left">
                            <button class="wr-back-btn" id="wr-btn-exit-live">
                                <i class="fas fa-arrow-left"></i> End & Return to Race Control
                            </button>
                            <div class="wr-live-rec">
                                <span class="wr-rec-dot"></span>
                                <span id="wr-rec-timer">REC 00:14:22</span>
                            </div>
                            <span style="font-size:11px; color:#10B981; font-weight:700;"><i class="fas fa-shield-alt"></i> 12ms ENCRYPTED TELEMETRY</span>
                        </div>

                        <div class="wr-live-modes">
                            <button class="wr-mode-tab active" data-mode="Coding">Coding</button>
                            <button class="wr-mode-tab" data-mode="System Design">System Design</button>
                            <button class="wr-mode-tab" data-mode="Behavioral">Behavioral</button>
                            <button class="wr-mode-tab" data-mode="Architecture">Architecture</button>
                            <button class="wr-mode-tab" data-mode="Code Review">Code Review</button>
                            <button class="wr-mode-tab" data-mode="Leadership">Leadership</button>
                        </div>

                        <div class="wr-live-top-right">
                            <span style="font-size:12px; color:rgba(255,255,255,0.7);">Question 2 of 4 • <strong style="color:#fff;">Phase 2 Deep Architecture</strong></span>
                            <button class="wr-end-btn" id="wr-btn-finish">End Interview</button>
                        </div>
                    </div>

                    <!-- 2. THREE-COLUMN WORKSPACE -->
                    <div class="wr-live-grid">
                        
                        <!-- LEFT COLUMN: AI VIDEO & USER DECK -->
                        <div class="wr-live-left">
                            <div class="wr-video-card">
                                <div class="wr-video-frame">
                                    <div class="wr-ai-aura"></div>
                                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80" class="wr-video-avatar" id="wr-live-ai-avatar" alt="AI Evaluator">
                                    <div class="wr-video-tag">
                                        <i class="fas fa-microchip" style="color:#FF4D4F;"></i>
                                        <span id="wr-live-ai-name">Elena Vance (Staff Evaluator)</span>
                                        <div class="wr-audio-meter">
                                            <div class="wr-audio-bar" style="animation-delay:0.1s;"></div>
                                            <div class="wr-audio-bar" style="animation-delay:0.3s;"></div>
                                            <div class="wr-audio-bar" style="animation-delay:0.2s;"></div>
                                            <div class="wr-audio-bar" style="animation-delay:0.5s;"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="wr-video-card">
                                <div class="wr-video-frame wr-user-video">
                                    <div style="width:50px; height:50px; border-radius:50%; background:#FF4D4F; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:20px;">YOU</div>
                                    <div class="wr-video-tag" style="background:rgba(16,185,129,0.2); border-color:#10B981; color:#10B981;">
                                        <i class="fas fa-video"></i> HD 1080p60 Active
                                    </div>
                                </div>
                            </div>

                            <div class="wr-hardware-deck">
                                <button class="wr-hw-btn active" id="hw-mic">
                                    <i class="fas fa-microphone"></i>
                                    <span>Mic On</span>
                                </button>
                                <button class="wr-hw-btn active" id="hw-cam">
                                    <i class="fas fa-video"></i>
                                    <span>Cam On</span>
                                </button>
                                <button class="wr-hw-btn" id="hw-share">
                                    <i class="fas fa-desktop"></i>
                                    <span>Share Screen</span>
                                </button>
                            </div>

                            <div class="wr-timer-card">
                                <div style="font-size:11px; color:rgba(255,255,255,0.5); text-transform:uppercase; margin-bottom:4px;">Session Remaining</div>
                                <div style="font-size:28px; font-weight:800; font-family:'JetBrains Mono',monospace; color:#fff;" id="wr-session-clock">30:38</div>
                                <div style="height:4px; background:rgba(255,255,255,0.1); border-radius:2px; margin-top:8px; overflow:hidden;">
                                    <div style="width:32%; height:100%; background:#FF4D4F;"></div>
                                </div>
                            </div>
                        </div>

                        <!-- CENTER COLUMN: QUESTION & IDE/WHITEBOARD -->
                        <div class="wr-live-center">
                            <div class="wr-question-panel">
                                <div class="wr-question-header">
                                    <span style="font-size:11px; background:rgba(255,77,79,0.2); color:#FF4D4F; padding:4px 8px; border-radius:6px; font-weight:700;">🔴 CURRENT ACTIVE CHALLENGE</span>
                                    <span style="font-size:11px; color:rgba(255,255,255,0.5);">Target: Google L6 Consensus</span>
                                </div>
                                <h3 class="wr-question-title" id="wr-live-q-title">Design a High-Throughput Distributed Rate Limiter for 100M Requests/sec across Global Edge Regions</h3>
                                
                                <div class="wr-followup-box">
                                    <div style="font-size:11px; font-weight:700; color:#FF4D4F; margin-bottom:4px;">⚡ INTERROGATION FOLLOW-UPS:</div>
                                    <div class="wr-followup-item">1. How do you handle Redis cluster failover without dropping tokens during a network split?</div>
                                    <div class="wr-followup-item">2. Compare Sliding Window Log vs Token Bucket memory overhead at edge nodes.</div>
                                </div>
                            </div>

                            <div class="wr-workspace-tabs">
                                <button class="wr-ws-tab active" data-ws="code"><i class="fas fa-code"></i> Code Editor (TypeScript)</button>
                                <button class="wr-ws-tab" data-ws="canvas"><i class="fas fa-project-diagram"></i> Architecture Whiteboard</button>
                                <button class="wr-ws-tab" data-ws="notes"><i class="fas fa-edit"></i> Executive Live Notes</button>
                            </div>

                            <div class="wr-workspace-area">
                                <!-- TAB 1: CODE EDITOR -->
                                <div id="wr-view-code" style="display:flex; flex-direction:column; flex:1;">
                                    <div class="wr-ws-topbar">
                                        <span style="font-size:12px; font-family:'JetBrains Mono',monospace; color:#10B981;">● global_edge_limiter.ts</span>
                                        <div style="display:flex; gap:8px;">
                                            <span style="font-size:11px; background:rgba(255,255,255,0.05); padding:4px 8px; border-radius:4px;">Complexity: O(1)</span>
                                            <button style="background:#10B981; color:#fff; border:none; padding:4px 12px; border-radius:4px; font-size:11px; font-weight:700; cursor:pointer;" onclick="alert('Simulation Test Bench Passed: 100,000 req/sec verified!')">▶ Run Test Bench</button>
                                        </div>
                                    </div>
                                    <textarea class="wr-code-editor" id="wr-live-code-area">// Distributed Sliding Window Rate Limiter — Global Edge Implementation
interface RateLimitRequest {
    clientId: string;
    timestamp: number;
    tokensRequired: number;
}

export class GlobalEdgeRateLimiter {
    private redisPool: any;
    private readonly maxTokensPerWindow = 10000;
    private readonly windowDurationMs = 1000;

    constructor(clusterEndpoints: string[]) {
        // Initialize high-concurrency Redis cluster pool with local L1 cache fallback
    }

    public async allowRequest(req: RateLimitRequest): Promise<boolean> {
        const windowKey = `rl:${req.clientId}:${Math.floor(req.timestamp / this.windowDurationMs)}`;
        // TODO: Implement atomic Lua script evaluation to prevent race conditions at edge
        return true;
    }
}</textarea>
                                </div>

                                <!-- TAB 2: ARCHITECTURE WHITEBOARD -->
                                <div id="wr-view-canvas" style="display:none; flex-direction:column; flex:1;">
                                    <div class="wr-canvas-toolbar">
                                        <button class="wr-canvas-tool active"><i class="fas fa-mouse-pointer"></i> Select</button>
                                        <button class="wr-canvas-tool"><i class="fas fa-square"></i> Microservice Box</button>
                                        <button class="wr-canvas-tool"><i class="fas fa-database"></i> Redis Cluster</button>
                                        <button class="wr-canvas-tool"><i class="fas fa-cloud"></i> Edge Gateway</button>
                                        <button class="wr-canvas-tool"><i class="fas fa-long-arrow-alt-right"></i> Async Kafka Stream</button>
                                        <button class="wr-canvas-tool" style="color:#EF4444;" onclick="alert('Canvas cleared for new topology drawing!')">Clear</button>
                                    </div>
                                    <div class="wr-canvas-grid">
                                        <div style="background:#141414; border:2px solid #FF4D4F; padding:20px; border-radius:12px; text-align:center; box-shadow:0 0 30px rgba(255,77,79,0.2);">
                                            <div style="font-weight:800; color:#FF4D4F; margin-bottom:8px;">[EDGE API GATEWAY (Cloudflare)]</div>
                                            <div style="font-size:12px; color:#aaa;">Anycast Routing • 100M Req/s</div>
                                            <div style="margin:12px 0; color:#10B981;"><i class="fas fa-arrow-down"></i> Local CRDT Token Sync <i class="fas fa-arrow-down"></i></div>
                                            <div style="background:#1e1e1e; border:1px solid #10B981; padding:10px; border-radius:8px; font-size:12px; font-weight:700;">[SHARDED REDIS CLUSTER + LUA ATOMIC LOCKS]</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- TAB 3: EXECUTIVE LIVE NOTES -->
                                <div id="wr-view-notes" style="display:none; flex-direction:column; flex:1;">
                                    <div class="wr-ws-topbar">
                                        <span style="font-size:12px; color:#aaa;">Executive Scratchpad & Assumptions</span>
                                    </div>
                                    <textarea class="wr-code-editor" style="font-family:'Inter',sans-serif;">• Assumption 1: 99.999% availability required across 3 geographic zones.
• Trade-off: Strong consistency vs Low Latency. For edge rate limiting, eventual consistency (CRDT) is preferred over synchronous quorum consensus.
• Memory footprint: 100M active tokens require ~1.2GB memory per node.</textarea>
                                </div>
                            </div>
                        </div>

                        <!-- RIGHT COLUMN: TELEMETRY ANALYSIS -->
                        <div class="wr-live-right">
                            <div class="wr-telemetry-panel">
                                <div class="wr-tel-header">
                                    <span><i class="fas fa-chart-line" style="color:#FF4D4F;"></i> Live Evaluation Telemetry</span>
                                    <span style="font-size:16px; font-weight:800; font-family:'JetBrains Mono',monospace; color:#10B981;">91.4%</span>
                                </div>

                                <div class="wr-metric-item">
                                    <div class="wr-metric-top"><span>Confidence & Composure</span><span>94%</span></div>
                                    <div class="wr-metric-bar"><div class="wr-metric-fill" style="width:94%;"></div></div>
                                </div>

                                <div class="wr-metric-item">
                                    <div class="wr-metric-top"><span>Technical Depth (Staff Bar)</span><span>89%</span></div>
                                    <div class="wr-metric-bar"><div class="wr-metric-fill" style="width:89%;"></div></div>
                                </div>

                                <div class="wr-metric-item">
                                    <div class="wr-metric-top"><span>Communication Cadence</span><span>142 WPM (Ideal)</span></div>
                                    <div class="wr-metric-bar"><div class="wr-metric-fill" style="width:95%; background:#10B981;"></div></div>
                                </div>

                                <div class="wr-metric-item">
                                    <div class="wr-metric-top"><span>Problem Solving & Trade-offs</span><span>92%</span></div>
                                    <div class="wr-metric-bar"><div class="wr-metric-fill" style="width:92%;"></div></div>
                                </div>

                                <div class="wr-metric-item">
                                    <div class="wr-metric-top"><span>Executive Leadership Voice</span><span>88%</span></div>
                                    <div class="wr-metric-bar"><div class="wr-metric-fill" style="width:88%;"></div></div>
                                </div>
                            </div>

                            <div class="wr-telemetry-panel">
                                <div class="wr-tel-header" style="margin-bottom:8px;">
                                    <span><i class="fas fa-stopwatch" style="color:#F59E0B;"></i> Deliberation Telemetry</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;">
                                    <span style="color:#aaa;">Avg Thinking Before Reply:</span>
                                    <strong style="color:#fff;">01.4s</strong>
                                </div>
                                <div style="display:flex; justify-content:space-between; font-size:12px;">
                                    <span style="color:#aaa;">Current Interrogation Topic:</span>
                                    <strong style="color:#FF4D4F;">Consensus Protocols</strong>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- 3. BOTTOM TIMELINE & AUDIO DOCK -->
                    <div class="wr-live-bottombar">
                        <div class="wr-voice-dock">
                            <div style="width:40px; height:40px; border-radius:10px; background:rgba(255,77,79,0.15); border:1px solid #FF4D4F; display:flex; align-items:center; justify-content:center; color:#FF4D4F;">
                                <i class="fas fa-wave-square"></i>
                            </div>
                            <div>
                                <div style="font-size:12px; font-weight:700;">AI Interrogation Audio</div>
                                <div class="wr-waveform">
                                    <div class="wr-wave-bar" style="animation-delay:0.1s;"></div>
                                    <div class="wr-wave-bar" style="animation-delay:0.4s;"></div>
                                    <div class="wr-wave-bar" style="animation-delay:0.2s;"></div>
                                    <div class="wr-wave-bar" style="animation-delay:0.6s;"></div>
                                    <div class="wr-wave-bar" style="animation-delay:0.3s;"></div>
                                    <div class="wr-wave-bar" style="animation-delay:0.5s;"></div>
                                    <div class="wr-wave-bar" style="animation-delay:0.1s;"></div>
                                    <div class="wr-wave-bar" style="animation-delay:0.4s;"></div>
                                </div>
                            </div>
                        </div>

                        <div class="wr-timeline-feed" id="wr-timeline-feed">
                            <div><span class="wr-msg-ai">14:02 • AI (Elena Vance):</span> <span class="wr-msg-text">"Your token bucket approach works for single node. How do you synchronize state across US-East and EU-Central edge locations under 10ms?"</span></div>
                            <div><span class="wr-msg-user">14:15 • You:</span> <span class="wr-msg-text">"We utilize local edge token estimation with background CRDT synchronization to avoid cross-region locking overhead..."</span></div>
                        </div>

                        <div class="wr-bottom-actions">
                            <button style="background:rgba(245,158,11,0.15); border:1px solid #F59E0B; color:#F59E0B; padding:8px; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer;" onclick="alert('⭐ Moment bookmarked to Executive After-Action Report!')"><i class="fas fa-star"></i> Bookmark Moment</button>
                            <button style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:6px; border-radius:8px; font-size:11px; cursor:pointer;" id="wr-btn-pause"><i class="fas fa-pause"></i> Pause Session</button>
                        </div>
                    </div>

                </div> <!-- End wr-live-engine -->

                <!-- FLOATING AI COACH POD -->
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
    
    html = html.replace(modal_end_target, live_engine_html, 1)
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)
    print("Successfully injected Live Interview Engine HTML into index.html")
else:
    print("Live Interview Engine HTML already present.")

# 3. Update war-room.js with Live Engine transitions & interactions
js_path = "war-room.js"
with open(js_path, "r", encoding="utf-8") as f:
    js = f.read()

live_js = """
    // LIVE INTERVIEW ENGINE INTERACTIONS
    window.triggerCoach = function(msg) {
        const banner = document.getElementById('wr-coach-msg');
        if (banner) banner.textContent = msg;
        
        const timeline = document.getElementById('wr-timeline-feed');
        if (timeline) {
            const div = document.createElement('div');
            div.innerHTML = `<span style="color:#F59E0B; font-weight:700;">🤖 AI Coach Advice:</span> <span class="wr-msg-text">${msg}</span>`;
            timeline.appendChild(div);
            timeline.scrollTop = timeline.scrollHeight;
        }
    };

    function setupLiveEngine() {
        const startBtn = document.getElementById('wr-start-btn');
        const modal = document.getElementById('wr-simulation-modal');
        const configView = document.getElementById('wr-config-view');
        const liveEngine = document.getElementById('wr-live-engine');
        const floatingCoach = document.getElementById('wr-floating-coach');

        if (startBtn && modal && configView && liveEngine) {
            // Override previous click listener
            const newStartBtn = startBtn.cloneNode(true);
            startBtn.parentNode.replaceChild(newStartBtn, startBtn);

            newStartBtn.addEventListener('click', () => {
                modal.style.display = 'flex';
                let count = 3;
                const counterEl = document.getElementById('wr-countdown-num');
                const statusEl = document.getElementById('wr-countdown-status');
                
                const steps = [
                    "STARTING SECURE SESSION RECORDING...",
                    "CONNECTING ULTRA-HD ENCRYPTED TELEMETRY...",
                    "GENERATING CUSTOM SYSTEMS ARCHITECTURE CHALLENGES...",
                    "PREPARING EXECUTIVE INTERVIEW ENVIRONMENT..."
                ];

                const interval = setInterval(() => {
                    count--;
                    if (count > 0) {
                        counterEl.textContent = count;
                        statusEl.textContent = steps[count] || "SYNCHRONIZING AI AUDIO CHANNELS...";
                    } else if (count === 0) {
                        counterEl.textContent = "LAUNCH!";
                        statusEl.textContent = "INTERVIEW STARTED! ENTERING WAR ROOM ENGINE.";
                    } else {
                        clearInterval(interval);
                        modal.style.display = 'none';
                        configView.classList.add('hidden');
                        liveEngine.classList.remove('hidden');
                        if (floatingCoach) floatingCoach.classList.remove('hidden');
                        
                        // Update AI Persona in Live Engine
                        const aiNameEl = document.getElementById('wr-live-ai-name');
                        if (aiNameEl) aiNameEl.textContent = `${currentPersona} (${currentCompany} Evaluator)`;
                    }
                }, 1000);
            });
        }

        // Exit Live Engine Button
        const exitBtn = document.getElementById('wr-btn-exit-live');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                const configView = document.getElementById('wr-config-view');
                const liveEngine = document.getElementById('wr-live-engine');
                const floatingCoach = document.getElementById('wr-floating-coach');
                if (liveEngine) liveEngine.classList.add('hidden');
                if (floatingCoach) floatingCoach.classList.add('hidden');
                if (configView) configView.classList.remove('hidden');
            });
        }

        // Workspace Tab Switcher (Code vs Canvas vs Notes)
        document.querySelectorAll('.wr-ws-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.wr-ws-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const target = tab.getAttribute('data-ws');
                document.getElementById('wr-view-code').style.display = (target === 'code') ? 'flex' : 'none';
                document.getElementById('wr-view-canvas').style.display = (target === 'canvas') ? 'flex' : 'none';
                document.getElementById('wr-view-notes').style.display = (target === 'notes') ? 'flex' : 'none';
            });
        });

        // Mode Switcher Tabs
        document.querySelectorAll('.wr-mode-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.wr-mode-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const mode = tab.getAttribute('data-mode');
                const qTitle = document.getElementById('wr-live-q-title');
                if (qTitle) {
                    if (mode === 'System Design') qTitle.textContent = "Design a High-Throughput Distributed Rate Limiter for 100M Requests/sec across Global Edge Regions";
                    else if (mode === 'Coding') qTitle.textContent = "Hard Coding: Implement LRU Cache with O(1) Expiration & Sharded Concurrency Locks";
                    else if (mode === 'Behavioral') qTitle.textContent = "Tell me about a time you had to push back against executive leadership when an architectural decision endangered system reliability.";
                    else if (mode === 'Architecture') qTitle.textContent = "Architect an Active-Active Multi-Region Database Consensus Tier for Stripe Payments";
                    else if (mode === 'Code Review') qTitle.textContent = "Review this PR: Identify race conditions in async memory management and propose thread-safe primitives.";
                    else if (mode === 'Leadership') qTitle.textContent = "How do you allocate engineering headcount between paying down technical debt vs shipping new enterprise features under tight deadlines?";
                }
            });
        });
    }

    // Call setupLiveEngine on load
    setTimeout(setupLiveEngine, 300);
"""

if "setupLiveEngine" not in js:
    with open(js_path, "a", encoding="utf-8") as f:
        f.write("\n" + live_js)
    print("Appended Live Engine interaction logic to war-room.js")
else:
    print("Live Engine JS logic already present.")
