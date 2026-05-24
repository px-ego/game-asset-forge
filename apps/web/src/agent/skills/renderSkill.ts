import { type GeneratedAsset } from "../../types/asset";
import { type AssetPackPlan } from "../types/agent";

export function applyRenderSkill(plan: AssetPackPlan): GeneratedAsset[] {
  return plan.assets.map((asset) => ({
    id: asset.id,
    type: asset.type,
    theme: plan.theme,
    style: plan.style,
    size: plan.size,
    seed: asset.seed,
    name: asset.name,
    description: asset.description,
    variant: asset.variant,
    palette: { ...plan.palette },
    renderHints: { ...asset.renderHints },
  }));
}
