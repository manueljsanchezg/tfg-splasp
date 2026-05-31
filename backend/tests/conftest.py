import os
from typing import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.app import app
from app.limiter import limiter
from app.db import Base, get_session

limiter.enabled = False

FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "fixtures")


@pytest.fixture
def sample_xml():
    xml_path = os.path.join(FIXTURES_DIR, "sample.xml")
    with open(xml_path, "rb") as f:
        return f.read()


@pytest.fixture
def sample_urls():
    txt_path = os.path.join(FIXTURES_DIR, "samples.txt")
    with open(txt_path, "r", encoding="utf-8") as f:
        return f.read()


TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_db.sqlite"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    poolclass=NullPool,
)
TestingSessionLocal = async_sessionmaker(
    autocommit=False, autoflush=False, bind=test_engine, expire_on_commit=False
)


async def override_get_session() -> AsyncGenerator:
    async with TestingSessionLocal() as session:
        yield session


app.dependency_overrides[get_session] = override_get_session


@pytest.fixture(autouse=True)
async def create_test_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def async_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client
