from fastapi import APIRouter

from app.core.config import get_settings
from app.planner.fallback_planner import fallback_parse_prompt
from app.planner.llm_planner import plan_with_llm
from app.schemas.planner import PlanRequest, PlanResponse


router = APIRouter(prefix="/api", tags=["planner"])


def _fallback_response(prompt: str, message: str = "规划成功") -> PlanResponse:
    try:
        return PlanResponse(
            success=True,
            source="fallback",
            plan=fallback_parse_prompt(prompt),
            message=message,
        )
    except Exception:
        return PlanResponse(
            success=False,
            source="fallback",
            message="规划失败，请重试",
        )


@router.post("/plan", response_model=PlanResponse)
def create_plan(request: PlanRequest) -> PlanResponse:
    settings = get_settings()

    if settings.llm_enabled and settings.dashscope_api_key:
        try:
            return PlanResponse(
                success=True,
                source="llm",
                plan=plan_with_llm(request.prompt, settings),
                message="规划成功",
            )
        except Exception:
            return _fallback_response(
                request.prompt,
                message="LLM 规划失败，已使用 fallback 规划",
            )

    return _fallback_response(request.prompt)
