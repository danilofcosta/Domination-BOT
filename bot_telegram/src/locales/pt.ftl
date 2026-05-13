###############
### GENERAL ###
###############
loading = carregando
Logo_bt = 𝕯𝖔𝖒𝖎𝖓𝖆𝖙𝖎𝖔𝖓𝕾



###############
### ERROR ###
###############
error-not-registered = Voce ainda nao esta registrado no sistema.
error-not-id=Manda o ID Também
error-not-found-collection= ID { $id } Não esta presente na sua Coleçaõa
error-action-not-autoauthorized-by-id = Não autorizado
error-group-only = Este comando deve ser usado em um grupo.
error-forum-only = Este comando só pode ser usado em chats de tópicos.
error-admin-group-only = Apenas administradores do grupo podem usar este comando.
error-admin-bot-only = Apenas administradores do bot podem usar este comando.
error-need-id = Forneça o ID do personagem.

# gift
error-gift-invalid-user = Usuário inválido.
error-gift-self = Você não pode enviar presente para si mesmo.
error-gift-bot = agradeço, Mais não posso receber presentes

# fav
error-fav-invalid-char = Personagem inválido.
error-fav-not-owned = usuário não possui personagem

# permissions
error-permission-denied = ❌ Você não tem permissão suficiente para usar este comando.
error-permission-internal = ❌ Ocorreu um erro interno ao verificar suas permissões.

# sendmedia
error-sendmedia-unsupported = Tipo de mídia não suportado.

# test commands
error-test-user-not-id = Erro: usuário não identificado.

# callbacks admin
error-callback-admin-only = ❌ Apenas admins podem confirmar.
error-callback-expired = ❌ Dados expirados. Execute o comando novamente.
 
edit_char_prompt = Editar Personagem: { $name } ({ $anime })

Selecione o que deseja editar:

btn-edit-name = Nome
btn-edit-anime = Origem
btn-edit-media = Mídia
btn-edit-rarity = Raridade

edit_char_select = Editando: <b>{ $name }</b> ({ $anime })
error-bot-no-permission-topics = O bot não tem permissão para gerir tópicos. Dê permissão de gerir tópicos ao bot.
error-reply-topic = Responda a uma mensagem da topic que deseja modificar.
error-topic-name = Forneça o novo nome para a topic.
error-topic-id = ID da topic inválido.
error-topic-create = Erro ao criar topic.
error-topic-rename = Erro ao renomear topic.
error-topic-close = Erro ao fechar topic.
error-topic-delete = Erro ao eliminar topic.

newtopic-success = Topic "{ $topicName }" criado com sucesso!
renametopic-success = Topic renomeado para "{ $topicName }"!
closetopic-success = Topic fechado com sucesso!
deletetopic-success = Topic eliminado com sucesso!
setactiontopic-success = Tópico de ação predefinido configurado!

###############
### BUTTONS ###
###############
btn-yes=✅ Sim
btn-no=❌ Não
btn-close=🗑 Fechar



###############
### WELCOME ###
###############
start-greeting-header= Saudações, Eu sou {$botName}
start-greeting-body=  O que eu faço:Eu faço aparecer {$genero} no seu chat para os usuários capturarem
start-greeting-extra-body= Como me usar:Adicione-me ao seu grupo

start-btn-add=Aᴅᴅ+
start-btn-help=Hᴇʟᴘ
start-btn-database = ᴅᴀᴛᴀʙᴀsᴇ
start-btn-colaboradores = colaboradores

###############
## HELP ##
###############
help-caption =Ajuda

    Olá! O meu nome é { $botName }. Eu sou  gerador  de  {$genero},  para que o membros posso dominar ,Tenho muitas funcionalidades úteis, como  top com user, um sistema de avisos, um sistema de anotações e sistema de coleção entre outras funcionalidades.
    
    Comandos úteis:
    - /start: Inicia-me! Provavelmente já utilizaste este comando.
    - /help: Envia esta mensagem; vou dizer-te mais sobre mim!
    - /dominar: envia esse comando mais o nome do persogem para capturar.

    - /donate: Fornece-te informações sobre como apoiar-me e o meu criador.
    Se tiveres quaisquer erros ou perguntas sobre como utilizar-me, dá uma vista de olhos no meu website, ou dirige-te para @.

    Todos os comandos podem ser utilizados com o seguinte: /
     
help-group-redirect =  Clique aqui para ajuda!


help-text-comment-harem = <b>Harem</b>

    O Harem é uma coleção de personagens que você coleta usando o comando <code>/dominar</code>. Usando os comandos <code>/{$commandharem}</code> ou <code>/{$commandharem2}</code> ele abre listando os personagens que estão na sua coleção.

    A mídia que aparece quando usa é a sua favorita definida como o primeiro personagem dominado.
    Posso mudar o favorito? Sim. Use o comando <code>/{$commandFav}</code> junto ao ID de um personagem que está em sua coleção.
   
    <b>Modo do Harem</b>
    O harem tem alguns modos disponíveis que podem ser alterados com o comando <code>/{$command_modeharem}</code>


help-text-comment-topic= topicos
    Gerir as definições dos tópicos através do bot!

    Os tópicos introduzem muitas pequenas diferenças nos supergrupos normais; isto pode afetar a forma como geralmente usa o bot  em seu chat.
    Por exemplo, certos fóruns podem querer personalizar o tópico no qual o bot envia mensagens , para que estas não acabem no chat "geral" por defeito.

    Também pode utilizar o bot para criar, renomear, fechar e eliminar os seus tópicos.

help-text-comment-dominar = dominar

    o comando é usado para capturar um personagem / adionar ele em suas coleção 
    exemplo: /dominar naruto 
    
    caso acerta o nome ou sobre nome do persogem ele sera adicionado a sua coleção e sera exibida um mensagem de feedback

help-text-comment-adm-bot = <b>Admin do Bot</b>

Comandos disponíveis para admins do bot:
help-btn-admBot-manager-character = Gerir Personagens
help-btn-admBot-add = Adicionar
help-btn-admBot-edit = Editar
help-btn-admBot-del = Remover

help-text-comment-admBot-manager-character = <b>Gerir Personagens</b> 

    Gerencie os personagens do banco de dados.

help-text-comment-admBot-manager-character-add = <b>Adicionar Personagem</b>

    Use o comando <code>/{$commandaddchar} nome , (anime/filme/...)</code>

    O comando deve ser utilizado em resposta a uma mídia (foto ou vídeo) ou enviado na legenda da mídia.
    Caso seja um administrador, será exibida uma mensagem de confirmação permitindo editar as informações antes de salvar.

    Se você informar o código de raridade (<code>r00 </code>) ou edição (<code>e00</code>), eles serão definidos automaticamente:
    <code>{$commandaddchar} nome, (anime...), r5</code>
    <code>{$commandaddchar} nome, (anime...), r5, e6</code>

    Ao adicionar <code>noconf</code>, a mídia será salva sem confirmação.
    Caso não sejam informados <code>r5</code> ou <code>e6</code>, os valores serão definidos aleatoriamente.




help-text-comment-admBot-manager-character-edit = <b>Editar Personagem</b>

    Use <code>/editchar id</code> para editar um personagem existente.

help-text-comment-admBot-manager-character-del = <b>Remover Personagem</b>

    Use <code>/rmchar id</code> para remover um personagem.
    
#btn comands (help-btn-comandos )
help-btn-comandos = Comandos
help-btn-comment-harem = harem
help-btn-comment-topic = topic
help-btn-comment-dominar = dominar
help-btn-comment-admBot= adms bot
help-btn-comment-admBot-manager-character= adicinar personagem




help-label-commmads-user = Usuario
help-label-commmads-admin-gruop = Admin Grupo
help-label-commmads-admin-bt = Admin Bot

help-btn-open-pm = Abrir no PM
help-btn-back = Voltar
help-btn-close = 🗑

help-select-category = Selecione uma categoria:
help-title-commands-user = <b>Comandos de Usuario</b>

help-title-commands-admin = <b>Comandos Admin do Grupo</b>

help-title-commands-botadmin = <b>Comandos Admin do Bot</b>
help-error-botadmin = Apenas admins do bot podem ver estes comandos.
help-error-botadmin-user = Você é { $level }, apenas admins podem ver estes comandos. 





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
drop_character_secret_btn = Mais detalhes


# gender inline strings
drop-gender-husbando = o husbando
drop-gender-waifu = a waifu
form-caption-gender-waifu = Uma waifu
form-caption-gender-husbando = Um husbando
create-caption-gender-waifu = essa waifu
create-caption-gender-husbando = esse husbando

###############
# fav character#
###############

fav-character=Deseja tornar este personagem seu favorito?
    <code> {$id_personagem}  {$character_name} - {$character_anime} </code>
    
fav-character-success=favorito atualizado
fav-not-found= Você não possui essa {$genero} no seu Harem 
fav-check-harem = \n\n confira seu Harem /{ $cmd }{ $genero }s


###############
# GIFT #
###############

gift_confirmation_message = Você tem certeza que deseja presentear 

 <code> {$character_name} - {$character_anime} </code> 
 
  para { $username }?

gift_reply_instruction= Manda em reposta a uma pessoa <code>/{$command} 46 </code>
gift_success= Presente enviado com sucesso para { $user }!
gift_success_multi = Você enviou { $count } presentes para { $user }!
gift_confirmation_message_multi = Você tem certeza que deseja presentear { $qty }x <code> {$character_name} - {$character_anime} </code> para { $username }?

gift-default-username = Usuário


############
# DOMINAR #
############
not-charater-to-dominar=Nenhum personagem disponível para dominar no momento.
dominar_locked=⏳ Outra captura está em andamento, aguarde um momento.
drop_character_attempt_incorrect = <tg-emoji emoji-id="5210952531676504517">❌</tg-emoji> Nome incorreto!
drop_character_attempt_incorrect_btn= Tente novamente
#genero ( uma waifu/um husbando)
#
success_dominar_title = <tg-emoji emoji-id="5355035722246016995">✅</tg-emoji> <b>{ $usermention } dominou { $genero }!</b>
success_dominar_name = 🏷 <b>Nome:</b> { $character_name }
success_dominar_rarity = { $rarity } <b>Raridade:</b>  { $rarity_name }  {$emoji_event}
success_dominar_anime = 📺 <b>Anime:</b> { $anime }
success_dominar_event = 🆔 <b>ID:</b> { $id }
success_dominar_time = ⏱ <b>Tempo gasto:</b> <code>{ $time }</code>
success_dominar_btn = 𝑴𝑬𝑼 𝑯𝑨𝑹𝑬𝑴
success-dominar-fallback = vc tem um personagem novo!
success-dominar-genero-waifu = uma waifu
success-dominar-genero-husbando = um husbando


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
harem-empty = Nenhum personagem.
harem-no-event = Sem Evento
harem-unknown-anime = Desconhecido
harem-rarity-header = \n🔸 <b>{ $name }</b>\n
harem-rarity-header-cont = \n🔸 <b>{ $name } (cont.)</b>\n
harem-event-header = \n🔹 <b>{ $name }</b>\n
harem-event-header-cont = \n🔹 <b>{ $name } (cont.)</b>\n
harem-anime-header = \n☛ <b>{ $name }</b> ({ $userCount }/{ $dbTotal })\n✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧\n
harem-anime-header-cont = \n☛ <b>{ $name } (cont.)</b>\n✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧\n
harem-line-format = ➢ ꙳ <code>{ $id }</code> ꙳ { $rarity } ꙳ <b>{ $name }</b>{ $events } { $count }x\n

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
top-empty = Nenhum usuário no ranking ainda.
topcb-not-identified = Não foi possível identificar você.
topcb-not-ranked = Você ainda não está no ranking.
topcb-position = 🏆 Sua posição: { $position }\n📊 Total: { $total }

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
add-char-only-photo-video = Only photo or video is supported.
add-char-usage = Use: nome, anime, extras
add-char-queue = 📦 Personagem adicionado à fila (posição { $pos }). Processando em breve...
add-char-error = Erro ao adicionar personagem: { $error }
add-char-success = Personagem adicionado com sucesso!
add-char-preview = Nome: { $nome }\nAnime: { $anime }\nGenero: { $genero }\nMediatype: { $mediatype }\nData: { $media }\nLink: { $link }\nRarities: { $rarities }\nEvents: { $events }
add-char-default-value = valor padrao
add-char-default-event = sem evento
add-char-save-error = Erro ao salvar personagem.

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

query_not_fould = Nenhum resultado encontrado

############
# ANIMELIST #
############
animelist-select-letter = Selecione uma letra do alfabeto:\n\n
animelist-no-anime = Nenhum anime encontrado com a letra { $letter }
animelist-header = Anime com { $letter } ({ $total })
animelist-page = Pagina { $page }/{ $totalPages }
animelist-instruction = Clique em um anime para ver seus personagens
animelist-btn-back = 🔙 Menu
animelist-btn-prev = ◀️
animelist-btn-next = ▶️

############
# HAREM MODE #
############
haremmode-default = Padrão
haremmode-recent = Recentes
haremmode-rarity = Por Raridade
haremmode-event = Por Evento
haremmode-caption = Escolha como você deseja ver seu harém
haremmodecb-user-not-found = Usuário não encontrado.
haremmodecb-no-update = Não atualizou, talvez seu harém esteja vazio ou você escolheu o mesmo modo novamente.
haremmodecb-selected = Modo selecionado: <b>{ $mode }</b>
haremmodecb-updated = Modo atualizado com sucesso para: { $mode }

############
# TOPIC CONFIG #
############
error-topic-group-only = ❌ Este comando deve ser usado em um grupo.
error-topic-reply-msg = ❌ Responda a uma mensagem do grupo para definir o topic.\n\nUse: /setchattopic replying a uma mensagem
error-topic-not-topic = ❌ A mensagem respondida não é de uma topic.\n\nUse este comando respondendo a uma mensagem de uma topic do fórum.
error-topic-not-admin = ❌ Apenas administradores do grupo podem usar este comando.
topic-config-success = ✅ Topic configurado!\n\n📝 Topic ID: { $topicId }\n\nAgora todas as mensagens de drop serão enviadas nesta topic.

############
# ADD COLLECTION #
############
addcolletion-btn-yes = ✅ Sim
addcolletion-btn-no = ❌ Não
addcolletion-btn-view-harem = Ver harém
addcolletion-btn-view-collection = Ver coleção
addcolletion-confirm = Personagens ({ $count }):\n{ $list }\n\n{ $invalid }\n\nAdicionar à coleção do { $user }?
addcolletion-success-single = ✅ Personagem adicionado à coleção!\n\nPor: { $user }
addcolletion-success-multi = ✅ Personagens adicionados à coleção!\n\nPor: { $user }
addcolletion-cancel = ❌ Ação cancelada.
addcolletion-error-reply = ❌ Responda a uma mensagem do usuário para adicionar à coleção.
addcolletion-error-need-id = ❌ Forneça o ID do personagem.
addcolletion-error-invalid-ids = ❌ IDs de personagem inválidos.
addcolletion-error-no-char = ❌ Nenhum personagem encontrado no banco de dados.
addcolletion-cache-not-found = Coleção não encontrada no cache.
addcolletion-default-user = usuário

############
# BAN USER #
############
banuser-usage-ban = Use: /banuser{ $prefix } <opcao>\n\nOpcoes:\n- ID numerico\n- @username\n- Responder mensagem do usuario
banuser-usage-unban = Use: /unbanuser{ $prefix } <opcao>\n\nOpcoes:\n- ID numerico\n- @username\n- Responder mensagem do usuario
banuser-cannot-ban-admin = Nao e possivel banir um administrador do bot.
banuser-cannot-unban-admin = Nao e possivel desbanir um administrador do bot.
banuser-success-ban = Usuario { $name } ({ $id }) banido com sucesso!
banuser-success-unban = Usuario { $name } ({ $id }) desbanido com sucesso!
banuser-not-found = Usuario nao encontrado no banco de dados.
banuser-list-empty = Nenhum usuario banido.
banuser-list-title = Usuarios banidos:\n{ $list }
banuser-list-error = Erro ao listar
banuser-ban-error = Erro ao banir
banuser-unban-error = Erro ao desbanir
banuser-unknown = Desconhecido

############
# STATUS USER #
############
statususer-usage = Use: /statususer <opcao>\n\nOpcoes:\n- ID numerico\n- @username\n- Responder mensagem do usuario
statususer-not-found = Usuario #{ $id } nao encontrado no sistema.\n\nEste usuario nunca interagiu com o bot.
statususer-label-id = 🆔 ID:
statususer-label-name = 👱 Nome:
statususer-label-username = 🌐 Nome de usuario: @
statususer-label-status = 👀 Situacao:
statususer-label-coins = 💰 Moedas:
statususer-label-collection = 📦 Colecao: { $count } personagens
statususer-label-entry = ⤵️ Entrada:
statususer-error = Erro ao buscar informacoes do usuario.
statususer-profile-supremo = Supremo
statususer-profile-super-admin = Super Admin
statususer-profile-admin = Administrador
statususer-profile-moderator = Moderador
statususer-profile-user = Membro
statususer-profile-banned = Banido
statususer-profile-unknown = Desconhecido

############
# SET RARITY #
############
setrarity-edit-title = ✏️ Editar Raridade:
setrarity-label-current = <b>Atual:</b>
setrarity-label-new = <b>Novo:</b>
setrarity-label-name = • Nome:
setrarity-label-emoji = • Emoji:
setrarity-label-emoji-id = • Emoji ID:
setrarity-label-description = • Descrição:
setrarity-value-null = null (apagar)
setrarity-value-undefined = -
setrarity-value-not-defined = Não definido
setrarity-value-not-set = n definido
setrarity-btn-name = ✏️ Nome
setrarity-btn-emoji = 😀 Emoji
setrarity-btn-emoji-id = 🆔 Emoji ID
setrarity-btn-description = 📝 Descrição
setrarity-btn-save = 💾 Salvar
setrarity-btn-back-list = ⬅️ Voltar à lista
setrarity-btn-prev = ⬅️
setrarity-btn-next = ➡️
setrarity-empty = ❌ Nenhuma raridade encontrada.
setrarity-select-page = Selecione a raridade para ser editada (Página { $page }/{ $totalPages }):
setrarity-not-found-id = ❌ Raridade não encontrada: "{ $input }"
setrarity-cancel = ❌ Edição cancelada.
setrarity-invalid-data = Dados inválidos.
setrarity-not-found = Raridade não encontrada.
setrarity-no-changes = Nenhuma alteração para salvar.
setrarity-success = ✅ Raridade <b>{ $name }</b> salva com sucesso!
setrarity-success-values = <b>Valores salvos:</b>
setrarity-error-save = Erro ao salvar.
setrarity-prompt-field = ✏️ Envie o novo { $label } para a raridade { $name } ({ $code }):\n\n<b>Valor atual:</b> { $current }
setrarity-field-name = nome
setrarity-field-emoji = emoji
setrarity-field-emoji-id = emoji ID
setrarity-field-description = descrição

############
# SET EVENT #
############
setevent-edit-title = ✏️ Editar Evento:
setevent-label-current = <b>Atual:</b>
setevent-label-new = <b>Novo:</b>
setevent-label-name = • Nome:
setevent-label-emoji = • Emoji:
setevent-label-emoji-id = • Emoji ID:
setevent-label-description = • Descrição:
setevent-value-null = null (apagar)
setevent-value-not-defined = Não definido
setevent-value-not-set = n definido
setevent-btn-name = ✏️ Nome
setevent-btn-emoji = 😀 Emoji
setevent-btn-emoji-id = 🆔 Emoji ID
setevent-btn-description = 📝 Descrição
setevent-btn-save = 💾 Salvar
setevent-btn-back-list = ⬅️ Voltar à lista
setevent-btn-prev = ⬅️
setevent-btn-next = ➡️
setevent-empty = ❌ Nenhum evento encontrado.
setevent-select-page = Selecione o evento para ser editado (Página { $page }/{ $totalPages }):
setevent-not-found-id = ❌ Evento não encontrado: "{ $input }"
setevent-cancel = ❌ Edição cancelada.
setevent-invalid-data = Dados inválidos.
setevent-not-found = Evento não encontrado.
setevent-no-changes = Nenhuma alteração para salvar.
setevent-success = ✅ Evento <b>{ $name }</b> salvo com sucesso!
setevent-success-values = <b>Valores salvos:</b>
setevent-error-save = Erro ao salvar.
setevent-prompt-field = ✏️ Envie o novo { $label } para o evento { $name } ({ $code }):\n\n<b>Valor atual:</b> { $current }
setevent-field-name = nome
setevent-field-emoji = emoji
setevent-field-emoji-id = emoji ID
setevent-field-description = descrição

############
# COMMAND DESCRIPTIONS #
############
cmd-desc-start = Inicia a configuração do bot
cmd-desc-help = Obtém ajuda e informações sobre o bot
cmd-desc-harem = Mostra o seu Harem
cmd-desc-random = Traz um personagem aleatorio do DB
cmd-desc-top = Mostra o top de jogadores
cmd-desc-haremmode = Altera o modo de visualizacao do seu Harem
cmd-desc-animelist = Lista de animes por letra
cmd-desc-dominar = Domina um personagem
cmd-desc-fav = Mostra o seu personagem favorito
cmd-desc-gift = Presenteia um personagem para outro usuario
cmd-desc-myinfo = Mostra as suas informacoes
cmd-desc-addchar = Adicionar um personagem ao banco de dados (admin)
cmd-desc-addcolletion = Adicionar um personagem ao harem de um user (admin)
cmd-desc-setrarity = Editar configuracoes de raridade (emoji, nome, emoji_id)
cmd-desc-setevent = Editar configuracoes de evento (emoji, nome, emoji_id)
cmd-desc-logserros = Enviar logs de erros
cmd-desc-logs = Enviar logs gerais
cmd-desc-banuser = Banir um usuario do bot
cmd-desc-unbanuser = Desbanir um usuario do bot
cmd-desc-listeban = Listar todos os usuarios banidos
cmd-desc-statususer = Ver informacoes de status do usuario
cmd-desc-dev-forcedrop = Forçar drop de personagem
cmd-desc-dev-getid = Obter dados do personagem por ID
cmd-desc-dev-createuser = Criar usuário manualmente
cmd-desc-newtopic = Criar um novo topic
cmd-desc-renametopic = Renomear o tópico atual
cmd-desc-setactiontopic = Definir o tópico atual como padrão para ações
cmd-desc-closetopic = Fechar um topic
cmd-desc-deletetopic = Eliminar um topic
cmd-desc-setchattopic = Define o topic para mensagens de drop

############
# MISC #
############
dev-cmd-only = Comando apenas para desenvolvedor.
dev-fail-drop = Falha ao dropar character
inline-default-btn = 𝕯𝖔𝖒𝖎𝖓𝖆𝖙𝖎𝖔𝖓𝕾
test-create-user-success = Usuário criado com sucesso ✅
test-create-user-error = Erro ao criar usuário ❌
test-log-not-found = Log não encontrado para hoje.

#############################
random-character

###########################

random-character-yes-text=ㅤㅤ
random-character-no-text =ㅤㅤ

#############################
# SETLANG #
#############################
setlang-title = 🌐 Selecione o idioma:
setlang-current = Idioma atual: { $lang }
setlang-btn-pt = 🇧🇷 Português
setlang-btn-en = 🇺🇸 English
setlang-success = ✅ Idioma alterado para { $lang }
setlang-usage = Use: /setlang <pt|en> ou /setlang para ver as opções
setlang-invalid = ❌ Idioma inválido. Idiomas disponíveis: pt, en
setlang-name-pt = Português
setlang-name-en = English
cmd-desc-setlang = Altera o idioma do bot