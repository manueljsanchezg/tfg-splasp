from typing import Annotated

from fastapi import Depends

from app.db import SessionDep
from app.project.repository import ProjectRepository, ProjectVersionRepository
from app.project.service import ProjectService, ProjectVersionService


def get_project_repository(session: SessionDep):
    return ProjectRepository(session)


def get_project_version_repository(session: SessionDep):
    return ProjectVersionRepository(session)


def get_project_service(
    repository: ProjectRepository = Depends(get_project_repository),
):
    return ProjectService(repository)


def get_project_version_service(
    repository: ProjectVersionRepository = Depends(get_project_version_repository),
):
    return ProjectVersionService(repository)


ProjectServiceDep = Annotated[ProjectService, Depends(get_project_service)]
ProjectVersionServiceDep = Annotated[ProjectVersionService, Depends(get_project_version_service)]
