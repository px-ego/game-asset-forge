from fastapi import APIRouter
from openai import APITimeoutError, AuthenticationError
from pydantic import ValidationError

from app.agent.function_calling.function_calling_agent import (
    FunctionCallingToolError,
    FunctionCallingUnavailableError,
    run_function_calling_agent,
)
from app.core.config import DASHSCOPE_API_KEY
from app.planner.fallback_pack_planner import fallback_pack_plan
from app.schemas.asset_pack import PlanPackRequest
from app.schemas.function_agent import FunctionPlanResponse


router = APIRouter(prefix="/api/agent", tags=["agent"])


def _fallback_response(
    request: PlanPackRequest,
    message: str,
) -> FunctionPlanResponse:
    return FunctionPlanResponse(
        success=True,
        source="fallback",
        plan=fallback_pack_plan(
            prompt=request.prompt,
            theme=request.theme,
            style=request.style,
            size=request.size,
            count=request.count,
            asset_types=request.assetTypes,
        ),
        message=message,
    )


def _log_function_calling_failure(exc: Exception) -> None:
    details = repr(exc)

    if DASHSCOPE_API_KEY:
        details = details.replace(DASHSCOPE_API_KEY, "[REDACTED]")

    print("===== FUNCTION CALLING FAILED =====")
    print(type(exc).__name__)
    print(details)
    print("===================================")


@router.post(
    "/function-plan",
    response_model=FunctionPlanResponse,
    response_model_exclude_none=True,
)
def create_function_plan(request: PlanPackRequest) -> FunctionPlanResponse:
    try:
        result = run_function_calling_agent(request)
        print("===== FUNCTION CALLING SUCCESS =====")
        return FunctionPlanResponse(
            success=True,
            source="function_calling",
            plan=result.plan,
            message="Function Calling 规划成功",
            toolCalls=result.toolCalls,
            warnings=result.warnings,
        )
    except FunctionCallingUnavailableError:
        return _fallback_response(
            request,
            "当前未启用 Function Calling，已使用 fallback 规划。",
        )
    except APITimeoutError as exc:
        _log_function_calling_failure(exc)
        return _fallback_response(request, "Function Calling 请求超时，已使用 fallback。")
    except AuthenticationError as exc:
        _log_function_calling_failure(exc)
        return _fallback_response(request, "Function Calling 鉴权失败，已使用 fallback。")
    except ValidationError as exc:
        _log_function_calling_failure(exc)
        return _fallback_response(request, "工具参数或计划结构不合法，已使用 fallback。")
    except FunctionCallingToolError as exc:
        _log_function_calling_failure(exc)
        return _fallback_response(request, "模型工具调用不完整，已使用 fallback。")
    except Exception as exc:
        _log_function_calling_failure(exc)
        return _fallback_response(request, "Function Calling 执行失败，已使用 fallback。")
