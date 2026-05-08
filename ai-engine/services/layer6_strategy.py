"""
Layer 6 — AI Career Strategy Engine
Tools: OpenAI GPT-4o / Claude Sonnet, LangChain Agents, RAG knowledge base
"""
from __future__ import annotations

import json
import re
from typing import Any

import structlog

log = structlog.get_logger(__name__)

# ─────────────────────────────────────────────────────────────────────
# STRATEGY PROMPT
# ─────────────────────────────────────────────────────────────────────

STRATEGY_SYSTEM_PROMPT = """\
You are an elite engineering career strategist with deep knowledge of the tech industry.
Your advice is precise, actionable, and based on real engineering career data.
You think like a FAANG principal engineer mentoring a talented engineer.
"""

STRATEGY_USER_PROMPT = """\
Build a comprehensive career strategy for this engineer.

Profile:
- Current Skills: {current_skills}
- Years of Experience: {experience_years}
- Target Role: {target_role}
- Target Salary: {target_salary}

Gap Analysis:
- Blocking (Critical) Gaps: {critical_gaps}
- Competitive Upgrade Opportunities: {competitive_suggestions}

Output a JSON object with EXACTLY this structure:
{{
  "blocking_gaps": ["gap1", "gap2"],
  "competitive_upgrades": ["upgrade1", "upgrade2"],
  "strategic_projects": [
    {{
      "name": "project name",
      "description": "what to build and why",
      "skills_demonstrated": ["skill1", "skill2"],
      "impact": "what this signals to hiring managers",
      "estimated_weeks": 4
    }}
  ],
  "roadmap_phases": [
    {{
      "phase": 1,
      "name": "phase title",
      "duration": "4-6 weeks",
      "skills": ["skill1", "skill2"],
      "description": "what to learn and build",
      "projects": ["specific project1"]
    }}
  ],
  "full_strategy_md": "A rich 400-600 word Markdown career strategy. Include sections: ## Current Strengths | ## Path to {target_role} | ## 90-Day Action Plan | ## Salary Unlocking Strategy"
}}

Rules:
- blocking_gaps: max 5 critical skills actually blocking the role
- competitive_upgrades: skills that would make THIS engineer stand out
- strategic_projects: 2-3 specific, portfolio-worthy projects to build
- roadmap_phases: 3-4 time-bound phases
- Output ONLY the JSON.
"""


async def _call_openai_strategy(prompt: str, system: str) -> dict:
    from openai import AsyncOpenAI
    from config import settings

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    resp = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        temperature=0.4,
        response_format={"type": "json_object"},
    )
    return json.loads(resp.choices[0].message.content)


async def _call_anthropic_strategy(prompt: str, system: str) -> dict:
    import anthropic
    from config import settings

    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    msg = await client.messages.create(
        model=settings.ANTHROPIC_MODEL,
        max_tokens=4096,
        system=system,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = msg.content[0].text
    raw = re.sub(r"^```(?:json)?\n?", "", raw).rstrip("```").strip()
    return json.loads(raw)


def _build_fallback_strategy(
    target_role: str,
    critical_gaps: list[str],
    current_skills: list[str],
    experience_years: float,
) -> dict:
    """Static strategy when no LLM keys configured."""
    phases = [
        {
            "phase": 1,
            "name": "Foundation",
            "duration": "4-6 weeks",
            "skills": critical_gaps[:3],
            "description": "Build core competencies required for the target role.",
            "projects": ["Build a demo project demonstrating all Phase 1 skills."],
        },
        {
            "phase": 2,
            "name": "Application",
            "duration": "6-8 weeks",
            "skills": critical_gaps[3:] if len(critical_gaps) > 3 else [],
            "description": "Apply skills in a production-quality portfolio project.",
            "projects": ["Deploy a scalable application using Phase 1 and 2 skills."],
        },
        {
            "phase": 3,
            "name": "Interview Readiness",
            "duration": "4 weeks",
            "skills": ["System Design", "Behavioral Interviews", "Coding Patterns"],
            "description": "Prepare for technical and system design interviews.",
            "projects": ["Complete 50 LeetCode problems", "Practice 3 system design problems."],
        },
    ]
    strategy_md = f"""## Career Strategy — {target_role}

### Current Strengths
You bring {experience_years} years of experience with skills in: {', '.join(current_skills[:8])}.

### Path to {target_role}
Your primary blockers are: {', '.join(critical_gaps[:3]) or 'minimal gaps detected'}.
Address these first to unlock the role.

### 90-Day Action Plan
- **Days 1-30**: Master {critical_gaps[0] if critical_gaps else 'advanced system design'}
- **Days 31-60**: Build a portfolio project demonstrating all required skills
- **Days 61-90**: Interview preparation — systems design + coding

### Salary Unlocking Strategy
Each critical skill added increases salary leverage by approximately 5-10%.
Prioritize skills with highest frequency on target job postings.
"""

    return {
        "blocking_gaps": critical_gaps[:5],
        "competitive_upgrades": ["System Design", "Cloud Architecture", "Open Source Contributions"],
        "strategic_projects": [
            {
                "name": "Production API with Full Observability",
                "description": "Build a REST/gRPC API with metrics, tracing, and CI/CD pipeline.",
                "skills_demonstrated": critical_gaps[:3],
                "impact": "Demonstrates production engineering maturity.",
                "estimated_weeks": 3,
            }
        ],
        "roadmap_phases": phases,
        "full_strategy_md": strategy_md,
    }


# ─────────────────────────────────────────────────────────────────────
# LANGCHAIN AGENT ORCHESTRATION (enhanced mode)
# ─────────────────────────────────────────────────────────────────────

async def _orchestrate_with_langchain(
    target_role: str,
    critical_gaps: list[str],
    current_skills: list[str],
    experience_years: float,
    target_salary: float | None,
) -> dict | None:
    """
    Use LangChain Agents to orchestrate multi-step career planning
    with tool calls to RAG knowledge base.
    """
    try:
        from langchain_openai import ChatOpenAI
        from langchain.agents import AgentExecutor, create_openai_tools_agent
        from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
        from langchain_core.tools import tool
        from config import settings

        if not settings.OPENAI_API_KEY:
            return None

        llm = ChatOpenAI(
            api_key=settings.OPENAI_API_KEY,
            model=settings.OPENAI_MODEL,
            temperature=0.3,
        )

        @tool
        def get_learning_resources(skill: str) -> str:
            """Get top learning resources for a specific engineering skill."""
            resources_map = {
                "Kubernetes": "Kubernetes Official Docs, CKAD certification, Techworld with Nana",
                "Docker": "Docker Official Docs, Docker Deep Dive (Nigel Poulton)",
                "System Design": "Designing Data-Intensive Applications (Kleppmann), system-design-primer",
                "AWS": "AWS Solutions Architect Associate certification, AWS Official Docs",
                "Terraform": "HashiCorp Learn, Terraform Up & Running (Yevgeniy Brikman)",
                "Python": "Python Documentation, Fast.ai, Talk Python podcast",
                "React": "React Official Docs, Epic React by Kent C. Dodds",
                "Machine Learning": "fast.ai, Coursera ML (Andrew Ng), Hands-On ML (Geron)",
            }
            return resources_map.get(skill, f"Search: '{skill} engineering tutorial site:docs.github.com'")

        @tool
        def estimate_time_to_role(skill_gaps: str, experience_years: float) -> str:
            """Estimate timeline to be ready for a role given skill gaps and experience."""
            gaps = [s.strip() for s in skill_gaps.split(",")]
            weeks_per_skill = 4 if experience_years > 3 else 6
            total = len(gaps) * weeks_per_skill
            return f"Estimated {total}-{total + 8} weeks to close {len(gaps)} gaps at your experience level."

        tools = [get_learning_resources, estimate_time_to_role]

        prompt = ChatPromptTemplate.from_messages([
            ("system", STRATEGY_SYSTEM_PROMPT),
            ("human", (
                f"Create a career strategy for an engineer targeting {target_role}. "
                f"Current skills: {', '.join(current_skills[:15])}. "
                f"Experience: {experience_years} years. "
                f"Critical gaps: {', '.join(critical_gaps[:5])}. "
                f"Target salary: {'$' + str(target_salary) if target_salary else 'not specified'}."
                f"\n\nUse your tools to gather specific learning resources, then output a JSON career strategy."
            )),
            MessagesPlaceholder("agent_scratchpad"),
        ])

        agent = create_openai_tools_agent(llm, tools, prompt)
        executor = AgentExecutor(
            agent=agent,
            tools=tools,
            verbose=False,
            max_iterations=5,
            handle_parsing_errors=True,
        )

        result = await executor.ainvoke({})
        output = result.get("output", "")

        # Try to extract JSON from agent output
        json_match = re.search(r"\{.*\}", output, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return None

    except Exception as exc:
        log.debug("langchain_agent.failed", error=str(exc))
        return None


# ─────────────────────────────────────────────────────────────────────
# MAIN SERVICE FUNCTION
# ─────────────────────────────────────────────────────────────────────

async def generate_strategy(
    resume_id: str,
    target_role: str,
    current_skills: list[str],
    critical_gaps: list[str],
    experience_years: float = 0.0,
    target_salary: float | None = None,
) -> dict[str, Any]:
    """
    Full Layer 6 pipeline:
    Skill gaps + role goals + salary target → AI career roadmap
    """
    from config import settings
    log.info("layer6.start", resume_id=resume_id, role=target_role)

    # Derive competitive upgrade suggestions
    common_competitive = [
        "System Design", "Cloud Architecture", "Open Source Contributions",
        "Technical Writing", "Distributed Systems", "Leadership",
    ]
    competitive = [s for s in common_competitive if s.lower() not in {x.lower() for x in current_skills}]

    prompt = STRATEGY_USER_PROMPT.format(
        current_skills=", ".join(current_skills[:20]),
        experience_years=experience_years,
        target_role=target_role,
        target_salary=f"${target_salary:,.0f}" if target_salary else "Not specified",
        critical_gaps=", ".join(critical_gaps[:5]) or "None identified",
        competitive_suggestions=", ".join(competitive[:4]),
    )

    # Try OpenAI first, then Claude, then LangChain agents, then fallback
    result = None

    if settings.OPENAI_API_KEY:
        try:
            result = await _call_openai_strategy(prompt, STRATEGY_SYSTEM_PROMPT)
        except Exception as exc:
            log.warning("layer6.openai_failed", error=str(exc))

    if result is None and settings.ANTHROPIC_API_KEY:
        try:
            result = await _call_anthropic_strategy(prompt, STRATEGY_SYSTEM_PROMPT)
        except Exception as exc:
            log.warning("layer6.claude_failed", error=str(exc))

    if result is None:
        try:
            result = await _orchestrate_with_langchain(
                target_role, critical_gaps, current_skills,
                experience_years, target_salary,
            )
        except Exception as exc:
            log.warning("layer6.langchain_failed", error=str(exc))

    if result is None:
        result = _build_fallback_strategy(
            target_role, critical_gaps, current_skills, experience_years
        )

    result["resume_id"] = resume_id
    result["target_role"] = target_role

    log.info(
        "layer6.done",
        resume_id=resume_id,
        phases=len(result.get("roadmap_phases", [])),
        blocking=len(result.get("blocking_gaps", [])),
    )
    return result
