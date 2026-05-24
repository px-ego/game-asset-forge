import { type GeneratedAsset, type GenerateFormState } from "../../types/asset";

function createSeed(source: string): number {
  let hash = 0;

  for (const character of source) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash || 1;
}

export function generateAssets(formState: GenerateFormState): GeneratedAsset[] {
  return formState.assetTypes.flatMap((assetType) =>
    Array.from({ length: formState.count }, (_, index) => {
      const assetNumber = index + 1;

      return {
        id: `asset_${assetType}_${String(assetNumber).padStart(3, "0")}`,
        type: assetType,
        theme: formState.theme,
        style: formState.style,
        size: formState.size,
        seed: createSeed(
          `${formState.theme}:${formState.style}:${formState.size}:${assetType}:${assetNumber}`,
        ),
      };
    }),
  );
}
