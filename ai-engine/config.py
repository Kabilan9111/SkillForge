"""
SkillForge AI Engine — Configuration
Loads environment variables via pydantic-settings.
"""
from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache


class Settings(BaseSettings):
    # ── App ─────────────────────────────────────────────────────────────
    APP_NAME: str = "SkillForge AI Engine"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    PORT: int = 8001
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5500"]

    # ── Database ─────────────────────────────────────────────────────────
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://skillforge:password@localhost:5432/skillforge_ai",
        alias="DATABASE_URL",
    )

    # ── OpenAI ───────────────────────────────────────────────────────────
    OPENAI_API_KEY: str = Field(default="", alias="OPENAI_API_KEY")
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"

    # ── Anthropic ────────────────────────────────────────────────────────
    ANTHROPIC_API_KEY: str = Field(default="", alias="ANTHROPIC_API_KEY")
    ANTHROPIC_MODEL: str = "claude-sonnet-4-5"

    # ── GitHub ───────────────────────────────────────────────────────────
    GITHUB_TOKEN: str = Field(default="", alias="GITHUB_TOKEN")

    # ── Neo4j ────────────────────────────────────────────────────────────
    NEO4J_URI: str = Field(default="bolt://localhost:7687", alias="NEO4J_URI")
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = Field(default="password", alias="NEO4J_PASSWORD")

    # ── FAISS ────────────────────────────────────────────────────────────
    FAISS_INDEX_PATH: str = "data/faiss_roles.index"
    FAISS_METADATA_PATH: str = "data/faiss_roles_meta.json"

    # ── Model Paths ───────────────────────────────────────────────────────
    SBERT_MODEL: str = "all-MiniLM-L6-v2"
    CODEBERT_MODEL: str = "microsoft/codebert-base"
    SALARY_MODEL_PATH: str = "data/salary_model.joblib"

    # ── Auth ──────────────────────────────────────────────────────────────
    # Set JWT_SECRET to a strong random string in production.
    # Leave empty to run in dev-bypass mode (no auth enforcement).
    JWT_SECRET: str = Field(default="", alias="JWT_SECRET")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24   # 24 hours
    # Set REQUIRE_AUTH=false in .env to disable auth checks in development
    REQUIRE_AUTH: bool = Field(default=True, alias="REQUIRE_AUTH")

    # ── Upload Dir ────────────────────────────────────────────────────────
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # ── Logging ───────────────────────────────────────────────────────────
    LOG_LEVEL: str = Field(default="INFO", alias="LOG_LEVEL")
    LOG_DIR:   str = Field(default="logs", alias="LOG_DIR")

    # ── RAG Knowledge Base ────────────────────────────────────────────────
    RAG_DOCS_PATH: str = "data/kb"
    VECTORSTORE_PATH: str = "data/vectorstore"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        populate_by_name = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
