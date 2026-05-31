from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_KEY: str | None = None
    GEMINI_API_KEY: str | None = None
    QDRANT_PATH: str | None = None
    QDRANT_URL: str | None = None
    QDRANT_API_KEY: str | None = None

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
