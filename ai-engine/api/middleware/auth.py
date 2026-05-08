"""
SkillForge AI Engine — JWT Authentication Middleware
Validates Bearer tokens on all protected AI routes.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

log = logging.getLogger("skillforge.auth")

_bearer_scheme = HTTPBearer(auto_error=False)


# ─────────────────────────────────────────────────────────────────────
# JWT VERIFICATION
# ─────────────────────────────────────────────────────────────────────

def _verify_jwt(token: str) -> dict:
    """
    Decode and validate a JWT token.
    Returns the decoded payload on success.
    Raises HTTPException on failure.
    """
    from jose import JWTError, jwt
    from config import settings

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_exp": True},
        )
        return payload

    except JWTError as exc:
        log.warning("auth.jwt_invalid", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "invalid_token",
                "message": "Authentication token is invalid or expired.",
                "action": "Please log in again to obtain a fresh token.",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )


# ─────────────────────────────────────────────────────────────────────
# DEPENDENCY — Required (blocks without valid token)
# ─────────────────────────────────────────────────────────────────────

async def require_auth(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> dict:
    """
    FastAPI dependency: validates JWT and returns the user payload.
    Use on any route that requires authentication.

    Example:
        @router.post("/analyze")
        async def analyze(user: dict = Depends(require_auth)):
            user_id = user["sub"]
    """
    from config import settings

    # ── Dev mode bypass (when JWT_SECRET not configured) ──────────────
    if not settings.JWT_SECRET:
        log.warning(
            "auth.no_secret_configured",
            note="Set JWT_SECRET in .env to enable authentication enforcement.",
        )
        return {"sub": "anonymous", "mode": "dev_bypass"}

    # ── Check Authorization header ────────────────────────────────────
    if credentials is None:
        # Also check X-Auth-Token header as fallback
        token = request.headers.get("X-Auth-Token")
        if not token:
            log.warning(
                "auth.missing_token",
                path=str(request.url.path),
                client=request.client.host if request.client else "unknown",
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error": "authentication_required",
                    "message": "Authentication required to run AI analysis.",
                    "action": "Include a Bearer token in the Authorization header.",
                },
                headers={"WWW-Authenticate": "Bearer"},
            )
    else:
        token = credentials.credentials

    # ── Decode & validate ─────────────────────────────────────────────
    payload = _verify_jwt(token)

    # ── Check token expiry explicitly ──────────────────────────────────
    exp = payload.get("exp")
    if exp and datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(tz=timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "token_expired",
                "message": "Your session has expired. Please log in again.",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    log.info("auth.success", user_id=payload.get("sub"), path=str(request.url.path))
    return payload


# ─────────────────────────────────────────────────────────────────────
# DEPENDENCY — Optional (allows anonymous, but enriches if token present)
# ─────────────────────────────────────────────────────────────────────

async def optional_auth(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> Optional[dict]:
    """
    Like require_auth but does NOT raise if no token provided.
    Returns None for unauthenticated requests.
    """
    if credentials is None:
        return None
    try:
        return _verify_jwt(credentials.credentials)
    except HTTPException:
        return None
