import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Universal Disease Monitoring Platform"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./analytics.db")
    
    # SMTP Settings (Gmail)
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = os.getenv("EMAIL_USER", "drariana2025@gmail.com")
    SMTP_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "")  # Пароль приложения
    
    # Upload Settings
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50 MB

    class Config:
        case_sensitive = True

settings = Settings()
