from sqlalchemy.ext.asyncio import AsyncSession

from app.core.base_repository import BaseRepository
from app.projects.models import (
    Project,
    ProjectVersion,
    AnalysisResult,
    BlockAnalysis,
    DetectedFeature,
)


class ProjectRepository(BaseRepository[Project]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Project)

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
