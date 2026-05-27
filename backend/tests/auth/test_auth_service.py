from unittest.mock import AsyncMock, MagicMock

import pytest

from app.auth.service import AuthService
from app.auth.utils import hash_password, verify_jwt
from app.user.models import User


def _make_user(username: str = "testuser", password: str = "secret") -> User:
    user = MagicMock(spec=User)
    user.username = username
    user.password = hash_password(password)
    return user


class TestAuthService:
    def setup_method(self):
        self.user_service = AsyncMock()
        self.auth_service = AuthService(user_service=self.user_service)

    async def test_login_user_not_found_returns_none(self):
        self.user_service.get_by_username = AsyncMock(return_value=None)
        result = await self.auth_service.login_user("nouser", "password")
        assert result is None

    async def test_login_wrong_password_returns_none(self):
        user = _make_user(username="alice", password="correctpass")
        self.user_service.get_by_username = AsyncMock(return_value=user)
        result = await self.auth_service.login_user("alice", "wrongpass")
        assert result is None

    async def test_login_success_returns_jwt_string(self):
        plain_password = "mypassword"
        user = _make_user(username="alice", password=plain_password)
        self.user_service.get_by_username = AsyncMock(return_value=user)
        result = await self.auth_service.login_user("alice", plain_password)
        assert result is not None
        assert isinstance(result, str)
        assert len(result.split(".")) == 3

    async def test_login_token_contains_username(self):
        plain_password = "pass123"
        user = _make_user(username="bob", password=plain_password)
        self.user_service.get_by_username = AsyncMock(return_value=user)
        token = await self.auth_service.login_user("bob", plain_password)
        decoded = verify_jwt(token)
        assert decoded["sub"] == "bob"

    async def test_login_token_has_expiration(self):
        plain_password = "pass"
        user = _make_user(username="carol", password=plain_password)
        self.user_service.get_by_username = AsyncMock(return_value=user)
        token = await self.auth_service.login_user("carol", plain_password)
        decoded = verify_jwt(token)
        assert "exp" in decoded


