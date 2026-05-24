import hashlib
from typing import Dict, List, Optional, Sequence, Tuple

from app.planner.fallback_planner import fallback_parse_prompt
from app.schemas.asset_pack import AssetPackPlan, AssetPalette, PlannedAsset, RenderHints
from app.schemas.planner import AssetCount, AssetSize, AssetStyle, AssetType, Theme


VariantDefinition = Tuple[str, str, str, RenderHints]

THEME_DESCRIPTIONS: Dict[Theme, str] = {
    "forest": "森林气息的",
    "dungeon": "地牢氛围的",
    "cyberpunk": "赛博朋克风格的",
}

BASE_PALETTES: Dict[Theme, AssetPalette] = {
    "forest": AssetPalette(
        primary="#63a657",
        secondary="#825f3d",
        accent="#c4d765",
        outline="#213b2a",
        background="#172c24",
    ),
    "dungeon": AssetPalette(
        primary="#807895",
        secondary="#57496d",
        accent="#ad82d7",
        outline="#292536",
        background="#211f2c",
    ),
    "cyberpunk": AssetPalette(
        primary="#197bb9",
        secondary="#6634a8",
        accent="#19e6dc",
        outline="#131d43",
        background="#101c38",
    ),
}

VARIANT_DEFINITIONS: Dict[AssetType, Sequence[VariantDefinition]] = {
    "coin": (
        ("common_coin", "普通金币", "经典圆形金币", RenderHints(material="gold", decoration="plain", rarity="common")),
        ("cracked_coin", "裂纹金币", "表面留有清晰裂纹", RenderHints(material="gold", decoration="cracks", rarity="common")),
        ("rune_coin", "符文金币", "中心刻有符文标记", RenderHints(material="gold", decoration="rune", rarity="rare")),
        ("gem_coin", "宝石金币", "中心镶嵌明亮宝石", RenderHints(material="gold", decoration="gem", rarity="rare")),
        ("cursed_coin", "诅咒金币", "缠绕幽紫光晕", RenderHints(decoration="curse", glow=True, rarity="epic")),
        ("royal_coin", "王冠金币", "压印王冠纹样", RenderHints(decoration="crown", rarity="rare")),
        ("frost_coin", "冰晶金币", "带有冰晶刻痕", RenderHints(decoration="frost", glow=True, rarity="rare")),
        ("neon_coin", "霓虹代币", "闪耀科技光环", RenderHints(decoration="ring", glow=True, rarity="epic")),
    ),
    "potion": (
        ("healing_potion", "治疗药水", "充盈恢复能量的药剂", RenderHints(material="healing", decoration="cross", rarity="common")),
        ("poison_potion", "毒液药水", "翻滚气泡的毒液", RenderHints(material="poison", decoration="bubbles", rarity="common")),
        ("mana_potion", "魔力药水", "流动蓝紫魔力的药剂", RenderHints(material="mana", decoration="spark", glow=True, rarity="rare")),
        ("crystal_potion", "水晶药水", "瓶内析出晶体的药剂", RenderHints(material="crystal", decoration="crystal", rarity="rare")),
        ("fire_potion", "火焰药水", "装载火焰力量的药剂", RenderHints(material="fire", decoration="flame", glow=True, rarity="epic")),
        ("frost_potion", "冰霜药水", "泛着冷光的药剂", RenderHints(material="frost", decoration="snow", rarity="rare")),
        ("shadow_potion", "暗影药水", "幽暗沉静的药剂", RenderHints(material="shadow", decoration="moon", rarity="epic")),
        ("neon_potion", "霓虹药水", "明亮脉冲光芒的药剂", RenderHints(material="neon", decoration="ring", glow=True, rarity="epic")),
    ),
    "slime": (
        ("basic_slime", "普通史莱姆", "表情友好的基础史莱姆", RenderHints(emotion="happy", decoration="plain", rarity="common")),
        ("poison_slime", "毒液史莱姆", "带有毒液斑点的史莱姆", RenderHints(material="poison", decoration="spots", rarity="common")),
        ("crystal_slime", "水晶史莱姆", "顶部长出晶角的史莱姆", RenderHints(material="crystal", decoration="spikes", rarity="rare")),
        ("shadow_slime", "暗影史莱姆", "眼睛泛光的暗影史莱姆", RenderHints(material="shadow", decoration="shadow", glow=True, rarity="rare")),
        ("electric_slime", "电光史莱姆", "闪过电流的史莱姆", RenderHints(decoration="lightning", glow=True, rarity="epic")),
        ("moss_slime", "苔藓史莱姆", "覆有植物斑纹的史莱姆", RenderHints(decoration="moss", rarity="common")),
        ("flame_slime", "火焰史莱姆", "跃动火花的史莱姆", RenderHints(material="fire", decoration="flame", glow=True, rarity="rare")),
        ("neon_slime", "霓虹史莱姆", "科技光纹史莱姆", RenderHints(decoration="ring", glow=True, rarity="epic")),
    ),
    "sword": (
        ("iron_sword", "铁剑", "结构扎实的基础剑刃", RenderHints(material="iron", decoration="plain", rarity="common")),
        ("rune_sword", "符文剑", "剑身刻有符文", RenderHints(decoration="rune", rarity="rare")),
        ("crystal_sword", "水晶剑", "棱角分明的晶体剑刃", RenderHints(material="crystal", decoration="diamond", rarity="rare")),
        ("flame_sword", "火焰剑", "火焰沿剑刃跃动", RenderHints(material="fire", decoration="flame", glow=True, rarity="epic")),
        ("neon_blade", "霓虹光刃", "闪耀霓虹能量的剑刃", RenderHints(material="neon", decoration="neon", glow=True, rarity="epic")),
        ("frost_sword", "冰霜剑", "覆盖寒霜纹理的剑刃", RenderHints(decoration="frost", rarity="rare")),
        ("shadow_sword", "暗影剑", "暗光环绕的剑刃", RenderHints(decoration="shadow", glow=True, rarity="epic")),
        ("royal_sword", "守护长剑", "护手镶嵌纹章的剑刃", RenderHints(decoration="crest", rarity="rare")),
    ),
    "tile": (
        ("stone_tile", "石砖", "规整耐用的地面砖块", RenderHints(material="stone", pattern="plain", decoration="plain", rarity="common")),
        ("cracked_tile", "裂纹地砖", "表面产生断裂纹路", RenderHints(pattern="cracks", decoration="cracks", rarity="common")),
        ("moss_tile", "苔藓地砖", "边缘覆有苔藓", RenderHints(pattern="moss", decoration="moss", rarity="common")),
        ("rune_tile", "符文地砖", "中心镌刻古老符文", RenderHints(pattern="rune", decoration="rune", glow=True, rarity="rare")),
        ("metal_tile", "金属地砖", "带有铆钉的金属板", RenderHints(material="metal", pattern="rivets", decoration="rivets", rarity="rare")),
        ("crystal_tile", "水晶地砖", "晶体镶嵌的地块", RenderHints(pattern="crystal", decoration="gem", rarity="rare")),
        ("lava_tile", "熔岩地砖", "裂缝透出热光", RenderHints(pattern="lava", decoration="flame", glow=True, rarity="epic")),
        ("neon_tile", "霓虹地砖", "边缘发光的科技地块", RenderHints(pattern="circuit", decoration="neon", glow=True, rarity="epic")),
    ),
}


def _create_seed(source: str) -> int:
    digest = hashlib.sha256(source.encode("utf-8")).hexdigest()

    return int(digest[:8], 16) or 1


def _build_palette(theme: Theme, prompt: str) -> tuple[AssetPalette, List[str]]:
    palette = BASE_PALETTES[theme].model_copy(deep=True)
    hints: List[str] = []

    if "霓虹" in prompt or "neon" in prompt:
        palette.accent = "#17f2ec"
        hints.append("霓虹高亮点缀")
    if "暗黑" in prompt or "dark" in prompt:
        palette.background = "#101219"
        palette.outline = "#161520"
        hints.append("暗黑高对比氛围")
    if "毒液" in prompt or "poison" in prompt:
        palette.accent = "#7ce55b"
        hints.append("毒液绿色点缀")
    if "水晶" in prompt or "crystal" in prompt:
        palette.accent = "#60dff2"
        hints.append("水晶冷光质感")
    if "火焰" in prompt or "flame" in prompt:
        palette.accent = "#f56b42"
        hints.append("火焰暖色点缀")

    return palette, hints


def fallback_pack_plan(
    prompt: str,
    theme: Optional[Theme] = None,
    style: Optional[AssetStyle] = None,
    size: Optional[AssetSize] = None,
    count: Optional[AssetCount] = None,
    asset_types: Optional[List[AssetType]] = None,
) -> AssetPackPlan:
    normalized_prompt = (prompt or "").lower()
    parsed_plan = fallback_parse_prompt(normalized_prompt)
    resolved_theme = theme or parsed_plan.theme
    resolved_style = style or parsed_plan.style
    resolved_size = size or parsed_plan.size
    resolved_count = count or parsed_plan.count
    resolved_asset_types = asset_types or parsed_plan.assetTypes
    palette, keyword_hints = _build_palette(resolved_theme, normalized_prompt)
    global_style_hints = [
        "硬边像素造型" if resolved_style == "pixel" else "圆润柔和轮廓",
        *keyword_hints,
    ]
    assets: List[PlannedAsset] = []

    for asset_type in resolved_asset_types:
        definitions = VARIANT_DEFINITIONS[asset_type][:resolved_count]

        for index, (variant, name, description, render_hints) in enumerate(definitions):
            assets.append(
                PlannedAsset(
                    id=f"asset_{asset_type}_{index + 1:03d}",
                    type=asset_type,
                    name=name,
                    description=f"{THEME_DESCRIPTIONS[resolved_theme]}{description}",
                    variant=variant,
                    seed=_create_seed(
                        f"{resolved_theme}:{resolved_style}:{asset_type}:{variant}:{normalized_prompt}"
                    ),
                    renderHints=render_hints,
                )
            )

    return AssetPackPlan(
        goal=prompt.strip() or "手动参数配置",
        theme=resolved_theme,
        style=resolved_style,
        size=resolved_size,
        count=resolved_count,
        palette=palette,
        globalStyleHints=global_style_hints,
        assets=assets,
    )
