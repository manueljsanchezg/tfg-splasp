import jwt
from pwdlib import PasswordHash

from app.env import SECRET_KEY

password_hash = PasswordHash.recommended()


def hash_password(password: str):
    return password_hash.hash(password)


def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


def generate_jwt(payload: dict):
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def verify_jwt(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
