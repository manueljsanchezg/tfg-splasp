from fastapi import APIRouter, UploadFile

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("/analyze")
async def analyze_project(file: UploadFile):
    return {"filename": file.filename, "status": "analysis started"}