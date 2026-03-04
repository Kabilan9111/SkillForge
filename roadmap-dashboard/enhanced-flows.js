// ============================================
// SKILLFORGE - ENHANCED LEARNING FLOWS
// Dashboard, Practice Arena, Skill Gap Analyzer
// ============================================

// --- DSA TOPICS CONFIGURATION ---
const DSA_TOPICS = {
    'Arrays': {
        icon: 'fa-th',
        description: 'Array manipulation and algorithms',
        problems: []
    },
    'Strings': {
        icon: 'fa-font',
        description: 'String processing and pattern matching',
        problems: []
    },
    'Stack': {
        icon: 'fa-layer-group',
        description: 'LIFO data structure problems',
        problems: []
    },
    'Queue': {
        icon: 'fa-stream',
        description: 'FIFO data structure problems',
        problems: []
    },
    'Linked List': {
        icon: 'fa-link',
        description: 'Linked list operations and traversal',
        problems: []
    },
    'Trees': {
        icon: 'fa-tree',
        description: 'Binary trees, BST, tree traversal',
        problems: []
    },
    'Tries': {
        icon: 'fa-project-diagram',
        description: 'Prefix trees and autocomplete',
        problems: []
    },
    'HashMaps': {
        icon: 'fa-hashtag',
        description: 'Hash tables and mapping problems',
        problems: []
    },
    'Searching': {
        icon: 'fa-search',
        description: 'Binary search and search algorithms',
        problems: []
    },
    'Sorting': {
        icon: 'fa-sort-amount-down',
        description: 'Sorting algorithms and applications',
        problems: []
    },
    'Recursion': {
        icon: 'fa-redo',
        description: 'Recursive problem solving',
        problems: []
    },
    'Greedy': {
        icon: 'fa-hand-holding-usd',
        description: 'Greedy algorithms and optimization',
        problems: []
    },
    'Dynamic Programming': {
        icon: 'fa-chart-line',
        description: 'DP patterns and memoization',
        problems: []
    },
    'Graphs': {
        icon: 'fa-sitemap',
        description: 'Graph traversal, DFS, BFS, shortest path',
        problems: []
    }
};

// --- SKILL REQUIREMENTS BY TRACK AND LEVEL ---
const SKILL_REQUIREMENTS = {
    java: {
        beginner: [
            'Java Core', 'OOP Basics', 'Collections', 'Exception Handling', 'File I/O',
            'Basic SQL', 'JDBC', 'Maven/Gradle', 'Git'
        ],
        intermediate: [
            'Java Core', 'OOP Advanced', 'Collections & Streams', 'Multithreading',
            'JDBC', 'Spring Core', 'Spring Boot', 'REST APIs', 'JPA/Hibernate',
            'SQL Advanced', 'Unit Testing', 'Maven', 'Git', 'Linux Basics'
        ],
        advanced: [
            'Java Core', 'Design Patterns', 'Multithreading', 'JVM Internals',
            'Spring Boot', 'Spring Security', 'Microservices', 'REST APIs',
            'JPA/Hibernate', 'Docker', 'Kubernetes', 'Redis', 'Kafka',
            'System Design', 'Cloud (AWS/Azure)', 'CI/CD'
        ]
    },
    python: {
        beginner: [
            'Python Basics', 'Data Types', 'Functions', 'OOP Basics', 'File Handling',
            'Basic SQL', 'pip', 'Git'
        ],
        intermediate: [
            'Python Advanced', 'Decorators', 'Generators', 'OOP Advanced',
            'Flask/FastAPI', 'REST APIs', 'SQLAlchemy', 'PostgreSQL',
            'Unit Testing', 'Virtual Environments', 'Git', 'Linux'
        ],
        advanced: [
            'Python Expert', 'Async/Await', 'Metaclasses', 'FastAPI', 'Django',
            'Microservices', 'Docker', 'Kubernetes', 'Redis', 'Celery',
            'PostgreSQL Advanced', 'System Design', 'Cloud', 'CI/CD'
        ]
    },
    cpp: {
        beginner: [
            'C++ Basics', 'Pointers', 'References', 'OOP Basics', 'STL Basics',
            'Memory Management', 'File I/O', 'Make/CMake', 'Git'
        ],
        intermediate: [
            'C++ Advanced', 'Smart Pointers', 'STL Advanced', 'Templates',
            'Multithreading', 'Network Programming', 'Data Structures',
            'Algorithms', 'Debugging Tools', 'Make/CMake', 'Git'
        ],
        advanced: [
            'C++ Expert', 'Memory Management', 'Lock-Free Programming',
            'Performance Optimization', 'System Programming', 'Network Programming',
            'Compiler Internals', 'OS Concepts', 'Real-time Systems',
            'Profiling', 'Linux Kernel', 'Assembly'
        ]
    },
    cloud: {
        beginner: [
            'AWS Basics', 'EC2', 'S3', 'RDS', 'IAM', 'Linux Basics',
            'Networking Basics', 'Git'
        ],
        intermediate: [
            'AWS Services', 'Docker', 'Kubernetes Basics', 'CI/CD',
            'Jenkins/GitHub Actions', 'Terraform', 'Shell Scripting',
            'Networking', 'Security', 'Monitoring'
        ],
        advanced: [
            'AWS Advanced', 'Kubernetes Advanced', 'Service Mesh', 'Istio',
            'Infrastructure as Code', 'Terraform Advanced', 'Ansible',
            'Prometheus', 'Grafana', 'ELK Stack', 'Multi-cloud', 'Cost Optimization'
        ]
    },
    javascript: {
        beginner: [
            'JavaScript Basics', 'ES6+', 'DOM Manipulation', 'Events',
            'Async/Await', 'Promises', 'HTML/CSS', 'Git'
        ],
        intermediate: [
            'JavaScript Advanced', 'React', 'Node.js', 'Express', 'REST APIs',
            'MongoDB', 'State Management', 'Testing', 'Webpack', 'npm/yarn'
        ],
        advanced: [
            'React Advanced', 'Next.js', 'TypeScript', 'Node.js Advanced',
            'Microservices', 'GraphQL', 'WebSockets', 'Redis', 'Docker',
            'Testing Advanced', 'Performance Optimization', 'Security'
        ]
    }
};

// --- LEVEL-BASED CURRICULUM ---
// This will be populated from backend or used as fallback
let CURRICULUM_DATA = {};

// --- PRACTICE PROGRESS ---
let practiceProgress = JSON.parse(localStorage.getItem('practiceProgress') || '{}');

// --- RESUME DATA ---
let uploadedResume = null;
let skillGapAnalysis = null;

// ============================================
// ENHANCED DASHBOARD FUNCTIONS
// ============================================

/**
 * Render Dashboard with level-aware modules
 */
function renderDashboard() {
    const data = TRACK_DATA[activeTrack];
    const roleInfo = CAREERS.find(c => c.slug === activeTrack);

    // Update header
    if (document.getElementById('dash-role-title')) {
        document.getElementById('dash-role-title').innerText = roleInfo ? roleInfo.title : "Track Not Selected";
    }

    // Update readiness score
    const readinessScore = document.getElementById('dash-readiness-score');
    const readinessFill = document.getElementById('dash-readiness-fill');
    if (readinessScore && readinessFill) {
        readinessScore.innerText = `${data.stats.readiness}/100`;
        readinessFill.style.width = `${data.stats.readiness}%`;
    }

    // Update level tabs
    updateLevelTabs(currentUserLevel);

    // Fetch and render modules for current level
    fetchAndRenderModules(activeTrack, currentUserLevel);
}

/**
 * Update level tabs active state
 */
function updateLevelTabs(level) {
    document.querySelectorAll('.level-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.level === level) {
            tab.classList.add('active');
        }
    });
}

/**
 * Fetch and render modules for specific track and level
 */
async function fetchAndRenderModules(trackSlug, level) {
    const loadingEl = document.getElementById('modules-loading');
    const containerEl = document.getElementById('roadmap-container');

    if (!loadingEl || !containerEl) return;

    // Show loading
    loadingEl.style.display = 'block';
    containerEl.innerHTML = '';

    try {
        let modules = [];

        // Try to fetch from backend first
        if (authToken && selectedTrackId) {
            const response = await fetch(`${API_BASE_URL}/roadmap/${selectedTrackId}?level=${level}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.ok) {
                const data = await response.json();
                modules = data.roadmap || [];

                // Convert backend format
                modules = modules.map(m => ({
                    title: m.title,
                    desc: m.description || '',
                    status: m.isCompleted ? 'completed' : (m.isUnlocked ? 'in-progress' : 'locked')
                }));
            } else if (response.status === 401) {
                // Token expired â€” clear it so handleTokenExpiry in app.js can re-auth on next call
                console.warn('[Auth] 401 in fetchAndRenderModules - token expired, using mock data');
                authToken = null;
                localStorage.removeItem('authToken');
                // Fall through to mock data below
            }
        }

        // Fallback to mock data
        if (modules.length === 0 && TRACK_DATA[trackSlug]) {
            modules = TRACK_DATA[trackSlug].roadmap;
        }

        // Update level info
        const completedCount = modules.filter(m => m.status === 'completed').length;
        const totalCount = modules.length;
        const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        if (document.getElementById('level-module-count')) {
            document.getElementById('level-module-count').innerText = `${totalCount} modules`;
        }
        if (document.getElementById('level-completion-count')) {
            document.getElementById('level-completion-count').innerText = `${completedCount} completed`;
        }
        if (document.getElementById('dash-progress-text')) {
            document.getElementById('dash-progress-text').innerText = `${progressPercent}%`;
        }
        if (document.getElementById('dash-progress-bar')) {
            document.getElementById('dash-progress-bar').style.width = `${progressPercent}%`;
        }

        // Render modules
        containerEl.innerHTML = modules.map(module => `
            <article class="node ${module.status}">
                <header class="node-header">
                    <span class="node-title">${module.title}</span>
                    <span class="node-status">${module.status.toUpperCase()}</span>
                </header>
                <p class="node-desc">${module.desc}</p>
            </article>
        `).join('');

    } catch (error) {
        console.error('Error fetching modules:', error);
        showFeedback('Failed to load modules. Using cached data.', 'warning');

        // Fallback rendering
        if (TRACK_DATA[trackSlug]) {
            const modules = TRACK_DATA[trackSlug].roadmap;
            containerEl.innerHTML = modules.map(module => `
                <article class="node ${module.status}">
                    <header class="node-header">
                        <span class="node-title">${module.title}</span>
                        <span class="node-status">${module.status.toUpperCase()}</span>
                    </header>
                    <p class="node-desc">${module.desc}</p>
                </article>
            `).join('');
        }
    } finally {
        loadingEl.style.display = 'none';
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

    updateLevelTabs(level);
    fetchAndRenderModules(activeTrack, level);

    showFeedback(`Switched to ${level.charAt(0).toUpperCase() + level.slice(1)} level`, 'info');
}

// ============================================
// PRACTICE ARENA FUNCTIONS
// ============================================

/**
 * Render Practice Arena with DSA topics
 */
async function renderPractice() {
    console.log('[Practice] renderPractice() called');

    const loadingEl = document.getElementById('practice-loading');
    const gridEl = document.getElementById('dsa-topics-grid');

    console.log('[Practice] Elements found:', {
        loadingEl: !!loadingEl,
        gridEl: !!gridEl,
        gridVisible: gridEl && window.getComputedStyle(gridEl).display !== 'none'
    });

    if (!loadingEl || !gridEl) {
        console.error('[Practice] Required elements not found!');
        return;
    }

    // Show loading
    loadingEl.style.display = 'block';
    gridEl.innerHTML = '';

    try {
        // Fetch problems from backend or use mock data
        await fetchPracticeProblems();

        console.log('[Practice] DSA_TOPICS:', Object.keys(DSA_TOPICS).length, 'topics');

        // Render topics
        gridEl.innerHTML = Object.entries(DSA_TOPICS).map(([topicName, topicData]) => {
            const problems = topicData.problems || [];
            const solvedCount = problems.filter(p => p.status === 'solved').length;
            const unlockedCount = problems.filter(p => p.status !== 'locked').length;

            return `
                <div class="dsa-topic-card" data-topic="${topicName}">
                    <div class="topic-header">
                        <div class="topic-title">
                            <i class="fas ${topicData.icon} topic-icon"></i>
                            <span>${topicName}</span>
                        </div>
                        <div class="topic-progress">
                            <span>${solvedCount}/${unlockedCount}</span>
                            <i class="fas fa-chevron-down topic-expand-icon"></i>
                        </div>
                    </div>
                    <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 0.5rem;">${topicData.description}</p>
                    <div class="problems-list">
                        ${problems.length > 0 ? renderProblems(problems) : '<p class="text-muted" style="text-align: center;">No problems available</p>'}
                    </div>
                </div>
            `;
        }).join('');

        console.log('[Practice] Rendered', Object.keys(DSA_TOPICS).length, 'topic cards');

        // Update stats
        updatePracticeStats();

        // Attach event listeners
        attachPracticeEventListeners();

    } catch (error) {
        console.error('[Practice] Error rendering practice:', error);
        showFeedback('Failed to load practice problems', 'error');
    } finally {
        loadingEl.style.display = 'none';
    }
}

/**
 * Fetch practice problems from backend or use mock
 */
async function fetchPracticeProblems() {
    try {
        if (authToken && selectedTrackId) {
            const response = await fetch(`${API_BASE_URL}/practice/problems?trackId=${selectedTrackId}&level=${currentUserLevel}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.ok) {
                const data = await response.json();
                // Organize problems by topic
                organizeProblemsByTopic(data.problems || []);
                return;
            }
        }
    } catch (error) {
        console.error('Error fetching problems:', error);
    }

    // Use mock data
    generateMockProblems();
}

/**
 * Generate mock problems for testing
 */
function generateMockProblems() {
    const difficulties = ['easy', 'medium', 'hard'];
    const statuses = ['solved', 'unsolved', 'locked'];

    Object.keys(DSA_TOPICS).forEach(topicName => {
        const problemCount = Math.floor(Math.random() * 8) + 5; // 5-12 problems per topic
        const problems = [];

        for (let i = 0; i < problemCount; i++) {
            const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
            const status = i < 3 ? statuses[Math.floor(Math.random() * 2)] : statuses[Math.floor(Math.random() * 3)];

            problems.push({
                id: `${topicName.toLowerCase().replace(' ', '-')}-${i + 1}`,
                name: `${topicName} Problem ${i + 1}`,
                difficulty: difficulty,
                status: status,
                description: `Practice problem for ${topicName} focusing on ${difficulty} level concepts.`,
                examples: [`Example 1: Input/Output demonstration`],
                constraints: [`1 <= n <= 1000`]
            });
        }

        DSA_TOPICS[topicName].problems = problems;
    });
}

/**
 * Organize problems by topic from backend response
 */
function organizeProblemsByTopic(problems) {
    // Clear existing problems
    Object.keys(DSA_TOPICS).forEach(topic => {
        DSA_TOPICS[topic].problems = [];
    });

    // Organize
    problems.forEach(problem => {
        const topic = problem.topic || 'Arrays';
        if (DSA_TOPICS[topic]) {
            DSA_TOPICS[topic].problems.push(problem);
        }
    });
}

/**
 * Render problems list
 */
function renderProblems(problems) {
    return problems.map(problem => `
        <div class="problem-item ${problem.status}" data-problem-id="${problem.id}">
            <div class="problem-info">
                <span class="problem-name">${problem.name}</span>
                <span class="problem-difficulty ${problem.difficulty}">${problem.difficulty}</span>
            </div>
            <div class="problem-status">
                ${problem.status === 'solved' ? '<i class="fas fa-check-circle"></i>' :
            problem.status === 'locked' ? '<i class="fas fa-lock"></i>' :
                '<i class="far fa-circle"></i>'}
            </div>
        </div>
    `).join('');
}

/**
 * Update practice statistics
 */
function updatePracticeStats() {
    let totalSolved = 0;
    let totalUnlocked = 0;
    let totalProblems = 0;

    Object.values(DSA_TOPICS).forEach(topic => {
        const problems = topic.problems || [];
        totalProblems += problems.length;
        totalSolved += problems.filter(p => p.status === 'solved').length;
        totalUnlocked += problems.filter(p => p.status !== 'locked').length;
    });

    if (document.getElementById('practice-total-solved')) {
        document.getElementById('practice-total-solved').innerText = totalSolved;
    }
    if (document.getElementById('practice-total-unlocked')) {
        document.getElementById('practice-total-unlocked').innerText = totalUnlocked;
    }
    if (document.getElementById('practice-completion-rate')) {
        const rate = totalUnlocked > 0 ? Math.round((totalSolved / totalUnlocked) * 100) : 0;
        document.getElementById('practice-completion-rate').innerText = `${rate}%`;
    }
}

/**
 * Attach event listeners for practice arena
 */
function attachPracticeEventListeners() {
    // Topic card expansion
    document.querySelectorAll('.dsa-topic-card').forEach(card => {
        const header = card.querySelector('.topic-header');
        header.addEventListener('click', () => {
            card.classList.toggle('expanded');
        });
    });

    // Problem clicks
    document.querySelectorAll('.problem-item:not(.locked)').forEach(item => {
        item.addEventListener('click', () => {
            const problemId = item.dataset.problemId;
            openProblemModal(problemId);
        });
    });
}

/**
 * Open problem detail modal or coding arena
 */
function openProblemModal(problemId) {
    // Find problem
    let problem = null;
    for (const topic of Object.values(DSA_TOPICS)) {
        problem = topic.problems.find(p => p.id === problemId);
        if (problem) break;
    }

    if (!problem) return;

    // Try to open in full-screen coding arena
    if (window.CodingArena && typeof window.CodingArena.openProblem === 'function') {
        console.log('[Practice] Opening in coding arena:', problemId);
        window.CodingArena.openProblem(problemId);
        return;
    }

    // Fallback to modal if coding arena not available
    console.log('[Practice] Using fallback modal');

    // Populate modal
    document.getElementById('problem-title').innerText = problem.name;
    document.getElementById('problem-difficulty').innerHTML = `<span class="problem-difficulty ${problem.difficulty}">${problem.difficulty}</span>`;
    document.getElementById('problem-description').innerText = problem.description || 'No description available';
    document.getElementById('problem-examples').innerHTML = (problem.examples || []).map(ex => `<p>${ex}</p>`).join('');
    document.getElementById('problem-constraints').innerHTML = (problem.constraints || []).map(c => `<p>${c}</p>`).join('');

    // Show modal
    document.getElementById('problem-modal').classList.remove('hidden');

    // Attach action buttons
    document.getElementById('mark-solved-btn').onclick = () => {
        markProblemStatus(problemId, 'solved');
    };
    document.getElementById('mark-attempted-btn').onclick = () => {
        markProblemStatus(problemId, 'unsolved');
    };
}

/**
 * Mark problem status
 */
async function markProblemStatus(problemId, status) {
    // Update locally
    for (const topic of Object.values(DSA_TOPICS)) {
        const problem = topic.problems.find(p => p.id === problemId);
        if (problem) {
            problem.status = status;
            break;
        }
    }

    // Save to localStorage
    if (!practiceProgress[activeTrack]) {
        practiceProgress[activeTrack] = {};
    }
    practiceProgress[activeTrack][problemId] = status;
    localStorage.setItem('practiceProgress', JSON.stringify(practiceProgress));

    // Try to sync with backend
    if (authToken) {
        try {
            await fetch(`${API_BASE_URL}/practice/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    problemId,
                    status,
                    trackId: selectedTrackId
                })
            });
        } catch (error) {
            console.error('Error syncing progress:', error);
        }
    }

    // Close modal and refresh
    document.getElementById('problem-modal').classList.add('hidden');
    showFeedback(`Problem marked as ${status}`, 'success');
    renderPractice();
}

// ============================================
// SKILL GAP ANALYZER FUNCTIONS
// ============================================

/**
 * Initialize Skill Gap Analyzer
 */
function initializeSkillGapAnalyzer() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('resume-input');
    const browseBtn = document.getElementById('browse-btn');
    const removeBtn = document.getElementById('remove-file-btn');
    const analyzeBtn = document.getElementById('analyze-resume-btn');

    if (!dropZone || !fileInput) return;

    // Browse button
    if (browseBtn) {
        browseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });
    }

    // Drop zone click
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    });

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileUpload(file);
        }
    });

    // Remove file
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            removeUploadedFile();
        });
    }

    // Analyze resume
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
            analyzeResume();
        });
    }
}

/**
 * Handle file upload
 */
function handleFileUpload(file) {
    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        showFeedback('Invalid file type. Please upload PDF or DOC files.', 'error');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showFeedback('File size exceeds 5MB limit', 'error');
        return;
    }

    // Store file
    uploadedResume = file;

    // Update UI
    document.getElementById('drop-zone').style.display = 'none';
    document.getElementById('uploaded-file').style.display = 'flex';
    document.getElementById('file-name').innerText = file.name;
    document.getElementById('file-size').innerText = formatFileSize(file.size);

    // Hide results if any
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.style.display = 'none';
    }

    showFeedback('Resume uploaded successfully', 'success');
}

/**
 * Remove uploaded file
 */
function removeUploadedFile() {
    uploadedResume = null;
    skillGapAnalysis = null;

    document.getElementById('drop-zone').style.display = 'block';
    document.getElementById('uploaded-file').style.display = 'none';
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('resume-input').value = '';

    showFeedback('Resume removed', 'info');
}

/**
 * Analyze resume using Elite Six-Stage Intelligence Pipeline
 */
async function analyzeResume() {
    if (!uploadedResume) {
        showFeedback('Please upload a resume first', 'error');
        return;
    }

    if (!selectedTrackSlug) {
        showFeedback('Please select a career track first', 'error');
        return;
    }

    // Show loading with AI pipeline visualization
    document.getElementById('uploaded-file').style.display = 'none';
    const loadingSection = document.getElementById('analysis-loading');
    loadingSection.style.display = 'block';

    // Start AI layer animation
    startAIPipelineAnimation();

    try {
        // Create FormData
        const formData = new FormData();
        formData.append('resume', uploadedResume);
        formData.append('trackId', selectedTrackId);
        formData.append('level', currentUserLevel);
        formData.append('trackName', getTrackDisplayName(selectedTrackSlug));

        console.log('ðŸš€ Starting Enterprise AI Analysis...');
        console.log('ðŸŽ¯ Using 6-Layer Multi-AI Pipeline');

        // Get authentication token
        const authToken = AuthHelper.getToken();

        if (!authToken) {
            console.warn('âš ï¸ No authentication token - attempting unauthenticated request');
            // Show warning but continue (for development/testing)
            showFeedback('Warning: No authentication token found', 'warning');
        }

        // Animate layers sequentially
        const startTime = Date.now();
        animateLayer(1, 'processing'); // Document AI

        // Call backend API with enterprise AI engine
        const headers = {};
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(`${API_BASE_URL}/skill-gap/analyze`, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
            const errorData = await response.json().catch(() => ({}));
            console.error('âŒ Authentication Error (401):', errorData);

            // Show all layers as error
            for (let i = 1; i <= 6; i++) {
                animateLayer(i, 'error');
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            // Handle the auth error properly
            const message = errorData.error || 'Authentication required. Please log in.';
            showFeedback(message, 'error');

            // If AuthHelper is available, use it to redirect to login
            if (typeof AuthHelper !== 'undefined') {
                AuthHelper.removeToken();
                setTimeout(() => {
                    // Redirect to login page (adjust path as needed)
                    // window.location.href = '/login.html';
                    console.log('ðŸ‘‰ Redirect to login would happen here');
                }, 2000);
            }

            throw new Error(message);
        }

        if (response.ok) {
            const data = await response.json();
            console.log('âœ… Enterprise Analysis Complete:', data);

            // Animate remaining layers based on actual processing
            await animateAllLayers(data.analysis.aiLayersUsed || {});

            // Update processing stats
            const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
            document.getElementById('processing-time').textContent = `Elapsed: ${elapsedTime}s`;
            document.getElementById('processing-cost').textContent = `Cost: ${data.analysis.processingCost || '$0.00'}`;

            // Wait a moment to show completed state
            await new Promise(resolve => setTimeout(resolve, 1500));

            // âœ… Check if 6-Layer Intelligence data exists (NEW API response format)
            if (data.advancedMetrics && data.intelligence && data.visualizations) {
                // FORCE: Enterprise V2 Skill Gap Layout (ignore Quantum Dashboard for this view)
                console.log('⚡ Using Enterprise V2 Skill Gap Layout');
                
                // Hide loading, show results container
                const resultsSection = document.getElementById('results-section');
                if (resultsSection) resultsSection.style.display = 'block';

                // Transform data for the V2 renderer
                const transformedAnalysis = transformEnterpriseAnalysis(data.analysis || data);
                skillGapAnalysis = transformedAnalysis;
                
                // Explicitly call the V2 renderer
                renderSkillGapResults(transformedAnalysis);

                showFeedback(`âœ… AI Intelligence Analysis Complete`, 'success');
            } else {
                // Fallback to legacy UI rendering
                console.log('ðŸ“Š Using legacy analysis format');
                const transformedAnalysis = transformEnterpriseAnalysis(data.analysis);
                skillGapAnalysis = transformedAnalysis;
                renderSkillGapResults(transformedAnalysis);
                const totalSkills = data.metadata?.totalSkills || transformedAnalysis.detectedSkills?.length || 0;
                showFeedback(`Analysis complete - ${totalSkills} skills analyzed`, 'success');
            }
        } else {
            // Handle other HTTP errors
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || `Server error: ${response.status}`;
            throw new Error(errorMessage);
        }

    } catch (error) {
        console.error('âŒ Error analyzing resume:', error);

        // Show error on all layers
        for (let i = 1; i <= 6; i++) {
            animateLayer(i, 'error');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Fallback to mock analysis
        showFeedback('AI analysis unavailable - using fallback system', 'warning');
        const mockAnalysis = generateEnhancedMockAnalysis();
        skillGapAnalysis = mockAnalysis;
        renderSkillGapResults(mockAnalysis);
    } finally {
        loadingSection.style.display = 'none';
    }
}

/**
 * Start AI Pipeline Animation
 */
function startAIPipelineAnimation() {
    // Reset all layers to pending
    for (let i = 1; i <= 6; i++) {
        const layer = document.getElementById(`layer-${i}-status`);
        if (layer) {
            layer.className = 'pipeline-layer';
            const status = layer.querySelector('.layer-status');
            status.className = 'layer-status pending';
            status.innerHTML = '<i class="fas fa-circle"></i> Pending';
        }
    }

    // Reset processing stats
    document.getElementById('processing-time').textContent = 'Elapsed: 0s';
    document.getElementById('processing-cost').textContent = 'Est. Cost: $0.00';

    // Start time counter
    const startTime = Date.now();
    const timeInterval = setInterval(() => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        document.getElementById('processing-time').textContent = `Elapsed: ${elapsed}s`;
    }, 100);

    // Store for cleanup
    window.aiPipelineTimeInterval = timeInterval;
}

/**
 * Animate specific AI layer
 */
function animateLayer(layerNum, state) {
    const layer = document.getElementById(`layer-${layerNum}-status`);
    if (!layer) return;

    const statusDiv = layer.querySelector('.layer-status');

    layer.className = 'pipeline-layer';
    statusDiv.className = 'layer-status';

    switch (state) {
        case 'processing':
            layer.classList.add('processing');
            statusDiv.classList.add('processing');
            statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            break;
        case 'success':
            layer.classList.add('success');
            statusDiv.classList.add('success');
            statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> Complete';
            break;
        case 'error':
            layer.classList.add('error');
            statusDiv.classList.add('error');
            statusDiv.innerHTML = '<i class="fas fa-times-circle"></i> Failed';
            break;
        default:
            statusDiv.classList.add('pending');
            statusDiv.innerHTML = '<i class="fas fa-circle"></i> Pending';
    }
}

/**
 * Animate all layers sequentially
 */
async function animateAllLayers(aiLayersUsed) {
    const delays = [800, 1200, 1500, 1000, 600, 1000]; // Realistic timings

    for (let i = 1; i <= 6; i++) {
        animateLayer(i, 'processing');

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, delays[i - 1]));

        // Check if layer succeeded (from backend response)
        const layerKey = `layer${i}`;
        const layerSuccess = !aiLayersUsed[layerKey] || aiLayersUsed[layerKey].status === 'success';

        animateLayer(i, layerSuccess ? 'success' : 'error');

        // Update estimated cost
        const costPerLayer = [0.015, 0.002, 0.040, 0.010, 0.000, 0.020];
        const cumulativeCost = costPerLayer.slice(0, i).reduce((a, b) => a + b, 0);
        document.getElementById('processing-cost').textContent = `Est. Cost: $${cumulativeCost.toFixed(3)}`;
    }

    // Clear time interval
    if (window.aiPipelineTimeInterval) {
        clearInterval(window.aiPipelineTimeInterval);
    }
}

/**
 * Transform enterprise engine response to UI-compatible format
 */
function transformEnterpriseAnalysis(analysis) {
    // Enterprise system returns different structure
    const strongSkills = analysis.strongSkills || analysis.strong || [];
    const weakSkills = analysis.weakSkills || analysis.weak || [];
    const missingSkills = analysis.missingSkills || analysis.missing || [];
    const aiAnalyzed = analysis.aiAnalyzedSkills || [];

    // Transform to expected format with enterprise AI data
    const transformed = {
        detectedSkills: [...strongSkills.map(s => s.skill || s), ...weakSkills.map(s => s.skill || s)],
        requiredSkills: [...strongSkills, ...weakSkills, ...missingSkills].map(s => s.skill || s),
        // Keep as rich objects for the new renderAISkillCards
        strongSkills: strongSkills,
        weakSkills: weakSkills,
        missingSkills: missingSkills,
        overallScore: analysis.overallScore || analysis.coverageScore?.overall || 0,

        // Enterprise AI insights
        aiLayersUsed: analysis.aiLayersUsed || {},
        processingCost: analysis.processingCost || '$0.00',
        processingTime: analysis.processingTime || '0s',
        overallQuality: analysis.overallQuality || 'high',

        // Enhanced AI analyzed skills with enterprise reasoning
        aiAnalyzedSkills: aiAnalyzed.length > 0 ? aiAnalyzed : generateAIAnalysisFromElite(strongSkills, weakSkills, missingSkills),

        // Market intelligence (new from 6-layer engine)
        bestRoleMatch: analysis.bestRoleMatch || {},
        topRoleMatches: analysis.topRoleMatches || [],
        marketInsights: analysis.marketInsights || {},
        compensationEstimate: analysis.compensationEstimate || {},
        keyInsights: analysis.keyInsights || [],
        recommendations: analysis.recommendations || [],

        // Coverage score
        coverageScore: analysis.coverageScore || {
            overall: analysis.overallScore || 0,
            strong: strongSkills.length,
            needsImprovement: weakSkills.length,
            notDemonstrated: missingSkills.length,
            critical: analysis.coverageScore?.critical || 0,
            readinessLevel: analysis.coverageScore?.readinessLevel || 'Building Foundations',
            estimatedTimeToReady: analysis.coverageScore?.estimatedTimeToReady || 12,
            nextMilestone: analysis.coverageScore?.nextMilestone || 'Continue building skills'
        },

        // Audit trail for transparency
        auditTrail: analysis.auditTrail || {},

        // Warnings and conflicts
        warnings: analysis.warnings || [],
        conflicts: analysis.conflicts || []
    };

    return transformed;
}


/**
 * Transform elite engine response to UI-compatible format (legacy fallback)
 */
function transformEliteAnalysis(analysis) {
    // Handle both elite engine and legacy response formats
    const strongSkills = analysis.strongSkills || analysis.strong || [];
    const weakSkills = analysis.weakSkills || analysis.weak || [];
    const missingSkills = analysis.missingSkills || analysis.missing || [];
    const aiAnalyzed = analysis.aiAnalyzedSkills || [];

    // Transform to expected format with full AI reasoning
    const transformed = {
        detectedSkills: [...strongSkills.map(s => s.skill), ...weakSkills.map(s => s.skill)],
        requiredSkills: [...strongSkills, ...weakSkills, ...missingSkills].map(s => s.skill),
        strongSkills: strongSkills.map(s => s.skill),
        weakSkills: weakSkills.map(s => s.skill),
        missingSkills: missingSkills.map(s => s.skill),
        overallScore: analysis.overallScore || analysis.jobReadiness?.score || 0,

        // Enhanced AI analyzed skills with elite reasoning
        aiAnalyzedSkills: aiAnalyzed.length > 0 ? aiAnalyzed : generateAIAnalysisFromElite(strongSkills, weakSkills, missingSkills),

        // Coverage score
        coverageScore: analysis.coverageScore || {
            overall: analysis.overallScore || 0,
            critical: calculateCriticalScore(strongSkills, weakSkills, missingSkills),
            readinessLevel: analysis.jobReadiness?.level || 'Building Foundations',
            nextMilestone: analysis.jobReadiness?.detail || 'Continue building skills',
            estimatedTimeToReady: analysis.jobReadiness?.timeToReady || 12
        },

        // Elite engine insights
        insights: analysis.insights || [],
        recommendations: analysis.recommendations || [],
        detectionMetrics: analysis.detectionMetrics || {}
    };

    // Calculate coverage if not provided
    if (!transformed.coverageScore.overall) {
        transformed.coverageScore = calculateSkillCoverageScore(transformed);
    }

    return transformed;
}

/**
 * Generate AI analysis from elite engine skills
 */
function generateAIAnalysisFromElite(strongSkills, weakSkills, missingSkills) {
    const aiAnalyzed = [];
    const detectedSkills = [...strongSkills.map(s => s.skill), ...weakSkills.map(s => s.skill)];

    // Strong skills with enhanced reasoning
    strongSkills.forEach(skill => {
        aiAnalyzed.push({
            skill: skill.skill,
            category: skill.category || 'general',
            status: 'strong',
            confidence: skill.confidence || 0.9,
            mentions: skill.mentions || 1,
            evidence: skill.evidence || [],
            reasoning: skill.reasoning || {
                summary: `Strong proficiency demonstrated with ${skill.mentions || 'multiple'} mention(s)`,
                detail: skill.reasoning?.detail || `Detected with high confidence. ${getSkillStrengthContext(skill.skill)}`,
                impact: skill.reasoning?.impact || `Critical for role success. High market demand.`
            },
            actionable: skill.actionable || `Maintain proficiency. Consider advanced topics in ${skill.skill}.`,
            resources: skill.resources || [],
            industryContext: skill.industryContext || '',
            priority: 'Strong',
            timeToFix: 0,
            relevance: 95,
            interviewImpact: 'High',
            projectImpact: 'High',
            productionImpact: 'Critical'
        });
    });

    // Weak skills with improvement focus
    weakSkills.forEach(skill => {
        aiAnalyzed.push({
            skill: skill.skill,
            category: skill.category || 'general',
            status: 'weak',
            confidence: skill.confidence || 0.5,
            mentions: skill.mentions || 0,
            evidence: skill.evidence || [],
            reasoning: skill.reasoning || {
                summary: `Limited evidence found - needs strengthening`,
                detail: skill.reason || `Brief mention detected. Focus on building deeper expertise.`,
                impact: `Strengthening this skill will significantly improve job readiness.`
            },
            actionable: skill.actionable || `Dedicate 10-15 hours to ${skill.skill}. Build 2-3 practice projects.`,
            resources: skill.resources || [],
            industryContext: skill.industryContext || '',
            priority: skill.priority || 'High Impact',
            timeToFix: 4,
            relevance: 85,
            interviewImpact: 'Medium',
            projectImpact: 'High',
            productionImpact: 'Important'
        });
    });

    // Missing skills with learning paths
    missingSkills.forEach(skill => {
        aiAnalyzed.push({
            skill: skill.skill,
            category: skill.category || 'general',
            status: 'missing',
            confidence: 0,
            mentions: 0,
            evidence: [],
            reasoning: skill.reasoning || {
                summary: `Not detected in resume - recommended for role`,
                detail: `This is a ${skill.priority || 'high'}-priority skill. ${getMissingSkillContext(skill.skill)}`,
                impact: `Adding this skill will significantly improve job prospects.`
            },
            actionable: skill.actionable || `Start with fundamentals. Allocate ${skill.learningPath?.estimatedWeeks || 6} weeks for learning.`,
            resources: skill.resources || [],
            industryContext: skill.industryContext || '',
            priority: skill.priority || 'Critical',
            timeToFix: skill.learningPath?.estimatedWeeks || 6,
            relevance: skill.marketDemand || 80,
            interviewImpact: 'High',
            projectImpact: 'High',
            productionImpact: 'Critical'
        });
    });

    return aiAnalyzed;
}

/**
 * Calculate critical skills score
 */
function calculateCriticalScore(strongSkills, weakSkills, missingSkills) {
    const criticalSkills = ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
        'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'REST API'];

    const strongCritical = strongSkills.filter(s =>
        criticalSkills.some(c => s.skill?.includes(c) || c.includes(s.skill))
    ).length;

    const totalCritical = Math.min(criticalSkills.length, strongSkills.length + weakSkills.length + missingSkills.length);

    return totalCritical > 0 ? Math.round((strongCritical / totalCritical) * 100) : 0;
}

/**
 * Get skill strength context
 */
function getSkillStrengthContext(skill) {
    const contexts = {
        'React': 'Essential for modern frontend development.',
        'Node.js': 'Critical for backend JavaScript development.',
        'Python': 'Versatile language for web, data, and automation.',
        'PostgreSQL': 'Robust relational database for production systems.',
        'AWS': 'Leading cloud platform - highly valued.',
        'Docker': 'Essential for modern deployment practices.',
        'Git': 'Fundamental for professional development.',
        'REST API': 'Core skill for backend services.',
        'TypeScript': 'Industry standard for type-safe JavaScript.',
        'Kubernetes': 'Container orchestration expertise.'
    };

    return contexts[skill] || 'Valuable professional skill.';
}

/**
 * Get missing skill context
 */
function getMissingSkillContext(skill) {
    return `This skill is highly recommended for professional development. Consider starting with online courses and building practical projects.`;
}

/**
 * Get track display name for API
 */
function getTrackDisplayName(slug) {
    const trackNames = {
        'python': 'Python Full-Stack Developer',
        'java': 'Java Backend Enterprise Arch.',
        'cpp': 'C / C++ Systems Engineer',
        'cloud': 'Cloud & DevOps Engineer',
        'javascript': 'JavaScript Full-Stack'
    };
    return trackNames[slug] || 'Python Full-Stack Developer';
}

/**
 * Generate enhanced mock analysis with elite AI reasoning
 */
function generateEnhancedMockAnalysis() {
    const requiredSkills = SKILL_REQUIREMENTS[activeTrack]?.[currentUserLevel] || [];

    // Intelligent skill categorization (not random)
    const strongSkills = [];
    const weakSkills = [];
    const missingSkills = [];

    requiredSkills.forEach((skill, index) => {
        // More realistic distribution
        if (index < requiredSkills.length * 0.35) {
            strongSkills.push(skill);
        } else if (index < requiredSkills.length * 0.65) {
            weakSkills.push(skill);
        } else {
            missingSkills.push(skill);
        }
    });

    const detectedSkills = [...strongSkills, ...weakSkills];

    // Apply elite AI analysis to each skill
    const aiAnalyzedSkills = [];
    strongSkills.forEach(skill => {
        aiAnalyzedSkills.push(analyzeSkillWithAI(skill, 'strong', detectedSkills));
    });
    weakSkills.forEach(skill => {
        aiAnalyzedSkills.push(analyzeSkillWithAI(skill, 'weak', detectedSkills));
    });
    missingSkills.forEach(skill => {
        aiAnalyzedSkills.push(analyzeSkillWithAI(skill, 'missing', detectedSkills));
    });

    const analysis = {
        detectedSkills: detectedSkills,
        requiredSkills: requiredSkills,
        strongSkills: strongSkills,
        weakSkills: weakSkills,
        missingSkills: missingSkills,
        aiAnalyzedSkills: aiAnalyzedSkills,
        overallScore: Math.round((strongSkills.length / requiredSkills.length) * 100)
    };

    // Calculate Elite Skill Coverage Score
    analysis.coverageScore = calculateSkillCoverageScore(analysis);

    return analysis;
}

/**
 * AI Reasoning Engine for Skill Analysis
 * Analyzes skills with priority, market relevance, time estimates, and personalized insights
 */
function analyzeSkillWithAI(skill, category, detectedSkills, targetRole = 'Python Full Stack Developer') {
    // Job Market Relevance Database (based on 2026 market trends)
    const marketRelevance = {
        // Critical Skills (90-100%)
        'Python': 98, 'Django': 92, 'Flask': 88, 'FastAPI': 95, 'REST APIs': 97,
        'SQL': 96, 'PostgreSQL': 93, 'React': 94, 'JavaScript': 97, 'Git': 99,
        'Docker': 91, 'AWS': 93, 'Redis': 87, 'Authentication': 95,
        // High Impact Skills (70-89%)
        'TypeScript': 85, 'Node.js': 82, 'MongoDB': 79, 'GraphQL': 78,
        'CI/CD': 88, 'Kubernetes': 84, 'Testing': 89, 'Celery': 76,
        'WebSockets': 73, 'Nginx': 77, 'Linux': 86,
        // Optional Skills (50-69%)
        'Vue.js': 68, 'Angular': 65, 'Redis Cache': 72, 'RabbitMQ': 64,
        'Microservices': 75, 'Terraform': 69, 'Jenkins': 61
    };

    // Time to Learn Estimates (in weeks)
    const timeEstimates = {
        'Python': 8, 'Django': 6, 'Flask': 3, 'FastAPI': 4, 'REST APIs': 5,
        'SQL': 6, 'PostgreSQL': 4, 'React': 8, 'JavaScript': 10, 'Git': 2,
        'Docker': 4, 'AWS': 6, 'Redis': 2, 'Authentication': 3,
        'TypeScript': 5, 'Node.js': 6, 'MongoDB': 4, 'GraphQL': 5,
        'CI/CD': 4, 'Kubernetes': 8, 'Testing': 5, 'Celery': 3,
        'WebSockets': 3, 'Nginx': 2, 'Linux': 6
    };

    const relevance = marketRelevance[skill] || 50;
    const timeToFix = timeEstimates[skill] || 4;

    // Determine Priority Level
    let priority = 'Optional';
    let priorityRank = 3;
    if (relevance >= 90 && category !== 'strong') {
        priority = 'Critical';
        priorityRank = 1;
    } else if (relevance >= 75 && category !== 'strong') {
        priority = 'High Impact';
        priorityRank = 2;
    }

    // Generate AI Reasoning based on skill and context
    const reasoning = generateSkillReasoning(skill, category, relevance, detectedSkills, targetRole);

    return {
        name: skill,
        category: category,
        priority: priority,
        priorityRank: priorityRank,
        marketRelevance: relevance,
        timeToFix: timeToFix,
        reasoning: reasoning,
        interviewImpact: reasoning.interviewImpact,
        projectImpact: reasoning.projectImpact,
        productionImpact: reasoning.productionImpact
    };
}

/**
 * Generate personalized AI reasoning for each skill
 */
function generateSkillReasoning(skill, category, relevance, detectedSkills, targetRole) {
    const hasBackend = detectedSkills.some(s => ['Python', 'Django', 'Flask', 'FastAPI'].includes(s));
    const hasFrontend = detectedSkills.some(s => ['React', 'JavaScript', 'TypeScript'].includes(s));
    const hasDatabase = detectedSkills.some(s => ['SQL', 'PostgreSQL', 'MongoDB'].includes(s));
    const hasDevOps = detectedSkills.some(s => ['Docker', 'AWS', 'CI/CD', 'Kubernetes'].includes(s));

    let interviewImpact = '';
    let projectImpact = '';
    let productionImpact = '';
    let whyItMatters = '';

    // Skill-specific AI reasoning
    const skillInsights = {
        'Python': {
            interview: '80% of technical interviews for this role test Python fundamentals',
            project: 'Required for both backend APIs and data processing tasks',
            production: 'Core language for backend services, directly affects code maintainability',
            why: 'Foundation of the entire tech stack - without this, you cannot build or maintain production systems'
        },
        'Django': {
            interview: 'Most companies ask about ORM, middleware, and Django best practices',
            project: hasBackend ? 'Complements your Python skills for rapid API development' : 'Industry-standard framework for building scalable web applications',
            production: 'Powers high-traffic sites like Instagram and Pinterest',
            why: 'Provides batteries-included approach - auth, admin, ORM out of the box'
        },
        'REST APIs': {
            interview: 'Interviewers will ask you to design endpoints and explain HTTP methods',
            project: 'Essential for connecting frontend and backend in full-stack projects',
            production: 'Every modern application needs well-designed APIs for mobile and web clients',
            why: 'Core skill for full-stack developers - you cannot build modern apps without understanding API design'
        },
        'React': {
            interview: 'Common coding tasks involve hooks, state management, and component design',
            project: hasFrontend ? 'Already in your toolkit - focus on advanced patterns' : 'Most companies use React for their frontend',
            production: 'Most popular frontend library, used by Facebook, Netflix, Airbnb',
            why: 'Expected skill for full-stack roles - backend-only developers are less marketable'
        },
        'Docker': {
            interview: 'DevOps questions often cover containerization and deployment workflows',
            project: hasDevOps ? 'Complements your DevOps knowledge for complete CI/CD pipeline' : 'Required for consistent development and deployment environments',
            production: 'Standard for deploying microservices and ensuring environment consistency',
            why: 'Without Docker, your application might work locally but break in production'
        },
        'SQL': {
            interview: 'Almost guaranteed to face SQL query optimization and database design questions',
            project: hasDatabase ? 'Strengthen your database skills with complex queries' : 'Cannot build data-driven applications without SQL',
            production: 'Most production systems use relational databases for critical data',
            why: 'Data is the lifeblood of applications - without SQL, you cannot manage or query it effectively'
        },
        'Git': {
            interview: 'Interviewers expect fluency with branching, merging, and conflict resolution',
            project: 'Mandatory for team collaboration and code versioning',
            production: 'Industry standard for version control - non-negotiable in professional settings',
            why: 'Cannot work in a team without Git - it is the universal language of code collaboration'
        },
        'AWS': {
            interview: 'Cloud architecture questions are common for senior and mid-level roles',
            project: hasDevOps ? 'Adds cloud expertise to your DevOps toolkit' : 'Required for deploying and scaling applications in the cloud',
            production: 'Most companies host on AWS - understanding S3, EC2, RDS is expected',
            why: 'Modern applications run in the cloud - without AWS knowledge, you cannot deploy at scale'
        },
        'Testing': {
            interview: 'Companies assess your ability to write unit tests and understand TDD',
            project: 'Ensures your code works correctly and prevents regressions',
            production: 'Critical for maintaining code quality and catching bugs before users do',
            why: 'Professional developers write tests - without testing, your code is unreliable'
        },
        'Authentication': {
            interview: 'Security questions often focus on OAuth, JWT, and session management',
            project: 'Every real-world application needs secure user authentication',
            production: 'Security breaches happen when auth is poorly implemented',
            why: 'User data security is non-negotiable - mishandling auth can destroy companies'
        }
    };

    const insights = skillInsights[skill] || {
        interview: `Frequently tested in technical interviews for ${targetRole} positions`,
        project: 'Commonly required in real-world projects and portfolio work',
        production: 'Used in production systems to ensure scalability and maintainability',
        why: `Expected skill for ${targetRole} - demonstrates technical competence`
    };

    return {
        interviewImpact: insights.interview,
        projectImpact: insights.project,
        productionImpact: insights.production,
        whyItMatters: insights.why
    };
}

/**
 * Calculate Skill Coverage Score (job-readiness metric)
 */
function calculateSkillCoverageScore(analysis) {
    const totalSkills = analysis.requiredSkills.length;
    const strongCount = analysis.strongSkills.length;
    const weakCount = analysis.weakSkills.length;
    const missingCount = analysis.missingSkills.length;

    // Weighted scoring: Strong (100%), Weak (40%), Missing (0%)
    const strongScore = strongCount * 100;
    const weakScore = weakCount * 40;
    const maxScore = totalSkills * 100;

    const coverageScore = maxScore > 0 ? Math.min(100, Math.max(0, Math.round((strongScore + weakScore) / maxScore * 100))) : 0;

    // Calculate critical skills coverage
    const criticalSkills = (analysis.aiAnalyzedSkills || []).filter(s => s.priority === 'Critical');
    const criticalStrong = criticalSkills.filter(s => s.category === 'strong').length;
    const criticalCoverage = criticalSkills.length > 0 ? Math.min(100, Math.round((criticalStrong / criticalSkills.length) * 100)) : 0;

    return {
        overall: coverageScore,
        critical: criticalCoverage,
        readinessLevel: getReadinessLevel(coverageScore, criticalCoverage),
        nextMilestone: getNextMilestone(coverageScore),
        estimatedTimeToReady: calculateTimeToReady(analysis.aiAnalyzedSkills.filter(s => s.category !== 'strong'))
    };
}

function getReadinessLevel(overall, critical) {
    if (overall >= 85 && critical >= 90) return 'Job Ready';
    if (overall >= 70 && critical >= 75) return 'Nearly Ready';
    if (overall >= 50) return 'Developing';
    return 'Building Foundations';
}

function getNextMilestone(score) {
    if (score >= 85) return 'You are interview-ready! Focus on mock interviews.';
    if (score >= 70) return 'Complete critical skills to reach 85% coverage';
    if (score >= 50) return 'Focus on high-impact skills to reach 70% coverage';
    return 'Master foundational skills to reach 50% coverage';
}

function calculateTimeToReady(skillsToLearn) {
    const totalWeeks = skillsToLearn.reduce((sum, skill) => {
        // Critical skills get full time, others get 50% (can learn in parallel)
        return sum + (skill.priority === 'Critical' ? skill.timeToFix : skill.timeToFix * 0.5);
    }, 0);
    return Math.ceil(totalWeeks);
}

/**
 * Generate mock skill gap analysis with AI reasoning
 */
function generateMockAnalysis() {
    const requiredSkills = SKILL_REQUIREMENTS[activeTrack]?.[currentUserLevel] || [];

    // Randomly categorize skills for demo
    const strongSkills = [];
    const weakSkills = [];
    const missingSkills = [];

    requiredSkills.forEach((skill, index) => {
        const rand = Math.random();
        if (index < requiredSkills.length * 0.4) {
            strongSkills.push(skill);
        } else if (index < requiredSkills.length * 0.7) {
            weakSkills.push(skill);
        } else {
            missingSkills.push(skill);
        }
    });

    const detectedSkills = [...strongSkills, ...weakSkills];

    // Apply AI analysis to each skill
    const aiAnalyzedSkills = [];
    strongSkills.forEach(skill => {
        aiAnalyzedSkills.push(analyzeSkillWithAI(skill, 'strong', detectedSkills));
    });
    weakSkills.forEach(skill => {
        aiAnalyzedSkills.push(analyzeSkillWithAI(skill, 'weak', detectedSkills));
    });
    missingSkills.forEach(skill => {
        aiAnalyzedSkills.push(analyzeSkillWithAI(skill, 'missing', detectedSkills));
    });

    const analysis = {
        detectedSkills: detectedSkills,
        requiredSkills: requiredSkills,
        strongSkills: strongSkills,
        weakSkills: weakSkills,
        missingSkills: missingSkills,
        aiAnalyzedSkills: aiAnalyzedSkills,
        overallScore: Math.round((strongSkills.length / requiredSkills.length) * 100)
    };

    // Calculate Skill Coverage Score
    analysis.coverageScore = calculateSkillCoverageScore(analysis);

    return analysis;
}

/**
 * Render AI-driven skill gap results with coverage score and intelligent insights
 */
// â”€â”€â”€ Data normalization helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function sgClamp(v) { return Math.min(100, Math.max(0, Number(v) || 0)); }
function sgNormConf(v) { const n = Number(v); if (!n) return 0; return sgClamp(n < 1.5 ? Math.round(n * 100) : n); }
function sgSkillName(s) { return (typeof s === 'string' ? s : (s && s.skill) || (s && s.name) || '') || ''; }
function sgSafe(v, fallback = 'â€”') { return (v !== undefined && v !== null && v !== '' && v !== 'undefined' && typeof v !== 'object') ? v : fallback; }

function renderSkillGapResults(analysis) {
    const resultsSection = document.getElementById('results-section');
    if (!resultsSection) return;

    // Secure Data Extraction (clamp 0-100, remove undef, fix Objects)
    const sgClamp = (v) => Math.min(100, Math.max(0, Number(v) || 0));
    const sgNormConf = (v) => { const n = Number(v); if(!n) return 0; return sgClamp(n < 1.5 ? Math.round(n * 100) : n); };
    const sgSkillName = (s) => (typeof s === 'string' ? s : (s && (s.skill || s.name))) || '';
    
    // Core Metrics
    const coverage = analysis.coverageScore || {};
    const dciScore = sgClamp(coverage.overall || analysis.overallScore || 0);
    const roleLevel = (coverage.readinessLevel || 'Software Engineer').replace(/undefined|\[object Object\]/g, 'Engineer').trim();
    
    const toObj = s => typeof s === 'string' ? { skill: s, confidence: 0.7 } : (s || {});
    const strongObjs  = (analysis.strongSkills  || []).map(toObj).filter(s => sgSkillName(s));
    const weakObjs    = (analysis.weakSkills    || []).map(toObj).filter(s => sgSkillName(s));
    const missingObjs = (analysis.missingSkills || []).map(toObj).filter(s => sgSkillName(s));
    const allCount = strongObjs.length + weakObjs.length + missingObjs.length || 1;

    // KPI Calculations
    const roleAlignScore = Math.round((strongObjs.length / allCount) * 100);
    const gapSeverity = Math.min(100, missingObjs.length * 15);
    
    // Ring Calc - Large Size
    const r = 80;
    const c = 2 * Math.PI * r;
    const offset = c - (dciScore / 100) * c;

    // Matrix Data via simple derivation if helpers unavailable
    const sysScore = 65; 
    const codeScore = 70; 
    const innovScore = 60;
    const secScore = 50;
    
    const matrixRows = [
        { label: 'System Design & Arch', required: 90, current: sysScore },
        { label: 'Production Engineering', required: 85, current: codeScore },
        { label: 'Modern Stack Innovation', required: 80, current: innovScore },
        { label: 'Security & Compliance', required: 75, current: secScore }
    ];

    // Heatmap Data
    const heatData = [
        ...strongObjs.map(s => ({ name: sgSkillName(s), score: sgClamp(sgNormConf(s.confidence) || 85), type: 'strong' })),
        ...weakObjs.map(s => ({ name: sgSkillName(s), score: sgClamp(sgNormConf(s.confidence) || 45), type: 'weak' })),
        ...missingObjs.map(s => ({ name: sgSkillName(s), score: 15, type: 'missing' }))
    ].sort((a,b) => b.score - a.score).slice(0, 8);

    const html = `
        <div class="sg-ent-container">
            
            <!-- SECTION 1: EXECUTIVE GAP HEADER (Horizontal) -->
            <div class="sg-ent-section sg-ent-hero-row">
                <div class="sg-ent-hero-left">
                    <div class="sg-ent-brand">
                        <i class="fas fa-layer-group"></i> Skill Gap Intelligence
                    </div>
                    <h2 class="sg-ent-title">Capability Alignment Analysis</h2>
                    <p class="sg-ent-sub">Target Role: <strong style="color:#fff">${roleLevel}</strong></p>
                    
                    <div class="sg-ent-kpi-row">
                        <div class="sg-ent-kpi-card">
                            <div class="sg-ent-kpi-val">${dciScore}%</div>
                            <div class="sg-ent-kpi-label">Readiness Score</div>
                        </div>
                        <div class="sg-ent-kpi-card">
                            <div class="sg-ent-kpi-val" style="color: #43e97b;">${roleAlignScore}%</div>
                            <div class="sg-ent-kpi-label">Role Alignment</div>
                        </div>
                        <div class="sg-ent-kpi-card">
                            <div class="sg-ent-kpi-val" style="color: #ff3b30;">${gapSeverity > 60 ? 'High' : 'Med'}</div>
                            <div class="sg-ent-kpi-label">Risk Severity</div>
                        </div>
                    </div>
                </div>
                <div class="sg-ent-hero-right">
                    <svg width="180" height="180" style="transform: rotate(-90deg);">
                        <circle cx="90" cy="90" r="${r}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="12"></circle>
                        <circle cx="90" cy="90" r="${r}" fill="none" stroke="#4facfe" stroke-width="12" 
                                style="stroke-dasharray: ${c}; stroke-dashoffset: ${offset}; transition: stroke-dashoffset 1s ease;"></circle>
                    </svg>
                    <div class="sg-ent-ring-center">
                        <div style="font-size:2.5rem;font-weight:700;color:#fff;">${dciScore}</div>
                        <div style="font-size:0.75rem;opacity:0.6;color:#ccc;">INDEX</div>
                    </div>
                </div>
            </div>

            <!-- SECTION 2: ROLE COMPARISON GRID (2-Col Matrix) -->
            <div class="sg-ent-section">
                <h3 class="sg-ent-section-title">Role Capability Comparison</h3>
                <div class="sg-ent-comp-grid-header">
                    <div>TARGET REQUIREMENT</div>
                    <div>CURRENT CAPABILITY</div>
                </div>
                <div class="sg-ent-comp-list">
                    ${matrixRows.map(row => `
                        <div class="sg-ent-comp-row">
                            <div class="sg-ent-comp-label">${row.label}</div>
                            <div class="sg-ent-comp-bars">
                                <!-- Target -->
                                <div class="sg-ent-bar-group">
                                    <div class="sg-ent-bg-bar"><div class="sg-ent-fill-bar target" style="width:${row.required}%"></div></div>
                                    <span class="sg-ent-bar-val">${row.required}</span>
                                </div>
                                <!-- Current -->
                                <div class="sg-ent-bar-group">
                                    <div class="sg-ent-bg-bar"><div class="sg-ent-fill-bar ${row.current >= row.required ? 'good' : 'gap'}" style="width:${row.current}%"></div></div>
                                    <span class="sg-ent-bar-val">${row.current}</span>
                                </div>
                            </div>
                            <div class="sg-ent-comp-delta ${row.current - row.required >= 0 ? 'pos' : 'neg'}">
                                ${row.current - row.required}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- SECTION 3: CRITICAL GAPS (Data Grid) -->
            <div class="sg-ent-section">
                <h3 class="sg-ent-section-title">Critical Skill Deficiencies</h3>
                <div class="sg-ent-card-grid">
                    ${missingObjs.slice(0, 6).map(m => `
                        <div class="sg-ent-glass-card error">
                            <div class="sg-ent-card-header">
                                <span class="sg-ent-skill-name">${sgSkillName(m)}</span>
                                <span class="sg-ent-badge red">CRITICAL</span>
                            </div>
                            <div class="sg-ent-card-body">
                                <div class="sg-ent-metric">Gap Impact: <strong>High</strong></div>
                                <div class="sg-ent-rec">Action: Prioritize evidence acquisition immediately to unlock role eligibility.</div>
                            </div>
                        </div>
                    `).join('')}
                    ${missingObjs.length === 0 ? '<div style="padding:20px;color:#666;">No critical gaps detected.</div>' : ''}
                </div>
            </div>

            <!-- SECTION 4: STRATEGIC ROADMAP (Timeline) -->
            <div class="sg-ent-section">
                <h3 class="sg-ent-section-title">Strategic Improvement Roadmap</h3>
                <div class="sg-ent-timeline">
                    <div class="sg-ent-timeline-item">
                        <div class="sg-ent-time-marker">PHASE 1</div>
                        <div class="sg-ent-time-content">
                            <h4>Blocking Gaps Resolution</h4>
                            <p>Immediate focus on validitating ${missingObjs.slice(0,3).map(s=>sgSkillName(s)).join(', ') || 'foundation skills'} to pass automated screening filters.</p>
                        </div>
                    </div>
                    <div class="sg-ent-timeline-item">
                        <div class="sg-ent-time-marker">PHASE 2</div>
                        <div class="sg-ent-time-content">
                            <h4>Competitive Tech Depth</h4>
                            <p>Enhance ${weakObjs.slice(0,3).map(s=>sgSkillName(s)).join(', ') || 'core competencies'} to match senior-level expectations.</p>
                        </div>
                    </div>
                    <div class="sg-ent-timeline-item">
                        <div class="sg-ent-time-marker">PHASE 3</div>
                        <div class="sg-ent-time-content">
                            <h4>Differentiation & Leadership</h4>
                            <p>Leverage strong skills (${strongObjs.slice(0,2).map(s=>sgSkillName(s)).join(', ') || 'strengths'}) like System Design for distinct market positioning.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SECTION 5: HEATMAP (Compact) -->
            <div class="sg-ent-section">
                <h3 class="sg-ent-section-title">Verified Skill Heatmap</h3>
                <div class="sg-ent-heatmap-container">
                    ${heatData.map(h => `
                        <div class="sg-ent-heat-item">
                            <div class="sg-ent-heat-label">${h.name}</div>
                            <div class="sg-ent-heat-track">
                                <div class="sg-ent-heat-fill ${h.score > 75 ? 'green' : h.score > 40 ? 'amber' : 'red'}" style="width:${h.score}%"></div>
                            </div>
                            <div class="sg-ent-heat-score">${h.score}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

        </div>
    `;

    resultsSection.innerHTML = html;
    
    // Animate reveal
    resultsSection.style.display = 'block';
    resultsSection.style.opacity = '0';
    requestAnimationFrame(() => requestAnimationFrame(() => {
        resultsSection.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        resultsSection.style.opacity = '1';
    }));
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// â”€â”€â”€ Score derivation helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function sgDeriveArch(strong, weak, miss) {
    const kw = ['system design','microservices','distributed','kubernetes','docker','architecture','cloud','aws','gcp','azure','kafka','redis','postgresql'];
    const m = strong.filter(s => kw.some(k => sgSkillName(s).toLowerCase().includes(k))).length;
    return Math.min(88, 28 + m * 13);
}
function sgDeriveCodeQ(strong, weak) {
    const kw = ['testing','jest','pytest','unit test','tdd','ci/cd','git','typescript','lint','code review'];
    const m = strong.filter(s => kw.some(k => sgSkillName(s).toLowerCase().includes(k))).length;
    return Math.min(88, 22 + m * 16);
}
function sgDeriveSec(strong) {
    const kw = ['security','oauth','jwt','https','tls','encryption','xss','csrf','owasp','authentication'];
    const m = strong.filter(s => kw.some(k => sgSkillName(s).toLowerCase().includes(k))).length;
    return Math.min(88, 18 + m * 20);
}
function sgDeriveInnov(strong, weak) {
    const kw = ['machine learning','ai','tensorflow','pytorch','llm','langchain','openai','nlp','deep learning'];
    const m = [...strong,...weak].filter(s => kw.some(k => sgSkillName(s).toLowerCase().includes(k))).length;
    return Math.min(88, 28 + m * 15);
}
function sgLabelMature(s)  { return s >= 80 ? 'Production-grade'   : s >= 60 ? 'Solid foundation' : s >= 40 ? 'Developing'       : 'Early stage'; }
function sgLabelArch(s)    { return s >= 75 ? 'Systems thinker'    : s >= 50 ? 'Component-focused': 'Pattern learning'; }
function sgLabelQuality(s) { return s >= 70 ? 'High rigor'         : s >= 40 ? 'Moderate rigor'   : 'Needs structure'; }
function sgLabelSec(s)     { return s >= 70 ? 'Security-aware'     : s >= 40 ? 'Basic hygiene'    : 'Exposure needed'; }
function sgLabelInnov(s)   { return s >= 70 ? 'AI-native'          : s >= 40 ? 'Growth mindset'   : 'Traditional stack'; }
function sgLabelMkt(s)     { return s >= 80 ? 'Hire-ready'         : s >= 60 ? 'Strong contender' : s >= 40 ? 'Developing'       : 'Needs investment'; }
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Render AI-analyzed skill cards with expandable context
 */
function renderAISkillCards(skills) {
    if (!skills || skills.length === 0) {
        return '<p class="no-skills-msg" style="color:rgba(255,255,255,0.4);font-size:0.85rem;padding:12px 0;">No skills in this category</p>';
    }
    return skills.map(skill => {
        // Support both new backend format and legacy mock format
        const skillName = skill.skill || skill.name || 'Unknown';
        const category = skill.category || (skill.priority === 'Strong' ? 'strong' : skill.priority === 'Critical' ? 'missing' : 'weak');
        const priority = skill.priority || 'Optional';
        const rawConf = skill.confidence !== undefined ? skill.confidence : (skill.marketRelevance || 50);
        const confidence = Math.min(100, Math.max(0, (rawConf > 0 && rawConf < 1.5) ? Math.round(rawConf * 100) : Math.round(Number(rawConf) || 0)));
        const depthLevel = skill.depthLevel || 'surface';
        const weeksToBridge = skill.weeksToBridge || skill.timeToFix || 4;
        const marketDemand = skill.marketDemand || (confidence >= 90 ? 'Very High' : confidence >= 75 ? 'High' : 'Moderate');
        const reason = skill.reason || skill.reasoning?.whyItMatters || 'Detected in resume analysis';
        const learningPath = skill.learningPath || `Master ${skillName} fundamentals â†’ Build projects â†’ Add to portfolio`;

        // Status styling
        const isMissing = category === 'missing' || depthLevel === 'not-detected' || priority === 'Critical';
        const isStrong = category === 'strong' || priority === 'Strong';
        const statusClass = isStrong ? 'strong' : isMissing ? 'missing' : 'weak';
        const statusIcon = isStrong ? 'fa-check-circle' : isMissing ? 'fa-times-circle' : 'fa-exclamation-triangle';
        const statusText = isStrong ? 'Demonstrated' : isMissing ? 'Not Detected' : 'Needs Depth';

        // Depth level badge
        const depthBadgeMap = {
            'expert': { label: 'Expert', color: '#00e676' },
            'applied': { label: 'Applied', color: '#40c4ff' },
            'intermediate': { label: 'Intermediate', color: '#ffab40' },
            'surface': { label: 'Surface', color: '#ff7043' },
            'not-detected': { label: 'Not Found', color: '#ef5350' }
        };
        const depthBadge = depthBadgeMap[depthLevel] || { label: 'Unknown', color: '#9e9e9e' };

        // Confidence bar color
        const confColor = confidence >= 75 ? '#00e676' : confidence >= 50 ? '#ffab40' : '#ef5350';

        // Priority badge
        const priorityColors = {
            'Critical': '#ef5350',
            'High Impact': '#ff9800',
            'Strong': '#00e676',
            'Optional': '#78909c'
        };
        const priorityColor = priorityColors[priority] || '#78909c';

        return `
            <div class="ai-skill-card ${statusClass}" data-skill="${skillName}" style="border-left: 3px solid ${priorityColor};">
                <div class="skill-card-header">
                    <div class="skill-header-left">
                        <h4 class="skill-name">${skillName}</h4>
                        <span class="skill-status ${statusClass}">
                            <i class="fas ${statusIcon}"></i>
                            ${statusText}
                        </span>
                    </div>
                    <div class="skill-header-right">
                        <div class="market-relevance" title="AI Confidence Score">
                            <i class="fas fa-brain"></i>
                            <span style="color:${confColor}">${confidence}%</span>
                        </div>
                        <i class="fas fa-chevron-down expand-indicator"></i>
                    </div>
                </div>
                
                <div class="skill-metrics">
                    <div class="metric-pill" style="background:rgba(255,255,255,0.05);">
                        <i class="fas fa-layer-group" style="color:${depthBadge.color}"></i>
                        <span style="color:${depthBadge.color}">${depthBadge.label}</span>
                    </div>
                    ${!isStrong ? `<div class="metric-pill" style="background:rgba(255,255,255,0.05);">
                        <i class="fas fa-clock" style="color:#ffab40"></i>
                        <span>${weeksToBridge}w to bridge</span>
                    </div>` : ''}
                    <div class="metric-pill" style="background:rgba(255,255,255,0.05);">
                        <i class="fas fa-fire" style="color:${priorityColor}"></i>
                        <span style="color:${priorityColor}">${marketDemand} demand</span>
                    </div>
                </div>
                
                <div class="skill-expandable-content">
                    <div class="skill-reasoning">
                        <div class="reasoning-section">
                            <div class="reasoning-label">
                                <i class="fas fa-robot"></i>
                                AI Analysis
                            </div>
                            <p>${reason}</p>
                        </div>
                        ${!isStrong ? `<div class="reasoning-section why-matters">
                            <div class="reasoning-label">
                                <i class="fas fa-route"></i>
                                Learning Path
                            </div>
                            <p>${learningPath}</p>
                        </div>` : ''}
                        ${skill.interviewImpact ? `<div class="reasoning-section">
                            <div class="reasoning-label">
                                <i class="fas fa-user-tie"></i>
                                Interview Impact
                            </div>
                            <p>${skill.interviewImpact}</p>
                        </div>` : ''}
                    </div>
                </div>
                
                <div class="skill-card-footer">
                    <span class="expand-hint">Click to ${!isStrong ? 'see learning path' : 'see details'}</span>
                </div>
            </div>
        `;
    }).join('');
}



/**
 * Render skill category
 */
function renderSkillCategory(type, skills) {
    const sectionId = `${type}-skills-section`;
    const listId = `${type}-skills-list`;

    const section = document.getElementById(sectionId);
    const list = document.getElementById(listId);

    if (!section || !list) return;

    if (skills.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    list.innerHTML = skills.map(skill => `
        <span class="skill-badge ${type}">${skill}</span>
    `).join('');
}

/**
 * Generate AI-driven learning plan based on skill gap analysis
 */
async function fixRoadmap() {
    if (!skillGapAnalysis) {
        showFeedback('Please analyze your resume first', 'error');
        return;
    }

    // Generate intelligent learning plan
    const learningPlan = generateAILearningPlan(skillGapAnalysis);

    // Show learning plan modal
    showLearningPlanModal(learningPlan);
}

/**
 * Generate personalized step-by-step learning plan
 */
function generateAILearningPlan(analysis) {
    // Sort skills by priority rank and category
    const skillsToLearn = analysis.aiAnalyzedSkills
        .filter(s => s.category !== 'strong')
        .sort((a, b) => {
            // Sort by priority first, then by category (missing before weak)
            if (a.priorityRank !== b.priorityRank) return a.priorityRank - b.priorityRank;
            if (a.category === 'missing' && b.category === 'weak') return -1;
            if (a.category === 'weak' && b.category === 'missing') return 1;
            return b.marketRelevance - a.marketRelevance;
        });

    // Group into phases
    const phases = [];
    let currentPhase = [];
    let phaseWeeks = 0;
    const maxPhaseWeeks = 6;

    skillsToLearn.forEach(skill => {
        if (phaseWeeks + skill.timeToFix > maxPhaseWeeks && currentPhase.length > 0) {
            phases.push([...currentPhase]);
            currentPhase = [];
            phaseWeeks = 0;
        }
        currentPhase.push(skill);
        phaseWeeks += skill.timeToFix;
    });

    if (currentPhase.length > 0) phases.push(currentPhase);

    // Generate phase descriptions
    const phasesWithContext = phases.map((phase, index) => {
        const totalWeeks = phase.reduce((sum, s) => sum + s.timeToFix, 0);
        const criticalCount = phase.filter(s => s.priority === 'Critical').length;

        let phaseGoal = '';
        if (index === 0) {
            phaseGoal = 'Build foundational skills for interview readiness';
        } else if (index === phases.length - 1) {
            phaseGoal = 'Complete your skill set for full job readiness';
        } else {
            phaseGoal = 'Strengthen core competencies and project capabilities';
        }

        return {
            number: index + 1,
            skills: phase,
            totalWeeks: Math.ceil(totalWeeks),
            criticalCount: criticalCount,
            goal: phaseGoal
        };
    });

    return {
        phases: phasesWithContext,
        totalWeeks: phasesWithContext.reduce((sum, p) => sum + p.totalWeeks, 0),
        totalSkills: skillsToLearn.length,
        targetCoverage: Math.min(100, analysis.coverageScore.overall + Math.round((skillsToLearn.length / analysis.requiredSkills.length) * 100))
    };
}

/**
 * Show AI-generated learning plan in modal
 */
function showLearningPlanModal(plan) {
    const modal = document.createElement('div');
    modal.className = 'learning-plan-modal';
    modal.innerHTML = `
        <div class="learning-plan-overlay" onclick="this.parentElement.remove()"></div>
        <div class="learning-plan-content">
            <div class="plan-header">
                <div class="plan-header-left">
                    <i class="fas fa-route"></i>
                    <div>
                        <h2>Your Personalized Learning Roadmap</h2>
                        <p>AI-optimized path to job readiness</p>
                    </div>
                </div>
                <button class="close-modal-btn" onclick="this.closest('.learning-plan-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="plan-overview">
                <div class="overview-stat">
                    <i class="fas fa-calendar-alt"></i>
                    <div>
                        <span class="stat-value">${plan.totalWeeks}</span>
                        <span class="stat-label">Weeks</span>
                    </div>
                </div>
                <div class="overview-stat">
                    <i class="fas fa-tasks"></i>
                    <div>
                        <span class="stat-value">${plan.totalSkills}</span>
                        <span class="stat-label">Skills</span>
                    </div>
                </div>
                <div class="overview-stat">
                    <i class="fas fa-target"></i>
                    <div>
                        <span class="stat-value">${plan.targetCoverage}%</span>
                        <span class="stat-label">Target Coverage</span>
                    </div>
                </div>
            </div>
            
            <div class="phases-timeline">
                ${plan.phases.map((phase, idx) => `
                    <div class="phase-card">
                        <div class="phase-number">Phase ${phase.number}</div>
                        <div class="phase-content">
                            <div class="phase-header">
                                <h3>${phase.goal}</h3>
                                <div class="phase-meta">
                                    <span><i class="fas fa-clock"></i> ${phase.totalWeeks} weeks</span>
                                    ${phase.criticalCount > 0 ? `<span class="critical-badge"><i class="fas fa-exclamation-circle"></i> ${phase.criticalCount} critical</span>` : ''}
                                </div>
                            </div>
                            <div class="phase-skills">
                                ${phase.skills.map((skill, skillIdx) => `
                                    <div class="phase-skill-item">
                                        <div class="skill-order">${skillIdx + 1}</div>
                                        <div class="skill-info">
                                            <div class="skill-name-row">
                                                <span class="skill-name">${skill.name}</span>
                                                <span class="skill-priority priority-${skill.priority.toLowerCase().replace(/\s/g, '-')}">${skill.priority}</span>
                                            </div>
                                            <div class="skill-meta">
                                                <span><i class="fas fa-clock"></i> ${skill.timeToFix}w</span>
                                                <span><i class="fas fa-chart-bar"></i> ${skill.marketRelevance}% relevance</span>
                                                <span class="skill-status-badge ${skill.category}">${skill.category === 'missing' ? 'To Learn' : 'To Strengthen'}</span>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ${idx < plan.phases.length - 1 ? '<div class="phase-connector"><i class="fas fa-arrow-down"></i></div>' : ''}
                    </div>
                `).join('')}
            </div>
            
            <div class="plan-actions">
                <button class="btn btn-outline" onclick="this.closest('.learning-plan-modal').remove()">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button class="btn btn-primary" onclick="applyLearningPlan()">
                    <i class="fas fa-rocket"></i> Apply to My Roadmap
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * Apply learning plan to user's roadmap
 */
async function applyLearningPlan() {
    const modal = document.querySelector('.learning-plan-modal');
    if (modal) modal.remove();

    showFeedback('Optimizing your roadmap with AI recommendations...', 'info');

    try {
        if (authToken && selectedTrackId) {
            const response = await fetch(`${API_BASE_URL}/roadmap/adjust`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    trackId: selectedTrackId,
                    level: currentUserLevel,
                    missingSkills: skillGapAnalysis.missingSkills,
                    weakSkills: skillGapAnalysis.weakSkills,
                    aiAnalysis: skillGapAnalysis.aiAnalyzedSkills
                })
            });

            if (response.ok) {
                showFeedback('âœ¨ Roadmap personalized with AI-driven learning path!', 'success');
                setTimeout(() => navigateTo('dashboard-page'), 2000);
                return;
            }
        }

        showFeedback('âœ¨ Roadmap optimized! Your learning path is now prioritized.', 'success');
        setTimeout(() => navigateTo('dashboard-page'), 2000);

    } catch (error) {
        console.error('Error applying learning plan:', error);
        showFeedback('Failed to apply plan. Please try again.', 'error');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Export functions for use in main app.js
if (typeof window !== 'undefined') {
    window.enhancedFlows = {
        renderDashboard,
        switchLevel,
        renderPractice,
        initializeSkillGapAnalyzer,
        fixRoadmap
    };

    // Expose DSA_TOPICS for coding arena
    window.DSA_TOPICS = DSA_TOPICS;
}
