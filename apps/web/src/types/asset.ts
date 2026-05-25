import { type AssetPalette, type RenderHints } from "../agent/types/agent";

export type Theme = "forest" | "dungeon" | "cyberpunk";
export type AssetStyle = "pixel" | "cartoon";
export type AssetType = "potion" | "coin" | "slime" | "sword" | "tile";
export type AssetSize = 32 | 64 | 128;
export type AssetCount = 1 | 4 | 8;
export type PlannerSource = "fallback" | "llm" | "function_calling";

export interface GenerateFormState {
  theme: Theme;
  style: AssetStyle;
  assetTypes: AssetType[];
  size: AssetSize;
  count: AssetCount;
}

export type AssetPlan = GenerateFormState;

export interface PlanResponse {
  success: boolean;
  source: PlannerSource;
  plan: AssetPlan | null;
  message: string;
}

export interface GeneratedAsset {
  id: string;
  type: AssetType;
  theme: Theme;
  style: AssetStyle;
  size: AssetSize;
  seed: number;
  name?: string;
  description?: string;
  variant?: string;
  palette?: AssetPalette;
  renderHints?: RenderHints;
}

export interface MetadataAsset {
  id: string;
  type: AssetType;
  name: string;
  theme: Theme;
  style: AssetStyle;
  size: AssetSize;
  seed: number;
  fileName: string;
  variant?: string;
  description?: string;
  renderHints?: RenderHints;
}

export interface ExportMetadata {
  project: "GameAssetForge";
  projectName: "游素工坊";
  version: "0.1.0";
  createdAt: string;
  request: GenerateFormState;
  total: number;
  assets: MetadataAsset[];
}
