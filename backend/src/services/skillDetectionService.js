/**
 * Evidence-Based Skill Detection and Inference Engine
 * Maps skills with traceable justifications and confidence scores
 */
class SkillDetectionService {
    constructor() {
        // Inference rules: If X is detected, Y can be inferred
        this.inferenceRules = {
            'GitHub': {
                implies: ['Git', 'Version Control'],
                confidence: 0.95,
                reason: 'GitHub usage requires Git knowledge'
            },
            'GitLab': {
                implies: ['Git', 'Version Control'],
                confidence: 0.95,
                reason: 'GitLab usage requires Git knowledge'
            },
            'Bitbucket': {
                implies: ['Git', 'Version Control'],
                confidence: 0.95,
                reason: 'Bitbucket usage requires Git knowledge'
            },
            'git clone': {
                implies: ['Git', 'Version Control'],
                confidence: 1.0,
                reason: 'Explicit Git command usage'
            },
            'git push': {
                implies: ['Git', 'Version Control'],
                confidence: 1.0,
                reason: 'Explicit Git command usage'
            },
            'git commit': {
                implies: ['Git', 'Version Control'],
                confidence: 1.0,
                reason: 'Explicit Git command usage'
            },
            'pip install': {
                implies: ['Python', 'pip', 'Package Management'],
                confidence: 0.98,
                reason: 'pip is Python package manager'
            },
            'npm install': {
                implies: ['Node.js', 'npm', 'JavaScript'],
                confidence: 0.98,
                reason: 'npm requires Node.js and is used for JavaScript projects'
            },
            'Django': {
                implies: ['Python', 'Backend Development', 'Web Development'],
                confidence: 0.95,
                reason: 'Django is Python web framework'
            },
            'Flask': {
                implies: ['Python', 'Backend Development', 'Web Development'],
                confidence: 0.95,
                reason: 'Flask is Python micro-framework'
            },
            'FastAPI': {
                implies: ['Python', 'Backend Development', 'REST API', 'Async Programming'],
                confidence: 0.95,
                reason: 'FastAPI is modern Python API framework'
            },
            'React': {
                implies: ['JavaScript', 'Frontend Development', 'HTML5', 'CSS3'],
                confidence: 0.9,
                reason: 'React requires JavaScript and web fundamentals'
            },
            'Angular': {
                implies: ['TypeScript', 'JavaScript', 'Frontend Development', 'HTML5', 'CSS3'],
                confidence: 0.9,
                reason: 'Angular uses TypeScript and web fundamentals'
            },
            'Vue.js': {
                implies: ['JavaScript', 'Frontend Development', 'HTML5', 'CSS3'],
                confidence: 0.9,
                reason: 'Vue.js requires JavaScript and web fundamentals'
            },
            'Express': {
                implies: ['Node.js', 'JavaScript', 'Backend Development', 'REST API'],
                confidence: 0.95,
                reason: 'Express is Node.js backend framework'
            },
            'Next.js': {
                implies: ['React', 'JavaScript', 'Node.js', 'Frontend Development'],
                confidence: 0.95,
                reason: 'Next.js is React framework with SSR'
            },
            'Docker': {
                implies: ['Containerization', 'DevOps', 'Linux'],
                confidence: 0.9,
                reason: 'Docker is containerization platform'
            },
            'Kubernetes': {
                implies: ['Docker', 'Containerization', 'DevOps', 'Cloud Native'],
                confidence: 0.95,
                reason: 'Kubernetes orchestrates containers'
            },
            'AWS': {
                implies: ['Cloud Computing', 'DevOps'],
                confidence: 0.9,
                reason: 'AWS is cloud platform'
            },
            'Azure': {
                implies: ['Cloud Computing', 'DevOps'],
                confidence: 0.9,
                reason: 'Azure is cloud platform'
            },
            'GCP': {
                implies: ['Cloud Computing', 'DevOps'],
                confidence: 0.9,
                reason: 'GCP is cloud platform'
            },
            'Jenkins': {
                implies: ['CI/CD', 'DevOps', 'Automation'],
                confidence: 0.95,
                reason: 'Jenkins is CI/CD automation server'
            },
            'GitHub Actions': {
                implies: ['CI/CD', 'DevOps', 'Git', 'Automation'],
                confidence: 0.95,
                reason: 'GitHub Actions is CI/CD platform'
            },
            'PostgreSQL': {
                implies: ['SQL', 'Database', 'Backend Development'],
                confidence: 0.95,
                reason: 'PostgreSQL is SQL database'
            },
            'MySQL': {
                implies: ['SQL', 'Database', 'Backend Development'],
                confidence: 0.95,
                reason: 'MySQL is SQL database'
            },
            'MongoDB': {
                implies: ['NoSQL', 'Database', 'Backend Development'],
                confidence: 0.95,
                reason: 'MongoDB is NoSQL database'
            },
            'REST API': {
                implies: ['HTTP', 'JSON', 'API Design', 'Backend Development'],
                confidence: 0.9,
                reason: 'REST APIs use HTTP and JSON'
            },
            'GraphQL': {
                implies: ['API Design', 'Backend Development'],
                confidence: 0.9,
                reason: 'GraphQL is API query language'
            },
            'TensorFlow': {
                implies: ['Python', 'Machine Learning', 'Deep Learning'],
                confidence: 0.95,
                reason: 'TensorFlow is ML framework'
            },
            'PyTorch': {
                implies: ['Python', 'Machine Learning', 'Deep Learning'],
                confidence: 0.95,
                reason: 'PyTorch is ML framework'
            },
            'Pandas': {
                implies: ['Python', 'Data Analysis'],
                confidence: 0.95,
                reason: 'Pandas is Python data library'
            },
            'NumPy': {
                implies: ['Python', 'Data Analysis'],
                confidence: 0.95,
                reason: 'NumPy is Python numerical library'
            },
            'Terraform': {
                implies: ['Infrastructure as Code', 'DevOps', 'Cloud Computing'],
                confidence: 0.95,
                reason: 'Terraform is IaC tool'
            },
            'Ansible': {
                implies: ['Configuration Management', 'DevOps', 'Automation'],
                confidence: 0.95,
                reason: 'Ansible is configuration management tool'
            }
        };

        // Skill normalization mapping (different names for same skill)
        this.skillNormalization = {
            // Version Control - ALL map to 'Git'
            'git': 'Git',
            'github': 'Git',
            'gitlab': 'Git',
            'bitbucket': 'Git',
            'version control': 'Git',
            'source control': 'Git',
            'git workflow': 'Git',
            'github actions': 'Git',
            'gitlab ci': 'Git',
            
            // Programming Languages
            'python': 'Python',
            'python3': 'Python',
            'python basics': 'Python',
            'javascript': 'JavaScript',
            'js': 'JavaScript',
            'javascript es6': 'JavaScript',
            'es6': 'JavaScript',
            'typescript': 'TypeScript',
            'ts': 'TypeScript',
            'java': 'Java',
            
            // Frontend
            'react': 'React',
            'reactjs': 'React',
            'react.js': 'React',
            'angular': 'Angular',
            'angularjs': 'Angular',
            'vue': 'Vue.js',
            'vuejs': 'Vue.js',
            'vue.js': 'Vue.js',
            'nextjs': 'Next.js',
            'next': 'Next.js',
            'next.js': 'Next.js',
            'html': 'HTML5',
            'html5': 'HTML5',
            'css': 'CSS3',
            'css3': 'CSS3',
            'dom manipulation': 'JavaScript',
            'responsive design': 'CSS3',
            
            // Backend
            'nodejs': 'Node.js',
            'node': 'Node.js',
            'node.js': 'Node.js',
            'express': 'Express',
            'expressjs': 'Express',
            'express.js': 'Express',
            'django': 'Django',
            'flask': 'Flask',
            'fastapi': 'FastAPI',
            'rest': 'REST API',
            'restful': 'REST API',
            'rest api': 'REST API',
            'rest apis': 'REST API',
            'api design': 'REST API',
            'api development': 'REST API',
            
            // Databases
            'postgres': 'PostgreSQL',
            'postgresql': 'PostgreSQL',
            'psql': 'PostgreSQL',
            'mongo': 'MongoDB',
            'mongodb': 'MongoDB',
            'mongodb basics': 'MongoDB',
            'mysql': 'MySQL',
            'sql': 'SQL',
            'sql basics': 'SQL',
            'redis': 'Redis',
            'sqlite': 'SQLite',
            'database design': 'Database',
            'database': 'Database',
            
            // DevOps & Cloud
            'docker': 'Docker',
            'containerization': 'Docker',
            'kubernetes': 'Kubernetes',
            'k8s': 'Kubernetes',
            'aws': 'AWS',
            'amazon web services': 'AWS',
            'azure': 'Azure',
            'gcp': 'GCP',
            'google cloud': 'GCP',
            'ci/cd': 'CI/CD',
            'cicd': 'CI/CD',
            'continuous integration': 'CI/CD',
            'continuous deployment': 'CI/CD',
            'jenkins': 'Jenkins',
            'github actions': 'GitHub Actions',
            'gitlab ci': 'GitLab CI',
            
            // Infrastructure
            'terraform': 'Terraform',
            'ansible': 'Ansible',
            'nginx': 'Nginx',
            
            // Testing
            'testing': 'Testing',
            'unit testing': 'Testing',
            'integration testing': 'Testing',
            'jest': 'Jest',
            'pytest': 'Pytest',
            'mocha': 'Mocha',
            
            // Package Managers
            'npm': 'npm',
            'yarn': 'yarn',
            'pip': 'pip',
            'conda': 'conda',
            
            // Data Science
            'pandas': 'Pandas',
            'numpy': 'NumPy',
            'scikit-learn': 'Scikit-learn',
            'sklearn': 'Scikit-learn',
            'tensorflow': 'TensorFlow',
            'pytorch': 'PyTorch',
            'keras': 'Keras',
            'jupyter': 'Jupyter Notebooks',
            'jupyter notebooks': 'Jupyter Notebooks',
            
            // Others
            'authentication': 'Authentication',
            'auth': 'Authentication',
            'middleware': 'Middleware',
            'error handling': 'Error Handling',
            'graphql': 'GraphQL',
            'websocket': 'WebSocket',
            'websockets': 'WebSocket',
            
            // Methodologies
            'agile': 'Agile',
            'scrum': 'Agile',
            'tdd': 'TDD',
            'test driven development': 'TDD'
        };
    }

    /**
     * Analyze resume and detect skills with evidence and confidence
     */
    analyzeSkills(resumeStructure, requiredSkills, evaluationMode = 'balanced') {
        // Cache resume structure and evaluation mode
        this._cachedResumeStructure = resumeStructure;
        this._evaluationMode = evaluationMode;
        
        const detectedSkills = new Map(); // skill -> evidence array
        const skillConfidence = new Map(); // skill -> confidence score
        const skillEvidence = new Map(); // skill -> detailed evidence
        
        // 1. Scan all sections for explicit skill mentions
        this.scanForExplicitSkills(resumeStructure, detectedSkills, skillEvidence);
        
        // 2. Analyze technical descriptions for implicit skills
        this.scanForImplicitSkills(resumeStructure, detectedSkills, skillEvidence);
        
        // 3. Analyze URLs for skill inference (GitHub, portfolio, etc.)
        this.analyzeURLs(resumeStructure, detectedSkills, skillEvidence);
        
        // 4. Apply inference rules (skip in strict mode unless production evidence)
        if (evaluationMode !== 'strict') {
            this.applyInferenceRules(detectedSkills, skillEvidence);
        }
        
        // 5. Calculate confidence scores
        this.calculateConfidenceScores(detectedSkills, skillEvidence, skillConfidence);
        
        // 6. Categorize skills with proficiency analysis
        const categorizedSkills = this.categorizeSkills(
            detectedSkills,
            skillConfidence,
            skillEvidence,
            requiredSkills,
            evaluationMode
        );
        
        return categorizedSkills;
    }

    /**
     * Scan for explicitly listed skills - FULL TEXT SCAN
     * Searches entire resume including Skills, Projects, Experience, Tools, and all descriptions
     */
    scanForExplicitSkills(resumeStructure, detectedSkills, skillEvidence) {
        const { sections, lines, rawText } = resumeStructure;
        const resumeParserService = require('./resumeParserService');
        
        // METHOD 1: Scan ALL lines in resume (not just specific sections)
        const allLines = [];
        
        // Collect ALL lines from ALL sections
        Object.keys(sections).forEach(sectionName => {
            const section = sections[sectionName];
            if (section.lines && section.lines.length > 0) {
                section.lines.forEach(lineObj => {
                    allLines.push({
                        text: lineObj.text,
                        lineNumber: lineObj.lineNumber,
                        section: sectionName
                    });
                });
            }
        });
        
        // Scan EVERY line for technologies
        allLines.forEach(lineObj => {
            const technologies = resumeParserService.extractTechnologies(lineObj.text);
            technologies.forEach(tech => {
                const normalized = this.normalizeSkill(tech);
                if (!detectedSkills.has(normalized)) {
                    detectedSkills.set(normalized, []);
                    skillEvidence.set(normalized, []);
                }
                
                // Confidence based on section
                const confidence = lineObj.section === 'skills' ? 1.0 :
                                  lineObj.section === 'experience' ? 0.95 :
                                  lineObj.section === 'projects' ? 0.90 :
                                  lineObj.section === 'summary' ? 0.85 : 0.80;
                
                skillEvidence.get(normalized).push({
                    type: 'explicit',
                    source: lineObj.section,
                    line: lineObj.text,
                    lineNumber: lineObj.lineNumber,
                    confidence: confidence,
                    reason: `Mentioned in ${lineObj.section} section`
                });
            });
        });
        
        // METHOD 2: Fallback full-text regex scan for skills that might be missed
        // This catches skills in any part of the resume (headers, descriptions, etc.)
        const additionalSkillPatterns = {
            'Git': /\b(git|github|gitlab|bitbucket|version control|source control)\b/gi,
            'Docker': /\b(docker|containerization|containerized)\b/gi,
            'Kubernetes': /\b(kubernetes|k8s)\b/gi,
            'AWS': /\b(aws|amazon web services)\b/gi,
            'Python': /\b(python|python3|py)\b/gi,
            'JavaScript': /\b(javascript|js|es6|ecmascript)\b/gi,
            'React': /\b(react|reactjs|react\.js)\b/gi,
            'Node.js': /\b(node|nodejs|node\.js)\b/gi
        };
        
        Object.entries(additionalSkillPatterns).forEach(([skill, pattern]) => {
            const matches = rawText.match(pattern);
            if (matches && matches.length > 0) {
                const normalized = this.normalizeSkill(skill);
                if (!detectedSkills.has(normalized)) {
                    detectedSkills.set(normalized, []);
                    skillEvidence.set(normalized, []);
                }
                
                // Only add if not already detected
                const existingEvidence = skillEvidence.get(normalized) || [];
                if (existingEvidence.length === 0) {
                    skillEvidence.get(normalized).push({
                        type: 'explicit',
                        source: 'full_text_scan',
                        line: `Found ${matches.length} mention(s) in resume`,
                        lineNumber: -1,
                        confidence: 0.85,
                        reason: `Detected via full-text scan (${matches.length} occurrences)`
                    });
                }
            }
        });
    }

    /**
     * Scan for implicitly demonstrated skills through project descriptions
     */
    scanForImplicitSkills(resumeStructure, detectedSkills, skillEvidence) {
        const { sections } = resumeStructure;
        
        // Enhanced patterns with context-aware detection
        const implicitPatterns = {
            'API Development': [
                /\b(built|developed|created|designed|implemented)\s+.*?\b(api|endpoint|rest|restful|microservice)/i,
                /\b(api|rest|restful)\s+.*?\b(development|integration|design|architecture)/i,
                /\b(integrated|consumed)\s+.*?\bapi/i
            ],
            'REST API': [
                /\b(restful|rest)\s+(api|endpoint|service)/i,
                /\b(get|post|put|delete|patch)\s+(request|endpoint|route)/i,
                /\bhttp\s+(methods|verbs|requests)/i
            ],
            'Database Design': [
                /\b(designed|created|built)\s+.*?\b(database|schema|data model)/i,
                /\b(database|db)\s+(design|architecture|schema|modeling)/i,
                /\b(normalized|optimized)\s+.*?\b(database|queries|tables)/i,
                /\b(sql|query)\s+optimization/i
            ],
            'SQL': [
                /\b(wrote|writing|optimized)\s+.*?\b(sql|queries)/i,
                /\b(database|query)\s+optimization/i,
                /\b(complex|advanced)\s+queries/i,
                /\bjoins?\b.*?\btables?/i
            ],
            'Authentication': [
                /\b(implemented|built|developed)\s+.*?\b(auth|authentication|login|security)/i,
                /\b(user|session)\s+(authentication|authorization|management)/i,
                /\b(oauth|jwt|saml|sso|token-based)\s+(auth|authentication)/i,
                /\b(role-based|rbac)\s+access/i,
                /\bpassword\s+(hashing|encryption|security)/i
            ],
            'Testing': [
                /\b(wrote|writing|created)\s+.*?\b(test|tests|testing)/i,
                /\b(unit|integration|e2e|end-to-end)\s+test/i,
                /\btest\s+(coverage|suite|framework|automation)/i,
                /\b(tdd|test-driven|bdd|behavior-driven)/i,
                /\b\d+%\s+test\s+coverage/i
            ],
            'Performance Optimization': [
                /\b(optimized|improved|enhanced|reduced)\s+.*?\b(performance|speed|latency|load time)/i,
                /\b(caching|cache)\s+(strategy|implementation|layer)/i,
                /\breduced\s+.*?\bby\s+\d+%/i,
                /\bperformance\s+(tuning|optimization|improvement)/i
            ],
            'Deployment': [
                /\b(deployed|deploying|deployment)\s+.*?\b(production|staging|live)/i,
                /\b(continuous|automated)\s+(deployment|delivery|integration)/i,
                /\bdeployment\s+(pipeline|process|workflow|automation)/i,
                /\b(blue-green|canary|rolling)\s+deployment/i
            ],
            'CI/CD': [
                /\b(ci\/cd|continuous integration|continuous deployment|continuous delivery)/i,
                /\b(build|deployment)\s+pipeline/i,
                /\bautomated\s+(build|test|deployment)/i,
                /\b(jenkins|github actions|gitlab ci|circleci|travis)\s+pipeline/i
            ],
            'Version Control': [
                /\b(version|source)\s+control/i,
                /\b(git|github|gitlab|bitbucket)\s+(workflow|branching|strategy)/i,
                /\b(merge|pull|feature)\s+request/i,
                /\bcode\s+review/i,
                /\b(branching|merging|rebasing)\s+strateg/i
            ],
            'Git': [
                /\bgit\s+(workflow|commands|operations|strategy)/i,
                /\b(commit|push|pull|merge|branch|rebase|cherry-pick)/i,
                /\bversion\s+control/i,
                /\bcode\s+collaboration/i
            ],
            'Docker': [
                /\b(containerized|containerization|containerizing)\b/i,
                /\bdocker\s+(container|image|compose|file|hub)/i,
                /\b(multi-stage|optimized)\s+docker/i,
                /\bcontainer\s+(orchestration|management)/i
            ],
            'Kubernetes': [
                /\bkubernetes\s+(cluster|deployment|pod|service|ingress)/i,
                /\bk8s\b/i,
                /\bhelm\s+chart/i,
                /\bcontainer\s+orchestration/i,
                /\bdeployed.*?(on|to|using)\s+kubernetes/i
            ],
            'Cloud Computing': [
                /\bcloud\s+(infrastructure|platform|deployment|architecture)/i,
                /\b(aws|azure|gcp|google cloud)\s+(infrastructure|services|deployment)/i,
                /\bcloud-native/i,
                /\bserverless/i
            ],
            'Microservices': [
                /\bmicroservice\s+(architecture|design|pattern)/i,
                /\bservice-oriented\s+architecture/i,
                /\bdistributed\s+system/i,
                /\bservice\s+mesh/i,
                /\bapi\s+gateway/i
            ],
            'Async Programming': [
                /\b(asynchronous|async)\s+(programming|operations|processing)/i,
                /\basync\/await/i,
                /\b(concurrent|parallel)\s+processing/i,
                /\bevent-driven/i,
                /\bmessage\s+queue/i
            ],
            'Frontend Development': [
                /\b(built|developed|created)\s+.*?\b(frontend|ui|user interface|web app)/i,
                /\bresponsive\s+(design|web|layout)/i,
                /\bsingle-page\s+application/i,
                /\bcross-browser\s+compatible/i
            ],
            'Backend Development': [
                /\b(built|developed|created)\s+.*?\b(backend|server|api|service)/i,
                /\bserver-side\s+(logic|rendering|processing)/i,
                /\bbackend\s+(architecture|infrastructure|services)/i
            ],
            'System Design': [
                /\b(designed|architected)\s+.*?\b(system|architecture|solution)/i,
                /\bscalable\s+(architecture|system|solution)/i,
                /\bhigh availability/i,
                /\bload\s+balancing/i,
                /\bsystem\s+(architecture|design)\s+(patterns|principles)/i
            ],
            'Agile': [
                /\b(agile|scrum|kanban)\s+(methodology|framework|practices)/i,
                /\b(sprint|standup|retrospective|planning)/i,
                /\bcross-functional\s+team/i
            ]
        };
        
        ['experience', 'projects', 'summary'].forEach(sectionName => {
            const section = sections[sectionName];
            section.lines.forEach(lineObj => {
                for (const [skill, patterns] of Object.entries(implicitPatterns)) {
                    if (patterns.some(pattern => pattern.test(lineObj.text))) {
                        const normalized = this.normalizeSkill(skill);
                        if (!detectedSkills.has(normalized)) {
                            detectedSkills.set(normalized, []);
                            skillEvidence.set(normalized, []);
                        }
                        
                        // Higher confidence for experience section
                        const confidence = sectionName === 'experience' ? 0.85 : 
                                         sectionName === 'projects' ? 0.80 : 0.70;
                        
                        skillEvidence.get(normalized).push({
                            type: 'implicit',
                            source: sectionName,
                            line: lineObj.text,
                            lineNumber: lineObj.lineNumber,
                            confidence: confidence,
                            reason: `Demonstrated through ${sectionName}: "${lineObj.text.substring(0, 80)}..."`
                        });
                    }
                }
            });
        });
    }

    /**
     * Analyze URLs to infer skills
     */
    analyzeURLs(resumeStructure, detectedSkills, skillEvidence) {
        const { urls } = resumeStructure;
        
        // GitHub presence implies Git knowledge
        if (urls.github.length > 0) {
            ['Git', 'GitHub', 'Version Control'].forEach(skill => {
                if (!detectedSkills.has(skill)) {
                    detectedSkills.set(skill, []);
                    skillEvidence.set(skill, []);
                }
                skillEvidence.get(skill).push({
                    type: 'inferred',
                    source: 'urls',
                    line: urls.github[0],
                    lineNumber: -1,
                    confidence: 0.95,
                    reason: `GitHub profile/repository link indicates Git and version control experience`
                });
            });
        }
        
        // LinkedIn might have endorsements
        if (urls.linkedin.length > 0) {
            // Could potentially scrape, but for now just note it
            // Not adding skills, but could be used for validation
        }
    }

    /**
     * Apply inference rules to derive skills from detected ones
     */
    applyInferenceRules(detectedSkills, skillEvidence) {
        const inferredSkills = new Map();
        
        for (const [skill, evidence] of detectedSkills) {
            const rule = this.inferenceRules[skill];
            if (rule) {
                rule.implies.forEach(impliedSkill => {
                    if (!detectedSkills.has(impliedSkill) && !inferredSkills.has(impliedSkill)) {
                        inferredSkills.set(impliedSkill, []);
                        if (!skillEvidence.has(impliedSkill)) {
                            skillEvidence.set(impliedSkill, []);
                        }
                        skillEvidence.get(impliedSkill).push({
                            type: 'inferred',
                            source: 'inference_engine',
                            line: `Inferred from: ${skill}`,
                            lineNumber: -1,
                            confidence: rule.confidence,
                            reason: rule.reason
                        });
                    }
                });
            }
        }
        
        // Add inferred skills to detected skills
        for (const [skill, evidence] of inferredSkills) {
            detectedSkills.set(skill, evidence);
        }
    }

    /**
     * Calculate confidence scores for each skill
     */
    calculateConfidenceScores(detectedSkills, skillEvidence, skillConfidence) {
        for (const skill of detectedSkills.keys()) {
            const evidenceList = skillEvidence.get(skill) || [];
            
            if (evidenceList.length === 0) {
                skillConfidence.set(skill, 0);
                continue;
            }
            
            // Calculate weighted confidence
            let totalConfidence = 0;
            let evidenceCount = 0;
            
            evidenceList.forEach(evidence => {
                totalConfidence += evidence.confidence;
                evidenceCount++;
            });
            
            // Bonus for multiple sources of evidence
            let finalConfidence = totalConfidence / evidenceCount;
            if (evidenceCount > 2) {
                finalConfidence = Math.min(1.0, finalConfidence + 0.1);
            }
            
            skillConfidence.set(skill, finalConfidence);
        }
    }

    /**
     * Categorize skills into proficiency levels using advanced analysis
     */
    categorizeSkills(detectedSkills, skillConfidence, skillEvidence, requiredSkills, evaluationMode = 'balanced') {
        const proficiencyAnalyzer = require('./skillProficiencyAnalyzer');
        const resumeStructure = this._cachedResumeStructure;
        
        const strong = [];
        const developing = [];
        const basic = [];
        const missing = [];
        
        // Flatten required skills if it's an object with categories
        const flatRequiredSkills = this.flattenRequiredSkills(requiredSkills);
        
        flatRequiredSkills.forEach(requiredSkill => {
            const normalizedRequired = this.normalizeSkill(requiredSkill);
            
            // Check if skill is detected (exact match or close match)
            let found = false;
            let matchedSkill = null;
            let matchConfidence = 0;
            
            for (const [detectedSkill, evidence] of detectedSkills) {
                if (this.skillsMatch(normalizedRequired, detectedSkill)) {
                    found = true;
                    matchedSkill = detectedSkill;
                    matchConfidence = skillConfidence.get(detectedSkill) || 0;
                    break;
                }
            }
            
            if (found) {
                const evidence = skillEvidence.get(matchedSkill) || [];
                
                // Use appropriate analyzer based on mode
                let proficiencyAnalysis;
                if (evaluationMode === 'strict') {
                    proficiencyAnalysis = proficiencyAnalyzer.analyzeStrictMode(
                        matchedSkill,
                        evidence,
                        resumeStructure?.sections || {}
                    );
                } else {
                    proficiencyAnalysis = proficiencyAnalyzer.analyzeProficiency(
                        matchedSkill,
                        evidence,
                        resumeStructure?.sections || {}
                    );
                }
                
                // Format based on mode
                let skillData;
                if (evaluationMode === 'strict') {
                    skillData = {
                        skill: requiredSkill,
                        detectedAs: matchedSkill,
                        state: proficiencyAnalysis.state, // Mastered, Developing, Basic Exposure, Not Detected
                        confidence: proficiencyAnalysis.confidence,
                        score: proficiencyAnalysis.score,
                        evidenceQuality: proficiencyAnalysis.evidenceQuality,
                        justification: proficiencyAnalysis.justification,
                        evidenceLines: proficiencyAnalysis.evidenceLines,
                        productionEvidence: proficiencyAnalysis.productionEvidence,
                        measurableOutcome: proficiencyAnalysis.measurableOutcome,
                        breakdown: proficiencyAnalysis.breakdown
                    };
                } else {
                    skillData = {
                        skill: requiredSkill,
                        detectedAs: matchedSkill,
                        confidence: matchConfidence,
                        evidence: evidence,
                        evidenceCount: evidence.length,
                        confidenceLevel: proficiencyAnalysis.level,
                        category: proficiencyAnalysis.category,
                        proficiencyScore: proficiencyAnalysis.score,
                        scoreBreakdown: proficiencyAnalysis.breakdown,
                        depthLevel: proficiencyAnalysis.depthLevel,
                        reasoning: proficiencyAnalysis.reasoning,
                        coachingTip: proficiencyAnalysis.coachingTip,
                        evidenceSummary: proficiencyAnalysis.evidenceSummary
                    };
                }
                
                // Categorize based on mode
                if (evaluationMode === 'strict') {
                    if (proficiencyAnalysis.state === 'Mastered') {
                        strong.push(skillData);
                    } else if (proficiencyAnalysis.state === 'Developing') {
                        developing.push(skillData);
                    } else if (proficiencyAnalysis.state === 'Basic Exposure') {
                        basic.push(skillData);
                    } else {
                        missing.push(skillData);
                    }
                } else {
                    // Categorize based on confidence level and category
                    // Core skills: Advanced or Demonstrated
                    if (proficiencyAnalysis.category === 'core') {
                        strong.push(skillData);
                    }
                    // Developing skills: Implied or Explicit
                    else if (proficiencyAnalysis.category === 'developing') {
                        developing.push(skillData);
                    }
                    // Fallback for any edge cases
                    else {
                        basic.push(skillData);
                    }
                }
            } else {
                // Skill truly not detected - but double-check for any low-frequency mentions
                // Search for the skill in the full text one more time
                const lowConfidenceCheck = this.checkForLowFrequencyMention(requiredSkill, resumeStructure);
                
                if (lowConfidenceCheck.found) {
                    // Mark as "Needs Improvement" instead of "Not Detected"
                    basic.push({
                        skill: requiredSkill,
                        confidence: lowConfidenceCheck.confidence,
                        evidence: lowConfidenceCheck.evidence,
                        evidenceCount: lowConfidenceCheck.evidence.length,
                        confidenceLevel: 'Needs Improvement',
                        category: 'basic',
                        reasoning: `**Needs Improvement**: ${requiredSkill} was mentioned but lacks depth. Found ${lowConfidenceCheck.evidence.length} indirect reference(s). Consider adding explicit demonstrations in projects or experience.`,
                        coachingTip: `△ ${requiredSkill} detected indirectly. Strengthen by: (1) Adding to skills section, (2) Describing hands-on usage in projects, (3) Quantifying impact.`
                    });
                } else {
                    // Truly not detected anywhere
                    missing.push({
                        skill: requiredSkill,
                        confidence: 0,
                        evidence: [],
                        evidenceCount: 0,
                        confidenceLevel: 'Not Detected',
                        category: 'missing',
                        reasoning: `**Not Detected**: ${requiredSkill} was not found in resume. No explicit mentions in skills section, no implicit demonstrations in work experience, and no evidence in project descriptions.`,
                        coachingTip: `✗ ${requiredSkill} not detected. If you have experience, add it to skills section + describe real-world usage in projects. If learning, consider adding "Currently Exploring" section.`
                    });
                }
            }
        });
        
        return {
            strong,
            developing,
            basic,
            missing,
            allDetected: Array.from(detectedSkills.keys()),
            allEvidence: Object.fromEntries(skillEvidence)
        };
    }

    /**
     * Normalize skill name
     */
    normalizeSkill(skill) {
        const lower = skill.toLowerCase().trim();
        return this.skillNormalization[lower] || skill;
    }

    /**
     * Check if two skills match (accounting for variations)
     */
    skillsMatch(skill1, skill2) {
        const normalized1 = this.normalizeSkill(skill1).toLowerCase();
        const normalized2 = this.normalizeSkill(skill2).toLowerCase();
        
        if (normalized1 === normalized2) return true;
        
        // Check for partial matches
        if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
            return true;
        }
        
        // Special equivalences for common variations
        const equivalences = {
            'git': ['version control', 'source control', 'github', 'gitlab', 'bitbucket'],
            'version control': ['git', 'source control', 'github', 'gitlab'],
            'source control': ['git', 'version control', 'github'],
            'api design': ['rest api', 'api development', 'restful', 'rest'],
            'rest api': ['api design', 'restful', 'rest', 'rest apis'],
            'rest apis': ['rest api', 'api design', 'restful'],
            'backend development': ['backend', 'server-side'],
            'backend': ['backend development'],
            'frontend development': ['frontend', 'ui development'],
            'frontend': ['frontend development'],
            'ci/cd': ['continuous integration', 'continuous deployment', 'cicd'],
            'continuous integration': ['ci/cd'],
            'continuous deployment': ['ci/cd'],
            'state management': ['redux', 'context api', 'state'],
            'hooks': ['react hooks', 'react.js'],
            'component design': ['react', 'react.js', 'component'],
            'middleware': ['express', 'node.js'],
            'error handling': ['exception handling', 'error management'],
            'npm': ['package management', 'node.js'],
            'pip': ['package management', 'python'],
            'vs code': ['visual studio code', 'code editor'],
            'eslint': ['linting', 'code quality'],
            'docker': ['containerization', 'containers'],
            'kubernetes': ['k8s', 'container orchestration'],
            'javascript': ['js', 'es6', 'ecmascript'],
            'typescript': ['ts'],
            'python': ['python3', 'py'],
            'react': ['reactjs', 'react.js'],
            'node.js': ['nodejs', 'node'],
            'express': ['expressjs', 'express.js'],
            'postgresql': ['postgres', 'psql'],
            'mongodb': ['mongo']
        };
        
        // Check if either skill has equivalences that match the other
        const eq1 = equivalences[normalized1] || [];
        const eq2 = equivalences[normalized2] || [];
        
        if (eq1.includes(normalized2) || eq2.includes(normalized1)) {
            return true;
        }
        
        // Check if both map to same equivalence
        for (const [key, values] of Object.entries(equivalences)) {
            if (values.includes(normalized1) && values.includes(normalized2)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check for low-frequency or indirect skill mentions
     * Returns evidence if skill is present but weak
     */
    checkForLowFrequencyMention(skill, resumeStructure) {
        const { rawText } = resumeStructure;
        const normalized = this.normalizeSkill(skill);
        
        // Create flexible regex patterns for the skill
        const skillLower = normalized.toLowerCase();
        const skillPattern = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        
        const matches = rawText.match(skillPattern);
        
        if (matches && matches.length > 0) {
            return {
                found: true,
                confidence: 0.40, // Low confidence
                evidence: [{
                    type: 'implicit',
                    source: 'full_text_scan',
                    line: `Found ${matches.length} indirect mention(s) in resume`,
                    lineNumber: -1,
                    confidence: 0.40,
                    reason: `Detected via case-insensitive full-text search (${matches.length} occurrences)`
                }]
            };
        }
        
        // Check for related terms
        const relatedTerms = this.getRelatedTerms(skill);
        for (const term of relatedTerms) {
            const termPattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            const termMatches = rawText.match(termPattern);
            
            if (termMatches && termMatches.length > 0) {
                return {
                    found: true,
                    confidence: 0.35,
                    evidence: [{
                        type: 'inferred',
                        source: 'related_term_scan',
                        line: `Found related term "${term}" (${termMatches.length} times)`,
                        lineNumber: -1,
                        confidence: 0.35,
                        reason: `Detected related term "${term}" which maps to ${skill}`
                    }]
                };
            }
        }
        
        return { found: false };
    }
    
    /**
     * Get related terms for a skill
     */
    getRelatedTerms(skill) {
        const relatedMap = {
            'Git': ['github', 'gitlab', 'bitbucket', 'version control', 'source control', 'git workflow'],
            'Docker': ['containerization', 'containerized', 'containers'],
            'Kubernetes': ['k8s', 'container orchestration'],
            'REST API': ['rest', 'restful', 'api', 'endpoint'],
            'JavaScript': ['js', 'es6', 'ecmascript', 'node'],
            'Python': ['python3', 'py', 'django', 'flask'],
            'React': ['reactjs', 'react.js'],
            'Node.js': ['nodejs', 'node', 'express'],
            'SQL': ['postgres', 'mysql', 'database', 'postgresql']
        };
        
        return relatedMap[skill] || [];
    }
    
    /**
     * Flatten required skills structure
     */
    flattenRequiredSkills(requiredSkills) {
        if (Array.isArray(requiredSkills)) {
            return requiredSkills;
        }
        
        // If it's an object with categories
        const flattened = [];
        for (const category of Object.values(requiredSkills)) {
            if (Array.isArray(category)) {
                flattened.push(...category);
            }
        }
        return flattened;
    }
}

module.exports = new SkillDetectionService();
