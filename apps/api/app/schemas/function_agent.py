from typing import Dict, List, Literal

from pydantic import Field, JsonValue

from app.schemas.asset_pack import AssetPackPlan, StrictModel


class FunctionToolCall(StrictModel):
    toolName: str
    rawArguments: Dict[str, JsonValue]
    normalizedArguments: Dict[str, JsonValue]
    arguments: Dict[str, JsonValue]
    success: bool
    warnings: List[str] = Field(default_factory=list)


class FunctionPlanResponse(StrictModel):
    success: bool
    source: Literal["function_calling", "fallback"]
    plan: AssetPackPlan
    message: str
    toolCalls: List[FunctionToolCall] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
