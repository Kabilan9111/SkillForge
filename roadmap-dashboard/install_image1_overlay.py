import os

image1_html = """
                <!-- ==========================================
                     EXACT 100% IMAGE 1 PIXEL-PERFECT INTERVIEW ENGINE
                     ========================================== -->
                <div id="wr-live-engine" class="wr-live-engine hidden" style="position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 9999999; background: #08080c; color: #fff; display: flex; flex-direction: column; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    
                    <!-- 1. TOP BAR -->
                    <div style="height: 64px; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 0 24px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; background: #08080c;">
                        <!-- Left Side -->
                        <div style="display: flex; align-items: center; gap: 14px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="width: 32px; height: 32px; border-radius: 50%; background: #FF4D4F; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; color: #fff;">SF</div>
                                <span style="font-size: 18px; font-weight: 800; color: #fff; letter-spacing: -0.5px;">SkillForge</span>
                            </div>

                            <button style="background: #14141e; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; margin-left: 12px;">
                                <span>Operating Systems Interview</span>
                                <i class="fas fa-chevron-down" style="font-size: 10px; color: #8B8B8B;"></i>
                            </button>

                            <span style="background: #14141e; border: 1px solid rgba(255,255,255,0.08); color: #8B8B8B; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;">Senior Level</span>

                            <span style="background: #14141e; border: 1px solid rgba(255,255,255,0.08); color: #E879F9; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                                <i class="fas fa-user-tie" style="color: #E879F9;"></i> Google Staff Engineer
                            </span>

                            <span style="display: flex; align-items: center; gap: 6px; color: #10B981; font-size: 13px; font-weight: 700; margin-left: 6px;">
                                <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px #10B981;"></span>
                                Interview in Progress
                            </span>
                        </div>

                        <!-- Right Side -->
                        <div style="display: flex; align-items: center; gap: 20px;">
                            <div style="text-align: right;">
                                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 6px; color: #FF4D4F; font-size: 14px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
                                    <span style="width: 8px; height: 8px; border-radius: 50%; background: #FF4D4F; box-shadow: 0 0 8px #FF4D4F;"></span>
                                    00:14:32
                                </div>
                                <span style="font-size: 11px; color: #8B8B8B;">Time Remaining: 30:28</span>
                            </div>

                            <button id="wr-btn-exit-live" style="background: rgba(255,77,79,0.1); border: 1px solid #FF4D4F; color: #FF4D4F; padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;">
                                <i class="fas fa-power-off"></i> End Interview
                            </button>
                        </div>
                    </div>

                    <!-- 2. MAIN 3-COLUMN CONTENT GRID -->
                    <div style="flex: 1; display: grid; grid-template-columns: 310px minmax(0, 1fr) 330px; gap: 16px; padding: 16px 24px; min-height: 0; overflow: hidden; background: #08080c;">
                        
                        <!-- LEFT COLUMN -->
                        <div style="display: flex; flex-direction: column; gap: 14px; min-height: 0; overflow-y: auto;">
                            
                            <!-- AI Interviewer Card -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 18px; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; flex-shrink: 0;">
                                <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 13px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 6px;">
                                        <i class="fas fa-sparkles" style="color: #FF4D4F;"></i> Al Interviewer
                                    </span>
                                    <i class="fas fa-ellipsis-h" style="color: #8B8B8B; cursor: pointer;"></i>
                                </div>
                                <div style="margin-top: 4px;">
                                    <span style="font-size: 12px; color: #8B8B8B; display: block;">Google Staff Engineer</span>
                                    <span style="font-size: 11px; color: #666; display: block;">15+ Years Experience</span>
                                </div>

                                <!-- Glowing Red Orb with Waveforms -->
                                <div style="position: relative; width: 170px; height: 170px; margin: 18px 0; display: flex; align-items: center; justify-content: center;">
                                    <div style="position: absolute; inset: 0; border-radius: 50%; border: 1.5px solid rgba(255,77,79,0.5); background: radial-gradient(circle, rgba(255,77,79,0.3) 0%, rgba(255,77,79,0.05) 60%, transparent 100%); box-shadow: 0 0 45px rgba(255,77,79,0.4), inset 0 0 30px rgba(255,77,79,0.7);"></div>
                                    
                                    <!-- Crossing Waveforms Graphic -->
                                    <div style="position: relative; z-index: 5; display: flex; align-items: center; gap: 3px; height: 40px;">
                                        <span style="width: 2px; height: 10px; background: #FF4D4F; border-radius: 99px; opacity: 0.6;"></span>
                                        <span style="width: 2px; height: 22px; background: #FF6B6B; border-radius: 99px;"></span>
                                        <span style="width: 2px; height: 35px; background: #FF4D4F; border-radius: 99px; box-shadow: 0 0 8px #FF4D4F;"></span>
                                        <span style="width: 2px; height: 18px; background: #FFA07A; border-radius: 99px;"></span>
                                        <span style="width: 2px; height: 42px; background: #FF4D4F; border-radius: 99px; box-shadow: 0 0 10px #FF4D4F;"></span>
                                        <span style="width: 2px; height: 28px; background: #FF8C00; border-radius: 99px;"></span>
                                        <span style="width: 2px; height: 14px; background: #FF4D4F; border-radius: 99px;"></span>
                                        <span style="width: 2px; height: 32px; background: #FF6B6B; border-radius: 99px;"></span>
                                        <span style="width: 2px; height: 20px; background: #FF4D4F; border-radius: 99px;"></span>
                                        <span style="width: 2px; height: 38px; background: #FF8C00; border-radius: 99px; box-shadow: 0 0 8px #FF8C00;"></span>
                                        <span style="width: 2px; height: 16px; background: #FF4D4F; border-radius: 99px;"></span>
                                        <span style="width: 2px; height: 25px; background: #FF6B6B; border-radius: 99px;"></span>
                                        <span style="width: 2px; height: 12px; background: #FF4D4F; border-radius: 99px; opacity: 0.6;"></span>
                                    </div>
                                </div>

                                <div style="display: flex; align-items: center; gap: 6px; color: #FF4D4F; font-size: 13px; font-weight: 700; margin-bottom: 12px;">
                                    <span style="width: 6px; height: 6px; border-radius: 50%; background: #FF4D4F;"></span> Speaking...
                                </div>

                                <div style="font-size: 13px; font-weight: 700; color: #fff;">Question 3 of 8</div>
                                <div style="font-size: 12px; color: #FF4D4F; font-weight: 600; margin-top: 2px;">Topic: Deadlock Prevention</div>
                            </div>

                            <!-- Your Camera Card -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 10px; flex-shrink: 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 13px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 6px;">
                                        <i class="fas fa-video" style="color: #8B8B8B;"></i> Your Camera
                                    </span>
                                    <span style="display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 800; color: #10B981;">
                                        <span style="width: 6px; height: 6px; border-radius: 50%; background: #10B981;"></span> LIVE
                                    </span>
                                </div>

                                <!-- Realistic Candidate Photo Box -->
                                <div style="height: 150px; background: #14141c; border-radius: 12px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.05);">
                                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80" style="width: 100%; height: 100%; object-fit: cover;" alt="Candidate Feed" />
                                    <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%);"></div>
                                    
                                    <div style="position: absolute; bottom: 8px; left: 8px; display: flex; align-items: center; gap: 6px; z-index: 10;">
                                        <span style="background: #10B981; color: #fff; font-size: 9px; font-weight: 800; padding: 2px 5px; border-radius: 4px;">HD</span>
                                        <i class="fas fa-microphone" style="color: #10B981; font-size: 11px;"></i>
                                        <i class="fas fa-signal" style="color: #10B981; font-size: 11px;"></i>
                                    </div>
                                </div>
                            </div>

                            <!-- Controls Panel Grid -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 12px; flex-shrink: 0;">
                                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                                    <button style="background: rgba(255,77,79,0.15); border: 1px solid #FF4D4F; color: #FF4D4F; padding: 12px 4px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer;">
                                        <div style="width: 24px; height: 24px; border-radius: 50%; background: #FF4D4F; display: flex; align-items: center; justify-content: center; color: #fff;"><i class="fas fa-microphone" style="font-size: 11px;"></i></div>
                                        <span style="font-size: 10px; font-weight: 700;">Mic On</span>
                                    </button>
                                    <button style="background: #161620; border: 1px solid rgba(255,255,255,0.08); color: #fff; padding: 12px 4px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer;">
                                        <i class="fas fa-video" style="font-size: 16px; color: #ddd; margin: 4px 0;"></i>
                                        <span style="font-size: 10px; font-weight: 700;">Camera On</span>
                                    </button>
                                    <button style="background: #161620; border: 1px solid rgba(255,255,255,0.08); color: #fff; padding: 12px 4px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer;">
                                        <i class="fas fa-desktop" style="font-size: 16px; color: #ddd; margin: 4px 0;"></i>
                                        <span style="font-size: 10px; font-weight: 700;">Share Screen</span>
                                    </button>
                                    <button style="background: #161620; border: 1px solid rgba(255,255,255,0.08); color: #fff; padding: 12px 4px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer;">
                                        <i class="fas fa-cog" style="font-size: 16px; color: #ddd; margin: 4px 0;"></i>
                                        <span style="font-size: 10px; font-weight: 700;">Settings</span>
                                    </button>
                                </div>

                                <div style="padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 12px; color: #aaa; display: flex; align-items: center; gap: 6px;">
                                        <i class="fas fa-bolt" style="color: #8B8B8B;"></i> Noise Cancellation
                                    </span>
                                    <!-- Red Toggle Switch -->
                                    <div style="width: 36px; height: 20px; border-radius: 99px; background: #FF4D4F; position: relative; cursor: pointer; padding: 2px;">
                                        <div style="width: 16px; height: 16px; border-radius: 50%; background: #fff; position: absolute; right: 2px;"></div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <!-- CENTER COLUMN -->
                        <div style="display: flex; flex-direction: column; gap: 14px; min-height: 0; overflow: hidden;">
                            
                            <!-- Current Question Card -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 22px; flex-shrink: 0; position: relative;">
                                <div style="font-size: 12px; font-weight: 700; color: #8B8B8B;">Current Question</div>
                                <i class="far fa-bookmark" style="position: absolute; top: 22px; right: 22px; color: #8B8B8B; font-size: 16px; cursor: pointer;"></i>
                                
                                <div style="font-size: 38px; color: #FF4D4F; line-height: 1; font-family: Georgia, serif; margin: 4px 0 -8px 0;">“</div>
                                <h1 style="font-size: 22px; font-weight: 800; color: #fff; margin: 8px 0 6px 0;">Explain Deadlock in Operating Systems.</h1>
                                <p style="font-size: 13px; color: #8B8B8B; margin: 0;">Take your time and explain with an example.</p>
                            </div>

                            <!-- Live Conversation Card -->
                            <div style="flex: 1; background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; min-height: 0; overflow: hidden;">
                                <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;">
                                    <span style="font-size: 14px; font-weight: 800; color: #fff;">Live Conversation</span>
                                    <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #8B8B8B;">
                                        <span>Auto Transcription</span>
                                        <div style="width: 34px; height: 18px; border-radius: 99px; background: #10B981; position: relative; cursor: pointer;">
                                            <div style="width: 14px; height: 14px; border-radius: 50%; background: #fff; position: absolute; right: 2px; top: 2px;"></div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Message Feed -->
                                <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; padding-top: 16px; padding-right: 8px;">
                                    
                                    <!-- AI Message 1 -->
                                    <div style="display: flex; gap: 12px; align-items: flex-start;">
                                        <div style="width: 36px; height: 36px; border-radius: 50%; background: radial-gradient(circle, #FF4D4F, #800); border: 1px solid rgba(255,77,79,0.5); flex-shrink: 0; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(255,77,79,0.4);">
                                            <span style="width: 14px; height: 3px; background: #fff; border-radius: 99px;"></span>
                                        </div>
                                        <div style="flex: 1;">
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                                <div>
                                                    <span style="font-size: 13px; font-weight: 700; color: #fff;">AI Interviewer</span>
                                                    <span style="font-size: 11px; color: #666; margin-left: 6px; font-family: 'JetBrains Mono', monospace;">14:12:32</span>
                                                </div>
                                                <div style="display: flex; align-items: center; gap: 8px;">
                                                    <span style="display: flex; align-items: center; gap: 2px;">
                                                        <span style="width: 2px; height: 8px; background: #FF4D4F; border-radius: 99px;"></span>
                                                        <span style="width: 2px; height: 14px; background: #FF4D4F; border-radius: 99px;"></span>
                                                        <span style="width: 2px; height: 6px; background: #FF4D4F; border-radius: 99px;"></span>
                                                        <span style="width: 2px; height: 16px; background: #FF4D4F; border-radius: 99px;"></span>
                                                        <span style="width: 2px; height: 10px; background: #FF4D4F; border-radius: 99px;"></span>
                                                    </span>
                                                    <div style="width: 26px; height: 26px; border-radius: 50%; background: #181822; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                                                        <i class="fas fa-play" style="font-size: 10px; color: #fff; margin-left: 2px;"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style="font-size: 14px; color: #ddd; line-height: 1.5;">Explain Deadlock in Operating Systems.</div>
                                        </div>
                                    </div>

                                    <!-- User Message -->
                                    <div style="display: flex; gap: 12px; align-items: flex-start;">
                                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.2);" alt="You" />
                                        <div style="flex: 1;">
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                                <div>
                                                    <span style="font-size: 13px; font-weight: 700; color: #fff;">You</span>
                                                    <span style="font-size: 11px; color: #666; margin-left: 6px; font-family: 'JetBrains Mono', monospace;">14:13:02</span>
                                                </div>
                                                <div style="display: flex; align-items: center; gap: 8px;">
                                                    <span style="display: flex; align-items: center; gap: 2px;">
                                                        <span style="width: 2px; height: 10px; background: #10B981; border-radius: 99px;"></span>
                                                        <span style="width: 2px; height: 18px; background: #10B981; border-radius: 99px;"></span>
                                                        <span style="width: 2px; height: 8px; background: #10B981; border-radius: 99px;"></span>
                                                        <span style="width: 2px; height: 14px; background: #10B981; border-radius: 99px;"></span>
                                                        <span style="width: 2px; height: 12px; background: #10B981; border-radius: 99px;"></span>
                                                    </span>
                                                    <div style="width: 26px; height: 26px; border-radius: 50%; background: #181822; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                                                        <i class="fas fa-play" style="font-size: 10px; color: #fff; margin-left: 2px;"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style="font-size: 14px; color: #ddd; line-height: 1.5;">Deadlock is a situation in which two or more processes are blocked forever, waiting for each other to release resources. It occurs when four necessary conditions hold simultaneously...</div>
                                        </div>
                                    </div>

                                    <!-- AI Message 2 -->
                                    <div style="display: flex; gap: 12px; align-items: flex-start;">
                                        <div style="width: 36px; height: 36px; border-radius: 50%; background: radial-gradient(circle, #FF4D4F, #800); border: 1px solid rgba(255,77,79,0.5); flex-shrink: 0; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(255,77,79,0.4);">
                                            <span style="width: 14px; height: 3px; background: #fff; border-radius: 99px;"></span>
                                        </div>
                                        <div style="flex: 1;">
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                                <div>
                                                    <span style="font-size: 13px; font-weight: 700; color: #fff;">AI Interviewer</span>
                                                    <span style="font-size: 11px; color: #666; margin-left: 6px; font-family: 'JetBrains Mono', monospace;">14:13:45</span>
                                                </div>
                                                <div style="display: flex; align-items: center; gap: 8px;">
                                                    <span style="display: flex; align-items: center; gap: 2px;">
                                                        <span style="width: 2px; height: 8px; background: #FF4D4F; border-radius: 99px;"></span>
                                                        <span style="width: 2px; height: 16px; background: #FF4D4F; border-radius: 99px;"></span>
                                                        <span style="width: 2px; height: 10px; background: #FF4D4F; border-radius: 99px;"></span>
                                                        <span style="width: 2px; height: 18px; background: #FF4D4F; border-radius: 99px;"></span>
                                                        <span style="width: 2px; height: 8px; background: #FF4D4F; border-radius: 99px;"></span>
                                                    </span>
                                                    <div style="width: 26px; height: 26px; border-radius: 50%; background: #181822; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                                                        <i class="fas fa-play" style="font-size: 10px; color: #fff; margin-left: 2px;"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style="font-size: 14px; color: #ddd; line-height: 1.5;">Good explanation! 👍<br/>Now explain the four necessary conditions (Coffman Conditions) for Deadlock.</div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <!-- Bottom Listening Bar -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,77,79,0.5); border-radius: 16px; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 0 25px rgba(255,77,79,0.15); flex-shrink: 0;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="width: 32px; height: 32px; border-radius: 50%; background: #FF4D4F; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px #FF4D4F;">
                                        <i class="fas fa-microphone" style="color: #fff; font-size: 13px;"></i>
                                    </div>
                                    <span style="font-size: 14px; font-weight: 800; color: #fff;">Listening...</span>
                                </div>

                                <!-- Center Waveform -->
                                <div style="display: flex; align-items: center; gap: 4px; height: 24px;">
                                    <span style="width: 3px; height: 8px; background: #FF4D4F; border-radius: 99px;"></span>
                                    <span style="width: 3px; height: 16px; background: #FF4D4F; border-radius: 99px;"></span>
                                    <span style="width: 3px; height: 10px; background: #FF4D4F; border-radius: 99px;"></span>
                                    <span style="width: 3px; height: 24px; background: #FF4D4F; border-radius: 99px;"></span>
                                    <span style="width: 3px; height: 14px; background: #FF4D4F; border-radius: 99px;"></span>
                                    <span style="width: 3px; height: 20px; background: #FF4D4F; border-radius: 99px;"></span>
                                    <span style="width: 3px; height: 10px; background: #FF4D4F; border-radius: 99px;"></span>
                                </div>

                                <span style="font-size: 13px; color: #8B8B8B;">Speak now</span>
                            </div>

                        </div>

                        <!-- RIGHT COLUMN -->
                        <div style="display: flex; flex-direction: column; gap: 14px; min-height: 0; overflow-y: auto;">
                            
                            <!-- Live Evaluation Card -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 18px; flex-shrink: 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <span style="font-size: 14px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px;">
                                        <i class="fas fa-chart-line" style="color: #FF4D4F;"></i> Live Evaluation
                                    </span>
                                    <span style="font-size: 11px; color: #8B8B8B; display: flex; align-items: center; gap: 4px;">
                                        <i class="fas fa-sync-alt fa-spin" style="font-size: 10px;"></i> Updating...
                                    </span>
                                </div>

                                <div style="display: flex; flex-direction: column; gap: 13px; margin-top: 14px;">
                                    
                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
                                            <span style="color: #ddd; display: flex; align-items: center; gap: 6px;"><i class="fas fa-lightbulb" style="color: #FF4D4F;"></i> Technical Accuracy</span>
                                            <span style="font-weight: 700; color: #10B981;">92% ↑</span>
                                        </div>
                                        <div style="width: 100%; height: 6px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 92%; height: 100%; background: #FF4D4F; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
                                            <span style="color: #ddd; display: flex; align-items: center; gap: 6px;"><i class="fas fa-heart" style="color: #FF8C00;"></i> Communication</span>
                                            <span style="font-weight: 700; color: #10B981;">88% ↑</span>
                                        </div>
                                        <div style="width: 100%; height: 6px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 88%; height: 100%; background: #FF8C00; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
                                            <span style="color: #ddd; display: flex; align-items: center; gap: 6px;"><i class="fas fa-shield-alt" style="color: #A855F7;"></i> Confidence</span>
                                            <span style="font-weight: 700; color: #10B981;">85% ↑</span>
                                        </div>
                                        <div style="width: 100%; height: 6px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 85%; height: 100%; background: #A855F7; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
                                            <span style="color: #ddd; display: flex; align-items: center; gap: 6px;"><i class="fas fa-layer-group" style="color: #3B82F6;"></i> Depth of Knowledge</span>
                                            <span style="font-weight: 700; color: #10B981;">90% ↑</span>
                                        </div>
                                        <div style="width: 100%; height: 6px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 90%; height: 100%; background: #3B82F6; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
                                            <span style="color: #ddd; display: flex; align-items: center; gap: 6px;"><i class="fas fa-puzzle-piece" style="color: #06B6D4;"></i> Problem Solving</span>
                                            <span style="font-weight: 700; color: #10B981;">91% ↑</span>
                                        </div>
                                        <div style="width: 100%; height: 6px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 91%; height: 100%; background: #06B6D4; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
                                            <span style="color: #ddd; display: flex; align-items: center; gap: 6px;"><i class="fas fa-book" style="color: #EAB308;"></i> Vocabulary</span>
                                            <span style="font-weight: 700; color: #FF4D4F;">87% ↓</span>
                                        </div>
                                        <div style="width: 100%; height: 6px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 87%; height: 100%; background: #EAB308; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
                                            <span style="color: #ddd; display: flex; align-items: center; gap: 6px;"><i class="fas fa-eye" style="color: #10B981;"></i> Eye Contact</span>
                                            <span style="font-weight: 700; color: #10B981;">82% ↑</span>
                                        </div>
                                        <div style="width: 100%; height: 6px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 82%; height: 100%; background: #10B981; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
                                            <span style="color: #ddd; display: flex; align-items: center; gap: 6px;"><i class="fas fa-volume-up" style="color: #3B82F6;"></i> Voice Clarity</span>
                                            <span style="font-weight: 700; color: #10B981;">89% ↑</span>
                                        </div>
                                        <div style="width: 100%; height: 6px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 89%; height: 100%; background: #3B82F6; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
                                            <span style="color: #ddd; display: flex; align-items: center; gap: 6px;"><i class="fas fa-tachometer-alt" style="color: #8B5CF6;"></i> Speaking Pace</span>
                                            <span style="font-weight: 700; color: #10B981;">Good</span>
                                        </div>
                                        <div style="width: 100%; height: 6px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 75%; height: 100%; background: #8B5CF6; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12px;">
                                            <span style="color: #ddd; display: flex; align-items: center; gap: 6px;"><i class="fas fa-stopwatch" style="color: #8B8B8B;"></i> Filler Words</span>
                                            <span style="font-weight: 700; color: #10B981;">2 detected</span>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <!-- Overall Interview Score Card -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; text-align: center; flex-shrink: 0;">
                                <div style="font-size: 13px; font-weight: 800; color: #fff; text-align: left; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-chart-line" style="color: #FF8C00;"></i> Overall Interview Score
                                </div>
                                
                                <div style="display: flex; align-items: center; justify-content: center; gap: 16px; margin: 10px 0;">
                                    <span style="font-size: 46px; font-weight: 900; color: #fff; font-family: 'JetBrains Mono', monospace; line-height: 1;">91%</span>
                                    <!-- Semi-circular arc representation -->
                                    <div style="width: 48px; height: 48px; border-radius: 50%; border: 6px solid #161620; border-right-color: #FF4D4F; border-top-color: #FF8C00; transform: rotate(45deg);"></div>
                                </div>

                                <div style="font-size: 13px; font-weight: 700; color: #10B981; display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 10px;">
                                    <i class="fas fa-star" style="color: #EAB308;"></i> Excellent Performance
                                </div>
                            </div>

                        </div>

                    </div>

                    <!-- 3. BOTTOM TIMELINE -->
                    <div style="height: 72px; border-top: 1px solid rgba(255,255,255,0.08); padding: 0 24px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; background: #08080c;">
                        <div style="margin-right: 24px; flex-shrink: 0;">
                            <div style="font-size: 11px; font-weight: 700; color: #8B8B8B;">Interview Timeline</div>
                            <div style="font-size: 11px; color: #666; font-family: 'JetBrains Mono', monospace;">00:00</div>
                        </div>

                        <!-- Timeline Nodes -->
                        <div style="flex: 1; display: flex; align-items: center; justify-content: space-between; gap: 6px; min-width: 680px;">
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: #10B981; border: 2px solid #08080c; box-shadow: 0 0 6px #10B981;"></div>
                                <span style="font-size: 10px; color: #8B8B8B; font-weight: 600;">Interview Started</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: #10B981;"></div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                                <div style="font-size: 10px; color: #666; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">02:18</div>
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: #10B981; border: 2px solid #08080c; box-shadow: 0 0 6px #10B981;"></div>
                                <span style="font-size: 10px; color: #8B8B8B; font-weight: 600;">Ice Breaker</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: #10B981;"></div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                                <div style="font-size: 10px; color: #666; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">04:40</div>
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: #10B981; border: 2px solid #08080c; box-shadow: 0 0 6px #10B981;"></div>
                                <span style="font-size: 10px; color: #8B8B8B; font-weight: 600;">Q1: Process vs Thread</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: #10B981;"></div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                                <div style="font-size: 10px; color: #666; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">08:12</div>
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: #10B981; border: 2px solid #08080c; box-shadow: 0 0 6px #10B981;"></div>
                                <span style="font-size: 10px; color: #8B8B8B; font-weight: 600;">Q2: Context Switch</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: linear-gradient(to right, #10B981, #FF4D4F);"></div>

                            <!-- ACTIVE NODE -->
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                                <div style="font-size: 11px; color: #fff; font-weight: 800; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">13:42</div>
                                <div style="width: 14px; height: 14px; border-radius: 50%; background: #FF4D4F; border: 3px solid #fff; box-shadow: 0 0 14px #FF4D4F;"></div>
                                <span style="font-size: 11px; color: #FF4D4F; font-weight: 800;">Q3: Deadlock</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: #1f1f2e;"></div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; opacity: 0.5;">
                                <div style="font-size: 10px; color: #666; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">18:30</div>
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: #1f1f2e;"></div>
                                <span style="font-size: 10px; color: #8B8B8B;">Q4: Scheduling</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: #1f1f2e;"></div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; opacity: 0.5;">
                                <div style="font-size: 10px; color: #666; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">23:10</div>
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: #1f1f2e;"></div>
                                <span style="font-size: 10px; color: #8B8B8B;">Q5: Virtual Memory</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: #1f1f2e;"></div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; opacity: 0.5;">
                                <div style="font-size: 10px; color: #666; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">28:50</div>
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: #1f1f2e;"></div>
                                <span style="font-size: 10px; color: #8B8B8B;">Final Wrap Up</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: #1f1f2e;"></div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; opacity: 0.5;">
                                <div style="font-size: 10px; color: #666; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">35:00</div>
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: #1f1f2e;"></div>
                                <span style="font-size: 10px; color: #8B8B8B;">Interview End</span>
                            </div>
                        </div>

                        <button style="background: #0f172a; border: 1px solid #1e3a8a; color: #60a5fa; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; margin-left: 24px; flex-shrink: 0; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                            <i class="far fa-file-alt"></i> View Full Report
                        </button>
                    </div>

                </div>
"""

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

start_marker = '<div id="wr-live-engine"'
if start_marker in html:
    start_idx = html.find(start_marker)
    # find where wr-live-engine div ends or find the next section marker
    next_marker = '<!-- =========================================='
    end_idx = html.find(next_marker, start_idx + len(start_marker))
    if end_idx != -1:
        new_html = html[:start_idx] + image1_html + html[end_idx:]
        with open("index.html", "w", encoding="utf-8") as f:
            f.write(new_html)
        print("Updated index.html wr-live-engine with 100% exact Image 1 full-screen overlay UI.")
    else:
        print("Could not find next_marker after wr-live-engine.")
else:
    print("Could not find start_marker wr-live-engine.")
