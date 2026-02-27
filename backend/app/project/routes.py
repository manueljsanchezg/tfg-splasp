import xml.etree.ElementTree as ET
from fastapi import APIRouter, Form, UploadFile, HTTPException

from app.core.splasp import analyze_project
from app.auth.dependencies import CurrentUserDep

from app.project.dependencies import ProjectServiceDep
from app.project.schemas import Result

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.post("/analyze")
async def analyze_snap_project(file: UploadFile, user: CurrentUserDep, project_service: ProjectServiceDep, session_id: int = Form(alias="sessionId")):

    print(file.filename)
    is_xml_extension = file.filename.lower().endswith(".xml")

    if not is_xml_extension:
        raise HTTPException(
            status_code=400,
            detail="The file is not xml"
        )

    content = await file.read()

    try:
        root = ET.fromstring(content)
    except ET.ParseError:
        raise HTTPException(
            status_code=400,
            detail="The content is corruped or malformed"
        )

    root = ET.fromstring(content)

    result = analyze_project(root)

    response = result.to_json_dict()

    new_analyzed_project = await project_service.persist_project(file.filename, user, session_id, Result(**response))

    if new_analyzed_project == None:
        raise HTTPException(status_code=400, detail="Fuilure saving the result of the analysis")

    return response