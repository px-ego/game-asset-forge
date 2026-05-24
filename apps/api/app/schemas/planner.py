from typing import List, Literal, Optional

from pydantic import BaseModel


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


class PlanResponse(BaseModel):
    success: bool
    source: Literal["fallback"] = "fallback"
    plan: Optional[AssetPlan] = None
    message: str
