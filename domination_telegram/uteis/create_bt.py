from aiogram.utils.keyboard import InlineKeyboardBuilder

def switch_inline_query_chosen_chat(nome_bt: str, query: str,
                                    ):
    kb = InlineKeyboardBuilder()
    kb.button(
        text=nome_bt,
        switch_inline_query_current_chat
        =query
    )
    kb.adjust(2)
    return kb.as_markup()

def bt_url(nome_bt: str, url: str):
    kb = InlineKeyboardBuilder()
    kb.button(
        text=nome_bt,
      url=url
    )
    kb.adjust(2)
    return kb.as_markup()

def true_or_false(callback_data_true: str, callback_data_false:str,emoji_true='✅', emoji_false='✖️'):
    kb = InlineKeyboardBuilder()
    kb.button(
        callback_data=callback_data_true,
        text=f'{emoji_true} Sim',   


    )
    kb.button(
        callback_data=callback_data_false,
        text=f'{emoji_false} Não',
    )

    kb.adjust(2)
    return kb.as_markup()