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
| 本地 Agent Pipeline Skeleton | 已满足 | 页面生成入口走 `local-agent` pipeline，未调用模型 |
| 同类型 variant 差异 | 已满足 | 数量为 `4` 时显示不同名称与 SVG 装饰 |
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
5. 确认每个 asset 包含 `id`、`type`、`name`、`theme`、`style`、`size`、`seed`、`fileName`、`variant`、`description`，且 `fileName` 对应单素材 PNG 命名规则。

### 6. ZIP 与 Sprite Sheet 回归

1. 选择五类素材并将数量设为 `4`，生成 `20` 张卡片。
2. 下载 ZIP，确认 `assets/` 中有 `20` 张 PNG，根目录 `metadata.json` 中的文件名与 PNG 对应。
3. 下载 Sprite Sheet，确认图像按卡片顺序包含 `20` 个格子内容。
4. 分别使用 `32`、`64`、`128` 尺寸抽查导出仍可完成。

### 7. Planner 与 Pipeline 边界

1. 启动后端，在「AI 需求规划」输入“生成一套地牢像素风素材，包括金币、药水和史莱姆，尺寸64，每种4个”。
2. 点击“使用 AI 规划参数”，确认 fallback 结果只填充表单，不自动生成。
3. 点击“生成素材”，确认预览区显示 `Agent Pipeline：local-agent`，同类型素材出现 variant。
4. 停止后端后再次规划，确认显示服务不可用提示，同时手动生成流程仍正常。

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

当前项目未实现真实 LLM、Structured Output、Function Calling / Tool Calling、LangChain、MCP、Stable Diffusion、数据库、用户登录、云部署、多 Agent、Optional AI Generation 或批量 PNG 单独下载。ZIP 资源包与 Sprite Sheet 已实现并纳入上述回归步骤。
