import {
  type AssetCount,
  type AssetSize,
  type AssetStyle,
  type AssetType,
  type GenerateFormState,
  type PlannerSource,
  type Theme,
} from "../types/asset";
import {
  type AgentToolCallTrace,
  type AssetPackPlan,
  type AssetPalette,
  type PlanPackResponse,
  type PlannedAsset,
  type RenderHints,
} from "../agent/types/agent";
import {
  createNaturalLanguageGoal,
  planAssetPackLocally,
} from "../agent/planner/localPlanner";
import { API_BASE_URL, planAssetPrompt } from "./plannerApi";

const themes: readonly Theme[] = ["forest", "dungeon", "cyberpunk"];
const styles: readonly AssetStyle[] = ["pixel", "cartoon"];
const assetTypes: readonly AssetType[] = [
  "potion",
  "coin",
  "slime",
  "sword",
  "tile",
];
const sizes: readonly AssetSize[] = [32, 64, 128];
const counts: readonly AssetCount[] = [1, 4, 8];
const sources: readonly PlannerSource[] = ["fallback", "llm", "function_calling"];
const rarities = ["common", "rare", "epic"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || isString(value);
}

function isTheme(value: unknown): value is Theme {
  return isString(value) && themes.includes(value as Theme);
}

function isStyle(value: unknown): value is AssetStyle {
  return isString(value) && styles.includes(value as AssetStyle);
}

function isAssetType(value: unknown): value is AssetType {
  return isString(value) && assetTypes.includes(value as AssetType);
}

function isSize(value: unknown): value is AssetSize {
  return typeof value === "number" && sizes.includes(value as AssetSize);
}

function isCount(value: unknown): value is AssetCount {
  return typeof value === "number" && counts.includes(value as AssetCount);
}

function isSource(value: unknown): value is PlannerSource {
  return isString(value) && sources.includes(value as PlannerSource);
}

function isPalette(value: unknown): value is AssetPalette {
  return (
    isRecord(value) &&
    isString(value.primary) &&
    isString(value.secondary) &&
    isString(value.accent) &&
    isString(value.outline) &&
    isString(value.background) &&
    isOptionalString(value.highlight)
  );
}

function isRenderHints(value: unknown): value is RenderHints {
  return (
    isRecord(value) &&
    isOptionalString(value.shape) &&
    isOptionalString(value.material) &&
    isOptionalString(value.decoration) &&
    (value.glow === undefined || typeof value.glow === "boolean") &&
    isOptionalString(value.glowColor) &&
    isOptionalString(value.emotion) &&
    isOptionalString(value.pattern) &&
    (value.rarity === undefined ||
      (isString(value.rarity) &&
        rarities.includes(value.rarity as (typeof rarities)[number])))
  );
}

function isPlannedAsset(value: unknown): value is PlannedAsset {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isAssetType(value.type) &&
    isString(value.name) &&
    isString(value.description) &&
    isString(value.variant) &&
    typeof value.seed === "number" &&
    isRenderHints(value.renderHints)
  );
}

function isAgentToolCallTrace(value: unknown): value is AgentToolCallTrace {
  return (
    isRecord(value) &&
    isString(value.toolName) &&
    isRecord(value.arguments) &&
    (value.rawArguments === undefined || isRecord(value.rawArguments)) &&
    (value.normalizedArguments === undefined ||
      isRecord(value.normalizedArguments)) &&
    typeof value.success === "boolean" &&
    (value.message === undefined || isString(value.message)) &&
    (value.warnings === undefined ||
      (Array.isArray(value.warnings) && value.warnings.every(isString))) &&
    (value.durationMs === undefined ||
      (typeof value.durationMs === "number" && value.durationMs >= 0))
  );
}

function isAssetPackPlan(value: unknown): value is AssetPackPlan {
  return (
    isRecord(value) &&
    isString(value.goal) &&
    isTheme(value.theme) &&
    isStyle(value.style) &&
    isSize(value.size) &&
    isCount(value.count) &&
    isPalette(value.palette) &&
    Array.isArray(value.globalStyleHints) &&
    value.globalStyleHints.every(isString) &&
    Array.isArray(value.assets) &&
    value.assets.length > 0 &&
    value.assets.every(isPlannedAsset)
  );
}

function isPlanPackResponse(value: unknown): value is PlanPackResponse {
  if (
    !isRecord(value) ||
    typeof value.success !== "boolean" ||
    !isSource(value.source) ||
    !isString(value.message) ||
    (value.toolCalls !== undefined &&
      (!Array.isArray(value.toolCalls) ||
        !value.toolCalls.every(isAgentToolCallTrace))) ||
    !Array.isArray(value.warnings) ||
    !value.warnings.every(isString)
  ) {
    return false;
  }

  return value.success
    ? isAssetPackPlan(value.plan)
    : value.plan === null || isAssetPackPlan(value.plan);
}

async function requestFunctionCallingPlan(prompt: string): Promise<PlanPackResponse> {
  const response = await fetch(`${API_BASE_URL}/api/agent/function-plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error("Function Calling 规划请求失败");
  }

  const data: unknown = await response.json();

  if (!isPlanPackResponse(data)) {
    throw new Error("Function Calling 规划响应格式无效");
  }

  return {
    ...data,
    toolCalls: data.toolCalls ?? [],
  };
}

async function requestAssetPackPlan(prompt: string): Promise<PlanPackResponse> {
  const response = await fetch(`${API_BASE_URL}/api/agent/plan-pack`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error("素材包规划请求失败");
  }

  const data: unknown = await response.json();

  if (!isPlanPackResponse(data)) {
    throw new Error("素材包规划响应格式无效");
  }

  return {
    ...data,
    toolCalls: data.toolCalls ?? [],
  };
}

async function requestLegacyFallbackPlan(
  prompt: string,
  currentFormState: GenerateFormState,
): Promise<PlanPackResponse> {
  const response = await planAssetPrompt(prompt);

  if (!response.success || !response.plan) {
    throw new Error(response.message);
  }

  const plannedFormState: GenerateFormState = {
    ...currentFormState,
    ...response.plan,
    assetTypes: [...response.plan.assetTypes],
  };

  return {
    success: true,
    source: "fallback",
    plan: planAssetPackLocally(
      plannedFormState,
      createNaturalLanguageGoal(prompt),
    ),
    message: "素材包规划接口不可用，已使用旧 fallback 规划",
    toolCalls: [],
    warnings: ["当前后端未提供完整 AssetPackPlan 接口。"],
  };
}

export async function planAssetPackPrompt(
  prompt: string,
  currentFormState: GenerateFormState,
): Promise<PlanPackResponse> {
  try {
    return await requestFunctionCallingPlan(prompt);
  } catch {
    try {
      return await requestAssetPackPlan(prompt);
    } catch {
      return requestLegacyFallbackPlan(prompt, currentFormState);
    }
  }
}
