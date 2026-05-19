from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.analysis.models import (
    AnalysisResult,
    BlockAnalysis,
    DetectedFeature,
)
from app.core.base_repository import BaseRepository


class AnalysisResultRepository(BaseRepository[AnalysisResult]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, AnalysisResult)

    async def find_by_version_id(self, version_id: int) -> Optional[AnalysisResult]:
        stmt = (
            select(AnalysisResult)
            .where(AnalysisResult.project_versions_id == version_id)
            .options(
                selectinload(AnalysisResult.blocks_analysis),
                selectinload(AnalysisResult.detected_features),
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def find_by_versions_ids(self, versions_ids: List[int]) -> List[AnalysisResult]:
        stmt = (
            select(AnalysisResult)
            .where(AnalysisResult.project_versions_id.in_(versions_ids))
            .options(
                selectinload(AnalysisResult.blocks_analysis),
                selectinload(AnalysisResult.detected_features),
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()


class BlockAnalysisRepository(BaseRepository[BlockAnalysis]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, BlockAnalysis)


class DetectedFeatureRepository(BaseRepository[DetectedFeature]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, DetectedFeature)
