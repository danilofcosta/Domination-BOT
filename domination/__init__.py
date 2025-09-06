import asyncio
from DB.database import AsyncSessionLocal
from sqlalchemy.ext.asyncio import AsyncSession
from pyrogram import Client
from types_ import TipoCategoria
from pyrogram.enums import ParseMode


class Domination(Client):
    def __init__(
        self,
        name: str,
        api_id: str | int,
        api_hash: str,
        bot_token: str,
        genero: TipoCategoria,
        is_memory: bool = False,
        group_main: str = None,
    ):
        self._session_factory = AsyncSessionLocal
        self._current_session = None
        self.genero = genero
        self.me = None
        self.group_main = group_main
        super().__init__(
            name=name,
            api_id=api_id,
            api_hash=api_hash,
            bot_token=bot_token,
            in_memory=is_memory,
            plugins=dict(root="domination.plugins"),
            parse_mode=ParseMode.HTML,
        )

    # async def initialize(self):
    #     """Inicializa o bot de forma assíncrona"""
    #     if self._should_start:
    #         # Só inicia se não estiver conectado
    #         if not self.is_connected:
    #             await self.start()
    #         self.me = await self.get_me()
    #     await self.send_message(chat_id="dog244", text="Bot iniciado")
    #     await self.stop_event.wait()

    async def get_session(self):
        """Retorna uma sessão assíncrona que pode ser usada diretamente"""
        return self._session_factory()

    async def get_reusable_session(self):
        """Retorna uma sessão reutilizável para múltiplas consultas"""
        if self._current_session is None:
            self._current_session = self._session_factory()
        return self._current_session

    async def close_session(self):
        """Fecha a sessão atual"""
        if self._current_session:
            await self._current_session.close()
            self._current_session = None
