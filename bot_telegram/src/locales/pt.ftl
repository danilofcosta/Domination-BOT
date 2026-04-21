###############
### GENERAL ###
###############
loading = ᴄᴀʀʀᴇɢᴀɴᴅᴏ
Logo_bt = 𝕯𝖔𝖒𝖎𝖓𝖆𝖙𝖎𝖔𝖓𝕾



###############
### ERROR ###
###############
error-not-registered = Voce ainda nao esta registrado no sistema.
error-not-id=Manda o ID Também
error-not-found-collection= ID { $id } Não esta presente na sua Coleçaõa
error-action-not-autoauthorized-by-id = Não autorizado

###############
### BUTTONS ###
###############
btn-yes=✅ Sim
btn-no=❌ Não
btn-close=🗑 Fechar



###############
### WELCOME ###
###############
start-greeting-header= Saudações, Eu sou {$botname}
start-greeting-body=  O que eu faço:Eu faço aparecer {$genero} no seu chat para os usuários capturarem
start-greeting-extra-body= Como me usar:Adicione-me ao seu grupo

start-btn-add=Aᴅᴅ+
start-btn-help=Hᴇʟᴘ
start-btn-database = ᴅᴀᴛᴀʙᴀsᴇ
start-btn-colaboradores = colaboradores

###############
## HELP ##
###############
help-caption =
    ℹ️ <b>𝗖𝗲𝗻𝘁𝗿𝗮𝗹 𝗱𝗲 𝗔𝗷𝘂𝗱𝗮</b>
    ───────────────
    Selecione uma categoria abaixo para ver os comandos disponíveis.
    ───────────────
     
help-group-redirect =  Clique aqui para ajuda!

help-btn-comandos = Comandos
help-btn-admin = Admin

help-btn-open-pm = pm
help-btn-back = Voltar
help-btn-close = 🗑 

# Botões de comando (teclado)
help-cmd-dominar = 🗡 Dominar
help-cmd-harem = 🏯 Harém
help-cmd-info = 📊 Info
help-cmd-top = 🏆 Top
help-cmd-fav = ⭐ Fav
help-cmd-gift = 🎁 Gift

# Seções de detalhe
help-section-dominar =
    🗡 <b>Dominar Personagem</b>
    ───────────────
    Use no <b>grupo</b> quando um personagem aparecer.

    <code>/dominar Nome</code>
    → Digita o nome correto do personagem para capturá-lo!

help-section-harem =
    🏯 <b>Meu Harém</b>
    ───────────────
    Veja todos os personagens que você dominou.

    <code>/mywaifus</code> ou <code>/myhusbandos</code>
    → Lista sua coleção com raridade e anime.

help-section-info =
    📊 <b>Minhas Informações</b>
    ───────────────
    Veja seu perfil e progresso no jogo.

    <code>/info</code>
    → Exibe total de personagens, progresso e mais.

help-section-top =
    🏆 <b>Ranking Global</b>
    ───────────────
    Veja quem tem mais personagens no servidor.

    <code>/top</code>
    → Lista os melhores jogadores.

help-section-fav =
    ⭐ <b>Favoritar Personagem</b>
    ───────────────
    Defina um personagem como seu favorito.

    Use em <b>resposta</b> a uma mensagem do harém.
    <code>/fav</code>

help-section-gift =
    🎁 <b>Presentear</b>
    ───────────────
    Dê um personagem seu para outro jogador.

    Use em <b>resposta</b> à mensagem de alguém.
    <code>/gift ID</code>



###############
### MYINFO ###
###############
myinfo-title    = 📊 Suas Informações
myinfo-user     = 👤 Usuário: { $name }
myinfo-id       = 🆔 ID: <code>{ $id }</code>
myinfo-total    = 📦 Total de { $genero }: { $total }
myinfo-harem    = ❤️ Harém: { $userTotal } / { $dbTotal } ({ $percent }%)
myinfo-progress = 📈 Progresso: { $bar }

myinfo-end      = ─────────────
###############
# NEW GROUP #
###############

add_bot_new_group =✅ Fui adicionado a um novo grupo!
    🏷 Nome do grupo: { $name }
    🆔 ID do grupo: { $id }
    👤 Adicionado por: { $user }


###############
# DOPRAR PERSONAGWM#
###############
new_character_secret_caption={$emoji_raridade} {$charater_genero}  apareceu!
    capture :  /dominar <code> Nome </code>

drop_character_secret_caption =  {$charater_genero}  ja fugiu !
    O nome é <code> {$charater_nome} - {$charater_anime} </code>

drop_character_attempt_empty = Ok mais qual nome do {$genero} ?

###############
# fav character#
###############

fav-character=Deseja tornar este personagem seu favorito?
    <code> {$id_personagem}  {$character_name} - {$character_anime} </code>
    
fav-character-success=favorito atualizado
fav-not-found= Você não possui essa {$genero} no seu Harem 


###############
# GIFT #
###############

gift_confirmation_message = Você tem certeza que deseja presentear 

 <code> {$character_name} - {$character_anime} </code> 
 
  para { $username }?

gift_reply_instruction= Manda em reposta a uma pessoa
gift_success= Presente enviado com sucesso!
gift_success_multi = Você enviou { $count } presentes para { $user }!
gift_confirmation_message_multi = Você tem certeza que deseja presentear { $qty }x <code> {$character_name} - {$character_anime} </code> para { $username }?


############
# DOMINAR #
############
not-charater-to-dominar=Nenhum personagem disponível para dominar no momento.
dominar_locked=⏳ Outra captura está em andamento, aguarde um momento.
name-not-found= <tg-emoji emoji-id="5210952531676504517">❌</tg-emoji> Nome incorreto!
bt-tentative-again= Tente novamente
#genero ( uma waifu/um husbando)
#
success_dominar_title = <tg-emoji emoji-id="5355035722246016995">✅</tg-emoji> <b>{ $usermention } dominou { $genero }!</b>
success_dominar_name = 🏷 <b>Nome:</b> { $character_name }
success_dominar_rarity = { $rarity } <b>Raridade:</b>  { $rarity_name }  {$emoji_event}
success_dominar_anime = 📺 <b>Anime:</b> { $anime }
success_dominar_event = 🆔 <b>ID:</b> { $id }
success_dominar_time = ⏱ <b>Tempo gasto:</b> <code>{ $time }</code>
success_dominar_btn = 𝑴𝑬𝑼 𝑯𝑨𝑹𝑬𝑴


############
# HAREM #
############
#genero ( essa waifu/esse husbando)
harem_inline_caption_title =wow! veja  {$genero} {$usermention}
harem_inline_caption_name =  <b>{ $character_name }</b> 
harem_inline_caption_info = {$id} : {$anime}  {$emoji_event} {$repitition}
harem_inline_caption_rarity = Raridade:  { $rarity_name } { $rarity_emoji }
harem_inline_caption_event = {$emoji_event}  { $event_name } {$emoji_event}
harem_logo={$usermention}  ๛Harem ツ

harem_btn_inline_query=🌐
harem_btn_prev_page=⬅️
harem_btn_current_page=[{$currentpage}/{$totalpages}]
harem_btn_fast_page=⚡️²
harem_btn_next_page=➡️
harem_btn_close=🗑
harem_btn_web_app= 🌐 web
harem_no_user = vc nao tem um harem

############
#HAREM MODES
############
rarity_emoji_local=<tg-emoji emoji-id="5325547803936572038">✨</tg-emoji>
lapis=<tg-emoji emoji-id="5395444784611480792">✏️</tg-emoji>


harem_mode_recent_nome ={lapis}Nome : {$nome}
harem_mode_recent_id =🆔 ɪᴅ:<code> {$id} </code>
harem_mode_recent_rarity = {$rarity_emoji} Raridade : {$rarity_name}
harem_mode_recent_anime ={ rarity_emoji_local} {$sourceType} : {$anime}








############
# TOP #
############

top_header= TOP GROBAL {Logo_bt}
top_header_start = -----------------
top_header_end = -----------------
top_pre_index =┣ 
top_user_btn=𝐌𝐢𝐧𝐡𝐚 𝐏𝐨𝐬𝐢𝐜̧𝐚̃𝐨
top_btn_close =🗑

############


############
# ADD CHARACTER #
############
add_character_confirm = ⚕ ᴀᴅᴅᴇᴅ ʙʏ: { $usermention }

add_character_not_info=file_midia ou anime ou personagem faltando

add_character_btn_confirm = Sim
add_character_btn_cancel = Não
add_character_btn_edit = edit
add_character_not_reply = use em resposta a midia video/foto 

############
# EDIT CHARACTER #
############

edit_character_edit_caption =Nome: {$nome}
    Anime: {$anime}
    Genero: {$genero}
    Mediatype: {$mediatype}
    Data: <code>{$media}</code>
    Rarities: {$rarities}
    Events: {$events}

add_character_edit_btn_nome=Nome
add_character_edit_btn_anime = Anime
add_character_edit_btn_events=eventos
add_character_edit_btn_rarities=reridades
add_character_edit_btn_confirm=salvarades
add_character_edit_btn_confirm=salvar

