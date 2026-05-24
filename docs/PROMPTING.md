# Prompting 与 Agent 规划

## 当前 MVP 状态

当前 MVP 未接入 LLM，也没有自然语言输入解析、Prompt 调用、Structured Output、Function Calling、LangChain 或 MCP 实现。

当前素材生成由浏览器端本地规则完成：用户通过参数表单直接提供主题、风格、素材类型、尺寸和数量，页面生成 SVG 预览，并支持单素材 PNG 与 `metadata.json` 下载。

## 设计原则

后续若引入大模型，LLM 只作为 **Planner**，不作为 **Painter**：

- Planner 负责理解用户自然语言意图并输出结构化素材规格。
- 本地 Renderer 继续负责可控、可重复的素材绘制与导出。
- 该分工用于维持生成流程的稳定性、成本可控性和可验收性。

## 未来输入与 AssetSpec

未来可支持类似需求：

```text
生成一套地牢像素风素材，包括金币、药水和史莱姆，尺寸为 64x64。
```

规划器目标输出为结构化 `AssetSpec`，例如：

```json
{
  "theme": "dungeon",
  "style": "pixel",
  "assetTypes": ["coin", "potion", "slime"],
  "size": 64,
  "count": 4
}
```

以上为未来规划示例，当前 MVP 未提供该输入入口或模型调用。

## 后续路线

1. LLM Planner：自然语言转 `AssetSpec`。
2. Structured Output：约束输出符合 Schema。
3. Function Calling / Tool Calling：调用校验、渲染、导出等工具。
4. LangChain Tool Calling：管理模型和工具流程。
5. MCP Server：将素材能力作为工具服务暴露给外部 Agent。

这些能力均属于后续增强，不是当前已完成功能。
