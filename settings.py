from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="allow"
    )

    DATABASE_URL: str = ""
    API_HASH: str = ""
    API_ID: int = 0  # vira int direto
    GROUP_DATABASE_ID: str = ""
    WAIFU_TK: str = ""
    HUSBANDO_TK: str = ""
    GROUP_MAIN: str = ""
    GROUP_MAIN_ID: int = 0
    GROUP_ADDMS_ID: int = 0
    BOT_TOKEN_TESTE: str = ""
