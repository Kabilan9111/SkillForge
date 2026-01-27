const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/resumes/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF and DOC files are allowed'));
        }
    }
});

// Skills database by track and level
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
        },
        'Advanced': {
            frontend: ['Next.js', 'Server-Side Rendering', 'Performance Optimization', 'WebSockets'],
            backend: ['Microservices', 'GraphQL', 'Message Queues', 'Caching'],
            database: ['Database Design', 'Sharding', 'Replication', 'Query Optimization'],
            tools: ['Kubernetes', 'CI/CD', 'AWS/Azure', 'Monitoring'],
            dsa: ['Tries', 'Graphs', 'Dynamic Programming', 'Greedy Algorithms', 'Advanced Trees']
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
        },
        'Advanced': {
            ml: ['XGBoost', 'LightGBM', 'Model Optimization', 'Ensemble Methods'],
            deeplearning: ['PyTorch', 'CNNs', 'RNNs', 'Transformers', 'GANs'],
            deployment: ['MLOps', 'Model Serving', 'A/B Testing', 'Monitoring'],
            bigdata: ['Spark', 'Hadoop', 'Distributed Computing'],
            dsa: ['Graphs', 'Dynamic Programming', 'Advanced Algorithms']
        }
    },
    'DevOps Engineer': {
        'Beginner': {
            linux: ['Linux Basics', 'Shell Scripting', 'File System'],
            networking: ['TCP/IP', 'DNS', 'HTTP/HTTPS'],
            tools: ['Git', 'SSH', 'Text Editors'],
            scripting: ['Bash', 'Python Basics']
        },
        'Intermediate': {
            containers: ['Docker', 'Docker Compose', 'Container Orchestration'],
            cicd: ['Jenkins', 'GitLab CI', 'GitHub Actions'],
            cloud: ['AWS EC2', 'S3', 'VPC', 'IAM'],
            iac: ['Terraform', 'Ansible'],
            monitoring: ['Prometheus', 'Grafana']
        },
        'Advanced': {
            kubernetes: ['Kubernetes', 'Helm', 'Service Mesh'],
            cloud: ['Multi-Cloud', 'Serverless', 'Cloud Security'],
            automation: ['Advanced IaC', 'GitOps', 'Policy as Code'],
            sre: ['SLI/SLO/SLA', 'Incident Management', 'Chaos Engineering']
        }
    }
};

/**
 * POST /api/skill-gap/analyze
 * Upload and analyze resume for skill gaps
 */
router.post('/analyze', auth, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }
        
        const { trackId, level } = req.body;
        const userId = req.user.id;
        
        // TODO: Implement actual resume parsing with PDF/DOC extraction
        // For now, simulate with mock data
        
        // Mock: Extract skills from resume (in production, use PDF parser + NLP)
        const extractedSkills = {
            frontend: ['HTML5', 'CSS3', 'JavaScript ES6'],
            backend: ['Node.js', 'Express.js'],
            database: ['MongoDB Basics'],
            tools: ['Git', 'VS Code'],
            dsa: ['Arrays']
        };
        
        // Get required skills for track and level
        const trackName = req.body.trackName || 'Full-Stack Developer';
        const requiredSkills = SKILL_REQUIREMENTS[trackName]?.[level] || {};
        
        // Analyze gaps
        const analysis = {
            strong: [],
            weak: [],
            missing: []
        };
        
        Object.entries(requiredSkills).forEach(([category, skills]) => {
            const userSkillsInCategory = extractedSkills[category] || [];
            
            skills.forEach(skill => {
                if (userSkillsInCategory.includes(skill)) {
                    analysis.strong.push({ skill, category });
                } else {
                    // Simulate weak vs missing (in production, use confidence scores)
                    if (Math.random() > 0.7) {
                        analysis.weak.push({ skill, category });
                    } else {
                        analysis.missing.push({ skill, category });
                    }
                }
            });
        });
        
        // Calculate overall score
        const totalRequired = Object.values(requiredSkills).flat().length;
        const score = Math.round((analysis.strong.length / totalRequired) * 100);
        
        res.json({
            success: true,
            analysis: {
                score: score,
                strong: analysis.strong,
                weak: analysis.weak,
                missing: analysis.missing,
                fileName: req.file.originalname,
                uploadDate: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Resume analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to analyze resume'
        });
    }
});

/**
 * POST /api/skill-gap/adjust
 * Adjust user's roadmap based on skill gap analysis
 */
router.post('/adjust', auth, async (req, res) => {
    try {
        const { missingSkills, weakSkills, trackId } = req.body;
        const userId = req.user.id;
        
        // TODO: Implement roadmap adjustment logic
        // 1. Query existing user roadmap
        // 2. Add modules for missing skills
        // 3. Prioritize weak skills
        // 4. Update module order
        // 5. Save to database
        
        // Mock response
        const adjustedModules = [
            { id: 1, name: 'React Fundamentals', priority: 'high', reason: 'Missing skill: React.js' },
            { id: 2, name: 'TypeScript Basics', priority: 'high', reason: 'Missing skill: TypeScript' },
            { id: 3, name: 'API Design Patterns', priority: 'medium', reason: 'Weak skill: API Design' }
        ];
        
        res.json({
            success: true,
            message: 'Roadmap adjusted successfully',
            addedModules: adjustedModules,
            totalModules: adjustedModules.length
        });
        
    } catch (error) {
        console.error('Roadmap adjustment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to adjust roadmap'
        });
    }
});

/**
 * GET /api/skill-gap/history
 * Get user's analysis history
 */
router.get('/history', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // TODO: Query from database
        const history = [];
        
        res.json({
            success: true,
            history: history
        });
        
    } catch (error) {
        console.error('Get analysis history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch history'
        });
    }
});

module.exports = router;
