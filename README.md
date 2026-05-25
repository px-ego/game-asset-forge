# 游素工坊 GameAssetForge

> 面向 2D 游戏开发流程的 Agentic 游戏素材生成工具。  
> 从自然语言目标 / 表单参数出发，经过 Planner Agent、Skill Layer、Renderer、Validation 和 Export，生成风格统一、可预览、可导出的 2D 游戏素材包。

---

## Demo 视频

🎬 Demo 视频链接：  
(https://www.bilibili.com/video/BV1G1GR65E9q/?spm_id_from=333.1387.list.card_archive.click&vd_source=ef4fa5d984ade159cc00da1dc468f348)

> 请优先观看 Demo 视频。视频中展示了素材生成、多变体效果、PNG / metadata / ZIP / Sprite Sheet 导出、PR 开发流程以及系统架构说明。

---

## 项目简介

游素工坊 GameAssetForge 是一个面向 2D 游戏开发者、学生开发者和 Game Jam / Hackathon 场景的游戏素材生成工具。

很多学生开发者在做游戏 Demo 时，常见问题是：

- 不会绘制游戏素材；
- 临时找素材容易风格不统一；
- 网络素材可能存在版权风险；
- 通用 AI 画图工具不一定适合游戏开发流程；
- 游戏素材通常需要批量生成、统一风格、导出 PNG、metadata、Sprite Sheet 等资源格式。

因此，本项目没有把目标定位为“简单 AI 画图网站”，而是设计成一个 **面向 2D 游戏开发流程的 Agentic Asset Pipeline**：

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

核心功能
支持 5 类 2D 游戏素材：
金币 coin
药水 potion
史莱姆 slime
剑 sword
地砖 tile
支持 3 种主题：
森林 forest
地牢 dungeon
赛博朋克 cyberpunk
支持 2 种风格：
像素风 pixel
卡通风 cartoon
支持多变体生成：
普通金币 / 裂纹金币 / 符文金币 / 宝石金币
普通史莱姆 / 毒液史莱姆 / 水晶史莱姆 / 暗影史莱姆
等
支持导出：
单素材 PNG
metadata.json
ZIP 资源包
Sprite Sheet
Agent Pipeline

项目后期重构为本地 Agent Pipeline：

Planner Agent：理解目标并规划素材方案
PaletteSkill：生成主题色板
VariantSkill：为同类素材生成不同变体
RenderSkill：生成 Renderer 可消费的 render hints
ValidationSkill：检查素材包一致性
ExportSkill：描述导出能力
Renderer：根据 variant、palette、renderHints 生成 SVG 素材
架构图

图中实线表示当前已实现，虚线表示未来扩展。

快速启动
前端启动

Windows PowerShell 推荐使用 npm.cmd：

cd apps/web
npm.cmd install
npm.cmd run dev

访问：

http://localhost:5173
后端启动（可选）

当前核心生成链路主要在前端本地完成。后端用于健康检查和 fallback planner API。

cd apps/api
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload

健康检查：

http://127.0.0.1:8000/health
使用流程
打开前端页面；
选择主题、风格、素材类型、尺寸和数量；
点击「生成素材」；
查看不同 variant 的素材卡片；
下载 PNG、metadata.json、ZIP 或 Sprite Sheet。

推荐测试参数：

主题：赛博朋克
风格：卡通风
素材：剑、药水、地砖
尺寸：64
数量：4
技术栈
前端
React
TypeScript
Vite
SVG Renderer
Canvas / Blob Export
JSZip
后端
Python
FastAPI
Pydantic
Uvicorn
工程方式
SDD：Specification Driven Development
GitHub 小粒度 PR
持续 commit
README / docs 同步维护
项目结构
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
已完成
参数表单
本地 Agent Pipeline
PaletteSkill / VariantSkill / RenderSkill
多变体 SVG 素材生成
PNG 导出
metadata.json 导出
ZIP 资源包导出
Sprite Sheet 导出
SDD 文档
持续 PR 开发流程
未来规划

当前版本优先保证稳定、本地可运行。后续可以继续扩展：

百炼 LLM Art Planner
Structured Output
Function Calling
LangChain Agent
MCP Server
Optional AI Image Generation

这些能力已在架构中预留扩展点，但当前版本不依赖它们即可完成核心演示。

验收方式
前端构建
cd apps/web
npm.cmd run build
后端语法检查
py -m compileall -q apps/api/app
手动验收
选择 cyberpunk / cartoon / sword+potion+tile / 64 / 4；
点击生成；
确认同类型素材有不同 variant；
下载 PNG；
下载 metadata.json；
下载 ZIP；
下载 Sprite Sheet；
确认页面无明显报错。
一句话总结

游素工坊 GameAssetForge 是一个面向 2D 游戏开发流程的 Agentic 素材生成工具。当前版本通过本地 Agent Pipeline 实现稳定、多变体、可导出的 2D 游戏素材包生成；未来可继续接入百炼 LLM、Function Calling、LangChain、MCP 与外部图像生成能力。
