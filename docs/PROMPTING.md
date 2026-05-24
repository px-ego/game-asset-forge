# Prompting 与 Agent 规划

## 当前状态

当前仍未接入真实 LLM、Structured Output、Function Calling、LangChain 或 MCP。

PR10 新增后端 fallback planner API：`POST /api/plan` 可以通过固定关键词规则把中文自然语言需求转换为结构化 `AssetPlan`。它不调用模型、不需要 API Key，用于保证 Planner 契约可演示、可验证。

当前素材生成仍由浏览器端本地规则完成：用户通过参数表单直接提供主题、风格、素材类型、尺寸和数量，页面生成 SVG 预览与本地导出。前端目前未连接 planner API。

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

## 后续路线

1. 真实 LLM Planner：在 fallback 已固定的 `AssetPlan` 契约上增强自然语言理解。
2. Structured Output：约束模型输出符合 Schema。
3. Function Calling / Tool Calling：调用校验、渲染、导出等工具。
4. LangChain Tool Calling：管理模型和工具流程。
5. MCP Server：将素材能力作为工具服务暴露给外部 Agent。

这些模型与 Agent 能力均属于后续增强，不是当前已完成功能。
