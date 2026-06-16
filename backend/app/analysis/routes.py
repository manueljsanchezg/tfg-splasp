import asyncio
from typing import List

from fastapi import APIRouter, Form, HTTPException, Query, UploadFile

from app.analysis.dependencies import AnalysisResultServiceDep, AnalysisServiceDep
from app.analysis.schemas import AnalysisResultSchema, SavedAnalysisResultSchema
from app.analysis.utils import (
    get_content_from_project_url,
    get_content_from_xml,
    get_root_from_xml_content,
    get_roots_from_projects_urls,
    get_roots_from_zip,
)
from app.auth.dependencies import CurrentAnonymousDep, CurrentUserDep
from app.core.api_response import ApiResponse

router = APIRouter(prefix="/api/analyses", tags=["analyses"])


@router.post("", response_model=ApiResponse[AnalysisResultSchema])
async def analyze_snap_project(
    service: AnalysisServiceDep, project_url: str = None, file: UploadFile = None
):
    if not project_url and not file:
        raise HTTPException(status_code=400, detail="You need to upload a project or a URL")

    filename, project_xml = (
        await get_content_from_project_url(project_url)
        if project_url
        else await get_content_from_xml(file)
    )

    root = await asyncio.to_thread(get_root_from_xml_content, project_xml)

    analysis = await service.analyze_and_persist(filename, root, project_url)

    if analysis is None:
        raise HTTPException(status_code=400, detail="Failure saving the result of the analysis")

    return ApiResponse(success=True, data=analysis)


@router.post("/anonymous", response_model=ApiResponse[AnalysisResultSchema])
async def analyze_snap_project_anonymous(
    anonymous_user: CurrentAnonymousDep,
    service: AnalysisServiceDep,
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

    root = await asyncio.to_thread(get_root_from_xml_content, project_xml)

    analysis = await service.analyze_and_persist_anonymous(
        filename, anonymous_user.project_id, root, project_url
    )

    if analysis is None:
        raise HTTPException(status_code=400, detail="Failure saving the result of the analysis")

    return ApiResponse(success=True, data=analysis)


@router.post("/sessions/{session_id}", response_model=ApiResponse[dict[str, int | str]])
async def analyze_batch_snap_project(
    service: AnalysisServiceDep,
    user: CurrentUserDep,
    session_id: int,
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

    await service.analyze_batch(session_id, roots_list)

    return ApiResponse(
        success=True,
        data={"message": "Projects saved succesfully", "total_saved": len(roots_list)},
    )


@router.get("", response_model=ApiResponse[List[SavedAnalysisResultSchema]])
async def get_project_analysis_by_versions_ids(
    user: CurrentUserDep,
    service: AnalysisResultServiceDep,
    versions_ids: List[int] = Query(...),
):
    analyses = await service.find_analysis_by_versions_ids(versions_ids)
    return ApiResponse(success=True, data=analyses)


@router.get("/{version_id}", response_model=ApiResponse[SavedAnalysisResultSchema])
async def get_version_analysis(
    version_id: int, analysis_service: AnalysisResultServiceDep, user: CurrentUserDep
):
    analysis = await analysis_service.get_analysis_by_version(version_id)

    if analysis is None:
        raise HTTPException(
            status_code=404, detail=f"Analysis result not found for version {version_id}"
        )

    return ApiResponse(success=True, data=analysis)
