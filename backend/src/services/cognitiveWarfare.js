/**
 * Cognitive Warfare Service — Phase 6
 * Generates advanced training modes that simulate real interview pressure.
 *
 * Mode A — Stress Simulation   : time pressure, limited run attempts
 * Mode B — Incomplete Problem  : missing constraints, user infers edge cases
 * Mode C — Deception Debugging : subtle hidden bug in seemingly correct code
 */

const WARFARE_MODES = {
  STRESS:      'stress_simulation',
  INCOMPLETE:  'incomplete_problem',
  DECEPTION:   'deception_debugging'
};

// ─── MODE A: STRESS SIMULATION ────────────────────────────────────────────

/**
 * Wraps a normal problem with stress constraints.
 * - Time limit reduced to 60% of standard
 * - Max run attempts: 3
 * - Distraction events injected (frontend reads these)
 */
function stressSimulation(problem) {
  const standardTime = { easy: 600, medium: 1200, hard: 2400 }; // seconds
  const base = standardTime[problem.difficulty] || 1200;

  return {
    ...problem,
    warfareMode: WARFARE_MODES.STRESS,
    warfareConfig: {
      timeLimitSeconds: Math.floor(base * 0.6),
      maxRunAttempts: 3,
      distractionEvents: generateDistractions(),
      notifyMessage: 'STRESS MODE — Limited time. Max 3 run attempts.',
      scoreMultiplier: 1.4   // higher reward for passing under pressure
    }
  };
}

/**
 * Randomized pop-up distraction events the frontend can replay.
 */
function generateDistractions() {
  const possible = [
    { type: 'fake_notification', text: 'Interview ends in 5 minutes.', at: 0.3 },
    { type: 'fake_notification', text: 'Interviewer is watching.', at: 0.5 },
    { type: 'editor_flash',      text: null, at: 0.7 },
    { type: 'fake_notification', text: 'Unexpected test case added.', at: 0.6 }
  ];
  // Pick 2 random ones
  return possible.sort(() => Math.random() - 0.5).slice(0, 2);
}

// ─── MODE B: INCOMPLETE PROBLEM ───────────────────────────────────────────

/**
 * Strips some constraints from the problem so the user must infer edge cases.
 * - Hides 1-2 constraint lines
 * - Removes one test case from visible examples
 * - Adds ambiguous requirement note
 */
function incompleteProblem(problem) {
  let constraints = [];
  try { constraints = JSON.parse(problem.constraints || '[]'); } catch { constraints = []; }
  let testCases = [];
  try { testCases = JSON.parse(problem.test_cases || '[]'); } catch { testCases = []; }

  // Remove last constraint (usually the interesting edge case constraint)
  const hiddenConstraints = constraints.slice(-Math.min(2, constraints.length));
  const visibleConstraints = constraints.slice(0, Math.max(1, constraints.length - 2));

  // Remove last test case from visible set
  const visibleTestCases = testCases.slice(0, Math.max(1, testCases.length - 1));

  return {
    ...problem,
    constraints: JSON.stringify(visibleConstraints),
    test_cases: JSON.stringify(visibleTestCases),
    warfareMode: WARFARE_MODES.INCOMPLETE,
    warfareConfig: {
      hiddenConstraints,
      removedTestCaseCount: testCases.length - visibleTestCases.length,
      ambiguityNote: 'Some constraints are intentionally omitted. Your solution must handle all valid edge cases.',
      notifyMessage: 'INCOMPLETE MODE — Missing constraints detected. Infer edge cases.',
      scoreMultiplier: 1.35
    }
  };
}

// ─── MODE C: DECEPTION DEBUGGING ──────────────────────────────────────────

/**
 * Returns a problem where starter code looks correct but has a subtle bug.
 * Requires the problem to have has_deception_bug = 1 in DB.
 * If no deception problem is available, injects a generic one.
 */
function deceptionDebugging(problem) {
  if (!problem.has_deception_bug) {
    return injectDeceptionBug(problem);
  }
  return {
    ...problem,
    warfareMode: WARFARE_MODES.DECEPTION,
    warfareConfig: {
      hint: 'The code compiles and passes most tests. Find the edge case it fails.',
      notifyMessage: 'DECEPTION MODE — Code looks correct. It is not.',
      deceptionNote: problem.deception_note || 'A subtle bug is present.',
      scoreMultiplier: 1.5
    }
  };
}

/**
 * Injects a known subtle bug into starter code for non-deception problems.
 * Strategy: off-by-one in loop or wrong operator.
 */
function injectDeceptionBug(problem) {
  const buggedCode = problem.starter_code
    ? problem.starter_code
        .replace(/\.length - 1/g, '.length')        // classic off-by-one
        .replace(/\bMath\.max\(/g, 'Math.min(')      // operator swap
    : `// BUG: The following code has a subtle logical error.\n${problem.starter_code}`;

  return {
    ...problem,
    starter_code: buggedCode,
    warfareMode: WARFARE_MODES.DECEPTION,
    warfareConfig: {
      hint: 'The starter code has a subtle bug introduced. Find and fix it before solving.',
      notifyMessage: 'DECEPTION MODE — A hidden bug exists in the provided code.',
      deceptionNote: 'Off-by-one or operator swap injected.',
      scoreMultiplier: 1.5
    }
  };
}

// ─── PUBLIC API ──────────────────────────────────────────────────────────

/**
 * Apply a warfare mode to a problem.
 * @param {Object} problem - problem from DB
 * @param {string} mode    - 'stress' | 'incomplete' | 'deception'
 */
function applyWarfareMode(problem, mode) {
  switch (mode) {
    case 'stress':      return stressSimulation(problem);
    case 'incomplete':  return incompleteProblem(problem);
    case 'deception':   return deceptionDebugging(problem);
    default:            return { ...problem, warfareMode: null, warfareConfig: null };
  }
}

/** Return all available warfare mode descriptors for UI */
function getWarfareModeDescriptions() {
  return [
    {
      id:          'stress',
      name:        'Stress Simulation',
      icon:        '⏱️',
      description: 'Reduced time + limited run attempts. Simulates real interview pressure.',
      scoreBonus:  '×1.4'
    },
    {
      id:          'incomplete',
      name:        'Incomplete Problem',
      icon:        '🔭',
      description: 'Missing constraints. You must infer edge cases from context.',
      scoreBonus:  '×1.35'
    },
    {
      id:          'deception',
      name:        'Deception Debugging',
      icon:        '🐛',
      description: 'Code looks correct but has a subtle hidden bug. Find it.',
      scoreBonus:  '×1.5'
    }
  ];
}

module.exports = { applyWarfareMode, getWarfareModeDescriptions, WARFARE_MODES };
