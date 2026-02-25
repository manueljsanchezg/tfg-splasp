from fastapi import APIRouter, HTTPException

from app.auth.dependencies import CurrentAdminDep, CurrentUserDep
from app.session.dependencies import SessionServiceDep
from app.session.schemas import CreateSession, JoinSession


router = APIRouter(prefix="/api/sessions", tags=["sessions"])

@router.post("/")
async def create_session(session: CreateSession, service: SessionServiceDep, user: CurrentAdminDep):
    return await service.create(session.title, session.start_date, session.end_date)


@router.post("/join")
async def join_session(session: JoinSession, service: SessionServiceDep, user: CurrentUserDep):
    joined = await service.join(session.code, user.id)

    if joined == None:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return joined


@router.patch("/{session_id}")
async def close_session(session_id: int, service: SessionServiceDep, user: CurrentAdminDep):
    closed = await service.close(session_id)

    if closed == None:
        raise HTTPException(status_code=404, detail="Session not found")

    return { "message": "Session deactivate"}