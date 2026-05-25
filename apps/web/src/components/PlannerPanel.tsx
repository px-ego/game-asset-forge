import { useState } from "react";
import { planAssetPackPrompt } from "../api/agentPlannerApi";
import { type AssetPackPlan, type FunctionToolCall } from "../agent/types/agent";
import { type GenerateFormState, type PlannerSource } from "../types/asset";

interface PlannerPanelProps {
  currentFormState: GenerateFormState;
  onPlanApplied(
    plan: AssetPackPlan,
    source: PlannerSource,
    warnings: string[],
    toolCalls: FunctionToolCall[],
  ): void;
}

type PlannerStatus = "success" | "error" | null;

export function PlannerPanel({
  currentFormState,
  onPlanApplied,
}: PlannerPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const [status, setStatus] = useState<PlannerStatus>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const handlePlan = async () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setStatus("error");
      setStatusMessage("请输入素材需求描述");
      return;
    }

    setIsPlanning(true);
    setStatus(null);
    setStatusMessage("");

    try {
      const response = await planAssetPackPrompt(trimmedPrompt, currentFormState);

      if (!response.success || !response.plan) {
        setStatus("error");
        setStatusMessage(response.message);
        return;
      }

      onPlanApplied(
        response.plan,
        response.source,
        response.warnings,
        response.toolCalls,
      );
      setStatus("success");
      setStatusMessage(`${response.message}，来源：${response.source}`);
    } catch {
      setStatus("error");
      setStatusMessage("AI 规划服务不可用，请手动选择参数");
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <section className="planner-panel" aria-labelledby="planner-title">
      <div className="panel-header">
        <h2 id="planner-title">AI 需求规划</h2>
        <p>
          输入自然语言需求，系统会规划完整素材包；启用百炼时可通过 Function
          Calling 调用本地工具，未配置或失败时自动使用 fallback。
        </p>
      </div>

      <label className="planner-field" htmlFor="planner-prompt">
        <span>素材需求描述</span>
        <textarea
          id="planner-prompt"
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="例如：生成一套地牢像素风素材，包括金币、药水和史莱姆，尺寸64，每种4个"
          rows={4}
          value={prompt}
        />
      </label>

      <button
        className="planner-button"
        disabled={isPlanning}
        onClick={handlePlan}
        type="button"
      >
        {isPlanning ? "规划中..." : "使用 AI 规划参数"}
      </button>

      {status && (
        <p className={`planner-status ${status}`} role="status">
          {statusMessage}
        </p>
      )}
    </section>
  );
}
