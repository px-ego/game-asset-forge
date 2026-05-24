import json
from typing import Optional

from openai import OpenAI
from pydantic import ValidationError

from app.core.config import Settings, get_settings
from app.planner.prompt_templates import PLANNER_SYSTEM_PROMPT
from app.schemas.planner import AssetPlan


class LlmPlannerError(Exception):
    """Raised when an LLM response cannot produce a valid AssetPlan."""


def plan_with_llm(prompt: str, settings: Optional[Settings] = None) -> AssetPlan:
    active_settings = settings or get_settings()

    if not active_settings.dashscope_api_key:
        raise LlmPlannerError("LLM 配置不完整")

    client = OpenAI(
        api_key=active_settings.dashscope_api_key,
        base_url=active_settings.dashscope_base_url,
        max_retries=0,
        timeout=30.0,
    )
    completion = client.chat.completions.create(
        model=active_settings.dashscope_model,
        messages=[
            {"role": "system", "content": PLANNER_SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
        max_tokens=300,
    )

    content = completion.choices[0].message.content

    if not content:
        raise LlmPlannerError("LLM 未返回规划内容")

    try:
        data = json.loads(content)
    except json.JSONDecodeError as error:
        raise LlmPlannerError("LLM 返回内容不是有效 JSON") from error

    try:
        return AssetPlan.model_validate(data)
    except ValidationError as error:
        raise LlmPlannerError("LLM 返回计划未通过校验") from error
