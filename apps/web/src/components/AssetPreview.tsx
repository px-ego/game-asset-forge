import { forwardRef } from "react";
import { assetTypeLabels } from "../features/asset-generator/assetOptions";
import {
  type AssetStyle,
  type GeneratedAsset,
  type Theme,
} from "../types/asset";

interface AssetPreviewProps {
  asset: GeneratedAsset;
}

interface ThemePalette {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  outline: string;
  highlight: string;
}

const palettes: Record<Theme, ThemePalette> = {
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

interface IllustrationProps {
  palette: ThemePalette;
  style: AssetStyle;
}

function PotionPreview({ palette, style }: IllustrationProps) {
  if (style === "pixel") {
    return (
      <>
        <path d="M40 18h20v10h7v12h6v37H27V40h6V28h7z" fill={palette.primary} stroke={palette.outline} strokeWidth="4" />
        <path d="M29 50h42v25H29z" fill={palette.accent} />
        <path d="M39 15h22v13H39z" fill={palette.secondary} stroke={palette.outline} strokeWidth="4" />
        <path d="M36 43h8v20h-8z" fill={palette.highlight} />
      </>
    );
  }

  return (
    <>
      <path d="M40 19h20v12c0 4 12 8 12 18v21c0 8-7 12-22 12S28 78 28 70V49c0-10 12-14 12-18z" fill={palette.primary} stroke={palette.outline} strokeWidth="4" strokeLinejoin="round" />
      <path d="M30 53c12-4 28 4 40 0v17c0 7-7 10-20 10s-20-3-20-10z" fill={palette.accent} />
      <rect x="38" y="16" width="24" height="14" rx="5" fill={palette.secondary} stroke={palette.outline} strokeWidth="4" />
      <path d="M38 43c0-4 3-7 7-8v26" fill="none" stroke={palette.highlight} strokeLinecap="round" strokeWidth="5" />
    </>
  );
}

function CoinPreview({ palette, style }: IllustrationProps) {
  if (style === "pixel") {
    return (
      <>
        <path d="M34 18h32v8h10v12h7v25h-8v12H64v8H35v-8H24V63h-7V38h7V26h10z" fill={palette.accent} stroke={palette.outline} strokeWidth="4" />
        <path d="M37 27h26v7h9v31h-9v8H37v-8h-9V35h9z" fill={palette.primary} stroke={palette.secondary} strokeWidth="4" />
        <path d="M38 35h14v7H38zm-7 9h7v13h-7z" fill={palette.highlight} />
      </>
    );
  }

  return (
    <>
      <circle cx="50" cy="50" r="34" fill={palette.accent} stroke={palette.outline} strokeWidth="4" />
      <circle cx="50" cy="50" r="25" fill={palette.primary} stroke={palette.secondary} strokeWidth="4" />
      <path d="M33 47c2-10 10-16 20-18" fill="none" stroke={palette.highlight} strokeLinecap="round" strokeWidth="6" />
    </>
  );
}

function SlimePreview({ palette, style }: IllustrationProps) {
  const face = (
    <>
      <circle cx="40" cy="53" r="5" fill={palette.outline} />
      <circle cx="60" cy="53" r="5" fill={palette.outline} />
      <path d="M41 65q9 8 18 0" fill="none" stroke={palette.outline} strokeWidth="4" strokeLinecap="round" />
    </>
  );

  if (style === "pixel") {
    return (
      <>
        <path d="M33 27h34v7h8v9h7v29h-9v7H27v-7h-9V43h7v-9h8z" fill={palette.primary} stroke={palette.outline} strokeWidth="4" />
        <path d="M32 36h14v7H32z" fill={palette.highlight} />
        {face}
      </>
    );
  }

  return (
    <>
      <path d="M20 69c0-13 7-17 10-29 3-13 13-20 20-20s17 7 20 20c3 12 10 16 10 29 0 8-8 12-16 9-7 6-21 6-28 0-8 3-16-1-16-9z" fill={palette.primary} stroke={palette.outline} strokeWidth="4" strokeLinejoin="round" />
      <path d="M34 38c3-7 9-11 16-11" fill="none" stroke={palette.highlight} strokeLinecap="round" strokeWidth="5" />
      {face}
    </>
  );
}

function SwordPreview({ palette, style }: IllustrationProps) {
  if (style === "pixel") {
    return (
      <>
        <path d="M71 17h12v12L54 58l-12-12z" fill={palette.highlight} stroke={palette.outline} strokeWidth="4" />
        <path d="M37 43l20 20-8 8-20-20z" fill={palette.accent} stroke={palette.outline} strokeWidth="4" />
        <path d="M31 58l12 12-14 14-12-12z" fill={palette.secondary} stroke={palette.outline} strokeWidth="4" />
        <path d="M65 29l8 8" stroke={palette.primary} strokeWidth="4" />
      </>
    );
  }

  return (
    <>
      <path d="M48 58 75 18l9-3-3 10-27 39z" fill={palette.highlight} stroke={palette.outline} strokeLinejoin="round" strokeWidth="4" />
      <path d="M36 47 57 68" stroke={palette.accent} strokeLinecap="round" strokeWidth="9" />
      <path d="m38 61-17 18" stroke={palette.secondary} strokeLinecap="round" strokeWidth="9" />
      <circle cx="22" cy="80" r="6" fill={palette.accent} stroke={palette.outline} strokeWidth="3" />
      <path d="M66 30 56 47" stroke={palette.primary} strokeLinecap="round" strokeWidth="4" />
    </>
  );
}

function TilePreview({ palette, style }: IllustrationProps) {
  if (style === "pixel") {
    return (
      <>
        <path d="M18 21h62v10h5v52H22v-6h-7V27h3z" fill={palette.primary} stroke={palette.outline} strokeWidth="4" />
        <path d="M22 43h59M22 63h59M40 24v19M62 43v20M35 63v16" stroke={palette.secondary} strokeWidth="5" />
        <path d="M24 27h19v7H24zm41 40h12v7H65z" fill={palette.highlight} />
      </>
    );
  }

  return (
    <>
      <rect x="17" y="18" width="66" height="66" rx="11" fill={palette.primary} stroke={palette.outline} strokeWidth="4" />
      <path d="M21 42c14 5 22-5 37 0 10 4 15 1 22-2M22 62c12-4 21 5 34 1 10-4 17 2 24 0M43 23c-3 10 5 13 0 20M62 44c4 9-4 11 0 17" fill="none" stroke={palette.secondary} strokeLinecap="round" strokeWidth="4" />
      <path d="M27 29h15" stroke={palette.highlight} strokeLinecap="round" strokeWidth="5" />
    </>
  );
}

function Illustration({ asset }: AssetPreviewProps) {
  const palette = palettes[asset.theme];
  const props = { palette, style: asset.style };

  switch (asset.type) {
    case "potion":
      return <PotionPreview {...props} />;
    case "coin":
      return <CoinPreview {...props} />;
    case "slime":
      return <SlimePreview {...props} />;
    case "sword":
      return <SwordPreview {...props} />;
    case "tile":
      return <TilePreview {...props} />;
  }
}

export const AssetPreview = forwardRef<SVGSVGElement, AssetPreviewProps>(
  function AssetPreview({ asset }, ref) {
    const palette = palettes[asset.theme];
    const offset = (asset.seed % 3) - 1;

    return (
      <svg
        aria-label={`${assetTypeLabels[asset.type]}预览`}
        className="asset-preview"
        ref={ref}
        role="img"
        shapeRendering={asset.style === "pixel" ? "crispEdges" : "geometricPrecision"}
        viewBox="0 0 100 100"
      >
        <rect width="100" height="100" rx={asset.style === "pixel" ? 0 : 12} fill={palette.background} />
        <g transform={`translate(${offset} 0)`}>
          <Illustration asset={asset} />
        </g>
      </svg>
    );
  },
);
