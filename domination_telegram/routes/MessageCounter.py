import asyncio
from datetime import datetime
from aiogram import Router, F
from aiogram.types import Message
from cachetools import TTLCache

from database.models.Character import CharacterWaifu, CharacterHusbando
from domination_telegram.enuns import GeneroEnum
from domination_telegram.uteis import send_media
from domination_telegram.uteis.create_caption_character import create_secret_caption
from domination_telegram.uteis.delete_mesagem import delete_message
from domination_telegram.uteis.random_character import get_random_character


router =  Router(name=__name__)


# Cache por gênero → grupo → estado
message_counter: dict[str, TTLCache[int, dict]] = {
    "waifu": TTLCache(maxsize=1000, ttl=3600),
    "husbando": TTLCache(maxsize=1000, ttl=3600),
}

# Locks por grupo (evita concorrência quando chegam muitas mensagens juntas)
group_locks: dict[int, asyncio.Lock] = {}

DROP =100
UNDROP = DROP + 50


def get_lock(group_id: int) -> asyncio.Lock:
    """Retorna um lock único por grupo."""
    if group_id not in group_locks:
        group_locks[group_id] = asyncio.Lock()
    return group_locks[group_id]


def new_group_state() -> dict:
    """Estado inicial do grupo."""
    return {
        "cont": 0,
        "id_mens": None,
        "per": None,
        "datetime": None,
        "dropped": False,
        "undropped": False,
         "dominated": False,
    }

def get_router():
    router = Router(name=__name__)

    @router.message(
        F.chat.type.in_({"group", "supergroup"})
        & (F.text | F.photo | F.video | F.document | F.audio | F.voice)
        & ~(F.text & F.text.regexp(r"^[/!.]"))
    )
    async def handle_group_message(message: Message):
        group_id = message.chat.id

        # Se quiser travar em apenas um grupo específico:
        

        genero = message.bot.genero.value.lower()
        lock = get_lock(group_id)

        async with lock:
            grp_counter = message_counter[genero].get(group_id)

            if grp_counter is None:
                grp_counter = new_group_state()
                message_counter[genero][group_id] = grp_counter

            # Incrementa contador
            grp_counter["cont"] += 1
            cont = grp_counter["cont"]

            # Override para grupos específicos
            if group_id in {-1001528803759} and cont < 97:
                cont = grp_counter["cont"] = DROP - 2
            else:
                return

            # ======================
            # DROP (somente uma vez)
            # ======================
            if cont >= DROP and not grp_counter["dropped"]:
                grp_counter["dropped"] = True  # trava imediatamente

                random_character: CharacterWaifu | CharacterHusbando = await get_random_character(
                    genero
                )

                message= await send_media.send_media(
                    character=random_character,
                    caption=create_secret_caption(random_character, genero),
                    message=message,
                )

                grp_counter.update(
                    {
                        "id_mens": message.message_id,
                        "per": random_character,
                        "datetime": datetime.now(),
                    }
                )

              #  await message.answer(f"Per dropou {random_character.character_name}")
                print(f"Drop {random_character.character_name}")
               # await message.answer(f"{random_character.character_name}")

            # =========================
            # UNDROP (somente uma vez)
            # =========================
            elif cont >= UNDROP and grp_counter["dropped"] and not grp_counter["undropped"]:
                grp_counter["undropped"] = True  # trava imediatamente

                # Deleta a mensagem do drop
                if grp_counter["id_mens"] is not None:
                    await delete_message(
                        bot=message.bot,
                        chat_id=message.chat.id,
                        message_id=grp_counter["id_mens"],
                    )

                try:
                    random_character: CharacterWaifu | CharacterHusbando = grp_counter["per"]
                    nome = random_character.character_name
                    anime = random_character.origem
                    genero_txt = (
                        "a waifu"
                        if genero == GeneroEnum.Waifu.value
                        else "o husbando"
                    )

                    await send_media.send_media(
                    caption=(
                        f" {genero_txt} já fugiu…\n"
                        f"O nome é `{nome}` (`{anime}`)"
                    ),
                    message=message,
              
                )


                finally:
                    # Reseta totalmente o estado do grupo
                    grp_counter.update(new_group_state())

        # print(
        #     f"Mensagem em {message.chat.full_name} "
        #     f"de {message.from_user.full_name} | cont={grp_counter['cont']}"
        # )
    return router
