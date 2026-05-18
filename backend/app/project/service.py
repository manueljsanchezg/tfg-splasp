import csv
from io import StringIO
from typing import List, Optional, Tuple
from xml.etree.ElementTree import Element

from app.core.base_service import BaseService
from app.core.splasp import AnalysisResult as SplaspAnalysisResult
from app.core.splasp import BlockKey, BlockStats, analyze_project
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
from app.project.schemas import SavedAnalysisResultSchema


class ProjectService(BaseService[Project, ProjectRepository]):
    def __init__(self, project_repo: ProjectRepository):
        super().__init__(project_repo)

    async def find_project_by_device_id_and_session(
        self, device_id: str, session_id: int
    ) -> Optional[Project]:
        return await self.repository.find_by_device_id_and_session(device_id, session_id)

    async def find_project_by_id_with_versions(self, project_id: int) -> Optional[Project]:
        return await self.repository.find_by_id_with_versions(project_id)

    async def find_projects_with_versions(self) -> List[Project]:
        projects = await self.repository.find_with_versions()

        for project in projects:
            if project.project_versions:
                latest_version = max(
                    project.project_versions, key=lambda version: version.version_number
                )
                project.project_versions = [latest_version]

        return projects

    async def find_projects_by_session(self, session_id: int) -> List[Project]:
        return await self.repository.find_by_session(session_id)

    async def persist_project(self, filename: str, root: Element[str]):
        new_project = Project(title=filename)

        result = analyze_project(root)

        new_project_with_analysis = await self._build_analysis_project(
            new_project, filename, result
        )

        await self.save(new_project_with_analysis)

        return result.to_json_dict()

    async def persist_anonymous_project(self, filename: str, project_id: int, root: Element[str]):
        existing_project = await self.find_project_by_id_with_versions(project_id)

        if not existing_project:
            return None

        result = analyze_project(root)

        existing_project = await self._build_analysis_project(
            existing_project, filename, result
        )

        await self.save(existing_project)

        return result.to_json_dict()

    async def persist_batch_projects(
        self, session_id: int, projects_roots_list: List[Tuple[str, Element[str]]]
    ):
        projects_list = []
        for project_root in projects_roots_list:
            result = analyze_project(project_root[1])
            new_project = Project(title=project_root[0], session_id=session_id)
            new_project_with_analysis = await self._build_analysis_project(
                new_project, project_root[0], result
            )
            projects_list.append(new_project_with_analysis)
        await self.repository.save_batch(projects_list)

    async def generate_projects_csv_by_session(self, session_id: int):
        projects = await self.repository.find_by_session_id_with_analysis(session_id)

        if len(projects) == 0:
            return False

        projects_csv = StringIO()
        writer = csv.writer(projects_csv)
        writer.writerow(
            [
                "project_level",
                "total_scripts",
                "duplicate_scripts",
                "total_combinations",
                "max_tangling",
                "detected_features",
                "dead_features",
            ]
        )

        for project in projects:
            last_analysis = max(
                project.project_versions, key=lambda p: p.version_number
            ).analysis_result
            writer.writerow(
                [
                    last_analysis.project_level,
                    last_analysis.total_scripts,
                    last_analysis.duplicate_scripts,
                    last_analysis.total_combinations,
                    last_analysis.max_tangling,
                    len(last_analysis.detected_features),
                    sum(1 for f in last_analysis.detected_features if f.is_dead),
                ]
            )

        return projects_csv.getvalue()

    async def _build_analysis_project(
        self, project: Project, filename: str, result: SplaspAnalysisResult
    ):
        new_blocks = [
            BlockAnalysis(
                owner=key.owner,
                name=key.name,
                level=stats.level,
                structural_changes=stats.structural_changes,
                definition_changes=stats.definition_changes,
                definition_level=stats.definition_level,
                feature_guarded_definition_changes=stats.feature_guarded_definition_changes,
                ast_pipeline_definition_changes=stats.ast_pipeline_definition_changes,
            )
            for key, stats in result.blocks.items()
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

    async def get_versions_with_analysis_by_project_ids(
        self, project_ids: List[int]
    ) -> List[ProjectVersion]:
        return await self.repository.find_by_project_ids_with_analysis(project_ids)


class AnalysisResultService(BaseService[AnalysisResult, AnalysisResultRepository]):
    def __init__(self, analysis_result_repo: AnalysisResultRepository):
        super().__init__(analysis_result_repo)

    async def get_analysis_by_version(self, version_id: int) -> Optional[dict]:
        analysis = await self.repository.find_by_version_id(version_id)

        if analysis is None:
            return None

        duplication_ratio = self._calculate_duplication_ratio(
            analysis.total_scripts, analysis.duplicate_scripts
        )

        analysis.duplication_ratio = duplication_ratio
        analysis.feedback = self._build_feedback_from_saved_analysis(analysis)

        return analysis

    async def find_analysis_by_versions_ids(
        self, versions_ids: List[int]
    ) -> List[SavedAnalysisResultSchema]:
        analysis_list = await self.repository.find_by_versions_ids(versions_ids)

        for analysis in analysis_list:
            duplication_ratio = self._calculate_duplication_ratio(
                analysis.total_scripts, analysis.duplicate_scripts
            )
            analysis.duplication_ratio = duplication_ratio
            analysis.feedback = self._build_feedback_from_saved_analysis(analysis)

        return analysis_list

    def _calculate_duplication_ratio(self, total_scripts: int, duplicate_scripts: int) -> float:
        return (duplicate_scripts / total_scripts) * 100 if total_scripts > 0 else 0.0

    def _build_feedback_from_saved_analysis(self, analysis: AnalysisResult) -> dict:
        blocks = {
            BlockKey(owner=block.owner, name=block.name): BlockStats(
                level=block.level,
                structural_changes=block.structural_changes,
                definition_changes=block.definition_changes,
                definition_level=block.definition_level,
                feature_guarded_definition_changes=block.feature_guarded_definition_changes,
                ast_pipeline_definition_changes=block.ast_pipeline_definition_changes,
            )
            for block in analysis.blocks_analysis
        }

        scattering_dict = {
            feature.name: set(range(feature.scattering_count))
            for feature in analysis.detected_features
            if feature.scattering_count > 0
        }
        dead_features = {feature.name for feature in analysis.detected_features if feature.is_dead}

        duplication_ratio = self._calculate_duplication_ratio(
            analysis.total_scripts, analysis.duplicate_scripts
        )

        splasp_result = SplaspAnalysisResult(
            project_level=analysis.project_level,
            blocks=blocks,
            total_scripts=analysis.total_scripts,
            duplicate_scripts=analysis.duplicate_scripts,
            duplication_ratio=duplication_ratio,
            total_combinations=analysis.total_combinations,
            tangling_dict={},
            scattering_dict=scattering_dict,
            dead_features=dead_features,
        )
        feedback = splasp_result.to_json_dict()["feedback"]

        metrics = feedback.get("metrics", {})
        metrics["max_tangling"] = analysis.max_tangling
        feedback["metrics"] = metrics

        return feedback


class BlockAnalysisService(BaseService[BlockAnalysis, BlockAnalysisRepository]):
    def __init__(self, block_analysis_repo: BlockAnalysisRepository):
        super().__init__(block_analysis_repo)


class DetectedFeatureService(BaseService[DetectedFeature, DetectedFeatureRepository]):
    def __init__(self, detected_feature_repo: DetectedFeatureRepository):
        super().__init__(detected_feature_repo)
