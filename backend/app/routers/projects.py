from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Project
from ..schemas import ProjectResponse

router = APIRouter(tags=["projects"])


@router.get("/api/v1/projects")
async def list_projects(db: AsyncSession = Depends(get_db)):
    """Returns all projects sorted by display_order ascending.

    An empty table returns 200 [].
    A database error returns 503 Problem Details.
    """
    try:
        result = await db.execute(select(Project).order_by(Project.display_order))
        projects = result.scalars().all()
        return [
            ProjectResponse.model_validate(p).model_dump(by_alias=True)
            for p in projects
        ]
    except (SQLAlchemyError, OSError):
        return JSONResponse(
            status_code=503,
            content={"detail": "Service temporarily unavailable"},
        )
