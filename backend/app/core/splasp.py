#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""SPLASP! - Software Product Line Analyzer for Snap! Projects

Snap! (XML) project analyzer to detect *software variability* implemented
through metaprogramming.

CLI usage:
    python3 splasp.py project.xml

Library usage:
    from splasp import analyze_file
    result = analyze_file("project.xml")

"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Iterator, List, Optional, Sequence, Set, Tuple

import xml.etree.ElementTree as ET

# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class BlockKey:
    """Identifies a block by owner (sprite/stage) and logical name."""

    owner: str
    name: str

    def as_str(self) -> str:
        return f"{self.owner}::{self.name}"


@dataclass
class BlockStats:
    """Per-block counters."""

    level: int = 0
    structural_changes: int = 0
    definition_changes: int = 0
    definition_level: int = 0
    feature_guarded_definition_changes: int = 0
    ast_pipeline_definition_changes: int = 0


@dataclass
class UnknownEvent:
    """A doSetBlockAttribute event whose target could not be resolved."""

    owner: str
    attribute: str
    is_definition: bool
    inferred_level: int
    feature_guarded: bool
    note: str


@dataclass
class AnalysisResult:
    project_level: int
    blocks: Dict[BlockKey, BlockStats]
    unknown_events: List[UnknownEvent] = field(default_factory=list)

    total_scripts: int = 0
    duplicate_scripts: int = 0
    duplication_ratio: float = 0
    total_combinations: int = 0
    tangling_dict: Dict[int, int] = field(default_factory=dict)
    scattering_dict: Dict[str, Set[int]] = field(default_factory=dict)
    dead_features: Set[str] = field(default_factory=set)

    def to_json_dict(self) -> dict:
        return {
            "project_level": self.project_level,
            "blocks": [
                {
                    "owner": k.owner,
                    "name": k.name,
                    "level": v.level,
                    "structural_changes": v.structural_changes,
                    "definition_changes": v.definition_changes,
                    "definition_level": v.definition_level,
                    "feature_guarded_definition_changes": v.feature_guarded_definition_changes,
                    "ast_pipeline_definition_changes": v.ast_pipeline_definition_changes,
                }
                for k, v in sorted(self.blocks.items(), key=lambda kv: kv[0].as_str().lower())
            ],
            "unknown_events": [e.__dict__ for e in self.unknown_events],
            "total_scripts": self.total_scripts,
            "duplicate_scripts": self.duplicate_scripts,
            "duplication_ratio": self.duplication_ratio,
            "total_combinations": self.total_combinations,
            "tangling_dict": self.tangling_dict,
            "scattering_dict": self.scattering_dict,
            "dead_features": self.dead_features
        }


@dataclass
class AnalysisConfig:
    """Analysis configuration."""

    ignore_metaprogramming_library_definitions: bool = True
    include_unknown_events: bool = True


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Core AST keywords used in library detection
AST_KEYWORDS: Tuple[str, ...] = ("scriptify", "blockify", "inject")

# Extended prefixes for library block definitions
META_LIBRARY_PREFIXES: Tuple[str, ...] = AST_KEYWORDS + (
    "callers of",
    "call stack",
    "get variable name of caller",
    "set variable name of caller",
)

# Conditional blocks (subset)
CONDITIONAL_BLOCKS: Set[str] = {
    "doIf",
    "doIfElse",
    "doUntil",
    "doRepeatUntil",
    "doWaitUntil",
}

# Loop-only blocks (no explicit condition in the sense of feature guards)
LOOP_ONLY_BLOCKS: Set[str] = {
    "doForever",
    "doRepeat",
    "doFor",
    "doForEach",
}

# All control flow blocks
CONTROL_FLOW_BLOCKS: Set[str] = CONDITIONAL_BLOCKS | LOOP_ONLY_BLOCKS

# List mutation operations
LIST_MUTATION_BLOCKS: Set[str] = {
    "doReplaceInList",
    "doInsertInList",
    "doDeleteFromList",
    "doAddToList",
    "doSetItemOfList",
}

# Tags that often bloat the XML (base64). Not needed for the analysis.
HEAVY_TAGS: Set[str] = {"thumbnail", "pentrails", "media", "costume", "sound"}

# Attribute name constant
DEFINITION_ATTR: str = "definition"

# ---------------------------------------------------------------------------
# Helper functions for repeated patterns
# ---------------------------------------------------------------------------


def _get_selector(elem: ET.Element) -> str:
    """Safely extract and normalize the 's' attribute."""
    return (elem.get("s") or "").strip()


def _normalize_name(name: Optional[str]) -> Optional[str]:
    """Normalize a name: strip whitespace, return None if empty."""
    if name is None:
        return None
    stripped = name.strip()
    return stripped if stripped else None


def _get_text(elem: Optional[ET.Element]) -> str:
    """Safely extract text content from an element."""
    if elem is None:
        return ""
    return (elem.text or "").strip()


# ---------------------------------------------------------------------------
# Efficient parsing
# ---------------------------------------------------------------------------


def parse_snap_xml(path: str | Path) -> ET.Element:
    """Parse the Snap! project XML.

    Uses iterparse to clear large subtrees (thumbnail/media/costumes) and reduce memory.
    """
    path = Path(path)
    context = ET.iterparse(str(path), events=("start", "end"))
    _, root = next(context)
    for event, elem in context:
        if event == "end" and elem.tag in HEAVY_TAGS:
            elem.clear()
    return root


# ---------------------------------------------------------------------------
# Snap! XML utilities
# ---------------------------------------------------------------------------


def _iter_scenes(root: ET.Element) -> Iterator[ET.Element]:
    """Iterate over scene elements in the project."""
    for scene in root.findall(".//scene"):
        yield scene


def _iter_scene_block_definitions(scene: ET.Element) -> Iterator[ET.Element]:
    """Scene-level global block definitions."""
    blocks = scene.find("blocks")
    if blocks is None:
        return
    for bd in blocks.findall("block-definition"):
        yield bd


def _scene_owner_nodes(scene: ET.Element) -> Iterator[Tuple[str, ET.Element]]:
    """Return (owner_name, owner_elem) for stage and sprites."""
    stage = scene.find("stage")
    if stage is not None:
        yield ("Stage", stage)

    for sprite in scene.findall(".//sprites/sprite"):
        name = sprite.get("name") or "(unnamed sprite)"
        yield (name, sprite)


def _iter_owner_scripts(owner_elem: ET.Element) -> Iterator[ET.Element]:
    """Top-level scripts for the owner (stage/sprite)."""
    scripts_container = owner_elem.find("scripts")
    if scripts_container is None:
        return
    for script in scripts_container.findall("script"):
        yield script


def _iter_owner_block_definitions(owner_elem: ET.Element) -> Iterator[ET.Element]:
    """Block definitions owned by a sprite/stage."""
    blocks = owner_elem.find("blocks")
    if blocks is None:
        return
    for bd in blocks.findall("block-definition"):
        yield bd


def _block_definition_name(bd: ET.Element) -> str:
    """Extract the name/label of a block-definition."""
    return _get_selector(bd)


def _is_ignored_library_block_definition(name: str) -> bool:
    """Check if a block definition belongs to the metaprogramming library."""
    low = name.strip().lower()
    return any(low.startswith(prefix) for prefix in META_LIBRARY_PREFIXES)


def _child_elems_of_interest(block_elem: ET.Element) -> List[ET.Element]:
    """Return children that are arguments (excluding scripts)."""
    return [c for c in block_elem if c.tag in ("l", "block", "custom-block")]


def _first_child_blocklike(block_elem: ET.Element) -> Optional[ET.Element]:
    """Return the first child that is <block> or <custom-block>."""
    for c in block_elem:
        if c.tag in ("block", "custom-block"):
            return c
    return None


def _direct_child_scripts(block_elem: ET.Element) -> List[ET.Element]:
    """Return direct child script elements."""
    return [c for c in block_elem if c.tag == "script"]


def _extract_option_text(l_elem: ET.Element) -> str:
    """Extract option text from an <l> element."""
    opt = l_elem.find("option")
    return _get_text(opt) if opt is not None else ""


def _iter_var_refs(elem: Optional[ET.Element]) -> Iterator[str]:
    """Iterate over variable references in an element subtree."""
    if elem is None:
        return
    for b in elem.iter("block"):
        v = b.get("var")
        if v:
            yield v


def _find_first_custom_block_name(elem: Optional[ET.Element]) -> Optional[str]:
    """Find the first custom-block name in an element (including itself)."""
    if elem is None:
        return None
    # Early return optimization: if elem itself is custom-block
    if elem.tag == "custom-block":
        return _normalize_name(elem.get("s"))
    # Search subtree
    for cb in elem.iter("custom-block"):
        name = _normalize_name(cb.get("s"))
        if name:
            return name
    return None


# ---------------------------------------------------------------------------
# Target resolution
# ---------------------------------------------------------------------------


def _resolve_target_block_name(
    target_elem: Optional[ET.Element],
    env: Dict[str, str],
) -> Tuple[Optional[str], str]:
    """Resolve the target block name (2nd argument of doSetBlockAttribute)."""

    if target_elem is None:
        return None, "missing target element"

    # 1) variable: <block var="block"/>
    var_name = target_elem.get("var")
    if var_name:
        if var_name in env:
            return env[var_name], f"resolved from var '{var_name}'"
        return None, f"unbound var '{var_name}' (no doDefineBlock in scope)"

    # 2) direct custom-block
    if target_elem.tag == "custom-block":
        name = _normalize_name(target_elem.get("s"))
        if name:
            return name, "direct custom-block"

    # 3) reifyXxx wrapper containing a custom-block
    s = _get_selector(target_elem)
    if s in {"reifyReporter", "reifyScript", "reifyPredicate"}:
        name = _find_first_custom_block_name(target_elem)
        if name:
            return name, f"custom-block inside {s}"
        return None, f"{s} without custom-block"

    # 4) fallback: search for custom-block in subtree
    name = _find_first_custom_block_name(target_elem)
    if name:
        return name, "custom-block found in subtree"

    return None, "unable to resolve target"


# ---------------------------------------------------------------------------
# Single-pass expression analysis
# ---------------------------------------------------------------------------


@dataclass
class ExprAnalysis:
    """Results of analyzing an expression in a single pass."""

    var_refs: Set[str] = field(default_factory=set)
    has_join: bool = False
    has_split_blocks: bool = False
    has_ast_library: bool = False


def _analyze_expr(expr: Optional[ET.Element]) -> ExprAnalysis:
    """Analyze an expression in a single pass, extracting all relevant info."""
    if expr is None:
        return ExprAnalysis()

    result = ExprAnalysis()

    for elem in expr.iter():
        if elem.tag == "block":
            # Variable reference
            var = elem.get("var")
            if var:
                result.var_refs.add(var)

            # Check selector
            selector = _get_selector(elem)
            if selector == "reportJoinWords":
                result.has_join = True
            elif selector == "reportTextSplit":
                # Check if split by "blocks"
                for l in elem.findall("l"):
                    if _extract_option_text(l) == "blocks":
                        result.has_split_blocks = True
                        break

        elif elem.tag == "custom-block":
            # Check for AST library usage
            name = _get_selector(elem).lower()
            if any(kw in name for kw in AST_KEYWORDS):
                result.has_ast_library = True

    return result


def _is_ast_like_expr(analysis: ExprAnalysis) -> bool:
    """Check if expression analysis indicates AST-like operations."""
    return analysis.has_split_blocks or analysis.has_ast_library


# ---------------------------------------------------------------------------
# Configured variable detection
# ---------------------------------------------------------------------------


def _collect_configured_vars(root: ET.Element) -> Set[str]:
    """Collect variables that are configured by user interaction.

    Detected configuration mechanisms:
    - Slider watchers: variables exposed as sliders in the UI
    - Question responses: variables assigned from getLastAnswer (doAsk result)
    """
    configured: Set[str] = set()
    total_combinations = 1

    # 1. Variables with slider watchers
    for w in root.iter("watcher"):
        min = w.get("min")
        max = w.get("max")

        style = (w.get("style") or "").strip().lower()
        if style == "slider":
            if min is not None and max is not None:
                w_states = ((int(max)) - int(min)) + 1
                total_combinations *= w_states

            v = _normalize_name(w.get("var"))
            if v:
                configured.add(v)

    # 2. Variables assigned from getLastAnswer (response to doAsk)
    for block in root.iter("block"):
        if _get_selector(block) == "doSetVar":
            children = list(block)
            if len(children) >= 2:
                var_elem = children[0]
                value_elem = children[1]
                var_name = _get_text(var_elem)
                # Check if value comes from getLastAnswer
                if (
                    value_elem.tag == "block"
                    and _get_selector(value_elem) == "getLastAnswer"
                    and var_name
                ):
                    configured.add(var_name)

    return configured, total_combinations


def _is_feature_var(var_name: str, configured_vars: Set[str]) -> bool:
    """Determine if a variable is a feature/configuration variable.

    A variable is considered a feature variable if it was configured
    through a user interaction mechanism (slider, question response, etc.).
    """
    return var_name in configured_vars


# ---------------------------------------------------------------------------
# Block extractors
# ---------------------------------------------------------------------------


def _extract_do_define_block(block_elem: ET.Element) -> Optional[Tuple[str, str]]:
    """Extract (var_name, label) from doDefineBlock."""
    if _get_selector(block_elem) != "doDefineBlock":
        return None
    ls = [c for c in block_elem if c.tag == "l"]
    if len(ls) < 2:
        return None
    var_name = _get_text(ls[0])
    label = _get_text(ls[1])
    if not var_name or not label:
        return None
    return var_name, label


def _extract_do_set_var(
    block_elem: ET.Element,
) -> Optional[Tuple[str, Optional[ET.Element]]]:
    """Extract (var_name, value_expr) from doSetVar."""
    if _get_selector(block_elem) != "doSetVar":
        return None
    children = _child_elems_of_interest(block_elem)
    if len(children) < 2:
        return None
    var_name = _get_text(children[0]) if children[0].tag == "l" else ""
    expr = children[1]
    if not var_name:
        return None
    return var_name, expr


def _extract_list_mutation_target_var(block_elem: ET.Element) -> Optional[str]:
    """Extract the target variable from a list mutation block."""
    if _get_selector(block_elem) not in LIST_MUTATION_BLOCKS:
        return None
    for b in block_elem:
        if b.tag == "block" and b.get("var"):
            return b.get("var")
    return None


def _extract_do_set_block_attribute(
    block_elem: ET.Element,
) -> Optional[Tuple[str, Optional[ET.Element], Optional[ET.Element]]]:
    """Extract (attribute, target, value) from doSetBlockAttribute."""
    if _get_selector(block_elem) != "doSetBlockAttribute":
        return None
    children = _child_elems_of_interest(block_elem)
    if len(children) < 3:
        return None
    opt_text = _extract_option_text(children[0]) if children[0].tag == "l" else ""
    target = children[1]
    value = children[2]
    return opt_text, target, value


# ---------------------------------------------------------------------------
# Script state
# ---------------------------------------------------------------------------


@dataclass
class _GuardContext:
    """Context for tracking feature guards in conditionals."""

    selector: str
    feature_vars: Set[str]

    @property
    def is_feature_guard(self) -> bool:
        return bool(self.feature_vars)


@dataclass
class _ScriptState:
    """State maintained during script analysis."""

    env: Dict[str, str] = field(default_factory=dict)
    ast_vars: Set[str] = field(default_factory=set)
    mutated_ast_vars: Set[str] = field(default_factory=set)
    guards: List[_GuardContext] = field(default_factory=list)

    def copy_for_nested(self) -> "_ScriptState":
        """Create a copy for analyzing nested scripts."""
        return _ScriptState(
            env=dict(self.env),
            ast_vars=set(self.ast_vars),
            mutated_ast_vars=set(self.mutated_ast_vars),
            guards=list(self.guards),
        )

    def feature_guarded(self) -> bool:
        """Check if currently inside a feature-guarded conditional."""
        return any(g.is_feature_guard for g in self.guards)


# ---------------------------------------------------------------------------
# Core analysis - ProjectAnalyzer class
# ---------------------------------------------------------------------------


class ProjectAnalyzer:
    """Analyzes a Snap! project for metaprogramming-based variability."""

    def __init__(self, root: ET.Element, config: Optional[AnalysisConfig] = None):
        self.root = root
        self.config = config or AnalysisConfig()

        # Collected data
        self.blocks: Dict[BlockKey, BlockStats] = {}
        self.unknown_events: List[UnknownEvent] = []

        # Precomputed data
        self.configured_vars, self.total_combinations = _collect_configured_vars(root)

        # Duplication data
        self.total_scripts: int = 0
        self.duplicate_scripts: int = 0
        self.seen_hashes: Set[str] = set()

        # Features usage
        self.features_usage_by_scripts: Dict[str, Set[str]] = dict()

    def analyze(self) -> AnalysisResult:
        """Run the analysis and return results."""
        for scene in _iter_scenes(self.root):
            self._analyze_scene(scene)

        return self._build_result()

    def _get_stats(self, owner: str, block_name: str) -> BlockStats:
        """Get or create BlockStats for a block."""
        key = BlockKey(owner, block_name)
        if key not in self.blocks:
            self.blocks[key] = BlockStats()
        return self.blocks[key]

    def _record_structural(self, owner: str, block_name: str) -> None:
        """Record a structural (non-definition) change."""
        st = self._get_stats(owner, block_name)
        st.structural_changes += 1
        st.level = max(st.level, 1)

    def _record_definition(
        self,
        owner: str,
        block_name: str,
        inferred_level: int,
        feature_guarded: bool,
        ast_pipeline: bool,
    ) -> None:
        """Record a definition change."""
        st = self._get_stats(owner, block_name)
        st.definition_changes += 1
        st.definition_level = max(st.definition_level, inferred_level)
        st.level = max(st.level, inferred_level)
        if feature_guarded:
            st.feature_guarded_definition_changes += 1
        if ast_pipeline:
            st.ast_pipeline_definition_changes += 1

    def _analyze_scene(self, scene: ET.Element) -> None:
        """Analyze a single scene."""
        # Scene-level global block definitions
        for bd in _iter_scene_block_definitions(scene):
            self._process_block_definition("Global", bd)

        # Stage and sprites
        for owner_name, owner_elem in _scene_owner_nodes(scene):
            # Owner's block definitions
            for bd in _iter_owner_block_definitions(owner_elem):
                self._process_block_definition(owner_name, bd)

            # Owner's scripts
            for script in _iter_owner_scripts(owner_elem):
                script_id = self._hash_script_structure(script)
                self._calculate_duplicate_scripts(script_id)
                self._calculate_features_usage(script, script_id)
                state = _ScriptState()
                self._analyze_script(owner_name, script, state)

    def _process_block_definition(self, owner: str, bd: ET.Element) -> None:
        """Process a block-definition element."""
        bd_name = _block_definition_name(bd)
        if not bd_name:
            return

        # Optionally skip library definitions
        if self.config.ignore_metaprogramming_library_definitions:
            if _is_ignored_library_block_definition(bd_name):
                return

        # Analyze only the direct script child (not nested scripts)
        script = bd.find("script")
        if script is not None:
            script_id = self._hash_script_structure(script)
            self._calculate_duplicate_scripts(script_id)
            self._calculate_features_usage(script, script_id)
            state = _ScriptState()
            self._analyze_script(owner, script, state)

    def _analyze_script(
        self, owner: str, script: ET.Element, state: _ScriptState
    ) -> None:
        """Recursively analyze a script element."""
        for stmt in [c for c in script if c.tag == "block"]:
            selector = _get_selector(stmt)

            # Track doDefineBlock for variable->block mapping
            dd = _extract_do_define_block(stmt)
            if dd is not None:
                var_name, label = dd
                state.env[var_name] = label

            # Track doSetVar for AST variables
            dv = _extract_do_set_var(stmt)
            if dv is not None:
                var_name, expr = dv
                expr_analysis = _analyze_expr(expr)
                if _is_ast_like_expr(expr_analysis):
                    state.ast_vars.add(var_name)

            # Track list mutations on AST variables
            if selector in LIST_MUTATION_BLOCKS:
                tgt = _extract_list_mutation_target_var(stmt)
                if tgt and tgt in state.ast_vars:
                    state.mutated_ast_vars.add(tgt)

            # Process doSetBlockAttribute
            dsba = _extract_do_set_block_attribute(stmt)
            if dsba is not None:
                self._process_set_block_attribute(owner, dsba, state)

            # Recurse into control flow blocks
            if selector in CONTROL_FLOW_BLOCKS:
                self._process_control_flow(owner, stmt, selector, state)

    def _process_set_block_attribute(
        self,
        owner: str,
        dsba: Tuple[str, Optional[ET.Element], Optional[ET.Element]],
        state: _ScriptState,
    ) -> None:
        """Process a doSetBlockAttribute statement."""
        attr, target_elem, value_expr = dsba
        target_name, reason = _resolve_target_block_name(target_elem, state.env)

        is_definition = attr == DEFINITION_ATTR
        feature_guarded = state.feature_guarded() if is_definition else False

        # Determine level and ast_pipeline
        inferred_level = 0
        ast_pipeline = False
        note = ""

        if not is_definition:
            inferred_level = 1
        else:
            # Single-pass analysis of value expression
            analysis = _analyze_expr(value_expr)

            references_ast_vars = bool(analysis.var_refs & state.ast_vars)
            mutated = bool(analysis.var_refs & state.mutated_ast_vars)

            ast_pipeline = (
                references_ast_vars
                and (analysis.has_join or analysis.has_split_blocks or mutated)
            ) or (_is_ast_like_expr(analysis) and analysis.has_join)

            inferred_level = 3 if ast_pipeline else 2
            note = (
                f"refs_ast_vars={references_ast_vars}, join={analysis.has_join}, "
                f"split={analysis.has_split_blocks}, mutated_ast={mutated}, "
                f"ast_like={_is_ast_like_expr(analysis)}"
            )

        # Record the event
        if target_name is None:
            if self.config.include_unknown_events:
                note_str = f"{reason}; {note}" if note else reason
                self.unknown_events.append(
                    UnknownEvent(
                        owner=owner,
                        attribute=attr,
                        is_definition=is_definition,
                        inferred_level=inferred_level,
                        feature_guarded=feature_guarded,
                        note=note_str,
                    )
                )
        else:
            if not is_definition:
                self._record_structural(owner, target_name)
            else:
                self._record_definition(
                    owner, target_name, inferred_level, feature_guarded, ast_pipeline
                )

    def _process_control_flow(
        self,
        owner: str,
        stmt: ET.Element,
        selector: str,
        state: _ScriptState,
    ) -> None:
        """Process a control flow block (if/loop) with nested scripts."""
        nested_scripts = _direct_child_scripts(stmt)
        if not nested_scripts:
            return

        base = state.copy_for_nested()

        # Add guard context for conditionals
        if selector in CONDITIONAL_BLOCKS:
            cond_expr = _first_child_blocklike(stmt)
            cond_vars = set(_iter_var_refs(cond_expr))
            feature_vars = {
                v for v in cond_vars if _is_feature_var(v, self.configured_vars)
            }
            base.guards = base.guards + [
                _GuardContext(selector=selector, feature_vars=feature_vars)
            ]

        # Analyze branches and collect AST variable info
        branch_ast_vars: Set[str] = set()
        branch_mutated_ast_vars: Set[str] = set()

        for sub in nested_scripts:
            branch_state = base.copy_for_nested()
            self._analyze_script(owner, sub, branch_state)
            branch_ast_vars |= branch_state.ast_vars
            branch_mutated_ast_vars |= branch_state.mutated_ast_vars

        # Conservative propagation from branches
        state.ast_vars |= branch_ast_vars
        state.mutated_ast_vars |= branch_mutated_ast_vars

    def _hash_script_structure(self, script: ET.Element) -> str:
        """
        Generates a hash of the logical structure of a script.
        """
        signature = []

        for elem in script.iter():
            if elem.tag in ("block", "custom-block"):
                selector = elem.get("s")
                if selector:
                    signature.append(selector)

        return hash("|".join(signature))

    def _calculate_duplicate_scripts(self, script_id: str) -> None:
        self.total_scripts += 1

        if script_id in self.seen_hashes:
            self.duplicate_scripts += 1
        else:
            self.seen_hashes.add(script_id)

    def _calculate_features_usage(self, script_elem: ET.Element, script_id: str) -> None:
        vars_in_script = set(_iter_var_refs(script_elem))
        features_in_script = vars_in_script.intersection(self.configured_vars)
        
        if features_in_script:
            self.features_usage_by_scripts[script_id] = features_in_script

    def _build_result(self) -> AnalysisResult:
        """Build the final analysis result."""
        # Compute project-level indicator
        max_level = 0

        for st in self.blocks.values():
            max_level = max(max_level, st.level)

        # Include UNKNOWN events in level calculation
        for ev in self.unknown_events:
            max_level = max(max_level, ev.inferred_level)

        duplication_ratio = 0.0
        if self.total_scripts > 0:
            duplication_ratio = (self.duplicate_scripts / self.total_scripts) * 100

        tangling_dict = dict()
        scattering_dict = dict()
        for script_id, features in self.features_usage_by_scripts.items():
            tangling_dict[script_id] = len(features)
        
        for script_id, features in self.features_usage_by_scripts.items():
            for feature in features:
                if feature not in scattering_dict:
                    scattering_dict[feature] = set()
                scattering_dict[feature].add(script_id)

        dead_features = self.configured_vars - set(scattering_dict.keys())

        return AnalysisResult(
            project_level=max_level,
            blocks=self.blocks,
            unknown_events=self.unknown_events,
            total_scripts=self.total_scripts,
            duplicate_scripts=self.duplicate_scripts,
            duplication_ratio=duplication_ratio,
            total_combinations=self.total_combinations,
            tangling_dict=tangling_dict,
            scattering_dict=scattering_dict,
            dead_features=dead_features
        )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def analyze_project(
    root: ET.Element, config: Optional[AnalysisConfig] = None
) -> AnalysisResult:
    """Analyze a Snap! project XML tree."""
    analyzer = ProjectAnalyzer(root, config)
    return analyzer.analyze()


def analyze_file(
    path: str | Path, config: Optional[AnalysisConfig] = None
) -> AnalysisResult:
    """Analyze a Snap! project from a file path."""
    root = parse_snap_xml(path)
    return analyze_project(root, config=config)


# ---------------------------------------------------------------------------
# Report (text)
# ---------------------------------------------------------------------------


def print_report(result: AnalysisResult, *, include_unknown: bool = True) -> None:
    """Print a human-readable (text) report."""

    print("=== SPLASP! - Software Product Line Analyzer for Snap! Projects ===\n")
    print(f"Project level: {result.project_level}")
    print("  0 = no metaprogramming")
    print("  1 = structural changes (category, type, etc.)")
    print("  2 = full definition rewrite (set definition)")
    print("  3 = AST/pipeline-based rewrite (split/list edits/join)\n")

    if not result.blocks and not (include_unknown and result.unknown_events):
        print("No doSetBlockAttribute-based modifications were detected.")
        return

    if result.blocks:
        print("Modified blocks (by owner::block):\n")
        for key, st in sorted(
            result.blocks.items(), key=lambda kv: kv[0].as_str().lower()
        ):
            print(f"- {key.as_str()}")
            print(f"    level={st.level}")
            print(f"    structural_changes={st.structural_changes}")
            print(
                f"    definition_changes={st.definition_changes} (definition_level={st.definition_level})"
            )
            if st.definition_changes:
                print(
                    f"    feature_guarded_definition_changes={st.feature_guarded_definition_changes}"
                )
                print(
                    f"    ast_pipeline_definition_changes={st.ast_pipeline_definition_changes}"
                )
            print()

    if include_unknown and result.unknown_events:
        print("Events with unresolved targets (UNKNOWN):\n")
        for ev in result.unknown_events:
            kind = "definition" if ev.is_definition else "structural"
            fg = "feature-guard" if ev.feature_guarded else "no-guard"
            print(
                f"- owner={ev.owner} attr={ev.attribute} ({kind}) level~{ev.inferred_level} {fg}"
            )
            print(f"    note: {ev.note}")
        print()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def _build_arg_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="SPLASP! - Analyze software variability in Snap! projects."
    )
    p.add_argument(
        "xml_path",
        help="Path to the Snap! exported .xml/.txt (contains <snapdata>...).",
    )
    p.add_argument(
        "--json",
        action="store_true",
        help="Print the report as JSON (instead of text).",
    )
    p.add_argument(
        "--include-library-defs",
        action="store_true",
        help="Include metaprogramming library block-definitions (scriptify/blockify/inject...) in the analysis.",
    )
    p.add_argument(
        "--exclude-unknown",
        action="store_true",
        help="Exclude UNKNOWN events (unresolved targets).",
    )
    return p


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = _build_arg_parser().parse_args(list(argv) if argv is not None else None)

    config = AnalysisConfig(
        ignore_metaprogramming_library_definitions=not args.include_library_defs,
        include_unknown_events=not args.exclude_unknown,
    )

    try:
        result = analyze_file(args.xml_path, config=config)
    except (ET.ParseError, FileNotFoundError, PermissionError, OSError) as e:
        print(f"Error analyzing '{args.xml_path}': {e}", file=sys.stderr)
        return 2
    except KeyboardInterrupt:
        raise
    except SystemExit:
        raise
    except Exception as e:
        print(f"Unexpected error analyzing '{args.xml_path}': {e}", file=sys.stderr)
        return 3

    if args.json:
        print(json.dumps(result.to_json_dict(), ensure_ascii=False, indent=2))
    else:
        print_report(result, include_unknown=not args.exclude_unknown)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
