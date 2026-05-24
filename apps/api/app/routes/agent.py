from collections import Counter

from fastapi import APIRouter
from openai import APITimeoutError, AuthenticationError
from pydantic import ValidationError

from app.core.config import DASHSCOPE_API_KEY, LLM_ENABLED
from app.planner.bailian_pack_planner import plan_asset_pack_with_bailian
from app.planner.fallback_pack_planner import fallback_pack_plan
from app.schemas.asset_pack import AssetPackPlan, PlanPackRequest, PlanPackResponse


router = APIRouter(prefix="/api/agent", tags=["agent"])


def _log_llm_failure(exc: Exception) -> None:
    details = repr(exc)

    if DASHSCOPE_API_KEY:
        details = details.replace(DASHSCOPE_API_KEY, "[REDACTED]")

    print("===== LLM PLAN FAILED =====")
    print(type(exc).__name__)
    print(details)
    print("===========================")


def _fallback_message_for_exception(exc: Exception) -> str:
    if isinstance(exc, APITimeoutError):
        return "LLM 请求超时，已使用 fallback。"

    if isinstance(exc, ValidationError):
        return "LLM 输出结构不合法，已使用 fallback。"

    if isinstance(exc, AuthenticationError):
        return "LLM 鉴权失败，已使用 fallback。"

    return "LLM 调用失败，已使用 fallback。"


def _create_fallback_plan(request: PlanPackRequest) -> AssetPackPlan:
    return fallback_pack_plan(
        prompt=request.prompt,
        theme=request.theme,
        style=request.style,
        size=request.size,
        count=request.count,
        asset_types=request.assetTypes,
    )


def _collect_plan_warnings(plan: AssetPackPlan) -> list[str]:
    seed_counts = Counter(asset.seed for asset in plan.assets)

    if any(count > 1 for count in seed_counts.values()):
        return ["规划结果存在重复 seed，渲染结果可能不够丰富。"]

    return []


@router.post(
    "/plan-pack",
    response_model=PlanPackResponse,
    response_model_exclude_none=True,
)
def create_asset_pack_plan(request: PlanPackRequest) -> PlanPackResponse:
    if LLM_ENABLED and DASHSCOPE_API_KEY:
        try:
            plan = plan_asset_pack_with_bailian(request)
            print("===== LLM PLAN SUCCESS =====")
            return PlanPackResponse(
                success=True,
                source="llm",
                plan=plan,
                message="LLM 规划成功",
                warnings=_collect_plan_warnings(plan),
            )
        except Exception as exc:
            _log_llm_failure(exc)
            plan = _create_fallback_plan(request)
            return PlanPackResponse(
                success=True,
                source="fallback",
                plan=plan,
                message=_fallback_message_for_exception(exc),
                warnings=_collect_plan_warnings(plan),
            )

    plan = _create_fallback_plan(request)
    return PlanPackResponse(
        success=True,
        source="fallback",
        plan=plan,
        message="当前未启用 LLM，已使用 fallback 规划",
        warnings=_collect_plan_warnings(plan),
    )
