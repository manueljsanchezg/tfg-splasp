from typing import Optional
from datetime import datetime
import string
import secrets

from app.core.base_service import BaseService
from app.project.models import Project
from app.project.service import ProjectService
from app.session.models import Session
from app.session.repository import SessionRepository
from app.user.service import UserService


class SessionService(BaseService[Session, SessionRepository]):
    def __init__(self, session_repo: SessionRepository, user_service: UserService, project_service: ProjectService):
        super().__init__(session_repo)
        self.user_service = user_service
        self.project_sevice = project_service

    async def create(self, name: str, start_date: datetime, end_date: datetime):
        new_session = Session(
            name=name,
            code=self._generate_code(8),
            start_date=start_date,
            end_date=end_date
        )

        return await self.repository.save(new_session)
    
    async def join(self, code: str, user_id: int):
        session = await self.repository.get_by_code(code)

        if not session or not session.is_active:
            return None
        
        user = await self.user_service.get_by_id(user_id)
        if not user:
            return None
            
        existing_project = await self.project_sevice.find_project_by_user_and_session(user.id, session.id)

        if existing_project:
            return session

        print("Creando un nuevo proyecto") 
        new_project = Project(
            title="dump",
            user_id = user.id,
            session_id = session.id
        )

        await self.project_sevice.save(new_project)

        return session
    
    async def close(self, session_id: int):
        session = await self.repository.get_by_id(session_id)

        if not session:
            return None

        session.is_active = False

        await self.repository.save(session)

        return True
    
    def _generate_code(self, size: int):
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for i in range(size))