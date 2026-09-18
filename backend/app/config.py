from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    APP_ENV: str = "development"
    SECRET_KEY: str = "change-me"
    ALLOWED_ORIGINS: str = ""
    
    AUTH_RATE_LIMIT_MAX: int = 5
    AUTH_RATE_LIMIT_WINDOW_SECONDS: int = 60

    @property
    def allowed_origins_list(self) -> List[str]:
        if not self.ALLOWED_ORIGINS.strip():
            return []
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
