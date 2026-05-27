from datetime import datetime, timedelta, timezone

import pytest

from app.auth.utils import generate_jwt, hash_password, verify_jwt, verify_password


class TestAuthUtils:
    def test_hash_is_not_plain_text(self):
        plain = "secretpassword"
        hashed = hash_password(plain)
        assert hashed != plain

    def test_hash_is_string(self):
        hashed = hash_password("mypassword")
        assert isinstance(hashed, str)

    def test_different_calls_produce_different_hashes(self):
        h1 = hash_password("samepassword")
        h2 = hash_password("samepassword")
        assert h1 != h2

    def test_correct_password_returns_true(self):
        plain = "correctpassword"
        hashed = hash_password(plain)
        assert verify_password(plain, hashed) is True

    def test_wrong_password_returns_false(self):
        hashed = hash_password("correctpassword")
        assert verify_password("wrongpassword", hashed) is False

    def test_empty_password_against_hash_returns_false(self):
        hashed = hash_password("nonempty")
        assert verify_password("", hashed) is False

    def test_jwt_returns_string(self):
        payload = {"sub": "testuser", "exp": datetime.now(timezone.utc) + timedelta(minutes=30)}
        token = generate_jwt(payload)
        assert isinstance(token, str)

    def test_jwt_has_three_parts(self):
        payload = {"sub": "user", "exp": datetime.now(timezone.utc) + timedelta(minutes=10)}
        token = generate_jwt(payload)
        assert len(token.split(".")) == 3

    def test_jwt_encode_decode_roundtrip(self):
        payload = {"sub": "alice", "exp": datetime.now(timezone.utc) + timedelta(minutes=60)}
        token = generate_jwt(payload)
        decoded = verify_jwt(token)
        assert decoded["sub"] == "alice"

    def test_jwt_anonymous_token_payload(self):
        payload = {
            "type": "anonymous",
            "project_id": 42,
            "session_id": 7,
            "device_id": "device-abc",
            "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        }
        token = generate_jwt(payload)
        decoded = verify_jwt(token)
        assert decoded["type"] == "anonymous"
        assert decoded["project_id"] == 42
        assert decoded["session_id"] == 7
        assert decoded["device_id"] == "device-abc"

    def test_expired_token_raises_exception(self):
        import jwt
        payload = {"sub": "user", "exp": datetime.now(timezone.utc) - timedelta(seconds=1)}
        token = generate_jwt(payload)
        with pytest.raises(jwt.ExpiredSignatureError):
            verify_jwt(token)

    def test_invalid_token_raises_exception(self):
        import jwt
        with pytest.raises(jwt.PyJWTError):
            verify_jwt("not.a.valid.token")
