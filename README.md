# 游素工坊 GameAssetForge

> 面向 2D 游戏开发流程的 Agentic 游戏素材生成工具。  
> 从自然语言目标 / 表单参数出发，经过 Planner Agent、Skill Layer、Renderer、Validation 和 Export，生成风格统一、可预览、可导出的 2D 游戏素材包。

---

## Demo 视频

🎬 Demo 视频链接：  
[[点击观看 Demo 视频](你的Demo视频链接)](https://www.bilibili.com/video/BV1G1GR65E9q/?spm_id_from=333.1387.list.card_archive.click&vd_source=ef4fa5d984ade159cc00da1dc468f348)

> 视频中展示了素材生成、多变体效果、PNG / metadata / ZIP / Sprite Sheet 导出、PR 开发流程以及系统架构说明。

---

## 项目简介

游素工坊 GameAssetForge 是一个面向学生开发者、独立游戏开发者和 Game Jam / Hackathon 场景的 2D 游戏素材生成工具。

很多开发者在做游戏 Demo 时，经常遇到这些问题：

- 不会画游戏素材；
- 临时找素材风格不统一；
- 素材版权不清晰；
- 通用 AI 画图工具不一定适合游戏开发流程；
- 游戏素材通常还需要 PNG、metadata、ZIP、Sprite Sheet 等导出格式。

因此，本项目没有定位成简单的 AI 画图网站，而是设计成一个面向游戏开发流程的素材生成流水线：

```text
Natural Language Goal / 表单参数
↓
Planner Agent
↓
Skill / Tool Layer
↓
Renderer
↓
Validation
↓
Export
```

当前版本优先保证本地稳定运行，不依赖外部 API Key。

---

## 核心功能

### 素材生成

当前支持 5 类 2D 游戏素材：

- 金币 coin
- 药水 potion
- 史莱姆 slime
- 剑 sword
- 地砖 tile

### 主题与风格

支持 3 种主题：

- 森林 forest
- 地牢 dungeon
- 赛博朋克 cyberpunk

支持 2 种风格：

- 像素风 pixel
- 卡通风 cartoon

### 多变体生成

同一种素材不会只是简单复制，而是会生成不同 variant。

例如金币可以生成：

- 普通金币
- 裂纹金币
- 符文金币
- 宝石金币

例如史莱姆可以生成：

- 普通史莱姆
- 毒液史莱姆
- 水晶史莱姆
- 暗影史莱姆

### 导出能力

当前支持：

- 单素材 PNG 下载
- metadata.json 下载
- ZIP 资源包下载
- Sprite Sheet 下载

---

## Agent Pipeline

项目后期重构为本地 Agent Pipeline：

- `Planner Agent`：理解目标并规划素材方案；
- `PaletteSkill`：根据主题、风格和关键词生成色板；
- `VariantSkill`：为同类素材生成不同变体；
- `RenderSkill`：生成 Renderer 可消费的 render hints；
- `ValidationSkill`：检查素材包一致性；
- `ExportSkill`：描述导出能力；
- `Renderer`：根据 variant、palette、renderHints 生成 SVG 素材。

---

## 执行流与系统架构

> 图中实线表示当前已实现，虚线表示未来扩展。

![游素工坊执行流与系统架构](docs/images/architecture.png)

---

## 快速启动

### 前端启动

Windows PowerShell 推荐使用 `npm.cmd`：

```powershell
cd apps/web
npm.cmd install
npm.cmd run dev
```

访问：

```text
http://localhost:5173
```

### 后端启动（可选）

当前核心生成链路主要在前端本地完成。后端用于健康检查和 fallback planner API。

```powershell
cd apps/api
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

健康检查：

```text
http://127.0.0.1:8000/health
```

预期返回：

```json
{
  "status": "ok",
  "message": "游素工坊 API 服务运行中"
}
```

---

## 使用流程

1. 打开前端页面；
2. 选择主题、风格、素材类型、尺寸和数量；
3. 点击「生成素材」；
4. 查看不同 variant 的素材卡片；
5. 下载 PNG、metadata.json、ZIP 或 Sprite Sheet。

推荐测试参数：

```text
主题：赛博朋克
风格：卡通风
素材：剑、药水、地砖
尺寸：64
数量：4
```

也可以在「AI 需求规划」区域输入类似需求：

```text
生成一套赛博朋克卡通风 2D 游戏素材包，颜色偏霓虹蓝紫。

包含：
剑、药水、地砖。

尺寸64，每种4个。

希望同类型素材有明显差异，比如普通版、符文版、裂纹版、能量版等。
整体风格保持统一。
```

当前版本会将自然语言目标与表单参数一起进入本地 Agent Pipeline，生成多变体素材包。

---

## 导出说明

### PNG

每个素材卡片都支持单独导出 PNG。

### metadata.json

`metadata.json` 会保存当前素材包的结构化信息，包括：

- 项目名称
- 生成参数
- 素材数量
- 素材类型
- name
- variant
- description
- seed
- fileName

### ZIP 资源包

ZIP 会打包当前生成的全部 PNG 和 metadata。

结构示例：

```text
gameasset_pack_cyberpunk_cartoon_64_<timestamp>.zip
├─ assets/
│  ├─ gameasset_sword_cyberpunk_cartoon_64_12345.png
│  └─ ...
└─ metadata.json
```

### Sprite Sheet

Sprite Sheet 会把当前素材按网格合成为一张 PNG，方便游戏项目统一加载。

---

## 技术栈

### 前端

- React
- TypeScript
- Vite
- SVG Renderer
- Canvas / Blob Export
- JSZip

### 后端

- Python
- FastAPI
- Pydantic
- Uvicorn

### 工程方式

- SDD：Specification Driven Development
- GitHub 小粒度 PR
- 持续 commit
- README / docs 同步维护

---

## 项目结构

```text
game-asset-forge/
├─ apps/
│  ├─ web/
│  │  └─ src/
│  │     ├─ agent/
│  │     ├─ components/
│  │     ├─ exporters/
│  │     ├─ features/
│  │     └─ types/
│  │
│  └─ api/
│     └─ app/
│        ├─ core/
│        ├─ planner/
│        ├─ routes/
│        └─ schemas/
│
├─ docs/
│  ├─ SPEC.md
│  ├─ ARCHITECTURE.md
│  ├─ TASKS.md
│  ├─ ACCEPTANCE.md
│  ├─ PROMPTING.md
│  └─ images/
│
└─ README.md
```

---

## 开发过程

本项目按照 SDD 和持续 PR 的方式推进。

主要阶段包括：

1. 项目骨架与 SDD 文档；
2. 前端参数表单；
3. 本地 SVG 素材预览；
4. 单素材 PNG 导出；
5. metadata.json 导出；
6. ZIP 资源包导出；
7. Sprite Sheet 导出；
8. 前端模块边界重构；
9. 后端 Planner API 与 fallback planner；
10. 前端 AI 需求规划面板；
11. Agent Pipeline Skeleton 重构。

---

## 已完成能力

- 参数表单
- 本地 Agent Pipeline
- PaletteSkill / VariantSkill / RenderSkill
- 多变体 SVG 素材生成
- PNG 导出
- metadata.json 导出
- ZIP 资源包导出
- Sprite Sheet 导出
- SDD 文档
- 持续 PR 开发流程

---

## 未来规划

当前版本优先保证稳定、本地可运行。后续可以继续扩展：

- 百炼 LLM Art Planner
- Structured Output
- Function Calling
- LangChain Agent
- MCP Server
- Optional AI Image Generation

这些能力已在架构中预留扩展点，但当前版本不依赖它们即可完成核心演示。

---

## 验收方式

### 前端构建

```powershell
cd apps/web
npm.cmd run build
```

### 后端语法检查

```powershell
py -m compileall -q apps/api/app
```

### 手动验收

1. 打开前端页面；
2. 选择 `cyberpunk / cartoon / sword+potion+tile / 64 / 4`；
3. 点击生成；
4. 确认同类型素材有不同 variant；
5. 下载 PNG；
6. 下载 metadata.json；
7. 下载 ZIP；
8. 下载 Sprite Sheet；
9. 确认页面无明显报错。

---

## 安全说明

- 当前项目不需要提交任何 API Key。
- `.env` 不应提交到仓库。
- 后续如接入百炼或其他 LLM 服务，应通过本地环境变量配置。
- Demo 视频中不要展示个人 API Key、账号信息或其他敏感信息。

---

## 一句话总结

游素工坊 GameAssetForge 是一个面向 2D 游戏开发流程的 Agentic 素材生成工具。当前版本通过本地 Agent Pipeline 实现稳定、多变体、可导出的 2D 游戏素材包生成；未来可继续接入百炼 LLM、Function Calling、LangChain、MCP 与外部图像生成能力。
