from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.analysis.models import AnalysisResult, BlockAnalysis, DetectedFeature
from app.analysis.service import AnalysisResultService, AnalysisService
from app.project.models import Project, ProjectVersion


def _make_block_analysis(**kwargs) -> BlockAnalysis:
    block = MagicMock(spec=BlockAnalysis)
    block.owner = kwargs.get("owner", "Stage")
    block.name = kwargs.get("name", "myBlock")
    block.level = kwargs.get("level", 2)
    block.structural_changes = kwargs.get("structural_changes", 0)
    block.definition_changes = kwargs.get("definition_changes", 1)
    block.definition_level = kwargs.get("definition_level", 2)
    block.feature_guarded_definition_changes = kwargs.get("feature_guarded_definition_changes", 0)
    block.ast_pipeline_definition_changes = kwargs.get("ast_pipeline_definition_changes", 0)
    return block


def _make_detected_feature(name: str, is_dead: bool = False, scattering_count: int = 2):
    feat = MagicMock(spec=DetectedFeature)
    feat.name = name
    feat.is_dead = is_dead
    feat.scattering_count = scattering_count
    return feat


def _make_analysis_result(
    project_level: int = 1,
    total_scripts: int = 10,
    duplicate_scripts: int = 2,
    total_combinations: int = 4,
    max_tangling: int = 3,
    avg_tangling: float = 0.0,
    avg_scattering: float = 0.0,
    total_modified_blocks: int = 0,
    total_definition_changes: int = 0,
    total_feature_guarded_changes: int = 0,
    total_ast_pipeline_changes: int = 0,
    blocks_analysis=None,
    detected_features=None,
) -> MagicMock:
    ar = MagicMock(spec=AnalysisResult)
    ar.project_level = project_level
    ar.total_scripts = total_scripts
    ar.duplicate_scripts = duplicate_scripts
    ar.total_combinations = total_combinations
    ar.max_tangling = max_tangling
    ar.avg_tangling = avg_tangling
    ar.avg_scattering = avg_scattering
    ar.total_modified_blocks = total_modified_blocks
    ar.total_definition_changes = total_definition_changes
    ar.total_feature_guarded_changes = total_feature_guarded_changes
    ar.total_ast_pipeline_changes = total_ast_pipeline_changes
    ar.blocks_analysis = blocks_analysis or []
    ar.detected_features = detected_features or []
    return ar


class TestAnalysisService:
    def setup_method(self):
        self.analysis_result_repo = AsyncMock()
        self.analysis_result_service = AnalysisResultService(self.analysis_result_repo)
        self.analysis_repo = AsyncMock()
        self.project_service = AsyncMock()
        self.analysis_service = AnalysisService(
            analysis_repo=self.analysis_repo,
            project_service=self.project_service,
        )

    def test_zero_total_scripts_returns_zero(self):
        result = self.analysis_result_service._calculate_duplication_ratio(0, 0)
        assert result == 0.0

    def test_no_duplicates_returns_zero(self):
        result = self.analysis_result_service._calculate_duplication_ratio(10, 0)
        assert result == 0.0

    def test_all_duplicated_returns_100(self):
        result = self.analysis_result_service._calculate_duplication_ratio(5, 5)
        assert result == 100.0

    def test_partial_duplicates_correct_ratio(self):
        result = self.analysis_result_service._calculate_duplication_ratio(10, 2)
        assert result == pytest.approx(20.0)

    def test_result_is_float(self):
        result = self.analysis_result_service._calculate_duplication_ratio(4, 1)
        assert isinstance(result, float)

    async def test_returns_none_when_not_found(self):
        self.analysis_result_repo.find_by_version_id = AsyncMock(return_value=None)
        result = await self.analysis_result_service.get_analysis_by_version(version_id=99)
        assert result is None

    async def test_returns_analysis_with_duplication_ratio(self):
        analysis = _make_analysis_result(total_scripts=10, duplicate_scripts=2)
        self.analysis_result_repo.find_by_version_id = AsyncMock(return_value=analysis)
        with patch.object(
            self.analysis_result_service, "_build_feedback_from_saved_analysis", return_value={}
        ):
            result = await self.analysis_result_service.get_analysis_by_version(version_id=1)
        assert result is analysis
        assert result.duplication_ratio == pytest.approx(20.0)

    async def test_no_projects_returns_false(self):
        self.project_service.find_projects_by_session = AsyncMock(return_value=[])
        result = await self.analysis_service.generate_csv_by_session(session_id=1)
        assert result is False

    async def test_projects_without_versions_returns_false(self):
        project = MagicMock(spec=Project)
        project.project_versions = []
        self.project_service.find_projects_by_session = AsyncMock(return_value=[project])
        result = await self.analysis_service.generate_csv_by_session(session_id=1)
        assert result is False

    async def test_generates_csv_with_header_and_rows(self):
        version = MagicMock(spec=ProjectVersion)
        version.id = 5
        version.version_number = 1
        project = MagicMock(spec=Project)
        project.project_versions = [version]
        analysis = _make_analysis_result(
            project_level=2,
            total_scripts=8,
            duplicate_scripts=1,
            total_combinations=3,
            max_tangling=2,
            detected_features=[
                _make_detected_feature("feat1", is_dead=False),
                _make_detected_feature("feat2", is_dead=True),
            ],
        )
        self.project_service.find_projects_by_session = AsyncMock(return_value=[project])
        self.analysis_repo.find_by_versions_ids = AsyncMock(return_value=[analysis])
        result = await self.analysis_service.generate_csv_by_session(session_id=1)
        assert isinstance(result, str)
        lines = result.strip().splitlines()
        assert len(lines) == 2
        assert "project_level" in lines[0]
        assert "total_scripts" in lines[0]
        assert "detected_features" in lines[0]
        assert "dead_features" in lines[0]
        assert "2" in lines[1]
        assert "8" in lines[1]
        assert "1" in lines[1]

    async def test_csv_counts_dead_features_correctly(self):
        version = MagicMock(spec=ProjectVersion)
        version.id = 1
        version.version_number = 1
        project = MagicMock(spec=Project)
        project.project_versions = [version]
        features = [
            _make_detected_feature("f1", is_dead=True),
            _make_detected_feature("f2", is_dead=True),
            _make_detected_feature("f3", is_dead=False),
        ]
        analysis = _make_analysis_result(detected_features=features)
        self.project_service.find_projects_by_session = AsyncMock(return_value=[project])
        self.analysis_repo.find_by_versions_ids = AsyncMock(return_value=[analysis])
        csv_str = await self.analysis_service.generate_csv_by_session(session_id=1)
        lines = csv_str.strip().splitlines()
        row_values = lines[1].split(",")
        assert row_values[11].strip() == "3"
        assert row_values[12].strip() == "2"

    async def test_no_versions_returns_none(self):
        project = MagicMock(spec=Project)
        project.project_versions = []
        self.project_service.find_projects_by_session = AsyncMock(return_value=[project])
        result = await self.analysis_service.get_session_stats(session_id=1)
        assert result is None

    async def test_no_analyses_returns_none(self):
        version = MagicMock(spec=ProjectVersion)
        version.id = 1
        version.version_number = 1
        project = MagicMock(spec=Project)
        project.project_versions = [version]
        self.project_service.find_projects_by_session = AsyncMock(return_value=[project])
        self.analysis_repo.find_by_versions_ids = AsyncMock(return_value=[])
        result = await self.analysis_service.get_session_stats(session_id=1)
        assert result is None

    async def test_calculates_averages_correctly(self):
        version1 = MagicMock(spec=ProjectVersion)
        version1.id = 1
        version1.version_number = 1
        version2 = MagicMock(spec=ProjectVersion)
        version2.id = 2
        version2.version_number = 1
        proj1 = MagicMock(spec=Project)
        proj1.project_versions = [version1]
        proj2 = MagicMock(spec=Project)
        proj2.project_versions = [version2]
        a1 = _make_analysis_result(
            project_level=1,
            total_scripts=10,
            duplicate_scripts=2,
            total_combinations=4,
            max_tangling=3,
        )
        a2 = _make_analysis_result(
            project_level=3,
            total_scripts=20,
            duplicate_scripts=4,
            total_combinations=8,
            max_tangling=5,
        )
        self.project_service.find_projects_by_session = AsyncMock(return_value=[proj1, proj2])
        self.analysis_repo.find_by_versions_ids = AsyncMock(return_value=[a1, a2])
        result = await self.analysis_service.get_session_stats(session_id=1)
        assert result is not None
        assert result["avg_project_level"] == pytest.approx(2.0)
        assert result["avg_total_scripts"] == pytest.approx(15.0)
        assert result["avg_duplicate_scripts"] == pytest.approx(3.0)
        assert result["avg_total_combinations"] == pytest.approx(6.0)
        assert result["avg_max_tangling"] == pytest.approx(4.0)

    async def test_uses_latest_version_per_project(self):
        old_version = MagicMock(spec=ProjectVersion)
        old_version.id = 1
        old_version.version_number = 1
        new_version = MagicMock(spec=ProjectVersion)
        new_version.id = 2
        new_version.version_number = 2
        project = MagicMock(spec=Project)
        project.project_versions = [old_version, new_version]
        analysis = _make_analysis_result(
            project_level=2,
            total_scripts=5,
            duplicate_scripts=0,
            total_combinations=2,
            max_tangling=1,
        )
        self.project_service.find_projects_by_session = AsyncMock(return_value=[project])
        self.analysis_repo.find_by_versions_ids = AsyncMock(return_value=[analysis])
        await self.analysis_service.get_session_stats(session_id=1)
        call_args = self.analysis_repo.find_by_versions_ids.call_args[0][0]
        assert 2 in call_args
        assert 1 not in call_args
