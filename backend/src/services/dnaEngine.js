/**
 * Coder's DNA Behavioral Scoring Engine
 * Phase 3 — Computes 6 core behavioral indices from telemetry
 * Phase 4 — Builds aggregated DNA profile with analytical summary
 * Phase 9 — Hiring Radar Score computation
 */

// ─── NORMALIZATION UTILITIES ───────────────────────────────────────────────

const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));

/**
 * Normalize a value to 0–100 using min-max scaling.
 * lowerIsBetter = true means smaller raw value → higher score.
 */
function normalize(value, min, max, lowerIsBetter = false) {
  if (max === min) return lowerIsBetter ? 100 : 50;
  const ratio = (value - min) / (max - min);
  return clamp(lowerIsBetter ? (1 - ratio) * 100 : ratio * 100);
}

/** Average delay benchmarks by difficulty (ms) */
const AVG_DELAYS = { easy: 4000, medium: 8000, hard: 15000 };
const AVG_SOLVE  = { easy: 300000, medium: 900000, hard: 2400000 }; // ms

// ─── INDEX 1: PLANNING DEPTH SCORE ────────────────────────────────────────
/**
 * High planning depth = long deliberate pause before first keystroke
 * combined with high first-attempt correctness.
 * Score = 0.55 * delayScore + 0.45 * firstAttemptBonus
 */
function computePlanningDepth(sessions) {
  if (!sessions.length) return 0;
  const scores = sessions.map(s => {
    const avgDelay = AVG_DELAYS[s.difficulty_level] || AVG_DELAYS.medium;
    // Bonus: delay up to 3× the average earns full planning points
    const delayRatio = Math.min(s.first_keystroke_delay / (avgDelay * 3), 1);
    const delayScore = delayRatio * 100;
    const firstBonus = s.first_attempt_success ? 100 : s.test_pass_ratio * 100;
    return clamp(0.55 * delayScore + 0.45 * firstBonus);
  });
  return clamp(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// ─── INDEX 2: STABILITY SCORE ─────────────────────────────────────────────
/**
 * Cognitive calmness: penalize backspace spikes, rewrites, tab switching.
 * Base = 100, subtract weighted penalty events.
 */
function computeStability(sessions) {
  if (!sessions.length) return 0;
  const scores = sessions.map(s => {
    const totalKeys = Math.max(s.backspace_count + s.rewrite_count + 100, 100);
    const backspaceRate = s.backspace_count / totalKeys;
    const rewritePenalty = Math.min(s.rewrite_count * 5, 30);
    const tabPenalty = Math.min(s.tab_switch_events * 3, 25);
    const pastePenalty = Math.min(s.paste_events * 8, 20);
    const penalty = backspaceRate * 25 + rewritePenalty + tabPenalty + pastePenalty;
    return clamp(100 - penalty);
  });
  return clamp(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// ─── INDEX 3: DEBUG EFFICIENCY SCORE ──────────────────────────────────────
/**
 * Measures how quickly and cleanly errors are resolved.
 * Fast error correction + few compile cycles = high score.
 */
function computeDebugEfficiency(sessions) {
  if (!sessions.length) return 0;
  const scores = sessions.map(s => {
    if (s.run_attempts === 0) return 50; // no data
    // Error-to-run ratio: fewer errors per run = better
    const compileRate = s.compile_errors / Math.max(s.run_attempts, 1);
    const logicalRate = s.logical_errors / Math.max(s.run_attempts, 1);
    const errorPenalty = Math.min((compileRate * 20 + logicalRate * 25), 70);
    // Time efficiency: solve in less than expected time = bonus
    const expectedTime = AVG_SOLVE[s.difficulty_level] || AVG_SOLVE.medium;
    const timeRatio = s.total_solve_time / expectedTime;
    const timeBonus = timeRatio < 1 ? (1 - timeRatio) * 20 : 0;
    return clamp(100 - errorPenalty + timeBonus);
  });
  return clamp(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// ─── INDEX 4: OPTIMIZATION REFLEX SCORE ──────────────────────────────────
/**
 * Detects if the coder attempted to optimize beyond brute force.
 * Factors: optimization_attempts, edge_case_coverage, test pass improvement.
 */
function computeOptimizationReflex(sessions) {
  if (!sessions.length) return 0;
  const scores = sessions.map(s => {
    const optBonus = Math.min(s.optimization_attempts * 20, 50);
    const edgeBonus = s.edge_case_coverage * 30;
    const passBonus = s.test_pass_ratio * 20;
    return clamp(optBonus + edgeBonus + passBonus);
  });
  return clamp(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// ─── INDEX 5: COGNITIVE ADAPTABILITY SCORE ───────────────────────────────
/**
 * Measures recovery from failure.
 * Sessions where user failed then recovered get higher scores.
 */
function computeCognitiveAdaptability(sessions) {
  if (!sessions.length) return 0;
  const scores = sessions.map(s => {
    const hadErrors = (s.compile_errors + s.logical_errors) > 0;
    const finallyPassed = s.test_pass_ratio > 0.8;
    // Scored on recovery: failed → succeeded pattern
    if (hadErrors && finallyPassed) {
      const recoverySpeed = Math.max(0, 100 - (s.run_attempts - 1) * 10);
      return clamp(50 + recoverySpeed * 0.5);
    }
    if (!hadErrors && finallyPassed) return 85; // clean run, good but no stress test
    if (!finallyPassed) return clamp(s.test_pass_ratio * 60);
    return 50;
  });
  return clamp(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// ─── INDEX 6: LEARNING VELOCITY SCORE ────────────────────────────────────
/**
 * Trend of improvement across similar problem categories.
 * Uses linear regression slope of pass ratios over time.
 */
function computeLearningVelocity(sessions) {
  if (sessions.length < 3) return 50; // not enough data
  // Sort chronologically
  const sorted = [...sessions].sort((a, b) =>
    new Date(a.created_at) - new Date(b.created_at)
  );
  const n = sorted.length;
  const x = sorted.map((_, i) => i);
  const y = sorted.map(s => s.test_pass_ratio * 100);
  // Linear regression slope
  const sumX  = x.reduce((a, b) => a + b, 0);
  const sumY  = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, xi, i) => a + xi * y[i], 0);
  const sumX2 = x.reduce((a, xi) => a + xi * xi, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
  // Positive slope = improving. Map slope to 0-100.
  const velocityScore = clamp(50 + slope * 15);
  return velocityScore;
}

// ─── VOLATILITY INDEX ────────────────────────────────────────────────────
/**
 * Measures inconsistency across sessions. Lower is better.
 * = std deviation of test_pass_ratio
 */
function computeVolatilityIndex(sessions) {
  if (sessions.length < 2) return 0;
  const ratios = sessions.map(s => s.test_pass_ratio * 100);
  const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  const variance = ratios.reduce((a, v) => a + Math.pow(v - mean, 2), 0) / ratios.length;
  return clamp(Math.sqrt(variance));
}

// ─── DNA PROFILE BUILDER ─────────────────────────────────────────────────
/**
 * Compute all indices from raw sessions and build structured profile.
 */
function buildDNAProfile(userId, sessions) {
  if (!sessions || sessions.length === 0) {
    return {
      userId,
      planningDepth:         0,
      stability:             0,
      debugEfficiency:       0,
      optimizationReflex:    0,
      cognitiveAdaptability: 0,
      learningVelocity:      0,
      volatilityIndex:       0,
      sessionsCounted:       0,
      overallDNAScore:       0,
      hiringRadarScore:      0,
      analyticalSummary:     [],
      strengthZones:         [],
      improvementAreas:      [],
      interviewReadiness:    0
    };
  }

  const planningDepth         = computePlanningDepth(sessions);
  const stability             = computeStability(sessions);
  const debugEfficiency       = computeDebugEfficiency(sessions);
  const optimizationReflex    = computeOptimizationReflex(sessions);
  const cognitiveAdaptability = computeCognitiveAdaptability(sessions);
  const learningVelocity      = computeLearningVelocity(sessions);
  const volatilityIndex       = computeVolatilityIndex(sessions);

  const overallDNAScore = clamp(
    planningDepth         * 0.20 +
    stability             * 0.18 +
    debugEfficiency       * 0.18 +
    optimizationReflex    * 0.16 +
    cognitiveAdaptability * 0.14 +
    learningVelocity      * 0.14
  );

  // ─── HIRING RADAR SCORE ────────────────────────────────────────
  const difficultyWeight = sessions.reduce((acc, s) => {
    const w = { easy: 1, medium: 1.5, hard: 2 };
    return acc + (w[s.difficulty_level] || 1.5);
  }, 0) / sessions.length;

  const consistencyBonus = Math.max(0, 100 - volatilityIndex);
  const hiringRadarScore = clamp(
    overallDNAScore   * 0.40 +
    debugEfficiency   * 0.20 +
    consistencyBonus  * 0.20 +
    difficultyWeight  * 20  * 0.20
  );

  // ─── ANALYTICAL SUMMARY (no generic AI praise) ────────────────
  const analyticalSummary = generateAnalyticalSummary({
    planningDepth, stability, debugEfficiency,
    optimizationReflex, cognitiveAdaptability, learningVelocity,
    volatilityIndex, sessions
  });

  const strengthZones     = getStrengthZones(planningDepth, stability, debugEfficiency, optimizationReflex, cognitiveAdaptability, learningVelocity);
  const improvementAreas  = getImprovementAreas(planningDepth, stability, debugEfficiency, optimizationReflex, cognitiveAdaptability, learningVelocity);
  const interviewReadiness = computeInterviewReadiness(overallDNAScore, volatilityIndex, sessions.length, debugEfficiency);

  return {
    userId,
    planningDepth:         Math.round(planningDepth),
    stability:             Math.round(stability),
    debugEfficiency:       Math.round(debugEfficiency),
    optimizationReflex:    Math.round(optimizationReflex),
    cognitiveAdaptability: Math.round(cognitiveAdaptability),
    learningVelocity:      Math.round(learningVelocity),
    volatilityIndex:       Math.round(volatilityIndex),
    sessionsCounted:       sessions.length,
    overallDNAScore:       Math.round(overallDNAScore),
    hiringRadarScore:      Math.round(hiringRadarScore),
    analyticalSummary,
    strengthZones,
    improvementAreas,
    interviewReadiness
  };
}

// ─── ANALYTICAL SUMMARY GENERATOR ────────────────────────────────────────
function generateAnalyticalSummary(data) {
  const {
    planningDepth, stability, debugEfficiency,
    optimizationReflex, cognitiveAdaptability, learningVelocity,
    volatilityIndex, sessions
  } = data;

  const lines = [];
  const n = sessions.length;
  const recentSessions = sessions.slice(0, 10);

  // Planning
  if (planningDepth > 75) {
    lines.push(`Deliberate problem analysis before implementation detected across ${n} sessions. Planning-to-accuracy correlation is strong.`);
  } else if (planningDepth < 40) {
    lines.push(`Pattern: immediate coding without solution planning. First-attempt success rate is low as a direct consequence.`);
  }

  // Stability
  const avgBackspace = recentSessions.reduce((a, s) => a + s.backspace_count, 0) / (recentSessions.length || 1);
  if (stability > 75) {
    lines.push(`Code composition is clean — low backspace density (avg ${Math.round(avgBackspace)}/session) indicates confident implementation.`);
  } else if (stability < 50) {
    lines.push(`High cognitive churn detected: avg ${Math.round(avgBackspace)} backspaces/session. Suggests mid-implementation strategy pivots.`);
  }

  // Debug
  const avgCompile = recentSessions.reduce((a, s) => a + s.compile_errors, 0) / (recentSessions.length || 1);
  if (debugEfficiency > 70) {
    lines.push(`Debug cycle time is efficient. Compile error frequency (${avgCompile.toFixed(1)}/session) is trending down.`);
  } else if (debugEfficiency < 45) {
    lines.push(`Slow debug cycles: ${avgCompile.toFixed(1)} compile errors/session on average. Error identification is taking disproportionate time.`);
  }

  // Optimization
  if (optimizationReflex > 65) {
    lines.push(`Optimization instinct is active — follow-up complexity reduction attempts detected in recent problems.`);
  } else if (optimizationReflex < 35) {
    lines.push(`Solutions consistently stop at first-passing implementation. No optimization pass observed in ${n} sessions.`);
  }

  // Adaptability
  if (cognitiveAdaptability > 70) {
    lines.push(`Strong recovery behavior: error → analysis → correction cycles complete within expected bounds.`);
  }

  // Velocity
  if (learningVelocity > 65 && n >= 5) {
    lines.push(`Performance trend across similar problem patterns is positive. Speed-accuracy curve improving over last ${Math.min(n, 10)} sessions.`);
  } else if (learningVelocity < 40 && n >= 5) {
    lines.push(`Stagnation pattern detected: no measurable improvement in pass rate across last ${Math.min(n, 10)} sessions.`);
  }

  // Volatility
  if (volatilityIndex > 30) {
    lines.push(`High performance volatility (σ = ${Math.round(volatilityIndex)}). Results are inconsistent across similar difficulty problems.`);
  } else if (volatilityIndex < 10 && n >= 5) {
    lines.push(`Performance consistency is high (σ = ${Math.round(volatilityIndex)}). Reliable output under repeatable conditions.`);
  }

  return lines.length > 0 ? lines : [
    `${n} session(s) recorded. Accumulate more sessions for a full behavioral analysis.`
  ];
}

function getStrengthZones(...scores) {
  const labels = ['Planning Depth', 'Stability', 'Debug Efficiency', 'Optimization Reflex', 'Cognitive Adaptability', 'Learning Velocity'];
  return labels.filter((_, i) => scores[i] >= 65);
}

function getImprovementAreas(...scores) {
  const labels = ['Planning Depth', 'Stability', 'Debug Efficiency', 'Optimization Reflex', 'Cognitive Adaptability', 'Learning Velocity'];
  return labels.filter((_, i) => scores[i] < 50);
}

function computeInterviewReadiness(overallDNA, volatility, sessionCount, debugEff) {
  if (sessionCount < 5) return Math.min(overallDNA * 0.5, 40); // not enough data
  const consistencyPenalty = Math.max(0, volatility - 20) * 0.5;
  const raw = overallDNA * 0.6 + debugEff * 0.4 - consistencyPenalty;
  return clamp(Math.round(raw));
}

module.exports = { buildDNAProfile, computeVolatilityIndex };
