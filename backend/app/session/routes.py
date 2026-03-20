from typing import List

from fastapi import APIRouter, HTTPException

from app.auth.dependencies import CurrentUserDep
from app.project.schemas import ProjectRead
from app.session.dependencies import SessionServiceDep
from app.session.schemas import (
    AnonymousTokenResponse,
    CreateSession,
    JoinAnonymousSession,
    ReadSession,
)

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.get("", response_model=List[ReadSession])
async def get_all_sessions(service: SessionServiceDep, user: CurrentUserDep):
    return await service.get_all()


@router.post("", response_model=ReadSession)
async def create_session(session: CreateSession, service: SessionServiceDep, user: CurrentUserDep):
    return await service.create(session.name, session.start_date, session.end_date)


@router.post("/join-anonymous", response_model=AnonymousTokenResponse)
async def join_session_anonymous(data: JoinAnonymousSession, service: SessionServiceDep):
    print(data)
    result = await service.join_anonymous(data.code, data.device_id)

    if result is None:
        raise HTTPException(status_code=404, detail="Session not found or not active")

    token, project_id, session_id = result
    return AnonymousTokenResponse(access_token=token, project_id=project_id, session_id=session_id)


@router.patch("/{session_id}")
async def close_session(session_id: int, service: SessionServiceDep, user: CurrentUserDep):
    closed = await service.close(session_id)

    if closed is None:
        raise HTTPException(status_code=404, detail="Session not found")

    return {"message": "Session deactivate"}


@router.get("/{session_id}/projects", response_model=List[ProjectRead])
async def get_projects_by_session(session_id: int, service: SessionServiceDep):
    return await service.get_projects_by_session_id(session_id)
