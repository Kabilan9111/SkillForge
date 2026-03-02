/**
 * Test Script: Interview-Grade Strict Mode vs Balanced Mode
 * Compares how the same resume is evaluated under different standards
 */

const resumeParserService = require('./src/services/resumeParserService');
const skillDetectionService = require('./src/services/skillDetectionService');

// Sample Python Full Stack Developer Resume
const testResume = `
ALEX CHEN
Python Full Stack Developer
Email: alex@example.com | GitHub: github.com/alexchen

SKILLS
Python, Django, Flask, React, JavaScript, PostgreSQL, Docker, Git, AWS

EXPERIENCE

Software Engineer | TechStartup Inc | 2023 - Present
- Built REST APIs using Django REST Framework handling 10K+ requests/day
- Developed admin dashboard with React and Redux
- Deployed applications to AWS EC2 with Docker containers
- Implemented Redis caching reducing database load by 35%
- Wrote unit tests using pytest achieving 80% coverage

Junior Developer | WebAgency | 2022 - 2023
- Created landing pages with HTML, CSS, JavaScript
- Assisted in Django application maintenance
- Used Git for version control
- Learned Docker and CI/CD basics

PROJECTS

E-Commerce Platform
- Full-stack application using Django and React
- PostgreSQL database with 5 tables
- Deployed on AWS with load balancing
- GitHub: github.com/alexchen/ecommerce

Personal Blog
- Built with Flask and vanilla JavaScript
- SQLite database
- Hosted on Heroku
`;

const requiredSkills = {
    backend: ['Python', 'Django', 'Flask', 'REST APIs', 'GraphQL'],
    frontend: ['React', 'Redux', 'JavaScript', 'TypeScript'],
    database: ['PostgreSQL', 'Redis', 'MongoDB'],
    devops: ['Docker', 'CI/CD', 'AWS', 'Kubernetes'],
    testing: ['pytest', 'Unit Testing', 'Integration Testing']
};

console.log('═══════════════════════════════════════════════════════════════');
console.log('  INTERVIEW-GRADE EVALUATION: STRICT MODE vs BALANCED MODE');
console.log('═══════════════════════════════════════════════════════════════\n');

// Parse resume
const resumeStructure = resumeParserService.parseResumeStructure(testResume);

console.log('📄 RESUME PARSED\n');
console.log('Candidate: Alex Chen');
console.log('Role: Python Full Stack Developer');
console.log('Experience: 2 years\n');

// Test BALANCED MODE
console.log('─────────────────────────────────────────────────────────────');
console.log('MODE 1: BALANCED (Fair, Transparent Reasoning)');
console.log('─────────────────────────────────────────────────────────────\n');

const balancedAnalysis = skillDetectionService.analyzeSkills(
    resumeStructure,
    requiredSkills,
    'balanced'
);

console.log(`✅ Strong: ${balancedAnalysis.strong.length} skills`);
balancedAnalysis.strong.forEach(s => {
    console.log(`   • ${s.skill} [${s.confidenceLevel}] - Score: ${s.proficiencyScore}/100`);
    console.log(`     ${s.reasoning?.substring(0, 100)}...`);
});

console.log(`\n🔄 Developing: ${balancedAnalysis.developing.length} skills`);
balancedAnalysis.developing.slice(0, 5).forEach(s => {
    console.log(`   • ${s.skill} [${s.confidenceLevel}] - Score: ${s.proficiencyScore}/100`);
});

console.log(`\n❌ Missing: ${balancedAnalysis.missing.length} skills`);
balancedAnalysis.missing.slice(0, 3).forEach(s => {
    console.log(`   • ${s.skill}`);
});

// Test STRICT MODE
console.log('\n\n─────────────────────────────────────────────────────────────');
console.log('MODE 2: STRICT (Interview-Grade, Production Evidence Required)');
console.log('─────────────────────────────────────────────────────────────\n');

const strictAnalysis = skillDetectionService.analyzeSkills(
    resumeStructure,
    requiredSkills,
    'strict'
);

console.log(`✅ Mastered/Strong: ${strictAnalysis.strong.length} skills`);
strictAnalysis.strong.forEach(s => {
    console.log(`   • ${s.skill} [${s.state}] - Score: ${s.score}/100`);
    console.log(`     Quality: ${s.evidenceQuality}`);
    console.log(`     Production: ${s.productionEvidence ? 'Yes' : 'No'} | Metrics: ${s.measurableOutcome ? 'Yes' : 'No'}`);
    console.log(`     ${s.justification}`);
});

console.log(`\n🔄 Developing: ${strictAnalysis.developing.length} skills`);
strictAnalysis.developing.slice(0, 5).forEach(s => {
    console.log(`   • ${s.skill} [${s.state}] - Score: ${s.score}/100`);
    console.log(`     ${s.justification?.substring(0, 80)}...`);
});

console.log(`\n⚠️  Basic/Weak: ${strictAnalysis.basic.length} skills`);
strictAnalysis.basic.forEach(s => {
    console.log(`   • ${s.skill} [${s.state}] - Score: ${s.score}/100`);
    console.log(`     ${s.justification?.substring(0, 80)}...`);
});

console.log(`\n❌ Not Detected: ${strictAnalysis.missing.length} skills`);
strictAnalysis.missing.slice(0, 5).forEach(s => {
    console.log(`   • ${s.skill} - ${s.justification}`);
});

// Comparison
console.log('\n\n═══════════════════════════════════════════════════════════════');
console.log('  COMPARISON: Key Differences');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('1. SKILLS DETECTION:');
console.log(`   Balanced Mode: ${balancedAnalysis.strong.length + balancedAnalysis.developing.length} skills detected`);
console.log(`   Strict Mode: ${strictAnalysis.strong.length + strictAnalysis.developing.length} skills detected`);

console.log('\n2. SCORING PHILOSOPHY:');
console.log('   Balanced: Values implicit demonstrations, fair to juniors');
console.log('   Strict: Requires production evidence + metrics, interview-grade');

console.log('\n3. SKILLS-LIST-ONLY TREATMENT:');
console.log('   Balanced: Marked as "Explicit" (40-49/100)');
console.log('   Strict: Marked as "Not Detected" (0/100)');

console.log('\n4. EXAMPLE: Git (listed in skills + used for version control)');
const gitBalanced = balancedAnalysis.strong.concat(balancedAnalysis.developing).find(s => s.skill === 'Git');
const gitStrict = strictAnalysis.strong.concat(strictAnalysis.developing).concat(strictAnalysis.basic).find(s => s.skill === 'Git');

if (gitBalanced) {
    console.log(`   Balanced: ${gitBalanced.confidenceLevel} (${gitBalanced.proficiencyScore}/100)`);
}
if (gitStrict) {
    console.log(`   Strict: ${gitStrict.state} (${gitStrict.score}/100)`);
}

console.log('\n5. RECOMMENDATION:');
console.log('   • Use BALANCED for skill gap dashboards (fair, transparent)');
console.log('   • Use STRICT for interview preparation (conservative, production-focused)');
console.log('   • STRICT helps avoid over-claiming and identifies true proficiency gaps\n');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  TEST COMPLETE');
console.log('═══════════════════════════════════════════════════════════════\n');
