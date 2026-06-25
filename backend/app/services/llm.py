"""Shared OpenRouter client.

OpenRouter is OpenAI-compatible, so we reuse the official `openai` SDK and just
point it at OpenRouter's base URL. Centralising client creation here means every
service (vision, recipes) talks to the same provider with the same headers.
"""
from functools import lru_cache
from openai import OpenAI
from app.config import settings


@lru_cache(maxsize=1)
def get_client() -> OpenAI:
    """Return a cached OpenRouter-backed OpenAI client.

    The HTTP-Referer / X-Title headers are recommended by OpenRouter so the app
    shows up correctly on their dashboards and rankings.
    """
    return OpenAI(
        api_key=settings.ai_key or "missing-key",
        base_url=settings.OPENROUTER_BASE_URL,
        default_headers={
            "HTTP-Referer": "https://chefly.app",
            "X-Title": "Chefly",
        },
    )
