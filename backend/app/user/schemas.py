from pydantic import BaseModel

class BaseUser(BaseModel):
    id: int | None = None
    username: str


class ReadUser(BaseUser):
    pass
    role: str


class CreateOrUpdateUser(BaseUser):
    password: str
