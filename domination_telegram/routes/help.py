from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery

def get_router():
    router = Router(name=__name__)

    def get_help_text(bot):
        return "ajuda do bot aqui"

    # Comando /help → envia mensagem nova
    @router.message(Command("help"))
    async def help_cmd(message: Message):
        help_text = get_help_text(message.bot)
        await message.answer(help_text)

    # Botão Help → edita a mensagem
    @router.callback_query(lambda c: c.data == "help_bot")
    async def help_callback(callback: CallbackQuery):
        help_text = get_help_text(callback.bot)
        await callback.message.edit_caption(caption=help_text)
        await callback.answer()

    return router
