import re

html_path = 'index.html'

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_str = '<div id="wr-live-engine"'
start_idx = content.find(start_str)

if start_idx != -1:
    end_idx = content.find('</body>', start_idx)
    if end_idx != -1:
        new_engine_html = """<div id="wr-live-engine" class="wr-live-engine hidden" style="position: fixed; inset: 0; width: 100vw; height: 100vh; min-width: 1200px; z-index: 9999999; background: #08080c; color: #fff; display: flex; flex-direction: column; overflow: hidden; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; user-select: none; box-sizing: border-box;">
                    
                    <!-- 1. TOP INTERVIEW HEADER (56px) -->
                    <div style="height: 56px; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 0 20px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; background: #08080c;">
                        <!-- Left Side -->
                        <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
                            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                                <div style="width: 28px; height: 28px; border-radius: 6px; background: #FF4D4F; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; color: #fff;">SF</div>
                                <span style="font-size: 16px; font-weight: 800; color: #fff; letter-spacing: -0.5px;">SkillForge</span>
                            </div>

                            <button id="wr-btn-exit-live" style="background: #14141e; border: 1px solid rgba(255,255,255,0.12); color: #fff; padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; flex-shrink: 0; transition: all 0.2s;">
                                <i class="fas fa-arrow-left" style="font-size: 10px;"></i> End Interview
                            </button>

                            <div style="background: rgba(255,77,79,0.15); border: 1px solid rgba(255,77,79,0.4); color: #FF4D4F; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 5px; flex-shrink: 0; font-family: 'JetBrains Mono', monospace;">
                                <span style="width: 6px; height: 6px; border-radius: 50%; background: #FF4D4F; box-shadow: 0 0 8px #FF4D4F;"></span>
                                REC 00:14:32
                            </div>

                            <span style="display: flex; align-items: center; gap: 5px; color: #10B981; font-size: 11px; font-weight: 700; flex-shrink: 0;">
                                <i class="fas fa-shield-alt"></i> 12ms Encrypted
                            </span>

                            <button style="background: #14141e; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                                <span>Operating Systems Interview</span>
                                <i class="fas fa-chevron-down" style="font-size: 9px; color: #8B8B8B;"></i>
                            </button>

                            <button style="background: #14141e; border: 1px solid rgba(255,255,255,0.1); color: #E879F9; padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                                <i class="fas fa-user-tie"></i>
                                <span>Google Staff Engineer</span>
                                <i class="fas fa-chevron-down" style="font-size: 9px; color: #8B8B8B;"></i>
                            </button>
                        </div>

                        <!-- Right Side -->
                        <div style="display: flex; align-items: center; gap: 14px; flex-shrink: 0;">
                            <span style="display: flex; align-items: center; gap: 5px; color: #10B981; font-size: 12px; font-weight: 700;">
                                <span style="width: 7px; height: 7px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px #10B981;"></span>
                                Interview in Progress
                            </span>

                            <div style="text-align: right; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 14px;">
                                <div style="font-size: 9.5px; color: #8B8B8B; font-weight: 600; text-transform: uppercase;">Time Remaining</div>
                                <div style="font-size: 14px; font-weight: 900; color: #fff; font-family: 'JetBrains Mono', monospace; line-height: 1.1;">30:28</div>
                            </div>

                            <div style="display: flex; align-items: center; gap: 6px;">
                                <button style="width: 32px; height: 32px; border-radius: 6px; background: #14141e; border: 1px solid rgba(255,255,255,0.1); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                                    <i class="far fa-question-circle" style="font-size: 13px;"></i>
                                </button>
                                <button style="width: 32px; height: 32px; border-radius: 6px; background: #14141e; border: 1px solid rgba(255,255,255,0.1); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                                    <i class="fas fa-cog" style="font-size: 13px;"></i>
                                </button>
                                <button id="wr-btn-hangup" style="width: 32px; height: 32px; border-radius: 6px; background: #FF4D4F; border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 0 12px rgba(255,77,79,0.5);">
                                    <i class="fas fa-phone-slash" style="font-size: 13px;"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 2. BODY CONTAINER (27% : 45% : 28% GRID, 16px GAPS & PADDING) -->
                    <!-- Height = 100vh - Header(56px) - Timeline(64px) = calc(100vh - 120px) -->
                    <div style="height: calc(100vh - 120px); display: grid; grid-template-columns: 27fr 45fr 28fr; gap: 16px; padding: 16px; overflow: hidden; background: #08080c; min-width: 0; box-sizing: border-box;">
                        
                        <!-- COLUMN 1: LEFT MEDIA COLUMN (27%) -->
                        <div style="display: flex; flex-direction: column; justify-content: space-between; gap: 14px; height: 100%; min-height: 0; overflow: hidden;">
                            
                            <!-- Card 1: AI Interviewer (Compact height ~170px, 16px padding, 16px radius) -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; flex-shrink: 0; min-height: 165px;">
                                <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 12px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 6px;">
                                        <i class="fas fa-sparkles" style="color: #FF4D4F;"></i> Al Interviewer
                                    </span>
                                    <i class="fas fa-ellipsis-h" style="color: #8B8B8B; cursor: pointer;"></i>
                                </div>
                                
                                <div style="margin-top: 10px;">
                                    <span style="font-size: 13px; font-weight: 700; color: #fff; display: block;">Google Staff Engineer</span>
                                    <span style="font-size: 11px; color: #8B8B8B; display: block; margin-top: 1px;">15+ Years Experience</span>
                                </div>

                                <!-- Centered Compact Glowing Voice Orb -->
                                <div style="position: relative; width: 72px; height: 72px; margin: 10px 0; display: flex; align-items: center; justify-content: center;">
                                    <div style="position: absolute; inset: 0; border-radius: 50%; border: 1.5px solid rgba(255,77,79,0.5); background: radial-gradient(circle, rgba(255,77,79,0.3) 0%, rgba(255,77,79,0.05) 60%, transparent 100%); box-shadow: 0 0 25px rgba(255,77,79,0.4), inset 0 0 15px rgba(255,77,79,0.7);"></div>
                                    <div style="position: relative; z-index: 5; display: flex; align-items: center; gap: 2.5px; height: 26px;">
                                        <span style="width: 2.5px; height: 8px; background: #FF4D4F; border-radius: 99px;"></span>
                                        <span style="width: 2.5px; height: 16px; background: #FF6B6B; border-radius: 99px;"></span>
                                        <span style="width: 2.5px; height: 26px; background: #FF4D4F; border-radius: 99px;"></span>
                                        <span style="width: 2.5px; height: 14px; background: #FFA07A; border-radius: 99px;"></span>
                                        <span style="width: 2.5px; height: 26px; background: #FF4D4F; border-radius: 99px;"></span>
                                        <span style="width: 2.5px; height: 18px; background: #FF8C00; border-radius: 99px;"></span>
                                        <span style="width: 2.5px; height: 10px; background: #FF4D4F; border-radius: 99px;"></span>
                                    </div>
                                </div>

                                <div style="display: flex; align-items: center; gap: 5px; color: #FF4D4F; font-size: 11px; font-weight: 800; margin-bottom: 4px;">
                                    <span style="width: 6px; height: 6px; border-radius: 50%; background: #FF4D4F; box-shadow: 0 0 8px #FF4D4F;"></span> Speaking...
                                </div>

                                <div style="font-size: 12px; font-weight: 800; color: #fff;">Question 3 of 8</div>
                                <div style="font-size: 11px; color: #FF4D4F; font-weight: 700; margin-top: 1px;">Topic: Deadlock Prevention</div>
                            </div>

                            <!-- Card 2: Candidate Feed (Landscape Webcam 16:9, takes remaining flex height) -->
                            <div style="background: #0d0d12; border: 1.5px solid #FF4D4F; box-shadow: 0 0 18px rgba(255,77,79,0.25); border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 10px; flex: 1; min-height: 0; justify-content: space-between;">
                                <div style="display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                                    <span style="font-size: 12px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 6px;">
                                        <i class="fas fa-video" style="color: #FF4D4F;"></i> Candidate Feed
                                    </span>
                                    <span style="display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 800; color: #10B981;">
                                        <span style="width: 6px; height: 6px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px #10B981;"></span> LIVE
                                    </span>
                                </div>

                                <!-- Candidate Photo Preview -->
                                <div style="flex: 1; min-height: 110px; background: #14141c; border-radius: 10px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80" style="width: 100%; height: 100%; object-fit: cover; object-position: center 20%;" alt="Candidate Feed" />
                                    <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 45%);"></div>
                                    
                                    <!-- Top Left: LIVE -->
                                    <div style="position: absolute; top: 8px; left: 8px; display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 800; color: #10B981; background: rgba(0,0,0,0.65); padding: 3px 8px; border-radius: 5px;">
                                        <span style="width: 5px; height: 5px; border-radius: 50%; background: #10B981;"></span> LIVE
                                    </div>
                                    <!-- Top Right: Resolution -->
                                    <div style="position: absolute; top: 8px; right: 8px; font-size: 10px; font-weight: 700; color: #ddd; background: rgba(0,0,0,0.65); padding: 3px 8px; border-radius: 5px;">
                                        1080P • 60 FPS
                                    </div>
                                    <!-- Bottom Left: Mic Active -->
                                    <div style="position: absolute; bottom: 8px; left: 8px; display: flex; align-items: center; gap: 5px; font-size: 10.5px; font-weight: 700; color: #10B981;">
                                        <i class="fas fa-microphone" style="color: #10B981;"></i> Mic Active
                                    </div>
                                    <!-- Bottom Right: Camera Status -->
                                    <div style="position: absolute; bottom: 8px; right: 8px; display: flex; align-items: center; gap: 5px; font-size: 10.5px; font-weight: 700; color: #10B981;">
                                        <i class="fas fa-video" style="color: #10B981;"></i> Camera HD
                                    </div>
                                </div>
                            </div>

                            <!-- Card 3: Controls (Compact 48px buttons, 100% visible without scrolling) -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 10px 14px; flex-shrink: 0;">
                                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                                    <button style="height: 48px; background: rgba(255,77,79,0.15); border: 1.5px solid #FF4D4F; color: #FF4D4F; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; cursor: pointer; transition: all 0.2s;">
                                        <div style="width: 18px; height: 18px; border-radius: 50%; background: #FF4D4F; display: flex; align-items: center; justify-content: center; color: #fff;"><i class="fas fa-microphone" style="font-size: 9px;"></i></div>
                                        <span style="font-size: 10px; font-weight: 800;">Mic On</span>
                                    </button>
                                    <button style="height: 48px; background: #161620; border: 1px solid rgba(255,255,255,0.08); color: #fff; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; cursor: pointer; transition: all 0.2s;">
                                        <i class="fas fa-video" style="font-size: 14px; color: #ddd;"></i>
                                        <span style="font-size: 10px; font-weight: 800;">Camera On</span>
                                    </button>
                                    <button style="height: 48px; background: #161620; border: 1px solid rgba(255,255,255,0.08); color: #fff; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; cursor: pointer; transition: all 0.2s;">
                                        <i class="fas fa-desktop" style="font-size: 14px; color: #ddd;"></i>
                                        <span style="font-size: 10px; font-weight: 800;">Share Screen</span>
                                    </button>
                                    <button style="height: 48px; background: #161620; border: 1px solid rgba(255,255,255,0.08); color: #fff; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; cursor: pointer; transition: all 0.2s;">
                                        <i class="fas fa-cog" style="font-size: 14px; color: #ddd;"></i>
                                        <span style="font-size: 10px; font-weight: 800;">Settings</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Card 4: Noise Cancellation Row (Compact 42px height) -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 0 16px; height: 42px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                                <span style="font-size: 12px; color: #fff; display: flex; align-items: center; gap: 6px; font-weight: 700;">
                                    <i class="fas fa-bolt" style="color: #FF4D4F;"></i> AI Noise Cancellation
                                </span>
                                <div style="width: 38px; height: 20px; border-radius: 99px; background: #FF4D4F; position: relative; cursor: pointer; padding: 2px; box-shadow: 0 0 10px rgba(255,77,79,0.4);">
                                    <div style="width: 16px; height: 16px; border-radius: 50%; background: #fff; position: absolute; right: 2px;"></div>
                                </div>
                            </div>

                        </div>

                        <!-- COLUMN 2: CENTER CONVERSATION COLUMN (45%) -->
                        <div style="display: flex; flex-direction: column; justify-content: space-between; gap: 14px; height: 100%; min-height: 0; overflow: hidden;">
                            
                            <!-- Category Tabs Row -->
                            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; flex-shrink: 0;">
                                <button style="background: rgba(255,77,79,0.2); border: 1px solid #FF4D4F; color: #fff; padding: 5px 14px; border-radius: 8px; font-size: 12px; font-weight: 800; cursor: pointer;">Coding</button>
                                <button style="background: #12121a; border: 1px solid rgba(255,255,255,0.08); color: #8B8B8B; padding: 5px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;">System Design</button>
                                <button style="background: #12121a; border: 1px solid rgba(255,255,255,0.08); color: #8B8B8B; padding: 5px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;">Behavioral</button>
                                <button style="background: #12121a; border: 1px solid rgba(255,255,255,0.08); color: #8B8B8B; padding: 5px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;">Architecture</button>
                                <button style="background: #12121a; border: 1px solid rgba(255,255,255,0.08); color: #8B8B8B; padding: 5px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;">Code Review</button>
                                <button style="background: #12121a; border: 1px solid rgba(255,255,255,0.08); color: #8B8B8B; padding: 5px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;">Leadership</button>
                            </div>

                            <!-- Card 1: Current Question -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px 20px; flex-shrink: 0; position: relative;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <span style="font-size: 11px; font-weight: 800; color: #8B8B8B; letter-spacing: 0.5px; text-transform: uppercase;">Current Question</span>
                                    <i class="far fa-bookmark" style="color: #8B8B8B; cursor: pointer;"></i>
                                </div>
                                <div style="color: #FF4D4F; font-size: 16px; font-weight: 900; line-height: 1;">“</div>
                                <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin: 4px 0 6px 0; line-height: 1.3;">Explain Deadlock in Operating Systems.</h3>
                                <p style="font-size: 12px; color: #8B8B8B; margin-bottom: 12px;">Take your time and explain with an example.</p>

                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="background: rgba(255,140,0,0.15); border: 1px solid rgba(255,140,0,0.3); color: #FF8C00; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 6px; display: flex; align-items: center; gap: 5px;">
                                        <span style="width: 5px; height: 5px; border-radius: 50%; background: #FF8C00;"></span> Medium
                                    </span>
                                    <span style="background: #14141e; border: 1px solid rgba(255,255,255,0.08); color: #ccc; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px;">
                                        <span style="color: #FF4D4F; font-weight: 900;">G</span> Google
                                    </span>
                                    <span style="background: #14141e; border: 1px solid rgba(255,255,255,0.08); color: #ccc; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px;">
                                        <i class="fas fa-random" style="color: #EAB308; font-size: 10px;"></i> Operating Systems
                                    </span>
                                </div>
                            </div>

                            <!-- Card 2: Live Conversation Feed (Takes remaining vertical height) -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px 20px; flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden;">
                                <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;">
                                    <span style="font-size: 13px; font-weight: 800; color: #fff;">Live Conversation</span>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="font-size: 11px; color: #8B8B8B; font-weight: 600;">Auto Transcription</span>
                                        <div style="width: 34px; height: 18px; border-radius: 99px; background: #10B981; position: relative; cursor: pointer; padding: 2px;">
                                            <div style="width: 14px; height: 14px; border-radius: 50%; background: #fff; position: absolute; right: 2px;"></div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Scrolling Chat Messages -->
                                <div style="flex: 1; overflow-y: auto; padding-top: 12px; display: flex; flex-direction: column; gap: 12px; padding-right: 4px;">
                                    
                                    <!-- AI Message -->
                                    <div style="display: flex; gap: 10px; align-items: flex-start;">
                                        <div style="width: 28px; height: 28px; border-radius: 50%; background: #FF4D4F; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; font-size: 11px;"><i class="fas fa-robot"></i></div>
                                        <div style="flex: 1; background: #14141e; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; border-top-left-radius: 2px; padding: 10px 14px;">
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                                <span style="font-size: 11.5px; font-weight: 800; color: #FF4D4F;">AI Interviewer</span>
                                                <span style="font-size: 10px; color: #666; font-family: 'JetBrains Mono', monospace;">14:12:30</span>
                                            </div>
                                            <p style="font-size: 12.5px; color: #ddd; line-height: 1.4; margin: 0;">Could you explain what a deadlock is in an operating system and what four conditions must hold simultaneously for it to occur?</p>
                                        </div>
                                    </div>

                                    <!-- Candidate Live Speech -->
                                    <div style="display: flex; gap: 10px; align-items: flex-start;">
                                        <div style="width: 28px; height: 28px; border-radius: 50%; background: #10B981; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; font-size: 11px;"><i class="fas fa-user"></i></div>
                                        <div style="flex: 1; background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; border-top-left-radius: 2px; padding: 10px 14px;">
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                                <span style="font-size: 11.5px; font-weight: 800; color: #10B981;">You (Speaking...)</span>
                                                <span style="font-size: 10px; color: #666; font-family: 'JetBrains Mono', monospace;">14:12:45</span>
                                            </div>
                                            <p style="font-size: 12.5px; color: #fff; line-height: 1.4; margin: 0;">Sure. A deadlock occurs when a set of processes are permanently blocked because each process holds a resource and waits for another resource held by another process...</p>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <!-- Card 3: Listening Bar (Compact 46px height) -->
                            <div style="background: #0d0d12; border: 1.5px solid #FF4D4F; box-shadow: 0 0 15px rgba(255,77,79,0.25); border-radius: 16px; padding: 0 18px; height: 46px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div style="width: 26px; height: 26px; border-radius: 50%; background: #FF4D4F; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px;">
                                        <i class="fas fa-microphone"></i>
                                    </div>
                                    <span style="font-size: 12.5px; font-weight: 800; color: #fff;">Listening...</span>
                                </div>

                                <!-- Audio Waveform animation -->
                                <div style="display: flex; align-items: center; gap: 3px; height: 18px;">
                                    <span style="width: 3px; height: 8px; background: #FF4D4F; border-radius: 99px;"></span>
                                    <span style="width: 3px; height: 14px; background: #FF6B6B; border-radius: 99px;"></span>
                                    <span style="width: 3px; height: 18px; background: #FF4D4F; border-radius: 99px;"></span>
                                    <span style="width: 3px; height: 10px; background: #FFA07A; border-radius: 99px;"></span>
                                    <span style="width: 3px; height: 16px; background: #FF4D4F; border-radius: 99px;"></span>
                                </div>

                                <span style="font-size: 11.5px; color: #8B8B8B; font-weight: 600;">Speak now</span>
                            </div>

                        </div>

                        <!-- COLUMN 3: RIGHT EVALUATION COLUMN (28%) -->
                        <div style="display: flex; flex-direction: column; justify-content: space-between; gap: 14px; height: 100%; min-height: 0; overflow: hidden;">
                            
                            <!-- Card 1: Live Evaluation Metrics -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px 18px; flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden;">
                                <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;">
                                    <span style="font-size: 13px; font-weight: 900; color: #fff; display: flex; align-items: center; gap: 6px;">
                                        <i class="fas fa-chart-line" style="color: #FF4D4F;"></i> Live Evaluation
                                    </span>
                                    <span style="font-size: 11px; color: #8B8B8B; display: flex; align-items: center; gap: 5px;">
                                        <i class="fas fa-sync-alt fa-spin" style="font-size: 10px;"></i> Updating...
                                    </span>
                                </div>

                                <div style="display: flex; flex-direction: column; justify-content: space-between; flex: 1; overflow-y: auto; padding-top: 10px; padding-right: 4px; gap: 8px;">
                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 6px; font-weight: 600;"><i class="fas fa-lightbulb" style="color: #FF4D4F;"></i> Technical Accuracy</span>
                                            <span style="font-weight: 800; color: #10B981;">92% ↑</span>
                                        </div>
                                        <div style="width: 100%; height: 5px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 92%; height: 100%; background: #FF4D4F; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 6px; font-weight: 600;"><i class="fas fa-heart" style="color: #FF8C00;"></i> Communication</span>
                                            <span style="font-weight: 800; color: #10B981;">88% ↑</span>
                                        </div>
                                        <div style="width: 100%; height: 5px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 88%; height: 100%; background: #FF8C00; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 6px; font-weight: 600;"><i class="fas fa-shield-alt" style="color: #A855F7;"></i> Confidence</span>
                                            <span style="font-weight: 800; color: #FF4D4F;">85% ↓</span>
                                        </div>
                                        <div style="width: 100%; height: 5px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 85%; height: 100%; background: #A855F7; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 6px; font-weight: 600;"><i class="fas fa-layer-group" style="color: #3B82F6;"></i> Depth of Knowledge</span>
                                            <span style="font-weight: 800; color: #10B981;">90% ↑</span>
                                        </div>
                                        <div style="width: 100%; height: 5px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 90%; height: 100%; background: #3B82F6; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 6px; font-weight: 600;"><i class="fas fa-puzzle-piece" style="color: #06B6D4;"></i> Problem Solving</span>
                                            <span style="font-weight: 800; color: #10B981;">91% ↑</span>
                                        </div>
                                        <div style="width: 100%; height: 5px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 91%; height: 100%; background: #06B6D4; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 6px; font-weight: 600;"><i class="fas fa-book" style="color: #EAB308;"></i> Vocabulary</span>
                                            <span style="font-weight: 800; color: #FF4D4F;">87% ↓</span>
                                        </div>
                                        <div style="width: 100%; height: 5px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 87%; height: 100%; background: #EAB308; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 6px; font-weight: 600;"><i class="fas fa-eye" style="color: #10B981;"></i> Eye Contact</span>
                                            <span style="font-weight: 800; color: #10B981;">82% ↑</span>
                                        </div>
                                        <div style="width: 100%; height: 5px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 82%; height: 100%; background: #10B981; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 6px; font-weight: 600;"><i class="fas fa-volume-up" style="color: #3B82F6;"></i> Voice Clarity</span>
                                            <span style="font-weight: 800; color: #10B981;">89% ↑</span>
                                        </div>
                                        <div style="width: 100%; height: 5px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 89%; height: 100%; background: #3B82F6; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 6px; font-weight: 600;"><i class="fas fa-tachometer-alt" style="color: #8B5CF6;"></i> Speaking Pace</span>
                                            <span style="font-weight: 800; color: #10B981;">Good</span>
                                        </div>
                                        <div style="width: 100%; height: 5px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 75%; height: 100%; background: #8B5CF6; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 11.5px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 6px; font-weight: 600;"><i class="fas fa-stopwatch" style="color: #8B8B8B;"></i> Filler Words</span>
                                            <span style="font-weight: 800; color: #10B981;">2 detected</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Card 2: Overall Interview Score (Compact 64px gauge) -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px 18px; flex-shrink: 0;">
                                <div style="font-size: 12px; font-weight: 800; color: #fff; text-align: left; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                                    <i class="fas fa-chart-line" style="color: #FF8C00;"></i> Overall Interview Score
                                </div>
                                
                                <div style="display: flex; align-items: center; justify-content: space-around; gap: 12px;">
                                    <!-- Circular Gauge -->
                                    <div style="position: relative; width: 64px; height: 64px; border-radius: 50%; border: 6px solid #161620; border-right-color: #FF4D4F; border-top-color: #FF8C00; transform: rotate(45deg); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <span style="font-size: 16px; font-weight: 900; color: #fff; font-family: 'JetBrains Mono', monospace; transform: rotate(-45deg);">91%</span>
                                    </div>

                                    <!-- Right side text -->
                                    <div style="text-align: left; min-width: 0;">
                                        <div style="font-size: 16px; font-weight: 900; color: #10B981; line-height: 1.1;">Excellent</div>
                                        <div style="font-size: 13px; font-weight: 800; color: #fff; margin-top: 1px;">Performance</div>
                                        <div style="font-size: 11px; color: #EAB308; margin-top: 2px;">⭐⭐⭐⭐⭐</div>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                    <!-- 3. BOTTOM TIMELINE (Spans Full Width 100vw, Height 64px, Exact placement under workspace) -->
                    <div style="height: 64px; border-top: 1px solid rgba(255,255,255,0.08); padding: 0 24px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; background: #08080c; overflow: hidden;">
                        <div style="margin-right: 24px; flex-shrink: 0;">
                            <div style="font-size: 12px; font-weight: 800; color: #8B8B8B;">Interview Timeline</div>
                            <div style="font-size: 11px; color: #666; font-family: 'JetBrains Mono', monospace; margin-top: 1px;">00:00</div>
                        </div>

                        <!-- Timeline Nodes -->
                        <div style="flex: 1; display: flex; align-items: center; justify-content: space-between; gap: 6px; min-width: 0; overflow: hidden;">
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; flex-shrink: 0;">
                                <div style="width: 10px; height: 10px; border-radius: 50%; background: #10B981; border: 2px solid #08080c; box-shadow: 0 0 8px #10B981;"></div>
                                <span style="font-size: 10.5px; color: #8B8B8B; font-weight: 700;">Interview Started</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: #10B981; min-width: 6px;"></div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; flex-shrink: 0;">
                                <div style="font-size: 9px; color: #666; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">02:18</div>
                                <div style="width: 10px; height: 10px; border-radius: 50%; background: #10B981; border: 2px solid #08080c; box-shadow: 0 0 8px #10B981;"></div>
                                <span style="font-size: 10.5px; color: #8B8B8B; font-weight: 700;">Ice Breaker</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: #10B981; min-width: 6px;"></div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; flex-shrink: 0;">
                                <div style="font-size: 9px; color: #666; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">04:40</div>
                                <div style="width: 10px; height: 10px; border-radius: 50%; background: #10B981; border: 2px solid #08080c; box-shadow: 0 0 8px #10B981;"></div>
                                <span style="font-size: 10.5px; color: #8B8B8B; font-weight: 700;">Q1: Process vs Thread</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: #10B981; min-width: 6px;"></div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; flex-shrink: 0;">
                                <div style="font-size: 9px; color: #666; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">08:12</div>
                                <div style="width: 10px; height: 10px; border-radius: 50%; background: #10B981; border: 2px solid #08080c; box-shadow: 0 0 8px #10B981;"></div>
                                <span style="font-size: 10.5px; color: #8B8B8B; font-weight: 700;">Q2: Context Switch</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: linear-gradient(to right, #10B981, #FF4D4F); min-width: 6px;"></div>

                            <!-- ACTIVE NODE -->
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; flex-shrink: 0;">
                                <div style="font-size: 10px; color: #fff; font-weight: 800; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">13:42</div>
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: #FF4D4F; border: 2px solid #fff; box-shadow: 0 0 14px #FF4D4F;"></div>
                                <span style="font-size: 10.5px; color: #FF4D4F; font-weight: 800;">Q3: Deadlock</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: #1f1f2e; min-width: 6px;"></div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; opacity: 0.5; flex-shrink: 0;">
                                <div style="font-size: 9px; color: #666; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">18:30</div>
                                <div style="width: 10px; height: 10px; border-radius: 50%; background: #1f1f2e;"></div>
                                <span style="font-size: 10.5px; color: #8B8B8B; font-weight: 700;">Q4: Scheduling</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: #1f1f2e; min-width: 6px;"></div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; opacity: 0.5; flex-shrink: 0;">
                                <div style="font-size: 9px; color: #666; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">23:10</div>
                                <div style="width: 10px; height: 10px; border-radius: 50%; background: #1f1f2e;"></div>
                                <span style="font-size: 10.5px; color: #8B8B8B; font-weight: 700;">Q5: Virtual Memory</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: #1f1f2e; min-width: 6px;"></div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; opacity: 0.5; flex-shrink: 0;">
                                <div style="font-size: 9px; color: #666; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">38:00</div>
                                <div style="width: 10px; height: 10px; border-radius: 50%; background: #1f1f2e;"></div>
                                <span style="font-size: 10.5px; color: #8B8B8B; font-weight: 700;">Final Wrap Up</span>
                            </div>
                        </div>

                        <button style="background: #0f172a; border: 1px solid #1e3a8a; color: #60a5fa; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 800; margin-left: 18px; flex-shrink: 0; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                            <i class="far fa-file-alt"></i> View Report <i class="fas fa-arrow-right" style="font-size: 10px;"></i>
                        </button>
                    </div>

                </div>"""
        content = content[:start_idx] + new_engine_html + content[end_idx:]
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Successfully updated wr-live-engine with pixel-perfect responsive dimensions!")
    else:
        print("Could not find body end index.")
else:
    print("Could not find start index.")
