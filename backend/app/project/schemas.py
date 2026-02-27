from typing import List, Dict
from fastapi import UploadFile
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

