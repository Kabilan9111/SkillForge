/**
 * SkillForge WAR ROOM — Executive Interview Center
 * 60 FPS Telemetry & Interactive State Engine
 */

(function() {
    'use strict';

    let currentCategory = 'Technical Coding';
    let currentCompany = 'Google';
    let currentPersona = 'Pressure Interviewer';
    let currentDuration = '45m Standard';
    let currentDifficulty = 'Staff / L6';
    let currentSalary = '$380,000 / yr';
    let baseProbability = 87.4;

    function initWarRoom() {
        animateCounters();
        setupEventListeners();
    }

    function animateCounters() {
        const counters = document.querySelectorAll('.wr-stat-num[data-target]');
        counters.forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-target'));
            const prefix = counter.getAttribute('data-prefix') || '';
            const suffix = counter.getAttribute('data-suffix') || '';
            const duration = 1800;
            const start = performance.now();

            function step(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);
                const currentVal = Math.floor(ease * target);
                
                if (target >= 1000) {
                    counter.textContent = prefix + currentVal.toLocaleString() + suffix;
                } else {
                    counter.textContent = prefix + currentVal + suffix;
                }

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    counter.textContent = prefix + target.toLocaleString() + suffix;
                }
            }
            requestAnimationFrame(step);
        });
    }

    function setupEventListeners() {
        // Categories
        document.querySelectorAll('.wr-cat-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.wr-cat-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                currentCategory = card.dataset.cat;
                updateReadyCard();
            });
        });

        // Companies
        document.querySelectorAll('.wr-company-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.wr-company-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                currentCompany = card.dataset.comp;
                baseProbability = parseFloat(card.dataset.prob || 85.0);
                updateReadyCard();
            });
        });

        // Personas
        document.querySelectorAll('.wr-persona-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.wr-persona-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                currentPersona = card.dataset.persona;
                updateReadyCard();
            });
        });

        // Duration Pills
        document.querySelectorAll('.wr-duration-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('.wr-duration-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                currentDuration = pill.textContent;
                updateReadyCard();
            });
        });

        // Difficulty Pills
        document.querySelectorAll('.wr-diff-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('.wr-diff-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                currentDifficulty = pill.textContent;
                updateReadyCard();
            });
        });

        // Salary Slider
        const salarySlider = document.getElementById('wr-salary-slider');
        const salaryVal = document.getElementById('wr-salary-val');
        if (salarySlider && salaryVal) {
            salarySlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                salaryVal.textContent = '$' + val.toLocaleString() + ' / yr';
                currentSalary = '$' + val.toLocaleString() + ' / yr';
            });
        }

        // Start Button
        const startBtn = document.getElementById('wr-start-btn');
        const modal = document.getElementById('wr-simulation-modal');
        if (startBtn && modal) {
            startBtn.addEventListener('click', () => {
                modal.style.display = 'flex';
                let count = 3;
                const counterEl = document.getElementById('wr-countdown-num');
                const statusEl = document.getElementById('wr-countdown-status');
                
                const interval = setInterval(() => {
                    count--;
                    if (count > 0) {
                        counterEl.textContent = count;
                        statusEl.textContent = "SYNCHRONIZING AI AUDIO CHANNELS & EVALUATOR...";
                    } else if (count === 0) {
                        counterEl.textContent = "LAUNCH!";
                        statusEl.textContent = "ENTERED EXECUTIVE WAR ROOM ENVIRONMENT.";
                    } else {
                        clearInterval(interval);
                        modal.style.display = 'none';
                        alert("Connected to SkillForge War Room! Live session running.");
                    }
                }, 1000);
            });
        }
    }

    function updateReadyCard() {
        const titleEl = document.getElementById('wr-ready-summary');
        const compEl = document.getElementById('wr-ready-comp');
        const personaEl = document.getElementById('wr-ready-persona');
        const diffEl = document.getElementById('wr-ready-diff');
        const probEl = document.getElementById('wr-ready-prob');

        if (titleEl) titleEl.textContent = `${currentDuration} • ${currentCategory} Executive Interview`;
        if (compEl) compEl.textContent = currentCompany;
        if (personaEl) personaEl.textContent = currentPersona;
        if (diffEl) diffEl.textContent = currentDifficulty;
        if (probEl) {
            const prob = (baseProbability + (Math.random() * 3 - 1.5)).toFixed(1);
            probEl.textContent = prob + '%';
        }
    }

    document.addEventListener('DOMContentLoaded', initWarRoom);
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initWarRoom, 100);
    }
})();


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
