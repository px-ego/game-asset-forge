from typing import List

from pydantic import Field

from app.agent.tools.base import (
    BaseTool,
    StrictToolModel,
    ToolArguments,
    ToolDefinition,
    ToolResult,
)
from app.schemas.asset_pack import AssetPalette, PlannedAsset


class RenderPalette(AssetPalette):
    styleHints: List[str] = Field(default_factory=list)


class RenderArguments(StrictToolModel):
    plannedAsset: PlannedAsset
    palette: RenderPalette


class PreparedRenderSpec(PlannedAsset):
    palette: RenderPalette


class RenderResult(StrictToolModel):
    renderSpec: PreparedRenderSpec


class RenderTool(BaseTool):
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="render.prepare",
            description="将规划出的素材变体转换为 renderer 可消费的 render spec。",
            input_schema=RenderArguments.model_json_schema(),
            output_schema=RenderResult.model_json_schema(),
            category="render",
        )

    def run(self, arguments: ToolArguments) -> ToolResult:
        request = RenderArguments.model_validate(arguments)
        result = RenderResult(
            renderSpec=PreparedRenderSpec(
                **request.plannedAsset.model_dump(),
                palette=request.palette,
            )
        )

        return result.model_dump(exclude_none=True)
