const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

// Configure multer for audio uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/interviews/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /webm|mp3|wav|ogg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.includes('audio');
        
        if (mimetype || extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'));
        }
    }
});

// Interview questions database by track and level
const INTERVIEW_QUESTIONS = {
    'Full-Stack Developer': {
        'Beginner': [
            { id: 'fs-b-1', text: 'Tell me about yourself and why you want to become a full-stack developer.', type: 'text' },
            { id: 'fs-b-2', text: 'What is the difference between HTML and HTML5?', type: 'text' },
            { id: 'fs-b-3', text: 'Explain the box model in CSS.', type: 'text' },
            { id: 'fs-b-4', text: 'What are JavaScript data types?', type: 'text' },
            { id: 'fs-b-5', text: 'Describe a simple project you have built.', type: 'text' },
            { id: 'fs-b-6', text: 'How do you handle errors in JavaScript?', type: 'voice' },
            { id: 'fs-b-7', text: 'What is a REST API?', type: 'voice' },
            { id: 'fs-b-8', text: 'Explain the concept of responsive design.', type: 'voice' },
            { id: 'fs-b-9', text: 'How do you stay updated with new web technologies?', type: 'voice' },
            { id: 'fs-b-10', text: 'Where do you see yourself in your development career in 2 years?', type: 'voice' }
        ],
        'Intermediate': [
            { id: 'fs-i-1', text: 'Explain closures in JavaScript with a practical example.', type: 'text' },
            { id: 'fs-i-2', text: 'What is the difference between authentication and authorization?', type: 'text' },
            { id: 'fs-i-3', text: 'How does React\'s virtual DOM work?', type: 'text' },
            { id: 'fs-i-4', text: 'Describe a challenging bug you debugged and how you solved it.', type: 'text' },
            { id: 'fs-i-5', text: 'How would you optimize a slow-loading web application?', type: 'text' },
            { id: 'fs-i-6', text: 'Walk me through designing a URL shortener service.', type: 'voice' },
            { id: 'fs-i-7', text: 'Explain JWT authentication and its advantages.', type: 'voice' },
            { id: 'fs-i-8', text: 'How do you handle state management in React?', type: 'voice' },
            { id: 'fs-i-9', text: 'Describe your experience with database design.', type: 'voice' },
            { id: 'fs-i-10', text: 'What motivates you as a developer?', type: 'voice' }
        ],
        'Advanced': [
            { id: 'fs-a-1', text: 'Design a scalable notification system for 1 million users.', type: 'text' },
            { id: 'fs-a-2', text: 'Explain microservices architecture and when to use it.', type: 'text' },
            { id: 'fs-a-3', text: 'How would you implement real-time features using WebSockets?', type: 'text' },
            { id: 'fs-a-4', text: 'Describe your approach to code reviews and mentoring junior developers.', type: 'text' },
            { id: 'fs-a-5', text: 'How do you ensure security in web applications?', type: 'text' },
            { id: 'fs-a-6', text: 'Design a distributed caching system.', type: 'voice' },
            { id: 'fs-a-7', text: 'Explain your experience with CI/CD pipelines.', type: 'voice' },
            { id: 'fs-a-8', text: 'How do you handle technical debt in large codebases?', type: 'voice' },
            { id: 'fs-a-9', text: 'Describe a time you led a technical initiative.', type: 'voice' },
            { id: 'fs-a-10', text: 'What is your philosophy on software engineering excellence?', type: 'voice' }
        ]
    },
    'Data Scientist': {
        'Beginner': [
            { id: 'ds-b-1', text: 'Why are you interested in data science?', type: 'text' },
            { id: 'ds-b-2', text: 'Explain the difference between supervised and unsupervised learning.', type: 'text' },
            { id: 'ds-b-3', text: 'What is the purpose of data cleaning?', type: 'text' },
            { id: 'ds-b-4', text: 'Describe a basic machine learning project you have worked on.', type: 'text' },
            { id: 'ds-b-5', text: 'What are the main Python libraries for data analysis?', type: 'text' },
            { id: 'ds-b-6', text: 'How do you handle missing data?', type: 'voice' },
            { id: 'ds-b-7', text: 'What is the difference between regression and classification?', type: 'voice' },
            { id: 'ds-b-8', text: 'Explain cross-validation.', type: 'voice' },
            { id: 'ds-b-9', text: 'How do you evaluate a machine learning model?', type: 'voice' },
            { id: 'ds-b-10', text: 'What area of data science excites you most?', type: 'voice' }
        ],
        'Intermediate': [
            { id: 'ds-i-1', text: 'Explain feature engineering and its importance.', type: 'text' },
            { id: 'ds-i-2', text: 'What is overfitting and how do you prevent it?', type: 'text' },
            { id: 'ds-i-3', text: 'Describe your experience with neural networks.', type: 'text' },
            { id: 'ds-i-4', text: 'How do you approach an imbalanced dataset?', type: 'text' },
            { id: 'ds-i-5', text: 'Explain the bias-variance tradeoff.', type: 'text' },
            { id: 'ds-i-6', text: 'Walk through your process for exploratory data analysis.', type: 'voice' },
            { id: 'ds-i-7', text: 'How do you choose between different algorithms?', type: 'voice' },
            { id: 'ds-i-8', text: 'Describe a time you improved model performance.', type: 'voice' },
            { id: 'ds-i-9', text: 'How do you communicate findings to non-technical stakeholders?', type: 'voice' },
            { id: 'ds-i-10', text: 'What are your career goals in data science?', type: 'voice' }
        ],
        'Advanced': [
            { id: 'ds-a-1', text: 'Design a recommendation system for an e-commerce platform.', type: 'text' },
            { id: 'ds-a-2', text: 'Explain ensemble methods and when to use them.', type: 'text' },
            { id: 'ds-a-3', text: 'How would you deploy a machine learning model to production?', type: 'text' },
            { id: 'ds-a-4', text: 'Describe your experience with deep learning frameworks.', type: 'text' },
            { id: 'ds-a-5', text: 'How do you handle data privacy and ethics in ML projects?', type: 'text' },
            { id: 'ds-a-6', text: 'Design a real-time fraud detection system.', type: 'voice' },
            { id: 'ds-a-7', text: 'Explain your approach to A/B testing.', type: 'voice' },
            { id: 'ds-a-8', text: 'How do you monitor and maintain ML models in production?', type: 'voice' },
            { id: 'ds-a-9', text: 'Describe a complex data science project you led.', type: 'voice' },
            { id: 'ds-a-10', text: 'What is your vision for AI in the next 5 years?', type: 'voice' }
        ]
    },
    'DevOps Engineer': {
        'Beginner': [
            { id: 'do-b-1', text: 'Why are you interested in DevOps?', type: 'text' },
            { id: 'do-b-2', text: 'What is the difference between DevOps and traditional IT?', type: 'text' },
            { id: 'do-b-3', text: 'Explain basic Linux commands you use regularly.', type: 'text' },
            { id: 'do-b-4', text: 'What is version control and why is it important?', type: 'text' },
            { id: 'do-b-5', text: 'Describe your experience with shell scripting.', type: 'text' },
            { id: 'do-b-6', text: 'What is CI/CD?', type: 'voice' },
            { id: 'do-b-7', text: 'Explain the purpose of containerization.', type: 'voice' },
            { id: 'do-b-8', text: 'How do you troubleshoot a server issue?', type: 'voice' },
            { id: 'do-b-9', text: 'What cloud platforms are you familiar with?', type: 'voice' },
            { id: 'do-b-10', text: 'Where do you see your DevOps career going?', type: 'voice' }
        ],
        'Intermediate': [
            { id: 'do-i-1', text: 'Explain Infrastructure as Code and its benefits.', type: 'text' },
            { id: 'do-i-2', text: 'How does Docker differ from virtual machines?', type: 'text' },
            { id: 'do-i-3', text: 'Describe your experience with CI/CD pipelines.', type: 'text' },
            { id: 'do-i-4', text: 'How do you implement monitoring and logging?', type: 'text' },
            { id: 'do-i-5', text: 'What is your approach to handling production incidents?', type: 'text' },
            { id: 'do-i-6', text: 'Walk through deploying a web application to AWS.', type: 'voice' },
            { id: 'do-i-7', text: 'Explain Kubernetes and its use cases.', type: 'voice' },
            { id: 'do-i-8', text: 'How do you ensure security in DevOps practices?', type: 'voice' },
            { id: 'do-i-9', text: 'Describe a time you automated a manual process.', type: 'voice' },
            { id: 'do-i-10', text: 'What motivates you in DevOps work?', type: 'voice' }
        ],
        'Advanced': [
            { id: 'do-a-1', text: 'Design a multi-region disaster recovery strategy.', type: 'text' },
            { id: 'do-a-2', text: 'Explain service mesh and when to implement it.', type: 'text' },
            { id: 'do-a-3', text: 'How do you implement zero-downtime deployments?', type: 'text' },
            { id: 'do-a-4', text: 'Describe your approach to cost optimization in cloud infrastructure.', type: 'text' },
            { id: 'do-a-5', text: 'How do you handle compliance and security audits?', type: 'text' },
            { id: 'do-a-6', text: 'Design a scalable CI/CD pipeline for microservices.', type: 'voice' },
            { id: 'do-a-7', text: 'Explain your experience with chaos engineering.', type: 'voice' },
            { id: 'do-a-8', text: 'How do you implement SRE principles?', type: 'voice' },
            { id: 'do-a-9', text: 'Describe a major infrastructure migration you led.', type: 'voice' },
            { id: 'do-a-10', text: 'What is your philosophy on DevOps culture and collaboration?', type: 'voice' }
        ]
    }
};

/**
 * GET /api/interview/questions
 * Get interview questions for user's track and level
 */
router.get('/questions', auth, async (req, res) => {
    try {
        const { trackId, level } = req.query;
        
        // Get track name from trackId (in production, query from database)
        const trackName = req.query.trackName || 'Full-Stack Developer';
        
        // Get questions for track and level
        const questions = INTERVIEW_QUESTIONS[trackName]?.[level] || INTERVIEW_QUESTIONS['Full-Stack Developer']['Intermediate'];
        
        res.json({
            success: true,
            questions: questions
        });
        
    } catch (error) {
        console.error('Get interview questions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch interview questions'
        });
    }
});

/**
 * POST /api/interview/evaluate
 * Evaluate user's answer with AI
 */
router.post('/evaluate', auth, upload.single('audio'), async (req, res) => {
    try {
        const { questionId, answer, type, trackId, level } = req.body;
        const userId = req.user.id;
        
        // TODO: Implement real AI evaluation using OpenAI or similar
        // For now, use rule-based mock evaluation
        
        const evaluation = evaluateAnswerMock(answer, type);
        
        // TODO: Save evaluation to database
        
        res.json({
            success: true,
            ...evaluation
        });
        
    } catch (error) {
        console.error('Evaluate answer error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to evaluate answer'
        });
    }
});

/**
 * Mock AI evaluation function
 * TODO: Replace with real AI integration
 */
function evaluateAnswerMock(answer, type) {
    const answerLength = answer.trim().length;
    const words = answer.trim().split(/\s+/);
    const wordCount = words.length;
    
    // Simple scoring based on length and content
    let clarity = 7;
    let correctness = 7;
    let depth = 6;
    let confidence = type === 'voice' ? 7 : 8;
    let communication = 7;
    
    // Adjust scores based on answer length
    if (wordCount > 100) depth += 2;
    if (wordCount > 150) depth = Math.min(10, depth + 1);
    if (wordCount < 30) {
        depth -= 2;
        correctness -= 1;
    }
    
    // Check for technical keywords
    const technicalWords = ['implement', 'design', 'architecture', 'scalable', 'optimize', 
                           'security', 'performance', 'database', 'API', 'framework'];
    const technicalCount = technicalWords.filter(word => 
        answer.toLowerCase().includes(word)
    ).length;
    
    if (technicalCount > 3) {
        correctness = Math.min(10, correctness + 2);
        depth = Math.min(10, depth + 1);
    }
    
    // Check for examples or specific details
    if (answer.includes('example') || answer.includes('for instance') || answer.includes('such as')) {
        communication += 1;
        depth += 1;
    }
    
    // Ensure scores are in valid range
    const clamp = (val) => Math.max(1, Math.min(10, val));
    
    const scores = {
        clarity: clamp(clarity + Math.floor(Math.random() * 2)),
        correctness: clamp(correctness + Math.floor(Math.random() * 2)),
        depth: clamp(depth + Math.floor(Math.random() * 2)),
        confidence: clamp(confidence + Math.floor(Math.random() * 2)),
        communication: clamp(communication + Math.floor(Math.random() * 2))
    };
    
    const overallScore = (scores.clarity + scores.correctness + scores.depth + 
                         scores.confidence + scores.communication) / 5;
    
    // Generate feedback
    let feedback = '';
    
    if (overallScore >= 8.5) {
        feedback = `Excellent ${type} answer! You demonstrated comprehensive understanding and communicated your thoughts clearly. `;
        if (type === 'voice') {
            feedback += 'Your speaking pace and articulation were impressive. ';
        } else {
            feedback += 'Your written explanation was well-structured and detailed. ';
        }
        feedback += 'Keep up the great work!';
    } else if (overallScore >= 7) {
        feedback = `Good ${type} answer! You covered the main points effectively. `;
        if (wordCount < 50) {
            feedback += 'Consider providing more specific examples and details to strengthen your response. ';
        }
        if (type === 'voice') {
            feedback += 'Try to maintain a confident tone throughout your explanation. ';
        }
        feedback += 'Overall, well done!';
    } else {
        feedback = `Your ${type} answer shows understanding, but there\'s room for improvement. `;
        if (wordCount < 30) {
            feedback += 'Try to provide more detailed explanations with specific examples. ';
        }
        if (technicalCount < 2) {
            feedback += 'Include more technical details and terminology. ';
        }
        feedback += 'Keep practicing and you\'ll improve!';
    }
    
    return {
        scores: scores,
        feedback: feedback,
        overallScore: parseFloat(overallScore.toFixed(1))
    };
}

/**
 * POST /api/interview/save-session
 * Save interview session progress
 */
router.post('/save-session', auth, async (req, res) => {
    try {
        const { sessionId, answers, scores } = req.body;
        const userId = req.user.id;
        
        // TODO: Save to database
        
        res.json({
            success: true,
            message: 'Session saved successfully'
        });
        
    } catch (error) {
        console.error('Save session error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save session'
        });
    }
});

/**
 * GET /api/interview/history
 * Get user's interview history
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
        console.error('Get interview history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch history'
        });
    }
});

module.exports = router;
