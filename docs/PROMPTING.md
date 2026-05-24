# Prompting 与 Agent 规划

## 当前状态

现有代码保留可选的百炼 LLM Art Planner V2 与结构化 `AssetPackPlan` 校验。本轮新增后端 Tool Registry / Skill Registry，但当前仍未接入由模型驱动的 Function Calling / Tool Calling、LangChain、MCP 或图像生成模型。

PR10 新增后端 fallback planner API：`POST /api/plan` 可以通过固定关键词规则把中文自然语言需求转换为结构化 `AssetPlan`。它不调用模型、不需要 API Key，用于保证 Planner 契约可演示、可验证。

PR11 新增前端「AI 需求规划」面板：用户可以输入需求并调用该 fallback API，将返回计划写入现有参数表单。规划不会自动生成素材；用户仍需手动确认并点击“生成素材”。

当前素材生成仍由浏览器端本地规则完成。启用 `LLM_ENABLED=true` 且配置百炼 Key 时，新的 `/api/agent/plan-pack` 可让 Qwen 规划完整素材包；未启用、无 Key、请求失败、JSON 解析失败或 Pydantic 校验失败时，后端自动返回本地 fallback 计划。后端未启动时，用户仍可手动选择参数并完成 SVG 预览与本地导出。

PR12 新增前端 Agent Pipeline Skeleton。它把用户确认后的表单参数和可选 prompt 交给本地 Planner Agent，再通过 `PaletteSkill`、`VariantSkill`、`RenderSkill` 与 Validation Layer 生成素材记录。该链路是 deterministic 本地代码，不是 LLM Agent，也不需要 API Key。

## 设计原则

百炼 LLM 只作为 **Planner / Art Director**，不作为 **Painter**：

- Planner 负责理解用户自然语言意图并输出结构化素材规格。
- 本地 Renderer 继续负责可控、可重复的素材绘制与导出。
- 该分工用于维持生成流程的稳定性、成本可控性和可验收性。

## Art Planner 契约

完整计划接口支持类似请求：

```json
{
  "prompt": "生成一个地牢像素风金币，尺寸64"
}
```

```http
POST /api/agent/plan-pack
```

响应为结构化 `AssetPackPlan`，计划中至少包含色板、全局风格提示和完整素材项：

```json
{
  "success": true,
  "source": "fallback",
  "plan": {
    "theme": "dungeon",
    "style": "pixel",
    "size": 64,
    "count": 1,
    "goal": "生成一个地牢像素风金币，尺寸64",
    "palette": {
      "primary": "#807895",
      "secondary": "#57496d",
      "accent": "#ad82d7",
      "outline": "#292536",
      "background": "#211f2c"
    },
    "globalStyleHints": ["硬边像素造型"],
    "assets": [
      {
        "id": "asset_coin_001",
        "type": "coin",
        "name": "普通金币",
        "description": "地牢氛围的经典圆形金币",
        "variant": "common_coin",
        "seed": 12345,
        "renderHints": {
          "material": "gold",
          "decoration": "plain",
          "rarity": "common"
        }
      }
    ]
  },
  "message": "当前未启用 LLM，已使用 fallback 规划",
  "warnings": []
}
```

Fallback 识别规则覆盖主题、风格、五类素材、尺寸和数量；无法识别或输入为空时返回默认森林像素风金币方案，尺寸 `64`、数量 `4`。旧 `/api/plan` 的简单 `AssetPlan` 契约继续保留。

## 百炼结构化输出

- 本地配置通过 `LLM_ENABLED`、`DASHSCOPE_API_KEY`、`DASHSCOPE_BASE_URL`、`DASHSCOPE_MODEL` 提供，真实 Key 只存于被忽略的 `.env` 或操作系统环境变量。
- system prompt 明确包含 `Output JSON only.`、`Return a valid JSON object.`、`No markdown.`、`No explanations.`，并限制主题、风格、类型、尺寸、数量与 rarity 值域。
- 调用使用百炼 OpenAI-compatible chat completion 与 JSON Mode：`response_format={"type": "json_object"}` 作为兼容请求扩展传入。
- 响应经 `json.loads`、seed normalize 与 Pydantic `AssetPackPlan` 校验；未知字段、非法枚举、空素材列表、同类重复的名称/描述/variant/renderHints 或每类数量不符合 `count` 都会触发 fallback。

## 真实联调问题与排查经验

1. `python-dotenv` 只影响启动后的 Python 进程，不会把 `.env` 值写回 PowerShell 父进程。不要使用 PowerShell `echo` 是否为空来判断百炼配置是否加载；需要排查时设置 `DEBUG_CONFIG=true`，只检查安全输出中的 `KEY EXISTS` 布尔值。
2. `.env` 不存在时，应用会明确提示使用进程环境变量；这不是启动失败，也不影响默认 fallback 链路。
3. 后端启动会列出三个已注册路由，可先据此区分前端 URL 错误、接口 404 与 LLM 本身错误。
4. 百炼调用使用 `timeout=60.0`、`max_retries=0`、`temperature=0.2` 与 `max_tokens=800`，避免超时被隐藏在多次重试后，也限制结构化计划长度。
5. 模型可能把 `seed` 输出为 `"456"` 或 `"sword_cyber_circuit_001"`。normalize 层将前者转为整数，将后者用稳定哈希转换为确定性整数，并在同一计划内对重复 seed 递增去重，再进入 Pydantic 校验。
6. 超时、鉴权失败和 Pydantic 结构失败会分别返回中文 fallback message；后端失败日志输出异常类型与脱敏后的信息，不输出 API Key。

如需隔离业务 prompt 和 schema 进行 JSON Mode 联调，可在配置好本地 Key 后手动运行 `apps/api/test_bailian_min.py`；该脚本只发送最小 JSON 请求并显示返回内容。

## 当前交互边界

1. 前端将用户文本发送给 `/api/agent/plan-pack`。
2. 前端校验完整 `AssetPackPlan`，把基础选项写入表单，并缓存 external plan 与来源。
3. 用户直接点击生成时，pipeline 消费 external plan；用户修改表单时，external plan 被清除并回到本地规划。
4. Renderer 消费 `palette` 与 `renderHints` 展示不同 variant，导出继续使用本地 SVG/Canvas 路径。
5. 当前存在可选模型规划调用，但不存在自动工具调用、LangChain 或 MCP 调用。

## 本地 Pipeline 契约

当前 pipeline 的计划层以 `AssetPackPlan` 组织数据：

- `palette`：由 `PaletteSkill` 基于主题、风格和关键词构造。
- `assets`：由 `VariantSkill` 构造，每项具有 `name`、`description`、`variant`、`seed` 和 `renderHints`。
- `globalStyleHints`：记录像素/卡通及关键词对应的本地风格提示。

`RenderSkill` 将本地或百炼计划转换为既有预览与导出层使用的素材记录；`ExportSkill` 目前仅登记 PNG、metadata、ZIP、Sprite Sheet 能力，尚未接管导出，也不构成 Function Calling。

## 后端 Tool Registry 契约

后端以统一 `ToolDefinition` 注册五个应用侧本地工具：`palette.generate`、`variant.generate`、`render.prepare`、`asset_pack.validate`、`export.describe`。每个定义包含名称、中文说明、输入 schema、输出 schema、分类和启用状态。

- `GET /api/tools` 用于读取工具定义。
- `POST /api/tools/execute` 用于按名称调试本地确定性执行；未知工具返回失败响应而非服务异常。
- Palette 与 Variant 工具复用 fallback 规则，Render 工具只准备 render spec，Validate 工具返回中文 warning，Export 工具只描述已有前端导出能力。
- 当前 Planner 不会根据模型输出自动调用这些工具，前端 PNG、metadata、ZIP 与 Sprite Sheet 下载路径没有迁移到后端。

这些 definition 将来可以被映射为 LLM function calling schema、LangChain tools 或 MCP tools，但映射和模型交互均不属于当前完成范围。

## 后续路线

1. Function Calling / Tool Calling：将现有 `ToolDefinition` 映射为模型可调用工具，并在稳定 `AssetPackPlan` 契约上调用校验、渲染、导出等能力。
2. LangChain Tool Calling：管理模型和工具流程。
3. MCP Server：将素材能力作为工具服务暴露给外部 Agent。
4. Optional AI Generation：仅在未来评估，不改变当前本地 Renderer 的可验收路径。

上述模型编排能力均属于后续增强；当前完成范围为可选百炼 Art Planner、始终可运行的本地渲染/fallback 链路，以及可调试但不由模型驱动的后端 Tool Registry。
