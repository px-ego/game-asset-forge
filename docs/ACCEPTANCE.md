# MVP 验收说明

## 验收状态

| SPEC 验收项 | 当前状态 | 验收要点 |
| --- | --- | --- |
| README 中的启动命令可运行 | 已满足 | 按本文与 README 的 PowerShell 命令启动 |
| 前端页面可打开 | 已满足 | 显示标题、介绍和参数面板 |
| 参数选择 | 已满足 | 支持主题、风格、类型、尺寸、数量 |
| 五类素材预览 | 已满足 | 支持药水、金币、史莱姆、剑、地砖 |
| 主题与风格变化 | 已满足 | 支持三种主题、两种风格 |
| 单素材 PNG 导出 | 已满足 | 卡片提供“下载 PNG”按钮 |
| `metadata.json` 导出 | 已满足 | 预览区域提供下载按钮 |
| ZIP 资源包导出 | 已满足 | 包含 `assets/` PNG 与 `metadata.json` |
| Sprite Sheet 导出 | 已满足 | 按卡片顺序合成网格 PNG |
| Fallback Planner API 与前端面板 | 已满足 | API 填表，不自动生成；手动流程可降级使用 |
| 本地 Agent Pipeline Skeleton | 已满足 | 手动生成走 `local-agent`；外部计划只作为 Renderer 输入 |
| 同类型 variant 差异 | 已满足 | 数量为 `4` 时显示不同名称与 SVG 装饰 |
| 百炼 LLM Art Planner V2 | 已满足 | 配置有效 Key 时返回完整 `AssetPackPlan`；失败自动 fallback |
| 后端 Tool Registry | 已满足 | `/api/tools` 返回五个本地工具定义并可调试执行 |
| 百炼 Function Calling 调度器 | 已满足 | 模型选择工具、后端执行与装配计划；失败自动 fallback |
| LLM 联调诊断与容错 | 已满足 | 安全配置 debug、路由清单、seed normalize 与分类 fallback message |
| 不依赖外部 LLM API 演示核心流程 | 已满足 | 素材生成与导出在前端本地执行 |
| 后续 AI/Agent 路线说明 | 已满足 | 见 `PROMPTING.md` 与 README |

## 启动前端

在 Windows PowerShell 中执行：

```powershell
cd apps/web
npm.cmd install
npm.cmd run dev
```

可另外验证生产构建：

```powershell
cd apps/web
npm.cmd run build
```

## 手动验收步骤

### 1. 页面与表单

1. 打开 Vite 提示的页面地址。
2. 确认页面显示“游素工坊 GameAssetForge”与项目简介。
3. 确认可选择游戏主题、素材风格、素材类型、素材尺寸和生成数量。
4. 在不选择素材类型时点击“生成素材”，确认提示“请至少选择一种素材类型”，且未出现导出按钮。

### 2. 五类预览与数量

1. 同时选择药水、金币、史莱姆、剑和地砖。
2. 点击“生成素材”，确认五种 SVG 预览均可辨识。
3. 将数量改为 `4`，选择两种素材后重新生成。
4. 确认页面显示 `8` 张素材卡片，并在卡片中显示类型、主题、风格、尺寸和 `seed`。
5. 单独选择金币并将数量设为 `4`，确认出现普通、裂纹、符文、宝石等不同 variant 且预览外观可见差异。
6. 单独选择史莱姆并将数量设为 `4`，确认普通、毒液、水晶、暗影等 variant 的装饰或配色不同。

### 3. 主题与风格

1. 分别选择森林、地牢、赛博朋克主题并重新生成。
2. 确认预览配色分别体现绿色/棕色、灰色/紫色、蓝色/紫色与亮色点缀。
3. 分别选择像素风与卡通风并重新生成。
4. 确认预览表现分别呈现硬边块状和较圆润轮廓。

### 4. PNG 导出

1. 生成任意素材。
2. 点击卡片中的“下载 PNG”。
3. 确认文件名包含 `type`、`theme`、`style`、`size`、`seed`。
4. 分别使用 `32`、`64`、`128` 尺寸导出，确认 PNG 图片尺寸与选择一致。

### 5. Metadata 导出

1. 选择至少一种素材并点击“生成素材”。
2. 确认预览区域显示“下载 metadata.json”。
3. 下载并打开 JSON 文件，确认包含 `project`、`projectName`、`version`、`createdAt`、`request`、`total`、`assets`。
4. 确认 `total` 与页面卡片数量一致。
5. 确认每个 asset 包含 `id`、`type`、`name`、`theme`、`style`、`size`、`seed`、`fileName`、`variant`、`description`、`renderHints`，且 `fileName` 对应单素材 PNG 命名规则。

### 6. ZIP 与 Sprite Sheet 回归

1. 选择五类素材并将数量设为 `4`，生成 `20` 张卡片。
2. 下载 ZIP，确认 `assets/` 中有 `20` 张 PNG，根目录 `metadata.json` 中的文件名与 PNG 对应。
3. 下载 Sprite Sheet，确认图像按卡片顺序包含 `20` 个格子内容。
4. 分别使用 `32`、`64`、`128` 尺寸抽查导出仍可完成。

### 7. 无 Key Fallback 路径

1. 不设置 `apps/api/.env`，或设置 `LLM_ENABLED=false` 后启动后端。
2. 请求 `POST /api/agent/plan-pack`，prompt 为“生成一套地牢像素风素材，包括金币、药水和史莱姆，尺寸64，每种4个”。
3. 确认返回 `success=true`、`source=fallback`，且计划包含 `palette`、`globalStyleHints` 与不同 `variant` 的素材项。
4. 在前端输入相同 prompt，确认结果只填充表单和设计摘要，不自动生成。
5. 点击“生成素材”，确认预览区显示 `Agent Pipeline：fallback`，同类型素材出现 variant。
6. 停止后端后再次规划，确认显示服务不可用提示，同时手动生成流程仍正常。

### 8. 百炼 LLM 路径

1. 仅在本地 `apps/api/.env` 设置 `LLM_ENABLED=true`、有效 `DASHSCOPE_API_KEY`、百炼兼容地址与模型名；确认 `.env` 不进入 Git。
2. 请求 `/api/agent/plan-pack`，prompt 为“生成一套赛博朋克卡通风武器和药水素材，颜色偏霓虹蓝紫，包括剑、药水和地砖，尺寸128，每种4个”。
3. 确认返回 `source=llm`、`theme=cyberpunk`、`style=cartoon`、`size=128`、`count=4`。
4. 确认 assets 包含 `sword`、`potion`、`tile`，同类型具备不同 `name`、`variant`、`description` 与 `renderHints`，且 palette 呈现蓝紫霓虹倾向。
5. 在前端以同一 prompt 规划并生成，确认素材包摘要显示来源 `llm`，卡片显示计划中的名称和描述。

### 9. 错误 Key 降级路径

1. 在本地设置 `LLM_ENABLED=true` 与无效 Key 后启动后端。
2. 请求 `/api/agent/plan-pack`，确认接口不返回 500，响应 `source=fallback`。
3. 确认 message 为“LLM 鉴权失败，已使用 fallback。”，并可继续在页面生成和导出素材。

### 10. Tool Registry 与 Function Calling

1. 请求 `GET /api/tools`，确认返回五个工具定义：`palette.generate`、`variant.generate`、`render.prepare`、`asset_pack.validate`、`export.describe`。
2. 调用 `/api/tools/execute` 执行 `palette.generate`，参数为 `theme=cyberpunk`、`style=cartoon`、`prompt=霓虹蓝紫科技感`，确认返回霓虹点缀色板。
3. 执行 `variant.generate`，参数为 `assetType=coin`、`count=4`、`theme=forest`，确认返回四个不同 variant。
4. 设置 `LLM_ENABLED=false` 后请求 `/api/agent/function-plan`，确认返回 `source=fallback` 且核心素材计划可用。
5. 配置有效百炼 Key 后，请求 `/api/agent/function-plan` 生成赛博朋克剑、药水和地砖，确认 `source=function_calling`，`toolCalls` 至少包含 `palette.generate` 与各素材类型的 `variant.generate`。
6. 在前端进行相同规划，确认设计摘要显示来源与调用工具列表；点击“生成素材”后既有预览及所有导出仍正常。
7. 设置错误 Key 或模拟工具参数非法/调用不完整，确认 `/api/agent/function-plan` 不返回 500，而是返回 `source=fallback` 与中文降级提示。

### 11. 真实联调问题与排查经验：配置与路由诊断

1. 不创建 `apps/api/.env` 启动后端，确认日志提示 `[CONFIG] .env not found, using process environment.`，服务仍能响应健康检查和 fallback 规划。
2. 在本地 `.env` 设置 `DEBUG_CONFIG=true` 并重新启动，确认日志显示 `LLM_ENABLED`、`DASHSCOPE_MODEL` 与 `KEY EXISTS`，且没有出现真实 Key。
3. 确认启动日志的 `[ROUTES]` 下包含 `/health`、`/api/plan`、`/api/agent/plan-pack`、`/api/agent/function-plan` 与 `/api/tools`。
4. 注意：PowerShell 中未设置父进程变量时，`echo $env:DASHSCOPE_API_KEY` 可以为空，即使 Python 已通过 dotenv 读取 Key；不得以该输出作为加载失败结论。

### 12. JSON Mode、Normalize 与异常分类

1. 在本地配置有效 Key 后手动执行 `.\.venv\Scripts\python.exe test_bailian_min.py`，确认输出为 JSON 内容，以隔离检查 OpenAI-compatible 地址、Key 与 JSON Mode。
2. 对包含文本 seed（例如 `"sword_cyber_circuit_001"`）的 LLM 响应进行联调或 mock 验证，确认接口返回的 `seed` 为稳定整数，并且同一计划内无重复 seed。
3. 以超时场景或 mock 触发 `APITimeoutError`，确认 `/api/agent/plan-pack` 返回 `source=fallback` 且 message 为“LLM 请求超时，已使用 fallback。”。
4. 以非法 schema 响应触发 `ValidationError`，确认 message 为“LLM 输出结构不合法，已使用 fallback。”；失败日志显示异常类型但不显示 Key。

## 后端健康检查

后端不是前端核心演示链路的依赖。如需验收后端骨架，在 Windows PowerShell 中执行：

```powershell
cd apps/api
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

访问 `http://127.0.0.1:8000/health`，预期返回：

```json
{
  "status": "ok",
  "message": "游素工坊 API 服务运行中"
}
```

## 未实现范围

当前项目已支持可选百炼 LLM 输出结构化 `AssetPackPlan` 与百炼 Function Calling 调度后端本地工具，但未实现 LangChain、MCP、Stable Diffusion、数据库、用户登录、云部署、多 Agent、Optional AI Generation 或批量 PNG 单独下载。ZIP 资源包与 Sprite Sheet 已实现并纳入上述回归步骤。
