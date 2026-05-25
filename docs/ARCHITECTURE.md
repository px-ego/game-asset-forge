# 架构说明

## 文档状态

本文档描述 PR14 百炼 Function Calling 调度器接入后的架构。产品需求以 `SPEC.md` v1.0 为准；模型仅规划并选择工具，本地工具执行、Renderer 与无 Key fallback 仍是稳定主链路。

## 技术结构

| 模块 | 技术 | 当前职责 |
| --- | --- | --- |
| `apps/web` | React + TypeScript + Vite | Art Planner 面板、external plan 接入、本地 SVG 预览及全部本地导出 |
| `apps/api` | Python + FastAPI + Pydantic + OpenAI SDK | 提供 Planner、Tool Registry、Function Calling 调度与 fallback |
| `packages/renderer` | 预留 | 当前未承载实现，渲染逻辑位于前端 |
| `packages/schema` | 预留 | 当前未拆分为公共包 |
| `examples` | 预留 | 当前未提供静态示例资产 |

## 当前前端流程

```mermaid
flowchart LR
  P["AI 需求规划面板"] -->|"优先 POST /api/agent/function-plan"| H["Function Calling 或 fallback AssetPackPlan"]
  H -->|"保存 externalPlan + 填充表单，不自动生成"| A["参数表单"]
  A --> B["Pipeline 选择 externalPlan 或 Local Planner"]
  B --> S["PaletteSkill + VariantSkill + RenderSkill"]
  S --> V["Validation Layer"]
  V --> C["SVG Renderer 预览"]
  C --> D["单素材 PNG 下载"]
  S --> E["metadata.json 下载"]
  C --> F["ZIP 资源包下载"]
  C --> G["Sprite Sheet 下载"]
```

1. 用户可以输入中文需求，由前端优先仅发送该目标至 `/api/agent/function-plan` 获得完整 `AssetPackPlan`，避免当前表单默认值覆盖自然语言中的规格；工具调度成功时来源为 `function_calling`，否则为 `fallback`。新接口不可用时前端再降级到 `/api/agent/plan-pack` 与旧 `/api/plan`。
2. 前端从计划中的素材类型填入表单并保存 `externalPlan`；用户仍需点击生成。若用户手动修改参数，外部计划失效并回到本地 Planner。
3. 用户手动点击生成后，`buildAssetPack` 优先消费匹配当前表单的 `externalPlan`；没有外部计划时继续调用本地 Planner Agent。
4. 素材基础字段保持 `id`、`type`、`theme`、`style`、`size`、`seed`，并扩展 `name`、`description`、`variant`、`palette` 与 `renderHints`。
5. Validation Layer 返回中文 warning 而不阻塞渲染；SVG Renderer 优先消费色板和渲染提示，使同类型 variant 可见不同。
6. 单素材 PNG 下载将当前 SVG 栅格化为所选尺寸的 PNG。
7. Metadata 下载将本次请求和素材列表导出为 JSON，并保留 `name`、`variant`、`description` 与 `renderHints`。
8. ZIP 下载复用 PNG 栅格化结果，打包全部素材与 `metadata.json`。
9. Sprite Sheet 下载按页面素材顺序将预览合成为网格 PNG。

## 前端模块分层

```text
apps/web/src/
  agent/
    pipeline/
      buildAssetPack.ts
    planner/
      localPlanner.ts
    skills/
      paletteSkill.ts
      variantSkill.ts
      renderSkill.ts
      exportSkill.ts
    types/
      agent.ts
    validation/
      validateAssetPack.ts
  api/
    agentPlannerApi.ts
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
| `api/agentPlannerApi.ts` | 优先调用完整素材包接口并校验 `AssetPackPlan`；必要时降级旧接口 |
| `api/plannerApi.ts` | 保留旧 fallback `AssetPlan` 接口客户端 |
| `agent/planner/` | 根据表单和可选 prompt 创建本地 `AssetPackPlan` |
| `agent/skills/` | 生成主题色板、variant 计划、渲染数据，并登记既有导出能力 |
| `agent/validation/` | 检查素材、seed、variant 与色板，返回非阻断 warning |
| `agent/pipeline/` | 串联本地 Planner、Skills 与 Validation 的生成入口 |
| `features/asset-generator/` | 参数选项及保留的旧生成模块 |
| `components/` | 规划输入面板、消费 variant 提示的 SVG 预览和素材卡片交互 |
| `exporters/` | PNG、metadata、ZIP 与 Sprite Sheet 本地导出 |
| `App.tsx` | 表单、pipeline 触发与导出动作编排，不承载绘制细节 |

## Agent Pipeline Skeleton

```mermaid
flowchart LR
  N["Natural Language Goal / 表单"] --> P["AssetPackPlan (external 或 local)"]
  P --> K["Skill / Tool Layer"]
  K --> R["Renderer"]
  R --> O["Optional AI Generation (预留，未实现)"]
  O --> X["Validation / Export"]
```

- `PaletteSkill` 根据主题、风格和可选关键词生成本地色板与样式提示。
- `VariantSkill` 为同类型素材规划不同名称、描述、`variant`、`renderHints` 与确定性 `seed`。
- `RenderSkill` 将本地或后端返回的计划转换为现有 UI/导出可消费的 `GeneratedAsset`，不操作 DOM 或 SVG。
- `ExportSkill` 当前只是能力描述骨架，未替换 `exporters/` 中已稳定的导出实现。
- Optional AI Generation 仅是模块边界预留，本 PR 没有接入图像模型或外部服务。

## 后端模块分层

```text
apps/api/app/
  agent/
    tools/
      base.py             # ToolDefinition 与本地工具执行契约
      registry.py         # 五个本地工具注册及执行入口
      palette_tool.py     # palette.generate
      variant_tool.py     # variant.generate
      render_tool.py      # render.prepare
      validate_tool.py    # asset_pack.validate
      export_tool.py      # export.describe
    function_calling/
      tool_schema_builder.py    # Registry 名称到 OpenAI tools schema
      tool_argument_normalizer.py # 全局约束覆盖模型工具参数漂移
      function_calling_agent.py # 百炼 tool_calls 调度与工具执行
      tool_result_assembler.py  # 工具结果装配 AssetPackPlan
  core/
    config.py             # CORS 与本地 .env 百炼配置
  schemas/
    planner.py            # PlanRequest、AssetPlan、PlanResponse
    asset_pack.py         # AssetPackPlan、PlanPackRequest、PlanPackResponse
    function_agent.py     # Function Calling 响应与 toolCalls
  planner/
    fallback_planner.py   # 不依赖模型的规则解析
    fallback_pack_planner.py # 不依赖模型的完整素材包计划
    bailian_pack_planner.py  # 百炼 JSON Mode 调用与 LLM 输出 normalize
    prompt_templates.py      # Art Planner JSON system prompt
  routes/
    health.py             # GET /health
    planner.py            # POST /api/plan
    agent.py              # POST /api/agent/plan-pack
    function_agent.py     # POST /api/agent/function-plan
    tools.py              # GET /api/tools、POST /api/tools/execute
  main.py                 # FastAPI 应用装配
apps/api/test_bailian_min.py # 手动最小 OpenAI-compatible / JSON Mode 联调脚本
```

```mermaid
flowchart LR
  P["中文 prompt"] --> R["POST /api/agent/function-plan"]
  R --> C{"LLM_ENABLED 且存在 Key?"}
  C -->|"是"| L["百炼 Qwen tools / tool_calls"]
  L --> B["Tool schema name 映射"]
  B --> E["应用侧执行 Registry 工具"]
  E --> A["装配并校验 AssetPackPlan"]
  A -->|"成功"| S["source=function_calling + toolCalls"]
  L -->|"无调用/异常"| F["fallback_pack_planner"]
  A -->|"工具或计划校验失败"| F
  C -->|"否"| F
  F --> T["source=fallback"]
```

旧 `/api/plan` 与 `/api/agent/plan-pack` 继续保持兼容。Function Calling 接口将 Tool Registry 的 `palette.generate`、`variant.generate`、`asset_pack.validate`、`export.describe` 转换为模型可见的下划线函数名；`render.prepare` 当前保留在 Registry 中但不暴露给模型。模型仅返回调用意图，真正执行发生在后端应用进程。

## Tool Registry 与名称映射

| Registry 工具名 | 模型 function name | 当前用途 |
| --- | --- | --- |
| `palette.generate` | `palette_generate` | 生成主题色板和风格提示 |
| `variant.generate` | `variant_generate` | 为每类素材生成不同 variant |
| `asset_pack.validate` | `asset_pack_validate` | 可选基础计划检查 |
| `export.describe` | `export_describe` | 描述前端已有导出能力 |
| `render.prepare` | 不暴露 | 仅注册供应用侧后续使用 |

`ToolDefinition.input_schema` 会作为 OpenAI-compatible `function.parameters` 发送给百炼。模型返回参数后，`tool_argument_normalizer` 以请求约束或 fallback planner 解析出的全局计划为准，覆盖色板的主题/风格与变体的主题/数量/类型偏移；修正会记入 `toolCalls` 和响应 warning，不触发降级。模型未覆盖某个目标素材类型时，后端补执行该类型的本地变体工具；若单类返回不足 `count`，`tool_result_assembler` 将已有结果与 fallback variants 合并补齐。归一化后的结果由 Pydantic 校验并组装为 `AssetPackPlan`；不可恢复的非法参数、执行异常或最终校验失败才回退到 deterministic fallback。

## 真实联调问题与排查经验

- `core/config.py` 固定从 `apps/api/.env` 加载本地配置；未找到文件时输出 warning 并继续使用进程环境变量。设置 `DEBUG_CONFIG=true` 时只打印启用状态、模型名和 Key 是否存在，不泄漏 Key 内容。
- `main.py` 在应用启动时输出 `/health`、Planner、Function Calling 与 tools 路由清单，用于定位 404 或前端 endpoint 配置问题。
- `bailian_pack_planner.py` 以 `timeout=60.0`、`max_retries=0`、`temperature=0.2`、`max_tokens=800` 调用百炼，并要求 JSON-only system prompt。
- LLM 输出在 schema 校验前进入 normalize：整数保留、数字字符串转换、文本 seed 稳定哈希转换，计划内重复整数递增去重；其他字段仍由 Pydantic 严格约束。
- `routes/agent.py` 记录成功/失败分隔日志并遮蔽潜在 Key 内容；超时、结构校验失败、鉴权失败和一般调用失败分别返回可辨识的 fallback message，接口不中断前端手动主链路。
- `test_bailian_min.py` 只供开发者手动执行，用来隔离验证兼容端点、Key 与 JSON Mode，不属于产品运行链路。

## 运行边界

- 素材生成与导出仍在浏览器前端本地完成，不向后端发送生成请求。
- 仅 AI 需求规划面板向后端发送中文需求；后端不可用时，手动参数流程仍可使用。
- 后端提供健康检查、fallback planner 与可选百炼 Art Planner，不承担素材绘制、文件存储或鉴权。
- `POST /api/plan` 仅通过固定规则产出 `AssetPlan`，不调用 LLM 或外部服务。
- `POST /api/agent/plan-pack` 可调用百炼生成计划，但调用失败会自动 fallback，不返回模型错误堆栈或敏感配置。
- `POST /api/agent/function-plan` 可让百炼选择 Registry 工具；工具始终由后端执行，失败自动 fallback。
- `GET /api/tools` 与 `POST /api/tools/execute` 是本地工具调试接口，不代表 LangChain 或 MCP 已接入。
- Renderer 与所有导出仍在前端本地执行；百炼不生成图片。
- 当前没有数据库、登录、云部署或第三方图像生成服务依赖。

## 后续规划边界

当前已在 `AssetPackPlan` 契约上接入可选百炼 Art Planner 与 Function Calling 调度，并用 Tool Registry 与 Pydantic 约束本地执行结果。

尚未实现 LangChain、MCP、Optional AI Generation 或批量 PNG 单独下载。
