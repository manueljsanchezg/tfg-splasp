from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.auth.dependencies import AuthServiceDep
from app.auth.schemas import LoginReq, Token

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=Token)
async def login(login_req: LoginReq, auth_service: AuthServiceDep):
    token = await auth_service.register_user(login_req.username, login_req.password)
    if token is None:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    return Token(access_token=token)

@router.post("/login", response_model=Token)
async def login(login_req: LoginReq, auth_service: AuthServiceDep):
    token = await auth_service.login_user(login_req.username, login_req.password)
    if token is None:
        raise HTTPException(status_code=400, detail="Invalid credentials")
        
    return Token(access_token=token)


@router.post("/access-token", response_model=Token)
async def get_acess_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], auth_service: AuthServiceDep):
    token = await auth_service.login_user(form_data.username, form_data.password)
    if token is None:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    return Token(access_token=token)
