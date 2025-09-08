from click import command
from DB.database import AsyncSessionLocal
from sqlalchemy.ext.asyncio import AsyncSession
from pyrogram import Client
from types_ import TipoCategoria
from pyrogram.enums import ParseMode
from pyrogram.types import *
from types_ import *
from domination.logger import log_info, log_error, log_debug
from pathlib import Path

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
        parse_mode: ParseMode = ParseMode.HTML,
        workdir: str = "sessions",
    ):  
        Path(workdir).mkdir(exist_ok=True)
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
            parse_mode=parse_mode,
            workdir=workdir,
        )


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

    async def set_comandos(self):
        # Precisa estar conectado (chamar após start)
        # chats privados
        privados=await self.set_bot_commands(
            commands=[
                BotCommand(command.lower(), description.lower())
                for command, description in COMMAND_LIST_MIN_DESC_PV.items()
            ],
            scope=BotCommandScopeAllPrivateChats(),
        )

        # chats de grupo
        grupos=await self.set_bot_commands(
            commands=[
                BotCommand(f"{self.genero.value[0].lower()}{command.lower()}", description)
                for command, description in COMMAND_LIST_MIN_DESC_PUBLIC.items()
            ],
            scope=BotCommandScopeAllGroupChats(),
        )

        # comandos de admin
        admin=await self.set_bot_commands(
            commands=[
                BotCommand(f"{self.genero.value[0].lower()}{command.lower()}", description)
                for command, description in COMMAND_LIST_MIN_DESC_ADMIN.items()
            ],
            scope=BotCommandScopeAllChatAdministrators(),
        )
        log_info(f"Comandos definidos - Privados: {privados}, Grupos: {grupos}, Admin: {admin}", "commands")
    def start(self):
        res = super().start()
        try:
            try:
                self.me = self.get_me()
            except Exception:
                pass
            # agenda set_comandos no loop do cliente
            if hasattr(self, "loop"):
                # self.loop.create_task(self.set_comandos())
                pass
        except Exception:
            pass
        return res
