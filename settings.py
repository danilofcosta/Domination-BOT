from pydantic_settings import BaseSettings, SettingsConfigDict
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="allow"
    )
    
    # Valores padrão para quando o arquivo .env não existir
    DATABASE_URL: str = ""
    API_HASH: str = ""
    API_ID: str = ""
    GROUP_DATABASE_ID: str = ""
    WAIFU_TK: str = ""
    HUSBANDO_TK: str = ""
    GROUP_MAIN: str = ""
    