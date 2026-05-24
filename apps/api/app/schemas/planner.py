from typing import List, Literal, Optional

from pydantic import BaseModel, field_validator


Theme = Literal["forest", "dungeon", "cyberpunk"]
AssetStyle = Literal["pixel", "cartoon"]
AssetType = Literal["potion", "coin", "slime", "sword", "tile"]
AssetSize = Literal[32, 64, 128]
AssetCount = Literal[1, 4, 8]


class PlanRequest(BaseModel):
    prompt: str = ""


class AssetPlan(BaseModel):
    theme: Theme
    style: AssetStyle
    assetTypes: List[AssetType]
    size: AssetSize
    count: AssetCount

    @field_validator("assetTypes")
    @classmethod
    def validate_asset_types(cls, value: List[AssetType]) -> List[AssetType]:
        if not value:
            raise ValueError("素材类型至少包含一项")

        if len(value) != len(set(value)):
            raise ValueError("素材类型不能重复")

        return value


class PlanResponse(BaseModel):
    success: bool
    source: Literal["fallback", "llm"] = "fallback"
    plan: Optional[AssetPlan] = None
    message: str
