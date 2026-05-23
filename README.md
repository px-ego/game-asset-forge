# 游素工坊（GameAssetForge）

## 项目简介

游素工坊是一个面向 2D 游戏开发流程的 AI 辅助游戏素材生成工具。项目采用 SDD（规格驱动开发）方式推进，以 [docs/SPEC.md](docs/SPEC.md) 中的 SPEC v1.0 为最高优先级需求依据。

当前为 **PR1：项目骨架与 SDD 文档**。本阶段只提供前端项目介绍页和后端健康检查接口，不提供素材生成能力。

## MVP 范围

按照 SPEC v1.0，MVP 的目标范围包括：

- 基于本地规则生成 2D 素材，不依赖外部模型或图像生成 API。
- 支持主题、风格、素材类型、尺寸和数量参数。
- 支持 `potion`、`coin`、`slime`、`sword`、`tile` 五类素材。
- 支持预览、PNG 导出和 `metadata.json` 导出。

PR1 暂不实现以上生成流程，也不实现 LLM、LangChain、MCP、Stable Diffusion、数据库、用户登录、云部署或多 Agent 能力。

## 技术栈

- 前端：React + TypeScript + Vite
- 后端：Python + FastAPI
- 默认语言：README、文档与页面 UI 中文优先，代码变量名使用英文

## 目录结构

```text
game-asset-forge/
  apps/
    web/                  # React + TypeScript + Vite 前端
    api/                  # FastAPI 后端
  packages/
    renderer/             # 本地渲染器预留目录，本 PR 不实现
    schema/               # 公共数据结构预留目录，本 PR 不实现
  docs/
    SPEC.md               # 最高优先级需求规格
    ARCHITECTURE.md       # 架构边界说明
    TASKS.md              # PR 任务范围
    ACCEPTANCE.md         # PR 验收标准
    PROMPTING.md          # AI 能力阶段说明
  examples/
    prompts/              # 示例输入预留目录
    outputs/              # 示例输出预留目录
  README.md
```

## 前端启动方式

准备 Node.js 与 npm 后执行：

```powershell
cd apps/web
npm install
npm run dev
```

启动后按照终端提示打开本地页面，可看到：

- `游素工坊 GameAssetForge`
- `面向 2D 游戏开发流程的 AI 辅助素材生成工具`

## 后端启动方式

在 Windows PowerShell 中执行：

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

## SDD 开发流程说明

1. 以 `docs/SPEC.md` 为需求来源，提交前核对当前 PR 与规格的对应范围。
2. 每个 PR 只实现一段可验证的功能，并同步维护架构、任务和验收文档。
3. 完成代码后按 `docs/ACCEPTANCE.md` 验证，保持前后端启动方式可用。
4. AI/Agent 增强能力只在基础 MVP 稳定后进入后续 PR。

## PR 规范

- 每个 PR 只处理一个明确目标，避免提前混入后续功能。
- PR 标题与描述中文优先，并说明关联的 SPEC 章节。
- PR 描述应列出变更文件、验证方式、已完成范围和明确未实现范围。
- 合并前确保 README 启动步骤与实际代码一致，项目保持可运行。
