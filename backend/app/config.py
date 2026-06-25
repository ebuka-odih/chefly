from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings.

    Defaults let the app boot locally without optional provider keys. Live
    deployments should provide DATABASE_URL, SECRET_KEY, OPENROUTER_KEY, and
    Mailtrap SMTP credentials through environment variables.
    """

    # --- Core ---
    APP_NAME: str = "Chefly"
    DATABASE_URL: str = "sqlite:///./chefly.db"
    ALLOWED_ORIGINS: str = "*"

    # --- AI provider (OpenRouter, OpenAI-compatible) ---
    OPENROUTER_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    VISION_MODEL: str = "openai/gpt-4o-mini"
    RECIPE_MODEL: str = "openai/gpt-4.1-mini"
    IMAGE_MODEL: str = "google/gemini-2.5-flash-image"
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""

    # --- Auth ---
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    OTP_EXPIRE_MINUTES: int = 10
    MAGIC_LINK_EXPIRE_MINUTES: int = 20
    PUBLIC_API_BASE_URL: str = "https://chefly.eecollective.ink"
    APP_SCHEME: str = "chefly"

    # --- Mailtrap SMTP ---
    MAILTRAP_KEY: str = ""
    MAILTRAP_SMTP_HOST: str = "live.smtp.mailtrap.io"
    MAILTRAP_SMTP_PORT: int = 587
    MAILTRAP_SMTP_USERNAME: str = "api"
    MAILTRAP_SMTP_PASSWORD: str = ""
    MAIL_FROM: str = "hello@postcrafts.site"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def ai_key(self) -> str:
        return self.OPENROUTER_KEY or self.OPENAI_API_KEY

    @property
    def ai_enabled(self) -> bool:
        return bool(self.ai_key)

    @property
    def allowed_origins_list(self) -> list[str]:
        if self.ALLOWED_ORIGINS.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()
