from pydantic import BaseModel
from app.core.base_model_camel import BaseModelCamel

class BaseAuthReq(BaseModel):
    username: str
    password: str


class LoginReq(BaseAuthReq):
    pass

class AuthResponse(BaseModelCamel):
    access_token: str
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
