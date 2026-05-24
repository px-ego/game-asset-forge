import { type GenerateFormState } from "../../types/asset";
import { applyPaletteSkill } from "../skills/paletteSkill";
import { applyVariantSkill } from "../skills/variantSkill";
import {
  type AssetPackPlan,
  type NaturalLanguageGoal,
} from "../types/agent";

export function createNaturalLanguageGoal(prompt = ""): NaturalLanguageGoal {
  return {
    prompt: prompt.trim(),
    createdAt: new Date().toISOString(),
  };
}

export function planAssetPackLocally(
  formState: GenerateFormState,
  goal: NaturalLanguageGoal,
): AssetPackPlan {
  const paletteResult = applyPaletteSkill(
    formState.theme,
    formState.style,
    goal.prompt,
  );
  const assets = formState.assetTypes.flatMap((assetType) =>
    applyVariantSkill(assetType, formState.count, formState.theme, goal.prompt),
  );

  return {
    goal: goal.prompt || "手动参数配置",
    theme: formState.theme,
    style: formState.style,
    size: formState.size,
    count: formState.count,
    palette: paletteResult.palette,
    globalStyleHints: paletteResult.globalStyleHints,
    assets,
  };
}
