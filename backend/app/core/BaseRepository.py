from typing import List, TypeVar, Generic, Type, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar("T")

class BaseRepository(Generic[T]):
    def __init__(self, session: AsyncSession, model: Type[T]):
        self.session = session
        self.model = model

    async def get_all(self) -> List[object]:
        stmt = select(self.model)
        res = await self.session.execute(stmt)
        return res.scalars().all()
    
    async def get_by_id(self, id: int) -> Optional[T]:
        stmt = select(self.model).where(self.model.id == id)
        res = await self.session.execute(stmt)
        return res.scalar_one_or_none()
    
    async def save(self, entity: T) -> T:
        self.session.add(entity)
        await self.session.commit()
        await self.session.refresh(entity)
        return entity
    
    async def delete_user(self, entity: T) -> int:
        await self.session.delete(entity)
        await self.session.commit()
        return entity.id