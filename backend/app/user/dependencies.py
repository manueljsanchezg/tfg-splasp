from typing import Annotated

from fastapi import Depends

from app.db import SessionDep
from app.user.repository import UserRepository
from app.user.service import UserService

def get_user_repository(session: SessionDep):
    return UserRepository(session)

def get_user_service(user_repository: UserRepository = Depends(get_user_repository)):
    return UserService(user_repository)

UserServiceDep = Annotated[UserService, Depends(get_user_service)]
