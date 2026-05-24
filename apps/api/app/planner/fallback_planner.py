import re
from typing import List, Sequence, Tuple

from app.schemas.planner import AssetPlan


KeywordChoice = Tuple[Sequence[str], str]

THEME_CHOICES: Sequence[KeywordChoice] = (
    (("森林", "forest"), "forest"),
    (("地牢", "dungeon"), "dungeon"),
    (("赛博朋克", "cyberpunk"), "cyberpunk"),
)

STYLE_CHOICES: Sequence[KeywordChoice] = (
    (("像素", "pixel"), "pixel"),
    (("卡通", "cartoon"), "cartoon"),
)

ASSET_CHOICES: Sequence[KeywordChoice] = (
    (("药水", "potion"), "potion"),
    (("金币", "coin"), "coin"),
    (("史莱姆", "slime"), "slime"),
    (("剑", "sword"), "sword"),
    (("地砖", "tile"), "tile"),
)

COUNT_PATTERNS: Sequence[Tuple[str, int]] = (
    ("一个", 1),
    ("四个", 4),
    ("八个", 8),
    (r"(?<!\d)1\s*个", 1),
    (r"(?<!\d)4\s*个", 4),
    (r"(?<!\d)8\s*个", 8),
    (r"(?<!\d)1(?!\d)", 1),
    (r"(?<!\d)4(?!\d)", 4),
    (r"(?<!\d)8(?!\d)", 8),
)


def _find_choice(prompt: str, choices: Sequence[KeywordChoice], default: str) -> str:
    matches: List[Tuple[int, int, str]] = []

    for choice_index, (keywords, value) in enumerate(choices):
        positions = [
            prompt.find(keyword)
            for keyword in keywords
            if prompt.find(keyword) >= 0
        ]

        if positions:
            matches.append((min(positions), choice_index, value))

    return min(matches)[2] if matches else default


def _find_asset_types(prompt: str) -> List[str]:
    matches: List[Tuple[int, int, str]] = []

    for choice_index, (keywords, asset_type) in enumerate(ASSET_CHOICES):
        positions = [
            prompt.find(keyword)
            for keyword in keywords
            if prompt.find(keyword) >= 0
        ]

        if positions:
            matches.append((min(positions), choice_index, asset_type))

    return [match[2] for match in sorted(matches)] or ["coin"]


def _find_size(prompt: str) -> int:
    match = re.search(r"(?<!\d)(32|64|128)(?!\d)", prompt)

    return int(match.group(1)) if match else 64


def _find_count(prompt: str) -> int:
    matches: List[Tuple[int, int, int]] = []

    for pattern_index, (pattern, value) in enumerate(COUNT_PATTERNS):
        match = re.search(pattern, prompt)

        if match:
            matches.append((match.start(), pattern_index, value))

    return min(matches)[2] if matches else 4


def fallback_parse_prompt(prompt: str) -> AssetPlan:
    normalized_prompt = (prompt or "").lower()

    return AssetPlan(
        theme=_find_choice(normalized_prompt, THEME_CHOICES, "forest"),
        style=_find_choice(normalized_prompt, STYLE_CHOICES, "pixel"),
        assetTypes=_find_asset_types(normalized_prompt),
        size=_find_size(normalized_prompt),
        count=_find_count(normalized_prompt),
    )
