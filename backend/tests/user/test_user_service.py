from unittest.mock import AsyncMock, MagicMock

import pytest

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
        user = _make_user(uid=1, username="alice")
        self.repo.get_by_username = AsyncMock(return_value=user)
        result = await self.service.get_by_username("alice")
        assert result is user
        assert result.username == "alice"

    async def test_non_existing_user_returns_none(self):
        self.repo.get_by_username = AsyncMock(return_value=None)
        result = await self.service.get_by_username("ghost")
        assert result is None

    async def test_calls_repo_with_correct_username(self):
        self.repo.get_by_username = AsyncMock(return_value=None)
        await self.service.get_by_username("bob")
        self.repo.get_by_username.assert_called_once_with("bob")

    async def test_returns_correct_user_object(self):
        user = _make_user(uid=42, username="carol")
        self.repo.get_by_username = AsyncMock(return_value=user)
        result = await self.service.get_by_username("carol")
        assert result.id == 42
        assert result.username == "carol"
