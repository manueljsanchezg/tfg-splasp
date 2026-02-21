from pydantic import BaseModel

class BaseUser(BaseModel):
    id: int | None = None
    username: str


class ReadUser(BaseUser):
    pass


class CreateOrUpdateUser(BaseUser):
    password: str
