from typing import Dict, List, Optional

from pydantic import JsonValue

from app.agent.tools.base import ToolDefinition
from app.agent.tools.registry import get_all_tools


EXPOSED_TOOL_NAMES = (
    "palette.generate",
    "variant.generate",
    "asset_pack.validate",
    "export.describe",
)
FUNCTION_NAME_BY_TOOL_NAME: Dict[str, str] = {
    "palette.generate": "palette_generate",
    "variant.generate": "variant_generate",
    "asset_pack.validate": "asset_pack_validate",
    "export.describe": "export_describe",
}
TOOL_NAME_BY_FUNCTION_NAME: Dict[str, str] = {
    function_name: tool_name
    for tool_name, function_name in FUNCTION_NAME_BY_TOOL_NAME.items()
}
PARAMETER_OVERRIDES: Dict[str, Dict[str, JsonValue]] = {
    "asset_pack.validate": {
        "type": "object",
        "properties": {
            "plan": {
                "type": "object",
                "description": "待校验的 AssetPackPlan JSON 对象。",
            }
        },
        "required": ["plan"],
        "additionalProperties": False,
    },
}


def _normalize_parameters(definition: ToolDefinition) -> Dict[str, JsonValue]:
    if definition.name in PARAMETER_OVERRIDES:
        return PARAMETER_OVERRIDES[definition.name]

    parameters = dict(definition.input_schema)

    if parameters.get("type") != "object":
        return {
            "type": "object",
            "properties": {},
            "additionalProperties": False,
        }

    if "properties" not in parameters:
        parameters["properties"] = {}

    return parameters


def build_openai_tools_schema() -> List[Dict[str, JsonValue]]:
    definitions = {
        definition.name: definition
        for definition in get_all_tools()
        if definition.enabled
    }
    tools: List[Dict[str, JsonValue]] = []

    for tool_name in EXPOSED_TOOL_NAMES:
        definition = definitions[tool_name]
        tools.append(
            {
                "type": "function",
                "function": {
                    "name": FUNCTION_NAME_BY_TOOL_NAME[tool_name],
                    "description": definition.description,
                    "parameters": _normalize_parameters(definition),
                },
            }
        )

    return tools


def resolve_registry_tool_name(function_name: str) -> Optional[str]:
    return TOOL_NAME_BY_FUNCTION_NAME.get(function_name)
