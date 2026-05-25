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
  glowColor?: string;
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

export interface AgentToolCallTrace {
  toolName: string;
  arguments: Record<string, unknown>;
  rawArguments?: Record<string, unknown>;
  normalizedArguments?: Record<string, unknown>;
  success: boolean;
  result?: unknown;
  resultSummary?: unknown;
  message?: string;
  warnings?: string[];
  durationMs?: number;
}

export interface AgentTrace {
  source: "local-agent" | PlannerSource;
  message: string;
  warnings: string[];
  toolCalls: AgentToolCallTrace[];
  plan: AssetPackPlan | null;
}

export interface PlanPackResponse {
  success: boolean;
  source: PlannerSource;
  plan: AssetPackPlan | null;
  message: string;
  toolCalls: AgentToolCallTrace[];
  warnings: string[];
}
