import { type AssetCount, type AssetType, type Theme } from "../../types/asset";
import { type PlannedAsset, type RenderHints } from "../types/agent";

interface VariantDefinition {
  variant: string;
  name: string;
  description: string;
  renderHints: RenderHints;
}

const themeDescriptions: Record<Theme, string> = {
  forest: "森林气息的",
  dungeon: "地牢氛围的",
  cyberpunk: "赛博朋克风格的",
};

const variantDefinitions: Record<AssetType, VariantDefinition[]> = {
  coin: [
    {
      variant: "common_coin",
      name: "普通金币",
      description: "经典圆形金币",
      renderHints: { material: "gold", decoration: "plain", rarity: "common" },
    },
    {
      variant: "cracked_coin",
      name: "裂纹金币",
      description: "表面留有清晰裂纹",
      renderHints: { material: "gold", decoration: "cracks", rarity: "common" },
    },
    {
      variant: "rune_coin",
      name: "符文金币",
      description: "中心刻有符文标记",
      renderHints: { material: "gold", decoration: "rune", rarity: "rare" },
    },
    {
      variant: "gem_coin",
      name: "宝石金币",
      description: "中心镶嵌明亮宝石",
      renderHints: { material: "gold", decoration: "gem", rarity: "rare" },
    },
    {
      variant: "cursed_coin",
      name: "诅咒金币",
      description: "缠绕幽紫光晕",
      renderHints: { decoration: "curse", glow: true, rarity: "epic" },
    },
    {
      variant: "royal_coin",
      name: "王冠金币",
      description: "压印王冠纹样",
      renderHints: { decoration: "crown", rarity: "rare" },
    },
    {
      variant: "frost_coin",
      name: "冰晶金币",
      description: "带有冰晶刻痕",
      renderHints: { decoration: "frost", glow: true, rarity: "rare" },
    },
    {
      variant: "neon_coin",
      name: "霓虹代币",
      description: "闪耀科技光环",
      renderHints: { decoration: "ring", glow: true, rarity: "epic" },
    },
  ],
  potion: [
    {
      variant: "healing_potion",
      name: "治疗药水",
      description: "充盈恢复能量的药剂",
      renderHints: { material: "healing", decoration: "cross", rarity: "common" },
    },
    {
      variant: "poison_potion",
      name: "毒液药水",
      description: "翻滚气泡的毒液",
      renderHints: { material: "poison", decoration: "bubbles", rarity: "common" },
    },
    {
      variant: "mana_potion",
      name: "魔力药水",
      description: "流动蓝紫魔力的药剂",
      renderHints: { material: "mana", decoration: "spark", glow: true, rarity: "rare" },
    },
    {
      variant: "crystal_potion",
      name: "水晶药水",
      description: "瓶内析出晶体的药剂",
      renderHints: { material: "crystal", decoration: "crystal", rarity: "rare" },
    },
    {
      variant: "fire_potion",
      name: "火焰药水",
      description: "装载火焰力量的药剂",
      renderHints: { material: "fire", decoration: "flame", glow: true, rarity: "epic" },
    },
    {
      variant: "frost_potion",
      name: "冰霜药水",
      description: "泛着冷光的药剂",
      renderHints: { material: "frost", decoration: "snow", rarity: "rare" },
    },
    {
      variant: "shadow_potion",
      name: "暗影药水",
      description: "幽暗沉静的药剂",
      renderHints: { material: "shadow", decoration: "moon", rarity: "epic" },
    },
    {
      variant: "neon_potion",
      name: "霓虹药水",
      description: "明亮脉冲光芒的药剂",
      renderHints: { material: "neon", decoration: "ring", glow: true, rarity: "epic" },
    },
  ],
  slime: [
    {
      variant: "basic_slime",
      name: "普通史莱姆",
      description: "表情友好的基础史莱姆",
      renderHints: { emotion: "happy", decoration: "plain", rarity: "common" },
    },
    {
      variant: "poison_slime",
      name: "毒液史莱姆",
      description: "带有毒液斑点的史莱姆",
      renderHints: { material: "poison", decoration: "spots", rarity: "common" },
    },
    {
      variant: "crystal_slime",
      name: "水晶史莱姆",
      description: "顶部长出晶角的史莱姆",
      renderHints: { material: "crystal", decoration: "spikes", rarity: "rare" },
    },
    {
      variant: "shadow_slime",
      name: "暗影史莱姆",
      description: "眼睛泛光的暗影史莱姆",
      renderHints: { material: "shadow", decoration: "shadow", glow: true, rarity: "rare" },
    },
    {
      variant: "electric_slime",
      name: "电光史莱姆",
      description: "闪过电流的史莱姆",
      renderHints: { decoration: "lightning", glow: true, rarity: "epic" },
    },
    {
      variant: "moss_slime",
      name: "苔藓史莱姆",
      description: "覆有植物斑纹的史莱姆",
      renderHints: { decoration: "moss", rarity: "common" },
    },
    {
      variant: "flame_slime",
      name: "火焰史莱姆",
      description: "跃动火花的史莱姆",
      renderHints: { material: "fire", decoration: "flame", glow: true, rarity: "rare" },
    },
    {
      variant: "neon_slime",
      name: "霓虹史莱姆",
      description: "科技光纹史莱姆",
      renderHints: { decoration: "ring", glow: true, rarity: "epic" },
    },
  ],
  sword: [
    {
      variant: "iron_sword",
      name: "铁剑",
      description: "结构扎实的基础剑刃",
      renderHints: { material: "iron", decoration: "plain", rarity: "common" },
    },
    {
      variant: "rune_sword",
      name: "符文剑",
      description: "剑身刻有符文",
      renderHints: { decoration: "rune", rarity: "rare" },
    },
    {
      variant: "crystal_sword",
      name: "水晶剑",
      description: "棱角分明的晶体剑刃",
      renderHints: { material: "crystal", decoration: "diamond", rarity: "rare" },
    },
    {
      variant: "flame_sword",
      name: "火焰剑",
      description: "火焰沿剑刃跃动",
      renderHints: { material: "fire", decoration: "flame", glow: true, rarity: "epic" },
    },
    {
      variant: "neon_blade",
      name: "霓虹光刃",
      description: "闪耀霓虹能量的剑刃",
      renderHints: { material: "neon", decoration: "neon", glow: true, rarity: "epic" },
    },
    {
      variant: "frost_sword",
      name: "冰霜剑",
      description: "覆盖寒霜纹理的剑刃",
      renderHints: { decoration: "frost", rarity: "rare" },
    },
    {
      variant: "shadow_sword",
      name: "暗影剑",
      description: "暗光环绕的剑刃",
      renderHints: { decoration: "shadow", glow: true, rarity: "epic" },
    },
    {
      variant: "royal_sword",
      name: "守护长剑",
      description: "护手镶嵌纹章的剑刃",
      renderHints: { decoration: "crest", rarity: "rare" },
    },
  ],
  tile: [
    {
      variant: "stone_tile",
      name: "石砖",
      description: "规整耐用的地面砖块",
      renderHints: { material: "stone", pattern: "plain", decoration: "plain", rarity: "common" },
    },
    {
      variant: "cracked_tile",
      name: "裂纹地砖",
      description: "表面产生断裂纹路",
      renderHints: { pattern: "cracks", decoration: "cracks", rarity: "common" },
    },
    {
      variant: "moss_tile",
      name: "苔藓地砖",
      description: "边缘覆有苔藓",
      renderHints: { pattern: "moss", decoration: "moss", rarity: "common" },
    },
    {
      variant: "rune_tile",
      name: "符文地砖",
      description: "中心镌刻古老符文",
      renderHints: { pattern: "rune", decoration: "rune", glow: true, rarity: "rare" },
    },
    {
      variant: "metal_tile",
      name: "金属地砖",
      description: "带有铆钉的金属板",
      renderHints: { material: "metal", pattern: "rivets", decoration: "rivets", rarity: "rare" },
    },
    {
      variant: "crystal_tile",
      name: "水晶地砖",
      description: "晶体镶嵌的地块",
      renderHints: { pattern: "crystal", decoration: "gem", rarity: "rare" },
    },
    {
      variant: "lava_tile",
      name: "熔岩地砖",
      description: "裂缝透出热光",
      renderHints: { pattern: "lava", decoration: "flame", glow: true, rarity: "epic" },
    },
    {
      variant: "neon_tile",
      name: "霓虹地砖",
      description: "边缘发光的科技地块",
      renderHints: { pattern: "circuit", decoration: "neon", glow: true, rarity: "epic" },
    },
  ],
};

function createSeed(source: string): number {
  let hash = 0;

  for (const character of source) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash || 1;
}

function prioritizeDefinitions(
  definitions: VariantDefinition[],
  prompt: string,
): VariantDefinition[] {
  const normalizedPrompt = prompt.toLowerCase();
  const priorityTerms = ["poison", "毒液", "crystal", "水晶", "flame", "火焰", "neon", "霓虹", "shadow", "暗黑"];
  const matchedTerm = priorityTerms.find((term) => normalizedPrompt.includes(term));

  if (!matchedTerm) {
    return definitions;
  }

  return [...definitions].sort((left, right) => {
    const leftMatches =
      left.variant.includes(matchedTerm) || left.description.includes(matchedTerm);
    const rightMatches =
      right.variant.includes(matchedTerm) || right.description.includes(matchedTerm);

    return Number(rightMatches) - Number(leftMatches);
  });
}

export function applyVariantSkill(
  assetType: AssetType,
  count: AssetCount,
  theme: Theme,
  prompt: string,
): PlannedAsset[] {
  const definitions = prioritizeDefinitions(variantDefinitions[assetType], prompt);

  return definitions.slice(0, count).map((definition, index) => ({
    id: `asset_${assetType}_${String(index + 1).padStart(3, "0")}`,
    type: assetType,
    name: definition.name,
    description: `${themeDescriptions[theme]}${definition.description}`,
    variant: definition.variant,
    seed: createSeed(`${theme}:${assetType}:${definition.variant}:${prompt}:${index + 1}`),
    renderHints: { ...definition.renderHints },
  }));
}
