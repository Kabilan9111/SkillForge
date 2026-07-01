/**
 * Mock Interview Module
 * Handles complete interview flow with text and voice-based questions
 * Implements Web Speech API, MediaRecorder, and Text-to-Speech
 * @version 1.0.0
 */

const MockInterview = (function() {
    'use strict';

    // ==================== CONFIGURATION ====================
    const CONFIG = {
        TOTAL_QUESTIONS: 10,
        TEXT_QUESTIONS_COUNT: 5,
        VOICE_QUESTIONS_COUNT: 5,
        QUESTION_TIME_LIMIT: 300, // 5 minutes in seconds
        MIN_TEXT_LENGTH: 50,
        WARNING_TIME: 60, // Yellow warning at 1 minute
        CRITICAL_TIME: 30, // Red alert at 30 seconds
        STORAGE_KEY: 'mockInterviewSession',
        API_BASE_URL: '/api'
    };

    // ==================== STATE MANAGEMENT ====================
    let state = {
        sessionId: null,
        currentQuestionIndex: 0,
        questions: [],
        answers: [],
        scores: [],
        startTime: null,
        trackId: null,
        level: null,
        timerInterval: null,
        timeRemaining: CONFIG.QUESTION_TIME_LIMIT,
        isRecording: false,
        mediaRecorder: null,
        audioChunks: [],
        recordedAudioBlob: null,
        recordingStartTime: null,
        recordingInterval: null,
        recordingMimeType: null,
        recognition: null,
        currentTranscript: '',
        speechSynthesis: window.speechSynthesis,
        currentQuestionSpeech: null,
        currentFeedbackSpeech: null,
        currentPhase: 'text', // 'text' or 'voice'
        hasSubmittedCurrentQuestion: false, // Track if current question has been evaluated
        isEvaluating: false // Track if evaluation is in progress
    };

    // ==================== DOM ELEMENTS ====================
    let elements = {};

    // ==================== SPEECH RECOGNITION SETUP ====================
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    function initializeSpeechRecognition() {
        if (!SpeechRecognition) {
            console.warn('Web Speech API not supported in this browser');
            return null;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            state.currentTranscript = (state.currentTranscript + finalTranscript).trim();
            updateTranscriptionDisplay(state.currentTranscript + interimTranscript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            showNotification(`Voice recognition error: ${event.error}`, 'error');
        };

        recognition.onend = () => {
            if (state.isRecording) {
                // Restart if still recording
                try {
                    recognition.start();
                } catch (e) {
                    console.error('Failed to restart recognition:', e);
                }
            }
        };

        return recognition;
    }

    // ==================== INITIALIZATION ====================
    function init() {
        console.log('[Mock Interview] Initializing module...');
        cacheElements();
        
        // Check if elements exist before initializing
        if (!elements.interviewPage) {
            console.warn('[Mock Interview] Mock Interview page not found in DOM');
            return;
        }

        if (document.getElementById('wr-config-view') || document.querySelector('.wr-hero')) {
            console.log('[Mock Interview] Executive War Room UI active. Skipping legacy init.');
            return;
        }

        console.log('[Mock Interview] Setting up event listeners...');
        setupEventListeners();
        state.recognition = initializeSpeechRecognition();
        loadUserInfo();
        checkForSavedSession();
        console.log('[Mock Interview] ✓ Initialization complete. Start screen should be visible.');
    }

    function cacheElements() {
        // Main containers
        elements.interviewPage = document.getElementById('mock-interview-page');
        elements.startScreen = document.getElementById('interview-start-screen');
        elements.activeScreen = document.getElementById('interview-active-screen');
        elements.completeScreen = document.getElementById('interview-complete-screen');
        
        // Start screen
        elements.startBtn = document.getElementById('start-interview-btn');
        elements.resumeBtn = document.getElementById('resume-interview-btn');
        elements.trackName = document.getElementById('interview-track-name');
        elements.levelName = document.getElementById('interview-level-name');
        
        // Active screen - header
        elements.phaseBadge = document.getElementById('current-phase-badge');
        elements.questionNumber = document.getElementById('question-number');
        elements.timer = document.getElementById('timer-value');
        elements.endInterviewBtn = document.getElementById('end-interview-btn');
        elements.progressBar = document.getElementById('interview-progress-fill');
        
        // Question panel
        elements.answerModeBadge = document.getElementById('answer-mode-badge');
        elements.questionText = document.getElementById('current-question-text');
        elements.questionContext = document.getElementById('question-context');
        elements.contextText = document.getElementById('context-text');
        elements.speakQuestionBtn = document.getElementById('speak-question-btn');
        
        // Text answer area
        elements.textAnswerArea = document.getElementById('text-answer-area');
        elements.textAnswer = document.getElementById('text-answer-input');
        elements.charCount = document.getElementById('char-count');
        elements.submitTextBtn = document.getElementById('submit-text-answer-btn');
        
        // Voice answer area
        elements.voiceAnswerArea = document.getElementById('voice-answer-area');
        elements.micStatus = document.getElementById('mic-status');
        elements.startRecordingBtn = document.getElementById('start-recording-btn');
        elements.stopRecordingBtn = document.getElementById('stop-recording-btn');
        elements.reRecordBtn = document.getElementById('re-record-btn');
        elements.recordingTimer = document.getElementById('recording-timer');
        elements.recordingDuration = document.getElementById('recording-duration');
        elements.transcription = document.getElementById('transcription-preview');
        elements.audioPlayback = document.getElementById('audio-playback-section');
        elements.recordedAudio = document.getElementById('recorded-audio');
        elements.submitVoiceBtn = document.getElementById('submit-voice-answer-btn');
        
        // Feedback area
        elements.feedbackArea = document.getElementById('feedback-area');
        elements.feedbackLoading = document.getElementById('feedback-loading');
        elements.feedbackContent = document.getElementById('feedback-content');
        elements.scoreClarity = document.getElementById('score-clarity');
        elements.scoreClarityValue = document.getElementById('score-clarity-value');
        elements.scoreCorrectness = document.getElementById('score-correctness');
        elements.scoreCorrectnessValue = document.getElementById('score-correctness-value');
        elements.scoreDepth = document.getElementById('score-depth');
        elements.scoreDepthValue = document.getElementById('score-depth-value');
        elements.scoreConfidence = document.getElementById('score-confidence');
        elements.scoreConfidenceValue = document.getElementById('score-confidence-value');
        elements.scoreCommunication = document.getElementById('score-communication');
        elements.scoreCommunicationValue = document.getElementById('score-communication-value');
        elements.feedbackText = document.getElementById('feedback-text-content');
        elements.playFeedbackBtn = document.getElementById('play-feedback-audio-btn');
        elements.stopFeedbackBtn = document.getElementById('stop-feedback-audio-btn');
        elements.nextQuestionBtn = document.getElementById('next-question-btn');
        
        // Complete screen
        elements.finalScore = document.getElementById('final-average-score');
        elements.finalTextScore = document.getElementById('final-text-score');
        elements.finalVoiceScore = document.getElementById('final-voice-score');
        elements.startNewBtn = document.getElementById('start-new-interview-btn');
        elements.viewReportBtn = document.getElementById('view-detailed-report-btn');
    }

    function setupEventListeners() {
        // Start screen
        if (elements.startBtn) {
            console.log('[Mock Interview] Attaching click handler to Start Interview button');
            elements.startBtn.addEventListener('click', startNewInterview);
        } else {
            console.warn('[Mock Interview] Start button not found in DOM');
        }
        if (elements.resumeBtn) {
            elements.resumeBtn.addEventListener('click', resumeInterview);
        }
        
        // Active screen
        if (elements.endInterviewBtn) {
            elements.endInterviewBtn.addEventListener('click', confirmEndInterview);
        }
        
        // Speak question button
        if (elements.speakQuestionBtn) {
            elements.speakQuestionBtn.addEventListener('click', () => {
                const question = state.questions[state.currentQuestionIndex];
                if (question) {
                    speakQuestion(question.text);
                }
            });
        }
        
        // Text answer
        if (elements.textAnswer) {
            elements.textAnswer.addEventListener('input', updateCharCount);
        }
        if (elements.submitTextBtn) {
            elements.submitTextBtn.addEventListener('click', submitTextAnswer);
        }
        
        // Voice answer
        if (elements.startRecordingBtn) {
            elements.startRecordingBtn.addEventListener('click', startRecording);
        }
        if (elements.stopRecordingBtn) {
            elements.stopRecordingBtn.addEventListener('click', stopRecording);
        }
        if (elements.reRecordBtn) {
            elements.reRecordBtn.addEventListener('click', rerecordAnswer);
        }
        if (elements.submitVoiceBtn) {
            elements.submitVoiceBtn.addEventListener('click', submitVoiceAnswer);
        }
        
        // Feedback audio controls
        if (elements.playFeedbackBtn) {
            elements.playFeedbackBtn.addEventListener('click', () => {
                const feedbackText = elements.feedbackText ? elements.feedbackText.textContent : '';
                if (feedbackText) {
                    speakFeedback(feedbackText);
                }
            });
        }
        if (elements.stopFeedbackBtn) {
            elements.stopFeedbackBtn.addEventListener('click', stopFeedbackSpeech);
        }
        
        // Navigation
        if (elements.nextQuestionBtn) {
            elements.nextQuestionBtn.addEventListener('click', moveToNextQuestion);
        }
        
        // Complete screen
        if (elements.startNewBtn) {
            elements.startNewBtn.addEventListener('click', startNewInterview);
        }
        if (elements.viewReportBtn) {
            elements.viewReportBtn.addEventListener('click', viewDetailedReport);
        }
    }

    // ==================== SESSION MANAGEMENT ====================
    function getUserTrackInfo() {
        return {
            trackId: localStorage.getItem('selectedTrackId') || '1',
            trackName: localStorage.getItem('selectedTrackName') || 'Full-Stack Developer',
            level: localStorage.getItem('currentUserLevel') || 'Intermediate'
        };
    }

    function loadUserInfo() {
        const userTrack = getUserTrackInfo();
        console.log('[Mock Interview] Loading user info:', userTrack);
        
        if (elements.trackName) {
            elements.trackName.textContent = userTrack.trackName;
        }
        if (elements.levelName) {
            elements.levelName.textContent = userTrack.level;
        }
    }

    function checkForSavedSession() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (saved) {
            try {
                const session = JSON.parse(saved);
                if (session.currentQuestionIndex < CONFIG.TOTAL_QUESTIONS) {
                    // Show resume button
                    if (elements.resumeBtn) {
                        elements.resumeBtn.style.display = 'inline-block';
                    }
                }
            } catch (e) {
                console.error('Failed to parse saved session:', e);
                localStorage.removeItem(CONFIG.STORAGE_KEY);
            }
        }
    }

    function saveSession() {
        const sessionData = {
            sessionId: state.sessionId,
            currentQuestionIndex: state.currentQuestionIndex,
            questions: state.questions,
            answers: state.answers,
            scores: state.scores,
            startTime: state.startTime,
            trackId: state.trackId,
            level: state.level
        };
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(sessionData));
    }

    function clearSession() {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
    }

    function generateSessionId() {
        return `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // ==================== INTERVIEW FLOW ====================
    function clearSavedSession() {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        if (elements.resumeBtn) {
            elements.resumeBtn.style.display = 'none';
        }
    }

    async function startNewInterview() {
        console.log('[Mock Interview] Start button clicked - beginning new interview...');
        
        // Clear any saved session since we're starting fresh
        clearSavedSession();
        
        // Get user's track and level from app state or localStorage
        const userTrack = getUserTrackInfo();
        console.log('[Mock Interview] User track info:', userTrack);
        
        // VALIDATION: Check if track and level are selected
        if (!userTrack.trackId || userTrack.trackId === 'null' || 
            !userTrack.level || userTrack.level === 'null') {
            console.warn('[Mock Interview] Missing track or level - blocking start');
            showStartError('Please select a career track and complete a level assessment before starting the interview.');
            return;
        }
        
        console.log('[Mock Interview] Validation passed, proceeding with interview start...');
        
        // Disable start button to prevent double-click
        if (elements.startBtn) {
            elements.startBtn.disabled = true;
            elements.startBtn.textContent = 'Loading...';
        }
        
        try {
            // Initialize session state
            state.sessionId = generateSessionId();
            state.currentQuestionIndex = 0;
            state.answers = [];
            state.scores = [];
            state.startTime = Date.now();
            state.trackId = userTrack.trackId;
            state.level = userTrack.level;
            state.currentPhase = 'text';
            
            // Load questions and wait for completion
            console.log('[Mock Interview] Loading questions...');
            await loadQuestions();
            
            // Validate questions loaded successfully
            if (!state.questions || state.questions.length === 0) {
                throw new Error('No questions available');
            }
            
            console.log('[Mock Interview] Questions validated, count:', state.questions.length);
            
            // Show active screen
            console.log('[Mock Interview] Transitioning to active screen...');
            showScreen('active');
            
            // Display first question
            console.log('[Mock Interview] Displaying first question...');
            displayQuestion(0);
            
            // Start timer
            console.log('[Mock Interview] Starting timer...');
            startTimer();
            
            // Clear any error message
            hideStartError();
            
            console.log('[Mock Interview] Interview started successfully!');
            
        } catch (error) {
            console.error('Failed to start interview:', error);
            showStartError('Failed to load interview questions. Please try again.');
            
            // Re-enable start button
            if (elements.startBtn) {
                elements.startBtn.disabled = false;
                elements.startBtn.textContent = 'Start Interview';
            }
        }
    }

    async function resumeInterview() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (!saved) {
            showNotification('No saved session found', 'error');
            return;
        }
        
        try {
            const session = JSON.parse(saved);
            state.sessionId = session.sessionId;
            state.currentQuestionIndex = session.currentQuestionIndex;
            state.questions = session.questions;
            state.answers = session.answers;
            state.scores = session.scores;
            state.startTime = session.startTime;
            state.trackId = session.trackId;
            state.level = session.level;
            
            showScreen('active');
            displayQuestion(state.currentQuestionIndex);
            startTimer();
        } catch (e) {
            console.error('Failed to resume session:', e);
            showNotification('Failed to resume session', 'error');
        }
    }

    function confirmEndInterview() {
        if (confirm('Are you sure you want to end the interview? Your progress will be saved.')) {
            endInterview();
        }
    }

    function endInterview() {
        // Stop timer immediately
        stopTimer();
        
        // Stop all speech and clear recording
        if (state.speechSynthesis && state.speechSynthesis.speaking) {
            state.speechSynthesis.cancel();
        }
        clearRecordingState();
        
        // Save current session state for resume functionality
        saveSession();
        
        // Immediately show start screen (exit interview)
        showScreen('start');
        
        // Re-enable start button
        if (elements.startBtn) {
            elements.startBtn.disabled = false;
            elements.startBtn.textContent = 'Start Interview';
        }
        
        // Check and show resume button if valid session exists
        checkForSavedSession();
    }

    function resetInterviewState() {
        console.log('[State] Resetting interview state');
        
        // Stop all timers
        if (state.timerInterval) {
            clearInterval(state.timerInterval);
            state.timerInterval = null;
        }
        if (state.recordingInterval) {
            clearInterval(state.recordingInterval);
            state.recordingInterval = null;
        }
        
        // Stop speech synthesis
        if (state.speechSynthesis && state.speechSynthesis.speaking) {
            state.speechSynthesis.cancel();
        }
        
        // Clear recording
        clearRecordingState();
        
        // Reset state
        state.sessionId = null;
        state.currentQuestionIndex = 0;
        state.questions = [];
        state.answers = [];
        state.scores = [];
        state.startTime = null;
        state.timeRemaining = CONFIG.QUESTION_TIME_LIMIT;
        state.currentPhase = 'text';
        
        // Re-enable start button
        if (elements.startBtn) {
            elements.startBtn.disabled = false;
            elements.startBtn.textContent = 'Start Interview';
        }
        
        console.log('[State] Reset complete');
    }

    // ==================== QUESTIONS ====================
    async function loadQuestions() {
        console.log('[Mock Interview] Loading questions...');
        try {
            const response = await fetch(
                `${CONFIG.API_BASE_URL}/interview/questions?trackId=${state.trackId}&level=${state.level}`
            );
            
            if (response.ok) {
                const data = await response.json();
                state.questions = data.questions;
                console.log('[Mock Interview] Questions loaded from API:', state.questions.length);
            } else {
                throw new Error('Failed to load questions from API');
            }
        } catch (error) {
            console.warn('[Mock Interview] API failed, using fallback questions:', error.message);
            state.questions = getFallbackQuestions();
            console.log('[Mock Interview] Fallback questions loaded:', state.questions.length);
        }
        
        // Validate that questions were loaded
        if (!state.questions || state.questions.length === 0) {
            console.error('[Mock Interview] CRITICAL: No questions loaded!');
            throw new Error('Failed to load interview questions');
        }
        
        return state.questions;
    }

    function getFallbackQuestions() {
        const textQuestions = [
            {
                id: 'text-1',
                text: 'Explain the concept of closures in JavaScript with an example.',
                type: 'text',
                referenceAnswer: {
                    definition: 'A closure is a function bundled with references to its surrounding state (lexical environment). It allows inner functions to access outer function variables even after the outer function has returned.',
                    keyPoints: ['lexical scope', 'inner function', 'outer variables', 'code example', 'use case'],
                    codeExample: 'function outer(x) { return function inner(y) { return x + y; }; } const add5 = outer(5); add5(3); // returns 8',
                    commonMistakes: ['Confusing with IIFE', 'Not providing example', 'Unclear about scope retention']
                }
            },
            {
                id: 'text-2',
                text: 'What are the differences between REST and GraphQL APIs?',
                type: 'text',
                referenceAnswer: {
                    definition: 'REST uses multiple endpoints with fixed responses; GraphQL uses a single endpoint where clients specify exact data requirements.',
                    keyPoints: ['endpoints', 'over-fetching', 'under-fetching', 'schema', 'flexibility'],
                    codeExample: 'REST: GET /users/:id, GET /users/:id/posts vs GraphQL: query { user(id: 1) { name posts { title } } }',
                    commonMistakes: ['Only listing differences without context', 'Not mentioning data fetching issues', 'Missing practical implications']
                }
            },
            {
                id: 'text-3',
                text: 'Describe the SOLID principles in object-oriented programming.',
                type: 'text',
                referenceAnswer: {
                    definition: 'SOLID is an acronym for five design principles: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.',
                    keyPoints: ['single responsibility', 'open closed', 'liskov substitution', 'interface segregation', 'dependency inversion'],
                    codeExample: 'SRP: class User handles only user data, not email sending. OCP: extend behavior via inheritance, not modification.',
                    commonMistakes: ['Only stating acronym without explanation', 'Not providing examples', 'Confusing principles']
                }
            },
            {
                id: 'text-4',
                text: 'How does virtual DOM work in React? What are its benefits?',
                type: 'text',
                referenceAnswer: {
                    definition: 'Virtual DOM is an in-memory representation of the real DOM. React creates a virtual copy, compares it with previous state (diffing), and updates only changed parts.',
                    keyPoints: ['in-memory representation', 'diffing algorithm', 'reconciliation', 'batch updates', 'performance'],
                    codeExample: 'setState() → new vDOM → diff with old vDOM → calculate minimal changes → update real DOM',
                    commonMistakes: ['Not explaining diffing', 'Missing performance benefits', 'Confusing with Shadow DOM']
                }
            },
            {
                id: 'text-5',
                text: 'Explain the differences between SQL and NoSQL databases.',
                type: 'text',
                referenceAnswer: {
                    definition: 'SQL databases use structured schema with ACID transactions and relational tables. NoSQL databases use flexible schemas with eventual consistency and various data models (document, key-value, graph).',
                    keyPoints: ['schema', 'ACID vs BASE', 'scalability', 'data structure', 'use cases'],
                    codeExample: 'SQL: users table with foreign keys. NoSQL: user documents with embedded data.',
                    commonMistakes: ['Only listing features without context', 'Not mentioning scalability trade-offs', 'Missing use case examples']
                }
            }
        ];
        
        const voiceQuestions = [
            {
                id: 'voice-1',
                text: 'Tell me about a challenging project you worked on and how you overcame the obstacles.',
                type: 'voice',
                referenceAnswer: {
                    definition: 'A strong answer includes: specific project context, clear technical challenge, solution approach, measurable outcome, and lessons learned.',
                    keyPoints: ['project context', 'specific challenge', 'technical solution', 'outcome', 'lessons learned'],
                    codeExample: null,
                    commonMistakes: ['Being too vague', 'Not mentioning outcome', 'Only describing problem without solution']
                }
            },
            {
                id: 'voice-2',
                text: 'How do you stay updated with the latest technology trends?',
                type: 'voice',
                referenceAnswer: {
                    definition: 'Effective learning includes: specific resources (blogs, podcasts), hands-on experimentation, community engagement, and applying new knowledge in projects.',
                    keyPoints: ['specific sources', 'hands-on practice', 'community involvement', 'continuous learning', 'application'],
                    codeExample: null,
                    commonMistakes: ['Generic answers like "reading articles"', 'Not naming specific sources', 'No mention of practical application']
                }
            },
            {
                id: 'voice-3',
                text: 'Describe your approach to debugging a complex issue in production.',
                type: 'voice',
                referenceAnswer: {
                    definition: 'Systematic debugging: gather data (logs, metrics), reproduce issue, isolate root cause, test hypothesis, implement fix, verify, prevent recurrence.',
                    keyPoints: ['data gathering', 'reproduction', 'isolation', 'hypothesis testing', 'prevention'],
                    codeExample: null,
                    commonMistakes: ['Jumping to solutions', 'Not mentioning monitoring tools', 'Missing prevention strategies']
                }
            },
            {
                id: 'voice-4',
                text: 'How do you handle disagreements with team members during code reviews?',
                type: 'voice',
                referenceAnswer: {
                    definition: 'Professional conflict resolution: listen actively, present technical reasoning with evidence, focus on code quality, use data, seek consensus, and document decisions.',
                    keyPoints: ['active listening', 'technical evidence', 'objective criteria', 'compromise', 'documentation'],
                    codeExample: null,
                    commonMistakes: ['Being defensive', 'Making it personal', 'Not providing technical justification']
                }
            },
            {
                id: 'voice-5',
                text: 'What motivates you to pursue a career in software development?',
                type: 'voice',
                referenceAnswer: {
                    definition: 'Authentic motivation combines: problem-solving passion, impact on users, continuous learning, creative expression, and specific examples of fulfilling projects.',
                    keyPoints: ['problem-solving', 'impact', 'learning', 'creativity', 'specific examples'],
                    codeExample: null,
                    commonMistakes: ['Generic clichés', 'No specific examples', 'Purely monetary focus']
                }
            }
        ];
        
        return [...textQuestions, ...voiceQuestions];
    }

    // ==================== EVALUATION SERVICE ====================
    const EvaluationService = {
        async evaluateWithAI(question, answer, metadata) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/interview/evaluate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        questionId: question.id,
                        questionText: question.text,
                        userAnswer: answer,
                        referenceAnswer: question.referenceAnswer,
                        metadata: {
                            trackId: metadata.trackId,
                            level: metadata.level,
                            type: metadata.type
                        }
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const result = await response.json();
                return { success: true, data: result, source: 'ai' };

            } catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    console.error('[Evaluation] API timeout after 15s');
                } else {
                    console.error('[Evaluation] API error:', error);
                }
                return { success: false, error: error.message };
            }
        },

        evaluateStrictLocal(question, answer, metadata) {
            const answerLower = answer.trim().toLowerCase();
            const wordCount = answer.split(/\s+/).filter(w => w.length > 2).length;
            
            if (!answer.trim() || wordCount < 5) {
                return {
                    isCorrect: false,
                    scores: { clarity: 0, correctness: 0, depth: 0, confidence: 0, communication: 0 },
                    verdict: 'INSUFFICIENT',
                    feedback: 'Answer is too short or empty. A minimum of 5 meaningful words is required.',
                    gaps: question.referenceAnswer.keyPoints,
                    correctAnswer: question.referenceAnswer.definition,
                    improvements: ['Provide a complete answer', 'Address the key concepts', 'Include specific examples']
                };
            }

            const ref = question.referenceAnswer;
            const keyPoints = ref.keyPoints || [];
            let pointsCovered = 0;
            let missingPoints = [];

            keyPoints.forEach(point => {
                if (answerLower.includes(point.toLowerCase()) || 
                    answerLower.includes(point.replace(/\s+/g, '').toLowerCase())) {
                    pointsCovered++;
                } else {
                    missingPoints.push(point);
                }
            });

            const coverage = keyPoints.length > 0 ? pointsCovered / keyPoints.length : 0;
            const hasExample = /example|for instance|such as|e\.g\.|like/.test(answerLower);
            const hasStructure = answer.includes('.') || answer.includes(',');

            // STRICT SCORING
            let correctness, depth, clarity;

            if (coverage >= 0.8) {
                correctness = 9;
                depth = hasExample ? 8 : 6;
                clarity = hasStructure ? 8 : 6;
            } else if (coverage >= 0.6) {
                correctness = 7;
                depth = hasExample ? 6 : 4;
                clarity = hasStructure ? 6 : 4;
            } else if (coverage >= 0.4) {
                correctness = 4;
                depth = 3;
                clarity = 4;
            } else if (coverage >= 0.2) {
                correctness = 2;
                depth = 2;
                clarity = 3;
            } else {
                correctness = 0;
                depth = 0;
                clarity = 1;
            }

            const confidence = metadata.type === 'voice' ? Math.min(7, Math.floor(wordCount / 10)) : 6;
            const communication = Math.round((clarity + confidence) / 2);

            const isCorrect = correctness >= 7;
            let verdict, feedback;

            if (correctness === 0) {
                verdict = 'INCORRECT';
                feedback = `Your answer is incorrect. You did not address any of the required concepts: ${keyPoints.join(', ')}. `;
            } else if (correctness <= 4) {
                verdict = 'PARTIALLY INCORRECT';
                feedback = `Your answer is partially incorrect. You covered ${pointsCovered}/${keyPoints.length} key points. Missing: ${missingPoints.join(', ')}. `;
            } else if (correctness <= 6) {
                verdict = 'INCOMPLETE';
                feedback = `Your answer is incomplete but on the right track. Missing critical points: ${missingPoints.join(', ')}. `;
            } else {
                verdict = 'CORRECT';
                feedback = `Your answer correctly addresses the main concepts. `;
                if (missingPoints.length > 0) {
                    feedback += `To improve further, mention: ${missingPoints.join(', ')}. `;
                }
            }

            if (!hasExample && metadata.type === 'text') {
                feedback += 'Include a concrete example to strengthen your explanation. ';
            }

            if (wordCount < 30) {
                feedback += `Expand your answer (current: ${wordCount} words, minimum: 30). `;
            }

            return {
                isCorrect,
                scores: { clarity, correctness, depth, confidence, communication },
                verdict,
                feedback: feedback.trim(),
                gaps: missingPoints,
                correctAnswer: ref.definition + (ref.codeExample ? ` Example: ${ref.codeExample}` : ''),
                improvements: this.generateImprovements(coverage, hasExample, wordCount, missingPoints)
            };
        },

        generateImprovements(coverage, hasExample, wordCount, missingPoints) {
            const improvements = [];
            if (coverage < 0.8 && missingPoints.length > 0) {
                improvements.push(`Address missing concepts: ${missingPoints.slice(0, 3).join(', ')}`);
            }
            if (!hasExample) {
                improvements.push('Provide concrete examples or use cases');
            }
            if (wordCount < 30) {
                improvements.push('Expand with more detail and explanation');
            }
            if (improvements.length === 0) {
                improvements.push('Consider adding real-world applications');
            }
            return improvements;
        }
    };

    function displayQuestion(index) {
        const question = state.questions[index];
        if (!question) return;
        
        // Reset submission tracking for new question
        state.hasSubmittedCurrentQuestion = false;
        state.isEvaluating = false;
        
        // Determine current phase
        state.currentPhase = index < CONFIG.TEXT_QUESTIONS_COUNT ? 'text' : 'voice';
        
        // Update phase badge
        updatePhaseBadge();
        
        // Update question number
        if (elements.questionNumber) {
            elements.questionNumber.textContent = `Question ${index + 1} of ${CONFIG.TOTAL_QUESTIONS}`;
        }
        
        // Update progress bar
        if (elements.progressBar) {
            const progress = ((index + 1) / CONFIG.TOTAL_QUESTIONS) * 100;
            elements.progressBar.style.width = `${progress}%`;
        }
        
        // Update question text
        if (elements.questionText) {
            elements.questionText.textContent = question.text;
        }
        
        // Update context if available
        if (question.context && elements.contextText) {
            elements.questionContext.style.display = 'block';
            elements.contextText.textContent = question.context;
        } else if (elements.questionContext) {
            elements.questionContext.style.display = 'none';
        }
        
        // Update answer mode badge
        if (elements.answerModeBadge) {
            if (question.type === 'text') {
                elements.answerModeBadge.innerHTML = '<i class="fas fa-keyboard"></i><span>Text Answer Required</span>';
                elements.answerModeBadge.className = 'answer-mode-badge text-mode';
            } else {
                elements.answerModeBadge.innerHTML = '<i class="fas fa-microphone"></i><span>Voice Answer Required</span>';
                elements.answerModeBadge.className = 'answer-mode-badge voice-mode';
            }
        }
        
        // Show appropriate answer area
        if (question.type === 'text') {
            showTextAnswerArea();
            // Auto-speak question in text round
            setTimeout(() => speakQuestion(question.text), 500);
        } else {
            showVoiceAnswerArea();
            // Auto-speak question in voice round (primary interaction)
            setTimeout(() => speakQuestion(question.text), 500);
        }
        
        // Reset timer
        state.timeRemaining = CONFIG.QUESTION_TIME_LIMIT;
        updateTimerDisplay();
        
        // Hide feedback area
        hideFeedbackArea();
        
        // Save session state
        saveSession();
    }

    function updatePhaseBadge() {
        if (!elements.phaseBadge) return;
        
        if (state.currentPhase === 'text') {
            elements.phaseBadge.innerHTML = '<i class="fas fa-keyboard"></i> Phase 1: Text Round';
            elements.phaseBadge.className = 'phase-badge text-phase';
        } else {
            elements.phaseBadge.innerHTML = '<i class="fas fa-microphone"></i> Phase 2: Voice Round';
            elements.phaseBadge.className = 'phase-badge voice-phase';
        }
    }

    function speakQuestion(text) {
        if (!state.speechSynthesis) return;
        
        // Cancel any ongoing speech
        stopQuestionSpeech();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.lang = 'en-US';
        
        state.currentQuestionSpeech = utterance;
        state.speechSynthesis.speak(utterance);
    }

    function stopQuestionSpeech() {
        if (state.speechSynthesis && state.currentQuestionSpeech) {
            state.speechSynthesis.cancel();
            state.currentQuestionSpeech = null;
        }
    }

    function speakFeedback(text) {
        if (!state.speechSynthesis) return;
        
        // Cancel any ongoing speech
        if (state.currentFeedbackSpeech) {
            state.speechSynthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.lang = 'en-US';
        
        utterance.onend = () => {
            if (elements.playFeedbackBtn) {
                elements.playFeedbackBtn.style.display = 'inline-block';
            }
            if (elements.stopFeedbackBtn) {
                elements.stopFeedbackBtn.style.display = 'none';
            }
        };
        
        state.currentFeedbackSpeech = utterance;
        state.speechSynthesis.speak(utterance);
        
        // Update button visibility
        if (elements.playFeedbackBtn) {
            elements.playFeedbackBtn.style.display = 'none';
        }
        if (elements.stopFeedbackBtn) {
            elements.stopFeedbackBtn.style.display = 'inline-block';
        }
    }

    function stopFeedbackSpeech() {
        if (state.speechSynthesis && state.currentFeedbackSpeech) {
            state.speechSynthesis.cancel();
            state.currentFeedbackSpeech = null;
            
            if (elements.playFeedbackBtn) {
                elements.playFeedbackBtn.style.display = 'inline-block';
            }
            if (elements.stopFeedbackBtn) {
                elements.stopFeedbackBtn.style.display = 'none';
            }
        }
    }

    function showTextAnswerArea() {
        if (elements.textAnswerArea) {
            elements.textAnswerArea.style.display = 'block';
        }
        if (elements.voiceAnswerArea) {
            elements.voiceAnswerArea.style.display = 'none';
        }
        
        // Clear previous answer
        if (elements.textAnswer) {
            elements.textAnswer.value = '';
        }
        updateCharCount();
    }

    function showVoiceAnswerArea() {
        if (elements.textAnswerArea) {
            elements.textAnswerArea.style.display = 'none';
        }
        if (elements.voiceAnswerArea) {
            elements.voiceAnswerArea.style.display = 'block';
        }
        
        // Reset voice controls
        resetVoiceControls();
    }

    // ==================== TEXT ANSWER ====================
    function updateCharCount() {
        if (elements.textAnswer && elements.charCount) {
            const count = elements.textAnswer.value.length;
            elements.charCount.textContent = `${count} characters`;
            
            // Enable/disable submit button based on length and evaluation state
            if (elements.submitTextBtn) {
                // Reset submission flag when user modifies answer to allow resubmission
                if (state.hasSubmittedCurrentQuestion) {
                    state.hasSubmittedCurrentQuestion = false;
                }
                elements.submitTextBtn.disabled = count < CONFIG.MIN_TEXT_LENGTH || state.isEvaluating;
            }
        }
    }

    async function submitTextAnswer() {
        const answer = elements.textAnswer ? elements.textAnswer.value.trim() : '';
        
        if (answer.length < CONFIG.MIN_TEXT_LENGTH) {
            showNotification(`Please provide at least ${CONFIG.MIN_TEXT_LENGTH} characters`, 'warning');
            return;
        }
        
        if (state.isEvaluating) {
            return; // Prevent duplicate submissions during evaluation
        }
        
        const question = state.questions[state.currentQuestionIndex];
        
        // Mark as evaluating
        state.isEvaluating = true;
        
        // Disable submit button during evaluation
        if (elements.submitTextBtn) {
            elements.submitTextBtn.disabled = true;
        }
        
        // Save answer
        state.answers[state.currentQuestionIndex] = {
            questionId: question.id,
            answer: answer,
            type: 'text',
            timestamp: Date.now()
        };
        
        // Evaluate answer (clears old evaluation internally)
        await evaluateAnswer(question, answer, 'text');
        
        // ALWAYS re-enable submit button after evaluation completes
        state.isEvaluating = false;
        if (elements.submitTextBtn && elements.textAnswer) {
            elements.submitTextBtn.disabled = elements.textAnswer.value.length < CONFIG.MIN_TEXT_LENGTH;
        }
    }

    // ==================== VOICE RECORDING ====================
    function resetVoiceControls() {
        clearRecordingState();
        
        if (elements.startRecordingBtn) {
            elements.startRecordingBtn.style.display = 'block';
            elements.startRecordingBtn.disabled = false;
        }
        if (elements.stopRecordingBtn) {
            elements.stopRecordingBtn.style.display = 'none';
        }
        if (elements.reRecordBtn) {
            elements.reRecordBtn.style.display = 'none';
        }
        if (elements.transcription) {
            elements.transcription.textContent = 'Your transcription will appear here...';
            elements.transcription.classList.remove('active');
        }
        if (elements.recordingDuration) {
            elements.recordingDuration.textContent = '00:00';
        }
        if (elements.audioPlayback) {
            elements.audioPlayback.style.display = 'none';
            if (elements.recordedAudio) {
                elements.recordedAudio.src = '';
            }
        }
        if (elements.submitVoiceBtn) {
            elements.submitVoiceBtn.style.display = 'none';
            elements.submitVoiceBtn.disabled = true;
        }
    }

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Determine supported MIME type
            const mimeTypes = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/ogg;codecs=opus',
                'audio/mp4'
            ];
            
            let selectedMimeType = 'audio/webm';
            for (const mime of mimeTypes) {
                if (MediaRecorder.isTypeSupported(mime)) {
                    selectedMimeType = mime;
                    break;
                }
            }
            
            console.log('[Audio] Recording with MIME type:', selectedMimeType);
            
            state.mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMimeType });
            state.audioChunks = [];
            state.currentTranscript = '';
            state.isRecording = true;
            state.recordingStartTime = Date.now();
            state.recordingMimeType = selectedMimeType;
            
            state.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    state.audioChunks.push(event.data);
                    console.log('[Audio] Chunk recorded:', event.data.size, 'bytes');
                }
            };
            
            state.mediaRecorder.onstop = () => {
                if (state.audioChunks.length === 0) {
                    console.error('[Audio] No audio chunks recorded');
                    return;
                }
                
                state.recordedAudioBlob = new Blob(state.audioChunks, { type: state.recordingMimeType });
                console.log('[Audio] Blob created:', state.recordedAudioBlob.size, 'bytes, MIME:', state.recordedAudioBlob.type);
                
                if (state.recordedAudioBlob.size === 0) {
                    console.error('[Audio] Blob size is 0');
                    showNotification('Recording failed. Please try again.', 'error');
                    return;
                }
                
                displayAudioPlayback();
            };
            
            // Start recording
            state.mediaRecorder.start();
            
            // Start speech recognition
            state.recognition = initializeSpeechRecognition();
            if (state.recognition) {
                try {
                    state.recognition.start();
                } catch (e) {
                    console.error('Failed to start speech recognition:', e);
                }
            }
            
            // Update UI
            updateRecordingUI(true);
            
            // Start recording timer
            startRecordingTimer();
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            showNotification('Failed to access microphone. Please check permissions.', 'error');
        }
    }

    function stopRecording() {
        if (!state.isRecording) return;
        
        state.isRecording = false;
        
        // Stop media recorder
        if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
            state.mediaRecorder.stop();
        }
        
        // Stop all audio tracks
        if (state.mediaRecorder && state.mediaRecorder.stream) {
            state.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        
        // Stop speech recognition
        if (state.recognition) {
            state.recognition.stop();
        }
        
        // Stop recording timer
        stopRecordingTimer();
        
        // Update UI
        updateRecordingUI(false);
        
        // Enable submit button if we have a transcription
        // Reset submission flag to allow resubmission after re-recording
        if (elements.submitVoiceBtn && state.currentTranscript) {
            elements.submitVoiceBtn.style.display = 'inline-block';
            elements.submitVoiceBtn.disabled = false;
            state.hasSubmittedCurrentQuestion = false;
        }
    }

    function rerecordAnswer() {
        clearRecordingState();
        resetVoiceControls();
    }

    function clearRecordingState() {
        state.isRecording = false;
        state.audioChunks = [];
        state.recordedAudioBlob = null;
        state.currentTranscript = '';
        state.recordingStartTime = null;
        
        if (state.mediaRecorder) {
            if (state.mediaRecorder.state !== 'inactive') {
                state.mediaRecorder.stop();
            }
            if (state.mediaRecorder.stream) {
                state.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
            state.mediaRecorder = null;
        }
        
        if (state.recognition) {
            state.recognition.stop();
            state.recognition = null;
        }
        
        stopRecordingTimer();
    }

    function updateRecordingUI(isRecording) {
        if (elements.startRecordingBtn) {
            elements.startRecordingBtn.style.display = isRecording ? 'none' : 'block';
        }
        if (elements.stopRecordingBtn) {
            elements.stopRecordingBtn.style.display = isRecording ? 'block' : 'none';
        }
        if (elements.reRecordBtn) {
            elements.reRecordBtn.style.display = isRecording ? 'none' : 'block';
        }
        if (elements.transcription) {
            if (isRecording) {
                elements.transcription.classList.add('active');
            } else {
                elements.transcription.classList.remove('active');
            }
        }
    }

    function updateTranscriptionDisplay(text) {
        if (elements.transcription) {
            elements.transcription.textContent = text || 'Listening...';
        }
    }

    function displayAudioPlayback() {
        if (!elements.recordedAudio || !state.recordedAudioBlob) {
            console.error('[Audio] Missing audio element or blob');
            return;
        }

        try {
            // Revoke previous URL to avoid memory leaks
            if (elements.recordedAudio.src) {
                URL.revokeObjectURL(elements.recordedAudio.src);
            }

            const audioUrl = URL.createObjectURL(state.recordedAudioBlob);
            console.log('[Audio] Object URL created:', audioUrl);

            // Configure audio element
            elements.recordedAudio.src = audioUrl;
            elements.recordedAudio.type = state.recordingMimeType || 'audio/webm';
            elements.recordedAudio.preload = 'metadata';
            elements.recordedAudio.controls = true;
            elements.recordedAudio.volume = 1.0;
            elements.recordedAudio.muted = false;

            // Resume AudioContext for autoplay policy
            if (window.AudioContext || window.webkitAudioContext) {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                if (audioContext.state === 'suspended') {
                    audioContext.resume().then(() => {
                        console.log('[Audio] AudioContext resumed');
                    });
                }
            }

            // Add event listeners
            elements.recordedAudio.onloadedmetadata = () => {
                console.log('[Audio] Metadata loaded. Duration:', elements.recordedAudio.duration, 's');
                if (elements.recordedAudio.duration === 0 || isNaN(elements.recordedAudio.duration)) {
                    console.error('[Audio] Invalid duration');
                }
            };

            elements.recordedAudio.onerror = (e) => {
                console.error('[Audio] Playback error:', elements.recordedAudio.error);
            };

            elements.recordedAudio.oncanplaythrough = () => {
                console.log('[Audio] Ready to play');
            };

            // Load the audio
            elements.recordedAudio.load();

            if (elements.audioPlayback) {
                elements.audioPlayback.style.display = 'block';
            }
        } catch (error) {
            console.error('[Audio] Error setting up playback:', error);
        }
    }

    function startRecordingTimer() {
        state.recordingInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - state.recordingStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            
            if (elements.recordingDuration) {
                elements.recordingDuration.textContent = 
                    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        }, 1000);
    }

    function stopRecordingTimer() {
        if (state.recordingInterval) {
            clearInterval(state.recordingInterval);
            state.recordingInterval = null;
        }
    }

    async function submitVoiceAnswer() {
        if (!state.currentTranscript) {
            showNotification('Please record your answer first', 'warning');
            return;
        }
        
        if (state.isEvaluating) {
            return; // Prevent duplicate submissions during evaluation
        }
        
        const question = state.questions[state.currentQuestionIndex];
        
        // Mark as evaluating
        state.isEvaluating = true;
        
        // Disable submit button during evaluation
        if (elements.submitVoiceBtn) {
            elements.submitVoiceBtn.disabled = true;
        }
        
        // Save answer
        state.answers[state.currentQuestionIndex] = {
            questionId: question.id,
            answer: state.currentTranscript,
            type: 'voice',
            audioBlob: state.recordedAudioBlob,
            timestamp: Date.now()
        };
        
        // Evaluate answer (clears old evaluation internally)
        await evaluateAnswer(question, state.currentTranscript, 'voice', state.recordedAudioBlob);
        
        // ALWAYS re-enable submit button after evaluation completes
        state.isEvaluating = false;
        if (elements.submitVoiceBtn && state.currentTranscript) {
            elements.submitVoiceBtn.disabled = false;
        }
    }

    // ==================== ANSWER EVALUATION ====================
    async function evaluateAnswer(question, answer, type, audioBlob = null) {
        // Clear previous evaluation state completely before new evaluation
        if (elements.feedbackArea) {
            elements.feedbackArea.innerHTML = '';
            elements.feedbackArea.style.display = 'none';
        }
        
        // Hide next button during evaluation
        if (elements.nextQuestionBtn) {
            elements.nextQuestionBtn.style.display = 'none';
        }
        
        showFeedbackLoading();
        hideEvaluationError();

        const metadata = {
            trackId: state.trackId,
            level: state.level,
            type: type
        };

        // Try AI evaluation first
        let aiResult = await EvaluationService.evaluateWithAI(question, answer, metadata);

        // Retry once on failure
        if (!aiResult.success) {
            console.log('[Evaluation] Retrying AI evaluation...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            aiResult = await EvaluationService.evaluateWithAI(question, answer, metadata);
        }

        let result;
        if (aiResult.success) {
            result = aiResult.data;
            result.source = 'ai';
            console.log('[Evaluation] AI evaluation successful');
        } else {
            // Fallback to strict local evaluation
            result = EvaluationService.evaluateStrictLocal(question, answer, metadata);
            result.source = 'local';
            showEvaluationError('AI evaluation unavailable. Using strict local evaluation.');
            console.log('[Evaluation] Using local strict evaluation');
        }

        displayFeedback(result, question);
    }

    function displayFeedback(result, question) {
        hideFeedbackLoading();
        console.log('[Evaluation] Displaying feedback:', result);
        
        if (!elements.feedbackArea) return;
        
        // Build feedback HTML
        let html = `
            <div class="evaluation-result ${result.isCorrect ? 'correct' : 'incorrect'}">
                <div class="verdict">
                    <span class="verdict-badge ${result.verdict === 'CORRECT' ? 'success' : 'error'}">
                        ${result.verdict}
                    </span>
                    ${result.source ? `<span class="eval-source">(${result.source})</span>` : ''}
                </div>
                
                <div class="feedback-text">
                    ${result.feedback}
                </div>
                
                ${result.gaps && result.gaps.length > 0 ? `
                    <div class="missing-points">
                        <strong>Missing Key Points:</strong>
                        <ul>
                            ${result.gaps.map(gap => `<li>${gap}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${result.correctAnswer ? `
                    <div class="reference-answer">
                        <strong>Reference Answer:</strong>
                        <p>${result.correctAnswer}</p>
                    </div>
                ` : ''}
                
                ${result.improvements && result.improvements.length > 0 ? `
                    <div class="improvements">
                        <strong>To Improve:</strong>
                        <ul>
                            ${result.improvements.map(imp => `<li>${imp}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="scores-grid">
                    <div class="score-item">
                        <span class="score-label">Clarity</span>
                        <span class="score-value ${getScoreClass(result.scores.clarity)}">${result.scores.clarity}/10</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Correctness</span>
                        <span class="score-value ${getScoreClass(result.scores.correctness)}">${result.scores.correctness}/10</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Depth</span>
                        <span class="score-value ${getScoreClass(result.scores.depth)}">${result.scores.depth}/10</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Confidence</span>
                        <span class="score-value ${getScoreClass(result.scores.confidence)}">${result.scores.confidence}/10</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Communication</span>
                        <span class="score-value ${getScoreClass(result.scores.communication)}">${result.scores.communication}/10</span>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding: 20px 0;">
                    <button id="next-question-btn" class="btn btn-primary" style="padding: 12px 30px; font-size: 16px; font-weight: 600;">
                        Next Question <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
        
        elements.feedbackArea.innerHTML = html;
        elements.feedbackArea.style.display = 'block';
        
        // Attach click event to the next button
        const nextBtn = document.getElementById('next-question-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', moveToNextQuestion);
        }
        
        // Save scores (replace previous score if resubmitting)
        state.scores[state.currentQuestionIndex] = result.scores;
        
        // ALWAYS show and enable next button after evaluation - never block progression
        if (elements.nextQuestionBtn) {
            elements.nextQuestionBtn.style.display = 'inline-block';
            elements.nextQuestionBtn.disabled = false;
            elements.nextQuestionBtn.style.visibility = 'visible';
            elements.nextQuestionBtn.style.opacity = '1';
        }
        
        // Auto-play voice feedback in voice round
        if (state.currentPhase === 'voice') {
            setTimeout(() => {
                speakFeedback(result.feedback);
            }, 1000);
        }
        
        // Save session
        saveSession();
    }

    function displayScoreBars(scores) {
        const scoreMapping = {
            clarity: { bar: elements.scoreClarity, value: elements.scoreClarityValue },
            correctness: { bar: elements.scoreCorrectness, value: elements.scoreCorrectnessValue },
            depth: { bar: elements.scoreDepth, value: elements.scoreDepthValue },
            confidence: { bar: elements.scoreConfidence, value: elements.scoreConfidenceValue },
            communication: { bar: elements.scoreCommunication, value: elements.scoreCommunicationValue }
        };
        
        Object.keys(scores).forEach((key, index) => {
            const mapping = scoreMapping[key];
            if (mapping && mapping.bar && mapping.value) {
                const score = scores[key];
                const percentage = (score / 10) * 100;
                
                // Animate after a delay
                setTimeout(() => {
                    mapping.bar.style.width = percentage + '%';
                    mapping.value.textContent = `${score}/10`;
                    
                    // Apply color classes based on score
                    mapping.bar.classList.remove('excellent', 'good', 'average', 'poor');
                    if (score >= 9) {
                        mapping.bar.classList.add('excellent');
                    } else if (score >= 7) {
                        mapping.bar.classList.add('good');
                    } else if (score >= 5) {
                        mapping.bar.classList.add('average');
                    } else {
                        mapping.bar.classList.add('poor');
                    }
                }, index * 100);
            }
        });
    }

    function showFeedbackLoading() {
        if (elements.feedbackArea) {
            elements.feedbackArea.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #888;">
                    <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #333; border-top-color: #e53935; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <p style="margin-top: 20px; font-size: 18px; font-weight: 500;">Evaluating your answer...</p>
                    <style>
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    </style>
                </div>
            `;
            elements.feedbackArea.style.display = 'block';
        }
    }

    function hideFeedbackLoading() {
        if (elements.feedbackLoading) {
            elements.feedbackLoading.style.display = 'none';
        }
    }

    function getScoreClass(score) {
        if (score >= 8) return 'score-high';
        if (score >= 6) return 'score-medium';
        if (score >= 4) return 'score-low';
        return 'score-very-low';
    }

    function hideFeedbackArea() {
        if (elements.feedbackArea) {
            elements.feedbackArea.style.display = 'none';
        }
    }

    // ==================== VOICE FEEDBACK ====================
    function playVoiceFeedback() {
        const feedbackText = elements.feedbackText ? elements.feedbackText.textContent : '';
        
        if (!feedbackText) return;
        
        // Stop any ongoing speech
        if (state.speechSynthesis.speaking) {
            state.speechSynthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(feedbackText);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.lang = 'en-US';
        
        state.speechSynthesis.speak(utterance);
    }

    function stopVoiceFeedback() {
        if (state.speechSynthesis.speaking) {
            state.speechSynthesis.cancel();
        }
    }

    // ==================== NAVIGATION ====================
    function moveToNextQuestion() {
        // Stop any voice feedback
        stopFeedbackSpeech();
        stopQuestionSpeech();
        
        // Clear feedback area
        if (elements.feedbackArea) {
            elements.feedbackArea.innerHTML = '';
            elements.feedbackArea.style.display = 'none';
        }
        
        // Hide next button
        if (elements.nextQuestionBtn) {
            elements.nextQuestionBtn.style.display = 'none';
        }
        
        // Move to next question
        state.currentQuestionIndex++;
        
        // Check for phase transition (from text to voice round)
        if (state.currentQuestionIndex === CONFIG.TEXT_QUESTIONS_COUNT) {
            showPhaseTransition();
            return;
        }
        
        // Check if interview is complete
        if (state.currentQuestionIndex >= CONFIG.TOTAL_QUESTIONS) {
            completeInterview();
        } else {
            displayQuestion(state.currentQuestionIndex);
            startTimer();
        }
    }

    function showPhaseTransition() {
        // Show transition message
        const message = `
            <div class="phase-transition">
                <h3><i class="fas fa-microphone"></i> Phase 2: Voice Round</h3>
                <p>You've completed the text round!</p>
                <p>The next 5 questions will require voice responses.</p>
                <ul>
                    <li>Questions will be asked aloud</li>
                    <li>Respond using your microphone</li>
                    <li>Your speech will be transcribed</li>
                    <li>Feedback will be provided via voice</li>
                </ul>
                <button id="start-voice-phase-btn" class="btn btn-primary">
                    Start Voice Round <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;
        
        if (elements.feedbackArea) {
            elements.feedbackArea.innerHTML = message;
            elements.feedbackArea.style.display = 'block';
            
            // Add event listener to transition button
            const startBtn = document.getElementById('start-voice-phase-btn');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    displayQuestion(state.currentQuestionIndex);
                    startTimer();
                });
            }
        }
    }

    function completeInterview() {
        // Calculate final scores
        const textScores = state.scores.slice(0, CONFIG.TEXT_QUESTIONS_COUNT);
        const voiceScores = state.scores.slice(CONFIG.TEXT_QUESTIONS_COUNT);
        
        const textAvg = calculateAverageScore(textScores);
        const voiceAvg = calculateAverageScore(voiceScores);
        const overallAvg = calculateAverageScore(state.scores);
        
        // Store data for detailed report
        const reportData = {
            sessionId: state.sessionId,
            trackId: state.trackId,
            level: state.level,
            questions: state.questions,
            answers: state.answers,
            scores: state.scores,
            startTime: state.startTime,
            endTime: Date.now(),
            textAvg: textAvg,
            voiceAvg: voiceAvg,
            overallAvg: overallAvg
        };
        localStorage.setItem('interviewReport', JSON.stringify(reportData));
        
        // Show complete screen with futuristic redesign
        showScreen('complete');
        
        // Stop all timers and audio
        stopTimer();
        stopQuestionSpeech();
        stopFeedbackSpeech();
        
        // Render futuristic complete screen
        renderFuturisticCompleteScreen(overallAvg, textAvg, voiceAvg);
    }

    // Helper function for coaching-driven readiness assessment
    function getReadinessAssessment(score) {
        if (score >= 8.5) {
            return {
                verdict: 'Production Ready',
                status: 'excellent',
                insight: 'Exceptional performance! You demonstrate mastery and are interview-ready.',
                icon: 'fa-rocket',
                color: '#66bb6a'
            };
        } else if (score >= 7.5) {
            return {
                verdict: 'Nearly Production Ready',
                status: 'strong',
                insight: 'Strong performance with minor areas for refinement. Almost there!',
                icon: 'fa-star',
                color: '#42a5f5'
            };
        } else if (score >= 6.0) {
            return {
                verdict: 'Needs Focused Practice',
                status: 'developing',
                insight: 'Good foundation, but key areas need attention before interviews.',
                icon: 'fa-chart-line',
                color: '#ff9800'
            };
        } else {
            return {
                verdict: 'Requires Significant Work',
                status: 'building',
                insight: 'Focus on fundamentals. Consistent practice will build confidence.',
                icon: 'fa-book-open',
                color: '#ef5350'
            };
        }
    }
    
    function getRoundReadiness(score, roundName) {
        if (score >= 8.0) return { status: 'Strong', color: '#66bb6a' };
        if (score >= 6.5) return { status: 'Good', color: '#42a5f5' };
        if (score >= 5.0) return { status: 'Fair', color: '#ff9800' };
        return { status: 'Weak', color: '#ef5350' };
    }

    function renderFuturisticCompleteScreen(overallAvg, textAvg, voiceAvg) {
        const completeScreen = elements.completeScreen;
        if (!completeScreen) return;
        
        const readinessData = getReadinessAssessment(overallAvg);
        const textReadiness = getRoundReadiness(textAvg, 'Written Communication');
        const voiceReadiness = getRoundReadiness(voiceAvg, 'Verbal Communication');
        
        completeScreen.innerHTML = `
            <style>
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes pulseGlow {
                    0%, 100% { filter: drop-shadow(0 0 12px currentColor); }
                    50% { filter: drop-shadow(0 0 24px currentColor); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .complete-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 60px 40px;
                    animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .complete-header {
                    text-align: center;
                    margin-bottom: 50px;
                    animation: slideUpFade 0.8s ease-out;
                }
                .complete-title {
                    font-size: 1.4rem;
                    font-weight: 500;
                    color: #888;
                    margin-bottom: 10px;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }
                .complete-title {
                    font-size: 1.4rem;
                    font-weight: 500;
                    color: #888;
                    margin-bottom: 10px;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }
                .readiness-verdict {
                    font-size: 3.5rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, ${readinessData.color} 0%, ${readinessData.color}dd 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 15px;
                    letter-spacing: -1px;
                    line-height: 1.1;
                }
                .readiness-insight {
                    font-size: 1.15rem;
                    color: #999;
                    max-width: 600px;
                    margin: 0 auto 20px;
                    line-height: 1.6;
                }
                .readiness-icon {
                    font-size: 3rem;
                    color: ${readinessData.color};
                    margin-bottom: 20px;
                    animation: pulseGlow 2s ease-in-out infinite;
                }
                .hero-card {
                    background: linear-gradient(135deg, 
                        rgba(31, 31, 31, 0.8) 0%, 
                        rgba(${readinessData.color === '#66bb6a' ? '102, 187, 106' : readinessData.color === '#42a5f5' ? '66, 165, 245' : readinessData.color === '#ff9800' ? '255, 152, 0' : '239, 83, 80'}, 0.08) 100%);
                    backdrop-filter: blur(25px);
                    border: 2px solid ${readinessData.color}33;
                    border-radius: 28px;
                    padding: 50px 40px;
                    margin-bottom: 50px;
                    position: relative;
                    overflow: hidden;
                    animation: scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s backwards;
                }
                .hero-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -200%;
                    width: 200%;
                    height: 4px;
                    background: linear-gradient(90deg, 
                        transparent, 
                        ${readinessData.color}aa, 
                        transparent);
                    animation: shimmer 3s ease-in-out infinite;
                }
                .score-display {
                    display: inline-flex;
                    align-items: baseline;
                    gap: 8px;
                    margin: 15px 0 25px;
                }
                .score-number {
                    font-size: 5rem;
                    font-weight: 900;
                    color: ${readinessData.color};
                    line-height: 1;
                    text-shadow: 0 0 30px ${readinessData.color}55;
                }
                .score-max {
                    font-size: 2.5rem;
                    color: #555;
                    font-weight: 600;
                }
                .rounds-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 30px;
                    margin-bottom: 50px;
                }
                .round-card {
                    background: rgba(31, 31, 31, 0.6);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    padding: 35px 30px;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .round-card:hover {
                    transform: translateY(-4px);
                    border-color: rgba(255, 255, 255, 0.15);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
                }
                .round-card:nth-child(1) { animation: fadeInUp 0.8s ease-out 0.3s backwards; }
                .round-card:nth-child(2) { animation: fadeInUp 0.8s ease-out 0.4s backwards; }
                .round-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 25px;
                }
                .round-label {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 1.05rem;
                    font-weight: 600;
                    color: #aaa;
                    letter-spacing: 0.5px;
                }
                .round-label i {
                    font-size: 1.4rem;
                    opacity: 0.7;
                }
                .status-pill {
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    border: 1px solid currentColor;
                    background: currentColor22;
                }
                .round-score {
                    text-align: center;
                    margin: 20px 0;
                }
                .round-score-number {
                    font-size: 3.5rem;
                    font-weight: 800;
                    line-height: 1;
                    text-shadow: 0 0 20px currentColor55;
                }
                .round-score-max {
                    font-size: 1.5rem;
                    color: #666;
                    font-weight: 500;
                }
                .action-buttons {
                    display: flex;
                    gap: 20px;
                    justify-content: center;
                    flex-wrap: wrap;
                    animation: fadeInUp 0.8s ease-out 0.5s backwards;
                }
                .btn-futuristic {
                    padding: 18px 45px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    border: none;
                    border-radius: 14px;
                    cursor: pointer;
                    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                    position: relative;
                    overflow: hidden;
                    backdrop-filter: blur(10px);
                }
                .btn-futuristic::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.15);
                    transform: translate(-50%, -50%);
                    transition: width 0.6s ease, height 0.6s ease;
                }
                .btn-futuristic:hover::before {
                    width: 400px;
                    height: 400px;
                }
                .btn-futuristic span {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .btn-primary-futuristic {
                    background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
                    color: white;
                    box-shadow: 0 10px 35px rgba(229, 57, 53, 0.35);
                }
                .btn-primary-futuristic:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 50px rgba(229, 57, 53, 0.5);
                }
                .btn-secondary-futuristic {
                    background: rgba(255, 255, 255, 0.06);
                    color: white;
                    border: 1.5px solid rgba(255, 255, 255, 0.2);
                }
                .btn-secondary-futuristic:hover {
                    background: rgba(255, 255, 255, 0.12);
                    border-color: rgba(255, 255, 255, 0.35);
                    transform: translateY(-2px);
                }
            </style>
            
            <div class="complete-container">
                <div class="complete-header">
                    <div class="readiness-icon">
                        <i class="fas ${readinessData.icon}"></i>
                    </div>
                    <p class="complete-title">Interview Assessment</p>
                    <h1 class="readiness-verdict">${readinessData.verdict}</h1>
                    <p class="readiness-insight">${readinessData.insight}</p>
                </div>
                
                <div class="hero-card">
                    <div style="text-align: center;">
                        <div style="font-size: 1rem; color: #777; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px;">
                            Overall Performance
                        </div>
                        <div class="score-display">
                            <span class="score-number">${overallAvg.toFixed(1)}</span>
                            <span class="score-max">/10</span>
                        </div>
                    </div>
                </div>
                
                <div class="rounds-grid">
                    <div class="round-card">
                        <div class="round-header">
                            <div class="round-label">
                                <i class="fas fa-keyboard"></i>
                                <span>Written Round</span>
                            </div>
                            <div class="status-pill" style="color: ${textReadiness.color};">
                                ${textReadiness.status}
                            </div>
                        </div>
                        <div class="round-score">
                            <div class="round-score-number" style="color: ${textReadiness.color};">
                                ${textAvg.toFixed(1)}
                            </div>
                            <div class="round-score-max">/10</div>
                        </div>
                    </div>
                    
                    <div class="round-card">
                        <div class="round-header">
                            <div class="round-label">
                                <i class="fas fa-microphone"></i>
                                <span>Verbal Round</span>
                            </div>
                            <div class="status-pill" style="color: ${voiceReadiness.color};">
                                ${voiceReadiness.status}
                            </div>
                        </div>
                        <div class="round-score">
                            <div class="round-score-number" style="color: ${voiceReadiness.color};">
                                ${voiceAvg.toFixed(1)}
                            </div>
                            <div class="round-score-max">/10</div>
                        </div>
                    </div>
                </div>
                
                <div class="action-buttons">
                    <button class="btn-futuristic btn-primary-futuristic" id="view-detailed-report-btn">
                        <span><i class="fas fa-chart-bar"></i> View Detailed Report</span>
                    </button>
                    <button class="btn-futuristic btn-secondary-futuristic" id="start-new-interview-btn">
                        <span><i class="fas fa-redo"></i> Start New Interview</span>
                    </button>
                </div>
            </div>
        `;
        
        // Reattach event listeners
        const viewReportBtn = document.getElementById('view-detailed-report-btn');
        const startNewBtn = document.getElementById('start-new-interview-btn');
        
        if (viewReportBtn) {
            viewReportBtn.addEventListener('click', viewDetailedReport);
        }
        if (startNewBtn) {
            startNewBtn.addEventListener('click', startNewInterview);
        }
    }

    function calculateAverageScore(scoresArray) {
        if (scoresArray.length === 0) return 0;
        
        const sum = scoresArray.reduce((total, scoreObj) => {
            const avg = Object.values(scoreObj).reduce((a, b) => a + b, 0) / Object.keys(scoreObj).length;
            return total + avg;
        }, 0);
        
        return sum / scoresArray.length;
    }

    // Helper functions for detailed report insights
    function generateKeyInsights(reportData) {
        const strengths = [];
        const weaknesses = [];
        const observations = [];
        
        // Analyze average scores across all metrics
        const allScores = reportData.scores.map(scoreObj => ({
            clarity: scoreObj.clarity,
            correctness: scoreObj.correctness,
            depth: scoreObj.depth,
            confidence: scoreObj.confidence,
            communication: scoreObj.communication
        }));
        
        const avgClarity = allScores.reduce((sum, s) => sum + s.clarity, 0) / allScores.length;
        const avgCorrectness = allScores.reduce((sum, s) => sum + s.correctness, 0) / allScores.length;
        const avgDepth = allScores.reduce((sum, s) => sum + s.depth, 0) / allScores.length;
        const avgConfidence = allScores.reduce((sum, s) => sum + s.confidence, 0) / allScores.length;
        const avgCommunication = allScores.reduce((sum, s) => sum + s.communication, 0) / allScores.length;
        
        // Identify strengths (score >= 7.5)
        if (avgClarity >= 7.5) strengths.push({ metric: 'Clarity', score: avgClarity, insight: 'Your answers are well-structured and easy to understand' });
        if (avgCorrectness >= 7.5) strengths.push({ metric: 'Correctness', score: avgCorrectness, insight: 'You demonstrate strong technical accuracy' });
        if (avgDepth >= 7.5) strengths.push({ metric: 'Depth', score: avgDepth, insight: 'You provide thorough and comprehensive responses' });
        if (avgConfidence >= 7.5) strengths.push({ metric: 'Confidence', score: avgConfidence, insight: 'You communicate with assurance and poise' });
        if (avgCommunication >= 7.5) strengths.push({ metric: 'Communication', score: avgCommunication, insight: 'Your communication style is professional and effective' });
        
        // Identify weaknesses (score < 6.0)
        if (avgClarity < 6.0) weaknesses.push({ metric: 'Clarity', score: avgClarity, insight: 'Focus on structuring your answers more clearly' });
        if (avgCorrectness < 6.0) weaknesses.push({ metric: 'Correctness', score: avgCorrectness, insight: 'Review fundamental concepts to improve accuracy' });
        if (avgDepth < 6.0) weaknesses.push({ metric: 'Depth', score: avgDepth, insight: 'Expand your answers with more details and examples' });
        if (avgConfidence < 6.0) weaknesses.push({ metric: 'Confidence', score: avgConfidence, insight: 'Practice more to build confidence in your delivery' });
        if (avgCommunication < 6.0) weaknesses.push({ metric: 'Communication', score: avgCommunication, insight: 'Work on articulating ideas more effectively' });
        
        // General observations
        if (reportData.textAvg > reportData.voiceAvg + 1.0) {
            observations.push({ type: 'info', insight: 'You perform better in written communication than verbal' });
        } else if (reportData.voiceAvg > reportData.textAvg + 1.0) {
            observations.push({ type: 'info', insight: 'You excel more in verbal communication than written' });
        } else {
            observations.push({ type: 'success', insight: 'You maintain consistent performance across both formats' });
        }
        
        if (reportData.overallAvg >= 8.0) {
            observations.push({ type: 'success', insight: 'You are interview-ready with minimal preparation needed' });
        } else if (reportData.overallAvg >= 6.5) {
            observations.push({ type: 'info', insight: 'You have a solid foundation with room for improvement' });
        } else {
            observations.push({ type: 'warning', insight: 'Focused practice on weak areas will significantly boost your performance' });
        }
        
        return { strengths, weaknesses, observations };
    }
    
    function generateFixPriorities(reportData) {
        const insights = generateKeyInsights(reportData);
        const priorities = [];
        
        // Sort weaknesses by score (lowest first)
        const sortedWeaknesses = insights.weaknesses.sort((a, b) => a.score - b.score);
        
        sortedWeaknesses.forEach((weakness, index) => {
            if (index < 3) { // Top 3 priorities
                let actionPlan = '';
                if (weakness.metric === 'Clarity') actionPlan = 'Practice the STAR method (Situation, Task, Action, Result) to structure your answers';
                else if (weakness.metric === 'Correctness') actionPlan = 'Review core concepts and practice with real interview questions';
                else if (weakness.metric === 'Depth') actionPlan = 'Add concrete examples and explain your reasoning in detail';
                else if (weakness.metric === 'Confidence') actionPlan = 'Do mock interviews regularly and practice out loud';
                else if (weakness.metric === 'Communication') actionPlan = 'Record yourself and analyze your delivery, eliminate filler words';
                
                priorities.push({
                    rank: index + 1,
                    metric: weakness.metric,
                    score: weakness.score,
                    actionPlan: actionPlan
                });
            }
        });
        
        return priorities;
    }

    function viewDetailedReport() {
        const reportData = JSON.parse(localStorage.getItem('interviewReport'));
        if (!reportData) {
            showNotification('No report data available', 'error');
            return;
        }
        
        const insights = generateKeyInsights(reportData);
        const priorities = generateFixPriorities(reportData);
        
        // Create detailed report modal
        const modal = document.createElement('div');
        modal.id = 'detailed-report-modal';
        modal.innerHTML = `
            <style>
                #detailed-report-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.96);
                    z-index: 10000;
                    overflow-y: auto;
                    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    backdrop-filter: blur(10px);
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .report-container {
                    max-width: 1300px;
                    margin: 50px auto;
                    padding: 50px 40px;
                    animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .report-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 50px;
                    padding-bottom: 25px;
                    border-bottom: 2px solid rgba(229, 57, 53, 0.25);
                }
                .report-title {
                    font-size: 2.8rem;
                    font-weight: 700;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .report-title i {
                    color: #e53935;
                }
                .close-report {
                    background: rgba(255, 255, 255, 0.08);
                    border: 1.5px solid rgba(255, 255, 255, 0.15);
                    color: white;
                    padding: 14px 30px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 1.05rem;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .close-report:hover {
                    background: rgba(255, 255, 255, 0.15);
                    transform: translateY(-2px);
                }
                .report-summary {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 25px;
                    margin-bottom: 50px;
                }
                .summary-card {
                    background: rgba(31, 31, 31, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 25px;
                    border-radius: 16px;
                    transition: all 0.3s ease;
                }
                .summary-card:hover {
                    border-color: rgba(229, 57, 53, 0.3);
                    transform: translateY(-2px);
                }
                .summary-label {
                    font-size: 0.85rem;
                    color: #999;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    margin-bottom: 10px;
                    font-weight: 600;
                }
                .summary-value {
                    font-size: 2.2rem;
                    font-weight: 800;
                    color: #e53935;
                }
                .insights-section {
                    margin-bottom: 50px;
                }
                .section-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 30px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .section-title i {
                    color: #e53935;
                }
                .insights-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 25px;
                    margin-bottom: 30px;
                }
                .insight-card {
                    background: rgba(31, 31, 31, 0.6);
                    border-left: 4px solid;
                    border-radius: 12px;
                    padding: 25px;
                    transition: all 0.3s ease;
                }
                .insight-card.strength {
                    border-color: #66bb6a;
                    background: linear-gradient(135deg, rgba(102, 187, 106, 0.08) 0%, rgba(31, 31, 31, 0.6) 100%);
                }
                .insight-card.weakness {
                    border-color: #ef5350;
                    background: linear-gradient(135deg, rgba(239, 83, 80, 0.08) 0%, rgba(31, 31, 31, 0.6) 100%);
                }
                .insight-card.observation {
                    border-color: #42a5f5;
                    background: linear-gradient(135deg, rgba(66, 165, 245, 0.08) 0%, rgba(31, 31, 31, 0.6) 100%);
                }
                .insight-card:hover {
                    transform: translateX(5px);
                }
                .insight-metric {
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin-bottom: 8px;
                }
                .insight-card.strength .insight-metric { color: #66bb6a; }
                .insight-card.weakness .insight-metric { color: #ef5350; }
                .insight-card.observation .insight-metric { color: #42a5f5; }
                .insight-text {
                    color: #bbb;
                    line-height: 1.6;
                    font-size: 0.95rem;
                }
                .priorities-section {
                    margin-bottom: 50px;
                    background: rgba(229, 57, 53, 0.05);
                    border: 1.5px solid rgba(229, 57, 53, 0.2);
                    border-radius: 20px;
                    padding: 40px;
                }
                .priority-item {
                    background: rgba(31, 31, 31, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 14px;
                    padding: 25px;
                    margin-bottom: 20px;
                    display: flex;
                    gap: 20px;
                    align-items: flex-start;
                }
                .priority-rank {
                    background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
                    color: white;
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.4rem;
                    font-weight: 800;
                    flex-shrink: 0;
                }
                .priority-content {
                    flex: 1;
                }
                .priority-metric {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 8px;
                }
                .priority-score {
                    color: #ef5350;
                    font-size: 0.9rem;
                    margin-bottom: 12px;
                }
                .priority-action {
                    color: #aaa;
                    line-height: 1.6;
                    font-size: 0.95rem;
                }
                .questions-breakdown {
                    margin-top: 50px;
                }
                .expand-all-btn {
                    background: rgba(66, 165, 245, 0.15);
                    border: 1px solid rgba(66, 165, 245, 0.3);
                    color: #42a5f5;
                    padding: 12px 28px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 25px;
                    transition: all 0.3s;
                }
                .expand-all-btn:hover {
                    background: rgba(66, 165, 245, 0.25);
                }
                .question-card {
                    background: rgba(31, 31, 31, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    margin-bottom: 20px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                .question-card.expanded {
                    border-color: rgba(229, 57, 53, 0.3);
                }
                .question-header-collapsible {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 25px 30px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .question-header-collapsible:hover {
                    background: rgba(255, 255, 255, 0.03);
                }
                .question-header-left {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .question-number {
                    font-size: 0.9rem;
                    color: #888;
                    font-weight: 700;
                }
                .question-text-preview {
                    font-size: 1.05rem;
                    color: #ddd;
                    font-weight: 500;
                }
                .question-type-badge {
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .type-text {
                    background: rgba(66, 165, 245, 0.2);
                    color: #42a5f5;
                    border: 1px solid rgba(66, 165, 245, 0.3);
                }
                .type-voice {
                    background: rgba(102, 187, 106, 0.2);
                    color: #66bb6a;
                    border: 1px solid rgba(102, 187, 106, 0.3);
                }
                .expand-icon {
                    color: #888;
                    font-size: 1.2rem;
                    transition: transform 0.3s;
                }
                .question-card.expanded .expand-icon {
                    transform: rotate(180deg);
                }
                .question-content {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.4s ease;
                }
                .question-card.expanded .question-content {
                    max-height: 2000px;
                }
                .question-content-inner {
                    padding: 0 30px 30px;
                }
                .question-text-full {
                    font-size: 1.15rem;
                    color: #fff;
                    margin-bottom: 25px;
                    line-height: 1.7;
                    font-weight: 500;
                }
                .answer-section {
                    background: rgba(0, 0, 0, 0.3);
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 25px;
                }
                .answer-label {
                    font-size: 0.85rem;
                    color: #999;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    margin-bottom: 12px;
                    font-weight: 600;
                }
                .answer-text {
                    color: #ccc;
                    line-height: 1.8;
                    font-size: 1rem;
                }
                .scores-breakdown {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 15px;
                    margin-bottom: 15px;
                }
                .score-metric {
                    text-align: center;
                    padding: 18px 15px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 10px;
                    transition: all 0.3s;
                }
                .score-metric:hover {
                    transform: translateY(-2px);
                    background: rgba(0, 0, 0, 0.4);
                }
                .metric-label {
                    font-size: 0.75rem;
                    color: #999;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                    font-weight: 600;
                    letter-spacing: 1px;
                }
                .metric-value {
                    font-size: 1.6rem;
                    font-weight: 800;
                }
                .score-excellent { color: #66bb6a; }
                .score-good { color: #42a5f5; }
                .score-average { color: #ff9800; }
                .score-poor { color: #ef5350; }
                .timestamp-info {
                    font-size: 0.85rem;
                    color: #666;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
            </style>
            
            <div class="report-container">
                <div class="report-header">
                    <h1 class="report-title">
                        <i class="fas fa-chart-line"></i>
                        Detailed Performance Report
                    </h1>
                    <button class="close-report" onclick="document.getElementById('detailed-report-modal').remove()">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
                
                <div class="report-summary">
                    <div class="summary-card">
                        <div class="summary-label">Overall Score</div>
                        <div class="summary-value">${reportData.overallAvg.toFixed(1)}/10</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">Written Round</div>
                        <div class="summary-value">${reportData.textAvg.toFixed(1)}/10</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">Verbal Round</div>
                        <div class="summary-value">${reportData.voiceAvg.toFixed(1)}/10</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">Duration</div>
                        <div class="summary-value">${Math.round((reportData.endTime - reportData.startTime) / 60000)}min</div>
                    </div>
                </div>
                
                <div class="insights-section">
                    <h2 class="section-title">
                        <i class="fas fa-lightbulb"></i>
                        Key Insights
                    </h2>
                    <div class="insights-grid">
                        ${insights.strengths.map(s => `
                            <div class="insight-card strength">
                                <div class="insight-metric">
                                    <i class="fas fa-check-circle"></i> ${s.metric} (${s.score.toFixed(1)}/10)
                                </div>
                                <div class="insight-text">${s.insight}</div>
                            </div>
                        `).join('')}
                        ${insights.weaknesses.map(w => `
                            <div class="insight-card weakness">
                                <div class="insight-metric">
                                    <i class="fas fa-exclamation-triangle"></i> ${w.metric} (${w.score.toFixed(1)}/10)
                                </div>
                                <div class="insight-text">${w.insight}</div>
                            </div>
                        `).join('')}
                        ${insights.observations.map(o => `
                            <div class="insight-card observation">
                                <div class="insight-metric">
                                    <i class="fas fa-info-circle"></i> Observation
                                </div>
                                <div class="insight-text">${o.insight}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${priorities.length > 0 ? `
                    <div class="priorities-section">
                        <h2 class="section-title">
                            <i class="fas fa-bullseye"></i>
                            What to Fix Next
                        </h2>
                        ${priorities.map(p => `
                            <div class="priority-item">
                                <div class="priority-rank">${p.rank}</div>
                                <div class="priority-content">
                                    <div class="priority-metric">${p.metric}</div>
                                    <div class="priority-score">Current: ${p.score.toFixed(1)}/10</div>
                                    <div class="priority-action">
                                        <i class="fas fa-arrow-right"></i> ${p.actionPlan}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="questions-breakdown">
                    <h2 class="section-title">
                        <i class="fas fa-list-check"></i>
                        Question-by-Question Analysis
                    </h2>
                    <button class="expand-all-btn" onclick="toggleAllQuestions()">
                        <i class="fas fa-expand-alt"></i> Expand All
                    </button>
                    ${generateCollapsibleQuestionBreakdown(reportData)}
                </div>
            </div>
            
            <script>
                function toggleQuestion(index) {
                    const card = document.getElementById('question-' + index);
                    card.classList.toggle('expanded');
                }
                
                function toggleAllQuestions() {
                    const cards = document.querySelectorAll('.question-card');
                    const allExpanded = Array.from(cards).every(card => card.classList.contains('expanded'));
                    
                    cards.forEach(card => {
                        if (allExpanded) {
                            card.classList.remove('expanded');
                        } else {
                            card.classList.add('expanded');
                        }
                    });
                    
                    const btn = document.querySelector('.expand-all-btn');
                    btn.innerHTML = allExpanded ? 
                        '<i class=\"fas fa-expand-alt\"></i> Expand All' : 
                        '<i class=\"fas fa-compress-alt\"></i> Collapse All';
                }
            </script>
        `;
        
        document.body.appendChild(modal);
    }
    
    function generateCollapsibleQuestionBreakdown(reportData) {
        return reportData.questions.map((question, index) => {
            const answer = reportData.answers[index];
            const scores = reportData.scores[index];
            
            if (!answer || !scores) return '';
            
            const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
            const timestamp = new Date(answer.timestamp).toLocaleTimeString();
            
            return `
                <div class="question-card" id="question-${index}">
                    <div class="question-header-collapsible" onclick="toggleQuestion(${index})">
                        <div class="question-header-left">
                            <span class="question-number">Q${index + 1}</span>
                            <span class="question-text-preview">${question.text.substring(0, 70)}${question.text.length > 70 ? '...' : ''}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <span class="question-type-badge type-${question.type}">
                                <i class="fas fa-${question.type === 'text' ? 'keyboard' : 'microphone'}"></i>
                                ${question.type.toUpperCase()}
                            </span>
                            <span class="metric-value ${getScoreColorClass(avgScore)}">${avgScore.toFixed(1)}</span>
                            <i class="fas fa-chevron-down expand-icon"></i>
                        </div>
                    </div>
                    
                    <div class="question-content">
                        <div class="question-content-inner">
                            <div class="question-text-full">${question.text}</div>
                            
                            <div class="answer-section">
                                <div class="answer-label"><i class="fas fa-comment-dots"></i> Your Answer</div>
                                <div class="answer-text">${answer.answer}</div>
                            </div>
                            
                            <div class="scores-breakdown">
                                <div class="score-metric">
                                    <div class="metric-label">Clarity</div>
                                    <div class="metric-value ${getScoreColorClass(scores.clarity)}">${scores.clarity}/10</div>
                                </div>
                                <div class="score-metric">
                                    <div class="metric-label">Correctness</div>
                                    <div class="metric-value ${getScoreColorClass(scores.correctness)}">${scores.correctness}/10</div>
                                </div>
                                <div class="score-metric">
                                    <div class="metric-label">Depth</div>
                                    <div class="metric-value ${getScoreColorClass(scores.depth)}">${scores.depth}/10</div>
                                </div>
                                <div class="score-metric">
                                    <div class="metric-label">Confidence</div>
                                    <div class="metric-value ${getScoreColorClass(scores.confidence)}">${scores.confidence}/10</div>
                                </div>
                                <div class="score-metric">
                                    <div class="metric-label">Communication</div>
                                    <div class="metric-value ${getScoreColorClass(scores.communication)}">${scores.communication}/10</div>
                                </div>
                            </div>
                            
                            <div class="timestamp-info">
                                <i class="fas fa-clock"></i>
                                <span>Submitted at ${timestamp}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function viewDetailedReport() {
        const reportData = JSON.parse(localStorage.getItem('interviewReport'));
        if (!reportData) {
            showNotification('No report data available', 'error');
            return;
        }
        
        const insights = generateKeyInsights(reportData);
        const priorities = generateFixPriorities(reportData);
        
        // Create detailed report modal
        const modal = document.createElement('div');
        modal.id = 'detailed-report-modal';
        modal.innerHTML = `
            <style>
                #detailed-report-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.96);
                    z-index: 10000;
                    overflow-y: auto;
                    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    backdrop-filter: blur(10px);
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .report-container {
                    max-width: 1300px;
                    margin: 50px auto;
                    padding: 50px 40px;
                    animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .report-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 50px;
                    padding-bottom: 25px;
                    border-bottom: 2px solid rgba(229, 57, 53, 0.25);
                }
                .report-title {
                    font-size: 2.8rem;
                    font-weight: 700;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .report-title i {
                    color: #e53935;
                }
                .close-report {
                    background: rgba(255, 255, 255, 0.08);
                    border: 1.5px solid rgba(255, 255, 255, 0.15);
                    color: white;
                    padding: 14px 30px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 1.05rem;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .close-report:hover {
                    background: rgba(255, 255, 255, 0.15);
                    transform: translateY(-2px);
                }
                .report-summary {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 25px;
                    margin-bottom: 50px;
                }
                .summary-card {
                    background: rgba(31, 31, 31, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 25px;
                    border-radius: 16px;
                    transition: all 0.3s ease;
                }
                .summary-card:hover {
                    border-color: rgba(229, 57, 53, 0.3);
                    transform: translateY(-2px);
                }
                .summary-label {
                    font-size: 0.85rem;
                    color: #999;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    margin-bottom: 10px;
                    font-weight: 600;
                }
                .summary-value {
                    font-size: 2.2rem;
                    font-weight: 800;
                    color: #e53935;
                }
                .insights-section {
                    margin-bottom: 50px;
                }
                .section-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 30px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .section-title i {
                    color: #e53935;
                }
                .insights-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 25px;
                    margin-bottom: 30px;
                }
                .insight-card {
                    background: rgba(31, 31, 31, 0.6);
                    border-left: 4px solid;
                    border-radius: 12px;
                    padding: 25px;
                    transition: all 0.3s ease;
                }
                .insight-card.strength {
                    border-color: #66bb6a;
                    background: linear-gradient(135deg, rgba(102, 187, 106, 0.08) 0%, rgba(31, 31, 31, 0.6) 100%);
                }
                .insight-card.weakness {
                    border-color: #ef5350;
                    background: linear-gradient(135deg, rgba(239, 83, 80, 0.08) 0%, rgba(31, 31, 31, 0.6) 100%);
                }
                .insight-card.observation {
                    border-color: #42a5f5;
                    background: linear-gradient(135deg, rgba(66, 165, 245, 0.08) 0%, rgba(31, 31, 31, 0.6) 100%);
                }
                .insight-card:hover {
                    transform: translateX(5px);
                }
                .insight-metric {
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin-bottom: 8px;
                }
                .insight-card.strength .insight-metric { color: #66bb6a; }
                .insight-card.weakness .insight-metric { color: #ef5350; }
                .insight-card.observation .insight-metric { color: #42a5f5; }
                .insight-text {
                    color: #bbb;
                    line-height: 1.6;
                    font-size: 0.95rem;
                }
                .priorities-section {
                    margin-bottom: 50px;
                    background: rgba(229, 57, 53, 0.05);
                    border: 1.5px solid rgba(229, 57, 53, 0.2);
                    border-radius: 20px;
                    padding: 40px;
                }
                .priority-item {
                    background: rgba(31, 31, 31, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 14px;
                    padding: 25px;
                    margin-bottom: 20px;
                    display: flex;
                    gap: 20px;
                    align-items: flex-start;
                }
                .priority-rank {
                    background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
                    color: white;
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.4rem;
                    font-weight: 800;
                    flex-shrink: 0;
                }
                .priority-content {
                    flex: 1;
                }
                .priority-metric {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 8px;
                }
                .priority-score {
                    color: #ef5350;
                    font-size: 0.9rem;
                    margin-bottom: 12px;
                }
                .priority-action {
                    color: #aaa;
                    line-height: 1.6;
                    font-size: 0.95rem;
                }
                .questions-breakdown {
                    margin-top: 50px;
                }
                .expand-all-btn {
                    background: rgba(66, 165, 245, 0.15);
                    border: 1px solid rgba(66, 165, 245, 0.3);
                    color: #42a5f5;
                    padding: 12px 28px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 25px;
                    transition: all 0.3s;
                }
                .expand-all-btn:hover {
                    background: rgba(66, 165, 245, 0.25);
                }
                .question-card {
                    background: rgba(31, 31, 31, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    margin-bottom: 20px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                .question-card.expanded {
                    border-color: rgba(229, 57, 53, 0.3);
                }
                .question-header-collapsible {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 25px 30px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .question-header-collapsible:hover {
                    background: rgba(255, 255, 255, 0.03);
                }
                .question-header-left {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .question-number {
                    font-size: 0.9rem;
                    color: #888;
                    font-weight: 700;
                }
                .question-text-preview {
                    font-size: 1.05rem;
                    color: #ddd;
                    font-weight: 500;
                }
                .question-type-badge {
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .type-text {
                    background: rgba(66, 165, 245, 0.2);
                    color: #42a5f5;
                    border: 1px solid rgba(66, 165, 245, 0.3);
                }
                .type-voice {
                    background: rgba(102, 187, 106, 0.2);
                    color: #66bb6a;
                    border: 1px solid rgba(102, 187, 106, 0.3);
                }
                .expand-icon {
                    color: #888;
                    font-size: 1.2rem;
                    transition: transform 0.3s;
                }
                .question-card.expanded .expand-icon {
                    transform: rotate(180deg);
                }
                .question-content {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.4s ease;
                }
                .question-card.expanded .question-content {
                    max-height: 2000px;
                }
                .question-content-inner {
                    padding: 0 30px 30px;
                }
                .question-text-full {
                    font-size: 1.15rem;
                    color: #fff;
                    margin-bottom: 25px;
                    line-height: 1.7;
                    font-weight: 500;
                }
                .answer-section {
                    background: rgba(0, 0, 0, 0.3);
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 25px;
                }
                .answer-label {
                    font-size: 0.85rem;
                    color: #999;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    margin-bottom: 12px;
                    font-weight: 600;
                }
                .answer-text {
                    color: #ccc;
                    line-height: 1.8;
                    font-size: 1rem;
                }
                .scores-breakdown {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 15px;
                    margin-bottom: 15px;
                }
                .score-metric {
                    text-align: center;
                    padding: 18px 15px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 10px;
                    transition: all 0.3s;
                }
                .score-metric:hover {
                    transform: translateY(-2px);
                    background: rgba(0, 0, 0, 0.4);
                }
                .metric-label {
                    font-size: 0.75rem;
                    color: #999;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                    font-weight: 600;
                    letter-spacing: 1px;
                }
                .metric-value {
                    font-size: 1.6rem;
                    font-weight: 800;
                }
                .score-excellent { color: #66bb6a; }
                .score-good { color: #42a5f5; }
                .score-average { color: #ff9800; }
                .score-poor { color: #ef5350; }
                .timestamp-info {
                    font-size: 0.85rem;
                    color: #666;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
            </style>
            
            <div class="report-container">
                <div class="report-header">
                    <h1 class="report-title">
                        <i class="fas fa-chart-line"></i>
                        Detailed Performance Report
                    </h1>
                    <button class="close-report" onclick="document.getElementById('detailed-report-modal').remove()">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
                
                <div class="report-summary">
                    <div class="summary-card">
                        <div class="summary-label">Overall Score</div>
                        <div class="summary-value">${reportData.overallAvg.toFixed(1)}/10</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">Written Round</div>
                        <div class="summary-value">${reportData.textAvg.toFixed(1)}/10</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">Verbal Round</div>
                        <div class="summary-value">${reportData.voiceAvg.toFixed(1)}/10</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">Duration</div>
                        <div class="summary-value">${Math.round((reportData.endTime - reportData.startTime) / 60000)}min</div>
                    </div>
                </div>
                
                <div class="insights-section">
                    <h2 class="section-title">
                        <i class="fas fa-lightbulb"></i>
                        Key Insights
                    </h2>
                    <div class="insights-grid">
                        ${insights.strengths.map(s => `
                            <div class="insight-card strength">
                                <div class="insight-metric">
                                    <i class="fas fa-check-circle"></i> ${s.metric} (${s.score.toFixed(1)}/10)
                                </div>
                                <div class="insight-text">${s.insight}</div>
                            </div>
                        `).join('')}
                        ${insights.weaknesses.map(w => `
                            <div class="insight-card weakness">
                                <div class="insight-metric">
                                    <i class="fas fa-exclamation-triangle"></i> ${w.metric} (${w.score.toFixed(1)}/10)
                                </div>
                                <div class="insight-text">${w.insight}</div>
                            </div>
                        `).join('')}
                        ${insights.observations.map(o => `
                            <div class="insight-card observation">
                                <div class="insight-metric">
                                    <i class="fas fa-info-circle"></i> Observation
                                </div>
                                <div class="insight-text">${o.insight}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${priorities.length > 0 ? `
                    <div class="priorities-section">
                        <h2 class="section-title">
                            <i class="fas fa-bullseye"></i>
                            What to Fix Next
                        </h2>
                        ${priorities.map(p => `
                            <div class="priority-item">
                                <div class="priority-rank">${p.rank}</div>
                                <div class="priority-content">
                                    <div class="priority-metric">${p.metric}</div>
                                    <div class="priority-score">Current: ${p.score.toFixed(1)}/10</div>
                                    <div class="priority-action">
                                        <i class="fas fa-arrow-right"></i> ${p.actionPlan}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="questions-breakdown">
                    <h2 class="section-title">
                        <i class="fas fa-list-check"></i>
                        Question-by-Question Analysis
                    </h2>
                    <button class="expand-all-btn" onclick="toggleAllQuestions()">
                        <i class="fas fa-expand-alt"></i> Expand All
                    </button>
                    ${generateCollapsibleQuestionBreakdown(reportData)}
                </div>
            </div>
            
            <script>
                function toggleQuestion(index) {
                    const card = document.getElementById('question-' + index);
                    card.classList.toggle('expanded');
                }
                
                function toggleAllQuestions() {
                    const cards = document.querySelectorAll('.question-card');
                    const allExpanded = Array.from(cards).every(card => card.classList.contains('expanded'));
                    
                    cards.forEach(card => {
                        if (allExpanded) {
                            card.classList.remove('expanded');
                        } else {
                            card.classList.add('expanded');
                        }
                    });
                    
                    const btn = document.querySelector('.expand-all-btn');
                    btn.innerHTML = allExpanded ? 
                        '<i class=\"fas fa-expand-alt\"></i> Expand All' : 
                        '<i class=\"fas fa-compress-alt\"></i> Collapse All';
                }
            </script>
        `;
        
        document.body.appendChild(modal);
    }
    
    function generateCollapsibleQuestionBreakdown(reportData) {
        return reportData.questions.map((question, index) => {
            const answer = reportData.answers[index];
            const scores = reportData.scores[index];
            
            if (!answer || !scores) return '';
            
            const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
            const timestamp = new Date(answer.timestamp).toLocaleTimeString();
            
            return `
                <div class="question-card" id="question-${index}">
                    <div class="question-header-collapsible" onclick="toggleQuestion(${index})">
                        <div class="question-header-left">
                            <span class="question-number">Q${index + 1}</span>
                            <span class="question-text-preview">${question.text.substring(0, 70)}${question.text.length > 70 ? '...' : ''}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <span class="question-type-badge type-${question.type}">
                                <i class="fas fa-${question.type === 'text' ? 'keyboard' : 'microphone'}"></i>
                                ${question.type.toUpperCase()}
                            </span>
                            <span class="metric-value ${getScoreColorClass(avgScore)}">${avgScore.toFixed(1)}</span>
                            <i class="fas fa-chevron-down expand-icon"></i>
                        </div>
                    </div>
                    
                    <div class="question-content">
                        <div class="question-content-inner">
                            <div class="question-text-full">${question.text}</div>
                            
                            <div class="answer-section">
                                <div class="answer-label"><i class="fas fa-comment-dots"></i> Your Answer</div>
                                <div class="answer-text">${answer.answer}</div>
                            </div>
                            
                            <div class="scores-breakdown">
                                <div class="score-metric">
                                    <div class="metric-label">Clarity</div>
                                    <div class="metric-value ${getScoreColorClass(scores.clarity)}">${scores.clarity}/10</div>
                                </div>
                                <div class="score-metric">
                                    <div class="metric-label">Correctness</div>
                                    <div class="metric-value ${getScoreColorClass(scores.correctness)}">${scores.correctness}/10</div>
                                </div>
                                <div class="score-metric">
                                    <div class="metric-label">Depth</div>
                                    <div class="metric-value ${getScoreColorClass(scores.depth)}">${scores.depth}/10</div>
                                </div>
                                <div class="score-metric">
                                    <div class="metric-label">Confidence</div>
                                    <div class="metric-value ${getScoreColorClass(scores.confidence)}">${scores.confidence}/10</div>
                                </div>
                                <div class="score-metric">
                                    <div class="metric-label">Communication</div>
                                    <div class="metric-value ${getScoreColorClass(scores.communication)}">${scores.communication}/10</div>
                                </div>
                            </div>
                            
                            <div class="timestamp-info">
                                <i class="fas fa-clock"></i>
                                <span>Submitted at ${timestamp}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function getScoreColorClass(score) {
        if (score >= 8) return 'score-excellent';
        if (score >= 6) return 'score-good';
        if (score >= 4) return 'score-average';
        return 'score-poor';
    }

    function viewDetailedReport() {
        const reportData = JSON.parse(localStorage.getItem('interviewReport'));
        if (!reportData) {
            showNotification('No report data available', 'error');
            return;
        }
        
        // Create detailed report modal
        const modal = document.createElement('div');
        modal.id = 'detailed-report-modal';
        modal.innerHTML = `
            <style>
                #detailed-report-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.95);
                    z-index: 10000;
                    overflow-y: auto;
                    animation: fadeIn 0.3s ease;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .report-container {
                    max-width: 1400px;
                    margin: 40px auto;
                    padding: 40px;
                }
                .report-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid rgba(229, 57, 53, 0.3);
                }
                .report-title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #fff;
                }
                .close-report {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: all 0.3s;
                }
                .close-report:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                .report-summary {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 40px;
                }
                .summary-card {
                    background: rgba(31, 31, 31, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 20px;
                    border-radius: 12px;
                }
                .summary-label {
                    font-size: 0.85rem;
                    color: #888;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                }
                .summary-value {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #e53935;
                }
                .questions-breakdown {
                    margin-top: 40px;
                }
                .section-title {
                    font-size: 1.8rem;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 30px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .section-title::before {
                    content: '';
                    width: 4px;
                    height: 30px;
                    background: linear-gradient(180deg, #e53935, #ff6b6b);
                    border-radius: 2px;
                }
                .question-card {
                    background: rgba(31, 31, 31, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 30px;
                    margin-bottom: 30px;
                    transition: all 0.3s;
                }
                .question-card:hover {
                    border-color: rgba(229, 57, 53, 0.3);
                    transform: translateY(-2px);
                }
                .question-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                }
                .question-number {
                    font-size: 0.9rem;
                    color: #888;
                    font-weight: 600;
                }
                .question-type-badge {
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .type-text {
                    background: rgba(66, 165, 245, 0.2);
                    color: #42a5f5;
                    border: 1px solid rgba(66, 165, 245, 0.3);
                }
                .type-voice {
                    background: rgba(102, 187, 106, 0.2);
                    color: #66bb6a;
                    border: 1px solid rgba(102, 187, 106, 0.3);
                }
                .question-text {
                    font-size: 1.2rem;
                    color: #fff;
                    margin-bottom: 20px;
                    line-height: 1.6;
                }
                .answer-section {
                    background: rgba(0, 0, 0, 0.3);
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                }
                .answer-label {
                    font-size: 0.85rem;
                    color: #888;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 10px;
                }
                .answer-text {
                    color: #ccc;
                    line-height: 1.8;
                    font-size: 1rem;
                }
                .scores-breakdown {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                    margin-top: 20px;
                }
                .score-metric {
                    text-align: center;
                    padding: 15px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                }
                .metric-label {
                    font-size: 0.75rem;
                    color: #888;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }
                .metric-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                }
                .score-excellent { color: #66bb6a; }
                .score-good { color: #42a5f5; }
                .score-average { color: #ff9800; }
                .score-poor { color: #ef5350; }
                .timestamp-info {
                    font-size: 0.85rem;
                    color: #666;
                    margin-top: 15px;
                }
            </style>
            
            <div class="report-container">
                <div class="report-header">
                    <h1 class="report-title"><i class="fas fa-file-chart-line"></i> Detailed Performance Report</h1>
                    <button class="close-report" onclick="document.getElementById('detailed-report-modal').remove()">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
                
                <div class="report-summary">
                    <div class="summary-card">
                        <div class="summary-label">Overall Score</div>
                        <div class="summary-value">${reportData.overallAvg.toFixed(1)}/10</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">Text Round</div>
                        <div class="summary-value">${reportData.textAvg.toFixed(1)}/10</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">Voice Round</div>
                        <div class="summary-value">${reportData.voiceAvg.toFixed(1)}/10</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">Duration</div>
                        <div class="summary-value">${Math.round((reportData.endTime - reportData.startTime) / 60000)}m</div>
                    </div>
                </div>
                
                <div class="questions-breakdown">
                    <h2 class="section-title">Question-by-Question Analysis</h2>
                    ${generateQuestionBreakdown(reportData)}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    function generateQuestionBreakdown(reportData) {
        return reportData.questions.map((question, index) => {
            const answer = reportData.answers[index];
            const scores = reportData.scores[index];
            
            if (!answer || !scores) return '';
            
            const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
            const timestamp = new Date(answer.timestamp).toLocaleTimeString();
            
            return `
                <div class="question-card">
                    <div class="question-header">
                        <span class="question-number">Question ${index + 1} of ${reportData.questions.length}</span>
                        <span class="question-type-badge type-${question.type}">
                            <i class="fas fa-${question.type === 'text' ? 'keyboard' : 'microphone'}"></i>
                            ${question.type.toUpperCase()}
                        </span>
                    </div>
                    
                    <div class="question-text">${question.text}</div>
                    
                    <div class="answer-section">
                        <div class="answer-label">Your Answer</div>
                        <div class="answer-text">${answer.answer}</div>
                    </div>
                    
                    <div class="scores-breakdown">
                        <div class="score-metric">
                            <div class="metric-label">Clarity</div>
                            <div class="metric-value ${getScoreColorClass(scores.clarity)}">${scores.clarity}/10</div>
                        </div>
                        <div class="score-metric">
                            <div class="metric-label">Correctness</div>
                            <div class="metric-value ${getScoreColorClass(scores.correctness)}">${scores.correctness}/10</div>
                        </div>
                        <div class="score-metric">
                            <div class="metric-label">Depth</div>
                            <div class="metric-value ${getScoreColorClass(scores.depth)}">${scores.depth}/10</div>
                        </div>
                        <div class="score-metric">
                            <div class="metric-label">Confidence</div>
                            <div class="metric-value ${getScoreColorClass(scores.confidence)}">${scores.confidence}/10</div>
                        </div>
                        <div class="score-metric">
                            <div class="metric-label">Communication</div>
                            <div class="metric-value ${getScoreColorClass(scores.communication)}">${scores.communication}/10</div>
                        </div>
                    </div>
                    
                    <div class="timestamp-info">
                        <i class="fas fa-clock"></i> Submitted at ${timestamp} | Average: ${avgScore.toFixed(1)}/10
                    </div>
                </div>
            `;
        }).join('');
    }
    
    function getScoreColorClass(score) {
        if (score >= 8) return 'score-excellent';
        if (score >= 6) return 'score-good';
        if (score >= 4) return 'score-average';
        return 'score-poor';
    }

    // ==================== TIMER ====================
    function startTimer() {
        // Clear any existing timer
        stopTimer();
        
        state.timeRemaining = CONFIG.QUESTION_TIME_LIMIT;
        updateTimerDisplay();
        
        state.timerInterval = setInterval(() => {
            state.timeRemaining--;
            updateTimerDisplay();
            
            if (state.timeRemaining <= 0) {
                // Time's up - auto submit
                autoSubmitAnswer();
            }
        }, 1000);
    }

    function stopTimer() {
        if (state.timerInterval) {
            clearInterval(state.timerInterval);
            state.timerInterval = null;
        }
    }

    function updateTimerDisplay() {
        if (!elements.timer) return;
        
        const minutes = Math.floor(state.timeRemaining / 60);
        const seconds = state.timeRemaining % 60;
        
        elements.timer.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // Update color based on time remaining
        elements.timer.className = 'timer';
        
        if (state.timeRemaining <= CONFIG.CRITICAL_TIME) {
            elements.timer.classList.add('critical');
        } else if (state.timeRemaining <= CONFIG.WARNING_TIME) {
            elements.timer.classList.add('warning');
        }
    }

    function autoSubmitAnswer() {
        stopTimer();
        
        const question = state.questions[state.currentQuestionIndex];
        
        if (question.type === 'text') {
            const answer = elements.textAnswer ? elements.textAnswer.value.trim() : '';
            if (answer) {
                submitTextAnswer();
            } else {
                showNotification('Time expired! Moving to next question.', 'warning');
                moveToNextQuestion();
            }
        } else {
            if (state.isRecording) {
                stopRecording();
            }
            
            if (state.currentTranscript) {
                submitVoiceAnswer();
            } else {
                showNotification('Time expired! Moving to next question.', 'warning');
                moveToNextQuestion();
            }
        }
    }

    // ==================== UI HELPERS ====================
    function showStartError(message) {
        // Find or create error element in start screen
        let errorElement = document.getElementById('interview-start-error');
        
        if (!errorElement && elements.startScreen) {
            errorElement = document.createElement('div');
            errorElement.id = 'interview-start-error';
            errorElement.className = 'interview-error-message';
            errorElement.style.cssText = 'color: #ff6b6b; background: rgba(255, 107, 107, 0.1); padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid rgba(255, 107, 107, 0.3);';
            
            // Insert before the start button
            const startBtn = elements.startBtn;
            if (startBtn && startBtn.parentNode) {
                startBtn.parentNode.insertBefore(errorElement, startBtn);
            } else {
                elements.startScreen.appendChild(errorElement);
            }
        }
        
        if (errorElement) {
            errorElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
            errorElement.style.display = 'block';
        }
    }

    function hideStartError() {
        const errorElement = document.getElementById('interview-start-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    function showScreen(screenName) {
        const screens = {
            start: elements.startScreen,
            active: elements.activeScreen,
            complete: elements.completeScreen
        };
        
        // Hide all screens
        Object.values(screens).forEach(screen => {
            if (screen) screen.style.display = 'none';
        });
        
        // Show requested screen
        if (screens[screenName]) {
            screens[screenName].style.display = 'block';
        }
    }

    function showEvaluationError(message) {
        // Silent error handling - only log to console, don't show UI error
        console.warn('[Evaluation Error]', message);
    }

    function hideEvaluationError() {
        const errorDiv = document.getElementById('evaluation-error-inline');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    function showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}]`, message);
        // Only use alert for critical errors (mic permission, etc.)
        if (type === 'error' && (message.includes('microphone') || message.includes('permission'))) {
            alert(message);
        }
    }

    // ==================== PUBLIC API ====================
    return {
        init: init
    };

})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', MockInterview.init);
} else {
    MockInterview.init();
}
