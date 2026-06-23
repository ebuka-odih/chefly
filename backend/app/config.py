from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Chefly"
    DATABASE_URL: str = "sqlite:///./chefly.db"
    OPENROUTER_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    PUBLIC_API_BASE_URL: str = "https://chefly.eecollective.ink"
    APP_SCHEME: str = "chefly"
    ALLOWED_ORIGINS: str = "*"
    MAILTRAP_KEY: str = ""
    MAIL_FROM: str = "noreply@chefly.eecollective.ink"
    MAGIC_LINK_EXPIRE_MINUTES: int = 20

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def allowed_origins_list(self) -> list[str]:
        if self.ALLOWED_ORIGINS.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

settings = Settings()
