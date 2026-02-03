from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery
from aiogram.types import (
    Message,
    CallbackQuery,
    InlineKeyboardMarkup,
    InlineKeyboardButton
)

from domination_telegram import enuns 
def get_router():
    router = Router(name=__name__)

    def get_help_text(bot):
        return "Aᴊᴜᴅᴀ"
    

 
    def get_keyboard():
        return InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="ᴄᴏᴍᴀɴᴅᴏꜱ ᴜꜱᴇʀ",
                        callback_data="help_comandos_user"
                    ),       InlineKeyboardButton(
                        text="ᴄᴏᴍᴀɴᴅᴏꜱ ᴀᴅᴍɪɴ",
                        callback_data="help_comandos_admin"
                    )
                ],
            
                [
                    InlineKeyboardButton(
                        text="ᴠᴏʟᴛᴀʀ",
                        callback_data="main_menu"
                    )
                ]
            ]
        )
    # Comando /help → envia mensagem nova
    @router.message(Command("help"))
    async def help_cmd(message: Message):
        help_text = get_help_text(message.bot)
        reply_markup=get_keyboard()

        await message.answer(help_text,reply_markup=reply_markup)

    @router.callback_query(lambda c: c.data == "help_comandos_user")
    async def help_comandos_user(callback: CallbackQuery):
        lines = ["*📜 Lista de Comandos do Bot*:\n"]
        genero = callback.message.bot.genero
        for cmd, desc in enuns.commands_description.items():
            full_cmd = f"/{genero[0]}{cmd.value}"
            lines.append(f"`{full_cmd}` — {desc}")

        caption= "\n".join(lines)

        reply_markup = InlineKeyboardMarkup(
            inline_keyboard=[

              
                [

                    InlineKeyboardButton(
                        text="ᴠᴏʟᴛᴀʀ",
                      callback_data='help_bot'
                    )
                ]
            
            ]
        )


        await callback.message.edit_caption(caption=caption)
        await callback.message.edit_reply_markup(reply_markup=reply_markup )



    # Botão Help → edita a mensagem
    @router.callback_query(lambda c: c.data == "help_bot")
    async def help_callback(callback: CallbackQuery):
        help_text = get_help_text(callback.bot)
        reply_markup=get_keyboard()

        await callback.message.edit_caption(caption=help_text)
        await callback.message.edit_reply_markup(reply_markup=reply_markup )

        await callback.answer()

    return router
