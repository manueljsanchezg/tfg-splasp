from typing import List, Optional
from datetime import datetime
from sqlalchemy import ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)

    project_versions: Mapped[List["ProjectVersion"]] = relationship(
        back_populates="project"
    )


class ProjectVersion(Base):
    __tablename__ = "project_versions"

    id: Mapped[int] = mapped_column(primary_key=True)
    version_number: Mapped[int] = mapped_column()
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    project: Mapped["Project"] = relationship(back_populates="project_versions")

    analysis_result: Mapped["AnalysisResult"] = relationship(
        back_populates="project_version"
    )


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_level: Mapped[int] = mapped_column()
    total_scripts: Mapped[int] = mapped_column()
    duplicate_scripts: Mapped[int] = mapped_column()
    total_combinations: Mapped[int] = mapped_column()
    max_tangling: Mapped[int] = mapped_column()

    project_versions_id: Mapped[int] = mapped_column(
        ForeignKey("project_versions.id"), unique=True
    )
    project_version: Mapped["ProjectVersion"] = relationship(
        back_populates="analysis_result", single_parent=True
    )

    blocks_analysis: Mapped[List["BlockAnalysis"]] = relationship(
        back_populates="analysis_result"
    )
    detected_features: Mapped[List["DetectedFeature"]] = relationship(
        back_populates="analysis_result"
    )


class BlockAnalysis(Base):
    __tablename__ = "blocks_analysis"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner: Mapped[str] = mapped_column()
    name: Mapped[str] = mapped_column()
    level: Mapped[int] = mapped_column()
    structural_changes: Mapped[int] = mapped_column()
    definition_changes: Mapped[int] = mapped_column()
    definition_level: Mapped[int] = mapped_column()
    feature_guarded_definition_changes: Mapped[int] = mapped_column()
    ast_pipeline_definition_changes: Mapped[int] = mapped_column()

    analysis_result_id: Mapped[int] = mapped_column(ForeignKey("analysis_results.id"))
    analysis_result: Mapped["AnalysisResult"] = relationship(
        back_populates="blocks_analysis"
    )


class DetectedFeature(Base):
    __tablename__ = "detected_features"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column()
    is_dead: Mapped[bool] = mapped_column()
    scattering_count: Mapped[int] = mapped_column()

    analysis_result_id: Mapped[int] = mapped_column(ForeignKey("analysis_results.id"))
    analysis_result: Mapped["AnalysisResult"] = relationship(
        back_populates="detected_features"
    )