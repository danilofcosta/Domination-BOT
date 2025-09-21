from pyrogram import Client, filters
from pyrogram.types import Message
import aiohttp
from DB.database import DATABASE
from sqlalchemy import select

from uteis import dynamic_command_filter
from types_ import COMMAND_LIST, is_admin_or_higher
from DB.models import Usuario


@Client.on_message(
    filters.create(
        name=f"comand{' '.join(COMMAND_LIST.SETPROFILE.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST.SETPROFILE.value,
    )
)
@Client.on_message(filters.command(COMMAND_LIST.SETPROFILE.value) & filters.private)
async def set_photo_profile_bot(client: Client, message: Message):
    # Verificar se o usuário é admin ou superior

    stmt = select(Usuario).where(Usuario.telegram_id == message.from_user.id)
    usuario = await DATABASE.get_info_one(stmt)

    if not usuario or not is_admin_or_higher(usuario.perfil_status):
        await message.reply(
            "❌ Apenas administradores podem usar este comando!", quote=True
        )
        return
    # if len(message.command) < 2:
    #     return await message.reply(
    #         "Por favor, envie uma URL de imagem ou anexe uma foto para definir como foto de perfil do bot.",
    #         quote=True,
    #     )

    # Verificar se é resposta com foto
    if message.reply_to_message and message.reply_to_message.photo:
        photo = message.reply_to_message.photo.file_id
        photo_bytes = await client.download_media(photo, in_memory=True)
        await client.set_profile_photo(photo=photo_bytes)
        await message.reply(
            "✅ Foto de perfil do bot atualizada com sucesso!", quote=True
        )
        return

    # Verificar se é resposta com vídeo
    if message.reply_to_message and message.reply_to_message.video:
        video = message.reply_to_message.video.file_id
        video_bytes = await client.download_media(video, in_memory=True)
        await client.set_profile_photo(photo=video_bytes)
        await message.reply(
            "✅ Vídeo de perfil do bot atualizado com sucesso!", quote=True
        )
        return

    # Verificar se há URL no comando
    if len(message.command) >= 2:
        url = message.command[1]
        if not url.startswith(("http://", "https://")):
            await message.reply("❌ URL inválida. Use http:// ou https://", quote=True)
            return

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        media_bytes = await response.read()
                        await client.set_profile_photo(photo=media_bytes)
                        await message.reply(
                            "✅ Foto de perfil do bot atualizada via URL com sucesso!",
                            quote=True,
                        )
                    else:
                        await message.reply(
                            f"❌ Erro ao baixar URL: {response.status}", quote=True
                        )
        except Exception as e:
            await message.reply(f"❌ Erro ao processar URL: {e}", quote=True)
        return

    await message.reply(
        "📸 **Como usar:**\n"
        "• Responda uma foto/vídeo\n"
        "• Ou envie: `/setprofile <URL>`\n"
        "• Exemplo: `/setprofile https://example.com/image.jpg`",
        quote=True,
    )


@Client.on_message(
    filters.create(
        name=f"comand{' '.join(COMMAND_LIST.SETDESCRIPTION.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST.SETDESCRIPTION.value,
    )
)
@Client.on_message(filters.command(COMMAND_LIST.SETDESCRIPTION.value) & filters.private)
async def set_bot_description(client: Client, message: Message):
    # Verificar se o usuário é admin ou superior

    stmt = select(Usuario).where(Usuario.telegram_id == message.from_user.id)

    usuario = await DATABASE.get_info_one(stmt)

    if not usuario or not is_admin_or_higher(usuario.perfil_status):
        await message.reply(
            "❌ Apenas administradores podem usar este comando!", quote=True
        )
        return

    # Verificar se há texto no comando
    if len(message.command) < 2:
        await message.reply(
            """`📝 <b>Como usar:</b><br>
            • <code>/setdesc &lt;descrição&gt;</code> - Define a descrição do bot<br>
            • <code>/setdesc about &lt;texto&gt;</code> - Define o 'About' do bot<br>
            • <code>/setdesc short &lt;texto&gt;</code> - Define descrição curta<br><br>
            
            <b>Exemplos:</b><br>
            • <code>/setdesc Bot para capturar waifus</code><br>
            • <code>/setdesc about Este bot permite capturar personagens de anime</code>`""",
            quote=True,
        )
        return

    try:
        if message.command[1].lower() == "about":
            # Definir About
            about_text = " ".join(message.command[2:])
            if not about_text:
                await message.reply(
                    "❌ Digite o texto do About após 'about'", quote=True
                )
                return

            await client.set_bot_description(description=about_text)
            await message.reply(
                f"✅ About do bot atualizado:\n\n{about_text}", quote=True
            )

        elif message.command[1].lower() == "short":
            # Definir descrição curta
            short_text = " ".join(message.command[2:])
            if not short_text:
                await message.reply(
                    "❌ Digite o texto da descrição após 'short'", quote=True
                )
                return

            await client.set_bot_short_description(short_description=short_text)
            await message.reply(
                f"✅ Descrição curta do bot atualizada:\n\n{short_text}", quote=True
            )

        else:
            # Definir descrição normal
            desc_text = " ".join(message.command[1:])
            await client.set_bot_description(description=desc_text)
            await message.reply(
                f"✅ Descrição do bot atualizada:\n\n{desc_text}", quote=True
            )

    except Exception as e:
        await message.reply(f"❌ Erro ao atualizar descrição: {e}", quote=True)
