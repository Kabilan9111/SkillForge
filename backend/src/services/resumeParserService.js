const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const natural = require('natural');

/**
 * Evidence-Based Resume Parser Service
 * Parses resumes line by line and extracts skills with traceable justifications
 */
class ResumeParserService {
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
        this.stemmer = natural.PorterStemmer;
    }

    /**
     * Extract text from resume file based on type
     */
    async extractText(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        
        try {
            if (ext === '.pdf') {
                return await this.extractFromPDF(filePath);
            } else if (ext === '.docx' || ext === '.doc') {
                return await this.extractFromDOC(filePath);
            } else {
                throw new Error('Unsupported file format');
            }
        } catch (error) {
            console.error('Error extracting text:', error);
            throw new Error(`Failed to extract text from ${ext} file: ${error.message}`);
        }
    }

    /**
     * Extract text from PDF
     */
    async extractFromPDF(filePath) {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    }

    /**
     * Extract text from DOC/DOCX
     */
    async extractFromDOC(filePath) {
        const dataBuffer = await fs.readFile(filePath);
        const result = await mammoth.extractRawText({ buffer: dataBuffer });
        return result.value;
    }

    /**
     * Parse resume into structured sections
     */
    parseResumeStructure(text) {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        const structure = {
            rawText: text,
            lines: lines,
            sections: this.identifySections(lines),
            urls: this.extractURLs(text),
            emails: this.extractEmails(text),
            phones: this.extractPhones(text)
        };
        
        return structure;
    }

    /**
     * Identify resume sections (Experience, Education, Skills, Projects, etc.)
     */
    identifySections(lines) {
        const sections = {
            experience: { lines: [], startIndex: -1, endIndex: -1 },
            education: { lines: [], startIndex: -1, endIndex: -1 },
            skills: { lines: [], startIndex: -1, endIndex: -1 },
            projects: { lines: [], startIndex: -1, endIndex: -1 },
            summary: { lines: [], startIndex: -1, endIndex: -1 },
            certifications: { lines: [], startIndex: -1, endIndex: -1 },
            other: { lines: [], startIndex: -1, endIndex: -1 }
        };

        const sectionHeaders = {
            experience: /^(work\s+)?experience|employment\s+history|professional\s+experience|work\s+history/i,
            education: /^education|academic\s+background|qualifications/i,
            skills: /^(technical\s+)?skills|competencies|expertise|technologies/i,
            projects: /^projects?|portfolio|personal\s+projects|side\s+projects/i,
            summary: /^(professional\s+)?summary|profile|objective|about\s+me/i,
            certifications: /^certifications?|licenses?|credentials/i
        };

        let currentSection = 'other';
        let currentStartIndex = 0;

        lines.forEach((line, index) => {
            let matched = false;
            
            // Check if line is a section header
            for (const [section, pattern] of Object.entries(sectionHeaders)) {
                if (pattern.test(line)) {
                    // Save previous section end index
                    if (sections[currentSection].startIndex !== -1) {
                        sections[currentSection].endIndex = index - 1;
                    }
                    
                    // Start new section
                    currentSection = section;
                    sections[currentSection].startIndex = index;
                    matched = true;
                    break;
                }
            }
            
            // Add line to current section
            if (!matched) {
                sections[currentSection].lines.push({ text: line, lineNumber: index });
            }
        });

        // Set end index for last section
        if (sections[currentSection].startIndex !== -1) {
            sections[currentSection].endIndex = lines.length - 1;
        }

        return sections;
    }

    /**
     * Extract URLs (GitHub, LinkedIn, portfolio, etc.)
     */
    extractURLs(text) {
        const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-z]+\.(?:com|org|io|dev|net)\/[^\s]+)/gi;
        const urls = text.match(urlPattern) || [];
        
        return {
            all: urls,
            github: urls.filter(url => /github\.com/i.test(url)),
            linkedin: urls.filter(url => /linkedin\.com/i.test(url)),
            portfolio: urls.filter(url => !/github|linkedin/i.test(url))
        };
    }

    /**
     * Extract email addresses
     */
    extractEmails(text) {
        const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        return text.match(emailPattern) || [];
    }

    /**
     * Extract phone numbers
     */
    extractPhones(text) {
        const phonePattern = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
        return text.match(phonePattern) || [];
    }

    /**
     * Analyze text context to determine if it's code/technical
     */
    isCodeContext(line) {
        const codePatterns = [
            /^import\s+/i,
            /^from\s+\w+\s+import/i,
            /\bdef\s+\w+\s*\(/i,
            /\bclass\s+\w+/i,
            /\bfunction\s+\w+\s*\(/i,
            /\bconst\s+\w+\s*=/i,
            /\blet\s+\w+\s*=/i,
            /\bvar\s+\w+\s*=/i,
            /\bgit\s+(clone|push|pull|commit|branch|merge)/i,
            /npm\s+(install|run|start|build)/i,
            /pip\s+install/i,
            /docker\s+(build|run|compose|push)/i,
            /kubectl\s+/i,
            /\bmvn\s+/i,
            /\bgradle\s+/i
        ];
        
        return codePatterns.some(pattern => pattern.test(line));
    }

    /**
     * Check if line describes a technical responsibility or achievement
     */
    isTechnicalDescription(line) {
        const technicalKeywords = [
            'developed', 'built', 'implemented', 'created', 'designed', 'deployed',
            'architected', 'engineered', 'optimized', 'integrated', 'maintained',
            'automated', 'configured', 'managed', 'migrated', 'refactored',
            'api', 'database', 'backend', 'frontend', 'server', 'application',
            'system', 'infrastructure', 'pipeline', 'workflow', 'repository',
            'framework', 'library', 'service', 'microservice', 'rest', 'graphql'
        ];
        
        const lowerLine = line.toLowerCase();
        return technicalKeywords.some(keyword => lowerLine.includes(keyword));
    }

    /**
     * Extract tool/technology mentions from a line
     * (Public method to be used by SkillDetectionService)
     */
    extractTechnologies(line) {
        return this.extractTechnologiesFromLine(line);
    }

    /**
     * Extract tool/technology mentions from a line (internal)
     */
    extractTechnologiesFromLine(line) {
        const technologies = [];
        const lowerLine = line.toLowerCase();
        
        // Common technology patterns with variations
        const techPatterns = {
            // Programming Languages
            'Python': ['python', 'python3', 'py'],
            'JavaScript': ['javascript', 'js', 'es6', 'es2015', 'ecmascript'],
            'TypeScript': ['typescript', 'ts'],
            'Java': ['\\bjava\\b', 'java 8', 'java 11', 'java 17'],
            'C++': ['c\\+\\+', 'cpp'],
            'C#': ['c#', 'csharp'],
            'Go': ['\\bgo\\b', 'golang'],
            'Ruby': ['\\bruby\\b'],
            'PHP': ['\\bphp\\b'],
            'Swift': ['swift'],
            'Kotlin': ['kotlin'],
            'Rust': ['\\brust\\b'],
            
            // Frontend Frameworks/Libraries
            'React': ['react', 'reactjs', 'react.js'],
            'Angular': ['angular', 'angularjs'],
            'Vue.js': ['vue', 'vuejs', 'vue.js'],
            'Next.js': ['next', 'nextjs', 'next.js'],
            'Svelte': ['svelte'],
            
            // Backend Frameworks
            'Django': ['django'],
            'Flask': ['flask'],
            'FastAPI': ['fastapi', 'fast api'],
            'Express': ['express', 'expressjs', 'express.js'],
            'Node.js': ['node', 'nodejs', 'node.js'],
            'Spring': ['spring boot', 'spring framework'],
            'Laravel': ['laravel'],
            'Rails': ['rails', 'ruby on rails'],
            
            // Databases
            'PostgreSQL': ['postgres', 'postgresql', 'psql'],
            'MySQL': ['mysql'],
            'MongoDB': ['mongo', 'mongodb'],
            'Redis': ['redis'],
            'SQLite': ['sqlite'],
            'SQL Server': ['sql server', 'mssql'],
            'Oracle': ['oracle db', 'oracle database'],
            'Cassandra': ['cassandra'],
            'DynamoDB': ['dynamodb'],
            
            // Cloud Platforms
            'AWS': ['aws', 'amazon web services'],
            'Azure': ['azure', 'microsoft azure'],
            'GCP': ['gcp', 'google cloud', 'google cloud platform'],
            'Heroku': ['heroku'],
            'Netlify': ['netlify'],
            'Vercel': ['vercel'],
            
            // DevOps & Tools
            'Docker': ['docker', 'containerization'],
            'Kubernetes': ['kubernetes', 'k8s'],
            'Jenkins': ['jenkins'],
            'GitHub Actions': ['github actions', 'gh actions'],
            'GitLab CI': ['gitlab ci', 'gitlab-ci'],
            'CircleCI': ['circleci'],
            'Travis CI': ['travis ci'],
            'Terraform': ['terraform'],
            'Ansible': ['ansible'],
            'Chef': ['\\bchef\\b'],
            'Puppet': ['puppet'],
            
            // Version Control - All variants map to Git
            'Git': ['\\bgit\\b', 'version control', 'source control', 'github', 'gitlab', 'bitbucket', 'git workflow', 'git commands'],
            'SVN': ['\\bsvn\\b', 'subversion'],
            
            // Testing
            'Jest': ['jest'],
            'Mocha': ['mocha'],
            'Pytest': ['pytest'],
            'JUnit': ['junit'],
            'Selenium': ['selenium'],
            'Cypress': ['cypress'],
            
            // Build Tools
            'Webpack': ['webpack'],
            'Babel': ['babel'],
            'Vite': ['vite'],
            'Rollup': ['rollup'],
            'Gradle': ['gradle'],
            'Maven': ['maven', '\\bmvn\\b'],
            
            // Package Managers
            'npm': ['\\bnpm\\b'],
            'yarn': ['yarn'],
            'pip': ['\\bpip\\b', 'pip install'],
            'conda': ['conda', 'anaconda'],
            
            // APIs & Protocols
            'REST API': ['rest api', 'restful', 'rest', 'rest endpoint'],
            'GraphQL': ['graphql'],
            'gRPC': ['grpc'],
            'WebSocket': ['websocket', 'ws'],
            
            // Data & ML
            'TensorFlow': ['tensorflow'],
            'PyTorch': ['pytorch'],
            'Keras': ['keras'],
            'Scikit-learn': ['scikit-learn', 'sklearn'],
            'Pandas': ['pandas'],
            'NumPy': ['numpy'],
            'Spark': ['apache spark', 'pyspark'],
            
            // Web Servers
            'Nginx': ['nginx'],
            'Apache': ['apache http', 'apache server'],
            
            // Message Queues
            'RabbitMQ': ['rabbitmq'],
            'Kafka': ['apache kafka', 'kafka'],
            'Redis Queue': ['rq', 'redis queue'],
            'Celery': ['celery'],
            
            // Monitoring & Logging
            'Prometheus': ['prometheus'],
            'Grafana': ['grafana'],
            'ELK': ['elk stack', 'elasticsearch', 'logstash', 'kibana'],
            'Datadog': ['datadog'],
            'New Relic': ['new relic'],
            
            // Security
            'OAuth': ['oauth', 'oauth2'],
            'JWT': ['jwt', 'json web token'],
            'SSL/TLS': ['ssl', 'tls', 'https'],
            
            // Methodologies
            'CI/CD': ['ci/cd', 'continuous integration', 'continuous deployment'],
            'Agile': ['agile', 'scrum'],
            'TDD': ['tdd', 'test driven development'],
            
            // Other
            'HTML5': ['html', 'html5'],
            'CSS3': ['css', 'css3'],
            'SASS': ['sass', 'scss'],
            'Bootstrap': ['bootstrap'],
            'Tailwind': ['tailwind'],
            'Material-UI': ['material-ui', 'mui']
        };
        
        for (const [tech, patterns] of Object.entries(techPatterns)) {
            for (const pattern of patterns) {
                const regex = new RegExp(pattern, 'i');
                if (regex.test(lowerLine)) {
                    technologies.push(tech);
                    break; // Only add once per technology
                }
            }
        }
        
        return [...new Set(technologies)]; // Remove duplicates
    }
}

module.exports = new ResumeParserService();
