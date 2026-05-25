import json

from openai import OpenAI

from app.core.config import (
    DASHSCOPE_API_KEY,
    DASHSCOPE_BASE_URL,
    DASHSCOPE_MODEL,
)
from app.planner.fallback_pack_planner import assemble_art_direction_plan
from app.planner.prompt_templates import (
    ART_DIRECTION_SYSTEM_PROMPT,
    build_art_direction_user_prompt,
)
from app.schemas.asset_pack import ArtDirectionPlan, AssetPackPlan, PlanPackRequest


def _parse_json_payload(content: str) -> object:
    candidate = content.strip()

    if candidate.startswith("```"):
        first_line_end = candidate.find("\n")
        closing_fence = candidate.rfind("```")

        if first_line_end >= 0 and closing_fence > first_line_end:
            candidate = candidate[first_line_end + 1 : closing_fence].strip()

    try:
        return json.loads(candidate)
    except json.JSONDecodeError as initial_error:
        object_start = candidate.find("{")
        object_end = candidate.rfind("}")

        if object_start >= 0 and object_end > object_start:
            return json.loads(candidate[object_start : object_end + 1])

        raise initial_error


def plan_asset_pack_with_bailian(request: PlanPackRequest) -> AssetPackPlan:
    if not DASHSCOPE_API_KEY:
        raise RuntimeError("未配置百炼规划服务")

    client = OpenAI(
        api_key=DASHSCOPE_API_KEY,
        base_url=DASHSCOPE_BASE_URL,
        timeout=60.0,
        max_retries=0,
    )
    completion = client.chat.completions.create(
        model=DASHSCOPE_MODEL,
        messages=[
            {"role": "system", "content": ART_DIRECTION_SYSTEM_PROMPT},
            {"role": "user", "content": build_art_direction_user_prompt(request)},
        ],
        temperature=0.2,
        max_tokens=700,
        extra_body={"response_format": {"type": "json_object"}},
    )
    content = completion.choices[0].message.content

    if not content:
        raise ValueError("规划响应为空")

    payload = _parse_json_payload(content)
    direction = ArtDirectionPlan.model_validate(payload)

    return assemble_art_direction_plan(direction, request)
