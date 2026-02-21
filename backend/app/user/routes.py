from typing import List

from fastapi import APIRouter, HTTPException

from app.utils import hash_password

from app.user.models import User
from app.user.dependencies import UserServiceDep
from app.user.schemas import ReadUser, CreateOrUpdateUser

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/", response_model=List[ReadUser])
async def get_users(service: UserServiceDep):
    return await service.get_all()


@router.get("/{user_id}", response_model=ReadUser)
async def get_user(user_id: int, service: UserServiceDep):
    user = await service.get_by_id(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


@router.post("/", response_model=ReadUser)
async def create_user(user: CreateOrUpdateUser, service: UserServiceDep):
    existing_username = await service.get_by_username(user.username)

    if existing_username:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_password = hash_password(user.password)

    new_user = User(username=user.username, password=hashed_password)
    return await service.save(new_user)


@router.put("/{user_id}")
async def update_user(user_id: int, user: CreateOrUpdateUser, service: UserServiceDep):
    existing_user = await service.get_by_id(user_id)

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    existing_user.username = user.username

    if user.password:
        hashed_password = hash_password(user.password)
        existing_user.password = hashed_password
    
    return await service.save(existing_user)


@router.delete("/{user_id}")
async def delete_user(user_id: int, service: UserServiceDep):
    res = await service.delete_by_id(user_id)

    if res == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return { "message": "Deleted successfully" }