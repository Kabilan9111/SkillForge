/**
 * Quick HTTP test for /api/skill-gap/career-intelligence
 * Run: node test-career-intelligence.js
 */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const RESUME_TEXT = [
    'JOHN DOE — Senior Software Engineer',
    'San Francisco, CA | 8 years of professional experience',
    '',
    'SUMMARY',
    'Senior Software Engineer and technical lead with 8+ years of experience building',
    'distributed backend systems at scale. Architected microservices on AWS EKS.',
    '',
    'EXPERIENCE',
    'Senior Software Engineer — TechCorp (2019–2024)',
    '• Architected event-driven microservices system serving 10 million daily active users',
    '• Led team of 6 engineers, reducing bug rate by 40% through rigorous code review culture',
    '• Reduced API P99 latency by 55% via Redis caching layer and database query optimization',
    '• Deployed Kubernetes clusters on AWS EKS with Terraform and GitHub Actions CI/CD pipeline',
    '• Designed distributed order processing handling 500K+ daily transactions with Kafka',
    '• Achieved 99.9% uptime SLA; on-call rotation with Prometheus/Grafana observability stack',
    '• Scaled system from 100K to 5 million users over 18 months with zero downtime migrations',
    '',
    'SKILLS',
    'Languages: Node.js, Python, TypeScript, Go, Java',
    'Frontend: React, Next.js, TypeScript',
    'Databases: PostgreSQL, MongoDB, Redis, DynamoDB, Cassandra',
    'Cloud/DevOps: AWS, Docker, Kubernetes, Terraform, Ansible, CI/CD, GitHub Actions',
    'Architecture: Microservices, Event-Driven, Distributed Systems, API Gateway, Kafka',
    'Observability: Prometheus, Grafana, ELK Stack, OpenTelemetry, Datadog',
].join('\n');

// Write temp file
const tmpFile = path.join(__dirname, 'uploads', 'resumes', 'test-ci-endpoint.docx');
fs.writeFileSync(tmpFile, RESUME_TEXT, 'utf8');

const boundary = '----SFTestBoundary' + Date.now();
const CRLF     = '\r\n';

function formPart(name, value) {
    return `--${boundary}${CRLF}Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}${value}${CRLF}`;
}
function filePart(name, filename, content) {
    return `--${boundary}${CRLF}Content-Disposition: form-data; name="${name}"; filename="${filename}"${CRLF}Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document${CRLF}${CRLF}${content}${CRLF}`;
}

const bodyStr = [
    filePart('resume', 'senior-engineer-resume.docx', RESUME_TEXT),
    formPart('targetSalary',      '140000'),
    formPart('targetRole',        'Senior Software Engineer'),
    formPart('location',          'San Francisco'),
    formPart('yearsOfExperience', '8'),
    `--${boundary}--${CRLF}`,
].join('');

const bodyBuf = Buffer.from(bodyStr, 'utf8');

const opts = {
    hostname: 'localhost',
    port:     3000,
    path:     '/api/skill-gap/career-intelligence',
    method:   'POST',
    headers:  {
        'Content-Type':   `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuf.length,
    },
};

console.log('🔍 Testing POST /api/skill-gap/career-intelligence...');

const req = http.request(opts, res => {
    let raw = '';
    res.on('data', c => raw += c);
    res.on('end', () => {
        fs.unlinkSync(tmpFile);
        try {
            const r = JSON.parse(raw);
            if (!r.success) {
                console.error('❌ Error:', r.error);
                process.exit(1);
            }
            console.log('\n✅ CAREER INTELLIGENCE TEST PASSED');
            console.log('═'.repeat(50));
            console.log(`  Overall Score  : ${r.overallReadinessScore}/100`);
            console.log(`  Verdict        : ${r.finalVerdict}`);
            console.log(`  Gap Severity   : ${r.layers.layer5.gapSeverity}`);
            console.log(`  Hiring Prob    : ${r.addOns.hiringProbabilityPercent}%`);
            console.log(`  ATS Score      : ${r.addOns.atsOptimizationScore}/100`);
            console.log(`  Recruiter Attn : ${r.addOns.recruiterAttentionScore}/100`);
            console.log(`  Confidence     : ${r.addOns.confidenceIndex}/100`);
            console.log(`  Processing     : ${r.processingTime}`);
            console.log('─'.repeat(50));
            console.log('  Priority Actions:');
            (r.immediatePriorityActions || []).forEach(a =>
                console.log(`    [${a.priority}] ${a.action.substring(0,60)}…`));
            console.log('═'.repeat(50));
        } catch (e) {
            console.error('Parse error:', e.message);
            console.error('Raw (first 400):', raw.substring(0, 400));
        }
    });
});

req.on('error', e => {
    fs.unlinkSync(tmpFile);
    console.error('Request failed:', e.message);
});

req.write(bodyBuf);
req.end();
