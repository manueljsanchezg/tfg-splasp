from datetime import datetime
from pydantic import BaseModel


class CreateSession(BaseModel):
    title: str
    start_date: datetime
    end_date: datetime

class JoinSession(BaseModel):
    code: str