import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Tuple

from app.core.base_service import BaseService
from app.project.models import Project
from app.project.service import ProjectService
from app.session.models import Session
from app.session.repository import SessionRepository
from app.session.schemas import SessionAnalysisStats
from app.user.service import UserService
from app.utils import generate_jwt


class SessionService(BaseService[Session, SessionRepository]):
    def __init__(
        self,
        session_repo: SessionRepository,
        user_service: UserService,
        project_service: ProjectService,
    ):
        super().__init__(session_repo)
        self.user_service = user_service
        self.project_sevice = project_service

    async def create(self, name: str, start_date: datetime, end_date: datetime):
        start_date = start_date.astimezone(timezone.utc)
        end_date = end_date.astimezone(timezone.utc)

        new_session = Session(
            name=name, code=self._generate_code(8), start_date=start_date, end_date=end_date
        )

        return await self.repository.save(new_session)

    async def join_anonymous(self, code: str, device_id: str) -> Optional[Tuple[str, int, int]]:
        session = await self.repository.get_by_code(code)

        if not session or not session.is_active or session.end_date < datetime.now(timezone.utc):
            return None

        existing_project = await self.project_sevice.find_project_by_device_id_and_session(
            device_id, session.id
        )

        if existing_project:
            token = self._generate_anonymous_token(existing_project.id, session.id, device_id)
            return token, existing_project.id, session.id

        new_project = Project(title="dump", device_id=device_id, session_id=session.id)
        saved_project = await self.project_sevice.save(new_project)

        token = self._generate_anonymous_token(saved_project.id, session.id, device_id)
        return token, saved_project.id, session.id

    async def close(self, session_id: int) -> Optional[bool]:
        session = await self.repository.get_by_id(session_id)
        if not session:
            return None

        session.is_active = False
        await self.repository.save(session)
        return True

    async def get_projects_by_session_id(self, session_id: int):
        return await self.project_sevice.find_projects_by_session(session_id)

    async def get_csv_project_by_session_id(self, session_id: int):
        return await self.project_sevice.generate_projects_csv_by_session(session_id)

    async def get_analyses_stats_by_sessions_ids(
        self, sessions_ids: List[int]
    ) -> List[SessionAnalysisStats]:
        rows = await self.repository.get_all_with_analyses_by_sessions_ids(sessions_ids)
        return [SessionAnalysisStats(**row._mapping) for row in rows]

    def _generate_code(self, size: int) -> str:
        alphabet = string.ascii_letters + string.digits
        return "".join(secrets.choice(alphabet) for i in range(size))

    def _generate_anonymous_token(self, project_id: int, session_id: int, device_id: str) -> str:
        payload = {
            "type": "anonymous",
            "project_id": project_id,
            "session_id": session_id,
            "device_id": device_id,
            "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        }
        return generate_jwt(payload)
