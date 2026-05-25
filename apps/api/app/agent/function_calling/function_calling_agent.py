import json
from typing import List

from openai import OpenAI
from pydantic import Field, JsonValue

from app.agent.function_calling.tool_result_assembler import (
    ExecutedToolResult,
    assemble_asset_pack_plan,
)
from app.agent.function_calling.tool_argument_normalizer import (
    PlanConstraints,
    build_plan_constraints,
    normalize_tool_arguments,
)
from app.agent.function_calling.tool_schema_builder import (
    build_openai_tools_schema,
    resolve_registry_tool_name,
)
from app.agent.tools.base import StrictToolModel, ToolArguments
from app.agent.tools.registry import execute_tool
from app.core.config import (
    DASHSCOPE_API_KEY,
    DASHSCOPE_BASE_URL,
    DASHSCOPE_MODEL,
    LLM_ENABLED,
)
from app.schemas.asset_pack import AssetPackPlan, PlanPackRequest
from app.schemas.function_agent import FunctionToolCall


FUNCTION_CALLING_SYSTEM_PROMPT = """
你是 GameAssetForge 的 Function Calling Planner Agent。
你不直接生成图片。你必须通过工具规划素材包，由应用侧执行工具并组装 AssetPackPlan。
先调用 palette_generate 生成色板。
再对用户要求的每一种素材类型各调用一次 variant_generate，生成 count 个不同 variant。
必要时可以调用 asset_pack_validate 或 export_describe。
当前仅支持 coin, potion, slime, sword, tile；开放需求必须映射到最接近的支持类型。
工具参数必须遵循用户目标和消息中的 resolvedConstraints。
palette_generate 的 theme 与 style 必须与 resolvedConstraints 一致。
variant_generate 的 assetType 必须来自 resolvedConstraints.assetTypes，theme 与 count 也必须一致。
如果构造包含 renderHints 的计划参数，renderHints.glow 只能使用 true 或 false。
发光颜色、闪烁、脉冲、网格光效等描述必须写入 renderHints.effect 字符串。
不要输出 markdown。如果需要输出 JSON，必须输出合法 JSON。
请优先在同一个响应中返回需要的全部 tool_calls。
""".strip()
MAX_TOOL_CALL_ROUNDS = 6


class FunctionCallingUnavailableError(RuntimeError):
    pass


class FunctionCallingToolError(RuntimeError):
    pass


class FunctionCallingPlanResult(StrictToolModel):
    plan: AssetPackPlan
    toolCalls: List[FunctionToolCall] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


def _build_user_message(
    request: PlanPackRequest,
    constraints: PlanConstraints,
) -> str:
    request_payload = {
        "request": request.model_dump(exclude_none=True),
        "resolvedConstraints": constraints.model_dump(),
    }

    return (
        "请根据以下用户目标和可选约束调用工具完成素材包规划。"
        "resolvedConstraints 是后端解析出的全局约束，工具参数必须遵守。"
        f"\n{json.dumps(request_payload, ensure_ascii=False)}"
    )


def _parse_tool_arguments(raw_arguments: str) -> ToolArguments:
    parsed_arguments: JsonValue = json.loads(raw_arguments or "{}")

    if not isinstance(parsed_arguments, dict):
        raise FunctionCallingToolError("工具参数必须是 JSON 对象")

    return parsed_arguments


def _ensure_required_calls(
    constraints: PlanConstraints,
    executed_results: List[ExecutedToolResult],
) -> None:
    tool_names = [result.tool_name for result in executed_results]

    if "palette.generate" not in tool_names:
        raise FunctionCallingToolError("模型未调用 palette.generate")

    palette_results = [
        result
        for result in executed_results
        if result.tool_name == "palette.generate"
    ]

    if not any(
        result.arguments.get("theme") == constraints.theme
        and result.arguments.get("style") == constraints.style
        for result in palette_results
    ):
        raise FunctionCallingToolError("色板工具未按归一化约束执行")

    generated_types: List[str] = []

    for result in executed_results:
        if result.tool_name != "variant.generate":
            continue

        asset_type = result.arguments.get("assetType")

        if (
            isinstance(asset_type, str)
            and result.arguments.get("theme") == constraints.theme
            and result.arguments.get("count") == constraints.count
        ):
            generated_types.append(asset_type)

    missing_types = [
        asset_type
        for asset_type in constraints.assetTypes
        if asset_type not in generated_types
    ]

    if missing_types:
        raise FunctionCallingToolError("模型未为全部素材类型调用 variant.generate")


def _has_required_calls(
    constraints: PlanConstraints,
    executed_results: List[ExecutedToolResult],
) -> bool:
    try:
        _ensure_required_calls(constraints, executed_results)
    except FunctionCallingToolError:
        return False

    return True


def _complete_missing_variant_calls(
    constraints: PlanConstraints,
    executed_results: List[ExecutedToolResult],
    call_summaries: List[FunctionToolCall],
) -> List[str]:
    generated_types = {
        result.arguments.get("assetType")
        for result in executed_results
        if result.tool_name == "variant.generate"
        and result.arguments.get("theme") == constraints.theme
        and result.arguments.get("count") == constraints.count
    }
    warnings: List[str] = []

    for asset_type in constraints.assetTypes:
        if asset_type in generated_types:
            continue

        arguments: ToolArguments = {
            "assetType": asset_type,
            "count": constraints.count,
            "theme": constraints.theme,
            "prompt": constraints.prompt,
        }
        warning = f"variant.generate 未覆盖 {asset_type}，已按全局约束补齐"
        result = execute_tool("variant.generate", arguments)
        executed_results.append(
            ExecutedToolResult(
                tool_name="variant.generate",
                arguments=arguments,
                result=result,
            )
        )
        call_summaries.append(
            FunctionToolCall(
                toolName="variant.generate",
                rawArguments={},
                normalizedArguments=arguments,
                arguments=arguments,
                success=True,
                warnings=[warning],
            )
        )
        warnings.append(warning)

    return warnings


def run_function_calling_agent(request: PlanPackRequest) -> FunctionCallingPlanResult:
    if not LLM_ENABLED or not DASHSCOPE_API_KEY:
        raise FunctionCallingUnavailableError("Function Calling 未启用")

    client = OpenAI(
        api_key=DASHSCOPE_API_KEY,
        base_url=DASHSCOPE_BASE_URL,
        timeout=60.0,
        max_retries=0,
    )
    constraints = build_plan_constraints(request)
    messages: List[dict[str, JsonValue]] = [
        {"role": "system", "content": FUNCTION_CALLING_SYSTEM_PROMPT},
        {"role": "user", "content": _build_user_message(request, constraints)},
    ]
    tools = build_openai_tools_schema()
    executed_results: List[ExecutedToolResult] = []
    call_summaries: List[FunctionToolCall] = []
    normalization_warnings: List[str] = []

    for _round_index in range(MAX_TOOL_CALL_ROUNDS):
        completion = client.chat.completions.create(
            model=DASHSCOPE_MODEL,
            messages=messages,
            tools=tools,
            tool_choice="auto",
            temperature=0.2,
            max_tokens=1000,
        )
        tool_calls = completion.choices[0].message.tool_calls

        if not tool_calls:
            break

        assistant_tool_calls: List[dict[str, JsonValue]] = []

        for tool_call in tool_calls:
            registry_tool_name = resolve_registry_tool_name(tool_call.function.name)

            if registry_tool_name is None:
                raise FunctionCallingToolError("模型选择了未注册工具")

            raw_arguments = _parse_tool_arguments(tool_call.function.arguments)
            normalized = normalize_tool_arguments(
                registry_tool_name,
                raw_arguments,
                constraints,
            )
            arguments = normalized.arguments

            for warning in normalized.warnings:
                if warning not in normalization_warnings:
                    normalization_warnings.append(warning)

            if normalized.skip_execution:
                result: ToolArguments = {
                    "skipped": True,
                    "warnings": normalized.warnings,
                }
            else:
                result = execute_tool(registry_tool_name, arguments)
                executed_results.append(
                    ExecutedToolResult(
                        tool_name=registry_tool_name,
                        arguments=arguments,
                        result=result,
                    )
                )
            call_summaries.append(
                FunctionToolCall(
                    toolName=registry_tool_name,
                    rawArguments=raw_arguments,
                    normalizedArguments=arguments,
                    arguments=arguments,
                    success=True,
                    warnings=normalized.warnings,
                )
            )
            assistant_tool_calls.append(
                {
                    "id": tool_call.id,
                    "type": "function",
                    "function": {
                        "name": tool_call.function.name,
                        "arguments": tool_call.function.arguments,
                    },
                }
            )
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result, ensure_ascii=False),
                }
            )

        messages.insert(
            len(messages) - len(tool_calls),
            {
                "role": "assistant",
                "tool_calls": assistant_tool_calls,
            },
        )

        if _has_required_calls(constraints, executed_results):
            break

    if "palette.generate" in [result.tool_name for result in executed_results]:
        normalization_warnings.extend(
            _complete_missing_variant_calls(
                constraints,
                executed_results,
                call_summaries,
            )
        )

    _ensure_required_calls(constraints, executed_results)
    assembled = assemble_asset_pack_plan(request, executed_results)

    return FunctionCallingPlanResult(
        plan=assembled.plan,
        toolCalls=call_summaries,
        warnings=[*normalization_warnings, *assembled.warnings],
    )
