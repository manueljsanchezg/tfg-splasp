from typing import List

from fastapi import APIRouter, Form, HTTPException, UploadFile

from app.auth.dependencies import CurrentAnonymousDep, CurrentUserDep
from app.core.api_response import ApiResponse
from app.project.dependencies import (
    AnalysisResultServiceDep,
    ProjectServiceDep,
    ProjectVersionServiceDep,
)
from app.project.schemas import (
    AnalysisResultRead,
    AnalysisResultSchema,
    ProjectRead,
    ProjectVersionRead,
)
from app.project.utils import (
    get_content_from_project_url,
    get_content_from_xml,
    get_root_from_xml_content,
    get_roots_from_projects_urls,
    get_roots_from_zip,
)

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=List[ProjectRead])
async def get_projects(service: ProjectServiceDep):
    return await service.get_all()


@router.get("/mine/anonymous", response_model=ApiResponse[ProjectRead])
async def get_my_anonymous_project(
    anonymous: CurrentAnonymousDep,
    service: ProjectServiceDep,
):
    project = await service.find_project_by_id_with_versions(anonymous.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ApiResponse(success=True, data=project)


@router.post("/analyze", response_model=ApiResponse[AnalysisResultSchema])
async def analyze_snap_project(
    service: ProjectServiceDep, project_url: str = None, file: UploadFile = None
):
    if not project_url and not file:
        raise HTTPException(status_code=400, detail="You need to upload a project or a URL")

    filename, project_xml = (
        await get_content_from_project_url(project_url)
        if project_url
        else await get_content_from_xml(file)
    )

    root = await get_root_from_xml_content(project_xml)

    analysis = await service.persist_project(filename, root)

    if analysis is None:
        raise HTTPException(status_code=400, detail="Failure saving the result of the analysis")

    return ApiResponse(success=True, data=analysis)


@router.post("/analyze/anonymous", response_model=ApiResponse[AnalysisResultSchema])
async def analyze_snap_project_anonymous(
    anonymous_user: CurrentAnonymousDep,
    service: ProjectServiceDep,
    project_url: str = None,
    file: UploadFile = None,
):
    if not project_url and not file:
        raise HTTPException(status_code=400, detail="You need to upload a project or a URL")

    filename, project_xml = (
        await get_content_from_project_url(project_url)
        if project_url
        else await get_content_from_xml(file)
    )

    root = await get_root_from_xml_content(project_xml)

    analysis = await service.persist_anonymous_project(filename, anonymous_user.project_id, root)

    if analysis is None:
        raise HTTPException(status_code=400, detail="Failure saving the result of the analysis")

    return ApiResponse(success=True, data=analysis)


@router.post("/analyze-batch", response_model=ApiResponse[dict[str, int | str]])
async def analyze_batch_snap_project(
    service: ProjectServiceDep,
    user: CurrentUserDep,
    session_id: int = Form(alias="sessionId"),
    file: UploadFile = None,
    projects_urls: str = Form(alias="projectsUrls", default=None),
):
    if not projects_urls and not file:
        raise HTTPException(status_code=400, detail="You need to upload a project or a URL")

    roots_list = (
        await get_roots_from_projects_urls(projects_urls)
        if projects_urls
        else await get_roots_from_zip(file)
    )

    await service.persist_batch_projects(session_id, roots_list)

    return ApiResponse(
        success=True,
        data={"message": "Projects saved succesfully", "total_saved": len(roots_list)},
    )


@router.get("/{project_id}/versions", response_model=ApiResponse[List[ProjectVersionRead]])
async def get_project_versions(
    project_id: int, version_service: ProjectVersionServiceDep, user: CurrentUserDep
):
    versions = await version_service.get_versions_by_project(project_id)
    return ApiResponse(success=True, data=versions)


@router.get("/versions/{version_id}/analysis", response_model=ApiResponse[AnalysisResultRead])
async def get_version_analysis(
    version_id: int, analysis_service: AnalysisResultServiceDep, user: CurrentUserDep
):
    analysis = await analysis_service.get_analysis_by_version(version_id)

    if analysis is None:
        raise HTTPException(
            status_code=404, detail=f"Analysis result not found for version {version_id}"
        )

    return ApiResponse(success=True, data=analysis)
