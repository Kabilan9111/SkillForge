import os

# 1. CSS for War Room V2 Dashboard
v2_css = """
/* =========================================================
   WAR ROOM V2: APPLE WWDC / OPENAI VOICE ENTERPRISE EDITION
   ========================================================= */

.wr-v2-toggle-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin: 16px 0 24px 0;
}

.wr-v2-toggle-btn {
    background: #101010;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    padding: 10px 20px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    align-items: center;
    gap: 8px;
}

.wr-v2-toggle-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
}

.wr-v2-toggle-btn.active {
    background: linear-gradient(135deg, #FF4D4F, #ff6b6d);
    color: #fff;
    border-color: #FF4D4F;
    box-shadow: 0 0 25px rgba(255, 77, 79, 0.4);
}

.wr-v2-container {
    background: #050505;
    color: #fff;
    height: calc(100vh - 48px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: wrLiveEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    user-select: none;
}

.wr-v2-topbar {
    height: 56px;
    background: rgba(16, 16, 16, 0.9);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    z-index: 40;
}

.wr-v2-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 290px minmax(0, 1fr) 340px;
    gap: 14px;
    padding: 14px;
    min-height: 0;
    overflow: hidden;
}

@media (max-width: 1200px) {
    .wr-v2-grid {
        grid-template-columns: 1fr;
        overflow-y: auto;
    }
    .wr-v2-container {
        height: auto;
        overflow: visible;
    }
}

.wr-v2-left, .wr-v2-center, .wr-v2-right {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 0;
    overflow: hidden;
}

.wr-v2-right {
    overflow-y: auto;
    padding-right: 4px;
}

.wr-v2-card {
    background: #161616;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 16px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

/* AVATAR RINGS */
@keyframes v2PulseOuter {
    0%, 100% { transform: scale(1); opacity: 0.2; }
    50% { transform: scale(1.3); opacity: 0.6; }
}

@keyframes v2PulseInner {
    0%, 100% { transform: scale(1); opacity: 0.4; }
    50% { transform: scale(1.15); opacity: 0.8; }
}

.wr-v2-avatar-ring-outer {
    position: absolute;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 1px solid rgba(255, 77, 79, 0.4);
    background: rgba(255, 77, 79, 0.04);
    animation: v2PulseOuter 2.5s infinite ease-in-out;
}

.wr-v2-avatar-ring-inner {
    position: absolute;
    width: 125px;
    height: 125px;
    border-radius: 50%;
    border: 1px solid rgba(255, 77, 79, 0.6);
    animation: v2PulseInner 2s infinite ease-in-out;
}

.wr-v2-avatar-core {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: linear-gradient(135deg, #202020, #080808);
    border: 2px solid rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 10;
    box-shadow: 0 0 30px rgba(255, 77, 79, 0.3);
}

.wr-v2-wave-bars {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 24px;
}

@keyframes v2BarDance {
    0%, 100% { height: 6px; }
    50% { height: 20px; }
}

.wr-v2-wave-bar {
    width: 3px;
    background: #FF4D4F;
    border-radius: 99px;
    animation: v2BarDance 1.2s infinite ease-in-out;
}

/* VOICE CORE CENTER */
.wr-v2-question-stage {
    background: #161616;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 24px;
    flex-shrink: 0;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
}

.wr-v2-conv-box {
    flex: 1;
    background: #101010;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 0;
    overflow: hidden;
}

.wr-v2-stream {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding-right: 8px;
}

.wr-v2-msg {
    max-width: 85%;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.wr-v2-msg.ai {
    align-self: flex-start;
}

.wr-v2-msg.user {
    align-self: flex-end;
    align-items: flex-end;
}

.wr-v2-bubble {
    padding: 14px 18px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.6;
}

.wr-v2-msg.ai .wr-v2-bubble {
    background: #161616;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    border-top-left-radius: 4px;
}

.wr-v2-msg.user .wr-v2-bubble {
    background: linear-gradient(135deg, rgba(255, 77, 79, 0.2), rgba(255, 77, 79, 0.1));
    border: 1px solid rgba(255, 77, 79, 0.4);
    color: #fff;
    font-weight: 500;
    border-top-right-radius: 4px;
}

.wr-v2-voice-orb {
    background: linear-gradient(135deg, #FF4D4F, #ff6b6d);
    border: none;
    color: #fff;
    padding: 14px 32px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 0 35px rgba(255, 77, 79, 0.5);
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.2s;
}

.wr-v2-voice-orb:hover {
    transform: scale(1.03);
    box-shadow: 0 0 45px rgba(255, 77, 79, 0.7);
}

/* RIGHT EVALUATION */
.wr-v2-metric-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 10px;
}

.wr-v2-progress-bg {
    width: 100%;
    height: 6px;
    background: #101010;
    border-radius: 999px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.wr-v2-progress-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.8s ease-out;
}

/* GRAMMARLY COACH POD */
.wr-v2-coach-pod {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 320px;
    background: rgba(16, 16, 16, 0.95);
    border: 1px solid #FF4D4F;
    border-radius: 20px;
    padding: 16px;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(20px);
    z-index: 100;
}
"""

with open("war-room-styles.css", "r", encoding="utf-8") as f:
    css = f.read()
if ".wr-v2-container" not in css:
    with open("war-room-styles.css", "a", encoding="utf-8") as f:
        f.write("\n" + v2_css)
    print("Appended V2 CSS to war-room-styles.css")

# 2. HTML for War Room V2 Toggle and View inside Dashboard
v2_html = """
                <!-- V2 APPLE/OPENAI VOICE INTERVIEW ENGINE VIEW -->
                <div id="wr-v2-view" class="wr-v2-container hidden">
                    
                    <!-- TOP BAR -->
                    <div class="wr-v2-topbar">
                        <div style="display:flex; align-items:center; gap:16px;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#FF4D4F; box-shadow:0 0 10px #FF4D4F;"></span>
                                <span style="font-weight:900; font-size:16px; letter-spacing:-0.5px;">WAR ROOM <span style="color:#FF4D4F; font-family:'JetBrains Mono',monospace; font-size:12px;">V2</span></span>
                            </div>
                            <span style="color:rgba(255,255,255,0.2);">|</span>
                            <select id="wr-v2-track-sel" style="background:#181818; border:1px solid rgba(255,255,255,0.1); color:#fff; padding:6px 12px; border-radius:8px; font-size:12px; font-weight:700;">
                                <option value="OS">Operating Systems (Staff L6 Track)</option>
                                <option value="Distributed">Distributed Systems & Consensus</option>
                                <option value="SystemDesign">System Design (Principal L7 Bar)</option>
                                <option value="Networks">Computer Networks & Edge Proxies</option>
                                <option value="DBMS">DBMS & Storage Architecture</option>
                                <option value="Behavioral">Executive Leadership & Behavioral</option>
                            </select>
                        </div>

                        <div style="display:flex; align-items:center; gap:12px; font-size:11px; font-family:'JetBrains Mono',monospace; color:rgba(255,255,255,0.7);">
                            <span style="color:#00D97E;">✓ 12ms ENCRYPTED TELEMETRY</span>
                            <span>•</span>
                            <span style="color:#4DA3FF;">OPENAI VOICE SYNTHESIS ACTIVE</span>
                        </div>

                        <div style="display:flex; align-items:center; gap:12px;">
                            <span id="wr-v2-timer" style="font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:800; background:#161616; border:1px solid rgba(255,255,255,0.1); px:12px; padding:6px 12px; border-radius:8px;">30:38</span>
                            <button class="wr-btn-primary" id="wr-v2-end-btn" style="padding:6px 16px; font-size:12px;">
                                <i class="fas fa-phone-slash"></i> End Interview
                            </button>
                            <button class="wr-btn-secondary" id="wr-v2-back-btn" style="padding:6px 12px; font-size:12px;">
                                <i class="fas fa-arrow-left"></i> Race Control V1
                            </button>
                        </div>
                    </div>

                    <!-- 3-COLUMN CINEMATIC GRID -->
                    <div id="wr-v2-stage" class="wr-v2-grid">
                        
                        <!-- LEFT COLUMN: AI INTERVIEWER & RIG -->
                        <div class="wr-v2-left">
                            <div class="wr-v2-card" style="flex:1; display:flex; flex-direction:column; justify-content:space-between; align-items:center; text-align:center;">
                                <div style="width:100%; display:flex; justify-content:space-between; font-size:10px; font-family:'JetBrains Mono',monospace; color:rgba(255,255,255,0.6);">
                                    <span>AI EVALUATOR</span>
                                    <span style="color:#00D97E;">60 FPS NEURAL RIG</span>
                                </div>

                                <div style="position:relative; width:160px; height:160px; display:flex; align-items:center; justify-content:center; margin:16px 0;">
                                    <div class="wr-v2-avatar-ring-outer"></div>
                                    <div class="wr-v2-avatar-ring-inner"></div>
                                    <div class="wr-v2-avatar-core">
                                        <i class="fas fa-sparkles" style="font-size:32px; color:#FF4D4F;"></i>
                                    </div>
                                    <div style="position:absolute; bottom:0; background:#101010; border:1px solid rgba(255,255,255,0.2); padding:4px 12px; border-radius:99px; font-size:11px; font-weight:800; z-index:20;">
                                        Speaking...
                                    </div>
                                </div>

                                <div>
                                    <h3 style="font-size:16px; font-weight:800; margin:0;">Elena Vance</h3>
                                    <span style="font-size:12px; color:#8B8B8B;">Principal OS Evaluator @ Google</span>
                                    <div class="wr-v2-wave-bars" style="justify-content:center; margin-top:12px;">
                                        <span class="wr-v2-wave-bar" style="animation-delay:0.1s;"></span>
                                        <span class="wr-v2-wave-bar" style="animation-delay:0.3s; height:18px;"></span>
                                        <span class="wr-v2-wave-bar" style="animation-delay:0.2s;"></span>
                                        <span class="wr-v2-wave-bar" style="animation-delay:0.5s; height:22px;"></span>
                                        <span class="wr-v2-wave-bar" style="animation-delay:0.15s;"></span>
                                        <span class="wr-v2-wave-bar" style="animation-delay:0.4s; height:16px;"></span>
                                    </div>
                                </div>

                                <div style="width:100%; background:#101010; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px; text-align:left; font-size:11px; display:flex; flex-direction:column; gap:6px;">
                                    <div style="display:flex; justify-content:space-between;"><span>Level</span><strong style="color:#fff;">Google Staff Engineer</strong></div>
                                    <div style="display:flex; justify-content:space-between;"><span>Track</span><strong id="wr-v2-track-txt">Operating Systems</strong></div>
                                    <div style="display:flex; justify-content:space-between;"><span>Progress</span><strong style="color:#FF4D4F;">Question 3 / 10</strong></div>
                                    <div style="display:flex; justify-content:space-between;"><span>Topic</span><strong style="color:#00D97E;">Deadlock Prevention</strong></div>
                                </div>
                            </div>

                            <div class="wr-v2-card" style="padding:12px; display:flex; flex-direction:column; gap:10px;">
                                <div style="display:flex; justify-content:space-between; font-size:10px; font-family:'JetBrains Mono',monospace;">
                                    <span style="color:#8B8B8B;">CANDIDATE CAMERA RIG</span>
                                    <span style="color:#00D97E;">MIRROR ON</span>
                                </div>
                                <div style="height:110px; background:#080808; border-radius:12px; border:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; items-center; justify-content:center; text-align:center; position:relative;">
                                    <div style="width:40px; height:40px; border-radius:50%; background:rgba(0,217,126,0.15); border:1px solid #00D97E; display:flex; align-items:center; justify-content:center; margin:0 auto 6px auto;">
                                        <i class="fas fa-eye" style="color:#00D97E;"></i>
                                    </div>
                                    <span style="font-size:11px; font-weight:700;">Eye Contact: 94% • Pose: Centered</span>
                                    <div style="position:absolute; top:6px; left:6px; font-size:9px; background:rgba(0,0,0,0.6); px:6px; padding:2px 6px; border-radius:4px; border:1px solid rgba(255,255,255,0.1);">✓ Background Blur</div>
                                    <div style="position:absolute; top:6px; right:6px; font-size:9px; background:rgba(0,0,0,0.6); px:6px; padding:2px 6px; border-radius:4px; border:1px solid rgba(255,255,255,0.1); color:#00D97E;">✓ Noise Suppr.</div>
                                </div>
                            </div>
                        </div>

                        <!-- CENTER COLUMN: THE VOICE CORE -->
                        <div class="wr-v2-center">
                            <div class="wr-v2-question-stage">
                                <div style="display:flex; justify-content:space-between; font-size:11px; font-family:'JetBrains Mono',monospace; color:#FF4D4F; margin-bottom:10px;">
                                    <span>⚡ PHASE 2: DEEP ARCHITECTURAL INTERROGATION</span>
                                    <span style="color:#8B8B8B;">VOICE FIRST • NO CODE EDITOR</span>
                                </div>
                                <h1 id="wr-v2-q-text" style="font-size:20px; font-weight:800; line-height:1.5; margin:0;">
                                    "We have two worker threads acquiring locks A and B in reverse order under high load. Explain how you would architect deadlock prevention without sacrificing high concurrency at edge scale."
                                </h1>
                            </div>

                            <div class="wr-v2-conv-box">
                                <div id="wr-v2-stream" class="wr-v2-stream">
                                    <div class="wr-v2-msg ai">
                                        <span style="font-size:11px; color:#8B8B8B; font-family:'JetBrains Mono',monospace;">🤖 Elena Vance (AI) • 00:14</span>
                                        <div class="wr-v2-bubble">
                                            Suppose two high-throughput threads acquire resource locks A and B in opposite sequence. How would you architect a deadlock prevention mechanism without degrading throughput?
                                        </div>
                                    </div>
                                    <div class="wr-v2-msg user">
                                        <span style="font-size:11px; color:#8B8B8B; font-family:'JetBrains Mono',monospace;">🎙️ Candidate Voice • 01:05</span>
                                        <div class="wr-v2-bubble">
                                            To avoid circular wait without global locking overhead, I enforce strict hierarchical lock ordering across memory addresses or utilize non-blocking try-lock primitives with exponential backoff and jitter.
                                        </div>
                                    </div>
                                </div>

                                <div style="pt:16px; border-top:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; align-items:center; gap:12px; margin-top:14px;">
                                    <button class="wr-v2-voice-orb" id="wr-v2-speak-btn">
                                        <i class="fas fa-microphone"></i> Active Voice Stream • Tap to Answer
                                    </button>
                                    <div style="display:flex; gap:10px;">
                                        <button class="wr-btn-secondary" style="padding:6px 14px; font-size:12px;" onclick="alert('Asking AI evaluator for clarifying constraints...')"><i class="fas fa-question-circle text-[#4DA3FF]"></i> Ask Clarification</button>
                                        <button class="wr-btn-secondary" style="padding:6px 14px; font-size:12px;" onclick="alert('AI repeating prompt with emphasized architectural constraints...')"><i class="fas fa-volume-up text-[#00D97E]"></i> Replay Prompt</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- RIGHT COLUMN: CONTINUOUS AI TELEMETRY -->
                        <div class="wr-v2-right">
                            <div class="wr-v2-card">
                                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                    <span style="font-size:11px; font-family:'JetBrains Mono',monospace; font-weight:700; color:#FF4D4F;">LIVE AI TELEMETRY</span>
                                    <span style="font-size:10px; font-weight:800; color:#00D97E; background:rgba(0,217,126,0.15); px:6px; padding:2px 6px; border-radius:4px;">STRONG HIRE BAR</span>
                                </div>
                                <div style="display:flex; align-items:baseline; gap:8px;">
                                    <span style="font-size:36px; font-family:'JetBrains Mono',monospace; font-weight:900;">94.2</span>
                                    <span style="font-size:14px; color:#00D97E; font-weight:700;">Grade A+</span>
                                </div>
                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px; font-size:11px;">
                                    <div style="background:#101010; p:8px; padding:8px; border-radius:8px;"><span>Speaking Pace</span><br><strong style="font-size:14px; color:#fff;">142 WPM</strong></div>
                                    <div style="background:#101010; p:8px; padding:8px; border-radius:8px;"><span>Filler Words</span><br><strong style="font-size:14px; color:#00D97E;">2 / min</strong></div>
                                </div>
                            </div>

                            <div class="wr-v2-card">
                                <span style="font-size:11px; font-family:'JetBrains Mono',monospace; font-weight:700; color:#8B8B8B; display:block; margin-bottom:12px;">CONTINUOUS EVALUATION SCORECARD</span>
                                
                                <div class="wr-v2-metric-row"><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;"><span>Confidence</span><strong style="color:#00D97E;">94%</strong></div><div class="wr-v2-progress-bg"><div class="wr-v2-progress-fill" style="width:94%; background:#00D97E;"></div></div></div>
                                <div class="wr-v2-metric-row"><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;"><span>Communication Cadence</span><strong style="color:#4DA3FF;">96%</strong></div><div class="wr-v2-progress-bg"><div class="wr-v2-progress-fill" style="width:96%; background:#4DA3FF;"></div></div></div>
                                <div class="wr-v2-metric-row"><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;"><span>Technical Accuracy</span><strong style="color:#FF4D4F;">91%</strong></div><div class="wr-v2-progress-bg"><div class="wr-v2-progress-fill" style="width:91%; background:#FF4D4F;"></div></div></div>
                                <div class="wr-v2-metric-row"><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;"><span>Depth of Knowledge</span><strong style="color:#FFC857;">89%</strong></div><div class="wr-v2-progress-bg"><div class="wr-v2-progress-fill" style="width:89%; background:#FFC857;"></div></div></div>
                                <div class="wr-v2-metric-row"><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;"><span>Problem Solving Bar</span><strong style="color:#00D97E;">92%</strong></div><div class="wr-v2-progress-bg"><div class="wr-v2-progress-fill" style="width:92%; background:#00D97E;"></div></div></div>
                                <div class="wr-v2-metric-row"><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;"><span>Executive Leadership</span><strong style="color:#4DA3FF;">90%</strong></div><div class="wr-v2-progress-bg"><div class="wr-v2-progress-fill" style="width:90%; background:#4DA3FF;"></div></div></div>
                                <div class="wr-v2-metric-row"><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;"><span>Vocabulary & Diction</span><strong style="color:#00D97E;">95%</strong></div><div class="wr-v2-progress-bg"><div class="wr-v2-progress-fill" style="width:95%; background:#00D97E;"></div></div></div>
                                <div class="wr-v2-metric-row"><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;"><span>HD Voice Clarity</span><strong style="color:#00D97E;">98%</strong></div><div class="wr-v2-progress-bg"><div class="wr-v2-progress-fill" style="width:98%; background:#00D97E;"></div></div></div>
                            </div>
                        </div>

                    </div>

                    <!-- V2 POST-INTERVIEW REPORT SCREEN -->
                    <div id="wr-v2-report" class="hidden" style="flex:1; overflow-y:auto; padding:32px; max-width:1200px; margin:0 auto;">
                        <div style="background:linear-gradient(135deg,#161616,#101010); border:1px solid rgba(0,217,126,0.4); border-radius:24px; padding:32px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;">
                            <div>
                                <span style="background:rgba(0,217,126,0.15); color:#00D97E; font-weight:800; font-size:12px; px:12px; padding:6px 14px; border-radius:99px; border:1px solid #00D97E;">STRONG HIRE (L6 STAFF BAR)</span>
                                <h1 style="font-size:36px; font-weight:900; margin:12px 0 4px 0;">Executive Evaluation Report</h1>
                                <span style="color:#8B8B8B; font-size:14px;">Interrogator: Elena Vance (OpenAI Voice Engine) • Apple WWDC Rig</span>
                            </div>
                            <div style="display:flex; gap:12px;">
                                <button class="wr-btn-secondary" onclick="alert('📑 Downloading candidate executive dossier PDF...')"><i class="fas fa-file-pdf text-[#FF4D4F]"></i> Download PDF</button>
                                <button class="wr-btn-primary" onclick="alert('🔗 Verified URL copied to clipboard!')"><i class="fas fa-share-alt"></i> Share Report</button>
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:16px; margin-top:20px;">
                            <div class="wr-v2-card"><span style="color:#8B8B8B; font-size:11px;">OVERALL SCORE</span><div style="font-size:42px; font-weight:900; color:#fff; font-family:'JetBrains Mono',monospace;">94.2 <span style="font-size:16px; color:#00D97E;">Grade A+</span></div></div>
                            <div class="wr-v2-card"><span style="color:#8B8B8B; font-size:11px;">STRONGEST TOPIC</span><div style="font-size:20px; font-weight:800; color:#00D97E; margin-top:8px;">Deadlock Prevention</div></div>
                            <div class="wr-v2-card"><span style="color:#8B8B8B; font-size:11px;">WEAKEST TOPIC</span><div style="font-size:20px; font-weight:800; color:#FFC857; margin-top:8px;">Distributed Lock Election</div></div>
                        </div>

                        <div style="margin-top:24px; text-align:center;">
                            <button class="wr-btn-secondary" id="wr-v2-restart-btn" style="margin:0 auto;"><i class="fas fa-redo"></i> Launch Another Executive Session</button>
                        </div>
                    </div>

                    <!-- GRAMMARLY COACH POD -->
                    <div id="wr-v2-coach" class="wr-v2-coach-pod">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <span style="font-weight:800; font-size:12px; color:#fff;"><i class="fas fa-sparkles text-[#FF4D4F]"></i> AI STRATEGIC COACH</span>
                            <span style="font-size:10px; color:#00D97E; font-family:'JetBrains Mono',monospace;">GRAMMARLY ENGINE</span>
                        </div>
                        <div id="wr-v2-coach-tip" style="background:rgba(0,217,126,0.1); border:1px solid rgba(0,217,126,0.3); padding:10px; border-radius:10px; font-size:12px; line-height:1.4; color:#fff; margin-bottom:10px;">
                            ✨ Excellent communication and clean cadence.
                        </div>
                        <div style="display:flex; gap:6px;">
                            <button class="wr-btn-secondary" style="flex:1; justify-content:center; padding:6px; font-size:11px;" onclick="document.getElementById('wr-v2-coach-tip').innerHTML='💡 Hint: Mention convoy effect and thread starvation.'">💡 Hint</button>
                            <button class="wr-btn-secondary" style="flex:1; justify-content:center; padding:6px; font-size:11px;" onclick="alert('AI repeating prompt...')">🔄 Repeat</button>
                            <button class="wr-btn-secondary" style="flex:1; justify-content:center; padding:6px; font-size:11px;" id="wr-v2-coach-skip">⏭️ Skip</button>
                        </div>
                    </div>

                </div> <!-- End wr-v2-view -->
"""

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Add switcher button to top of wr-config-view hero
if 'wr-v2-toggle-bar' not in html:
    hero_target = '<div class="wr-hero">'
    hero_replacement = """<div class="wr-v2-toggle-bar">
                        <button class="wr-v2-toggle-btn active" id="wr-toggle-v1"><i class="fas fa-satellite-dish"></i> V1 Race Control Engine</button>
                        <button class="wr-v2-toggle-btn" id="wr-toggle-v2" style="border-color:#FF4D4F; color:#fff;"><i class="fas fa-apple-alt"></i> V2 Apple / OpenAI Voice Experience (NEW)</button>
                    </div>
                    <div class="wr-hero">"""
    html = html.replace(hero_target, hero_replacement, 1)

if 'id="wr-v2-view"' not in html:
    # insert right before closing section of mock-interview-page
    # find id="wr-results-view" ending
    end_res = "</div> <!-- End wr-results-view -->"
    if end_res in html:
        html = html.replace(end_res, end_res + "\n" + v2_html, 1)
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Injected V2 HTML into index.html")

# 3. JS interactions for V2 toggle and voice simulation
v2_js = """
    // WAR ROOM V2 INTERACTIONS
    function setupWarRoomV2() {
        const toggleV1 = document.getElementById('wr-toggle-v1');
        const toggleV2 = document.getElementById('wr-toggle-v2');
        const configView = document.getElementById('wr-config-view');
        const v2View = document.getElementById('wr-v2-view');
        const v2EndBtn = document.getElementById('wr-v2-end-btn');
        const v2BackBtn = document.getElementById('wr-v2-back-btn');
        const v2Stage = document.getElementById('wr-v2-stage');
        const v2Report = document.getElementById('wr-v2-report');
        const v2Coach = document.getElementById('wr-v2-coach');
        const v2Restart = document.getElementById('wr-v2-restart-btn');
        const speakBtn = document.getElementById('wr-v2-speak-btn');
        const streamBox = document.getElementById('wr-v2-stream');
        const coachSkip = document.getElementById('wr-v2-coach-skip');

        if (toggleV2 && configView && v2View) {
            toggleV2.addEventListener('click', () => {
                configView.classList.add('hidden');
                v2View.classList.remove('hidden');
                if (v2Stage) v2Stage.classList.remove('hidden');
                if (v2Report) v2Report.classList.add('hidden');
                if (v2Coach) v2Coach.classList.remove('hidden');
            });
        }

        if (toggleV1 && configView && v2View) {
            toggleV1.addEventListener('click', () => {
                v2View.classList.add('hidden');
                configView.classList.remove('hidden');
            });
        }

        if (v2BackBtn && configView && v2View) {
            v2BackBtn.addEventListener('click', () => {
                v2View.classList.add('hidden');
                configView.classList.remove('hidden');
            });
        }

        if (v2EndBtn && v2Stage && v2Report) {
            v2EndBtn.addEventListener('click', () => {
                v2Stage.classList.add('hidden');
                if (v2Coach) v2Coach.classList.add('hidden');
                v2Report.classList.remove('hidden');
            });
        }

        if (v2Restart && v2Stage && v2Report) {
            v2Restart.addEventListener('click', () => {
                v2Report.classList.add('hidden');
                v2Stage.classList.remove('hidden');
                if (v2Coach) v2Coach.classList.remove('hidden');
            });
        }

        // Voice simulation
        if (speakBtn && streamBox) {
            speakBtn.addEventListener('click', () => {
                speakBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Neural Voice Stream...';
                setTimeout(() => {
                    const userMsg = document.createElement('div');
                    userMsg.className = 'wr-v2-msg user';
                    userMsg.innerHTML = '<span style="font-size:11px; color:#8B8B8B; font-family:\\'JetBrains Mono\\',monospace;">🎙️ Candidate Voice • Live</span><div class="wr-v2-bubble">To prevent deadlock without lock hierarchy starvation, I would implement structured lock ordering across memory addresses or non-blocking try-lock with exponential backoff.</div>';
                    streamBox.appendChild(userMsg);
                    streamBox.scrollTop = streamBox.scrollHeight;

                    speakBtn.innerHTML = '<i class="fas fa-check text-[#00D97E]"></i> Synthesizing AI Follow-up...';

                    setTimeout(() => {
                        const aiMsg = document.createElement('div');
                        aiMsg.className = 'wr-v2-msg ai';
                        aiMsg.innerHTML = '<span style="font-size:11px; color:#8B8B8B; font-family:\\'JetBrains Mono\\',monospace;">🤖 Elena Vance (AI) • Follow-up</span><div class="wr-v2-bubble">Insightful response. Now, what happens to system latency if hardware interrupts are disabled during lock acquisition under high NUMA contention?</div>';
                        streamBox.appendChild(aiMsg);
                        streamBox.scrollTop = streamBox.scrollHeight;
                        speakBtn.innerHTML = '<i class="fas fa-microphone"></i> Active Voice Stream • Tap to Answer';
                        document.getElementById('wr-v2-q-text').innerText = '"What happens to system latency if hardware interrupts are disabled during lock acquisition under high NUMA contention?"';
                    }, 2000);
                }, 1200);
            });
        }

        if (coachSkip && speakBtn) {
            coachSkip.addEventListener('click', () => {
                speakBtn.click();
            });
        }
    }

    setTimeout(setupWarRoomV2, 500);
"""

with open("war-room.js", "r", encoding="utf-8") as f:
    js = f.read()
if "setupWarRoomV2" not in js:
    with open("war-room.js", "a", encoding="utf-8") as f:
        f.write("\n" + v2_js)
    print("Appended V2 JS logic to war-room.js")
