"""
Structured Logging — SkillForge AI Engine
------------------------------------------
Sets up dual-sink logging:
  1. Console  — human-readable dev output via structlog ConsoleRenderer
  2. File     — JSON lines format for production log aggregation

Call configure_logging() once at application startup (in main.py).

Usage from anywhere in the codebase:
    import logging
    _log = logging.getLogger("skillforge.my_module")
    _log.info("doing something — key=%s", value)

    # Or structlog (richer context binding):
    import structlog
    log = structlog.get_logger(__name__)
    log.info("event", key=value)
"""
from __future__ import annotations

import json
import logging
import logging.handlers
import os
import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path

import structlog


# ─── Constants ────────────────────────────────────────────────────────────────

LOG_DIR  = Path(os.getenv("LOG_DIR",  "logs"))
LOG_FILE = LOG_DIR / "skillforge-ai.jsonl"

_LOG_LEVEL_MAP: dict[str, int] = {
    "DEBUG":    logging.DEBUG,
    "INFO":     logging.INFO,
    "WARNING":  logging.WARNING,
    "ERROR":    logging.ERROR,
    "CRITICAL": logging.CRITICAL,
}


# ─── JSON Formatter ───────────────────────────────────────────────────────────

class _JsonFormatter(logging.Formatter):
    """
    Formats each log record as a compact JSON line.
    Fields: timestamp, level, logger, message, [exc_info]
    """

    def format(self, record: logging.LogRecord) -> str:
        payload: dict = {
            "ts":      datetime.now(tz=timezone.utc).isoformat(),
            "level":   record.levelname,
            "logger":  record.name,
            "msg":     record.getMessage(),
        }
        if record.exc_info:
            payload["exc"] = traceback.format_exception(*record.exc_info)
        # Attach any str-valued extras (e.g. resume_id, user, role)
        for key, val in record.__dict__.items():
            if key not in logging.LogRecord.__dict__ and not key.startswith("_"):
                try:
                    json.dumps(val)   # only serialisable extras
                    payload[key] = val
                except (TypeError, ValueError):
                    pass
        return json.dumps(payload, ensure_ascii=False)


# ─── Main Config ──────────────────────────────────────────────────────────────

def configure_logging(
    level: str = "INFO",
    log_dir: Path | str | None = None,
    enable_file_log: bool = True,
    enable_json_console: bool = False,
) -> None:
    """
    Configure the root Python logging + structlog.

    Parameters
    ----------
    level : str
        Minimum log level (DEBUG / INFO / WARNING / ERROR).
    log_dir : Path | str | None
        Override the default log directory.
    enable_file_log : bool
        Write JSON-lines log to disk. Default True.
    enable_json_console : bool
        Write JSON to stdout instead of human text. Default False.
    """
    int_level = _LOG_LEVEL_MAP.get(level.upper(), logging.INFO)

    handlers: list[logging.Handler] = []

    # ── Console handler ───────────────────────────────────────────────────────
    console_h = logging.StreamHandler(sys.stdout)
    console_h.setLevel(int_level)
    if enable_json_console:
        console_h.setFormatter(_JsonFormatter())
    else:
        console_h.setFormatter(
            logging.Formatter("%(asctime)s  %(levelname)-8s  %(name)s  %(message)s")
        )
    handlers.append(console_h)

    # ── File handler ──────────────────────────────────────────────────────────
    if enable_file_log:
        _dir = Path(log_dir) if log_dir else LOG_DIR
        _dir.mkdir(parents=True, exist_ok=True)
        _path = _dir / LOG_FILE.name
        file_h = logging.handlers.RotatingFileHandler(
            _path,
            maxBytes=20 * 1024 * 1024,    # 20 MB
            backupCount=5,
            encoding="utf-8",
        )
        file_h.setLevel(logging.DEBUG)    # capture everything to file
        file_h.setFormatter(_JsonFormatter())
        handlers.append(file_h)

    # ── Root logger ───────────────────────────────────────────────────────────
    root = logging.getLogger()
    root.setLevel(int_level)
    # Clear any existing handlers to avoid duplicates
    root.handlers.clear()
    for h in handlers:
        root.addHandler(h)

    # Silence overly chatty third-party loggers
    for noisy in ("httpx", "httpcore", "hpack", "h2", "neo4j", "asyncio"):
        logging.getLogger(noisy).setLevel(logging.WARNING)

    # ── structlog ─────────────────────────────────────────────────────────────
    _configure_structlog(int_level, enable_json_console)


def _configure_structlog(int_level: int, as_json: bool) -> None:
    shared_processors: list = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
    ]

    if as_json:
        renderer = structlog.processors.JSONRenderer()
    else:
        renderer = structlog.dev.ConsoleRenderer(colors=sys.stdout.isatty())

    structlog.configure(
        processors=shared_processors + [renderer],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.BoundLogger,
        cache_logger_on_first_use=True,
    )
