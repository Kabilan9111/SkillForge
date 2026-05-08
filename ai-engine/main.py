"""
SkillForge AI Engine — FastAPI Application Entry Point
6-Layer AI Intelligence System

Layers:
  1. Resume Understanding    → GPT-4o / Claude + spaCy + PyMuPDF
  2. Skill Authenticity      → GitHub API + CodeBERT + Tree-sitter
  3. Career Role Prediction  → SBERT + FAISS
  4. Skill Gap Intelligence  → Neo4j + LangChain RAG + GPT-4
  5. Salary Intelligence     → XGBoost + Scikit-learn
  6. Career Strategy         → GPT-4o + LangChain Agents
"""
import sys
from pathlib import Path

import structlog
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings
from utils.logger import configure_logging

# ─── Logging ─────────────────────────────────────────────────────────────────
configure_logging(
    level=settings.LOG_LEVEL,
    log_dir=settings.LOG_DIR,
    enable_file_log=True,
    enable_json_console=False,    # Set True in production/container environments
)

log = structlog.get_logger(__name__)

# ─────────────────────────────────────────────────────────────────────
# FastAPI Application
# ─────────────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "SkillForge 6-Layer AI Pipeline: Resume Understanding → "
        "Skill Verification → Role Prediction → Skill Gap Analysis → "
        "Salary Intelligence → Career Strategy"
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ── CORS ──────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static Files (generated resumes) ─────────────────────────────────
uploads_dir = Path(settings.UPLOAD_DIR)
uploads_dir.mkdir(exist_ok=True)
(uploads_dir / "generated_resumes").mkdir(exist_ok=True)

app.mount(
    "/generated-resumes",
    StaticFiles(directory=str(uploads_dir / "generated_resumes")),
    name="generated_resumes",
)

# ── Register Routes ───────────────────────────────────────────────────
from api.routes.pipeline import router as pipeline_router
from api.routes.resume import router as resume_router
from api.routes.skills import router as skills_router
from api.routes.career import router as career_router

app.include_router(pipeline_router)
app.include_router(resume_router)
app.include_router(skills_router)
app.include_router(career_router)


# ── Startup / Shutdown ────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    log.info("skillforge_ai.startup", version=settings.APP_VERSION)

    # Init database tables
    try:
        from database import init_db
        await init_db()
        log.info("database.initialized")
    except Exception as exc:
        log.warning("database.init_failed", error=str(exc))

    # Pre-build FAISS index (Layer 3) — load SBERT model at startup
    try:
        from services.layer3_role_prediction import _get_faiss_index
        _get_faiss_index()
        log.info("faiss_index.ready")
    except Exception as exc:
        log.warning("faiss_index.preload_failed", error=str(exc))

    log.info("skillforge_ai.ready", port=settings.PORT)


@app.on_event("shutdown")
async def shutdown_event():
    log.info("skillforge_ai.shutdown")


# ── Health Check ──────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "layers": {
            "layer1_resume":           "spaCy + GPT-4o/Claude",
            "layer2_skill_auth":       "GitHub API + CodeBERT + Tree-sitter",
            "layer3_role_prediction":  "SBERT + FAISS",
            "layer4_skill_gap":        "Neo4j + LangChain RAG + GPT-4",
            "layer5_salary":           "XGBoost + Scikit-learn",
            "layer6_strategy":         "GPT-4o + LangChain Agents",
        },
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "service": settings.APP_NAME,
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "full_pipeline":    "POST /api/pipeline/analyze",
            "parse_resume":     "POST /api/resume/parse",
            "verify_skills":    "POST /api/skills/verify",
            "predict_role":     "POST /api/career/predict-role",
            "skill_gap":        "POST /api/career/skill-gap",
            "salary":           "POST /api/career/salary",
            "strategy":         "POST /api/career/strategy",
            "generate_resume":  "POST /api/career/generate-resume",
        },
    }


# ─────────────────────────────────────────────────────────────────────
# Entry Point
# ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
