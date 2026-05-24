# 架构说明

## 文档状态

本文档描述包含本地导出扩展、前端规划面板与 PR12 可选百炼 LLM Planner 后的架构。产品需求以 `SPEC.md` v1.0 为准；LangChain、Tool Calling、MCP 与多 Agent 尚未实现。

## 技术结构

| 模块 | 技术 | 当前职责 |
| --- | --- | --- |
| `apps/web` | React + TypeScript + Vite | AI 需求规划面板、参数表单、本地规则 SVG 预览及全部本地导出 |
| `apps/api` | Python + FastAPI + Pydantic + OpenAI SDK | 提供 `GET /health` 与支持百炼/fallback 的 `POST /api/plan` |
| `packages/renderer` | 预留 | 当前未承载实现，渲染逻辑位于前端 |
| `packages/schema` | 预留 | 当前未拆分为公共包 |
| `examples` | 预留 | 当前未提供静态示例资产 |

## 当前前端流程

```mermaid
flowchart LR
  P["AI 需求规划面板"] -->|"POST /api/plan"| H["LLM 或 fallback AssetPlan"]
  H -->|"填充参数，不自动生成"| A["参数表单"]
  A --> B["本地生成素材记录"]
  B --> C["SVG 规则预览"]
  C --> D["单素材 PNG 下载"]
  B --> E["metadata.json 下载"]
  C --> F["ZIP 资源包下载"]
  C --> G["Sprite Sheet 下载"]
```

1. 用户可以输入中文需求，由前端调用后端 Planner 获得 `AssetPlan` 并填入参数表单；后端按配置选择百炼或 fallback。
2. 用户也可以跳过规划或在规划后继续手动修改主题、风格、素材类型、尺寸和数量。
3. 用户手动点击生成后，前端根据参数生成含 `id`、`type`、`theme`、`style`、`size`、`seed` 的素材列表。
4. SVG 组件根据素材类型、主题色板与风格规则绘制卡片预览。
5. 单素材 PNG 下载将当前 SVG 栅格化为所选尺寸的 PNG。
6. Metadata 下载将本次请求和素材列表导出为 JSON。
7. ZIP 下载复用 PNG 栅格化结果，打包全部素材与 `metadata.json`。
8. Sprite Sheet 下载按页面素材顺序将预览合成为网格 PNG。

## 前端模块分层

```text
apps/web/src/
  api/
    plannerApi.ts
  components/
    AssetCard.tsx
    AssetPreview.tsx
    PlannerPanel.tsx
  features/
    asset-generator/
      assetOptions.ts
      generateAssets.ts
  exporters/
    exportPng.ts
    exportMetadata.ts
    exportZip.ts
    exportSpriteSheet.ts
  types/
    asset.ts
  App.tsx
  main.tsx
  index.css
```

| 层级 | 当前职责 |
| --- | --- |
| `types/asset.ts` | 表单、计划、素材记录和 metadata 的共享类型契约 |
| `api/plannerApi.ts` | 调用 Planner API 并校验未知响应数据；来源可为百炼或 fallback |
| `features/asset-generator/` | 参数选项与确定性本地素材记录生成 |
| `components/` | 规划输入面板、SVG 规则预览和素材卡片交互 |
| `exporters/` | PNG、metadata、ZIP 与 Sprite Sheet 本地导出 |
| `App.tsx` | 表单与导出动作编排，不承载渲染或文件构造细节 |

## 后端模块分层

```text
apps/api/app/
  core/
    config.py             # CORS 与可选百炼环境配置
  schemas/
    planner.py            # PlanRequest、AssetPlan、PlanResponse
  planner/
    fallback_planner.py   # 不依赖模型的规则解析
    prompt_templates.py   # 仅 JSON 输出的规划提示词
    llm_planner.py        # 百炼 OpenAI-compatible 客户端调用与校验
  routes/
    health.py             # GET /health
    planner.py            # POST /api/plan
  main.py                 # FastAPI 应用装配
```

```mermaid
flowchart LR
  P["中文 prompt"] --> R["POST /api/plan"]
  R --> E{"LLM 已启用且配置 Key?"}
  E -->|"否"| F["fallback planner"]
  E -->|"是"| L["百炼 Qwen JSON mode"]
  L --> V["Pydantic AssetPlan 校验"]
  V -->|"成功"| S["source=llm"]
  L -->|"调用或解析失败"| F
  V -->|"校验失败"| F
  F --> T["source=fallback"]
```

Planner API 默认使用无需 API Key 的 fallback；仅当本地启用并配置百炼密钥时尝试 LLM。LLM 输出通过 JSON 解析和严格 `AssetPlan` 校验后才会返回，任何失败都转入 fallback。前端只将计划填入表单，不自动触发素材生成。

## 运行边界

- 素材生成与导出仍在浏览器前端本地完成，不向后端发送生成请求。
- 仅 AI 需求规划面板向后端发送中文需求；后端不可用时，手动参数流程仍可使用。
- 后端 Planner 可选访问阿里百炼，但不承担素材绘制、文件存储或鉴权。
- 未配置密钥、关闭 LLM 或 LLM 路径失败时，`POST /api/plan` 使用本地规则产出 `AssetPlan`。
- 当前没有数据库、登录、云部署或第三方图像生成服务依赖。

## 后续规划边界

当前 LLM 只作为 Planner，不作为 Painter；本地 Renderer 仍负责可控绘制与导出。百炼路径使用 JSON 对象响应加 Pydantic 校验保持 `AssetPlan` 契约。

当前未实现 Function Calling、Tool Calling、LangChain、MCP、多 Agent 或批量 PNG 单独下载。
