from httpx import AsyncClient

from app.auth.utils import hash_password
from app.user.models import User
from tests.conftest import TestingSessionLocal


async def _get_auth_token(async_client: AsyncClient, username="test_user") -> str:
    async with TestingSessionLocal() as session:
        user = User(username=username, password=hash_password("test_password"))
        session.add(user)
        await session.commit()

    res = await async_client.post(
        "/api/auth/login", json={"username": username, "password": "test_password"}
    )
    return res.json()["data"]["accessToken"]



class TestUserAPI:
    async def test_get_users(self, async_client: AsyncClient):
        token = await _get_auth_token(async_client)
        headers = {"Authorization": f"Bearer {token}"}

        res = await async_client.get("/api/users", headers=headers)
        assert res.status_code == 200
        assert len(res.json()["data"]) >= 1


    async def test_get_user(self, async_client: AsyncClient):
        token = await _get_auth_token(async_client)
        headers = {"Authorization": f"Bearer {token}"}

        res_all = await async_client.get("/api/users", headers=headers)
        user_id = res_all.json()["data"][0]["id"]

        res = await async_client.get(f"/api/users/{user_id}", headers=headers)
        assert res.status_code == 200
        assert res.json()["data"]["id"] == user_id

        res_not_found = await async_client.get("/api/users/9999", headers=headers)
        assert res_not_found.status_code == 404


    async def test_create_user(self, async_client: AsyncClient):
        token = await _get_auth_token(async_client)
        headers = {"Authorization": f"Bearer {token}"}

        res = await async_client.post(
            "/api/users",
            json={"username": "test_user_new", "password": "test_password_new"},
            headers=headers,
        )
        assert res.status_code == 200
        assert res.json()["data"]["username"] == "test_user_new"

        res_fail = await async_client.post(
            "/api/users",
            json={"username": "test_user_new", "password": "test_password_new"},
            headers=headers,
        )
        assert res_fail.status_code == 400


    async def test_update_user(self, async_client: AsyncClient):
        token = await _get_auth_token(async_client)
        headers = {"Authorization": f"Bearer {token}"}

        res_create = await async_client.post(
            "/api/users",
            json={"username": "test_user_update", "password": "test_password_update"},
            headers=headers,
        )
        user_id = res_create.json()["data"]["id"]

        res_update = await async_client.put(
            f"/api/users/{user_id}",
            json={"username": "test_user_updated", "password": "test_password_updated"},
            headers=headers,
        )
        assert res_update.status_code == 200
        assert res_update.json()["data"]["username"] == "test_user_updated"

        res_conflict = await async_client.put(
            f"/api/users/{user_id}",
            json={"username": "test_user", "password": "test_password_updated"},
            headers=headers,
        )
        assert res_conflict.status_code == 400

        res_not_found = await async_client.put(
            "/api/users/9999",
            json={"username": "test_user_updated", "password": "test_password_updated"},
            headers=headers,
        )
        assert res_not_found.status_code == 404


    async def test_delete_user(self, async_client: AsyncClient):
        token = await _get_auth_token(async_client)
        headers = {"Authorization": f"Bearer {token}"}

        res_create = await async_client.post(
            "/api/users",
            json={"username": "test_user_delete", "password": "test_password_delete"},
            headers=headers,
        )
        user_id = res_create.json()["data"]["id"]

        res_delete = await async_client.delete(f"/api/users/{user_id}", headers=headers)
        assert res_delete.status_code == 200

        res_not_found = await async_client.delete("/api/users/9999", headers=headers)
        assert res_not_found.status_code == 404
