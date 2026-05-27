from httpx import AsyncClient

from app.auth.utils import hash_password
from app.user.models import User
from tests.conftest import TestingSessionLocal


async def _create_test_user(username: str, password: str):
    async with TestingSessionLocal() as session:
        user = User(username=username, password=hash_password(password))
        session.add(user)
        await session.commit()


async def test_login_success(async_client: AsyncClient):
    await _create_test_user("test_user", "test_password")

    response = await async_client.post(
        "/api/auth/login",
        json={"username": "test_user", "password": "test_password"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "accessToken" in data["data"]


async def test_login_invalid_credentials(async_client: AsyncClient):
    await _create_test_user("test_user", "test_password")

    response = await async_client.post(
        "/api/auth/login",
        json={"username": "test_user", "password": "wrongpassword"},
    )
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert data["error"] == "Invalid credentials"


async def test_access_token_success(async_client: AsyncClient):
    await _create_test_user("test_user", "test_password")

    response = await async_client.post(
        "/api/auth/access-token",
        data={"username": "test_user", "password": "test_password"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
