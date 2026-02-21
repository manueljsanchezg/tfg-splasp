interface Block {
    owner: string
    name: string
    level: number
    structural_changes: number
    definition_changes: number
    definition_level: number
    feature_guarded_definition_changes: number
    ast_pipeline_definition_changes: number
}

export interface ProjectMetrics {
    projectLevel: number,
    duplicateScripts: number,
    duplicationRatio: number,
    blocks: Block[]
}