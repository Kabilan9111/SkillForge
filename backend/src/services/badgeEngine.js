/**
 * Badge Rule Engine — Phase 5
 * Badge eligibility is sustained-performance based, not one-time events.
 * All badges require consistent metric thresholds over minimum session counts.
 */

const BADGE_DEFINITIONS = [
  // ─── PLANNING ─────────────────────────────────────────────────────────
  {
    id: 'strategic_planner',
    name: 'Strategic Planner',
    tier: 'silver',
    icon: '🧠',
    description: 'Consistent deliberate planning before implementation',
    check: (profile, sessions) =>
      profile.planningDepth > 75 &&
      firstAttemptSuccessRate(sessions) > 60 &&
      sessions.length >= 20
  },
  {
    id: 'first_strike',
    name: 'First Strike',
    tier: 'bronze',
    icon: '⚡',
    description: 'High first-attempt success rate on medium+ problems',
    check: (profile, sessions) => {
      const mediumPlus = sessions.filter(s => s.difficulty_level !== 'easy');
      return mediumPlus.length >= 5 && firstAttemptSuccessRate(mediumPlus) > 70;
    }
  },

  // ─── STABILITY ────────────────────────────────────────────────────────
  {
    id: 'iron_focus',
    name: 'Iron Focus',
    tier: 'silver',
    icon: '🔩',
    description: 'Exceptionally low cognitive noise across 15+ sessions',
    check: (profile) =>
      profile.stability > 80 && profile.sessionsCounted >= 15
  },
  {
    id: 'clean_coder',
    name: 'Clean Coder',
    tier: 'bronze',
    icon: '✨',
    description: 'Low backspace and rewrite rate over 10 sessions',
    check: (profile, sessions) => {
      const avgBackspace = sessions.reduce((a, s) => a + s.backspace_count, 0) / sessions.length;
      return avgBackspace < 15 && sessions.length >= 10 && profile.stability > 70;
    }
  },

  // ─── DEBUG ────────────────────────────────────────────────────────────
  {
    id: 'bug_exterminator',
    name: 'Bug Exterminator',
    tier: 'gold',
    icon: '🔬',
    description: 'Sustained high debug efficiency across 25+ sessions',
    check: (profile) =>
      profile.debugEfficiency > 80 && profile.sessionsCounted >= 25
  },
  {
    id: 'rapid_debug',
    name: 'Rapid Debug',
    tier: 'bronze',
    icon: '🔍',
    description: 'Consistently resolves compile errors quickly',
    check: (profile, sessions) => {
      const avgCompileErrors = sessions.reduce((a, s) => a + s.compile_errors, 0) / sessions.length;
      return avgCompileErrors < 2 && sessions.length >= 10;
    }
  },

  // ─── OPTIMIZATION ─────────────────────────────────────────────────────
  {
    id: 'optimizer',
    name: 'The Optimizer',
    tier: 'silver',
    icon: '⚙️',
    description: 'Active optimization attempts across most sessions',
    check: (profile, sessions) => {
      const optSessions = sessions.filter(s => s.optimization_attempts > 0);
      return optSessions.length / sessions.length > 0.6 && sessions.length >= 15;
    }
  },
  {
    id: 'complexity_hunter',
    name: 'Complexity Hunter',
    tier: 'gold',
    icon: '🎯',
    description: 'Achieves optimal complexity in 70%+ of hard problems',
    check: (profile, sessions) => {
      const hard = sessions.filter(s => s.difficulty_level === 'hard');
      if (hard.length < 5) return false;
      const optHard = hard.filter(s => s.optimization_attempts > 0 && s.test_pass_ratio > 0.9);
      return optHard.length / hard.length > 0.7;
    }
  },

  // ─── ADAPTABILITY ─────────────────────────────────────────────────────
  {
    id: 'resilient_mind',
    name: 'Resilient Mind',
    tier: 'silver',
    icon: '🛡️',
    description: 'Consistently recovers from failure and reaches correct solution',
    check: (profile) =>
      profile.cognitiveAdaptability > 75 && profile.sessionsCounted >= 15
  },
  {
    id: 'pressure_proof',
    name: 'Pressure Proof',
    tier: 'gold',
    icon: '🔥',
    description: 'High performance maintained under Cognitive Warfare conditions',
    check: (profile, sessions) => {
      const warfareSessions = sessions.filter(s => s.warfare_mode !== null);
      if (warfareSessions.length < 5) return false;
      const avgPass = warfareSessions.reduce((a, s) => a + s.test_pass_ratio, 0) / warfareSessions.length;
      return avgPass > 0.75;
    }
  },

  // ─── LEARNING ─────────────────────────────────────────────────────────
  {
    id: 'velocity_coder',
    name: 'Velocity Coder',
    tier: 'silver',
    icon: '📈',
    description: 'Measurable improvement trend across 20+ sessions',
    check: (profile) =>
      profile.learningVelocity > 70 && profile.sessionsCounted >= 20
  },

  // ─── OVERALL / GRANDMASTER ────────────────────────────────────────────
  {
    id: 'elite_coder',
    name: 'Elite Coder',
    tier: 'platinum',
    icon: '💎',
    description: 'All core DNA indices above 70, sustained over 40 sessions',
    check: (profile) =>
      profile.planningDepth > 70 &&
      profile.stability > 70 &&
      profile.debugEfficiency > 70 &&
      profile.optimizationReflex > 70 &&
      profile.cognitiveAdaptability > 70 &&
      profile.learningVelocity > 70 &&
      profile.sessionsCounted >= 40
  },
  {
    id: 'grandmaster_dna',
    name: 'Grandmaster DNA',
    tier: 'diamond',
    icon: '👑',
    description: 'All indices > 85, volatility < 10%, sustained 60+ sessions',
    check: (profile) =>
      profile.planningDepth > 85 &&
      profile.stability > 85 &&
      profile.debugEfficiency > 85 &&
      profile.optimizationReflex > 85 &&
      profile.cognitiveAdaptability > 85 &&
      profile.learningVelocity > 85 &&
      profile.volatilityIndex < 10 &&
      profile.sessionsCounted >= 60
  },

  // ─── DECEPTION ────────────────────────────────────────────────────────
  {
    id: 'deception_detector',
    name: 'Deception Detector',
    tier: 'gold',
    icon: '👁️',
    description: 'Correctly identified and fixed subtly deceptive code',
    check: (profile, sessions) => {
      const deceptSessions = sessions.filter(s =>
        s.problem_id.includes('deception') && s.test_pass_ratio === 1
      );
      return deceptSessions.length >= 3;
    }
  }
];

function firstAttemptSuccessRate(sessions) {
  if (!sessions.length) return 0;
  return (sessions.filter(s => s.first_attempt_success).length / sessions.length) * 100;
}

/**
 * Evaluate which badges a user has earned and return newly unlocked ones.
 */
function evaluateBadges(profile, sessions, existingBadgeIds = []) {
  const earned = [];
  for (const badge of BADGE_DEFINITIONS) {
    if (existingBadgeIds.includes(badge.id)) continue;
    try {
      if (badge.check(profile, sessions)) {
        earned.push({
          id: badge.id,
          name: badge.name,
          tier: badge.tier,
          icon: badge.icon,
          description: badge.description,
          conditions: { sessionsCounted: profile.sessionsCounted }
        });
      }
    } catch { /* skip */ }
  }
  return earned;
}

/** Get all badge definitions for display (with locked/unlocked state) */
function getBadgeCatalog(earnedIds = []) {
  return BADGE_DEFINITIONS.map(b => ({
    id: b.id,
    name: b.name,
    tier: b.tier,
    icon: b.icon,
    description: b.description,
    unlocked: earnedIds.includes(b.id)
  }));
}

module.exports = { evaluateBadges, getBadgeCatalog, BADGE_DEFINITIONS };
