"""
Layer 5 — Salary Intelligence Engine
Tools: XGBoost, Scikit-learn, Pandas, market salary benchmarks
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np
import structlog

log = structlog.get_logger(__name__)

# ─────────────────────────────────────────────────────────────────────
# MARKET SALARY BENCHMARK DATA
# Source: Glassdoor / Levels.fyi approximations (2025)
# Structure: {role: {location_tier: [p10, p25, p50, p75, p90]}}
# ─────────────────────────────────────────────────────────────────────

SALARY_BENCHMARKS: dict[str, dict[str, list[float]]] = {
    "Software Engineer": {
        "tier1": [95000,  115000, 140000, 175000, 220000],  # SF/NYC/Seattle
        "tier2": [75000,  90000,  110000, 140000, 175000],  # Austin/Boston/Denver
        "tier3": [60000,  72000,  88000,  110000, 140000],  # Remote/Other US
    },
    "Senior Software Engineer": {
        "tier1": [140000, 165000, 195000, 240000, 310000],
        "tier2": [110000, 130000, 155000, 190000, 240000],
        "tier3": [90000,  108000, 128000, 160000, 200000],
    },
    "Backend Engineer": {
        "tier1": [100000, 120000, 148000, 185000, 230000],
        "tier2": [80000,  95000,  118000, 148000, 185000],
        "tier3": [65000,  78000,  95000,  118000, 148000],
    },
    "Frontend Engineer": {
        "tier1": [95000,  115000, 138000, 170000, 210000],
        "tier2": [75000,  90000,  110000, 138000, 170000],
        "tier3": [60000,  72000,  88000,  110000, 138000],
    },
    "Fullstack Engineer": {
        "tier1": [100000, 120000, 145000, 180000, 225000],
        "tier2": [80000,  96000,  116000, 145000, 180000],
        "tier3": [65000,  78000,  94000,  116000, 145000],
    },
    "DevOps Engineer": {
        "tier1": [105000, 125000, 152000, 190000, 235000],
        "tier2": [85000,  100000, 122000, 152000, 190000],
        "tier3": [70000,  83000,  100000, 122000, 152000],
    },
    "Cloud Engineer": {
        "tier1": [110000, 132000, 160000, 200000, 250000],
        "tier2": [88000,  106000, 128000, 160000, 200000],
        "tier3": [72000,  86000,  104000, 128000, 160000],
    },
    "AI Engineer": {
        "tier1": [130000, 155000, 190000, 240000, 320000],
        "tier2": [105000, 125000, 155000, 195000, 255000],
        "tier3": [88000,  105000, 128000, 162000, 210000],
    },
    "Data Engineer": {
        "tier1": [105000, 125000, 152000, 190000, 240000],
        "tier2": [85000,  100000, 122000, 152000, 190000],
        "tier3": [70000,  83000,  100000, 122000, 152000],
    },
    "Data Scientist": {
        "tier1": [110000, 132000, 160000, 200000, 255000],
        "tier2": [88000,  106000, 128000, 160000, 200000],
        "tier3": [72000,  86000,  104000, 128000, 160000],
    },
}

LOCATION_TIER: dict[str, str] = {
    "san francisco": "tier1", "sf": "tier1", "new york": "tier1",
    "nyc": "tier1", "seattle": "tier1", "san jose": "tier1",
    "austin": "tier2", "boston": "tier2", "denver": "tier2",
    "chicago": "tier2", "los angeles": "tier2", "la": "tier2",
    "atlanta": "tier2", "miami": "tier2", "dallas": "tier2",
    "remote": "tier3", "united states": "tier2",
}


def _get_location_tier(location: str) -> str:
    loc_lower = location.lower()
    for key, tier in LOCATION_TIER.items():
        if key in loc_lower:
            return tier
    return "tier3"


def _get_benchmarks(role: str, location: str) -> list[float]:
    """Return [p10, p25, p50, p75, p90] for a role/location."""
    # Fuzzy match role
    matched_role = next(
        (k for k in SALARY_BENCHMARKS if k.lower() in role.lower() or role.lower() in k.lower()),
        "Software Engineer",
    )
    tier = _get_location_tier(location)
    data = SALARY_BENCHMARKS[matched_role]
    return data.get(tier, data.get("tier3", [60000, 75000, 95000, 120000, 150000]))


# ─────────────────────────────────────────────────────────────────────
# XGBOOST MODEL — Training & Prediction
# ─────────────────────────────────────────────────────────────────────

def _build_feature_vector(
    years_of_experience: float,
    skill_count: int,
    location_tier: int,       # 1=top, 2=mid, 3=other
    role_index: int,
    target_salary: float,
    p50_salary: float,
) -> list[float]:
    return [
        years_of_experience,
        skill_count,
        float(location_tier),
        float(role_index),
        target_salary,
        p50_salary,
        target_salary / max(p50_salary, 1),   # salary ratio
        min(years_of_experience / 10.0, 1.0), # experience ratio
        float(skill_count > 10),
        float(skill_count > 20),
    ]


def _get_xgboost_model():
    """Load trained model or build a synthetic one for demo."""
    import joblib
    from config import settings
    model_path = Path(settings.SALARY_MODEL_PATH)

    if model_path.exists():
        return joblib.load(model_path)

    # Build and cache a synthetic demo model
    log.info("salary_model.building_synthetic")
    return _build_synthetic_model(model_path)


def _build_synthetic_model(save_path: Path):
    """
    Build a synthetic XGBoost model trained on approximated market data.
    In production, replace with real Glassdoor/Levels.fyi dataset.
    """
    import xgboost as xgb
    from sklearn.preprocessing import StandardScaler
    import joblib
    import pandas as pd

    np.random.seed(42)
    N = 5000

    years = np.random.uniform(0, 20, N)
    skills = np.random.randint(3, 40, N)
    tiers = np.random.choice([1, 2, 3], N)
    role_idx = np.random.randint(0, 10, N)
    p50 = np.random.uniform(80000, 200000, N)
    target = p50 * np.random.uniform(0.7, 1.5, N)

    # Feasibility: 1 if target <= p75 adjusted for experience, else 0
    p75_est = p50 * 1.25
    experience_boost = years * 3000
    feasible = (target <= (p75_est + experience_boost)).astype(int)

    X = np.column_stack([
        years, skills, tiers, role_idx,
        target, p50, target / p50,
        np.minimum(years / 10, 1),
        (skills > 10).astype(float),
        (skills > 20).astype(float),
    ])

    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        random_state=42,
        eval_metric="logloss",
        verbosity=0,
    )
    model.fit(X, feasible)

    save_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, save_path)
    log.info("salary_model.saved", path=str(save_path))
    return model


def _predict_feasibility(
    years: float,
    skill_count: int,
    location: str,
    role: str,
    target_salary: float,
    p50: float,
) -> float:
    """Return feasibility probability 0-100."""
    try:
        model = _get_xgboost_model()
        tier_str = _get_location_tier(location)
        tier_map = {"tier1": 1, "tier2": 2, "tier3": 3}
        tier_int = tier_map.get(tier_str, 3)

        role_keys = list(SALARY_BENCHMARKS.keys())
        role_idx = next(
            (i for i, k in enumerate(role_keys) if k.lower() in role.lower()),
            0,
        )

        features = _build_feature_vector(
            years, skill_count, tier_int, role_idx, target_salary, p50
        )
        import numpy as np
        X = np.array([features])
        prob = model.predict_proba(X)[0][1]
        return round(float(prob) * 100, 1)
    except Exception as exc:
        log.warning("salary_model.predict_failed", error=str(exc))
        # Fallback: simple percentile comparison
        benchmarks = _get_benchmarks(role, location)
        p50_val = benchmarks[2]
        p75_val = benchmarks[3]
        if target_salary <= p50_val:
            return 75.0
        elif target_salary <= p75_val:
            return 50.0
        else:
            return 25.0


def _market_percentile(target: float, benchmarks: list[float]) -> float:
    """Estimate market percentile from benchmark distribution."""
    percentiles = [10, 25, 50, 75, 90]
    if target <= benchmarks[0]:
        return 5.0
    if target >= benchmarks[-1]:
        return 95.0
    for i in range(len(benchmarks) - 1):
        if benchmarks[i] <= target <= benchmarks[i + 1]:
            pct_range = percentiles[i + 1] - percentiles[i]
            val_range = benchmarks[i + 1] - benchmarks[i]
            ratio = (target - benchmarks[i]) / max(val_range, 1)
            return round(percentiles[i] + ratio * pct_range, 1)
    return 50.0


# ─────────────────────────────────────────────────────────────────────
# MAIN SERVICE FUNCTION
# ─────────────────────────────────────────────────────────────────────

async def predict_salary(
    resume_id: str,
    target_role: str,
    target_salary: float,
    location: str = "United States",
    years_of_experience: float = 0.0,
    skill_count: int = 0,
    top_skills: list[str] | None = None,
) -> dict[str, Any]:
    """
    Full Layer 5 pipeline:
    Experience + skill depth + role mapping → XGBoost prediction
    """
    log.info("layer5.start", resume_id=resume_id, role=target_role, salary=target_salary)

    benchmarks = _get_benchmarks(target_role, location)
    feasibility = _predict_feasibility(
        years_of_experience, skill_count, location,
        target_role, target_salary, benchmarks[2],
    )
    percentile = _market_percentile(target_salary, benchmarks)

    # Recommendation
    if feasibility >= 70:
        rec = (
            f"Your profile strongly supports the ${target_salary:,.0f} target. "
            f"You're at the {percentile:.0f}th market percentile for {target_role} in {location}."
        )
    elif feasibility >= 45:
        rec = (
            f"Your ${target_salary:,.0f} target is achievable with skill development. "
            f"Median for {target_role} in {location} is ${benchmarks[2]:,.0f}."
        )
    else:
        rec = (
            f"Your ${target_salary:,.0f} target is above the 75th percentile for current skill level. "
            f"Focus on critical gaps to increase salary leverage."
        )

    # Comparable roles (nearby salary ranges)
    comparable = [
        {"role": r, "median_salary": b.get(_get_location_tier(location), b.get("tier3"))[2]}
        for r, b in list(SALARY_BENCHMARKS.items())[:4]
        if r != target_role
    ]

    result = {
        "resume_id": resume_id,
        "target_salary": target_salary,
        "predicted_salary_min": benchmarks[1],
        "predicted_salary_max": benchmarks[4],
        "predicted_salary_median": benchmarks[2],
        "feasibility_probability": feasibility,
        "market_percentile": percentile,
        "recommendation": rec,
        "comparable_roles": comparable,
    }

    log.info("layer5.done", resume_id=resume_id, feasibility=feasibility, percentile=percentile)
    return result
