"""SkillForge final status check."""
import urllib.request
import json


CHECKS = [
    ("http://localhost:3000/api/health",    "Node.js  (3000)"),
    ("http://localhost:8001/health",        "AI engine(8001)"),
    ("http://localhost:3000/api/ai/health", "Proxy /api/ai "),
]

print("\n=== SkillForge Final Status ===\n")

for url, label in CHECKS:
    try:
        with urllib.request.urlopen(url, timeout=4) as r:
            d = json.loads(r.read())
        status = d.get("status") or d.get("engine") or "ok"
        print(f"  [OK] {label}  {status}")
    except Exception as e:
        print(f"  [!!] {label}  FAIL: {e}")

# Login page
try:
    with urllib.request.urlopen("http://localhost:3000/login", timeout=4) as r:
        print(f"  [OK] Login page  (GET /login)   HTTP {r.status}")
except Exception as e:
    print(f"  [!!] Login page                  FAIL: {e}")

# Demo JWT
try:
    req = urllib.request.Request(
        "http://localhost:3000/api/auth/login",
        data=json.dumps({"email": "admin@skillforge.dev", "password": "SkillForge@2026"}).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=5) as r:
        token = json.loads(r.read())["token"]
    print(f"  [OK] Demo JWT                    issued ({token[:22]}...)")
except Exception as e:
    print(f"  [!!] Demo JWT                    FAIL: {e}")

print()
