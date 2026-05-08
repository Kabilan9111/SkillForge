// --- API CONFIGURATION ---
// --- API CONFIGURATION ---
const API_BASE_URL = (window.location.port && window.location.port !== '3000')
    ? 'http://localhost:3000/api'
    : '/api';
let authToken = localStorage.getItem('authToken') || null;
let currentUserLevel = localStorage.getItem('userLevel') || 'beginner';
let currentCommitment = localStorage.getItem('userCommitment') || null;
let selectedTrackSlug = localStorage.getItem('selectedTrack') || null;

// --- MOCK DATA (Language Scoped) ---
const CAREERS = [
    { id: 1, slug: 'java', title: 'Java Backend Enterprise Arch.', level: 'Hard', time: '8 Months', theme: 'theme-java' },
    { id: 2, slug: 'python', title: 'Python Full-Stack Developer', level: 'Medium', time: '6 Months', theme: 'theme-python' },
    { id: 3, slug: 'cpp', title: 'C / C++ Systems Engineer', level: 'Expert', time: '12 Months', theme: 'theme-cpp' }
];

const TRACK_DATA = {
    java: { // JAVA BACKEND TRACK
        stats: {
            progress: 35,
            readiness: 45,
        },
        roadmap: [
            { title: "Java Core & OOP", status: "completed", desc: "Classes, Interfaces, Polymorphism, Memory Mgmt." },
            { title: "Collections & Streams", status: "completed", desc: "List, Set, Map, Stream API, Lambdas." },
            { title: "Relational DBs (SQL)", status: "in-progress", desc: "Normalization, Joins, Indexing, ACID." },
            { title: "Spring Core (IoC)", status: "locked", desc: "Dependency Injection, Beans, Context." },
            { title: "REST API Design", status: "locked", desc: "Resources, Verbs, Status Codes. HATEOAS." },
            { title: "Microservices Patterns", status: "locked", desc: "Service Registry, Circuit Breaker, Gateway." },
            { title: "System Design", status: "locked", desc: "Scalability, Caching, Event-Driven Arch." }
        ],
        projects: [
            { id: 101, title: "E-Commerce Microservices", difficulty: "Hard", status: "Completed", desc: "Build a scalable e-commerce backend using Spring Boot microservices, Eureka for service discovery, and resilient patterns.", output: ["Service Registry (Eureka)", "Order Service", "Payment Service", "API Gateway"], structure: "src/main/java/com/skillforge/ecommerce/..." },
            { id: 102, title: "Real-Time Chat Application", difficulty: "Medium", status: "Pending", desc: "Implement a WebSocket-based chat server with specific rooms and persistence using MongoDB.", output: ["WebSocket Config", "Message Handling", "History Persistence"], structure: "src/main/java/com/skillforge/chat/..." },
            { id: 103, title: "Redis-Based Caching Layer", difficulty: "Medium", status: "Locked", desc: "Create a custom caching annotation and aspect to cache heavy database queries automatically.", output: ["@Cacheable Aspect", "Redis Config", "Test Cases"], structure: "..." }
        ],
        tasks: {
            dsa: [
                { title: "Invert Binary Tree", status: "solved" },
                { title: "LRU Cache Implementation", status: "unsolved" },
                { title: "Merge K Sorted Lists", status: "locked" }
            ],
            design: [
                { title: "Design URL Shortener", status: "reviewed" },
                { title: "Design Rate Limiter", status: "unsolved" }
            ]
        }
    },
    python: { // PYTHON FULL-STACK TRACK
        stats: {
            progress: 15,
            readiness: 20,
        },
        roadmap: [
            { title: "Python Advanced Syntax", status: "completed", desc: "Decorators, Generators, Context Managers, Metaclasses." },
            { title: "AsyncIO & Concurrency", status: "in-progress", desc: "Event loops, coroutines, async/await patterns." },
            { title: "FastApi Framework", status: "locked", desc: "Pydantic models, Dependency Injection, OpenAPI docs." },
            { title: "PostgreSQL & SQLAlchemy", status: "locked", desc: "ORM layers, Migrations (Alembic), Complex queries." },
            { title: "React Integration", status: "locked", desc: "Connecting FastAPI backend with React frontend." }
        ],
        projects: [
            { id: 201, title: "AI-Powered Task Manager", difficulty: "Medium", status: "Pending", desc: "FastAPI backend with NLP for task categorization.", output: ["REST Endpoints", "NLP Module", "JWT Auth"], structure: "app/main.py..." },
            { id: 202, title: "Real-time Stock Dashboard", difficulty: "Hard", status: "Locked", desc: "WebSockets with Python and React.", output: ["Ticker Feed", "Live Graph", "Alert System"], structure: "src/backends/stock_service..." }
        ],
        tasks: {
            dsa: [
                { title: "Reverse Linked List", status: "solved" },
                { title: "Valid Parentheses", status: "solved" },
                { title: "Climbing Stairs", status: "unsolved" }
            ],
            design: [
                { title: "Design Instagram Feed", status: "locked" }
            ]
        }
    },
    cpp: { // C++ SYSTEMS TRACK
        stats: {
            progress: 60,
            readiness: 75,
        },
        roadmap: [
            { title: "Memory Management Deep Dive", status: "completed", desc: "Pointers, Smart Pointers, Custom Allocators, Valgrind." },
            { title: "Multithreading & Concurrency", status: "completed", desc: "std::thread, Mutex, Condition Variables, Atomics." },
            { title: "Network Programming", status: "completed", desc: "Sockets, TCP/UDP, Non-blocking I/O, Epoll." },
            { title: "Operating System Concepts", status: "in-progress", desc: "Process scheduling, Virtual Memory, File Systems." },
            { title: "Low-Latency Trading System", status: "locked", desc: "Ring buffers, Lock-free queues, Kernel bypass." }
        ],
        projects: [
            { id: 301, title: "HTTP Web Server", difficulty: "Expert", status: "Completed", desc: "Build a multi-threaded HTTP server from scratch using BSD sockets.", output: ["Socket Binding", "ThreadPool", "HTTP Parser"], structure: "src/server.cpp..." },
            { id: 302, title: "Custom Memory Allocator", difficulty: "Hard", status: "Pending", desc: "Implement a malloc/free replacement.", output: ["Memory Pool", "Coalescing", "Benchmarks"], structure: "src/allocator/..." }
        ],
        tasks: {
            dsa: [
                { title: "Implement Vector", status: "solved" },
                { title: "Detect Cycle in Graph", status: "solved" },
                { title: "Trie Implementation", status: "unsolved" }
            ],
            design: [
                { title: "Design Distributed File System", status: "unsolved" },
                { title: "Design Key-Value Store", status: "unsolved" }
            ]
        }
    }
};

// --- API FUNCTIONS ---
async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Login failed');
        }

        const data = await response.json();
        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        console.log('Login successful:', data);
        return data;
    } catch (error) {
        console.error('Login error:', error);
        showFeedback(`Login failed: ${error.message}. Using offline mode.`, 'warning');
        return null;
    }
}

async function enrollInTrack(trackId, level) {
    try {
        const response = await fetch(`${API_BASE_URL}/track/enroll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ trackId, level })
        });

        if (!response.ok) throw new Error('Enrollment failed');
        return await response.json();
    } catch (error) {
        console.error('Enrollment error:', error);
        return null;
    }
}

// Clear expired token and re-authenticate, then retry the callback
async function handleTokenExpiry(retryCallback) {
    console.warn('[Auth] Token expired or invalid. Clearing and re-authenticating...');
    authToken = null;
    localStorage.removeItem('authToken');
    const loginData = await loginUser('student1@techvidya.edu', 'password123');
    if (loginData && loginData.token) {
        authToken = loginData.token;
        localStorage.setItem('authToken', authToken);
        return retryCallback();
    }
    return null;
}

async function fetchRoadmap(trackId, level) {
    try {
        const response = await fetch(`${API_BASE_URL}/roadmap/${trackId}?level=${level}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token is expired or invalid — re-authenticate and retry
                return await handleTokenExpiry(() => fetchRoadmap(trackId, level));
            }
            // If not enrolled, try to enroll first
            if (response.status === 403) {
                await enrollInTrack(trackId, level);
                // Retry fetch
                const retryResponse = await fetch(`${API_BASE_URL}/roadmap/${trackId}?level=${level}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (!retryResponse.ok) throw new Error('Failed to fetch roadmap');
                return await retryResponse.json();
            }
            throw new Error('Failed to fetch roadmap');
        }

        return await response.json();
    } catch (error) {
        console.error('Roadmap fetch error:', error);
        // Return fallback data
        return null;
    }
}

// --- NAVIGATION SYSTEM ---
const views = document.querySelectorAll('.page-view');
const sidebar = document.getElementById('global-sidebar');
const navItems = document.querySelectorAll('.nav-item[data-target]');
let currentRole = null;
let activeTrack = 'java'; // State variable for the active track

function navigateTo(pageId) {
    // 1. Hide all pages
    views.forEach(view => view.classList.add('hidden'));
    views.forEach(view => view.classList.remove('active'));

    // 2. Show target page
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }

    // 3. Handle Sidebar Visibility
    if (pageId === 'landing-page') {
        sidebar.style.display = 'none';
        updateBodyTheme('theme-dark'); // Reset to default dark on landing
    } else if (pageId === 'onboarding-page' || pageId === 'career-selection-page') {
        sidebar.style.display = 'none';
    } else {
        sidebar.style.display = 'flex';
        updateActiveNav(pageId);
    }

    // 4. Render Dynamic Content
    // Always re-render components that rely on activeTrack to ensure freshness
    if (pageId === 'career-selection-page') renderCareers();
    if (pageId === 'dashboard-page') renderDashboard();
    if (pageId === 'projects-page') renderProjects();
    if (pageId === 'practice-page') renderPractice();
}

function updateActiveNav(pageId) {
    navItems.forEach(btn => {
        if (btn.dataset.target === pageId) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

// --- STATE & RENDERING LOGIC ---

function setActiveTrack(trackId) {
    if (!TRACK_DATA[trackId]) return;
    activeTrack = trackId;

    // Update theme based on track
    const role = CAREERS.find(c => c.slug === activeTrack);
    if (role) {
        updateBodyTheme(role.theme);

        // Fetch roadmap from backend if logged in
        if (authToken) {
            fetchRoadmap(role.id, currentUserLevel).then(data => {
                if (data && data.roadmap) {
                    // Convert backend format to display format
                    TRACK_DATA[trackId].roadmap = data.roadmap.map(module => ({
                        title: module.title,
                        status: module.isCompleted ? 'completed' : (module.isUnlocked ? 'in-progress' : 'locked'),
                        desc: module.description
                    }));

                    // Calculate progress
                    const completed = data.roadmap.filter(m => m.isCompleted).length;
                    const total = data.roadmap.length;
                    TRACK_DATA[trackId].stats.progress = Math.round((completed / total) * 100);

                    renderDashboard();
                }
            });
        }
    }
}

function updateBodyTheme(themeClass) {
    document.body.classList.remove('theme-java', 'theme-python', 'theme-cpp', 'theme-dark');
    document.body.classList.add(themeClass);
}

function renderCareers() {
    const grid = document.getElementById('career-grid');
    grid.innerHTML = CAREERS.map(c => `
        <article class="role-card" data-slug="${c.slug}" style="cursor: pointer;">
            <h3 class="role-name">${c.title}</h3>
            <div class="role-meta">
                <span>${c.time}</span>
                <span class="${c.level === 'Hard' || c.level === 'Expert' ? 'text-danger' : 'text-success'}">${c.level}</span>
            </div>
        </article>
    `).join('');

    // Attach click handlers after rendering
    document.querySelectorAll('.role-card').forEach(card => {
        card.addEventListener('click', function () {
            const slug = this.dataset.slug;
            selectCareer(slug);
        });
    });
}

async function renderDashboard() {
    const data = TRACK_DATA[activeTrack];
    const roleInfo = CAREERS.find(c => c.slug === activeTrack);

    // Update Dashboard Header Stats
    if (document.getElementById('dash-role-title')) {
        document.getElementById('dash-role-title').innerText = roleInfo ? roleInfo.title : "Track Not Selected";
    }

    if (document.getElementById('dash-progress-text')) {
        document.getElementById('dash-progress-text').innerText = `${data.stats.progress}%`;
    }
    if (document.getElementById('dash-progress-bar')) {
        document.getElementById('dash-progress-bar').style.width = `${data.stats.progress}%`;
    }

    const readinessVal = document.querySelector('.score-value');
    if (readinessVal) readinessVal.innerText = `${data.stats.readiness}/100`;

    const readinessFill = document.querySelector('.meter-fill');
    if (readinessFill) readinessFill.style.width = `${data.stats.readiness}%`;

    // Fetch and render real modules from API
    const container = document.getElementById('roadmap-container');
    if (container) {
        container.innerHTML = '<div style="text-align:center;padding:2rem;color:#888;">Loading modules...</div>';

        try {
            const response = await fetch(`${API_BASE_URL}/tracks/${activeTrack}/modules?level=${currentUserLevel}`);
            if (!response.ok) throw new Error('Failed to fetch');

            const modules = await response.json();

            // Fetch progress if logged in
            let userProgress = [];
            if (authToken) {
                try {
                    const progressResponse = await fetch(`${API_BASE_URL}/progress/${activeTrack}`, {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    if (progressResponse.ok) {
                        const progressData = await progressResponse.json();
                        userProgress = progressData.progress || [];
                    }
                } catch (err) {
                    console.warn('Could not fetch progress:', err);
                }
            }

            // Render modules
            container.innerHTML = modules.map(module => {
                const progress = userProgress.find(p => p.module_id === module.id);
                let status = 'locked';
                if (progress) {
                    status = progress.status === 'completed' ? 'completed' : 'in-progress';
                } else if (module.sequence_order === 1) {
                    status = 'in-progress';
                }

                return `
                    <article class="node ${status}">
                        <header class="node-header">
                            <span class="node-title">${module.title}</span>
                            <span class="node-status">${status.toUpperCase()}</span>
                        </header>
                        <p class="node-desc">${module.description || ''}</p>
                        <small class="text-muted">${module.estimated_hours}hrs • ${module.category}</small>
                    </article>
                `;
            }).join('');

        } catch (error) {
            console.error('Error fetching modules:', error);
            // Fallback to mock data
            container.innerHTML = data.roadmap.map(node => `
                <article class="node ${node.status}">
                    <header class="node-header">
                        <span class="node-title">${node.title}</span>
                        <span class="node-status">${node.status.toUpperCase()}</span>
                    </header>
                    <p class="node-desc">${node.desc}</p>
                </article>
            `).join('');
        }
    }
}

function renderProjects() {
    const data = TRACK_DATA[activeTrack];
    const list = document.getElementById('projects-list');

    if (!list) return; // Guard clause if not on page

    list.innerHTML = ''; // Clean slate
    list.innerHTML = data.projects.map(p => `
        <article class="project-card" onclick="openProjectModal(${p.id})">
            <div>
                <h3>${p.title}</h3>
                <p class="text-muted" style="font-size:0.9rem">${p.desc}</p>
            </div>
            <div class="badge ${p.status.toLowerCase() == 'completed' ? 'completed' : 'pending'}">
                ${p.status}
            </div>
        </article>
    `).join('');
}

function renderPractice() {
    const data = TRACK_DATA[activeTrack];
    const dsaList = document.getElementById('dsa-list');
    const designList = document.getElementById('sys-design-list');

    // Clean slate before rendering
    if (dsaList) {
        dsaList.innerHTML = '';
        dsaList.innerHTML = data.tasks.dsa.map(t => taskHtml(t)).join('');
    }
    if (designList) {
        designList.innerHTML = '';
        designList.innerHTML = data.tasks.design.map(t => taskHtml(t)).join('');
    }
}

function taskHtml(task) {
    const icon = task.status === 'solved' ? 'check-circle' : (task.status === 'locked' ? 'lock' : 'circle');
    const color = task.status === 'solved' ? 'var(--success)' : 'var(--text-muted)';
    return `
        <div class="task-card">
            <span>${task.title}</span>
            <i class="fas fa-${icon}" style="color: ${color}"></i>
        </div>
    `;
}

// --- INTERACTION LOGIC ---

// Onboarding
let currentStep = 1;
let selectedTrackId = null;

function selectCareer(careerSlug) {
    // Validate careerSlug parameter
    if (!careerSlug || typeof careerSlug !== 'string') {
        console.error('Invalid career selection:', careerSlug);
        showFeedback('Please select a valid career path', 'error');
        return;
    }

    // Find career by slug
    const career = CAREERS.find(c => c.slug === careerSlug);
    if (!career) {
        console.error('Career not found:', careerSlug);
        showFeedback('Career path not found', 'error');
        return;
    }

    // Store career selection
    currentRole = career;
    selectedTrackId = career.id;
    selectedTrackSlug = career.slug;

    // Persist to localStorage
    localStorage.setItem('selectedTrack', career.slug);
    localStorage.setItem('selectedTrackId', career.id);
    localStorage.setItem('selectedRole', career.title);

    // Set active track immediately
    setActiveTrack(careerSlug);

    // Populate onboarding form
    const roleInput = document.getElementById('target-role-input');
    if (roleInput) {
        roleInput.value = currentRole.title;
    }

    // Navigate to onboarding
    navigateTo('onboarding-page');

    // Reset form to step 1
    currentStep = 1;

    // Reset onboarding DOM state
    document.querySelectorAll('.form-step').forEach(s => s.classList.add('hidden'));
    const step1 = document.getElementById('step-1');
    if (step1) step1.classList.remove('hidden');

    document.querySelectorAll('.progress-indicator .step').forEach(s => s.classList.remove('active'));
    const progStep1 = document.getElementById('prog-step-1');
    if (progStep1) progStep1.classList.add('active');
}

function nextStep(step) {
    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    document.getElementById(`step-${step}`).classList.remove('hidden');

    // Update indicator
    document.getElementById(`prog-step-${step}`).classList.add('active');

    currentStep = step;
}

function prevStep(step) {
    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    document.getElementById(`step-${step}`).classList.remove('hidden');
    // Update indicator
    document.getElementById(`prog-step-${currentStep}`).classList.remove('active');
    currentStep = step;
}

function finishOnboarding() {
    // Validate required selections
    const levelRadio = document.querySelector('input[name="level"]:checked');
    if (!levelRadio) {
        showFeedback('Please select your skill level', 'error');
        return;
    }

    const commitmentSlider = document.getElementById('time-slider');
    if (!commitmentSlider) {
        showFeedback('Please set your time commitment', 'error');
        return;
    }

    if (!selectedTrackId || !selectedTrackSlug) {
        showFeedback('No career path selected. Please go back to career selection.', 'error');
        setTimeout(() => navigateTo('career-selection-page'), 2000);
        return;
    }

    // Store selections
    currentUserLevel = levelRadio.value;
    currentCommitment = commitmentSlider.value;

    // Persist to localStorage
    localStorage.setItem('userLevel', currentUserLevel);
    localStorage.setItem('userCommitment', currentCommitment);
    localStorage.setItem('onboardingComplete', 'true');

    // Auto-login with demo credentials if not logged in
    if (!authToken) {
        showFeedback('Logging in...', 'info');
        loginUser('student1@techvidya.edu', 'password123').then(loginData => {
            if (loginData) {
                authToken = loginData.token;
                localStorage.setItem('authToken', authToken);
                showFeedback('Login successful! Setting up your roadmap...', 'success');

                // Enroll in selected track with chosen level
                if (selectedTrackId) {
                    enrollInTrack(selectedTrackId, currentUserLevel).then(() => {
                        // Refresh roadmap with selected level
                        setActiveTrack(selectedTrackSlug);
                        showFeedback('Welcome to SkillForge! Starting your journey...', 'success');
                        navigateTo('dashboard-page');
                    }).catch(err => {
                        console.error('Enrollment failed:', err);
                        showFeedback('Enrollment failed. Continuing with mock data.', 'warning');
                        navigateTo('dashboard-page');
                    });
                } else {
                    navigateTo('dashboard-page');
                }
            } else {
                showFeedback('Login failed. Using offline mode with demo data.', 'warning');
                navigateTo('dashboard-page');
            }
        }).catch(err => {
            console.error('Login error:', err);
            showFeedback('Connection error. Using offline mode with demo data.', 'warning');
            navigateTo('dashboard-page');
        });
    } else {
        // Already logged in, just enroll
        if (selectedTrackId) {
            enrollInTrack(selectedTrackId, currentUserLevel).then(() => {
                setActiveTrack(selectedTrackSlug);
                showFeedback('Enrollment updated successfully!', 'success');
                navigateTo('dashboard-page');
            }).catch(err => {
                console.error('Enrollment failed:', err);
                showFeedback('Enrollment failed. Continuing with mock data.', 'warning');
                navigateTo('dashboard-page');
            });
        } else {
            navigateTo('dashboard-page');
        }
    }
}

// Modal
const modal = document.getElementById('project-detail-modal');
const closeBtn = document.getElementById('close-project-modal');

function openProjectModal(id) {
    // Search current track projects first
    const p = TRACK_DATA[activeTrack].projects.find(x => x.id === id);
    if (!p) return;

    document.getElementById('modal-project-title').innerText = p.title;
    document.getElementById('modal-project-desc').innerText = p.desc;
    document.getElementById('modal-project-output').innerHTML = p.output.map(o => `<li>${o}</li>`).join('');
    document.getElementById('modal-project-structure').innerText = p.structure;

    modal.classList.remove('hidden');
}

if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
window.onclick = (e) => { if (e.target == modal) modal.classList.add('hidden'); }

// User Feedback System
function showFeedback(message, type = 'info') {
    // Remove existing feedback
    const existing = document.querySelector('.feedback-toast');
    if (existing) existing.remove();

    // Create new feedback toast
    const toast = document.createElement('div');
    toast.className = `feedback-toast feedback-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    // Set colors based on type
    const colors = {
        success: 'background: #10b981; color: white;',
        error: 'background: #ef4444; color: white;',
        warning: 'background: #f59e0b; color: white;',
        info: 'background: #3b82f6; color: white;'
    };
    toast.style.cssText += colors[type] || colors.info;

    document.body.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Level Switching
function switchLevel(level) {
    if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
        console.error('Invalid level:', level);
        return;
    }

    currentUserLevel = level;
    localStorage.setItem('userLevel', level);

    // Update active button
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.level === level) {
            btn.classList.add('active');
        }
    });

    // Fetch new roadmap data for selected level
    if (authToken && selectedTrackId) {
        fetchRoadmap(selectedTrackId, level).then(data => {
            if (data && data.roadmap) {
                // Convert backend format to display format
                TRACK_DATA[activeTrack].roadmap = data.roadmap.map(module => ({
                    title: module.title,
                    status: module.isCompleted ? 'completed' : (module.isUnlocked ? 'in-progress' : 'locked'),
                    desc: module.description
                }));

                // Calculate progress
                const completed = data.roadmap.filter(m => m.isCompleted).length;
                const total = data.roadmap.length;
                TRACK_DATA[activeTrack].stats.progress = Math.round((completed / total) * 100);

                renderDashboard();
            }
        });
    }
}

// Initialize on page load

document.addEventListener('DOMContentLoaded', () => {
    // Restore state from localStorage
    if (authToken && localStorage.getItem('onboardingComplete') === 'true') {
        // User has completed onboarding, check if they have a selected track
        if (selectedTrackSlug) {
            activeTrack = selectedTrackSlug;
            setActiveTrack(selectedTrackSlug);
            // Could automatically navigate to dashboard if desired
            // navigateTo('dashboard-page');
        }

        // Restore level button state if on dashboard
        const activeLevelBtn = document.querySelector(`.level-btn[data-level="${currentUserLevel}"]`);
        if (activeLevelBtn) {
            document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
            activeLevelBtn.classList.add('active');
        }
    }

    // Attach Nav Listeners (Data Attributes)
    document.querySelectorAll('[data-action="nav-careers"]').forEach(b => {
        b.addEventListener('click', () => navigateTo('career-selection-page'));
    });

    document.querySelectorAll('.nav-item[data-target]').forEach(b => {
        b.addEventListener('click', () => {
            const targetPage = b.dataset.target;

            // Validate that onboarding is complete before allowing dashboard access
            if (targetPage === 'dashboard-page' && !selectedTrackSlug) {
                showFeedback('Please complete career selection first', 'warning');
                navigateTo('career-selection-page');
                return;
            }

            navigateTo(targetPage);
        });
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear state on logout
            localStorage.clear();
            authToken = null;
            currentUserLevel = 'beginner';
            currentCommitment = null;
            selectedTrackSlug = null;
            selectedTrackId = null;
            currentRole = null;
            activeTrack = 'java';
            navigateTo('landing-page');
            showFeedback('Logged out successfully', 'success');
        });
    }

    // Handle Slider Input
    const slider = document.getElementById('time-slider');
    if (slider) {
        slider.oninput = function () {
            document.getElementById('hours-val').innerText = this.value;
        }
    }
});
