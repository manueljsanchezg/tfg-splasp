from datetime import datetime, timedelta, timezone

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



class TestSessionAPI:
    async def test_create_and_get_sessions(self, async_client: AsyncClient):
        token = await _get_auth_token(async_client)
        headers = {"Authorization": f"Bearer {token}"}

        start = datetime.now(timezone.utc).isoformat()
        end = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()

        res = await async_client.post(
            "/api/sessions",
            json={"name": "Test Session", "startDate": start, "endDate": end},
            headers=headers,
        )
        assert res.status_code == 200
        data = res.json()["data"]
        assert data["name"] == "Test Session"
        session_id = data["id"]

        res = await async_client.get("/api/sessions", headers=headers)
        assert res.status_code == 200
        sessions = res.json()["data"]
        assert len(sessions) > 0
        assert sessions[0]["id"] == session_id


    async def test_get_sessions_analysis_stats(self, async_client: AsyncClient):
        token = await _get_auth_token(async_client)
        headers = {"Authorization": f"Bearer {token}"}

        res = await async_client.get("/api/sessions/stats?sessions_ids=1", headers=headers)
        assert res.status_code == 200
        assert isinstance(res.json()["data"], list)


    async def test_get_projects_analysis_csv_by_session_id(self, async_client: AsyncClient):
        token = await _get_auth_token(async_client)
        headers = {"Authorization": f"Bearer {token}"}

        res_session = await async_client.post(
            "/api/sessions",
            json={
                "name": "CSV Session",
                "startDate": "2026-01-01T00:00:00Z",
                "endDate": "2026-12-31T00:00:00Z",
            },
            headers=headers,
        )
        session_id = res_session.json()["data"]["id"]

        res = await async_client.get(f"/api/sessions/{session_id}/projects/export", headers=headers)
        assert res.status_code == 404 


    async def test_join_anonymous_session(self, async_client: AsyncClient):
        token = await _get_auth_token(async_client)
        headers = {"Authorization": f"Bearer {token}"}

        start = datetime.now(timezone.utc).isoformat()
        end = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()

        res_create = await async_client.post(
            "/api/sessions",
            json={"name": "Anonymous Test", "startDate": start, "endDate": end},
            headers=headers,
        )
        session_code = res_create.json()["data"]["code"]

        res_join = await async_client.post(
            "/api/sessions/join-anonymous", json={"code": session_code, "deviceId": "device-123"}
        )
        assert res_join.status_code == 200
        join_data = res_join.json()["data"]
        assert "accessToken" in join_data
        assert "projectId" in join_data


    async def test_close_session(self, async_client: AsyncClient):
        token = await _get_auth_token(async_client)
        headers = {"Authorization": f"Bearer {token}"}

        res_session = await async_client.post(
            "/api/sessions",
            json={
                "name": "To Close",
                "startDate": "2026-01-01T00:00:00Z",
                "endDate": "2026-12-31T00:00:00Z",
            },
            headers=headers,
        )
        session_id = res_session.json()["data"]["id"]

        res_close = await async_client.patch(f"/api/sessions/{session_id}", headers=headers)
        assert res_close.status_code == 200
        assert res_close.json()["data"]["message"] == "Session deactivate"

        res_get = await async_client.get("/api/sessions", headers=headers)
        sessions = res_get.json()["data"]
        closed_session = next(s for s in sessions if s["id"] == session_id)
        assert closed_session["isActive"] is False


    async def test_close_session_not_found(self, async_client: AsyncClient):
        token = await _get_auth_token(async_client)
        headers = {"Authorization": f"Bearer {token}"}

        res = await async_client.patch("/api/sessions/9999", headers=headers)
        assert res.status_code == 404


    async def test_join_anonymous_not_found(self, async_client: AsyncClient):
        res = await async_client.post(
            "/api/sessions/join-anonymous", json={"code": "UNKNOWN", "deviceId": "dev-anon-fail"}
        )
        assert res.status_code == 404


    async def test_get_projects_by_session(self, async_client: AsyncClient):
        token = await _get_auth_token(async_client)
        headers = {"Authorization": f"Bearer {token}"}

        res_session = await async_client.post(
            "/api/sessions",
            json={
                "name": "Proj Session",
                "startDate": "2026-01-01T00:00:00Z",
                "endDate": "2026-12-31T00:00:00Z",
            },
            headers=headers,
        )
        session_id = res_session.json()["data"]["id"]

        res = await async_client.get(f"/api/sessions/{session_id}/projects", headers=headers)
        assert res.status_code == 200
        assert isinstance(res.json()["data"], list)
