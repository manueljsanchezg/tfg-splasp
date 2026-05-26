import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Tuple

from app.analysis.service import AnalysisService
from app.auth.utils import generate_jwt
from app.core.base_service import BaseService
from app.project.service import ProjectService
from app.session.models import Session
from app.session.repository import SessionRepository
from app.session.schemas import SessionAnalysisStats
from app.user.service import UserService


class SessionService(BaseService[Session, SessionRepository]):
    def __init__(
        self,
        session_repo: SessionRepository,
        user_service: UserService,
        project_service: ProjectService,
        analysis_service: AnalysisService,
    ):
        super().__init__(session_repo)
        self.user_service = user_service
        self.project_service = project_service
        self.analysis_service = analysis_service

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

        existing_project_id = await self.project_service.get_project_id_by_device_id_and_session(
            device_id, session.id
        )

        if existing_project_id:
            token = self._generate_anonymous_token(existing_project_id, session.id, device_id)
            return token, existing_project_id, session.id

        new_project_id = await self.project_service.create_dump_project(device_id, session.id)

        token = self._generate_anonymous_token(new_project_id, session.id, device_id)
        return token, new_project_id, session.id

    async def close(self, session_id: int) -> Optional[bool]:
        session = await self.repository.get_by_id(session_id)
        if not session:
            return None

        session.is_active = False
        await self.repository.save(session)
        return True

    async def get_projects_by_session_id(self, session_id: int):
        return await self.project_service.find_projects_by_session(session_id)

    async def get_csv_project_by_session_id(self, session_id: int):
        return await self.analysis_service.generate_csv_by_session(session_id)

    async def get_analyses_stats_by_sessions_ids(
        self, sessions_ids: List[int]
    ) -> List[SessionAnalysisStats]:
        result = []
        for session_id in sessions_ids:
            session = await self.repository.get_by_id(session_id)
            if not session:
                continue
            stats = await self.analysis_service.get_session_stats(session_id)
            if stats:
                stats["session_name"] = session.name
                stats["session_id"] = session.id
                result.append(SessionAnalysisStats(**stats))
        return result

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
