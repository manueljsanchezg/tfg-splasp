from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.base_repository import BaseRepository
from app.project.models import (
    Project,
    ProjectVersion,
    AnalysisResult,
    BlockAnalysis,
    DetectedFeature,
)


class ProjectRepository(BaseRepository[Project]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Project)

    async def find_by_user_and_session(self, user_id: int, session_id: int) -> Optional[Project]:
        stmt = (select(Project)
                .where(Project.user_id == user_id, 
                       Project.session_id == session_id)
                       .options(selectinload(Project.project_versions)))
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

class ProjectVersionRepository(BaseRepository[ProjectVersion]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, ProjectVersion )


class AnalysisResultRepository(BaseRepository[AnalysisResult]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, AnalysisResult)

    
class BlockAnalysisRepository(BaseRepository[BlockAnalysis]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, BlockAnalysis)


class DetectedFeatureRepository(BaseRepository[DetectedFeature]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, DetectedFeature)
