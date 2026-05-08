"""
SkillForge AI Engine — Database Layer (PostgreSQL + SQLAlchemy async)
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """Create all tables on startup."""
    from models.db_models import (  # noqa: F401  – register models
        ResumeAnalysis,
        SkillAuthenticity,
        RolePrediction,
        SkillGapResult,
        SalaryPrediction,
        CareerStrategy,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
