import { type FormEvent, useCallback, useRef, useState } from "react";
import {
  assetTypeOptions,
  countOptions,
  sizeOptions,
  styleOptions,
  themeOptions,
} from "./features/asset-generator/assetOptions";
import { AssetCard } from "./components/AssetCard";
import { PlannerPanel } from "./components/PlannerPanel";
import {
  type AssetCount,
  type AssetSize,
  type AssetStyle,
  type AssetType,
  type GeneratedAsset,
  type GenerateFormState,
  type PlannerSource,
  type Theme,
} from "./types/asset";
import {
  type AgentPipelineResult,
  type AssetPackPlan,
  type FunctionToolCall,
} from "./agent/types/agent";
import { buildAssetPack } from "./agent/pipeline/buildAssetPack";
import {
  buildMetadata,
  buildMetadataFileName,
  downloadMetadata,
} from "./exporters/exportMetadata";
import { exportSpriteSheet } from "./exporters/exportSpriteSheet";
import { exportAssetsZip } from "./exporters/exportZip";

const initialFormState: GenerateFormState = {
  theme: "forest",
  style: "pixel",
  assetTypes: [],
  size: 64,
  count: 1,
};

function getPlanAssetTypes(plan: AssetPackPlan): AssetType[] {
  return plan.assets.reduce<AssetType[]>((types, asset) => {
    if (!types.includes(asset.type)) {
      types.push(asset.type);
    }

    return types;
  }, []);
}

function planMatchesFormState(
  plan: AssetPackPlan,
  formState: GenerateFormState,
): boolean {
  const planAssetTypes = getPlanAssetTypes(plan);

  return (
    plan.theme === formState.theme &&
    plan.style === formState.style &&
    plan.size === formState.size &&
    plan.count === formState.count &&
    planAssetTypes.length === formState.assetTypes.length &&
    planAssetTypes.every((assetType) => formState.assetTypes.includes(assetType))
  );
}

function App() {
  const [formState, setFormState] = useState<GenerateFormState>(initialFormState);
  const [submittedState, setSubmittedState] = useState<GenerateFormState | null>(null);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [generationPrompt, setGenerationPrompt] = useState("");
  const [pipelineResult, setPipelineResult] = useState<AgentPipelineResult | null>(null);
  const [externalPlan, setExternalPlan] = useState<AssetPackPlan | null>(null);
  const [externalPlanSource, setExternalPlanSource] = useState<PlannerSource | null>(null);
  const [externalPlanWarnings, setExternalPlanWarnings] = useState<string[]>([]);
  const [externalToolCalls, setExternalToolCalls] = useState<FunctionToolCall[]>([]);
  const [planAdjustmentMessage, setPlanAdjustmentMessage] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [metadataError, setMetadataError] = useState("");
  const [zipError, setZipError] = useState("");
  const [isZipExporting, setIsZipExporting] = useState(false);
  const [spriteSheetError, setSpriteSheetError] = useState("");
  const [isSpriteSheetExporting, setIsSpriteSheetExporting] = useState(false);
  const previewElementsRef = useRef<Map<string, SVGSVGElement>>(new Map());

  const invalidateExternalPlan = () => {
    if (!externalPlan) {
      return;
    }

    setExternalPlan(null);
    setExternalPlanSource(null);
    setExternalPlanWarnings([]);
    setExternalToolCalls([]);
    setGenerationPrompt("");
    setPlanAdjustmentMessage("已修改参数，将使用本地规划重新生成");
  };

  const handleAssetTypeChange = (assetType: AssetType, checked: boolean) => {
    invalidateExternalPlan();
    setFormState((currentState) => ({
      ...currentState,
      assetTypes: checked
        ? [...currentState.assetTypes, assetType]
        : currentState.assetTypes.filter((item) => item !== assetType),
    }));
    setValidationMessage("");
    setMetadataError("");
    setZipError("");
    setSpriteSheetError("");
  };

  const handlePlanApplied = (
    plan: AssetPackPlan,
    source: PlannerSource,
    warnings: string[],
    toolCalls: FunctionToolCall[],
  ) => {
    setFormState({
      theme: plan.theme,
      style: plan.style,
      size: plan.size,
      count: plan.count,
      assetTypes: getPlanAssetTypes(plan),
    });
    setGenerationPrompt(plan.goal);
    setExternalPlan(plan);
    setExternalPlanSource(source);
    setExternalPlanWarnings(warnings);
    setExternalToolCalls(toolCalls);
    setPlanAdjustmentMessage("");
    setValidationMessage("");
    setMetadataError("");
    setZipError("");
    setSpriteSheetError("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formState.assetTypes.length === 0) {
      setValidationMessage("请至少选择一种素材类型");
      setSubmittedState(null);
      setGeneratedAssets([]);
      setPipelineResult(null);
      setMetadataError("");
      setZipError("");
      setSpriteSheetError("");
      return;
    }

    setValidationMessage("");
    setMetadataError("");
    setZipError("");
    setSpriteSheetError("");
    setSubmittedState(formState);
    const applicableExternalPlan =
      externalPlan && planMatchesFormState(externalPlan, formState)
        ? externalPlan
        : undefined;
    const result = buildAssetPack(
      formState,
      generationPrompt,
      applicableExternalPlan,
      externalPlanSource ?? "fallback",
    );
    setGeneratedAssets(result.assets);
    setPipelineResult(result);
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

  const handleSpriteSheetDownload = async () => {
    if (!submittedState || generatedAssets.length === 0) {
      return;
    }

    setIsSpriteSheetExporting(true);
    setSpriteSheetError("");

    try {
      await exportSpriteSheet({
        formState: submittedState,
        assets: generatedAssets,
        svgElements: previewElementsRef.current,
      });
    } catch {
      setSpriteSheetError("Sprite Sheet 导出失败，请重试。");
    } finally {
      setIsSpriteSheetExporting(false);
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

      <PlannerPanel
        currentFormState={formState}
        onPlanApplied={handlePlanApplied}
      />

      {externalPlan && externalPlanSource && (
        <section className="plan-summary" aria-labelledby="plan-summary-title">
          <h2 id="plan-summary-title">素材包设计摘要</h2>
          <p>{externalPlan.goal}</p>
          <div className="plan-summary-meta">
            <span>{`来源：${externalPlanSource}`}</span>
            <span>{`计划素材：${externalPlan.assets.length} 个`}</span>
          </div>
          <p className="plan-hints">
            {externalPlan.globalStyleHints.join(" / ") || "未提供额外风格提示"}
          </p>
          {externalToolCalls.length > 0 && (
            <p className="plan-hints">
              {`调用工具：${externalToolCalls
                .map((toolCall) => toolCall.toolName)
                .join(" / ")}`}
            </p>
          )}
          {externalPlanWarnings.map((warning) => (
            <p className="plan-warning" key={warning}>
              {warning}
            </p>
          ))}
        </section>
      )}

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
                onChange={(event) => {
                  invalidateExternalPlan();
                  setFormState((currentState) => ({
                    ...currentState,
                    theme: event.target.value as Theme,
                  }));
                }}
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
                onChange={(event) => {
                  invalidateExternalPlan();
                  setFormState((currentState) => ({
                    ...currentState,
                    style: event.target.value as AssetStyle,
                  }));
                }}
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
                onChange={(event) => {
                  invalidateExternalPlan();
                  setFormState((currentState) => ({
                    ...currentState,
                    size: Number(event.target.value) as AssetSize,
                  }));
                }}
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
                onChange={(event) => {
                  invalidateExternalPlan();
                  setFormState((currentState) => ({
                    ...currentState,
                    count: Number(event.target.value) as AssetCount,
                  }));
                }}
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

          {planAdjustmentMessage && (
            <p className="plan-adjustment-message" role="status">
              {planAdjustmentMessage}
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
              <p className="pipeline-status">
                {`Agent Pipeline：${pipelineResult?.source ?? "local-agent"} / 已生成 ${generatedAssets.length} 个 variant`}
              </p>
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
              <button
                className="sprite-sheet-button"
                disabled={isSpriteSheetExporting}
                onClick={handleSpriteSheetDownload}
                type="button"
              >
                {isSpriteSheetExporting ? "正在合成..." : "下载 Sprite Sheet"}
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
          {spriteSheetError && (
            <p className="sprite-sheet-error" role="alert">
              {spriteSheetError}
            </p>
          )}
          {pipelineResult && pipelineResult.warnings.length > 0 && (
            <div className="pipeline-warnings" role="status">
              {pipelineResult.warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
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
