from pydantic import BaseModel


class BaseAuthReq(BaseModel):
    username: str
    password: str


class LoginReq(BaseAuthReq):
    pass


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
