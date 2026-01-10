from aiogram.utils.keyboard import InlineKeyboardBuilder

def switch_inline_query_chosen_chat(nome_bt: str, query: str):
    kb = InlineKeyboardBuilder()
    kb.button(
        text=nome_bt,
        switch_inline_query_current_chat
        =query
    )
    kb.adjust(2)
    return kb.as_markup()
