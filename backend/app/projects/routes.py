import xml.etree.ElementTree as ET
from fastapi import APIRouter, UploadFile

from app.core.splasp import analyze_project

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("/analyze")
async def analyze_snap_project(file: UploadFile):

    content = await file.read()

    root = ET.fromstring(content)

    result = analyze_project(root)
    
    print(result)

    blocks = []

    for key, value in result.blocks.items():
        block_parsed = {
            "owner": key.owner,
            "name": key.name,
            "level": value.level,
            "structural_changes": value.structural_changes,
            "definition_changes": value.definition_changes,
            "definition_level": value.definition_level,
            "feature_guarded_definition_changes": value.feature_guarded_definition_changes,
            "ast_pipeline_definition_changes": value.ast_pipeline_definition_changes,
        }
        blocks.append(block_parsed)

    result_dict = {
        "project_level": result.project_level,
        "blocks": blocks,
        "unknown_events": result.unknown_events
    }

    return {"filename": file.filename, "result": result_dict}