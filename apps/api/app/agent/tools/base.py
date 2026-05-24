from abc import ABC, abstractmethod
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field, JsonValue


ToolArguments = Dict[str, JsonValue]
ToolResult = Dict[str, JsonValue]


class StrictToolModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ToolDefinition(StrictToolModel):
    name: str
    description: str
    input_schema: Dict[str, JsonValue]
    output_schema: Dict[str, JsonValue]
    category: str
    enabled: bool = True


class ToolExecutionRequest(StrictToolModel):
    toolName: str
    arguments: ToolArguments = Field(default_factory=dict)


class ToolExecutionResponse(StrictToolModel):
    success: bool
    toolName: str
    result: Optional[ToolResult] = None
    message: str
    warnings: List[str] = Field(default_factory=list)


class ToolListResponse(StrictToolModel):
    success: bool
    tools: List[ToolDefinition]


class BaseTool(ABC):
    @abstractmethod
    def definition(self) -> ToolDefinition:
        """返回可供后续 Agent 适配的结构化工具描述。"""

    @abstractmethod
    def run(self, arguments: ToolArguments) -> ToolResult:
        """使用本地确定性逻辑执行工具。"""
