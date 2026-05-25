from typing import Dict, List, Tuple

from pydantic import Field

from app.agent.tools.base import StrictToolModel, ToolArguments, ToolResult
from app.planner.fallback_pack_planner import fallback_pack_plan
from app.schemas.asset_pack import (
    AssetPackPlan,
    AssetPalette,
    PlanPackRequest,
    PlannedAsset,
    normalize_planned_asset_render_hints,
)
from app.schemas.planner import AssetType


class ExecutedToolResult(StrictToolModel):
    tool_name: str
    arguments: ToolArguments
    result: ToolResult


class AssembledPlan(StrictToolModel):
    plan: AssetPackPlan
    warnings: List[str] = Field(default_factory=list)


def _asset_types_from_plan(plan: AssetPackPlan) -> List[AssetType]:
    asset_types: List[AssetType] = []

    for asset in plan.assets:
        if asset.type not in asset_types:
            asset_types.append(asset.type)

    return asset_types


def _fallback_assets_for_type(
    plan: AssetPackPlan,
    asset_type: AssetType,
) -> List[PlannedAsset]:
    return [asset for asset in plan.assets if asset.type == asset_type]


def _complete_variants_for_type(
    variants: List[PlannedAsset],
    fallback_variants: List[PlannedAsset],
    count: int,
) -> List[PlannedAsset]:
    completed: List[PlannedAsset] = []
    used_ids: set[str] = set()
    used_variants: set[str] = set()

    for asset in [*variants, *fallback_variants]:
        if asset.id in used_ids or asset.variant in used_variants:
            continue

        completed.append(asset)
        used_ids.add(asset.id)
        used_variants.add(asset.variant)

        if len(completed) == count:
            break

    return completed


def assemble_asset_pack_plan(
    request: PlanPackRequest,
    tool_results: List[ExecutedToolResult],
) -> AssembledPlan:
    fallback_plan = fallback_pack_plan(
        prompt=request.prompt,
        theme=request.theme,
        style=request.style,
        size=request.size,
        count=request.count,
        asset_types=request.assetTypes,
    )
    palette = fallback_plan.palette
    global_style_hints = list(fallback_plan.globalStyleHints)
    variants_by_type: Dict[AssetType, List[PlannedAsset]] = {}
    warnings: List[str] = []

    for tool_result in tool_results:
        if tool_result.tool_name == "palette.generate":
            palette = AssetPalette.model_validate(
                {
                    field_name: tool_result.result[field_name]
                    for field_name in (
                        "primary",
                        "secondary",
                        "accent",
                        "outline",
                        "background",
                    )
                }
            )
            style_hints = tool_result.result.get("styleHints")

            if isinstance(style_hints, list) and all(
                isinstance(hint, str) for hint in style_hints
            ):
                global_style_hints = list(style_hints)

        if tool_result.tool_name == "variant.generate":
            variants = tool_result.result.get("variants")

            if isinstance(variants, list):
                planned_assets = [
                    PlannedAsset.model_validate(
                        normalize_planned_asset_render_hints(asset)
                    )
                    for asset in variants
                ]

                for asset in planned_assets:
                    variants_by_type.setdefault(asset.type, []).append(asset)

        if tool_result.tool_name == "asset_pack.validate":
            validation_warnings = tool_result.result.get("warnings")

            if isinstance(validation_warnings, list):
                warnings.extend(
                    warning
                    for warning in validation_warnings
                    if isinstance(warning, str)
                )

    assets: List[PlannedAsset] = []

    for asset_type in _asset_types_from_plan(fallback_plan):
        variants = variants_by_type.get(asset_type, [])
        fallback_variants = _fallback_assets_for_type(fallback_plan, asset_type)

        if len(variants) < fallback_plan.count:
            warnings.append(f"{asset_type} 缺少完整工具结果，已使用 fallback 补齐。")

        assets.extend(
            _complete_variants_for_type(
                variants,
                fallback_variants,
                fallback_plan.count,
            )
        )

    plan = AssetPackPlan(
        goal=fallback_plan.goal,
        theme=fallback_plan.theme,
        style=fallback_plan.style,
        size=fallback_plan.size,
        count=fallback_plan.count,
        palette=palette,
        globalStyleHints=global_style_hints,
        assets=assets,
    )

    return AssembledPlan(plan=plan, warnings=warnings)
