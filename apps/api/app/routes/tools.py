from typing import Dict, List

from fastapi import APIRouter
from pydantic import JsonValue, ValidationError

from app.agent.function_calling.tool_schema_builder import build_openai_tools_schema
from app.agent.tools.base import (
    ToolExecutionRequest,
    ToolExecutionResponse,
    ToolListResponse,
)
from app.agent.tools.registry import ToolNotFoundError, execute_tool, get_all_tools


router = APIRouter(prefix="/api/tools", tags=["tools"])


@router.get("", response_model=ToolListResponse)
def list_tools() -> ToolListResponse:
    return ToolListResponse(success=True, tools=get_all_tools())


@router.get("/openai-schema", response_model=List[Dict[str, JsonValue]])
def list_openai_tools_schema() -> List[Dict[str, JsonValue]]:
    return build_openai_tools_schema()


@router.post("/execute", response_model=ToolExecutionResponse)
def run_tool(request: ToolExecutionRequest) -> ToolExecutionResponse:
    try:
        result = execute_tool(request.toolName, request.arguments)
    except ToolNotFoundError:
        return ToolExecutionResponse(
            success=False,
            toolName=request.toolName,
            message="工具不存在",
        )
    except ValidationError:
        return ToolExecutionResponse(
            success=False,
            toolName=request.toolName,
            message="工具参数不合法",
            warnings=["请检查 arguments 是否符合工具 input_schema。"],
        )

    return ToolExecutionResponse(
        success=True,
        toolName=request.toolName,
        result=result,
        message="工具执行成功",
    )
