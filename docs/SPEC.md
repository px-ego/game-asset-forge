# 游素工坊（GameAssetForge）需求规格说明书

版本：v1.0  
阶段：MVP 规格锁定  
默认语言：中文  
项目类型：七牛云 × XEngineer 暑期实训营 72h 作品

---

## 1. 项目背景

在 2D 游戏开发、课程设计、Game Jam、Hackathon 等场景中，开发者经常需要快速获得一批风格统一、尺寸统一、可直接用于原型开发的游戏素材。

但现实问题是：

1. 很多学生开发者或独立开发者不会绘制游戏素材。
2. 直接使用网络素材可能存在版权问题。
3. 通用 AI 绘图工具虽然效果强，但不一定适合游戏开发流程。
4. 2D 游戏素材通常需要统一尺寸、统一风格、批量生成、可导出、可管理。
5. 对于 72h 实战项目来说，完全依赖大型图像生成模型存在成本、稳定性和时间风险。

因此，本项目希望实现一个轻量、可控、低成本的 2D 游戏素材生成工具。

---

## 2. 项目定位

本项目不是“AI 画图网站”，而是：

> 面向 2D 游戏开发流程的 AI 辅助游戏素材生成工具。

MVP 阶段优先实现本地规则生成，不依赖 LLM，不依赖外部图像生成模型，保证在 deadline 前一定能提交可运行版本。

后续增强阶段再加入 LLM Planner、Structured Output、Function Calling、LangChain Tool Agent 和 MCP 等能力。

---

## 3. 项目目标

### 3.1 MVP 目标

用户可以通过参数表单选择游戏主题、素材风格、素材类型、尺寸和生成数量，系统基于本地规则生成 2D 游戏素材，并支持浏览器预览和导出。

MVP 必须做到：

1. 页面可运行。
2. 用户可选择参数。
3. 至少支持 5 类素材生成。
4. 生成结果可预览。
5. 支持导出 PNG。
6. 支持导出 metadata.json。
7. README 可指导评委独立运行项目。

### 3.2 增强目标

在 MVP 稳定后，逐步加入：

1. LLM 自然语言解析。
2. 结构化 AssetSpec 输出。
3. Function Calling / Tool Calling。
4. LangChain Agent。
5. 可选 MCP Server。
6. 七牛云对象存储或资源管理相关能力。

---

## 4. 目标用户

### 4.1 独立游戏开发者

特点：

- 想快速制作游戏原型。
- 不擅长绘制素材。
- 需要一批风格统一的图标、道具、怪物、地砖等素材。

使用价值：

- 快速获得可用素材。
- 降低原型开发门槛。
- 避免临时找素材带来的版权风险。

### 4.2 学生开发者 / Hackathon 参赛者

特点：

- 时间有限。
- 更关注作品能不能快速跑起来。
- 需要占位素材或原型素材。

使用价值：

- 快速生成素材。
- 直接导出并放入游戏 Demo。
- 提升作品视觉完整度。

### 4.3 AI 工程学习者

特点：

- 希望理解 Agent、Prompt、Function Calling、LangChain 等概念。
- 需要一个完整但不过度复杂的工程案例。

使用价值：

- 通过本项目理解“LLM 作为规划器，而不是直接执行器”的设计思想。
- 学习结构化输出和工具调用。

---

## 5. 核心用户流程

### 5.1 MVP 阶段流程

1. 用户打开网页。
2. 用户选择游戏主题。
3. 用户选择素材风格。
4. 用户选择素材类型。
5. 用户选择素材尺寸。
6. 用户选择生成数量。
7. 用户点击“生成素材”。
8. 系统在浏览器中展示生成结果。
9. 用户选择导出 PNG 或 metadata.json。
10. 用户将素材用于 2D 游戏开发原型。

### 5.2 后续 AI 阶段流程

1. 用户输入自然语言需求。
2. LLM Planner 将自然语言转换为结构化 AssetSpec。
3. 系统校验 AssetSpec。
4. Renderer 根据 AssetSpec 调用本地生成工具。
5. Exporter 导出素材包。
6. 用户获得素材、Sprite Sheet 和 metadata.json。

示例自然语言需求：

```text
生成一套像素风地牢游戏素材，包括金币、药水、史莱姆、剑和地砖，尺寸为 64x64，整体风格偏暗黑。
期望结构化结果：
{
  "theme": "dungeon",
  "style": "pixel",
  "assetTypes": ["coin", "potion", "slime", "sword", "tile"],
  "size": 64,
  "count": 8,
  "palette": "dark",
  "exportFormats": ["png", "metadata"]
}

6. MVP 功能范围
6.1 参数输入

必须支持以下参数：

游戏主题

MVP 支持：

森林
地牢
赛博朋克
素材风格

MVP 支持：

像素风
卡通风
素材类型

MVP 支持：

potion：药水
coin：金币
slime：史莱姆
sword：剑
tile：地砖
素材尺寸

MVP 支持：

32x32
64x64
128x128
生成数量

MVP 支持：

1
4
8
7. MVP 功能详情
7.1 本地规则生成

MVP 阶段不依赖 LLM，不依赖 Stable Diffusion，不依赖外部图像生成 API。

系统通过 Canvas / SVG / 程序化规则生成素材。

每类素材需要有基础生成逻辑：

coin 金币

应包含：

圆形主体
外圈描边
内部高光
可根据主题改变颜色倾向
potion 药水

应包含：

瓶身
瓶塞
液体区域
高光效果
slime 史莱姆

应包含：

blob 主体
眼睛
嘴巴或表情
主题色变化
sword 剑

应包含：

剑刃
剑柄
护手
简单高光
tile 地砖

应包含：

方形地块
纹理线条
边缘变化
可平铺感
7.2 预览功能

用户点击生成后，页面需要展示素材列表。

每个素材卡片至少包含：

素材预览图
素材类型
尺寸
风格
主题
导出按钮
7.3 导出 PNG

用户可以导出单个素材 PNG。

可接受实现方式：

前端 Canvas 转 PNG 下载
或后端生成后返回 base64 / 文件 URL

MVP 优先采用前端导出，降低后端复杂度。

7.4 导出 metadata.json

用户可以导出本次生成任务的 metadata.json。

metadata 至少包含：
{
  "project": "GameAssetForge",
  "theme": "forest",
  "style": "pixel",
  "size": 64,
  "count": 4,
  "assets": [
    {
      "id": "asset_001",
      "type": "coin",
      "name": "森林金币",
      "size": 64,
      "format": "png"
    }
  ],
  "createdAt": "2026-xx-xx"
}

8. 非目标

MVP 阶段明确不做以下内容：

不做用户登录。
不做数据库。
不做在线多人协作。
不做 Stable Diffusion。
不做 Midjourney 接入。
不做真正商业级美术质量。
不做复杂动画编辑器。
不做游戏引擎插件。
不做多 Agent 系统。
不做 LangGraph。
不做 MCP。
不做云部署强依赖。
不做复杂权限系统。
不做支付系统。
不做素材市场。

这些内容可以作为未来扩展方向，但不能影响 MVP 交付。

9. 技术路线
9.1 前端

采用：

React
TypeScript
Vite

职责：

参数表单
素材预览
Canvas / SVG 展示
PNG 下载
metadata 下载
后续自然语言输入入口
9.2 后端

采用：

Python
FastAPI

职责：

提供健康检查接口
提供生成接口
校验 AssetSpec
后续接入 LLM Planner
后续接入 LangChain Tool Agent

MVP 阶段后端可以保持较轻，仅提供基础 API 和结构校验。

9.3 Renderer

职责：

根据 AssetSpec 生成素材
支持不同素材类型
支持不同主题色板
支持不同尺寸
支持确定性随机 seed
9.4 Schema

定义统一数据结构：

AssetSpec
AssetItem
GenerateRequest
GenerateResponse
ExportMetadata
9.5 AI / Agent 层

MVP 阶段暂不实现。

后续阶段引入：

Prompt Engineering
Structured Output
Function Calling
LangChain Agent
可选 MCP Server
10. 核心数据结构
10.1 AssetSpec
{
  "theme": "forest",
  "style": "pixel",
  "assetType": "coin",
  "size": 64,
  "count": 4,
  "seed": 12345
}

字段说明：

字段	类型	必填	说明
theme	string	是	游戏主题
style	string	是	素材风格
assetType	string	是	素材类型
size	number	是	素材尺寸
count	number	是	生成数量
seed	number	否	随机种子
10.2 AssetItem
{
  "id": "asset_001",
  "type": "coin",
  "name": "森林金币",
  "size": 64,
  "theme": "forest",
  "style": "pixel",
  "dataUrl": "data:image/png;base64,..."
}
10.3 GenerateRequest
{
  "theme": "forest",
  "style": "pixel",
  "assetTypes": ["coin", "potion"],
  "size": 64,
  "count": 4
}
10.4 GenerateResponse
{
  "success": true,
  "assets": [],
  "metadata": {}
}
11. 工程约束
11.1 默认中文

项目中以下内容默认使用中文：

README
页面 UI
文档
PR 描述
Prompt 模板
示例输入
示例输出

代码变量名可以使用英文，保持工程规范。

11.2 可运行优先

任何 PR 合并后，主分支必须保持可运行。

禁止出现：

PR 合并后页面打不开
后端启动失败
README 启动方式过时
大量未解释的死代码
11.3 小步提交

每个 PR 只做一件事。

推荐 PR 顺序：

项目骨架与 SDD 文档
前端基础页面
参数表单
本地 Renderer
素材预览
PNG 导出
metadata 导出
README 与 Demo 收口
LLM Planner 增强
LangChain Tool Calling 增强
11.4 不临尾突击

开发过程需要持续 commit。

commit 应能体现真实开发过程，而不是最后一次性导入所有代码。

12. 验收标准

MVP 完成时，必须满足：

README 中的启动命令可运行。
前端页面可打开。
用户可以选择主题、风格、素材类型、尺寸、数量。
点击生成后可以看到素材预览。
至少支持 potion、coin、slime、sword、tile 五种素材。
每种素材至少有一种可辨识的图形特征。
可以导出单个 PNG。
可以导出 metadata.json。
metadata.json 内容与用户选择参数一致。
项目不依赖外部 LLM API 也能完成核心演示。
项目文档说明后续 AI / Agent 扩展路线。
主分支在提交截止时保持可运行。
13. 后续增强路线
Phase 1：LLM Planner

目标：

让用户可以用自然语言描述需求，系统自动转换为 AssetSpec。

示例：

我想要一套地牢像素风素材，包括金币、药水和史莱姆，尺寸 64x64。

输出：

{
  "theme": "dungeon",
  "style": "pixel",
  "assetTypes": ["coin", "potion", "slime"],
  "size": 64,
  "count": 4
}
Phase 2：Structured Output

目标：

约束 LLM 只能输出符合 AssetSpec Schema 的结构化结果。

Phase 3：Function Calling / Tool Calling

目标：

让 LLM 根据用户需求选择工具：

validate_asset_spec
render_asset
export_metadata
build_sprite_sheet
Phase 4：LangChain Agent

目标：

使用 LangChain 管理模型、工具、结构化输出和 Agent 执行流程。

Phase 5：MCP Server

目标：

将素材生成、色板查询、模板查询、导出等能力封装为 MCP Tools，作为可被外部 Agent 调用的工具服务。

14. 项目亮点表达

本项目路演时重点表达：

不是简单 AI 画图，而是面向 2D 游戏开发流程的素材生成工具。
MVP 不依赖外部大模型，保证低成本、可控、稳定。
LLM 被设计为 Planner，而不是 Painter。
本地 Renderer 保证生成结果可控、可复现、可导出。
支持结构化 AssetSpec，为后续 Function Calling 和 Agent 化打基础。
通过 SDD 文档和小粒度 PR 展示工程过程。
后续可扩展为 LangChain Agent 和 MCP Tool Server。
15. 一句话总结

游素工坊是一个面向 2D 游戏开发者的 AI 辅助素材生成工具。MVP 阶段通过本地规则生成实现稳定可交付，后续通过 LLM Planner、Structured Output、Function Calling、LangChain 和 MCP 扩展为完整的 Agent 化素材生产系统。