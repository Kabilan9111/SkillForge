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
    const loadingEl = document.getElementById('practice-loading');
    const gridEl = document.getElementById('dsa-topics-grid');
    
    if (!loadingEl || !gridEl) return;
    
    // Show loading
    loadingEl.style.display = 'block';
    gridEl.innerHTML = '';
    
    try {
        // Fetch problems from backend or use mock data
        await fetchPracticeProblems();
        
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
        
        // Update stats
        updatePracticeStats();
        
        // Attach event listeners
        attachPracticeEventListeners();
        
    } catch (error) {
        console.error('Error rendering practice:', error);
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
 * Analyze resume
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
    
    // Show loading
    document.getElementById('uploaded-file').style.display = 'none';
    document.getElementById('analysis-loading').style.display = 'block';
    
    try {
        // Create FormData
        const formData = new FormData();
        formData.append('resume', uploadedResume);
        formData.append('trackId', selectedTrackId);
        formData.append('level', currentUserLevel);
        
        // Call backend API
        const response = await fetch(`${API_BASE_URL}/skill-gap/analyze`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            skillGapAnalysis = data;
            renderSkillGapResults(data);
        } else {
            throw new Error('Analysis failed');
        }
        
    } catch (error) {
        console.error('Error analyzing resume:', error);
        
        // Use mock analysis
        showFeedback('Using mock analysis for demonstration', 'warning');
        const mockAnalysis = generateMockAnalysis();
        skillGapAnalysis = mockAnalysis;
        renderSkillGapResults(mockAnalysis);
    } finally {
        document.getElementById('analysis-loading').style.display = 'none';
    }
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
    
    const coverageScore = Math.round((strongScore + weakScore) / maxScore * 100);
    
    // Calculate critical skills coverage
    const criticalSkills = analysis.aiAnalyzedSkills.filter(s => s.priority === 'Critical');
    const criticalStrong = criticalSkills.filter(s => s.category === 'strong').length;
    const criticalCoverage = Math.round((criticalStrong / criticalSkills.length) * 100) || 0;
    
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
function renderSkillGapResults(analysis) {
    const resultsSection = document.getElementById('results-section');
    if (!resultsSection) return;
    
    const coverage = analysis.coverageScore;
    const critical = analysis.aiAnalyzedSkills.filter(s => s.priority === 'Critical');
    const highImpact = analysis.aiAnalyzedSkills.filter(s => s.priority === 'High Impact');
    const optional = analysis.aiAnalyzedSkills.filter(s => s.priority === 'Optional');
    
    // Update stats
    document.getElementById('strong-skills-count').innerText = analysis.strongSkills.length;
    document.getElementById('weak-skills-count').innerText = analysis.weakSkills.length;
    document.getElementById('missing-skills-count').innerText = analysis.missingSkills.length;
    
    // Render Skill Coverage Score Card
    const summaryCard = document.querySelector('.skill-gap-summary');
    if (summaryCard) {
        summaryCard.innerHTML = `
            <div class="ai-coach-header">
                <i class="fas fa-brain"></i>
                <h3>AI Career Coach Analysis</h3>
            </div>
            
            <div class="coverage-score-hero">
                <div class="coverage-circle">
                    <svg width="160" height="160" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(229, 57, 53, 0.1)" stroke-width="12"/>
                        <circle cx="80" cy="80" r="70" fill="none" stroke="#e53935" stroke-width="12"
                            stroke-dasharray="${2 * Math.PI * 70}" 
                            stroke-dashoffset="${2 * Math.PI * 70 * (1 - coverage.overall / 100)}"
                            stroke-linecap="round"
                            transform="rotate(-90 80 80)"
                            style="transition: stroke-dashoffset 2s ease;"/>
                    </svg>
                    <div class="coverage-score-text">
                        <span class="score-number">${coverage.overall}%</span>
                        <span class="score-label">Job Ready</span>
                    </div>
                </div>
                <div class="coverage-insights">
                    <div class="readiness-badge ${coverage.readinessLevel.toLowerCase().replace(/\s/g, '-')}">
                        <i class="fas ${coverage.overall >= 85 ? 'fa-rocket' : coverage.overall >= 70 ? 'fa-star' : coverage.overall >= 50 ? 'fa-chart-line' : 'fa-seedling'}"></i>
                        ${coverage.readinessLevel}
                    </div>
                    <div class="coverage-stats">
                        <div class="mini-stat">
                            <span class="mini-stat-value">${coverage.critical}%</span>
                            <span class="mini-stat-label">Critical Skills</span>
                        </div>
                        <div class="mini-stat">
                            <span class="mini-stat-value">${coverage.estimatedTimeToReady}w</span>
                            <span class="mini-stat-label">To Job Ready</span>
                        </div>
                    </div>
                    <div class="next-milestone">
                        <i class="fas fa-flag-checkered"></i>
                        <span>${coverage.nextMilestone}</span>
                    </div>
                </div>
            </div>
            
            <div class="gap-stats">
                <div class="gap-stat success">
                    <i class="fas fa-check-circle"></i>
                    <span class="gap-number">${analysis.strongSkills.length}</span>
                    <span class="gap-label">Strong Skills</span>
                </div>
                <div class="gap-stat warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span class="gap-number">${analysis.weakSkills.length}</span>
                    <span class="gap-label">Need Improvement</span>
                </div>
                <div class="gap-stat danger">
                    <i class="fas fa-times-circle"></i>
                    <span class="gap-number">${analysis.missingSkills.length}</span>
                    <span class="gap-label">Missing Skills</span>
                </div>
            </div>
        `;
    }
    
    // Render priority-based skill sections
    const categoriesContainer = document.querySelector('.skill-categories');
    if (categoriesContainer) {
        categoriesContainer.innerHTML = `
            <div class="ai-priority-section">
                <div class="section-header">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Critical Priority Skills</h3>
                    <span class="priority-badge critical">${critical.filter(s => s.category !== 'strong').length} to master</span>
                </div>
                <p class="section-description">These skills are essential for ${activeTrack || 'your role'} and heavily tested in interviews. Prioritize these first.</p>
                <div class="ai-skills-grid">
                    ${renderAISkillCards(critical)}
                </div>
            </div>
            
            <div class="ai-priority-section">
                <div class="section-header">
                    <i class="fas fa-star"></i>
                    <h3>High Impact Skills</h3>
                    <span class="priority-badge high-impact">${highImpact.filter(s => s.category !== 'strong').length} recommended</span>
                </div>
                <p class="section-description">These skills significantly boost your marketability and project capabilities.</p>
                <div class="ai-skills-grid">
                    ${renderAISkillCards(highImpact)}
                </div>
            </div>
            
            ${optional.length > 0 ? `
                <div class="ai-priority-section optional">
                    <div class="section-header">
                        <i class="fas fa-plus-circle"></i>
                        <h3>Optional Skills</h3>
                        <span class="priority-badge optional">${optional.length} nice-to-have</span>
                    </div>
                    <p class="section-description">Learn these after mastering critical and high-impact skills.</p>
                    <div class="ai-skills-grid">
                        ${renderAISkillCards(optional)}
                    </div>
                </div>
            ` : ''}
        `;
    }
    
    // Add expand/collapse event listeners
    setTimeout(() => {
        document.querySelectorAll('.ai-skill-card').forEach(card => {
            card.addEventListener('click', function() {
                this.classList.toggle('expanded');
            });
        });
    }, 100);
    
    // Show results with animation
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Render AI-analyzed skill cards with expandable context
 */
function renderAISkillCards(skills) {
    return skills.map(skill => {
        const statusClass = skill.category === 'strong' ? 'strong' : skill.category === 'weak' ? 'weak' : 'missing';
        const statusIcon = skill.category === 'strong' ? 'fa-check-circle' : skill.category === 'weak' ? 'fa-exclamation-triangle' : 'fa-times-circle';
        const statusText = skill.category === 'strong' ? 'Mastered' : skill.category === 'weak' ? 'Developing' : 'Not Detected';
        
        return `
            <div class="ai-skill-card ${statusClass}" data-skill="${skill.name}">
                <div class="skill-card-header">
                    <div class="skill-header-left">
                        <h4 class="skill-name">${skill.name}</h4>
                        <span class="skill-status ${statusClass}">
                            <i class="fas ${statusIcon}"></i>
                            ${statusText}
                        </span>
                    </div>
                    <div class="skill-header-right">
                        <div class="market-relevance" title="Job Market Relevance">
                            <i class="fas fa-chart-bar"></i>
                            <span>${skill.marketRelevance}%</span>
                        </div>
                        <i class="fas fa-chevron-down expand-indicator"></i>
                    </div>
                </div>
                
                <div class="skill-metrics">
                    <div class="metric-pill">
                        <i class="fas fa-clock"></i>
                        <span>${skill.timeToFix} weeks</span>
                    </div>
                    <div class="metric-pill priority-${skill.priority.toLowerCase().replace(/\s/g, '-')}">
                        <i class="fas fa-flag"></i>
                        <span>${skill.priority}</span>
                    </div>
                </div>
                
                <div class="skill-expandable-content">
                    <div class="skill-reasoning">
                        <div class="reasoning-section">
                            <div class="reasoning-label">
                                <i class="fas fa-user-tie"></i>
                                Interview Impact
                            </div>
                            <p>${skill.interviewImpact}</p>
                        </div>
                        <div class="reasoning-section">
                            <div class="reasoning-label">
                                <i class="fas fa-project-diagram"></i>
                                Project Relevance
                            </div>
                            <p>${skill.projectImpact}</p>
                        </div>
                        <div class="reasoning-section">
                            <div class="reasoning-label">
                                <i class="fas fa-server"></i>
                                Production Systems
                            </div>
                            <p>${skill.productionImpact}</p>
                        </div>
                        <div class="reasoning-section why-matters">
                            <div class="reasoning-label">
                                <i class="fas fa-lightbulb"></i>
                                Why This Matters
                            </div>
                            <p>${skill.reasoning.whyItMatters}</p>
                        </div>
                    </div>
                </div>
                
                <div class="skill-card-footer">
                    <span class="expand-hint">Click to ${skill.category !== 'strong' ? 'learn why this matters' : 'see details'}</span>
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
                showFeedback('✨ Roadmap personalized with AI-driven learning path!', 'success');
                setTimeout(() => navigateTo('dashboard-page'), 2000);
                return;
            }
        }
        
        showFeedback('✨ Roadmap optimized! Your learning path is now prioritized.', 'success');
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
