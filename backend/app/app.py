from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.auth.routes import router as auth_routes
from app.core.api_response import ApiResponse
from app.env import CORS_ORIGINS
from app.project.routes import router as project_routes
from app.session.routes import router as session_routes
from app.user.routes import router as user_routes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, ex: HTTPException):
    return JSONResponse(
        status_code=ex.status_code, content=ApiResponse(success=False, error=ex.detail).model_dump()
    )


"""

@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(request: Request, ex: RequestValidationError):
    errors = ex.errors()
    if not errors:
        message = "Validation error"
    else:
        parsed_errors = []
        for err in errors:
            loc = ".".join(str(part) for part in err.get("loc", []) if part != "body")
            detail = err.get("msg", "Invalid value")
            parsed_errors.append(f"{loc}: {detail}" if loc else detail)
        message = "; ".join(parsed_errors)

    return JSONResponse(
        status_code=422,
        content=ApiResponse(success=False, error=message).model_dump(),
    )
"""


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, ex: Exception):
    return JSONResponse(
        status_code=500,
        content=ApiResponse(success=False, error="Internal server error").model_dump(),
    )


app.include_router(user_routes)
app.include_router(auth_routes)
app.include_router(session_routes)
app.include_router(project_routes)


@app.get("/health", response_model=ApiResponse[dict[str, str]])
async def root():
    return ApiResponse(success=True, data={"status": "ok"})
