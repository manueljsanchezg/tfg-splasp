from datetime import datetime
import string
import secrets

from app.core.base_service import BaseService
from app.session.models import Session
from app.session.repository import SessionRepository


class ProjectService(BaseService[Session, SessionRepository]):
    def __init__(self, session_repo: SessionRepository):
        super().__init__(session_repo)

    async def create_session(self, name: str, start_date: datetime, end_date: datetime):
        new_session = Session(
            name=name,
            code=self._generate_code(8),
            start_date=start_date,
            end_date=end_date
        )

        return self.repository.save(new_session)
    
    def _generate_code(size: int):
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for i in range(size))