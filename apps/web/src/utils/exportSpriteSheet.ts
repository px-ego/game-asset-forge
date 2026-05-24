import { type GeneratedAsset, type GenerateFormState } from "../types";
import { svgElementToPngBlob } from "./exportPng";

const maxColumns = 4;

interface ExportSpriteSheetParams {
  formState: GenerateFormState;
  assets: GeneratedAsset[];
  svgElements: ReadonlyMap<string, SVGSVGElement>;
}

export interface SpriteSheetGrid {
  columns: number;
  rows: number;
  width: number;
  height: number;
}

function loadBlobImage(blob: Blob): Promise<HTMLImageElement> {
  const sourceUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(sourceUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error("PNG image could not be loaded."));
    };
    image.src = sourceUrl;
  });
}

function createSpriteSheetBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Sprite Sheet PNG blob could not be created."));
    }, "image/png");
  });
}

function downloadSpriteSheet(blob: Blob, fileName: string): void {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.download = fileName;
  link.href = downloadUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
}

export function calculateSpriteSheetGrid(
  assetCount: number,
  size: number,
): SpriteSheetGrid {
  const columns = Math.min(maxColumns, Math.max(1, assetCount));
  const rows = Math.max(1, Math.ceil(assetCount / columns));

  return {
    columns,
    rows,
    width: columns * size,
    height: rows * size,
  };
}

export function buildSpriteSheetFileName(
  formState: GenerateFormState,
  createdAt = new Date().toISOString(),
): string {
  const timestamp = createdAt.replace(/[:.]/g, "-");

  return `gameasset_spritesheet_${formState.theme}_${formState.style}_${formState.size}_${timestamp}.png`;
}

export async function exportSpriteSheet({
  formState,
  assets,
  svgElements,
}: ExportSpriteSheetParams): Promise<void> {
  if (assets.length === 0) {
    throw new Error("Sprite Sheet requires at least one asset.");
  }

  const grid = calculateSpriteSheetGrid(assets.length, formState.size);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context is unavailable.");
  }

  canvas.width = grid.width;
  canvas.height = grid.height;

  for (const [index, asset] of assets.entries()) {
    const svgElement = svgElements.get(asset.id);

    if (!svgElement) {
      throw new Error("SVG preview element is missing.");
    }

    const pngBlob = await svgElementToPngBlob(svgElement, asset.size);
    const image = await loadBlobImage(pngBlob);
    const column = index % grid.columns;
    const row = Math.floor(index / grid.columns);

    context.drawImage(
      image,
      column * asset.size,
      row * asset.size,
      asset.size,
      asset.size,
    );
  }

  const spriteSheetBlob = await createSpriteSheetBlob(canvas);
  const fileName = buildSpriteSheetFileName(formState);

  downloadSpriteSheet(spriteSheetBlob, fileName);
}
