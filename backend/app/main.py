from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import health, projects

app = FastAPI(
    title="PersonalWeb API",
    version="1.0.0",
    docs_url="/docs",       # disable in prod by setting to None
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(projects.router)
