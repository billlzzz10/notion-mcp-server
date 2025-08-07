"""
Configuration settings for the Agent API
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Azure OpenAI Configuration
    azure_openai_endpoint: str
    azure_openai_api_key: str
    azure_openai_deployment_name: str = "gpt-4"
    azure_openai_api_version: str = "2024-02-01"
    
    # Notion Configuration
    notion_token: Optional[str] = None
    
    # Application Configuration
    python_env: str = "production"
    api_port: int = 8000
    log_level: str = "info"
    
    # OpenAI Model Settings
    max_tokens: int = 4096
    temperature: float = 0.7
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()