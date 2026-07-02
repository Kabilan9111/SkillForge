import os

image1_html = """
                <!-- ==========================================
                     EXACT 100% PIXEL-PERFECT WAR ROOM RECREATION (30% : 45% : 25% ENTERPRISE DESKTOP GRID)
                     ========================================== -->
                <div id="wr-live-engine" class="wr-live-engine hidden" style="position: fixed; inset: 0; width: 100vw; height: 100vh; min-width: 1920px; z-index: 9999999; background: #08080c; color: #fff; display: flex; flex-direction: column; overflow: hidden; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; user-select: none;">
                    
                    <!-- 1. TOP INTERVIEW HEADER (64px) -->
                    <div style="height: 64px; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 0 24px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; background: #08080c;">
                        <!-- Left Side -->
                        <div style="display: flex; align-items: center; gap: 14px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="width: 32px; height: 32px; border-radius: 8px; background: #FF4D4F; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; color: #fff;">SF</div>
                                <span style="font-size: 18px; font-weight: 800; color: #fff; letter-spacing: -0.5px;">SkillForge</span>
                            </div>

                            <button id="wr-btn-exit-live" style="background: #14141e; border: 1px solid rgba(255,255,255,0.12); color: #fff; padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; margin-left: 12px; transition: all 0.2s;">
                                <i class="fas fa-arrow-left" style="font-size: 11px;"></i> End Interview
                            </button>

                            <div style="background: rgba(255,77,79,0.15); border: 1px solid rgba(255,77,79,0.4); color: #FF4D4F; padding: 5px 12px; border-radius: 99px; font-size: 12px; font-weight: 800; display: flex; align-items: center; gap: 6px; font-family: 'JetBrains Mono', monospace;">
                                <span style="width: 7px; height: 7px; border-radius: 50%; background: #FF4D4F; box-shadow: 0 0 8px #FF4D4F;"></span>
                                REC 00:14:32
                            </div>

                            <span style="display: flex; align-items: center; gap: 6px; color: #10B981; font-size: 12px; font-weight: 700;">
                                <i class="fas fa-shield-alt"></i> 12ms Encrypted
                            </span>

                            <button style="background: #14141e; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                                <span>Operating Systems Interview</span>
                                <i class="fas fa-chevron-down" style="font-size: 10px; color: #8B8B8B;"></i>
                            </button>

                            <button style="background: #14141e; border: 1px solid rgba(255,255,255,0.1); color: #E879F9; padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-user-tie"></i>
                                <span>Google Staff Engineer</span>
                                <i class="fas fa-chevron-down" style="font-size: 10px; color: #8B8B8B;"></i>
                            </button>
                        </div>

                        <!-- Right Side -->
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <span style="display: flex; align-items: center; gap: 6px; color: #10B981; font-size: 13px; font-weight: 700;">
                                <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px #10B981;"></span>
                                Interview in Progress
                            </span>

                            <div style="text-align: right; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 16px;">
                                <div style="font-size: 10px; color: #8B8B8B; font-weight: 600; text-transform: uppercase;">Time Remaining</div>
                                <div style="font-size: 16px; font-weight: 900; color: #fff; font-family: 'JetBrains Mono', monospace; line-height: 1.1;">30:28</div>
                            </div>

                            <div style="display: flex; align-items: center; gap: 8px;">
                                <button style="width: 36px; height: 36px; border-radius: 8px; background: #14141e; border: 1px solid rgba(255,255,255,0.1); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                                    <i class="far fa-question-circle"></i>
                                </button>
                                <button style="width: 36px; height: 36px; border-radius: 8px; background: #14141e; border: 1px solid rgba(255,255,255,0.1); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                                    <i class="fas fa-cog"></i>
                                </button>
                                <button id="wr-btn-hangup" style="width: 36px; height: 36px; border-radius: 8px; background: #FF4D4F; border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 0 15px rgba(255,77,79,0.5);">
                                    <i class="fas fa-phone-slash"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 2. BODY CONTAINER (30% : 45% : 25% GRID, 24px GAPS & PADDING) -->
                    <!-- Height = 100vh - Header(64px) - Timeline(90px) = calc(100vh - 154px) -->
                    <div style="height: calc(100vh - 154px); display: grid; grid-template-columns: 30fr 45fr 25fr; gap: 24px; padding: 24px; overflow: hidden; background: #08080c; min-width: 0;">
                        
                        <!-- COLUMN 1: LEFT MEDIA COLUMN (30%) -->
                        <div style="display: flex; flex-direction: column; justify-content: space-between; gap: 24px; height: 100%; min-height: 0; overflow: hidden;">
                            
                            <!-- Card 1: AI Interviewer (Height ~340px / spacious, 24px padding, 18px radius) -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; flex-shrink: 0; min-height: 280px;">
                                <div style="position: absolute; top: 20px; left: 24px; right: 24px; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 13px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px;">
                                        <i class="fas fa-sparkles" style="color: #FF4D4F;"></i> Al Interviewer
                                    </span>
                                    <i class="fas fa-ellipsis-h" style="color: #8B8B8B; cursor: pointer;"></i>
                                </div>
                                
                                <div style="margin-top: 16px;">
                                    <span style="font-size: 14px; font-weight: 700; color: #fff; display: block;">Google Staff Engineer</span>
                                    <span style="font-size: 12px; color: #8B8B8B; display: block; margin-top: 2px;">15+ Years Experience</span>
                                </div>

                                <!-- Centered Glowing Voice Orb -->
                                <div style="position: relative; width: 110px; height: 110px; margin: 16px 0; display: flex; align-items: center; justify-content: center;">
                                    <div style="position: absolute; inset: 0; border-radius: 50%; border: 1.5px solid rgba(255,77,79,0.5); background: radial-gradient(circle, rgba(255,77,79,0.3) 0%, rgba(255,77,79,0.05) 60%, transparent 100%); box-shadow: 0 0 40px rgba(255,77,79,0.4), inset 0 0 25px rgba(255,77,79,0.7);"></div>
                                    <div style="position: relative; z-index: 5; display: flex; align-items: center; gap: 3px; height: 34px;">
                                        <span style="width: 3px; height: 10px; background: #FF4D4F; border-radius: 99px;"></span>
                                        <span style="width: 3px; height: 20px; background: #FF6B6B; border-radius: 99px;"></span>
                                        <span style="width: 3px; height: 32px; background: #FF4D4F; border-radius: 99px;"></span>
                                        <span style="width: 3px; height: 18px; background: #FFA07A; border-radius: 99px;"></span>
                                        <span style="width: 3px; height: 34px; background: #FF4D4F; border-radius: 99px;"></span>
                                        <span style="width: 3px; height: 22px; background: #FF8C00; border-radius: 99px;"></span>
                                        <span style="width: 3px; height: 12px; background: #FF4D4F; border-radius: 99px;"></span>
                                    </div>
                                </div>

                                <div style="display: flex; align-items: center; gap: 6px; color: #FF4D4F; font-size: 12px; font-weight: 800; margin-bottom: 6px;">
                                    <span style="width: 7px; height: 7px; border-radius: 50%; background: #FF4D4F; box-shadow: 0 0 8px #FF4D4F;"></span> Speaking...
                                </div>

                                <div style="font-size: 13px; font-weight: 800; color: #fff;">Question 3 of 8</div>
                                <div style="font-size: 12px; color: #FF4D4F; font-weight: 700; margin-top: 2px;">Topic: Deadlock Prevention</div>
                            </div>

                            <!-- Card 2: Candidate Feed (Large Landscape Webcam 16:9, ~75% visual dominance in column) -->
                            <div style="background: #0d0d12; border: 1.5px solid #FF4D4F; box-shadow: 0 0 22px rgba(255,77,79,0.25); border-radius: 18px; padding: 24px; display: flex; flex-direction: column; gap: 14px; flex: 1; min-height: 0; justify-content: space-between;">
                                <div style="display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                                    <span style="font-size: 13px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px;">
                                        <i class="fas fa-video" style="color: #FF4D4F;"></i> Candidate Feed
                                    </span>
                                    <span style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; color: #10B981;">
                                        <span style="width: 7px; height: 7px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px #10B981;"></span> LIVE
                                    </span>
                                </div>

                                <!-- Candidate Photo Preview (Large 16:9 Teams/Zoom appearance) -->
                                <div style="flex: 1; min-height: 180px; background: #14141c; border-radius: 14px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80" style="width: 100%; height: 100%; object-fit: cover; object-position: center 20%;" alt="Candidate Feed" />
                                    <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 40%);"></div>
                                    
                                    <!-- Top Left: LIVE -->
                                    <div style="position: absolute; top: 12px; left: 12px; display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 800; color: #10B981; background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 6px;">
                                        <span style="width: 6px; height: 6px; border-radius: 50%; background: #10B981;"></span> LIVE
                                    </div>
                                    <!-- Top Right: Resolution -->
                                    <div style="position: absolute; top: 12px; right: 12px; font-size: 11px; font-weight: 700; color: #ddd; background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 6px;">
                                        1080P • 60 FPS
                                    </div>
                                    <!-- Bottom Left: Mic Active -->
                                    <div style="position: absolute; bottom: 12px; left: 12px; display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #10B981;">
                                        <i class="fas fa-microphone" style="color: #10B981;"></i> Mic Active
                                    </div>
                                    <!-- Bottom Right: Camera Status -->
                                    <div style="position: absolute; bottom: 12px; right: 12px; display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #10B981;">
                                        <i class="fas fa-video" style="color: #10B981;"></i> Camera HD
                                    </div>
                                </div>
                            </div>

                            <!-- Card 3: Controls (Equal width/height, 60px+ height, rounded 14px) -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 16px 24px; flex-shrink: 0;">
                                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
                                    <button style="height: 64px; background: rgba(255,77,79,0.15); border: 1.5px solid #FF4D4F; color: #FF4D4F; border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; cursor: pointer; transition: all 0.2s;">
                                        <div style="width: 22px; height: 22px; border-radius: 50%; background: #FF4D4F; display: flex; align-items: center; justify-content: center; color: #fff;"><i class="fas fa-microphone" style="font-size: 11px;"></i></div>
                                        <span style="font-size: 11px; font-weight: 800;">Mic On</span>
                                    </button>
                                    <button style="height: 64px; background: #161620; border: 1px solid rgba(255,255,255,0.08); color: #fff; border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; cursor: pointer; transition: all 0.2s;">
                                        <i class="fas fa-video" style="font-size: 17px; color: #ddd;"></i>
                                        <span style="font-size: 11px; font-weight: 800;">Camera On</span>
                                    </button>
                                    <button style="height: 64px; background: #161620; border: 1px solid rgba(255,255,255,0.08); color: #fff; border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; cursor: pointer; transition: all 0.2s;">
                                        <i class="fas fa-desktop" style="font-size: 17px; color: #ddd;"></i>
                                        <span style="font-size: 11px; font-weight: 800;">Share Screen</span>
                                    </button>
                                    <button style="height: 64px; background: #161620; border: 1px solid rgba(255,255,255,0.08); color: #fff; border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; cursor: pointer; transition: all 0.2s;">
                                        <i class="fas fa-cog" style="font-size: 17px; color: #ddd;"></i>
                                        <span style="font-size: 11px; font-weight: 800;">Settings</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Card 4: Noise Cancellation Row (Elegant row, 52px height) -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 0 24px; height: 54px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                                <span style="font-size: 13px; color: #fff; display: flex; align-items: center; gap: 8px; font-weight: 700;">
                                    <i class="fas fa-bolt" style="color: #FF4D4F;"></i> AI Noise Cancellation
                                </span>
                                <div style="width: 44px; height: 24px; border-radius: 99px; background: #FF4D4F; position: relative; cursor: pointer; padding: 3px; box-shadow: 0 0 12px rgba(255,77,79,0.4);">
                                    <div style="width: 18px; height: 18px; border-radius: 50%; background: #fff; position: absolute; right: 3px;"></div>
                                </div>
                            </div>

                        </div>

                        <!-- COLUMN 2: CENTER CONVERSATION COLUMN (45%) -->
                        <div style="display: flex; flex-direction: column; justify-content: space-between; gap: 24px; height: 100%; min-height: 0; overflow: hidden;">
                            
                            <!-- Category Tabs Row -->
                            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; flex-shrink: 0;">
                                <button style="background: rgba(255,77,79,0.2); border: 1px solid #FF4D4F; color: #fff; padding: 6px 18px; border-radius: 10px; font-size: 13px; font-weight: 800; cursor: pointer;">Coding</button>
                                <button style="background: #12121a; border: 1px solid rgba(255,255,255,0.08); color: #8B8B8B; padding: 6px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer;">System Design</button>
                                <button style="background: #12121a; border: 1px solid rgba(255,255,255,0.08); color: #8B8B8B; padding: 6px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer;">Behavioral</button>
                                <button style="background: #12121a; border: 1px solid rgba(255,255,255,0.08); color: #8B8B8B; padding: 6px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer;">Architecture</button>
                                <button style="background: #12121a; border: 1px solid rgba(255,255,255,0.08); color: #8B8B8B; padding: 6px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer;">Code Review</button>
                                <button style="background: #12121a; border: 1px solid rgba(255,255,255,0.08); color: #8B8B8B; padding: 6px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer;">Leadership</button>
                            </div>

                            <!-- Card 1: Current Question (24px padding, 18px radius) -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 24px; flex-shrink: 0; position: relative;">
                                <div style="font-size: 12px; font-weight: 800; color: #8B8B8B; text-transform: uppercase; letter-spacing: 0.5px;">Current Question</div>
                                <i class="far fa-bookmark" style="position: absolute; top: 24px; right: 24px; color: #8B8B8B; font-size: 16px; cursor: pointer;"></i>
                                
                                <div style="font-size: 34px; color: #FF4D4F; line-height: 1; font-family: Georgia, serif; margin: 4px 0 -10px 0;">“</div>
                                <h1 style="font-size: 20px; font-weight: 900; color: #fff; margin: 8px 0 6px 0; letter-spacing: -0.3px;">Explain Deadlock in Operating Systems.</h1>
                                <p style="font-size: 13px; color: #8B8B8B; margin: 0 0 16px 0;">Take your time and explain with an example.</p>
                                
                                <!-- Badges -->
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span style="background: #161620; border: 1px solid rgba(255,255,255,0.08); color: #fff; font-size: 12px; font-weight: 800; padding: 5px 12px; border-radius: 8px; display: flex; align-items: center; gap: 6px;">
                                        <span style="width: 7px; height: 7px; border-radius: 50%; background: #FF8C00;"></span> Medium
                                    </span>
                                    <span style="background: #161620; border: 1px solid rgba(255,255,255,0.08); color: #fff; font-size: 12px; font-weight: 800; padding: 5px 12px; border-radius: 8px; display: flex; align-items: center; gap: 6px;">
                                        <span style="color: #FF4D4F; font-weight: 900;">G</span> Google
                                    </span>
                                    <span style="background: #161620; border: 1px solid rgba(255,255,255,0.08); color: #fff; font-size: 12px; font-weight: 800; padding: 5px 12px; border-radius: 8px; display: flex; align-items: center; gap: 6px;">
                                        <i class="fas fa-random" style="color: #EAB308;"></i> Operating Systems
                                    </span>
                                </div>
                            </div>

                            <!-- Card 2: Live Conversation (Owns most vertical space, 24px padding, scrolling feed inside) -->
                            <div style="flex: 1; background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 24px; display: flex; flex-direction: column; min-height: 0; overflow: hidden;">
                                <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;">
                                    <span style="font-size: 14px; font-weight: 900; color: #fff;">Live Conversation</span>
                                    <div style="display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 700; color: #8B8B8B;">
                                        <span>Auto Transcription</span>
                                        <div style="width: 36px; height: 20px; border-radius: 99px; background: #10B981; position: relative; cursor: pointer;">
                                            <div style="width: 16px; height: 16px; border-radius: 50%; background: #fff; position: absolute; right: 2px; top: 2px;"></div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Message Feed (Scrolling area ONLY) -->
                                <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; padding-top: 16px; padding-right: 8px; min-height: 0;">
                                    <!-- AI Message 1 -->
                                    <div style="display: flex; gap: 14px; align-items: flex-start; background: #13131c; padding: 14px 18px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.04);">
                                        <div style="width: 34px; height: 34px; border-radius: 50%; background: radial-gradient(circle, #FF4D4F, #800); border: 1px solid rgba(255,77,79,0.5); flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                                            <span style="width: 12px; height: 2px; background: #fff; border-radius: 99px;"></span>
                                        </div>
                                        <div style="flex: 1; min-width: 0;">
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                                <div>
                                                    <span style="font-size: 13px; font-weight: 800; color: #fff;">AI Interviewer</span>
                                                    <span style="font-size: 11px; color: #666; margin-left: 8px;">14:12:32</span>
                                                </div>
                                                <div style="display: flex; align-items: center; gap: 8px;">
                                                    <span style="display: flex; align-items: center; gap: 2px;">
                                                        <span style="width: 2.5px; height: 8px; background: #FF4D4F; border-radius: 99px;"></span>
                                                        <span style="width: 2.5px; height: 14px; background: #FF4D4F; border-radius: 99px;"></span>
                                                        <span style="width: 2.5px; height: 10px; background: #FF4D4F; border-radius: 99px;"></span>
                                                    </span>
                                                    <i class="fas fa-play" style="font-size: 11px; color: #fff; cursor: pointer;"></i>
                                                </div>
                                            </div>
                                            <div style="font-size: 13.5px; color: #eee; line-height: 1.5;">Explain Deadlock in Operating Systems.</div>
                                        </div>
                                    </div>

                                    <!-- User Message -->
                                    <div style="display: flex; gap: 14px; align-items: flex-start; background: #13161c; padding: 14px 18px; border-radius: 14px; border: 1px solid rgba(16,185,129,0.12);">
                                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 1.5px solid #10B981;" alt="You" />
                                        <div style="flex: 1; min-width: 0;">
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                                <div>
                                                    <span style="font-size: 13px; font-weight: 800; color: #fff;">You</span>
                                                    <span style="font-size: 11px; color: #666; margin-left: 8px;">14:13:02</span>
                                                </div>
                                                <div style="display: flex; align-items: center; gap: 8px;">
                                                    <span style="display: flex; align-items: center; gap: 2px;">
                                                        <span style="width: 2.5px; height: 10px; background: #10B981; border-radius: 99px;"></span>
                                                        <span style="width: 2.5px; height: 16px; background: #10B981; border-radius: 99px;"></span>
                                                        <span style="width: 2.5px; height: 8px; background: #10B981; border-radius: 99px;"></span>
                                                    </span>
                                                    <i class="fas fa-play" style="font-size: 11px; color: #fff; cursor: pointer;"></i>
                                                </div>
                                            </div>
                                            <div style="font-size: 13.5px; color: #eee; line-height: 1.5;">Deadlock is a situation in which two or more processes are blocked forever, waiting for each other to release resources. It occurs when four necessary conditions hold simultaneously...</div>
                                        </div>
                                    </div>

                                    <!-- AI Message 2 -->
                                    <div style="display: flex; gap: 14px; align-items: flex-start; background: #13131c; padding: 14px 18px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.04);">
                                        <div style="width: 34px; height: 34px; border-radius: 50%; background: radial-gradient(circle, #FF4D4F, #800); border: 1px solid rgba(255,77,79,0.5); flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                                            <span style="width: 12px; height: 2px; background: #fff; border-radius: 99px;"></span>
                                        </div>
                                        <div style="flex: 1; min-width: 0;">
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                                <div>
                                                    <span style="font-size: 13px; font-weight: 800; color: #fff;">AI Interviewer</span>
                                                    <span style="font-size: 11px; color: #666; margin-left: 8px;">14:13:45</span>
                                                </div>
                                                <div style="display: flex; align-items: center; gap: 8px;">
                                                    <span style="display: flex; align-items: center; gap: 2px;">
                                                        <span style="width: 2.5px; height: 10px; background: #FF4D4F; border-radius: 99px;"></span>
                                                        <span style="width: 2.5px; height: 16px; background: #FF4D4F; border-radius: 99px;"></span>
                                                    </span>
                                                    <i class="fas fa-play" style="font-size: 11px; color: #fff; cursor: pointer;"></i>
                                                </div>
                                            </div>
                                            <div style="font-size: 13.5px; color: #eee; line-height: 1.5;">Good explanation! 👍<br/>Now explain the four necessary conditions (Coffman Conditions) for Deadlock.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Card 3: Listening Bar (52px tall, waveform centered, mic left, speak now right) -->
                            <div style="background: #0d0d12; border: 1.5px solid #FF4D4F; border-radius: 18px; padding: 0 24px; height: 54px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 0 25px rgba(255,77,79,0.25); flex-shrink: 0;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="width: 32px; height: 32px; border-radius: 50%; background: #FF4D4F; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px #FF4D4F;">
                                        <i class="fas fa-microphone" style="color: #fff; font-size: 13px;"></i>
                                    </div>
                                    <span style="font-size: 14px; font-weight: 800; color: #fff;">Listening...</span>
                                </div>

                                <div style="display: flex; align-items: center; gap: 3.5px; height: 22px;">
                                    <span style="width: 3px; height: 8px; background: #FF4D4F; border-radius: 99px;"></span>
                                    <span style="width: 3px; height: 16px; background: #FF4D4F; border-radius: 99px;"></span>
                                    <span style="width: 3px; height: 10px; background: #FF4D4F; border-radius: 99px;"></span>
                                    <span style="width: 3px; height: 20px; background: #FF4D4F; border-radius: 99px;"></span>
                                    <span style="width: 3px; height: 14px; background: #FF4D4F; border-radius: 99px;"></span>
                                    <span style="width: 3px; height: 18px; background: #FF4D4F; border-radius: 99px;"></span>
                                </div>

                                <span style="font-size: 13px; font-weight: 700; color: #8B8B8B;">Speak now</span>
                            </div>

                        </div>

                        <!-- COLUMN 3: RIGHT EVALUATION COLUMN (25%) -->
                        <div style="display: flex; flex-direction: column; justify-content: space-between; gap: 24px; height: 100%; min-height: 0; overflow: hidden;">
                            
                            <!-- Card 1: Live Evaluation (Spacious, 24px padding, 6px progress bars, 18-24px metric spacing) -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 24px; flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden;">
                                <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;">
                                    <span style="font-size: 14px; font-weight: 900; color: #fff; display: flex; align-items: center; gap: 8px;">
                                        <i class="fas fa-chart-line" style="color: #FF4D4F;"></i> Live Evaluation
                                    </span>
                                    <span style="font-size: 12px; color: #8B8B8B; display: flex; align-items: center; gap: 6px;">
                                        <i class="fas fa-sync-alt fa-spin" style="font-size: 11px;"></i> Updating...
                                    </span>
                                </div>

                                <div style="display: flex; flex-direction: column; justify-content: space-between; flex: 1; overflow-y: auto; padding-top: 12px; padding-right: 4px; gap: 14px;">
                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 6px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 8px; font-weight: 600;"><i class="fas fa-lightbulb" style="color: #FF4D4F;"></i> Technical Accuracy</span>
                                            <span style="font-weight: 800; color: #10B981;">92% ↑</span>
                                        </div>
                                        <div style="width: 100%; height: 6px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 92%; height: 100%; background: #FF4D4F; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 6px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 8px; font-weight: 600;"><i class="fas fa-heart" style="color: #FF8C00;"></i> Communication</span>
                                            <span style="font-weight: 800; color: #10B981;">88% ↑</span>
                                        </div>
                                        <div style="width: 100%; height: 6px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 88%; height: 100%; background: #FF8C00; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 6px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 8px; font-weight: 600;"><i class="fas fa-shield-alt" style="color: #A855F7;"></i> Confidence</span>
                                            <span style="font-weight: 800; color: #FF4D4F;">85% ↓</span>
                                        </div>
                                        <div style="width: 100%; height: 6px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 85%; height: 100%; background: #A855F7; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 6px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 8px; font-weight: 600;"><i class="fas fa-layer-group" style="color: #3B82F6;"></i> Depth of Knowledge</span>
                                            <span style="font-weight: 800; color: #10B981;">90% ↑</span>
                                        </div>
                                        <div style="width: 100%; height: 6px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 90%; height: 100%; background: #3B82F6; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 6px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 8px; font-weight: 600;"><i class="fas fa-puzzle-piece" style="color: #06B6D4;"></i> Problem Solving</span>
                                            <span style="font-weight: 800; color: #10B981;">91% ↑</span>
                                        </div>
                                        <div style="width: 100%; height: 6px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 91%; height: 100%; background: #06B6D4; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 6px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 8px; font-weight: 600;"><i class="fas fa-book" style="color: #EAB308;"></i> Vocabulary</span>
                                            <span style="font-weight: 800; color: #FF4D4F;">87% ↓</span>
                                        </div>
                                        <div style="width: 100%; height: 6px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 87%; height: 100%; background: #EAB308; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 6px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 8px; font-weight: 600;"><i class="fas fa-eye" style="color: #10B981;"></i> Eye Contact</span>
                                            <span style="font-weight: 800; color: #10B981;">82% ↑</span>
                                        </div>
                                        <div style="width: 100%; height: 6px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 82%; height: 100%; background: #10B981; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 6px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 8px; font-weight: 600;"><i class="fas fa-volume-up" style="color: #3B82F6;"></i> Voice Clarity</span>
                                            <span style="font-weight: 800; color: #10B981;">89% ↑</span>
                                        </div>
                                        <div style="width: 100%; height: 6px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 89%; height: 100%; background: #3B82F6; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 6px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 8px; font-weight: 600;"><i class="fas fa-tachometer-alt" style="color: #8B5CF6;"></i> Speaking Pace</span>
                                            <span style="font-weight: 800; color: #10B981;">Good</span>
                                        </div>
                                        <div style="width: 100%; height: 6px; background: #161620; border-radius: 99px; overflow: hidden;"><div style="width: 75%; height: 100%; background: #8B5CF6; border-radius: 99px;"></div></div>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12.5px;">
                                            <span style="color: #eee; display: flex; align-items: center; gap: 8px; font-weight: 600;"><i class="fas fa-stopwatch" style="color: #8B8B8B;"></i> Filler Words</span>
                                            <span style="font-weight: 800; color: #10B981;">2 detected</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Card 2: Overall Interview Score (More whitespace, 24px padding, larger 80px gauge) -->
                            <div style="background: #0d0d12; border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 24px; flex-shrink: 0;">
                                <div style="font-size: 13px; font-weight: 800; color: #fff; text-align: left; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-chart-line" style="color: #FF8C00;"></i> Overall Interview Score
                                </div>
                                
                                <div style="display: flex; align-items: center; justify-content: space-around; gap: 16px; margin-top: 6px;">
                                    <!-- Circular Gauge (Larger 80px diameter) -->
                                    <div style="position: relative; width: 76px; height: 76px; border-radius: 50%; border: 7px solid #161620; border-right-color: #FF4D4F; border-top-color: #FF8C00; transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
                                        <span style="font-size: 20px; font-weight: 900; color: #fff; font-family: 'JetBrains Mono', monospace; transform: rotate(-45deg);">91%</span>
                                    </div>

                                    <!-- Right side text -->
                                    <div style="text-align: left;">
                                        <div style="font-size: 18px; font-weight: 900; color: #10B981; line-height: 1.1;">Excellent</div>
                                        <div style="font-size: 14px; font-weight: 800; color: #fff; margin-top: 2px;">Performance</div>
                                        <div style="font-size: 12px; color: #EAB308; margin-top: 4px;">⭐⭐⭐⭐⭐</div>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                    <!-- 3. BOTTOM TIMELINE (Spans Full Width 100vw, Height 90px, Exact placement under workspace) -->
                    <div style="height: 90px; border-top: 1px solid rgba(255,255,255,0.08); padding: 0 32px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; background: #08080c; overflow: hidden;">
                        <div style="margin-right: 32px; flex-shrink: 0;">
                            <div style="font-size: 13px; font-weight: 800; color: #8B8B8B;">Interview Timeline</div>
                            <div style="font-size: 12px; color: #666; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">00:00</div>
                        </div>

                        <!-- Timeline Nodes -->
                        <div style="flex: 1; display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 0; overflow: hidden;">
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0;">
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: #10B981; border: 2px solid #08080c; box-shadow: 0 0 8px #10B981;"></div>
                                <span style="font-size: 11px; color: #8B8B8B; font-weight: 700;">Interview Started</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: #10B981; min-width: 8px;"></div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0;">
                                <div style="font-size: 10px; color: #666; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">02:18</div>
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: #10B981; border: 2px solid #08080c; box-shadow: 0 0 8px #10B981;"></div>
                                <span style="font-size: 11px; color: #8B8B8B; font-weight: 700;">Ice Breaker</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: #10B981; min-width: 8px;"></div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0;">
                                <div style="font-size: 10px; color: #666; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">04:40</div>
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: #10B981; border: 2px solid #08080c; box-shadow: 0 0 8px #10B981;"></div>
                                <span style="font-size: 11px; color: #8B8B8B; font-weight: 700;">Q1: Process vs Thread</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: #10B981; min-width: 8px;"></div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0;">
                                <div style="font-size: 10px; color: #666; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">08:12</div>
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: #10B981; border: 2px solid #08080c; box-shadow: 0 0 8px #10B981;"></div>
                                <span style="font-size: 11px; color: #8B8B8B; font-weight: 700;">Q2: Context Switch</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: linear-gradient(to right, #10B981, #FF4D4F); min-width: 8px;"></div>

                            <!-- ACTIVE NODE -->
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0;">
                                <div style="font-size: 11px; color: #fff; font-weight: 800; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">13:42</div>
                                <div style="width: 14px; height: 14px; border-radius: 50%; background: #FF4D4F; border: 2.5px solid #fff; box-shadow: 0 0 16px #FF4D4F;"></div>
                                <span style="font-size: 11px; color: #FF4D4F; font-weight: 800;">Q3: Deadlock</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: #1f1f2e; min-width: 8px;"></div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; opacity: 0.5; flex-shrink: 0;">
                                <div style="font-size: 10px; color: #666; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">18:30</div>
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: #1f1f2e;"></div>
                                <span style="font-size: 11px; color: #8B8B8B; font-weight: 700;">Q4: Scheduling</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: #1f1f2e; min-width: 8px;"></div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; opacity: 0.5; flex-shrink: 0;">
                                <div style="font-size: 10px; color: #666; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">23:10</div>
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: #1f1f2e;"></div>
                                <span style="font-size: 11px; color: #8B8B8B; font-weight: 700;">Q5: Virtual Memory</span>
                            </div>
                            <div style="flex: 1; height: 2px; background: #1f1f2e; min-width: 8px;"></div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; opacity: 0.5; flex-shrink: 0;">
                                <div style="font-size: 10px; color: #666; font-family: 'JetBrains Mono', monospace; margin-bottom: -2px;">38:00</div>
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: #1f1f2e;"></div>
                                <span style="font-size: 11px; color: #8B8B8B; font-weight: 700;">Final Wrap Up</span>
                            </div>
                        </div>

                        <button style="background: #0f172a; border: 1px solid #1e3a8a; color: #60a5fa; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 800; margin-left: 24px; flex-shrink: 0; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                            <i class="far fa-file-alt"></i> View Full Report <i class="fas fa-arrow-right" style="font-size: 11px;"></i>
                        </button>
                    </div>

                </div>
"""

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

start_marker = '<div id="wr-live-engine"'
if start_marker in html:
    start_idx = html.find(start_marker)
    next_marker = '<!-- =========================================='
    end_idx = html.find(next_marker, start_idx + len(start_marker))
    if end_idx != -1:
        new_html = html[:start_idx] + image1_html + html[end_idx:]
        with open("index.html", "w", encoding="utf-8") as f:
            f.write(new_html)
        print("Successfully updated index.html with 30% : 45% : 25% enterprise grid, 24px global spacing system, and 90px timeline.")
    else:
        print("Could not find next_marker after wr-live-engine.")
else:
    print("Could not find start_marker wr-live-engine.")
