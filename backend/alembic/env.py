from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlalchemy.engine import make_url

# Alembic Config object
config = context.config

# Set up logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import the models so Alembic can detect their metadata.
from app.models import Project  # noqa: E402, F401
from app.database import Base  # noqa: E402
from app.config import settings  # noqa: E402

target_metadata = Base.metadata

# The API uses asyncpg; Alembic's synchronous migration engine uses psycopg.
sync_url = make_url(settings.database_url).set(drivername="postgresql+psycopg")
query = dict(sync_url.query)
ssl_mode = query.pop("ssl", None)
if ssl_mode:
    query["sslmode"] = ssl_mode
sync_url = sync_url.set(query=query)
# Escape percent signs because ConfigParser interpolates Alembic options.
config.set_main_option(
    "sqlalchemy.url",
    sync_url.render_as_string(hide_password=False).replace("%", "%%"),
)


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
