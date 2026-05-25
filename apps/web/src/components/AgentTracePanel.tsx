import { type AgentTrace, type AgentToolCallTrace } from "../agent/types/agent";

interface AgentTracePanelProps {
  trace: AgentTrace | null;
}

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2) ?? "null";
}

function ToolTrace({ toolCall }: { toolCall: AgentToolCallTrace }) {
  const result = toolCall.resultSummary ?? toolCall.result;

  return (
    <li className="agent-trace-call">
      <div className="agent-trace-call-header">
        <strong>{toolCall.toolName}</strong>
        <span className={toolCall.success ? "trace-success" : "trace-error"}>
          {toolCall.success ? "成功" : "失败"}
        </span>
        {toolCall.durationMs !== undefined && (
          <span>{`${toolCall.durationMs} ms`}</span>
        )}
      </div>
      {toolCall.message && <p>{toolCall.message}</p>}
      {toolCall.warnings?.map((warning) => (
        <p className="agent-trace-warning" key={warning}>
          {warning}
        </p>
      ))}
      {toolCall.rawArguments && (
        <>
          <h4>模型参数</h4>
          <pre>{formatJson(toolCall.rawArguments)}</pre>
        </>
      )}
      <h4>执行参数</h4>
      <pre>{formatJson(toolCall.normalizedArguments ?? toolCall.arguments)}</pre>
      {result !== undefined && (
        <>
          <h4>结果摘要</h4>
          <pre>{formatJson(result)}</pre>
        </>
      )}
    </li>
  );
}

export function AgentTracePanel({ trace }: AgentTracePanelProps) {
  return (
    <section className="agent-trace-panel" aria-label="Agent 调用轨迹">
      <details>
        <summary>
          <span>Agent 调用轨迹</span>
          <span className="agent-trace-summary-source">
            {trace ? `来源：${trace.source}` : "暂无 Agent 调用轨迹"}
          </span>
        </summary>
        {!trace ? (
          <p className="agent-trace-empty">暂无 Agent 调用轨迹</p>
        ) : (
          <div className="agent-trace-body">
            <div className="agent-trace-status">
              <p>{`当前规划来源：${trace.source}`}</p>
              <p>{trace.message}</p>
            </div>
            {trace.warnings.length > 0 && (
              <div className="agent-trace-warnings">
                <h3>提示与警告</h3>
                {trace.warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            )}
            <div className="agent-trace-plan">
              <h3>AssetPackPlan 摘要</h3>
              {trace.plan ? (
                <>
                  <p>{trace.plan.goal}</p>
                  <p>
                    {`${trace.plan.theme} / ${trace.plan.style} / ${trace.plan.size} x ${trace.plan.size} / 每类 ${trace.plan.count} 个`}
                  </p>
                  <p>{`计划素材：${trace.plan.assets.length} 个`}</p>
                  <pre>{formatJson(trace.plan.palette)}</pre>
                  <p>
                    {`风格提示：${trace.plan.globalStyleHints.join(" / ") || "无"}`}
                  </p>
                </>
              ) : (
                <p>暂无计划摘要</p>
              )}
            </div>
            <div className="agent-trace-tools">
              <h3>工具调用</h3>
              {trace.toolCalls.length === 0 ? (
                <p>本次规划未返回工具调用记录。</p>
              ) : (
                <ol>
                  {trace.toolCalls.map((toolCall, index) => (
                    <ToolTrace
                      key={`${toolCall.toolName}-${index}`}
                      toolCall={toolCall}
                    />
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </details>
    </section>
  );
}
