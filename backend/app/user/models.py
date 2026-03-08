from enum import Enum
from typing import TYPE_CHECKING, List

from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

if TYPE_CHECKING:
    from app.project.models import Project

class Role(str, Enum):
    ADMIN = "admin"
    USER = "user"

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column()
    password: Mapped[str] = mapped_column()
    role: Mapped[Role] = mapped_column(SAEnum(Role), default=Role.USER)

    projects: Mapped[List["Project"]] = relationship(back_populates="user")