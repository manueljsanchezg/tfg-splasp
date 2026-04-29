from datetime import datetime
from typing import Dict, List, Optional

from app.core.base_model_camel import BaseModelCamel


class Block(BaseModelCamel):
    owner: str
    name: str
    level: int
    structural_changes: int
    definition_changes: int
    definition_level: int
    feature_guarded_definition_changes: int
    ast_pipeline_definition_changes: int


class ProjectRead(BaseModelCamel):
    id: int
    title: str
    created_at: datetime
    session_id: int
    device_id: str | None = None


class ProjectWithLatestVersion(ProjectRead):
    project_versions: List[ProjectVersionRead]


class ProjectVersionRead(BaseModelCamel):
    id: int
    version_number: int
    uploaded_at: datetime
    project_id: int


class BlockAnalysisRead(BaseModelCamel):
    id: Optional[int] = None
    owner: str
    name: str
    level: int
    structural_changes: int
    definition_changes: int
    definition_level: int
    feature_guarded_definition_changes: int
    ast_pipeline_definition_changes: int


class DetectedFeatureRead(BaseModelCamel):
    id: int
    name: str
    is_dead: bool
    scattering_count: int


class ProjectWithAnalysis(ProjectRead):
    project_version: List[ProjectVersionRead]


class Result(BaseModelCamel):
    project_level: int
    blocks_analysis: List[BlockAnalysisRead]
    total_scripts: int
    duplicate_scripts: int
    total_combinations: int
    tangling_dict: Dict[int, int]
    scattering_dict: Dict[str, List[int]]
    dead_features: List[str]


class AnalysisFeedbackMetrics(BaseModelCamel):
    project_level: int
    total_scripts: int
    duplicate_scripts: int
    duplication_ratio: float
    total_combinations: int
    total_modified_blocks: int
    total_structural_changes: int
    total_definition_changes: int
    feature_guarded_definition_changes: int
    ast_pipeline_definition_changes: int
    features_used_count: int
    dead_features_count: int
    max_tangling: int
    avg_tangling: float
    max_scattering: int
    avg_scattering: float


class AnalysisFeedback(BaseModelCamel):
    label: str
    summary: str
    strengths: List[str]
    improvements: List[str]
    hints: List[str]
    alerts: List[str]
    metrics: AnalysisFeedbackMetrics


class AnalysisResultSchema(BaseModelCamel):
    is_saved: bool = False
    feedback: AnalysisFeedback
    project_level: int
    blocks_analysis: List[BlockAnalysisRead]
    total_scripts: int
    duplicate_scripts: int
    duplication_ratio: float
    total_combinations: int
    tangling_dict: Dict[int, int]
    scattering_dict: Dict[str, List[int]]
    dead_features: List[str]


class SavedAnalysisResultSchema(BaseModelCamel):
    id: int
    is_saved: bool = True
    feedback: Optional[AnalysisFeedback]
    project_level: int
    total_scripts: int
    duplicate_scripts: int
    duplication_ratio: float
    total_combinations: int
    max_tangling: int
    blocks_analysis: List[BlockAnalysisRead]
    detected_features: List[DetectedFeatureRead]
