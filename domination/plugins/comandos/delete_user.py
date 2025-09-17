import asyncio
from pyrogram import Client, filters
from pyrogram.types import Message
from sqlalchemy import select, delete
from DB.database import DATABASE
from DB.models import Usuario, ColecaoUsuarioWaifu, ColecaoUsuarioHusbando
from domination.logger import log_info, log_error, log_debug
from domination.message import MESSAGE
from types_ import COMMAND_LIST
from uteis import check_admin_group


@Client.on_message(filters.private & filters.command("deleteuser"))
async def handle_delete_user(client: Client, message: Message):
    """Comando para apagar um usuário e sua coleção completa"""
    
    # Verifica se é um admin
    if await check_admin_group(client, user_id=message.from_user.id) == False:
        return await message.reply(
            MESSAGE.get_text("pt", "erros", "not_admin_bot"), quote=True
        )
    
    if len(message.command) < 2:
        await message.reply("❌ Uso: /deleteuser <telegram_id>")
        return
    
    try:
        telegram_id = int(message.command[1])
    except ValueError:
        await message.reply("❌ ID do usuário deve ser um número.")
        return
    
    # Confirmação
    confirm_msg = await message.reply(
        f"⚠️ **CONFIRMAÇÃO**\n\n"
        f"Você está prestes a **APAGAR PERMANENTEMENTE**:\n"
        f"• Usuário ID: `{telegram_id}`\n"
        f"• Toda a coleção de waifus\n"
        f"• Toda a coleção de husbandos\n\n"
        f"Digite `/confirm_delete {telegram_id}` para confirmar ou `/cancel` para cancelar."
    )
    
    # Armazena a confirmação temporariamente
    client._pending_deletions = getattr(client, '_pending_deletions', {})
    client._pending_deletions[message.from_user.id] = {
        'telegram_id': telegram_id,
        'confirm_msg_id': confirm_msg.id
    }


@Client.on_message(filters.private & filters.command("confirm_delete"))
async def handle_confirm_delete(client: Client, message: Message):
    """Confirma e executa a exclusão do usuário"""
    
    if message.from_user.id not in [422779743]:  # Apenas admins
        return
    
    if len(message.command) < 2:
        await message.reply("❌ Uso: /confirm_delete <telegram_id>")
        return
    
    try:
        telegram_id = int(message.command[1])
    except ValueError:
        await message.reply("❌ ID do usuário deve ser um número.")
        return
    
    # Verifica se há confirmação pendente
    pending = getattr(client, '_pending_deletions', {}).get(message.from_user.id)
    if not pending or pending['telegram_id'] != telegram_id:
        await message.reply("❌ Nenhuma confirmação pendente para este usuário.")
        return
    
    # Executa a exclusão
    await message.reply("🔄 Iniciando exclusão...")
    
    try:
        # 1. Busca o usuário
        user = await DATABASE.get_info_one(
            select(Usuario).where(Usuario.telegram_id == telegram_id)
        )
        
        if not user:
            await message.reply(f"❌ Usuário {telegram_id} não encontrado.")
            return
        
        log_info(f"Deletando usuário {telegram_id} e suas coleções", "delete_user")
        
        # 2. Deleta coleções de waifu
        waifu_count = await DATABASE.get_info_one(
            select(select().count()).select_from(ColecaoUsuarioWaifu).where(
                ColecaoUsuarioWaifu.telegram_id == telegram_id
            )
        )
        
        # 3. Deleta coleções de husbando
        husbando_count = await DATABASE.get_info_one(
            select(select().count()).select_from(ColecaoUsuarioHusbando).where(
                ColecaoUsuarioHusbando.telegram_id == telegram_id
            )
        )
        
        # 4. Deleta o usuário (cascade deve deletar as coleções automaticamente)
        await DATABASE.delete_object_by_id(Usuario, user.id)
        
        # 5. Confirma exclusão
        await message.reply(
            f"✅ **Usuário excluído com sucesso!**\n\n"
            f"• Usuário ID: `{telegram_id}`\n"
            f"• Coleções de waifu: {waifu_count or 0} itens\n"
            f"• Coleções de husbando: {husbando_count or 0} itens\n"
            f"• Data: {asyncio.get_event_loop().time()}"
        )
        
        log_info(f"Usuário {telegram_id} excluído com sucesso", "delete_user")
        
        # Limpa confirmação pendente
        if hasattr(client, '_pending_deletions'):
            client._pending_deletions.pop(message.from_user.id, None)
            
    except Exception as e:
        log_error(f"Erro ao deletar usuário {telegram_id}: {e}", "delete_user", exc_info=True)
        await message.reply(f"❌ Erro ao deletar usuário: {str(e)}")


@Client.on_message(filters.private & filters.command("cancel"))
async def handle_cancel_delete(client: Client, message: Message):
    """Cancela uma exclusão pendente"""
    
    if message.from_user.id not in [422779743]:  # Apenas admins
        return
    
    if hasattr(client, '_pending_deletions'):
        client._pending_deletions.pop(message.from_user.id, None)
    
    await message.reply("❌ Exclusão cancelada.")


@Client.on_message(filters.private & filters.command("checkuser"))
async def handle_check_user(client: Client, message: Message):
    """Verifica se um usuário existe e mostra suas coleções"""
    
    if message.from_user.id not in [422779743]:  # Apenas admins
        return
    
    if len(message.command) < 2:
        await message.reply("❌ Uso: /checkuser <telegram_id>")
        return
    
    try:
        telegram_id = int(message.command[1])
    except ValueError:
        await message.reply("❌ ID do usuário deve ser um número.")
        return
    
    try:
        # Busca o usuário
        user = await DATABASE.get_info_one(
            select(Usuario).where(Usuario.telegram_id == telegram_id)
        )
        
        if not user:
            await message.reply(f"❌ Usuário {telegram_id} não encontrado.")
            return
        
        # Conta coleções
        waifu_count = await DATABASE.get_info_one(
            select(select().count()).select_from(ColecaoUsuarioWaifu).where(
                ColecaoUsuarioWaifu.telegram_id == telegram_id
            )
        )
        
        husbando_count = await DATABASE.get_info_one(
            select(select().count()).select_from(ColecaoUsuarioHusbando).where(
                ColecaoUsuarioHusbando.telegram_id == telegram_id
            )
        )
        
        await message.reply(
            f"👤 **Informações do Usuário**\n\n"
            f"• ID: `{telegram_id}`\n"
            f"• Nome: {user.telegram_from_user.get('first_name', 'N/A')}\n"
            f"• Username: @{user.telegram_from_user.get('username', 'N/A')}\n"
            f"• Perfil: {user.perfil_status.value if user.perfil_status else 'N/A'}\n"
            f"• Idioma: {user.idioma_preferido.value if user.idioma_preferido else 'N/A'}\n"
            f"• Coleções waifu: {waifu_count or 0}\n"
            f"• Coleções husbando: {husbando_count or 0}\n"
            f"• Criado em: {user.created_at}"
        )
        
    except Exception as e:
        log_error(f"Erro ao verificar usuário {telegram_id}: {e}", "delete_user", exc_info=True)
        await message.reply(f"❌ Erro ao verificar usuário: {str(e)}")
