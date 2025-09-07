from pyrogram import Client, filters
from pyrogram.types import *
from pyrogram.enums import ChatType
from DB.models import PersonagemWaifu, PersonagemHusbando
from sqlalchemy import select, func
from types_ import TipoCategoria
from types_ import TipoMidia, COMMAND_LIST
from domination.uteis import PREXIFOS, send_media_by_type
from domination.plugins.lang_utils import obter_mensagem_chat


# @Client.on_message(filters.command("w") & filters.private)
@Client.on_message(filters.private & filters.command(COMMAND_LIST.START.value))
@Client.on_callback_query(filters.regex(r"welcome"))
async def welcome(client: object, message: Message | CallbackQuery):
    if isinstance(message, Message) and message.chat.type != ChatType.PRIVATE:
        return

    try:
        response_text = await obter_mensagem_chat(
            client,
            message.chat.id,
            "welcome",
            "init_text",
            bot_name=client.me.first_name,
            genero=client.genero.value.capitalize(),
        )
        buttons = await obter_mensagem_chat(
            client, message.chat.id, "welcome", "buttons"
        )
        keyboard = InlineKeyboardMarkup(
            [
                [
                    InlineKeyboardButton(
                        buttons["add"],
                        url=f"https://t.me/{client.me.username}?startgroup=true",
                    )
                ],
                [InlineKeyboardButton(buttons["support"], url=client.group_main)],
                [
                    InlineKeyboardButton(buttons["help"], callback_data="help_bot"),
                    InlineKeyboardButton(buttons["update"], callback_data="update"),
                ],
            ]
        )

        if type(message) is CallbackQuery:
            return await message.edit_message_caption(
                caption=response_text, reply_markup=keyboard
            )
        loading_ms: Message = await message.reply_text(
            await obter_mensagem_chat(client, message.chat.id, "general", "loading")
        )

        # Obter uma sessão reutilizável
        session = await client.get_reusable_session()

        if client.genero == TipoCategoria.HUSBANDO:
            result = await session.execute(
                select(PersonagemHusbando).order_by(func.random()).limit(1)
            )
        else:
            result = await session.execute(
                select(PersonagemWaifu).order_by(func.random()).limit(1)
            )

        personagem = result.scalars().first()

        await loading_ms.delete()

        if personagem and personagem.tipo_midia in [
            TipoMidia.IMAGEM_FILEID,
            TipoMidia.IMAGEM_URL,
        ]:
            # await message.reply_photo(
            #     photo=personagem.data,
            #     caption=response_text,
            #     reply_markup=keyboard,
            # )
            await send_media_by_type(
                client=client,
                message=message,
                personagem=personagem,
                caption=response_text,
                reply_markup=keyboard,
            )
        else:
            await message.reply_text(
                response_text, reply_markup=keyboard, parse_mode="HTML"
            )

    except Exception as e:
        print(f"Erro no comando : {e}")
        await message.reply_text(
            await obter_mensagem_chat(
                client, message.chat.id, "erros", "error_command_welcome"
            )
        )


@Client.on_callback_query(filters.regex(r"help_bot"))
async def help_bot(client: Client, callback_query: CallbackQuery):

    help_text = await obter_mensagem_chat(
        client,
        callback_query.message.chat.id,
        "help_bot",
        "help_bot",
        prefixo=", ".join(PREXIFOS),
    )

    reply_markup = InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton(
                    await obter_mensagem_chat(
                        client,
                        callback_query.message.chat.id,
                        "commands",
                        "user_commands_button",
                    ),
                    callback_data="commadsUser",
                ),
                # InlineKeyboardButton("Comandos Adm", callback_data="help_bot_commadsAdm"),
            ],
            [
                InlineKeyboardButton(
                    await obter_mensagem_chat(
                        client,
                        callback_query.message.chat.id,
                        "commands",
                        "back_button",
                    ),
                    callback_data="welcome",
                )
            ],
        ]
    )
    await callback_query.edit_message_caption(
        caption=help_text, reply_markup=reply_markup
    )


@Client.on_callback_query(filters.regex(r"commadsUser"))
async def help_bot_commadsUser(client: Client, callback_query: CallbackQuery):
    linhas = [
        await obter_mensagem_chat(
            client, callback_query.message.chat.id, "commands", "user_commands"
        ),
        await obter_mensagem_chat(
            client, callback_query.message.chat.id, "commands", "commands_header"
        ),
    ]

    for cmd in COMMAND_LIST:
        if cmd in [COMMAND_LIST.START]:
            continue
        linhas.append(
            await obter_mensagem_chat(
                client,
                callback_query.message.chat.id,
                "commands",
                "command_line",
                prefixo=client.genero.value[0].lower(),
                command=cmd.value,
                description=await obter_mensagem_chat(
                    client, callback_query.message.chat.id, "commads", cmd.value
                ),
            )
        )

    linhas.append(
        await obter_mensagem_chat(
            client, callback_query.message.chat.id, "commands", "commands_footer"
        )
    )

    reply_markup = InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton(
                    await obter_mensagem_chat(
                        client,
                        callback_query.message.chat.id,
                        "commands",
                        "back_button",
                    ),
                    callback_data="help_bot",
                )
            ]
        ]
    )

    await callback_query.edit_message_caption(
        caption="\n".join(linhas), reply_markup=reply_markup
    )
