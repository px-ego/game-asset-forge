import {
  type AssetCount,
  type AssetPlan,
  type AssetSize,
  type AssetStyle,
  type AssetType,
  type PlanResponse,
  type PlannerSource,
  type Theme,
} from "../types/asset";

export const API_BASE_URL = "http://127.0.0.1:8000";

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
const plannerSources: readonly PlannerSource[] = ["fallback", "llm"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && themes.includes(value as Theme);
}

function isAssetStyle(value: unknown): value is AssetStyle {
  return typeof value === "string" && styles.includes(value as AssetStyle);
}

function isAssetType(value: unknown): value is AssetType {
  return typeof value === "string" && assetTypes.includes(value as AssetType);
}

function isAssetSize(value: unknown): value is AssetSize {
  return typeof value === "number" && sizes.includes(value as AssetSize);
}

function isAssetCount(value: unknown): value is AssetCount {
  return typeof value === "number" && counts.includes(value as AssetCount);
}

function isPlannerSource(value: unknown): value is PlannerSource {
  return (
    typeof value === "string" &&
    plannerSources.includes(value as PlannerSource)
  );
}

function isAssetPlan(value: unknown): value is AssetPlan {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isTheme(value.theme) &&
    isAssetStyle(value.style) &&
    Array.isArray(value.assetTypes) &&
    value.assetTypes.every(isAssetType) &&
    isAssetSize(value.size) &&
    isAssetCount(value.count)
  );
}

export function isPlanResponse(value: unknown): value is PlanResponse {
  if (
    !isRecord(value) ||
    typeof value.success !== "boolean" ||
    !isPlannerSource(value.source) ||
    typeof value.message !== "string"
  ) {
    return false;
  }

  return value.success
    ? isAssetPlan(value.plan)
    : value.plan === null || isAssetPlan(value.plan);
}

export async function planAssetPrompt(prompt: string): Promise<PlanResponse> {
  const response = await fetch(`${API_BASE_URL}/api/plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error("AI 规划请求失败");
  }

  const data: unknown = await response.json();

  if (!isPlanResponse(data)) {
    throw new Error("AI 规划响应格式无效");
  }

  return data;
}
