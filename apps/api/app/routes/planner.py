from fastapi import APIRouter

from app.planner.fallback_planner import fallback_parse_prompt
from app.schemas.planner import PlanRequest, PlanResponse


router = APIRouter(prefix="/api", tags=["planner"])


@router.post("/plan", response_model=PlanResponse)
def create_plan(request: PlanRequest) -> PlanResponse:
    try:
        plan = fallback_parse_prompt(request.prompt)

        return PlanResponse(
            success=True,
            plan=plan,
            message="规划成功",
        )
    except Exception:
        return PlanResponse(
            success=False,
            message="规划失败，请重试",
        )
