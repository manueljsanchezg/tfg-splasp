from typing import List

from fastapi import APIRouter, HTTPException, Query, Response

from app.auth.dependencies import CurrentUserDep
from app.core.api_response import ApiResponse
from app.project.schemas import ProjectRead
from app.session.dependencies import SessionServiceDep
from app.session.schemas import (
    AnonymousTokenResponse,
    CreateSession,
    JoinAnonymousSession,
    ReadSession,
    SessionAnalysisStats,
)

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.get("", response_model=ApiResponse[List[ReadSession]])
async def get_all_sessions(service: SessionServiceDep, user: CurrentUserDep):
    sessions = await service.get_all()
    return ApiResponse(success=True, data=sessions)


@router.post("", response_model=ApiResponse[ReadSession])
async def create_session(session: CreateSession, service: SessionServiceDep, user: CurrentUserDep):
    created_session = await service.create(session.name, session.start_date, session.end_date)
    return ApiResponse(success=True, data=created_session)


@router.post("/join-anonymous", response_model=ApiResponse[AnonymousTokenResponse])
async def join_session_anonymous(data: JoinAnonymousSession, service: SessionServiceDep):
    result = await service.join_anonymous(data.code, data.device_id)

    if result is None:
        raise HTTPException(status_code=404, detail="Session not found or not active")

    token, project_id, session_id = result
    return ApiResponse(
        success=True,
        data=AnonymousTokenResponse(
            access_token=token,
            project_id=project_id,
            session_id=session_id,
        ),
    )


@router.patch("/{session_id}", response_model=ApiResponse[dict[str, str]])
async def close_session(session_id: int, service: SessionServiceDep, user: CurrentUserDep):
    closed = await service.close(session_id)

    if closed is None:
        raise HTTPException(status_code=404, detail="Session not found")

    return ApiResponse(success=True, data={"message": "Session deactivate"})


@router.get("/{session_id}/projects", response_model=ApiResponse[List[ProjectRead]])
async def get_projects_by_session(session_id: int, service: SessionServiceDep):
    projects = await service.get_projects_by_session_id(session_id)
    return ApiResponse(success=True, data=projects)


@router.get(
    "/{session_id}/projects-csv",
    response_class=Response,
)
async def get_projects_analysis_csv_by_session_id(
    session_id: int, service: SessionServiceDep, user: CurrentUserDep
):
    projects_csv = await service.get_csv_project_by_session_id(session_id)

    if not projects_csv:
        raise HTTPException(status_code=404, detail="No projects csv found")

    return Response(
        content=projects_csv,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=projects.csv"},
    )


@router.get("/analysis-stats", response_model=ApiResponse[List[SessionAnalysisStats]])
async def get_sessions_analysis_stats(
    service: SessionServiceDep,
    sessions_ids: List[int] = Query(...),
):
    print(sessions_ids)
    stats = await service.get_analyses_stats_by_sessions_ids(sessions_ids)
    return ApiResponse(success=True, data=stats)
