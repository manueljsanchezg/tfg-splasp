from datetime import datetime

from app.core.base_model_camel import BaseModelCamel


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


class JoinAnonymousSession(BaseModelCamel):
    code: str
    device_id: str


class AnonymousTokenResponse(BaseModelCamel):
    access_token: str
    project_id: int
    session_id: int


class SessionAnalysisStats(BaseModelCamel):
    session_id: int
    session_name: str
    avg_project_level: float
    avg_total_scripts: float
    avg_duplicate_scripts: float
    avg_total_combinations: float
    avg_max_tangling: float
