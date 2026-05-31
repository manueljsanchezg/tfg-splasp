import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/splasp_db"
)
SECRET_KEY = os.getenv("SECRET_KEY", "change-this-secret-in-production")
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]
UVICORN_WORKERS = int(os.getenv("UVICORN_WORKERS", "1"))
RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "True") == "True"
RATE_LIMIT_REQUESTS_PER_MINUTE = os.getenv("RATE_LIMIT_REQUESTS_PER_MINUTE", "60")