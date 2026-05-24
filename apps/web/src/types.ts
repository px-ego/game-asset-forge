export type Theme = "forest" | "dungeon" | "cyberpunk";
export type AssetStyle = "pixel" | "cartoon";
export type AssetType = "potion" | "coin" | "slime" | "sword" | "tile";
export type AssetSize = 32 | 64 | 128;
export type AssetCount = 1 | 4 | 8;

export interface GenerateFormState {
  theme: Theme;
  style: AssetStyle;
  assetTypes: AssetType[];
  size: AssetSize;
  count: AssetCount;
}

export interface GeneratedAsset {
  id: string;
  type: AssetType;
  theme: Theme;
  style: AssetStyle;
  size: AssetSize;
  seed: number;
}
