import json
from pyrogram import Client, filters
from pyrogram.types import *
from sqlalchemy import select
from DB.models import Usuario
from types_ import COMMAND_LIST_ADMIN, TipoPerfil
from uteis import (
    check_admin_group,
    create_bts_y_or_n,
    dynamic_command_filter,
)
from DB.database import DATABASE
from domination.message import MESSAGE
from domination.plugins.harem import harem


@Client.on_message(
    filters.create(
        name=f"comand{' '.join(COMMAND_LIST_ADMIN.DELETE_PROFILE.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST_ADMIN.DELETE_PROFILE.value,
    )
)
async def delete_profile(client: Client, message: Message):
    if await check_admin_group(client, user_id=message.from_user.id) == False:
        return await message.reply(
            MESSAGE.get_text("pt", "erros", "not_admin_bot"), quote=True
        )

    else:
        id_user = None

        if message.reply_to_message:
            id_user = message.reply_to_message.from_user.id

        else:
            return message.reply(MESSAGE.get_text("pt", "alerts", "reply_to_message"))

        # ----------

        stmt = select(Usuario).where(Usuario.telegram_id == id_user)
        usuario: Usuario = await DATABASE.get_info_one(stmt)

        if not usuario:
            await message.reply_text(
                MESSAGE.get_text("pt", "alerts", "not_profile_adm")
            )
            return

        user_name = (
            usuario.telegram_from_user.get("NAME")
            or usuario.telegram_from_user.get("first_name")
            or "Usuário"
        )

        cap = f"INFOS {user_name}\n\n ID:{usuario.telegram_id}\nIDIOMA:{usuario.idioma_preferido.value}\nSTATUS:{usuario.perfil_status.value if usuario.perfil_status else usuario.perfil_status }\n\nCOLEÇÃO WAIFUS:{len(usuario.colecoes_waifu)}\n FAVORITO:{usuario.fav_w_id}\n{usuario.configs_w.get('modo_harem')} \n\nCOLEÇÃO HUSBANDO:{len(usuario.colecoes_husbando)}\n FAVORITO:{usuario.fav_h_id}\n{usuario.configs_w.get('modo_harem')}"

        ma = create_bts_y_or_n(
            prefix=f"{COMMAND_LIST_ADMIN.DELETE_PROFILE.value}",
            callback_data_true=f"y_{id_user}",
            callback_data_false=f"n_{id_user}",
        )

        await message.reply(text=cap, quote=True, reply_markup=ma)


@Client.on_callback_query(filters.regex(f"^{COMMAND_LIST_ADMIN.DELETE_PROFILE.value}_"))
async def call_add_char(client: Client, query: CallbackQuery):
    _, ation, iddele = query.data.split("_")

    if await check_admin_group(client, user_id=query.message.from_user.id) == False:
        # quem apertou nao fo adm
        return await query.answer(
            text=MESSAGE.get_text("pt", "erros", "not_admin_bot"), show_alert=True
        )


    if ation == "y":

        stmt = select(Usuario).where(Usuario.telegram_id == int(iddele))
        usuario: Usuario = await DATABASE.get_info_one(stmt)

        # Verificar se o perfil a ser deletado é do tipo USUARIO
        if usuario.perfil_status and usuario.perfil_status != TipoPerfil.USUARIO:
            await query.edit_message_text(text="Só posso apagar perfis do tipo USUARIO")
            return

        # Verificar se quem está tentando apagar é admin do grupo
        if not await check_admin_group(client, user_id=query.from_user.id):
            await query.edit_message_text(
                text="Apenas administradores do grupo podem apagar perfis"
            )
            return


        await DATABASE.delete_object(usuario)
        await query.edit_message_text(
            text=f'Perfil do usuário {usuario.telegram_from_user.get("NAME", "Usuário")} foi deletado com sucesso!'
        )
    else:
        try:
            await query.message.delete()
        except Exception as e:
            print(e)
