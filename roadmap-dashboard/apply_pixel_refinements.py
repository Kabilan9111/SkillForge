import os

file_path = "index.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the Arena Home Section HTML with realistic image embeds
old_hero_start = '<!-- Hero Section -->'
old_hero_end = '<!-- Arena Overview -->'

if old_hero_start in content and old_hero_end in content:
    start_idx = content.find(old_hero_start)
    end_idx = content.find(old_hero_end)
    
    new_hero_html = """<!-- Hero Section -->
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
                                        <span>AI Analysis</span>
                                    </div>
                                </div>
                            </div>
                            <div class="hero-artwork-wrap">
                                <img src="hero_art.png" alt="Hero Battle" class="hero-art-img">
                                <div class="vs-centerpiece">VS</div>
                            </div>
                        </div>

                        """
    content = content[:start_idx] + new_hero_html + content[end_idx:]


# 2. Update Ready to Battle card to include trophy image
old_rb_start = '<!-- Ready to Battle -->'
old_rb_end = '<!-- Upcoming Tournaments -->'

if old_rb_start in content and old_rb_end in content:
    start_idx = content.find(old_rb_start)
    end_idx = content.find(old_rb_end)
    
    new_rb_html = """<!-- Ready to Battle -->
                        <div class="ready-battle-card">
                            <div class="rb-trophy-wrap">
                                <img src="trophy_art.png" alt="Championship Trophy" class="rb-trophy-img">
                                <div class="trophy-glow"></div>
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

                        """
    content = content[:start_idx] + new_rb_html + content[end_idx:]

# Ensure arena-home-page has page-view class for router compatibility
content = content.replace('<section id="arena-home-page" class="arena-home-page active">', '<section id="arena-home-page" class="page-view arena-home-page active">')
content = content.replace('<section id="coding-arena" class="coding-arena" style="display:none;">', '<section id="coding-arena" class="page-view coding-arena hidden" style="display:none;">')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

# Update CSS for new artwork wrappers
css_path = "coding-arena-styles.css"
with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

additional_css = """

/* Hero Artwork Layout Sizing */
.hero-artwork-wrap {
    position: relative;
    width: 62%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    overflow: hidden;
}

.hero-art-img {
    width: 100%;
    height: 120%;
    object-fit: cover;
    object-position: center right;
    mask-image: linear-gradient(to left, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%);
    -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%);
    filter: contrast(1.1) brightness(0.9);
}

.hero-artwork-wrap .vs-centerpiece {
    position: absolute;
    top: 50%;
    left: 45%;
    transform: translate(-50%, -50%);
    z-index: 10;
}

/* Ready to Battle Trophy */
.rb-trophy-wrap {
    position: relative;
    width: 140px;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.rb-trophy-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    z-index: 2;
    filter: drop-shadow(0 0 20px rgba(255,77,79,0.3));
    animation: floatTrophy 4s ease-in-out infinite alternate;
}

@keyframes floatTrophy {
    0% { transform: translateY(0px); }
    100% { transform: translateY(-8px); }
}

.trophy-glow {
    position: absolute;
    width: 80px;
    height: 80px;
    background: rgba(255,77,79,0.35);
    filter: blur(30px);
    border-radius: 50%;
    z-index: 1;
}
"""

with open(css_path, "a", encoding="utf-8") as f:
    f.write(additional_css)

print("Pixel refinements applied successfully.")
