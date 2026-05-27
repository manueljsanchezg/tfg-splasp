from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.auth.dependencies import AuthServiceDep
from app.auth.schemas import AuthResponse, LoginReq, Token
from app.core.api_response import ApiResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])



@router.post("/login", response_model=ApiResponse[AuthResponse])
async def login(login_req: LoginReq, auth_service: AuthServiceDep):
    auth_result = await auth_service.login_user(login_req.username, login_req.password)
    if auth_result is None:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = auth_result

    return ApiResponse(success=True, data=AuthResponse(access_token=token))


@router.post("/access-token", response_model=Token)
async def get_acess_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], auth_service: AuthServiceDep
):
    auth_result = await auth_service.login_user(form_data.username, form_data.password)
    if auth_result is None:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = auth_result

    return Token(access_token=token)
