from typing import Dict, List, Optional

from app.agent.tools.base import BaseTool, ToolArguments, ToolDefinition, ToolResult
from app.agent.tools.export_tool import ExportTool
from app.agent.tools.palette_tool import PaletteTool
from app.agent.tools.render_tool import RenderTool
from app.agent.tools.validate_tool import ValidateTool
from app.agent.tools.variant_tool import VariantTool


class ToolNotFoundError(LookupError):
    pass


REGISTERED_TOOLS: List[BaseTool] = [
    PaletteTool(),
    VariantTool(),
    RenderTool(),
    ValidateTool(),
    ExportTool(),
]
TOOLS_BY_NAME: Dict[str, BaseTool] = {
    tool.definition().name: tool for tool in REGISTERED_TOOLS
}


def get_all_tools() -> List[ToolDefinition]:
    return [tool.definition() for tool in REGISTERED_TOOLS]


def get_tool(name: str) -> Optional[BaseTool]:
    return TOOLS_BY_NAME.get(name)


def execute_tool(name: str, arguments: ToolArguments) -> ToolResult:
    tool = get_tool(name)

    if tool is None:
        raise ToolNotFoundError(name)

    return tool.run(arguments)
