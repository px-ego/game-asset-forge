# 游素工坊（GameAssetForge）

## 项目简介

游素工坊 GameAssetForge 是面向 2D 游戏开发流程的 AI 辅助素材生成工具。项目采用 SDD（规格驱动开发）方式推进，以 [docs/SPEC.md](docs/SPEC.md) 中的 SPEC v1.0 为最高优先级需求依据。

MVP 核心链路不依赖 LLM，也不调用外部图像生成 API；系统通过前端本地 SVG 规则生成可预览、可导出的 2D 素材。增强模式下可配置百炼 LLM 作为 Art Planner 输出完整素材包计划，未配置或调用失败时自动回退到本地规划。

## 当前已完成功能

- 参数表单：选择主题、风格、素材类型、尺寸和生成数量。
- 五类素材生成：药水、金币、史莱姆、剑、地砖。
- 三种主题色板：森林、地牢、赛博朋克。
- 两种视觉风格：像素风、卡通风。
- SVG 素材卡片预览，展示类型、主题、风格、尺寸和 `seed`。
- 单素材 PNG 下载，导出尺寸与所选 `32`、`64`、`128` 一致。
- `metadata.json` 导出，记录本次请求参数和全部素材信息。
- ZIP 资源包导出，包含当前所有 PNG 与 `metadata.json`。
- Sprite Sheet PNG 导出，将当前素材按网格合成单张图片。
- FastAPI 健康检查接口：`GET /health`。
- Fallback Planner API：保留 `POST /api/plan`，通过本地规则将中文需求解析为结构化 `AssetPlan`。
- Art Planner API：`POST /api/agent/plan-pack`，在可选百炼 LLM 或 fallback 下返回完整 `AssetPackPlan`。
- Tool Registry API：`GET /api/tools` 与 `POST /api/tools/execute`，统一描述并本地执行五个应用侧工具。
- Function Calling API：`POST /api/agent/function-plan`，由百炼选择 Registry 工具、后端执行并组装 `AssetPackPlan`。
- AI 需求规划面板：输入中文需求后优先获取素材包计划并自动填充表单，再由用户手动生成素材。
- Agent Pipeline Skeleton：前端以 pipeline 串联结构化计划、Skill、Renderer 与 Validation；模型只在可选的后端规划阶段调用。
- Variant 素材表现：同类型多份素材拥有不同名称、描述与可见装饰差异，例如裂纹金币、符文金币与宝石金币。

## 范围边界

当前 MVP 的素材生成与导出流程仍可在前端本地演示。可选增强模式支持百炼 Art Planner 与 Function Calling 调度器；其中 Function Calling 表示模型返回工具调用意图，由后端执行 Tool Registry 中的本地工具并组装计划，模型不直接执行函数、更不直接生成图片。本地 SVG Renderer 和 fallback 始终保留，无 API Key、LLM 关闭或调用失败都不影响核心演示。项目目前没有接入 LangChain、MCP、图像生成模型、数据库、登录、云部署或多 Agent 系统，也未提供批量 PNG 单独下载。

## 技术栈

- 前端：React + TypeScript + Vite，含 AI 需求规划面板、本地 Agent Pipeline 与响应校验
- 后端：Python + FastAPI + Pydantic + OpenAI Python SDK + python-dotenv，含百炼 Planner、Function Calling 调度器、Tool Registry 与 fallback
- 素材渲染：浏览器端 SVG 本地规则生成
- 导出：浏览器端单素材 PNG、`metadata.json`、ZIP 资源包与 Sprite Sheet
- 默认语言：README、文档与页面 UI 中文优先，代码变量名使用英文

## 目录结构

```text
game-asset-forge/
  apps/
    web/                  # 参数规划面板、表单、SVG 预览与本地导出
    api/                  # FastAPI Planner、Tool Registry 与 Function Calling API
  packages/
    renderer/             # 预留目录，当前前端规则渲染未迁移至此
    schema/               # 预留目录
  docs/
    SPEC.md               # 最高优先级需求规格
    ARCHITECTURE.md       # 当前架构与边界
    TASKS.md              # PR 进度与后续事项
    ACCEPTANCE.md         # MVP 验收步骤
    PROMPTING.md          # AI/Agent 后续规划边界
  examples/
    prompts/              # 预留目录
    outputs/              # 预留目录
  README.md
```

前端源码按职责分为 `api/`（plan-pack 请求、响应校验与旧接口降级）、`agent/`（本地 Planner/Skills/Validation/Pipeline）、`components/`（规划面板与预览组件）、`features/asset-generator/`（选项与保留的旧生成模块）、`exporters/`（导出工具）和 `types/`（共享数据结构）。

## 前端启动方式

在 Windows PowerShell 中推荐使用 `npm.cmd`，避免 `npm.ps1` 被执行策略拦截：

```powershell
cd apps/web
npm.cmd install
npm.cmd run dev
```

如果执行 `npm -v` 或 `npm` 时提示“无法加载文件 npm.ps1，因为在此系统上禁止运行脚本”，直接使用 `npm.cmd` 替代 `npm` 即可。

打开终端提示的本地地址，即可使用素材生成、预览、PNG、`metadata.json`、ZIP 与 Sprite Sheet 下载，这些核心功能均在浏览器本地完成。使用「AI 需求规划」时，前端优先调用 Function Calling 规划接口，并在成功时显示来源和调用的工具；后端不可用时仍可手动配置表单。

生产构建验证：

```powershell
cd apps/web
npm.cmd run build
```

## 后端启动方式

后端提供健康检查、无需 API Key 的 fallback 计划以及可选百炼 Art Planner。在 Windows PowerShell 中执行：

```powershell
cd apps/api
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

验证方式：访问 `http://127.0.0.1:8000/health`。

预期返回：

```json
{
  "status": "ok",
  "message": "游素工坊 API 服务运行中"
}
```

规划接口验证：

```powershell
$body = @{
  prompt = "生成一套地牢像素风素材，包括金币、药水和史莱姆，尺寸64，每种4个"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri http://127.0.0.1:8000/api/plan `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

预期返回结构：

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

发送空 `prompt` 时也会返回默认可用方案：森林、像素风、金币、`64` 尺寸、数量 `4`。

完整素材包规划接口在默认配置下直接使用 fallback：

```powershell
$body = @{
  prompt = "生成一套赛博朋克卡通风武器和药水素材，颜色偏霓虹蓝紫，包括剑、药水和地砖，尺寸128，每种4个"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri http://127.0.0.1:8000/api/agent/plan-pack `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

返回中的 `source` 默认为 `fallback`，`plan` 包含 `palette`、`globalStyleHints` 以及带 `variant`、`description`、`renderHints` 的素材数组。

Tool Registry 调试接口可返回五个本地工具定义：

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8000/api/tools -Method Get
```

Function Calling 规划接口示例：

```powershell
$body = @{
  prompt = "生成一套赛博朋克卡通风武器和药水素材，颜色偏霓虹蓝紫，包括剑、药水和地砖，尺寸128，每种4个"
  theme = "cyberpunk"
  style = "cartoon"
  size = 128
  count = 4
  assetTypes = @("sword", "potion", "tile")
} | ConvertTo-Json -Depth 4

Invoke-RestMethod `
  -Uri http://127.0.0.1:8000/api/agent/function-plan `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

启用百炼且工具调用完整成功时，返回 `source=function_calling`，`toolCalls` 列出模型选择且由后端执行的工具；未启用、鉴权失败、超时、模型未给出完整工具调用或工具校验失败时，接口返回 `source=fallback`。

## 百炼 Art Planner 配置

项目已提供 [apps/api/.env.example](apps/api/.env.example)。仅在本地 `apps/api/.env` 或系统环境变量中配置真实 Key，`.env` 已被 Git 忽略且不得提交：

```dotenv
LLM_ENABLED=true
DEBUG_CONFIG=false
DASHSCOPE_API_KEY=<your-dashscope-api-key>
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_MODEL=qwen-plus
```

启用后，`POST /api/agent/plan-pack` 使用百炼 OpenAI-compatible API 的 JSON Mode 生成并校验完整 `AssetPackPlan`；`POST /api/agent/function-plan` 使用 OpenAI-compatible `tools` 与 `tool_choice="auto"` 调度 Tool Registry。本地 `.env` 或环境变量以外不得保存真实 Key。调用失败、工具失败或 Schema 校验失败时，接口仍返回 `success=true`、`source=fallback` 的本地计划。

## 真实联调问题与排查经验

- `python-dotenv` 把 `apps/api/.env` 加载进 Python 进程，并不会反向写入启动它的 PowerShell；因此 `echo $env:DASHSCOPE_API_KEY` 为空，不能证明 Key 未加载。需要安全确认配置时，在本地 `.env` 临时设置 `DEBUG_CONFIG=true`，后端只打印 `LLM_ENABLED`、模型名和 `KEY EXISTS` 布尔值，不打印真实 Key。
- 未创建 `apps/api/.env` 时后端仍可使用进程环境变量启动，并打印 `[CONFIG] .env not found, using process environment.` 提醒当前配置来源。
- 服务启动时会打印 `[ROUTES]` 及 `/health`、`/api/plan`、`/api/agent/plan-pack`、`/api/agent/function-plan` 和 `/api/tools`，用于先排除 router 未装配或请求路径拼错。
- 百炼客户端请求超时设置为 `60.0` 秒且不自动重试，生成限制为 `temperature=0.2`、`max_tokens=800`；超时、鉴权和结构校验失败会返回不同中文 fallback message。
- JSON Mode 的 system prompt 明确包含 `Output JSON only.`、`Return a valid JSON object.`、`No markdown.` 与 `No explanations.`，以降低返回 Markdown 或解释文字导致的解析失败。
- LLM JSON 在 Pydantic 校验前经过 normalize：数字字符串 seed 转为整数，文本 seed 使用稳定哈希映射为整数，重复 seed 依次递增去重。因此相同文本 seed 每次得到一致结果，又不会在同一素材包内冲突。
- LLM 成功与失败分别输出 `===== LLM PLAN SUCCESS =====` 与 `===== LLM PLAN FAILED =====` 日志；失败日志保留异常类型供排查，同时会遮蔽配置中的 API Key。

## 最小百炼联调脚本

在本地配置好百炼 Key 后，可单独验证 OpenAI-compatible 地址、Key 与 JSON Mode，不经过业务 Planner：

```powershell
cd apps/api
.\.venv\Scripts\python.exe test_bailian_min.py
```

脚本仅在手动执行时请求百炼，并输出模型返回的 JSON 文本；不会随后端启动自动运行，也不会写出 API Key。

## 使用流程

1. 可选：启动后端，在「AI 需求规划」面板输入自然语言需求并点击“使用 AI 规划参数”，优先由百炼 Function Calling 或 fallback 返回素材包计划。
2. 检查并可继续手动修改主题、风格、素材类型、尺寸和生成数量。
3. 规划结果会显示来源、素材包摘要，以及 Function Calling 成功时的工具列表；手动调整表单后会回到本地规划。
4. 点击“生成素材”后由本地 Agent Pipeline 渲染带 variant 的 SVG 预览卡片；规划成功后不会自动生成。
5. 在单张卡片中点击“下载 PNG”，或在预览区域下载 `metadata.json`、ZIP 资源包与 Sprite Sheet。

未选择任何素材类型时，页面提示“请至少选择一种素材类型”，不会生成空结果或导出空 metadata。

## MVP 验收说明

1. 页面可运行：按前端启动命令打开页面，确认标题、说明与参数配置面板显示正常。
2. 五类素材：勾选五种素材并点击“生成素材”，确认出现药水、金币、史莱姆、剑、地砖的可辨识 SVG 预览。
3. 主题与风格：分别切换主题和风格后重新生成，确认配色与图形表现发生对应变化。
4. 数量规则：选择两类素材并将数量设置为 `4`，确认显示 `8` 张卡片。
5. PNG 导出：依次选择 `32`、`64`、`128` 尺寸，下载单张 PNG，确认文件名包含素材参数且图片尺寸与选择一致。
6. Metadata 导出：生成素材后下载 `metadata.json`，确认包含 `project`、`projectName`、`createdAt`、`request`、`total`、`assets`，并且 `assets` 数量与卡片数一致。
7. ZIP 导出：生成素材后下载 ZIP，确认包含 `assets/` 下的 PNG 与根目录 `metadata.json`，且文件数量与卡片一致。
8. Sprite Sheet 导出：生成素材后下载 Sprite Sheet，确认所有卡片按生成顺序合成到一张 PNG 中。
9. 后端健康检查：如需核验后端骨架，启动 API 后访问 `/health` 并确认响应内容。
10. Fallback Planner：在 `LLM_ENABLED=false` 下向 `/api/agent/plan-pack` 提交自然语言示例，确认返回 `source=fallback` 的完整 `AssetPackPlan`。
11. 百炼 Planner：本地配置有效 Key 并设置 `LLM_ENABLED=true` 后提交赛博朋克示例，确认返回 `source=llm`、蓝紫霓虹色板及不同 variant。
12. 前端规划面板：点击“使用 AI 规划参数”，确认表单自动填充并显示设计摘要，且尚未自动生成卡片。
13. 降级使用：错误 Key 应返回 `source=fallback`；停止后端时页面应提示服务不可用，手动生成仍可使用。
14. Agent Pipeline：选择金币或史莱姆并将数量设为 `4`，确认卡片显示不同名称或 variant，且 SVG 外观可见不同。
15. 扩展 metadata：下载 `metadata.json`，确认各素材保留 `name`、`variant`、`description` 与 `renderHints`。
16. 配置诊断：以 `DEBUG_CONFIG=true` 启动后端，确认日志仅显示 Key 是否存在；不提供 `.env` 时确认出现配置来源 warning。
17. LLM 容错：观察超时或错误 Key 请求返回 `source=fallback` 且 message 分类清晰；当模型给出文本 seed 时确认响应中的 seed 已为不重复整数。
18. Tool Registry：请求 `/api/tools` 确认返回 `palette.generate`、`variant.generate`、`render.prepare`、`asset_pack.validate`、`export.describe` 五个定义。
19. Function Calling：启用有效百炼配置后请求 `/api/agent/function-plan`，确认返回 `source=function_calling`、`toolCalls` 含色板和变体工具；关闭 LLM 或设置错误 Key 时确认自动 fallback。

更完整的逐项记录见 [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md)。

## Demo 视频录制建议

1. 展示项目目录与前端启动过程。
2. 打开页面，说明项目面向 2D 游戏开发流程，MVP 使用本地规则生成。
3. 在 AI 需求规划面板输入中文需求，展示 Function Calling 来源与调用工具列表，或无 Key fallback 自动填表，并说明后端才是真正的工具执行者。
4. 手动确认或调整主题、风格、类型、尺寸和数量后，一次生成五类素材，展示 SVG 卡片预览与同类型 variant 差异。
5. 切换主题与风格，展示预览变化。
6. 下载一张 PNG，并展示导出文件。
7. 下载 `metadata.json`，展示结构化结果与素材列表数量一致。
8. 展示 ZIP 资源包与 Sprite Sheet 下载。
9. 简述当前百炼 Function Calling 只调度 Registry 工具，未来再扩展 LangChain 与 MCP。

## SDD 开发流程说明

1. 以 `docs/SPEC.md` 为需求来源，按小粒度 PR 逐步实现并验证。
2. PR1 至 PR5 分别完成骨架、参数表单、规则预览、PNG 导出和 metadata 导出。
3. PR6 完成 MVP 文档收口，PR7 与 PR8 增加本地 ZIP 和 Sprite Sheet 导出。
4. PR9 仅整理前端模块边界，为后续 Planner 扩展预留清晰接入点，不改变功能行为。
5. PR10 增加后端 fallback planner API，先固定结构化规划契约与无密钥演示路径，不接入真实 LLM。
6. PR11 增加前端 AI 需求规划面板，将 fallback 计划写回参数表单，仍由用户手动触发生成。
7. PR12 增加本地 Agent Pipeline Skeleton，以 deterministic Planner、Skills 和 Validation 组织现有生成链路，并让同类型素材呈现不同 variant。
8. PR13 增加可选百炼 LLM Art Planner V2，以 JSON Mode 输出完整 `AssetPackPlan`，失败自动 fallback。
9. PR14 增加后端 Tool Registry 与百炼 Function Calling 调度器，由应用侧执行模型选择的工具，并将结果装配为 `AssetPackPlan`。
10. 未来 LangChain 与 MCP 能力必须在当前本地 MVP 保持可运行的前提下独立推进。

## PR 规范

- 每个 PR 只处理一个明确目标，不提前混入后续功能。
- PR 标题与描述中文优先，并说明关联的 SPEC 章节。
- PR 描述列出变更文件、验证方式、已完成范围和明确未实现范围。
- 合并前确保 README 启动步骤与实际代码一致，并执行相应验收步骤。
