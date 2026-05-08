"""Test POST /api/skill-gap/career-intelligence end-to-end."""
import io
import urllib.request
import json
from docx import Document

BOUNDARY = b"CIBND01"
RESUME_TEXT = """Bob Engineer
bob@eng.io | (555) 444-5555 | github.com/bobeng

SKILLS
Python, FastAPI, Node.js, React, PostgreSQL, Docker, AWS, Kubernetes, Git, REST APIs

EXPERIENCE
Senior Software Engineer - MegaCorp (2020-Present)
Led backend team building Python/FastAPI microservices on AWS.
Managed PostgreSQL and Redis; deployed containerized services with Docker/Kubernetes.
Mentored junior engineers; led code reviews.

Software Engineer - StartupB (2018-2020)
Built React frontend; Node.js APIs; REST integrations.

EDUCATION
B.S. Computer Science, Tech University 2018
"""


def make_docx_bytes(text: str) -> bytes:
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
    docx = make_docx_bytes(RESUME_TEXT)
    mime = b"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    return (
        b"--CIBND01\r\n"
        b'Content-Disposition: form-data; name="resume"; filename="resume.docx"\r\n'
        b"Content-Type: " + mime + b"\r\n\r\n"
        + docx
        + b"\r\n--CIBND01\r\n"
        b'Content-Disposition: form-data; name="targetRole"\r\n\r\nBackend Engineer'
        b"\r\n--CIBND01\r\n"
        b'Content-Disposition: form-data; name="targetSalary"\r\n\r\n120000'
        b"\r\n--CIBND01\r\n"
        b'Content-Disposition: form-data; name="yearsOfExperience"\r\n\r\n6'
        b"\r\n--CIBND01\r\n"
        b'Content-Disposition: form-data; name="location"\r\n\r\nRemote'
        b"\r\n--CIBND01--\r\n"
    )


def main():
    print("=== Career Intelligence Route Test ===\n")
    token = get_token()
    print(f"JWT OK — {token[:40]}...\n")

    req = urllib.request.Request(
        "http://localhost:3000/api/skill-gap/career-intelligence",
        data=make_body(),
        headers={
            "Content-Type": "multipart/form-data; boundary=CIBND01",
            "Authorization": f"Bearer {token}",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            d = json.loads(r.read())
        print(f"   success            : {d.get('success')}")
        print(f"   overallReadinessScore: {d.get('overallReadinessScore')}")
        print(f"   finalVerdict       : {d.get('finalVerdict')}")
        layers = d.get('layers') or {}
        print(f"   layer keys         : {list(layers.keys())}")
        addons = d.get('addOns') or {}
        print(f"   hiringProbability  : {addons.get('hiringProbabilityPercent')}%")
        print(f"   processingTime     : {d.get('processingTime')}")
        print("\n[PASS] Career Intelligence endpoint is working.")
    except urllib.error.HTTPError as e:
        print(f"   HTTP {e.code}: {e.read().decode()[:400]}")
    except Exception as e:
        print(f"   ERROR: {e}")


if __name__ == "__main__":
    main()
