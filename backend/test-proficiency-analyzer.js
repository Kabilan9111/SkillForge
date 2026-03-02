/**
 * Enhanced Test Script for Proficiency-Based Resume Skill Analyzer
 * Tests semantic parsing, context awareness, and proficiency scoring
 */

const resumeParserService = require('./src/services/resumeParserService');
const skillDetectionService = require('./src/services/skillDetectionService');

// Enhanced sample resume with clear proficiency indicators
const advancedResume = `
    Sarah Johnson
    Senior Full Stack Engineer
    sarah.johnson@email.com | +1-555-0199
    GitHub: https://github.com/sarahjohnson
    Portfolio: https://sarahjohnson.dev
    
    PROFESSIONAL SUMMARY
    Senior Full Stack Engineer with 5+ years of experience building scalable web applications.
    Expert in React, Node.js, and cloud infrastructure. Led multiple teams and architected
    production systems serving millions of users. Strong advocate for clean code, testing,
    and DevOps best practices.
    
    TECHNICAL SKILLS
    Expert: JavaScript/TypeScript, React, Node.js, Python, PostgreSQL, AWS
    Proficient: Docker, Kubernetes, CI/CD, Redis, GraphQL, MongoDB
    Familiar: Terraform, Ansible, Go
    
    PROFESSIONAL EXPERIENCE
    
    Senior Software Engineer | TechCorp Inc | 2022-Present
    • Architected and built a microservices-based e-commerce platform using Node.js and Express
      serving 2M+ daily active users with 99.9% uptime
    • Designed and implemented RESTful APIs and GraphQL endpoints for mobile and web clients
    • Optimized PostgreSQL database queries reducing average response time by 60% through
      indexing, query optimization, and connection pooling
    • Led migration from monolith to microservices, containerizing applications with Docker
      and orchestrating with Kubernetes on AWS EKS
    • Implemented JWT-based authentication and role-based access control (RBAC) for secure
      user management across 50+ microservices
    • Built CI/CD pipelines using GitHub Actions for automated testing, building, and deployment
      to production environments with zero-downtime deployments
    • Mentored 5 junior developers on React best practices, TypeScript patterns, and testing strategies
    • Wrote comprehensive unit and integration tests achieving 90% code coverage using Jest and Supertest
    • Used Git for version control with feature branch workflow, pull request reviews, and automated checks
    • Deployed and managed cloud infrastructure on AWS including EC2, RDS, S3, CloudFront, and Lambda
    • Implemented real-time features using WebSockets for live notifications and chat functionality
    • Set up monitoring and alerting using Prometheus and Grafana for system health tracking
    
    Full Stack Developer | StartupXYZ | 2020-2022
    • Developed full-stack features using React for frontend and Python Django for backend APIs
    • Built responsive user interfaces with React Hooks, Context API, and Material-UI components
    • Created RESTful APIs in Django with Django REST Framework for mobile app integration
    • Implemented user authentication using OAuth 2.0 and social login providers
    • Worked with MongoDB for document storage and Redis for session management and caching
    • Used Docker for local development environments ensuring consistency across team
    • Participated in Agile sprints with daily standups and bi-weekly retrospectives
    • Integrated third-party APIs including Stripe for payments and SendGrid for email
    • Used npm and pip for dependency management in JavaScript and Python projects
    • Performed database migrations and managed schema changes using Django ORM
    
    Junior Developer | WebSolutions | 2019-2020
    • Built web pages using HTML5, CSS3, and JavaScript ES6
    • Assisted in developing features for React-based single-page applications
    • Learned Git workflows and contributed to team repositories on GitHub
    • Fixed bugs and added small features to Node.js backend services
    • Wrote SQL queries for reporting and data analysis tasks
    • Participated in code reviews and learned testing best practices
    
    PROJECTS
    
    DevOps Automation Platform | https://github.com/sarahjohnson/devops-automation
    • Built infrastructure automation tool using Python and Terraform for AWS provisioning
    • Implemented CI/CD pipelines for multi-environment deployments (dev, staging, production)
    • Containerized all services with Docker and deployed using Kubernetes Helm charts
    • Technologies: Python, FastAPI, Terraform, Ansible, Docker, Kubernetes, AWS, PostgreSQL
    
    Real-Time Analytics Dashboard
    • Created real-time analytics dashboard using React, TypeScript, and WebSockets
    • Built backend API with Node.js, Express, and Redis for data aggregation
    • Implemented performance optimizations reducing initial load time by 50%
    • Technologies: React, TypeScript, Node.js, Express, Redis, WebSockets, Chart.js
    
    EDUCATION
    Bachelor of Science in Computer Science | MIT | 2015-2019
    
    CERTIFICATIONS
    AWS Certified Solutions Architect - Associate (2023)
    Kubernetes Application Developer (CKAD) (2022)
`;

// Test resume with implicit skills (no explicit skills section)
const contextDrivenResume = `
    Mike Chen
    Full Stack Developer
    mike.chen@email.com
    GitHub: https://github.com/mikechen
    
    SUMMARY
    Developer with 3 years building web applications and APIs. Passionate about
    clean code and continuous learning.
    
    EXPERIENCE
    
    Developer | TechStart | 2021-Present
    • Built RESTful APIs using Node.js and Express for mobile application backend
    • Used Git and GitHub for version control and collaboration with distributed team
    • Deployed applications to production using Docker containers on AWS EC2
    • Wrote SQL queries and designed database schemas for PostgreSQL
    • Implemented user authentication with JWT tokens and session management
    • Created responsive web interfaces with React and modern JavaScript
    • Used npm to manage project dependencies and run build scripts
    • Performed code reviews and followed Agile development practices
    • Optimized API performance through caching strategies with Redis
    • Set up automated testing and deployment pipelines using GitHub Actions
    
    PROJECTS
    Task Management App
    • Built full-stack application with React frontend and Node.js backend
    • Integrated PostgreSQL database with user data and task storage
    • Deployed to AWS using Docker and set up CI/CD pipeline
    • Used HTML5, CSS3, and JavaScript ES6 for frontend development
    
    EDUCATION
    B.S. Computer Science | 2017-2021
`;

const SKILL_REQUIREMENTS = {
    'Full-Stack Developer': {
        'Intermediate': {
            frontend: ['React.js', 'State Management', 'Hooks', 'Component Design', 'TypeScript'],
            backend: ['Authentication', 'Middleware', 'Error Handling', 'API Design'],
            database: ['PostgreSQL', 'Sequelize/Mongoose', 'Indexing', 'Transactions'],
            tools: ['Docker', 'Postman', 'ESLint', 'Webpack'],
            dsa: ['Linked Lists', 'Stack', 'Queue', 'Trees', 'HashMaps', 'Searching', 'Sorting']
        }
    }
};

async function runEnhancedTests() {
    console.log('='.repeat(90));
    console.log('ENHANCED PROFICIENCY-BASED SKILL ANALYZER - TEST SUITE');
    console.log('='.repeat(90));
    console.log();
    
    // Test 1: Advanced resume with clear proficiency indicators
    console.log('TEST 1: Senior Engineer Resume (Clear Proficiency Levels)');
    console.log('-'.repeat(90));
    await testResumeWithProficiency(advancedResume, 'Advanced Resume');
    
    // Test 2: Context-driven resume without explicit skills section
    console.log('\n' + '='.repeat(90));
    console.log('TEST 2: Context-Driven Resume (No Explicit Skills Section)');
    console.log('-'.repeat(90));
    await testResumeWithProficiency(contextDrivenResume, 'Context-Driven Resume');
    
    console.log('\n' + '='.repeat(90));
    console.log('ALL ENHANCED TESTS COMPLETED');
    console.log('='.repeat(90));
}

async function testResumeWithProficiency(resumeText, testName) {
    const structure = resumeParserService.parseResumeStructure(resumeText);
    const requiredSkills = SKILL_REQUIREMENTS['Full-Stack Developer']['Intermediate'];
    const analysis = skillDetectionService.analyzeSkills(structure, requiredSkills);
    
    console.log(`\n📄 Resume: ${testName}`);
    console.log(`   Total Lines: ${structure.lines.length}`);
    console.log(`   Sections: ${Object.keys(structure.sections).filter(k => structure.sections[k].lines.length > 0).join(', ')}`);
    console.log(`   GitHub Links: ${structure.urls.github.length}`);
    console.log();
    
    // Display proficiency breakdown
    console.log('📊 PROFICIENCY BREAKDOWN:');
    console.log(`   Strong Skills:     ${analysis.strong.length} (Proficient level)`);
    console.log(`   Developing Skills: ${(analysis.developing || []).length} (Intermediate level)`);
    console.log(`   Basic Skills:      ${(analysis.basic || []).length} (Beginner level)`);
    console.log(`   Missing Skills:    ${analysis.missing.length} (Not detected)`);
    console.log(`   Total Detected:    ${analysis.allDetected.length} unique skills`);
    console.log();
    
    // Show strong skills with proficiency details
    if (analysis.strong.length > 0) {
        console.log('✅ STRONG SKILLS (Proficient):');
        analysis.strong.slice(0, 5).forEach((skill, idx) => {
            console.log(`\n   ${idx + 1}. ${skill.skill} → Detected as: ${skill.detectedAs}`);
            console.log(`      Proficiency Score: ${skill.proficiencyScore}/100`);
            console.log(`      Evidence Count: ${skill.evidenceCount}`);
            console.log(`      Confidence: ${(skill.confidence * 100).toFixed(0)}%`);
            
            if (skill.scoreBreakdown) {
                console.log(`      Score Breakdown:`);
                console.log(`         • Frequency: ${skill.scoreBreakdown.frequency}/100`);
                console.log(`         • Depth: ${skill.scoreBreakdown.depth}/100`);
                console.log(`         • Context: ${skill.scoreBreakdown.context}/100`);
                console.log(`         • Placement: ${skill.scoreBreakdown.placement}/100`);
                console.log(`         • Impact: ${skill.scoreBreakdown.impact}/100`);
                console.log(`         • Recency: ${skill.scoreBreakdown.recency}/100`);
            }
            
            console.log(`      Justification: ${skill.justification}`);
            
            // Show first 2 evidence items
            if (skill.evidence && skill.evidence.length > 0) {
                console.log(`      Evidence Samples:`);
                skill.evidence.slice(0, 2).forEach(ev => {
                    console.log(`         [${ev.type}] ${ev.reason}`);
                    if (ev.line.length < 100) {
                        console.log(`           "${ev.line}"`);
                    }
                });
            }
        });
        
        if (analysis.strong.length > 5) {
            console.log(`\n   ... and ${analysis.strong.length - 5} more strong skills`);
        }
    }
    
    // Show developing skills
    if (analysis.developing && analysis.developing.length > 0) {
        console.log('\n\n⚡ DEVELOPING SKILLS (Intermediate):');
        analysis.developing.slice(0, 3).forEach((skill, idx) => {
            console.log(`\n   ${idx + 1}. ${skill.skill} (Score: ${skill.proficiencyScore}/100)`);
            console.log(`      ${skill.justification}`);
            console.log(`      Evidence: ${skill.evidenceCount} mention(s)`);
        });
    }
    
    // Show basic skills
    if (analysis.basic && analysis.basic.length > 0) {
        console.log('\n\n📚 BASIC SKILLS (Beginner):');
        analysis.basic.slice(0, 3).forEach((skill, idx) => {
            console.log(`   ${idx + 1}. ${skill.skill} (Score: ${skill.proficiencyScore}/100)`);
            console.log(`      ${skill.justification}`);
        });
    }
    
    // Show missing skills
    if (analysis.missing.length > 0) {
        console.log('\n\n❌ MISSING SKILLS:');
        const missing = analysis.missing.slice(0, 5);
        missing.forEach(skill => {
            console.log(`   • ${skill.skill}`);
        });
        if (analysis.missing.length > 5) {
            console.log(`   ... and ${analysis.missing.length - 5} more`);
        }
    }
    
    // Test semantic inference
    console.log('\n\n🧠 SEMANTIC INFERENCE EXAMPLES:');
    const inferredSkills = [];
    for (const [skill, evidence] of Object.entries(analysis.allEvidence)) {
        const inferredEvidence = evidence.filter(e => e.type === 'inferred');
        if (inferredEvidence.length > 0) {
            inferredSkills.push({ skill, evidence: inferredEvidence });
        }
    }
    
    if (inferredSkills.length > 0) {
        inferredSkills.slice(0, 4).forEach(({ skill, evidence }) => {
            console.log(`   ${skill}:`);
            evidence.slice(0, 2).forEach(ev => {
                console.log(`      → ${ev.reason}`);
            });
        });
    } else {
        console.log('   All skills explicitly detected from resume content');
    }
    
    // Context-awareness check
    console.log('\n\n🎯 CONTEXT-AWARENESS VALIDATION:');
    const contextChecks = [
        { skill: 'Git', reason: 'GitHub link or git commands' },
        { skill: 'Version Control', reason: 'Git/GitHub usage' },
        { skill: 'CI/CD', reason: 'Deployment pipeline descriptions' },
        { skill: 'Docker', reason: 'Containerization mentions' },
        { skill: 'REST API', reason: 'API development descriptions' },
        { skill: 'Authentication', reason: 'Auth implementation descriptions' }
    ];
    
    contextChecks.forEach(check => {
        const detected = analysis.allDetected.includes(check.skill);
        const status = detected ? '✅' : '⚠️';
        const level = detected ? getProficiencyLevel(analysis, check.skill) : 'Not Detected';
        console.log(`   ${status} ${check.skill}: ${level}`);
        if (detected) {
            console.log(`      Reason: ${check.reason}`);
        }
    });
    
    console.log();
}

function getProficiencyLevel(analysis, skillName) {
    if (analysis.strong.some(s => s.skill === skillName || s.detectedAs === skillName)) {
        return 'Strong (Proficient)';
    }
    if (analysis.developing && analysis.developing.some(s => s.skill === skillName || s.detectedAs === skillName)) {
        return 'Developing (Intermediate)';
    }
    if (analysis.basic && analysis.basic.some(s => s.skill === skillName || s.detectedAs === skillName)) {
        return 'Basic (Beginner)';
    }
    return 'Not Detected';
}

// Run enhanced tests
runEnhancedTests().catch(console.error);
