from openai import OpenAI

from app.core.config import (
    DASHSCOPE_API_KEY,
    DASHSCOPE_BASE_URL,
    DASHSCOPE_MODEL,
)


def main() -> None:
    if not DASHSCOPE_API_KEY:
        raise SystemExit("DASHSCOPE_API_KEY 未配置，无法执行最小百炼联调。")

    client = OpenAI(
        api_key=DASHSCOPE_API_KEY,
        base_url=DASHSCOPE_BASE_URL,
        timeout=60.0,
        max_retries=0,
    )
    completion = client.chat.completions.create(
        model=DASHSCOPE_MODEL,
        messages=[
            {"role": "system", "content": "Output JSON only."},
            {"role": "user", "content": 'Return JSON: {"ok": true}'},
        ],
        temperature=0.0,
        max_tokens=64,
        extra_body={"response_format": {"type": "json_object"}},
    )

    print(completion.choices[0].message.content or "")


if __name__ == "__main__":
    main()
