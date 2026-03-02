/**
 * Coder's DNA Engine – Database Models
 * Tables: telemetry_sessions, dna_scores, badge_history, dna_problems
 */
const db = require('../config/database');

class CodersDNA {

  // ─── SCHEMA INIT ─────────────────────────────────────────────────────────

  static async initSchema() {
    // Raw behavioral telemetry per solved session
    await db.run(`
      CREATE TABLE IF NOT EXISTS telemetry_sessions (
        id                    INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id               INTEGER NOT NULL,
        problem_id            TEXT    NOT NULL,
        difficulty_level      TEXT    NOT NULL DEFAULT 'medium',
        warfare_mode          TEXT    DEFAULT NULL,
        first_keystroke_delay INTEGER DEFAULT 0,
        total_solve_time      INTEGER DEFAULT 0,
        backspace_count       INTEGER DEFAULT 0,
        rewrite_count         INTEGER DEFAULT 0,
        run_attempts          INTEGER DEFAULT 0,
        compile_errors        INTEGER DEFAULT 0,
        logical_errors        INTEGER DEFAULT 0,
        tab_switch_events     INTEGER DEFAULT 0,
        problem_switch_events INTEGER DEFAULT 0,
        optimization_attempts INTEGER DEFAULT 0,
        edge_case_coverage    REAL    DEFAULT 0,
        idle_time_spikes      INTEGER DEFAULT 0,
        paste_events          INTEGER DEFAULT 0,
        test_pass_ratio       REAL    DEFAULT 0,
        first_attempt_success INTEGER DEFAULT 0,
        language              TEXT    DEFAULT 'javascript',
        final_code            TEXT,
        submission_verdict    TEXT    DEFAULT 'pending',
        created_at            DATETIME DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_telemetry_user_time
        ON telemetry_sessions(user_id, created_at)
    `);

    // Aggregated DNA scores per user (recomputed periodically)
    await db.run(`
      CREATE TABLE IF NOT EXISTS dna_scores (
        id                      INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id                 INTEGER NOT NULL UNIQUE,
        planning_depth          REAL    DEFAULT 0,
        stability               REAL    DEFAULT 0,
        debug_efficiency        REAL    DEFAULT 0,
        optimization_reflex     REAL    DEFAULT 0,
        cognitive_adaptability  REAL    DEFAULT 0,
        learning_velocity       REAL    DEFAULT 0,
        overall_dna_score       REAL    DEFAULT 0,
        volatility_index        REAL    DEFAULT 0,
        sessions_counted        INTEGER DEFAULT 0,
        hiring_radar_score      REAL    DEFAULT 0,
        last_computed           DATETIME DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Badge history with condition metadata
    await db.run(`
      CREATE TABLE IF NOT EXISTS badge_history (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id     INTEGER NOT NULL,
        badge_id    TEXT    NOT NULL,
        badge_name  TEXT    NOT NULL,
        badge_tier  TEXT    NOT NULL DEFAULT 'bronze',
        earned_at   DATETIME DEFAULT (datetime('now')),
        conditions  TEXT,
        UNIQUE(user_id, badge_id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // DNA Problem catalog (warfare-capable problems)
    await db.run(`
      CREATE TABLE IF NOT EXISTS dna_problems (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        slug                TEXT    NOT NULL UNIQUE,
        title               TEXT    NOT NULL,
        difficulty          TEXT    NOT NULL,
        category            TEXT    NOT NULL,
        description         TEXT    NOT NULL,
        constraints         TEXT,
        test_cases          TEXT,
        starter_code        TEXT,
        optimal_complexity  TEXT,
        tags                TEXT,
        has_deception_bug   INTEGER DEFAULT 0,
        deception_note      TEXT
      )
    `);

    console.log('✓ Coder\'s DNA schema initialized');
  }

  // ─── TELEMETRY ────────────────────────────────────────────────────────────

  static async saveTelemetry(data) {
    const sql = `
      INSERT INTO telemetry_sessions (
        user_id, problem_id, difficulty_level, warfare_mode,
        first_keystroke_delay, total_solve_time, backspace_count, rewrite_count,
        run_attempts, compile_errors, logical_errors, tab_switch_events,
        problem_switch_events, optimization_attempts, edge_case_coverage,
        idle_time_spikes, paste_events, test_pass_ratio, first_attempt_success,
        language, final_code, submission_verdict
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;
    const result = await db.run(sql, [
      data.userId, data.problemId, data.difficultyLevel || 'medium',
      data.warfareMode || null,
      data.firstKeystrokeDelay || 0, data.totalSolveTime || 0,
      data.backspaceCount || 0, data.rewriteCount || 0,
      data.runAttempts || 0, data.compileErrors || 0, data.logicalErrors || 0,
      data.tabSwitchEvents || 0, data.problemSwitchEvents || 0,
      data.optimizationAttempts || 0, data.edgeCaseCoverage || 0,
      data.idleTimeSpikes || 0, data.pasteEvents || 0,
      data.testPassRatio || 0, data.firstAttemptSuccess ? 1 : 0,
      data.language || 'javascript', data.finalCode || null,
      data.submissionVerdict || 'pending'
    ]);
    return result.lastID;
  }

  static async getSessionsByUser(userId, limit = 100) {
    return await db.all(
      `SELECT * FROM telemetry_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
      [userId, limit]
    );
  }

  static async getRecentSessions(userId, count = 20) {
    return await db.all(
      `SELECT * FROM telemetry_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
      [userId, count]
    );
  }

  static async getSessionsByProblemCategory(userId, category) {
    return await db.all(
      `SELECT ts.* FROM telemetry_sessions ts
       JOIN dna_problems dp ON ts.problem_id = dp.slug
       WHERE ts.user_id = ? AND dp.category = ?
       ORDER BY ts.created_at DESC`,
      [userId, category]
    );
  }

  // ─── DNA SCORES ───────────────────────────────────────────────────────────

  static async upsertDNAScore(userId, scores) {
    const overall = (
      scores.planningDepth * 0.20 +
      scores.stability * 0.18 +
      scores.debugEfficiency * 0.18 +
      scores.optimizationReflex * 0.16 +
      scores.cognitiveAdaptability * 0.14 +
      scores.learningVelocity * 0.14
    );

    const sql = `
      INSERT INTO dna_scores (
        user_id, planning_depth, stability, debug_efficiency,
        optimization_reflex, cognitive_adaptability, learning_velocity,
        overall_dna_score, volatility_index, sessions_counted,
        hiring_radar_score, last_computed
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        planning_depth         = excluded.planning_depth,
        stability              = excluded.stability,
        debug_efficiency       = excluded.debug_efficiency,
        optimization_reflex    = excluded.optimization_reflex,
        cognitive_adaptability = excluded.cognitive_adaptability,
        learning_velocity      = excluded.learning_velocity,
        overall_dna_score      = excluded.overall_dna_score,
        volatility_index       = excluded.volatility_index,
        sessions_counted       = excluded.sessions_counted,
        hiring_radar_score     = excluded.hiring_radar_score,
        last_computed          = datetime('now')
    `;
    await db.run(sql, [
      userId,
      Math.round(scores.planningDepth),
      Math.round(scores.stability),
      Math.round(scores.debugEfficiency),
      Math.round(scores.optimizationReflex),
      Math.round(scores.cognitiveAdaptability),
      Math.round(scores.learningVelocity),
      Math.round(overall),
      Math.round(scores.volatilityIndex || 0),
      scores.sessionsCounted || 0,
      Math.round(scores.hiringRadarScore || overall * 0.95)
    ]);
  }

  static async getDNAScore(userId) {
    return await db.get(
      `SELECT * FROM dna_scores WHERE user_id = ?`,
      [userId]
    );
  }

  // ─── BADGES ───────────────────────────────────────────────────────────────

  static async awardBadge(userId, badge) {
    try {
      await db.run(
        `INSERT OR IGNORE INTO badge_history (user_id, badge_id, badge_name, badge_tier, conditions)
         VALUES (?,?,?,?,?)`,
        [userId, badge.id, badge.name, badge.tier, JSON.stringify(badge.conditions)]
      );
      return true;
    } catch { return false; }
  }

  static async getUserBadges(userId) {
    return await db.all(
      `SELECT * FROM badge_history WHERE user_id = ? ORDER BY earned_at DESC`,
      [userId]
    );
  }

  // ─── PROBLEMS ─────────────────────────────────────────────────────────────

  static async getProblemBySlug(slug) {
    return await db.get(`SELECT * FROM dna_problems WHERE slug = ?`, [slug]);
  }

  static async getAllProblems(difficulty = null) {
    if (difficulty) {
      return await db.all(`SELECT * FROM dna_problems WHERE difficulty = ?`, [difficulty]);
    }
    return await db.all(`SELECT * FROM dna_problems`);
  }

  static async seedProblems() {
    const problems = [
      {
        slug: 'two-sum', title: '1. Two Sum', difficulty: 'easy',
        category: 'arrays', description: 'Given an array of integers nums and an integer target, return indices of two numbers that add up to target.',
        constraints: '["2 <= nums.length <= 10^4","-10^9 <= nums[i] <= 10^9","Only one valid answer exists"]',
        testCases: '[{"input":[[2,7,11,15],9],"expected":[0,1]},{"input":[[3,2,4],6],"expected":[1,2]},{"input":[[3,3],6],"expected":[0,1]}]',
        starterCode: 'function twoSum(nums, target) {\n  // your code here\n}',
        optimalComplexity: 'O(n)', tags: '["hash-map","arrays"]', hasDeceptionBug: 0
      },
      {
        slug: 'valid-parentheses', title: '20. Valid Parentheses', difficulty: 'easy',
        category: 'stack', description: 'Given a string containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.',
        constraints: '["1 <= s.length <= 10^4","s consists of parentheses chars only"]',
        testCases: '[{"input":"()[]{}","expected":true},{"input":"(]","expected":false},{"input":"{[]}","expected":true}]',
        starterCode: 'function isValid(s) {\n  // your code here\n}',
        optimalComplexity: 'O(n)', tags: '["stack","string"]', hasDeceptionBug: 0
      },
      {
        slug: 'maximum-subarray', title: '53. Maximum Subarray', difficulty: 'medium',
        category: 'dynamic-programming', description: 'Given an integer array nums, find the subarray with the largest sum and return its sum.',
        constraints: '["1 <= nums.length <= 10^5","-10^4 <= nums[i] <= 10^4"]',
        testCases: '[{"input":[-2,1,-3,4,-1,2,1,-5,4],"expected":6},{"input":[1],"expected":1},{"input":[5,4,-1,7,8],"expected":23}]',
        starterCode: 'function maxSubArray(nums) {\n  // your code here\n}',
        optimalComplexity: 'O(n)', tags: '["dp","kadane","arrays"]', hasDeceptionBug: 0
      },
      {
        slug: 'merge-intervals', title: '56. Merge Intervals', difficulty: 'medium',
        category: 'sorting', description: 'Given an array of intervals, merge all overlapping intervals and return non-overlapping intervals.',
        constraints: '["1 <= intervals.length <= 10^4","intervals[i].length == 2"]',
        testCases: '[{"input":[[1,3],[2,6],[8,10],[15,18]],"expected":[[1,6],[8,10],[15,18]]},{"input":[[1,4],[4,5]],"expected":[[1,5]]}]',
        starterCode: 'function merge(intervals) {\n  // your code here\n}',
        optimalComplexity: 'O(n log n)', tags: '["sorting","intervals","arrays"]', hasDeceptionBug: 0
      },
      {
        slug: 'reverse-linked-list', title: '206. Reverse Linked List', difficulty: 'easy',
        category: 'linked-list', description: 'Given the head of a singly linked list, reverse the list and return the reversed list.',
        constraints: '["0 <= nodes <= 5000","-5000 <= Node.val <= 5000"]',
        testCases: '[{"input":[1,2,3,4,5],"expected":[5,4,3,2,1]},{"input":[1,2],"expected":[2,1]},{"input":[],"expected":[]}]',
        starterCode: 'function reverseList(head) {\n  // your code here\n}',
        optimalComplexity: 'O(n)', tags: '["linked-list","recursion"]', hasDeceptionBug: 0
      },
      // Deception Debug: looks correct but has off-by-one bug
      {
        slug: 'binary-search-deception', title: 'Binary Search (Debug)', difficulty: 'medium',
        category: 'binary-search', description: 'The following binary search implementation has a subtle bug. Identify and fix it. The function should return the index of target in nums, or -1 if not found.',
        constraints: '["Array is sorted in ascending order","No duplicate values","Return -1 if not found"]',
        testCases: '[{"input":[[1,3,5,7,9],5],"expected":2},{"input":[[1,3,5,7,9],3],"expected":1},{"input":[[1,3,5,7,9],6],"expected":-1}]',
        starterCode: `function search(nums, target) {
  let left = 0, right = nums.length;  // BUG: should be nums.length - 1
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    else if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
        optimalComplexity: 'O(log n)', tags: '["binary-search","deception","debug"]',
        hasDeceptionBug: 1, deceptionNote: 'right = nums.length should be nums.length - 1 to avoid out-of-bounds access'
      }
    ];

    for (const p of problems) {
      await db.run(`
        INSERT OR IGNORE INTO dna_problems
          (slug,title,difficulty,category,description,constraints,test_cases,starter_code,optimal_complexity,tags,has_deception_bug,deception_note)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [p.slug, p.title, p.difficulty, p.category, p.description, p.constraints,
         p.testCases, p.starterCode, p.optimalComplexity, p.tags, p.hasDeceptionBug, p.deceptionNote || null]
      );
    }
    console.log('✓ DNA problems seeded');
  }
}

module.exports = CodersDNA;
