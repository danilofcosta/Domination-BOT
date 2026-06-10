###############
### GENERAL ###
###############
loading = cargando
Logo_bt = 𝕯𝖔𝖒𝖎𝖓𝖆𝖙𝖎𝖔𝖓𝕾
bot-on-check = ¡Estoy en línea !
  name:{$nomegroup}
  istopic:{$istopic}


###############
### ERROR ###
###############
error-not-registered = Aún no estás registrado en el sistema.
error-not-id = Envía el ID también
error-not-found-collection = ID { $id } no está en tu colección
error-action-not-authorized-by-id = No autorizado
error-group-only = Este comando debe usarse en un grupo.
error-forum-only = Este comando solo puede usarse en chats de temas.
error-admin-group-only = Solo los administradores del grupo pueden usar este comando.
error-admin-bot-only = Solo los administradores del bot pueden usar este comando.
error-need-id = Proporciona el ID del personaje.

# gift
error-gift-invalid-user = Usuario inválido.
error-gift-self = No puedes enviarte un regalo a ti mismo.
error-gift-bot = Gracias, pero no puedo recibir regalos.
error-gift-not-id = Envía el ID también, o elige usando el botón de abajo para regalar
select-inline-gift = elige el regalo

# fav
fav-btn-select = selecciona tu favorito
error-fav-not-id = Envía el ID también o selecciona abajo
error-fav-invalid-char = Personaje inválido.
error-fav-not-owned = El usuario no posee este personaje.

# permissions
error-permission-denied = ❌ No tienes permiso suficiente para usar este comando.
error-permission-internal = ❌ Ocurrió un error interno al verificar tus permisos.

# sendmedia
error-sendmedia-unsupported = Tipo de medio no soportado.

# test commands
error-test-user-not-id = Error: usuario no identificado.

# callbacks admin
error-callback-admin-only = ❌ Solo los admins pueden confirmar.
error-callback-expired = ❌ Datos expirados. Ejecuta el comando de nuevo.

edit_char_prompt = Editar Personaje: { $name } ({ $anime })

Selecciona lo que deseas editar:

btn-edit-name = Nombre
btn-edit-anime = Origen
btn-edit-media = Medio
btn-edit-rarity = Rareza

edit_char_select = Editando: <b>{ $name }</b> ({ $anime })
error-bot-no-permission-topics = El bot no tiene permiso para gestionar temas. Otorga permiso de gestión de temas al bot.
error-reply-topic = Responde a un mensaje del tema que deseas modificar.
error-topic-name = Proporciona el nuevo nombre para el tema.
error-topic-id = ID de tema inválido.
error-topic-create = Error al crear el tema.
error-topic-rename = Error al renombrar el tema.
error-topic-close = Error al cerrar el tema.
error-topic-delete = Error al eliminar el tema.

newtopic-success = ¡Tema "{ $topicName }" creado con éxito!
renametopic-success = ¡Tema renombrado a "{ $topicName }"!
closetopic-success = ¡Tema cerrado con éxito!
deletetopic-success = ¡Tema eliminado con éxito!
setactiontopic-success = ¡Tema de acción predeterminado configurado!

###############
### BUTTONS ###
###############
btn-yes = ✅ Sí
btn-no = ❌ No
btn-close = 🗑 Cerrar



###############
### WELCOME ###
###############
start-greeting-header = Saludos, soy { $botName }
start-greeting-body = Lo que hago: hago aparecer { $genero } en tu chat para que los usuarios capturen.
start-greeting-extra-body = Cómo usarme: Agréganos a tu grupo.

start-btn-add = Aɢʀᴇɢᴀʀ+
start-btn-help = Aʏᴜᴅᴀ
start-btn-database = ʙᴀsᴇ ᴅᴇ ᴅᴀᴛᴏs
start-btn-colaboradores = colaboradores

###############
## HELP ##
###############
help-caption = Ayuda

    ¡Hola! Mi nombre es { $botName }. Soy un generador de { $genero } para que los miembros dominen. Tengo muchas funciones útiles, como un top de usuarios, un sistema de advertencias, un sistema de notas y un sistema de colección entre otras funciones.

    Comandos útiles:
    - /start: ¡Iniciame! Probablemente ya has usado este comando.
    - /help: Envía este mensaje; ¡te contaré más sobre mí!
    - /dominar: Envía este comando más el nombre del personaje para capturarlo.

    - /donate: Proporciona información sobre cómo apoyarme a mí y a mi creador.
    Si tienes algún error o pregunta sobre cómo usarme, echa un vistazo a mi sitio web, o dirígete a @.

    Todos los comandos se pueden usar con el siguiente: /

help-group-redirect = ¡Haz clic aquí para ayuda!


help-text-comment-harem = <b>Harem</b>

    El Harem es una colección de personajes que recolectas usando el comando <code>/dominar</code>. Usando los comandos <code>/{$commandharem}</code> o <code>/{$commandharem2}</code> se abre listando los personajes en tu colección.

    El medio que aparece cuando lo usas es tu favorito establecido como el primer personaje dominado.
    ¿Puedo cambiar el favorito? Sí. Usa el comando <code>/{$commandFav}</code> junto con el ID de un personaje en tu colección.

    <b>Modo del Harem</b>
    El harem tiene algunos modos disponibles que se pueden cambiar con el comando <code>/{$command_modeharem}</code>.


help-text-comment-topic = temas
    Gestiona la configuración de los temas a través del bot.

    Los temas introducen muchas pequeñas diferencias en los supergrupos normales; esto puede afectar la forma en que normalmente usas el bot en tu chat.
    Por ejemplo, ciertos foros pueden querer personalizar el tema en el que el bot envía mensajes, para que no terminen en el chat "general" por defecto.

    También puedes usar el bot para crear, renombrar, cerrar y eliminar tus temas.

help-text-comment-dominar = dominar

    El comando se usa para capturar un personaje y agregarlo a tu colección.
    Ejemplo: /dominar naruto

    Si aciertas el nombre o apellido del personaje, se agregará a tu colección y se mostrará un mensaje de confirmación.

help-text-comment-adm-bot = <b>Admin del Bot</b>

Comandos disponibles para admins del bot:
help-btn-admBot-manager-character = Gestionar Personajes
help-btn-admBot-add = Agregar
help-btn-admBot-edit = Editar
help-btn-admBot-del = Eliminar

help-text-comment-admBot-manager-character = <b>Gestionar Personajes</b>

    Gestiona los personajes de la base de datos.

help-text-comment-admBot-manager-character-add = <b>Agregar Personaje</b>

    Usa el comando <code>/{$commandaddchar} nombre, (anime/película/...)</code>

    El comando debe usarse en respuesta a un medio (foto o video) o enviado en el pie del medio.
    Si eres administrador, se mostrará un mensaje de confirmación permitiendo editar la información antes de guardar.

    Si proporcionas el código de rareza (<code>r00</code>) o edición (<code>e00</code>), se establecerán automáticamente:
    <code>{$commandaddchar} nombre, (anime...), r5</code>
    <code>{$commandaddchar} nombre, (anime...), r5, e6</code>

    Al agregar <code>noconf</code>, el medio se guardará sin confirmación.
    Si no se proporcionan <code>r5</code> o <code>e6</code>, los valores se establecerán aleatoriamente.




help-text-comment-admBot-manager-character-edit = <b>Editar Personaje</b>

    Usa <code>/editchar id</code> para editar un personaje existente.

help-text-comment-admBot-manager-character-del = <b>Eliminar Personaje</b>

    Usa <code>/rmchar id</code> para eliminar un personaje.

# btn comandos (help-btn-comandos)
help-btn-comandos = Comandos
help-btn-comment-harem = harem
help-btn-comment-topic = tema
help-btn-comment-dominar = dominar
help-btn-comment-admBot = admins bot
help-btn-comment-admBot-manager-character = agregar personaje




help-label-commmads-user = Usuario
help-label-commmads-admin-gruop = Admin Grupo
help-label-commmads-admin-bt = Admin Bot

help-btn-open-pm = Abrir en MP
help-btn-back = Volver
help-btn-close = 🗑

help-select-category = Selecciona una categoría:
help-title-commands-user = <b>Comandos de Usuario</b>

help-title-commands-admin = <b>Comandos de Admin del Grupo</b>

help-title-commands-botadmin = <b>Comandos de Admin del Bot</b>
help-error-botadmin = Solo los admins del bot pueden ver estos comandos.
help-error-botadmin-user = Eres { $level }, solo los admins pueden ver estos comandos.





###############
### MYINFO ###
###############
myinfo-title = 📊 Tu Información
myinfo-user = 👤 Usuario: { $name }
myinfo-id = 🆔 ID: <code>{ $id }</code>
myinfo-total = 📦 Total de { $genero }: { $total }
myinfo-harem = ❤️ Harén: { $userTotal } / { $dbTotal } ({ $percent }%)
myinfo-progress = 📈 Progreso: { $bar }

myinfo-end = ─────────────
###############
# NEW GROUP #
###############

add_bot_new_group = ✅ ¡Fui agregado a un nuevo grupo!
    🏷 Nombre del grupo: { $name }
    🆔 ID del grupo: { $id }
    👤 Agregado por: { $user }

thank-you-add-group = ¡Gracias por agregarme al grupo <b>{ $groupName }</b>! Sigue contribuyendo :D ¡Ganaste 40 coins!

bot_new_group_member_count = Grupo "{ $groupName }" tiene { $count } miembros

bot_new_group_too_few_members = El grupo necesita al menos 40 miembros para que me quede. Actualmente tiene { $count } miembros.

bot_new_group_left_chat = Salí del grupo "{ $groupName }" ({ $groupId }) porque solo tiene { $count } miembros (mínimo: 40).

bot_leave_group_btn = Salir del grupo
bot_leave_group_confirm = ¿Estás seguro de que deseas salir del grupo <b>"{ $groupName }"</b>?
bot_leave_group_confirm_btn = Sí, salir
bot_leave_group_cancel_btn = No
bot_leave_group_done = Salí del grupo <b>"{ $groupName }"</b>.


###############
# DROP CHARACTER #
###############
new_character_secret_caption = { $emoji_raridade } { $charater_genero } apareció.
    captura: /dominar <code>Nombre</code>

drop_character_secret_caption = { $charater_genero } ha huido.
    El nombre es <code>{ $charater_nome } - { $charater_anime }</code>

drop_character_attempt_empty = Vale, pero ¿cuál es el nombre del { $genero }?
drop_character_secret_btn = Más detalles

# gender inline strings
drop-gender-husbando = el husbando
drop-gender-waifu = la waifu
form-caption-gender-waifu = Una waifu
form-caption-gender-husbando = Un husbando
create-caption-gender-waifu = esta waifu
create-caption-gender-husbando = este husbando

###############
# fav character #
###############

fav-character = ¿Quieres hacer de este personaje tu favorito?
    <code>{ $id_personagem } { $character_name } - { $character_anime }</code>

fav-character-success = favorito actualizado
fav-not-found = No tienes este { $genero } en tu Harén.
fav-check-harem = \n\n revisa tu Harén /{ $cmd }{ $genero }s


###############
# GIFT #
###############

gift_confirmation_message = ¿Estás seguro de que quieres regalar

 <code>{ $character_name } - { $character_anime }</code>

  a { $username }?

gift_reply_instruction = Responde a una persona <code>/{ $command } 46</code>
gift_success = ¡Regalo enviado con éxito a { $user }!
gift_success_multi = ¡Enviaste { $count } regalos a { $user }!
gift_confirmation_message_multi = ¿Estás seguro de que quieres regalar { $qty }x <code>{ $character_name } - { $character_anime }</code> a { $username }?

gift-default-username = Usuario


############
# DOMINAR #
############
not-charater-to-dominar = No hay personaje disponible para dominar en este momento.
dominar_locked = ⏳ Otra captura está en progreso, espera un momento.
drop_character_attempt_incorrect = <tg-emoji emoji-id="5210952531676504517">❌</tg-emoji> ¡Nombre incorrecto!
drop_character_attempt_incorrect_btn = Intentar de nuevo
# genero (una waifu / un husbando)
#
success_dominar_title = <tg-emoji emoji-id="5355035722246016995">✅</tg-emoji> <b>¡{ $usermention } dominó { $genero }!</b>
success_dominar_name = 🏷 <b>Nombre:</b> { $character_name }
success_dominar_rarity = { $rarity } <b>Rareza:</b> { $rarity_name } { $emoji_event }
success_dominar_anime = 📺 <b>Anime:</b> { $anime }
success_dominar_event = 🆔 <b>ID:</b> { $id }
success_dominar_time = ⏱ <b>Tiempo empleado:</b> <code>{ $time }</code>
success_dominar_btn = 𝐌𝐈 𝐇𝐀𝐑É𝐍
success-dominar-fallback = ¡tienes un nuevo personaje!
success-dominar-genero-waifu = una waifu
success-dominar-genero-husbando = un husbando
daily_dominar_limit = ❌ ¡Límite diario alcanzado! Ya has dominado { $limit } personajes hoy. Inténtalo de nuevo mañana.


############
# HAREM #
############
# genero (esta waifu / este husbando)
harem_inline_caption_title = ¡wow! mira { $genero } { $usermention }
harem_inline_caption_name = <b>{ $character_name }</b>
harem_inline_caption_info = { $id } : { $anime } { $emoji_event } { $repitition }
harem_inline_caption_rarity = Rareza: { $rarity_name } { $rarity_emoji }
harem_inline_caption_event = { $emoji_event } { $event_name } { $emoji_event }
harem_logo = { $usermention } ๛Harén ツ

harem-open-id-not-found = usuario no encontrado o no existente (El uso de @... puede no funcionar bien porque el usuario puede haberlo cambiado recientemente)
harem_btn_inline_query = 🌐
harem_btn_prev_page = ⬅️
harem_btn_current_page = [{ $currentpage }/{ $totalpages }]
harem_btn_fast_page = ⚡️²
harem_btn_next_page = ➡️
harem_btn_close = 🗑
harem_btn_web_app = 🌐 web
harem_no_user = no tienes un harén
harem-empty = No hay personajes.
harem-no-event = Sin Evento
harem-unknown-anime = Desconocido
harem-rarity-header = \n🔸 <b>{ $name }</b>\n
harem-rarity-header-cont = \n🔸 <b>{ $name } (cont.)</b>\n
harem-event-header = \n🔹 <b>{ $name }</b>\n
harem-event-header-cont = \n🔹 <b>{ $name } (cont.)</b>\n
harem-anime-header = \n☛ <b>{ $name }</b> ({ $userCount }/{ $dbTotal })\n✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧\n
harem-anime-header-cont = \n☛ <b>{ $name } (cont.)</b>\n✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧\n
harem-line-format = ➢ ꙳ <code>{ $id }</code> ꙳ { $rarity } ꙳ <b>{ $name }</b>{ $events } { $count }x\n

############
# HAREM MODES
############
rarity_emoji_local = <tg-emoji emoji-id="5325547803936572038">✨</tg-emoji>
lapis = <tg-emoji emoji-id="5395444784611480792">✏️</tg-emoji>


harem_mode_recent_nome = { lapis } Nombre: { $nome }
harem_mode_recent_id = 🆔 ID: <code>{ $id }</code>
harem_mode_recent_rarity = { $rarity_emoji } Rareza: { $rarity_name }
harem_mode_recent_anime = { rarity_emoji_local } { $sourceType }: { $anime }







############
# TOP #
############

top_header = TOP GLOBAL { Logo_bt }
top_header_start = -----------------
top_header_end = -----------------
top_pre_index = ┣
top_user_btn = 𝐌𝐢 𝐏𝐨𝐬𝐢𝐜𝐢ó𝐧
top_btn_close = 🗑
top-empty = Aún no hay usuarios en el ranking.
topcb-not-identified = No se pudo identificarte.
topcb-not-ranked = Aún no estás en el ranking.
topcb-position = 🏆 Tu posición: { $position }\n📊 Total: { $total }

############



############
# ADD CHARACTER #
############
add_character_confirm = ⚕ ᴀɢʀᴇɢᴀᴅᴏ ᴘᴏʀ: { $usermention }

add_character_not_info = falta archivo_media o anime o personaje

add_character_btn_confirm = Sí
add_character_btn_cancel = No
add_character_btn_edit = editar
add_character_not_reply = usa en respuesta a un medio video/foto
add-char-only-photo-video = Solo se admiten fotos o videos.
add-char-document-too-large = El documento supera el límite de 20MB. Envía la imagen/video directamente (no como documento).
add-char-document-not-media = El documento no es una imagen o video válido. Envía una foto o video directamente.
add-char-usage = Usa: nombre, anime, extras
add-char-queue = 📦 Personaje agregado a la cola (posición { $pos }). Procesando pronto...
add-char-error = Error al agregar personaje: { $error }
add-char-success = ¡Personaje agregado con éxito!
add-char-preview = Nombre: { $nome }\nAnime: { $anime }\nGénero: { $genero }\nMediatype: { $mediatype }\nData: { $media }\nLink: { $link }\nRarezas: { $rarities }\nEventos: { $events }
add-char-default-value = valor por defecto
add-char-default-event = sin evento
add-char-save-error = Error al guardar personaje.
tipo-foto = foto
tipo-video = video
tipo-gif = GIF
tipo-video-animado = video animado
set-bot-pic-not-reply = Responde a una foto, video o GIF (máx 10s) para establecer como foto de perfil del bot.
set-bot-pic-confirm = ¿Deseas establecer este { $tipo } como foto de perfil del bot?
set-bot-pic-success = ✅ ¡Foto de perfil del bot actualizada con éxito!
set-bot-pic-error = Error al actualizar la foto de perfil: { $error }
set-bot-pic-too-small = La foto es demasiado pequeña. Envía una foto de al menos 320x320 píxeles.
set-bot-pic-video-too-long = El { $tipo } supera los 10 segundos. Envía uno de máximo 10 segundos.
set-bot-pic-video-invalid = Formato de video no aceptado. Envía un GIF o un video en MP4.
set-bot-pic-video-not-square = El video debe ser cuadrado (proporción 1:1). Envía un GIF o recorta el video a formato cuadrado.

############
# EDIT CHARACTER #
############

edit_character_edit_caption = Nombre: { $nome }
    Anime: { $anime }
    Género: { $genero }
    Mediatype: { $mediatype }
    Data: <code>{ $media }</code>
    Rarezas: { $rarities }
    Eventos: { $events }

add_character_edit_btn_nome = Nombre
add_character_edit_btn_anime = Anime
add_character_edit_btn_events = eventos
add_character_edit_btn_rarities = rarezas
add_character_edit_btn_media = Medio
add_character_edit_btn_confirm = guardar
add_character_edit_btn_cancel = cancelar

edit_character_prompt_nome = ✏️ Envía el nuevo nombre:
    <b>Actual:</b> { $current }
edit_character_prompt_anime = ✏️ Envía el nuevo anime:
    <b>Actual:</b> { $current }
edit_character_prompt_events = ✏️ Envía los IDs de eventos separados por comas:
    <b>Actual:</b> { $current }
edit_character_prompt_rarities = ✏️ Envía los IDs de rarezas separados por comas:
    <b>Actual:</b> { $current }
edit_character_prompt_media = Envía la nueva multimedia respondiendo a una foto o vídeo:
edit_character_prompt_media_reply = Responde a un mensaje que contenga la nueva multimedia (foto o vídeo).
edit_character_prompt_media_invalid = El mensaje respondido no contiene multimedia válida. Envía una foto o vídeo.
edit-char-success = ✅ ¡Personaje actualizado con éxito!
edit-char-info = 🆔 ID: { $id }
📛 Nombre: { $name }
📺 Anime: { $origem }

query_not_fould = No se encontraron resultados

############
# ANIMELIST #
############
animelist-select-letter = Selecciona una letra del alfabeto:\n\n
animelist-no-anime = No se encontraron animes con la letra { $letter }
animelist-header = Animes con { $letter } ({ $total })
animelist-page = Página { $page }/{ $totalPages }
animelist-instruction = Haz clic en un anime para ver sus personajes
animelist-btn-back = 🔙 Menú
animelist-btn-prev = ◀️
animelist-btn-next = ▶️

############
# HAREM MODE #
############
haremmode-default = Predeterminado
haremmode-recent = Recientes
haremmode-rarity = Por Rareza
haremmode-event = Por Evento
haremmode-caption = Elige cómo quieres ver tu harén
haremmodecb-user-not-found = Usuario no encontrado.
haremmodecb-no-update = No se actualizó, tal vez tu harén esté vacío o elegiste el mismo modo otra vez.
haremmodecb-selected = Modo seleccionado: <b>{ $mode }</b>
haremmodecb-updated = Modo actualizado con éxito a: { $mode }

############
# TOPIC CONFIG #
############
error-topic-group-only = ❌ Este comando debe usarse en un grupo.
error-topic-reply-msg = ❌ Responde a un mensaje del grupo para establecer el tema.\n\nUsa: /setchattopic respondiendo a un mensaje
error-topic-not-topic = ❌ El mensaje respondido no es de un tema.\n\nUsa este comando respondiendo a un mensaje de un tema del foro.
error-topic-not-admin = ❌ Solo los administradores del grupo pueden usar este comando.
topic-config-success = ✅ ¡Tema configurado!\n\n📝 ID del tema: { $topicId }\n\nAhora todos los mensajes de drop se enviarán en este tema.

############
# ADD COLLECTION #
############
addCollection-btn-yes = ✅ Sí
addCollection-btn-no = ❌ No
addCollection-btn-view-harem = Ver harén
addCollection-btn-view-collection = Ver colección
addCollection-confirm = Personajes ({ $count }):\n{ $list }\n\n{ $invalid }\n\n¿Agregar a la colección de { $user }?
addCollection-success-single = ✅ ¡Personaje agregado a la colección!\n\nPor: { $user }
addCollection-success-multi = ✅ ¡Personajes agregados a la colección!\n\nPor: { $user }
addCollection-cancel = ❌ Acción cancelada.
addCollection-error-reply = ❌ Responde a un mensaje del usuario para agregar a la colección.
addCollection-error-need-id = ❌ Proporciona el ID del personaje.
addCollection-error-invalid-ids = ❌ IDs de personaje inválidos.
addCollection-error-no-char = ❌ No se encontraron personajes en la base de datos.
addCollection-cache-not-found = Colección no encontrada en caché.
addCollection-default-user = usuario

############
# MANEGER USER #
############
maneger-user-unban-btn = Desbanear
maneger-user-ban-btn = Banear

############
# BAN USER #
############
banuser-usage-ban = Usa: /banuser{ $prefix } <opción>\n\nOpciones:\n- ID numérico\n- @username\n- Responder mensaje del usuario
banuser-usage-unban = Usa: /unbanuser{ $prefix } <opción>\n\nOpciones:\n- ID numérico\n- @username\n- Responder mensaje del usuario
banuser-cannot-ban-admin = No se puede banear a un administrador del bot.
banuser-cannot-unban-admin = No se puede desbanear a un administrador del bot.
banuser-success-ban = ¡Usuario { $name } ({ $id }) baneado con éxito!
banuser-success-unban = ¡Usuario { $name } ({ $id }) desbaneado con éxito!
banuser-not-found = Usuario no encontrado en la base de datos.
banuser-list-empty = No hay usuarios baneados.
banuser-list-title = Usuarios baneados:\n{ $list }
banuser-list-error = Error al listar
banuser-ban-error = Error al banear
banuser-unban-error = Error al desbanear
banuser-unknown = Desconocido

############
# STATUS USER #
############
statususer-usage = Usa: /statususer <opción>\n\nOpciones:\n- ID numérico\n- @username\n- Responder mensaje del usuario
statususer-not-found = Usuario #{ $id } no encontrado en el sistema.\n\nEste usuario nunca interactuó con el bot.
statususer-label-id = 🆔 ID:
statususer-label-name = 👱 Nombre:
statususer-label-username = 🌐 Nombre de usuario: @
statususer-label-status = 👀 Estado:
statususer-label-coins = 💰 Monedas:
statususer-label-collection = 📦 Colección: { $count } personajes
statususer-label-entry = ⤵️ Entrada:
statususer-error = Error al obtener información del usuario.
statususer-profile-supremo = Supremo
statususer-profile-super-admin = Super Admin
statususer-profile-admin = Administrador
statususer-profile-moderator = Moderador
statususer-profile-user = Miembro
statususer-profile-banned = Baneado
statususer-profile-unknown = Desconocido

############
# SET RARITY #
############
setrarity-edit-title = ✏️ Editar Rareza:
setrarity-label-current = <b>Actual:</b>
setrarity-label-new = <b>Nuevo:</b>
setrarity-label-name = • Nombre:
setrarity-label-emoji = • Emoji:
setrarity-label-emoji-id = • Emoji ID:
setrarity-label-description = • Descripción:
setrarity-value-null = null (borrar)
setrarity-value-undefined = -
setrarity-value-not-defined = No definido
setrarity-value-not-set = no definido
setrarity-btn-name = ✏️ Nombre
setrarity-btn-emoji = 😀 Emoji
setrarity-btn-emoji-id = 🆔 Emoji ID
setrarity-btn-description = 📝 Descripción
setrarity-btn-save = 💾 Guardar
setrarity-btn-back-list = ⬅️ Volver a la lista
setrarity-btn-prev = ⬅️
setrarity-btn-next = ➡️
setrarity-empty = ❌ No se encontraron rarezas.
setrarity-select-page = Selecciona la rareza para editar (Página { $page }/{ $totalPages }):
setrarity-not-found-id = ❌ Rareza no encontrada: "{ $input }"
setrarity-cancel = ❌ Edición cancelada.
setrarity-invalid-data = Datos inválidos.
setrarity-not-found = Rareza no encontrada.
setrarity-no-changes = No hay cambios para guardar.
setrarity-success = ✅ ¡Rareza <b>{ $name }</b> guardada con éxito!
setrarity-success-values = <b>Valores guardados:</b>
setrarity-error-save = Error al guardar.
setrarity-prompt-field = ✏️ Envía el nuevo { $label } para la rareza { $name } ({ $code }):\n\n<b>Valor actual:</b> { $current }
setrarity-field-name = nombre
setrarity-field-emoji = emoji
setrarity-field-emoji-id = emoji ID
setrarity-field-description = descripción

############
# BACKUP #
############
backup-title = Gestión de copia de seguridad de tu cuenta
backup-btn-create = Crear contraseña
backup-btn-restore = Recuperar cuenta
backup-btn-change = Cambiar contraseña
backup-btn-remove = Eliminar contraseña
backup-btn-info = Cómo funciona
backup-open-private-label = Este es un asunto privado, vamos al PV :3.
backup-open-private-btn = Abrir en Privado
backup-info-text = <b>Copia de seguridad</b>

    La copia de seguridad permite guardar y recuperar tu cuenta usando una contraseña.

    <b>Crear:</b> Establece una contraseña para proteger tu cuenta.
    <b>Recuperar:</b> Restaura tus datos usando la contraseña.
    <b>Eliminar:</b> Borra la contraseña de copia.

    Tu contraseña se almacena cifrada (SHA-256) y nadie, ni siquiera el bot :C , puede recuperarla.
backup-password-prompt = Envía la contraseña para crear tu copia:

    La contraseña debe tener al menos 6 caracteres.
    debes recordarla porque yo no la recordaré
backup-password-too-short = La contraseña debe tener al menos 6 caracteres :/.
backup-create-success = Copia creada con éxito :D
backup-create-error = Ya tienes una copia. Elimínala primero.
backup-restore-prompt = Envía la contraseña de tu copia +-+:
backup-restore-success = :D Contraseña correcta! Aquí están tus datos...
backup-restore-error = Contraseña incorrecta :0.
backup-remove-success = Copia eliminada con éxito :P.
backup-remove-confirm = +-+ ¿Seguro que quieres eliminar la copia?
backup-no-backup = -+- No tienes una copia de seguridad.
backup-cancelled = Acción cancelada.
backup-password-saved = Nueva contraseña establecida con éxito :D.

############
# SET EVENT #
############
setevent-edit-title = ✏️ Editar Evento:
setevent-label-current = <b>Actual:</b>
setevent-label-new = <b>Nuevo:</b>
setevent-label-name = • Nombre:
setevent-label-emoji = • Emoji:
setevent-label-emoji-id = • Emoji ID:
setevent-label-description = • Descripción:
setevent-value-null = null (borrar)
setevent-value-not-defined = No definido
setevent-value-not-set = no definido
setevent-btn-name = ✏️ Nombre
setevent-btn-emoji = 😀 Emoji
setevent-btn-emoji-id = 🆔 Emoji ID
setevent-btn-description = 📝 Descripción
setevent-btn-save = 💾 Guardar
setevent-btn-back-list = ⬅️ Volver a la lista
setevent-btn-prev = ⬅️
setevent-btn-next = ➡️
setevent-empty = ❌ No se encontraron eventos.
setevent-select-page = Selecciona el evento para editar (Página { $page }/{ $totalPages }):
setevent-not-found-id = ❌ Evento no encontrado: "{ $input }"
setevent-cancel = ❌ Edición cancelada.
setevent-invalid-data = Datos inválidos.
setevent-not-found = Evento no encontrado.
setevent-no-changes = No hay cambios para guardar.
setevent-success = ✅ ¡Evento <b>{ $name }</b> guardado con éxito!
setevent-success-values = <b>Valores guardados:</b>
setevent-error-save = Error al guardar.
setevent-prompt-field = ✏️ Envía el nuevo { $label } para el evento { $name } ({ $code }):\n\n<b>Valor actual:</b> { $current }
setevent-field-name = nombre
setevent-field-emoji = emoji
setevent-field-emoji-id = emoji ID
setevent-field-description = descripción

############
# COMMAND DESCRIPTIONS #
############
cmd-desc-start = Inicia la configuración del bot
cmd-desc-help = Obtén ayuda e información sobre el bot
cmd-desc-harem = Muestra tu Harén
cmd-desc-random = Trae un personaje aleatorio de la BD
cmd-desc-top = Muestra el top de jugadores
cmd-desc-haremmode = Cambia el modo de visualización de tu Harén
cmd-desc-animelist = Lista de animes por letra
cmd-desc-dominar = Domina un personaje
cmd-desc-fav = Muestra tu personaje favorito
cmd-desc-gift = Regala un personaje a otro usuario
cmd-desc-myinfo = Muestra tu información
cmd-desc-addchar = Agregar un personaje a la base de datos (admin)
cmd-desc-addCollection = Agregar un personaje al harén de un usuario (admin)
cmd-desc-setrarity = Editar configuración de rareza (emoji, nombre, emoji_id)
cmd-desc-setevent = Editar configuración de evento (emoji, nombre, emoji_id)
cmd-desc-logserros = Enviar registros de errores
cmd-desc-logs = Enviar registros generales
cmd-desc-banuser = Banear a un usuario del bot
cmd-desc-unbanuser = Desbanear a un usuario del bot
cmd-desc-listeban = Listar todos los usuarios baneados
cmd-desc-statususer = Ver información de estado del usuario
cmd-desc-dev-forcedrop = Forzar drop de personaje
cmd-desc-dev-getid = Obtener datos del personaje por ID
cmd-desc-dev-createuser = Crear usuario manualmente
cmd-desc-newtopic = Crear un nuevo tema
cmd-desc-renametopic = Renombrar el tema actual
cmd-desc-setactiontopic = Establecer el tema actual como predeterminado para acciones
cmd-desc-closetopic = Cerrar un tema
cmd-desc-deletetopic = Eliminar un tema
cmd-desc-setchattopic = Establecer el tema para mensajes de drop

############
# MISC #
############
dev-cmd-only = Comando solo para desarrollador.
dev-fail-drop = Fallo al dropear personaje
inline-default-btn = 𝕯𝖔𝖒𝖎𝖓𝖆𝖙𝖎𝖔𝖓𝕾
test-create-user-success = Usuario creado con éxito ✅
test-create-user-error = Error al crear usuario ❌
test-log-not-found = Registro no encontrado para hoy.

#############################
random-character

###########################

random-character-yes-text = ㅤㅤ
random-character-no-text = ㅤㅤ

#############################
# SETLANG #
#############################
setlang-title = 🌐 Selecciona el idioma:
setlang-current = Idioma actual: { $lang }
setlang-btn-pt = 🇧🇷 Português
setlang-btn-en = 🇺🇸 English
setlang-btn-es = 🇪🇸 Español
setlang-btn-ja = 🇯🇵 日本語
setlang-success = ✅ Idioma cambiado a { $lang }
setlang-usage = Usa: /setlang <pt|en|es|ja> o /setlang para ver las opciones
setlang-invalid = ❌ Idioma inválido. Idiomas disponibles: pt, en, es, ja
setlang-name-pt = Português
setlang-name-en = English
setlang-name-es = Español
setlang-name-ja = 日本語
cmd-desc-setlang = Cambia el idioma del bot

############################
# ACTIVE CHATS #
############################
activechats-header = <b>📋 Chats activos ({$total}):</b>
activechats-none = No se encontraron chats activos.
activechats-line-group = {$n}. <b>{$title}</b>\n   👥 Grupo | {$count}x | <code>{$chatId}</code>
activechats-line-channel = {$n}. <b>{$title}</b>\n   📢 Canal | {$count}x | <code>{$chatId}</code>
activechats-btn-prev = ◀ Anterior
activechats-btn-next = Siguiente ▶
activechats-btn-close = ❌ Cerrar
activechats-no-name = Sin nombre
activechats-no-access = sin acceso

############################
# ANTI-FLOOD #
############################
use-onLimitExceeded = { $mentionUser } está inundando el chat. no podrá usar el bot por 10 minutos.
