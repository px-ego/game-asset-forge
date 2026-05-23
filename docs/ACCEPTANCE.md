# PR1 验收标准

## 前端

- `apps/web` 使用 React、TypeScript 和 Vite 初始化。
- 前端可启动并显示标题“游素工坊 GameAssetForge”。
- 前端可显示说明“面向 2D 游戏开发流程的 AI 辅助素材生成工具”。
- 页面不包含参数表单、生成器、预览或导出功能。

## 后端

- `apps/api` 使用 FastAPI 初始化。
- 在 Windows PowerShell 中可按照以下命令启动服务：

```powershell
cd apps/api
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

- 服务启动后，访问 `http://127.0.0.1:8000/health` 应返回 HTTP 200。
- 预期响应体严格为：

```json
{
  "status": "ok",
  "message": "游素工坊 API 服务运行中"
}
```

## 文档与范围

- `README.md` 包含项目简介、MVP 范围、技术栈、目录结构、启动方式、SDD 流程和 PR 规范。
- `SPEC.md` v1.0 作为最高优先级需求文档保留。
- 项目未引入 LLM、LangChain、MCP、Stable Diffusion、数据库、用户登录、云部署和多 Agent。
