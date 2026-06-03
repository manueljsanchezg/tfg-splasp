from typing import Dict, List, Optional

from app.core.base_model_camel import BaseModelCamel


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
    id: Optional[int] = None
    name: str
    is_dead: bool
    scattering_count: int




class AnalysisFeedback(BaseModelCamel):
    label: str
    summary: str
    strengths: List[str]
    improvements: List[str]
    hints: List[str]
    alerts: List[str]


class AnalysisResultBase(BaseModelCamel):
    feedback: AnalysisFeedback
    project_level: int
    blocks_analysis: List[BlockAnalysisRead]
    total_scripts: int
    duplicate_scripts: int
    duplication_ratio: float
    total_combinations: int
    max_tangling: int
    avg_tangling: float
    avg_scattering: float
    total_modified_blocks: int
    total_definition_changes: int
    total_feature_guarded_changes: int
    total_ast_pipeline_changes: int
    detected_features: List[DetectedFeatureRead]


class AnalysisResultSchema(AnalysisResultBase):
    is_saved: bool = False
    tangling_dict: Dict[int, int]
    scattering_dict: Dict[str, List[int]]
    dead_features: List[str]


class SavedAnalysisResultSchema(AnalysisResultBase):
    id: int
    is_saved: bool = True
    feedback: Optional[AnalysisFeedback] = None
