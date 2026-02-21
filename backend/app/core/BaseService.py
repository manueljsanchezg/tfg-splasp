from typing import Generic, TypeVar, List, Optional

T = TypeVar("T")

class BaseService(Generic[T]):
    def __init__(self, repository):
        self.repository = repository

    async def get_all(self) -> List[T]:
        return await self.repository.get_all()

    async def get_by_id(self, id: int) -> Optional[T]:
        entity = await self.repository.get_by_id(id)

        if not entity:
            raise ValueError(f"Entity with id {id} not found")

        return entity

    async def create(self, entity: T) -> T:
        return await self.repository.save(entity)

    async def delete(self, id: int) -> int:
        entity = await self.get_by_id(id)
        return await self.repository.delete_user(entity)