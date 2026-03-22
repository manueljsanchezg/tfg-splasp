import xml.etree.ElementTree as ET
import zipfile
from io import BytesIO
from typing import List

from fastapi import APIRouter, Form, HTTPException, UploadFile

from app.auth.dependencies import CurrentAnonymousDep, CurrentUserDep
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

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("/mine/anonymous", response_model=ProjectRead)
async def get_my_anonymous_project(
    anonymous: CurrentAnonymousDep,
    service: ProjectServiceDep,
):
    project = await service.find_project_by_id_with_versions(anonymous.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


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

    analysis = await service.persist_anonymous_project(
        file.filename, anonymous_user.project_id, root
    )

    if analysis is None:
        raise HTTPException(status_code=400, detail="Failure saving the result of the analysis")

    return analysis


@router.post("/analyze-batch")
async def analyze_batch_snap_project(
    file: UploadFile,
    service: ProjectServiceDep,
    user: CurrentUserDep,
    session_id: int = Form(alias="sessionId"),
):
    content = await file.read()
    roots_list = []
    with zipfile.ZipFile(BytesIO(content)) as zip:
        for snap_project in zip.namelist():
            content = zip.read(snap_project)
            try:
                root = ET.fromstring(content)
                roots_list.append((snap_project.split("/")[1], root))
            except ET.ParseError:
                raise HTTPException(status_code=400, detail="The content is corrupted or malformed")

    await service.persist_batch_projects(session_id, roots_list)
    return {"message": "Projects saved succesfully", "total_saved": len(roots_list)}


@router.get("/{project_id}/versions", response_model=List[ProjectVersionRead])
async def get_project_versions(
    project_id: int, version_service: ProjectVersionServiceDep, user: CurrentUserDep
):
    versions = await version_service.get_versions_by_project(project_id)
    return versions


@router.get("/versions/{version_id}/analysis", response_model=AnalysisResultRead)
async def get_version_analysis(
    version_id: int, analysis_service: AnalysisResultServiceDep, user: CurrentUserDep
):
    analysis = await analysis_service.get_analysis_by_version(version_id)

    if analysis is None:
        raise HTTPException(
            status_code=404, detail=f"Analysis result not found for version {version_id}"
        )

    return analysis
