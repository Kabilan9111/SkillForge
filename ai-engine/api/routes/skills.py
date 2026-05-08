"""
Individual API Routes — Layer 2: Skill Authenticity
POST /api/skills/verify
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import structlog

from models.schemas import SkillAuthRequest
from services.layer2_skill_auth import verify_skills

log = structlog.get_logger(__name__)
router = APIRouter(prefix="/api/skills", tags=["Layer 2 — Skill Authenticity"])


@router.post("/verify", summary="Verify skills via GitHub + CodeBERT")
async def verify_skills_endpoint(req: SkillAuthRequest):
    try:
        result = await verify_skills(
            resume_id=req.resume_id,
            github_username=req.github_username,
            skills=req.skills,
        )
        return JSONResponse(content=result)
    except Exception as exc:
        log.error("route.skills.verify.failed", error=str(exc))
        raise HTTPException(status_code=500, detail=str(exc))
