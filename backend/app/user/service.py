from app.core.base_service import BaseService

from app.user.models import User
from app.user.repository import UserRepository

class UserService(BaseService[User, UserRepository]):
    def __init__(self, user_repo: UserRepository):
        super().__init__(user_repo)
        
    async def get_by_username(self, username: str) -> User:
        return await self.repository.get_by_username(username)
