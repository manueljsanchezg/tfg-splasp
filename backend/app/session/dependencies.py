from typing import Annotated

from fastapi import Depends

from app.db import SessionDep
from app.project.dependencies import ProjectServiceDep
from app.session.repository import SessionRepository
from app.session.service import SessionService
from app.user.dependencies import UserServiceDep


def get_session_repository(session: SessionDep):
    return SessionRepository(session)

def get_session_service( user_service: UserServiceDep, 
                        project_service: ProjectServiceDep,
                        session_repo: SessionRepository = Depends(get_session_repository)):
    return SessionService(session_repo, user_service, project_service)

SessionServiceDep = Annotated[SessionService, Depends(get_session_service)]
