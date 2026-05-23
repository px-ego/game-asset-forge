# 架构说明

## 文档状态

本文档描述 PR1 的工程骨架边界。产品需求以 `SPEC.md` v1.0 为准，本 PR 不实现素材生成流程。

## 技术结构

| 模块 | 技术 | PR1 职责 |
| --- | --- | --- |
| `apps/web` | React + TypeScript + Vite | 显示项目标题与定位说明 |
| `apps/api` | Python + FastAPI | 提供 `GET /health` 健康检查接口 |
| `packages/renderer` | 预留 | 不实现本地规则生成 |
| `packages/schema` | 预留 | 不实现业务数据结构 |
| `examples` | 预留 | 不提供生成示例 |

## 当前调用边界

- 前端页面为静态介绍页，不请求后端，不包含参数表单。
- 后端仅暴露健康检查接口，不提供生成、校验或导出接口。
- 前后端可独立启动，便于后续按小步 PR 扩展。

## 本阶段排除项

PR1 不引入 LLM、LangChain、MCP、Stable Diffusion、数据库、登录、云部署和多 Agent，也不实现 Renderer、Schema、预览或导出功能。
