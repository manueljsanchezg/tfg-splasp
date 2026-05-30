import uvicorn

from app.env import UVICORN_WORKERS

if __name__ == "__main__":
    uvicorn.run("app.app:app", port=8000, log_level="info", workers=UVICORN_WORKERS)
