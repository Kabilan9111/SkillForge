/**
 * Test transparent reasoning engine with realistic junior-to-mid level resumes
 */

const skillProficiencyAnalyzer = require('./src/services/skillProficiencyAnalyzer');

// Test Resume 1: Junior developer with some practical experience
const juniorResume = {
    sections: {
        skills: {
            lines: ['JavaScript, React, Git, HTML, CSS, Node.js'].map((l, i) => ({ text: l, lineNumber: i + 1 }))
        },
        experience: {
            lines: [
                { text: 'Built e-commerce website using React and Node.js', lineNumber: 10 },
                { text: 'Used Git for version control', lineNumber: 11 },
                { text: 'Deployed application with Docker containers', lineNumber: 12 },
                { text: 'Wrote unit tests using Jest', lineNumber: 13 }
            ]
        },
        projects: {
            lines: [
                { text: 'Personal blog: React frontend, Express backend', lineNumber: 20 },
                { text: 'GitHub link: github.com/johndoe/blog', lineNumber: 21 }
            ]
        }
    }
};

// Test Resume 2: Mid-level with production experience
const midLevelResume = {
    sections: {
        experience: {
            lines: [
                { text: 'Led development of microservices architecture using Docker and Kubernetes', lineNumber: 5 },
                { text: 'Designed and implemented RESTful APIs handling 10K+ requests/day', lineNumber: 6 },
                { text: 'Optimized database queries reducing response time by 40%', lineNumber: 7 },
                { text: 'Mentored 3 junior developers on React best practices', lineNumber: 8 },
                { text: 'Implemented CI/CD pipeline with Jenkins and GitLab', lineNumber: 9 }
            ]
        },
        skills: {
            lines: ['Docker, Kubernetes, React, Node.js, PostgreSQL, Redis, Jenkins'].map((l, i) => ({ text: l, lineNumber: i + 15 }))
        }
    }
};

// Test Resume 3: Junior with only academic/learning experience
const academicResume = {
    sections: {
        education: {
            lines: [
                { text: 'Coursework: Data Structures, Algorithms, Web Development', lineNumber: 5 },
                { text: 'Technologies learned: Python, Java, SQL', lineNumber: 6 }
            ]
        },
        skills: {
            lines: ['Python, Java, SQL, HTML, CSS'].map((l, i) => ({ text: l, lineNumber: i + 10 }))
        },
        projects: {
            lines: [
                { text: 'School project: Simple CRUD app in Python Flask', lineNumber: 15 }
            ]
        }
    }
};

/**
 * Test skill analysis with different evidence scenarios
 */
function runTests() {
    console.log('=== TRANSPARENT REASONING ENGINE TESTS ===\n');

    // Test 1: Docker in junior resume (should be Demonstrated, not penalized)
    console.log('TEST 1: Docker - Junior with deployment experience');
    console.log('Expected: Demonstrated or Implied (not penalized for lack of orchestration)');
    const dockerEvidence = [
        {
            type: 'explicit',
            source: 'skills',
            line: 'JavaScript, React, Git, HTML, CSS, Node.js',
            lineNumber: 1,
            confidence: 0.95,
            reason: 'Listed in skills section'
        },
        {
            type: 'implicit',
            source: 'experience',
            line: 'Deployed application with Docker containers',
            lineNumber: 12,
            confidence: 0.85,
            reason: 'Demonstrated practical usage'
        }
    ];
    
    const dockerAnalysis = skillProficiencyAnalyzer.analyzeProficiency('Docker', dockerEvidence, juniorResume.sections);
    console.log('Result:', dockerAnalysis.level);
    console.log('Category:', dockerAnalysis.category);
    console.log('Score:', dockerAnalysis.score);
    console.log('Reasoning:', dockerAnalysis.reasoning);
    console.log('Coaching Tip:', dockerAnalysis.coachingTip);
    console.log('---\n');

    // Test 2: Git inferred from GitHub link (should be Implied)
    console.log('TEST 2: Git - Inferred from GitHub link');
    console.log('Expected: Implied (inferred from related evidence)');
    const gitEvidence = [
        {
            type: 'explicit',
            source: 'skills',
            line: 'JavaScript, React, Git, HTML, CSS, Node.js',
            lineNumber: 1,
            confidence: 0.95,
            reason: 'Listed in skills section'
        },
        {
            type: 'implicit',
            source: 'experience',
            line: 'Used Git for version control',
            lineNumber: 11,
            confidence: 0.80,
            reason: 'Basic usage mentioned'
        },
        {
            type: 'inferred',
            source: 'projects',
            line: 'GitHub link: github.com/johndoe/blog',
            lineNumber: 21,
            confidence: 0.75,
            reason: 'Inferred from GitHub presence'
        }
    ];
    
    const gitAnalysis = skillProficiencyAnalyzer.analyzeProficiency('Git', gitEvidence, juniorResume.sections);
    console.log('Result:', gitAnalysis.level);
    console.log('Category:', gitAnalysis.category);
    console.log('Score:', gitAnalysis.score);
    console.log('Reasoning:', gitAnalysis.reasoning);
    console.log('Coaching Tip:', gitAnalysis.coachingTip);
    console.log('---\n');

    // Test 3: React with strong production evidence (should be Advanced or Demonstrated)
    console.log('TEST 3: React - Mid-level with mentoring and production scale');
    console.log('Expected: Advanced or Demonstrated');
    const reactEvidence = [
        {
            type: 'explicit',
            source: 'skills',
            line: 'Docker, Kubernetes, React, Node.js, PostgreSQL, Redis, Jenkins',
            lineNumber: 15,
            confidence: 0.95,
            reason: 'Listed in skills section'
        },
        {
            type: 'implicit',
            source: 'experience',
            line: 'Mentored 3 junior developers on React best practices',
            lineNumber: 8,
            confidence: 0.95,
            reason: 'Leadership and expertise demonstrated'
        },
        {
            type: 'implicit',
            source: 'experience',
            line: 'Designed and implemented RESTful APIs handling 10K+ requests/day',
            lineNumber: 6,
            confidence: 0.90,
            reason: 'Production scale experience'
        }
    ];
    
    const reactAnalysis = skillProficiencyAnalyzer.analyzeProficiency('React', reactEvidence, midLevelResume.sections);
    console.log('Result:', reactAnalysis.level);
    console.log('Category:', reactAnalysis.category);
    console.log('Score:', reactAnalysis.score);
    console.log('Reasoning:', reactAnalysis.reasoning);
    console.log('Coaching Tip:', reactAnalysis.coachingTip);
    console.log('---\n');

    // Test 4: Python - Academic only (should be Explicit)
    console.log('TEST 4: Python - Academic/coursework only');
    console.log('Expected: Explicit (basic exposure)');
    const pythonEvidence = [
        {
            type: 'explicit',
            source: 'skills',
            line: 'Python, Java, SQL, HTML, CSS',
            lineNumber: 10,
            confidence: 0.90,
            reason: 'Listed in skills section'
        },
        {
            type: 'implicit',
            source: 'education',
            line: 'Technologies learned: Python, Java, SQL',
            lineNumber: 6,
            confidence: 0.70,
            reason: 'Mentioned in coursework'
        },
        {
            type: 'implicit',
            source: 'projects',
            line: 'School project: Simple CRUD app in Python Flask',
            lineNumber: 15,
            confidence: 0.75,
            reason: 'Basic project usage'
        }
    ];
    
    const pythonAnalysis = skillProficiencyAnalyzer.analyzeProficiency('Python', pythonEvidence, academicResume.sections);
    console.log('Result:', pythonAnalysis.level);
    console.log('Category:', pythonAnalysis.category);
    console.log('Score:', pythonAnalysis.score);
    console.log('Reasoning:', pythonAnalysis.reasoning);
    console.log('Coaching Tip:', pythonAnalysis.coachingTip);
    console.log('---\n');

    // Test 5: Kubernetes - Production orchestration (should be Advanced)
    console.log('TEST 5: Kubernetes - Production orchestration at scale');
    console.log('Expected: Advanced');
    const k8sEvidence = [
        {
            type: 'explicit',
            source: 'skills',
            line: 'Docker, Kubernetes, React, Node.js, PostgreSQL, Redis, Jenkins',
            lineNumber: 15,
            confidence: 0.95,
            reason: 'Listed in skills section'
        },
        {
            type: 'implicit',
            source: 'experience',
            line: 'Led development of microservices architecture using Docker and Kubernetes',
            lineNumber: 5,
            confidence: 0.95,
            reason: 'Leadership role with orchestration'
        },
        {
            type: 'implicit',
            source: 'experience',
            line: 'Designed and implemented RESTful APIs handling 10K+ requests/day',
            lineNumber: 6,
            confidence: 0.90,
            reason: 'Production scale deployment'
        }
    ];
    
    const k8sAnalysis = skillProficiencyAnalyzer.analyzeProficiency('Kubernetes', k8sEvidence, midLevelResume.sections);
    console.log('Result:', k8sAnalysis.level);
    console.log('Category:', k8sAnalysis.category);
    console.log('Score:', k8sAnalysis.score);
    console.log('Reasoning:', k8sAnalysis.reasoning);
    console.log('Coaching Tip:', k8sAnalysis.coachingTip);
    console.log('Evidence Summary:', JSON.stringify(k8sAnalysis.evidenceSummary, null, 2));
    console.log('---\n');

    // Test 6: Not detected skill
    console.log('TEST 6: MongoDB - Not detected');
    console.log('Expected: Not Detected with helpful reasoning');
    const mongoAnalysis = skillProficiencyAnalyzer.analyzeProficiency('MongoDB', [], juniorResume.sections);
    console.log('Result:', mongoAnalysis.level);
    console.log('Category:', mongoAnalysis.category);
    console.log('Score:', mongoAnalysis.score);
    console.log('Reasoning:', mongoAnalysis.reasoning);
    console.log('Coaching Tip:', mongoAnalysis.coachingTip);
    console.log('---\n');

    console.log('\n=== SUMMARY ===');
    console.log('All tests completed. Review reasoning to ensure:');
    console.log('1. Junior resumes are not overly penalized');
    console.log('2. Transparent reasoning explains WHY each level was assigned');
    console.log('3. Coaching tips are actionable and encouraging');
    console.log('4. Evidence summaries help users understand what was found');
}

// Run tests
runTests();
