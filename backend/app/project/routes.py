from typing import List

from fastapi import APIRouter, HTTPException

from app.auth.dependencies import CurrentAnonymousDep
from app.core.api_response import ApiResponse
from app.project.dependencies import ProjectServiceDep, ProjectVersionServiceDep
from app.project.schemas import ProjectRead, ProjectVersionRead, ProjectWithLatestVersion

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=ApiResponse[List[ProjectWithLatestVersion]])
async def get_projects_with_versions(
    service: ProjectServiceDep,
):
    projects = await service.find_projects_with_versions()
    return ApiResponse(success=True, data=projects)


@router.get("/me", response_model=ApiResponse[ProjectRead])
async def get_my_anonymous_project(
    anonymous: CurrentAnonymousDep,
    service: ProjectServiceDep,
):
    project = await service.find_project_by_id_with_versions(anonymous.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ApiResponse(success=True, data=project)


@router.get("/{project_id}/versions", response_model=ApiResponse[List[ProjectVersionRead]])
async def get_project_versions(project_id: int, version_service: ProjectVersionServiceDep):
    versions = await version_service.get_versions_by_project(project_id)
    return ApiResponse(success=True, data=versions)
