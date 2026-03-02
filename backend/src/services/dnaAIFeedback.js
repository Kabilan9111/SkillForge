/**
 * DNA AI Feedback Service — Phase 7
 * Analyzes code structure + behavioral signals + DNA profile
 * Returns targeted, non-generic feedback.
 */

// ─── PATTERN WEAKNESS DETECTION ──────────────────────────────────────────

/** Maps problem categories to detected weakness patterns */
const WEAKNESS_PATTERNS = {
  'arrays':            'Linear scan dependency. Explore sliding window and hash-map approaches.',
  'dynamic-programming': 'Subproblem decomposition not evident. Memoization patterns absent.',
  'stack':             'Iterative → recursive conversion not attempted. Stack depth awareness low.',
  'binary-search':     'Invariant maintenance inconsistent. Off-by-one patterns recurring.',
  'linked-list':       'Pointer manipulation errors. Two-pointer technique underused.',
  'sorting':           'Custom comparator logic weak. In-place vs auxiliary space tradeoff missed.',
  'graphs':            'BFS/DFS selection is not intentional — appears random.',
  'trees':             'Recursive base cases missed. Iterative tree traversal not attempted.',
  'strings':           'Naive O(n²) string operations. KMP/rolling hash not in toolkit.'
};

// ─── CODE STRUCTURE ANALYSIS ─────────────────────────────────────────────

function analyzeCodeStructure(code = '') {
  const issues = [];
  const suggestions = [];

  if (!code || code.trim().length < 10) {
    return { issues: ['No code submitted'], suggestions: [], complexity: 'unknown' };
  }

  // Nested loops → O(n²) risk
  const nestedLoops = (code.match(/for\s*\(/g) || []).length + (code.match(/while\s*\(/g) || []).length;
  if (nestedLoops >= 2) {
    issues.push('Nested loop structure detected — potential O(n²) or worse time complexity.');
    suggestions.push('Evaluate whether a hash-map or two-pointer approach eliminates the inner loop.');
  }

  // Recursion without memoization
  const hasRecursion = /function\s+\w+[^{]*\{[\s\S]*\1\s*\(/.test(code) ||
                       code.includes('return ') && code.includes('function');
  const hasMemo = code.includes('memo') || code.includes('cache') || code.includes('Map()') || code.includes('{}');
  if (hasRecursion && !hasMemo) {
    issues.push('Recursive solution without memoization — exponential time risk.');
    suggestions.push('Add a memoization map to cache already-computed subproblems.');
  }

  // No edge case handling
  if (!code.includes('length === 0') && !code.includes('!') && !code.includes('=== null') && !code.includes('=== undefined')) {
    issues.push('No apparent edge case guards (null/empty input checks).');
    suggestions.push('Add explicit guards for empty arrays, null inputs, and boundary values.');
  }

  // Global variable misuse
  if ((code.match(/var\s+\w/g) || []).length > 2) {
    issues.push('`var` declarations detected — potential hoisting and scoping bugs.');
    suggestions.push('Replace all `var` with `const` or `let` to enforce proper scope.');
  }

  // Estimate complexity
  let complexity = 'O(1)';
  if (nestedLoops >= 3) complexity = 'O(n³) or worse';
  else if (nestedLoops >= 2) complexity = 'O(n²)';
  else if (nestedLoops === 1) complexity = 'O(n)';
  else if (code.includes('sort')) complexity = 'O(n log n)';

  return { issues, suggestions, complexity };
}

// ─── BEHAVIORAL SIGNAL ANALYSIS ──────────────────────────────────────────

function analyzeBehavioralSignals(telemetry) {
  const signals = [];

  if (telemetry.pasteEvents > 2) {
    signals.push('External code sourcing detected (paste events > 2). Genuine solve ability unclear.');
  }
  if (telemetry.tabSwitchEvents > 5) {
    signals.push('Frequent context switching during solve. Solution likely researched rather than recalled.');
  }
  if (telemetry.idleTimeSpikes > 3) {
    signals.push('Multiple prolonged idle periods. Possible cognitive block or external reference lookup.');
  }
  if (telemetry.rewriteCount > 3) {
    signals.push('Solution rewritten ' + telemetry.rewriteCount + ' times. Strategy was not defined before coding began.');
  }
  if (telemetry.runAttempts > 8) {
    signals.push('High run-attempt count (' + telemetry.runAttempts + '). Debug strategy appears trial-and-error rather than systematic.');
  }
  if (telemetry.firstAttemptSuccess) {
    signals.push('First-run success. Problem was mentally solved before implementation began.');
  }
  if (telemetry.firstKeystrokeDelay > 10000) {
    signals.push('Long pre-code thinking phase (' + Math.round(telemetry.firstKeystrokeDelay / 1000) + 's). Planning-first pattern confirmed.');
  }

  return signals;
}

// ─── IMPROVEMENT AREA MAPPING ─────────────────────────────────────────────

function mapImprovementAreas(sessions) {
  // Count failures by category
  const categoryFailures = {};
  for (const s of sessions) {
    if (s.test_pass_ratio < 0.8) {
      const key = s.problem_id.split('-').slice(0, 2).join('-');
      categoryFailures[key] = (categoryFailures[key] || 0) + 1;
    }
  }

  const areas = [];
  for (const [category, count] of Object.entries(categoryFailures)) {
    if (count >= 2) {
      const pattern = Object.entries(WEAKNESS_PATTERNS).find(([k]) => category.includes(k));
      if (pattern) {
        areas.push({
          category,
          failureCount: count,
          pattern: pattern[1]
        });
      }
    }
  }
  return areas.sort((a, b) => b.failureCount - a.failureCount).slice(0, 3);
}

// ─── STABILITY WARNING ────────────────────────────────────────────────────

function computeStabilityWarning(dnaProfile) {
  const warnings = [];
  if (dnaProfile.volatilityIndex > 30) {
    warnings.push({
      level: 'high',
      message: `Performance variance is ${Math.round(dnaProfile.volatilityIndex)}%. Inconsistency at this level is a red flag in technical interviews.`
    });
  }
  if (dnaProfile.stability < 45) {
    warnings.push({
      level: 'medium',
      message: 'High cognitive noise in code composition. Reduce mid-implementation strategy changes.'
    });
  }
  if (dnaProfile.debugEfficiency < 40) {
    warnings.push({
      level: 'high',
      message: 'Debug cycle duration is above threshold. Practice systematic error isolation, not trial-and-error.'
    });
  }
  return warnings;
}

// ─── OPTIMIZATION SUGGESTIONS ─────────────────────────────────────────────

function generateOptimizationSuggestions(codeAnalysis, dnaProfile) {
  const suggestions = [...codeAnalysis.suggestions];

  if (dnaProfile.optimizationReflex < 50) {
    suggestions.push('After reaching a passing solution, always ask: can this be done in O(n) instead of O(n²)? Set a deliberate optimization step in your workflow.');
  }
  if (dnaProfile.planningDepth < 40) {
    suggestions.push('Before writing any code, spend 2-3 minutes writing a pseudocode outline. It directly predicts first-attempt success rate.');
  }
  if (dnaProfile.learningVelocity < 40) {
    suggestions.push('Categorize problems by pattern type after solving. Active pattern labeling accelerates velocity growth.');
  }

  return [...new Set(suggestions)].slice(0, 5);
}

// ─── MAIN AI FEEDBACK GENERATOR ──────────────────────────────────────────

/**
 * Generate full AI feedback for a session + DNA profile.
 * @param {Object} params
 * @param {string} params.code            - submitted code
 * @param {Object} params.telemetry       - single session telemetry
 * @param {Object} params.dnaProfile      - aggregated DNA profile
 * @param {Array}  params.recentSessions  - last N sessions
 */
function generateAIFeedback({ code, telemetry, dnaProfile, recentSessions = [] }) {
  const codeAnalysis      = analyzeCodeStructure(code);
  const behavioralSignals = analyzeBehavioralSignals(telemetry || {});
  const weakPatterns      = mapImprovementAreas(recentSessions);
  const stabilityWarnings = computeStabilityWarning(dnaProfile);
  const optimizations     = generateOptimizationSuggestions(codeAnalysis, dnaProfile);

  const interviewReadiness = dnaProfile.interviewReadiness || 0;
  let readinessLabel;
  if (interviewReadiness >= 80)      readinessLabel = 'High — Interview-Ready';
  else if (interviewReadiness >= 60) readinessLabel = 'Moderate — Needs consistency';
  else if (interviewReadiness >= 40) readinessLabel = 'Developing — Significant gaps remain';
  else                                readinessLabel = 'Early Stage — Build fundamentals first';

  return {
    codeStructure: {
      detectedComplexity: codeAnalysis.complexity,
      issues:             codeAnalysis.issues,
    },
    behavioralSignals,
    weakPatternCategories: weakPatterns.map(w => ({
      category: w.category,
      insight:  w.pattern,
      failCount: w.failureCount
    })),
    optimizationSuggestions: optimizations,
    stabilityWarnings,
    interviewReadinessScore: interviewReadiness,
    interviewReadinessLabel: readinessLabel,
    generatedAt: new Date().toISOString()
  };
}

module.exports = { generateAIFeedback, analyzeCodeStructure };
