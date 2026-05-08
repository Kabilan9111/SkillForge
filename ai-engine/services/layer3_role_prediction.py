"""
Layer 3 — Career Role Prediction Engine
Tools: Sentence Transformers (SBERT), FAISS Vector Database, HuggingFace Transformers
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np
import structlog

log = structlog.get_logger(__name__)

# ─────────────────────────────────────────────────────────────────────
# ROLE KNOWLEDGE BASE
# Each role has a canonical skill vector and description.
# ─────────────────────────────────────────────────────────────────────

ROLE_KB: list[dict[str, Any]] = [
    {
        "role": "Software Engineer",
        "description": "Builds scalable applications with strong coding fundamentals.",
        "core_skills": [
            "Python", "JavaScript", "TypeScript", "Algorithms", "Data Structures",
            "REST API", "Git", "Testing", "SQL", "Object-Oriented Design",
        ],
        "bonus_skills": ["Go", "Java", "React", "PostgreSQL", "Docker"],
    },
    {
        "role": "Backend Engineer",
        "description": "Specializes in server-side systems, APIs, and databases.",
        "core_skills": [
            "Python", "Go", "Java", "PostgreSQL", "Redis", "REST API",
            "Microservices", "Message Queues", "Kafka", "gRPC", "Docker",
        ],
        "bonus_skills": ["Kubernetes", "Elasticsearch", "MongoDB", "Terraform"],
    },
    {
        "role": "Frontend Engineer",
        "description": "Builds user interfaces and client-side web applications.",
        "core_skills": [
            "JavaScript", "TypeScript", "React", "HTML/CSS", "Next.js",
            "State Management", "GraphQL", "REST API", "Jest", "Webpack",
        ],
        "bonus_skills": ["Vue", "Angular", "Node.js", "Performance Optimization"],
    },
    {
        "role": "Fullstack Engineer",
        "description": "Owns both frontend and backend across the full stack.",
        "core_skills": [
            "JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL",
            "REST API", "Docker", "Git", "HTML/CSS", "Python",
        ],
        "bonus_skills": ["Next.js", "GraphQL", "Redis", "AWS", "Testing"],
    },
    {
        "role": "DevOps Engineer",
        "description": "Manages infrastructure, CI/CD pipelines, and reliability.",
        "core_skills": [
            "Docker", "Kubernetes", "Terraform", "AWS", "CI/CD",
            "Linux", "Shell/Bash", "Ansible", "Prometheus", "Grafana",
        ],
        "bonus_skills": ["Python", "Go", "GitHub Actions", "ELK Stack", "Helm"],
    },
    {
        "role": "Cloud Engineer",
        "description": "Designs and manages large-scale cloud infrastructure.",
        "core_skills": [
            "AWS", "GCP", "Azure", "Terraform", "Kubernetes",
            "Networking", "Security", "IaC", "Serverless", "Cloud Architecture",
        ],
        "bonus_skills": ["Python", "Go", "Docker", "Helm", "Cost Optimization"],
    },
    {
        "role": "AI Engineer",
        "description": "Builds AI/ML systems and deploys models to production.",
        "core_skills": [
            "Python", "PyTorch", "TensorFlow", "Machine Learning", "LangChain",
            "FastAPI", "Vector Databases", "LLM", "MLflow", "Docker",
        ],
        "bonus_skills": ["Kubernetes", "RAG", "fine-tuning", "Triton", "CUDA"],
    },
    {
        "role": "Data Engineer",
        "description": "Builds data pipelines, warehouses, and ETL systems.",
        "core_skills": [
            "Python", "SQL", "Spark", "Kafka", "Airflow",
            "dbt", "Snowflake", "BigQuery", "PostgreSQL", "Data Modeling",
        ],
        "bonus_skills": ["Scala", "AWS", "GCP", "Flink", "Redshift"],
    },
    {
        "role": "Data Scientist",
        "description": "Analyzes data and builds predictive models.",
        "core_skills": [
            "Python", "Machine Learning", "Statistics", "Pandas", "Scikit-learn",
            "SQL", "Jupyter", "XGBoost", "Data Visualization", "Experimentation",
        ],
        "bonus_skills": ["PyTorch", "TensorFlow", "Spark", "R", "Deep Learning"],
    },
    {
        "role": "Security Engineer",
        "description": "Protects systems from vulnerabilities and attacks.",
        "core_skills": [
            "Penetration Testing", "Threat Modeling", "OWASP", "AWS Security",
            "Linux", "Cryptography", "IAM", "Network Security", "Python", "Go",
        ],
        "bonus_skills": ["SIEM", "Zero Trust", "Kubernetes Security", "Compliance"],
    },
]


# ─────────────────────────────────────────────────────────────────────
# SBERT MODEL — Singleton
# ─────────────────────────────────────────────────────────────────────

_sbert_model = None


def _get_sbert():
    global _sbert_model
    if _sbert_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            from config import settings
            _sbert_model = SentenceTransformer(settings.SBERT_MODEL)
            log.info("sbert.loaded", model=settings.SBERT_MODEL)
        except Exception as exc:
            log.error("sbert.load_failed", error=str(exc))
    return _sbert_model


def _embed(texts: list[str]) -> np.ndarray:
    model = _get_sbert()
    if model is None:
        # Fallback: random embeddings (dev mode)
        return np.random.rand(len(texts), 384).astype("float32")
    embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    return np.array(embeddings, dtype="float32")


# ─────────────────────────────────────────────────────────────────────
# FAISS INDEX — Build and Query
# ─────────────────────────────────────────────────────────────────────

_faiss_index = None
_faiss_roles: list[str] = []


def _build_faiss_index_from_kb() -> tuple:
    """Build an in-memory FAISS index from the role knowledge base."""
    import faiss

    role_docs = [
        f"{r['role']}: {r['description']}. Core skills: {', '.join(r['core_skills'])}."
        for r in ROLE_KB
    ]
    roles_list = [r["role"] for r in ROLE_KB]
    embeddings = _embed(role_docs)

    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)   # Inner product (cosine on normalized vectors)
    index.add(embeddings)

    log.info("faiss_index.built", roles=len(roles_list), dim=dim)
    return index, roles_list


def _get_faiss_index():
    global _faiss_index, _faiss_roles
    if _faiss_index is None:
        _faiss_index, _faiss_roles = _build_faiss_index_from_kb()
    return _faiss_index, _faiss_roles


def _similarity_search(
    query_text: str,
    top_k: int = 5,
) -> list[tuple[str, float]]:
    """Return [(role_name, similarity_score), ...] for top_k roles."""
    index, roles = _get_faiss_index()
    q_emb = _embed([query_text])
    D, I = index.search(q_emb, top_k)
    results = []
    for dist, idx in zip(D[0], I[0]):
        if idx < len(roles):
            results.append((roles[idx], float(dist)))
    return results


# ─────────────────────────────────────────────────────────────────────
# SCORING — Compute per-role skill overlap
# ─────────────────────────────────────────────────────────────────────

def _compute_skill_overlap(
    user_skills: list[str],
    role: dict,
) -> tuple[list[str], list[str], float]:
    """Return (matching_skills, gap_skills, score 0-100)."""
    user_lower = {s.lower() for s in user_skills}
    core = role["core_skills"]
    bonus = role.get("bonus_skills", [])

    matching = [s for s in core if s.lower() in user_lower]
    matching += [s for s in bonus if s.lower() in user_lower]
    gaps = [s for s in core if s.lower() not in user_lower]

    core_weight = 0.8
    bonus_weight = 0.2
    core_match = len([s for s in core if s.lower() in user_lower])
    bonus_match = len([s for s in bonus if s.lower() in user_lower])
    score = (
        (core_match / max(len(core), 1)) * 100 * core_weight
        + (bonus_match / max(len(bonus), 1)) * 100 * bonus_weight
    )
    return matching, gaps, round(score, 1)


# ─────────────────────────────────────────────────────────────────────
# MAIN SERVICE FUNCTION
# ─────────────────────────────────────────────────────────────────────

async def predict_roles(
    resume_id: str,
    skills: list[str],
    tools: list[str],
    experience_years: float = 0.0,
) -> dict[str, Any]:
    """
    Full Layer 3 pipeline:
    SBERT embeddings → FAISS similarity search → skill overlap scoring
    """
    log.info("layer3.start", resume_id=resume_id, skills=len(skills))

    all_skills = list(set(skills + tools))
    query = f"Skills: {', '.join(all_skills[:30])}. Experience: {experience_years} years."

    # FAISS search — semantic similarity
    faiss_results = _similarity_search(query, top_k=6)
    semantic_map = {role: score for role, score in faiss_results}

    # Per-role skill overlap scoring
    predictions: list[dict] = []

    role_map = {r["role"]: r for r in ROLE_KB}

    for role_info in ROLE_KB:
        role_name = role_info["role"]
        matching, gaps, skill_score = _compute_skill_overlap(all_skills, role_info)
        semantic_score = semantic_map.get(role_name, 0.0) * 100

        # Blend: 60% skill overlap + 40% semantic similarity
        final_score = (skill_score * 0.6) + (semantic_score * 0.4)

        predictions.append({
            "role": role_name,
            "probability": round(final_score, 1),
            "matching_skills": matching[:10],
            "gap_skills": gaps[:8],
            "description": role_info["description"],
        })

    # Sort by probability descending
    predictions.sort(key=lambda x: x["probability"], reverse=True)
    top = predictions[0]

    result = {
        "resume_id": resume_id,
        "top_role": top["role"],
        "top_role_score": top["probability"],
        "predictions": predictions[:6],
    }

    log.info("layer3.done", resume_id=resume_id, top_role=top["role"], score=top["probability"])
    return result
