from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.base_repository import BaseRepository
from app.session.models import Session


class SessionRepository(BaseRepository[Session]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Session)

    async def get_by_code(self, code: str) -> Optional[Session]:
        stmt = select(Session).where(Session.code == code)
        res = await self.session.execute(stmt)
        return res.scalar_one_or_none()
