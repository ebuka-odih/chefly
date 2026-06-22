from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings.

    All values can be overridden via environment variables (or a local .env).
    The defaults are chosen so the app boots cleanly for local development even
    when optional keys are missing — only OPENROUTER_KEY is required for the AI
    features to actually return live results.
    """

    # --- Core ---
    APP_NAME: str = "Chefly"
    # Falls back to a local SQLite file so the app can boot without Postgres.
    DATABASE_URL: str = "sqlite:///./chefly.db"

    # --- AI provider (OpenRouter, OpenAI-compatible) ---
    OPENROUTER_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    # OpenRouter model IDs. Vision + recipe models per docs/BACKEND.json.
    VISION_MODEL: str = "openai/gpt-4o-mini"
    RECIPE_MODEL: str = "openai/gpt-4.1-mini"
    IMAGE_MODEL: str = "google/gemini-2.5-flash-image"

    # Legacy / optional direct-provider keys (unused when OPENROUTER_KEY is set).
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""

    # --- Auth ---
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def ai_key(self) -> str:
        """The key used for OpenRouter (preferred) or a direct OpenAI fallback."""
        return self.OPENROUTER_KEY or self.OPENAI_API_KEY

    @property
    def ai_enabled(self) -> bool:
        return bool(self.ai_key)


settings = Settings()
