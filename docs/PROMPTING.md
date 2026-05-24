# Prompting 与 Agent 规划

## 当前状态

当前仍未接入真实 LLM、Structured Output、Function Calling、LangChain 或 MCP。

PR10 新增后端 fallback planner API：`POST /api/plan` 可以通过固定关键词规则把中文自然语言需求转换为结构化 `AssetPlan`。它不调用模型、不需要 API Key，用于保证 Planner 契约可演示、可验证。

PR11 新增前端「AI 需求规划」面板：用户可以输入需求并调用该 fallback API，将返回计划写入现有参数表单。规划不会自动生成素材；用户仍需手动确认并点击“生成素材”。

当前素材生成仍由浏览器端本地规则完成。后端未启动时，规划面板会提示服务不可用，用户仍可手动选择参数并完成 SVG 预览与本地导出。

PR12 新增前端 Agent Pipeline Skeleton。它把用户确认后的表单参数和可选 prompt 交给本地 Planner Agent，再通过 `PaletteSkill`、`VariantSkill`、`RenderSkill` 与 Validation Layer 生成素材记录。该链路是 deterministic 本地代码，不是 LLM Agent，也不需要 API Key。

## 设计原则

后续若引入大模型，LLM 只作为 **Planner**，不作为 **Painter**：

- Planner 负责理解用户自然语言意图并输出结构化素材规格。
- 本地 Renderer 继续负责可控、可重复的素材绘制与导出。
- 该分工用于维持生成流程的稳定性、成本可控性和可验收性。

## Fallback Planner 契约

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

识别规则覆盖主题、风格、五类素材、尺寸和数量；无法识别或输入为空时返回默认的森林像素风金币方案，尺寸 `64`、数量 `4`。

## 当前交互边界

1. 前端将用户文本发送给 `/api/plan`。
2. 响应通过基础字段与枚举值校验后写入参数表单。
3. 用户可以继续修改参数，并手动触发本地 Renderer。
4. 本地 Agent Pipeline 会为同类型素材生成不同 `variant`、描述与渲染提示，并由 Renderer 展示差异。
5. 当前不存在模型调用、自动工具调用、LangChain 或 MCP 调用。

## 本地 Pipeline 契约

当前 pipeline 的计划层以 `AssetPackPlan` 组织数据：

- `palette`：由 `PaletteSkill` 基于主题、风格和关键词构造。
- `assets`：由 `VariantSkill` 构造，每项具有 `name`、`description`、`variant`、`seed` 和 `renderHints`。
- `globalStyleHints`：记录像素/卡通及关键词对应的本地风格提示。

`RenderSkill` 将计划转换为既有预览与导出层使用的素材记录；`ExportSkill` 目前仅登记 PNG、metadata、ZIP、Sprite Sheet 能力，尚未接管导出，也不构成 Function Calling。

## 后续路线

1. 百炼/真实 LLM Planner：在 fallback 已固定的 `AssetPlan` 契约上增强自然语言理解。
2. Structured Output：约束模型输出符合 Schema。
3. Function Calling / Tool Calling：调用校验、渲染、导出等工具。
4. LangChain Tool Calling：管理模型和工具流程。
5. MCP Server：将素材能力作为工具服务暴露给外部 Agent。

这些模型与外部 Agent 能力均属于后续增强；当前完成范围仅为可本地运行的 Pipeline Skeleton。
