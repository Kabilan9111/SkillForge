"""
SkillForge AI Engine — SQLAlchemy ORM Models
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    Column, String, Float, Integer, JSON, DateTime, Text, ForeignKey, Enum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum as stdlib_enum

from database import Base


def gen_uuid():
    return str(uuid.uuid4())


class AnalysisStatus(stdlib_enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETE = "complete"
    FAILED = "failed"


class ResumeAnalysis(Base):
    """Layer 1 — parsed resume structured data."""
    __tablename__ = "resume_analyses"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, nullable=True, index=True)
    raw_text = Column(Text, nullable=False)
    file_name = Column(String, nullable=True)
    file_type = Column(String, nullable=True)

    # Structured extraction
    skills: Any = Column(JSON, default=list)
    experience: Any = Column(JSON, default=list)
    education: Any = Column(JSON, default=list)
    projects: Any = Column(JSON, default=list)
    tools: Any = Column(JSON, default=list)
    certifications: Any = Column(JSON, default=list)
    contact: Any = Column(JSON, default=dict)
    years_of_experience = Column(Float, default=0.0)

    status = Column(Enum(AnalysisStatus), default=AnalysisStatus.COMPLETE)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    skill_authenticity = relationship("SkillAuthenticity", back_populates="resume", uselist=False)
    role_predictions = relationship("RolePrediction", back_populates="resume")
    skill_gaps = relationship("SkillGapResult", back_populates="resume", uselist=False)
    salary_prediction = relationship("SalaryPrediction", back_populates="resume", uselist=False)
    career_strategy = relationship("CareerStrategy", back_populates="resume", uselist=False)


class SkillAuthenticity(Base):
    """Layer 2 — skill verification via GitHub & CodeBERT."""
    __tablename__ = "skill_authenticity"

    id = Column(String, primary_key=True, default=gen_uuid)
    resume_id = Column(String, ForeignKey("resume_analyses.id"), nullable=False)
    github_username = Column(String, nullable=True)

    # {skill_name: confidence_score 0-100}
    skill_scores: Any = Column(JSON, default=dict)
    # {skill_name: reasoning}
    skill_evidence: Any = Column(JSON, default=dict)
    repos_analyzed = Column(Integer, default=0)
    commits_analyzed = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    resume = relationship("ResumeAnalysis", back_populates="skill_authenticity")


class RolePrediction(Base):
    """Layer 3 — career role mapping via SBERT + FAISS."""
    __tablename__ = "role_predictions"

    id = Column(String, primary_key=True, default=gen_uuid)
    resume_id = Column(String, ForeignKey("resume_analyses.id"), nullable=False)

    # [{role, probability, matching_skills, gap_skills}]
    predictions: Any = Column(JSON, default=list)
    top_role = Column(String, nullable=True)
    top_role_score = Column(Float, default=0.0)

    created_at = Column(DateTime, default=datetime.utcnow)
    resume = relationship("ResumeAnalysis", back_populates="role_predictions")


class SkillGapResult(Base):
    """Layer 4 — missing skill detection via Neo4j + LangChain RAG."""
    __tablename__ = "skill_gap_results"

    id = Column(String, primary_key=True, default=gen_uuid)
    resume_id = Column(String, ForeignKey("resume_analyses.id"), nullable=False)
    target_role = Column(String, nullable=False)

    critical_gaps: Any = Column(JSON, default=list)
    moderate_gaps: Any = Column(JSON, default=list)
    minor_gaps: Any = Column(JSON, default=list)
    alignment_score = Column(Float, default=0.0)

    # Full reasoning from LLM
    ai_reasoning = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    resume = relationship("ResumeAnalysis", back_populates="skill_gaps")


class SalaryPrediction(Base):
    """Layer 5 — XGBoost salary feasibility prediction."""
    __tablename__ = "salary_predictions"

    id = Column(String, primary_key=True, default=gen_uuid)
    resume_id = Column(String, ForeignKey("resume_analyses.id"), nullable=False)

    target_salary = Column(Float, nullable=False)
    predicted_salary_min = Column(Float, default=0.0)
    predicted_salary_max = Column(Float, default=0.0)
    predicted_salary_median = Column(Float, default=0.0)
    feasibility_probability = Column(Float, default=0.0)   # 0-100
    market_percentile = Column(Float, default=0.0)
    location = Column(String, nullable=True)
    target_role = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    resume = relationship("ResumeAnalysis", back_populates="salary_prediction")


class CareerStrategy(Base):
    """Layer 6 — GPT-4 / Claude career roadmap generation."""
    __tablename__ = "career_strategies"

    id = Column(String, primary_key=True, default=gen_uuid)
    resume_id = Column(String, ForeignKey("resume_analyses.id"), nullable=False)
    target_role = Column(String, nullable=False)
    target_salary = Column(Float, nullable=True)

    blocking_gaps: Any = Column(JSON, default=list)
    competitive_upgrades: Any = Column(JSON, default=list)
    strategic_projects: Any = Column(JSON, default=list)
    # [{phase: int, name: str, duration: str, skills: list, description: str}]
    roadmap_phases: Any = Column(JSON, default=list)

    # Full Markdown strategy from LLM
    full_strategy_md = Column(Text, nullable=True)

    # Generated resume path
    generated_resume_path = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    resume = relationship("ResumeAnalysis", back_populates="career_strategy")
