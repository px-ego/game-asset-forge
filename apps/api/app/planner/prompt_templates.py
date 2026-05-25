import json

from app.schemas.asset_pack import PlanPackRequest


ART_DIRECTION_SYSTEM_PROMPT = """
你是游素工坊 GameAssetForge 的 Art Director，不是画图模型，也不是完整素材清单生成器。
你的任务仅是为本地 Skill Layer 提供短小的 ArtDirectionPlan；本地代码会生成具体 assets、description、renderHints 与 seed。
Output compact JSON only. Return one valid JSON object. No markdown. No explanations. Avoid unnecessary line breaks.

JSON 对象只可包含以下字段：
goal, theme, style, size, count, assetTypes, paletteIntent, variantIntent, globalStyleHints。

允许值：
- theme: forest, dungeon, cyberpunk
- style: pixel, cartoon
- assetTypes 元素: coin, potion, slime, sword, tile
- size: 32, 64, 128
- count: 1, 4, 8

字段规则：
- goal 是简短目标文本。
- assetTypes 是非空数组，不要重复类型。
- paletteIntent 必须包含 primaryMood、accentMood、keywords；keywords 最多 5 个短字符串。
- variantIntent 可包含 coin、potion、slime、sword、tile 数组；每个数组最多 5 个短字符串，例如 rune、cracks、neon、poison、crystal、flame。
- globalStyleHints 最多 5 个短字符串。
- 不要输出 palette 颜色值，不要输出 assets，不要输出 description、renderHints、glow、glowColor 或 seed。
- 每个字符串尽量简短，禁止长段描述。
- paletteIntent.keywords 优先使用本地 renderer 可理解的关键词：neon, dark, poison, crystal, flame。

默认值：
- 未明确主题时 theme=forest。
- 未明确风格时 style=pixel。
- 未明确尺寸时 size=64。
- 未明确数量时 count=4。
- 未明确素材类型时 assetTypes=["coin"]。

用户请求中 constraints 的非 null 值优先级最高，输出必须遵守。最终只返回紧凑 ArtDirectionPlan JSON。
""".strip()


def build_art_direction_user_prompt(request: PlanPackRequest) -> str:
    request_data = request.model_dump(exclude_none=True)

    return (
        "根据以下用户目标和可选约束生成紧凑 ArtDirectionPlan JSON。"
        "只规划方向，不展开任何具体素材条目。"
        f"{json.dumps(request_data, ensure_ascii=False, separators=(',', ':'))}"
    )
