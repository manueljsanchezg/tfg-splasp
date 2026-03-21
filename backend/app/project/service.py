from typing import List, Optional
from xml.etree.ElementTree import Element

from sqlalchemy import Tuple

from app.core.base_service import BaseService
from app.core.splasp import analyze_project
from app.project.models import (
    AnalysisResult,
    BlockAnalysis,
    DetectedFeature,
    Project,
    ProjectVersion,
)
from app.project.repository import (
    AnalysisResultRepository,
    BlockAnalysisRepository,
    DetectedFeatureRepository,
    ProjectRepository,
    ProjectVersionRepository,
)
from app.project.schemas import Result


class ProjectService(BaseService[Project, ProjectRepository]):
    def __init__(self, project_repo: ProjectRepository):
        super().__init__(project_repo)

    async def find_project_by_device_id_and_session(
        self, device_id: str, session_id: int
    ) -> Optional[Project]:
        return await self.repository.find_by_device_id_and_session(device_id, session_id)

    async def find_project_by_id_with_versions(self, project_id: int) -> Optional[Project]:
        return await self.repository.find_by_id_with_versions(project_id)

    async def find_project_by_session(self, session_id: int) -> List[Project]:
        return await self.repository.find_by_session(session_id)

    async def persist_anonymous_project(self, filename: str, project_id: int, root: Element[str]):
        existing_project = await self.find_project_by_id_with_versions(project_id)

        if not existing_project:
            return None

        result = analyze_project(root)
        analysis = result.to_json_dict()

        existing_project = await self._build_analysis_project(
            existing_project, filename, Result(**analysis)
        )

        await self.save(existing_project)

        return analysis

    async def persist_batch_projects(
        self, session_id: int, projects_roots_list: List[Tuple[str, Element[str]]]
    ):
        projects_list = []
        for project_root in projects_roots_list:
            result = analyze_project(project_root[1])
            analysis = result.to_json_dict()
            new_project = Project(title=project_root[0], session_id=session_id)
            new_project_with_analysis = await self._build_analysis_project(
                new_project, project_root[0], Result(**analysis)
            )
            projects_list.append(new_project_with_analysis)
        await self.repository.save_batch(projects_list)

    async def _build_analysis_project(self, project: Project, filename: str, result: Result):
        new_blocks = [
            BlockAnalysis(
                owner=b.owner,
                name=b.name,
                level=b.level,
                structural_changes=b.structural_changes,
                definition_changes=b.definition_changes,
                definition_level=b.definition_level,
                feature_guarded_definition_changes=b.feature_guarded_definition_changes,
                ast_pipeline_definition_changes=b.ast_pipeline_definition_changes,
            )
            for b in result.blocks
        ]

        new_features = [
            DetectedFeature(
                name=feature,
                is_dead=feature in result.dead_features,
                scattering_count=len(script_list),
            )
            for feature, script_list in result.scattering_dict.items()
        ]

        new_analysis_result = AnalysisResult(
            project_level=result.project_level,
            total_scripts=result.total_scripts,
            duplicate_scripts=result.duplicate_scripts,
            total_combinations=result.total_combinations,
            max_tangling=max(result.tangling_dict.values()) if result.tangling_dict else 0,
            blocks_analysis=new_blocks,
            detected_features=new_features,
        )

        project.title = filename
        version_number = len(project.project_versions) + 1

        new_project_version = ProjectVersion(
            version_number=version_number, analysis_result=new_analysis_result
        )

        project.project_versions.append(new_project_version)
        return project


class ProjectVersionService(BaseService[ProjectVersion, ProjectVersionRepository]):
    def __init__(self, project_version_repo: ProjectVersionRepository):
        super().__init__(project_version_repo)

    async def get_versions_by_project(self, project_id: int) -> List[ProjectVersion]:
        return await self.repository.find_by_project_id(project_id)


class AnalysisResultService(BaseService[AnalysisResult, AnalysisResultRepository]):
    def __init__(self, analysis_result_repo: AnalysisResultRepository):
        super().__init__(analysis_result_repo)

    async def get_analysis_by_version(self, version_id: int) -> Optional[AnalysisResult]:
        return await self.repository.find_by_version_id(version_id)


class BlockAnalysisService(BaseService[BlockAnalysis, BlockAnalysisRepository]):
    def __init__(self, block_analysis_repo: BlockAnalysisRepository):
        super().__init__(block_analysis_repo)


class DetectedFeatureService(BaseService[DetectedFeature, DetectedFeatureRepository]):
    def __init__(self, detected_feature_repo: DetectedFeatureRepository):
        super().__init__(detected_feature_repo)
