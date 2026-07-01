import os

pixel_perfect_html = """
                <!-- V2 APPLE/OPENAI VOICE INTERVIEW ENGINE VIEW (PIXEL PERFECT PHASE 1 UI) -->
                <div id="wr-v2-view" class="wr-v2-container hidden" style="height: calc(100vh - 48px); display: flex; flex-direction: column; background: #050505; color: #fff; overflow: hidden; user-select: none;">
                    
                    <!-- TOP HEADER -->
                    <header style="height: 64px; background: rgba(16,16,16,0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 0 24px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; z-index: 40; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <button class="wr-btn-secondary" id="wr-v2-back-btn" style="padding: 6px 14px; border-radius: 12px; font-size: 12px; font-weight: 700; background: #181818; border: 1px solid rgba(255,255,255,0.1); color: #fff; display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <i class="fas fa-arrow-left" style="color: #FF4D4F;"></i> End Interview
                            </button>
                            
                            <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.1);"></div>

                            <!-- Recording Badge -->
                            <div style="display: flex; align-items: center; gap: 8px; background: rgba(255,77,79,0.15); border: 1px solid rgba(255,77,79,0.4); padding: 4px 12px; border-radius: 999px;">
                                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #FF4D4F; box-shadow: 0 0 10px #FF4D4F;"></span>
                                <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 800; color: #FF4D4F;">REC 00:14:22</span>
                            </div>

                            <!-- Timer -->
                            <div style="background: #161616; border: 1px solid rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 999px; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.9); display: flex; align-items: center; gap: 6px;">
                                <i class="far fa-clock" style="color: #8B8B8B;"></i> 45:00
                            </div>

                            <!-- Latency -->
                            <div style="background: #161616; border: 1px solid rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 999px; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #00D97E; display: flex; align-items: center; gap: 6px;">
                                <i class="fas fa-bolt" style="color: #00D97E;"></i> 12ms HD Encrypted
                            </div>
                        </div>

                        <!-- Category Tabs (Large Rounded Glass Pills) -->
                        <div style="display: flex; align-items: center; gap: 6px; background: rgba(22,22,22,0.8); padding: 4px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.1);">
                            <span style="padding: 6px 16px; border-radius: 999px; font-size: 12px; font-weight: 700; color: #8B8B8B; cursor: pointer;">Coding</span>
                            <span style="padding: 6px 16px; border-radius: 999px; font-size: 12px; font-weight: 800; background: linear-gradient(135deg, #FF4D4F, #ff6b6d); color: #fff; box-shadow: 0 0 15px rgba(255,77,79,0.4);">System Design</span>
                            <span style="padding: 6px 16px; border-radius: 999px; font-size: 12px; font-weight: 700; color: #8B8B8B; cursor: pointer;">Behavioral</span>
                            <span style="padding: 6px 16px; border-radius: 999px; font-size: 12px; font-weight: 700; color: #8B8B8B; cursor: pointer;">Architecture</span>
                            <span style="padding: 6px 16px; border-radius: 999px; font-size: 12px; font-weight: 700; color: #8B8B8B; cursor: pointer;">Code Review</span>
                            <span style="padding: 6px 16px; border-radius: 999px; font-size: 12px; font-weight: 700; color: #8B8B8B; cursor: pointer;">Leadership</span>
                        </div>

                        <!-- Current Subject -->
                        <div style="text-align: right;">
                            <span style="font-size: 10px; font-family: 'JetBrains Mono', monospace; color: #8B8B8B; display: block; font-weight: 700;">CURRENT SUBJECT</span>
                            <span style="font-size: 13px; font-weight: 800; color: #fff;">Distributed Systems & Global Caching</span>
                        </div>
                    </header>

                    <!-- THREE-COLUMN DESKTOP GRID -->
                    <div style="flex: 1; display: grid; grid-template-columns: 290px minmax(0, 1fr) 340px; gap: 14px; padding: 14px; min-height: 0; overflow: hidden;">
                        
                        <!-- LEFT PANEL -->
                        <div style="display: flex; flex-direction: column; gap: 14px; min-height: 0; overflow: hidden;">
                            <!-- Large AI Interviewer Card -->
                            <div style="flex: 1; background: #101010; border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                                <div style="position: absolute; top: -50px; left: -50px; width: 160px; height: 160px; border-radius: 50%; background: rgba(255,77,79,0.15); filter: blur(40px); pointer-events: none;"></div>
                                
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; z-index: 10;">
                                    <div>
                                        <span style="font-size: 10px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #FF4D4F;">✨ AI INTERVIEWER</span>
                                        <h3 style="font-size: 16px; font-weight: 800; margin: 4px 0 2px 0;">Dr. Elena Vance</h3>
                                        <span style="font-size: 12px; color: #8B8B8B;">Principal Systems Architect @ <strong style="color:#fff;">Google Cloud</strong></span>
                                    </div>
                                    <span style="font-size: 11px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #00D97E; background: rgba(0,217,126,0.15); border: 1px solid rgba(0,217,126,0.3); padding: 2px 10px; border-radius: 99px;">Speaking</span>
                                </div>

                                <!-- Large Animated Orb Placeholder -->
                                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px 0; z-index: 10;">
                                    <div style="position: relative; width: 110px; height: 110px; display: flex; align-items: center; justify-content: center;">
                                        <div style="position: absolute; width: 140px; height: 140px; border-radius: 50%; border: 1px solid rgba(255,77,79,0.3); background: rgba(255,77,79,0.04);"></div>
                                        <div style="width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, #1e1e1e, #080808); border: 2px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 35px rgba(255,77,79,0.35);">
                                            <i class="fas fa-sparkles" style="font-size: 32px; color: #FF4D4F;"></i>
                                        </div>
                                    </div>
                                    <!-- Audio Waveform Placeholder -->
                                    <div style="display: flex; align-items: center; gap: 4px; height: 24px; margin-top: 16px;">
                                        <span style="width: 3px; height: 8px; background: #FF4D4F; border-radius: 99px;"></span>
                                        <span style="width: 3px; height: 18px; background: #FF4D4F; border-radius: 99px;"></span>
                                        <span style="width: 3px; height: 12px; background: #FF4D4F; border-radius: 99px;"></span>
                                        <span style="width: 3px; height: 24px; background: #FF4D4F; border-radius: 99px;"></span>
                                        <span style="width: 3px; height: 14px; background: #FF4D4F; border-radius: 99px;"></span>
                                        <span style="width: 3px; height: 20px; background: #FF4D4F; border-radius: 99px;"></span>
                                        <span style="width: 3px; height: 10px; background: #FF4D4F; border-radius: 99px;"></span>
                                    </div>
                                </div>

                                <div style="background: #161616; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px; font-size: 11px; z-index: 10;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span style="color:#8B8B8B;">Topic</span><strong style="color:#fff;">Consensus Protocols & CRDTs</strong></div>
                                    <div style="display: flex; justify-content: space-between;"><span style="color:#8B8B8B;">Counter</span><strong style="color:#FF4D4F; font-family:'JetBrains Mono',monospace;">Question 3 of 8</strong></div>
                                </div>
                            </div>

                            <!-- User Camera Card -->
                            <div style="background: #101010; border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 14px; display: flex; flex-direction: column; gap: 10px; flex-shrink: 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 11px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: rgba(255,255,255,0.8);">USER CAMERA FEED</span>
                                    <div style="display: flex; gap: 6px;">
                                        <span style="font-size: 9px; font-weight: 800; background: #FF4D4F; color: #fff; padding: 2px 6px; border-radius: 4px;">LIVE</span>
                                        <span style="font-size: 9px; font-weight: 800; background: rgba(255,255,255,0.1); color: #fff; padding: 2px 6px; border-radius: 4px;">1080p HD</span>
                                        <span style="font-size: 9px; font-weight: 800; background: rgba(0,217,126,0.2); color: #00D97E; padding: 2px 6px; border-radius: 4px;">5G Optimal</span>
                                    </div>
                                </div>
                                <div style="height: 105px; background: #080808; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 6px;">
                                        <i class="fas fa-user-check" style="color:#00D97E;"></i>
                                    </div>
                                    <span style="font-size: 12px; font-weight: 700; color: #fff;">Kabilan V. (Candidate)</span>
                                    <span style="font-size: 10px; font-family: 'JetBrains Mono', monospace; color: #8B8B8B;">Eye Gaze Tracked • Mesh Active</span>
                                </div>
                            </div>

                            <!-- Control Panel -->
                            <div style="background: #101010; border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 14px; display: flex; flex-direction: column; gap: 10px; flex-shrink: 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 10px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #8B8B8B;">HARDWARE RIG CONTROLS</span>
                                    <span style="font-size: 10px; font-family: 'JetBrains Mono', monospace; background: rgba(0,217,126,0.15); color: #00D97E; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(0,217,126,0.3);">✓ AI Noise Suppr. ON</span>
                                </div>
                                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                                    <button style="background: #181818; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 4px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer;"><i class="fas fa-microphone"></i><span style="font-size: 10px; font-weight: 700;">Mic</span></button>
                                    <button style="background: #181818; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 4px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer;"><i class="fas fa-video"></i><span style="font-size: 10px; font-weight: 700;">Cam</span></button>
                                    <button style="background: #181818; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 4px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer;"><i class="fas fa-desktop" style="color:#4DA3FF;"></i><span style="font-size: 10px; font-weight: 700;">Share</span></button>
                                    <button style="background: #181818; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 4px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer;"><i class="fas fa-cog" style="color:#8B8B8B;"></i><span style="font-size: 10px; font-weight: 700;">Settings</span></button>
                                </div>
                            </div>
                        </div>

                        <!-- CENTER PANEL -->
                        <div style="display: flex; flex-direction: column; gap: 14px; min-height: 0; overflow: hidden;">
                            <!-- Current Challenge Card -->
                            <div style="background: #101010; border: 1px solid rgba(255,255,255,0.1); border-left: 4px solid #FF4D4F; border-radius: 18px; padding: 20px; flex-shrink: 0; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <div style="display: flex; gap: 8px;">
                                        <span style="background: rgba(255,77,79,0.15); border: 1px solid rgba(255,77,79,0.3); color: #FF4D4F; font-size: 10px; font-family: 'JetBrains Mono', monospace; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">Staff L6 Bar</span>
                                        <span style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); font-size: 10px; font-family: 'JetBrains Mono', monospace; font-weight: 700; padding: 2px 8px; border-radius: 4px;">Company: Stripe / Google</span>
                                    </div>
                                    <span style="color: #00D97E; font-size: 12px; font-family: 'JetBrains Mono', monospace; font-weight: 800;">✓ Topic: Distributed Caching</span>
                                </div>
                                <h1 style="font-size: 22px; font-weight: 900; color: #fff; margin: 0 0 6px 0;">Design a Global Edge Rate Limiter</h1>
                                <p style="font-size: 13px; color: #8B8B8B; margin: 0; line-height: 1.5;">Architect a resilient distributed rate limiting layer handling <strong style="color:#fff;">100M requests/second</strong> across 40 global edge datacenters with a strict <strong style="color:#fff;">&lt;10ms latency SLA</strong>.</p>
                            </div>

                            <!-- Conversation Card (ChatGPT Voice style) -->
                            <div style="flex: 1; background: rgba(16,16,16,0.9); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; min-height: 0; overflow: hidden; box-shadow: inset 0 0 40px rgba(0,0,0,0.4);">
                                <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; padding-right: 8px;">
                                    
                                    <div style="max-width: 85%; align-self: flex-start;">
                                        <span style="font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #FF4D4F; font-weight: 700;">🤖 Dr. Elena Vance (AI Interviewer) • 00:18</span>
                                        <div style="background: #161616; border: 1px solid rgba(255,255,255,0.1); padding: 14px 18px; border-radius: 18px; border-top-left-radius: 4px; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.9); margin-top: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                                            To start our defense, what architectural trade-offs would you make between deploying local edge token buckets versus synchronous cross-region database lock coordination?
                                        </div>
                                    </div>

                                    <div style="max-width: 85%; align-self: flex-end; display: flex; flex-direction: column; align-items: flex-end;">
                                        <span style="font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #00D97E; font-weight: 700;">🎙️ Candidate Voice Defense • 01:05</span>
                                        <div style="background: linear-gradient(135deg, rgba(255,77,79,0.2), rgba(255,77,79,0.1)); border: 1px solid rgba(255,77,79,0.4); padding: 14px 18px; border-radius: 18px; border-top-right-radius: 4px; font-size: 14px; line-height: 1.6; color: #fff; font-weight: 500; margin-top: 4px; box-shadow: 0 4px 15px rgba(255,77,79,0.15);">
                                            Synchronous database coordination violates our 10ms latency SLA due to speed-of-light transatlantic delays. I would deploy in-memory Redis token buckets at each point-of-presence, synchronized asynchronously via CRDT gossip protocol.
                                        </div>
                                    </div>

                                </div>

                                <!-- Bottom Listening Bar -->
                                <div style="padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); flex-shrink: 0;">
                                    <div style="background: linear-gradient(135deg, #181818, #222, #181818); border: 1px solid rgba(255,77,79,0.6); border-radius: 999px; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 0 35px rgba(255,77,79,0.3);">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <div style="width: 32px; height: 32px; border-radius: 50%; background: #FF4D4F; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px #FF4D4F;">
                                                <i class="fas fa-microphone" style="color: #fff; font-size: 14px;"></i>
                                            </div>
                                            <div>
                                                <span style="font-size: 13px; font-weight: 800; color: #fff; display: block;">Listening... Speak naturally to answer</span>
                                                <span style="font-size: 10px; font-family: 'JetBrains Mono', monospace; color: #8B8B8B;">OpenAI HD Voice Stream Active • Zero Keyboard Required</span>
                                            </div>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 4px;">
                                            <span style="width: 4px; height: 10px; background: #FF4D4F; border-radius: 99px;"></span>
                                            <span style="width: 4px; height: 20px; background: #FF4D4F; border-radius: 99px;"></span>
                                            <span style="width: 4px; height: 14px; background: #FF4D4F; border-radius: 99px;"></span>
                                            <span style="width: 4px; height: 24px; background: #FF4D4F; border-radius: 99px;"></span>
                                            <span style="width: 4px; height: 12px; background: #FF4D4F; border-radius: 99px;"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- RIGHT PANEL -->
                        <div style="display: flex; flex-direction: column; gap: 14px; min-height: 0; overflow-y: auto; padding-right: 4px;">
                            <!-- Overall Score Card -->
                            <div style="background: #101010; border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 16px; flex-shrink: 0; box-shadow: 0 10px 30px rgba(0,0,0,0.5); position: relative; overflow: hidden;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <span style="font-size: 10px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: rgba(255,255,255,0.7);">🏆 OVERALL INTERVIEW SCORE</span>
                                    <span style="font-size: 10px; font-family: 'JetBrains Mono', monospace; font-weight: 800; background: rgba(0,217,126,0.15); color: #00D97E; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(0,217,126,0.3);">TOP 2% TIER</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 16px;">
                                    <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #00D97E, #4DA3FF); padding: 3px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 25px rgba(0,217,126,0.3);">
                                        <div style="width: 100%; height: 100%; border-radius: 50%; background: #101010; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                            <span style="font-size: 22px; font-weight: 900; color: #fff; font-family: 'JetBrains Mono', monospace; line-height: 1;">91%</span>
                                            <span style="font-size: 8px; font-family: 'JetBrains Mono', monospace; color: #8B8B8B; margin-top: 2px;">SCORE</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 style="font-size: 16px; font-weight: 900; color: #fff; margin: 0 0 4px 0;">Excellent Performance</h4>
                                        <p style="font-size: 12px; color: #8B8B8B; margin: 0;">Exceeds FAANG Staff L6 Hiring Consensus Bar.</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Live Evaluation Analytics Dashboard -->
                            <div style="background: #101010; border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 16px; flex-shrink: 0; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                                <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 12px;">
                                    <span style="font-size: 11px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: rgba(255,255,255,0.9);">⚡ LIVE ANALYTICS DASHBOARD</span>
                                    <span style="font-size: 10px; font-family: 'JetBrains Mono', monospace; color: #8B8B8B;">Updated Real-Time</span>
                                </div>

                                <div style="display: flex; flex-direction: column; gap: 10px;">
                                    <div><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;"><span style="font-weight:700;">Technical Accuracy</span><span style="font-family:'JetBrains Mono',monospace; font-weight:800; color:#00D97E;">▲ 96%</span></div><div style="width:100%; height:6px; background:#181818; border-radius:99px; overflow:hidden;"><div style="width:96%; height:100%; background:#00D97E;"></div></div></div>
                                    <div><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;"><span style="font-weight:700;">Communication</span><span style="font-family:'JetBrains Mono',monospace; font-weight:800; color:#4DA3FF;">▲ 94%</span></div><div style="width:100%; height:6px; background:#181818; border-radius:99px; overflow:hidden;"><div style="width:94%; height:100%; background:#4DA3FF;"></div></div></div>
                                    <div><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;"><span style="font-weight:700;">Confidence</span><span style="font-family:'JetBrains Mono',monospace; font-weight:800; color:#00D97E;">▲ 92%</span></div><div style="width:100%; height:6px; background:#181818; border-radius:99px; overflow:hidden;"><div style="width:92%; height:100%; background:#00D97E;"></div></div></div>
                                    <div><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;"><span style="font-weight:700;">Depth of Knowledge</span><span style="font-family:'JetBrains Mono',monospace; font-weight:800; color:#FFC857;">▲ 89%</span></div><div style="width:100%; height:6px; background:#181818; border-radius:99px; overflow:hidden;"><div style="width:89%; height:100%; background:#FFC857;"></div></div></div>
                                    <div><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;"><span style="font-weight:700;">Problem Solving Bar</span><span style="font-family:'JetBrains Mono',monospace; font-weight:800; color:#00D97E;">▲ 95%</span></div><div style="width:100%; height:6px; background:#181818; border-radius:99px; overflow:hidden;"><div style="width:95%; height:100%; background:#00D97E;"></div></div></div>
                                    <div><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;"><span style="font-weight:700;">Vocabulary</span><span style="font-family:'JetBrains Mono',monospace; font-weight:800; color:#4DA3FF;">— 94%</span></div><div style="width:100%; height:6px; background:#181818; border-radius:99px; overflow:hidden;"><div style="width:94%; height:100%; background:#4DA3FF;"></div></div></div>
                                    <div><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;"><span style="font-weight:700;">Eye Contact</span><span style="font-family:'JetBrains Mono',monospace; font-weight:800; color:#00D97E;">▲ 92%</span></div><div style="width:100%; height:6px; background:#181818; border-radius:99px; overflow:hidden;"><div style="width:92%; height:100%; background:#00D97E;"></div></div></div>
                                    <div><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;"><span style="font-weight:700;">Voice Clarity</span><span style="font-family:'JetBrains Mono',monospace; font-weight:800; color:#00D97E;">▲ 98%</span></div><div style="width:100%; height:6px; background:#181818; border-radius:99px; overflow:hidden;"><div style="width:98%; height:100%; background:#00D97E;"></div></div></div>
                                    <div><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;"><span style="font-weight:700;">Speaking Pace</span><span style="font-family:'JetBrains Mono',monospace; font-weight:800; color:#4DA3FF;">142 WPM</span></div><div style="width:100%; height:6px; background:#181818; border-radius:99px; overflow:hidden;"><div style="width:85%; height:100%; background:#4DA3FF;"></div></div></div>
                                    <div><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;"><span style="font-weight:700;">Filler Words</span><span style="font-family:'JetBrains Mono',monospace; font-weight:800; color:#00D97E;">2 / min</span></div><div style="width:100%; height:6px; background:#181818; border-radius:99px; overflow:hidden;"><div style="width:95%; height:100%; background:#00D97E;"></div></div></div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- BOTTOM HORIZONTAL TIMELINE -->
                    <div style="height: 64px; background: rgba(16,16,16,0.9); border-top: 1px solid rgba(255,255,255,0.1); padding: 0 24px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; overflow-x: auto; z-index: 40; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);">
                        <span style="font-size: 10px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #8B8B8B; margin-right: 16px;">TIMELINE PROGRESS</span>
                        <div style="display: flex; align-items: center; justify-content: space-between; flex: 1; min-width: 700px; gap: 8px;">
                            <div style="display:flex; align-items:center; gap:8px;"><span style="width:24px; height:24px; border-radius:50%; background:rgba(0,217,126,0.2); border:1px solid #00D97E; color:#00D97E; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800;">✓</span><div><strong style="font-size:12px; color:rgba(255,255,255,0.9); display:block;">Interview Started</strong><span style="font-size:9px; font-family:'JetBrains Mono',monospace; color:#8B8B8B;">00:00</span></div></div>
                            <div style="flex:1; height:2px; background:rgba(0,217,126,0.4); border-radius:99px;"></div>
                            <div style="display:flex; align-items:center; gap:8px;"><span style="width:24px; height:24px; border-radius:50%; background:rgba(0,217,126,0.2); border:1px solid #00D97E; color:#00D97E; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800;">✓</span><div><strong style="font-size:12px; color:rgba(255,255,255,0.9); display:block;">Ice Breaker</strong><span style="font-size:9px; font-family:'JetBrains Mono',monospace; color:#8B8B8B;">02:30</span></div></div>
                            <div style="flex:1; height:2px; background:rgba(0,217,126,0.4); border-radius:99px;"></div>
                            <div style="display:flex; align-items:center; gap:8px;"><span style="width:24px; height:24px; border-radius:50%; background:rgba(0,217,126,0.2); border:1px solid #00D97E; color:#00D97E; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800;">✓</span><div><strong style="font-size:12px; color:rgba(255,255,255,0.9); display:block;">Question 1</strong><span style="font-size:9px; font-family:'JetBrains Mono',monospace; color:#8B8B8B;">08:15</span></div></div>
                            <div style="flex:1; height:2px; background:rgba(0,217,126,0.4); border-radius:99px;"></div>
                            <div style="display:flex; align-items:center; gap:8px;"><span style="width:24px; height:24px; border-radius:50%; background:rgba(0,217,126,0.2); border:1px solid #00D97E; color:#00D97E; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800;">✓</span><div><strong style="font-size:12px; color:rgba(255,255,255,0.9); display:block;">Question 2</strong><span style="font-size:9px; font-family:'JetBrains Mono',monospace; color:#8B8B8B;">18:40</span></div></div>
                            <div style="flex:1; height:2px; background:linear-gradient(90deg, #FF4D4F, rgba(255,255,255,0.1)); border-radius:99px;"></div>
                            <div style="display:flex; align-items:center; gap:8px;"><span style="width:24px; height:24px; border-radius:50%; background:#FF4D4F; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; box-shadow:0 0 15px #FF4D4F;">⭐</span><div><strong style="font-size:12px; color:#FF4D4F; display:block;">Question 3</strong><span style="font-size:9px; font-family:'JetBrains Mono',monospace; color:#8B8B8B;">28:10</span></div></div>
                            <div style="flex:1; height:2px; background:rgba(255,255,255,0.05); border-radius:99px;"></div>
                            <div style="display:flex; align-items:center; gap:8px; opacity:0.4;"><span style="width:24px; height:24px; border-radius:50%; background:#181818; border:1px solid rgba(255,255,255,0.1); color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800;">6</span><div><strong style="font-size:12px; color:#fff; display:block;">Question 4</strong><span style="font-size:9px; font-family:'JetBrains Mono',monospace; color:#8B8B8B;">38:00</span></div></div>
                            <div style="flex:1; height:2px; background:rgba(255,255,255,0.05); border-radius:99px;"></div>
                            <div style="display:flex; align-items:center; gap:8px; opacity:0.4;"><span style="width:24px; height:24px; border-radius:50%; background:#181818; border:1px solid rgba(255,255,255,0.1); color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800;">7</span><div><strong style="font-size:12px; color:#fff; display:block;">Final Round</strong><span style="font-size:9px; font-family:'JetBrains Mono',monospace; color:#8B8B8B;">43:00</span></div></div>
                            <div style="flex:1; height:2px; background:rgba(255,255,255,0.05); border-radius:99px;"></div>
                            <div style="display:flex; align-items:center; gap:8px; opacity:0.4;"><span style="width:24px; height:24px; border-radius:50%; background:#181818; border:1px solid rgba(255,255,255,0.1); color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800;">8</span><div><strong style="font-size:12px; color:#fff; display:block;">Interview End</strong><span style="font-size:9px; font-family:'JetBrains Mono',monospace; color:#8B8B8B;">45:00</span></div></div>
                        </div>
                    </div>

                </div>
"""

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

start_marker = '<div id="wr-v2-view"'
if start_marker in html:
    start_idx = html.find(start_marker)
    end_marker = '</div> <!-- End wr-v2-view -->'
    end_idx = html.find(end_marker)
    if end_idx != -1:
        new_html = html[:start_idx] + pixel_perfect_html + html[end_idx + len(end_marker):]
        with open("index.html", "w", encoding="utf-8") as f:
            f.write(new_html)
        print("Updated dashboard index.html with Pixel Perfect Phase 1 UI.")
