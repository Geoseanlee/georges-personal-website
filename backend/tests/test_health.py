"""
Tests for GET /api/v1/health.

The database session is mocked — no live PostgreSQL required.
"""

from contextlib import asynccontextmanager
from unittest.mock import AsyncMock, patch

import pytest
from sqlalchemy.exc import OperationalError


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_session_cm(*, raise_on_execute: Exception | None = None) -> AsyncMock:
    """Return an async context manager that yields a mock session."""

    session = AsyncMock()
    if raise_on_execute is not None:
        session.execute.side_effect = raise_on_execute

    @asynccontextmanager
    async def _cm():
        yield session

    return _cm


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

async def test_health_returns_ok_when_db_reachable(client):
    with patch(
        "app.routers.health.AsyncSessionLocal",
        side_effect=_make_session_cm(),
    ):
        response = await client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


async def test_health_returns_503_when_db_unreachable(client):
    err = OperationalError("connection refused", {}, None)
    with patch(
        "app.routers.health.AsyncSessionLocal",
        side_effect=_make_session_cm(raise_on_execute=err),
    ):
        response = await client.get("/api/v1/health")

    assert response.status_code == 503
    assert response.json() == {"status": "unavailable"}


async def test_health_does_not_expose_connection_details(client):
    """503 body must never include DB credentials or host info."""
    err = OperationalError("Host=127.0.0.1;Password=secret", {}, None)
    with patch(
        "app.routers.health.AsyncSessionLocal",
        side_effect=_make_session_cm(raise_on_execute=err),
    ):
        response = await client.get("/api/v1/health")

    body = response.text
    assert "127.0.0.1" not in body
    assert "secret" not in body
    assert "password" not in body.lower()


async def test_api_docs_are_not_public(client):
    response = await client.get("/docs")

    assert response.status_code == 404
