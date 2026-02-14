from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message
import asyncio

from sqlalchemy import select

from database.models.Colecao import WaifuCollection, HusbandoCollection
from database.models.user import User
from database.models.Character import CharacterHusbando, CharacterWaifu
from database.session import AsyncSessionLocal
from domination_telegram.enuns import GeneroEnum
from domination_telegram.routes.MessageCounter import message_counter
from domination_telegram.routes.MessageCounter import group_locks
from domination_telegram.uteis import send_media, metion_user
from domination_telegram.uteis.create_bt import bt_url, switch_inline_query_chosen_chat
from domination_telegram.uteis.create_caption_character import create_caption_check_true_character


def get_lock(group_id: int) -> asyncio.Lock:
    if group_id not in group_locks:
        group_locks[group_id] = asyncio.Lock()
    return group_locks[group_id]


async def add_character_to_user_collection(user_id: int, character, message: Message, genero):
    telegram_from_user_dict = {
        "id": message.from_user.id,
        "first_name": message.from_user.first_name,
        "last_name": message.from_user.last_name,
        "username": message.from_user.username,
        "is_bot": message.from_user.is_bot,
        "is_premium": message.from_user.is_premium,
    }

    fav_id = character.id

    # Escolhe a coleção correta
    CollectionModel = (
        WaifuCollection if genero == GeneroEnum.Waifu.value else HusbandoCollection
    )

    async with AsyncSessionLocal() as session:
        async with session.begin():

            # 1. Verifica se o usuário já existe
            result = await session.execute(
                select(User).where(User.telegram_id == user_id)
            )
            user: User | None = result.scalar_one_or_none()

            # 2. Se não existir, cria
            if not user:
                user = User(
                    telegram_id=user_id,
                    telegram_user_data=telegram_from_user_dict,
                    favorite_waifu_id=fav_id if genero == GeneroEnum.Waifu.value else None,
                    favorite_husbando_id=fav_id if genero == GeneroEnum.Husbando.value else None,
                )
                session.add(user)
                await session.flush()  # garante que o user.id exista

            if user:
                user.favorite_husbando_id = (
                    fav_id if genero == GeneroEnum.Husbando.value and user.favorite_husbando_id is None else user.favorite_husbando_id
                )
                user.favorite_waifu_id = (
                    fav_id if genero == GeneroEnum.Waifu.value and user.favorite_waifu_id is None else user.favorite_waifu_id
                )
                session.add(user)
            new_entry = CollectionModel(
                telegram_id=user.telegram_id,
                character_id=fav_id
            )
            session.add(new_entry)


def get_router():
    router = Router(name=__name__)

    @router.message(
        Command("dominar"),
        F.chat.type.in_({"group", "supergroup"})
    )
    async def dominar_cmd(message: Message):
        group_id = message.chat.id
        genero = message.bot.genero.name.lower()
        lock = get_lock(group_id)

        async with lock:
            grp_counter = message_counter[genero].get(group_id)

            if not grp_counter:
                return
                # await message.reply(
                
                #     "Nenhuma personagem disponível para dominar no momento. "
                #     "Espere até que uma apareça!"
                # )
                # return

            character = grp_counter.get("per")

            if not character:
                await message.reply(
                    "Nenhuma personagem disponível para dominar no momento. "
                    "Espere até que uma apareça!"
                )
                return

            # Se já foi dominada, ninguém mais pode ganhar
            if grp_counter.get("dominated"):
                await message.reply("Essa personagem já foi dominada por outra pessoa!")
                return

            characterName_user = (
                message.text.split(" ", 1)[1]
                if len(message.text.split(" ", 1)) > 1
                else None
            )

            if characterName_user is None:
                await message.reply("Você precisa informar o nome da personagem para dominar.")
                return

            user_guess = characterName_user.lower()

            valid_names = [
                character.character_name.lower(),
                *[a.lower() for a in character.character_name.lower().split(" ")]]

            # Acertou
            if user_guess in valid_names:
                # Trava imediatamente para impedir concorrência
                grp_counter["dominated"] = True

                # Aqui você pode salvar no banco com segurança
                await add_character_to_user_collection(message.from_user.id, character, message, genero)

                character: CharacterHusbando | CharacterWaifu = grp_counter.get(
                    "per")

                await send_media.send_media(
                    caption=create_caption_check_true_character(
                        character=character, message=message, genero=genero, start_time=grp_counter.get(
                            'datetime')
                    ),
                    character=character,
                    bot=message.bot,
                    chat_id=message.chat.id,
                    reply_markup=switch_inline_query_chosen_chat(
                        "Harem", f"User_harem_{message.from_user.id}")
                )
                # Reset geral
                grp_counter.update(
                    {
                        "cont": 0,
                        "id_mens": None,
                        "per": None,
                        "datetime": None,
                        "dropped": False,
                        "undropped": False,
                        "dominated": False,
                    }
                )
            else:
                Idchat =str( message.chat.id).replace('-100','')
                id_msg = grp_counter.get('id_mens')
                url = f'https://t.me/c/{Idchat}/{id_msg}'  # Idchat sem -100
                await message.reply(" ❌ Esse nome não corresponde à personagem atual.", reply_markup=bt_url('↗️', url))

    return router
