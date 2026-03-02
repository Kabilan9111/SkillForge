/**
 * STRICT PYTHON FULL STACK DEVELOPER RESUME ANALYSIS
 * Evaluation Philosophy: Hiring-bar standards, NOT learning standards
 * Bias: Skeptical - prefer false negatives over false positives
 */

const resumeParserService = require('./src/services/resumeParserService');
const skillDetectionService = require('./src/services/skillDetectionService');

// Sample Python Full Stack Developer Resume (Mid-Level Candidate)
const pythonFullStackResume = `
SARAH JOHNSON
Python Full Stack Developer
Email: sarah.johnson@email.com | GitHub: github.com/sarahjohnson | LinkedIn: linkedin.com/in/sarahjohnson

PROFESSIONAL SUMMARY
Full Stack Developer with 3 years of experience building web applications using Python and JavaScript frameworks.
Proficient in Django, React, and database technologies. Experience with cloud platforms and containerization.

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, SQL, HTML, CSS
Backend: Django, Flask, FastAPI, REST APIs, GraphQL
Frontend: React, Redux, Vue.js, Material-UI, Tailwind CSS
Databases: PostgreSQL, MongoDB, Redis
DevOps: Docker, Kubernetes, CI/CD, AWS
Tools: Git, GitHub Actions, Jenkins, Postman, VSCode

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp Solutions | Jan 2024 - Present
- Architected and deployed microservices-based e-commerce platform using Django REST Framework and React
- Implemented GraphQL API serving 50K+ daily requests with 99.9% uptime using Python and Apollo Server
- Optimized PostgreSQL database queries reducing average response time from 800ms to 120ms
- Led migration from monolithic architecture to containerized microservices using Docker and Kubernetes
- Established CI/CD pipeline with GitHub Actions automating testing and deployment to AWS ECS
- Mentored 2 junior developers on Python best practices and system design patterns

Software Engineer | StartupHub Inc | Mar 2022 - Dec 2023
- Developed RESTful APIs using Flask and SQLAlchemy handling 10K+ requests/day
- Built responsive admin dashboard with React, Redux, and TypeScript achieving 95+ Lighthouse score
- Integrated third-party payment systems (Stripe, PayPal) processing $2M+ in transactions
- Implemented Redis caching layer reducing database load by 40%
- Deployed applications to AWS EC2 and S3 with load balancing using Elastic Load Balancer
- Wrote comprehensive unit and integration tests using pytest achieving 85% code coverage

Junior Developer | WebDev Agency | Jun 2021 - Feb 2022
- Built landing pages and WordPress sites using HTML, CSS, JavaScript
- Assisted in Django application maintenance and bug fixes
- Learned Docker basics and participated in Agile sprints
- Collaborated with team using Git version control

PROJECTS

AI-Powered Recipe Recommendation System
- Developed full-stack ML application using FastAPI, React, and TensorFlow
- Implemented collaborative filtering algorithm with 82% prediction accuracy
- Deployed to GCP Cloud Run with auto-scaling handling 1K+ concurrent users
- Utilized MongoDB for recipe storage and Redis for session management
- GitHub: github.com/sarahjohnson/recipe-ai

Personal Portfolio & Blog
- Built with Next.js, TypeScript, and styled-components
- Integrated headless CMS (Contentful) for content management
- Deployed on Vercel with automatic CI/CD from GitHub repository
- Achieved 98+ Lighthouse performance score

EDUCATION
BS Computer Science | State University | 2021
Relevant Coursework: Data Structures, Algorithms, Database Systems, Operating Systems
Senior Project: Built social media analytics dashboard using Python and D3.js

CERTIFICATIONS
- AWS Certified Developer Associate (2023)
- MongoDB Certified Developer (2022)
`;

// Python Full Stack Developer Skill Requirements (Strict Evaluation)
const pythonFullStackRequirements = {
    backend: {
        core: ['Python', 'Django', 'Flask', 'FastAPI', 'REST APIs', 'GraphQL', 'SQLAlchemy', 'ORM'],
        critical: ['API Design', 'Authentication', 'Microservices', 'WebSockets', 'Async Programming']
    },
    frontend: {
        core: ['JavaScript', 'TypeScript', 'React', 'Redux', 'Vue.js', 'HTML5', 'CSS3'],
        critical: ['State Management', 'Component Architecture', 'Performance Optimization', 'Responsive Design']
    },
    databases: {
        core: ['PostgreSQL', 'MongoDB', 'Redis', 'SQL', 'NoSQL'],
        critical: ['Query Optimization', 'Indexing', 'Database Design', 'Migrations', 'Transactions']
    },
    devops: {
        core: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'GCP', 'Azure'],
        critical: ['Container Orchestration', 'Auto-scaling', 'Load Balancing', 'Monitoring', 'Infrastructure as Code']
    },
    systemDesign: {
        critical: ['Microservices Architecture', 'System Scalability', 'Caching Strategies', 'API Gateway', 'Message Queues']
    },
    algorithms: {
        core: ['Data Structures', 'Algorithms', 'Time Complexity', 'Space Complexity'],
        critical: ['Algorithm Design', 'Problem Solving', 'Code Optimization']
    },
    testing: {
        core: ['Unit Testing', 'Integration Testing', 'pytest', 'Jest', 'Test Coverage'],
        critical: ['TDD', 'E2E Testing', 'Performance Testing', 'Mocking']
    },
    tools: {
        core: ['Git', 'GitHub', 'VSCode', 'Postman', 'Linux'],
        critical: ['Code Review', 'Debugging', 'Profiling', 'Version Control Workflows']
    }
};

/**
 * STRICT EVALUATION FUNCTION
 * Applies hiring-bar standards with skepticism bias
 */
function strictEvaluateSkill(skill, evidence, resumeText) {
    const lowerResume = resumeText.toLowerCase();
    const lowerSkill = skill.toLowerCase();
    
    // Check for explicit mentions
    const explicitMention = lowerResume.includes(lowerSkill);
    
    // Check for production evidence keywords
    const productionKeywords = [
        'deployed', 'production', 'architected', 'designed', 'implemented',
        'optimized', 'scaled', 'built', 'developed', 'led', 'migrated'
    ];
    
    const measurableOutcomes = [
        /\d+%/, /\d+ms/, /\d+k\+/, /\d+m\+/, /\d+\.\d+/, /\$\d+/,
        /uptime/, /response time/, /requests/, /users/, /accuracy/
    ];
    
    // Evidence scoring
    let confidenceScore = 0;
    let evidenceLevel = 'none';
    let downgradeReason = null;
    let interviewRisk = 'high';
    let classification = 'Missing';
    let justification = '';
    
    if (!explicitMention) {
        // Skill not mentioned at all
        confidenceScore = 0;
        evidenceLevel = 'none';
        classification = 'Missing';
        justification = `${skill} not mentioned anywhere in resume`;
        interviewRisk = 'high';
        downgradeReason = 'No evidence found';
    } else {
        // Check context around skill mention
        const skillContexts = extractContexts(lowerResume, lowerSkill, 100);
        
        let hasProductionEvidence = false;
        let hasMeasurableOutcome = false;
        let hasArchitectureRole = false;
        let inSkillsListOnly = false;
        
        skillContexts.forEach(context => {
            // Check if only in skills list
            if (context.includes('skills:') || context.includes('technical skills') || 
                context.includes('languages:') || context.includes('backend:') || 
                context.includes('frontend:') || context.includes('databases:') ||
                context.includes('devops:') || context.includes('tools:')) {
                inSkillsListOnly = true;
            }
            
            // Check for production keywords
            if (productionKeywords.some(kw => context.includes(kw))) {
                hasProductionEvidence = true;
            }
            
            // Check for measurable outcomes
            if (measurableOutcomes.some(pattern => pattern.test(context))) {
                hasMeasurableOutcome = true;
            }
            
            // Check for architecture/leadership role
            if (context.includes('architected') || context.includes('designed') || 
                context.includes('led') || context.includes('established')) {
                hasArchitectureRole = true;
            }
        });
        
        // STRICT SCORING LOGIC
        if (inSkillsListOnly && !hasProductionEvidence) {
            // Listed but not demonstrated - CAP AT 40%
            confidenceScore = Math.min(40, 35);
            evidenceLevel = 'weak';
            classification = 'Weak';
            justification = `${skill} listed in skills section but no production usage demonstrated`;
            interviewRisk = 'high';
            downgradeReason = 'Skills list mention only, no real-world application shown';
        } else if (hasProductionEvidence && !hasMeasurableOutcome) {
            // Used in production but no metrics
            confidenceScore = 55;
            evidenceLevel = 'implicit';
            classification = 'Developing';
            justification = `${skill} used in production context but lacks quantifiable impact metrics`;
            interviewRisk = 'medium';
            downgradeReason = 'No measurable outcomes to validate depth';
        } else if (hasProductionEvidence && hasMeasurableOutcome && !hasArchitectureRole) {
            // Production use with metrics but no architecture role
            confidenceScore = 70;
            evidenceLevel = 'explicit';
            classification = 'Developing';
            justification = `${skill} demonstrated in production with measurable outcomes`;
            interviewRisk = 'medium';
        } else if (hasArchitectureRole && hasMeasurableOutcome) {
            // Architecture role with metrics - HIGH CONFIDENCE
            confidenceScore = 85;
            evidenceLevel = 'explicit';
            classification = 'Strong';
            justification = `${skill} expertise proven through architecture decisions and measurable impact`;
            interviewRisk = 'low';
        } else {
            // Fallback: minimal evidence
            confidenceScore = 30;
            evidenceLevel = 'weak';
            classification = 'Weak';
            justification = `${skill} mentioned but insufficient context for validation`;
            interviewRisk = 'high';
            downgradeReason = 'Ambiguous or shallow mention';
        }
    }
    
    return {
        skill_name: skill,
        confidence_score: confidenceScore,
        evidence_level: evidenceLevel,
        classification: classification,
        justification: justification,
        interview_risk: interviewRisk,
        downgrade_reason: downgradeReason,
        priority: determinePriority(skill, classification)
    };
}

/**
 * Extract contexts around skill mentions
 */
function extractContexts(text, skill, windowSize) {
    const contexts = [];
    let index = text.indexOf(skill);
    
    while (index !== -1) {
        const start = Math.max(0, index - windowSize);
        const end = Math.min(text.length, index + skill.length + windowSize);
        contexts.push(text.substring(start, end));
        index = text.indexOf(skill, index + 1);
    }
    
    return contexts;
}

/**
 * Determine priority for interview preparation
 */
function determinePriority(skill, classification) {
    const criticalSkills = [
        'Python', 'Django', 'React', 'PostgreSQL', 'REST APIs',
        'Microservices', 'System Design', 'Algorithms', 'Docker'
    ];
    
    if (criticalSkills.some(cs => skill.includes(cs))) {
        return 'critical';
    }
    
    if (classification === 'Strong' || classification === 'Developing') {
        return 'high-impact';
    }
    
    return 'optional';
}

/**
 * Run strict analysis
 */
function runStrictAnalysis() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  STRICT PYTHON FULL STACK DEVELOPER RESUME ANALYSIS');
    console.log('  Evaluation Standard: Hiring Bar (NOT Learning Bar)');
    console.log('  Bias: Skeptical - Prefer False Negatives');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // Parse resume
    const resumeStructure = resumeParserService.parseResumeStructure(pythonFullStackResume);
    
    console.log('📄 RESUME PARSED');
    console.log(`   Sections: ${Object.keys(resumeStructure.sections).filter(k => resumeStructure.sections[k].lines.length > 0).join(', ')}\n`);
    
    // Flatten all required skills
    const allSkills = [];
    Object.values(pythonFullStackRequirements).forEach(category => {
        if (category.core) allSkills.push(...category.core);
        if (category.critical) allSkills.push(...category.critical);
    });
    
    const uniqueSkills = [...new Set(allSkills)];
    
    console.log(`🎯 EVALUATING ${uniqueSkills.length} CRITICAL SKILLS FOR PYTHON FULL STACK ROLE\n`);
    
    // Evaluate each skill
    const results = {
        strong: [],
        developing: [],
        weak: [],
        missing: []
    };
    
    uniqueSkills.forEach(skill => {
        const evaluation = strictEvaluateSkill(skill, [], pythonFullStackResume);
        
        switch (evaluation.classification) {
            case 'Strong':
                results.strong.push(evaluation);
                break;
            case 'Developing':
                results.developing.push(evaluation);
                break;
            case 'Weak':
                results.weak.push(evaluation);
                break;
            default:
                results.missing.push(evaluation);
        }
    });
    
    // Display results
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  EVALUATION RESULTS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.log(`✅ STRONG (Interview-Ready): ${results.strong.length} skills`);
    console.log(`🔄 DEVELOPING (Needs Verification): ${results.developing.length} skills`);
    console.log(`⚠️  WEAK (High Risk): ${results.weak.length} skills`);
    console.log(`❌ MISSING (Deal-breaker if critical): ${results.missing.length} skills\n`);
    
    // Show details for each category
    if (results.strong.length > 0) {
        console.log('─────────────────────────────────────────────────────────────');
        console.log('✅ STRONG SKILLS (Low Interview Risk)');
        console.log('─────────────────────────────────────────────────────────────');
        results.strong.forEach(s => {
            console.log(`\n  ${s.skill_name} [${s.confidence_score}/100]`);
            console.log(`    Priority: ${s.priority.toUpperCase()}`);
            console.log(`    Evidence: ${s.evidence_level}`);
            console.log(`    Justification: ${s.justification}`);
        });
        console.log('\n');
    }
    
    if (results.developing.length > 0) {
        console.log('─────────────────────────────────────────────────────────────');
        console.log('🔄 DEVELOPING SKILLS (Medium Interview Risk)');
        console.log('─────────────────────────────────────────────────────────────');
        results.developing.forEach(s => {
            console.log(`\n  ${s.skill_name} [${s.confidence_score}/100]`);
            console.log(`    Priority: ${s.priority.toUpperCase()}`);
            console.log(`    Evidence: ${s.evidence_level}`);
            console.log(`    Justification: ${s.justification}`);
            if (s.downgrade_reason) {
                console.log(`    ⚠️  Downgrade Reason: ${s.downgrade_reason}`);
            }
        });
        console.log('\n');
    }
    
    if (results.weak.length > 0) {
        console.log('─────────────────────────────────────────────────────────────');
        console.log('⚠️  WEAK SKILLS (High Interview Risk - Avoid Over-claiming)');
        console.log('─────────────────────────────────────────────────────────────');
        results.weak.slice(0, 10).forEach(s => {
            console.log(`\n  ${s.skill_name} [${s.confidence_score}/100]`);
            console.log(`    Priority: ${s.priority.toUpperCase()}`);
            console.log(`    Evidence: ${s.evidence_level}`);
            console.log(`    Justification: ${s.justification}`);
            console.log(`    ⚠️  Downgrade Reason: ${s.downgrade_reason}`);
        });
        if (results.weak.length > 10) {
            console.log(`\n  ... and ${results.weak.length - 10} more weak skills`);
        }
        console.log('\n');
    }
    
    if (results.missing.length > 0) {
        console.log('─────────────────────────────────────────────────────────────');
        console.log('❌ MISSING CRITICAL SKILLS (Deal-breakers for Senior Roles)');
        console.log('─────────────────────────────────────────────────────────────');
        const criticalMissing = results.missing.filter(s => s.priority === 'critical');
        if (criticalMissing.length > 0) {
            console.log('\n  CRITICAL GAPS:');
            criticalMissing.forEach(s => {
                console.log(`    • ${s.skill_name} - ${s.justification}`);
            });
        }
        console.log(`\n  Total Missing: ${results.missing.length} skills\n`);
    }
    
    // Overall assessment
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  HIRING RECOMMENDATION');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const strongRatio = results.strong.length / uniqueSkills.length;
    const riskScore = (results.weak.length * 0.5 + results.missing.length * 1.0) / uniqueSkills.length;
    
    let recommendation = '';
    if (strongRatio >= 0.6 && riskScore < 0.2) {
        recommendation = '✅ STRONG HIRE - Proceed to Technical Interview';
    } else if (strongRatio >= 0.4 && riskScore < 0.4) {
        recommendation = '🔄 CONDITIONAL - Interview with Focus on Weak Areas';
    } else {
        recommendation = '❌ REJECT or DOWNLEVEL - Insufficient Evidence of Production Skills';
    }
    
    console.log(`  ${recommendation}\n`);
    console.log(`  Strong Skills Ratio: ${(strongRatio * 100).toFixed(1)}%`);
    console.log(`  Risk Score: ${(riskScore * 100).toFixed(1)}%`);
    console.log(`  Critical Missing: ${results.missing.filter(s => s.priority === 'critical').length}\n`);
    
    // Export JSON
    const jsonOutput = {
        candidate: 'Sarah Johnson',
        role: 'Python Full Stack Developer',
        evaluation_date: new Date().toISOString(),
        evaluation_standard: 'Hiring Bar (NOT Learning Bar)',
        bias: 'Skeptical - Prefer False Negatives',
        summary: {
            total_skills_evaluated: uniqueSkills.length,
            strong: results.strong.length,
            developing: results.developing.length,
            weak: results.weak.length,
            missing: results.missing.length,
            strong_ratio: strongRatio,
            risk_score: riskScore,
            recommendation: recommendation
        },
        skills: {
            strong: results.strong,
            developing: results.developing,
            weak: results.weak,
            missing: results.missing
        }
    };
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  JSON OUTPUT (for programmatic use)');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(JSON.stringify(jsonOutput, null, 2));
}

// Run analysis
runStrictAnalysis();
