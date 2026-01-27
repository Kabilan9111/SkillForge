// Roadmap Configuration Data
const ROADMAPS = {
    java: { // Red Theme
        title: "Java Backend Enterprise Arch.",
        completion: 35,
        nodes: [
            { id: 1, title: "Java Core & OOP", status: "completed", desc: "Classes, Interfaces, Polymorphism, Memory Mgmt." },
            { id: 2, title: "Collections & Streams", status: "completed", desc: "List, Set, Map, Stream API, Lambdas." },
            { id: 3, title: "Build Tools (Maven)", status: "completed", desc: "Dependency/Plugin Mgmt, Lifecycle goals." },
            { id: 4, title: "Relational DBs (SQL)", status: "in-progress", desc: "Normalization, Joins, Indexing, ACID." },
            { id: 5, title: "Spring Core (IoC)", status: "locked", desc: "Dependency Injection, Beans, Context." },
            { id: 6, title: "REST API Design", status: "locked", desc: "Resources, Verbs, Status Codes, HATEOAS." },
            { id: 7, title: "Spring Boot", status: "locked", desc: "Auto-config, Actuator, Profiles." },
            { id: 8, title: "Microservices", status: "locked", desc: "Service Discovery, Gateway, Circuit Breaker." }
        ]
    },
    python: { // Blue Theme
        title: "Python Full-Stack Developer",
        completion: 20,
        nodes: [
            { id: 1, title: "Python Syntax", status: "completed", desc: "Dynamic typing, Interpreted nature, REPL." },
            { id: 2, title: "Data Structures", status: "completed", desc: "Lists, Dicts, Tuples, Sets Comprehensions." },
            { id: 3, title: "Functional Tools", status: "in-progress", desc: "Map, Filter, Reduce, Decorators, Generators." },
            { id: 4, title: "Web Scraping", status: "locked", desc: "Requests, BeautifulSoup, Selenium." },
            { id: 5, title: "Fast, API", status: "locked", desc: "Async/Await, Pydantic, Swagger UI." },
            { id: 6, title: "Django ORM", status: "locked", desc: "Models, Migrations, QuerySets." },
            { id: 7, title: "Celery & Redis", status: "locked", desc: "Async Task Queues, Caching." }
        ]
    },
    cpp: { // Purple Theme
        title: "C / C++ Systems Engineer",
        completion: 10,
        nodes: [
            { id: 1, title: "Memory Allocation", status: "completed", desc: "Stack vs Heap, Pointers, malloc/free." },
            { id: 2, title: "Process Control", status: "in-progress", desc: "Fork, Exec, Wait, Zombie processes." },
            { id: 3, title: "Thread Synchronization", status: "locked", desc: "Mutex, Semaphores, Deadlocks, Race Conditions." },
            { id: 4, title: "Network Sockets", status: "locked", desc: "TCP/IP, UDP, Bind, Listen, Accept." },
            { id: 5, title: "Templates (STL)", status: "locked", desc: "Generic Programming, Containers, Iterators." },
            { id: 6, title: "Kernel Modules", status: "locked", desc: "Loadable modules, Character devices, ioctl." }
        ]
    }
};

// DOM Elements
const elements = {
    body: document.body,
    roleTitle: document.getElementById('role-title'),
    container: document.getElementById('roadmap-container'),
    progressBar: document.getElementById('progress-bar'),
    progressValue: document.getElementById('progress-value'),
    buttons: document.querySelectorAll('.role-btn')
};

// State Management
let currentRole = 'java';

/**
 * Renders the roadmap nodes based on the selected role
 */
function renderRoadmap(roleKey) {
    const data = ROADMAPS[roleKey];
    if (!data) return;

    // 1. Update Meta Info
    elements.roleTitle.textContent = data.title;
    elements.progressValue.textContent = `${data.completion}%`;
    elements.progressBar.style.width = `${data.completion}%`;

    // 2. Clear Container
    elements.container.innerHTML = '';

    // 3. Render Nodes
    data.nodes.forEach(node => {
        const nodeEl = document.createElement('article');
        nodeEl.className = `node ${node.status}`;
        
        // Use a cleaner HTML structure
        nodeEl.innerHTML = `
            <header class="node-header">
                <span class="node-title">${node.title}</span>
                <span class="node-status">${formatStatus(node.status)}</span>
            </header>
            <p class="node-desc">${node.desc}</p>
        `;
        
        elements.container.appendChild(nodeEl);
    });
}

/**
 * Handles theme switching by changing the body class
 */
function switchTheme(themeClass) {
    // Reset all theme classes
    document.body.classList.remove('theme-java', 'theme-python', 'theme-cpp');
    // Apply new theme
    document.body.classList.add(themeClass);
}

/**
 * Formats status string (e.g., "in-progress" -> "In Progress")
 */
function formatStatus(status) {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Event Listeners
elements.buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const target = e.target;
        const role = target.dataset.role;
        const theme = target.dataset.theme;

        // UI Toggle
        elements.buttons.forEach(b => b.classList.remove('active'));
        target.classList.add('active');

        // Logic Switch
        switchTheme(theme);
        renderRoadmap(role);
        currentRole = role;
    });
});

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const roadmapObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Reveal the road segment originating from this node
                const index = entry.target.dataset.index;
                if (index !== undefined) {
                    const segment = document.getElementById(`road-segment-${index}`);
                    if (segment) segment.classList.add('visible');
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Redefine renderRoadmap to attach observer
    // We overwrite the function defined above to inject the observer logic
    window.renderRoadmap = function(roleKey) {
        const data = ROADMAPS[roleKey];
        if (!data) return;

        // 1. Update Meta Info
        elements.roleTitle.textContent = data.title;
        elements.progressValue.textContent = `${data.completion}%`;
        elements.progressBar.style.width = `${data.completion}%`;

        // 2. Setup Container with SVG Layer
        // We create a dedicated SVG layer and a nodes layer. 
        // The avatar is placed INSIDE the nodes layer to share coordinate space and scroll correctly.
        elements.container.innerHTML = `
            <svg id="roadmap-svg" xmlns="http://www.w3.org/2000/svg"></svg>
            <div id="nodes-layer" style="position: relative; z-index: 2; width: 100%;">
                <div id="user-avatar" class="user-avatar"></div>
            </div>
        `;
        
        const nodesLayer = document.getElementById('nodes-layer');
        const avatarEl = document.getElementById('user-avatar');

        // --- GENERATE CHARACTER SVG ---
        // 3D Superhero Avatar System - Enhanced for Realism & Proportions
        const createAvatar3D = (colors, logoSvg) => {
            // High-fidelity SVG with cylindrical gradients and anatomical paths
            // Using ViewBox 0 0 140 320 for tall, realistic proportions
            return `
            <svg viewBox="0 0 140 320" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
                <defs>
                    <!-- Suit Material: Tech mesh with specular volumetrics -->
                    <linearGradient id="gradSuitMain-${colors.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="${colors.dark}" stop-opacity="0.9"/>
                        <stop offset="25%" stop-color="${colors.primary}"/>
                        <stop offset="50%" stop-color="${colors.light}" stop-opacity="1.0">
                            <!-- Specular Highlight for Roundness -->
                             <animate attributeName="offset" values="0.4;0.6;0.4" dur="4s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="75%" stop-color="${colors.primary}"/>
                        <stop offset="100%" stop-color="${colors.dark}" stop-opacity="0.9"/>
                    </linearGradient>

                    <!-- Metallic Armor Gradient -->
                    <linearGradient id="gradMetal-${colors.id}" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0.1" stop-color="#ffffff" stop-opacity="0.8"/>
                        <stop offset="0.5" stop-color="${colors.light}"/>
                        <stop offset="0.9" stop-color="${colors.dark}"/>
                    </linearGradient>

                    <!-- Visor: Glassy Reflection -->
                    <linearGradient id="gradVisor" x1="0%" y1="0%" x2="0%" y2="100%">
                         <stop offset="0%" stop-color="#000000" />
                         <stop offset="50%" stop-color="#111111" />
                         <stop offset="50.1%" stop-color="#444444" />
                         <stop offset="100%" stop-color="#000000" />
                    </linearGradient>
                    
                    <!-- Glow Filter for Energy Core -->
                    <filter id="glow-${colors.id}" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                        <feColorMatrix in="blur" type="matrix" values="
                            1 0 0 0 0
                            0 1 0 0 0
                            0 0 1 0 0
                            0 0 0 18 -7" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    
                     <!-- Shadow for 3D grounding -->
                    <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#000" stop-opacity="0.6"/>
                        <stop offset="100%" stop-color="#000" stop-opacity="0"/>
                    </radialGradient>
                </defs>

                <!-- Ground Shadow -->
                <ellipse cx="70" cy="305" rx="50" ry="12" fill="url(#shadowGrad)" />

                <!-- == ANATOMY LAYERS == -->
                
                <!-- 1. Legs (Thighs + Shins) - Muscular taper -->
                <g id="legs">
                    <!-- Left Leg -->
                    <path d="M45 180 Q30 200 35 240 Q40 280 40 300 H60 Q65 250 65 240 Q65 210 65 180" fill="url(#gradSuitMain-${colors.id})" stroke="${colors.dark}" stroke-width="1"/>
                    <!-- Right Leg -->
                    <path d="M95 180 Q110 200 105 240 Q100 280 100 300 H80 Q75 250 75 240 Q75 210 75 180" fill="url(#gradSuitMain-${colors.id})" stroke="${colors.dark}" stroke-width="1"/>
                </g>

                <!-- 2. Torso (V-Taper) -->
                <path d="M40 80 L25 100 L35 150 Q40 180 50 190 H90 Q100 180 105 150 L115 100 L100 80 Q70 90 40 80" 
                      fill="url(#gradSuitMain-${colors.id})" filter="drop-shadow(0px 4px 4px rgba(0,0,0,0.3))"/>
                      
                <!-- Chest Armor Plate (Metallic) -->
                <path d="M40 85 Q70 100 100 85 L108 110 Q70 140 32 110 Z" fill="url(#gradMetal-${colors.id})" opacity="0.9"/>
                
                <!-- Abdominal Definition (Shadows) -->
                <path d="M60 140 Q70 150 80 140 V170 Q70 180 60 170 Z" fill="${colors.dark}" opacity="0.3"/>

                <!-- 3. Arms (Biceps/Forearms) -->
                <!-- Left Arm -->
                <g>
                   <ellipse cx="25" cy="100" rx="15" ry="18" fill="url(#gradSuitMain-${colors.id})" /> <!-- Shoulder -->
                   <path d="M15 110 Q5 140 15 160 Q20 180 15 200 H35 Q30 150 35 110" fill="url(#gradSuitMain-${colors.id})"/>
                </g>
                <!-- Right Arm -->
                <g>
                   <ellipse cx="115" cy="100" rx="15" ry="18" fill="url(#gradSuitMain-${colors.id})" /> <!-- Shoulder -->
                   <path d="M125 110 Q135 140 125 160 Q120 180 125 200 H105 Q110 150 105 110" fill="url(#gradSuitMain-${colors.id})"/>
                </g>

                <!-- 4. Head (Helmet) -->
                <g id="helmet" transform="translate(45, 20)">
                    <!-- Cranium -->
                    <rect x="0" y="0" width="50" height="60" rx="20" ry="25" fill="url(#gradSuitMain-${colors.id})" />
                    <!-- Visor -->
                    <path d="M5 25 H45 V40 Q25 50 5 40 Z" fill="url(#gradVisor)" stroke="${colors.light}" stroke-width="1"/>
                    <!-- Side Accents -->
                    <rect x="-2" y="20" width="4" height="20" fill="${colors.light}" />
                    <rect x="48" y="20" width="4" height="20" fill="${colors.light}" />
                </g>
                
                <!-- 5. Logo / Chest Piece -->
                <g id="chestLogo" transform="translate(70, 105) scale(0.25)">
                    <g transform="translate(-100, -100)"> <!-- Center the incoming paths which are approx 200x200 -->
                         ${logoSvg}
                    </g>
                </g>

                <!-- 6. Energy Highlights (Glows) -->
                <circle cx="70" cy="105" r="5" fill="${colors.light}" filter="url(#glow-${colors.id})" opacity="0.8"/>
                <rect x="20" y="200" width="5" height="40" fill="${colors.light}" opacity="0.5" filter="url(#glow-${colors.id})"/> <!-- Wrist blade glow -->

            </svg>
            `;
        };

        let avatarSvgContent = '';
        
        if (roleKey === 'java') {
            // Java: Deep Red, Coffee Cup
            avatarSvgContent = createAvatar3D(
                { 
                    id: 'java',
                    primary: '#c62828', 
                    dark: '#5c0000', 
                    light: '#ff5f52', // Highlight
                    glow: '#ff8a80' 
                },
                // Updated Stylized Coffee Core
                `<path d="M50 140 C20 140 30 70 60 70 H80 L140 70 C160 70 160 110 130 110 L120 110 C110 150 90 160 50 140 Z" fill="white"/>
                 <path d="M60 50 Q70 20 60 0" stroke="white" stroke-width="8" stroke-linecap="round" stroke-opacity="0.8"/>`
            );
        } 
        else if (roleKey === 'python') {
            // Python: Blue/Navy, Snake Logo
            avatarSvgContent = createAvatar3D(
                { 
                    id: 'py',
                    primary: '#0277bd', 
                    dark: '#002c5c', 
                    light: '#58a5f0',
                    glow: '#81d4fa' 
                },
                // Simplified Snakes
                `<path d="M100 20 C60 20 60 70 100 70 H110 V80 H80 C40 80 40 130 80 130 H140 C180 130 180 80 140 80 H130 V70 H160 C200 70 200 20 160 20 H100 Z" fill="white"/>` 
            );
        }
        else if (roleKey === 'cpp') {
            // C++: Purple, Shield/Hex
            avatarSvgContent = createAvatar3D(
                { 
                    id: 'cpp',
                    primary: '#7b1fa2', 
                    dark: '#300050', 
                    light: '#ae52d4',
                    glow: '#e1bee7' 
                },
                // C++ Lettering
                `<text x="100" y="145" font-family="Arial Black" font-weight="900" font-size="90" fill="white" text-anchor="middle">C++</text>`
            );
        }

        avatarEl.innerHTML = avatarSvgContent;

        // Apply Theme Class to Avatar immediately
        // Remove old theme classes first
        avatarEl.classList.remove('theme-java', 'theme-python', 'theme-cpp');
        avatarEl.classList.add(`theme-${roleKey}`);

        // 3. Render Nodes
        data.nodes.forEach((node, index) => {
            const nodeEl = document.createElement('article');
            nodeEl.className = `node ${node.status}`;
            nodeEl.dataset.index = index; // Link for observer
            
            nodeEl.innerHTML = `
                <div class="card-content">
                    <header class="node-header">
                        <span class="node-title">${node.title}</span>
                        <span class="node-status">${formatStatus(node.status)}</span>
                    </header>
                    <p class="node-desc">${node.desc}</p>
                </div>
            `;
            
            // Stagger animation
            nodeEl.style.transitionDelay = `${index * 150}ms`;
            
            nodesLayer.appendChild(nodeEl);
        });

        // 4. Draw SVG Road Geometry
        // Wait for layout paint
        setTimeout(() => {
            const svg = document.getElementById('roadmap-svg');
            const nodes = Array.from(nodesLayer.querySelectorAll('.node'));
            
            // Adjust SVG height to match scrollable content
            svg.style.height = `${nodesLayer.scrollHeight + 100}px`; 

            // Clear old paths if any (though innerHTML cleared it)
            svg.innerHTML = '';

            // Draw paths between nodes
            nodes.forEach((node, idx) => {
                const startNode = node;
                // For linear, we draw from THIS node to the NEXT node (or bottom of container for last)
                 const nextNode = (idx < nodes.length - 1) ? nodes[idx + 1] : null;

                // Container Rect for offset
                const containerRect = nodesLayer.getBoundingClientRect();
                const nodeRect = startNode.getBoundingClientRect();
                
                // Get vertical centers relative to container
                const startY = (nodeRect.top - containerRect.top) + (nodeRect.height / 2);
                
                let endY;
                if (nextNode) {
                    const nextRect = nextNode.getBoundingClientRect();
                    endY = (nextRect.top - containerRect.top) + (nextRect.height / 2);
                } else {
                    // Extend a bit past the last node
                    endY = startY + 100; 
                }
                
                // LINEAR LOGIC: Road is perfectly vertical center relative to SVG.
                // SVG is localized to center by CSS (left: 50%, transform -50%).
                // So inside SVG coordinate space, X=50 is center (assuming width=100 from CSS).
                const centerX = 50; 
                
                // Vertical Line
                const pathData = `M ${centerX} ${startY} L ${centerX} ${endY}`;
                
                // Create SVG Group
                const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
                group.setAttribute("class", `road-segment ${startNode.classList.contains('completed') ? 'completed' : ''}`);
                group.setAttribute("id", `road-segment-${idx}`); // Link for observer
                
                // 1. Base (Wide Border)
                const pathBase = document.createElementNS("http://www.w3.org/2000/svg", "path");
                pathBase.setAttribute("d", pathData);
                pathBase.setAttribute("class", "road-path-base");
                
                // 2. Inner (Mask)
                const pathInner = document.createElementNS("http://www.w3.org/2000/svg", "path");
                pathInner.setAttribute("d", pathData);
                pathInner.setAttribute("class", "road-path-inner");
                
                // 3. Center (Dashed)
                const pathCenter = document.createElementNS("http://www.w3.org/2000/svg", "path");
                pathCenter.setAttribute("d", pathData);
                pathCenter.setAttribute("class", "road-path-center");
                
                group.appendChild(pathBase);
                group.appendChild(pathInner);
                group.appendChild(pathCenter);
                
                svg.appendChild(group);
            });
            
            // Re-attach observers
            nodes.forEach((node) => roadmapObserver.observe(node));

            // --- AVATAR POSITIONING ---
            // Find the "Current Position" node.
            // Logic: The first "in-progress" node. If none, the last "completed". If none, the first node.
            let targetNode = nodes.find(n => n.classList.contains('in-progress'));
            if (!targetNode) {
                // If all completed, stand on the last one.
                const completedNodes = nodes.filter(n => n.classList.contains('completed'));
                if (completedNodes.length > 0) {
                    targetNode = completedNodes[completedNodes.length - 1];
                } else {
                    targetNode = nodes[0];
                }
            }

            if (targetNode && avatarEl) {
                // Calculate position "on the road" next to the card
                const nodeRect = targetNode.getBoundingClientRect();
                const containerRect = nodesLayer.getBoundingClientRect();
                
                // Vertical Center of the node
                const nodeCenterY = (nodeRect.top - containerRect.top) + (nodeRect.height / 2);
                
                // Avatar Dimensions (Defined in CSS: 60x100 approx)
                const avatarHeight = 100;
                
                // LINEAR Position: Center of screen
                // SVG is at 50% left. Avatar is in nodes-layer (width 100%).
                // So center X is containerWidth / 2.
                // Note: The container might have padding. 
                // Let's use the SVG's position logic strictly or just 50% width.
                const centerX = containerRect.width / 2;
                
                // Center the avatar at this X
                const avatarLeft = centerX - 30; // Half of 60px width
                
                // Place feet exactly at the center "road level" plus small offset 
                const avatarTop = nodeCenterY - avatarHeight + 15;

                // Apply
                avatarEl.style.transform = ''; // Clear inline transform to let CSS animation take over
                avatarEl.style.left = `${avatarLeft}px`;
                avatarEl.style.top = `${avatarTop}px`;
            }

        }, 100);
    }

    // Window Resize Handler to redraw road
    window.addEventListener('resize', () => {
        if (window.resizeTimeout) clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(() => {
            const activeBtn = document.querySelector('.role-btn.active');
            if(activeBtn) {
                 if(window.renderRoadmap && typeof currentRole !== 'undefined') window.renderRoadmap(currentRole);
            }
        }, 300);
    });

    // Determine initial active button or default
    const initialBtn = document.querySelector('.role-btn.active') || elements.buttons[0];
    initialBtn.click();
});