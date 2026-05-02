from typing import List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.base_repository import BaseRepository
from app.project.models import AnalysisResult, Project, ProjectVersion
from app.session.models import Session


class SessionRepository(BaseRepository[Session]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Session)

    async def get_by_code(self, code: str) -> Optional[Session]:
        stmt = select(Session).where(Session.code == code)
        res = await self.session.execute(stmt)
        return res.scalar_one_or_none()

    async def get_all_with_analyses_by_sessions_ids(self, sessions_ids: List[int]) -> List[tuple]:
        stmt = (
            select(
                Session.id.label("session_id"),
                Session.name.label("session_name"),
                func.avg(AnalysisResult.project_level).label("avg_project_level"),
                func.avg(AnalysisResult.total_scripts).label("avg_total_scripts"),
                func.avg(AnalysisResult.duplicate_scripts).label("avg_duplicate_scripts"),
                func.avg(AnalysisResult.total_combinations).label("avg_total_combinations"),
                func.avg(AnalysisResult.max_tangling).label("avg_max_tangling"),
            )
            .join(Project, Project.session_id == Session.id)
            .join(ProjectVersion, ProjectVersion.project_id == Project.id)
            .join(AnalysisResult, AnalysisResult.project_versions_id == ProjectVersion.id)
            .where(Session.id.in_(sessions_ids))
            .group_by(Session.id)
        )

        result = await self.session.execute(stmt)
        return result.all()
