"""Database engine and session management."""

from typing import Generator
from sqlmodel import create_engine, Session
from .config import settings

# Create engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)


def get_session() -> Generator[Session, None, None]:
    """Get database session for dependency injection."""
    with Session(engine) as session:
        yield session
