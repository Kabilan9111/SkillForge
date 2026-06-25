import os

file_path = "index.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Navigation
nav_target = """                <button class="nav-item" data-target="projects-page">
                    <i class="fas fa-project-diagram"></i> Projects
                </button>"""

nav_replacement = """                <button class="nav-item" data-target="projects-page">
                    <i class="fas fa-project-diagram"></i> Projects
                </button>
                <button class="nav-item active-arena" data-target="coding-arena">
                    <div><i class="fas fa-code"></i> Arena</div>
                    <span class="live-badge">LIVE</span>
                </button>"""

if nav_target in content and "active-arena" not in content:
    content = content.replace(nav_target, nav_replacement)

# 2. Update Coding Arena HTML
arena_start = "            <!-- CODING ARENA - Full Screen Workspace -->"
arena_end = "            <!-- 9. MOCK INTERVIEW -->"

if arena_start in content and arena_end in content:
    start_idx = content.find(arena_start)
    end_idx = content.find(arena_end)
    
    new_arena_html = """            <!-- CODING ARENA - Premium Workspace -->
            <section id="coding-arena" class="coding-arena active">
                
                <!-- TOP MATCH HEADER -->
                <header class="arena-match-header">
                    <div class="player-card">
                        <img src="https://i.pravatar.cc/150?img=11" alt="Arjun Dev" class="avatar">
                        <div class="player-info">
                            <div class="player-name">Arjun Dev</div>
                            <div class="player-title">Pro Coder</div>
                            <div class="player-rating">1872 <i class="fas fa-arrow-trend-up"></i></div>
                            <div class="player-winrate">Win Rate: 78%</div>
                        </div>
                        <div class="status-dot green"></div>
                    </div>
                    
                    <div class="match-center">
                        <div class="arena-title">CODING ARENA</div>
                        <div class="arena-subtitle">Real-time Coding Battle</div>
                        <div class="vs-anim">
                            <div class="pulse-line left"></div>
                            <div class="vs-badge">VS</div>
                            <div class="pulse-line right"></div>
                        </div>
                        <div class="time-label">TIME LEFT</div>
                        <div class="time-value">22:47</div>
                    </div>
                    
                    <div class="player-card opponent">
                        <div class="status-dot green"></div>
                        <div class="player-info right-align">
                            <div class="player-name">Rohan Verma</div>
                            <div class="player-title">Code Warrior</div>
                            <div class="player-rating">1839 <i class="fas fa-arrow-trend-up"></i></div>
                            <div class="player-winrate">Win Rate: 71%</div>
                        </div>
                        <img src="https://i.pravatar.cc/150?img=12" alt="Rohan Verma" class="avatar">
                    </div>
                </header>

                <!-- CENTER WORKSPACE GRID -->
                <div class="arena-main-grid">
                    
                    <!-- LEFT COLUMN: Problem Statement -->
                    <div class="arena-col-left premium-glass-card">
                        <div class="premium-tabs">
                            <button class="p-tab active">Problem</button>
                            <button class="p-tab">Submissions</button>
                            <button class="p-tab">Solutions</button>
                            <button class="p-tab">Discuss</button>
                        </div>
                        <div class="problem-scroll-area">
                            <h2 class="problem-title">Two Sum</h2>
                            <div class="problem-tags">
                                <span class="tag easy">Easy</span>
                                <span class="tag">Arrays</span>
                                <span class="tag">Frequently Asked</span>
                            </div>
                            
                            <div class="problem-desc">
                                <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to target.</p>
                                <p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
                                
                                <h4>Example 1:</h4>
                                <div class="code-block">
                                    Input: nums = [2,7,11,15], target = 9<br>
                                    Output: [0,1]<br>
                                    Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
                                </div>
                                
                                <h4>Example 2:</h4>
                                <div class="code-block">
                                    Input: nums = [3,2,4], target = 6<br>
                                    Output: [1,2]
                                </div>
                                
                                <h4>Constraints:</h4>
                                <ul>
                                    <li><code>2 <= nums.length <= 10⁴</code></li>
                                    <li><code>-10⁹ <= nums[i] <= 10⁹</code></li>
                                    <li><code>-10⁹ <= target <= 10⁹</code></li>
                                    <li>Only one valid answer exists.</li>
                                </ul>
                            </div>
                            
                            <div class="problem-feedback">
                                <button class="feedback-btn"><i class="fas fa-thumbs-up"></i> 92%</button>
                                <button class="feedback-btn"><i class="fas fa-thumbs-down"></i> 8%</button>
                            </div>
                            
                            <button class="premium-btn btn-outline exit-battle-btn">
                                <i class="fas fa-sign-out-alt"></i> Exit Battle
                            </button>
                            
                            <div class="online-stats">
                                <div class="stat-row"><span class="dot green"></span> Online Users <span class="val">128</span></div>
                                <div class="stat-row"><span class="dot red"></span> In Battle <span class="val">64</span></div>
                            </div>
                        </div>
                    </div>

                    <!-- CENTER COLUMN: Editor & Console -->
                    <div class="arena-col-center">
                        <div class="premium-glass-card editor-card">
                            <div class="editor-header">
                                <div class="lang-selector">
                                    <i class="fab fa-python"></i> Python3 <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="editor-actions">
                                    <button class="icon-btn"><i class="fas fa-expand"></i></button>
                                    <button class="icon-btn"><i class="fas fa-cog"></i></button>
                                </div>
                            </div>
                            <div class="editor-body">
                                <div class="line-numbers">
                                    1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10
                                </div>
                                <div class="code-content">
                                    <span class="kw">class</span> <span class="cls">Solution</span>:<br>
                                    &nbsp;&nbsp;&nbsp;&nbsp;<span class="kw">def</span> <span class="fn">twoSum</span>(<span class="var">self</span>, <span class="var">nums</span>:<span class="type">List</span>[<span class="type">int</span>], <span class="var">target</span>: <span class="type">int</span>) -> <span class="type">List</span>[<span class="type">int</span>]:<br>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;seen = {}<br>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="kw">for</span> i, num <span class="kw">in</span> <span class="fn">enumerate</span>(nums):<br>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;complement = target - num<br>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="kw">if</span> complement <span class="kw">in</span> seen:<br>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="kw">return</span> [seen[complement], i]<br>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;seen[num] = i<span class="cursor-glow"></span>
                                </div>
                            </div>
                            <div class="editor-footer">
                                <button class="premium-btn btn-ghost"><i class="fas fa-play"></i> Run Code</button>
                                <button class="premium-btn btn-primary"><i class="fas fa-arrow-up"></i> Submit Code</button>
                            </div>
                        </div>
                        
                        <div class="premium-glass-card console-card">
                            <div class="premium-tabs">
                                <button class="p-tab active">Testcase</button>
                                <button class="p-tab">Custom Testcase</button>
                            </div>
                            <div class="console-body">
                                <div class="testcase-sidebar">
                                    <div class="tc-item active">Testcase 1 <i class="fas fa-check-circle text-success"></i></div>
                                    <div class="tc-item">Testcase 2 <i class="fas fa-check-circle text-success"></i></div>
                                    <div class="tc-item">Testcase 3 <i class="fas fa-check-circle text-success"></i></div>
                                </div>
                                <div class="testcase-details">
                                    <div class="tc-row"><span class="tc-lbl">Input</span> <span class="tc-val">nums = [2,7,11,15], target = 9</span></div>
                                    <div class="tc-row"><span class="tc-lbl">Output</span> <span class="tc-val">[0,1]</span></div>
                                    <div class="tc-row"><span class="tc-lbl">Expected</span> <span class="tc-val">[0,1]</span></div>
                                    <div class="tc-row mt-2"><span class="tc-lbl">Status</span> <span class="tc-status text-success">Accepted</span></div>
                                    <div class="tc-row mt-1"><span class="tc-lbl">Runtime</span> <span class="tc-val">32 ms</span> <span class="tc-lbl ml-4">Memory</span> <span class="tc-val">16.4 MB</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT COLUMN: Battle Intelligence -->
                    <div class="arena-col-right">
                        <div class="premium-glass-card opp-status-card">
                            <h3 class="panel-heading">OPPONENT STATUS</h3>
                            <div class="opp-active-status">
                                <span>Rohan is coding...</span>
                                <span class="dot green pulsing"></span>
                            </div>
                            <div class="progress-bar-wrap">
                                <div class="progress-bar opp-bar" style="width: 60%;"></div>
                            </div>
                            <div class="progress-text">
                                <span>Passed: 6 / 10</span>
                                <span>60%</span>
                            </div>
                        </div>
                        
                        <div class="premium-glass-card chat-card flex-grow">
                            <h3 class="panel-heading">BATTLE CHAT</h3>
                            <div class="chat-messages">
                                <div class="chat-msg">
                                    <img src="https://i.pravatar.cc/150?img=11" class="chat-avatar">
                                    <div class="msg-content">
                                        <div class="msg-author">Arjun Dev <span class="msg-time">10:21 AM</span></div>
                                        <div class="msg-text">All the best! 💪</div>
                                    </div>
                                </div>
                                <div class="chat-msg">
                                    <img src="https://i.pravatar.cc/150?img=12" class="chat-avatar">
                                    <div class="msg-content">
                                        <div class="msg-author">Rohan Verma <span class="msg-time">10:21 AM</span></div>
                                        <div class="msg-text">Let's code! 🔥</div>
                                    </div>
                                </div>
                                <div class="chat-msg system">
                                    <div class="chat-avatar sys-icon">SF</div>
                                    <div class="msg-content">
                                        <div class="msg-author">System <span class="msg-time">10:21 AM</span></div>
                                        <div class="msg-text">Battle has started. Code your best!</div>
                                    </div>
                                </div>
                            </div>
                            <div class="chat-input-area">
                                <input type="text" placeholder="Type a message..." class="premium-input">
                                <button class="send-btn"><i class="fas fa-paper-plane"></i></button>
                            </div>
                        </div>
                        
                        <div class="premium-glass-card leaderboard-card">
                            <div class="lb-header">
                                <h3 class="panel-heading">LIVE LEADERBOARD</h3>
                                <span class="lb-count"><i class="fas fa-users"></i> 128</span>
                            </div>
                            <div class="lb-table">
                                <div class="lb-row header">
                                    <div class="col-rank">Rank</div>
                                    <div class="col-player">Player</div>
                                    <div class="col-score">Score</div>
                                </div>
                                <div class="lb-row">
                                    <div class="col-rank"><span class="rank-badge gold">1</span></div>
                                    <div class="col-player"><img src="https://i.pravatar.cc/150?img=5" class="lb-avatar"> Kavya Singh</div>
                                    <div class="col-score">1890</div>
                                </div>
                                <div class="lb-row active-user">
                                    <div class="col-rank"><span class="rank-badge silver">2</span></div>
                                    <div class="col-player"><img src="https://i.pravatar.cc/150?img=11" class="lb-avatar"> Arjun Dev <span class="you-badge">You</span></div>
                                    <div class="col-score">1872</div>
                                </div>
                                <div class="lb-row">
                                    <div class="col-rank"><span class="rank-badge bronze">3</span></div>
                                    <div class="col-player"><img src="https://i.pravatar.cc/150?img=12" class="lb-avatar"> Rohan Verma</div>
                                    <div class="col-score">1839</div>
                                </div>
                                <div class="lb-row">
                                    <div class="col-rank">4</div>
                                    <div class="col-player"><img src="https://i.pravatar.cc/150?img=8" class="lb-avatar"> Aditya Raj</div>
                                    <div class="col-score">1765</div>
                                </div>
                                <div class="lb-row">
                                    <div class="col-rank">5</div>
                                    <div class="col-player"><img src="https://i.pravatar.cc/150?img=9" class="lb-avatar"> Neha Patel</div>
                                    <div class="col-score">1698</div>
                                </div>
                            </div>
                            <button class="premium-btn btn-outline full-width mt-3">View Full Leaderboard</button>
                        </div>
                    </div>
                </div>

                <!-- BOTTOM ANALYTICS ROW -->
                <div class="arena-bottom-row">
                    <div class="premium-glass-card stat-box">
                        <h3 class="panel-heading">YOUR STATS</h3>
                        <div class="stat-flex">
                            <div class="rating-ring">
                                <svg viewBox="0 0 100 100">
                                    <circle class="bg" cx="50" cy="50" r="45"></circle>
                                    <circle class="progress" cx="50" cy="50" r="45" stroke-dasharray="282" stroke-dashoffset="60"></circle>
                                </svg>
                                <div class="ring-text">
                                    <div class="val">1872</div>
                                    <div class="lbl">Rating</div>
                                </div>
                            </div>
                            <div class="stat-list">
                                <div class="st-item"><span class="st-lbl">Win Rate</span><span class="st-val">78%</span></div>
                                <div class="st-item"><span class="st-lbl">Wins</span><span class="st-val">32</span></div>
                                <div class="st-item"><span class="st-lbl">Losses</span><span class="st-val">9</span></div>
                                <div class="st-item"><span class="st-lbl">Win Streak</span><span class="st-val">6</span></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="premium-glass-card stat-box">
                        <h3 class="panel-heading">TODAY'S PROGRESS</h3>
                        <div class="prog-info">
                            <div class="prog-val">8 <span class="prog-total">/ 10</span></div>
                            <div class="prog-lbl">Problems Solved</div>
                        </div>
                        <div class="progress-bar-wrap mb-2">
                            <div class="progress-bar" style="width: 80%;"></div>
                        </div>
                        <div class="prog-footer">
                            <span>Daily Goal</span>
                            <span class="time-left"><i class="far fa-clock"></i> 10:30:45 Left</span>
                        </div>
                    </div>
                    
                    <div class="premium-glass-card stat-box">
                        <h3 class="panel-heading">AI INSIGHT</h3>
                        <div class="ai-insight-flex">
                            <i class="fas fa-brain ai-icon"></i>
                            <div class="ai-text">
                                <p>You're great at Arrays and HashMaps! Try solving more Medium level problems to improve your dynamic programming skills.</p>
                                <a href="#" class="view-link">View Full Analysis <i class="fas fa-arrow-right"></i></a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="premium-glass-card stat-box">
                        <h3 class="panel-heading">RECENT ACHIEVEMENT</h3>
                        <div class="ach-flex">
                            <div class="ach-badge">
                                <i class="fas fa-medal"></i>
                            </div>
                            <div class="ach-info">
                                <div class="ach-title">Speed Coder</div>
                                <div class="ach-desc">Solved a problem in less than 2 minutes</div>
                            </div>
                            <div class="ach-time">2h ago</div>
                        </div>
                    </div>
                </div>

            </section>
\n"""
    content = content[:start_idx] + new_arena_html + content[end_idx:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("index.html updated successfully.")
