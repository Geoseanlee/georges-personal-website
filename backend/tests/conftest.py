"""
Test configuration.

DATABASE_URL must be set before the app modules are imported because
config.py reads environment variables at module load time.
We set a dummy URL here; actual DB calls are always mocked in unit tests.
"""

import os
from dataclasses import dataclass, field

import pytest
from httpx import ASGITransport, AsyncClient

os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+asyncpg://test:test@localhost/test",
)
os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:5173")


# ---------------------------------------------------------------------------
# Lightweight stand-in for a Project ORM row (snake_case only)
# ---------------------------------------------------------------------------

@dataclass
class ProjectRow:
    """Mirrors the Project ORM model with only snake_case attributes.

    Using a plain dataclass prevents MagicMock from auto-creating camelCase
    attributes, which would confuse Pydantic's alias-aware from_attributes.
    """

    id: int
    slug: str
    title: str
    project_type: str
    year: int
    description: str
    tags: list[str]
    github_url: str
    display_order: int
    is_featured: bool


@pytest.fixture
def sample_projects() -> list[ProjectRow]:
    return [
        ProjectRow(
            id=1, slug="blotz-task-app", title="Blotz Task App",
            project_type="FULL-STACK · 2025", year=2025,
            description="A task management app.",
            tags=["C# / .NET", "React Native", "SQL Server"],
            github_url="https://github.com/sol-wizard/Blotz-Task-App",
            display_order=1, is_featured=True,
        ),
        ProjectRow(
            id=2, slug="renopilot", title="RenoPilot",
            project_type="FULL-STACK · 2025", year=2025,
            description="A renovation project management platform.",
            tags=["React", "Node.js", "PostgreSQL"],
            github_url="https://github.com/sol-wizard/RenoPilot",
            display_order=2, is_featured=False,
        ),
        ProjectRow(
            id=3, slug="global-youth-sdgs-summit", title="Global Youth SDGs Summit",
            project_type="WEB · 2025", year=2025,
            description="Official website for the Global Youth SDGs Summit.",
            tags=["React", "TypeScript"],
            github_url="https://github.com/sol-wizard/global-youth-sdgs-summit",
            display_order=3, is_featured=False,
        ),
        ProjectRow(
            id=4, slug="ai-health-management", title="AI Health Management",
            project_type="AI · 2024", year=2024,
            description="An AI-assisted health management system.",
            tags=["Python", "FastAPI", "OpenAI"],
            github_url="https://github.com/sol-wizard/ai-health-management",
            display_order=4, is_featured=False,
        ),
    ]


# ---------------------------------------------------------------------------
# HTTP client fixture
# ---------------------------------------------------------------------------

@pytest.fixture
async def client() -> AsyncClient:
    from app.main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
