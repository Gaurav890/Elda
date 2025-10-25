"""
Configuration settings using Pydantic Settings
Loads environment variables from .env file
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """

    # Application Settings
    APP_ENV: str = "development"
    SECRET_KEY: str
    DEBUG: bool = True

    # Database
    DATABASE_URL: str

    # AI Services
    CLAUDE_API_KEY: str = ""
    LETTA_API_KEY: str = ""
    LETTA_PROJECT_ID: str = ""
    LETTA_BASE_URL: str = "https://api.letta.com"

    # Chroma Vector Database (REQUIRED for prize)
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8000
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_data"

    # Communication Services
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # Firebase (Push Notifications)
    FIREBASE_SERVER_KEY: str = ""
    FIREBASE_CREDENTIALS_PATH: str = "./firebase-credentials.json"

    # JWT Settings
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS Settings
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:19006"  # Comma-separated string

    # Background Job Settings
    REMINDER_CHECK_INTERVAL_SECONDS: int = 60
    MONITORING_CHECK_INTERVAL_SECONDS: int = 1800
    SUMMARY_GENERATION_HOUR: int = 0

    # API Response Time Targets (for monitoring)
    VOICE_RESPONSE_TARGET_SECONDS: int = 5
    EMERGENCY_RESPONSE_TARGET_SECONDS: int = 3
    HEARTBEAT_RESPONSE_TARGET_SECONDS: int = 1

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.APP_ENV == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development"""
        return self.APP_ENV == "development"

    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS_ORIGINS string to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


# Create global settings instance
settings = Settings()
