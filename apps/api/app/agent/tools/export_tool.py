from typing import List

from app.agent.tools.base import (
    BaseTool,
    StrictToolModel,
    ToolArguments,
    ToolDefinition,
    ToolResult,
)


class ExportArguments(StrictToolModel):
    pass


class ExportCapability(StrictToolModel):
    name: str
    description: str


class ExportResult(StrictToolModel):
    exports: List[ExportCapability]


class ExportTool(BaseTool):
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="export.describe",
            description="返回当前系统支持的导出能力说明。",
            input_schema=ExportArguments.model_json_schema(),
            output_schema=ExportResult.model_json_schema(),
            category="export",
        )

    def run(self, arguments: ToolArguments) -> ToolResult:
        ExportArguments.model_validate(arguments)
        result = ExportResult(
            exports=[
                ExportCapability(name="export_png", description="导出单个素材 PNG。"),
                ExportCapability(name="export_metadata", description="导出素材 metadata.json。"),
                ExportCapability(name="export_zip", description="导出 ZIP 资源包。"),
                ExportCapability(name="export_spritesheet", description="导出 Sprite Sheet PNG。"),
            ]
        )

        return result.model_dump()
