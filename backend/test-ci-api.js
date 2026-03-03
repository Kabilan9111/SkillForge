// Quick smoke test for Career Intelligence API v2
const http = require('http');

const txt = 'Architected microservices 50k rps AWS Docker Kubernetes Redis Kafka TypeScript Node.js designed system distributed systems CI/CD GitHub Actions mentored team 3 engineers reduced latency 40 percent PostgreSQL built from scratch owned deployed production';
const boundary = '----CITestBoundary987';

let body = '';
const add = (name, value) => {
    body += `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;
};
add('targetSalary', '160000');
add('targetRole', 'Senior Software Engineer');
add('yearsOfExperience', '6');
add('location', 'San Francisco');
body += `--${boundary}\r\nContent-Disposition: form-data; name="resume"; filename="resume.pdf"\r\nContent-Type: application/pdf\r\n\r\n${txt}\r\n`;
body += `--${boundary}--\r\n`;

const opts = {
    hostname: 'localhost', port: 3000,
    path: '/api/skill-gap/career-intelligence',
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(body),
    },
};

const req = http.request(opts, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        try {
            const j = JSON.parse(d);
            if (!j.success && j.error) { console.log('API ERROR:', j.error); return; }
            console.log('=== CAREER INTELLIGENCE API v2 — SMOKE TEST ===');
            console.log('readinessScore          :', j.readinessScore);
            console.log('salaryProbability       :', j.salaryProbability);
            console.log('gapSeverity             :', j.gapSeverity);
            console.log('authenticityScore       :', j.authenticityScore);
            console.log('projectionTimelineMo    :', j.projectionTimelineMonths);
            console.log('skillGaps.length        :', (j.skillGaps || []).length);
            console.log('roadmap phases          :', (j.improvementRoadmap || []).length);
            console.log('maturityTier            :', j.maturityRadar ? j.maturityRadar.maturityTier : 'MISSING');
            console.log('maturityOverallScore    :', j.maturityRadar ? j.maturityRadar.overallMaturityScore : 'MISSING');
            console.log('capMatrix score         :', j.capabilityMatrix ? j.capabilityMatrix.overallCapabilityScore : 'MISSING');
            console.log('capMatrix blocking      :', j.capabilityMatrix ? (j.capabilityMatrix.blockingGaps || []).join(', ') : 'MISSING');
            console.log('salaryFeasibility       :', j.salaryFeasibility ? `isRealistic=${j.salaryFeasibility.isRealistic}, ${j.salaryFeasibility.projectionTimelineMonths}mo` : 'MISSING');
            console.log('marketSignalScore       :', j.marketSignals ? j.marketSignals.marketSignalScore : 'MISSING');
            console.log('growthTraj 2yr value    :', j.growthTrajectory ? j.growthTrajectory.projected2yrValue : 'MISSING');
            console.log('growthTraj stagnation   :', j.growthTrajectory ? j.growthTrajectory.stagnationRisk : 'MISSING');
            console.log('auth flags count        :', j.authenticityDetail ? (j.authenticityDetail.flags || []).length : 'MISSING');
            console.log('optimizedResume (50ch)  :', (j.optimizedResume || '').substring(0, 50));
            console.log('===============================================');
            console.log('ALL NEW MODULES PRESENT:', 
                j.maturityRadar && j.capabilityMatrix && j.skillDiagnostics && 
                j.salaryFeasibility && j.authenticityDetail && j.marketSignals && 
                j.growthTrajectory ? 'YES ✓' : 'PARTIAL — check above');
        } catch (e) {
            console.log('PARSE ERR:', e.message);
            console.log(d.substring(0, 400));
        }
    });
});
req.on('error', e => console.log('REQ ERR:', e.message));
req.write(body);
req.end();
