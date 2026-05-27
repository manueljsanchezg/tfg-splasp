from unittest.mock import AsyncMock, MagicMock

from app.auth.service import AuthService
from app.auth.utils import hash_password, verify_jwt
from app.user.models import User


def _make_user(username: str = "test_user", password: str = "test_password") -> User:
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
        result = await self.auth_service.login_user("test_user_not_found", "test_password")
        assert result is None

    async def test_login_wrong_password_returns_none(self):
        user = _make_user(username="test_user_1", password="test_password_correct")
        self.user_service.get_by_username = AsyncMock(return_value=user)
        result = await self.auth_service.login_user("test_user_1", "test_password_wrong")
        assert result is None

    async def test_login_success_returns_jwt_string(self):
        password = "test_password_1"
        user = _make_user(username="test_user_1", password=password)
        self.user_service.get_by_username = AsyncMock(return_value=user)
        result = await self.auth_service.login_user("test_user_1", password)
        assert result is not None
        assert isinstance(result, str)
        assert len(result.split(".")) == 3

    async def test_login_token_contains_username(self):
        password = "test_password_2"
        user = _make_user(username="test_user_2", password=password)
        self.user_service.get_by_username = AsyncMock(return_value=user)
        token = await self.auth_service.login_user("test_user_2", password)
        decoded = verify_jwt(token)
        assert decoded["sub"] == "test_user_2"

    async def test_login_token_has_expiration(self):
        password = "test_password_3"
        user = _make_user(username="test_user_3", password=password)
        self.user_service.get_by_username = AsyncMock(return_value=user)
        token = await self.auth_service.login_user("test_user_3", password)
        decoded = verify_jwt(token)
        assert "exp" in decoded
