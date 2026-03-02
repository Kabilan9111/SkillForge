// --- API CONFIGURATION ---
const API_BASE_URL = 'http://localhost:5000/api';
let authToken = localStorage.getItem('authToken') || null;
let currentUserLevel = localStorage.getItem('userLevel') || 'beginner';
let currentCommitment = localStorage.getItem('userCommitment') || null;
let selectedTrackSlug = localStorage.getItem('selectedTrack') || null;
let selectedTrackId = localStorage.getItem('selectedTrackId') || null;
let currentRole = localStorage.getItem('selectedRole') || null;
let userData = JSON.parse(localStorage.getItem('userData') || '{}');

// --- CAREERS CONFIGURATION (Dynamic Data Source) ---
const CAREERS = [
    { id: 1, slug: 'java', title: 'Java Backend Enterprise Arch.', level: 'Hard', time: '8 Months', theme: 'theme-java', description: 'Build scalable enterprise systems' },
    { id: 2, slug: 'python', title: 'Python Full-Stack Developer', level: 'Medium', time: '6 Months', theme: 'theme-python', description: 'Modern web development with Python' },
    { id: 3, slug: 'cpp', title: 'C / C++ Systems Engineer', level: 'Expert', time: '12 Months', theme: 'theme-cpp', description: 'Low-level systems and performance' },
    { id: 4, slug: 'cloud', title: 'Cloud & DevOps Engineer', level: 'Medium', time: '7 Months', theme: 'theme-python', description: 'AWS, Kubernetes, CI/CD pipelines' },
    { id: 5, slug: 'javascript', title: 'JavaScript Full-Stack', level: 'Medium', time: '6 Months', theme: 'theme-java', description: 'React, Node.js, modern JS ecosystem' }
];

// --- TRACK DATA (Language Scoped) ---
const TRACK_DATA = {
    java: {
        stats: { progress: 35, readiness: 45 },
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
    python: {
        stats: { progress: 15, readiness: 20 },
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
    cpp: {
        stats: { progress: 60, readiness: 75 },
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
    },
    cloud: {
        stats: { progress: 25, readiness: 30 },
        roadmap: [
            { title: "AWS Fundamentals", status: "completed", desc: "EC2, S3, RDS, IAM basics" },
            { title: "Docker & Containerization", status: "in-progress", desc: "Dockerfile, Docker Compose, multi-stage builds" },
            { title: "Kubernetes Orchestration", status: "locked", desc: "Pods, Services, Deployments, ConfigMaps" },
            { title: "CI/CD Pipelines", status: "locked", desc: "Jenkins, GitHub Actions, GitLab CI" },
            { title: "Infrastructure as Code", status: "locked", desc: "Terraform, CloudFormation" }
        ],
        projects: [
            { id: 401, title: "Scalable Web App on AWS", difficulty: "Medium", status: "Pending", desc: "Deploy multi-tier app with load balancing", output: ["VPC Setup", "Auto Scaling", "RDS Integration"], structure: "infrastructure/..." }
        ],
        tasks: {
            dsa: [
                { title: "System Design: CDN", status: "unsolved" }
            ],
            design: [
                { title: "Design Auto-Scaling System", status: "unsolved" }
            ]
        }
    },
    javascript: {
        stats: { progress: 40, readiness: 50 },
        roadmap: [
            { title: "Modern JavaScript (ES6+)", status: "completed", desc: "Arrow functions, destructuring, promises, async/await" },
            { title: "React Fundamentals", status: "completed", desc: "Components, Hooks, State Management" },
            { title: "Node.js & Express", status: "in-progress", desc: "REST APIs, middleware, authentication" },
            { title: "Database Integration", status: "locked", desc: "MongoDB, Mongoose, PostgreSQL with Sequelize" },
            { title: "Testing & Deployment", status: "locked", desc: "Jest, Cypress, CI/CD, Docker" }
        ],
        projects: [
            { id: 501, title: "Social Media Dashboard", difficulty: "Medium", status: "Pending", desc: "Full-stack MERN application", output: ["React Frontend", "Express API", "MongoDB"], structure: "client/ and server/" }
        ],
        tasks: {
            dsa: [
                { title: "Implement Debounce", status: "solved" },
                { title: "Deep Clone Object", status: "unsolved" }
            ],
            design: [
                { title: "Design Real-time Chat", status: "unsolved" }
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
        userData = data.user || {};
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userData', JSON.stringify(userData));
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
    console.warn('[Auth] Token expired or invalid. Clearing token and redirecting to login...');
    authToken = null;
    localStorage.removeItem('authToken');
    // Save current page state so we can return after login
    const currentPage = document.querySelector('.page.active')?.id || '';
    if (currentPage) localStorage.setItem('postLoginPage', currentPage);
    showFeedback('Session expired. Please log in again.', 'warning');
    setTimeout(() => {
        // Show the login section directly in-page rather than hard redirecting
        navigateTo('auth-page');
    }, 1500);
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
            if (response.status === 403) {
                await enrollInTrack(trackId, level);
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
        return null;
    }
}

// --- ROUTING & NAVIGATION SYSTEM ---
const sidebar = document.getElementById('global-sidebar');
const navItems = document.querySelectorAll('.nav-item[data-target]');
let activeTrack = selectedTrackSlug || 'java';

// Expose for modules (projects-workspace.js needs access to TRACK_DATA)
window.TRACK_DATA = TRACK_DATA;
window.getActiveTrack = () => activeTrack;

// Navigation function with state checking
function navigateTo(pageId) {
    console.log('[Router] Navigating to:', pageId);
    
    // CRITICAL: Always query fresh to avoid stale NodeList
    const allPages = document.querySelectorAll('.page-view');
    console.log('[Router] Found', allPages.length, 'pages');
    
    // Hide all pages
    allPages.forEach(view => {
        view.classList.add('hidden');
        view.classList.remove('active');
        view.style.display = 'none'; // Force hide via inline style
    });

    // Show target page
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
        target.style.display = ''; // Clear inline style to allow CSS
        
        // Debug: Check computed style
        const computedStyle = window.getComputedStyle(target);
        console.log('[Router] Target page:', pageId, {
            hasHidden: target.classList.contains('hidden'),
            hasActive: target.classList.contains('active'),
            computedDisplay: computedStyle.display,
            computedVisibility: computedStyle.visibility,
            offsetHeight: target.offsetHeight,
            offsetWidth: target.offsetWidth
        });
    } else {
        console.error('[Router] Page not found:', pageId);
        return;
    }

    // Handle Sidebar Visibility
    if (pageId === 'landing-page' || pageId === 'careers-list-page' || pageId === 'course-selection-page' || pageId === 'onboarding-page') {
        sidebar.style.display = 'none';
        if (pageId === 'landing-page') {
            updateBodyTheme('theme-dark');
        }
    } else {
        sidebar.style.display = 'flex';
        updateActiveNav(pageId);
    }

    // CRITICAL: Use requestAnimationFrame to ensure DOM is updated before rendering
    // This prevents race conditions where render functions can't find elements
    requestAnimationFrame(() => {
        renderPageContent(pageId);
    });
    
    // Update URL without reloading page
    updateURL(pageId);
}

// Separate function to render page content - called AFTER DOM is ready
function renderPageContent(pageId) {
    console.log('[Router] Rendering content for:', pageId);
    
    // DIAGNOSTIC: Check if page is actually visible
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        const rect = targetPage.getBoundingClientRect();
        const styles = window.getComputedStyle(targetPage);
        console.log('[Router] Page state diagnostic:', {
            id: pageId,
            classList: Array.from(targetPage.classList),
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            height: styles.height,
            width: styles.width,
            boundingRect: { 
                width: rect.width, 
                height: rect.height,
                top: rect.top,
                left: rect.left
            },
            innerHTML_length: targetPage.innerHTML.length,
            childElementCount: targetPage.childElementCount
        });
        
        // Check parent container
        const mainContent = document.querySelector('.main-content-area');
        if (mainContent) {
            const mainRect = mainContent.getBoundingClientRect();
            const mainStyles = window.getComputedStyle(mainContent);
            console.log('[Router] Main content area:', {
                display: mainStyles.display,
                visibility: mainStyles.visibility,
                width: mainRect.width,
                height: mainRect.height,
                overflow: mainStyles.overflow,
                overflowY: mainStyles.overflowY
            });
        }
    }
    
    // Render dynamic content based on page - ALWAYS inject UI for each page
    if (pageId === 'careers-list-page') {
        renderCareers();
    }
    
    if (pageId === 'dashboard-page') {
        console.log('[Navigation] Rendering dashboard...');
        if (typeof window.enhancedFlows !== 'undefined') {
            window.enhancedFlows.renderDashboard();
        } else {
            renderDashboard();
        }
    }
    
    if (pageId === 'projects-page') {
        console.log('[Navigation] Rendering projects page...');
        if (typeof window.ProjectsWorkspace !== 'undefined') {
            window.ProjectsWorkspace.renderProjectsGrid();
        } else {
            renderProjects();
        }
    }
    
    if (pageId === 'practice-page') {
        console.log('[Navigation] Rendering practice page...');
        if (typeof window.enhancedFlows !== 'undefined') {
            window.enhancedFlows.renderPractice();
        } else {
            renderPractice();
        }
    }
    
    if (pageId === 'mock-interview-page') {
        console.log('[Navigation] Initializing mock interview...');
        // Mock Interview has its own init that sets up the UI
        if (typeof MockInterview !== 'undefined' && typeof MockInterview.init === 'function') {
            MockInterview.init();
        } else {
            console.error('[Navigation] MockInterview module not found!');
        }
    }
    
    if (pageId === 'video-library-page') {
        console.log('[Navigation] Rendering video library...');
        if (typeof window.VideoLibrary !== 'undefined') {
            window.VideoLibrary.renderVideoGrid();
        } else {
            console.error('[Navigation] VideoLibrary module not found!');
        }
    }
    
    if (pageId === 'profile-page') {
        renderProfile();
    }
    
    if (pageId === 'skill-gap-page') {
        if (typeof window.enhancedFlows !== 'undefined') {
            window.enhancedFlows.initializeSkillGapAnalyzer();
        }
    }
    
    if (pageId === 'video-library-page') {
        console.log('[Navigation] Initializing video library...');
        if (typeof VideoLibrary !== 'undefined') {
            VideoLibrary.init();
        }
    }
}

// Smart navigation for "Start Your Roadmap" button
function startRoadmap() {
    console.log('Start Roadmap clicked');
    console.log('State:', { selectedTrackSlug, currentUserLevel, currentCommitment });
    
    // Check if user has completed onboarding
    if (!selectedTrackSlug || !currentUserLevel || !currentCommitment) {
        console.log('Incomplete onboarding, redirecting to career selection');
        showFeedback('Please complete the roadmap setup first', 'info');
        navigateTo('careers-list-page');
    } else {
        console.log('Onboarding complete, going to dashboard');
        setActiveTrack(selectedTrackSlug);
        navigateTo('dashboard-page');
    }
}

function updateActiveNav(pageId) {
    navItems.forEach(btn => {
        if (btn.dataset.target === pageId) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

function updateBodyTheme(themeClass) {
    document.body.classList.remove('theme-java', 'theme-python', 'theme-cpp', 'theme-dark');
    document.body.classList.add(themeClass);
}

// --- URL ROUTING (Hash-based) ---
function updateURL(pageId) {
    const hash = pageId.replace('-page', '');
    window.location.hash = hash;
}

function handleURLChange() {
    const hash = window.location.hash.slice(1) || 'landing';
    const pageId = hash.includes('page') ? hash : `${hash}-page`;
    
    // Validate page exists
    if (document.getElementById(pageId)) {
        navigateTo(pageId);
    } else {
        navigateTo('landing-page');
    }
}

// --- STATE MANAGEMENT ---
function setActiveTrack(trackSlug) {
    if (!TRACK_DATA[trackSlug]) {
        console.error('Invalid track:', trackSlug);
        return;
    }
    
    activeTrack = trackSlug;
    selectedTrackSlug = trackSlug;
    localStorage.setItem('selectedTrack', trackSlug);
    
    const role = CAREERS.find(c => c.slug === activeTrack);
    if (role) {
        updateBodyTheme(role.theme);
        selectedTrackId = role.id;
        currentRole = role.title;
        localStorage.setItem('selectedTrackId', role.id);
        localStorage.setItem('selectedRole', role.title);
        
        // Fetch roadmap from backend if logged in
        if (authToken) {
            fetchRoadmap(role.id, currentUserLevel).then(data => {
                if (data && data.roadmap) {
                    TRACK_DATA[trackSlug].roadmap = data.roadmap.map(module => ({
                        title: module.title,
                        status: module.isCompleted ? 'completed' : (module.isUnlocked ? 'in-progress' : 'locked'),
                        desc: module.description
                    }));
                    
                    const completed = data.roadmap.filter(m => m.isCompleted).length;
                    const total = data.roadmap.length;
                    TRACK_DATA[trackSlug].stats.progress = Math.round((completed / total) * 100);
                    
                    if (window.location.hash.includes('dashboard')) {
                        renderDashboard();
                    }
                }
            });
        }
    }
}

// --- RENDERING FUNCTIONS ---
function renderCareers() {
    const grid = document.getElementById('career-grid');
    if (!grid) return;
    
    grid.innerHTML = CAREERS.map(c => `
        <article class="role-card" data-slug="${c.slug}" style="cursor: pointer;">
            <h3 class="role-name">${c.title}</h3>
            <p class="text-muted" style="font-size: 0.9rem; margin: 0.5rem 0;">${c.description}</p>
            <div class="role-meta">
                <span>${c.time}</span>
                <span class="${c.level === 'Hard' || c.level === 'Expert' ? 'text-danger' : 'text-success'}">${c.level}</span>
            </div>
        </article>
    `).join('');
    
    document.querySelectorAll('.role-card').forEach(card => {
        card.addEventListener('click', function() {
            const slug = this.dataset.slug;
            selectCareer(slug);
        });
    });
}

function renderDashboard() {
    const data = TRACK_DATA[activeTrack];
    const roleInfo = CAREERS.find(c => c.slug === activeTrack);
    
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

    const container = document.getElementById('roadmap-container');
    if (container) {
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
    
    // Update level button states
    const activeLevelBtn = document.querySelector(`.level-btn[data-level="${currentUserLevel}"]`);
    if (activeLevelBtn) {
        document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
        activeLevelBtn.classList.add('active');
    }
}

function renderProjects() {
    const data = TRACK_DATA[activeTrack];
    const list = document.getElementById('projects-list');
    
    if (!list) return;

    list.innerHTML = data.projects.map(p => `
        <article class="project-card" onclick="openProjectModal(${p.id})">
            <div>
                <h3>${p.title}</h3>
                <p class="text-muted" style="font-size:0.9rem">${p.desc}</p>
            </div>
            <div class="badge ${p.status.toLowerCase() === 'completed' ? 'completed' : 'pending'}">
                ${p.status}
            </div>
        </article>
    `).join('');
}

function renderPractice() {
    const data = TRACK_DATA[activeTrack];
    const dsaList = document.getElementById('dsa-list');
    const designList = document.getElementById('sys-design-list');

    if (dsaList) { 
        dsaList.innerHTML = data.tasks.dsa.map(t => taskHtml(t)).join('');
    }
    if (designList) {
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

function renderProfile() {
    // Get user data from localStorage or use defaults
    const userName = userData.full_name || userData.fullName || 'User Name';
    const userEmail = userData.email || 'Not set';
    const userInstitution = userData.institution_name || userData.institutionName || 'Not set';
    const userGoogle = userData.googleEmail || 'Not linked';
    
    // Update profile display
    if (document.getElementById('profile-name')) {
        document.getElementById('profile-name').innerText = userName;
    }
    if (document.getElementById('profile-role')) {
        document.getElementById('profile-role').innerText = currentRole || 'Aspiring Developer';
    }
    if (document.getElementById('profile-avatar')) {
        const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        document.getElementById('profile-avatar').innerText = initials;
    }
    
    // Update details
    if (document.getElementById('detail-name')) {
        document.getElementById('detail-name').innerText = userName;
    }
    if (document.getElementById('detail-email')) {
        document.getElementById('detail-email').innerText = userEmail;
    }
    if (document.getElementById('detail-institution')) {
        document.getElementById('detail-institution').innerText = userInstitution;
    }
    if (document.getElementById('detail-google')) {
        document.getElementById('detail-google').innerText = userGoogle;
    }
    if (document.getElementById('detail-track')) {
        document.getElementById('detail-track').innerText = currentRole || 'Not selected';
    }
    if (document.getElementById('detail-level')) {
        const levelText = currentUserLevel ? currentUserLevel.charAt(0).toUpperCase() + currentUserLevel.slice(1) : 'Not set';
        document.getElementById('detail-level').innerText = levelText;
    }
    if (document.getElementById('detail-commitment')) {
        document.getElementById('detail-commitment').innerText = currentCommitment ? `${currentCommitment} hours/day` : 'Not set';
    }
    
    // Update stats
    const trackData = activeTrack ? TRACK_DATA[activeTrack] : null;
    if (trackData) {
        const completedModules = trackData.roadmap.filter(m => m.status === 'completed').length;
        const completedProjects = trackData.projects.filter(p => p.status.toLowerCase() === 'completed').length;
        
        if (document.getElementById('stat-modules')) {
            document.getElementById('stat-modules').innerText = completedModules;
        }
        if (document.getElementById('stat-projects')) {
            document.getElementById('stat-projects').innerText = completedProjects;
        }
        if (document.getElementById('stat-readiness')) {
            document.getElementById('stat-readiness').innerText = `${trackData.stats.readiness}%`;
        }
    }
}

// --- INTERACTION HANDLERS ---
let currentStep = 1;

function selectCareer(careerSlug) {
    if (!careerSlug || typeof careerSlug !== 'string') {
        console.error('Invalid career selection:', careerSlug);
        showFeedback('Please select a valid career path', 'error');
        return;
    }
    
    const career = CAREERS.find(c => c.slug === careerSlug);
    if (!career) {
        console.error('Career not found:', careerSlug);
        showFeedback('Career path not found', 'error');
        return;
    }
    
    currentRole = career.title;
    selectedTrackId = career.id;
    selectedTrackSlug = career.slug;
    
    localStorage.setItem('selectedTrack', career.slug);
    localStorage.setItem('selectedTrackId', career.id);
    localStorage.setItem('selectedRole', career.title);
    
    setActiveTrack(careerSlug);

    const roleInput = document.getElementById('target-role-input');
    if (roleInput) {
        roleInput.value = currentRole;
    }
    
    navigateTo('onboarding-page');
    
    currentStep = 1;
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
    document.getElementById(`prog-step-${step}`).classList.add('active');
    currentStep = step;
}

function prevStep(step) {
    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    document.getElementById(`step-${step}`).classList.remove('hidden');
    document.getElementById(`prog-step-${currentStep}`).classList.remove('active');
    currentStep = step;
}

function finishOnboarding() {
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
        setTimeout(() => navigateTo('careers-list-page'), 2000);
        return;
    }
    
    currentUserLevel = levelRadio.value;
    currentCommitment = commitmentSlider.value;
    
    localStorage.setItem('userLevel', currentUserLevel);
    localStorage.setItem('userCommitment', currentCommitment);
    localStorage.setItem('onboardingComplete', 'true');
    
    if (!authToken) {
        // User hasn't logged in — save onboarding state and prompt login
        localStorage.setItem('postLoginPage', 'dashboard-page');
        showFeedback('Please log in to continue setting up your roadmap.', 'warning');
        setTimeout(() => navigateTo('auth-page'), 1500);
        return;
    } else {
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

/**
 * Switch level without page reload
 */
function switchLevel(level) {
    if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
        console.error('Invalid level:', level);
        return;
    }
    
    currentUserLevel = level;
    localStorage.setItem('userLevel', level);
    
    // Use enhanced flow if available
    if (typeof window.enhancedFlows !== 'undefined') {
        window.enhancedFlows.switchLevel(level);
    } else {
        // Legacy implementation
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.level === level) {
                btn.classList.add('active');
            }
        });
        
        if (authToken && selectedTrackId) {
            fetchRoadmap(selectedTrackId, level).then(data => {
                if (data && data.roadmap) {
                    TRACK_DATA[activeTrack].roadmap = data.roadmap.map(module => ({
                        title: module.title,
                        status: module.isCompleted ? 'completed' : (module.isUnlocked ? 'in-progress' : 'locked'),
                        desc: module.description
                    }));
                    
                    const completed = data.roadmap.filter(m => m.isCompleted).length;
                    const total = data.roadmap.length;
                    TRACK_DATA[activeTrack].stats.progress = Math.round((completed / total) * 100);
                    
                    renderDashboard();
                }
            });
        }
    }
}

// Course Selection Handler
function submitCourseSelection() {
    const interest = document.querySelector('input[name="interest"]:checked');
    const experience = document.querySelector('input[name="experience"]:checked');
    
    if (!interest || !experience) {
        showFeedback('Please answer all questions', 'error');
        return;
    }
    
    // Simple recommendation logic
    let recommended = [];
    
    if (interest.value === 'backend') {
        recommended.push(CAREERS.find(c => c.slug === 'java'));
    } else if (interest.value === 'fullstack') {
        recommended.push(CAREERS.find(c => c.slug === 'python'));
        recommended.push(CAREERS.find(c => c.slug === 'javascript'));
    } else if (interest.value === 'systems') {
        recommended.push(CAREERS.find(c => c.slug === 'cpp'));
    } else if (interest.value === 'cloud') {
        recommended.push(CAREERS.find(c => c.slug === 'cloud'));
    }
    
    // Filter based on experience
    if (experience.value === 'none') {
        recommended = recommended.filter(c => c.level !== 'Expert');
    } else if (experience.value === 'intermediate') {
        recommended = recommended.filter(c => c.level !== 'Hard' && c.level !== 'Expert');
    }
    
    // Display recommendations
    const recommendedDiv = document.getElementById('recommended-careers');
    const recommendationsList = document.getElementById('recommendations-list');
    
    if (recommendedDiv && recommendationsList) {
        recommendationsList.innerHTML = recommended.map(c => `
            <article class="role-card" data-slug="${c.slug}" style="cursor: pointer; margin-bottom: 1rem;">
                <h3 class="role-name">${c.title}</h3>
                <p class="text-muted" style="font-size: 0.9rem; margin: 0.5rem 0;">${c.description}</p>
                <div class="role-meta">
                    <span>${c.time}</span>
                    <span class="${c.level === 'Hard' || c.level === 'Expert' ? 'text-danger' : 'text-success'}">${c.level}</span>
                </div>
            </article>
        `).join('');
        
        recommendedDiv.style.display = 'block';
        
        // Add click handlers
        document.querySelectorAll('#recommendations-list .role-card').forEach(card => {
            card.addEventListener('click', function() {
                const slug = this.dataset.slug;
                selectCareer(slug);
            });
        });
    }
}

function editProfile() {
    showFeedback('Profile editing coming soon!', 'info');
}

// Modal Functions
const modal = document.getElementById('project-detail-modal');
const closeBtn = document.getElementById('close-project-modal');

function openProjectModal(id) {
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

// Feedback System
function showFeedback(message, type = 'info') {
    const existing = document.querySelector('.feedback-toast');
    if (existing) existing.remove();
    
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
    
    const colors = {
        success: 'background: #10b981; color: white;',
        error: 'background: #ef4444; color: white;',
        warning: 'background: #f59e0b; color: white;',
        info: 'background: #3b82f6; color: white;'
    };
    toast.style.cssText += colors[type] || colors.info;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized');
    console.log('Stored state:', { selectedTrackSlug, currentUserLevel, currentCommitment, authToken: !!authToken });
    
    // Restore state from localStorage
    if (selectedTrackSlug && TRACK_DATA[selectedTrackSlug]) {
        activeTrack = selectedTrackSlug;
        setActiveTrack(selectedTrackSlug);
    }
    
    // Handle URL routing
    window.addEventListener('hashchange', handleURLChange);
    
    // Initial route
    if (window.location.hash) {
        handleURLChange();
    } else {
        // Default to landing page
        navigateTo('landing-page');
    }
    
    // Attach event listeners to all CTAs
    document.querySelectorAll('[data-action="nav-careers-list"]').forEach(btn => {
        btn.addEventListener('click', () => navigateTo('careers-list-page'));
    });
    
    document.querySelectorAll('[data-action="nav-course-selection"]').forEach(btn => {
        btn.addEventListener('click', () => navigateTo('course-selection-page'));
    });
    
    document.querySelectorAll('[data-action="start-roadmap"]').forEach(btn => {
        btn.addEventListener('click', startRoadmap);
    });
    
    // Make all logos clickable to profile
    const logoElements = ['landing-logo', 'careers-logo', 'course-selection-logo', 'onboarding-logo', 'sidebar-logo'];
    logoElements.forEach(logoId => {
        const logo = document.getElementById(logoId);
        if (logo) {
            logo.addEventListener('click', () => {
                if (authToken || localStorage.getItem('onboardingComplete') === 'true') {
                    navigateTo('profile-page');
                } else {
                    showFeedback('Please complete onboarding to view your profile', 'info');
                }
            });
        }
    });
    
    // Sidebar navigation
    document.querySelectorAll('.nav-item[data-target]').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPage = btn.dataset.target;
            
            if (targetPage === 'dashboard-page' && !selectedTrackSlug) {
                showFeedback('Please complete career selection first', 'warning');
                navigateTo('careers-list-page');
                return;
            }
            
            navigateTo(targetPage);
        });
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            authToken = null;
            currentUserLevel = 'beginner';
            currentCommitment = null;
            selectedTrackSlug = null;
            selectedTrackId = null;
            currentRole = null;
            activeTrack = 'java';
            userData = {};
            navigateTo('landing-page');
            showFeedback('Logged out successfully', 'success');
        });
    }
    
    // Time slider
    const slider = document.getElementById('time-slider');
    if (slider) {
        slider.oninput = function() {
            const hoursVal = document.getElementById('hours-val');
            if (hoursVal) hoursVal.innerText = this.value;
        }
    }
    
    // Level tab listeners
    document.querySelectorAll('.level-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const level = tab.dataset.level;
            switchLevel(level);
        });
    });
    
    // Fix Roadmap button in Skill Gap Analyzer
    const fixRoadmapBtn = document.getElementById('fix-roadmap-btn');
    if (fixRoadmapBtn) {
        fixRoadmapBtn.addEventListener('click', () => {
            if (typeof window.enhancedFlows !== 'undefined') {
                window.enhancedFlows.fixRoadmap();
            } else {
                showFeedback('Roadmap adjustment feature coming soon!', 'info');
            }
        });
    }
    
    // Close problem modal
    const closeProblemModal = document.getElementById('close-problem-modal');
    if (closeProblemModal) {
        closeProblemModal.addEventListener('click', () => {
            document.getElementById('problem-modal').classList.add('hidden');
        });
    }
});
