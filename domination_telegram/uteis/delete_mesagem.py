async def delete_message(bot, chat_id, message_id):
    try:
        await bot.delete_message(chat_id=chat_id,
                                 message_id=message_id)
    except Exception as e:
        print(e)
    