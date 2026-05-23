###############
### GENERAL ###
###############
loading = loading
Logo_bt = 𝕯𝖔𝖒𝖎𝖓𝖆𝖙𝖎𝖔𝖓𝕾
bot-on-check = I am online !
  name:{$nomegroup}
  istopic:{$istopic}


###############
### ERROR ###
###############
error-not-registered = You are not registered in the system yet.
error-not-id = Send the ID too
error-not-found-collection = ID { $id } is not in your collection
error-action-not-authorized-by-id = Not authorized
error-group-only = This command must be used in a group.
error-forum-only = This command can only be used in topic chats.
error-admin-group-only = Only group administrators can use this command.
error-admin-bot-only = Only bot administrators can use this command.
error-need-id = Provide the character ID.

# gift
error-gift-invalid-user = Invalid user.
error-gift-self = You cannot send a gift to yourself.
error-gift-bot = Thanks, but I cannot receive gifts.
error-gift-not-id = Send the ID too, or choose using the button below to gift
select-inline-gift = choose the gift

# fav
fav-btn-select = select your favorite
error-fav-not-id = Send the ID too or select below
error-fav-invalid-char = Invalid character.
error-fav-not-owned = User does not own the character.

# permissions
error-permission-denied = ❌ You do not have enough permission to use this command.
error-permission-internal = ❌ An internal error occurred while checking your permissions.

# sendmedia
error-sendmedia-unsupported = Unsupported media type.

# test commands
error-test-user-not-id = Error: unidentified user.

# callbacks admin
error-callback-admin-only = ❌ Only admins can confirm.
error-callback-expired = ❌ Expired data. Run the command again.

edit_char_prompt = Edit Character: { $name } ({ $anime })

Select what you want to edit:

btn-edit-name = Name
btn-edit-anime = Source
btn-edit-media = Media
btn-edit-rarity = Rarity

edit_char_select = Editing: <b>{ $name }</b> ({ $anime })
error-bot-no-permission-topics = The bot does not have permission to manage topics. Grant topic management permission to the bot.
error-reply-topic = Reply to a message from the topic you want to modify.
error-topic-name = Provide the new name for the topic.
error-topic-id = Invalid topic ID.
error-topic-create = Error creating topic.
error-topic-rename = Error renaming topic.
error-topic-close = Error closing topic.
error-topic-delete = Error deleting topic.

newtopic-success = Topic "{ $topicName }" created successfully!
renametopic-success = Topic renamed to "{ $topicName }"!
closetopic-success = Topic closed successfully!
deletetopic-success = Topic deleted successfully!
setactiontopic-success = Default action topic configured!

###############
### BUTTONS ###
###############
btn-yes = ✅ Yes
btn-no = ❌ No
btn-close = 🗑 Close



###############
### WELCOME ###
###############
start-greeting-header = Greetings, I am { $botName }
start-greeting-body = What I do: I make { $genero } appear in your chat for users to capture.
start-greeting-extra-body = How to use me: Add me to your group.

start-btn-add = Aᴅᴅ+
start-btn-help = Hᴇʟᴘ
start-btn-database = ᴅᴀᴛᴀʙᴀsᴇ
start-btn-colaboradores = collaborators

###############
## HELP ##
###############
help-caption = Help

    Hello! My name is { $botName }. I am a { $genero } generator for members to dominate. I have many useful features, such as a user top, a warning system, a notes system, and a collection system among other features.

    Useful commands:
    - /start: Start me! You have probably already used this command.
    - /help: Sends this message; I will tell you more about me!
    - /dominar: Send this command plus the character name to capture.

    - /donate: Provides information on how to support me and my creator.
    If you have any errors or questions about how to use me, take a look at my website, or go to @.

    All commands can be used with the following: /

help-group-redirect = Click here for help!


help-text-comment-harem = <b>Harem</b>

    The Harem is a collection of characters you collect using the <code>/dominar</code> command. Using the commands <code>/{$commandharem}</code> or <code>/{$commandharem2}</code> it opens listing the characters in your collection.

    The media that appears when you use it is your favorite set as the first dominated character.
    Can I change the favorite? Yes. Use the <code>/{$commandFav}</code> command along with the ID of a character in your collection.

    <b>Harem Mode</b>
    The harem has some modes available that can be changed with the <code>/{$command_modeharem}</code> command.


help-text-comment-topic = topics
    Manage topic settings through the bot!

    Topics introduce many small differences in regular supergroups; this can affect how you usually use the bot in your chat.
    For example, certain forums may want to customize the topic in which the bot sends messages, so they do not end up in the default "general" chat.

    You can also use the bot to create, rename, close, and delete your topics.

help-text-comment-dominar = dominar

    The command is used to capture a character and add it to your collection.
    Example: /dominar naruto

    If you get the character's name or surname right, it will be added to your collection and a feedback message will be displayed.

help-text-comment-adm-bot = <b>Bot Admin</b>

Commands available for bot admins:
help-btn-admBot-manager-character = Manage Characters
help-btn-admBot-add = Add
help-btn-admBot-edit = Edit
help-btn-admBot-del = Remove

help-text-comment-admBot-manager-character = <b>Manage Characters</b>

    Manage the database characters.

help-text-comment-admBot-manager-character-add = <b>Add Character</b>

    Use the command <code>/{$commandaddchar} name, (anime/movie/...)</code>

    The command must be used in reply to media (photo or video) or sent in the media caption.
    If you are an administrator, a confirmation message will be displayed allowing you to edit the information before saving.

    If you provide the rarity code (<code>r00</code>) or edition (<code>e00</code>), they will be set automatically:
    <code>{$commandaddchar} name, (anime...), r5</code>
    <code>{$commandaddchar} name, (anime...), r5, e6</code>

    When adding <code>noconf</code>, the media will be saved without confirmation.
    If <code>r5</code> or <code>e6</code> are not provided, values will be set randomly.




help-text-comment-admBot-manager-character-edit = <b>Edit Character</b>

    Use <code>/editchar id</code> to edit an existing character.

help-text-comment-admBot-manager-character-del = <b>Remove Character</b>

    Use <code>/rmchar id</code> to remove a character.

# btn commands (help-btn-comandos)
help-btn-comandos = Commands
help-btn-comment-harem = harem
help-btn-comment-topic = topic
help-btn-comment-dominar = dominar
help-btn-comment-admBot = bot admins
help-btn-comment-admBot-manager-character = add character




help-label-commmads-user = User
help-label-commmads-admin-gruop = Group Admin
help-label-commmads-admin-bt = Bot Admin

help-btn-open-pm = Open in PM
help-btn-back = Back
help-btn-close = 🗑

help-select-category = Select a category:
help-title-commands-user = <b>User Commands</b>

help-title-commands-admin = <b>Group Admin Commands</b>

help-title-commands-botadmin = <b>Bot Admin Commands</b>
help-error-botadmin = Only bot admins can see these commands.
help-error-botadmin-user = You are { $level }, only admins can see these commands.





###############
### MYINFO ###
###############
myinfo-title = 📊 Your Information
myinfo-user = 👤 User: { $name }
myinfo-id = 🆔 ID: <code>{ $id }</code>
myinfo-total = 📦 Total { $genero }: { $total }
myinfo-harem = ❤️ Harem: { $userTotal } / { $dbTotal } ({ $percent }%)
myinfo-progress = 📈 Progress: { $bar }

myinfo-end = ─────────────
###############
# NEW GROUP #
###############

add_bot_new_group = ✅ I was added to a new group!
    🏷 Group name: { $name }
    🆔 Group ID: { $id }
    👤 Added by: { $user }

thank-you-add-group = Thank you for adding me to the group <b>{ $groupName }</b>! Keep contributing :D You earned 40 coins!


###############
# DROP CHARACTER #
###############
new_character_secret_caption = { $emoji_raridade } { $charater_genero } appeared!
    capture: /dominar <code>Name</code>

drop_character_secret_caption = { $charater_genero } has fled!
    The name is <code>{ $charater_nome } - { $charater_anime }</code>

drop_character_attempt_empty = Ok, but what is the name of the { $genero }?
drop_character_secret_btn = More details

# gender inline strings
drop-gender-husbando = the husbando
drop-gender-waifu = the waifu
form-caption-gender-waifu = A waifu
form-caption-gender-husbando = A husbando
create-caption-gender-waifu = this waifu
create-caption-gender-husbando = this husbando

###############
# fav character #
###############

fav-character = Do you want to make this character your favorite?
    <code>{ $id_personagem } { $character_name } - { $character_anime }</code>

fav-character-success = favorite updated
fav-not-found = You do not have this { $genero } in your Harem.
fav-check-harem = \n\n check your Harem /{ $cmd }{ $genero }s


###############
# GIFT #
###############

gift_confirmation_message = Are you sure you want to gift

 <code>{ $character_name } - { $character_anime }</code>

  to { $username }?

gift_reply_instruction = Reply to a person <code>/{ $command } 46</code>
gift_success = Gift sent successfully to { $user }!
gift_success_multi = You sent { $count } gifts to { $user }!
gift_confirmation_message_multi = Are you sure you want to gift { $qty }x <code>{ $character_name } - { $character_anime }</code> to { $username }?

gift-default-username = User


############
# DOMINAR #
############
not-charater-to-dominar = No character available to dominate at the moment.
dominar_locked = ⏳ Another capture is in progress, please wait a moment.
drop_character_attempt_incorrect = <tg-emoji emoji-id="5210952531676504517">❌</tg-emoji> Incorrect name!
drop_character_attempt_incorrect_btn = Try again
# genero (a waifu / a husbando)
#
success_dominar_title = <tg-emoji emoji-id="5355035722246016995">✅</tg-emoji> <b>{ $usermention } dominated { $genero }!</b>
success_dominar_name = 🏷 <b>Name:</b> { $character_name }
success_dominar_rarity = { $rarity } <b>Rarity:</b> { $rarity_name } { $emoji_event }
success_dominar_anime = 📺 <b>Anime:</b> { $anime }
success_dominar_event = 🆔 <b>ID:</b> { $id }
success_dominar_time = ⏱ <b>Time spent:</b> <code>{ $time }</code>
success_dominar_btn = 𝐌𝐘 𝐇𝐀𝐑𝐄𝐌
success-dominar-fallback = you have a new character!
success-dominar-genero-waifu = a waifu
success-dominar-genero-husbando = a husbando


############
# HAREM #
############
# genero (this waifu / this husbando)
harem_inline_caption_title = wow! look at { $genero } { $usermention }
harem_inline_caption_name = <b>{ $character_name }</b>
harem_inline_caption_info = { $id } : { $anime } { $emoji_event } { $repitition }
harem_inline_caption_rarity = Rarity: { $rarity_name } { $rarity_emoji }
harem_inline_caption_event = { $emoji_event } { $event_name } { $emoji_event }
harem_logo = { $usermention } ๛Harem ツ

harem-open-id-not-found = user not found or does not exist (Using @... may not work well because the user may have changed it recently)
harem_btn_inline_query = 🌐
harem_btn_prev_page = ⬅️
harem_btn_current_page = [{ $currentpage }/{ $totalpages }]
harem_btn_fast_page = ⚡️²
harem_btn_next_page = ➡️
harem_btn_close = 🗑
harem_btn_web_app = 🌐 web
harem_no_user = you do not have a harem
harem-empty = No characters.
harem-no-event = No Event
harem-unknown-anime = Unknown
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


harem_mode_recent_nome = { lapis } Name: { $nome }
harem_mode_recent_id = 🆔 ID: <code>{ $id }</code>
harem_mode_recent_rarity = { $rarity_emoji } Rarity: { $rarity_name }
harem_mode_recent_anime = { rarity_emoji_local } { $sourceType }: { $anime }








############
# TOP #
############

top_header = TOP GLOBAL { Logo_bt }
top_header_start = -----------------
top_header_end = -----------------
top_pre_index = ┣
top_user_btn = 𝐌𝐲 𝐏𝐨𝐬𝐢𝐭𝐢𝐨𝐧
top_btn_close = 🗑
top-empty = No users in the ranking yet.
topcb-not-identified = Could not identify you.
topcb-not-ranked = You are not in the ranking yet.
topcb-position = 🏆 Your position: { $position }\n📊 Total: { $total }

############



############
# ADD CHARACTER #
############
add_character_confirm = ⚕ ᴀᴅᴅᴇᴅ ʙʏ: { $usermention }

add_character_not_info = file_media or anime or character missing

add_character_btn_confirm = Yes
add_character_btn_cancel = No
add_character_btn_edit = edit
add_character_not_reply = use in reply to media video/photo
add-char-only-photo-video = Only photo or video is supported.
add-char-usage = Use: name, anime, extras
add-char-queue = 📦 Character added to queue (position { $pos }). Processing soon...
add-char-error = Error adding character: { $error }
add-char-success = Character added successfully!
add-char-preview = Name: { $nome }\nAnime: { $anime }\nGender: { $genero }\nMediatype: { $mediatype }\nData: { $media }\nLink: { $link }\nRarities: { $rarities }\nEvents: { $events }
add-char-default-value = default value
add-char-default-event = no event
add-char-save-error = Error saving character.

############
# EDIT CHARACTER #
############

edit_character_edit_caption = Name: { $nome }
    Anime: { $anime }
    Gender: { $genero }
    Mediatype: { $mediatype }
    Data: <code>{ $media }</code>
    Rarities: { $rarities }
    Events: { $events }

add_character_edit_btn_nome = Name
add_character_edit_btn_anime = Anime
add_character_edit_btn_events = events
add_character_edit_btn_rarities = rarities
add_character_edit_btn_confirm = save

edit_character_prompt_nome = ✏️ Send the new name:
    <b>Current:</b> { $current }
edit_character_prompt_anime = ✏️ Send the new anime:
    <b>Current:</b> { $current }
edit_character_prompt_events = ✏️ Send the event IDs separated by commas:
    <b>Current:</b> { $current }
edit_character_prompt_rarities = ✏️ Send the rarity IDs separated by commas:
    <b>Current:</b> { $current }
edit-char-info = 🆔 ID: { $id }
📛 Name: { $name }
📺 Anime: { $origem }

query_not_fould = No results found

############
# ANIMELIST #
############
animelist-select-letter = Select a letter from the alphabet:\n\n
animelist-no-anime = No anime found with letter { $letter }
animelist-header = Anime with { $letter } ({ $total })
animelist-page = Page { $page }/{ $totalPages }
animelist-instruction = Click an anime to see its characters
animelist-btn-back = 🔙 Menu
animelist-btn-prev = ◀️
animelist-btn-next = ▶️

############
# HAREM MODE #
############
haremmode-default = Default
haremmode-recent = Recent
haremmode-rarity = By Rarity
haremmode-event = By Event
haremmode-caption = Choose how you want to view your harem
haremmodecb-user-not-found = User not found.
haremmodecb-no-update = Did not update, maybe your harem is empty or you chose the same mode again.
haremmodecb-selected = Mode selected: <b>{ $mode }</b>
haremmodecb-updated = Mode updated successfully to: { $mode }

############
# TOPIC CONFIG #
############
error-topic-group-only = ❌ This command must be used in a group.
error-topic-reply-msg = ❌ Reply to a group message to set the topic.\n\nUse: /setchattopic replying to a message
error-topic-not-topic = ❌ The replied message is not from a topic.\n\nUse this command replying to a message from a forum topic.
error-topic-not-admin = ❌ Only group administrators can use this command.
topic-config-success = ✅ Topic configured!\n\n📝 Topic ID: { $topicId }\n\nNow all drop messages will be sent in this topic.

############
# ADD COLLECTION #
############
addCollection-btn-yes = ✅ Yes
addCollection-btn-no = ❌ No
addCollection-btn-view-harem = View harem
addCollection-btn-view-collection = View collection
addCollection-confirm = Characters ({ $count }):\n{ $list }\n\n{ $invalid }\n\nAdd to { $user }'s collection?
addCollection-success-single = ✅ Character added to collection!\n\nBy: { $user }
addCollection-success-multi = ✅ Characters added to collection!\n\nBy: { $user }
addCollection-cancel = ❌ Action canceled.
addCollection-error-reply = ❌ Reply to a user message to add to collection.
addCollection-error-need-id = ❌ Provide the character ID.
addCollection-error-invalid-ids = ❌ Invalid character IDs.
addCollection-error-no-char = ❌ No characters found in the database.
addCollection-cache-not-found = Collection not found in cache.
addCollection-default-user = user

############
# MANEGER USER #
############
maneger-user-unban-btn = Unban
maneger-user-ban-btn = Ban

############
# BAN USER #
############
banuser-usage-ban = Use: /banuser{ $prefix } <option>\n\nOptions:\n- Numeric ID\n- @username\n- Reply to user message
banuser-usage-unban = Use: /unbanuser{ $prefix } <option>\n\nOptions:\n- Numeric ID\n- @username\n- Reply to user message
banuser-cannot-ban-admin = Cannot ban a bot administrator.
banuser-cannot-unban-admin = Cannot unban a bot administrator.
banuser-success-ban = User { $name } ({ $id }) banned successfully!
banuser-success-unban = User { $name } ({ $id }) unbanned successfully!
banuser-not-found = User not found in the database.
banuser-list-empty = No banned users.
banuser-list-title = Banned users:\n{ $list }
banuser-list-error = Error listing
banuser-ban-error = Error banning
banuser-unban-error = Error unbanning
banuser-unknown = Unknown

############
# STATUS USER #
############
statususer-usage = Use: /statususer <option>\n\nOptions:\n- Numeric ID\n- @username\n- Reply to user message
statususer-not-found = User #{ $id } not found in the system.\n\nThis user has never interacted with the bot.
statususer-label-id = 🆔 ID:
statususer-label-name = 👱 Name:
statususer-label-username = 🌐 Username: @
statususer-label-status = 👀 Status:
statususer-label-coins = 💰 Coins:
statususer-label-collection = 📦 Collection: { $count } characters
statususer-label-entry = ⤵️ Entry:
statususer-error = Error fetching user information.
statususer-profile-supremo = Supreme
statususer-profile-super-admin = Super Admin
statususer-profile-admin = Administrator
statususer-profile-moderator = Moderator
statususer-profile-user = Member
statususer-profile-banned = Banned
statususer-profile-unknown = Unknown

############
# SET RARITY #
############
setrarity-edit-title = ✏️ Edit Rarity:
setrarity-label-current = <b>Current:</b>
setrarity-label-new = <b>New:</b>
setrarity-label-name = • Name:
setrarity-label-emoji = • Emoji:
setrarity-label-emoji-id = • Emoji ID:
setrarity-label-description = • Description:
setrarity-value-null = null (clear)
setrarity-value-undefined = -
setrarity-value-not-defined = Not defined
setrarity-value-not-set = not set
setrarity-btn-name = ✏️ Name
setrarity-btn-emoji = 😀 Emoji
setrarity-btn-emoji-id = 🆔 Emoji ID
setrarity-btn-description = 📝 Description
setrarity-btn-save = 💾 Save
setrarity-btn-back-list = ⬅️ Back to list
setrarity-btn-prev = ⬅️
setrarity-btn-next = ➡️
setrarity-empty = ❌ No rarities found.
setrarity-select-page = Select the rarity to edit (Page { $page }/{ $totalPages }):
setrarity-not-found-id = ❌ Rarity not found: "{ $input }"
setrarity-cancel = ❌ Edit canceled.
setrarity-invalid-data = Invalid data.
setrarity-not-found = Rarity not found.
setrarity-no-changes = No changes to save.
setrarity-success = ✅ Rarity <b>{ $name }</b> saved successfully!
setrarity-success-values = <b>Saved values:</b>
setrarity-error-save = Error saving.
setrarity-prompt-field = ✏️ Send the new { $label } for rarity { $name } ({ $code }):\n\n<b>Current value:</b> { $current }
setrarity-field-name = name
setrarity-field-emoji = emoji
setrarity-field-emoji-id = emoji ID
setrarity-field-description = description

############
# BACKUP #
############
backup-title = Account backup management
backup-btn-create = Create password
backup-btn-restore = Restore account
backup-btn-change = Change password
backup-btn-remove = Remove password
backup-btn-info = How it works
backup-open-private-label = This is a private matter, let's go to PV :3.
backup-open-private-btn = Open in Private
backup-info-text = <b>Account Backup</b>

    Backup allows you to save and restore your account using a password.

    <b>Create backup:</b> Set a password to protect your account.
    <b>Restore:</b> Recover your data using the password.
    <b>Remove:</b> Delete the backup password.

    Your password is stored encrypted (SHA-256) and no one, not even the bot :C , can recover it.
backup-password-prompt = Send the password to create your backup:

    The password must be at least 6 characters.
    you must remember it because I won't remember it
backup-password-too-short = The password must be at least 6 characters :/.
backup-create-success = Backup created successfully :D
backup-create-error = You already have a backup. Remove it first.
backup-restore-prompt = Send your backup password +-+:
backup-restore-success = :D Correct password! Here is your data...
backup-restore-error = Incorrect password :0.
backup-remove-success = Backup removed successfully :P.
backup-remove-confirm = +-+ Are you sure you want to remove the backup?
backup-no-backup = -+- You don't have a backup.
backup-cancelled = Action cancelled.
backup-password-saved = New password set successfully :D.

############
# SET EVENT #
############
setevent-edit-title = ✏️ Edit Event:
setevent-label-current = <b>Current:</b>
setevent-label-new = <b>New:</b>
setevent-label-name = • Name:
setevent-label-emoji = • Emoji:
setevent-label-emoji-id = • Emoji ID:
setevent-label-description = • Description:
setevent-value-null = null (clear)
setevent-value-not-defined = Not defined
setevent-value-not-set = not set
setevent-btn-name = ✏️ Name
setevent-btn-emoji = 😀 Emoji
setevent-btn-emoji-id = 🆔 Emoji ID
setevent-btn-description = 📝 Description
setevent-btn-save = 💾 Save
setevent-btn-back-list = ⬅️ Back to list
setevent-btn-prev = ⬅️
setevent-btn-next = ➡️
setevent-empty = ❌ No events found.
setevent-select-page = Select the event to edit (Page { $page }/{ $totalPages }):
setevent-not-found-id = ❌ Event not found: "{ $input }"
setevent-cancel = ❌ Edit canceled.
setevent-invalid-data = Invalid data.
setevent-not-found = Event not found.
setevent-no-changes = No changes to save.
setevent-success = ✅ Event <b>{ $name }</b> saved successfully!
setevent-success-values = <b>Saved values:</b>
setevent-error-save = Error saving.
setevent-prompt-field = ✏️ Send the new { $label } for event { $name } ({ $code }):\n\n<b>Current value:</b> { $current }
setevent-field-name = name
setevent-field-emoji = emoji
setevent-field-emoji-id = emoji ID
setevent-field-description = description

############
# COMMAND DESCRIPTIONS #
############
cmd-desc-start = Start the bot configuration
cmd-desc-help = Get help and information about the bot
cmd-desc-harem = Show your Harem
cmd-desc-random = Brings a random character from the DB
cmd-desc-top = Show the top players
cmd-desc-haremmode = Change your Harem display mode
cmd-desc-animelist = List animes by letter
cmd-desc-dominar = Dominate a character
cmd-desc-fav = Show your favorite character
cmd-desc-gift = Gift a character to another user
cmd-desc-myinfo = Show your information
cmd-desc-addchar = Add a character to the database (admin)
cmd-desc-addCollection = Add a character to a user's harem (admin)
cmd-desc-setrarity = Edit rarity settings (emoji, name, emoji_id)
cmd-desc-setevent = Edit event settings (emoji, name, emoji_id)
cmd-desc-logserros = Send error logs
cmd-desc-logs = Send general logs
cmd-desc-banuser = Ban a user from the bot
cmd-desc-unbanuser = Unban a user from the bot
cmd-desc-listeban = List all banned users
cmd-desc-statususer = View user status information
cmd-desc-dev-forcedrop = Force character drop
cmd-desc-dev-getid = Get character data by ID
cmd-desc-dev-createuser = Create user manually
cmd-desc-newtopic = Create a new topic
cmd-desc-renametopic = Rename the current topic
cmd-desc-setactiontopic = Set current topic as default for actions
cmd-desc-closetopic = Close a topic
cmd-desc-deletetopic = Delete a topic
cmd-desc-setchattopic = Set the topic for drop messages

############
# MISC #
############
dev-cmd-only = Command for developer only.
dev-fail-drop = Failed to drop character
inline-default-btn = 𝕯𝖔𝖒𝖎𝖓𝖆𝖙𝖎𝖔𝖓𝕾
test-create-user-success = User created successfully ✅
test-create-user-error = Error creating user ❌
test-log-not-found = Log not found for today.

#############################
random-character

###########################

random-character-yes-text = ㅤㅤ
random-character-no-text = ㅤㅤ

#############################
# SETLANG #
#############################
setlang-title = 🌐 Select language:
setlang-current = Current language: { $lang }
setlang-btn-pt = 🇧🇷 Português
setlang-btn-en = 🇺🇸 English
setlang-btn-es = 🇪🇸 Español
setlang-btn-ja = 🇯🇵 日本語
setlang-success = ✅ Language changed to { $lang }
setlang-usage = Use: /setlang <pt|en|es|ja> or /setlang to see options
setlang-invalid = ❌ Invalid language. Available languages: pt, en, es, ja
setlang-name-pt = Português
setlang-name-en = English
setlang-name-es = Español
setlang-name-ja = 日本語
cmd-desc-setlang = Change the bot language

############################
# ANTI-FLOOD #
############################
use-onLimitExceeded = { $mentionUser } is flooding the chat. will not be able to use the bot for 10 minutes.
