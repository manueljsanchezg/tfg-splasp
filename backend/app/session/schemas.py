from datetime import datetime
from pydantic import BaseModel

class ReadSession(BaseModel):
    id: int
    title: str
    start_date: datetime
    end_date: datetime
    is_active: bool

class CreateSession(BaseModel):
    title: str
    start_date: datetime
    end_date: datetime

class JoinSession(BaseModel):
    code: str