import os
import asyncio
from logging.config import fileConfig

from sqlalchemy.ext.asyncio import async_engine_from_config
from sqlalchemy import pool

from alembic import context
from dotenv import load_dotenv

# Importaciones de tu proyecto
from app.db import Base
from app.user import models as user_models
from app.session import models as session_models
from app.project import models as project_models

load_dotenv()

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Leemos la URL del .env
database_url = os.environ.get("DATABASE_URL")
if database_url:
    config.set_main_option("sqlalchemy.url", database_url)
else:
    print("Not found db url in .env")

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.
    (Esta función se queda síncrona porque offline solo genera texto SQL)
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    """Función síncrona interna que aplica los cambios en la conexión."""
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations():
    """Inicia el motor asíncrono y delega la ejecución a Alembic."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    # Usamos "async with" para conectarnos de forma asíncrona
    async with connectable.connect() as connection:
        # Usamos run_sync para que Alembic (que es síncrono por dentro) 
        # pueda usar nuestra conexión asíncrona de forma segura
        await connection.run_sync(do_run_migrations)

    # Cerramos el motor limpiamente
    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    # Arrancamos el bucle de eventos asíncrono de Python
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()