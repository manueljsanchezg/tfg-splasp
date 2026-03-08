from datetime import datetime
from typing import Any, Dict, List

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


class Result(BaseModelCamel):
    project_level: int
    blocks: List[Block]
    total_scripts: int
    duplicate_scripts: int
    total_combinations: int
    tangling_dict: Dict[int, int]
    scattering_dict: Dict[str, List[int]]
    dead_features: List[str]


class AnalysisResultSchema(BaseModelCamel):
    project_level: int
    blocks: List[Block]
    unknown_events: List[Dict[str, Any]]
    total_scripts: int
    duplicate_scripts: int
    duplication_ratio: float
    total_combinations: int
    tangling_dict: Dict[int, int]
    scattering_dict: Dict[str, List[int]]
    dead_features: List[str]


class ProjectRead(BaseModelCamel):
    id: int
    title: str
    created_at: datetime
    session_id: int
    user_id: int


class ProjectVersionRead(BaseModelCamel):
    id: int
    version_number: int
    uploaded_at: datetime
    project_id: int


class BlockAnalysisRead(BaseModelCamel):
    id: int
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


class AnalysisResultRead(BaseModelCamel):
    id: int
    project_level: int
    total_scripts: int
    duplicate_scripts: int
    total_combinations: int
    max_tangling: int
    blocks_analysis: List[BlockAnalysisRead]
    detected_features: List[DetectedFeatureRead]
