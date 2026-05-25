from typing import Dict, List

from pydantic import JsonValue

from app.agent.tools.base import (
    BaseTool,
    StrictToolModel,
    ToolArguments,
    ToolDefinition,
    ToolResult,
)
from app.schemas.planner import AssetType


VALID_ASSET_TYPES: set[AssetType] = {
    "potion",
    "coin",
    "slime",
    "sword",
    "tile",
}
PALETTE_FIELDS = {"primary", "secondary", "accent", "outline", "background"}


class ValidateArguments(StrictToolModel):
    plan: Dict[str, JsonValue]


class ValidateResult(StrictToolModel):
    valid: bool
    warnings: List[str]


class ValidateTool(BaseTool):
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="asset_pack.validate",
            description="校验素材包计划是否满足基础规则。",
            input_schema=ValidateArguments.model_json_schema(),
            output_schema=ValidateResult.model_json_schema(),
            category="validation",
        )

    def run(self, arguments: ToolArguments) -> ToolResult:
        request = ValidateArguments.model_validate(arguments)
        warnings: List[str] = []
        assets = request.plan.get("assets")
        palette = request.plan.get("palette")

        if not isinstance(palette, dict):
            warnings.append("素材包缺少 palette。")
        elif not PALETTE_FIELDS.issubset(palette):
            warnings.append("素材包 palette 字段不完整。")

        if not isinstance(assets, list) or not assets:
            warnings.append("素材包 assets 不能为空。")
            return ValidateResult(valid=False, warnings=warnings).model_dump()

        seeds: set[int] = set()
        variants: Dict[str, set[str]] = {}

        for index, asset in enumerate(assets, start=1):
            if not isinstance(asset, dict):
                warnings.append(f"第 {index} 个素材不是合法对象。")
                continue

            asset_type = asset.get("type")
            seed = asset.get("seed")
            variant = asset.get("variant")

            if not isinstance(asset_type, str) or asset_type not in VALID_ASSET_TYPES:
                warnings.append(f"第 {index} 个素材 type 不合法。")

            if not isinstance(seed, int) or isinstance(seed, bool):
                warnings.append(f"第 {index} 个素材 seed 不合法。")
            elif seed in seeds:
                warnings.append("素材包中存在重复 seed。")
            else:
                seeds.add(seed)

            if not isinstance(variant, str) or not variant:
                warnings.append(f"第 {index} 个素材缺少 variant。")
            elif isinstance(asset_type, str):
                type_variants = variants.setdefault(asset_type, set())

                if variant in type_variants:
                    warnings.append(f"{asset_type} 类型存在重复 variant。")

                type_variants.add(variant)

        return ValidateResult(valid=not warnings, warnings=warnings).model_dump()
