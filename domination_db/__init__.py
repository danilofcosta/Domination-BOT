from pathlib import Path
from pyrogram import Client
from pyrogram.enums import ParseMode
from types_ import TipoCategoria

class DominationDB(Client):
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
        self._current_session = None
        self.genero = genero

        self.group_main = group_main
        super().__init__(
            name=f'{name}_db',
            api_id=api_id,
            api_hash=api_hash,
            bot_token=bot_token,
            in_memory=is_memory,
            plugins=dict(root="domination_db.plugins"),
            parse_mode=parse_mode,
            workdir=workdir,
        )