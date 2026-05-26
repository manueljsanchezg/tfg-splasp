from typing import List

from fastapi import APIRouter, HTTPException

from app.auth.dependencies import CurrentUserDep
from app.auth.utils import hash_password
from app.core.api_response import ApiResponse
from app.user.dependencies import UserServiceDep
from app.user.models import User
from app.user.schemas import CreateOrUpdateUser, ReadUser

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=ApiResponse[List[ReadUser]])
async def get_users(service: UserServiceDep, current_user: CurrentUserDep):
    users = await service.get_all()
    return ApiResponse(success=True, data=users)


@router.get("/{user_id}", response_model=ApiResponse[ReadUser])
async def get_user(user_id: int, service: UserServiceDep, current_user: CurrentUserDep):
    user = await service.get_by_id(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return ApiResponse(success=True, data=user)


@router.post("", response_model=ApiResponse[ReadUser])
async def create_user(
    user: CreateOrUpdateUser, service: UserServiceDep, current_user: CurrentUserDep
):
    existing_username = await service.get_by_username(user.username)

    if existing_username:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = hash_password(user.password)

    new_user = User(username=user.username, password=hashed_password)
    created_user = await service.save(new_user)
    return ApiResponse(success=True, data=created_user)


@router.put("/{user_id}", response_model=ApiResponse[ReadUser])
async def update_user(
    user_id: int, user: CreateOrUpdateUser, service: UserServiceDep, current_user: CurrentUserDep
):
    existing_user = await service.get_by_id(user_id)

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_user.username = user.username

    if user.password:
        hashed_password = hash_password(user.password)
        existing_user.password = hashed_password

    updated_user = await service.save(existing_user)
    return ApiResponse(success=True, data=updated_user)


@router.delete("/{user_id}", response_model=ApiResponse[dict[str, str]])
async def delete_user(user_id: int, service: UserServiceDep, current_user: CurrentUserDep):
    res = await service.delete_by_id(user_id)

    if res == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return ApiResponse(success=True, data={"message": "Deleted successfully"})
