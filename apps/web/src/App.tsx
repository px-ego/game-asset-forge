import { type FormEvent, useCallback, useRef, useState } from "react";
import {
  assetTypeOptions,
  countOptions,
  sizeOptions,
  styleOptions,
  themeOptions,
} from "./assetOptions";
import { AssetCard } from "./components/AssetCard";
import {
  type AssetCount,
  type AssetSize,
  type AssetStyle,
  type AssetType,
  type GeneratedAsset,
  type GenerateFormState,
  type Theme,
} from "./types";
import {
  buildMetadata,
  buildMetadataFileName,
  downloadMetadata,
} from "./utils/exportMetadata";
import { exportAssetsZip } from "./utils/exportZip";
import { generateAssets } from "./utils/generateAssets";

const initialFormState: GenerateFormState = {
  theme: "forest",
  style: "pixel",
  assetTypes: [],
  size: 64,
  count: 1,
};

function App() {
  const [formState, setFormState] = useState<GenerateFormState>(initialFormState);
  const [submittedState, setSubmittedState] = useState<GenerateFormState | null>(null);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [validationMessage, setValidationMessage] = useState("");
  const [metadataError, setMetadataError] = useState("");
  const [zipError, setZipError] = useState("");
  const [isZipExporting, setIsZipExporting] = useState(false);
  const previewElementsRef = useRef<Map<string, SVGSVGElement>>(new Map());

  const handleAssetTypeChange = (assetType: AssetType, checked: boolean) => {
    setFormState((currentState) => ({
      ...currentState,
      assetTypes: checked
        ? [...currentState.assetTypes, assetType]
        : currentState.assetTypes.filter((item) => item !== assetType),
    }));
    setValidationMessage("");
    setMetadataError("");
    setZipError("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formState.assetTypes.length === 0) {
      setValidationMessage("请至少选择一种素材类型");
      setSubmittedState(null);
      setGeneratedAssets([]);
      setMetadataError("");
      setZipError("");
      return;
    }

    setValidationMessage("");
    setMetadataError("");
    setZipError("");
    setSubmittedState(formState);
    setGeneratedAssets(generateAssets(formState));
  };

  const handleMetadataDownload = () => {
    if (!submittedState || generatedAssets.length === 0) {
      return;
    }

    setMetadataError("");

    try {
      const metadata = buildMetadata(submittedState, generatedAssets);
      downloadMetadata(metadata, buildMetadataFileName(metadata));
    } catch {
      setMetadataError("metadata.json 导出失败，请重试");
    }
  };

  const handlePreviewReady = useCallback(
    (assetId: string, element: SVGSVGElement | null) => {
      if (element) {
        previewElementsRef.current.set(assetId, element);
        return;
      }

      previewElementsRef.current.delete(assetId);
    },
    [],
  );

  const handleZipDownload = async () => {
    if (!submittedState || generatedAssets.length === 0) {
      return;
    }

    setIsZipExporting(true);
    setZipError("");

    try {
      await exportAssetsZip({
        formState: submittedState,
        assets: generatedAssets,
        svgElements: previewElementsRef.current,
      });
    } catch {
      setZipError("ZIP 导出失败，请重试。");
    } finally {
      setIsZipExporting(false);
    }
  };

  return (
    <main className="landing-page">
      <section className="hero" aria-label="项目介绍">
        <h1>游素工坊 GameAssetForge</h1>
        <p className="description">
          面向 2D 游戏开发流程的 AI 辅助素材生成工具
        </p>
      </section>

      <section className="config-panel" aria-labelledby="config-title">
        <div className="panel-header">
          <h2 id="config-title">参数配置</h2>
          <p>选择本次希望生成的素材规格</p>
        </div>

        <form className="asset-form" onSubmit={handleSubmit}>
          <div className="select-grid">
            <label className="field">
              <span>游戏主题</span>
              <select
                value={formState.theme}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    theme: event.target.value as Theme,
                  }))
                }
              >
                {themeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>素材风格</span>
              <select
                value={formState.style}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    style: event.target.value as AssetStyle,
                  }))
                }
              >
                {styleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>素材尺寸</span>
              <select
                value={formState.size}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    size: Number(event.target.value) as AssetSize,
                  }))
                }
              >
                {sizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} x {size}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>生成数量</span>
              <select
                value={formState.count}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    count: Number(event.target.value) as AssetCount,
                  }))
                }
              >
                {countOptions.map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="asset-types">
            <legend>素材类型（可多选）</legend>
            <div className="checkbox-grid">
              {assetTypeOptions.map((option) => (
                <label className="checkbox" key={option.value}>
                  <input
                    checked={formState.assetTypes.includes(option.value)}
                    type="checkbox"
                    onChange={(event) =>
                      handleAssetTypeChange(option.value, event.target.checked)
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {validationMessage && (
            <p className="validation-message" role="alert">
              {validationMessage}
            </p>
          )}

          <button className="generate-button" type="submit">
            生成素材
          </button>
        </form>
      </section>

      {submittedState && (
        <section className="result-panel" aria-labelledby="result-title">
          <h2 id="result-title">当前参数 JSON</h2>
          <pre>{JSON.stringify(submittedState, null, 2)}</pre>
        </section>
      )}

      {generatedAssets.length > 0 && (
        <section className="preview-panel" aria-labelledby="preview-title">
          <div className="preview-header">
            <div>
              <h2 id="preview-title">素材预览</h2>
              <p>{`共生成 ${generatedAssets.length} 个本地预览素材`}</p>
            </div>
            <div className="preview-actions">
              <button
                className="metadata-button"
                onClick={handleMetadataDownload}
                type="button"
              >
                下载 metadata.json
              </button>
              <button
                className="zip-button"
                disabled={isZipExporting}
                onClick={handleZipDownload}
                type="button"
              >
                {isZipExporting ? "正在打包..." : "下载 ZIP 资源包"}
              </button>
            </div>
          </div>
          {metadataError && (
            <p className="metadata-error" role="alert">
              {metadataError}
            </p>
          )}
          {zipError && (
            <p className="zip-error" role="alert">
              {zipError}
            </p>
          )}
          <div className="asset-grid">
            {generatedAssets.map((asset) => (
              <AssetCard
                asset={asset}
                key={asset.id}
                onPreviewReady={handlePreviewReady}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
