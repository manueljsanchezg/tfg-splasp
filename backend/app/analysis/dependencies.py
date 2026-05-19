from typing import Annotated

from fastapi import Depends

from app.analysis.repository import (
    AnalysisResultRepository,
    BlockAnalysisRepository,
    DetectedFeatureRepository,
)
from app.analysis.service import (
    AnalysisResultService,
    AnalysisService,
    BlockAnalysisService,
    DetectedFeatureService,
)
from app.db import SessionDep
from app.project.dependencies import get_project_service
from app.project.service import ProjectService


def get_analysis_result_repository(session: SessionDep):
    return AnalysisResultRepository(session)


def get_block_analysis_repository(session: SessionDep):
    return BlockAnalysisRepository(session)


def get_detected_feature_repository(session: SessionDep):
    return DetectedFeatureRepository(session)


def get_analysis_service(
    analysis_repo: AnalysisResultRepository = Depends(get_analysis_result_repository),
    project_service: ProjectService = Depends(get_project_service),
):
    return AnalysisService(analysis_repo, project_service)


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


AnalysisServiceDep = Annotated[AnalysisService, Depends(get_analysis_service)]
AnalysisResultServiceDep = Annotated[AnalysisResultService, Depends(get_analysis_result_service)]
BlockAnalysisServiceDep = Annotated[BlockAnalysisService, Depends(get_block_analysis_service)]
DetectedFeatureServiceDep = Annotated[DetectedFeatureService, Depends(get_detected_feature_service)]
