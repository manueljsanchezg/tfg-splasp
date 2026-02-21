import jwt

from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()

secret_key = "clave_super_secreta"


def hash_password(password: str):
    return password_hash.hash(password)


def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


def generate_jwt(payload: dict):
    return jwt.encode(payload, secret_key, algorithm="HS256")


def verify_jwt(token: str):
    return jwt.decode(token, secret_key, algorithms=["HS256"])
