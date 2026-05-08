"""
Layer 5 Supplement — Confidence Scoring
---------------------------------------
Computes a confidence score (0–100) for the AI pipeline's output based on
how much real data was available: resume quality, skill count, role alignment.

Formula:
  score = resume_quality * 0.35 + skill_detection * 0.35 + role_alignment * 0.30

Thresholds:
  ≥ 80  → A (High confidence — proceed to full strategy)
  60–79 → B (Moderate — results reliable, some gaps uncertain)
  40–59 → C (Low — missing critical resume context)
  < 40  → F (Very low — results unreliable, do not proceed)
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field, asdict
from typing import Any

_log = logging.getLogger("skillforge.confidence")

# ─── Grade thresholds ─────────────────────────────────────────────────────────

_GRADES: list[tuple[int, str]] = [
    (80, "A"),
    (60, "B"),
    (40, "C"),
    (0,  "F"),
]

# ─── Warning messages ─────────────────────────────────────────────────────────

_WARNINGS = {
    "F": (
        "Confidence is very low. The resume did not contain enough structured "
        "information to generate reliable career intelligence. "
        "Please re-upload a resume with clearly listed skills, job titles, and dates."
    ),
    "C": (
        "Confidence is low. Some recommendations may be incomplete. "
        "Consider adding more detail to your resume (projects, tools, certifications)."
    ),
    "B": (
        "Confidence is moderate. Results are directionally accurate, "
        "but some gap recommendations may be imprecise."
    ),
}

# ─── Scoring weights ──────────────────────────────────────────────────────────

_W_RESUME  = 0.35   # How well the resume was parsed
_W_SKILLS  = 0.35   # How many skills were detected
_W_ALIGN   = 0.30   # Alignment between user skills and target role


@dataclass
class ConfidenceResult:
    score: float                    # 0–100
    grade: str                      # A / B / C / F
    warning: str | None             # Human-readable warning if grade < A
    breakdown: dict[str, float]     # Individual component scores (0–100 each)
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict:
        return asdict(self)


# ─── Main API ─────────────────────────────────────────────────────────────────

def compute_confidence(
    parsed_resume: dict[str, Any],
    skill_gaps: dict[str, Any],
    role_predictions: dict[str, Any] | None = None,
) -> ConfidenceResult:
    """
    Compute pipeline confidence from three data sources.

    Parameters
    ----------
    parsed_resume : dict
        Output of Layer 1 (parse_resume). Must contain at least "skills".
    skill_gaps : dict
        Output of Layer 4 (analyze_skill_gaps). Contains "alignment_score".
    role_predictions : dict | None
        Output of Layer 3 (predict_roles). Used for role match confidence.

    Returns
    -------
    ConfidenceResult
        Structured confidence result with score, grade, optional warning.
    """

    # ── Component 1: Resume Quality ───────────────────────────────────────────
    resume_quality = _score_resume_quality(parsed_resume)

    # ── Component 2: Skill Detection ──────────────────────────────────────────
    skill_detection = _score_skill_detection(parsed_resume)

    # ── Component 3: Role Alignment ───────────────────────────────────────────
    role_alignment = _score_role_alignment(skill_gaps, role_predictions)

    # ── Composite Score ───────────────────────────────────────────────────────
    composite = round(
        resume_quality * _W_RESUME
        + skill_detection * _W_SKILLS
        + role_alignment * _W_ALIGN,
        1,
    )
    composite = max(0.0, min(100.0, composite))

    # ── Grade ─────────────────────────────────────────────────────────────────
    grade = _assign_grade(composite)
    warning = _WARNINGS.get(grade)

    breakdown = {
        "resume_quality":  round(resume_quality, 1),
        "skill_detection": round(skill_detection, 1),
        "role_alignment":  round(role_alignment, 1),
    }

    _log.info(
        "confidence.computed — score=%.1f grade=%s resume=%.1f skills=%.1f align=%.1f",
        composite, grade,
        resume_quality, skill_detection, role_alignment,
    )

    return ConfidenceResult(
        score=composite,
        grade=grade,
        warning=warning,
        breakdown=breakdown,
        metadata={
            "weights": {"resume": _W_RESUME, "skills": _W_SKILLS, "alignment": _W_ALIGN},
        },
    )


# ─── Scoring Components ───────────────────────────────────────────────────────

def _score_resume_quality(parsed: dict) -> float:
    """
    Score resume completeness 0–100.

    Signals used:
    - Has job history / work experience
    - Has education entries
    - Has summary / objective
    - Resume text length ≥ 500 chars
    - Has certifications
    - Has contact / LinkedIn
    """
    score = 0.0

    # Presence of sections (weighted)
    if parsed.get("work_experience") or parsed.get("experience"):
        score += 30
    if parsed.get("education"):
        score += 15
    if parsed.get("summary") or parsed.get("objective"):
        score += 10
    if parsed.get("certifications"):
        score += 10
    if parsed.get("email") or parsed.get("linkedin") or parsed.get("github_url"):
        score += 5

    # Text volume
    raw_text = parsed.get("raw_text") or parsed.get("resume_text") or ""
    text_len = len(raw_text.strip())
    if text_len >= 1500:
        score += 30
    elif text_len >= 800:
        score += 20
    elif text_len >= 400:
        score += 10

    return min(score, 100.0)


def _score_skill_detection(parsed: dict) -> float:
    """
    Score based on number of skills/tools extracted.

    Thresholds:
      ≥ 20 skills or tools → 100
      10–19               → 75
      5–9                 → 50
      3–4                 → 25
      < 3                 → 0
    """
    skills = parsed.get("skills") or []
    tools  = parsed.get("tools") or []
    total = len(skills) + len(tools)

    if total >= 20:
        return 100.0
    elif total >= 10:
        return 75.0
    elif total >= 5:
        return 50.0
    elif total >= 3:
        return 25.0
    else:
        return 0.0


def _score_role_alignment(gaps: dict, roles: dict | None) -> float:
    """
    Combine alignment_score from Layer 4 and top_role_score from Layer 3.
    """
    # Layer 4 alignment score is already 0–100
    alignment = float(gaps.get("alignment_score") or 0.0)

    # Layer 3 role confidence (usually 0–1 float)
    role_conf = 0.0
    if roles:
        raw = roles.get("top_role_score") or 0.0
        role_conf = float(raw) * 100 if float(raw) <= 1.0 else float(raw)

    if role_conf:
        return round((alignment * 0.6 + role_conf * 0.4), 1)
    return round(alignment, 1)


def _assign_grade(score: float) -> str:
    for threshold, grade in _GRADES:
        if score >= threshold:
            return grade
    return "F"
