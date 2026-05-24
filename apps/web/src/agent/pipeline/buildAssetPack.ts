import { type GenerateFormState, type PlannerSource } from "../../types/asset";
import {
  createNaturalLanguageGoal,
  planAssetPackLocally,
} from "../planner/localPlanner";
import { applyRenderSkill } from "../skills/renderSkill";
import { type AgentPipelineResult, type AssetPackPlan } from "../types/agent";
import { validateAssetPack } from "../validation/validateAssetPack";

export function buildAssetPack(
  formState: GenerateFormState,
  prompt = "",
  externalPlan?: AssetPackPlan,
  externalSource: PlannerSource = "fallback",
): AgentPipelineResult {
  const goal = createNaturalLanguageGoal(prompt);
  const plan = externalPlan ?? planAssetPackLocally(formState, goal);
  const assets = applyRenderSkill(plan);

  return {
    plan,
    assets,
    warnings: validateAssetPack(plan, assets),
    source: externalPlan ? externalSource : "local-agent",
  };
}
