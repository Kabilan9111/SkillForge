"""Test the Node.js proxy → AI engine routing end-to-end."""
import urllib.request
import json

BOUNDARY = b"SMKBOUNDARY99"
RESUME = b"""Jane Smith
jane@email.com | (555) 000-0000

SKILLS
Python, FastAPI, Node.js, PostgreSQL, Redis, Docker, AWS, Git, REST APIs

EXPERIENCE
Backend Engineer - TechCo (2022-Present)
Built Python microservices; managed AWS deployments with Docker.
Designed PostgreSQL schemas; added Redis caching layer.

EDUCATION
B.S. Computer Science, State University 2022
"""


def make_body(resume_bytes: bytes, role: str) -> bytes:
    return (
        b"--" + BOUNDARY + b"\r\n"
        b'Content-Disposition: form-data; name="resume"; filename="resume.txt"\r\n'
        b"Content-Type: text/plain\r\n\r\n"
        + resume_bytes + b"\r\n"
        b"--" + BOUNDARY + b"\r\n"
        b'Content-Disposition: form-data; name="target_role"\r\n\r\n'
        + role.encode() + b"\r\n"
        b"--" + BOUNDARY + b"--\r\n"
    )


def get_token() -> str:
    req = urllib.request.Request(
        "http://localhost:3000/api/auth/login",
        data=json.dumps({"email": "admin@skillforge.dev", "password": "SkillForge@2026"}).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=8) as r:
        return json.loads(r.read())["token"]


def test_direct():
    """Direct call to AI engine — no proxy."""
    body = make_body(RESUME, "Backend Engineer")
    req = urllib.request.Request(
        "http://localhost:8001/api/pipeline/analyze",
        data=body,
        headers={"Content-Type": "multipart/form-data; boundary=SMKBOUNDARY99"},
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        res = json.loads(r.read())
    print(f"[DIRECT]  alignment={res['role_alignment_score']}  confidence={res['confidence_score']}  grade={res['confidence_grade']}")


def test_proxy(token: str):
    """Call through Node.js /api/ai/* proxy."""
    body = make_body(RESUME, "Backend Engineer")
    req = urllib.request.Request(
        "http://localhost:3000/api/ai/pipeline/analyze",
        data=body,
        headers={
            "Content-Type": "multipart/form-data; boundary=SMKBOUNDARY99",
            "Authorization": f"Bearer {token}",
        },
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        res = json.loads(r.read())
    print(f"[PROXY]   alignment={res['role_alignment_score']}  confidence={res['confidence_score']}  grade={res['confidence_grade']}")


if __name__ == "__main__":
    print("=== SkillForge End-to-End Proxy Test ===\n")

    print("1. Testing AI engine directly (port 8001)...")
    try:
        test_direct()
    except Exception as e:
        print(f"   FAILED: {e}")

    print("\n2. Obtaining JWT from Node.js backend (port 3000)...")
    try:
        token = get_token()
        print(f"   JWT OK — {token[:40]}...")
    except Exception as e:
        print(f"   JWT FAILED: {e}")
        token = None

    if token:
        print("\n3. Testing through Node.js proxy (/api/ai/pipeline/analyze)...")
        try:
            test_proxy(token)
            print("\n[PASS] Full stack is working end-to-end.")
        except Exception as e:
            print(f"   PROXY FAILED: {e}")
