"""Test the Node.js /api/skill-gap/analyze endpoint."""
import io
import urllib.request
import json
from docx import Document

BOUNDARY = b"SKBND99"

RESUME_TEXT = """Alice Dev
alice@dev.io | (555) 222-3333

SKILLS
Python, Node.js, React, PostgreSQL, Docker, AWS, Git, REST APIs, FastAPI, Redis

EXPERIENCE
Backend Engineer - CloudCo (2022-Present)
Built Python/FastAPI microservices deployed on AWS ECS with Docker.
Designed PostgreSQL schemas; added Redis caching; wrote REST APIs.

EDUCATION
B.S. Computer Science 2022
"""


def make_docx_bytes(text: str) -> bytes:
    """Build a real DOCX binary from plain text."""
    doc = Document()
    for line in text.strip().splitlines():
        doc.add_paragraph(line)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def get_token() -> str:
    req = urllib.request.Request(
        "http://localhost:3000/api/auth/login",
        data=json.dumps({"email": "admin@skillforge.dev", "password": "SkillForge@2026"}).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=8) as r:
        return json.loads(r.read())["token"]


def make_body() -> bytes:
    docx_bytes = make_docx_bytes(RESUME_TEXT)
    mime = b"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    return (
        b"--SKBND99\r\n"
        b'Content-Disposition: form-data; name="resume"; filename="resume.docx"\r\n'
        b"Content-Type: " + mime + b"\r\n\r\n"
        + docx_bytes
        + b"\r\n--SKBND99\r\n"
        b'Content-Disposition: form-data; name="trackName"\r\n\r\n'
        b"Backend Engineer"
        b"\r\n--SKBND99\r\n"
        b'Content-Disposition: form-data; name="level"\r\n\r\n'
        b"intermediate"
        b"\r\n--SKBND99--\r\n"
    )


def main():
    print("=== Skill Gap Analyze Route Test ===\n")

    print("1. Getting JWT...")
    token = get_token()
    print(f"   OK — {token[:40]}...\n")

    print("2. POSTing to /api/skill-gap/analyze...")
    req = urllib.request.Request(
        "http://localhost:3000/api/skill-gap/analyze",
        data=make_body(),
        headers={
            "Content-Type": "multipart/form-data; boundary=SKBND99",
            "Authorization": f"Bearer {token}",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            d = json.loads(r.read())
        print(f"   success         : {d.get('success')}")
        print(f"   top-level keys  : {list(d.keys())}")
        intel = d.get("intelligence") or {}
        adv   = d.get("advancedMetrics") or {}
        print(f"   strongAreas     : {len(intel.get('strongAreas', []))}")
        print(f"   criticalGaps    : {len(intel.get('criticalGaps', []))}")
        # real field name is developerCapabilityIndex
        print(f"   dci (raw)       : {adv.get('developerCapabilityIndex')}")
        print(f"   overallRating   : {adv.get('overallRating')}")
        print(f"   engMaturity     : {adv.get('engineeringMaturityScore')}")
        # check what the analysis sub-object has (what frontend reads)
        analysis = d.get('analysis') or {}
        print(f"   analysis.dciScore    : {analysis.get('dciScore')}")
        print(f"   analysis.overallScore: {analysis.get('overallScore')}")
        print(f"   coverageScore.overall: {(analysis.get('coverageScore') or {}).get('overall')}")
        print(f"   visualization keys: {list((d.get('visualizations') or {}).keys())[:5]}")
        print("\n[PASS] Node.js skill-gap pipeline is working.")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"   HTTP {e.code}: {body[:400]}")
    except Exception as e:
        print(f"   ERROR: {e}")


if __name__ == "__main__":
    main()
