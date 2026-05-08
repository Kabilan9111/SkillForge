"""Quick smoke-test for the standalone AI pipeline."""
import urllib.request
import json

RESUME = b"""John Doe
john.doe@email.com | (555) 123-4567

SKILLS
JavaScript, TypeScript, Python, React, Node.js, Express, FastAPI
PostgreSQL, MongoDB, Redis, AWS, Docker, Kubernetes, Git, REST APIs
GraphQL, CI/CD, GitHub Actions, Linux, Jest, Webpack

EXPERIENCE
Senior Software Engineer - TechCorp (2021-Present)
Built React dashboards; designed Node.js REST APIs serving 2M requests/day.
Deployed microservices on AWS ECS with Docker and Kubernetes.
Led CI/CD pipeline improvements using GitHub Actions.

Software Engineer - StartupXYZ (2019-2021)
Developed Python FastAPI backend; managed PostgreSQL and Redis caching.
Integrated GraphQL APIs for SPA front-end.

EDUCATION
B.S. Computer Science - State University 2019
"""

BOUNDARY = b"SMKBOUNDARY99"


def build_multipart(resume_bytes: bytes, role: str) -> bytes:
    role_bytes = role.encode()
    parts = (
        b"--" + BOUNDARY + b"\r\n"
        b"Content-Disposition: form-data; name=\"resume\"; filename=\"resume.txt\"\r\n"
        b"Content-Type: text/plain\r\n\r\n"
        + resume_bytes + b"\r\n"
        + b"--" + BOUNDARY + b"\r\n"
        b"Content-Disposition: form-data; name=\"target_role\"\r\n\r\n"
        + role_bytes + b"\r\n"
        + b"--" + BOUNDARY + b"--\r\n"
    )
    return parts


def test(target_role: str = "Backend Engineer"):
    body = build_multipart(RESUME, target_role)
    req = urllib.request.Request(
        "http://localhost:8001/api/pipeline/analyze",
        data=body,
        headers={
            "Content-Type": "multipart/form-data; boundary=SMKBOUNDARY99",
        },
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        result = json.loads(resp.read())

    print(f"\n=== AI Pipeline Result (role: {target_role}) ===")
    print(f"  role_alignment_score : {result.get('role_alignment_score')}")
    print(f"  confidence_score     : {result.get('confidence_score')}")
    print(f"  confidence_grade     : {result.get('confidence_grade')}")
    print(f"  user_skills count    : {len(result.get('user_skills', []))}")
    print(f"  user_skills          : {result.get('user_skills', [])}")
    print(f"  missing_skills       : {result.get('missing_skills', [])}")
    print(f"  critical_gaps        : {result.get('critical_gaps', [])}")
    print(f"  salary_range         : {result.get('salary_range')}")
    print(f"  career_recommendations:")
    for r in result.get("career_recommendations", []):
        print(f"    - {r}")
    if result.get("warnings"):
        print(f"  warnings             : {result['warnings']}")
    print()


if __name__ == "__main__":
    test("Backend Engineer")
    test("Frontend Engineer")
