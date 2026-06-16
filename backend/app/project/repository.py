from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.base_repository import BaseRepository
from app.project.models import Project, ProjectVersion


class ProjectRepository(BaseRepository[Project]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Project)

    async def find_by_device_id_and_session(
        self, device_id: str, session_id: int
    ) -> Optional[Project]:
        stmt = (
            select(Project)
            .where(Project.device_id == device_id, Project.session_id == session_id)
            .options(selectinload(Project.project_versions))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def find_by_id_with_versions(self, project_id: int) -> Optional[Project]:
        stmt = (
            select(Project)
            .where(Project.id == project_id)
            .options(selectinload(Project.project_versions))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def find_paginated(
        self, limit: Optional[int] = None, offset: Optional[int] = None
    ) -> List[Project]:
        stmt = select(Project).where(Project.project_versions.any()).order_by(Project.id.desc())
        if limit is not None:
            stmt = stmt.limit(limit)
        if offset is not None:
            stmt = stmt.offset(offset)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def find_by_session(self, session_id: int) -> List[Project]:
        stmt = (
            select(Project)
            .where(Project.session_id == session_id)
            .options(selectinload(Project.project_versions))
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def save_batch(self, projects_list: List[Project]) -> List[Project]:
        self.session.add_all(projects_list)
        await self.session.commit()
        return projects_list


class ProjectVersionRepository(BaseRepository[ProjectVersion]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, ProjectVersion)

    async def find_by_project_id(self, project_id: int) -> List[ProjectVersion]:
        stmt = select(ProjectVersion).where(ProjectVersion.project_id == project_id)
        result = await self.session.execute(stmt)
        return result.scalars().all()
