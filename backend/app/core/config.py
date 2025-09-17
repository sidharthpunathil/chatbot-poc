import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Chatbot API"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    
    @field_validator('BACKEND_CORS_ORIGINS')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    # Database Configuration
    CHROMA_DB_PATH: str = "./chroma_db"
    
    # AI Configuration
    GROQ_API_KEY: Optional[str] = None
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    
    # Chat Configuration
    MAX_TOKENS: int = 500
    TEMPERATURE: float = 0.7
    TOP_P: float = 1.0
    N_RESULTS: int = 5
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": True
    }


settings = Settings()
