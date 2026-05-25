from typing import List

from app.agent.tools.base import (
    BaseTool,
    StrictToolModel,
    ToolArguments,
    ToolDefinition,
    ToolResult,
)
from app.planner.fallback_pack_planner import fallback_pack_plan
from app.schemas.planner import AssetStyle, Theme


class PaletteArguments(StrictToolModel):
    theme: Theme
    style: AssetStyle
    prompt: str = ""


class PaletteResult(StrictToolModel):
    primary: str
    secondary: str
    accent: str
    outline: str
    background: str
    styleHints: List[str]


class PaletteTool(BaseTool):
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="palette.generate",
            description="根据主题、风格和自然语言提示生成素材包色板。",
            input_schema=PaletteArguments.model_json_schema(),
            output_schema=PaletteResult.model_json_schema(),
            category="design",
        )

    def run(self, arguments: ToolArguments) -> ToolResult:
        request = PaletteArguments.model_validate(arguments)
        plan = fallback_pack_plan(
            prompt=request.prompt,
            theme=request.theme,
            style=request.style,
            count=1,
            asset_types=["coin"],
        )
        result = PaletteResult(
            **plan.palette.model_dump(),
            styleHints=plan.globalStyleHints,
        )

        return result.model_dump()
