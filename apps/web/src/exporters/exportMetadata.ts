import { assetTypeLabels } from "../features/asset-generator/assetOptions";
import {
  type ExportMetadata,
  type GeneratedAsset,
  type GenerateFormState,
} from "../types/asset";

function buildAssetPngFileName(asset: GeneratedAsset): string {
  return `gameasset_${asset.type}_${asset.theme}_${asset.style}_${asset.size}_${asset.seed}.png`;
}

export function buildMetadata(
  formState: GenerateFormState,
  assets: GeneratedAsset[],
  createdAt = new Date().toISOString(),
): ExportMetadata {
  return {
    project: "GameAssetForge",
    projectName: "游素工坊",
    version: "0.1.0",
    createdAt,
    request: {
      ...formState,
      assetTypes: [...formState.assetTypes],
    },
    total: assets.length,
    assets: assets.map((asset) => ({
      id: asset.id,
      type: asset.type,
      name: asset.name ?? assetTypeLabels[asset.type],
      theme: asset.theme,
      style: asset.style,
      size: asset.size,
      seed: asset.seed,
      fileName: buildAssetPngFileName(asset),
      ...(asset.variant ? { variant: asset.variant } : {}),
      ...(asset.description ? { description: asset.description } : {}),
    })),
  };
}

export function buildMetadataFileName(metadata: ExportMetadata): string {
  const timestamp = metadata.createdAt.replace(/[:.]/g, "-");

  return `gameasset_metadata_${metadata.request.theme}_${metadata.request.style}_${metadata.request.size}_${timestamp}.json`;
}

export function downloadMetadata(metadata: ExportMetadata, fileName: string): void {
  const jsonContent = JSON.stringify(metadata, null, 2);
  const downloadUrl = URL.createObjectURL(
    new Blob([jsonContent], { type: "application/json;charset=utf-8" }),
  );
  const link = document.createElement("a");

  link.download = fileName;
  link.href = downloadUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
}
