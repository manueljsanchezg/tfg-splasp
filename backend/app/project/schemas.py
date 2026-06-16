from datetime import datetime
from typing import List

from app.core.base_model_camel import BaseModelCamel


class ProjectRead(BaseModelCamel):
    id: int
    title: str
    created_at: datetime
    session_id: int | None = None
    device_id: str | None = None
    url: str | None = None


class ProjectVersionRead(BaseModelCamel):
    id: int
    version_number: int
    uploaded_at: datetime
    project_id: int


class ProjectWithLatestVersion(ProjectRead):
    project_versions: List[ProjectVersionRead]
