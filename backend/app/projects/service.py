from app.core.base_service import BaseService

from app.projects.models import (
    Project,
    ProjectVersion,
    AnalysisResult,
    BlockAnalysis,
    DetectedFeature,
)
from app.projects.repository import (
    ProjectRepository,
    ProjectVersionRepository,
    AnalysisResultRepository,
    BlockAnalysisRepository,
    DetectedFeatureRepository,
)
from app.projects.schemas import Result
from app.user.models import User

class ProjectService(BaseService[Project, ProjectRepository]):
    def __init__(self, project_repo: ProjectRepository):
        super().__init__(project_repo)

    async def persist_project(self, filename: str, user: User, result: Result):

        print("analizando")

        new_blocks = [
            BlockAnalysis(
                owner=b.owner,
                name=b.name,
                level=b.level,
                structural_changes=b.structural_changes,
                definition_changes=b.definition_changes,
                definition_level=b.definition_level,
                feature_guarded_definition_changes=b.feature_guarded_definition_changes,
                ast_pipeline_definition_changes=b.ast_pipeline_definition_changes
            ) for b in result.blocks
        ]

        new_features = [
            DetectedFeature(
                name=feature,
                is_dead=feature in result.dead_features,
                scattering_count=len(script_list)
            ) for feature, script_list in result.scattering_dict.items()
        ]

        new_analysis_result = AnalysisResult(
            project_level=result.project_level,
            total_scripts=result.total_scripts,
            duplicate_scripts=result.duplicate_scripts,
            total_combinations=result.total_combinations,
            max_tangling= max(result.tangling_dict.values()) if result.tangling_dict else 0,
            blocks_analysis=new_blocks,
            detected_features=new_features
        )

        new_project_version = ProjectVersion(
            version_number = 1,
            analysis_result=new_analysis_result
        )

        new_project = Project(
            title=filename,
            user_id=user.id,
            project_versions=[new_project_version]
        )

        return await self.save(new_project)


class ProjectVersionService(BaseService[ProjectVersion, ProjectVersionRepository]):
    def __init__(self, project_version_repo: ProjectVersionRepository):
        super().__init__(project_version_repo)


class AnalysisResultService(BaseService[AnalysisResult, AnalysisResultRepository]):
    def __init__(self, analysis_result_repo: AnalysisResultRepository):
        super().__init__(analysis_result_repo)


class BlockAnalysisService(BaseService[BlockAnalysis, BlockAnalysisRepository]):
    def __init__(self, block_analysis_repo: BlockAnalysisRepository):
        super().__init__(block_analysis_repo)


class DetectedFeatureService(BaseService[DetectedFeature, DetectedFeatureRepository]):
    def __init__(self, detected_feature_repo: DetectedFeatureRepository):
        super().__init__(detected_feature_repo)
