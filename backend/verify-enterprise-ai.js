/**
 * ENTERPRISE AI SYSTEM VERIFICATION SCRIPT
 * 
 * Tests all 6 layers of the Enterprise Skill Analyzer
 * Run: node verify-enterprise-ai.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(80));
console.log('🔍 SKILLFORGE ENTERPRISE AI SYSTEM VERIFICATION');
console.log('='.repeat(80) + '\n');

let passCount = 0;
let failCount = 0;

function logTest(name, passed, details = '') {
    if (passed) {
        console.log(`✅ ${name}`);
        if (details) console.log(`   ${details}`);
        passCount++;
    } else {
        console.log(`❌ ${name}`);
        if (details) console.log(`   ${details}`);
        failCount++;
    }
}

// TEST 1: Check if EnterpriseSkillAnalyzer is wired in routes
console.log('📋 TEST 1: Backend Integration\n');

try {
    const routeFile = fs.readFileSync(path.join(__dirname, 'src/routes/skillGapRoutes.js'), 'utf8');
    
    const hasEnterpriseImport = routeFile.includes('EnterpriseSkillAnalyzer') && 
                                 routeFile.includes('multiAI/enterpriseSkillAnalyzer');
    logTest('EnterpriseSkillAnalyzer imported in skillGapRoutes.js', hasEnterpriseImport,
            hasEnterpriseImport ? 'Found: const { EnterpriseSkillAnalyzer } = require(...)' : 'Still using EliteSkillAnalyzer!');
    
    const hasInstantiation = routeFile.includes('new EnterpriseSkillAnalyzer');
    logTest('EnterpriseSkillAnalyzer instantiated', hasInstantiation,
            hasInstantiation ? 'Found: new EnterpriseSkillAnalyzer({ enableFallback: true })' : 'Not instantiated in route handler');
    
    const callsAnalyzeResume = routeFile.includes('enterpriseAnalyzer.analyzeResume');
    logTest('Route calls enterpriseAnalyzer.analyzeResume()', callsAnalyzeResume,
            callsAnalyzeResume ? 'API endpoint uses enterprise system' : 'Route may still use old analyzer');
    
} catch (error) {
    logTest('Backend Integration', false, `Error reading file: ${error.message}`);
}

console.log('');

// TEST 2: Check .env file exists and has required keys
console.log('📋 TEST 2: Environment Configuration\n');

try {
    const envExists = fs.existsSync(path.join(__dirname, '.env'));
    logTest('.env file exists', envExists, envExists ? 'Found at backend/.env' : 'File missing - create from .env.example');
    
    if (envExists) {
        const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
        
        const requiredKeys = [
            'GOOGLE_PROJECT_ID',
            'OPENAI_API_KEY',
            'ANTHROPIC_API_KEY',
            'AWS_ACCESS_KEY_ID',
            'LINKEDIN_ACCESS_TOKEN',
            'DAILY_BUDGET_USD'
        ];
        
        requiredKeys.forEach(key => {
            const hasKey = envContent.includes(key);
            const hasRealValue = hasKey && !envContent.match(new RegExp(`${key}=your-`));
            logTest(`${key} configured`, hasKey,
                    hasKey ? (hasRealValue ? '✓ Has value' : '⚠️  Still placeholder (your-*)') : 'Key missing');
        });
    }
} catch (error) {
    logTest('Environment Configuration', false, `Error: ${error.message}`);
}

console.log('');

// TEST 3: Check multiAI directory and files
console.log('📋 TEST 3: Enterprise AI Layer Files\n');

try {
    const multiAIPath = path.join(__dirname, 'src/services/multiAI');
    const multiAIExists = fs.existsSync(multiAIPath);
    logTest('multiAI directory exists', multiAIExists, multiAIExists ? 'Found at backend/src/services/multiAI/' : 'Directory missing');
    
    if (multiAIExists) {
        const requiredFiles = [
            'enterpriseSkillAnalyzer.js',
            'layer1-documentAI.js',
            'layer2-nlpExtraction.js',
            'layer3-llmInference.js',
            'layer4-marketIntelligence.js',
            'layer5-6-confidenceArbitration.js',
            'auditLogger.js'
        ];
        
        requiredFiles.forEach(file => {
            const exists = fs.existsSync(path.join(multiAIPath, file));
            const size = exists ? fs.statSync(path.join(multiAIPath, file)).size : 0;
            logTest(file, exists, exists ? `${Math.round(size / 1024)} KB` : 'File missing');
        });
    }
} catch (error) {
    logTest('Enterprise AI Layer Files', false, `Error: ${error.message}`);
}

console.log('');

// TEST 4: Check frontend integration
console.log('📋 TEST 4: Frontend Integration\n');

try {
    const htmlFile = fs.readFileSync(path.join(__dirname, '../roadmap-dashboard/index.html'), 'utf8');
    
    const hasPipelineUI = htmlFile.includes('ai-pipeline-status') && htmlFile.includes('layer-1-status');
    logTest('AI pipeline UI present in HTML', hasPipelineUI,
            hasPipelineUI ? 'Found: <div class="ai-pipeline-status"> with 6 layers' : 'UI elements missing');
    
    const hasProcessingStats = htmlFile.includes('processing-time') && htmlFile.includes('processing-cost');
    logTest('Processing stats elements present', hasProcessingStats,
            hasProcessingStats ? 'Found: #processing-time and #processing-cost' : 'Stat elements missing');
    
} catch (error) {
    logTest('Frontend HTML', false, `Error: ${error.message}`);
}

try {
    const jsFile = fs.readFileSync(path.join(__dirname, '../roadmap-dashboard/enhanced-flows.js'), 'utf8');
    
    const hasAnimationFunctions = jsFile.includes('startAIPipelineAnimation') && 
                                   jsFile.includes('animateLayer') &&
                                   jsFile.includes('animateAllLayers');
    logTest('Animation functions present', hasAnimationFunctions,
            hasAnimationFunctions ? 'Found: startAIPipelineAnimation(), animateLayer(), animateAllLayers()' : 'Functions missing');
    
    const hasEnterpriseTransform = jsFile.includes('transformEnterpriseAnalysis');
    logTest('Enterprise response transformer', hasEnterpriseTransform,
            hasEnterpriseTransform ? 'Found: transformEnterpriseAnalysis() function' : 'Transformer missing');
    
    const callsEnterpriseAPI = jsFile.includes('/skill-gap/analyze');
    logTest('Frontend calls skill-gap API', callsEnterpriseAPI,
            callsEnterpriseAPI ? 'Confirmed: POST to /api/skill-gap/analyze' : 'API call missing');
    
} catch (error) {
    logTest('Frontend JavaScript', false, `Error: ${error.message}`);
}

console.log('');

// TEST 5: Check CSS styling
console.log('📋 TEST 5: UI Styling\n');

try {
    const cssFile = fs.readFileSync(path.join(__dirname, '../roadmap-dashboard/styles.css'), 'utf8');
    
    const hasPipelineStyles = cssFile.includes('.ai-pipeline-status') && cssFile.includes('.pipeline-layer');
    logTest('AI pipeline styles present', hasPipelineStyles,
            hasPipelineStyles ? 'Found: .ai-pipeline-status and .pipeline-layer classes' : 'Styles missing');
    
    const hasAnimations = cssFile.includes('@keyframes pulse') && 
                          cssFile.includes('@keyframes spin') &&
                          cssFile.includes('@keyframes blink');
    logTest('Animation keyframes present', hasAnimations,
            hasAnimations ? 'Found: pulse, spin, blink animations' : 'Animations missing');
    
    const hasStatusStates = cssFile.includes('.pipeline-layer.processing') &&
                            cssFile.includes('.pipeline-layer.success') &&
                            cssFile.includes('.pipeline-layer.error');
    logTest('Layer status states styled', hasStatusStates,
            hasStatusStates ? 'Found: .processing, .success, .error states' : 'Status styles missing');
    
} catch (error) {
    logTest('CSS Styling', false, `Error: ${error.message}`);
}

console.log('');

// TEST 6: Check documentation
console.log('📋 TEST 6: Documentation\n');

try {
    const deployGuideExists = fs.existsSync(path.join(__dirname, '../ENTERPRISE_AI_DEPLOYMENT_GUIDE.md'));
    logTest('Deployment guide exists', deployGuideExists,
            deployGuideExists ? 'Found: ENTERPRISE_AI_DEPLOYMENT_GUIDE.md' : 'Documentation missing');
    
    const summaryExists = fs.existsSync(path.join(__dirname, '../ENTERPRISE_AI_IMPLEMENTATION_SUMMARY.md'));
    logTest('Implementation summary exists', summaryExists,
            summaryExists ? 'Found: ENTERPRISE_AI_IMPLEMENTATION_SUMMARY.md' : 'Summary missing');
    
    const auditExists = fs.existsSync(path.join(__dirname, '../FORENSIC_AUDIT_REPORT.md'));
    logTest('Forensic audit report exists', auditExists,
            auditExists ? 'Found: FORENSIC_AUDIT_REPORT.md' : 'Audit report missing');
    
} catch (error) {
    logTest('Documentation', false, `Error: ${error.message}`);
}

console.log('');

// SUMMARY
console.log('='.repeat(80));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(80));
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`📊 Total:  ${passCount + failCount}`);
console.log('');

if (failCount === 0) {
    console.log('🎉 ALL TESTS PASSED! Enterprise AI system is fully integrated.');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Configure API keys in backend/.env');
    console.log('  2. Run: npm install');
    console.log('  3. Run: npm start');
    console.log('  4. Test resume upload at http://localhost:5500');
    console.log('');
    process.exit(0);
} else {
    console.log('⚠️  Some tests failed. Review the issues above.');
    console.log('');
    console.log('Common fixes:');
    console.log('  • If .env missing: Copy from .env.example');
    console.log('  • If imports wrong: Check skillGapRoutes.js line 8');
    console.log('  • If UI missing: Verify index.html and styles.css changes');
    console.log('');
    process.exit(1);
}
