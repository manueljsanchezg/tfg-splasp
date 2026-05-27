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



class TestAnalysisAPI:
    async def test_analyze_snap_project_file(self, async_client: AsyncClient, sample_xml_bytes: bytes):
        files = {"file": ("sample.xml", sample_xml_bytes, "application/xml")}

        res = await async_client.post("/api/analyses", files=files)

        assert res.status_code == 200
        data = res.json()["data"]
        assert "projectLevel" in data
        assert "totalScripts" in data
        assert data["totalScripts"] > 0


    async def test_analyze_snap_project_anonymous(self, async_client: AsyncClient, sample_xml_bytes: bytes):
        token = await _get_auth_token(async_client)
        headers = {"Authorization": f"Bearer {token}"}

        res_session = await async_client.post(
            "/api/sessions",
            json={
                "name": "Anon Analysis",
                "startDate": "2026-01-01T00:00:00Z",
                "endDate": "2026-12-31T00:00:00Z",
            },
            headers=headers,
        )
        session_code = res_session.json()["data"]["code"]

        res_join = await async_client.post(
            "/api/sessions/join-anonymous", json={"code": session_code, "deviceId": "dev-anon-2"}
        )
        anon_token = res_join.json()["data"]["accessToken"]
        anon_headers = {"Authorization": f"Bearer {anon_token}"}

        files = {"file": ("sample.xml", sample_xml_bytes, "application/xml")}
        res_analyze = await async_client.post(
            "/api/analyses/anonymous", files=files, headers=anon_headers
        )

        assert res_analyze.status_code == 200
        data = res_analyze.json()["data"]
        assert data["projectLevel"] >= 0
        assert data["totalScripts"] > 0


    async def test_analyze_batch_snap_project(self, async_client: AsyncClient, sample_xml_bytes: bytes):
        token = await _get_auth_token(async_client)
        headers = {"Authorization": f"Bearer {token}"}

        res_session = await async_client.post(
            "/api/sessions",
            json={
                "name": "Batch Session",
                "startDate": "2026-01-01T00:00:00Z",
                "endDate": "2026-12-31T00:00:00Z",
            },
            headers=headers,
        )
        session_id = res_session.json()["data"]["id"]

        res_batch = await async_client.post(
            f"/api/analyses/sessions/{session_id}",
            data={
                "projectsUrls": "https://snap.berkeley.edu/project?username=pxt3852&projectname=Maze%20with%20features%20%28to%20fork%29"
            },
            headers=headers,
        )
        assert res_batch.status_code == 200
        assert res_batch.json()["data"]["total_saved"] >= 1


    async def test_get_project_analysis_by_versions_ids(self, async_client: AsyncClient):
        token = await _get_auth_token(async_client)
        headers = {"Authorization": f"Bearer {token}"}

        res = await async_client.get("/api/analyses?versions_ids=1", headers=headers)
        assert res.status_code == 200
        assert isinstance(res.json()["data"], list)


    async def test_get_version_analysis_not_found(self, async_client: AsyncClient):
        token = await _get_auth_token(async_client)
        headers = {"Authorization": f"Bearer {token}"}

        res = await async_client.get("/api/analyses/9999", headers=headers)
        assert res.status_code == 404


    async def test_analyze_snap_project_no_file_url(self, async_client: AsyncClient):
        res = await async_client.post("/api/analyses")
        assert res.status_code == 400


    async def test_analyze_snap_project_anonymous_no_file_url(self, async_client: AsyncClient):
        token = await _get_auth_token(async_client)
        headers = {"Authorization": f"Bearer {token}"}

        res_session = await async_client.post(
            "/api/sessions",
            json={
                "name": "Anon Session",
                "startDate": "2026-01-01T00:00:00Z",
                "endDate": "2026-12-31T00:00:00Z",
            },
            headers=headers,
        )
        session_code = res_session.json()["data"]["code"]

        res_join = await async_client.post(
            "/api/sessions/join-anonymous", json={"code": session_code, "deviceId": "dev-anon-fail-2"}
        )
        anon_token = res_join.json()["data"]["accessToken"]
        anon_headers = {"Authorization": f"Bearer {anon_token}"}

        res = await async_client.post("/api/analyses/anonymous", headers=anon_headers)
        assert res.status_code == 400


    async def test_analyze_batch_snap_project_no_file_url(self, async_client: AsyncClient):
        token = await _get_auth_token(async_client)
        headers = {"Authorization": f"Bearer {token}"}

        res = await async_client.post("/api/analyses/sessions/1", headers=headers)
        assert res.status_code == 400
