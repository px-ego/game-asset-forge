import { type AssetType, type GeneratedAsset } from "../../types/asset";
import { type AssetPackPlan } from "../types/agent";

const allowedAssetTypes: readonly AssetType[] = [
  "potion",
  "coin",
  "slime",
  "sword",
  "tile",
];

export function validateAssetPack(
  plan: AssetPackPlan,
  assets: GeneratedAsset[],
): string[] {
  const warnings: string[] = [];

  if (assets.length === 0) {
    warnings.push("素材包为空，请选择至少一种素材类型。");
  }

  if (Object.values(plan.palette).some((color) => color.length === 0)) {
    warnings.push("素材包色板字段不完整。");
  }

  const seeds = new Set<number>();
  const variantsByType = new Map<AssetType, Set<string>>();

  assets.forEach((asset) => {
    if (!asset.id || !asset.name || !asset.seed) {
      warnings.push(`素材 ${asset.id || "未知"} 缺少必要标识、名称或 seed。`);
    }

    if (!allowedAssetTypes.includes(asset.type)) {
      warnings.push(`素材 ${asset.id} 的类型不受支持。`);
    }

    if (seeds.has(asset.seed)) {
      warnings.push(`素材 ${asset.id} 的 seed 与其他素材重复。`);
    }
    seeds.add(asset.seed);

    if (!asset.palette) {
      warnings.push(`素材 ${asset.id} 缺少色板信息。`);
    }

    const variants = variantsByType.get(asset.type) ?? new Set<string>();
    const variant = asset.variant ?? "";

    if (!variant) {
      warnings.push(`素材 ${asset.id} 缺少 variant 信息。`);
    } else if (variants.has(variant)) {
      warnings.push(`素材类型 ${asset.type} 存在重复 variant：${variant}。`);
    }

    variants.add(variant);
    variantsByType.set(asset.type, variants);
  });

  return warnings;
}
