"""
Layer 1 — Resume Understanding Engine
Tools: OpenAI GPT-4o / Claude Sonnet, spaCy, PyMuPDF, docx2txt

FIXES APPLIED:
  - Hard validation: raises ValueError if <3 skills detected
  - Text plausibility check before LLM call
  - Never returns empty skills silently
  - Structured logging at every step
"""
from __future__ import annotations

import logging
import re
import json
import uuid
from io import BytesIO
from pathlib import Path
from typing import Any

import structlog

log = structlog.get_logger(__name__)
_log = logging.getLogger("skillforge.layer1")

# Minimum viable skill count before we consider parsing a success
MIN_SKILLS_REQUIRED = 3
# Minimum resume text length (chars) to be considered a real resume
MIN_TEXT_LENGTH = 100


# ─────────────────────────────────────────────────────────────────────
# VALIDATION — Hard Guards
# ─────────────────────────────────────────────────────────────────────

class ResumeParseError(ValueError):
    """Raised when resume cannot be parsed to minimum quality standards."""
    pass


def _check_text_plausibility(raw_text: str, file_name: str) -> None:
    """
    Validates that extracted text looks like a real resume.
    Raises ResumeParseError immediately if not.
    """
    if not raw_text or len(raw_text.strip()) < MIN_TEXT_LENGTH:
        _log.error(
            "resume.text_too_short",
            extra={"file": file_name, "chars": len(raw_text or "")},
        )
        raise ResumeParseError(
            f"Resume text extraction failed or file is empty. "
            f"Extracted only {len(raw_text or '')} characters from '{file_name}'. "
            f"Please upload a readable PDF or DOCX file."
        )


def _validate_parse_result(structured: dict, resume_id: str) -> None:
    """
    Validates that the LLM/regex extracted meaningful skill data.
    Raises ResumeParseError if skills list is below threshold.
    This is the critical guard that prevents empty-skill hallucination.
    """
    skills = structured.get("skills", [])
    tools  = structured.get("tools",  [])
    all_detected = len(skills) + len(tools)

    _log.info(
        "resume.parse_validation",
        extra={
            "resume_id": resume_id,
            "skills_found": len(skills),
            "tools_found": len(tools),
            "total": all_detected,
            "threshold": MIN_SKILLS_REQUIRED,
        },
    )

    if all_detected < MIN_SKILLS_REQUIRED:
        _log.error(
            "resume.insufficient_skills",
            extra={
                "resume_id": resume_id,
                "skills": skills,
                "tools": tools,
            },
        )
        raise ResumeParseError(
            f"Resume parsing failed. Only {all_detected} skill(s) detected "
            f"(minimum required: {MIN_SKILLS_REQUIRED}). "
            f"Please upload a more detailed resume with clearly listed technical skills, "
            f"or ensure your PDF/DOCX is not image-only."
        )


# ─────────────────────────────────────────────────────────────────────
# PDF / DOCX TEXT EXTRACTION
# ─────────────────────────────────────────────────────────────────────

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract raw text from a PDF using PyMuPDF."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages = [page.get_text("text") for page in doc]
        return "\n".join(pages)
    except Exception as exc:
        log.warning("pymupdf_failed", error=str(exc))
        # Fallback to pdfplumber
        return _extract_pdf_pdfplumber(file_bytes)


def _extract_pdf_pdfplumber(file_bytes: bytes) -> str:
    import pdfplumber
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract raw text from a .docx file using docx2txt."""
    try:
        import docx2txt
        from tempfile import NamedTemporaryFile
        with NamedTemporaryFile(suffix=".docx", delete=False) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name
        text = docx2txt.process(tmp_path)
        Path(tmp_path).unlink(missing_ok=True)
        return text or ""
    except Exception as exc:
        log.warning("docx2txt_failed", error=str(exc))
        return _extract_docx_python_docx(file_bytes)


def _extract_docx_python_docx(file_bytes: bytes) -> str:
    from docx import Document
    doc = Document(BytesIO(file_bytes))
    return "\n".join(p.text for p in doc.paragraphs)


# ─────────────────────────────────────────────────────────────────────
# spaCy ENTITY EXTRACTION
# ─────────────────────────────────────────────────────────────────────

_nlp = None  # lazy-loaded

def _get_nlp():
    global _nlp
    if _nlp is None:
        try:
            import spacy
            _nlp = spacy.load("en_core_web_trf")
        except OSError:
            import spacy
            _nlp = spacy.load("en_core_web_sm")
    return _nlp


def spacy_extract_entities(text: str) -> dict[str, list[str]]:
    """Run spaCy NER to pre-extract named entities before LLM call."""
    nlp = _get_nlp()
    doc = nlp(text[:10000])  # Limit to 10k chars for speed
    entities: dict[str, list[str]] = {
        "organizations": [],
        "locations": [],
        "dates": [],
        "persons": [],
        "misc": [],
    }
    for ent in doc.ents:
        if ent.label_ == "ORG":
            entities["organizations"].append(ent.text)
        elif ent.label_ in ("GPE", "LOC"):
            entities["locations"].append(ent.text)
        elif ent.label_ == "DATE":
            entities["dates"].append(ent.text)
        elif ent.label_ == "PERSON":
            entities["persons"].append(ent.text)
        else:
            entities["misc"].append(ent.text)

    # Deduplicate
    for k in entities:
        entities[k] = list(dict.fromkeys(entities[k]))

    return entities


# ─────────────────────────────────────────────────────────────────────
# LLM STRUCTURED EXTRACTION
# ─────────────────────────────────────────────────────────────────────

RESUME_EXTRACTION_PROMPT = """\
You are an expert resume parser. Extract structured information from the resume below.

Resume:
---
{resume_text}
---

Named entities detected by NLP: {entities}

Return a valid JSON object with EXACTLY this structure:
{{
  "skills": ["skill1", "skill2", ...],
  "tools": ["tool1", "tool2", ...],
  "certifications": ["cert1", ...],
  "years_of_experience": <float>,
  "contact": {{
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": ""
  }},
  "experience": [
    {{
      "company": "",
      "title": "",
      "start_date": "",
      "end_date": "",
      "duration_months": 0,
      "responsibilities": [],
      "tech_used": []
    }}
  ],
  "education": [
    {{
      "institution": "",
      "degree": "",
      "field": "",
      "year": ""
    }}
  ],
  "projects": [
    {{
      "name": "",
      "description": "",
      "tech_stack": [],
      "url": ""
    }}
  ]
}}

Rules:
- skills: programming languages, frameworks, methodologies (no tools/infra)
- tools: cloud, devops, databases, SaaS, monitoring systems
- years_of_experience: total professional years as a float
- Output ONLY the JSON. No explanation, no markdown.
"""


async def extract_with_llm(
    resume_text: str,
    entities: dict,
    use_openai: bool = True,
) -> dict[str, Any]:
    """Call GPT-4o or Claude to extract structured resume data."""
    from config import settings

    prompt = RESUME_EXTRACTION_PROMPT.format(
        resume_text=resume_text[:12000],
        entities=json.dumps(entities),
    )

    if use_openai and settings.OPENAI_API_KEY:
        return await _openai_extract(prompt, settings)
    elif settings.ANTHROPIC_API_KEY:
        return await _anthropic_extract(prompt, settings)
    else:
        log.warning("no_llm_key_fallback_regex")
        return _regex_fallback_extract(resume_text)


async def _openai_extract(prompt: str, settings) -> dict:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        response_format={"type": "json_object"},
    )
    raw = response.choices[0].message.content
    return json.loads(raw)


async def _anthropic_extract(prompt: str, settings) -> dict:
    import anthropic
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    msg = await client.messages.create(
        model=settings.ANTHROPIC_MODEL,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = msg.content[0].text
    # Strip markdown code fences if present
    raw = re.sub(r"^```(?:json)?\n?", "", raw).rstrip("```").strip()
    return json.loads(raw)


def _regex_fallback_extract(text: str) -> dict:
    """Very basic regex extraction when no LLM keys are set."""
    skill_keywords = [
        "Python","JavaScript","TypeScript","Go","Java","Rust","C++","Ruby",
        "React","Next.js","Vue","Angular","Node.js","FastAPI","Django","Flask",
        "PostgreSQL","MongoDB","Redis","MySQL","Elasticsearch","Cassandra",
        "AWS","GCP","Azure","Docker","Kubernetes","Terraform","Ansible",
        "Kafka","RabbitMQ","gRPC","GraphQL","REST",
        "Machine Learning","TensorFlow","PyTorch","Scikit-learn",
    ]
    found = [s for s in skill_keywords if re.search(rf"\b{re.escape(s)}\b", text, re.I)]

    years = 0.0
    m = re.search(r"(\d+)\+?\s+years?", text, re.I)
    if m:
        years = float(m.group(1))

    return {
        "skills": found[:20],
        "tools": [],
        "certifications": [],
        "years_of_experience": years,
        "contact": {},
        "experience": [],
        "education": [],
        "projects": [],
    }


# ─────────────────────────────────────────────────────────────────────
# MAIN SERVICE FUNCTION
# ─────────────────────────────────────────────────────────────────────

async def parse_resume(
    file_bytes: bytes,
    file_name: str,
    user_id: str | None = None,
) -> dict[str, Any]:
    """
    Full Layer 1 pipeline:
    file bytes → text extraction → plausibility check → spaCy NER
    → GPT-4o/Claude → validation guard → structured dict

    Raises ResumeParseError if:
      - File text is too short (<100 chars)
      - Skills extracted < MIN_SKILLS_REQUIRED (3)
    Never silently returns empty skill lists.
    """
    resume_id = str(uuid.uuid4())
    ext = Path(file_name).suffix.lower()

    _log.info("layer1.start — resume_id=%s file=%s bytes=%d", resume_id, file_name, len(file_bytes))
    log.info("layer1.start", resume_id=resume_id, file=file_name, size_bytes=len(file_bytes))

    # ── Step 1: Text Extraction ───────────────────────────────────────
    try:
        if ext == ".pdf":
            raw_text = extract_text_from_pdf(file_bytes)
        elif ext in (".docx", ".doc"):
            raw_text = extract_text_from_docx(file_bytes)
        elif ext in (".txt", ""):
            raw_text = file_bytes.decode("utf-8", errors="replace")
        else:
            # Unknown type — attempt UTF-8 decode
            raw_text = file_bytes.decode("utf-8", errors="replace")
    except Exception as exc:
        _log.error("layer1.extraction_error — file=%s error=%s", file_name, exc)
        raise ResumeParseError(
            f"Failed to extract text from '{file_name}': {exc}. "
            f"Supported formats: PDF, DOCX, TXT."
        ) from exc

    _log.info("layer1.text_extracted — resume_id=%s chars=%d", resume_id, len(raw_text))
    log.info("layer1.extracted", resume_id=resume_id, chars=len(raw_text))

    # ── Step 2: Plausibility Guard (early exit if file is garbage) ────
    _check_text_plausibility(raw_text, file_name)

    # ── Step 3: spaCy Entity Detection ───────────────────────────────
    _log.info("layer1.spacy_start — resume_id=%s", resume_id)
    entities = spacy_extract_entities(raw_text)
    _log.info(
        "layer1.spacy_done — resume_id=%s orgs=%d dates=%d",
        resume_id, len(entities.get("organizations", [])), len(entities.get("dates", [])),
    )

    # ── Step 4: LLM Structured Extraction ────────────────────────────
    _log.info("layer1.llm_start — resume_id=%s", resume_id)
    structured = await extract_with_llm(raw_text, entities)
    _log.info(
        "layer1.llm_done — resume_id=%s skills=%d tools=%d exp=%.1f",
        resume_id,
        len(structured.get("skills", [])),
        len(structured.get("tools", [])),
        structured.get("years_of_experience", 0.0),
    )

    # ── Step 5: CRITICAL VALIDATION GUARD ────────────────────────────
    # This is the hard stop that prevents empty-skill hallucination.
    # If the LLM returned no useful skills, we STOP HERE and ask the
    # user to re-upload rather than generating fake analysis.
    _validate_parse_result(structured, resume_id)

    result = {
        "resume_id": resume_id,
        "raw_text": raw_text,
        "file_name": file_name,
        "file_type": ext,
        "user_id": user_id,
        **structured,
    }

    skill_count = len(structured.get("skills", []))
    tool_count  = len(structured.get("tools",  []))
    _log.info(
        "layer1.complete — resume_id=%s skills=%d tools=%d years=%.1f",
        resume_id, skill_count, tool_count, structured.get("years_of_experience", 0.0),
    )
    log.info("layer1.done", resume_id=resume_id, skills=skill_count, tools=tool_count)
    return result
