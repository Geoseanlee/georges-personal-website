from fastapi import APIRouter
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from ..database import AsyncSessionLocal

router = APIRouter(tags=["health"])


@router.get("/api/v1/health")
async def health_check():
    """Returns 200 when the API and database are reachable, 503 otherwise."""
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "ok"}
    except (SQLAlchemyError, OSError):
        return JSONResponse(status_code=503, content={"status": "unavailable"})
