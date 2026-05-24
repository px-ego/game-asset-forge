# Prompting 与 Agent 规划

## 当前状态

当前已支持可选的阿里百炼 Qwen Planner，但尚未接入 Function Calling、Tool Calling、LangChain、MCP 或多 Agent。

PR10 新增后端 fallback planner API：`POST /api/plan` 可以通过固定关键词规则把中文自然语言需求转换为结构化 `AssetPlan`。它不调用模型、不需要 API Key，用于保证 Planner 契约可演示、可验证。

PR11 新增前端「AI 需求规划」面板：用户可以输入需求并调用 Planner API，将返回计划写入现有参数表单。规划不会自动生成素材；用户仍需手动确认并点击“生成素材”。

PR12 接入可选百炼 LLM Planner：当 `LLM_ENABLED=true` 且本地配置 `DASHSCOPE_API_KEY` 时优先尝试模型；配置缺失、调用失败、JSON 解析失败或 `AssetPlan` 校验失败时自动使用 fallback。

当前素材生成仍由浏览器端本地规则完成。LLM 只作为 **Planner**，不作为 **Painter**。后端未启动时，规划面板会提示服务不可用，用户仍可手动选择参数并完成 SVG 预览与本地导出。

## 设计原则

当前及后续的模型职责边界保持一致：LLM 只作为 **Planner**，不作为 **Painter**：

- Planner 负责理解用户自然语言意图并输出结构化素材规格。
- 本地 Renderer 继续负责可控、可重复的素材绘制与导出。
- 该分工用于维持生成流程的稳定性、成本可控性和可验收性。

## Planner 契约

当前接口支持类似请求：

```json
{
  "prompt": "生成一套地牢像素风素材，包括金币、药水和史莱姆，尺寸64，每种4个"
}
```

响应为结构化 `AssetPlan`：

```json
{
  "success": true,
  "source": "fallback",
  "plan": {
    "theme": "dungeon",
    "style": "pixel",
    "assetTypes": ["coin", "potion", "slime"],
    "size": 64,
    "count": 4
  },
  "message": "规划成功"
}
```

Fallback 识别规则覆盖主题、风格、五类素材、尺寸和数量；无法识别或输入为空时返回默认的森林像素风金币方案，尺寸 `64`、数量 `4`。

百炼路径使用 OpenAI-compatible API 的 JSON 对象响应模式。系统提示词要求只输出 JSON、不输出 Markdown 或解释文字，并约束字段值域、默认值、素材类型非空且不重复。返回内容仍需经过 `json.loads` 和 Pydantic `AssetPlan` 校验，校验失败不会进入 Renderer，而是回退到 fallback。

## 本地配置边界

- `LLM_ENABLED=false` 为默认设置，直接使用 fallback。
- API Key 只能配置在本地 `.env` 或环境变量 `DASHSCOPE_API_KEY` 中。
- `.env` 不得提交，代码和文档不包含真实密钥。
- 默认百炼模型为 `qwen-plus`，默认 compatible endpoint 为 `https://dashscope.aliyuncs.com/compatible-mode/v1`。

## 当前交互边界

1. 前端将用户文本发送给 `/api/plan`。
2. 后端根据配置选择百炼或 fallback，并始终返回经过校验的结构化计划。
3. 响应通过前端基础字段与枚举值校验后写入参数表单。
4. 用户可以继续修改参数，并手动触发本地 Renderer。
5. 当前不存在自动工具调用或 Agent 执行链。

## 后续路线

1. 进一步优化 Planner 提示词与输出稳定性。
2. Function Calling / Tool Calling：调用校验、渲染、导出等工具。
3. LangChain Tool Calling：管理模型和工具流程。
4. MCP Server：将素材能力作为工具服务暴露给外部 Agent。

这些工具与 Agent 能力均属于后续增强，不是当前已完成功能。
