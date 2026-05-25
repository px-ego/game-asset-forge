import {
  type AssetCount,
  type AssetSize,
  type AssetStyle,
  type AssetType,
  type GeneratedAsset,
  type PlannerSource,
  type Theme,
} from "../../types/asset";

export interface NaturalLanguageGoal {
  prompt: string;
  createdAt: string;
}

export interface AssetPalette {
  primary: string;
  secondary: string;
  accent: string;
  outline: string;
  background: string;
  highlight?: string;
}

export interface RenderHints {
  shape?: string;
  material?: string;
  decoration?: string;
  glow?: boolean;
  effect?: string;
  emotion?: string;
  pattern?: string;
  rarity?: "common" | "rare" | "epic";
}

export interface PlannedAsset {
  id: string;
  type: AssetType;
  name: string;
  description: string;
  variant: string;
  seed: number;
  renderHints: RenderHints;
}

export interface AssetPackPlan {
  goal: string;
  theme: Theme;
  style: AssetStyle;
  size: AssetSize;
  count: AssetCount;
  palette: AssetPalette;
  globalStyleHints: string[];
  assets: PlannedAsset[];
}

export interface AgentPipelineResult {
  plan: AssetPackPlan;
  assets: GeneratedAsset[];
  warnings: string[];
  source: "local-agent" | PlannerSource;
}

export interface FunctionToolCall {
  toolName: string;
  rawArguments?: Record<string, unknown>;
  normalizedArguments?: Record<string, unknown>;
  arguments: Record<string, unknown>;
  success: boolean;
  warnings?: string[];
}

export interface PlanPackResponse {
  success: boolean;
  source: PlannerSource;
  plan: AssetPackPlan | null;
  message: string;
  toolCalls: FunctionToolCall[];
  warnings: string[];
}
