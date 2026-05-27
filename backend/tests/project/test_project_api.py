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


async def test_get_projects_and_me(async_client: AsyncClient):
    token = await _get_auth_token(async_client)
    headers = {"Authorization": f"Bearer {token}"}

    # Create session
    start = datetime.now(timezone.utc).isoformat()
    end = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    res_session = await async_client.post(
        "/api/sessions",
        json={"name": "Project Test Session", "startDate": start, "endDate": end},
        headers=headers,
    )
    session_code = res_session.json()["data"]["code"]

    # Join session to get anonymous token
    res_join = await async_client.post(
        "/api/sessions/join-anonymous", json={"code": session_code, "deviceId": "dev-proj-1"}
    )
    anon_data = res_join.json()["data"]
    anon_token = anon_data["accessToken"]
    project_id = anon_data["projectId"]

    anon_headers = {"Authorization": f"Bearer {anon_token}"}

    # Test /api/projects/me
    res_me = await async_client.get("/api/projects/me", headers=anon_headers)
    assert res_me.status_code == 200
    my_project = res_me.json()["data"]
    assert my_project["id"] == project_id
    assert "title" in my_project

    # Add a version to the project so it shows up in find_with_versions
    async with TestingSessionLocal() as session:
        from app.project.models import ProjectVersion

        version = ProjectVersion(version_number=1, project_id=project_id)
        session.add(version)
        await session.commit()

    # Test /api/projects
    res_all = await async_client.get("/api/projects", headers=headers)
    assert res_all.status_code == 200
    projects = res_all.json()["data"]
    assert len(projects) >= 1

    # Test /api/projects/{id}/versions
    res_versions = await async_client.get(f"/api/projects/{project_id}/versions", headers=headers)
    assert res_versions.status_code == 200
    versions = res_versions.json()["data"]
    assert isinstance(versions, list)
