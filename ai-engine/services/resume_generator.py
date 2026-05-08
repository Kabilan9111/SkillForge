"""
AI Resume Generator
Tools: OpenAI GPT-4o / Claude Sonnet, Jinja2, WeasyPrint (PDF)
"""
from __future__ import annotations

import re
import uuid
from pathlib import Path
from typing import Any

import structlog

log = structlog.get_logger(__name__)

# ─────────────────────────────────────────────────────────────────────
# HTML RESUME TEMPLATE (Jinja2)
# ─────────────────────────────────────────────────────────────────────

RESUME_HTML_TEMPLATE = """\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; font-size: 11pt; line-height: 1.5; padding: 40px 48px; max-width: 820px; margin: auto; }
  h1 { font-size: 22pt; font-weight: 700; letter-spacing: -0.5px; }
  .contact { color: #555; font-size: 10pt; margin-top: 4px; }
  .section { margin-top: 24px; }
  .section-title { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #444; border-bottom: 1.5px solid #e0e0e0; padding-bottom: 4px; margin-bottom: 12px; }
  .role-title { font-weight: 700; font-size: 11pt; }
  .role-meta { color: #666; font-size: 10pt; }
  .bullets { margin-left: 16px; margin-top: 4px; }
  .bullets li { margin-bottom: 3px; }
  .skills-grid { display: flex; flex-wrap: wrap; gap: 6px; }
  .skill-tag { background: #f4f4f4; border-radius: 3px; padding: 2px 8px; font-size: 10pt; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .highlight { color: #0066cc; font-weight: 600; }
</style>
</head>
<body>
  <h1>{{ contact.name or "Your Name" }}</h1>
  <div class="contact">
    {{ contact.email or "" }}{% if contact.phone %} · {{ contact.phone }}{% endif %}
    {% if contact.location %} · {{ contact.location }}{% endif %}
    {% if contact.linkedin %} · {{ contact.linkedin }}{% endif %}
    {% if contact.github %} · {{ contact.github }}{% endif %}
  </div>

  {% if summary %}
  <div class="section">
    <div class="section-title">Summary</div>
    <p>{{ summary }}</p>
  </div>
  {% endif %}

  {% if skills %}
  <div class="section">
    <div class="section-title">Technical Skills</div>
    <div class="skills-grid">
      {% for skill in skills %}<span class="skill-tag">{{ skill }}</span>{% endfor %}
    </div>
  </div>
  {% endif %}

  {% if experience %}
  <div class="section">
    <div class="section-title">Experience</div>
    {% for job in experience %}
    <div style="margin-bottom: 14px;">
      <div class="role-title">{{ job.title }} — <span class="highlight">{{ job.company }}</span></div>
      <div class="role-meta">{{ job.start_date }} – {{ job.end_date }}</div>
      {% if job.responsibilities %}
      <ul class="bullets">
        {% for item in job.responsibilities[:5] %}<li>{{ item }}</li>{% endfor %}
      </ul>
      {% endif %}
    </div>
    {% endfor %}
  </div>
  {% endif %}

  {% if projects %}
  <div class="section">
    <div class="section-title">Projects</div>
    {% for proj in projects %}
    <div style="margin-bottom: 10px;">
      <div class="role-title">{{ proj.name }}</div>
      <p>{{ proj.description }}</p>
      {% if proj.tech_stack %}<p style="margin-top:3px;color:#666;font-size:10pt;">Stack: {{ proj.tech_stack | join(', ') }}</p>{% endif %}
    </div>
    {% endfor %}
  </div>
  {% endif %}

  {% if education %}
  <div class="section">
    <div class="section-title">Education</div>
    {% for edu in education %}
    <div>
      <span class="role-title">{{ edu.degree }}</span> in {{ edu.field }}
      — {{ edu.institution }}{% if edu.year %}, {{ edu.year }}{% endif %}
    </div>
    {% endfor %}
  </div>
  {% endif %}

  {% if certifications %}
  <div class="section">
    <div class="section-title">Certifications</div>
    {% for cert in certifications %}<div>• {{ cert }}</div>{% endfor %}
  </div>
  {% endif %}
</body>
</html>
"""

# ─────────────────────────────────────────────────────────────────────
# LLM RESUME REWRITING
# ─────────────────────────────────────────────────────────────────────

REWRITE_PROMPT = """\
You are an expert resume writer specializing in software engineering resumes.
Rewrite and optimize this resume for the target role.

Target Role: {target_role}
Current Skills: {skills}
Experience: {experience}

Rules:
- Use strong action verbs (Architected, Designed, Led, Optimized, Scaled, Built)
- Quantify every achievement (%, $, x faster, N users, N ms latency)
- Align highlighted skills with target role requirements
- Write a powerful 2-sentence professional summary
- Keep bullet points concise and impactful (max 20 words each)
- Remove irrelevant experience for this role

Output a JSON object:
{{
  "summary": "2-sentence powerful summary targeting {target_role}",
  "optimized_bullets": {{
    "company_name": ["optimized bullet1", "optimized bullet2"]
  }},
  "highlighted_skills": ["skill1", "skill2", "...top 15 skills for {target_role}"]
}}

Output ONLY the JSON.
"""


async def rewrite_resume_with_llm(
    parsed_resume: dict,
    target_role: str,
) -> dict[str, Any]:
    from config import settings

    exp_summary = [
        f"{e.get('company')}: {e.get('title')}"
        for e in parsed_resume.get("experience", [])[:4]
    ]

    prompt = REWRITE_PROMPT.format(
        target_role=target_role,
        skills=", ".join(parsed_resume.get("skills", [])[:20]),
        experience="\n".join(exp_summary),
    )

    try:
        if settings.OPENAI_API_KEY:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            resp = await client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                response_format={"type": "json_object"},
            )
            return dict(json_loads_safe(resp.choices[0].message.content))

        elif settings.ANTHROPIC_API_KEY:
            import anthropic
            client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
            msg = await client.messages.create(
                model=settings.ANTHROPIC_MODEL,
                max_tokens=2048,
                messages=[{"role": "user", "content": prompt}],
            )
            raw = msg.content[0].text
            raw = re.sub(r"^```(?:json)?\n?", "", raw).rstrip("```").strip()
            return dict(json_loads_safe(raw))
    except Exception as exc:
        log.warning("resume_generator.llm_failed", error=str(exc))

    return {
        "summary": f"Experienced engineer with {parsed_resume.get('years_of_experience', 0)} years targeting {target_role}.",
        "optimized_bullets": {},
        "highlighted_skills": parsed_resume.get("skills", [])[:15],
    }


def json_loads_safe(raw: str) -> dict:
    import json
    try:
        return json.loads(raw)
    except Exception:
        return {}


# ─────────────────────────────────────────────────────────────────────
# PDF GENERATION
# ─────────────────────────────────────────────────────────────────────

def render_html(context: dict) -> str:
    from jinja2 import Environment
    env = Environment(autoescape=True)
    template = env.from_string(RESUME_HTML_TEMPLATE)
    return template.render(**context)


def html_to_pdf(html_content: str, output_path: Path) -> Path:
    try:
        from weasyprint import HTML
        HTML(string=html_content).write_pdf(str(output_path))
        log.info("pdf.generated", path=str(output_path))
        return output_path
    except Exception as exc:
        log.warning("weasyprint.failed", error=str(exc))
        # Fallback: save HTML
        html_path = output_path.with_suffix(".html")
        html_path.write_text(html_content, encoding="utf-8")
        return html_path


# ─────────────────────────────────────────────────────────────────────
# MAIN SERVICE FUNCTION
# ─────────────────────────────────────────────────────────────────────

async def generate_resume(
    resume_id: str,
    parsed_resume: dict,
    target_role: str,
    output_format: str = "pdf",
) -> dict[str, Any]:
    """
    Full AI Resume Generator pipeline:
    Original resume → LLM rewrite → HTML template → PDF
    """
    from config import settings

    log.info("resume_gen.start", resume_id=resume_id, role=target_role)

    # 1. LLM rewrite
    rewrite = await rewrite_resume_with_llm(parsed_resume, target_role)

    # 2. Apply rewrites to experience bullets
    experience = parsed_resume.get("experience", [])
    optimized_bullets = rewrite.get("optimized_bullets", {})
    for job in experience:
        company = job.get("company", "")
        if company in optimized_bullets:
            job["responsibilities"] = optimized_bullets[company]

    # 3. Build template context
    context = {
        "contact": parsed_resume.get("contact", {}),
        "summary": rewrite.get("summary", ""),
        "skills": rewrite.get("highlighted_skills", parsed_resume.get("skills", [])),
        "experience": experience,
        "projects": parsed_resume.get("projects", []),
        "education": parsed_resume.get("education", []),
        "certifications": parsed_resume.get("certifications", []),
    }

    # 4. Render HTML
    html_content = render_html(context)

    # 5. Generate PDF / return HTML
    out_dir = Path(settings.UPLOAD_DIR) / "generated_resumes"
    out_dir.mkdir(parents=True, exist_ok=True)
    file_id = str(uuid.uuid4())[:8]
    out_file = out_dir / f"resume_{resume_id[:8]}_{file_id}.pdf"

    if output_format == "pdf":
        final_path = html_to_pdf(html_content, out_file)
    else:
        final_path = out_file.with_suffix(".html")
        final_path.write_text(html_content, encoding="utf-8")

    relative_path = str(final_path).replace("\\", "/")
    download_url = f"/generated-resumes/{final_path.name}"

    result = {
        "resume_id": resume_id,
        "download_url": download_url,
        "local_path": relative_path,
        "sections": context,
    }

    log.info("resume_gen.done", resume_id=resume_id, file=str(final_path))
    return result
