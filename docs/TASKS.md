# 任务清单

## MVP PR 进度

| PR | 范围 | 状态 |
| --- | --- | --- |
| PR1 | 项目骨架、FastAPI 健康检查与初始 SDD 文档 | 已完成 |
| PR2 | 前端参数表单与参数 JSON 展示 | 已完成 |
| PR3 | 本地规则 SVG 素材预览与素材卡片 | 已完成 |
| PR4 | 单素材 PNG 下载 | 已完成 |
| PR5 | `metadata.json` 导出 | 已完成 |
| PR6 | MVP 使用说明与验收文档收口 | 已完成 |
| PR7 | ZIP 资源包导出 | 已完成 |
| PR8 | Sprite Sheet 导出 | 已完成 |
| PR9 | 前端模块边界重构 | 已完成 |
| PR10 | 后端 Planner API 与 fallback planner | 已完成 |
| PR11 | 前端 AI 需求规划面板与参数自动填充 | 已完成 |
| PR12 | 本地 Agent Pipeline Skeleton 与 variant 渲染适配 | 已完成 |
| PR13 | 百炼 LLM Art Planner V2 与 `AssetPackPlan` fallback 接入 | 已完成 |
| PR14 | 后端 Tool Registry 与百炼 Function Calling 调度器 | 本次完成 |

## 当前 MVP 已交付范围

- 参数选择：主题、风格、素材类型、尺寸、数量。
- 本地规则 SVG 预览：药水、金币、史莱姆、剑、地砖。
- 三种主题与两种风格。
- 单素材 PNG 下载。
- 本次生成任务的 `metadata.json` 下载。
- 当前结果的 ZIP 资源包下载。
- 当前结果的 Sprite Sheet 下载。
- 后端 `GET /health` 健康检查。
- 后端 `POST /api/plan` fallback 规则规划接口，无需 API Key。
- 前端 AI 需求规划面板：优先调用完整 plan-pack 接口，百炼未启用或失败时使用 fallback，生成仍由用户手动触发。
- 前端本地 Agent Pipeline Skeleton：以 Planner、Palette/Variant/Render/Export Skills 与 Validation 组织生成链路。
- 同类型 variant 差异展示，且 metadata 保留名称、variant 与描述字段。
- 后端 `POST /api/agent/plan-pack`：可选百炼 JSON 规划与无 Key/失败 fallback。
- 后端 Tool Registry：五个应用侧本地工具及 `/api/tools` 调试接口。
- 后端 `POST /api/agent/function-plan`：百炼选择工具、后端执行与装配计划，失败自动 fallback。
- 前端保存完整 external `AssetPackPlan` 并在生成时交给现有 pipeline。

## 后续增强任务

以下事项不属于当前 MVP 已实现范围：

- LangChain / MCP 编排与 Optional AI Generation。
- LangChain Tool Calling。
- MCP Server。
