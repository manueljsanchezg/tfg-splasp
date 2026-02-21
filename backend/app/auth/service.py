from datetime import datetime, timezone, timedelta

from app.utils import verify_password, generate_jwt
from app.user.service import UserService


class AuthService:
    def __init__(self, user_service: UserService):
        self.user_service = user_service

    async def login_user(self, username: str, password: str):
        existing_user = await self.user_service.get_by_username(username)

        if not existing_user:
            return None
        if not verify_password(password, existing_user.password):
            return None
        
        expires_delta = timedelta(minutes=30)
        payload = {
            "sub": existing_user.username,
            "exp": datetime.now(timezone.utc) + expires_delta,
        }
        token = generate_jwt(payload)

        return token
