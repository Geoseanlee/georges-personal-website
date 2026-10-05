from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase

from .config import settings

database_url = make_url(settings.database_url)
query = dict(database_url.query)
ssl_mode = query.pop("ssl", None) or query.pop("sslmode", None)
database_url = database_url.set(query=query)
connect_args = {"ssl": ssl_mode} if ssl_mode else {}

engine = create_async_engine(
    database_url,
    connect_args=connect_args,
    echo=False,
    pool_pre_ping=True,
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
