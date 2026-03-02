/**
 * Coder's DNA Controller — All API endpoints
 */
const CodersDNA  = require('../models/CodersDNA');
const { buildDNAProfile }       = require('../services/dnaEngine');
const { evaluateBadges, getBadgeCatalog } = require('../services/badgeEngine');
const { applyWarfareMode, getWarfareModeDescriptions } = require('../services/cognitiveWarfare');
const { generateAIFeedback }    = require('../services/dnaAIFeedback');

// ─── TELEMETRY ────────────────────────────────────────────────────────────

/**
 * POST /api/coders-dna/telemetry
 * Ingest session telemetry, recompute DNA, check badges.
 */
async function ingestTelemetry(req, res, next) {
  try {
    const userId = req.userId;
    const data   = { ...req.body, userId };

    // 1. Store raw telemetry
    const sessionId = await CodersDNA.saveTelemetry(data);

    // 2. Get all sessions for recompute
    const sessions = await CodersDNA.getRecentSessions(userId, 100);

    // 3. Rebuild DNA profile
    const profile = buildDNAProfile(userId, sessions);

    // 4. Persist updated scores
    await CodersDNA.upsertDNAScore(userId, {
      planningDepth:         profile.planningDepth,
      stability:             profile.stability,
      debugEfficiency:       profile.debugEfficiency,
      optimizationReflex:    profile.optimizationReflex,
      cognitiveAdaptability: profile.cognitiveAdaptability,
      learningVelocity:      profile.learningVelocity,
      volatilityIndex:       profile.volatilityIndex,
      sessionsCounted:       profile.sessionsCounted,
      hiringRadarScore:      profile.hiringRadarScore
    });

    // 5. Badge evaluation
    const existingBadges = await CodersDNA.getUserBadges(userId);
    const existingIds    = existingBadges.map(b => b.badge_id);
    const newBadges      = evaluateBadges(profile, sessions, existingIds);
    for (const badge of newBadges) {
      await CodersDNA.awardBadge(userId, badge);
    }

    res.status(201).json({
      sessionId,
      dnaUpdated: true,
      newBadgesEarned: newBadges,
      currentDNA: {
        overallDNAScore:   profile.overallDNAScore,
        volatilityIndex:   profile.volatilityIndex,
        sessionsCounted:   profile.sessionsCounted
      }
    });
  } catch (err) { next(err); }
}

// ─── DNA PROFILE ─────────────────────────────────────────────────────────

/**
 * GET /api/coders-dna/profile
 * Full DNA profile with analytics, badges, and hiring radar.
 */
async function getDNAProfile(req, res, next) {
  try {
    const userId  = req.userId;
    const sessions = await CodersDNA.getRecentSessions(userId, 100);
    const profile  = buildDNAProfile(userId, sessions);

    // Persist fresh scores
    if (sessions.length > 0) {
      await CodersDNA.upsertDNAScore(userId, {
        planningDepth:         profile.planningDepth,
        stability:             profile.stability,
        debugEfficiency:       profile.debugEfficiency,
        optimizationReflex:    profile.optimizationReflex,
        cognitiveAdaptability: profile.cognitiveAdaptability,
        learningVelocity:      profile.learningVelocity,
        volatilityIndex:       profile.volatilityIndex,
        sessionsCounted:       profile.sessionsCounted,
        hiringRadarScore:      profile.hiringRadarScore
      });
    }

    const badges   = await CodersDNA.getUserBadges(userId);
    const catalog  = getBadgeCatalog(badges.map(b => b.badge_id));

    res.json({
      profile,
      badges,
      badgeCatalog: catalog,
      radarData: {
        labels: ['Planning', 'Stability', 'Debug', 'Optimization', 'Adaptability', 'Velocity'],
        values: [
          profile.planningDepth,
          profile.stability,
          profile.debugEfficiency,
          profile.optimizationReflex,
          profile.cognitiveAdaptability,
          profile.learningVelocity
        ]
      }
    });
  } catch (err) { next(err); }
}

// ─── SESSION HISTORY ─────────────────────────────────────────────────────

/**
 * GET /api/coders-dna/sessions?limit=50
 */
async function getSessionHistory(req, res, next) {
  try {
    const limit    = parseInt(req.query.limit) || 50;
    const sessions = await CodersDNA.getSessionsByUser(req.userId, limit);
    res.json({ sessions, total: sessions.length });
  } catch (err) { next(err); }
}

// ─── PROBLEMS ─────────────────────────────────────────────────────────────

/**
 * GET /api/coders-dna/problems?difficulty=medium&mode=stress
 */
async function getProblems(req, res, next) {
  try {
    const { difficulty, mode } = req.query;
    let problems = await CodersDNA.getAllProblems(difficulty || null);

    if (mode && mode !== 'normal') {
      problems = problems.map(p => applyWarfareMode(p, mode));
    }

    // Parse JSON fields
    problems = problems.map(parseProblemFields);

    res.json({ problems, warfareModes: getWarfareModeDescriptions() });
  } catch (err) { next(err); }
}

/**
 * GET /api/coders-dna/problems/:slug?mode=deception
 */
async function getProblem(req, res, next) {
  try {
    let problem = await CodersDNA.getProblemBySlug(req.params.slug);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const mode = req.query.mode;
    if (mode && mode !== 'normal') {
      problem = applyWarfareMode(problem, mode);
    }

    res.json({ problem: parseProblemFields(problem) });
  } catch (err) { next(err); }
}

// ─── AI FEEDBACK ─────────────────────────────────────────────────────────

/**
 * POST /api/coders-dna/ai-feedback
 * Body: { code, telemetry }
 */
async function getAIFeedback(req, res, next) {
  try {
    const userId        = req.userId;
    const { code, telemetry } = req.body;

    const dnaScore      = await CodersDNA.getDNAScore(userId);
    const recentSessions = await CodersDNA.getRecentSessions(userId, 20);
    const profile       = buildDNAProfile(userId, recentSessions);

    const feedback = generateAIFeedback({
      code,
      telemetry: telemetry || {},
      dnaProfile: { ...profile, ...(dnaScore || {}) },
      recentSessions
    });

    res.json({ feedback });
  } catch (err) { next(err); }
}

// ─── HIRING RADAR ─────────────────────────────────────────────────────────

/**
 * GET /api/coders-dna/hiring-radar
 * Returns recruiter-facing summary.
 */
async function getHiringRadar(req, res, next) {
  try {
    const userId   = req.userId;
    const sessions = await CodersDNA.getRecentSessions(userId, 100);
    const profile  = buildDNAProfile(userId, sessions);
    const badges   = await CodersDNA.getUserBadges(userId);

    const strengthZones    = profile.strengthZones;
    const reliabilityIndex = Math.max(0, 100 - profile.volatilityIndex);

    res.json({
      hiringRadarScore:   profile.hiringRadarScore,
      overallDNAScore:    profile.overallDNAScore,
      strengthZones,
      reliabilityIndex:   Math.round(reliabilityIndex),
      pressureResilience: profile.cognitiveAdaptability,
      interviewReadiness: profile.interviewReadiness,
      sessionsCounted:    profile.sessionsCounted,
      badgeCount:         badges.length,
      analyticalSummary:  profile.analyticalSummary,
      indices: {
        planningDepth:         profile.planningDepth,
        stability:             profile.stability,
        debugEfficiency:       profile.debugEfficiency,
        optimizationReflex:    profile.optimizationReflex,
        cognitiveAdaptability: profile.cognitiveAdaptability,
        learningVelocity:      profile.learningVelocity
      }
    });
  } catch (err) { next(err); }
}

// ─── WARFARE MODES ────────────────────────────────────────────────────────

/**
 * GET /api/coders-dna/warfare-modes
 */
function getWarfareModes(req, res) {
  res.json({ modes: getWarfareModeDescriptions() });
}

// ─── HELPERS ─────────────────────────────────────────────────────────────

function parseProblemFields(p) {
  try { p.constraints = JSON.parse(p.constraints); } catch { /**/ }
  try { p.test_cases  = JSON.parse(p.test_cases);  } catch { /**/ }
  try { p.tags        = JSON.parse(p.tags);        } catch { /**/ }
  if (p.warfareConfig && typeof p.warfareConfig === 'string') {
    try { p.warfareConfig = JSON.parse(p.warfareConfig); } catch { /**/ }
  }
  return p;
}

module.exports = {
  ingestTelemetry,
  getDNAProfile,
  getSessionHistory,
  getProblems,
  getProblem,
  getAIFeedback,
  getHiringRadar,
  getWarfareModes
};
