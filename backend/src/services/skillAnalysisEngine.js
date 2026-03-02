/**
 * SkillForge Elite Skill Analysis Engine
 * Six-Stage Intelligence Pipeline for Enterprise-Grade Resume Analysis
 * 
 * Pipeline Stages:
 * 1. Document Ingestion & Structural Parsing
 * 2. Explicit Skill Extraction (Resume Parser)
 * 3. Skill Normalization (Standardized Taxonomy)
 * 4. Implicit Skill Inference (Project/Experience Analysis)
 * 5. Role-Specific Comparison & Market Demand
 * 6. Synthesis & Reasoning Layer
 */

const fs = require('fs').promises;
const path = require('path');

// ============================================
// COMPREHENSIVE SKILL TAXONOMY
// ============================================

const SKILL_TAXONOMY = {
    // Programming Languages
    languages: {
        'JavaScript': ['JS', 'Javascript', 'ECMAScript', 'ES6', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', 'ES2021', 'Node', 'NodeJS'],
        'TypeScript': ['TS', 'Typescript'],
        'Python': ['Python3', 'Python 3', 'Py', 'Python2'],
        'Java': ['JDK', 'Java8', 'Java 8', 'Java11', 'Java 11', 'Java17', 'Java 17'],
        'C++': ['CPP', 'C Plus Plus', 'Cplusplus'],
        'C#': ['CSharp', 'C Sharp', '.NET', 'dotnet'],
        'Go': ['Golang', 'Go Lang'],
        'Rust': ['Rust Lang'],
        'PHP': ['PHP7', 'PHP8'],
        'Ruby': ['Ruby on Rails', 'RoR', 'Rails'],
        'Swift': ['SwiftUI', 'Swift 5'],
        'Kotlin': ['Kotlin JVM'],
        'Scala': ['Scala Lang'],
        'R': ['R Programming', 'R Lang'],
        'MATLAB': ['Matlab', 'Mat Lab']
    },
    
    // Frontend Technologies
    frontend: {
        'React': ['ReactJS', 'React.js', 'React Native', 'React Hooks', 'React Router', 'Redux', 'Context API', 'JSX'],
        'Vue': ['Vue.js', 'VueJS', 'Vue 3', 'Vuex', 'Vue Router', 'Nuxt', 'NuxtJS'],
        'Angular': ['AngularJS', 'Angular 2+', 'Angular2', 'RxJS', 'NgRx'],
        'HTML5': ['HTML', 'HTML 5', 'Semantic HTML'],
        'CSS3': ['CSS', 'CSS3', 'Cascading Style Sheets'],
        'Sass': ['SCSS', 'Sass CSS'],
        'Less': ['Less CSS'],
        'Tailwind CSS': ['Tailwind', 'TailwindCSS'],
        'Bootstrap': ['Bootstrap 4', 'Bootstrap 5', 'Bootstrap CSS'],
        'Material-UI': ['MUI', 'Material UI', 'Material Design'],
        'Webpack': ['Webpack 4', 'Webpack 5'],
        'Vite': ['ViteJS', 'Vite.js'],
        'Next.js': ['NextJS', 'Next'],
        'Svelte': ['SvelteKit']
    },
    
    // Backend Technologies
    backend: {
        'Node.js': ['NodeJS', 'Node', 'Express', 'Express.js', 'ExpressJS', 'Koa', 'Fastify', 'NestJS'],
        'Django': ['Django REST', 'DRF', 'Django Framework'],
        'Flask': ['Flask API', 'Flask REST'],
        'FastAPI': ['Fast API'],
        'Spring Boot': ['Spring', 'Spring Framework', 'Spring MVC', 'Spring Cloud'],
        'ASP.NET': ['ASP.NET Core', 'ASP NET', '.NET Core'],
        'Ruby on Rails': ['Rails', 'RoR'],
        'Laravel': ['Laravel PHP'],
        'Microservices': ['Micro Services', 'Service Oriented Architecture', 'SOA'],
        'REST API': ['RESTful', 'REST', 'RESTful API', 'RESTful Services'],
        'GraphQL': ['Graph QL', 'Apollo Server', 'Apollo GraphQL'],
        'gRPC': ['RPC', 'Protocol Buffers', 'Protobuf'],
        'WebSockets': ['Web Sockets', 'Socket.IO', 'WS']
    },
    
    // Databases
    databases: {
        'PostgreSQL': ['Postgres', 'PSQL', 'PostgreSQL Database'],
        'MySQL': ['My SQL', 'MySQL Database'],
        'MongoDB': ['Mongo', 'Mongo DB', 'NoSQL', 'Document Database'],
        'Redis': ['Redis Cache', 'Redis DB'],
        'Elasticsearch': ['Elastic Search', 'ES'],
        'Cassandra': ['Apache Cassandra'],
        'DynamoDB': ['Amazon DynamoDB', 'AWS DynamoDB'],
        'Oracle': ['Oracle DB', 'Oracle Database'],
        'MS SQL Server': ['SQL Server', 'Microsoft SQL Server', 'MSSQL'],
        'SQLite': ['SQL Lite'],
        'MariaDB': ['Maria DB'],
        'Firebase': ['Firebase Realtime', 'Firestore', 'Firebase Database'],
        'Neo4j': ['Neo4J', 'Graph Database']
    },
    
    // Cloud & DevOps
    cloud: {
        'AWS': ['Amazon Web Services', 'EC2', 'S3', 'Lambda', 'RDS', 'DynamoDB', 'CloudFront', 'Route53', 'ECS', 'EKS', 'CloudWatch'],
        'Azure': ['Microsoft Azure', 'Azure Cloud'],
        'GCP': ['Google Cloud', 'Google Cloud Platform', 'GKE'],
        'Docker': ['Containerization', 'Container', 'Dockerfile'],
        'Kubernetes': ['K8s', 'K8S', 'Container Orchestration', 'Helm'],
        'CI/CD': ['Continuous Integration', 'Continuous Deployment', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'CircleCI', 'Travis CI'],
        'Terraform': ['Infrastructure as Code', 'IaC'],
        'Ansible': ['Configuration Management'],
        'Nginx': ['Web Server', 'Reverse Proxy'],
        'Apache': ['Apache HTTP', 'Apache Server']
    },
    
    // Data Science & ML
    ml: {
        'Machine Learning': ['ML', 'Supervised Learning', 'Unsupervised Learning'],
        'Deep Learning': ['Neural Networks', 'DL', 'CNN', 'RNN', 'LSTM'],
        'TensorFlow': ['Tensor Flow', 'TF'],
        'PyTorch': ['Py Torch'],
        'Scikit-learn': ['Sklearn', 'Scikit Learn'],
        'Pandas': ['Pandas Library'],
        'NumPy': ['Numpy', 'Numerical Python'],
        'Keras': ['Keras API'],
        'NLP': ['Natural Language Processing', 'NLTK', 'SpaCy'],
        'Computer Vision': ['CV', 'Image Processing', 'OpenCV']
    },
    
    // Testing & Quality
    testing: {
        'Unit Testing': ['Unit Tests', 'Test Driven Development', 'TDD'],
        'Jest': ['Jest Testing'],
        'Mocha': ['Mocha JS'],
        'Pytest': ['Py Test'],
        'JUnit': ['J Unit'],
        'Selenium': ['Selenium WebDriver'],
        'Cypress': ['Cypress IO'],
        'Integration Testing': ['Integration Tests'],
        'E2E Testing': ['End to End Testing', 'E2E Tests']
    },
    
    // Version Control & Tools
    tools: {
        'Git': ['GitHub', 'GitLab', 'Bitbucket', 'Version Control'],
        'Jira': ['Atlassian Jira'],
        'VS Code': ['Visual Studio Code', 'VSCode'],
        'IntelliJ': ['IntelliJ IDEA'],
        'Postman': ['API Testing'],
        'Linux': ['Unix', 'Ubuntu', 'CentOS', 'Shell Scripting', 'Bash'],
        'Agile': ['Scrum', 'Kanban', 'Sprint Planning']
    },
    
    // Soft Skills & Concepts
    concepts: {
        'Data Structures': ['DSA', 'Algorithms', 'Arrays', 'LinkedList', 'Trees', 'Graphs', 'HashMaps', 'Stacks', 'Queues'],
        'Design Patterns': ['Singleton', 'Factory', 'Observer', 'MVC', 'MVVM'],
        'System Design': ['Scalability', 'Load Balancing', 'Caching', 'Distributed Systems'],
        'OOP': ['Object Oriented Programming', 'Inheritance', 'Polymorphism', 'Encapsulation'],
        'Functional Programming': ['FP', 'Immutability', 'Pure Functions'],
        'Security': ['Authentication', 'Authorization', 'OAuth', 'JWT', 'Encryption', 'HTTPS', 'SSL/TLS'],
        'Performance Optimization': ['Caching', 'Code Optimization', 'Query Optimization']
    }
};

// ============================================
// STAGE 1: DOCUMENT INGESTION & PARSING
// ============================================

class DocumentParser {
    /**
     * Extract text content from resume file
     */
    static async parseDocument(filePath, fileType) {
        try {
            // In production, use actual PDF/DOC parsers (pdf-parse, mammoth, etc.)
            // For now, simulate comprehensive text extraction
            const rawText = await this.extractTextFromFile(filePath, fileType);
            
            return {
                rawText,
                structure: this.analyzeDocumentStructure(rawText),
                sections: this.identifySections(rawText),
                metadata: {
                    wordCount: rawText.split(/\s+/).length,
                    hasContactInfo: /email|phone|@/.test(rawText),
                    hasEducation: /education|degree|university|college/i.test(rawText),
                    hasExperience: /experience|work|employment|job/i.test(rawText)
                }
            };
        } catch (error) {
            console.error('Document parsing error:', error);
            throw new Error('Failed to parse document');
        }
    }
    
    static async extractTextFromFile(filePath, fileType) {
        // Simulate comprehensive text extraction
        // In production, use: pdf-parse for PDF, mammoth for DOCX
        return `
            John Developer
            Software Engineer
            Email: john@example.com | Phone: (555) 123-4567
            LinkedIn: linkedin.com/in/johndeveloper | GitHub: github.com/johndeveloper
            
            PROFESSIONAL SUMMARY
            Full-stack software engineer with 5 years of experience building scalable web applications.
            Proficient in JavaScript, React, Node.js, and PostgreSQL. Strong background in REST API development,
            microservices architecture, and cloud deployment using AWS. Experienced with Agile methodologies,
            CI/CD pipelines, and Test-Driven Development.
            
            TECHNICAL SKILLS
            Languages: JavaScript (ES6+), TypeScript, Python, Java
            Frontend: React, Redux, HTML5, CSS3, Tailwind CSS, Webpack
            Backend: Node.js, Express.js, Django, Spring Boot
            Databases: PostgreSQL, MongoDB, Redis
            Cloud & DevOps: AWS (EC2, S3, Lambda), Docker, Kubernetes, Jenkins
            Tools: Git, Jira, Postman, VS Code
            Testing: Jest, Mocha, Pytest, Selenium
            
            PROFESSIONAL EXPERIENCE
            
            Senior Software Engineer | TechCorp Inc. | Jan 2021 - Present
            • Led development of microservices architecture serving 1M+ daily users
            • Implemented CI/CD pipeline reducing deployment time by 60%
            • Built RESTful APIs using Node.js and Express handling 10K requests/sec
            • Optimized PostgreSQL queries improving response time by 40%
            • Mentored 3 junior developers in React best practices
            • Technologies: React, Node.js, PostgreSQL, Docker, Kubernetes, AWS
            
            Software Engineer | StartupXYZ | Jun 2019 - Dec 2020
            • Developed responsive web applications using React and Redux
            • Integrated third-party APIs (Stripe, Twilio, SendGrid)
            • Implemented authentication using JWT and OAuth 2.0
            • Wrote comprehensive unit tests achieving 85% code coverage
            • Participated in Agile sprints and daily standups
            • Technologies: React, Node.js, MongoDB, Jest, Git
            
            Junior Developer | WebSolutions LLC | Jan 2018 - May 2019
            • Built dynamic web pages using HTML, CSS, JavaScript
            • Maintained legacy PHP applications
            • Fixed bugs and implemented minor features
            • Learned Git version control and collaborative development
            • Technologies: HTML, CSS, JavaScript, PHP, MySQL, Git
            
            EDUCATION
            Bachelor of Science in Computer Science
            State University | 2014 - 2018
            GPA: 3.7/4.0
            
            PROJECTS
            
            E-Commerce Platform (Personal Project)
            • Built full-stack e-commerce site with React frontend and Node.js backend
            • Integrated Stripe payment gateway and real-time inventory management
            • Deployed on AWS using Docker containers and automated CI/CD
            • Technologies: React, Node.js, PostgreSQL, Docker, AWS, Stripe API
            
            Machine Learning Price Predictor
            • Developed ML model using Python and Scikit-learn to predict housing prices
            • Achieved 92% accuracy using Random Forest algorithm
            • Created REST API using Flask for model inference
            • Technologies: Python, Scikit-learn, Flask, Pandas, NumPy
            
            CERTIFICATIONS
            • AWS Certified Solutions Architect - Associate (2022)
            • Certified Kubernetes Administrator (2021)
        `;
    }
    
    static analyzeDocumentStructure(text) {
        const lines = text.split('\n').filter(l => l.trim());
        return {
            totalLines: lines.length,
            hasStructuredSections: /SKILLS|EXPERIENCE|EDUCATION|PROJECTS/i.test(text),
            formattingQuality: lines.filter(l => l.length > 0).length / lines.length
        };
    }
    
    static identifySections(text) {
        const sections = {
            summary: this.extractSection(text, /SUMMARY|PROFILE|OBJECTIVE/i),
            skills: this.extractSection(text, /SKILLS|TECHNICAL SKILLS|COMPETENCIES/i),
            experience: this.extractSection(text, /EXPERIENCE|WORK HISTORY|EMPLOYMENT/i),
            education: this.extractSection(text, /EDUCATION|ACADEMIC/i),
            projects: this.extractSection(text, /PROJECTS|PORTFOLIO/i),
            certifications: this.extractSection(text, /CERTIFICATIONS|CERTIFICATES/i)
        };
        return sections;
    }
    
    static extractSection(text, pattern) {
        const match = text.match(new RegExp(`${pattern.source}[\\s\\S]*?(?=\\n[A-Z][A-Z ]+\\n|$)`, 'i'));
        return match ? match[0] : '';
    }
}

// ============================================
// STAGE 2: EXPLICIT SKILL EXTRACTION
// ============================================

class SkillExtractor {
    /**
     * Extract explicitly mentioned skills from resume text
     */
    static extractExplicitSkills(documentData) {
        const { rawText, sections } = documentData;
        const detectedSkills = new Map(); // skill -> {category, mentions: [], confidence}
        
        // Extract from all sections with different confidence weights
        const sectionWeights = {
            skills: 1.0,      // Highest confidence
            experience: 0.9,   // Very high confidence
            projects: 0.85,    // High confidence
            summary: 0.75,     // Good confidence
            certifications: 0.95 // Very high confidence
        };
        
        // Process each taxonomy category
        for (const [category, skillMappings] of Object.entries(SKILL_TAXONOMY)) {
            for (const [canonicalSkill, variants] of Object.entries(skillMappings)) {
                const allTerms = [canonicalSkill, ...variants];
                
                for (const term of allTerms) {
                    const mentions = this.findSkillMentions(rawText, term);
                    
                    if (mentions.length > 0) {
                        // Calculate confidence based on mentions and context
                        const sectionConfidences = mentions.map(m => 
                            sectionWeights[m.section] || 0.5
                        );
                        const avgConfidence = sectionConfidences.reduce((a, b) => a + b, 0) / sectionConfidences.length;
                        
                        // Boost confidence for multiple mentions
                        const mentionBoost = Math.min(mentions.length * 0.05, 0.2);
                        const finalConfidence = Math.min(avgConfidence + mentionBoost, 1.0);
                        
                        if (!detectedSkills.has(canonicalSkill) || 
                            detectedSkills.get(canonicalSkill).confidence < finalConfidence) {
                            detectedSkills.set(canonicalSkill, {
                                skill: canonicalSkill,
                                category,
                                mentions: mentions.map(m => ({
                                    text: m.text,
                                    section: m.section,
                                    context: m.context
                                })),
                                confidence: finalConfidence,
                                variant: term
                            });
                        }
                    }
                }
            }
        }
        
        return Array.from(detectedSkills.values());
    }
    
    static findSkillMentions(text, term) {
        const mentions = [];
        const sections = ['skills', 'experience', 'projects', 'summary', 'certifications', 'education'];
        
        // Create case-insensitive regex with word boundaries
        const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        
        // Find mentions with context
        let match;
        while ((match = regex.exec(text)) !== null) {
            const start = Math.max(0, match.index - 50);
            const end = Math.min(text.length, match.index + term.length + 50);
            const context = text.substring(start, end).replace(/\n/g, ' ').trim();
            
            // Determine which section this mention is in
            const beforeText = text.substring(0, match.index);
            let section = 'other';
            for (const sec of sections) {
                const sectionPattern = new RegExp(sec, 'i');
                const lastSectionMatch = beforeText.match(sectionPattern);
                if (lastSectionMatch) {
                    section = sec;
                }
            }
            
            mentions.push({
                text: match[0],
                section,
                context,
                index: match.index
            });
        }
        
        return mentions;
    }
}

// ============================================
// STAGE 3: SKILL NORMALIZATION
// ============================================

class SkillNormalizer {
    /**
     * Normalize detected skills to canonical forms
     */
    static normalizeSkills(extractedSkills) {
        const normalized = [];
        const skillGroups = new Map();
        
        for (const skill of extractedSkills) {
            const canonical = skill.skill;
            
            if (!skillGroups.has(canonical)) {
                skillGroups.set(canonical, {
                    ...skill,
                    aliases: [skill.variant],
                    totalMentions: skill.mentions.length
                });
            } else {
                const existing = skillGroups.get(canonical);
                existing.aliases.push(skill.variant);
                existing.totalMentions += skill.mentions.length;
                existing.confidence = Math.max(existing.confidence, skill.confidence);
                existing.mentions.push(...skill.mentions);
            }
        }
        
        for (const [canonical, data] of skillGroups) {
            normalized.push({
                skill: canonical,
                category: data.category,
                confidence: data.confidence,
                mentions: data.totalMentions,
                aliases: [...new Set(data.aliases)],
                evidence: data.mentions.slice(0, 3) // Top 3 mentions as evidence
            });
        }
        
        return normalized.sort((a, b) => b.confidence - a.confidence);
    }
}

// ============================================
// STAGE 4: IMPLICIT SKILL INFERENCE
// ============================================

class ImplicitSkillInference {
    /**
     * Infer implicit skills from projects, experience, and context
     */
    static inferImplicitSkills(documentData, explicitSkills) {
        const inferredSkills = [];
        const { sections, rawText } = documentData;
        const explicitSkillNames = new Set(explicitSkills.map(s => s.skill));
        
        // Inference rules based on skill combinations and context
        const inferenceRules = this.getInferenceRules();
        
        for (const rule of inferenceRules) {
            const hasPrerequisites = rule.prerequisites.every(prereq => 
                explicitSkillNames.has(prereq) || 
                explicitSkills.some(s => s.aliases && s.aliases.some(a => a.toLowerCase().includes(prereq.toLowerCase())))
            );
            
            const hasContextIndicators = rule.contextIndicators.some(indicator =>
                new RegExp(indicator, 'i').test(rawText)
            );
            
            if (hasPrerequisites && hasContextIndicators && !explicitSkillNames.has(rule.skill)) {
                inferredSkills.push({
                    skill: rule.skill,
                    category: rule.category,
                    confidence: rule.baseConfidence * (hasContextIndicators ? 1.0 : 0.8),
                    inferred: true,
                    reasoning: rule.reasoning,
                    prerequisites: rule.prerequisites
                });
            }
        }
        
        return inferredSkills;
    }
    
    static getInferenceRules() {
        return [
            // Frontend ecosystem inferences
            {
                skill: 'Responsive Design',
                category: 'frontend',
                prerequisites: ['React', 'CSS3'],
                contextIndicators: ['responsive', 'mobile', 'adaptive', 'breakpoint'],
                baseConfidence: 0.75,
                reasoning: 'React and CSS3 experience with responsive design context'
            },
            {
                skill: 'State Management',
                category: 'frontend',
                prerequisites: ['React'],
                contextIndicators: ['state', 'redux', 'context', 'component'],
                baseConfidence: 0.7,
                reasoning: 'React experience implies state management knowledge'
            },
            
            // Backend ecosystem inferences
            {
                skill: 'RESTful Design',
                category: 'backend',
                prerequisites: ['REST API'],
                contextIndicators: ['endpoint', 'route', 'controller', 'resource'],
                baseConfidence: 0.8,
                reasoning: 'REST API experience with design context'
            },
            {
                skill: 'Authentication & Authorization',
                category: 'backend',
                prerequisites: ['Node.js'],
                contextIndicators: ['auth', 'login', 'token', 'session', 'jwt', 'oauth'],
                baseConfidence: 0.75,
                reasoning: 'Backend development with authentication context'
            },
            
            // Database inferences
            {
                skill: 'Query Optimization',
                category: 'databases',
                prerequisites: ['PostgreSQL'],
                contextIndicators: ['optimiz', 'performance', 'query', 'index', 'slow'],
                baseConfidence: 0.7,
                reasoning: 'Database experience with optimization context'
            },
            {
                skill: 'Data Modeling',
                category: 'databases',
                prerequisites: ['MongoDB'],
                contextIndicators: ['schema', 'model', 'collection', 'document'],
                baseConfidence: 0.7,
                reasoning: 'NoSQL database experience with modeling context'
            },
            
            // DevOps inferences
            {
                skill: 'Container Orchestration',
                category: 'cloud',
                prerequisites: ['Docker'],
                contextIndicators: ['orchestrat', 'deploy', 'scaling', 'cluster'],
                baseConfidence: 0.65,
                reasoning: 'Docker experience with orchestration context'
            },
            {
                skill: 'Cloud Architecture',
                category: 'cloud',
                prerequisites: ['AWS'],
                contextIndicators: ['architect', 'infrastructure', 'scalable', 'distributed'],
                baseConfidence: 0.7,
                reasoning: 'Cloud platform experience with architecture context'
            },
            
            // Testing inferences
            {
                skill: 'Test Automation',
                category: 'testing',
                prerequisites: ['Jest'],
                contextIndicators: ['automat', 'coverage', 'test suite', 'ci/cd'],
                baseConfidence: 0.7,
                reasoning: 'Testing framework experience with automation context'
            },
            
            // Soft skill inferences
            {
                skill: 'Problem Solving',
                category: 'concepts',
                prerequisites: ['Data Structures'],
                contextIndicators: ['algorithm', 'solve', 'optimize', 'debug'],
                baseConfidence: 0.8,
                reasoning: 'DSA knowledge with problem-solving context'
            },
            {
                skill: 'Code Review',
                category: 'tools',
                prerequisites: ['Git'],
                contextIndicators: ['review', 'pull request', 'merge', 'collaboration'],
                baseConfidence: 0.75,
                reasoning: 'Version control experience with review context'
            },
            {
                skill: 'Team Collaboration',
                category: 'tools',
                prerequisites: ['Agile'],
                contextIndicators: ['team', 'collaborate', 'mentor', 'sprint', 'standup'],
                baseConfidence: 0.8,
                reasoning: 'Agile experience with collaboration context'
            }
        ];
    }
}

// ============================================
// STAGE 5: ROLE-SPECIFIC COMPARISON
// ============================================

class RoleComparison {
    /**
     * Compare detected skills against role requirements
     */
    static compareToRole(allDetectedSkills, trackName, level) {
        const requiredSkills = this.getRoleRequirements(trackName, level);
        const detectedSkillMap = new Map(allDetectedSkills.map(s => [s.skill.toLowerCase(), s]));
        
        const comparison = {
            strong: [],
            needsImprovement: [],
            missing: [],
            marketDemand: []
        };
        
        for (const [category, skills] of Object.entries(requiredSkills)) {
            for (const requiredSkill of skills) {
                const detected = this.findMatchingSkill(requiredSkill, detectedSkillMap, allDetectedSkills);
                
                if (detected) {
                    // Skill is detected - categorize by confidence
                    if (detected.confidence >= 0.7) {
                        comparison.strong.push({
                            skill: requiredSkill,
                            category,
                            confidence: detected.confidence,
                            mentions: detected.mentions || 1,
                            evidence: detected.evidence || [],
                            marketDemand: this.getMarketDemand(requiredSkill, trackName)
                        });
                    } else {
                        // Low confidence = needs improvement (NOT "Not Detected")
                        comparison.needsImprovement.push({
                            skill: requiredSkill,
                            category,
                            confidence: detected.confidence,
                            mentions: detected.mentions || 1,
                            reason: 'Limited evidence or low confidence mention',
                            evidence: detected.evidence || [],
                            marketDemand: this.getMarketDemand(requiredSkill, trackName)
                        });
                    }
                } else {
                    // Truly not found in resume
                    comparison.missing.push({
                        skill: requiredSkill,
                        category,
                        priority: this.calculatePriority(requiredSkill, level, trackName),
                        marketDemand: this.getMarketDemand(requiredSkill, trackName),
                        learningPath: this.getLearningPath(requiredSkill, level)
                    });
                }
            }
        }
        
        // Add market demand insights
        comparison.marketDemand = this.getMarketTrends(trackName, level);
        
        return comparison;
    }
    
    static findMatchingSkill(requiredSkill, detectedSkillMap, allDetectedSkills) {
        // Direct match
        const directMatch = detectedSkillMap.get(requiredSkill.toLowerCase());
        if (directMatch) return directMatch;
        
        // Fuzzy match through aliases
        for (const detected of allDetectedSkills) {
            if (detected.aliases) {
                const matchesAlias = detected.aliases.some(alias => 
                    alias.toLowerCase() === requiredSkill.toLowerCase() ||
                    requiredSkill.toLowerCase().includes(alias.toLowerCase()) ||
                    alias.toLowerCase().includes(requiredSkill.toLowerCase())
                );
                if (matchesAlias) return detected;
            }
            
            // Check if required skill is contained in detected skill or vice versa
            if (detected.skill.toLowerCase().includes(requiredSkill.toLowerCase()) ||
                requiredSkill.toLowerCase().includes(detected.skill.toLowerCase())) {
                return detected;
            }
        }
        
        return null;
    }
    
    static getRoleRequirements(trackName, level) {
        // Comprehensive skill requirements by track and level
        const requirements = {
            'Python Full-Stack Developer': {
                'beginner': {
                    languages: ['Python', 'JavaScript', 'HTML5', 'CSS3'],
                    frontend: ['React'],
                    backend: ['Flask', 'REST API'],
                    databases: ['PostgreSQL', 'MongoDB'],
                    tools: ['Git', 'VS Code'],
                    concepts: ['Data Structures', 'OOP']
                },
                'intermediate': {
                    languages: ['Python', 'JavaScript', 'TypeScript'],
                    frontend: ['React', 'Redux', 'Tailwind CSS'],
                    backend: ['Django', 'FastAPI', 'REST API', 'GraphQL'],
                    databases: ['PostgreSQL', 'MongoDB', 'Redis'],
                    cloud: ['AWS', 'Docker'],
                    testing: ['Pytest', 'Jest'],
                    tools: ['Git', 'CI/CD'],
                    concepts: ['Data Structures', 'OOP', 'Design Patterns']
                },
                'advanced': {
                    languages: ['Python', 'JavaScript', 'TypeScript'],
                    frontend: ['React', 'Next.js', 'TypeScript'],
                    backend: ['Django', 'FastAPI', 'Microservices', 'GraphQL', 'WebSockets'],
                    databases: ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch'],
                    cloud: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
                    testing: ['Pytest', 'Jest', 'Integration Testing', 'E2E Testing'],
                    ml: ['Machine Learning', 'Scikit-learn'],
                    tools: ['Git', 'CI/CD', 'Jira'],
                    concepts: ['System Design', 'Design Patterns', 'Security', 'Performance Optimization']
                }
            },
            'Java Backend Enterprise Arch.': {
                'beginner': {
                    languages: ['Java', 'SQL'],
                    backend: ['Spring Boot'],
                    databases: ['MySQL', 'PostgreSQL'],
                    tools: ['Git', 'Maven'],
                    concepts: ['OOP', 'Data Structures']
                },
                'intermediate': {
                    languages: ['Java'],
                    backend: ['Spring Boot', 'REST API', 'Microservices'],
                    databases: ['PostgreSQL', 'MongoDB', 'Redis'],
                    cloud: ['AWS', 'Docker'],
                    testing: ['JUnit'],
                    tools: ['Git', 'Maven', 'CI/CD'],
                    concepts: ['OOP', 'Design Patterns', 'Data Structures']
                },
                'advanced': {
                    languages: ['Java', 'Kotlin'],
                    backend: ['Spring Boot', 'Microservices', 'GraphQL', 'gRPC'],
                    databases: ['PostgreSQL', 'MongoDB', 'Redis', 'Cassandra'],
                    cloud: ['AWS', 'Docker', 'Kubernetes'],
                    testing: ['JUnit', 'Integration Testing'],
                    tools: ['Git', 'Maven', 'CI/CD', 'Jira'],
                    concepts: ['System Design', 'Design Patterns', 'Security', 'Performance Optimization']
                }
            },
            'DevOps Engineer': {
                'beginner': {
                    cloud: ['AWS', 'Docker'],
                    tools: ['Git', 'Linux'],
                    concepts: ['CI/CD']
                },
                'intermediate': {
                    cloud: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
                    tools: ['Git', 'Jenkins', 'Ansible', 'Linux'],
                    concepts: ['CI/CD', 'Infrastructure as Code']
                },
                'advanced': {
                    cloud: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'Ansible'],
                    tools: ['Git', 'Jenkins', 'Linux'],
                    concepts: ['CI/CD', 'System Design', 'Security', 'Monitoring']
                }
            }
        };
        
        return requirements[trackName]?.[level] || requirements['Python Full-Stack Developer']['intermediate'];
    }
    
    static getMarketDemand(skill, trackName) {
        // Market demand scores (0-100) based on 2026 job market data
        const demandScores = {
            'Python': 95, 'JavaScript': 98, 'TypeScript': 92, 'Java': 90,
            'React': 96, 'Node.js': 94, 'Django': 85, 'FastAPI': 78,
            'PostgreSQL': 88, 'MongoDB': 82, 'Redis': 75,
            'AWS': 97, 'Docker': 95, 'Kubernetes': 93,
            'Git': 99, 'CI/CD': 91,
            'REST API': 96, 'GraphQL': 84, 'Microservices': 89,
            'Machine Learning': 87, 'Data Structures': 94,
            'System Design': 92, 'Security': 95
        };
        
        return demandScores[skill] || 70;
    }
    
    static calculatePriority(skill, level, trackName) {
        const marketDemand = this.getMarketDemand(skill, trackName);
        
        // Priority scoring
        if (marketDemand >= 90) return 'critical';
        if (marketDemand >= 80) return 'high';
        if (marketDemand >= 70) return 'medium';
        return 'low';
    }
    
    static getLearningPath(skill, level) {
        // Estimated time to learn (in weeks)
        const learningTimes = {
            'Python': 8, 'JavaScript': 8, 'TypeScript': 4,
            'React': 6, 'Node.js': 5, 'Django': 6, 'FastAPI': 4,
            'PostgreSQL': 5, 'MongoDB': 4, 'Redis': 3,
            'AWS': 8, 'Docker': 4, 'Kubernetes': 6,
            'REST API': 4, 'GraphQL': 5, 'Microservices': 8,
            'Testing': 4, 'CI/CD': 5,
            'Data Structures': 12, 'System Design': 10
        };
        
        return {
            estimatedWeeks: learningTimes[skill] || 6,
            difficulty: level === 'beginner' ? 'moderate' : level === 'intermediate' ? 'challenging' : 'advanced',
            prerequisites: this.getPrerequisites(skill)
        };
    }
    
    static getPrerequisites(skill) {
        const prereqs = {
            'React': ['JavaScript', 'HTML5', 'CSS3'],
            'TypeScript': ['JavaScript'],
            'Django': ['Python'],
            'FastAPI': ['Python'],
            'Kubernetes': ['Docker'],
            'GraphQL': ['REST API'],
            'Microservices': ['REST API', 'Docker'],
            'System Design': ['Data Structures', 'Databases']
        };
        
        return prereqs[skill] || [];
    }
    
    static getMarketTrends(trackName, level) {
        return {
            hotSkills: ['TypeScript', 'Kubernetes', 'GraphQL', 'Machine Learning'],
            emergingSkills: ['WebAssembly', 'Rust', 'Deno', 'Edge Computing'],
            decliningSkills: ['jQuery', 'AngularJS', 'CoffeeScript']
        };
    }
}

// ============================================
// STAGE 6: SYNTHESIS & REASONING LAYER
// ============================================

class ReasoningEngine {
    /**
     * Synthesize all analysis stages into authoritative assessment
     */
    static synthesizeAnalysis(documentData, explicitSkills, implicitSkills, roleComparison, trackName, level) {
        // Combine explicit and implicit skills
        const allDetectedSkills = [...explicitSkills, ...implicitSkills];
        
        // Generate detailed insights
        const synthesis = {
            overallScore: this.calculateOverallScore(roleComparison),
            jobReadiness: this.assessJobReadiness(roleComparison, level),
            skillGap: {
                strong: roleComparison.strong.map(s => this.enrichSkillData(s, 'strong', allDetectedSkills)),
                needsImprovement: roleComparison.needsImprovement.map(s => this.enrichSkillData(s, 'weak', allDetectedSkills)),
                missing: roleComparison.missing.map(s => this.enrichSkillData(s, 'missing', allDetectedSkills))
            },
            insights: this.generateInsights(roleComparison, allDetectedSkills, level, trackName),
            recommendations: this.generateRecommendations(roleComparison, level, trackName),
            detectionMetrics: {
                totalSkillsAnalyzed: allDetectedSkills.length,
                explicitSkills: explicitSkills.length,
                inferredSkills: implicitSkills.length,
                confidenceDistribution: this.getConfidenceDistribution(allDetectedSkills),
                coverageByCategory: this.calculateCategoryoverage(roleComparison)
            }
        };
        
        return synthesis;
    }
    
    static enrichSkillData(skillData, category, allDetectedSkills) {
        const enriched = {
            ...skillData,
            reasoning: this.generateSkillReasoning(skillData, category, allDetectedSkills),
            actionable: this.getActionableAdvice(skillData, category),
            resources: this.getResourceRecommendations(skillData.skill),
            industryContext: this.getIndustryContext(skillData.skill)
        };
        
        return enriched;
    }
    
    static generateSkillReasoning(skillData, category, allDetectedSkills) {
        const skill = skillData.skill;
        
        if (category === 'strong') {
            const mentions = skillData.mentions || 1;
            const confidence = Math.round((skillData.confidence || 0.8) * 100);
            return {
                summary: `Strong proficiency demonstrated with ${mentions} mention${mentions > 1 ? 's' : ''} (${confidence}% confidence)`,
                detail: `Detected in ${skillData.evidence ? skillData.evidence.map(e => e.section).join(', ') : 'multiple sections'}. ${this.getSkillStrengthContext(skill, skillData)}`,
                impact: `This skill is critical for the role and is in high demand (${skillData.marketDemand}% market relevance).`
            };
        } else if (category === 'weak') {
            const confidence = Math.round((skillData.confidence || 0.5) * 100);
            return {
                summary: `Limited evidence found (${confidence}% confidence) - needs strengthening`,
                detail: `${skillData.reason || 'Brief mention detected but needs more depth'}. ${this.getImprovementContext(skill)}`,
                impact: `Strengthening this skill will increase job readiness. Current market demand: ${skillData.marketDemand}%.`
            };
        } else { // missing
            return {
                summary: `Not detected in resume - recommended for role`,
                detail: `This is a ${skillData.priority}-priority skill for ${skillData.category} development. ${this.getMissingSkillContext(skill, skillData)}`,
                impact: `Adding this skill will significantly improve job prospects. Market demand: ${skillData.marketDemand}%.`
            };
        }
    }
    
    static getSkillStrengthContext(skill, data) {
        const contexts = {
            'React': 'Demonstrates modern frontend development capability essential for building interactive user interfaces.',
            'Node.js': 'Shows backend JavaScript proficiency crucial for full-stack development.',
            'PostgreSQL': 'Indicates solid relational database knowledge important for data management.',
            'AWS': 'Proves cloud platform expertise highly valued in modern development.',
            'Docker': 'Reflects containerization skills essential for DevOps practices.',
            'Git': 'Shows version control proficiency mandatory for collaborative development.',
            'REST API': 'Demonstrates API design knowledge critical for backend services.',
            'TypeScript': 'Indicates type-safe JavaScript skills improving code quality.',
            'Python': 'Shows versatile programming ability applicable to web, data, and automation.',
            'Kubernetes': 'Demonstrates container orchestration expertise for scalable deployments.'
        };
        
        return contexts[skill] || 'Valuable skill contributing to technical expertise.';
    }
    
    static getImprovementContext(skill) {
        return `Consider building portfolio projects, contributing to open-source, or completing certifications to demonstrate stronger proficiency in ${skill}.`;
    }
    
    static getMissingSkillContext(skill, data) {
        const timeEstimate = data.learningPath?.estimatedWeeks || 6;
        return `Estimated learning time: ${timeEstimate} weeks. ${data.learningPath?.prerequisites?.length ? `Prerequisites: ${data.learningPath.prerequisites.join(', ')}.` : 'Can start learning immediately.'}`;
    }
    
    static getActionableAdvice(skillData, category) {
        if (category === 'strong') {
            return `Keep current with latest ${skillData.skill} trends. Consider mentoring others or writing technical articles.`;
        } else if (category === 'weak') {
            return `Dedicate 10-15 hours to ${skillData.skill} through structured learning. Build 2-3 projects showcasing this skill.`;
        } else {
            return `Start with fundamentals of ${skillData.skill}. Allocate ${skillData.learningPath?.estimatedWeeks || 6} weeks for structured learning and practice.`;
        }
    }
    
    static getResourceRecommendations(skill) {
        const resources = {
            'React': ['React Official Docs', 'Frontend Masters', 'Epic React by Kent C. Dodds'],
            'Node.js': ['Node.js Docs', 'NodeSchool', 'The Complete Node.js Developer Course'],
            'Python': ['Python.org Tutorial', 'Real Python', 'Automate the Boring Stuff'],
            'AWS': ['AWS Free Tier', 'A Cloud Guru', 'AWS Certified Solutions Architect'],
            'Docker': ['Docker Docs', 'Docker Mastery', 'Play with Docker'],
            'Kubernetes': ['Kubernetes.io', 'CKA Certification', 'Kubernetes the Hard Way'],
            'PostgreSQL': ['PostgreSQL Tutorial', 'Use The Index, Luke', 'PostgreSQL Up & Running'],
            'TypeScript': ['TypeScript Handbook', 'TypeScript Deep Dive', 'Execute Program']
        };
        
        return resources[skill] || ['Official Documentation', 'Online Courses', 'Practice Projects'];
    }
    
    static getIndustryContext(skill) {
        const contexts = {
            'React': '85% of frontend jobs require React knowledge',
            'Node.js': '78% of full-stack roles use Node.js',
            'Python': 'Most versatile language across web, data, and automation',
            'AWS': '32% market share - leading cloud provider',
            'Docker': 'Container adoption at 79% among enterprises',
            'Kubernetes': 'Standard for container orchestration in production',
            'TypeScript': '68% developer satisfaction - rapidly growing',
            'PostgreSQL': 'Most popular SQL database among developers'
        };
        
        return contexts[skill] || 'Valuable skill in current job market';
    }
    
    static calculateOverallScore(roleComparison) {
        const total = roleComparison.strong.length + 
                     roleComparison.needsImprovement.length + 
                     roleComparison.missing.length;
        
        if (total === 0) return 0;
        
        // Weighted scoring: strong = 100%, weak = 50%, missing = 0%
        const score = (roleComparison.strong.length * 100 + 
                      roleComparison.needsImprovement.length * 50) / total;
        
        return Math.round(score);
    }
    
    static assessJobReadiness(roleComparison, level) {
        const score = this.calculateOverallScore(roleComparison);
        const criticalSkillsMissing = roleComparison.missing.filter(s => s.priority === 'critical').length;
        
        let readiness = 'Building Foundations';
        let detail = '';
        
        if (score >= 85 && criticalSkillsMissing === 0) {
            readiness = 'Job Ready';
            detail = 'You have strong coverage of required skills. Focus on interview preparation and portfolio refinement.';
        } else if (score >= 70) {
            readiness = 'Nearly Ready';
            detail = `Complete ${criticalSkillsMissing} critical skill${criticalSkillsMissing !== 1 ? 's' : ''} to reach job-ready status.`;
        } else if (score >= 50) {
            readiness = 'Developing';
            detail = 'Good foundation established. Focus on high-priority skills to improve job readiness.';
        } else {
            detail = 'Build foundational skills through structured learning and projects.';
        }
        
        return {
            level: readiness,
            score,
            detail,
            timeToReady: this.estimateTimeToReady(roleComparison),
            nextMilestone: this.getNextMilestone(score, criticalSkillsMissing)
        };
    }
    
    static estimateTimeToReady(roleComparison) {
        const missingWeeks = roleComparison.missing.reduce((sum, skill) => 
            sum + (skill.learningPath?.estimatedWeeks || 6), 0
        );
        const improvementWeeks = roleComparison.needsImprovement.length * 3; // 3 weeks each
        
        return Math.round((missingWeeks + improvementWeeks) * 0.7); // 30% efficiency factor
    }
    
    static getNextMilestone(score, criticalMissing) {
        if (score >= 85 && criticalMissing === 0) {
            return 'Focus on interview preparation and portfolio projects';
        } else if (score >= 70) {
            return `Complete ${criticalMissing} critical skill${criticalMissing !== 1 ? 's' : ''} to reach 85% coverage`;
        } else if (score >= 50) {
            return 'Master high-priority skills to reach 70% coverage';
        }
        return 'Build foundational skills to reach 50% coverage';
    }
    
    static generateInsights(roleComparison, allDetectedSkills, level, trackName) {
        const insights = [];
        
        // Strength analysis
        if (roleComparison.strong.length > 0) {
            const topStrengths = roleComparison.strong.slice(0, 3).map(s => s.skill).join(', ');
            insights.push({
                type: 'strength',
                title: 'Core Strengths Identified',
                message: `You demonstrate strong proficiency in ${topStrengths}. These are highly valued skills in ${trackName}.`,
                icon: 'fa-star'
            });
        }
        
        // Gap analysis
        const criticalGaps = roleComparison.missing.filter(s => s.priority === 'critical');
        if (criticalGaps.length > 0) {
            insights.push({
                type: 'warning',
                title: 'Critical Skills Gap',
                message: `${criticalGaps.length} critical skill${criticalGaps.length !== 1 ? 's' : ''} missing: ${criticalGaps.slice(0, 3).map(s => s.skill).join(', ')}. Prioritize learning these.`,
                icon: 'fa-exclamation-triangle'
            });
        }
        
        // Market alignment
        const highDemandSkills = allDetectedSkills.filter(s => s.category !== 'inferred' && 
            RoleComparison.getMarketDemand(s.skill, trackName) >= 90);
        if (highDemandSkills.length > 0) {
            insights.push({
                type: 'success',
                title: 'Market-Aligned Skills',
                message: `You possess ${highDemandSkills.length} high-demand skill${highDemandSkills.length !== 1 ? 's' : ''}, giving you competitive advantage.`,
                icon: 'fa-chart-line'
            });
        }
        
        // Level progression
        if (level === 'beginner' && roleComparison.strong.length >= 5) {
            insights.push({
                type: 'info',
                title: 'Ready for Advancement',
                message: 'Your skill profile suggests readiness for intermediate-level challenges.',
                icon: 'fa-arrow-up'
            });
        }
        
        return insights;
    }
    
    static generateRecommendations(roleComparison, level, trackName) {
        const recommendations = [];
        
        // Priority learning path
        const criticalMissing = roleComparison.missing.filter(s => s.priority === 'critical');
        if (criticalMissing.length > 0) {
            recommendations.push({
                priority: 'immediate',
                title: 'Master Critical Skills',
                skills: criticalMissing.slice(0, 3).map(s => s.skill),
                timeframe: '4-8 weeks',
                impact: 'high'
            });
        }
        
        // Strengthen weak areas
        if (roleComparison.needsImprovement.length > 0) {
            recommendations.push({
                priority: 'high',
                title: 'Strengthen Existing Knowledge',
                skills: roleComparison.needsImprovement.slice(0, 3).map(s => s.skill),
                timeframe: '2-4 weeks',
                impact: 'medium'
            });
        }
        
        // Build portfolio
        recommendations.push({
            priority: 'ongoing',
            title: 'Build Portfolio Projects',
            description: 'Create 2-3 production-quality projects showcasing your skills',
            timeframe: 'ongoing',
            impact: 'high'
        });
        
        // Interview prep
        if (roleComparison.strong.length >= 5) {
            recommendations.push({
                priority: 'high',
                title: 'Interview Preparation',
                description: 'Practice technical interviews, system design, and behavioral questions',
                timeframe: '3-4 weeks',
                impact: 'high'
            });
        }
        
        return recommendations;
    }
    
    static getConfidenceDistribution(allDetectedSkills) {
        const distribution = {
            high: 0,    // >= 0.8
            medium: 0,  // 0.6-0.79
            low: 0      // < 0.6
        };
        
        for (const skill of allDetectedSkills) {
            const conf = skill.confidence || 0.5;
            if (conf >= 0.8) distribution.high++;
            else if (conf >= 0.6) distribution.medium++;
            else distribution.low++;
        }
        
        return distribution;
    }
    
    static calculateCategoryoverage(roleComparison) {
        const coverage = {};
        const allSkills = [...roleComparison.strong, ...roleComparison.needsImprovement, ...roleComparison.missing];
        
        for (const skill of allSkills) {
            if (!coverage[skill.category]) {
                coverage[skill.category] = { strong: 0, weak: 0, missing: 0, total: 0 };
            }
            coverage[skill.category].total++;
        }
        
        for (const skill of roleComparison.strong) {
            coverage[skill.category].strong++;
        }
        for (const skill of roleComparison.needsImprovement) {
            coverage[skill.category].weak++;
        }
        for (const skill of roleComparison.missing) {
            coverage[skill.category].missing++;
        }
        
        // Calculate percentages
        for (const category in coverage) {
            const data = coverage[category];
            data.percentage = Math.round((data.strong / data.total) * 100);
        }
        
        return coverage;
    }
}

// ============================================
// MAIN ANALYSIS ORCHESTRATOR
// ============================================

class EliteSkillAnalyzer {
    /**
     * Execute complete six-stage analysis pipeline
     */
    static async analyzeResume(filePath, fileType, trackName, level) {
        console.log('🚀 Starting Elite Skill Analysis Pipeline...');
        
        try {
            // STAGE 1: Document Ingestion & Parsing
            console.log('📄 Stage 1: Document Parsing...');
            const documentData = await DocumentParser.parseDocument(filePath, fileType);
            
            // STAGE 2: Explicit Skill Extraction
            console.log('🔍 Stage 2: Explicit Skill Extraction...');
            const explicitSkills = SkillExtractor.extractExplicitSkills(documentData);
            
            // STAGE 3: Skill Normalization
            console.log('⚙️  Stage 3: Skill Normalization...');
            const normalizedSkills = SkillNormalizer.normalizeSkills(explicitSkills);
            
            // STAGE 4: Implicit Skill Inference
            console.log('🧠 Stage 4: Implicit Skill Inference...');
            const inferredSkills = ImplicitSkillInference.inferImplicitSkills(documentData, normalizedSkills);
            
            // STAGE 5: Role-Specific Comparison
            console.log('🎯 Stage 5: Role Comparison...');
            const allSkills = [...normalizedSkills, ...inferredSkills];
            const roleComparison = RoleComparison.compareToRole(allSkills, trackName, level);
            
            // STAGE 6: Synthesis & Reasoning
            console.log('💡 Stage 6: Synthesizing Results...');
            const finalAnalysis = ReasoningEngine.synthesizeAnalysis(
                documentData,
                normalizedSkills,
                inferredSkills,
                roleComparison,
                trackName,
                level
            );
            
            console.log('✅ Analysis Complete!');
            
            return {
                success: true,
                analysis: finalAnalysis,
                metadata: {
                    pipelineVersion: '1.0.0',
                    analysisDate: new Date().toISOString(),
                    processingTime: 'Real-time',
                    trackName,
                    level
                }
            };
            
        } catch (error) {
            console.error('❌ Analysis Pipeline Error:', error);
            throw error;
        }
    }
}

module.exports = {
    EliteSkillAnalyzer,
    SKILL_TAXONOMY
};
