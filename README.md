# 游素工坊（GameAssetForge）

## 项目简介

游素工坊 GameAssetForge 是面向 2D 游戏开发流程的 AI 辅助素材生成工具。项目采用 SDD（规格驱动开发）方式推进，以 [docs/SPEC.md](docs/SPEC.md) 中的 SPEC v1.0 为最高优先级需求依据。

MVP 阶段不依赖 LLM，也不调用外部图像生成 API；系统通过前端本地 SVG 规则生成可预览、可导出的 2D 素材，便于在 72 小时工程实践中稳定演示和交付。

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
- Fallback Planner API：`POST /api/plan`，通过本地规则将中文需求解析为结构化 `AssetPlan`。
- AI 需求规划面板：输入中文需求后调用 fallback planner 自动填充参数表单，再由用户手动生成素材。

## 范围边界

当前 MVP 的核心素材生成与导出流程可以在前端本地演示。AI 需求规划面板调用的是后端 fallback 规则解析，不调用真实 LLM；未启动后端时，用户仍可手动选择参数并完成素材生成与导出。项目目前没有接入 LLM、LangChain、MCP、Stable Diffusion、数据库、用户登录、云部署或多 Agent 系统，也未提供批量 PNG 单独下载。

## 技术栈

- 前端：React + TypeScript + Vite，含 AI 需求规划面板与响应校验
- 后端：Python + FastAPI + Pydantic，本地 fallback planner API
- 素材渲染：浏览器端 SVG 本地规则生成
- 导出：浏览器端单素材 PNG、`metadata.json`、ZIP 资源包与 Sprite Sheet
- 默认语言：README、文档与页面 UI 中文优先，代码变量名使用英文

## 目录结构

```text
game-asset-forge/
  apps/
    web/                  # 参数规划面板、表单、SVG 预览与本地导出
    api/                  # FastAPI 健康检查与 fallback planner API
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

前端源码按职责分为 `api/`（planner 请求与响应校验）、`components/`（规划面板与预览组件）、`features/asset-generator/`（规则生成与选项）、`exporters/`（导出工具）和 `types/`（共享数据结构）。

## 前端启动方式

在 Windows PowerShell 中推荐使用 `npm.cmd`，避免 `npm.ps1` 被执行策略拦截：

```powershell
cd apps/web
npm.cmd install
npm.cmd run dev
```

如果执行 `npm -v` 或 `npm` 时提示“无法加载文件 npm.ps1，因为在此系统上禁止运行脚本”，直接使用 `npm.cmd` 替代 `npm` 即可。

打开终端提示的本地地址，即可使用素材生成、预览、PNG、`metadata.json`、ZIP 与 Sprite Sheet 下载，这些核心功能均在浏览器本地完成。使用「AI 需求规划」自动填表时，需要同时启动后端；后端不可用时仍可手动配置表单。

生产构建验证：

```powershell
cd apps/web
npm.cmd run build
```

## 后端启动方式

后端当前提供健康检查接口与无需 API Key 的 fallback planner API。在 Windows PowerShell 中执行：

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

## 使用流程

1. 可选：启动后端，在「AI 需求规划」面板输入自然语言需求并点击“使用 AI 规划参数”，由 fallback planner 填充表单。
2. 检查并可继续手动修改主题、风格、素材类型、尺寸和生成数量。
3. 点击“生成素材”查看 SVG 预览卡片；规划成功后不会自动生成。
4. 在单张卡片中点击“下载 PNG”，或在预览区域下载 `metadata.json`、ZIP 资源包与 Sprite Sheet。

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
10. Fallback Planner：向 `/api/plan` 提交自然语言示例，确认返回 `source=fallback` 的结构化 `AssetPlan`；该步骤不依赖 API Key。
11. 前端规划面板：输入相同示例并点击“使用 AI 规划参数”，确认表单自动填为地牢、像素风、金币/药水/史莱姆、`64`、`4`，且尚未自动生成卡片。
12. 降级使用：停止后端后点击规划按钮，确认页面提示“AI 规划服务不可用，请手动选择参数”，并仍可手动生成素材。

更完整的逐项记录见 [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md)。

## Demo 视频录制建议

1. 展示项目目录与前端启动过程。
2. 打开页面，说明项目面向 2D 游戏开发流程，MVP 使用本地规则生成。
3. 在 AI 需求规划面板输入中文需求，展示 fallback planner 自动填表，并说明未调用真实 LLM。
4. 手动确认或调整主题、风格、类型、尺寸和数量后，一次生成五类素材，展示 SVG 卡片预览。
5. 切换主题与风格，展示预览变化。
6. 下载一张 PNG，并展示导出文件。
7. 下载 `metadata.json`，展示结构化结果与素材列表数量一致。
8. 展示 ZIP 资源包与 Sprite Sheet 下载。
9. 简述当前仅接入 fallback planner，未来可加入真实 LLM Planner、Structured Output、Function Calling、LangChain 与 MCP。

## SDD 开发流程说明

1. 以 `docs/SPEC.md` 为需求来源，按小粒度 PR 逐步实现并验证。
2. PR1 至 PR5 分别完成骨架、参数表单、规则预览、PNG 导出和 metadata 导出。
3. PR6 完成 MVP 文档收口，PR7 与 PR8 增加本地 ZIP 和 Sprite Sheet 导出。
4. PR9 仅整理前端模块边界，为后续 Planner 扩展预留清晰接入点，不改变功能行为。
5. PR10 增加后端 fallback planner API，先固定结构化规划契约与无密钥演示路径，不接入真实 LLM。
6. PR11 增加前端 AI 需求规划面板，将 fallback 计划写回参数表单，仍由用户手动触发生成。
7. 未来增强能力必须在当前本地 MVP 保持可运行的前提下独立推进。

## PR 规范

- 每个 PR 只处理一个明确目标，不提前混入后续功能。
- PR 标题与描述中文优先，并说明关联的 SPEC 章节。
- PR 描述列出变更文件、验证方式、已完成范围和明确未实现范围。
- 合并前确保 README 启动步骤与实际代码一致，并执行相应验收步骤。
