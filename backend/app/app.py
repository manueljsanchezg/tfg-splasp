from fastapi import FastAPI

from app.projects.routes import router as project_routes

app = FastAPI()

app.include_router(project_routes)

@app.get("/health")
async def root():
    return {"status": "ok"}