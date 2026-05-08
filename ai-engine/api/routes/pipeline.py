"""
API Route — Full 6-Layer Pipeline (single endpoint)
POST /api/pipeline/analyze

FIXES:
  - require_auth dependency wired (JWT Bearer token validated on every request)
  - Pre-flight validation: role, file type, file size checked BEFORE any AI
  - Layer 4 receives tools + salary (was missing before)
  - Confidence score computed and attached to every response
  - layer4 ValueError raised to 400 (not swallowed silently)
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

import structlog

from api.middleware.auth import require_auth
from database import get_db
from models.schemas import FullPipelineResponse
from services.layer1_resume import parse_resume, ResumeParseError
from services.layer2_skill_auth import verify_skills
from services.layer3_role_prediction import predict_roles
from services.layer4_skill_gap import analyze_skill_gaps
from services.layer5_salary import predict_salary
from services.layer6_strategy import generate_strategy
from services.confidence_scorer import compute_confidence

log = structlog.get_logger(__name__)
_log = logging.getLogger("skillforge.pipeline")

router = APIRouter(prefix="/api/pipeline", tags=["Pipeline"])

# ── Constants ─────────────────────────────────────────────────────────────────
_MAX_FILE_BYTES   = 10 * 1024 * 1024   # 10 MB
_ALLOWED_EXTS     = {".pdf", ".docx", ".doc", ".txt"}


@router.post("/analyze", response_class=JSONResponse, summary="Run full 6-layer AI pipeline")
async def full_pipeline_analyze(
    resume: UploadFile = File(..., description="Resume PDF or DOCX"),
    target_role: str = Form(...),
    target_salary: Optional[float] = Form(None),
    location: str = Form("United States"),
    years_of_experience: Optional[float] = Form(None),
    github_username: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_auth),           # ← JWT required
):
    """
    Master endpoint — runs all 6 AI layers in sequence and returns
    a complete career intelligence report.

    Requires:  Authorization: Bearer <jwt_token>
    """
    user_id = user.get("sub", "anonymous")
    _log.info(
        "pipeline.start — user=%s role=%s github=%s",
        user_id, target_role, github_username,
    )
    log.info("pipeline.start", user=user_id, role=target_role, github=github_username)

    # ── Pre-flight Validation ────────────────────────────────────────────────

    # 1. Role must not be blank
    if not target_role or not target_role.strip():
        raise HTTPException(
            status_code=400,
            detail="target_role is required. Provide a specific job title (e.g. 'Senior Backend Engineer').",
        )
    target_role = target_role.strip()

    # 2. File extension must be supported
    import os
    fname = resume.filename or ""
    ext = os.path.splitext(fname)[-1].lower()
    if ext not in _ALLOWED_EXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Accepted: {sorted(_ALLOWED_EXTS)}",
        )

    # 3. File must not be empty or over size limit
    file_bytes = await resume.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded resume file is empty.")
    if len(file_bytes) > _MAX_FILE_BYTES:
        size_mb = len(file_bytes) / (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Maximum allowed: 10 MB.",
        )

    _log.info(
        "pipeline.preflight_ok — user=%s role=%s file=%s size=%d",
        user_id, target_role, fname, len(file_bytes),
    )

    # ── Layer 1: Resume Parsing ─────────────────────────────────────
    # file_bytes already read during pre-flight validation
    try:
        layer1 = await parse_resume(file_bytes, fname or "resume.pdf")
    except ResumeParseError as exc:
        _log.error("pipeline.layer1.parse_error — user=%s: %s", user_id, exc)
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        _log.error("pipeline.layer1.failed — user=%s: %s", user_id, exc)
        raise HTTPException(status_code=422, detail=f"Resume parsing failed: {exc}")

    resume_id = layer1["resume_id"]

    # Override experience if explicitly provided
    if years_of_experience is not None:
        layer1["years_of_experience"] = years_of_experience

    _log.info(
        "pipeline.layer1_done — resume_id=%s skills=%d tools=%d exp=%.1f",
        resume_id,
        len(layer1.get("skills", [])),
        len(layer1.get("tools", [])),
        layer1.get("years_of_experience", 0.0),
    )

    # ── Layer 2: Skill Authenticity (optional — needs GitHub) ───────
    layer2 = None
    if github_username:
        try:
            layer2 = await verify_skills(
                resume_id=resume_id,
                github_username=github_username,
                skills=layer1.get("skills", []),
            )
        except Exception as exc:
            log.warning("pipeline.layer2.failed", error=str(exc))

    # ── Layer 3: Role Prediction ─────────────────────────────────────
    try:
        layer3 = await predict_roles(
            resume_id=resume_id,
            skills=layer1.get("skills", []),
            tools=layer1.get("tools", []),
            experience_years=layer1.get("years_of_experience", 0.0),
        )
    except Exception as exc:
        log.error("pipeline.layer3.failed", error=str(exc))
        layer3 = {
            "resume_id": resume_id,
            "top_role": target_role,
            "top_role_score": 0.0,
            "predictions": [],
        }

    # ── Layer 4: Skill Gap Analysis ───────────────────────────────────
    all_skills = list(set(layer1.get("skills", []) + layer1.get("tools", [])))
    try:
        layer4 = await analyze_skill_gaps(
            resume_id=resume_id,
            target_role=target_role,
            current_skills=layer1.get("skills", []),
            current_tools=layer1.get("tools", []),
            experience_years=layer1.get("years_of_experience", 0.0),
            target_salary=target_salary,
        )
    except ValueError as exc:
        # Raised when skills are empty or role is invalid — surface to caller as 400
        _log.error("pipeline.layer4.invalid_input — user=%s: %s", user_id, exc)
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        _log.error("pipeline.layer4.failed — user=%s: %s", user_id, exc)
        layer4 = {
            "resume_id": resume_id,
            "target_role": target_role,
            "alignment_score": 0.0,
            "critical_gaps": [],
            "moderate_gaps": [],
            "minor_gaps": [],
            "ai_reasoning": "Analysis unavailable — service error.",
        }

    # ── Layer 5: Salary Prediction (if target provided) ──────────────
    layer5 = None
    if target_salary:
        try:
            layer5 = await predict_salary(
                resume_id=resume_id,
                target_role=target_role,
                target_salary=target_salary,
                location=location,
                years_of_experience=layer1.get("years_of_experience", 0.0),
                skill_count=len(all_skills),
                top_skills=all_skills[:10],
            )
        except Exception as exc:
            log.warning("pipeline.layer5.failed", error=str(exc))

    # ── Layer 6: Career Strategy ──────────────────────────────────────
    critical_gap_names = [g["skill"] for g in layer4.get("critical_gaps", [])]
    try:
        layer6 = await generate_strategy(
            resume_id=resume_id,
            target_role=target_role,
            current_skills=all_skills,
            critical_gaps=critical_gap_names,
            experience_years=layer1.get("years_of_experience", 0.0),
            target_salary=target_salary,
        )
    except Exception as exc:
        log.error("pipeline.layer6.failed", error=str(exc))
        layer6 = {
            "resume_id": resume_id,
            "target_role": target_role,
            "blocking_gaps": critical_gap_names[:5],
            "competitive_upgrades": [],
            "strategic_projects": [],
            "roadmap_phases": [],
            "full_strategy_md": "Strategy generation unavailable.",
        }

    # ── Compute Confidence Score ─────────────────────────────────────
    confidence = compute_confidence(
        parsed_resume=layer1,
        skill_gaps=layer4,
        role_predictions=layer3,
    )
    _log.info(
        "pipeline.confidence — resume_id=%s score=%.1f grade=%s",
        resume_id, confidence.score, confidence.grade,
    )

    # ── Assemble Final Response ──────────────────────────────────────
    response = {
        "resume_id": resume_id,
        "parsed_resume": layer1,
        "skill_authenticity": layer2,
        "role_predictions": layer3,
        "skill_gaps": layer4,
        "salary": layer5,
        "strategy": layer6,
        "confidence": confidence.to_dict(),
    }

    _log.info("pipeline.complete — resume_id=%s user=%s", resume_id, user_id)
    log.info("pipeline.complete", resume_id=resume_id, user=user_id)
    return JSONResponse(content=response)
