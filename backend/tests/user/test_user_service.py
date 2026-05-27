from unittest.mock import AsyncMock, MagicMock

from app.user.models import User
from app.user.service import UserService


def _make_user(uid: int = 1, username: str = "testuser") -> MagicMock:
    user = MagicMock(spec=User)
    user.id = uid
    user.username = username
    user.password = "hashed_password"
    return user


class TestUserService:
    def setup_method(self):
        self.repo = AsyncMock()
        self.service = UserService(user_repo=self.repo)

    async def test_existing_user_returns_user(self):
        user = _make_user(uid=1, username="test_user_1")
        self.repo.get_by_username = AsyncMock(return_value=user)
        result = await self.service.get_by_username("test_user_1")
        assert result is user
        assert result.username == "test_user_1"

    async def test_non_existing_user_returns_none(self):
        self.repo.get_by_username = AsyncMock(return_value=None)
        result = await self.service.get_by_username("test_user_not_found")
        assert result is None

    async def test_calls_repo_with_correct_username(self):
        self.repo.get_by_username = AsyncMock(return_value=None)
        await self.service.get_by_username("test_user_2")
        self.repo.get_by_username.assert_called_once_with("test_user_2")

    async def test_returns_correct_user_object(self):
        user = _make_user(uid=42, username="test_user_3")
        self.repo.get_by_username = AsyncMock(return_value=user)
        result = await self.service.get_by_username("test_user_3")
        assert result.id == 42
        assert result.username == "test_user_3"
