"""
SkillForge AI Engine — Pydantic Request / Response Schemas
"""
from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel, Field


# ─────────────────────────────────────────────
# SHARED
# ─────────────────────────────────────────────
class StatusResponse(BaseModel):
    status: str
    message: str


# ─────────────────────────────────────────────
# LAYER 1 — Resume Understanding
# ─────────────────────────────────────────────
class ResumeParseRequest(BaseModel):
    text: Optional[str] = None          # Raw text (if pre-extracted)
    github_username: Optional[str] = None
    target_role: Optional[str] = None
    target_salary: Optional[float] = None
    location: Optional[str] = None
    years_of_experience: Optional[float] = None


class ParsedResume(BaseModel):
    resume_id: str
    skills: list[str]
    experience: list[dict[str, Any]]
    education: list[dict[str, Any]]
    projects: list[dict[str, Any]]
    tools: list[str]
    certifications: list[str]
    contact: dict[str, Any]
    years_of_experience: float
    raw_text: str


# ─────────────────────────────────────────────
# LAYER 2 — Skill Authenticity
# ─────────────────────────────────────────────
class SkillAuthRequest(BaseModel):
    resume_id: str
    github_username: str
    skills: list[str]


class SkillScore(BaseModel):
    skill: str
    confidence: float = Field(ge=0, le=100)
    evidence: str
    repos_found: int = 0


class SkillAuthResponse(BaseModel):
    resume_id: str
    github_username: str
    skill_scores: list[SkillScore]
    repos_analyzed: int
    commits_analyzed: int
    overall_authenticity: float


# ─────────────────────────────────────────────
# LAYER 3 — Career Role Prediction
# ─────────────────────────────────────────────
class RolePredictionRequest(BaseModel):
    resume_id: str
    skills: list[str]
    experience_years: float = 0.0
    tools: list[str] = []


class RolePrediction(BaseModel):
    role: str
    probability: float = Field(ge=0, le=100)
    matching_skills: list[str]
    gap_skills: list[str]
    description: str


class RolePredictionResponse(BaseModel):
    resume_id: str
    top_role: str
    top_role_score: float
    predictions: list[RolePrediction]


# ─────────────────────────────────────────────
# LAYER 4 — Skill Gap Intelligence
# ─────────────────────────────────────────────
class SkillGapRequest(BaseModel):
    resume_id: str
    target_role: str
    current_skills: list[str]
    experience_years: float = 0.0


class SkillGapItem(BaseModel):
    skill: str
    importance: str              # "critical" | "moderate" | "nice-to-have"
    description: str
    learning_time: str
    resources: list[str] = []


class SkillGapResponse(BaseModel):
    resume_id: str
    target_role: str
    alignment_score: float       # 0-100
    critical_gaps: list[SkillGapItem]
    moderate_gaps: list[SkillGapItem]
    minor_gaps: list[SkillGapItem]
    ai_reasoning: str


# ─────────────────────────────────────────────
# LAYER 5 — Salary Intelligence
# ─────────────────────────────────────────────
class SalaryRequest(BaseModel):
    resume_id: str
    target_role: str
    target_salary: float
    location: str = "United States"
    years_of_experience: float = 0.0
    skill_count: int = 0
    top_skills: list[str] = []


class SalaryResponse(BaseModel):
    resume_id: str
    target_salary: float
    predicted_salary_min: float
    predicted_salary_max: float
    predicted_salary_median: float
    feasibility_probability: float   # 0-100
    market_percentile: float
    recommendation: str
    comparable_roles: list[dict[str, Any]] = []


# ─────────────────────────────────────────────
# LAYER 6 — Career Strategy
# ─────────────────────────────────────────────
class StrategyRequest(BaseModel):
    resume_id: str
    target_role: str
    target_salary: Optional[float] = None
    critical_gaps: list[str] = []
    current_skills: list[str] = []
    experience_years: float = 0.0


class RoadmapPhase(BaseModel):
    phase: int
    name: str
    duration: str
    skills: list[str]
    description: str
    projects: list[str] = []


class StrategyResponse(BaseModel):
    resume_id: str
    target_role: str
    blocking_gaps: list[str]
    competitive_upgrades: list[str]
    strategic_projects: list[dict[str, Any]]
    roadmap_phases: list[RoadmapPhase]
    full_strategy_md: str


# ─────────────────────────────────────────────
# MASTER — Full Pipeline
# ─────────────────────────────────────────────
class FullPipelineRequest(BaseModel):
    """Single-call entry point that runs all 6 layers."""
    target_role: str
    target_salary: Optional[float] = None
    location: str = "United States"
    years_of_experience: Optional[float] = None
    github_username: Optional[str] = None


class FullPipelineResponse(BaseModel):
    resume_id: str
    parsed_resume: ParsedResume
    skill_authenticity: Optional[SkillAuthResponse] = None
    role_predictions: RolePredictionResponse
    skill_gaps: SkillGapResponse
    salary: Optional[SalaryResponse] = None
    strategy: StrategyResponse


# ─────────────────────────────────────────────
# RESUME GENERATOR
# ─────────────────────────────────────────────
class ResumeGeneratorRequest(BaseModel):
    resume_id: str
    target_role: str
    include_strategy: bool = True
    output_format: str = "pdf"  # "pdf" | "html" | "json"


class ResumeGeneratorResponse(BaseModel):
    resume_id: str
    download_url: str
    sections: dict[str, Any]
