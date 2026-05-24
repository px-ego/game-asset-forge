import JSZip from "jszip";
import { type GeneratedAsset, type GenerateFormState } from "../types/asset";
import { buildMetadata } from "./exportMetadata";
import { svgElementToPngBlob } from "./exportPng";

interface ExportAssetsZipParams {
  formState: GenerateFormState;
  assets: GeneratedAsset[];
  svgElements: ReadonlyMap<string, SVGSVGElement>;
}

function downloadZipBlob(blob: Blob, fileName: string): void {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.download = fileName;
  link.href = downloadUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
}

export function buildZipFileName(
  formState: GenerateFormState,
  createdAt: string,
): string {
  const timestamp = createdAt.replace(/[:.]/g, "-");

  return `gameasset_pack_${formState.theme}_${formState.style}_${formState.size}_${timestamp}.zip`;
}

export async function exportAssetsZip({
  formState,
  assets,
  svgElements,
}: ExportAssetsZipParams): Promise<void> {
  const metadata = buildMetadata(formState, assets);
  const zip = new JSZip();
  const assetsFolder = zip.folder("assets");

  if (!assetsFolder) {
    throw new Error("ZIP assets folder could not be created.");
  }

  await Promise.all(
    metadata.assets.map(async (metadataAsset) => {
      const svgElement = svgElements.get(metadataAsset.id);

      if (!svgElement) {
        throw new Error("SVG preview element is missing.");
      }

      const pngBlob = await svgElementToPngBlob(svgElement, metadataAsset.size);
      assetsFolder.file(metadataAsset.fileName, pngBlob);
    }),
  );

  zip.file("metadata.json", JSON.stringify(metadata, null, 2));

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const fileName = buildZipFileName(formState, metadata.createdAt);

  downloadZipBlob(zipBlob, fileName);
}
