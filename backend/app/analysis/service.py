import asyncio
import csv
from io import StringIO
from typing import List, Optional, Tuple
from xml.etree.ElementTree import Element

from app.analysis.models import AnalysisResult, BlockAnalysis, DetectedFeature
from app.analysis.repository import (
    AnalysisResultRepository,
    BlockAnalysisRepository,
    DetectedFeatureRepository,
)
from app.analysis.schemas import SavedAnalysisResultSchema
from app.core.base_service import BaseService
from app.core.splasp import AnalysisResult as SplaspAnalysisResult
from app.core.splasp import BlockKey, BlockStats, analyze_project
from app.project.models import Project, ProjectVersion
from app.project.service import ProjectService


class AnalysisService:
    def __init__(self, analysis_repo: AnalysisResultRepository, project_service: ProjectService):
        self.analysis_repo = analysis_repo
        self.project_service = project_service

    async def analyze_and_persist(self, filename: str, root: Element) -> dict:
        new_project = Project(title=filename)
        result = await asyncio.to_thread(analyze_project, root)

        new_project_with_analysis = await self._build_analysis_project(
            new_project, filename, result
        )

        await self.project_service.save(new_project_with_analysis)
        return result.to_json_dict()

    async def analyze_and_persist_anonymous(
        self, filename: str, project_id: int, root: Element
    ) -> Optional[dict]:
        existing_project = await self.project_service.find_project_by_id_with_versions(project_id)

        if not existing_project:
            return None

        result = await asyncio.to_thread(analyze_project, root)

        existing_project = await self._build_analysis_project(existing_project, filename, result)

        await self.project_service.save(existing_project)

        return result.to_json_dict()

    async def analyze_batch(self, session_id: int, projects_roots_list: List[Tuple[str, Element]]):
        projects_list = []
        for project_root in projects_roots_list:
            result = await asyncio.to_thread(analyze_project, project_root[1])
            new_project = Project(title=project_root[0], session_id=session_id)

            new_project_with_analysis = await self._build_analysis_project(
                new_project, project_root[0], result
            )
            projects_list.append(new_project_with_analysis)
        await self.project_service.save_batch(projects_list)

    async def generate_csv_by_session(self, session_id: int):
        projects = await self.project_service.find_projects_by_session(session_id)

        if len(projects) == 0:
            return False

        version_ids = []
        for project in projects:
            if project.project_versions:
                last_version = max(project.project_versions, key=lambda p: p.version_number)
                version_ids.append(last_version.id)

        if not version_ids:
            return False

        analysis_results = await self.analysis_repo.find_by_versions_ids(version_ids)

        return await asyncio.to_thread(self._build_csv_content, analysis_results)

    def _build_csv_content(self, analysis_results) -> str:
        projects_csv = StringIO()
        writer = csv.writer(projects_csv)
        writer.writerow(
            [
                "project_level",
                "total_scripts",
                "duplicate_scripts",
                "total_combinations",
                "max_tangling",
                "max_scattering",
                "avg_tangling",
                "avg_scattering",
                "total_modified_blocks",
                "total_definition_changes",
                "total_feature_guarded_changes",
                "total_ast_pipeline_changes",
                "detected_features",
                "dead_features",
            ]
        )

        for analysis in analysis_results:
            writer.writerow(
                [
                    analysis.project_level,
                    analysis.total_scripts,
                    analysis.duplicate_scripts,
                    analysis.total_combinations,
                    analysis.max_tangling,
                    analysis.max_scattering,
                    analysis.avg_tangling,
                    analysis.avg_scattering,
                    analysis.total_modified_blocks,
                    analysis.total_definition_changes,
                    analysis.total_feature_guarded_changes,
                    analysis.total_ast_pipeline_changes,
                    len(analysis.detected_features),
                    sum(1 for f in analysis.detected_features if f.is_dead),
                ]
            )

        return projects_csv.getvalue()

    async def get_session_stats(self, session_id: int) -> Optional[dict]:
        projects = await self.project_service.find_projects_by_session(session_id)
        version_ids = []
        for p in projects:
            if p.project_versions:
                last_version = max(p.project_versions, key=lambda v: v.version_number)
                version_ids.append(last_version.id)
        if not version_ids:
            return None

        analyses = await self.analysis_repo.find_by_versions_ids(version_ids)
        if not analyses:
            return None

        return {
            "avg_project_level": sum(a.project_level for a in analyses) / len(analyses),
            "avg_total_scripts": sum(a.total_scripts for a in analyses) / len(analyses),
            "avg_duplicate_scripts": sum(a.duplicate_scripts for a in analyses) / len(analyses),
            "avg_total_combinations": sum(a.total_combinations for a in analyses) / len(analyses),
            "avg_max_tangling": sum(a.max_tangling for a in analyses) / len(analyses),
            "avg_max_scattering": sum(a.max_scattering for a in analyses) / len(analyses),
            "avg_avg_tangling": sum(a.avg_tangling for a in analyses) / len(analyses),
            "avg_avg_scattering": sum(a.avg_scattering for a in analyses) / len(analyses),
            "avg_total_modified_blocks": sum(a.total_modified_blocks for a in analyses)
            / len(analyses),
            "avg_total_definition_changes": sum(a.total_definition_changes for a in analyses)
            / len(analyses),
            "avg_total_feature_guarded_changes": sum(
                a.total_feature_guarded_changes for a in analyses
            )
            / len(analyses),
            "avg_total_ast_pipeline_changes": sum(a.total_ast_pipeline_changes for a in analyses)
            / len(analyses),
        }

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
            max_scattering=max(len(s) for s in result.scattering_dict.values())
            if result.scattering_dict
            else 0,
            avg_tangling=result.avg_tangling,
            avg_scattering=result.avg_scattering,
            total_modified_blocks=result.total_modified_blocks,
            total_definition_changes=result.total_definition_changes,
            total_feature_guarded_changes=result.total_feature_guarded_changes,
            total_ast_pipeline_changes=result.total_ast_pipeline_changes,
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
            avg_tangling=analysis.avg_tangling,
            avg_scattering=analysis.avg_scattering,
            total_modified_blocks=analysis.total_modified_blocks,
            total_definition_changes=analysis.total_definition_changes,
            total_feature_guarded_changes=analysis.total_feature_guarded_changes,
            total_ast_pipeline_changes=analysis.total_ast_pipeline_changes,
        )
        feedback = splasp_result.to_json_dict()["feedback"]

        return feedback


class BlockAnalysisService(BaseService[BlockAnalysis, BlockAnalysisRepository]):
    def __init__(self, block_analysis_repo: BlockAnalysisRepository):
        super().__init__(block_analysis_repo)


class DetectedFeatureService(BaseService[DetectedFeature, DetectedFeatureRepository]):
    def __init__(self, detected_feature_repo: DetectedFeatureRepository):
        super().__init__(detected_feature_repo)
