from typing import List

from app.agent.tools.base import (
    BaseTool,
    StrictToolModel,
    ToolArguments,
    ToolDefinition,
    ToolResult,
)
from app.planner.fallback_pack_planner import fallback_pack_plan
from app.schemas.asset_pack import PlannedAsset
from app.schemas.planner import AssetCount, AssetType, Theme


class VariantArguments(StrictToolModel):
    assetType: AssetType
    count: AssetCount
    theme: Theme
    prompt: str = ""


class VariantResult(StrictToolModel):
    variants: List[PlannedAsset]


class VariantTool(BaseTool):
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="variant.generate",
            description="为指定素材类型生成多个不同 variant。",
            input_schema=VariantArguments.model_json_schema(),
            output_schema=VariantResult.model_json_schema(),
            category="design",
        )

    def run(self, arguments: ToolArguments) -> ToolResult:
        request = VariantArguments.model_validate(arguments)
        plan = fallback_pack_plan(
            prompt=request.prompt,
            theme=request.theme,
            count=request.count,
            asset_types=[request.assetType],
        )
        result = VariantResult(variants=plan.assets)

        return result.model_dump(exclude_none=True)
