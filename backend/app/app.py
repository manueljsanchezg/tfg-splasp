from fastapi import FastAPI

from app.projects.routes import router as project_routes

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(project_routes, prefix="/api")

@app.get("/health")
async def root():
    return {"status": "ok"}