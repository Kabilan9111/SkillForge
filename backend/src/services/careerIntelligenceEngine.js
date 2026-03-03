'use strict';

/**
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║  ENTERPRISE 6-LAYER RESUME INTELLIGENCE ENGINE                     ║
 * ║  Pure static analysis — zero external API calls                    ║
 * ║                                                                    ║
 * ║  Layer 1: Market Positioning                                       ║
 * ║  Layer 2: Skill Depth Analysis                                     ║
 * ║  Layer 3: Impact Validation                                        ║
 * ║  Layer 4: Architecture Signals                                     ║
 * ║  Layer 5: Compensation Gap Modeling                                ║
 * ║  Layer 6: Resume Reconstruction                                    ║
 * ╚════════════════════════════════════════════════════════════════════╝
 */

// ─── Salary Band Benchmarks ───────────────────────────────────────────────────
const SALARY_BANDS = {
    junior:    { min: 50000,  max: 80000,  label: 'Junior (L1–L2)',        yoeRange: [0, 2]  },
    mid:       { min: 80000,  max: 115000, label: 'Mid-Level (L3–L4)',     yoeRange: [2, 5]  },
    senior:    { min: 115000, max: 155000, label: 'Senior (L5)',           yoeRange: [4, 8]  },
    staff:     { min: 155000, max: 210000, label: 'Staff / Principal',     yoeRange: [7, 15] },
    principal: { min: 210000, max: 350000, label: 'Principal / Director',  yoeRange: [10, 25] },
};

// ─── Role → Core skill mappings ───────────────────────────────────────────────
const ROLE_CORE_SKILLS = {
    default:              ['javascript', 'python', 'react', 'node', 'sql', 'rest api', 'git', 'docker', 'aws', 'linux'],
    frontend:             ['react', 'vue', 'angular', 'typescript', 'javascript', 'html', 'css', 'webpack', 'rest api', 'graphql', 'testing'],
    backend:              ['node', 'python', 'java', 'go', 'rest api', 'graphql', 'sql', 'postgresql', 'redis', 'docker', 'microservices'],
    fullstack:            ['javascript', 'typescript', 'react', 'node', 'sql', 'rest api', 'docker', 'git', 'aws', 'testing'],
    dataengineer:         ['python', 'sql', 'spark', 'kafka', 'airflow', 'dbt', 'aws', 'etl', 'data warehouse', 'snowflake'],
    datascientist:        ['python', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'sql', 'statistics', 'model deployment'],
    mlengineeer:          ['python', 'pytorch', 'tensorflow', 'mlflow', 'docker', 'kubernetes', 'model serving', 'feature engineering', 'aws sagemaker'],
    devops:               ['docker', 'kubernetes', 'terraform', 'aws', 'ci/cd', 'linux', 'bash', 'ansible', 'monitoring', 'prometheus'],
    cloud:                ['aws', 'azure', 'gcp', 'terraform', 'serverless', 'iam', 'networking', 'kubernetes', 'cost optimization'],
    mobile:               ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android', 'rest api', 'push notifications', 'app store'],
    security:             ['penetration testing', 'owasp', 'iam', 'siem', 'vulnerability assessment', 'encryption', 'zero trust', 'compliance'],
};

// ─── Keyword banks ────────────────────────────────────────────────────────────
const SENIORITY_SIGNALS = {
    senior: ['senior', 'sr.', 'sr ', 'lead', 'principal', 'staff', 'architect', 'head of', 'vp of', 'director of', 'tech lead'],
    mid:    ['software engineer', 'engineer ii', 'engineer 2', 'developer ii', 'developer 2'],
    junior: ['junior', 'jr.', 'jr ', 'associate', 'entry level', 'entry-level', 'engineer i', 'engineer 1', 'fresher', 'graduate engineer', 'intern'],
};

const ROLE_KEYWORDS_MAP = {
    'Software Engineer':         ['software', 'developer', 'engineer', 'backend', 'frontend', 'fullstack'],
    'Senior Software Engineer':  ['senior', 'software', 'engineer', 'architect', 'lead'],
    'Full-Stack Developer':      ['fullstack', 'full-stack', 'full stack', 'react', 'node', 'django', 'rails'],
    'Backend Engineer':          ['backend', 'api', 'microservices', 'distributed', 'java', 'python', 'go', 'node'],
    'Frontend Engineer':         ['frontend', 'ui', 'ux', 'react', 'vue', 'angular', 'css', 'html', 'typescript'],
    'Data Engineer':             ['data engineer', 'etl', 'pipeline', 'spark', 'kafka', 'airflow', 'dbt', 'warehouse'],
    'Data Scientist':            ['data scientist', 'machine learning', 'ml', 'model', 'tensorflow', 'statistics', 'pandas'],
    'DevOps Engineer':           ['devops', 'ci/cd', 'kubernetes', 'docker', 'terraform', 'jenkins', 'cloud'],
    'Cloud Engineer':            ['cloud', 'aws', 'azure', 'gcp', 'infrastructure', 'terraform', 'serverless'],
    'ML Engineer':               ['machine learning', 'mlops', 'model deployment', 'pytorch', 'tensorflow', 'feature store'],
    'Mobile Developer':          ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin'],
};

const PRODUCTION_EVIDENCE = [
    'deployed', 'production', 'prod', 'live', 'launched', 'shipped', 'released',
    'maintained', 'monitored', 'scaled', 'migrated', 'integrated', 'hosted',
    'served', 'handled', 'processed', 'managed in production',
];

const CLOUD_AI_SIGNALS = [
    'aws', 'azure', 'gcp', 'google cloud', 'ec2', 's3', 'lambda', 'dynamodb', 'rds',
    'kubernetes', 'eks', 'aks', 'gke', 'terraform', 'ansible', 'cloudformation',
    'tensorflow', 'pytorch', 'keras', 'scikit', 'openai', 'langchain', 'llm',
    'vector database', 'pinecone', 'weaviate', 'sagemaker', 'mlflow', 'databricks',
    'spark', 'kafka', 'flink', 'airflow', 'dbt', 'snowflake',
];

const IMPACT_METRIC_PATTERN = /(\d[\d,]*\.?\d*)\s*(million|billion|thousand|[kmb]\b|%|ms\b|sec\b|second|minute|hour|day|week|month|year|users?|requests?|rpm|rps|tps|tb\b|gb\b|mb\b|\$|usd|dollar|revenue|cost|saving|reduction|improvement|increase|decrease|faster|times|x\b)/gi;

const OWNERSHIP_SIGNALS = [
    'led', 'owned', 'architected', 'designed', 'built', 'created', 'founded',
    'established', 'pioneered', 'spearheaded', 'developed', 'implemented',
    'delivered', 'managed', 'mentored', 'coached', 'directed', 'launched',
    'drove', 'championed', 'oversaw', 'established',
];

const WEAK_STATEMENTS = [
    'responsible for', 'worked on', 'helped with', 'assisted', 'participated in',
    'contributed to', 'involved in', 'part of the team', 'team member',
    'was part of', 'member of the',
];

const ARCHITECTURE_KEYWORDS = [
    'microservices', 'distributed', 'event-driven', 'event driven', 'cqrs', 'saga',
    'domain-driven', 'ddd', 'hexagonal', 'clean architecture', 'layered architecture',
    'message queue', 'message broker', 'rabbitmq', 'sqs', 'pub/sub',
    'load balancer', 'caching layer', 'cdn', 'sharding', 'replication',
    'api gateway', 'service mesh', 'istio', 'circuit breaker', 'rate limiting',
    'eventual consistency', 'cap theorem', 'consensus', 'raft', 'paxos',
];

const SCALABILITY_KEYWORDS = [
    'scale', 'scaled', 'scaling', 'horizontal', 'vertical', 'auto-scaling',
    'high availability', 'fault tolerant', 'fault tolerance', '99.9', '99.99',
    'uptime', 'sla', 'slo', 'sli', 'latency', 'throughput', 'tps', 'rps',
    'concurrent', 'zero downtime', 'blue-green', 'canary deployment',
];

const DEVOPS_KEYWORDS = [
    'ci/cd', 'continuous integration', 'continuous deployment', 'continuous delivery',
    'pipeline', 'jenkins', 'github actions', 'gitlab ci', 'circle ci',
    'argocd', 'gitops', 'terraform', 'ansible', 'helm', 'docker', 'kubernetes',
    'monitoring', 'observability', 'prometheus', 'grafana', 'datadog',
    'elk stack', 'logstash', 'kibana', 'opentelemetry', 'on-call',
];

const OUTDATED_TECH = [
    'jquery', 'angularjs', 'backbone', 'ember.js', 'knockout',
    'struts', 'ejb', 'soap xml', 'cvs ', 'svn ', 'mercurial',
    'jsp ', 'jsf ', 'gwt ', 'dojo ', 'coldfusion',
];

// ─── Role Capability Matrix (required scores per dimension per salary tier) ──
const ROLE_CAPABILITY_MATRIX = {
    'Software Engineer': {
        junior:    { systemDesign: 30, cloudInfra: 30, scalability: 25, security: 25, testingMaturity: 40, performanceOpt: 25, collaboration: 50, codeQuality: 55 },
        mid:       { systemDesign: 55, cloudInfra: 55, scalability: 50, security: 45, testingMaturity: 60, performanceOpt: 45, collaboration: 65, codeQuality: 70 },
        senior:    { systemDesign: 78, cloudInfra: 72, scalability: 75, security: 65, testingMaturity: 75, performanceOpt: 70, collaboration: 80, codeQuality: 82 },
        staff:     { systemDesign: 88, cloudInfra: 82, scalability: 88, security: 75, testingMaturity: 82, performanceOpt: 82, collaboration: 88, codeQuality: 90 },
        principal: { systemDesign: 95, cloudInfra: 90, scalability: 95, security: 85, testingMaturity: 88, performanceOpt: 90, collaboration: 92, codeQuality: 95 },
    },
    'Senior Software Engineer': {
        mid:       { systemDesign: 65, cloudInfra: 60, scalability: 62, security: 55, testingMaturity: 68, performanceOpt: 58, collaboration: 70, codeQuality: 75 },
        senior:    { systemDesign: 82, cloudInfra: 78, scalability: 80, security: 70, testingMaturity: 80, performanceOpt: 75, collaboration: 85, codeQuality: 88 },
        staff:     { systemDesign: 90, cloudInfra: 85, scalability: 90, security: 80, testingMaturity: 85, performanceOpt: 85, collaboration: 90, codeQuality: 92 },
    },
    'Backend Engineer': {
        junior:    { systemDesign: 35, cloudInfra: 35, scalability: 30, security: 30, testingMaturity: 45, performanceOpt: 30, collaboration: 50, codeQuality: 55 },
        mid:       { systemDesign: 60, cloudInfra: 60, scalability: 60, security: 55, testingMaturity: 65, performanceOpt: 55, collaboration: 65, codeQuality: 72 },
        senior:    { systemDesign: 82, cloudInfra: 78, scalability: 82, security: 72, testingMaturity: 78, performanceOpt: 78, collaboration: 80, codeQuality: 88 },
        staff:     { systemDesign: 92, cloudInfra: 88, scalability: 92, security: 82, testingMaturity: 85, performanceOpt: 88, collaboration: 88, codeQuality: 93 },
    },
    'default': {
        junior:    { systemDesign: 30, cloudInfra: 30, scalability: 25, security: 25, testingMaturity: 40, performanceOpt: 25, collaboration: 50, codeQuality: 55 },
        mid:       { systemDesign: 55, cloudInfra: 55, scalability: 50, security: 45, testingMaturity: 60, performanceOpt: 45, collaboration: 65, codeQuality: 70 },
        senior:    { systemDesign: 78, cloudInfra: 72, scalability: 75, security: 65, testingMaturity: 75, performanceOpt: 70, collaboration: 80, codeQuality: 82 },
        staff:     { systemDesign: 88, cloudInfra: 82, scalability: 88, security: 75, testingMaturity: 82, performanceOpt: 82, collaboration: 88, codeQuality: 90 },
        principal: { systemDesign: 95, cloudInfra: 90, scalability: 95, security: 85, testingMaturity: 88, performanceOpt: 90, collaboration: 92, codeQuality: 95 },
    },
};

// ─── Geography salary multipliers ────────────────────────────────────────────
const GEO_MULTIPLIERS = {
    'san francisco': 1.35, 'san jose': 1.30, 'new york': 1.28, 'nyc': 1.28,
    'seattle': 1.22, 'boston': 1.18, 'austin': 1.10, 'chicago': 1.08,
    'denver': 1.05, 'remote': 1.0, 'los angeles': 1.20, 'la': 1.18,
    'london': 0.88, 'berlin': 0.72, 'toronto': 0.78, 'bangalore': 0.42,
    'singapore': 0.90, 'amsterdam': 0.75, 'paris': 0.74, 'sydney': 0.85,
};

// ─── Per-skill depth requirements by salary tier ─────────────────────────────
const SKILL_DEPTH_REQUIREMENTS = {
    'system design':       { junior: 20, mid: 48, senior: 72, staff: 88, principal: 95 },
    'microservices':       { junior: 15, mid: 45, senior: 70, staff: 85, principal: 92 },
    'distributed systems': { junior: 10, mid: 40, senior: 68, staff: 85, principal: 95 },
    'kubernetes':          { junior: 10, mid: 38, senior: 65, staff: 80, principal: 88 },
    'docker':              { junior: 25, mid: 55, senior: 72, staff: 80, principal: 85 },
    'aws':                 { junior: 20, mid: 50, senior: 70, staff: 82, principal: 90 },
    'sql':                 { junior: 45, mid: 65, senior: 78, staff: 82, principal: 85 },
    'testing':             { junior: 35, mid: 60, senior: 72, staff: 80, principal: 85 },
    'ci/cd':               { junior: 20, mid: 50, senior: 70, staff: 78, principal: 82 },
    'security':            { junior: 20, mid: 42, senior: 65, staff: 78, principal: 88 },
    'performance':         { junior: 15, mid: 40, senior: 68, staff: 82, principal: 92 },
    'rest api':            { junior: 40, mid: 65, senior: 78, staff: 82, principal: 85 },
    'graphql':             { junior: 15, mid: 40, senior: 60, staff: 72, principal: 80 },
    'redis':               { junior: 10, mid: 35, senior: 60, staff: 75, principal: 82 },
    'kafka':               { junior: 5,  mid: 25, senior: 55, staff: 72, principal: 85 },
    'python':              { junior: 35, mid: 60, senior: 78, staff: 85, principal: 90 },
    'typescript':          { junior: 25, mid: 55, senior: 75, staff: 82, principal: 88 },
    'react':               { junior: 35, mid: 60, senior: 75, staff: 80, principal: 85 },
    'node':                { junior: 30, mid: 58, senior: 72, staff: 80, principal: 85 },
    'architecture':        { junior: 10, mid: 35, senior: 65, staff: 85, principal: 95 },
    'terraform':           { junior: 5,  mid: 30, senior: 58, staff: 75, principal: 85 },
    'machine learning':    { junior: 10, mid: 35, senior: 62, staff: 80, principal: 92 },
    'data structures':     { junior: 50, mid: 70, senior: 82, staff: 88, principal: 92 },
    'algorithms':          { junior: 50, mid: 70, senior: 82, staff: 88, principal: 92 },
    'git':                 { junior: 55, mid: 72, senior: 80, staff: 82, principal: 85 },
};

// ─── Authenticity signal keywords ─────────────────────────────────────────────
const DEPTH_INDICATORS = [
    'designed', 'architected', 'built from scratch', 'owned', 'shipped',
    'deployed to production', 'maintained', 'optimized', 'debugged', 'refactored',
    'code review', 'merge request', 'pull request', 'unit test', 'integration test',
    'incident response', 'on-call', 'post-mortem', 'rca', 'root cause',
];
const SHALLOW_INDICATORS = [
    'familiar with', 'exposure to', 'basic knowledge', 'learning', 'beginner',
    'introductory', 'aware of', 'understanding of', 'knowledge of', 'course in',
    'certified in', 'online course', 'tutorial', 'bootcamp project', 'personal project',
];
const BRAND_SIGNAL_COMPANIES = [
    'google','amazon','meta','apple','microsoft','netflix','stripe','airbnb','uber',
    'lyft','twitter','linkedin','salesforce','oracle','ibm','intel','nvidia','openai',
    'anthropic','spacex','tesla','palantir','snowflake','databricks','hashicorp',
];
const BRAND_SIGNALS_SCHOOLS = [
    'mit','stanford','carnegie mellon','cmu','berkeley','harvard','yale','princeton',
    'caltech','oxford','cambridge','georgia tech','waterloo','toronto','columbia',
];

// ═════════════════════════════════════════════════════════════════════════════
// MAIN ENGINE CLASS
// ═════════════════════════════════════════════════════════════════════════════
class CareerIntelligenceEngine {

    /**
     * Main analysis entry point.
     * @param {string} resumeText — Raw extracted resume text
     * @param {Object} options — { targetSalary, targetRole, location, yearsOfExperience }
     * @returns {Object} Full 6-layer intelligence report
     */
    async analyze(resumeText, options = {}) {
        const {
            targetSalary      = 80000,
            targetRole        = 'Software Engineer',
            location          = 'Remote',
            yearsOfExperience = 3,
        } = options;

        const text  = resumeText.toLowerCase();
        const lines = resumeText.split(/\n/).filter(l => l.trim().length > 0);
        const wordCount = resumeText.split(/\s+/).filter(w => w.length > 1).length;

        // ── Run all 6 layers ─────────────────────────────────────────────
        const layer1 = this._analyzeMarketPositioning(resumeText, text, lines, targetRole, targetSalary, yearsOfExperience);
        const layer2 = this._analyzeSkillDepth(resumeText, text, lines, targetRole, targetSalary, layer1);
        const layer3 = this._analyzeImpactValidation(resumeText, text, lines);
        const layer4 = this._analyzeArchitectureSignals(resumeText, text, lines, targetRole);
        const layer5 = this._analyzeCompensationGap(layer1, layer2, layer3, layer4, targetSalary, yearsOfExperience);
        const layer6 = this._generateResumeReconstruction(resumeText, text, lines, layer1, layer2, layer3, layer4, targetRole, targetSalary);

        // ── New intelligence modules ─────────────────────────────────
        const salaryTier        = this._getSalaryTierKey(targetSalary);
        const capabilityMatrix  = this._computeCapabilityMatrix(text, targetRole, salaryTier);
        const skillDiagnostics  = this._computeSkillDepthDiagnostics(text, salaryTier);
        const salaryFeasibility = this._computeSalaryFeasibility(layer1, layer2, layer3, layer4, layer5, targetSalary, yearsOfExperience, location);
        const authenticityScore = this._computeAuthenticityScore(resumeText, text, layer2, layer3);
        const marketSignals     = this._computeMarketSignals(text, layer1, layer2, layer3);
        const growthTrajectory  = this._computeGrowthTrajectory(layer1, layer2, layer3, layer4, layer5, yearsOfExperience);
        const maturityRadar     = this._computeEngineeringMaturityRadar(text, layer2, layer3, layer4, capabilityMatrix);

        // ── Enterprise add-ons ───────────────────────────────────────────
        const addOns = this._computeEnterpriseAddOns(layer1, layer2, layer3, layer4, layer5, targetRole, wordCount);

        // ── Overall readiness score (weighted) ──────────────────────────
        const overallReadinessScore = Math.min(99, Math.max(5, Math.round(
            layer1.roleAlignmentScore      * 0.15 +
            layer2.coreStrengthScore       * 0.25 +
            layer3.impactScore             * 0.25 +
            layer4.architectureExposureScore * 0.15 +
            layer5.compensationReadinessScore * 0.20
        )));

        const verdict = this._computeVerdict(overallReadinessScore, layer5.gapSeverity);

        // Confidence normalized to 0–1 (fixed from 5000% bug)
        const confidenceNormalized = Math.min(1, Math.max(0, Math.round(addOns.confidenceIndex) / 100));

        return {
            // Structured core output
            readinessScore:           overallReadinessScore,
            salaryProbability:        Math.min(95, Math.max(5, Math.round(addOns.hiringProbabilityPercent))),
            gapSeverity:              layer5.gapSeverity,
            authenticityScore:        authenticityScore.totalScore,
            projectionTimelineMonths: salaryFeasibility.projectionTimelineMonths,
            skillGaps:                skillDiagnostics.gaps,
            improvementRoadmap:       this._buildImprovementRoadmap(layer2, layer3, layer4, skillDiagnostics),
            optimizedResume:          layer6.optimizedProfessionalSummary,

            // Detailed output
            overallReadinessScore,
            finalVerdict:             verdict.label,
            verdictColor:             verdict.color,
            verdictDescription:       verdict.description,
            confidenceNormalized,
            immediatePriorityActions: this._computePriorityActions(layer1, layer2, layer3, layer4, layer5),
            layers:                   { layer1, layer2, layer3, layer4, layer5, layer6 },
            addOns,
            capabilityMatrix,
            skillDiagnostics,
            salaryFeasibility,
            authenticityDetail:       authenticityScore,
            marketSignals,
            growthTrajectory,
            maturityRadar,
            meta: {
                targetSalary,
                targetRole,
                location,
                yearsOfExperience,
                salaryTier,
                resumeWordCount: wordCount,
                analyzedAt: new Date().toISOString(),
            },
        };
    }

    // ══════════════════════════════════════════════════════════════════════
    // LAYER 1 — MARKET POSITIONING
    // ══════════════════════════════════════════════════════════════════════
    _analyzeMarketPositioning(raw, text, lines, targetRole, targetSalary, yearsOfExperience) {
        // ─ Seniority detection ──────────────────────────────────────────
        let detectedLevel    = 'mid';
        let seniorityScore   = 40;

        for (const [level, keywords] of Object.entries(SENIORITY_SIGNALS)) {
            const hits = keywords.filter(kw => text.includes(kw)).length;
            if (level === 'senior' && hits >= 1)                      { seniorityScore = 80; detectedLevel = 'senior'; break; }
            if (level === 'junior' && hits >= 1 && seniorityScore < 80) { seniorityScore = 25; detectedLevel = 'junior'; }
        }

        // ─ Role alignment ─────────────────────────────────────────────
        const roleKws = ROLE_KEYWORDS_MAP[targetRole] || ROLE_KEYWORDS_MAP['Software Engineer'];
        const roleHits = roleKws.filter(kw => text.includes(kw.toLowerCase())).length;
        const roleAlignmentScore = Math.min(100, Math.round((roleHits / Math.max(1, roleKws.length)) * 140));

        // ─ Salary alignment ───────────────────────────────────────────
        const salaryBand = this._getSalaryBandForTarget(targetSalary);
        const salaryAlignmentScore = this._scoreSalaryAlignment(yearsOfExperience, detectedLevel, salaryBand);

        // ─ Keyword density ────────────────────────────────────────────
        const keywordDensity = this._computeKeywordDensity(text);
        const marketCompetitiveness = keywordDensity > 0.08 ? 'High' : keywordDensity > 0.05 ? 'Medium' : 'Low';

        // ─ Flaws ──────────────────────────────────────────────────────
        const positioningFlaws = [];
        if (roleAlignmentScore < 40)
            positioningFlaws.push(`Resume lacks keyword alignment for "${targetRole}" roles`);
        if (detectedLevel === 'junior' && targetSalary >= 115000)
            positioningFlaws.push('Resume signals junior positioning; target salary requires senior-level signals');
        if (!text.includes('engineer') && !text.includes('developer') && !text.includes('scientist'))
            positioningFlaws.push('Missing explicit technical role title — add it to summary and every job entry');
        if (keywordDensity < 0.04)
            positioningFlaws.push('Low keyword density — resume may not survive ATS keyword filters');

        // ─ Observations ───────────────────────────────────────────────
        const strategicObservations = [];
        if (roleAlignmentScore >= 70)
            strategicObservations.push(`Strong keyword alignment with "${targetRole}" job descriptions`);
        if (detectedLevel === 'senior')
            strategicObservations.push('Resume uses senior-level positioning language effectively');
        if (keywordDensity > 0.07)
            strategicObservations.push('Healthy keyword density — good for ATS and recruiter scanning');
        if (salaryAlignmentScore >= 70)
            strategicObservations.push('Experience level aligns with target compensation band');

        return {
            currentMarketLevel:    detectedLevel.charAt(0).toUpperCase() + detectedLevel.slice(1),
            roleAlignmentScore:    Math.max(10, roleAlignmentScore),
            salaryAlignmentScore,
            marketCompetitiveness,
            positioningFlaws,
            strategicObservations,
            keywordDensity:        Math.round(keywordDensity * 1000) / 1000,
        };
    }

    // ══════════════════════════════════════════════════════════════════════
    // LAYER 2 — SKILL DEPTH
    // ══════════════════════════════════════════════════════════════════════
    _analyzeSkillDepth(raw, text, lines, targetRole, targetSalary, layer1) {
        // ─ Core skills ────────────────────────────────────────────────
        const coreSkills     = this._getCoreSkillsForRole(targetRole);
        const detectedCoreSkills = coreSkills.filter(s => text.includes(s.toLowerCase()));
        const coreRatio      = detectedCoreSkills.length / Math.max(1, coreSkills.length);
        const coreStrengthRaw = Math.round(coreRatio * 100);

        // ─ Production evidence ────────────────────────────────────────
        const productionHits  = PRODUCTION_EVIDENCE.filter(pe => text.includes(pe));
        const productionScore = Math.min(100, productionHits.length * 10);

        // ─ Cloud/AI signals ───────────────────────────────────────────
        const cloudAIHits = CLOUD_AI_SIGNALS.filter(s => text.includes(s.toLowerCase()));
        const cloudScore  = Math.min(100, cloudAIHits.length * 7);

        // ─ Breadth analysis ───────────────────────────────────────────
        const techCategories = [
            'javascript','typescript','python','java','go ','rust','c++','c#','ruby','kotlin','swift',
            'react','angular','vue','node','express','django','flask','spring','fastapi','rails',
            'sql','mongodb','postgresql','mysql','cassandra','redis','elasticsearch','dynamodb',
            'docker','kubernetes','terraform','aws','azure','gcp',
            'kafka','rabbitmq','spark','airflow','dbt','snowflake',
        ];
        const detectedCategories = techCategories.filter(t => text.includes(t));
        const breadth = detectedCategories.length;
        const depthVsBreadthAnalysis =
            breadth > 15 ? 'Broad generalist — consider highlighting a deep specialization' :
            breadth > 8  ? 'Well-balanced breadth and depth' :
                           'Deep specialist — niche expertise is a competitive advantage';

        // ─ Missing critical skills for salary ─────────────────────────
        const criticalForSalary = this._getCriticalSkillsForSalaryBand(targetSalary);
        const missingCriticalSkillsForTargetSalary = criticalForSalary
            .filter(s => !text.includes(s.toLowerCase()))
            .slice(0, 6);

        // ─ Outdated tech ───────────────────────────────────────────────
        const outdatedOrWeakSkills = OUTDATED_TECH.filter(s => text.includes(s.toLowerCase()));

        // ─ Stack maturity ─────────────────────────────────────────────
        const stackMaturityScore = Math.min(100, Math.round(
            coreStrengthRaw * 0.40 + productionScore * 0.35 + cloudScore * 0.25
        ));
        const stackMaturityLevel =
            stackMaturityScore > 70 ? 'Production-Grade' :
            stackMaturityScore > 50 ? 'Intermediate' : 'Foundational';

        const coreStrengthScore = Math.max(15, Math.round(
            coreStrengthRaw * 0.50 + productionScore * 0.30 + cloudScore * 0.20
        ));

        return {
            coreStrengthScore,
            depthVsBreadthAnalysis,
            productionEvidenceScore: productionScore,
            cloudAndAIScore:         cloudScore,
            detectedCoreSkills,
            detectedTechCount:       breadth,
            missingCriticalSkillsForTargetSalary,
            outdatedOrWeakSkills,
            stackMaturityLevel,
            stackMaturityScore,
            cloudAIToolsDetected:    cloudAIHits.slice(0, 8),
        };
    }

    // ══════════════════════════════════════════════════════════════════════
    // LAYER 3 — IMPACT VALIDATION
    // ══════════════════════════════════════════════════════════════════════
    _analyzeImpactValidation(raw, text, lines) {
        // ─ Quantified metrics ─────────────────────────────────────────
        const metricMatches = Array.from(raw.matchAll(IMPACT_METRIC_PATTERN));
        const quantifiedAchievementCount = metricMatches.length;
        const topMetricsDetected = metricMatches.slice(0, 5).map(m => m[0].trim());

        // ─ Leadership signals ─────────────────────────────────────────
        const leadershipHits = OWNERSHIP_SIGNALS.filter(ow => text.includes(ow.toLowerCase()));
        const leadershipSignalStrength = Math.min(100, leadershipHits.length * 7);

        // ─ Weak statement detection ───────────────────────────────────
        const weakLines = lines.filter(line => {
            const lLine = line.toLowerCase();
            return WEAK_STATEMENTS.some(ws => lLine.includes(ws));
        });
        const weakAchievementStatements = weakLines.slice(0, 5).map(l => l.trim().substring(0, 130));

        // ─ Scale references ───────────────────────────────────────────
        const scaleTerms = ['million', 'billion', 'thousand', 'tb', 'petabyte', 'pb', 'exabyte'];
        const scaleReferences = scaleTerms.filter(s => text.includes(s));

        // ─ Impact score ───────────────────────────────────────────────
        const quantificationScore = Math.min(100, quantifiedAchievementCount * 9);
        const weakPenalty          = Math.max(0, 15 - weakLines.length * 4);
        const impactScore = Math.max(10, Math.round(
            quantificationScore        * 0.50 +
            leadershipSignalStrength   * 0.35 +
            weakPenalty
        ));

        // ─ Improvement guidelines ─────────────────────────────────────
        const improvementGuidelines = [];
        if (quantifiedAchievementCount < 3)
            improvementGuidelines.push('Add number-driven metrics: "reduced latency by 40%", "served 5M daily users"');
        if (leadershipHits.length < 3)
            improvementGuidelines.push('Use ownership language: "architected", "led", "owned", "delivered", "spearheaded"');
        if (weakLines.length > 2)
            improvementGuidelines.push(`Replace passive phrases ("responsible for", "worked on") with action verbs`);
        if (quantifiedAchievementCount < 5)
            improvementGuidelines.push('Target 5–7 quantified achievements across your experience section');
        if (scaleReferences.length === 0 && quantifiedAchievementCount < 3)
            improvementGuidelines.push('Add scale context: user counts, request rates, data volumes, revenue impact');

        return {
            impactScore,
            quantifiedAchievementCount,
            leadershipSignalStrength,
            leadershipTokensFound:  leadershipHits,
            scaleReferences,
            weakAchievementStatements,
            improvementGuidelines,
            topMetricsDetected,
        };
    }

    // ══════════════════════════════════════════════════════════════════════
    // LAYER 4 — ARCHITECTURE SIGNALS
    // ══════════════════════════════════════════════════════════════════════
    _analyzeArchitectureSignals(raw, text, lines, targetRole) {
        const archHits        = ARCHITECTURE_KEYWORDS.filter(k => text.includes(k.toLowerCase()));
        const scalabilityHits = SCALABILITY_KEYWORDS.filter(k => text.includes(k.toLowerCase()));
        const devopsHits      = DEVOPS_KEYWORDS.filter(k => text.includes(k.toLowerCase()));

        const architectureExposureScore = Math.min(100, Math.round(
            archHits.length        * 7  +
            scalabilityHits.length * 5  +
            devopsHits.length      * 4
        ));

        const systemDesignMaturity =
            architectureExposureScore > 65 ? 'Advanced Systems Thinker' :
            architectureExposureScore > 40 ? 'Intermediate Systems Knowledge' :
            architectureExposureScore > 20 ? 'Surface-Level Systems Exposure' :
                                             'No Architecture Evidence Detected';

        // Missing high-value architecture signals
        const highValueSignals = [
            'microservices', 'distributed', 'event-driven', 'caching',
            'load balancer', 'message queue', 'system design', 'api gateway',
            'horizontal scaling', 'circuit breaker',
        ];
        const missingArchitectureSignals = highValueSignals
            .filter(s => !text.includes(s.toLowerCase()))
            .slice(0, 5);

        const scalabilityReadiness =
            scalabilityHits.length > 4 ? 'Scale-Ready' :
            scalabilityHits.length > 1 ? 'Scale-Aware' : 'Not Demonstrated';

        const devopsScore = Math.min(100, devopsHits.length * 9);

        return {
            architectureExposureScore: Math.max(5, architectureExposureScore),
            systemDesignMaturity,
            missingArchitectureSignals,
            scalabilityReadiness,
            devopsScore,
            architectureKeywordsFound: archHits.slice(0, 8),
            scalabilityKeywordsFound:  scalabilityHits.slice(0, 6),
            devopsKeywordsFound:        devopsHits.slice(0, 6),
        };
    }

    // ══════════════════════════════════════════════════════════════════════
    // LAYER 5 — COMPENSATION GAP MODELING
    // ══════════════════════════════════════════════════════════════════════
    _analyzeCompensationGap(layer1, layer2, layer3, layer4, targetSalary, yearsOfExperience) {
        const salaryBand  = this._getSalaryBandForTarget(targetSalary);
        const tierLabel   = salaryBand.label;

        // Composite compensation readiness (weighted average of other 4 layers)
        const compensationReadinessScore = Math.min(99, Math.max(10, Math.round(
            layer1.salaryAlignmentScore         * 0.20 +
            layer2.coreStrengthScore             * 0.30 +
            layer3.impactScore                   * 0.30 +
            layer4.architectureExposureScore     * 0.20
        )));

        // Estimated current market value
        const estimatedCurrentMarketValue = this._estimateCurrentMarketValue(
            compensationReadinessScore, yearsOfExperience
        );

        const compensationGapAmount = Math.max(0, targetSalary - estimatedCurrentMarketValue);

        const gapSeverity =
            compensationReadinessScore >= 75 ? 'Minimal' :
            compensationReadinessScore >= 55 ? 'Moderate' :
            compensationReadinessScore >= 35 ? 'Significant' : 'Critical';

        // Blocking factors
        const blockingFactors = [];
        if (layer2.missingCriticalSkillsForTargetSalary.length > 0)
            blockingFactors.push(`Missing critical skills: ${layer2.missingCriticalSkillsForTargetSalary.slice(0, 3).join(', ')}`);
        if (layer3.quantifiedAchievementCount < 3)
            blockingFactors.push('Insufficient quantified impact — senior compensation requires demonstrated ROI');
        if (layer4.architectureExposureScore < 30 && targetSalary >= 120000)
            blockingFactors.push('System design experience not visible — required for $120k+ roles');
        if (layer1.currentMarketLevel === 'Junior' && targetSalary >= 115000)
            blockingFactors.push('Resume positions at junior level; target band requires senior signals');

        const estimatedTimeToBridgeGap =
            gapSeverity === 'Minimal'     ? '0–3 months'  :
            gapSeverity === 'Moderate'    ? '3–6 months'  :
            gapSeverity === 'Significant' ? '6–12 months' : '12–24 months';

        return {
            targetSalary,
            salaryTierRequiredLevel:       tierLabel,
            estimatedCurrentMarketValue,
            compensationGapAmount,
            gapSeverity,
            compensationReadinessScore,
            blockingFactors,
            estimatedTimeToBridgeGap,
        };
    }

    // ══════════════════════════════════════════════════════════════════════
    // LAYER 6 — RESUME RECONSTRUCTION
    // ══════════════════════════════════════════════════════════════════════
    _generateResumeReconstruction(raw, text, lines, layer1, layer2, layer3, layer4, targetRole, targetSalary) {
        const detectedYears   = this._extractYears(text);
        const topSkills       = layer2.detectedCoreSkills.slice(0, 4).join(', ') || 'software engineering';
        const marketLevel     = layer1.currentMarketLevel;
        const targetBandLabel = this._getSalaryBandForTarget(targetSalary).label;

        // ─ Optimized professional summary ─────────────────────────────
        const optimizedProfessionalSummary =
            `Results-driven ${marketLevel} ${targetRole} with ${detectedYears}+ years of production experience ` +
            `delivering scalable systems in ${topSkills}. Demonstrated track record of measurable business impact, ` +
            `cross-functional collaboration, and engineering excellence in fast-paced environments. ` +
            `Actively targeting ${targetBandLabel} roles at high-growth, mission-driven organizations.`;

        // ─ Optimized skills section ───────────────────────────────────
        const optimizedSkillsSection = this._buildOptimizedSkillsSection(text, layer2);

        // ─ Rewritten bullets ──────────────────────────────────────────
        const optimizedProjectBullets = this._rewriteBullets(lines, layer3);

        // ─ Strategic achievements to add ──────────────────────────────
        const addedStrategicAchievements = this._generateStrategicAchievements(layer2, layer3, layer4, targetSalary);

        // ─ Positioning upgrade notes ──────────────────────────────────
        const positioningUpgradeNotes = [];
        if (layer1.roleAlignmentScore < 60)
            positioningUpgradeNotes.push(`Add "${targetRole}" as the explicit title in your summary, LinkedIn, and every job entry header`);
        if (layer3.quantifiedAchievementCount < 4)
            positioningUpgradeNotes.push('Quantify 5+ achievements with real business-impact metrics');
        if (layer4.architectureExposureScore < 40)
            positioningUpgradeNotes.push('Add a "System Design" or "Architecture" section showcasing scale decisions and trade-offs');
        if (layer2.outdatedOrWeakSkills.length > 0)
            positioningUpgradeNotes.push(`Remove outdated technologies (${layer2.outdatedOrWeakSkills.join(', ')}) from skills section`);
        if (layer2.missingCriticalSkillsForTargetSalary.length > 0)
            positioningUpgradeNotes.push(`Acquire and showcase: ${layer2.missingCriticalSkillsForTargetSalary.slice(0, 3).join(', ')}`);

        return {
            optimizedProfessionalSummary,
            optimizedSkillsSection,
            optimizedProjectBullets,
            addedStrategicAchievements,
            positioningUpgradeNotes,
        };
    }

    // ══════════════════════════════════════════════════════════════════════
    // ENTERPRISE ADD-ONS
    // ══════════════════════════════════════════════════════════════════════
    _computeEnterpriseAddOns(layer1, layer2, layer3, layer4, layer5, targetRole, wordCount) {
        // ─ Hiring Probability % ───────────────────────────────────────
        const hiringProbabilityPercent = Math.min(95, Math.max(5, Math.round(
            layer5.compensationReadinessScore * 0.40 +
            layer3.impactScore               * 0.25 +
            layer1.roleAlignmentScore        * 0.20 +
            layer4.architectureExposureScore * 0.15
        ) * 0.95));

        // ─ ATS Optimization Score ─────────────────────────────────────
        const coreSkills   = this._getCoreSkillsForRole(targetRole);
        const atsHits      = layer2.detectedCoreSkills.length;
        const atsOptimizationScore = Math.min(100, Math.round((atsHits / Math.max(1, coreSkills.length)) * 100));

        // ─ Recruiter Attention Score ──────────────────────────────────
        const hasMetrics     = layer3.quantifiedAchievementCount >= 3;
        const hasArchitecture = layer4.architectureExposureScore >= 40;
        const hasProduction  = layer2.productionEvidenceScore >= 40;
        const hasRightLength = wordCount > 300 && wordCount < 900;
        const recruiterAttentionScore = Math.min(100, Math.round(
            (hasMetrics      ? 35 : 12) +
            (hasArchitecture ? 28 : 10) +
            (hasProduction   ? 25 : 10) +
            (hasRightLength  ? 12 : 5)
        ));

        // ─ Confidence Index (data quality / evidence density) ─────────
        const confidenceIndex = Math.min(100, Math.round(
            Math.min(30, layer3.quantifiedAchievementCount * 6) +
            Math.min(30, layer2.detectedCoreSkills.length  * 4) +
            Math.min(25, (wordCount / 250) * 25)           +
            Math.min(15, (layer4.architectureKeywordsFound?.length || 0) * 4)
        ));

        return {
            hiringProbabilityPercent,
            atsOptimizationScore,
            recruiterAttentionScore,
            confidenceIndex,
        };
    }

    // ══════════════════════════════════════════════════════════════════════
    // VERDICT + PRIORITY ACTIONS
    // ══════════════════════════════════════════════════════════════════════
    _computeVerdict(score, gapSeverity) {
        if (score >= 75 && gapSeverity === 'Minimal')
            return { label: 'OFFER READY',        color: '#00d68f',
                description: 'Profile is competitive for target compensation. Focus on interview prep and networking.' };
        if (score >= 62)
            return { label: 'STRONG CANDIDATE',   color: '#4facfe',
                description: '1–2 targeted improvements away from target salary tier. Solid foundation — refine and execute.' };
        if (score >= 47)
            return { label: 'DEVELOPING',          color: '#f7971e',
                description: 'Good foundation with significant gaps. 3–6 months of focused upskilling required.' };
        if (score >= 30)
            return { label: 'NEEDS REPOSITIONING', color: '#ff6b6b',
                description: 'Resume doesn\'t match target salary tier. Immediate strategic restructuring recommended.' };
        return { label: 'CRITICAL GAPS',           color: '#ff4757',
            description: 'Major misalignment between current profile and compensation target. 12+ months of deliberate upskilling needed.' };
    }

    _computePriorityActions(layer1, layer2, layer3, layer4, layer5) {
        const actions = [];
        if (layer3.quantifiedAchievementCount < 4)
            actions.push({ priority: 'CRITICAL', action: 'Add 5+ quantified achievements with business-impact metrics to bullets', impact: 'Increases hiring probability by ~40%' });
        if (layer5.blockingFactors.length > 0)
            actions.push({ priority: 'CRITICAL', action: layer5.blockingFactors[0], impact: 'Required to unlock target salary tier' });
        if (layer4.architectureExposureScore < 40)
            actions.push({ priority: 'HIGH', action: 'Add system design and architecture evidence to resume (microservices, distributed systems)', impact: 'Required for $115k+ roles' });
        if (layer2.missingCriticalSkillsForTargetSalary.length > 0)
            actions.push({ priority: 'HIGH', action: `Acquire and showcase: ${layer2.missingCriticalSkillsForTargetSalary.slice(0, 3).join(', ')}`, impact: 'Closes critical skill gap for target salary' });
        if (layer1.roleAlignmentScore < 50)
            actions.push({ priority: 'MEDIUM', action: `Optimize keyword alignment — add role-specific terms for "${layer5.salaryTierRequiredLevel}" compensation tier`, impact: 'Improves ATS pass rate and recruiter callbacks' });
        return actions.slice(0, 5);
    }

    // ══════════════════════════════════════════════════════════════════════
    // UTILITY HELPERS
    // ══════════════════════════════════════════════════════════════════════
    _getSalaryBandForTarget(salary) {
        if (salary >= 210000) return SALARY_BANDS.principal;
        if (salary >= 155000) return SALARY_BANDS.staff;
        if (salary >= 115000) return SALARY_BANDS.senior;
        if (salary >= 80000)  return SALARY_BANDS.mid;
        return SALARY_BANDS.junior;
    }

    _scoreSalaryAlignment(yearsOfExperience, detectedLevel, salaryBand) {
        const [minYoe, maxYoe] = salaryBand.yoeRange;
        if (yearsOfExperience >= minYoe && yearsOfExperience <= maxYoe) return 80;
        if (yearsOfExperience < minYoe) return Math.max(20, 80 - (minYoe - yearsOfExperience) * 15);
        return Math.max(35, 80 - (yearsOfExperience - maxYoe) * 5);
    }

    _computeKeywordDensity(text) {
        const hits = (text.match(/\b(javascript|typescript|python|java|react|node|docker|kubernetes|aws|azure|api|sql|git|linux|ci\/cd|go|rust|redis|kafka|terraform|pytorch|tensorflow)\b/gi) || []).length;
        const totalWords = text.split(/\s+/).filter(w => w.length > 1).length;
        return totalWords > 0 ? hits / totalWords : 0;
    }

    _getCoreSkillsForRole(targetRole) {
        const r = targetRole.toLowerCase();
        if (r.includes('frontend') || r.includes('front-end'))  return ROLE_CORE_SKILLS.frontend;
        if (r.includes('backend')  || r.includes('back-end'))   return ROLE_CORE_SKILLS.backend;
        if (r.includes('full-stack') || r.includes('fullstack') || r.includes('full stack')) return ROLE_CORE_SKILLS.fullstack;
        if (r.includes('data engineer'))  return ROLE_CORE_SKILLS.dataengineer;
        if (r.includes('data scientist')) return ROLE_CORE_SKILLS.datascientist;
        if (r.includes('ml engineer') || r.includes('machine learning engineer')) return ROLE_CORE_SKILLS.mlengineeer;
        if (r.includes('devops') || r.includes('sre'))   return ROLE_CORE_SKILLS.devops;
        if (r.includes('cloud'))                          return ROLE_CORE_SKILLS.cloud;
        if (r.includes('mobile'))                         return ROLE_CORE_SKILLS.mobile;
        return ROLE_CORE_SKILLS.default;
    }

    _getCriticalSkillsForSalaryBand(salary) {
        if (salary >= 155000) return ['system design', 'distributed systems', 'kubernetes', 'microservices', 'aws', 'architecture', 'performance optimization'];
        if (salary >= 115000) return ['docker', 'kubernetes', 'rest api', 'sql', 'system design', 'aws', 'ci/cd', 'testing'];
        if (salary >= 80000)  return ['docker', 'rest api', 'sql', 'git', 'testing', 'aws', 'linux'];
        return ['rest api', 'sql', 'git', 'testing', 'javascript'];
    }

    _estimateCurrentMarketValue(readinessScore, yearsOfExperience) {
        const base          = 52000;
        const yoeBonus      = Math.min(yearsOfExperience * 5800, 58000);
        const readinessBonus = Math.round((readinessScore / 100) * 85000);
        return base + yoeBonus + readinessBonus;
    }

    _extractYears(text) {
        const m = text.match(/(\d{1,2})\+?\s*years? of/i) || text.match(/(\d{1,2})\+?\s*years? experience/i);
        return m ? parseInt(m[1]) : 3;
    }

    _buildOptimizedSkillsSection(text, layer2) {
        const categories = {
            Languages:       ['python','javascript','typescript','java','go','rust','c++','c#','ruby','kotlin','swift','scala','r'],
            Frameworks:      ['react','vue','angular','nextjs','node','express','django','flask','fastapi','spring','rails','nuxt','nestjs'],
            Databases:       ['postgresql','mysql','mongodb','redis','cassandra','elasticsearch','dynamodb','snowflake','sqlite','oracle','bigquery'],
            'Cloud & DevOps':['aws','azure','gcp','docker','kubernetes','terraform','ansible','ci/cd','jenkins','github actions','argocd','helm'],
            Architecture:    layer2.architectureKeywordsFound || [],
        };
        return Object.entries(categories)
            .map(([cat, skills]) => ({
                category: cat,
                skills: skills.filter(s => text.includes(s.toLowerCase())).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
            }))
            .filter(c => c.skills.length > 0);
    }

    _rewriteBullets(lines, layer3) {
        const bulletLines = lines.filter(l => {
            const t = l.trim();
            return (t.startsWith('•') || t.startsWith('-') || t.startsWith('*') || /^\d+\./.test(t)) && t.length > 25;
        }).slice(0, 6);

        return bulletLines.map(bullet => {
            const clean    = bullet.replace(/^[•\-\*\d+\.]\s*/, '').trim();
            const isWeak   = WEAK_STATEMENTS.some(ws => clean.toLowerCase().includes(ws));
            const improved = isWeak
                ? clean
                    .replace(/responsible for/gi,  'Owned and delivered')
                    .replace(/worked on/gi,          'Engineered')
                    .replace(/helped with/gi,        'Drove adoption of')
                    .replace(/assisted/gi,           'Collaborated to implement')
                    .replace(/participated in/gi,    'Led contributions to')
                    .replace(/contributed to/gi,     'Delivered key components of')
                  + ' → [Add metric: "resulting in X% improvement / saving $Y / serving Z users"]'
                : clean;
            return { original: clean, improved, strengthened: isWeak };
        });
    }

    _generateStrategicAchievements(layer2, layer3, layer4, targetSalary) {
        const achievements = [];
        if (layer2.cloudAndAIScore < 50 && targetSalary >= 100000)
            achievements.push('"Deployed containerized microservices to AWS EKS, reducing infrastructure cost by 30% while achieving 99.9% uptime"');
        if (layer3.quantifiedAchievementCount < 4) {
            achievements.push('"Improved API P99 response time by 45% via Redis caching layer, supporting 200K+ daily active users"');
            achievements.push('"Led migration from monolithic architecture to microservices, cutting deployment cycle from 2 weeks to 4 hours"');
        }
        if (layer4.architectureExposureScore < 40)
            achievements.push('"Designed event-driven order processing system handling 500K+ daily events with <100ms P99 latency using Kafka + Go"');
        if (layer3.leadershipSignalStrength < 40)
            achievements.push('"Mentored 3 junior engineers in system design and code quality practices, reducing bug rate by 25% over 6 months"');
        return achievements;
    }

    // ══════════════════════════════════════════════════════════════════════
    // NEW — UTILITY METHODS
    // ══════════════════════════════════════════════════════════════════════
    _getSalaryTierKey(salary) {
        if (salary >= 210000) return 'principal';
        if (salary >= 155000) return 'staff';
        if (salary >= 115000) return 'senior';
        if (salary >= 80000)  return 'mid';
        return 'junior';
    }

    _getGeoMultiplier(location) {
        const loc = (location || '').toLowerCase();
        for (const [city, mult] of Object.entries(GEO_MULTIPLIERS)) {
            if (loc.includes(city)) return mult;
        }
        return 1.0;
    }

    // ══════════════════════════════════════════════════════════════════════
    // NEW MODULE 1 — CAPABILITY MATRIX COMPARISON
    // ══════════════════════════════════════════════════════════════════════
    _computeCapabilityMatrix(text, targetRole, salaryTier) {
        const roleMatrix = ROLE_CAPABILITY_MATRIX[targetRole] || ROLE_CAPABILITY_MATRIX['default'];
        const required   = roleMatrix[salaryTier] || roleMatrix['mid'];

        const INFERRED = {
            systemDesign:    this._inferScore(text, ['system design','microservices','distributed','api gateway','load balancer','architecture'], 10),
            cloudInfra:      this._inferScore(text, ['aws','gcp','azure','kubernetes','terraform','ec2','s3','lambda','docker'], 10),
            scalability:     this._inferScore(text, ['scale','high availability','fault tolerant','horizontal','throughput','tps','rps','99.9'], 12),
            security:        this._inferScore(text, ['oauth','jwt','https','encryption','iam','owasp','xss','csrf','authentication','zero trust'], 10),
            testingMaturity: this._inferScore(text, ['unit test','integration test','e2e','jest','pytest','tdd','bdd','coverage','ci/cd','github actions'], 10),
            performanceOpt:  this._inferScore(text, ['redis','caching','indexed','query optimiz','profiling','p99','latency','memory','cpu','gc'], 10),
            collaboration:   this._inferScore(text, ['code review','pull request','pair programming','mentored','team','agile','sprint','jira','confluence'], 10),
            codeQuality:     this._inferScore(text, ['typescript','lint','sonarqube','code review','refactor','clean code','solid','design pattern','dry','test coverage'], 10),
        };

        const dimensions = Object.keys(required);
        const gaps = dimensions.map(dim => {
            const req = required[dim];
            const cur = INFERRED[dim];
            const delta = req - cur;
            const sev = delta > 35 ? 'blocking' : delta > 18 ? 'limiting' : delta > 0 ? 'optimization' : 'competitive';
            return { dimension: dim, required: req, current: cur, delta: Math.max(0, delta), severity: sev };
        });

        const avgCurrent  = Math.round(gaps.reduce((s, g) => s + g.current, 0) / gaps.length);
        const avgRequired = Math.round(gaps.reduce((s, g) => s + g.required, 0) / gaps.length);

        return {
            salaryTier,
            targetRole,
            required,
            inferred: INFERRED,
            gaps,
            overallCapabilityScore: avgCurrent,
            requiredCapabilityScore: avgRequired,
            capabilityGapPercent: Math.max(0, avgRequired - avgCurrent),
            blockingGaps:    gaps.filter(g => g.severity === 'blocking').map(g => g.dimension),
            limitingGaps:    gaps.filter(g => g.severity === 'limiting').map(g => g.dimension),
            competitiveEdge: gaps.filter(g => g.severity === 'competitive').map(g => g.dimension),
        };
    }

    _inferScore(text, keywords, multiplier = 10) {
        const hits = keywords.filter(kw => text.includes(kw.toLowerCase())).length;
        return Math.min(95, Math.round(hits * multiplier));
    }

    // ══════════════════════════════════════════════════════════════════════
    // NEW MODULE 2 — SKILL DEPTH DIAGNOSTICS
    // ══════════════════════════════════════════════════════════════════════
    _computeSkillDepthDiagnostics(text, salaryTier) {
        const gaps = [];
        for (const [skill, tiers] of Object.entries(SKILL_DEPTH_REQUIREMENTS)) {
            const required = tiers[salaryTier];
            if (required === undefined) continue;

            const present = text.includes(skill.toLowerCase());
            const current = present ? this._estimateSkillDepth(text, skill) : 0;
            const delta   = Math.max(0, required - current);

            if (delta > 0) {
                const severity = delta > 35 ? 'Critical' : delta > 20 ? 'High' : delta > 10 ? 'Medium' : 'Low';
                gaps.push({
                    skill,
                    required,
                    current,
                    delta,
                    severity,
                    learningPath:    this._getLearningPath(skill, delta),
                    projectRec:      this._getProjectRec(skill),
                    proofBuilding:   this._getProofBuilding(skill, severity),
                    industryExpect:  this._getIndustryExpect(skill, salaryTier),
                });
            }
        }

        gaps.sort((a, b) => b.delta - a.delta);

        return {
            gaps: gaps.slice(0, 12),
            criticalCount: gaps.filter(g => g.severity === 'Critical').length,
            highCount:     gaps.filter(g => g.severity === 'High').length,
            mediumCount:   gaps.filter(g => g.severity === 'Medium').length,
            totalGapScore: Math.round(gaps.reduce((s, g) => s + g.delta, 0) / Math.max(1, gaps.length)),
        };
    }

    _estimateSkillDepth(text, skill) {
        const kw = skill.toLowerCase();
        const mentions = (text.match(new RegExp(kw, 'gi')) || []).length;
        const depthWords = ['designed', 'architected', 'built', 'led', 'optimized', 'deployed', 'maintained', 'owned'];
        const nearDepth = depthWords.filter(d => {
            const idx = text.indexOf(kw);
            return idx > -1 && text.substring(Math.max(0, idx - 80), idx + 80).includes(d);
        }).length;
        return Math.min(90, Math.round(mentions * 15 + nearDepth * 14));
    }

    _getLearningPath(skill, delta) {
        const paths = {
            'system design':       'Study distributed systems fundamentals → Practice LLD on LeetCode Discuss → Do 10 mock system design interviews',
            'microservices':       'Build a 3-service app with Docker Compose → Add service mesh → Deploy to k8s with Helm chart',
            'kubernetes':          'Complete CKA exercises on killer.sh → Deploy a production-like app with HPA + Ingress → Implement GitOps with ArgoCD',
            'docker':              'Containerize 3 personal projects → Add multi-stage builds + health checks → Push to registry + deploy',
            'aws':                 'Pass AWS SAA-C03 → Build a 3-tier app on AWS using EC2/RDS/S3 → Add CloudFront/Route53',
            'distributed systems': 'Read "Designing Data-Intensive Applications" → Implement consistent hashing → Study CAP theorem with examples',
            'security':            'Complete OWASP Top 10 course → Implement JWT auth from scratch → Add rate limiting + CORS + helmet to an app',
            'testing':             'Add 80%+ coverage to a project → Implement contract testing → Set up mutation testing with Stryker',
            'ci/cd':               'Build GitHub Actions pipeline with test + deploy → Add blue-green deployment → Implement rollback automation',
            'performance':         'Profile a slow endpoint with clinic.js/py-spy → Add Redis caching layer → Benchmark before/after',
            'kafka':               'Run single-node Kafka locally → Build producer/consumer → Implement consumer groups with offset management',
            'redis':               'Implement Redis cache aside pattern → Add pub/sub → Implement distributed lock with Redlock',
        };
        return paths[skill] || `Study core ${skill} concepts → Build 2 projects demonstrating depth → Document architecture decisions`;
    }

    _getProjectRec(skill) {
        const recs = {
            'system design':       'Design a URL shortener or rate limiter end-to-end — document trade-offs, capacity estimates, data flow',
            'kubernetes':          'Deploy a multi-service app to k8s with HPA, PodDisruptionBudget, NetworkPolicy, and Ingress — for a public GitHub repo',
            'aws':                 'Build a serverless data pipeline: S3 → Lambda → DynamoDB → API Gateway — measure cold start + cost',
            'distributed systems': 'Implement a distributed key-value store with consistent hashing and replication — blog about choices',
            'kafka':               'Build real-time analytics pipeline: REST → Kafka → Stream processor → PostgreSQL → Grafana dashboard',
            'security':            'Build an auth service with PKCE OAuth 2.0, refresh token rotation, and RBAC — publish as OSS',
            'microservices':       'Decompose a monolith into 3+ services with an API gateway, service discovery, and circuit breaker pattern',
            'testing':             'Add full test pyramid (unit/integration/e2e) to an existing project, target 85%+ coverage with zero flaky tests',
        };
        return recs[skill] || `Build a public GitHub project that demonstrates production-grade ${skill} — quantify scale and outcomes`;
    }

    _getProofBuilding(skill, severity) {
        if (severity === 'Critical') return `Add "${skill}" with context to resume bullets — include specific numbers (scale, latency, availability). Link to GitHub project. Write a blog post or dev.to article about your implementation.`;
        if (severity === 'High')     return `Add at least 2 resume bullets mentioning "${skill}" with measurable outcomes. Commit code to public GitHub repo.`;
        return `Mention "${skill}" in technical skills section and in at least 1 experience bullet with context.`;
    }

    _getIndustryExpect(skill, tier) {
        const expectMap = {
            'system design': {
                junior: 'Basic awareness of client-server model',
                mid: 'Can design simple 3-tier systems, knows common patterns',
                senior: 'Designs distributed systems for 10k–1M users, handles trade-offs',
                staff: 'Architects org-wide systems, reviews others\' designs',
                principal: 'Defines architectural standards, mentors principal engineers',
            },
        };
        return (expectMap[skill] && expectMap[skill][tier]) || `${tier.charAt(0).toUpperCase() + tier.slice(1)}-level proficiency with production evidence`;
    }

    // ══════════════════════════════════════════════════════════════════════
    // NEW MODULE 3 — SALARY FEASIBILITY PROJECTION
    // ══════════════════════════════════════════════════════════════════════
    _computeSalaryFeasibility(layer1, layer2, layer3, layer4, layer5, targetSalary, yearsOfExperience, location) {
        const geoMult = this._getGeoMultiplier(location);
        const adjustedTarget = Math.round(targetSalary / geoMult);

        const currentValue = layer5.estimatedCurrentMarketValue;
        const rawGap = adjustedTarget - currentValue;
        const gapPercent = Math.round((rawGap / Math.max(1, adjustedTarget)) * 100);

        const isRealistic = layer5.gapSeverity === 'Minimal' || layer5.gapSeverity === 'Moderate';
        const timeline    = layer5.estimatedTimeToBridgeGap;

        // Months estimation
        const projectionTimelineMonths =
            layer5.gapSeverity === 'Minimal'     ? 3  :
            layer5.gapSeverity === 'Moderate'    ? 8  :
            layer5.gapSeverity === 'Significant' ? 15 : 24;

        // Required skill deltas for realistic path
        const requiredSkillDeltas = layer2.missingCriticalSkillsForTargetSalary.map(skill => ({
            skill,
            action: this._getLearningPath(skill, 30),
            estimatedWeeks: this._estimateWeeks(skill),
        }));

        // Reachable salary at current trajectory (12 months)
        const twelveMoReachable = Math.round(Math.min(
            targetSalary,
            currentValue + (rawGap * 0.35)
        ) / 5000) * 5000;

        // Role progression path (if unrealistic)
        const progressionPath = !isRealistic ? [
            { step: 1, role: `${layer1.currentMarketLevel} ${layer1.currentMarketLevel === 'Junior' ? 'Developer' : 'Engineer'}`,      salary: `$${Math.round(currentValue / 1000)}k`,         timeline: 'Now'         },
            { step: 2, role: 'Mid-Level',   salary: `$${Math.round(twelveMoReachable / 1000)}k`, timeline: '6–12 months' },
            { step: 3, role: 'Senior',      salary: `$${Math.round(Math.min(targetSalary, twelveMoReachable * 1.35) / 1000)}k`, timeline: '18–30 months' },
        ] : [];

        // Realistic adjustment recommendation
        const realisticAdjusted = Math.round(twelveMoReachable / 5000) * 5000;
        const adjustedRecommendation = !isRealistic
            ? `Recommended near-term target: $${Math.round(realisticAdjusted / 1000)}k (achievable within 6–12 months with structured upskilling)`
            : null;

        return {
            targetSalary,
            geoAdjustedTarget: adjustedTarget,
            currentEstimatedValue: currentValue,
            gapAmount: Math.max(0, rawGap),
            gapPercent: Math.max(0, gapPercent),
            isRealistic,
            timeline,
            projectionTimelineMonths,
            requiredSkillDeltas: requiredSkillDeltas.slice(0, 5),
            twelveMoReachable,
            progressionPath,
            adjustedRecommendation,
            geoMultiplier: geoMult,
            geoNote: geoMult !== 1.0 ? `Location multiplier: ${geoMult}x applied to ${location}` : null,
        };
    }

    _estimateWeeks(skill) {
        const wks = { 'system design': 8, 'kubernetes': 6, 'aws': 8, 'distributed systems': 12, 'kafka': 4, 'redis': 3, 'security': 6, 'docker': 3, 'ci/cd': 3, 'testing': 4, 'typescript': 3 };
        return wks[skill] || 5;
    }

    // ══════════════════════════════════════════════════════════════════════
    // NEW MODULE 4 — AUTHENTICITY DETECTION
    // ══════════════════════════════════════════════════════════════════════
    _computeAuthenticityScore(raw, text, layer2, layer3) {
        const depthHits    = DEPTH_INDICATORS.filter(d => text.includes(d.toLowerCase())).length;
        const shallowHits  = SHALLOW_INDICATORS.filter(s => text.includes(s.toLowerCase())).length;
        const brandHits    = BRAND_SIGNAL_COMPANIES.filter(c => text.includes(c.toLowerCase())).length;
        const schoolHits   = BRAND_SIGNALS_SCHOOLS.filter(s => text.includes(s.toLowerCase())).length;

        // Flag inflated tech stack (too many unrelated technologies)
        const techCount = layer2.detectedTechCount || 0;
        const likelyInflated = techCount > 22;

        // Production credibility signals
        const hasProdNumbers   = layer3.quantifiedAchievementCount >= 3;
        const hasScaleRef      = (layer3.scaleReferences || []).length > 0;
        const hasWeakStatements = (layer3.weakAchievementStatements || []).length > 2;

        // Flags
        const flags = [];
        if (shallowHits > 3)   flags.push({ type: 'warning', msg: `${shallowHits} shallow signal words detected ("familiar with", "exposure to") — replace with direct evidence` });
        if (likelyInflated)    flags.push({ type: 'warning', msg: `${techCount} technologies listed — may signal stack inflation. Focus on demonstrated depth over breadth` });
        if (hasWeakStatements) flags.push({ type: 'warning', msg: `${layer3.weakAchievementStatements.length} passive achievement statements detected — lacks ownership signals` });
        if (!hasProdNumbers)   flags.push({ type: 'info',    msg: 'No quantified production metrics — add scale/impact numbers to increase credibility score' });
        if (brandHits > 0)     flags.push({ type: 'positive', msg: `Recognized company signal: ${BRAND_SIGNAL_COMPANIES.find(c => text.includes(c))} — strong market validation` });
        if (schoolHits > 0)    flags.push({ type: 'positive', msg: `Recognized institution signal detected — adds baseline credibility` });

        const depthScore = Math.min(40, depthHits * 4);
        const productionScore = (hasProdNumbers ? 25 : 5) + (hasScaleRef ? 10 : 0);
        const shallowPenalty  = Math.min(20, shallowHits * 2);
        const brandBonus      = Math.min(15, (brandHits + schoolHits) * 5);

        const totalScore = Math.min(100, Math.max(10, Math.round(
            depthScore + productionScore - shallowPenalty + brandBonus + (likelyInflated ? 0 : 8)
        )));

        const level = totalScore >= 75 ? 'High — strong production evidence' :
                      totalScore >= 50 ? 'Medium — some depth signals present' :
                      'Low — insufficient evidence of real-world depth';

        return { totalScore, level, flags, depthSignalsFound: depthHits, shallowSignalsFound: shallowHits, brandSignalsFound: brandHits };
    }

    // ══════════════════════════════════════════════════════════════════════
    // NEW MODULE 5 — MARKET SIGNAL ANALYSIS
    // ══════════════════════════════════════════════════════════════════════
    _computeMarketSignals(text, layer1, layer2, layer3) {
        const brandStrength = BRAND_SIGNAL_COMPANIES.filter(c => text.includes(c)).length;
        const techComp = layer2.cloudAndAIScore || 0;
        const stackComp = Math.min(100, (layer2.detectedTechCount || 0) * 4 + techComp * 0.3);
        const seniorityStr = layer1.currentMarketLevel === 'Senior' ? 85 : layer1.currentMarketLevel === 'Mid' ? 60 : 35;
        const impactStr = Math.min(100, (layer3.quantifiedAchievementCount || 0) * 10);

        const marketSignalScore = Math.min(100, Math.round(
            (brandStrength > 0 ? 25 : 0) +
            stackComp * 0.30 +
            seniorityStr * 0.25 +
            impactStr * 0.20
        ));

        const signals = [];
        if (brandStrength > 0) signals.push({ type: 'positive', signal: 'Tier-1 company brand', detail: `Worked at recognized company — strong market credibility signal` });
        if (techComp > 50)     signals.push({ type: 'positive', signal: 'Cloud/AI competency',  detail: 'Cloud and AI tooling signals — high market demand alignment' });
        if (layer3.quantifiedAchievementCount >= 5) signals.push({ type: 'positive', signal: 'Impact quantification', detail: `${layer3.quantifiedAchievementCount} quantified achievements — strong ROI demonstration` });
        if (stackComp < 40)    signals.push({ type: 'risk',     signal: 'Stack competitiveness', detail: 'Technology stack appears below market average for target role' });
        if (layer1.keywordDensity < 0.04) signals.push({ type: 'risk', signal: 'ATS keyword density', detail: 'Low keyword density — likely filtered by ATS before human review' });

        return {
            marketSignalScore,
            brandStrengthScore: Math.min(100, brandStrength * 30),
            stackCompetitivenessScore: Math.round(stackComp),
            senioritySignalStrength: seniorityStr,
            impactSignalStrength: impactStr,
            signals,
        };
    }

    // ══════════════════════════════════════════════════════════════════════
    // NEW MODULE 6 — GROWTH TRAJECTORY MODELING
    // ══════════════════════════════════════════════════════════════════════
    _computeGrowthTrajectory(layer1, layer2, layer3, layer4, layer5, yearsOfExperience) {
        const currentLevel = layer1.currentMarketLevel.toLowerCase();
        const currentVal   = layer5.estimatedCurrentMarketValue;
        const growthRate   = this._estimateGrowthRate(layer2, layer3, layer4);

        // 2-year projection at current trajectory
        const projected2yr = Math.round(Math.min(currentVal * 1.6, currentVal * (1 + growthRate * 0.24)));
        const projectedLevel = this._projectLevel(layer5.compensationReadinessScore, yearsOfExperience + 2);

        // Stagnation risk
        const stagnationRisk =
            layer2.outdatedOrWeakSkills.length > 2 ? 'High' :
            layer4.architectureExposureScore < 25  ? 'Medium-High' :
            layer3.quantifiedAchievementCount < 3  ? 'Medium' : 'Low';

        // Accelerator levers (specific actions that unlock fastest growth)
        const accelerators = [];
        if (layer3.quantifiedAchievementCount < 4) accelerators.push({ lever: 'Quantified Impact', impact: 'High', action: 'Add 5+ metrics-driven bullets to experience section', salaryUnlock: '+8–15k' });
        if (layer4.architectureExposureScore < 45) accelerators.push({ lever: 'System Design Skills', impact: 'High', action: 'Complete 1 real distributed systems project + 10 mock design interviews', salaryUnlock: '+15–25k' });
        if (layer2.cloudAndAIScore < 40)            accelerators.push({ lever: 'Cloud Certification', impact: 'Medium', action: 'Earn AWS SAA-C03 or GCP ACE — add 2 cloud-native projects', salaryUnlock: '+8–12k' });
        if (layer1.roleAlignmentScore < 55)         accelerators.push({ lever: 'Resume Positioning', impact: 'Medium', action: 'Optimize resume for target role keywords — rewrite summary + titles', salaryUnlock: '+5–10k' });
        if (layer2.outdatedOrWeakSkills.length > 0) accelerators.push({ lever: 'Stack Modernization', impact: 'Medium', action: `Replace ${layer2.outdatedOrWeakSkills.slice(0,2).join(', ')} with modern equivalents`, salaryUnlock: '+3–8k' });

        const riskOfStagnation = stagnationRisk === 'High' || stagnationRisk === 'Medium-High';

        return {
            currentEstimatedValue: currentVal,
            projected2yrValue:     projected2yr,
            projectedLevel:        projectedLevel,
            annualGrowthRateEstimate: Math.round(growthRate * 100),
            stagnationRisk,
            riskOfStagnation,
            stagnationReasons:     riskOfStagnation ? this._getStagnationReasons(layer2, layer3, layer4) : [],
            accelerators:          accelerators.slice(0, 4),
        };
    }

    _estimateGrowthRate(layer2, layer3, layer4) {
        return Math.min(0.22, Math.max(0.03,
            (layer2.coreStrengthScore / 100) * 0.08 +
            (layer3.impactScore / 100) * 0.08 +
            (layer4.architectureExposureScore / 100) * 0.06
        ));
    }

    _projectLevel(readinessScore, futureYoe) {
        if (readinessScore >= 80 || futureYoe >= 10) return 'Staff Engineer';
        if (readinessScore >= 65 || futureYoe >= 7)  return 'Senior Engineer';
        if (readinessScore >= 45 || futureYoe >= 4)  return 'Mid-Level Engineer';
        return 'Junior-Mid Engineer';
    }

    _getStagnationReasons(layer2, layer3, layer4) {
        const r = [];
        if (layer2.outdatedOrWeakSkills.length > 1) r.push(`Reliance on outdated tech (${layer2.outdatedOrWeakSkills.slice(0,2).join(', ')}) — market demand declining`);
        if (layer4.architectureExposureScore < 25)  r.push('No architecture/systems evidence — ceiling hit without design skills');
        if (layer3.quantifiedAchievementCount < 2)  r.push('No measurable impact demonstrated — difficult to justify raises or promotions');
        return r;
    }

    // ══════════════════════════════════════════════════════════════════════
    // NEW MODULE 7 — ENGINEERING MATURITY RADAR
    // ══════════════════════════════════════════════════════════════════════
    _computeEngineeringMaturityRadar(text, layer2, layer3, layer4, capabilityMatrix) {
        const inferred = capabilityMatrix ? capabilityMatrix.inferred : {};

        const axes = {
            depth:       Math.min(95, Math.round((layer2.coreStrengthScore || 0) * 0.8 + (layer2.productionEvidenceScore || 0) * 0.2)),
            breadth:     Math.min(95, Math.round(Math.min((layer2.detectedTechCount || 0) * 4, 80) + (layer2.cloudAndAIScore || 0) * 0.2)),
            architecture:Math.min(95, layer4.architectureExposureScore || 5),
            collaboration:Math.min(95, inferred.collaboration || this._inferScore(text, ['code review','pull request','pair programming','mentored','team','agile'], 12)),
            innovation:  Math.min(95, Math.round(((layer2.cloudAndAIScore || 0) * 0.5) + (layer3.quantifiedAchievementCount || 0) * 6)),
            productionOwnership: Math.min(95, Math.round((layer2.productionEvidenceScore || 0) * 0.7 + (layer3.leadershipSignalStrength || 0) * 0.3)),
        };

        // each axis also has a label and industry benchmark
        const benchmarks = {
            depth: 72, breadth: 65, architecture: 70, collaboration: 75, innovation: 60, productionOwnership: 68,
        };

        const radarDimensions = Object.entries(axes).map(([axis, score]) => ({
            axis,
            label: this._radarLabel(axis),
            score,
            benchmark: benchmarks[axis],
            delta: score - benchmarks[axis],
            status: score >= benchmarks[axis] ? 'above' : score >= benchmarks[axis] - 15 ? 'near' : 'below',
        }));

        const overallMaturityScore = Math.round(Object.values(axes).reduce((s, v) => s + v, 0) / 6);
        const maturityTier =
            overallMaturityScore >= 78 ? 'Advanced' :
            overallMaturityScore >= 58 ? 'Intermediate' :
            overallMaturityScore >= 38 ? 'Developing' : 'Foundational';

        return { axes, radarDimensions, overallMaturityScore, maturityTier };
    }

    _radarLabel(axis) {
        const m = { depth: 'Skill Depth', breadth: 'Breadth', architecture: 'Architecture', collaboration: 'Collaboration', innovation: 'Innovation', productionOwnership: 'Prod Ownership' };
        return m[axis] || axis;
    }

    // ══════════════════════════════════════════════════════════════════════
    // NEW MODULE 8 — IMPROVEMENT ROADMAP BUILDER
    // ══════════════════════════════════════════════════════════════════════
    _buildImprovementRoadmap(layer2, layer3, layer4, skillDiagnostics) {
        const roadmap = [];

        const criticalGaps = (skillDiagnostics.gaps || []).filter(g => g.severity === 'Critical').slice(0, 3);
        const highGaps     = (skillDiagnostics.gaps || []).filter(g => g.severity === 'High').slice(0, 3);

        if (criticalGaps.length > 0) {
            roadmap.push({
                phase: 1,
                title: 'Critical Gap Closure',
                duration: '4–8 weeks',
                priority: 'blocking',
                items: criticalGaps.map(g => ({
                    skill:  g.skill,
                    action: g.learningPath,
                    proof:  g.proofBuilding,
                    weeks:  this._estimateWeeks(g.skill),
                })),
            });
        }

        if (layer3.quantifiedAchievementCount < 4 || layer3.weakAchievementStatements.length > 2) {
            roadmap.push({
                phase: 2,
                title: 'Resume Impact Engineering',
                duration: '1–2 weeks',
                priority: 'high',
                items: [
                    { skill: 'Quantified Achievements',  action: 'Rewrite 5+ bullets with metrics: latency %, user counts, cost savings, throughput', proof: 'Measurable before/after comparison in every job entry', weeks: 1 },
                    { skill: 'Ownership Language',       action: 'Replace all "responsible for" / "worked on" with power verbs: architected, led, owned, delivered', proof: 'Run through resume — zero passive phrases', weeks: 1 },
                ],
            });
        }

        if (highGaps.length > 0) {
            roadmap.push({
                phase: 3,
                title: 'Strategic Skill Depth',
                duration: '6–10 weeks',
                priority: 'high',
                items: highGaps.map(g => ({
                    skill:  g.skill,
                    action: g.learningPath,
                    proof:  g.proofBuilding,
                    weeks:  this._estimateWeeks(g.skill),
                })),
            });
        }

        roadmap.push({
            phase: roadmap.length + 1,
            title: 'Market Positioning Optimization',
            duration: '1 week',
            priority: 'medium',
            items: [
                { skill: 'ATS Keywords', action: 'Insert 8–12 target-role keywords into resume summary, skills section, and experience bullets', proof: 'Pass ATS simulation scan — target 70%+ match on JobScan', weeks: 1 },
                { skill: 'Portfolio Proof', action: 'Create/polish 2 GitHub repos that demonstrate your top 3 claimed skills with README + metrics', proof: 'Public visible repos with stars, forks, and CI badges', weeks: 2 },
            ],
        });

        return roadmap;
    }


}

module.exports = new CareerIntelligenceEngine();
