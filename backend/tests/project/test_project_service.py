from unittest.mock import AsyncMock, MagicMock

from app.project.models import Project, ProjectVersion
from app.project.service import ProjectService


def _make_version(version_number: int, vid: int = 1) -> MagicMock:
    v = MagicMock(spec=ProjectVersion)
    v.id = vid
    v.version_number = version_number
    return v


def _make_project(project_id: int = 1, versions: list = None) -> MagicMock:
    p = MagicMock(spec=Project)
    p.id = project_id
    p.title = f"Project {project_id}"
    p.project_versions = versions if versions is not None else []
    return p


class TestProjectService:
    def setup_method(self):
        self.repo = AsyncMock()
        self.service = ProjectService(project_repo=self.repo)

    async def test_get_project_id_exists_returns_id(self):
        project = _make_project(project_id=42)
        self.repo.find_by_device_id_and_session = AsyncMock(return_value=project)
        result = await self.service.get_project_id_by_device_id_and_session("device-1", 10)
        assert result == 42

    async def test_get_project_id_not_found_returns_none(self):
        self.repo.find_by_device_id_and_session = AsyncMock(return_value=None)
        result = await self.service.get_project_id_by_device_id_and_session("device-x", 99)
        assert result is None

    async def test_create_dump_project_returns_id(self):
        saved_project = _make_project(project_id=7)
        self.repo.save = AsyncMock(return_value=saved_project)
        result = await self.service.create_dump_project(device_id="device-abc", session_id=3)
        assert result == 7

    async def test_create_dump_project_saves_correct_fields(self):
        saved_projects = []

        async def mock_save(project):
            saved_projects.append(project)
            project.id = 99
            return project

        self.repo.save = mock_save
        await self.service.create_dump_project(device_id="device-test", session_id=5)
        assert len(saved_projects) == 1
        p = saved_projects[0]
        assert p.title == "dump"
        assert p.device_id == "device-test"
        assert p.session_id == 5

    async def test_find_with_versions_no_versions_stays_empty(self):
        project = _make_project(project_id=1, versions=[])
        self.repo.find_with_versions = AsyncMock(return_value=[project])
        result = await self.service.find_projects_with_versions()
        assert result[0].project_versions == []

    async def test_find_with_versions_single_version_kept(self):
        v1 = _make_version(version_number=1, vid=10)
        project = _make_project(project_id=1, versions=[v1])
        self.repo.find_with_versions = AsyncMock(return_value=[project])
        result = await self.service.find_projects_with_versions()
        assert len(result[0].project_versions) == 1
        assert result[0].project_versions[0].version_number == 1

    async def test_find_with_versions_keeps_latest(self):
        v1 = _make_version(version_number=1, vid=1)
        v2 = _make_version(version_number=2, vid=2)
        v3 = _make_version(version_number=3, vid=3)
        project = _make_project(project_id=1, versions=[v1, v2, v3])
        self.repo.find_with_versions = AsyncMock(return_value=[project])
        result = await self.service.find_projects_with_versions()
        versions = result[0].project_versions
        assert len(versions) == 1
        assert versions[0].version_number == 3

    async def test_find_with_versions_multiple_projects_each_keeps_latest(self):
        p1 = _make_project(project_id=1, versions=[_make_version(1, 1), _make_version(2, 2)])
        p2 = _make_project(
            project_id=2, versions=[_make_version(1, 3), _make_version(3, 4), _make_version(2, 5)]
        )
        self.repo.find_with_versions = AsyncMock(return_value=[p1, p2])
        result = await self.service.find_projects_with_versions()
        assert result[0].project_versions[0].version_number == 2
        assert result[1].project_versions[0].version_number == 3
