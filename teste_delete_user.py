#!/usr/bin/env python3
"""
Script para testar a exclusão do usuário 422779743
"""
import asyncio
import sys
import os

# Adiciona o diretório atual ao path para importar módulos
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from DB.database import DATABASE
from DB.models import Usuario, ColecaoUsuarioWaifu, ColecaoUsuarioHusbando
from sqlalchemy import select, func
from domination.logger import log_info, log_error, log_debug


async def check_user_before_deletion(telegram_id: int):
    """Verifica informações do usuário antes da exclusão"""
    print(f"🔍 Verificando usuário {telegram_id} antes da exclusão...")
    
    try:
        # Busca o usuário
        user = await DATABASE.get_info_one(
            select(Usuario).where(Usuario.telegram_id == telegram_id)
        )
        
        if not user:
            print(f"❌ Usuário {telegram_id} não encontrado.")
            return None
        
        # Conta coleções de waifu
        waifu_count = await DATABASE.get_info_one(
            select(func.count()).select_from(ColecaoUsuarioWaifu).where(
                ColecaoUsuarioWaifu.telegram_id == telegram_id
            )
        )
        
        # Conta coleções de husbando
        husbando_count = await DATABASE.get_info_one(
            select(func.count()).select_from(ColecaoUsuarioHusbando).where(
                ColecaoUsuarioHusbando.telegram_id == telegram_id
            )
        )
        
        print(f"✅ Usuário encontrado:")
        print(f"   • ID: {telegram_id}")
        print(f"   • Nome: {user.telegram_from_user.get('first_name', 'N/A')}")
        print(f"   • Username: @{user.telegram_from_user.get('username', 'N/A')}")
        print(f"   • Perfil: {user.perfil_status.value if user.perfil_status else 'N/A'}")
        print(f"   • Idioma: {user.idioma_preferido.value if user.idioma_preferido else 'N/A'}")
        print(f"   • Coleções waifu: {waifu_count or 0}")
        print(f"   • Coleções husbando: {husbando_count or 0}")
        print(f"   • Criado em: {user.created_at}")
        
        return user, waifu_count or 0, husbando_count or 0
        
    except Exception as e:
        print(f"❌ Erro ao verificar usuário: {e}")
        return None


async def delete_user_and_collections(telegram_id: int):
    """Deleta o usuário e suas coleções"""
    print(f"🗑️ Iniciando exclusão do usuário {telegram_id}...")
    
    try:
        # Busca o usuário
        user = await DATABASE.get_info_one(
            select(Usuario).where(Usuario.telegram_id == telegram_id)
        )
        
        if not user:
            print(f"❌ Usuário {telegram_id} não encontrado.")
            return False
        
        print(f"✅ Usuário encontrado, ID interno: {user.id}")
        
        # Deleta o usuário (cascade deve deletar as coleções automaticamente)
        await DATABASE.delete_object_by_id(Usuario, user.id)
        
        print(f"✅ Usuário {telegram_id} excluído com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao deletar usuário: {e}")
        return False


async def verify_deletion(telegram_id: int):
    """Verifica se o usuário foi realmente deletado"""
    print(f"🔍 Verificando se usuário {telegram_id} foi deletado...")
    
    try:
        # Busca o usuário
        user = await DATABASE.get_info_one(
            select(Usuario).where(Usuario.telegram_id == telegram_id)
        )
        
        if user:
            print(f"❌ Usuário {telegram_id} ainda existe!")
            return False
        else:
            print(f"✅ Usuário {telegram_id} foi deletado com sucesso!")
            return True
            
    except Exception as e:
        print(f"❌ Erro ao verificar exclusão: {e}")
        return False


async def main():
    """Função principal"""
    telegram_id = 422779743
    
    print("🚀 Teste de exclusão de usuário")
    print("=" * 50)
    
    # 1. Verifica usuário antes da exclusão
    user_info = await check_user_before_deletion(telegram_id)
    if not user_info:
        print("❌ Não é possível continuar - usuário não encontrado")
        return
    
    user, waifu_count, husbando_count = user_info
    
    # 2. Confirma exclusão
    print(f"\n⚠️ CONFIRMAÇÃO:")
    print(f"Você está prestes a deletar:")
    print(f"• Usuário: {telegram_id}")
    print(f"• Coleções waifu: {waifu_count}")
    print(f"• Coleções husbando: {husbando_count}")
    
    confirm = input("\nDigite 'CONFIRMAR' para continuar: ")
    if confirm != "CONFIRMAR":
        print("❌ Exclusão cancelada.")
        return
    
    # 3. Executa exclusão
    success = await delete_user_and_collections(telegram_id)
    if not success:
        print("❌ Falha na exclusão")
        return
    
    # 4. Verifica exclusão
    deleted = await verify_deletion(telegram_id)
    if deleted:
        print("\n🎉 Teste concluído com sucesso!")
        print("✅ Usuário e coleções foram deletados")
    else:
        print("\n❌ Teste falhou - usuário ainda existe")


if __name__ == "__main__":
    asyncio.run(main())
