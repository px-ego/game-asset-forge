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
| PR9 | 前端模块边界重构 | 本次完成 |

## 当前 MVP 已交付范围

- 参数选择：主题、风格、素材类型、尺寸、数量。
- 本地规则 SVG 预览：药水、金币、史莱姆、剑、地砖。
- 三种主题与两种风格。
- 单素材 PNG 下载。
- 本次生成任务的 `metadata.json` 下载。
- 当前结果的 ZIP 资源包下载。
- 当前结果的 Sprite Sheet 下载。
- 后端 `GET /health` 健康检查。

## 后续增强任务

以下事项不属于当前 MVP 已实现范围：

- LLM Planner：将自然语言需求转换为 `AssetSpec`。
- LangChain Tool Calling。
- MCP Server。
