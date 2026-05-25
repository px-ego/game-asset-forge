from collections import Counter
import json
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.planner import AssetCount, AssetSize, AssetStyle, AssetType, Theme


Rarity = Literal["common", "rare", "epic"]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class AssetPalette(StrictModel):
    primary: str = Field(min_length=1)
    secondary: str = Field(min_length=1)
    accent: str = Field(min_length=1)
    outline: str = Field(min_length=1)
    background: str = Field(min_length=1)


class RenderHints(StrictModel):
    shape: Optional[str] = None
    material: Optional[str] = None
    decoration: Optional[str] = None
    glow: Optional[bool] = None
    effect: Optional[str] = None
    emotion: Optional[str] = None
    pattern: Optional[str] = None
    rarity: Optional[Rarity] = None


def normalize_render_hints(payload: object) -> object:
    if not isinstance(payload, dict):
        return payload

    normalized_payload = dict(payload)
    glow = normalized_payload.get("glow")

    if isinstance(glow, str):
        normalized_payload["glow"] = True
        normalized_payload["effect"] = glow

    return normalized_payload


def normalize_planned_asset_render_hints(payload: object) -> object:
    if not isinstance(payload, dict):
        return payload

    normalized_payload = dict(payload)

    if "renderHints" in normalized_payload:
        normalized_payload["renderHints"] = normalize_render_hints(
            normalized_payload["renderHints"]
        )

    return normalized_payload


class PlannedAsset(StrictModel):
    id: str = Field(min_length=1)
    type: AssetType
    name: str = Field(min_length=1)
    description: str = Field(min_length=1)
    variant: str = Field(min_length=1)
    seed: int
    renderHints: RenderHints


class AssetPackPlan(StrictModel):
    goal: str = Field(min_length=1)
    theme: Theme
    style: AssetStyle
    size: AssetSize
    count: AssetCount
    palette: AssetPalette
    globalStyleHints: List[str]
    assets: List[PlannedAsset] = Field(min_length=1)

    @model_validator(mode="after")
    def validate_asset_variants(self) -> "AssetPackPlan":
        asset_ids = [asset.id for asset in self.assets]

        if len(asset_ids) != len(set(asset_ids)):
            raise ValueError("assets 中的 id 不允许重复")

        grouped_values: dict[str, dict[str, set[str]]] = {}

        for asset in self.assets:
            values = grouped_values.setdefault(
                asset.type,
                {
                    "name": set(),
                    "description": set(),
                    "variant": set(),
                    "renderHints": set(),
                },
            )
            render_hints = json.dumps(
                asset.renderHints.model_dump(exclude_none=True),
                ensure_ascii=False,
                sort_keys=True,
            )
            differentiators = {
                "name": asset.name,
                "description": asset.description,
                "variant": asset.variant,
                "renderHints": render_hints,
            }

            for field_name, field_value in differentiators.items():
                if field_value in values[field_name]:
                    raise ValueError(f"同类型素材必须使用不同 {field_name}")

                values[field_name].add(field_value)

        asset_counts = Counter(asset.type for asset in self.assets)

        if any(item_count != self.count for item_count in asset_counts.values()):
            raise ValueError("每种素材数量必须与 count 一致")

        return self


class PlanPackRequest(StrictModel):
    prompt: str = ""
    theme: Optional[Theme] = None
    style: Optional[AssetStyle] = None
    size: Optional[AssetSize] = None
    count: Optional[AssetCount] = None
    assetTypes: Optional[List[AssetType]] = None


class PlanPackResponse(StrictModel):
    success: bool
    source: Literal["llm", "fallback"]
    plan: AssetPackPlan
    message: str
    warnings: List[str] = Field(default_factory=list)
