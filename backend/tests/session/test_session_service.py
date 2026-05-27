import string
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.auth.utils import verify_jwt
from app.session.models import Session
from app.session.service import SessionService


def _make_session(
    sid: int = 1,
    is_active: bool = True,
    end_delta: timedelta = timedelta(days=1),
) -> MagicMock:
    s = MagicMock(spec=Session)
    s.id = sid
    s.name = f"Session {sid}"
    s.code = "ABCD1234"
    s.is_active = is_active
    s.end_date = datetime.now(timezone.utc) + end_delta
    return s


def _make_service(session=None, existing_project_id=None, new_project_id=99):
    session_repo = AsyncMock()
    user_service = AsyncMock()
    project_service = AsyncMock()
    analysis_service = AsyncMock()
    session_repo.get_by_code = AsyncMock(return_value=session)
    session_repo.get_by_id = AsyncMock(return_value=session)
    project_service.get_project_id_by_device_id_and_session = AsyncMock(
        return_value=existing_project_id
    )
    project_service.create_dump_project = AsyncMock(return_value=new_project_id)
    service = SessionService(
        session_repo=session_repo,
        user_service=user_service,
        project_service=project_service,
        analysis_service=analysis_service,
    )
    return service, session_repo, project_service, analysis_service


class TestSessionService:
    def setup_method(self):
        self.service, self.session_repo, self.project_service, _ = _make_service()

    def test_generate_code_correct_length(self):
        code = self.service._generate_code(8)
        assert len(code) == 8

    def test_generate_code_different_sizes(self):
        for size in [4, 6, 10, 16]:
            assert len(self.service._generate_code(size)) == size

    def test_generate_code_valid_charset(self):
        valid_chars = set(string.ascii_letters + string.digits)
        for _ in range(20):
            assert all(c in valid_chars for c in self.service._generate_code(8))

    def test_generate_code_is_random(self):
        codes = {self.service._generate_code(8) for _ in range(10)}
        assert len(codes) > 1

    def test_anonymous_token_is_valid_jwt(self):
        token = self.service._generate_anonymous_token(project_id=1, session_id=2, device_id="dev-abc")
        assert len(token.split(".")) == 3

    def test_anonymous_token_contains_type_anonymous(self):
        token = self.service._generate_anonymous_token(1, 2, "dev")
        assert verify_jwt(token)["type"] == "anonymous"

    def test_anonymous_token_contains_correct_ids(self):
        token = self.service._generate_anonymous_token(project_id=42, session_id=7, device_id="device-xyz")
        decoded = verify_jwt(token)
        assert decoded["project_id"] == 42
        assert decoded["session_id"] == 7
        assert decoded["device_id"] == "device-xyz"

    def test_anonymous_token_has_expiration(self):
        token = self.service._generate_anonymous_token(1, 1, "d")
        assert "exp" in verify_jwt(token)

    async def test_join_session_not_found_returns_none(self):
        service, *_ = _make_service(session=None)
        result = await service.join_anonymous(code="NOTEXIST", device_id="dev")
        assert result is None

    async def test_join_inactive_session_returns_none(self):
        service, *_ = _make_service(session=_make_session(is_active=False))
        result = await service.join_anonymous(code="ABCD1234", device_id="dev")
        assert result is None

    async def test_join_expired_session_returns_none(self):
        service, *_ = _make_service(session=_make_session(end_delta=timedelta(days=-1)))
        result = await service.join_anonymous(code="ABCD1234", device_id="dev")
        assert result is None

    async def test_join_existing_project_returns_token_and_ids(self):
        service, _, project_service, _ = _make_service(session=_make_session(sid=5), existing_project_id=10)
        token, project_id, session_id = await service.join_anonymous(code="ABCD1234", device_id="dev-1")
        assert project_id == 10
        assert session_id == 5
        assert isinstance(token, str)
        project_service.create_dump_project.assert_not_called()

    async def test_join_no_existing_project_creates_new(self):
        service, _, project_service, _ = _make_service(
            session=_make_session(sid=3), existing_project_id=None, new_project_id=77
        )
        token, project_id, session_id = await service.join_anonymous(code="ABCD1234", device_id="dev-new")
        assert project_id == 77
        assert session_id == 3
        project_service.create_dump_project.assert_called_once()

    async def test_join_token_has_correct_payload(self):
        service, *_ = _make_service(session=_make_session(sid=8), existing_project_id=20)
        token, _, _ = await service.join_anonymous(code="ABCD1234", device_id="dev-x")
        decoded = verify_jwt(token)
        assert decoded["project_id"] == 20
        assert decoded["session_id"] == 8
        assert decoded["type"] == "anonymous"

    async def test_close_session_not_found_returns_none(self):
        service, repo, *_ = _make_service(session=None)
        repo.get_by_id = AsyncMock(return_value=None)
        result = await service.close(session_id=999)
        assert result is None

    async def test_close_success_returns_true(self):
        session = _make_session(sid=1)
        service, repo, *_ = _make_service(session=session)
        repo.get_by_id = AsyncMock(return_value=session)
        repo.save = AsyncMock(return_value=session)
        result = await service.close(session_id=1)
        assert result is True

    async def test_close_marks_session_inactive(self):
        session = _make_session(sid=1, is_active=True)
        service, repo, *_ = _make_service(session=session)
        repo.get_by_id = AsyncMock(return_value=session)
        repo.save = AsyncMock()
        await service.close(session_id=1)
        assert session.is_active is False

    async def test_close_persists_session(self):
        session = _make_session(sid=2)
        service, repo, *_ = _make_service(session=session)
        repo.get_by_id = AsyncMock(return_value=session)
        repo.save = AsyncMock(return_value=session)
        await service.close(session_id=2)
        repo.save.assert_called_once_with(session)
