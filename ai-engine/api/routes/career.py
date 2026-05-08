"""
Individual API Routes — Layer 3, 4, 5, 6: Career Intelligence
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse, FileResponse
from pathlib import Path
from typing import Optional
import structlog

from models.schemas import (
    RolePredictionRequest,
    SkillGapRequest,
    SalaryRequest,
    StrategyRequest,
    ResumeGeneratorRequest,
)
from services.layer3_role_prediction import predict_roles
from services.layer4_skill_gap import analyze_skill_gaps
from services.layer5_salary import predict_salary
from services.layer6_strategy import generate_strategy
from services.resume_generator import generate_resume
from services.layer1_resume import parse_resume

log = structlog.get_logger(__name__)
router = APIRouter(prefix="/api/career", tags=["Career Intelligence"])


# ── Layer 3: Role Prediction ─────────────────────────────────────────
@router.post("/predict-role", summary="Predict best-fit engineering roles via SBERT + FAISS")
async def predict_role_endpoint(req: RolePredictionRequest):
    try:
        result = await predict_roles(
            resume_id=req.resume_id,
            skills=req.skills,
            tools=req.tools,
            experience_years=req.experience_years,
        )
        return JSONResponse(content=result)
    except Exception as exc:
        log.error("route.career.predict_role.failed", error=str(exc))
        raise HTTPException(status_code=500, detail=str(exc))


# ── Layer 4: Skill Gap ────────────────────────────────────────────────
@router.post("/skill-gap", summary="Detect skill gaps via Neo4j + LangChain RAG + GPT-4")
async def skill_gap_endpoint(req: SkillGapRequest):
    try:
        result = await analyze_skill_gaps(
            resume_id=req.resume_id,
            target_role=req.target_role,
            current_skills=req.current_skills,
            experience_years=req.experience_years,
        )
        return JSONResponse(content=result)
    except Exception as exc:
        log.error("route.career.skill_gap.failed", error=str(exc))
        raise HTTPException(status_code=500, detail=str(exc))


# ── Layer 5: Salary Prediction ────────────────────────────────────────
@router.post("/salary", summary="Predict salary feasibility via XGBoost")
async def salary_endpoint(req: SalaryRequest):
    try:
        result = await predict_salary(
            resume_id=req.resume_id,
            target_role=req.target_role,
            target_salary=req.target_salary,
            location=req.location,
            years_of_experience=req.years_of_experience,
            skill_count=req.skill_count,
            top_skills=req.top_skills,
        )
        return JSONResponse(content=result)
    except Exception as exc:
        log.error("route.career.salary.failed", error=str(exc))
        raise HTTPException(status_code=500, detail=str(exc))


# ── Layer 6: Career Strategy ──────────────────────────────────────────
@router.post("/strategy", summary="Generate career roadmap via GPT-4 + LangChain Agents")
async def strategy_endpoint(req: StrategyRequest):
    try:
        result = await generate_strategy(
            resume_id=req.resume_id,
            target_role=req.target_role,
            current_skills=req.current_skills,
            critical_gaps=req.critical_gaps,
            experience_years=req.experience_years,
            target_salary=req.target_salary,
        )
        return JSONResponse(content=result)
    except Exception as exc:
        log.error("route.career.strategy.failed", error=str(exc))
        raise HTTPException(status_code=500, detail=str(exc))


# ── Resume Generator ──────────────────────────────────────────────────
@router.post("/generate-resume", summary="Generate AI-optimized resume PDF")
async def generate_resume_endpoint(
    resume: UploadFile = File(...),
    target_role: str = Form(...),
    output_format: str = Form("pdf"),
):
    file_bytes = await resume.read()
    try:
        parsed = await parse_resume(file_bytes, resume.filename or "resume.pdf")
        result = await generate_resume(
            resume_id=parsed["resume_id"],
            parsed_resume=parsed,
            target_role=target_role,
            output_format=output_format,
        )
        return JSONResponse(content=result)
    except Exception as exc:
        log.error("route.career.generate_resume.failed", error=str(exc))
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/download-resume/{filename}", summary="Download generated resume file")
async def download_resume(filename: str):
    from config import settings
    file_path = Path(settings.UPLOAD_DIR) / "generated_resumes" / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    media_type = "application/pdf" if filename.endswith(".pdf") else "text/html"
    return FileResponse(str(file_path), media_type=media_type, filename=filename)
