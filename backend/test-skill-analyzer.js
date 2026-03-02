/**
 * Test Script for Evidence-Based Resume Skill Analyzer
 * Tests the new implementation with various resume scenarios
 */

const resumeParserService = require('./src/services/resumeParserService');
const skillDetectionService = require('./src/services/skillDetectionService');

// Sample resume text for testing
const sampleResumes = {
    fullStack: `
        John Doe
        Full Stack Developer
        john.doe@email.com | +1-555-0123
        GitHub: https://github.com/johndoe
        LinkedIn: https://linkedin.com/in/johndoe
        
        PROFESSIONAL SUMMARY
        Experienced Full Stack Developer with 5 years of expertise in building scalable web applications
        using modern technologies. Passionate about clean code and agile methodologies.
        
        TECHNICAL SKILLS
        Languages: JavaScript ES6, Python, TypeScript, HTML5, CSS3
        Frontend: React.js, Next.js, Redux, Material-UI
        Backend: Node.js, Express.js, Django, REST APIs
        Databases: PostgreSQL, MongoDB, Redis
        DevOps: Docker, AWS (EC2, S3, RDS), CI/CD, GitHub Actions
        Tools: Git, npm, Webpack, Jest
        
        PROFESSIONAL EXPERIENCE
        Senior Full Stack Developer | Tech Corp | 2021-Present
        - Developed and deployed RESTful APIs using Node.js and Express serving 1M+ requests daily
        - Built responsive frontend applications with React and TypeScript
        - Implemented JWT-based authentication and role-based access control
        - Optimized PostgreSQL database queries reducing latency by 40%
        - Set up CI/CD pipelines using GitHub Actions for automated testing and deployment
        - Containerized applications using Docker and deployed to AWS ECS
        - Collaborated with team using Git for version control and code reviews
        
        Full Stack Developer | StartupCo | 2019-2021
        - Created microservices architecture using Node.js and MongoDB
        - Integrated third-party APIs including Stripe, SendGrid, and Twilio
        - Wrote comprehensive unit tests using Jest achieving 85% code coverage
        - Managed application state using Redux and React Hooks
        - Used npm for package management and dependency resolution
        
        PROJECTS
        E-Commerce Platform | https://github.com/johndoe/ecommerce
        - Built full-stack application with React frontend and Django REST backend
        - Implemented real-time inventory updates using WebSockets
        - Used Redis for caching and session management
        - Deployed on AWS with load balancing and auto-scaling
        Technologies: React, Django, PostgreSQL, Redis, Docker, AWS
        
        Task Management App
        - Developed with Next.js for server-side rendering
        - Integrated GraphQL API for efficient data fetching
        - Used TypeScript for type safety
        - Implemented OAuth authentication with Google and GitHub
        
        EDUCATION
        Bachelor of Science in Computer Science
        University of Technology | 2015-2019
    `,
    
    dataScientist: `
        Jane Smith
        Data Scientist
        jane.smith@email.com
        
        SUMMARY
        Data Scientist with expertise in machine learning and statistical analysis.
        Proficient in Python and deep learning frameworks.
        
        SKILLS
        Python, Pandas, NumPy, Scikit-learn, TensorFlow, PyTorch
        SQL, Jupyter Notebooks, Matplotlib, Seaborn
        Git, Docker
        
        EXPERIENCE
        Data Scientist | AI Research Lab | 2020-Present
        - Built machine learning models using Scikit-learn for customer segmentation
        - Developed deep learning models with TensorFlow and Keras
        - Performed data analysis using Pandas and NumPy
        - Created data visualizations with Matplotlib and Seaborn
        - Used Jupyter Notebooks for exploratory data analysis
        - Deployed ML models to production using Docker containers
        - Managed code with Git and collaborated via GitHub
        
        PROJECTS
        Image Classification System
        - Built CNN using PyTorch for image recognition
        - Achieved 95% accuracy on test dataset
        - Used GPU acceleration for training
        - Technologies: Python, PyTorch, NumPy, Jupyter
        
        EDUCATION
        M.S. in Data Science | 2018-2020
    `,
    
    minimalResume: `
        Bob Johnson
        bob@email.com
        
        EDUCATION
        B.S. Computer Science | 2022
        
        SKILLS
        Python, HTML, CSS
        
        PROJECTS
        Built a simple website using HTML and CSS
        Created a calculator in Python
    `
};

// Test cases
async function runTests() {
    console.log('='.repeat(80));
    console.log('EVIDENCE-BASED RESUME SKILL ANALYZER - TEST SUITE');
    console.log('='.repeat(80));
    console.log();
    
    // Test 1: Full Stack Developer Resume
    console.log('TEST 1: Full Stack Developer Resume');
    console.log('-'.repeat(80));
    await testResume(sampleResumes.fullStack, 'Full-Stack Developer', 'Intermediate');
    
    // Test 2: Data Scientist Resume
    console.log('\n' + '='.repeat(80));
    console.log('TEST 2: Data Scientist Resume');
    console.log('-'.repeat(80));
    await testResume(sampleResumes.dataScientist, 'Data Scientist', 'Intermediate');
    
    // Test 3: Minimal Resume
    console.log('\n' + '='.repeat(80));
    console.log('TEST 3: Minimal Skills Resume');
    console.log('-'.repeat(80));
    await testResume(sampleResumes.minimalResume, 'Full-Stack Developer', 'Beginner');
    
    console.log('\n' + '='.repeat(80));
    console.log('ALL TESTS COMPLETED');
    console.log('='.repeat(80));
}

async function testResume(resumeText, track, level) {
    // Parse resume
    const structure = resumeParserService.parseResumeStructure(resumeText);
    
    console.log('Resume Structure:');
    console.log(`  Total Lines: ${structure.lines.length}`);
    console.log(`  Sections Found:`);
    for (const [section, data] of Object.entries(structure.sections)) {
        if (data.lines.length > 0) {
            console.log(`    - ${section}: ${data.lines.length} lines`);
        }
    }
    console.log(`  URLs: ${structure.urls.all.length} (GitHub: ${structure.urls.github.length})`);
    console.log();
    
    // Get required skills
    const SKILL_REQUIREMENTS = {
        'Full-Stack Developer': {
            'Beginner': {
                frontend: ['HTML5', 'CSS3', 'JavaScript ES6', 'DOM Manipulation', 'Responsive Design'],
                backend: ['Node.js', 'Express.js', 'REST APIs', 'JSON'],
                database: ['SQL Basics', 'MongoDB Basics'],
                tools: ['Git', 'VS Code', 'npm'],
                dsa: ['Arrays', 'Strings', 'Basic Algorithms']
            },
            'Intermediate': {
                frontend: ['React.js', 'State Management', 'Hooks', 'Component Design', 'TypeScript'],
                backend: ['Authentication', 'Middleware', 'Error Handling', 'API Design'],
                database: ['PostgreSQL', 'Sequelize/Mongoose', 'Indexing', 'Transactions'],
                tools: ['Docker', 'Postman', 'ESLint', 'Webpack'],
                dsa: ['Linked Lists', 'Stack', 'Queue', 'Trees', 'HashMaps', 'Searching', 'Sorting']
            }
        },
        'Data Scientist': {
            'Beginner': {
                programming: ['Python Basics', 'NumPy', 'Pandas', 'Jupyter Notebooks'],
                math: ['Statistics', 'Probability', 'Linear Algebra'],
                visualization: ['Matplotlib', 'Seaborn'],
                tools: ['Anaconda', 'Git'],
                dsa: ['Arrays', 'Strings', 'Basic Algorithms']
            },
            'Intermediate': {
                ml: ['Scikit-learn', 'Regression', 'Classification', 'Clustering', 'Feature Engineering'],
                deeplearning: ['TensorFlow', 'Keras', 'Neural Networks'],
                tools: ['SQL', 'Tableau', 'Docker'],
                dsa: ['Trees', 'HashMaps', 'Searching', 'Sorting', 'Recursion']
            }
        }
    };
    
    const requiredSkills = SKILL_REQUIREMENTS[track]?.[level] || {};
    
    // Analyze skills
    const analysis = skillDetectionService.analyzeSkills(structure, requiredSkills);
    
    // Display results
    console.log(`Analysis for ${track} - ${level} Level:`);
    console.log();
    
    console.log(`📊 Overall Statistics:`);
    console.log(`  Total Skills Detected: ${analysis.allDetected.length}`);
    console.log(`  Strong Skills: ${analysis.strong.length}`);
    console.log(`  Weak Skills: ${analysis.weak.length}`);
    console.log(`  Missing Skills: ${analysis.missing.length}`);
    console.log();
    
    // Show strong skills with evidence
    if (analysis.strong.length > 0) {
        console.log(`✅ STRONG SKILLS (${analysis.strong.length}):`);
        analysis.strong.slice(0, 5).forEach(skill => {
            console.log(`  • ${skill.skill} (Confidence: ${(skill.confidence * 100).toFixed(0)}%)`);
            console.log(`    Evidence Count: ${skill.evidenceCount}`);
            skill.evidence.slice(0, 2).forEach(ev => {
                console.log(`    - [${ev.type}] ${ev.reason}`);
                if (ev.line.length < 100) {
                    console.log(`      Line: "${ev.line}"`);
                }
            });
        });
        if (analysis.strong.length > 5) {
            console.log(`  ... and ${analysis.strong.length - 5} more`);
        }
        console.log();
    }
    
    // Show weak skills
    if (analysis.weak.length > 0) {
        console.log(`⚠️  WEAK SKILLS (${analysis.weak.length}):`);
        analysis.weak.slice(0, 3).forEach(skill => {
            console.log(`  • ${skill.skill} (Confidence: ${(skill.confidence * 100).toFixed(0)}%)`);
            console.log(`    Evidence Count: ${skill.evidenceCount}`);
            skill.evidence.slice(0, 1).forEach(ev => {
                console.log(`    - [${ev.type}] ${ev.reason}`);
            });
        });
        if (analysis.weak.length > 3) {
            console.log(`  ... and ${analysis.weak.length - 3} more`);
        }
        console.log();
    }
    
    // Show missing skills
    if (analysis.missing.length > 0) {
        console.log(`❌ MISSING SKILLS (${analysis.missing.length}):`);
        analysis.missing.slice(0, 5).forEach(skill => {
            console.log(`  • ${skill.skill}`);
        });
        if (analysis.missing.length > 5) {
            console.log(`  ... and ${analysis.missing.length - 5} more`);
        }
        console.log();
    }
    
    // Test inference engine
    console.log('🔍 INFERENCE ENGINE EXAMPLES:');
    const inferredSkills = [];
    for (const [skill, evidence] of Object.entries(analysis.allEvidence)) {
        const inferredEvidence = evidence.filter(e => e.type === 'inferred');
        if (inferredEvidence.length > 0) {
            inferredSkills.push({ skill, evidence: inferredEvidence });
        }
    }
    
    if (inferredSkills.length > 0) {
        inferredSkills.slice(0, 3).forEach(({ skill, evidence }) => {
            console.log(`  ${skill}:`);
            evidence.slice(0, 2).forEach(ev => {
                console.log(`    - ${ev.reason}`);
            });
        });
    } else {
        console.log('  No skills were inferred (all explicitly detected)');
    }
    console.log();
}

// Run tests
runTests().catch(console.error);
