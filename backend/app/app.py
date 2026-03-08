
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.user.routes import router as user_routes
from app.auth.routes import router as auth_routes
from app.session.routes import router as session_routes
from app.project.routes import router as project_routes
from app.env import CORS_ORIGINS


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user_routes)
app.include_router(auth_routes)
app.include_router(session_routes)
app.include_router(project_routes)


@app.get("/health")
async def root():
    return {"status": "ok"}