# 游素工坊（GameAssetForge）

## 项目简介

游素工坊 GameAssetForge 是面向 2D 游戏开发流程的 AI 辅助素材生成工具。项目采用 SDD（规格驱动开发）方式推进，以 [docs/SPEC.md](docs/SPEC.md) 中的 SPEC v1.0 为最高优先级需求依据。

MVP 核心链路不依赖 LLM，也不调用外部图像生成 API；系统通过前端本地 SVG 规则生成可预览、可导出的 2D 素材。增强模式下可配置百炼 LLM 作为 Art Director 输出轻量 `ArtDirectionPlan`，再由本地规划器扩展为完整素材包计划；未配置或调用失败时自动回退到本地规划。

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
- Art Planner API：`POST /api/agent/plan-pack`，百炼只给出轻量 `ArtDirectionPlan`，后端本地装配并返回完整 `AssetPackPlan`；失败时 fallback。
- Tool Registry API：`GET /api/tools` 与 `POST /api/tools/execute`，统一描述并本地调试五个 Agent Skill。
- AI 需求规划面板：输入中文需求后优先获取素材包计划并自动填充表单，再由用户手动生成素材。
- Agent Pipeline Skeleton：前端以 pipeline 串联结构化计划、Skill、Renderer 与 Validation；模型只在可选的后端规划阶段调用。
- Variant 素材表现：同类型多份素材拥有不同名称、描述与可见装饰差异，例如裂纹金币、符文金币与宝石金币。
- Agent 调用轨迹面板：默认折叠展示最近一次规划来源、message、warnings、计划摘要及可用的工具调用记录。

## 范围边界

当前 MVP 的素材生成与导出流程仍可在前端本地演示。既有增强路径允许在本地配置百炼 API Key 后使用 Qwen 输出紧凑 `ArtDirectionPlan`；本地 Skill Layer 负责展开为 `AssetPackPlan`，LLM 不直接生成图片或逐项素材描述。Agent Trace 只显示规划过程中已经产生的信息，不触发渲染或导出。对于返回 `source=function_calling` 与 `toolCalls` 的规划接口，工具执行应由后端完成，前端仅展示轨迹。本地 SVG Renderer 和 fallback 始终保留，无 API Key、LLM 关闭或调用失败都不影响核心演示。项目目前没有接入 LangChain、MCP、图像生成模型、数据库、登录、云部署或多 Agent 系统，也未提供批量 PNG 单独下载。

## 技术栈

- 前端：React + TypeScript + Vite，含 AI 需求规划面板、本地 Agent Pipeline 与响应校验
- 后端：Python + FastAPI + Pydantic + OpenAI Python SDK + python-dotenv，百炼兼容接口与 fallback planner
- 素材渲染：浏览器端 SVG 本地规则生成
- 导出：浏览器端单素材 PNG、`metadata.json`、ZIP 资源包与 Sprite Sheet
- 默认语言：README、文档与页面 UI 中文优先，代码变量名使用英文

## 目录结构

```text
game-asset-forge/
  apps/
    web/                  # 参数规划面板、表单、SVG 预览与本地导出
    api/                  # FastAPI Planner、Tool Registry 与健康检查 API
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

打开终端提示的本地地址，即可使用素材生成、预览、PNG、`metadata.json`、ZIP 与 Sprite Sheet 下载，这些核心功能均在浏览器本地完成。页面中的「Agent 调用轨迹」默认折叠；展开后可查看最近一次规划或本地生成的过程说明。使用「AI 需求规划」获取 `AssetPackPlan` 时，需要同时启动后端；后端不可用时仍可手动配置表单并产生 `local-agent` 轨迹。

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

## 后端 Tool Registry 调试接口

后端现提供五个应用侧本地工具定义：`palette.generate`、`variant.generate`、`render.prepare`、`asset_pack.validate`、`export.describe`。它们统一返回 `ToolDefinition` schema，可供开发调试与后续适配使用；当前没有由 LLM 自动选择或调用这些工具。

列出工具定义：

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8000/api/tools -Method Get
```

执行色板工具：

```powershell
$body = @{
  toolName = "palette.generate"
  arguments = @{
    theme = "cyberpunk"
    style = "cartoon"
    prompt = "霓虹蓝紫科技感"
  }
} | ConvertTo-Json -Depth 4

Invoke-RestMethod `
  -Uri http://127.0.0.1:8000/api/tools/execute `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

`variant.generate` 可通过 `assetType="coin"`、`count=4` 验证四种不同 variant；`export.describe` 仅返回 PNG、metadata、ZIP 与 Sprite Sheet 能力说明，实际文件下载仍由前端 `exporters/` 完成。调用不存在的工具会返回 `success=false` 和 `message="工具不存在"`，不会产生服务端错误。

## Agent 调用轨迹

页面提供默认折叠的「Agent 调用轨迹」面板，用于路演和调试时理解结构化计划的来源：

- 直接使用参数表单生成时，面板显示 `source=local-agent`，并列出 `PaletteSkill`、`VariantSkill`、`RenderSkill` 与 `Validation` 的本地步骤。
- 后端返回 `source=fallback` 或 `source=llm` 时，面板显示响应 message、warnings 和 `AssetPackPlan` 摘要。
- 后端规划接口返回 `source=function_calling` 与 `toolCalls` 时，面板还会展示工具参数和可用的结果摘要；实际工具执行仍在后端完成。

Trace 仅用于可解释性和调试，不修改 Renderer 或 PNG、metadata、ZIP、Sprite Sheet 导出链路。未配置 API Key 时仍可通过 fallback 或手动 `local-agent` 流程完成演示；当前未接入 LangChain 或 MCP。

## 百炼 Art Planner 配置

项目已提供 [apps/api/.env.example](apps/api/.env.example)。仅在本地 `apps/api/.env` 或系统环境变量中配置真实 Key，`.env` 已被 Git 忽略且不得提交：

```dotenv
LLM_ENABLED=true
DEBUG_CONFIG=false
DASHSCOPE_API_KEY=<your-dashscope-api-key>
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_MODEL=qwen-plus
```

启用后，`POST /api/agent/plan-pack` 使用百炼 OpenAI-compatible API 的 JSON Mode 生成并校验紧凑 `ArtDirectionPlan`，再由本地 Skill Layer 生成完整 `AssetPackPlan`。后端能够提取 JSON 代码围栏或前后说明中的完整 JSON 对象；调用失败、截断 JSON 无法解析或 Schema 校验失败时，接口仍返回 `success=true`、`source=fallback` 的本地计划。

## 真实联调问题与排查经验

- `python-dotenv` 把 `apps/api/.env` 加载进 Python 进程，并不会反向写入启动它的 PowerShell；因此 `echo $env:DASHSCOPE_API_KEY` 为空，不能证明 Key 未加载。需要安全确认配置时，在本地 `.env` 临时设置 `DEBUG_CONFIG=true`，后端只打印 `LLM_ENABLED`、模型名和 `KEY EXISTS` 布尔值，不打印真实 Key。
- 未创建 `apps/api/.env` 时后端仍可使用进程环境变量启动，并打印 `[CONFIG] .env not found, using process environment.` 提醒当前配置来源。
- 服务启动时会打印 `[ROUTES]` 及 `/health`、`/api/plan`、`/api/agent/plan-pack`，用于先排除 router 未装配或请求路径拼错。
- 百炼客户端请求超时设置为 `60.0` 秒且不自动重试，生成限制为 `temperature=0.2`、`max_tokens=700`；短方向 JSON 降低截断概率，超时、鉴权和结构校验失败仍会返回中文 fallback message。
- JSON Mode 的 system prompt 明确只输出 compact `ArtDirectionPlan`，不展开逐项 assets；若仍返回 JSON 代码围栏或解释文字，后端会尝试提取其中的完整 JSON 对象。
- LLM 只提供主题、色彩与 variant 意图；seed、具体描述和 `renderHints` 均由本地 deterministic assembler 生成，因此同一输入仍可得到可复现素材包。
- LLM 成功与失败分别输出 `===== LLM PLAN SUCCESS =====` 与 `===== LLM PLAN FAILED =====` 日志；失败日志保留异常类型供排查，同时会遮蔽配置中的 API Key。

## 最小百炼联调脚本

在本地配置好百炼 Key 后，可单独验证 OpenAI-compatible 地址、Key 与 JSON Mode，不经过业务 Planner：

```powershell
cd apps/api
.\.venv\Scripts\python.exe test_bailian_min.py
```

脚本仅在手动执行时请求百炼，并输出模型返回的 JSON 文本；不会随后端启动自动运行，也不会写出 API Key。

## 使用流程

1. 可选：启动后端，在「AI 需求规划」面板输入自然语言需求并点击“使用 AI 规划参数”，由百炼或 fallback Art Planner 返回素材包计划。
2. 检查并可继续手动修改主题、风格、素材类型、尺寸和生成数量。
3. 规划结果会显示来源与素材包摘要；展开「Agent 调用轨迹」可查看 message、warnings、工具记录与计划摘要。手动调整表单后会回到本地规划。
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
17. LLM 容错：观察超时、错误 Key 或截断方向 JSON 请求返回 `source=fallback` 且 message 分类清晰；有效紧凑 `ArtDirectionPlan` 应由本地装配为带不同 variant 的完整计划。
18. Tool Registry：请求 `/api/tools` 确认返回五个工具定义；执行 `palette.generate`、`variant.generate` 与 `export.describe`，确认本地执行结果和能力说明正确。
19. Agent Trace：未规划时展开面板确认显示空状态；手动生成后显示 `local-agent` 与四个本地步骤；后端规划后显示对应来源、message 与计划摘要，含 `toolCalls` 的响应可查看工具 JSON。

更完整的逐项记录见 [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md)。

## Demo 视频录制建议

1. 展示项目目录与前端启动过程。
2. 打开页面，说明项目面向 2D 游戏开发流程，MVP 使用本地规则生成。
3. 在 AI 需求规划面板输入中文需求，展示百炼规划或无 Key fallback 自动填表，并说明 LLM 只负责设计计划。
4. 手动确认或调整主题、风格、类型、尺寸和数量后，一次生成五类素材，展示 SVG 卡片预览与同类型 variant 差异。
5. 切换主题与风格，展示预览变化。
6. 下载一张 PNG，并展示导出文件。
7. 下载 `metadata.json`，展示结构化结果与素材列表数量一致。
8. 展示 ZIP 资源包与 Sprite Sheet 下载。
9. 简述当前百炼输出轻量 `ArtDirectionPlan`、本地 Skill Layer 扩展为 `AssetPackPlan`，未来再扩展 Tool Calling、LangChain 与 MCP。

## SDD 开发流程说明

1. 以 `docs/SPEC.md` 为需求来源，按小粒度 PR 逐步实现并验证。
2. PR1 至 PR5 分别完成骨架、参数表单、规则预览、PNG 导出和 metadata 导出。
3. PR6 完成 MVP 文档收口，PR7 与 PR8 增加本地 ZIP 和 Sprite Sheet 导出。
4. PR9 仅整理前端模块边界，为后续 Planner 扩展预留清晰接入点，不改变功能行为。
5. PR10 增加后端 fallback planner API，先固定结构化规划契约与无密钥演示路径，不接入真实 LLM。
6. PR11 增加前端 AI 需求规划面板，将 fallback 计划写回参数表单，仍由用户手动触发生成。
7. PR12 增加本地 Agent Pipeline Skeleton，以 deterministic Planner、Skills 和 Validation 组织现有生成链路，并让同类型素材呈现不同 variant。
8. 既有百炼 LLM Art Planner 路径以 JSON Mode 输出轻量 `ArtDirectionPlan`，由本地代码装配完整 `AssetPackPlan`，失败自动 fallback。
9. 本轮新增后端 Tool Registry / Skill Registry，以统一 schema 暴露本地工具并提供调试执行接口，不触发模型工具调用。
10. 未来 Tool Calling、LangChain 与 MCP 能力必须在当前本地 MVP 保持可运行的前提下独立推进。

## PR 规范

- 每个 PR 只处理一个明确目标，不提前混入后续功能。
- PR 标题与描述中文优先，并说明关联的 SPEC 章节。
- PR 描述列出变更文件、验证方式、已完成范围和明确未实现范围。
- 合并前确保 README 启动步骤与实际代码一致，并执行相应验收步骤。
