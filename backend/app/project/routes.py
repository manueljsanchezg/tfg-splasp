import xml.etree.ElementTree as ET
from typing import List

from fastapi import APIRouter, Form, HTTPException, Query, UploadFile

from app.auth.dependencies import CurrentAnonymousDep, CurrentUserDep
from app.core.splasp import analyze_project
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
    Result,
)

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("/mine", response_model=ProjectRead)
async def get_my_project_for_session(
    user: CurrentUserDep,
    service: ProjectServiceDep,
    session_id: int = Query(alias="sessionId"),
):
    project = await service.find_project_by_user_and_session(user.id, session_id)
    if not project:
        raise HTTPException(status_code=404, detail="You have not joined this session")
    return project


@router.get("/mine/anonymous", response_model=ProjectRead)
async def get_my_anonymous_project(
    anonymous: CurrentAnonymousDep,
    service: ProjectServiceDep,
):
    project = await service.find_project_by_id_with_versions(anonymous.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/analyze", response_model=AnalysisResultSchema)
async def analyze_snap_project(
    file: UploadFile,
    user: CurrentUserDep,
    service: ProjectServiceDep,
    session_id: int = Form(alias="sessionId"),
):

    print(file.filename)
    is_xml_extension = file.filename.lower().endswith(".xml")

    if not is_xml_extension:
        raise HTTPException(status_code=400, detail="The file is not xml")

    content = await file.read()

    try:
        root = ET.fromstring(content)
    except ET.ParseError:
        raise HTTPException(status_code=400, detail="The content is corruped or malformed")

    root = ET.fromstring(content)

    result = analyze_project(root)

    response = result.to_json_dict()

    new_analyzed_project = await service.persist_project(
        file.filename, user, session_id, Result(**response)
    )

    if new_analyzed_project is None:
        raise HTTPException(status_code=400, detail="Fuilure saving the result of the analysis")

    return response


@router.post("/analyze/anonymous", response_model=AnalysisResultSchema)
async def analyze_snap_project_anonymous(
    file: UploadFile,
    anonymous_user: CurrentAnonymousDep,
    service: ProjectServiceDep,
):
    if not file.filename or not file.filename.lower().endswith(".xml"):
        raise HTTPException(status_code=400, detail="The file is not xml")

    content = await file.read()

    try:
        root = ET.fromstring(content)
    except ET.ParseError:
        raise HTTPException(status_code=400, detail="The content is corrupted or malformed")

    result = analyze_project(root)
    response = result.to_json_dict()

    new_analyzed_project = await service.persist_anonymous_project(
        file.filename, anonymous_user.project_id, Result(**response)
    )

    if new_analyzed_project is None:
        raise HTTPException(status_code=400, detail="Failure saving the result of the analysis")

    return response


@router.get("/{project_id}/versions", response_model=List[ProjectVersionRead])
async def get_project_versions(project_id: int, version_service: ProjectVersionServiceDep):
    versions = await version_service.get_versions_by_project(project_id)
    return versions


@router.get("/versions/{version_id}/analysis", response_model=AnalysisResultRead)
async def get_version_analysis(version_id: int, analysis_service: AnalysisResultServiceDep):
    analysis = await analysis_service.get_analysis_by_version(version_id)

    if analysis is None:
        raise HTTPException(
            status_code=404, detail=f"Analysis result not found for version {version_id}"
        )

    return analysis
