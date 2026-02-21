import xml.etree.ElementTree as ET
from fastapi import APIRouter, UploadFile

from app.core.splasp import analyze_project

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.post("/analyze")
async def analyze_snap_project(file: UploadFile):

    content = await file.read()

    root = ET.fromstring(content)

    result = analyze_project(root)

    return result.to_json_dict()