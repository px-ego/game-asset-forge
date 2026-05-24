import { forwardRef } from "react";
import { assetTypeLabels } from "../features/asset-generator/assetOptions";
import {
  type AssetStyle,
  type GeneratedAsset,
  type Theme,
} from "../types/asset";
import { type AssetPalette } from "../agent/types/agent";

interface AssetPreviewProps {
  asset: GeneratedAsset;
}

interface RenderPalette extends AssetPalette {
  highlight: string;
}

const palettes: Record<Theme, RenderPalette> = {
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
  palette: RenderPalette;
  style: AssetStyle;
}

interface DecorationProps {
  asset: GeneratedAsset;
  palette: RenderPalette;
}

function resolvePalette(asset: GeneratedAsset): RenderPalette {
  const themePalette = palettes[asset.theme];

  return asset.palette
    ? {
        ...asset.palette,
        highlight: asset.palette.highlight ?? themePalette.highlight,
      }
    : themePalette;
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

function GlowDecoration({ asset, palette }: DecorationProps) {
  if (!asset.renderHints?.glow) {
    return null;
  }

  return (
    <path
      d="M14 50c0-25 13-36 36-36s36 11 36 36-13 36-36 36-36-11-36-36z"
      fill="none"
      opacity="0.5"
      stroke={palette.accent}
      strokeDasharray={asset.style === "pixel" ? "7 5" : "3 5"}
      strokeWidth="3"
    />
  );
}

function CoinDecoration({ asset, palette }: DecorationProps) {
  switch (asset.renderHints?.decoration) {
    case "cracks":
      return (
        <path
          d="M48 29 43 44l8 7-8 20M52 51l12-8"
          fill="none"
          stroke={palette.outline}
          strokeWidth="4"
        />
      );
    case "rune":
      return (
        <path
          d="M50 31v38M39 38h18l-16 25h20"
          fill="none"
          stroke={palette.highlight}
          strokeWidth="4"
        />
      );
    case "gem":
      return (
        <path
          d="m50 36 12 12-12 17-12-17z"
          fill={palette.highlight}
          stroke={palette.secondary}
          strokeWidth="3"
        />
      );
    case "curse":
      return (
        <path
          d="M36 52c8-16 26-16 28 0-4 17-24 18-28 0z"
          fill="#6e3ca3"
          opacity="0.75"
        />
      );
    case "crown":
      return <path d="M37 58V42l8 7 6-13 7 13 7-7v16z" fill={palette.highlight} />;
    case "frost":
      return <path d="M50 33v34M35 50h30M39 39l22 22m0-22L39 61" stroke="#d9fbff" strokeWidth="3" />;
    case "ring":
      return <circle cx="50" cy="50" r="19" fill="none" stroke={palette.highlight} strokeWidth="4" />;
    default:
      return null;
  }
}

function PotionDecoration({ asset, palette }: DecorationProps) {
  switch (asset.renderHints?.decoration) {
    case "cross":
      return <path d="M47 54h6v7h7v6h-7v8h-6v-8h-7v-6h7z" fill={palette.highlight} />;
    case "bubbles":
      return (
        <>
          <path d="M30 54h40v18c-7 7-33 7-40 0z" fill="#61db68" opacity="0.9" />
          <circle cx="43" cy="58" r="4" fill={palette.highlight} />
          <circle cx="57" cy="66" r="3" fill={palette.highlight} />
        </>
      );
    case "spark":
      return (
        <>
          <path d="M30 54h40v18c-7 7-33 7-40 0z" fill="#586fea" opacity="0.85" />
          <path d="m51 47-5 11h7l-5 12 14-17h-8l5-6z" fill={palette.highlight} />
        </>
      );
    case "crystal":
      return (
        <>
          <path d="M30 54h40v18c-7 7-33 7-40 0z" fill="#53cfdb" opacity="0.75" />
          <path d="m50 49 10 12-10 15-10-15z" fill={palette.highlight} />
        </>
      );
    case "flame":
      return <path d="M51 76c-13-2-12-13-4-22 1 6 7 6 7-6 12 13 10 26-3 28z" fill="#ff783c" />;
    case "snow":
      return <path d="M50 53v20M41 63h18M43 56l14 14m0-14L43 70" stroke="#e4fbff" strokeWidth="3" />;
    case "moon":
      return <path d="M55 55c-12 3-12 17 0 19-19 4-21-20 0-19z" fill="#b88bdd" />;
    case "ring":
      return <ellipse cx="50" cy="64" rx="15" ry="9" fill="none" stroke={palette.highlight} strokeWidth="4" />;
    default:
      return null;
  }
}

function SlimeDecoration({ asset, palette }: DecorationProps) {
  switch (asset.renderHints?.decoration) {
    case "spots":
      return (
        <>
          <circle cx="31" cy="57" r="5" fill="#60da68" />
          <circle cx="68" cy="65" r="6" fill="#60da68" />
          <circle cx="52" cy="38" r="4" fill="#c7ff7b" />
        </>
      );
    case "spikes":
      return (
        <path
          d="M32 37 38 20l9 13 8-17 9 20"
          fill="#72e0ed"
          stroke={palette.outline}
          strokeLinejoin="round"
          strokeWidth="3"
        />
      );
    case "shadow":
      return (
        <>
          <path d="M28 48q22-29 44 0v15H28z" fill="#34264c" opacity="0.9" />
          <circle cx="40" cy="53" r="3" fill={palette.highlight} />
          <circle cx="60" cy="53" r="3" fill={palette.highlight} />
        </>
      );
    case "lightning":
      return <path d="m50 27-10 24h9l-7 22 21-31h-10l8-15z" fill={palette.highlight} />;
    case "moss":
      return <path d="M27 42q8-9 15 0 9-13 19 0 7-7 14 1" fill="none" stroke="#395f35" strokeWidth="7" />;
    case "flame":
      return <path d="M48 39q-8-12 4-21-1 10 8 12-1 10-12 9z" fill="#ff7d45" />;
    case "ring":
      return <path d="M29 61h42M35 69h30" stroke={palette.highlight} strokeWidth="3" />;
    default:
      return null;
  }
}

function SwordDecoration({ asset, palette }: DecorationProps) {
  switch (asset.renderHints?.decoration) {
    case "rune":
      return <path d="M60 44h10l-10 9h8" fill="none" stroke={palette.accent} strokeWidth="3" />;
    case "diamond":
      return <path d="m76 18 7 7-28 38-9-9z" fill="#89e8f4" stroke={palette.highlight} strokeWidth="3" />;
    case "flame":
      return <path d="M55 54q9-13 11-23 4 7 9 1 0 13-16 28z" fill="#f46a3c" />;
    case "neon":
      return <path d="M52 58 79 20" stroke={palette.accent} strokeLinecap="round" strokeWidth="7" />;
    case "frost":
      return <path d="M57 52 75 25m-12 16h10m-4-8h10" stroke="#e3fbff" strokeWidth="3" />;
    case "shadow":
      return <path d="M52 60 80 20" stroke="#7c53ac" strokeLinecap="round" strokeWidth="7" opacity="0.8" />;
    case "crest":
      return <path d="m42 55 8-7 8 7-8 10z" fill={palette.highlight} />;
    default:
      return null;
  }
}

function TileDecoration({ asset, palette }: DecorationProps) {
  const decoration = asset.renderHints?.pattern ?? asset.renderHints?.decoration;

  switch (decoration) {
    case "cracks":
      return <path d="M31 25 45 43l-9 14 17 20M45 43l21-11M36 57 25 65" fill="none" stroke={palette.outline} strokeWidth="4" />;
    case "moss":
      return <path d="M20 32q12-12 23 0 8-11 19 1M23 74q12-10 24 2" fill="none" stroke="#386c3b" strokeWidth="8" />;
    case "rune":
      return <path d="M50 28v44M35 37h27L38 62h29" fill="none" stroke={palette.highlight} strokeWidth="4" />;
    case "rivets":
      return (
        <>
          <path d="M21 50h59M50 21v59" stroke={palette.outline} strokeWidth="3" />
          <circle cx="28" cy="28" r="4" fill={palette.highlight} />
          <circle cx="72" cy="28" r="4" fill={palette.highlight} />
          <circle cx="28" cy="72" r="4" fill={palette.highlight} />
          <circle cx="72" cy="72" r="4" fill={palette.highlight} />
        </>
      );
    case "crystal":
      return <path d="m50 27 16 23-16 23-16-23z" fill="#68dfe9" stroke={palette.highlight} strokeWidth="3" />;
    case "lava":
    case "flame":
      return <path d="M26 67 39 50l-7-13 19 11 15-22 8 31" fill="none" stroke="#ff7140" strokeWidth="6" />;
    case "circuit":
    case "neon":
      return <path d="M27 35h20v15h27M29 67h27V52" fill="none" stroke={palette.highlight} strokeWidth="4" />;
    default:
      return null;
  }
}

function VariantDecoration({ asset, palette }: DecorationProps) {
  return (
    <>
      <GlowDecoration asset={asset} palette={palette} />
      {asset.type === "coin" && <CoinDecoration asset={asset} palette={palette} />}
      {asset.type === "potion" && <PotionDecoration asset={asset} palette={palette} />}
      {asset.type === "slime" && <SlimeDecoration asset={asset} palette={palette} />}
      {asset.type === "sword" && <SwordDecoration asset={asset} palette={palette} />}
      {asset.type === "tile" && <TileDecoration asset={asset} palette={palette} />}
    </>
  );
}

function Illustration({ asset }: AssetPreviewProps) {
  const palette = resolvePalette(asset);
  const props = { palette, style: asset.style };

  switch (asset.type) {
    case "potion":
      return (
        <>
          <PotionPreview {...props} />
          <VariantDecoration asset={asset} palette={palette} />
        </>
      );
    case "coin":
      return (
        <>
          <CoinPreview {...props} />
          <VariantDecoration asset={asset} palette={palette} />
        </>
      );
    case "slime":
      return (
        <>
          <SlimePreview {...props} />
          <VariantDecoration asset={asset} palette={palette} />
        </>
      );
    case "sword":
      return (
        <>
          <SwordPreview {...props} />
          <VariantDecoration asset={asset} palette={palette} />
        </>
      );
    case "tile":
      return (
        <>
          <TilePreview {...props} />
          <VariantDecoration asset={asset} palette={palette} />
        </>
      );
  }
}

export const AssetPreview = forwardRef<SVGSVGElement, AssetPreviewProps>(
  function AssetPreview({ asset }, ref) {
    const palette = resolvePalette(asset);
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
