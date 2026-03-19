from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt import ExpiredSignatureError, InvalidTokenError

from app.auth.service import AuthService
from app.user.dependencies import UserServiceDep
from app.user.models import User
from app.utils import verify_jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/access-token")

TokenDep = Annotated[str, Depends(oauth2_scheme)]


async def get_auth_service(user_service: UserServiceDep):
    return AuthService(user_service)


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


async def get_current_user(token: TokenDep, user_service: UserServiceDep):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")

    try:
        payload = verify_jwt(token)
        username = payload.get("sub")

        if username is None:
            raise credentials_exception

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")

    except InvalidTokenError:
        raise credentials_exception

    user = await user_service.get_by_username(username)

    if user is None:
        raise credentials_exception

    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]

@dataclass
class AnonymousContext:
    project_id: int
    session_id: int
    device_id: str

async def get_current_anonymous(token: TokenDep) -> AnonymousContext:
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")

    try:
        payload = verify_jwt(token)

        if payload.get("type") != "anonymous":
            raise credentials_exception

        project_id = payload.get("project_id")
        session_id = payload.get("session_id")
        device_id = payload.get("device_id")

        if not all([project_id, session_id, device_id]):
            raise credentials_exception

        return AnonymousContext(
            project_id=project_id, session_id=session_id, device_id=device_id
        )

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")

    except InvalidTokenError:
        raise credentials_exception


CurrentAnonymousDep = Annotated[AnonymousContext, Depends(get_current_anonymous)]
