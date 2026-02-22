from typing import List, TypeVar, Generic, Type, Optional

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar("T")

class BaseRepository(Generic[T]):
    def __init__(self, session: AsyncSession, model: Type[T]):
        self.session = session
        self.model = model

    async def get_all(self) -> List[T]:
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
    
    async def delete(self, entity: T) -> int:
        result = await self.session.delete(entity)
        await self.session.commit()
        return result.rowcount
    
    async def delete_by_id(self, id: int):
        stmt = delete(self.model).where(self.model.id == id)
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount