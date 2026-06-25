import os

file_path = "index.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the entire Sidebar
sidebar_start = '<aside class="sidebar"'
sidebar_end = '</aside>'

if sidebar_start in content and sidebar_end in content:
    start_idx = content.find(sidebar_start)
    end_idx = content.find(sidebar_end) + len(sidebar_end)
    
    new_sidebar = """        <aside class="sidebar" id="global-sidebar" style="background-color: #050505; border-right: 1px solid rgba(255,255,255,0.05);"> 
            <div class="sidebar-header" id="sidebar-logo" style="cursor: pointer; padding: 24px 20px;">
                <span class="logo-icon" style="background-color: #ff4d4f; color: white; border-radius: 4px; padding: 4px 8px; font-weight: 800; font-size: 14px;">SF</span>
                <span class="logo-text" style="color: white; font-weight: 700; font-size: 18px; margin-left: 8px;">SkillForge</span>
            </div>
            <nav class="sidebar-nav" style="padding: 0 16px; flex: 1; overflow-y: auto;">
                <button class="nav-item" data-target="dashboard-page">
                    <i class="fas fa-home"></i> Home
                </button>
                <button class="nav-item" data-target="projects-page">
                    <i class="fas fa-project-diagram"></i> Projects
                </button>
                <button class="nav-item active" data-target="arena-home-page" style="display: flex; justify-content: space-between; align-items: center; background-color: rgba(255,77,79,0.1); color: white; border-left: 3px solid #ff4d4f; border-radius: 4px;">
                    <div><i class="fas fa-code"></i> Arena</div>
                    <span class="live-badge" style="color: #ff4d4f; border: 1px solid #ff4d4f; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: bold; letter-spacing: 0.5px;">LIVE</span>
                </button>
                <button class="nav-item" data-target="practice-page">
                    <i class="fas fa-keyboard"></i> Practice
                </button>
                <button class="nav-item" data-target="mock-interview-page">
                    <i class="fas fa-user-friends"></i> Mock Interview
                </button>
                <button class="nav-item" data-target="video-library-page">
                    <i class="fas fa-video"></i> Video Library
                </button>
                <button class="nav-item" data-target="skill-gap-page">
                    <i class="fas fa-chart-pie"></i> Skill Gap
                </button>
                <button class="nav-item" onclick="window.location.href='dna-dashboard.html'">
                    <i class="fas fa-dna"></i> Coder's DNA
                </button>
                <button class="nav-item" data-target="ai-insights-page">
                    <i class="fas fa-brain"></i> AI Insights
                </button>
                <button class="nav-item" data-target="profile-page">
                    <i class="fas fa-user"></i> Profile
                </button>
                <button class="nav-item" data-target="settings-page">
                    <i class="fas fa-cog"></i> Settings
                </button>
            </nav>
            
            <div class="sidebar-bottom-actions" style="padding: 24px 16px;">
                <button class="upgrade-pro-btn" style="width: 100%; background: transparent; border: 1px solid rgba(255,255,255,0.1); color: white; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                    <span style="font-size: 13px; font-weight: 600;">Upgrade to Pro</span>
                    <i class="fas fa-gem" style="color: #ff4d4f;"></i>
                </button>
            </div>

            <div class="sidebar-user-profile" style="padding: 16px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 12px; cursor: pointer;">
                <img src="https://i.pravatar.cc/150?img=11" alt="User" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                <div class="user-profile-info" style="display: flex; flex-direction: column;">
                    <span style="color: white; font-size: 14px; font-weight: 600;">Arjun Dev</span>
                    <span style="color: #9ca3af; font-size: 11px;">Pro Coder</span>
                    <div style="display: flex; align-items: center; gap: 4px; margin-top: 2px;">
                        <span style="color: #22c55e; font-size: 12px; font-weight: 600;">1872</span>
                        <i class="fas fa-arrow-trend-up" style="color: #22c55e; font-size: 10px;"></i>
                    </div>
                </div>
            </div>
        </aside>"""
    
    content = content[:start_idx] + new_sidebar + content[end_idx:]


# 2. Add Arena Home Section right before the battle interface (coding-arena)
arena_battle_start = "            <!-- CODING ARENA - Premium Workspace -->"
if arena_battle_start not in content:
    arena_battle_start = "            <!-- CODING ARENA - Full Screen Workspace -->"

if arena_battle_start in content:
    start_idx = content.find(arena_battle_start)
    
    new_home_html = """
            <!-- ARENA HOME / LANDING EXPERIENCE -->
            <section id="arena-home-page" class="arena-home-page active">
                
                <div class="arena-home-layout">
                    <!-- MAIN LEFT/CENTER AREA -->
                    <div class="arena-home-main">
                        
                        <!-- Header -->
                        <div class="arena-home-header">
                            <div>
                                <h1 class="arena-home-title">CODING <span class="text-accent">ARENA</span></h1>
                                <p class="arena-home-subtitle">Compete. Code. Conquer.</p>
                            </div>
                            <div class="arena-top-stats">
                                <div class="top-stat-pill">
                                    <span class="status-dot green"></span> <strong>128</strong> <span class="stat-lbl">Online Now</span>
                                </div>
                                <div class="top-stat-pill">
                                    <span class="status-dot red"></span> <strong>24</strong> <span class="stat-lbl">Live Battles</span>
                                </div>
                                <button class="arena-guide-btn">
                                    <i class="fas fa-book-open"></i> Arena Guide
                                </button>
                            </div>
                        </div>

                        <!-- Hero Section -->
                        <div class="arena-hero-card">
                            <div class="hero-content">
                                <h2 class="hero-title">Step into the Arena.<br><span class="text-accent">Prove your code.</span></h2>
                                <p class="hero-desc">Battle real developers in real-time.<br>Every match makes you stronger.</p>
                                
                                <div class="hero-features">
                                    <div class="hero-feature">
                                        <div class="hf-icon"><i class="fas fa-bolt"></i></div>
                                        <span>Real-time Battles</span>
                                    </div>
                                    <div class="hero-feature">
                                        <div class="hf-icon"><i class="fas fa-trophy"></i></div>
                                        <span>Climb Leaderboards</span>
                                    </div>
                                    <div class="hero-feature">
                                        <div class="hf-icon"><i class="fas fa-brain"></i></div>
                                        <span>AI-Powered Analysis</span>
                                    </div>
                                </div>
                            </div>
                            <div class="hero-vs-art">
                                <div class="hero-overlay"></div>
                                <!-- Visual VS effect using CSS -->
                                <div class="vs-centerpiece">VS</div>
                            </div>
                        </div>

                        <!-- Arena Overview -->
                        <div class="section-label">ARENA OVERVIEW</div>
                        <div class="arena-overview-grid">
                            <div class="overview-card">
                                <div class="oc-header"><i class="fas fa-star text-muted"></i> Your Rating</div>
                                <div class="oc-value text-accent">1872</div>
                                <div class="oc-sub"><i class="fas fa-gem" style="color: #3b82f6;"></i> Diamond II</div>
                            </div>
                            <div class="overview-card">
                                <div class="oc-header"><i class="fas fa-crosshairs text-muted"></i> Win Rate</div>
                                <div class="win-rate-circle">
                                    <svg viewBox="0 0 36 36" class="circular-chart">
                                        <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path class="circle" stroke-dasharray="78, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <text x="18" y="20.35" class="percentage">78%</text>
                                    </svg>
                                </div>
                                <div class="oc-sub">32 Wins • 9 Losses</div>
                            </div>
                            <div class="overview-card">
                                <div class="oc-header"><i class="fas fa-fire text-muted" style="color: #ff4d4f;"></i> Win Streak</div>
                                <div class="oc-value text-accent">6</div>
                                <div class="oc-sub">Best: 12</div>
                            </div>
                            <div class="overview-card">
                                <div class="oc-header"><i class="fas fa-medal text-muted" style="color: #f59e0b;"></i> Global Rank</div>
                                <div class="oc-value">#293</div>
                                <div class="oc-sub">Top 2.1%</div>
                            </div>
                        </div>

                        <!-- Ready to Battle -->
                        <div class="ready-battle-card">
                            <div class="rb-icon-wrap">
                                <i class="fas fa-trophy rb-icon"></i>
                            </div>
                            <div class="rb-content">
                                <h2>Ready to battle?</h2>
                                <p>Find an opponent matched to your skill level<br>and start your journey to the top.</p>
                                <div class="rb-chips">
                                    <span class="rb-chip">Matchmaking</span>
                                    <span class="rb-chip">Skill Matching</span>
                                    <span class="rb-chip">Fair Play</span>
                                    <span class="rb-chip">No Wait Time</span>
                                </div>
                            </div>
                            <div class="rb-action">
                                <button class="start-battle-btn" onclick="document.getElementById('arena-home-page').classList.remove('active'); document.getElementById('coding-arena').classList.add('active');">
                                    START BATTLE <i class="fas fa-chevron-right"></i>
                                </button>
                                <div class="rb-subaction">Find an opponent now</div>
                            </div>
                        </div>

                        <!-- Upcoming Tournaments -->
                        <div class="section-label mt-32">UPCOMING TOURNAMENTS</div>
                        <div class="tournaments-grid">
                            <div class="tournament-card">
                                <div class="tc-icon bg-red"><i class="fas fa-clipboard-list"></i></div>
                                <div class="tc-info">
                                    <div class="tc-title">Daily Challenge <span class="live-dot-badge"><span class="dot"></span> Live</span></div>
                                    <div class="tc-desc">Ends in 10:30:45</div>
                                </div>
                                <div class="tc-action"><i class="far fa-calendar-alt"></i></div>
                            </div>
                            <div class="tournament-card">
                                <div class="tc-icon bg-orange"><i class="fas fa-calendar-day"></i></div>
                                <div class="tc-info">
                                    <div class="tc-title">Weekend Showdown</div>
                                    <div class="tc-desc">In 2 Days</div>
                                    <div class="tc-prize">Prize Pool: <span class="text-yellow">25,000 <i class="fas fa-coins"></i></span></div>
                                </div>
                            </div>
                            <div class="tournament-card">
                                <div class="tc-icon bg-red"><i class="fas fa-crown"></i></div>
                                <div class="tc-info">
                                    <div class="tc-title">SkillForge Master Cup</div>
                                    <div class="tc-desc">In 5 Days</div>
                                    <div class="tc-prize">Prize Pool: <span class="text-yellow">1,00,000 <i class="fas fa-coins"></i></span></div>
                                </div>
                            </div>
                            <div class="tournament-card">
                                <div class="tc-icon bg-purple"><i class="fas fa-shield-alt"></i></div>
                                <div class="tc-info">
                                    <div class="tc-title">Code Warriors League</div>
                                    <div class="tc-desc">In 12 Days</div>
                                    <div class="tc-prize">Prize Pool: <span class="text-yellow">5,00,000 <i class="fas fa-coins"></i></span></div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- RIGHT SIDEBAR (Daily Mission, Leaderboard) -->
                    <div class="arena-home-right">
                        
                        <div class="right-panel-card">
                            <div class="rpc-header"><i class="fas fa-bullseye text-muted"></i> DAILY MISSION</div>
                            <div class="mission-title">Win 3 arena battles today</div>
                            <div class="mission-progress-wrap">
                                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: 66%;"></div></div>
                                <span class="mission-text">2 / 3</span>
                            </div>
                            <div class="mission-reward">
                                <span class="text-muted">Reward: <span class="text-green">50 XP</span></span>
                                <span class="xp-badge">XP</span>
                            </div>
                        </div>

                        <div class="right-panel-card">
                            <div class="rpc-header"><i class="fas fa-brain text-muted"></i> AI RECOMMENDATION</div>
                            <div class="ai-rec-content">
                                <p class="text-muted text-sm">You perform best on<br><strong class="text-accent">Array & Hashing</strong></p>
                                <p class="text-muted text-sm mt-8">Focus on <strong>Graphs</strong> to improve your ranking.</p>
                                <div class="ai-rec-graph">
                                    <!-- simple css graph lines -->
                                    <div class="bar h1"></div><div class="bar h2"></div><div class="bar h3"></div><div class="bar h4"></div><div class="bar h5"></div>
                                    <svg class="trend-line" viewBox="0 0 100 40">
                                        <path d="M0,30 L25,25 L50,15 L75,20 L100,5" fill="none" stroke="#ff4d4f" stroke-width="2"/>
                                        <polygon points="95,0 100,5 95,10" fill="#ff4d4f"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div class="right-panel-card">
                            <div class="rpc-header">
                                <span>LIVE LEADERBOARD</span>
                                <a href="#" class="view-all-link">View All</a>
                            </div>
                            <div class="lb-mini-list">
                                <div class="lb-mini-row">
                                    <div class="lbm-rank gold">1</div>
                                    <div class="lbm-player"><img src="https://i.pravatar.cc/150?img=5"> Kavya Singh</div>
                                    <div class="lbm-score">1890</div>
                                </div>
                                <div class="lb-mini-row active-me">
                                    <div class="lbm-rank silver">2</div>
                                    <div class="lbm-player"><img src="https://i.pravatar.cc/150?img=11"> Arjun Dev</div>
                                    <div class="lbm-score">1872</div>
                                </div>
                                <div class="lb-mini-row">
                                    <div class="lbm-rank bronze">3</div>
                                    <div class="lbm-player"><img src="https://i.pravatar.cc/150?img=12"> Rohan Verma</div>
                                    <div class="lbm-score">1839</div>
                                </div>
                                <div class="lb-mini-row">
                                    <div class="lbm-rank">4</div>
                                    <div class="lbm-player"><img src="https://i.pravatar.cc/150?img=8"> Aditya Raj</div>
                                    <div class="lbm-score">1765</div>
                                </div>
                                <div class="lb-mini-row">
                                    <div class="lbm-rank">5</div>
                                    <div class="lbm-player"><img src="https://i.pravatar.cc/150?img=9"> Neha Patel</div>
                                    <div class="lbm-score">1698</div>
                                </div>
                            </div>
                        </div>

                        <div class="right-panel-card">
                            <div class="rpc-header">RECENT WINNER</div>
                            <div class="recent-winner-flex">
                                <div class="winner-trophy"><i class="fas fa-trophy gold-text"></i></div>
                                <div class="winner-info">
                                    <div class="w-name">Kavya Singh</div>
                                    <div class="w-desc">Won 5 battles in a row</div>
                                    <div class="w-time">2 mins ago</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
"""
    # Important: Ensure the previous coding arena section is no longer 'active'
    content = content.replace('<section id="coding-arena" class="coding-arena active">', '<section id="coding-arena" class="coding-arena" style="display:none;">')
    
    content = content[:start_idx] + new_home_html + content[start_idx:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("index.html updated successfully.")
