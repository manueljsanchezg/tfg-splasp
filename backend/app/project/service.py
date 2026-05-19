from typing import List, Optional

from app.core.base_service import BaseService
from app.project.models import Project, ProjectVersion
from app.project.repository import ProjectRepository, ProjectVersionRepository


class ProjectService(BaseService[Project, ProjectRepository]):
    def __init__(self, project_repo: ProjectRepository):
        super().__init__(project_repo)

    async def find_project_by_device_id_and_session(
        self, device_id: str, session_id: int
    ) -> Optional[Project]:
        return await self.repository.find_by_device_id_and_session(device_id, session_id)

    async def get_project_id_by_device_id_and_session(
        self, device_id: str, session_id: int
    ) -> Optional[int]:
        project = await self.repository.find_by_device_id_and_session(device_id, session_id)
        return project.id if project else None

    async def create_dump_project(self, device_id: str, session_id: int) -> int:
        new_project = Project(title="dump", device_id=device_id, session_id=session_id)
        saved_project = await self.save(new_project)
        return saved_project.id

    async def find_project_by_id_with_versions(self, project_id: int) -> Optional[Project]:
        return await self.repository.find_by_id_with_versions(project_id)

    async def find_projects_with_versions(self) -> List[Project]:
        projects = await self.repository.find_with_versions()

        for project in projects:
            if project.project_versions:
                latest_version = max(
                    project.project_versions, key=lambda version: version.version_number
                )
                project.project_versions = [latest_version]

        return projects

    async def find_projects_by_session(self, session_id: int) -> List[Project]:
        return await self.repository.find_by_session(session_id)

    async def save_batch(self, projects_list: List[Project]) -> List[Project]:
        return await self.repository.save_batch(projects_list)


class ProjectVersionService(BaseService[ProjectVersion, ProjectVersionRepository]):
    def __init__(self, project_version_repo: ProjectVersionRepository):
        super().__init__(project_version_repo)

    async def get_versions_by_project(self, project_id: int) -> List[ProjectVersion]:
        return await self.repository.find_by_project_id(project_id)
