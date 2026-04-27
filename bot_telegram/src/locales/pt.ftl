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
error-group-only = Este comando deve ser usado em um grupo.
error-forum-only = Este comando só pode ser usado em chats de tópicos.
error-admin-group-only = Apenas administradores do grupo podem usar este comando.
error-admin-bot-only = Apenas administradores do bot podem usar este comando.
error-need-id = Forneça o ID do personagem.

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
gift_success= Presente enviado com sucesso para { $user }!
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

