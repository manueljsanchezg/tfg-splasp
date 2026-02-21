from typing import Generic, TypeVar, List, Optional

T = TypeVar("T")
R = TypeVar("R")

class BaseService(Generic[T, R]):
    def __init__(self, repository: R):
        self.repository = repository

    async def get_all(self) -> List[T]:
        return await self.repository.get_all()

    async def get_by_id(self, id: int) -> Optional[T]:
        entity = await self.repository.get_by_id(id)
        return entity

    async def save(self, entity: T) -> T:
        return await self.repository.save(entity)

    async def delete(self, entity: T) -> int:
        return await self.repository.delete(entity)
    
    async def delete_by_id(self, id: int) -> int:
        return await self.repository.delete_by_id(id)