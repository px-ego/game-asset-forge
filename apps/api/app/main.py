from fastapi import FastAPI


app = FastAPI(title="游素工坊 API", version="0.1.0")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "message": "游素工坊 API 服务运行中",
    }
