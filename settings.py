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
    
    WAIFU_TK: str = ""
    HUSBANDO_TK: str = ""
    GROUP_MAIN: str = ""
    
    # def __init__(self, **kwargs):
    #     super().__init__(**kwargs)
        
    #     # Se as variáveis ainda estão vazias, tentar carregar do config.py
    #     if not self.API_HASH or not self.API_ID or not self.WAIFU_TK or not self.DATABASE_URL:
    #         try:
    #             import config
    #             if hasattr(config, 'API_HASH'):
    #                 self.API_HASH = config.API_HASH
    #             if hasattr(config, 'API_ID'):
    #                 self.API_ID = config.API_ID
    #             if hasattr(config, 'WAIFU_TK'):
    #                 self.WAIFU_TK = config.WAIFU_TK
    #             if hasattr(config, 'HUSBANDO_TK'):
    #                 self.HUSBANDO_TK = config.HUSBANDO_TK
    #             if hasattr(config, 'GROUP_MAIN'):
    #                 self.GROUP_MAIN = config.GROUP_MAIN
    #             if hasattr(config, 'DATABASE_URL'):
    #                 self.DATABASE_URL = config.DATABASE_URL
    #         except ImportError:
    #             pass
