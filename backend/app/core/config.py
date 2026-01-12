from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # API Keys
    GROQ_API_KEY: str
    TAVILY_API_KEY: str
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_KEY: str 
    
    # App Settings
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Debate Settings
    MAX_ROUNDS: int = 10
    MAX_ARGUMENT_LENGTH: int = 1000
    EVIDENCE_SOURCES_LIMIT: int = 3
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()