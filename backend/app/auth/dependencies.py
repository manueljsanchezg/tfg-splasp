from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt import ExpiredSignatureError, InvalidTokenError

from app.user.models import Role, User
from app.utils import verify_jwt
from app.auth.service import AuthService
from app.user.dependencies import UserServiceDep


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/access-token")

TokenDep = Annotated[str, Depends(oauth2_scheme)]


async def get_auth_service(user_service: UserServiceDep):
    return AuthService(user_service)


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


async def get_current_user(token: TokenDep, user_service: UserServiceDep):
    credentials_exception = HTTPException(
        status_code=401, detail="Could not validate credentials"
    )

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


def require_role(role: Role):
    async def dependency(user: CurrentUserDep):
        if user.role != role:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user

    return dependency

AdminDep = Annotated[User, Depends(require_role(Role.ADMIN))]
