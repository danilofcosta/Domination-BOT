# from pyrogram import Client, filters
# from pyrogram.types import *
# from sqlalchemy import select, func, desc
# from DB.database import AsyncSessionLocal
# from DB.models import PersonagemHusbando, PersonagemWaifu
# from teste import create_prelist
# from types_ import COMMAND_LIST_DB, TipoCategoria, TipoEvento, TipoRaridade
# from uteis import create_on_bt, dynamic_command_filter, check_admin_group, re_linhas,send_media_by_type,format_personagem_caption


# @Client.on_message(
#     filters.create(
#         name=f"comand{' '.join(COMMAND_LIST_DB.EDITCHAR.value)}",
#         func=dynamic_command_filter,
#         command=COMMAND_LIST_DB.EDITCHAR.value,
#     )
# )
# @Client.on_message(filters.command(COMMAND_LIST_DB.EDITCHAR.value) & filters.private)
# async def editchar_command(client: Client, message: Message):
#     if not await check_admin_group(client, message.from_user.id):
#         return
#     base_per: PersonagemHusbando | PersonagemWaifu = (
#         PersonagemHusbando
#         if client.genero == TipoCategoria.HUSBANDO
#         else PersonagemWaifu
#     )
    
#     if message.command and len(message.command) >= 2:
#         char_id = message.command[1]
#         async with AsyncSessionLocal() as session:
#             result = await session.execute(
#                 select(base_per).where(base_per.id == int(char_id))
#             )
#             personagem = result.scalars().first()
#             if not personagem:
#                 await message.reply_text("❌ Personagem não encontrado.")
#                 return
#             else:
#                 k=[[
#                     create_on_bt(
#                         "✏️ Editar Nome",
#                         f"editchar_nome_{char_id}"
#                     ),
#                 ], [
#                     create_on_bt(
#                         "✏️ Editar Anime",
#                         f"editchar_anime_{char_id}"
#                     ),
#                 ], [
#                     create_on_bt(
#                         "✏️ Editar Raridade",
#                         f"editchar_raridade_{char_id}"
#                     ),
#                     create_on_bt(
#                         "✏️ Editar Evento",
#                         f"editchar_evento_{char_id}"
#                     ),
#                 ], [
#                     create_on_bt(
#                         "🗑️ Deletar Personagem",
#                         f"delchar_deletar_{char_id}"
#                     ),create_on_bt(
#                         "Salvar E Sair",
#                         f"savechar_deletar_{char_id}"
#                     ),
#                 ]]

#                 await send_media_by_type(
#                     client,
#                     message,
#                     personagem,
#                     caption=f"✏️ Editando personagem ID {char_id}.\n{format_personagem_caption(personagem)}",
#                     reply_markup=InlineKeyboardMarkup(k)
#                 )

#     else:
#         await message.reply_text("❌ Uso correto: /editchar <ID do Personagem>")


# @Client.on_callback_query(filters.regex(r"^editchar_"))
# async def editchar_callback(client: Client, callback_query: CallbackQuery):
#     if not await check_admin_group(client, callback_query.from_user.id):
#         return
#     base_per: PersonagemHusbando | PersonagemWaifu = (
#         PersonagemHusbando
#         if client.genero == TipoCategoria.HUSBANDO
#         else PersonagemWaifu
#     )
#     _,action, char_id = callback_query.data.split('_')


#     if action == "nome":
#         await callback_query.message.edit(
#             f"✏️ Envie o novo nome para o personagem ID {char_id} ou /cancel para cancelar.",
#             reply_markup=InlineKeyboardMarkup(
#                 [[create_on_bt("❌ Cancelar", "editchar_cancelar")]]
#             ),
#         )
#         # Configurar operação de edição em memória
#         if not hasattr(client, 'editchar_operations'):
#             client.editchar_operations = {}
#         client.editchar_operations[callback_query.from_user.id] = {
#             'char_id': char_id,
#             'action': 'nome',
#             'base_per': base_per
#         }
#     elif action == "anime":
#         await callback_query.message.edit(
#             f"✏️ Envie o novo nome do anime para o personagem ID {char_id} ou /cancel para cancelar.",
#             reply_markup=InlineKeyboardMarkup(
#                 [[create_on_bt("❌ Cancelar", "editchar_cancelar")]]
#             ),
#         )
#         # Configurar operação de edição em memória
#         if not hasattr(client, 'editchar_operations'):
#             client.editchar_operations = {}
#         client.editchar_operations[callback_query.from_user.id] = {
#             'char_id': char_id,
#             'action': 'anime',
#             'base_per': base_per
#         }
#     elif action == "raridade":
#         buttons = [
#             create_on_bt(
#                 raridade.name,  # texto visível no botão
#                 f"editchar_raridade_{char_id}_{raridade.name}"
#             )
#             for raridade in create_prelist(TipoRaridade, "r").values()
#         ]
#         tx=f"✏️ Selecione a nova raridade para o personagem ID {char_id} ou /cancel para cancelar."
#         # Dividir os botões em linhas de 3
#         buttons = re_linhas(buttons)
#         await callback_query.message.edit(
#             tx,
#             reply_markup=InlineKeyboardMarkup(buttons + [[create_on_bt("❌ Cancelar", "editchar_cancelar")]]),
#         )
#     elif action == "evento":
#         buttons = [
#             create_on_bt(
#                 evento.name,  # texto visível no botão
#                 f"editchar_evento_{char_id}_{evento.name}"
#             )
#             for evento in create_prelist(TipoEvento, "e").values()
#         ]
#         tx=f"✏️ Selecione o novo evento para o personagem ID {char_id} ou /cancel para cancelar."
#         # Dividir os botões em linhas de 3
#         buttons = re_linhas(buttons)
#         await callback_query.message.edit(
#             tx,
#             reply_markup=InlineKeyboardMarkup(buttons + [[create_on_bt("❌ Cancelar", "editchar_cancelar")]]),
#         )


# @Client.on_callback_query(filters.regex(r"^editchar_raridade_"))
# async def editchar_raridade_callback(client: Client, callback_query: CallbackQuery):
#     if not await check_admin_group(client, callback_query.from_user.id):
#         return
    
#     base_per: PersonagemHusbando | PersonagemWaifu = (
#         PersonagemHusbando
#         if client.genero == TipoCategoria.HUSBANDO
#         else PersonagemWaifu
#     )
    
#     _, action, char_id, raridade_name = callback_query.data.split('_')
    
#     try:
#         # Converter o nome da raridade para o enum
#         raridade_enum = TipoRaridade[raridade_name]
        
#         async with AsyncSessionLocal() as session:
#             # Buscar o personagem
#             result = await session.execute(
#                 select(base_per).where(base_per.id == char_id)
#             )
#             personagem = result.scalars().first()
            
#             if not personagem:
#                 await callback_query.answer("❌ Personagem não encontrado.", show_alert=True)
#                 return
            
#             # Atualizar a raridade
#             personagem.raridade = raridade_enum
#             await session.commit()
            
#             await callback_query.answer(f"✅ Raridade alterada para {raridade_name}!")
            
#             # Atualizar a mensagem com as informações do personagem
#             k = [[
#                 create_on_bt(
#                     "✏️ Editar Nome",
#                     f"editchar_nome_{char_id}"
#                 ),
#             ], [
#                 create_on_bt(
#                     "✏️ Editar Anime",
#                     f"editchar_anime_{char_id}"
#                 ),
#             ], [
#                 create_on_bt(
#                     "✏️ Editar Raridade",
#                     f"editchar_raridade_{char_id}"
#                 ),
#                 create_on_bt(
#                     "✏️ Editar Evento",
#                     f"editchar_evento_{char_id}"
#                 ),
#             ], [
#                 create_on_bt(
#                     "🗑️ Deletar Personagem",
#                     f"delchar_deletar_{char_id}"
#                 ),
#                 create_on_bt(
#                     "Salvar E Sair",
#                     f"savechar_deletar_{char_id}"
#                 ),
#             ]]
            
#             await send_media_by_type(
#                 client,
#                 callback_query.message.chat.id,
#                 personagem,
#                 caption=f"✏️ Editando personagem ID {char_id}.\n{format_personagem_caption(personagem)}",
#                 reply_markup=k
#             )
            
#     except Exception as e:
#         await callback_query.answer(f"❌ Erro ao alterar raridade: {str(e)}", show_alert=True)


# @Client.on_callback_query(filters.regex(r"^editchar_evento_"))
# async def editchar_evento_callback(client: Client, callback_query: CallbackQuery):
#     if not await check_admin_group(client, callback_query.from_user.id):
#         return
    
#     base_per: PersonagemHusbando | PersonagemWaifu = (
#         PersonagemHusbando
#         if client.genero == TipoCategoria.HUSBANDO
#         else PersonagemWaifu
#     )
    
#     _, action, char_id, evento_name = callback_query.data.split('_')
    
#     try:
#         # Converter o nome do evento para o enum
#         evento_enum = TipoEvento[evento_name]
        
#         async with AsyncSessionLocal() as session:
#             # Buscar o personagem
#             result = await session.execute(
#                 select(base_per).where(base_per.id == char_id)
#             )
#             personagem = result.scalars().first()
            
#             if not personagem:
#                 await callback_query.answer("❌ Personagem não encontrado.", show_alert=True)
#                 return
            
#             # Atualizar o evento
#             personagem.evento = evento_enum
#             await session.commit()
            
#             await callback_query.answer(f"✅ Evento alterado para {evento_name}!")
            
#             # Atualizar a mensagem com as informações do personagem
#             k = [[
#                 create_on_bt(
#                     "✏️ Editar Nome",
#                     f"editchar_nome_{char_id}"
#                 ),
#             ], [
#                 create_on_bt(
#                     "✏️ Editar Anime",
#                     f"editchar_anime_{char_id}"
#                 ),
#             ], [
#                 create_on_bt(
#                     "✏️ Editar Raridade",
#                     f"editchar_raridade_{char_id}"
#                 ),
#                 create_on_bt(
#                     "✏️ Editar Evento",
#                     f"editchar_evento_{char_id}"
#                 ),
#             ], [
#                 create_on_bt(
#                     "🗑️ Deletar Personagem",
#                     f"delchar_deletar_{char_id}"
#                 ),
#                 create_on_bt(
#                     "Salvar E Sair",
#                     f"savechar_deletar_{char_id}"
#                 ),
#             ]]
            
#             await send_media_by_type(
#                 client,
#                 callback_query.message.chat.id,
#                 personagem,
#                 caption=f"✏️ Editando personagem ID {char_id}.\n{format_personagem_caption(personagem)}",
#                 reply_markup=k
#             )
            
#     except Exception as e:
#         await callback_query.answer(f"❌ Erro ao alterar evento: {str(e)}", show_alert=True)


# @Client.on_message(filters.text)
# async def editchar_response_handler(client: Client, message: Message):
#     """Handler para respostas de edição de nome e anime"""
#     if not await check_admin_group(client, message.from_user.id):
#         return
    
#     # Ignorar comandos (mensagens que começam com /)
#     if message.text and message.text.startswith('/'):
#         return
    
#     # Verificar se há uma operação de edição em andamento
#     if not hasattr(client, 'editchar_operations'):
#         client.editchar_operations = {}
    
#     user_id = message.from_user.id
#     if user_id not in client.editchar_operations:
#         return
    
#     operation = client.editchar_operations[user_id]
#     char_id = operation.get('char_id')
#     action = operation.get('action')
#     base_per = operation.get('base_per')
    
#     if not char_id or not action or not base_per:
#         return
    
#     try:
#         async with AsyncSessionLocal() as session:
#             # Buscar o personagem
#             result = await session.execute(
#                 select(base_per).where(base_per.id == char_id)
#             )
#             personagem = result.scalars().first()
            
#             if not personagem:
#                 await message.reply_text("❌ Personagem não encontrado.")
#                 return
            
#             # Atualizar o campo apropriado
#             if action == "nome":
#                 personagem.nome_personagem = message.text.strip()
#                 await session.commit()
#                 await message.reply_text(f"✅ Nome alterado para: {message.text.strip()}")
                
#             elif action == "anime":
#                 personagem.nome_anime = message.text.strip()
#                 await session.commit()
#                 await message.reply_text(f"✅ Anime alterado para: {message.text.strip()}")
            
#             # Remover a operação da memória
#             del client.editchar_operations[user_id]
            
#             # Mostrar o menu de edição atualizado
#             k = [[
#                 create_on_bt(
#                     "✏️ Editar Nome",
#                     f"editchar_nome_{char_id}"
#                 ),
#             ], [
#                 create_on_bt(
#                     "✏️ Editar Anime",
#                     f"editchar_anime_{char_id}"
#                 ),
#             ], [
#                 create_on_bt(
#                     "✏️ Editar Raridade",
#                     f"editchar_raridade_{char_id}"
#                 ),
#                 create_on_bt(
#                     "✏️ Editar Evento",
#                     f"editchar_evento_{char_id}"
#                 ),
#             ], [
#                 create_on_bt(
#                     "🗑️ Deletar Personagem",
#                     f"delchar_deletar_{char_id}"
#                 ),
#                 create_on_bt(
#                     "Salvar E Sair",
#                     f"savechar_deletar_{char_id}"
#                 ),
#             ]]
            
#             await send_media_by_type(
#                 client,
#                 message.chat.id,
#                 personagem,
#                 caption=f"✏️ Editando personagem ID {char_id}.\n{format_personagem_caption(personagem)}",
#                 reply_markup=k
#             )
            
#     except Exception as e:
#         await message.reply_text(f"❌ Erro ao alterar {action}: {str(e)}")
#         # Remover a operação da memória em caso de erro
#         if user_id in client.editchar_operations:
#             del client.editchar_operations[user_id]


# @Client.on_callback_query(filters.regex(r"^editchar_cancelar$"))
# async def editchar_cancel_callback(client: Client, callback_query: CallbackQuery):
#     """Handler para cancelar operações de edição"""
#     if not await check_admin_group(client, callback_query.from_user.id):
#         return
    
#     user_id = callback_query.from_user.id
#     if hasattr(client, 'editchar_operations') and user_id in client.editchar_operations:
#         del client.editchar_operations[user_id]
    
#     await callback_query.answer("❌ Operação cancelada.")
#     await callback_query.message.edit_text("❌ Operação de edição cancelada.")


# @Client.on_callback_query(filters.regex(r"^delchar_deletar_"))
# async def delchar_callback(client: Client, callback_query: CallbackQuery):
#     """Handler para deletar personagem"""
#     if not await check_admin_group(client, callback_query.from_user.id):
#         return
    
#     base_per: PersonagemHusbando | PersonagemWaifu = (
#         PersonagemHusbando
#         if client.genero == TipoCategoria.HUSBANDO
#         else PersonagemWaifu
#     )
    
#     _, action, char_id = callback_query.data.split('_')
    
#     try:
#         async with AsyncSessionLocal() as session:
#             # Buscar o personagem
#             result = await session.execute(
#                 select(base_per).where(base_per.id == char_id)
#             )
#             personagem = result.scalars().first()
            
#             if not personagem:
#                 await callback_query.answer("❌ Personagem não encontrado.", show_alert=True)
#                 return
            
#             # Deletar o personagem
#             await session.delete(personagem)
#             await session.commit()
            
#             await callback_query.answer("✅ Personagem deletado com sucesso!")
#             await callback_query.message.edit_text(f"✅ Personagem ID {char_id} foi deletado com sucesso!")
            
#     except Exception as e:
#         await callback_query.answer(f"❌ Erro ao deletar personagem: {str(e)}", show_alert=True)


# @Client.on_callback_query(filters.regex(r"^savechar_deletar_"))
# async def savechar_callback(client: Client, callback_query: CallbackQuery):
#     """Handler para salvar e sair"""
#     if not await check_admin_group(client, callback_query.from_user.id):
#         return
    
#     await callback_query.answer("✅ Alterações salvas com sucesso!")
#     await callback_query.message.edit_text("✅ Edição finalizada com sucesso!")