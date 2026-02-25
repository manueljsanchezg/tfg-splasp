from typing import Annotated

from fastapi import Depends

from app.db import SessionDep
from app.project.repository import (
    ProjectRepository,
    ProjectVersionRepository,
    AnalysisResultRepository,
    BlockAnalysisRepository,
    DetectedFeatureRepository,
)
from app.project.service import (
    ProjectService,
    ProjectVersionService,
    AnalysisResultService,
    BlockAnalysisService,
    DetectedFeatureService,
)


# Repositories dependencies
def get_project_repository(session: SessionDep):
    return ProjectRepository(session)


def get_project_version_repository(session: SessionDep):
    return ProjectVersionRepository(session)


def get_analysis_result_repository(session: SessionDep):
    return AnalysisResultRepository(session)


def get_block_analysis_repository(session: SessionDep):
    return BlockAnalysisRepository(session)


def get_detected_feature_repository(session: SessionDep):
    return DetectedFeatureRepository(session)


# Services dependencies
def get_project_service(
    repository: ProjectRepository = Depends(get_project_repository),
):
    return ProjectService(repository)


def get_project_version_service(
    repository: ProjectVersionRepository = Depends(get_project_version_repository),
):
    return ProjectVersionService(repository)


def get_analysis_result_service(
    repository: AnalysisResultRepository = Depends(get_analysis_result_repository),
):
    return AnalysisResultService(repository)


def get_block_analysis_service(
    repository: BlockAnalysisRepository = Depends(get_block_analysis_repository),
):
    return BlockAnalysisService(repository)


def get_detected_feature_service(
    repository: DetectedFeatureRepository = Depends(get_detected_feature_repository),
):
    return DetectedFeatureService(repository)


# Dependencies
ProjectServiceDep = Annotated[ProjectService, Depends(get_project_service)]

ProjectVersionServiceDep = Annotated[
    ProjectVersionService, Depends(get_project_version_service)
]

AnalysisResultServiceDep = Annotated[
    AnalysisResultService, Depends(get_analysis_result_service)
]

BlockAnalysisServiceDep = Annotated[
    BlockAnalysisService, Depends(get_block_analysis_service)
]

DetectedFeatureServiceDep = Annotated[
    DetectedFeatureService, Depends(get_detected_feature_service)
]
