"""
Layer 2 — Skill Authenticity Detection Engine
Tools: GitHub API (PyGithub), CodeBERT (HuggingFace), Tree-sitter
"""
from __future__ import annotations

import re
from typing import Any

import structlog

log = structlog.get_logger(__name__)

# ─────────────────────────────────────────────────────────────────────
# GITHUB CLIENT
# ─────────────────────────────────────────────────────────────────────

async def fetch_github_profile(
    github_username: str,
    token: str,
) -> dict[str, Any]:
    """Fetch repos + recent commits from GitHub API."""
    from github import Github, GithubException
    g = Github(token if token else None)
    try:
        user = g.get_user(github_username)
        repos = list(user.get_repos())[:30]  # Max 30 repos

        profile: dict[str, Any] = {
            "username": github_username,
            "public_repos": user.public_repos,
            "repos": [],
            "total_commits": 0,
        }

        for repo in repos:
            languages = repo.get_languages()
            try:
                commits_count = repo.get_commits().totalCount
            except Exception:
                commits_count = 0

            profile["total_commits"] += min(commits_count, 200)
            profile["repos"].append({
                "name": repo.name,
                "description": repo.description or "",
                "languages": languages,
                "stars": repo.stargazers_count,
                "commits": commits_count,
                "topics": repo.get_topics(),
                "url": repo.html_url,
            })

        return profile
    except GithubException as e:
        log.warning("github.fetch_failed", user=github_username, error=str(e))
        return {"username": github_username, "repos": [], "total_commits": 0}


# ─────────────────────────────────────────────────────────────────────
# LANGUAGE → SKILL MAPPING
# ─────────────────────────────────────────────────────────────────────

LANG_TO_SKILL: dict[str, str] = {
    "Python": "Python",
    "JavaScript": "JavaScript",
    "TypeScript": "TypeScript",
    "Go": "Go",
    "Java": "Java",
    "Rust": "Rust",
    "Ruby": "Ruby",
    "C++": "C++",
    "C#": "C#",
    "PHP": "PHP",
    "Swift": "Swift",
    "Kotlin": "Kotlin",
    "HTML": "HTML/CSS",
    "CSS": "HTML/CSS",
    "Shell": "Shell/Bash",
    "Dockerfile": "Docker",
    "HCL": "Terraform",
    "YAML": "DevOps",
}

TOOL_TOPIC_MAP: dict[str, list[str]] = {
    "React": ["react", "reactjs", "create-react-app"],
    "Next.js": ["nextjs", "next-js"],
    "Vue": ["vue", "vuejs"],
    "Docker": ["docker", "containerization"],
    "Kubernetes": ["kubernetes", "k8s"],
    "Terraform": ["terraform", "iac"],
    "AWS": ["aws", "amazon-web-services", "s3", "lambda"],
    "FastAPI": ["fastapi"],
    "Django": ["django"],
    "Flask": ["flask"],
    "PostgreSQL": ["postgresql", "postgres"],
    "MongoDB": ["mongodb", "mongoose"],
    "Redis": ["redis"],
    "Kafka": ["kafka", "apache-kafka"],
    "GraphQL": ["graphql"],
    "Machine Learning": ["machine-learning", "ml", "deep-learning"],
    "PyTorch": ["pytorch"],
    "TensorFlow": ["tensorflow"],
}


def _build_skill_language_matrix(profile: dict) -> dict[str, dict]:
    """
    Build a matrix: {skill -> {bytes: int, repos: int, commits: int}}
    from language and topic data in repos.
    """
    matrix: dict[str, dict] = {}

    for repo in profile.get("repos", []):
        lang_bytes = repo.get("languages", {})
        for lang, nbytes in lang_bytes.items():
            skill = LANG_TO_SKILL.get(lang)
            if skill:
                if skill not in matrix:
                    matrix[skill] = {"bytes": 0, "repos": 0, "commits": 0}
                matrix[skill]["bytes"] += nbytes
                matrix[skill]["repos"] += 1
                matrix[skill]["commits"] += repo.get("commits", 0)

        topics = [t.lower() for t in repo.get("topics", [])]
        repo_desc = (repo.get("description") or "").lower()
        for skill, kws in TOOL_TOPIC_MAP.items():
            matches = any(kw in topics or kw in repo_desc for kw in kws)
            if matches:
                if skill not in matrix:
                    matrix[skill] = {"bytes": 0, "repos": 0, "commits": 0}
                matrix[skill]["repos"] += 1
                matrix[skill]["commits"] += repo.get("commits", 0)

    return matrix


def _score_skill(skill: str, data: dict | None, claimed: bool) -> float:
    """
    Calculate confidence score (0-100) for a claimed skill.
    Considers: bytes of code, repo count, commit count.
    """
    if data is None:
        # Skill claimed but no GitHub evidence
        return 30.0 if claimed else 0.0

    raw = (
        min(data.get("bytes", 0) / 5000, 40)
        + min(data.get("repos", 0) * 8, 30)
        + min(data.get("commits", 0) / 20, 30)
    )
    return round(min(raw, 100), 1)


def _get_evidence_text(skill: str, data: dict | None, score: float) -> str:
    if data is None:
        return f"No GitHub repositories found demonstrating {skill}."
    repos = data.get("repos", 0)
    commits = data.get("commits", 0)
    kb = data.get("bytes", 0) // 1024
    return (
        f"Found {repos} repositor{'y' if repos == 1 else 'ies'} "
        f"and ~{commits} commits involving {skill} ({kb}KB of code)."
    )


# ─────────────────────────────────────────────────────────────────────
# CodeBERT — Code Pattern Analysis
# ─────────────────────────────────────────────────────────────────────

_codebert_tokenizer = None
_codebert_model = None


def _load_codebert():
    global _codebert_tokenizer, _codebert_model
    if _codebert_tokenizer is None:
        try:
            from transformers import AutoTokenizer, AutoModel
            from config import settings
            _codebert_tokenizer = AutoTokenizer.from_pretrained(settings.CODEBERT_MODEL)
            _codebert_model = AutoModel.from_pretrained(settings.CODEBERT_MODEL)
            log.info("codebert.loaded")
        except Exception as exc:
            log.warning("codebert.load_failed", error=str(exc))


def analyze_code_with_codebert(code_snippet: str, skill: str) -> float:
    """
    Use CodeBERT to assess whether a code snippet aligns with the given skill.
    Returns a boost score 0-10 to add to base score.
    """
    _load_codebert()
    if _codebert_model is None:
        return 0.0

    try:
        import torch
        inputs = _codebert_tokenizer(
            code_snippet[:512], return_tensors="pt", truncation=True
        )
        with torch.no_grad():
            outputs = _codebert_model(**inputs)
        # Use CLS token embedding norm as proxy for "depth of code"
        cls_norm = outputs.last_hidden_state[:, 0, :].norm().item()
        return round(min(cls_norm / 5.0, 10.0), 2)
    except Exception as exc:
        log.warning("codebert.inference_failed", error=str(exc))
        return 0.0


# ─────────────────────────────────────────────────────────────────────
# Tree-sitter — Language Parsing
# ─────────────────────────────────────────────────────────────────────

def parse_code_tree_sitter(code: str, language: str = "python") -> dict | None:
    """
    Parse code with Tree-sitter and return basic metrics:
    function count, class count, complexity estimate.
    """
    try:
        from tree_sitter import Language, Parser
        import tree_sitter_python as tspython
        import tree_sitter_javascript as tsjavascript

        if language == "python":
            LANG = Language(tspython.language())
        elif language in ("javascript", "typescript"):
            LANG = Language(tsjavascript.language())
        else:
            return None

        parser = Parser(LANG)
        tree = parser.parse(bytes(code, "utf8"))
        root = tree.root_node

        def count_nodes(node, kind: str) -> int:
            count = (1 if node.type == kind else 0)
            for child in node.children:
                count += count_nodes(child, kind)
            return count

        return {
            "function_count": count_nodes(root, "function_definition"),
            "class_count": count_nodes(root, "class_definition"),
            "syntax_valid": not root.has_error,
        }
    except Exception as exc:
        log.debug("tree_sitter.failed", error=str(exc))
        return None


# ─────────────────────────────────────────────────────────────────────
# MAIN SERVICE FUNCTION
# ─────────────────────────────────────────────────────────────────────

async def verify_skills(
    resume_id: str,
    github_username: str,
    skills: list[str],
) -> dict[str, Any]:
    """
    Full Layer 2 pipeline:
    GitHub repos → code parsing → skill confidence scores
    """
    from config import settings
    log.info("layer2.start", resume_id=resume_id, user=github_username)

    profile = await fetch_github_profile(github_username, settings.GITHUB_TOKEN)
    matrix = _build_skill_language_matrix(profile)

    skill_scores = []
    total_score = 0.0

    for skill in skills:
        # Try to match skill in matrix (case-insensitive)
        data = next(
            (v for k, v in matrix.items() if k.lower() == skill.lower()),
            None,
        )
        score = _score_skill(skill, data, claimed=True)
        evidence = _get_evidence_text(skill, data, score)

        skill_scores.append({
            "skill": skill,
            "confidence": score,
            "evidence": evidence,
            "repos_found": data["repos"] if data else 0,
        })
        total_score += score

    overall = round(total_score / len(skills), 1) if skills else 0.0

    result = {
        "resume_id": resume_id,
        "github_username": github_username,
        "skill_scores": skill_scores,
        "repos_analyzed": len(profile.get("repos", [])),
        "commits_analyzed": profile.get("total_commits", 0),
        "overall_authenticity": overall,
    }

    log.info("layer2.done", resume_id=resume_id, overall=overall)
    return result
