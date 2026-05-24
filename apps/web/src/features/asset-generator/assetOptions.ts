import {
  type AssetCount,
  type AssetSize,
  type AssetStyle,
  type AssetType,
  type Theme,
} from "../../types/asset";

interface SelectOption<T> {
  value: T;
  label: string;
}

export const themeOptions: SelectOption<Theme>[] = [
  { value: "forest", label: "森林" },
  { value: "dungeon", label: "地牢" },
  { value: "cyberpunk", label: "赛博朋克" },
];

export const styleOptions: SelectOption<AssetStyle>[] = [
  { value: "pixel", label: "像素风" },
  { value: "cartoon", label: "卡通风" },
];

export const assetTypeOptions: SelectOption<AssetType>[] = [
  { value: "potion", label: "药水" },
  { value: "coin", label: "金币" },
  { value: "slime", label: "史莱姆" },
  { value: "sword", label: "剑" },
  { value: "tile", label: "地砖" },
];

export const sizeOptions: AssetSize[] = [32, 64, 128];
export const countOptions: AssetCount[] = [1, 4, 8];

export const themeLabels: Record<Theme, string> = {
  forest: "森林",
  dungeon: "地牢",
  cyberpunk: "赛博朋克",
};

export const styleLabels: Record<AssetStyle, string> = {
  pixel: "像素风",
  cartoon: "卡通风",
};

export const assetTypeLabels: Record<AssetType, string> = {
  potion: "药水",
  coin: "金币",
  slime: "史莱姆",
  sword: "剑",
  tile: "地砖",
};
