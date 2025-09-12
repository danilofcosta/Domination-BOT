from pyrogram import Client, filters
from pyrogram.types import *
from pyrogram.enums import ChatType
from DB.models import PersonagemWaifu, PersonagemHusbando
from sqlalchemy import select, func
from types_ import TipoCategoria
from types_ import TipoMidia, COMMAND_LIST
from uteis import PREXIFOS, send_media_by_type
from domination.logger import log_info, log_error, log_debug
from domination.message import MESSAGE
from DB.database import DATABASE

# @Client.on_message(filters.command("w") & filters.private)
@Client.on_message(filters.private & filters.command(COMMAND_LIST.START.value))
@Client.on_callback_query(filters.regex(r"welcome"))
async def welcome(client: object, message: Message | CallbackQuery):
    if isinstance(message, Message) and message.chat.type != ChatType.PRIVATE:
        return

    try:
        response_text = MESSAGE.get_text(
            "pt",
            "welcome",
            "init_text",
            bot_name=client.me.first_name,
            genero=client.genero.value.capitalize(),
        )


        buttons = MESSAGE.get_text("pt", "welcome", "buttons")
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
             MESSAGE.get_text("pt", "general", "loading")
        )

        # Obter uma sessão reutilizável
     

        if client.genero == TipoCategoria.HUSBANDO:
            result = select(PersonagemHusbando).order_by(func.random()).limit(1)

        else:
            result = select(PersonagemWaifu).order_by(func.random()).limit(1)


        personagem = await DATABASE.get_info_one(
          result
        )

        await loading_ms.delete()

        if personagem and personagem.tipo_midia in [
            TipoMidia.IMAGEM_FILEID,
            TipoMidia.IMAGEM_URL,
        ]:
       
            await send_media_by_type(
               
                message=message,
                personagem=personagem,
                caption=response_text,
                reply_markup=keyboard,
            )
        else:
            await message.reply_text(
                response_text,
                reply_markup=keyboard,
            )

    except Exception as e:
        log_error(f"Erro no comando welcome: {e}", "welcome", exc_info=True)
        await message.reply_text(

            MESSAGE.get_text("pt", "erros", "error_command_welcome")
        )


@Client.on_callback_query(filters.regex(r"help_bot"))
async def help_bot(client: Client, callback_query: CallbackQuery):


    help_text = MESSAGE.get_text(
        "pt",
        "help_bot",
        "help_bot",
        prefixo=", ".join(PREXIFOS),
    )

    reply_markup = InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton(
       
                    MESSAGE.get_text("pt", "commands", "user_commands_button"),
                    callback_data="commadsUser",
                ),
                # InlineKeyboardButton("Comandos Adm", callback_data="help_bot_commadsAdm"),
            ],
            [
                InlineKeyboardButton(
                  
MESSAGE.get_text("pt", "commands", "back_button"),
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
        MESSAGE.get_text(
            "pt", "commands", "commands_header"
        ),
        MESSAGE.get_text(
            "pt", "commands", "user_commands"
        ),
        MESSAGE.get_text(
            "pt", "commands", "commands_footer"
        ),
    ]

    for cmd in COMMAND_LIST:
        if cmd in [COMMAND_LIST.START]:
            continue
        
        linhas.append(MESSAGE.get_text(
            "pt","commands", "command_line",
            prefixo=client.genero.value[0].lower(),
            command=cmd.value,
            description=MESSAGE.get_text("pt", "commads", cmd.value),
        ))





    linhas.append(
    
        MESSAGE.get_text("pt", "commands", "commands_footer")
    )

    reply_markup = InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton(


                  MESSAGE.get_text("pt", "commands", "back_button"),
                    callback_data="help_bot",
                )
            ]
        ]
    )

    await callback_query.edit_message_caption(
        caption="\n".join(linhas), reply_markup=reply_markup
    )
