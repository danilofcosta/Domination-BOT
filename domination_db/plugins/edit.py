# from pyrogram import Client, filters
# from pyrogram.types import *
# from sqlalchemy import select, func, desc
# from DB.database import DATABASE
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
#     Verificar se é admin do grupo específico

#     if await check_admin_group(client,chat_id=-1001659176163 ,user_id= message.from_user.id)==False:
#         await message.reply("❌ Comando disponível apenas para administradores do grupo.", quote=True)
#         return
    
#     base_per: PersonagemHusbando | PersonagemWaifu = (
#         PersonagemHusbando
#         if client.genero == TipoCategoria.HUSBANDO
#         else PersonagemWaifu
#     )
    
#     if message.command and len(message.command) >= 2:
#         char_id = message.command[1]
#         stmt = select(base_per).where(base_per.id == int(char_id))
#         personagem = await DATABASE.get_info_one(stmt)
#         if not personagem:
#             await message.reply_text("❌ Personagem não encontrado.")
#             return
#         else:
#             Armazenar personagem em cache para edição
#             if not hasattr(client, 'editchar_cache'):
#                 client.editchar_cache = {}
#             client.editchar_cache[message.from_user.id] = personagem
            
#             Criar caption com informações do personagem
#             caption = f"""📝 **Editando Personagem ID {char_id}**

# **Nome:** {personagem.nome_personagem}
# **Anime:** {personagem.nome_anime}
# **Evento:** {personagem.evento.value if personagem.evento else 'Nenhum'}
# **Raridade:** {personagem.raridade.value if personagem.raridade else 'Nenhuma'}
# **Data:** {personagem.data}"""
            
#             k=[[
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
#                     "💾 Salvar Alterações",
#                     f"editchar_save_{char_id}"
#                 ),
#             ], [
#                 create_on_bt(
#                     "🗑️ Deletar Personagem",
#                     f"delchar_deletar_{char_id}"
#                 ),
#             ]]

#             await send_media_by_type(
#                 client,
#                 message,
#                 personagem,
#                 caption=caption,
#                 reply_markup=InlineKeyboardMarkup(k)
#             )

#     else:
#         await message.reply_text("❌ Uso correto: /editchar <ID do Personagem>")


# @Client.on_callback_query(filters.regex(r"^editchar_"))
# async def editchar_callback(client: Client, callback_query: CallbackQuery):
#     if not await check_admin_group(client, callback_query.from_user.id, -1001659176163):
#         await callback_query.answer("❌ Apenas administradores podem usar este comando.", show_alert=True)
#         return
    
#     base_per: PersonagemHusbando | PersonagemWaifu = (
#         PersonagemHusbando
#         if client.genero == TipoCategoria.HUSBANDO
#         else PersonagemWaifu
#     )
#     parts = callback_query.data.split('_')
#     action = parts[1]
#     char_id = parts[2]

#     if action == "nome":
#         await callback_query.message.edit(
#             f"✏️ **Editando Nome**\n\nAgora mande o novo nome para o personagem ID {char_id} ou /cancel para cancelar.",
#             reply_markup=InlineKeyboardMarkup(
#                 [[create_on_bt("❌ Cancelar", "editchar_cancelar")]]
#             ),
#         )
#         Configurar operação de edição em memória
#         if not hasattr(client, 'editchar_operations'):
#             client.editchar_operations = {}
#         client.editchar_operations[callback_query.from_user.id] = {
#             'char_id': char_id,
#             'action': 'nome',
#             'base_per': base_per
#         }
#     elif action == "anime":
#         await callback_query.message.edit(
#             f"✏️ **Editando Anime**\n\nAgora mande o novo nome do anime para o personagem ID {char_id} ou /cancel para cancelar.",
#             reply_markup=InlineKeyboardMarkup(
#                 [[create_on_bt("❌ Cancelar", "editchar_cancelar")]]
#             ),
#         )
#         Configurar operação de edição em memória
#         if not hasattr(client, 'editchar_operations'):
#             client.editchar_operations = {}
#         client.editchar_operations[callback_query.from_user.id] = {
#             'char_id': char_id,
#             'action': 'anime',
#             'base_per': base_per
#         }
#     elif action == "raridade":
#         Criar botões com raridades usando create_prelist
#         prelist_raridade = create_prelist(TipoRaridade, "r")
#         buttons = []
#         for key, raridade in prelist_raridade.items():
#             buttons.append(create_on_bt(
#                 f"{raridade.value} [{key}]",  # Mostra valor e chave
#                 f"editchar_raridade_{char_id}_{key}"
#             ))
        
#         tx = f"✏️ **Editando Raridade**\n\nSelecione a nova raridade para o personagem ID {char_id}:"
#         Dividir os botões em linhas de 3
#         buttons = re_linhas(buttons)
#         await callback_query.message.edit(
#             tx,
#             reply_markup=InlineKeyboardMarkup(buttons + [[create_on_bt("❌ Cancelar", "editchar_cancelar")]]),
#         )
#     elif action == "evento":
#         Criar botões com eventos usando create_prelist
#         prelist_evento = create_prelist(TipoEvento, "e")
#         buttons = []
#         for key, evento in prelist_evento.items():
#             buttons.append(create_on_bt(
#                 f"{evento.value} [{key}]",  # Mostra valor e chave
#                 f"editchar_evento_{char_id}_{key}"
#             ))
        
#         tx = f"✏️ **Editando Evento**\n\nSelecione o novo evento para o personagem ID {char_id}:"
#         Dividir os botões em linhas de 3
#         buttons = re_linhas(buttons)
#         await callback_query.message.edit(
#             tx,
#             reply_markup=InlineKeyboardMarkup(buttons + [[create_on_bt("❌ Cancelar", "editchar_cancelar")]]),
#         )
#     elif action == "save":
#         Salvar alterações no banco
#         if hasattr(client, 'editchar_cache') and callback_query.from_user.id in client.editchar_cache:
#             personagem = client.editchar_cache[callback_query.from_user.id]
#             try:
#                 await DATABASE.add_object(personagem)
#                 await callback_query.answer("✅ Alterações salvas com sucesso!")
                
#                 Atualizar a mensagem com as informações atuais
#                 caption = f"""📝 **Editando Personagem ID {char_id}**

# **Nome:** {personagem.nome_personagem}
# **Anime:** {personagem.nome_anime}
# **Evento:** {personagem.evento.value if personagem.evento else 'Nenhum'}
# **Raridade:** {personagem.raridade.value if personagem.raridade else 'Nenhuma'}
# **Data:** {personagem.data}"""
                
#                 k=[[
#                     create_on_bt("✏️ Editar Nome", f"editchar_nome_{char_id}"),
#                 ], [
#                     create_on_bt("✏️ Editar Anime", f"editchar_anime_{char_id}"),
#                 ], [
#                     create_on_bt("✏️ Editar Raridade", f"editchar_raridade_{char_id}"),
#                     create_on_bt("✏️ Editar Evento", f"editchar_evento_{char_id}"),
#                 ], [
#                     create_on_bt("💾 Salvar Alterações", f"editchar_save_{char_id}"),
#                 ], [
#                     create_on_bt("🗑️ Deletar Personagem", f"delchar_deletar_{char_id}"),
#                 ]]
                
#                 await callback_query.message.edit_caption(
#                     caption=caption,
#                     reply_markup=InlineKeyboardMarkup(k)
#                 )
#             except Exception as e:
#                 await callback_query.answer(f"❌ Erro ao salvar: {str(e)}", show_alert=True)
#         else:
#             await callback_query.answer("❌ Nenhuma alteração para salvar.", show_alert=True)


# @Client.on_callback_query(filters.regex(r"^editchar_raridade_"))
# async def editchar_raridade_callback(client: Client, callback_query: CallbackQuery):
#     if not await check_admin_group(client, callback_query.from_user.id, -1001659176163):
#         await callback_query.answer("❌ Apenas administradores podem usar este comando.", show_alert=True)
#         return
    
#     parts = callback_query.data.split('_')
#     char_id = parts[2]
#     raridade_key = parts[3]  # Ex: r5
    
#     try:
#         Converter a chave da raridade para o enum usando create_prelist
#         prelist_raridade = create_prelist(TipoRaridade, "r")
#         raridade_enum = prelist_raridade.get(raridade_key)
        
#         if not raridade_enum:
#             await callback_query.answer("❌ Raridade inválida.", show_alert=True)
#             return
        
#         Atualizar no cache
#         if hasattr(client, 'editchar_cache') and callback_query.from_user.id in client.editchar_cache:
#             personagem = client.editchar_cache[callback_query.from_user.id]
#             personagem.raridade = raridade_enum
            
#             await callback_query.answer(f"✅ Raridade alterada para {raridade_enum.value}!")
            
#             Atualizar a mensagem com as informações atuais
#             caption = f"""📝 **Editando Personagem ID {char_id}**

# **Nome:** {personagem.nome_personagem}
# **Anime:** {personagem.nome_anime}
# **Evento:** {personagem.evento.value if personagem.evento else 'Nenhum'}
# **Raridade:** {personagem.raridade.value if personagem.raridade else 'Nenhuma'}
# **Data:** {personagem.data}"""
            
#             k=[[
#                 create_on_bt("✏️ Editar Nome", f"editchar_nome_{char_id}"),
#             ], [
#                 create_on_bt("✏️ Editar Anime", f"editchar_anime_{char_id}"),
#             ], [
#                 create_on_bt("✏️ Editar Raridade", f"editchar_raridade_{char_id}"),
#                 create_on_bt("✏️ Editar Evento", f"editchar_evento_{char_id}"),
#             ], [
#                 create_on_bt("💾 Salvar Alterações", f"editchar_save_{char_id}"),
#             ], [
#                 create_on_bt("🗑️ Deletar Personagem", f"delchar_deletar_{char_id}"),
#             ]]
            
#             await callback_query.message.edit_caption(
#                 caption=caption,
#                 reply_markup=InlineKeyboardMarkup(k)
#             )
#         else:
#             await callback_query.answer("❌ Personagem não encontrado no cache.", show_alert=True)
        
#     except Exception as e:
#         await callback_query.answer(f"❌ Erro ao alterar raridade: {str(e)}", show_alert=True)


# @Client.on_callback_query(filters.regex(r"^editchar_evento_"))
# async def editchar_evento_callback(client: Client, callback_query: CallbackQuery):
#     if not await check_admin_group(client, callback_query.from_user.id, -1001659176163):
#         await callback_query.answer("❌ Apenas administradores podem usar este comando.", show_alert=True)
#         return
    
#     parts = callback_query.data.split('_')
#     char_id = parts[2]
#     evento_key = parts[3]  # Ex: e2
    
#     try:
#         Converter a chave do evento para o enum usando create_prelist
#         prelist_evento = create_prelist(TipoEvento, "e")
#         evento_enum = prelist_evento.get(evento_key)
        
#         if not evento_enum:
#             await callback_query.answer("❌ Evento inválido.", show_alert=True)
#             return
        
#         Atualizar no cache
#         if hasattr(client, 'editchar_cache') and callback_query.from_user.id in client.editchar_cache:
#             personagem = client.editchar_cache[callback_query.from_user.id]
#             personagem.evento = evento_enum
            
#             await callback_query.answer(f"✅ Evento alterado para {evento_enum.value}!")
            
#             Atualizar a mensagem com as informações atuais
#             caption = f"""📝 **Editando Personagem ID {char_id}**

# **Nome:** {personagem.nome_personagem}
# **Anime:** {personagem.nome_anime}
# **Evento:** {personagem.evento.value if personagem.evento else 'Nenhum'}
# **Raridade:** {personagem.raridade.value if personagem.raridade else 'Nenhuma'}
# **Data:** {personagem.data}"""
            
#             k=[[
#                 create_on_bt("✏️ Editar Nome", f"editchar_nome_{char_id}"),
#             ], [
#                 create_on_bt("✏️ Editar Anime", f"editchar_anime_{char_id}"),
#             ], [
#                 create_on_bt("✏️ Editar Raridade", f"editchar_raridade_{char_id}"),
#                 create_on_bt("✏️ Editar Evento", f"editchar_evento_{char_id}"),
#             ], [
#                 create_on_bt("💾 Salvar Alterações", f"editchar_save_{char_id}"),
#             ], [
#                 create_on_bt("🗑️ Deletar Personagem", f"delchar_deletar_{char_id}"),
#             ]]
            
#             await callback_query.message.edit_caption(
#                 caption=caption,
#                 reply_markup=InlineKeyboardMarkup(k)
#             )
#         else:
#             await callback_query.answer("❌ Personagem não encontrado no cache.", show_alert=True)
        
#     except Exception as e:
#         await callback_query.answer(f"❌ Erro ao alterar evento: {str(e)}", show_alert=True)


# @Client.on_message(filters.text,group=2)
# async def editchar_response_handler(client: Client, message: Message):
#     """Handler para respostas de edição de nome e anime"""
#     if not await check_admin_group(client, message.from_user.id, -1001659176163):
#         return
    
#     Ignorar comandos (mensagens que começam com /)
#     if message.text and message.text.startswith('/'):
#         return
    
#     Verificar se há uma operação de edição em andamento
#     if not hasattr(client, 'editchar_operations'):
#         client.editchar_operations = {}
    
#     user_id = message.from_user.id
#     if user_id not in client.editchar_operations:
#         return
    
#     operation = client.editchar_operations[user_id]
#     char_id = operation.get('char_id')
#     action = operation.get('action')
    
#     if not char_id or not action:
#         return
    
#     try:
#         Verificar se há personagem no cache
#         if not hasattr(client, 'editchar_cache') or user_id not in client.editchar_cache:
#             await message.reply_text("❌ Personagem não encontrado no cache.")
#             return
        
#         personagem = client.editchar_cache[user_id]
        
#         Atualizar o campo apropriado no cache
#         if action == "nome":
#             personagem.nome_personagem = message.text.strip()
#             await message.reply_text(f"✅ Nome alterado para: {message.text.strip()}")
            
#         elif action == "anime":
#             personagem.nome_anime = message.text.strip()
#             await message.reply_text(f"✅ Anime alterado para: {message.text.strip()}")
        
#         Remover a operação da memória
#         del client.editchar_operations[user_id]
        
#         Mostrar o menu de edição atualizado
#         caption = f"""📝 **Editando Personagem ID {char_id}**

# **Nome:** {personagem.nome_personagem}
# **Anime:** {personagem.nome_anime}
# **Evento:** {personagem.evento.value if personagem.evento else 'Nenhum'}
# **Raridade:** {personagem.raridade.value if personagem.raridade else 'Nenhuma'}
# **Data:** {personagem.data}"""
        
#         k = [[
#             create_on_bt("✏️ Editar Nome", f"editchar_nome_{char_id}"),
#         ], [
#             create_on_bt("✏️ Editar Anime", f"editchar_anime_{char_id}"),
#         ], [
#             create_on_bt("✏️ Editar Raridade", f"editchar_raridade_{char_id}"),
#             create_on_bt("✏️ Editar Evento", f"editchar_evento_{char_id}"),
#         ], [
#             create_on_bt("💾 Salvar Alterações", f"editchar_save_{char_id}"),
#         ], [
#             create_on_bt("🗑️ Deletar Personagem", f"delchar_deletar_{char_id}"),
#         ]]
        
#         await send_media_by_type(
#             client,
#             message,
#             personagem,
#             caption=caption,
#             reply_markup=InlineKeyboardMarkup(k)
#         )
        
#     except Exception as e:
#         await message.reply_text(f"❌ Erro ao alterar {action}: {str(e)}")
#         Remover a operação da memória em caso de erro
#         if user_id in client.editchar_operations:
#             del client.editchar_operations[user_id]


# @Client.on_callback_query(filters.regex(r"^editchar_cancelar$"))
# async def editchar_cancel_callback(client: Client, callback_query: CallbackQuery):
#     """Handler para cancelar operações de edição"""
#     if not await check_admin_group(client, callback_query.from_user.id, -1001659176163):
#         await callback_query.answer("❌ Apenas administradores podem usar este comando.", show_alert=True)
#         return
    
#     user_id = callback_query.from_user.id
#     if hasattr(client, 'editchar_operations') and user_id in client.editchar_operations:
#         del client.editchar_operations[user_id]
    
#     await callback_query.answer("❌ Operação cancelada.")
#     await callback_query.message.edit_text("❌ Operação de edição cancelada.")


# @Client.on_callback_query(filters.regex(r"^delchar_deletar_"))
# async def delchar_callback(client: Client, callback_query: CallbackQuery):
#     """Handler para deletar personagem"""
#     if not await check_admin_group(client, callback_query.from_user.id, -1001659176163):
#         await callback_query.answer("❌ Apenas administradores podem usar este comando.", show_alert=True)
#         return
    
#     base_per: PersonagemHusbando | PersonagemWaifu = (
#         PersonagemHusbando
#         if client.genero == TipoCategoria.HUSBANDO
#         else PersonagemWaifu
#     )
    
#     parts = callback_query.data.split('_')
#     char_id = parts[2]
    
#     try:
#         Buscar o personagem
#         stmt = select(base_per).where(base_per.id == char_id)
#         personagem = await DATABASE.get_info_one(stmt)
        
#         if not personagem:
#             await callback_query.answer("❌ Personagem não encontrado.", show_alert=True)
#             return
        
#         Deletar o personagem
#         await DATABASE.delete_object(personagem)
        
#         Limpar cache se existir
#         if hasattr(client, 'editchar_cache') and callback_query.from_user.id in client.editchar_cache:
#             del client.editchar_cache[callback_query.from_user.id]
        
#         await callback_query.answer("✅ Personagem deletado com sucesso!")
#         await callback_query.message.edit_text(f"✅ Personagem ID {char_id} foi deletado com sucesso!")
        
#     except Exception as e:
#         await callback_query.answer(f"❌ Erro ao deletar personagem: {str(e)}", show_alert=True)