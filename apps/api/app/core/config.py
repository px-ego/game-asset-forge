import os
from pathlib import Path

from dotenv import load_dotenv


API_ROOT = Path(__file__).resolve().parents[2]
DOTENV_PATH = API_ROOT / ".env"

if DOTENV_PATH.exists():
    load_dotenv(DOTENV_PATH)
else:
    print("[CONFIG] .env not found, using process environment.")


def _read_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)

    if value is None:
        return default

    return value.strip().lower() in {"1", "true", "yes", "on"}


CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

LLM_ENABLED = _read_bool("LLM_ENABLED")
DEBUG_CONFIG = _read_bool("DEBUG_CONFIG")
DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY", "").strip()
DASHSCOPE_BASE_URL = os.getenv(
    "DASHSCOPE_BASE_URL",
    "https://dashscope.aliyuncs.com/compatible-mode/v1",
).strip() or "https://dashscope.aliyuncs.com/compatible-mode/v1"
DASHSCOPE_MODEL = os.getenv("DASHSCOPE_MODEL", "qwen-plus").strip() or "qwen-plus"

if DEBUG_CONFIG:
    print("===== CONFIG DEBUG =====")
    print("LLM_ENABLED =", LLM_ENABLED)
    print("DASHSCOPE_MODEL =", DASHSCOPE_MODEL)
    print("KEY EXISTS =", bool(DASHSCOPE_API_KEY))
    print("========================")
