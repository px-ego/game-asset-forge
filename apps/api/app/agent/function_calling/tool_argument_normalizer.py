from typing import List

from pydantic import Field

from app.agent.tools.base import StrictToolModel, ToolArguments
from app.planner.fallback_pack_planner import fallback_pack_plan
from app.schemas.asset_pack import PlanPackRequest
from app.schemas.planner import AssetCount, AssetSize, AssetStyle, AssetType, Theme


class PlanConstraints(StrictToolModel):
    theme: Theme
    style: AssetStyle
    size: AssetSize
    count: AssetCount
    assetTypes: List[AssetType] = Field(min_length=1)
    prompt: str


class NormalizedToolArguments(StrictToolModel):
    arguments: ToolArguments
    warnings: List[str] = Field(default_factory=list)
    skip_execution: bool = False


def build_plan_constraints(request: PlanPackRequest) -> PlanConstraints:
    plan = fallback_pack_plan(
        prompt=request.prompt,
        theme=request.theme,
        style=request.style,
        size=request.size,
        count=request.count,
        asset_types=request.assetTypes,
    )
    asset_types: List[AssetType] = []

    for asset in plan.assets:
        if asset.type not in asset_types:
            asset_types.append(asset.type)

    return PlanConstraints(
        theme=plan.theme,
        style=plan.style,
        size=plan.size,
        count=plan.count,
        assetTypes=asset_types,
        prompt=request.prompt,
    )


def _normalized_prompt(
    raw_arguments: ToolArguments,
    constraints: PlanConstraints,
) -> str:
    prompt = raw_arguments.get("prompt")

    if isinstance(prompt, str) and prompt:
        return prompt

    return constraints.prompt


def normalize_tool_arguments(
    tool_name: str,
    raw_arguments: ToolArguments,
    constraints: PlanConstraints,
) -> NormalizedToolArguments:
    if tool_name == "palette.generate":
        warnings: List[str] = []

        if (
            raw_arguments.get("theme") != constraints.theme
            or raw_arguments.get("style") != constraints.style
        ):
            warnings.append("palette.generate 参数与全局约束不一致，已按全局约束修正")

        return NormalizedToolArguments(
            arguments={
                "theme": constraints.theme,
                "style": constraints.style,
                "prompt": _normalized_prompt(raw_arguments, constraints),
            },
            warnings=warnings,
        )

    if tool_name == "variant.generate":
        warnings = []
        requested_asset_type = raw_arguments.get("assetType")

        if (
            raw_arguments.get("theme") != constraints.theme
            or raw_arguments.get("count") != constraints.count
        ):
            warnings.append("variant.generate 参数与全局约束不一致，已按全局约束修正")

        if isinstance(requested_asset_type, str) and requested_asset_type in constraints.assetTypes:
            asset_type = requested_asset_type
        else:
            asset_type = constraints.assetTypes[0] if constraints.assetTypes else "coin"

            if "assetType" in raw_arguments:
                warnings.append("variant.generate assetType 与全局约束不一致，已修正")

        return NormalizedToolArguments(
            arguments={
                "assetType": asset_type,
                "count": constraints.count,
                "theme": constraints.theme,
                "prompt": _normalized_prompt(raw_arguments, constraints),
            },
            warnings=warnings,
        )

    if tool_name == "asset_pack.validate":
        return NormalizedToolArguments(
            arguments={},
            warnings=[
                "asset_pack.validate 在最终计划装配前已跳过，最终计划由后端校验"
            ],
            skip_execution=True,
        )

    if tool_name == "export.describe":
        return NormalizedToolArguments(arguments={})

    return NormalizedToolArguments(arguments=raw_arguments)
