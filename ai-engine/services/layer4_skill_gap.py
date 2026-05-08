"""
Layer 4 — Skill Gap Intelligence Engine
Tools: Neo4j Knowledge Graph, LangChain RAG, OpenAI GPT-4 / Claude

FIXES APPLIED:
  - REMOVED default role fallback (no longer silently falls back to DevOps/SW template)
  - get_role_requirements() returns None for unknown roles
  - Structured LLM context (resume skills + role + salary + experience all sent)
  - Hard stop if role is not recognized and no skills context
  - Structured logging at every step
"""
from __future__ import annotations

import json
import logging
from typing import Any

import structlog

log = structlog.get_logger(__name__)
_log = logging.getLogger("skillforge.layer4")

# ─────────────────────────────────────────────────────────────────────
# ROLE SKILL REQUIREMENT GRAPH (Fallback if Neo4j unavailable)
# ─────────────────────────────────────────────────────────────────────

ROLE_REQUIREMENTS: dict[str, dict[str, list[str]]] = {
    "Software Engineer": {
        "critical":   ["Data Structures", "Algorithms", "SQL", "Git", "Testing"],
        "moderate":   ["System Design", "REST API", "Docker", "CI/CD"],
        "minor":      ["GraphQL", "Redis", "Kubernetes"],
    },
    "Backend Engineer": {
        "critical":   ["Python", "PostgreSQL", "Redis", "REST API", "Docker", "Microservices"],
        "moderate":   ["Kafka", "gRPC", "Kubernetes", "System Design", "Terraform"],
        "minor":      ["Elasticsearch", "MongoDB", "AWS"],
    },
    "Frontend Engineer": {
        "critical":   ["React", "TypeScript", "HTML/CSS", "State Management", "Testing"],
        "moderate":   ["Next.js", "GraphQL", "Performance Optimization", "Accessibility"],
        "minor":      ["Node.js", "PWA", "WebSockets"],
    },
    "Fullstack Engineer": {
        "critical":   ["React", "Node.js", "TypeScript", "PostgreSQL", "REST API"],
        "moderate":   ["Docker", "Next.js", "Redis", "Testing", "CI/CD"],
        "minor":      ["AWS", "GraphQL", "System Design"],
    },
    "DevOps Engineer": {
        "critical":   ["Docker", "Kubernetes", "Terraform", "CI/CD", "AWS", "Linux"],
        "moderate":   ["Ansible", "Prometheus", "Grafana", "Helm", "Scripting"],
        "minor":      ["GitOps", "Service Mesh", "Cost Optimization"],
    },
    "Cloud Engineer": {
        "critical":   ["AWS", "Terraform", "Kubernetes", "Networking", "IAM"],
        "moderate":   ["GCP", "Azure", "Serverless", "Cloud Architecture", "Security"],
        "minor":      ["FinOps", "Multi-cloud", "Compliance"],
    },
    "AI Engineer": {
        "critical":   ["Python", "PyTorch", "LangChain", "FastAPI", "Vector Databases"],
        "moderate":   ["LLM Fine-tuning", "RAG", "MLflow", "Docker", "ML Pipelines"],
        "minor":      ["CUDA", "Triton", "Model Serving", "Kubernetes"],
    },
    "Data Engineer": {
        "critical":   ["Python", "SQL", "Spark", "Airflow", "Data Modeling"],
        "moderate":   ["Kafka", "dbt", "Snowflake", "BigQuery", "ETL"],
        "minor":      ["Scala", "Flink", "Data Governance"],
    },
    "Data Scientist": {
        "critical":   ["Python", "Machine Learning", "Statistics", "Scikit-learn", "SQL"],
        "moderate":   ["XGBoost", "Deep Learning", "Feature Engineering", "A/B Testing"],
        "minor":      ["Spark", "MLOps", "Causal Inference"],
    },
    "Senior Software Engineer": {
        "critical":   ["System Design", "Distributed Systems", "Kubernetes", "AWS", "SQL"],
        "moderate":   ["Kafka", "Redis", "Microservices", "Performance Tuning", "Mentoring"],
        "minor":      ["Cloud Architecture", "Cost Optimization", "On-call SRE"],
    },
}


class RoleNotFoundError(ValueError):
    """Raised when target role cannot be matched and no fallback should be used."""
    pass


def get_role_requirements(target_role: str) -> dict[str, list[str]] | None:
    """
    Lookup role requirements.
    Returns None if role is not recognized — NEVER returns a default template.
    The caller must handle None by either asking the user to clarify or using
    LLM-only analysis without a static requirement set.
    """
    direct = ROLE_REQUIREMENTS.get(target_role)
    if direct:
        _log.info("layer4.role_matched_exact — role=%s", target_role)
        return direct

    # Fuzzy match
    for role_key in ROLE_REQUIREMENTS:
        if role_key.lower() in target_role.lower() or target_role.lower() in role_key.lower():
            _log.info("layer4.role_matched_fuzzy — query=%s matched=%s", target_role, role_key)
            return ROLE_REQUIREMENTS[role_key]

    # No match — return None, NOT a default template
    _log.warning("layer4.role_not_found — role=%s", target_role)
    return None


# ─────────────────────────────────────────────────────────────────────
# NEO4J KNOWLEDGE GRAPH (optional enhanced lookup)
# ─────────────────────────────────────────────────────────────────────

async def neo4j_get_skill_gaps(
    target_role: str,
    user_skills: list[str],
    neo4j_uri: str,
    neo4j_user: str,
    neo4j_pass: str,
) -> dict[str, list[str]] | None:
    """
    Query Neo4j graph for role → required skill relationships.
    Returns None if Neo4j is unavailable.
    """
    try:
        from neo4j import AsyncGraphDatabase

        driver = AsyncGraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_pass))
        async with driver.session() as session:
            result = await session.run(
                """
                MATCH (r:Role {name: $role})-[rel:REQUIRES]->(s:Skill)
                RETURN s.name AS skill, rel.importance AS importance
                ORDER BY rel.importance DESC
                """,
                role=target_role,
            )
            records = await result.data()

        await driver.close()

        if not records:
            return None

        user_lower = {s.lower() for s in user_skills}
        gaps: dict[str, list[str]] = {"critical": [], "moderate": [], "minor": []}

        for record in records:
            skill = record["skill"]
            importance = record.get("importance", "minor")
            if skill.lower() not in user_lower:
                gaps.setdefault(importance, []).append(skill)

        return gaps

    except Exception as exc:
        log.debug("neo4j.unavailable", error=str(exc))
        return None


# ─────────────────────────────────────────────────────────────────────
# LangChain RAG — Skill Intelligence Retrieval
# ─────────────────────────────────────────────────────────────────────

def build_langchain_rag():
    """Build a LangChain RAG chain from the KB vectorstore if available."""
    try:
        from langchain_openai import OpenAIEmbeddings, ChatOpenAI
        from langchain_community.vectorstores import FAISS as LCFaiss
        from langchain.chains import RetrievalQA
        from langchain_core.prompts import PromptTemplate
        from pathlib import Path
        from config import settings

        vs_path = Path(settings.VECTORSTORE_PATH)
        if not vs_path.exists():
            return None

        embeddings = OpenAIEmbeddings(
            api_key=settings.OPENAI_API_KEY,
            model=settings.OPENAI_EMBEDDING_MODEL,
        )
        db = LCFaiss.load_local(str(vs_path), embeddings, allow_dangerous_deserialization=True)
        retriever = db.as_retriever(search_kwargs={"k": 5})

        llm = ChatOpenAI(
            api_key=settings.OPENAI_API_KEY,
            model=settings.OPENAI_MODEL,
            temperature=0,
        )
        prompt = PromptTemplate(
            input_variables=["context", "question"],
            template=(
                "Use the engineering career knowledge below to answer the question.\n\n"
                "Context:\n{context}\n\nQuestion: {question}\nAnswer:"
            ),
        )
        chain = RetrievalQA.from_chain_type(
            llm=llm,
            retriever=retriever,
            chain_type="stuff",
            chain_type_kwargs={"prompt": prompt},
        )
        return chain
    except Exception as exc:
        log.debug("langchain_rag.unavailable", error=str(exc))
        return None


_rag_chain = None


# ─────────────────────────────────────────────────────────────────────
# LLM REASONING — Gap Analysis
# ─────────────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────────────
# LLM REASONING — Structured Context (FIXED: includes all available inputs)
# ─────────────────────────────────────────────────────────────────────

GAP_ANALYSIS_PROMPT = """\
You are a senior engineering career advisor at a top-tier company.
You are performing a precise, data-driven skill gap analysis.
Do NOT hallucinate. Only reason from the skills and context provided.

## STRUCTURED INPUT CONTEXT

User's Current Skills:
{current_skills}

User's Current Tools & Platforms:
{current_tools}

Years of Experience: {experience_years}
Target Role: {target_role}
Target Salary: {target_salary}

## ROLE REQUIREMENTS
- Critical Skills Required: {critical_req}
- Moderately Important Skills: {moderate_req}
- Nice-to-Have Skills: {minor_req}

## DETECTED GAPS (pre-computed from skill comparison)
- Critical (blocking) gaps: {critical_gaps}
- Moderate gaps: {moderate_gaps}
- Minor gaps: {minor_gaps}

Alignment Score: {alignment_score}%

## INSTRUCTION
Generate a precise JSON analysis using ONLY the above context.
Do NOT introduce skills that were not mentioned or inferred from the user's data.
Every gap MUST be derived from the role requirements vs. the user's skill list.

{{
  "critical_gaps": [
    {{
      "skill": "exact skill name from requirements",
      "importance": "critical",
      "description": "specific reason this skill blocks {target_role} given the user's current skills",
      "learning_time": "realistic time estimate e.g. 4-6 weeks",
      "resources": ["specific resource 1", "specific resource 2"]
    }}
  ],
  "moderate_gaps": [...],
  "minor_gaps": [...],
  "ai_reasoning": "2-3 sentence honest assessment. Reference the user's actual skill list. State what they already have and what is blocking them for {target_role} at {target_salary}."
}}

Rules:
- Output ONLY the JSON. No markdown. No explanation outside the JSON.
- If a gap list is empty, output an empty array [].
- Reasoning must mention the user's existing skills by name.
"""


async def analyze_gaps_with_llm(
    target_role: str,
    current_skills: list[str],
    current_tools: list[str],
    experience_years: float,
    target_salary: float | None,
    reqs: dict,
    gaps: dict,
    alignment_score: float,
) -> dict:
    from config import settings

    salary_str = f"${target_salary:,.0f}" if target_salary else "Not specified"

    prompt = GAP_ANALYSIS_PROMPT.format(
        target_role=target_role,
        current_skills=", ".join(current_skills[:25]) or "None listed",
        current_tools=", ".join(current_tools[:15]) or "None listed",
        experience_years=experience_years,
        target_salary=salary_str,
        critical_req=", ".join(reqs.get("critical", [])) or "N/A",
        moderate_req=", ".join(reqs.get("moderate", [])) or "N/A",
        minor_req=", ".join(reqs.get("minor", [])) or "N/A",
        critical_gaps=", ".join(gaps.get("critical", [])) or "None",
        moderate_gaps=", ".join(gaps.get("moderate", [])) or "None",
        minor_gaps=", ".join(gaps.get("minor", [])) or "None",
        alignment_score=alignment_score,
    )

    _log.info(
        "layer4.llm_start — role=%s salary=%s skills_provided=%d",
        target_role, salary_str, len(current_skills),
    )

    if settings.OPENAI_API_KEY:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        resp = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise career intelligence system. "
                        "Analyze only based on the input provided. "
                        "Never hallucinate skills or requirements."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,   # Low temperature for accuracy
            response_format={"type": "json_object"},
        )
        result = json.loads(resp.choices[0].message.content)
        _log.info(
            "layer4.llm_done — model=%s critical=%d moderate=%d",
            settings.OPENAI_MODEL,
            len(result.get("critical_gaps", [])),
            len(result.get("moderate_gaps", [])),
        )
        return result

    elif settings.ANTHROPIC_API_KEY:
        import re
        import anthropic
        client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        msg = await client.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=3000,
            system=(
                "You are a precise career intelligence system. "
                "Analyze only based on the input provided. "
                "Never hallucinate skills or requirements."
            ),
            messages=[{"role": "user", "content": prompt}],
        )
        raw = msg.content[0].text
        raw = re.sub(r"^```(?:json)?\n?", "", raw).rstrip("```").strip()
        result = json.loads(raw)
        _log.info(
            "layer4.llm_done — model=%s critical=%d moderate=%d",
            settings.ANTHROPIC_MODEL,
            len(result.get("critical_gaps", [])),
            len(result.get("moderate_gaps", [])),
        )
        return result
    else:
        _log.warning("layer4.no_llm_key — using rule-based fallback")
        return _build_fallback_gap_response(target_role, gaps)


def _build_fallback_gap_response(target_role: str, gaps: dict) -> dict:
    def build_items(skill_list: list[str], importance: str) -> list[dict]:
        return [
            {
                "skill": s,
                "importance": importance,
                "description": f"{s} is required for {target_role}.",
                "learning_time": "4-8 weeks",
                "resources": [f"Search: '{s} course site:coursera.org'"],
            }
            for s in skill_list
        ]

    return {
        "critical_gaps": build_items(gaps.get("critical", []), "critical"),
        "moderate_gaps": build_items(gaps.get("moderate", []), "moderate"),
        "minor_gaps": build_items(gaps.get("minor", []), "minor"),
        "ai_reasoning": (
            f"Based on your skill profile, you have notable gaps for the {target_role} role. "
            f"Focus first on critical gaps to unlock eligibility, then build moderate skills."
        ),
    }


# ─────────────────────────────────────────────────────────────────────
# MAIN SERVICE FUNCTION
# ─────────────────────────────────────────────────────────────────────

async def analyze_skill_gaps(
    resume_id: str,
    target_role: str,
    current_skills: list[str],
    current_tools: list[str] | None = None,
    experience_years: float = 0.0,
    target_salary: float | None = None,
) -> dict[str, Any]:
    """
    Full Layer 4 pipeline:
    User skills → role requirements lookup → gap computation → LLM structured analysis.

    FIXED:
    - Never runs on empty skills (raises ValueError)
    - Never uses DevOps/default template for unrecognized roles
    - Sends full structured context to LLM (skills + tools + salary + experience)
    """
    from config import settings
    tools = current_tools or []

    _log.info(
        "layer4.start — resume_id=%s role=%s skills=%d tools=%d exp=%.1f salary=%s",
        resume_id, target_role, len(current_skills), len(tools),
        experience_years, str(target_salary),
    )
    log.info("layer4.start", resume_id=resume_id, role=target_role, skills=len(current_skills))

    # ── Guard: no skills ────────────────────────────────────────────────
    if not current_skills and not tools:
        _log.error("layer4.empty_skills — resume_id=%s", resume_id)
        raise ValueError(
            "Insufficient data for skill gap analysis. "
            "No skills were extracted from the resume. "
            "Please upload a resume with clearly listed technical skills."
        )

    # ── Step 1: Get role requirements ────────────────────────────────
    neo4j_result = None
    try:
        neo4j_result = await neo4j_get_skill_gaps(
            target_role, current_skills,
            settings.NEO4J_URI, settings.NEO4J_USER, settings.NEO4J_PASSWORD,
        )
    except Exception as exc:
        _log.debug("layer4.neo4j_skip — %s", exc)

    # get_role_requirements returns None for unknown roles — do NOT default to SW/DevOps
    reqs = get_role_requirements(target_role)

    if reqs is None:
        _log.warning(
            "layer4.role_not_in_kb — role=%s. Using LLM-only analysis (no static requirements).",
            target_role,
        )
        # LLM-only analysis: no static req set, ask LLM to infer from job title
        reqs = {"critical": [], "moderate": [], "minor": []}

    # ── Step 2: Compute raw gaps ────────────────────────────────────
    if neo4j_result:
        gaps = neo4j_result
        _log.info("layer4.gaps_from_neo4j — critical=%d", len(neo4j_result.get("critical", [])))
    else:
        all_user = {s.lower() for s in current_skills + tools}
        gaps = {
            lvl: [s for s in reqs.get(lvl, []) if s.lower() not in all_user]
            for lvl in ("critical", "moderate", "minor")
        }
        _log.info(
            "layer4.gaps_computed — critical=%d moderate=%d minor=%d",
            len(gaps["critical"]), len(gaps["moderate"]), len(gaps["minor"]),
        )

    # ── Step 3: Alignment score ──────────────────────────────────────
    total_req = sum(len(reqs.get(l, [])) for l in ("critical", "moderate", "minor"))
    total_gaps = sum(len(gaps.get(l, [])) for l in ("critical", "moderate", "minor"))
    covered = total_req - total_gaps
    alignment_score = round((covered / max(total_req, 1)) * 100, 1)
    _log.info(
        "layer4.alignment — score=%.1f%% covered=%d/%d",
        alignment_score, covered, total_req,
    )

    # ── Step 4: LLM analysis with full structured context ────────────
    llm_result = await analyze_gaps_with_llm(
        target_role=target_role,
        current_skills=current_skills,
        current_tools=tools,
        experience_years=experience_years,
        target_salary=target_salary,
        reqs=reqs,
        gaps=gaps,
        alignment_score=alignment_score,
    )

    result = {
        "resume_id": resume_id,
        "target_role": target_role,
        "alignment_score": alignment_score,
        "critical_gaps": llm_result.get("critical_gaps", []),
        "moderate_gaps": llm_result.get("moderate_gaps", []),
        "minor_gaps": llm_result.get("minor_gaps", []),
        "ai_reasoning": llm_result.get("ai_reasoning", ""),
    }

    _log.info(
        "layer4.complete — resume_id=%s alignment=%.1f%% critical=%d moderate=%d minor=%d",
        resume_id, alignment_score,
        len(result["critical_gaps"]),
        len(result["moderate_gaps"]),
        len(result["minor_gaps"]),
    )
    log.info(
        "layer4.done",
        resume_id=resume_id,
        alignment=alignment_score,
        critical=len(result["critical_gaps"]),
    )
    return result
