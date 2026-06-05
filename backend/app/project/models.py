from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

if TYPE_CHECKING:
    from app.analysis.models import AnalysisResult
    from app.session.models import Session


class Project(Base):
    __tablename__ = "projects"
    __table_args__ = (
        UniqueConstraint("device_id", "session_id", name="uix_device_session_project"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    device_id: Mapped[Optional[str]] = mapped_column(nullable=True)

    session_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("sessions.id"), nullable=True, index=True
    )

    session: Mapped[Optional["Session"]] = relationship(back_populates="projects")
    project_versions: Mapped[List["ProjectVersion"]] = relationship(back_populates="project")


class ProjectVersion(Base):
    __tablename__ = "project_versions"

    id: Mapped[int] = mapped_column(primary_key=True)
    version_number: Mapped[int] = mapped_column()
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    project: Mapped["Project"] = relationship(back_populates="project_versions")

    analysis_result: Mapped["AnalysisResult"] = relationship(back_populates="project_version")
