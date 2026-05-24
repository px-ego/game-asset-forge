import { type AssetStyle, type Theme } from "../../types/asset";
import { type AssetPalette } from "../types/agent";

interface PaletteSkillResult {
  palette: AssetPalette;
  globalStyleHints: string[];
}

const themePalettes: Record<Theme, AssetPalette> = {
  forest: {
    background: "#172c24",
    primary: "#63a657",
    secondary: "#825f3d",
    accent: "#c4d765",
    outline: "#213b2a",
    highlight: "#eef2b3",
  },
  dungeon: {
    background: "#211f2c",
    primary: "#807895",
    secondary: "#57496d",
    accent: "#ad82d7",
    outline: "#292536",
    highlight: "#ddd3ef",
  },
  cyberpunk: {
    background: "#101c38",
    primary: "#197bb9",
    secondary: "#6634a8",
    accent: "#19e6dc",
    outline: "#131d43",
    highlight: "#f3ff7d",
  },
};

export function applyPaletteSkill(
  theme: Theme,
  style: AssetStyle,
  prompt: string,
): PaletteSkillResult {
  const palette = { ...themePalettes[theme] };
  const normalizedPrompt = prompt.toLowerCase();
  const globalStyleHints = [
    style === "pixel" ? "硬边像素造型" : "圆润柔和轮廓",
  ];

  if (normalizedPrompt.includes("霓虹") || normalizedPrompt.includes("neon")) {
    palette.accent = "#17f2ec";
    palette.highlight = "#f4ff6d";
    globalStyleHints.push("霓虹高亮点缀");
  }

  if (normalizedPrompt.includes("暗黑") || normalizedPrompt.includes("dark")) {
    palette.background = "#101219";
    palette.outline = "#161520";
    globalStyleHints.push("暗黑高对比氛围");
  }

  if (normalizedPrompt.includes("毒液") || normalizedPrompt.includes("poison")) {
    palette.accent = "#7ce55b";
    palette.highlight = "#d7ff8a";
    globalStyleHints.push("毒液绿色点缀");
  }

  if (normalizedPrompt.includes("水晶") || normalizedPrompt.includes("crystal")) {
    palette.accent = "#60dff2";
    palette.highlight = "#e3fcff";
    globalStyleHints.push("水晶冷光质感");
  }

  if (normalizedPrompt.includes("火焰") || normalizedPrompt.includes("flame")) {
    palette.accent = "#f56b42";
    palette.highlight = "#ffd05c";
    globalStyleHints.push("火焰暖色点缀");
  }

  return { palette, globalStyleHints };
}
