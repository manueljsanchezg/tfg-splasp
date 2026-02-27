from datetime import datetime
from app.core.base_model_camel import BaseModelCamel
from pydantic import BaseModel

class ReadSession(BaseModelCamel):
    id: int
    name: str
    code: str
    start_date: datetime
    end_date: datetime
    is_active: bool

class CreateSession(BaseModelCamel):
    name: str
    start_date: datetime
    end_date: datetime

class JoinSession(BaseModel):
    code: str