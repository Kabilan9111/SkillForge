"""
Individual API Routes — Layer 1: Resume Parsing
POST /api/resume/parse
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import structlog

from services.layer1_resume import parse_resume

log = structlog.get_logger(__name__)
router = APIRouter(prefix="/api/resume", tags=["Layer 1 — Resume"])


@router.post("/parse", summary="Parse resume PDF/DOCX → structured JSON")
async def parse_resume_endpoint(
    resume: UploadFile = File(...),
):
    file_bytes = await resume.read()
    try:
        result = await parse_resume(file_bytes, resume.filename or "resume.pdf")
        return JSONResponse(content=result)
    except Exception as exc:
        log.error("route.resume.parse.failed", error=str(exc))
        raise HTTPException(status_code=422, detail=str(exc))
