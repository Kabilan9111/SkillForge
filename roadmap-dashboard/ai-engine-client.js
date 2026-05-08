/**
 * SkillForge AI Engine — Frontend Client
 * ─────────────────────────────────────────────────────────────────────
 * Wraps all 6-layer AI pipeline endpoints.
 *
 * Routes:
 *   Via Node.js proxy: POST /api/ai/pipeline/analyze   (full pipeline)
 *   Direct to Python:  POST http://localhost:8001/api/...
 *
 * Usage:
 *   import { AIClient } from './ai-engine-client.js';
 *   const result = await AIClient.fullPipeline(formData);
 */

(function (global) {
    'use strict';

    // ── Config ─────────────────────────────────────────────────────────
    // Prefer proxying through Node.js so CORS is handled.
    const AI_BASE = (() => {
        if (typeof AI_ENGINE_DIRECT !== 'undefined' && AI_ENGINE_DIRECT) {
            return 'http://localhost:8001/api';
        }
        // Proxy: Node.js forwards /api/ai/* → Python /api/*
        const base = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : '';
        return base + '/api/ai';
    })();

    // ── Auth Token ─────────────────────────────────────────────────────
    /**
     * Read the JWT token from storage.
     * Checks localStorage first (persistent login), then sessionStorage (tab-only).
     * Returns null when not logged in — endpoints will respond with HTTP 401.
     */
    function _getAuthToken() {
        return (
            localStorage.getItem('token') ||
            localStorage.getItem('authToken') ||
            sessionStorage.getItem('token') ||
            sessionStorage.getItem('authToken') ||
            null
        );
    }

    /**
     * Build Authorization header object.
     * Returns {} when no token is available (dev / public routes).
     */
    function _authHeader() {
        const token = _getAuthToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // ── Utility ────────────────────────────────────────────────────────
    function handleError(context, err) {
        console.error(`[AIClient] ${context} failed:`, err);
        throw err;
    }

    async function postJSON(endpoint, body) {
        const url = `${AI_BASE}${endpoint}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ..._authHeader(),
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: res.statusText }));
            throw new Error(err.detail || err.error || `HTTP ${res.status}`);
        }
        return res.json();
    }

    async function postForm(endpoint, formData) {
        const url = `${AI_BASE}${endpoint}`;
        const res = await fetch(url, {
            method: 'POST',
            // No Content-Type header — browser sets multipart boundary automatically.
            // Auth header is added separately.
            headers: _authHeader(),
            body: formData,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: res.statusText }));
            throw new Error(err.detail || err.error || `HTTP ${res.status}`);
        }
        return res.json();
    }

    // ── AI Client API ──────────────────────────────────────────────────
    const AIClient = {

        /**
         * Layer 1 — Parse resume file
         * @param {File} file
         * @returns {Promise<ParsedResume>}
         */
        parseResume(file) {
            const fd = new FormData();
            fd.append('resume', file);
            return postForm('/resume/parse', fd).catch(e => handleError('Layer1:parseResume', e));
        },

        /**
         * Layer 2 — Verify skills via GitHub
         * @param {string} resumeId
         * @param {string} githubUsername
         * @param {string[]} skills
         * @returns {Promise<SkillAuthResponse>}
         */
        verifySkills(resumeId, githubUsername, skills) {
            return postJSON('/skills/verify', {
                resume_id: resumeId,
                github_username: githubUsername,
                skills,
            }).catch(e => handleError('Layer2:verifySkills', e));
        },

        /**
         * Layer 3 — Predict best-fit engineering roles
         * @param {string} resumeId
         * @param {string[]} skills
         * @param {string[]} tools
         * @param {number} experienceYears
         * @returns {Promise<RolePredictionResponse>}
         */
        predictRoles(resumeId, skills, tools = [], experienceYears = 0) {
            return postJSON('/career/predict-role', {
                resume_id: resumeId,
                skills,
                tools,
                experience_years: experienceYears,
            }).catch(e => handleError('Layer3:predictRoles', e));
        },

        /**
         * Layer 4 — Analyze skill gaps for a target role
         * @param {string} resumeId
         * @param {string} targetRole
         * @param {string[]} currentSkills
         * @param {number} experienceYears
         * @returns {Promise<SkillGapResponse>}
         */
        analyzeSkillGaps(resumeId, targetRole, currentSkills, experienceYears = 0) {
            return postJSON('/career/skill-gap', {
                resume_id: resumeId,
                target_role: targetRole,
                current_skills: currentSkills,
                experience_years: experienceYears,
            }).catch(e => handleError('Layer4:analyzeSkillGaps', e));
        },

        /**
         * Layer 5 — Predict salary feasibility
         * @param {string} resumeId
         * @param {string} targetRole
         * @param {number} targetSalary
         * @param {Object} opts - {location, yearsOfExperience, skillCount, topSkills}
         * @returns {Promise<SalaryResponse>}
         */
        predictSalary(resumeId, targetRole, targetSalary, opts = {}) {
            return postJSON('/career/salary', {
                resume_id: resumeId,
                target_role: targetRole,
                target_salary: targetSalary,
                location: opts.location || 'United States',
                years_of_experience: opts.yearsOfExperience || 0,
                skill_count: opts.skillCount || 0,
                top_skills: opts.topSkills || [],
            }).catch(e => handleError('Layer5:predictSalary', e));
        },

        /**
         * Layer 6 — Generate career strategy
         * @param {string} resumeId
         * @param {string} targetRole
         * @param {string[]} currentSkills
         * @param {string[]} criticalGaps
         * @param {Object} opts - {experienceYears, targetSalary}
         * @returns {Promise<StrategyResponse>}
         */
        generateStrategy(resumeId, targetRole, currentSkills, criticalGaps, opts = {}) {
            return postJSON('/career/strategy', {
                resume_id: resumeId,
                target_role: targetRole,
                current_skills: currentSkills,
                critical_gaps: criticalGaps,
                experience_years: opts.experienceYears || 0,
                target_salary: opts.targetSalary || null,
            }).catch(e => handleError('Layer6:generateStrategy', e));
        },

        /**
         * Generate AI-optimized resume PDF
         * @param {File} file
         * @param {string} targetRole
         * @param {string} outputFormat - 'pdf' | 'html'
         * @returns {Promise<ResumeGeneratorResponse>}
         */
        generateResume(file, targetRole, outputFormat = 'pdf') {
            const fd = new FormData();
            fd.append('resume', file);
            fd.append('target_role', targetRole);
            fd.append('output_format', outputFormat);
            return postForm('/career/generate-resume', fd)
                .catch(e => handleError('ResumeGenerator', e));
        },

        /**
         * MASTER — Run full 6-layer pipeline in one call
         * @param {File} file
         * @param {Object} params - {targetRole, targetSalary, location, yearsOfExperience, githubUsername}
         * @returns {Promise<FullPipelineResponse>}
         */
        async fullPipeline(file, params = {}) {
            const fd = new FormData();
            fd.append('resume', file);
            fd.append('target_role', params.targetRole || '');
            if (params.targetSalary)       fd.append('target_salary', String(params.targetSalary));
            if (params.location)           fd.append('location', params.location);
            if (params.yearsOfExperience)  fd.append('years_of_experience', String(params.yearsOfExperience));
            if (params.githubUsername)     fd.append('github_username', params.githubUsername);

            return postForm('/pipeline/analyze', fd)
                .catch(e => handleError('FullPipeline', e));
        },

        /**
         * Check AI Engine status
         * @returns {Promise<{online: boolean, version: string, layers: object}>}
         */
        async status() {
            try {
                const base = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : '';
                const res = await fetch(`${base}/api/ai-engine/status`, { method: 'GET' });
                return res.json();
            } catch {
                return { online: false };
            }
        },
    };

    // ── Expose globally ────────────────────────────────────────────────
    global.AIClient = AIClient;

    // Named export for use in modules
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { AIClient };
    }

})(typeof window !== 'undefined' ? window : global);
