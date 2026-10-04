"""
Tests for GET /api/v1/projects.

The database session is mocked via FastAPI dependency_overrides —
no live PostgreSQL required.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest
from sqlalchemy.exc import OperationalError


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_db_override(projects: list, *, raise_error: Exception | None = None):
    """Return a get_db dependency override for the given project list."""

    async def _override():
        session = AsyncMock()
        if raise_error is not None:
            session.execute.side_effect = raise_error
        else:
            result = MagicMock()
            result.scalars.return_value.all.return_value = projects
            session.execute = AsyncMock(return_value=result)
        yield session

    return _override


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

async def test_projects_returns_ordered_list(client, sample_projects):
    from app.database import get_db
    from app.main import app

    app.dependency_overrides[get_db] = _make_db_override(sample_projects)
    try:
        response = await client.get("/api/v1/projects")
    finally:
        app.dependency_overrides.pop(get_db, None)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 4
    # Ordered by display_order
    assert data[0]["slug"] == "blotz-task-app"
    assert data[0]["displayOrder"] == 1
    assert data[3]["slug"] == "ai-health-management"
    assert data[3]["displayOrder"] == 4


async def test_projects_response_uses_camel_case(client, sample_projects):
    from app.database import get_db
    from app.main import app

    app.dependency_overrides[get_db] = _make_db_override(sample_projects)
    try:
        response = await client.get("/api/v1/projects")
    finally:
        app.dependency_overrides.pop(get_db, None)

    first = response.json()[0]
    # camelCase keys expected
    assert "projectType" in first
    assert "githubUrl" in first
    assert "displayOrder" in first
    assert "isFeatured" in first
    # snake_case keys must NOT appear
    assert "project_type" not in first
    assert "github_url" not in first


async def test_projects_returns_featured_flag(client, sample_projects):
    from app.database import get_db
    from app.main import app

    app.dependency_overrides[get_db] = _make_db_override(sample_projects)
    try:
        response = await client.get("/api/v1/projects")
    finally:
        app.dependency_overrides.pop(get_db, None)

    data = response.json()
    assert data[0]["isFeatured"] is True
    assert all(not p["isFeatured"] for p in data[1:])


async def test_projects_empty_table_returns_200_empty_list(client):
    from app.database import get_db
    from app.main import app

    app.dependency_overrides[get_db] = _make_db_override([])
    try:
        response = await client.get("/api/v1/projects")
    finally:
        app.dependency_overrides.pop(get_db, None)

    assert response.status_code == 200
    assert response.json() == []


async def test_projects_returns_503_when_db_unavailable(client):
    from app.database import get_db
    from app.main import app

    err = OperationalError("connection refused", {}, None)
    app.dependency_overrides[get_db] = _make_db_override([], raise_error=err)
    try:
        response = await client.get("/api/v1/projects")
    finally:
        app.dependency_overrides.pop(get_db, None)

    assert response.status_code == 503
    data = response.json()
    assert "detail" in data
    # Must not expose internal details
    assert "connection" not in data["detail"].lower()
