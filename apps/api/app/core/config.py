import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

DASHSCOPE_DEFAULT_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
DASHSCOPE_DEFAULT_MODEL = "qwen-plus"

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


def _read_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)

    if value is None:
        return default

    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    llm_enabled: bool
    dashscope_api_key: str
    dashscope_base_url: str
    dashscope_model: str


def get_settings() -> Settings:
    return Settings(
        llm_enabled=_read_bool("LLM_ENABLED"),
        dashscope_api_key=os.getenv("DASHSCOPE_API_KEY", "").strip(),
        dashscope_base_url=os.getenv(
            "DASHSCOPE_BASE_URL",
            DASHSCOPE_DEFAULT_BASE_URL,
        ).strip()
        or DASHSCOPE_DEFAULT_BASE_URL,
        dashscope_model=os.getenv("DASHSCOPE_MODEL", DASHSCOPE_DEFAULT_MODEL).strip()
        or DASHSCOPE_DEFAULT_MODEL,
    )
