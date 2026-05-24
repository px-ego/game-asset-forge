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
| PR12 | 可选阿里百炼 LLM Planner 与 fallback 保护 | 本次完成 |

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
- 后端可选百炼 LLM Planner：JSON 对象响应经 `AssetPlan` 校验，异常自动 fallback。
- 前端 AI 需求规划面板：调用 Planner 自动填充表单，生成仍由用户手动触发。

## 后续增强任务

以下事项不属于当前 MVP 已实现范围：

- 更严格的模型输出策略与计划质量优化。
- Function Calling / Tool Calling。
- LangChain Tool Calling。
- MCP Server。
