import { type GenerateFormState } from "../../types/asset";
import {
  createNaturalLanguageGoal,
  planAssetPackLocally,
} from "../planner/localPlanner";
import { applyRenderSkill } from "../skills/renderSkill";
import { type AgentPipelineResult } from "../types/agent";
import { validateAssetPack } from "../validation/validateAssetPack";

export function buildAssetPack(
  formState: GenerateFormState,
  prompt = "",
): AgentPipelineResult {
  const goal = createNaturalLanguageGoal(prompt);
  const plan = planAssetPackLocally(formState, goal);
  const assets = applyRenderSkill(plan);

  return {
    plan,
    assets,
    warnings: validateAssetPack(plan, assets),
    source: "local-agent",
  };
}
