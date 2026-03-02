/**
 * SkillForge — Coder's DNA Telemetry Tracker
 * Phase 1: Behavioral event instrumentation for the coding arena.
 *
 * Usage: Include this script in the coding arena HTML.
 * It automatically attaches to the editor and tracks all behavioral signals.
 */

const CodersDNATracker = (function () {
  'use strict';

  const API_BASE = 'http://localhost:5000/api/coders-dna';

  // ─── SESSION STATE ──────────────────────────────────────────────────────
  let dnaSession = {
    startTime:            null,
    firstKeystrokeDelay:  null,
    backspaceCount:       0,
    rewriteCount:         0,
    runAttempts:          0,
    compileErrors:        0,
    logicalErrors:        0,
    tabSwitches:          0,
    problemSwitches:      0,
    optimizationAttempts: 0,
    pasteCount:           0,
    idleTimeSpikes:       0,
    testPassRatio:        0,
    firstAttemptSuccess:  false,
    edgeCaseCoverage:     0,
    totalSolveTime:       0
  };

  let currentProblemId   = null;
  let currentDifficulty  = 'medium';
  let currentLanguage    = 'javascript';
  let warfareMode        = null;
  let hasFirstKeystroke  = false;
  let sessionActive      = false;
  let idleTimer          = null;
  let isFirstRun         = true;
  let lastCodeSnapshot   = '';
  let currentCode        = '';

  // ─── SESSION INIT ────────────────────────────────────────────────────────

  function startSession(problemId, difficulty = 'medium', language = 'javascript', mode = null) {
    currentProblemId  = problemId;
    currentDifficulty = difficulty;
    currentLanguage   = language;
    warfareMode       = mode;
    sessionActive     = true;
    hasFirstKeystroke = false;
    isFirstRun        = true;
    lastCodeSnapshot  = '';
    currentCode       = '';

    dnaSession = {
      startTime:            Date.now(),
      firstKeystrokeDelay:  null,
      backspaceCount:       0,
      rewriteCount:         0,
      runAttempts:          0,
      compileErrors:        0,
      logicalErrors:        0,
      tabSwitches:          0,
      problemSwitches:      0,
      optimizationAttempts: 0,
      pasteCount:           0,
      idleTimeSpikes:       0,
      testPassRatio:        0,
      firstAttemptSuccess:  false,
      edgeCaseCoverage:     0,
      totalSolveTime:       0
    };

    console.log('[DNA Tracker] Session started:', problemId, difficulty, mode || 'normal');
    resetIdleTimer();
  }

  function endSession() {
    sessionActive = false;
    clearTimeout(idleTimer);
    console.log('[DNA Tracker] Session ended');
  }

  // ─── EDITOR ATTACHMENT ───────────────────────────────────────────────────

  /**
   * Attach to any textarea or contenteditable element that is the code editor.
   */
  function attachToEditor(editorEl) {
    if (!editorEl) return;

    // Keystroke tracking
    editorEl.addEventListener('keydown', handleKeydown);
    editorEl.addEventListener('input',   handleInput);

    // Paste tracking
    editorEl.addEventListener('paste', () => {
      if (!sessionActive) return;
      dnaSession.pasteCount++;
    });

    // Focus/blur (idle detection)
    editorEl.addEventListener('focus', () => resetIdleTimer());
    editorEl.addEventListener('blur',  () => handleBlur());

    console.log('[DNA Tracker] Attached to editor');
  }

  function handleKeydown(e) {
    if (!sessionActive) return;

    // First keystroke delay
    if (!hasFirstKeystroke) {
      hasFirstKeystroke = true;
      dnaSession.firstKeystrokeDelay = dnaSession.startTime
        ? Date.now() - dnaSession.startTime
        : 0;
    }

    // Backspace tracking
    if (e.key === 'Backspace') {
      dnaSession.backspaceCount++;
    }

    resetIdleTimer();
  }

  function handleInput(e) {
    if (!sessionActive) return;
    const newCode = e.target.value || e.target.innerText || '';
    currentCode   = newCode;

    // Detect major rewrites (code length drops significantly)
    if (lastCodeSnapshot.length > 80 &&
        newCode.length < lastCodeSnapshot.length * 0.5) {
      dnaSession.rewriteCount++;
    }

    // Detect optimization attempts (adding complexity annotations or second pass)
    if (/O\(n\)|O\(1\)|O\(log n\)|optimize|memo|cache/i.test(newCode) &&
        !/O\(n\)|O\(1\)|O\(log n\)|optimize|memo|cache/i.test(lastCodeSnapshot)) {
      dnaSession.optimizationAttempts++;
    }

    if (newCode.length > 50) lastCodeSnapshot = newCode;
    resetIdleTimer();
  }

  function handleBlur() {
    // Short blur is normal tab switch
    dnaSession.tabSwitches++;
  }

  // ─── IDLE DETECTION ──────────────────────────────────────────────────────

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    if (!sessionActive) return;
    // 90 seconds of inactivity = idle spike
    idleTimer = setTimeout(() => {
      dnaSession.idleTimeSpikes++;
      console.log('[DNA Tracker] Idle spike detected');
    }, 90000);
  }

  // ─── RUN / SUBMIT EVENTS ─────────────────────────────────────────────────

  function onRunAttempt(passRatio = 0, hasCompileError = false, hasLogicalError = false) {
    if (!sessionActive) return;

    dnaSession.runAttempts++;

    if (hasCompileError)  dnaSession.compileErrors++;
    if (hasLogicalError)  dnaSession.logicalErrors++;

    if (isFirstRun) {
      dnaSession.firstAttemptSuccess = passRatio === 1.0;
      isFirstRun = false;
    }

    dnaSession.testPassRatio = passRatio;

    // Detect optimization attempt: re-runs after solving = optimization pass
    if (passRatio >= 0.8 && dnaSession.runAttempts > 1) {
      dnaSession.optimizationAttempts = Math.max(dnaSession.optimizationAttempts, 1);
    }
  }

  function onSubmit(passRatio = 0, verdict = 'accepted') {
    if (!sessionActive) return;
    dnaSession.testPassRatio        = passRatio;
    dnaSession.totalSolveTime       = Date.now() - dnaSession.startTime;
    dnaSession.firstAttemptSuccess  = verdict === 'accepted' && dnaSession.runAttempts <= 1;

    // Estimate edge case coverage from pass ratio + test cases
    dnaSession.edgeCaseCoverage = passRatio;

    // Send telemetry automatically on submit
    sendTelemetry(currentCode, verdict);
  }

  // ─── SEND TELEMETRY ───────────────────────────────────────────────────────

  async function sendTelemetry(code = '', verdict = 'pending') {
    if (!currentProblemId) return;

    const token = window.AuthHelper?.getToken?.() ||
                  localStorage.getItem('authToken') ||
                  localStorage.getItem('token');
    if (!token) { console.warn('[DNA Tracker] No auth token'); return; }

    const payload = {
      problemId:            currentProblemId,
      difficultyLevel:      currentDifficulty,
      warfareMode:          warfareMode,
      firstKeystrokeDelay:  dnaSession.firstKeystrokeDelay || 0,
      totalSolveTime:       dnaSession.totalSolveTime || (Date.now() - dnaSession.startTime),
      backspaceCount:       dnaSession.backspaceCount,
      rewriteCount:         dnaSession.rewriteCount,
      runAttempts:          dnaSession.runAttempts,
      compileErrors:        dnaSession.compileErrors,
      logicalErrors:        dnaSession.logicalErrors,
      tabSwitchEvents:      dnaSession.tabSwitches,
      problemSwitchEvents:  dnaSession.problemSwitches,
      optimizationAttempts: dnaSession.optimizationAttempts,
      edgeCaseCoverage:     dnaSession.edgeCaseCoverage,
      idleTimeSpikes:       dnaSession.idleTimeSpikes,
      pasteEvents:          dnaSession.pasteCount,
      testPassRatio:        dnaSession.testPassRatio,
      firstAttemptSuccess:  dnaSession.firstAttemptSuccess,
      language:             currentLanguage,
      finalCode:            code,
      submissionVerdict:    verdict
    };

    try {
      const resp = await fetch(`${API_BASE}/telemetry`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (resp.ok) {
        console.log('[DNA Tracker] Telemetry sent. DNA updated.', data);
        if (data.newBadgesEarned?.length) {
          showBadgeNotifications(data.newBadgesEarned);
        }
        // Dispatch event for dashboard to listen to
        window.dispatchEvent(new CustomEvent('dna:updated', { detail: data }));
      }
    } catch (e) {
      console.warn('[DNA Tracker] Telemetry send failed:', e.message);
    }
  }

  // ─── BADGE NOTIFICATIONS ─────────────────────────────────────────────────

  function showBadgeNotifications(badges) {
    for (const badge of badges) {
      const toast = document.createElement('div');
      toast.className = 'dna-badge-toast';
      toast.innerHTML = `
        <div class="dna-badge-toast-inner">
          <span class="dna-badge-toast-icon">${badge.icon || '🏆'}</span>
          <div>
            <div class="dna-badge-toast-title">Badge Unlocked</div>
            <div class="dna-badge-toast-name">${badge.name}</div>
          </div>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.classList.add('visible'), 50);
      setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 400);
      }, 4000);
    }
  }

  // ─── PROBLEM SWITCH TRACKING ─────────────────────────────────────────────

  function onProblemSwitch() {
    if (!sessionActive) return;
    dnaSession.problemSwitches++;
  }

  // ─── READ CURRENT SNAPSHOT ───────────────────────────────────────────────

  function getSnapshot() {
    return {
      ...dnaSession,
      currentProblemId,
      currentDifficulty,
      warfareMode,
      elapsedMs: dnaSession.startTime ? Date.now() - dnaSession.startTime : 0
    };
  }

  // ─── PUBLIC API ──────────────────────────────────────────────────────────

  return {
    startSession,
    endSession,
    attachToEditor,
    onRunAttempt,
    onSubmit,
    onProblemSwitch,
    sendTelemetry,
    getSnapshot
  };

})();

// Global export
window.CodersDNATracker = CodersDNATracker;
