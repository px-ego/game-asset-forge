import hashlib
import json

from openai import OpenAI

from app.core.config import (
    DASHSCOPE_API_KEY,
    DASHSCOPE_BASE_URL,
    DASHSCOPE_MODEL,
)
from app.planner.prompt_templates import (
    ASSET_PACK_SYSTEM_PROMPT,
    build_asset_pack_user_prompt,
)
from app.schemas.asset_pack import AssetPackPlan, PlanPackRequest


def _stable_integer_seed(value: str) -> int:
    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()
    return int(digest[:8], 16) or 1


def _normalize_seed(value: object) -> object:
    if isinstance(value, bool) or isinstance(value, int):
        return value

    if isinstance(value, str):
        stripped_value = value.strip()

        try:
            return int(stripped_value)
        except ValueError:
            return _stable_integer_seed(stripped_value)

    return value


def _normalize_llm_plan(payload: object) -> object:
    if not isinstance(payload, dict):
        return payload

    assets = payload.get("assets")

    if not isinstance(assets, list):
        return payload

    normalized_assets: list[object] = []
    used_seeds: set[int] = set()

    for asset in assets:
        if not isinstance(asset, dict):
            normalized_assets.append(asset)
            continue

        normalized_asset = dict(asset)

        if "seed" in normalized_asset:
            seed = _normalize_seed(normalized_asset["seed"])

            if isinstance(seed, int) and not isinstance(seed, bool):
                while seed in used_seeds:
                    seed += 1

                used_seeds.add(seed)

            normalized_asset["seed"] = seed

        normalized_assets.append(normalized_asset)

    return {**payload, "assets": normalized_assets}


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
            {"role": "system", "content": ASSET_PACK_SYSTEM_PROMPT},
            {"role": "user", "content": build_asset_pack_user_prompt(request)},
        ],
        temperature=0.2,
        max_tokens=1600,
        extra_body={"response_format": {"type": "json_object"}},
    )
    content = completion.choices[0].message.content

    if not content:
        raise ValueError("规划响应为空")

    payload = json.loads(content)
    normalized_payload = _normalize_llm_plan(payload)

    return AssetPackPlan.model_validate(normalized_payload)
