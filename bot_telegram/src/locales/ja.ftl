###############
### GENERAL ###
###############
loading = 読み込み中
Logo_bt = 𝕯𝖔𝖒𝖎𝖓𝖆𝖙𝖎𝖔𝖓𝕾
bot-on-check = オンラインです！
  name:{$nomegroup}
  istopic:{$istopic}


###############
### ERROR ###
###############
error-not-registered = システムに登録されていません。
error-not-id = IDも送信してください
error-not-found-collection = ID { $id } はコレクションにありません
error-action-not-authorized-by-id = 許可されていません
error-group-only = このコマンドはグループでのみ使用できます。
error-forum-only = このコマンドはトピックチャットでのみ使用できます。
error-admin-group-only = グループ管理者のみがこのコマンドを使用できます。
error-admin-bot-only = ボット管理者のみがこのコマンドを使用できます。
error-need-id = キャラクターIDを指定してください。

# gift
error-gift-invalid-user = 無効なユーザーです。
error-gift-self = 自分自身にギフトを送ることはできません。
error-gift-bot = ありがとう、でもギフトは受け取れません。
error-gift-not-id = IDも送信するか、下のボタンから選んでギフトしてください
select-inline-gift = ギフトを選ぶ

# fav
fav-btn-select = お気に入りを選択
error-fav-not-id = IDも送信するか、下から選択してください
error-fav-invalid-char = 無効なキャラクターです。
error-fav-not-owned = ユーザーはこのキャラクターを所有していません。

# permissions
error-permission-denied = ❌ このコマンドを使用する権限が十分ではありません。
error-permission-internal = ❌ 権限の確認中に内部エラーが発生しました。

# sendmedia
error-sendmedia-unsupported = サポートされていないメディアタイプです。

# test commands
error-test-user-not-id = エラー：識別できないユーザーです。

# callbacks admin
error-callback-admin-only = ❌ 管理者のみが確認できます。
error-callback-expired = ❌ データの有効期限が切れました。コマンドを再実行してください。

edit_char_prompt = キャラクター編集：{ $name }（{ $anime }）

編集する項目を選んでください：

btn-edit-name = 名前
btn-edit-anime = 出典
btn-edit-media = メディア
btn-edit-rarity = レアリティ

edit_char_select = 編集中：<b>{ $name }</b>（{ $anime }）
error-bot-no-permission-topics = ボットにトピック管理権限がありません。ボットにトピック管理権限を付与してください。
error-reply-topic = 変更したいトピックのメッセージに返信してください。
error-topic-name = トピックの新しい名前を入力してください。
error-topic-id = 無効なトピックIDです。
error-topic-create = トピックの作成中にエラーが発生しました。
error-topic-rename = トピックの名前変更中にエラーが発生しました。
error-topic-close = トピックのクローズ中にエラーが発生しました。
error-topic-delete = トピックの削除中にエラーが発生しました。

newtopic-success = トピック「{ $topicName }」を作成しました！
renametopic-success = トピックを「{ $topicName }」に変更しました！
closetopic-success = トピックをクローズしました！
deletetopic-success = トピックを削除しました！
setactiontopic-success = デフォルトアクショントピックを設定しました！

###############
### BUTTONS ###
###############
btn-yes = ✅ はい
btn-no = ❌ いいえ
btn-close = 🗑 閉じる



###############
### WELCOME ###
###############
start-greeting-header = こんにちは、私は{ $botName }です
start-greeting-body = 機能：チャットに{ $genero }を出現させ、ユーザーが捕獲できるようにします。
start-greeting-extra-body = 使い方：グループに追加してください。

start-btn-add = 追加+
start-btn-help = ヘルプ
start-btn-database = データベース
start-btn-colaboradores = コラボレーター

###############
## HELP ##
###############
help-caption = ヘルプ

    こんにちは！私の名前は{ $botName }です。メンバーが{ $genero }を支配するためのジェネレーターです。ユーザートップ、警告システム、メモシステム、コレクションシステムなど、多くの便利な機能があります。

    便利なコマンド：
    - /start：起動！おそらくもうお使いでしょう。
    - /help：このメッセージを送信します。私についてもっと詳しく説明します！
    - /dominar：このコマンドとキャラクター名を送信して捕獲します。

    - /donate：私とクリエイターをサポートする方法を提供します。
    エラーや使い方について質問がある場合は、ウェブサイトをご覧いただくか、@までお問い合わせください。

    すべてのコマンドは次のもので使用できます：/

help-group-redirect = ヘルプはこちらをクリック！


help-text-comment-harem = <b>ハーレム</b>

    ハーレムは、<code>/dominar</code>コマンドを使って集めたキャラクターのコレクションです。<code>/{$commandharem}</code>または<code>/{$commandharem2}</code>コマンドを使うと、コレクション内のキャラクターが一覧表示されます。

    使用時に表示されるメディアは、最初に支配したキャラクターとして設定されたお気に入りです。
    お気に入りを変更できますか？はい。<code>/{$commandFav}</code>コマンドをコレクション内のキャラクターIDと一緒に使用してください。

    <b>ハーレムモード</b>
    ハーレムには、<code>/{$command_modeharem}</code>コマンドで変更できるモードがいくつかあります。


help-text-comment-topic = トピック
    ボットを介してトピック設定を管理します。

    トピックは通常のスーパーグループに多くの小さな違いをもたらします。これはチャットでのボットの通常の使い方に影響を与える可能性があります。
    たとえば、特定のフォーラムでは、ボットがメッセージを送信するトピックをカスタマイズして、デフォルトの「一般」チャットに送られないようにしたい場合があります。

    ボットを使用してトピックの作成、名前変更、クローズ、削除もできます。

help-text-comment-dominar = 支配

    このコマンドはキャラクターを捕獲してコレクションに追加するために使用します。
    例：/dominar ナルト

    キャラクターの名前や名字を正しく入力すると、コレクションに追加され、確認メッセージが表示されます。

help-text-comment-adm-bot = <b>ボット管理者</b>

ボット管理者が使用できるコマンド：
help-btn-admBot-manager-character = キャラクター管理
help-btn-admBot-add = 追加
help-btn-admBot-edit = 編集
help-btn-admBot-del = 削除

help-text-comment-admBot-manager-character = <b>キャラクター管理</b>

    データベースのキャラクターを管理します。

help-text-comment-admBot-manager-character-add = <b>キャラクター追加</b>

    コマンドを使用：<code>/{$commandaddchar} 名前, (アニメ/映画/...)</code>

    このコマンドはメディア（写真または動画）への返信として、またはメディアのキャプションとして送信する必要があります。
    管理者の場合、保存前に情報を編集できる確認メッセージが表示されます。

    レアリティコード（<code>r00</code>）またはエディション（<code>e00</code>）を指定すると、自動的に設定されます：
    <code>{$commandaddchar} 名前, (アニメ...), r5</code>
    <code>{$commandaddchar} 名前, (アニメ...), r5, e6</code>

    <code>noconf</code>を追加すると、確認なしでメディアが保存されます。
    <code>r5</code>または<code>e6</code>が指定されない場合、値はランダムに設定されます。




help-text-comment-admBot-manager-character-edit = <b>キャラクター編集</b>

    <code>/editchar id</code>を使用して既存のキャラクターを編集します。

help-text-comment-admBot-manager-character-del = <b>キャラクター削除</b>

    <code>/rmchar id</code>を使用してキャラクターを削除します。

# btn comandos (help-btn-comandos)
help-btn-comandos = コマンド
help-btn-comment-harem = ハーレム
help-btn-comment-topic = トピック
help-btn-comment-dominar = 支配
help-btn-comment-admBot = ボット管理者
help-btn-comment-admBot-manager-character = キャラクター追加




help-label-commmads-user = ユーザー
help-label-commmads-admin-gruop = グループ管理者
help-label-commmads-admin-bt = ボット管理者

help-btn-open-pm = PMで開く
help-btn-back = 戻る
help-btn-close = 🗑

help-select-category = カテゴリを選択：
help-title-commands-user = <b>ユーザーコマンド</b>

help-title-commands-admin = <b>グループ管理者コマンド</b>

help-title-commands-botadmin = <b>ボット管理者コマンド</b>
help-error-botadmin = ボット管理者のみがこれらのコマンドを表示できます。
help-error-botadmin-user = あなたは{ $level }です。管理者のみがこれらのコマンドを表示できます。





###############
### MYINFO ###
###############
myinfo-title = 📊 あなたの情報
myinfo-user = 👤 ユーザー：{ $name }
myinfo-id = 🆔 ID：<code>{ $id }</code>
myinfo-total = 📦 { $genero }合計：{ $total }
myinfo-harem = ❤️ ハーレム：{ $userTotal } / { $dbTotal }（{ $percent }%）
myinfo-progress = 📈 進捗：{ $bar }

myinfo-end = ─────────────
###############
# NEW GROUP #
###############

add_bot_new_group = ✅ 新しいグループに追加されました！
    🏷 グループ名：{ $name }
    🆔 グループID：{ $id }
    👤 追加者：{ $user }

thank-you-add-group = グループ<b>{ $groupName }</b>に追加してくれてありがとう！これからも貢献してください :D 40コインを獲得しました！


###############
# DROP CHARACTER #
###############
new_character_secret_caption = { $emoji_raridade }{ $charater_genero }が現れた！
    捕獲：/dominar <code>名前</code>

drop_character_secret_caption = { $charater_genero }は逃げ出した！
    名前は<code>{ $charater_nome } - { $charater_anime }</code>

drop_character_attempt_empty = OK、でも{ $genero }の名前は？
drop_character_secret_btn = 詳細

# gender inline strings
drop-gender-husbando = ハズバンド
drop-gender-waifu = ワイフ
form-caption-gender-waifu = ワイフ
form-caption-gender-husbando = ハズバンド
create-caption-gender-waifu = このワイフ
create-caption-gender-husbando = このハズバンド

###############
# fav character #
###############

fav-character = このキャラクターをお気に入りにしますか？
    <code>{ $id_personagem } { $character_name } - { $character_anime }</code>

fav-character-success = お気に入りを更新しました
fav-not-found = あなたのハーレムにはこの{ $genero }はいません。
fav-check-harem = \n\n ハーレムを確認 /{ $cmd }{ $genero }s


###############
# GIFT #
###############

gift_confirmation_message = 本当に以下のキャラクターをギフトしますか？

 <code>{ $character_name } - { $character_anime }</code>

 を{ $username }に？

gift_reply_instruction = 相手のメッセージに返信 <code>/{ $command } 46</code>
gift_success = { $user }にギフトを送信しました！
gift_success_multi = { $user }に{ $count }個のギフトを送信しました！
gift_confirmation_message_multi = 本当に{ $qty }x <code>{ $character_name } - { $character_anime }</code>を{ $username }にギフトしますか？

gift-default-username = ユーザー


############
# DOMINAR #
############
not-charater-to-dominar = 現在支配できるキャラクターはいません。
dominar_locked = ⏳ 別の捕獲が進行中です。しばらくお待ちください。
drop_character_attempt_incorrect = <tg-emoji emoji-id="5210952531676504517">❌</tg-emoji> 名前が違います！
drop_character_attempt_incorrect_btn = もう一度試す
# genero (a waifu / a husbando)
#
success_dominar_title = <tg-emoji emoji-id="5355035722246016995">✅</tg-emoji> <b>{ $usermention }が{ $genero }を支配した！</b>
success_dominar_name = 🏷 <b>名前：</b>{ $character_name }
success_dominar_rarity = { $rarity } <b>レアリティ：</b>{ $rarity_name } { $emoji_event }
success_dominar_anime = 📺 <b>アニメ：</b>{ $anime }
success_dominar_event = 🆔 <b>ID：</b>{ $id }
success_dominar_time = ⏱ <b>かかった時間：</b><code>{ $time }</code>
success_dominar_btn = マイハーレム
success-dominar-fallback = 新しいキャラクターを獲得しました！
success-dominar-genero-waifu = ワイフ
success-dominar-genero-husbando = ハズバンド


############
# HAREM #
############
# genero (this waifu / this husbando)
harem_inline_caption_title = わあ！{ $genero }を見て{ $usermention }
harem_inline_caption_name = <b>{ $character_name }</b>
harem_inline_caption_info = { $id } : { $anime } { $emoji_event } { $repitition }
harem_inline_caption_rarity = レアリティ：{ $rarity_name } { $rarity_emoji }
harem_inline_caption_event = { $emoji_event } { $event_name } { $emoji_event }
harem_logo = { $usermention } ๛ハーレム ツ

harem-open-id-not-found = ユーザーが見つからないか存在しません（@... を使用しても、最近変更された可能性があるため正しく機能しない場合があります）
harem_btn_inline_query = 🌐
harem_btn_prev_page = ⬅️
harem_btn_current_page = [{ $currentpage }/{ $totalpages }]
harem_btn_fast_page = ⚡️²
harem_btn_next_page = ➡️
harem_btn_close = 🗑
harem_btn_web_app = 🌐 web
harem_no_user = ハーレムがありません
harem-empty = キャラクターがいません。
harem-no-event = イベントなし
harem-unknown-anime = 不明
harem-rarity-header = \n🔸 <b>{ $name }</b>\n
harem-rarity-header-cont = \n🔸 <b>{ $name }（続き）</b>\n
harem-event-header = \n🔹 <b>{ $name }</b>\n
harem-event-header-cont = \n🔹 <b>{ $name }（続き）</b>\n
harem-anime-header = \n☛ <b>{ $name }</b>（{ $userCount }/{ $dbTotal }）\n✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧\n
harem-anime-header-cont = \n☛ <b>{ $name }（続き）</b>\n✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧\n
harem-line-format = ➢ ꙳ <code>{ $id }</code> ꙳ { $rarity } ꙳ <b>{ $name }</b>{ $events } { $count }x\n

############
# HAREM MODES
############
rarity_emoji_local = <tg-emoji emoji-id="5325547803936572038">✨</tg-emoji>
lapis = <tg-emoji emoji-id="5395444784611480792">✏️</tg-emoji>


harem_mode_recent_nome = { lapis } 名前：{ $nome }
harem_mode_recent_id = 🆔 ID：<code>{ $id }</code>
harem_mode_recent_rarity = { $rarity_emoji } レアリティ：{ $rarity_name }
harem_mode_recent_anime = { rarity_emoji_local } { $sourceType }：{ $anime }







############
# TOP #
############

top_header = トップグローバル { Logo_bt }
top_header_start = -----------------
top_header_end = -----------------
top_pre_index = ┣
top_user_btn = 自分の順位
top_btn_close = 🗑
top-empty = まだランキングにユーザーがいません。
topcb-not-identified = あなたを識別できませんでした。
topcb-not-ranked = まだランキングに入っていません。
topcb-position = 🏆 あなたの順位：{ $position }\n📊 合計：{ $total }

############



############
# ADD CHARACTER #
############
add_character_confirm = ⚕ ᴀᴅᴅᴇᴅ ʙʏ：{ $usermention }

add_character_not_info = メディアファイル、アニメ、またはキャラクターが不足しています

add_character_btn_confirm = はい
add_character_btn_cancel = いいえ
add_character_btn_edit = 編集
add_character_not_reply = メディア（写真/動画）への返信で使用してください
add-char-only-photo-video = 写真または動画のみ対応しています。
add-char-usage = 使用方法：名前, アニメ, 追加情報
add-char-queue = 📦 キャラクターがキューに追加されました（位置 { $pos }）。まもなく処理されます...
add-char-error = キャラクター追加エラー：{ $error }
add-char-success = キャラクターを追加しました！
add-char-preview = 名前：{ $nome }\nアニメ：{ $anime }\n性別：{ $genero }\nメディアタイプ：{ $mediatype }\nデータ：{ $media }\nリンク：{ $link }\nレアリティ：{ $rarities }\nイベント：{ $events }
add-char-default-value = デフォルト値
add-char-default-event = イベントなし
add-char-save-error = キャラクターの保存中にエラーが発生しました。

############
# EDIT CHARACTER #
############

edit_character_edit_caption = 名前：{ $nome }
    アニメ：{ $anime }
    性別：{ $genero }
    メディアタイプ：{ $mediatype }
    データ：<code>{ $media }</code>
    レアリティ：{ $rarities }
    イベント：{ $events }

add_character_edit_btn_nome = 名前
add_character_edit_btn_anime = アニメ
add_character_edit_btn_events = イベント
add_character_edit_btn_rarities = レアリティ
add_character_edit_btn_confirm = 保存

edit_character_prompt_nome = ✏️ 新しい名前を送信してください：
    <b>現在：</b>{ $current }
edit_character_prompt_anime = ✏️ 新しいアニメを送信してください：
    <b>現在：</b>{ $current }
edit_character_prompt_events = ✏️ イベントIDをカンマ区切りで送信してください：
    <b>現在：</b>{ $current }
edit_character_prompt_rarities = ✏️ レアリティIDをカンマ区切りで送信してください：
    <b>現在：</b>{ $current }
edit-char-info = 🆔 ID：{ $id }
📛 名前：{ $name }
📺 アニメ：{ $origem }

query_not_fould = 結果が見つかりませんでした

############
# ANIMELIST #
############
animelist-select-letter = アルファベットから文字を選択：\n\n
animelist-no-anime = 文字{ $letter }で始まるアニメは見つかりませんでした
animelist-header = { $letter }で始まるアニメ（{ $total }）
animelist-page = ページ { $page }/{ $totalPages }
animelist-instruction = アニメをクリックしてキャラクターを表示
animelist-btn-back = 🔙 メニュー
animelist-btn-prev = ◀️
animelist-btn-next = ▶️

############
# HAREM MODE #
############
haremmode-default = デフォルト
haremmode-recent = 最近
haremmode-rarity = レアリティ順
haremmode-event = イベント順
haremmode-caption = ハーレムの表示方法を選択
haremmodecb-user-not-found = ユーザーが見つかりません。
haremmodecb-no-update = 更新されませんでした。ハーレムが空か、同じモードを再度選択した可能性があります。
haremmodecb-selected = 選択されたモード：<b>{ $mode }</b>
haremmodecb-updated = モードを{ $mode }に更新しました！

############
# TOPIC CONFIG #
############
error-topic-group-only = ❌ このコマンドはグループでのみ使用できます。
error-topic-reply-msg = ❌ グループメッセージに返信してトピックを設定してください。\n\n使い方：/setchattopic をメッセージに返信
error-topic-not-topic = ❌ 返信したメッセージはトピックからのものではありません。\n\nフォーラムのトピックメッセージに返信してこのコマンドを使用してください。
error-topic-not-admin = ❌ グループ管理者のみがこのコマンドを使用できます。
topic-config-success = ✅ トピックを設定しました！\n\n📝 トピックID：{ $topicId }\n\nすべてのドロップメッセージはこのトピックに送信されます。

############
# ADD COLLECTION #
############
addCollection-btn-yes = ✅ はい
addCollection-btn-no = ❌ いいえ
addCollection-btn-view-harem = ハーレムを見る
addCollection-btn-view-collection = コレクションを見る
addCollection-confirm = キャラクター（{ $count }）：\n{ $list }\n\n{ $invalid }\n\n{ $user }のコレクションに追加しますか？
addCollection-success-single = ✅ キャラクターをコレクションに追加しました！\n\n追加者：{ $user }
addCollection-success-multi = ✅ キャラクターをコレクションに追加しました！\n\n追加者：{ $user }
addCollection-cancel = ❌ アクションがキャンセルされました。
addCollection-error-reply = ❌ ユーザーのメッセージに返信してコレクションに追加してください。
addCollection-error-need-id = ❌ キャラクターIDを指定してください。
addCollection-error-invalid-ids = ❌ 無効なキャラクターIDです。
addCollection-error-no-char = ❌ データベースにキャラクターが見つかりません。
addCollection-cache-not-found = キャッシュにコレクションが見つかりません。
addCollection-default-user = ユーザー

############
# MANEGER USER #
############
maneger-user-unban-btn = BAN解除
maneger-user-ban-btn = BAN

############
# BAN USER #
############
banuser-usage-ban = 使い方：/banuser{ $prefix } <オプション>\n\nオプション：\n- 数値ID\n- @username\n- ユーザーメッセージに返信
banuser-usage-unban = 使い方：/unbanuser{ $prefix } <オプション>\n\nオプション：\n- 数値ID\n- @username\n- ユーザーメッセージに返信
banuser-cannot-ban-admin = ボット管理者をBANできません。
banuser-cannot-unban-admin = ボット管理者のBANを解除できません。
banuser-success-ban = ユーザー{ $name }（{ $id }）をBANしました！
banuser-success-unban = ユーザー{ $name }（{ $id }）のBANを解除しました！
banuser-not-found = データベースにユーザーが見つかりません。
banuser-list-empty = BANされたユーザーはいません。
banuser-list-title = BANされたユーザー：\n{ $list }
banuser-list-error = リスト表示エラー
banuser-ban-error = BANエラー
banuser-unban-error = BAN解除エラー
banuser-unknown = 不明

############
# STATUS USER #
############
statususer-usage = 使い方：/statususer <オプション>\n\nオプション：\n- 数値ID\n- @username\n- ユーザーメッセージに返信
statususer-not-found = ユーザー#{ $id }はシステムに見つかりません。\n\nこのユーザーはボットとやり取りしたことがありません。
statususer-label-id = 🆔 ID：
statususer-label-name = 👱 名前：
statususer-label-username = 🌐 ユーザー名：@
statususer-label-status = 👀 ステータス：
statususer-label-coins = 💰 コイン：
statususer-label-collection = 📦 コレクション：{ $count } キャラクター
statususer-label-entry = ⤵️ 登録日：
statususer-error = ユーザー情報の取得中にエラーが発生しました。
statususer-profile-supremo = 最高
statususer-profile-super-admin = スーパー管理者
statususer-profile-admin = 管理者
statususer-profile-moderator = モデレーター
statususer-profile-user = メンバー
statususer-profile-banned = BAN済み
statususer-profile-unknown = 不明

############
# SET RARITY #
############
setrarity-edit-title = ✏️ レアリティ編集：
setrarity-label-current = <b>現在：</b>
setrarity-label-new = <b>新規：</b>
setrarity-label-name = • 名前：
setrarity-label-emoji = • 絵文字：
setrarity-label-emoji-id = • 絵文字ID：
setrarity-label-description = • 説明：
setrarity-value-null = null（削除）
setrarity-value-undefined = -
setrarity-value-not-defined = 未定義
setrarity-value-not-set = 未設定
setrarity-btn-name = ✏️ 名前
setrarity-btn-emoji = 😀 絵文字
setrarity-btn-emoji-id = 🆔 絵文字ID
setrarity-btn-description = 📝 説明
setrarity-btn-save = 💾 保存
setrarity-btn-back-list = ⬅️ リストに戻る
setrarity-btn-prev = ⬅️
setrarity-btn-next = ➡️
setrarity-empty = ❌ レアリティが見つかりません。
setrarity-select-page = 編集するレアリティを選択（ページ { $page }/{ $totalPages }）：
setrarity-not-found-id = ❌ レアリティが見つかりません：「{ $input }」
setrarity-cancel = ❌ 編集がキャンセルされました。
setrarity-invalid-data = 無効なデータです。
setrarity-not-found = レアリティが見つかりません。
setrarity-no-changes = 保存する変更はありません。
setrarity-success = ✅ レアリティ<b>{ $name }</b>を保存しました！
setrarity-success-values = <b>保存された値：</b>
setrarity-error-save = 保存中にエラーが発生しました。
setrarity-prompt-field = ✏️ レアリティ{ $name }（{ $code }）の新しい{ $label }を送信してください：\n\n<b>現在の値：</b>{ $current }
setrarity-field-name = 名前
setrarity-field-emoji = 絵文字
setrarity-field-emoji-id = 絵文字ID
setrarity-field-description = 説明

############
# BACKUP #
############
backup-title = アカウントバックアップ管理
backup-btn-create = パスワード作成
backup-btn-restore = アカウント復元
backup-btn-change = パスワード変更
backup-btn-remove = パスワード削除
backup-btn-info = 使い方
backup-open-private-label = これはプライベートな内容です、PVで話しましょう :3。
backup-open-private-btn = プライベートで開く
backup-info-text = <b>アカウントバックアップ</b>

    パスワードを使ってアカウントを保存・復元できます。

    <b>作成：</b>パスワードを設定してアカウントを保護。
    <b>復元：</b>パスワードを使ってデータを復元。
    <b>削除：</b>バックアップパスワードを削除。

    パスワードは暗号化（SHA-256）されて保存され、ボット :C でも復元できません。
backup-password-prompt = バックアップ作成のパスワードを送信：

    パスワードは6文字以上必要です。
    自分で覚えておいてください、ボットは覚えません
backup-password-too-short = パスワードは6文字以上必要です :/。
backup-create-success = バックアップを作成しました :D
backup-create-error = すでにバックアップがあります。先に削除してください。
backup-restore-prompt = バックアップのパスワードを送信 +-+：
backup-restore-success = :D パスワードが正しいです！データはこちら...
backup-restore-error = パスワードが違います :0。
backup-remove-success = バックアップを削除しました :P。
backup-remove-confirm = +-+ バックアップを削除してもよろしいですか？
backup-no-backup = -+- バックアップがありません。
backup-cancelled = アクションがキャンセルされました。
backup-password-saved = 新しいパスワードを設定しました :D。

############
# SET EVENT #
############
setevent-edit-title = ✏️ イベント編集：
setevent-label-current = <b>現在：</b>
setevent-label-new = <b>新規：</b>
setevent-label-name = • 名前：
setevent-label-emoji = • 絵文字：
setevent-label-emoji-id = • 絵文字ID：
setevent-label-description = • 説明：
setevent-value-null = null（削除）
setevent-value-not-defined = 未定義
setevent-value-not-set = 未設定
setevent-btn-name = ✏️ 名前
setevent-btn-emoji = 😀 絵文字
setevent-btn-emoji-id = 🆔 絵文字ID
setevent-btn-description = 📝 説明
setevent-btn-save = 💾 保存
setevent-btn-back-list = ⬅️ リストに戻る
setevent-btn-prev = ⬅️
setevent-btn-next = ➡️
setevent-empty = ❌ イベントが見つかりません。
setevent-select-page = 編集するイベントを選択（ページ { $page }/{ $totalPages }）：
setevent-not-found-id = ❌ イベントが見つかりません：「{ $input }」
setevent-cancel = ❌ 編集がキャンセルされました。
setevent-invalid-data = 無効なデータです。
setevent-not-found = イベントが見つかりません。
setevent-no-changes = 保存する変更はありません。
setevent-success = ✅ イベント<b>{ $name }</b>を保存しました！
setevent-success-values = <b>保存された値：</b>
setevent-error-save = 保存中にエラーが発生しました。
setevent-prompt-field = ✏️ イベント{ $name }（{ $code }）の新しい{ $label }を送信してください：\n\n<b>現在の値：</b>{ $current }
setevent-field-name = 名前
setevent-field-emoji = 絵文字
setevent-field-emoji-id = 絵文字ID
setevent-field-description = 説明

############
# COMMAND DESCRIPTIONS #
############
cmd-desc-start = ボット設定を開始
cmd-desc-help = ボットのヘルプと情報を表示
cmd-desc-harem = ハーレムを表示
cmd-desc-random = DBからランダムなキャラクターを表示
cmd-desc-top = トッププレイヤーを表示
cmd-desc-haremmode = ハーレム表示モードを変更
cmd-desc-animelist = アニメリスト（文字別）
cmd-desc-dominar = キャラクターを支配
cmd-desc-fav = お気に入りキャラクターを表示
cmd-desc-gift = キャラクターを他のユーザーにギフト
cmd-desc-myinfo = あなたの情報を表示
cmd-desc-addchar = データベースにキャラクターを追加（管理者）
cmd-desc-addCollection = ユーザーのハーレムにキャラクターを追加（管理者）
cmd-desc-setrarity = レアリティ設定を編集（絵文字、名前、絵文字ID）
cmd-desc-setevent = イベント設定を編集（絵文字、名前、絵文字ID）
cmd-desc-logserros = エラーログを送信
cmd-desc-logs = 一般ログを送信
cmd-desc-banuser = ユーザーをBAN
cmd-desc-unbanuser = ユーザーのBANを解除
cmd-desc-listeban = BANされたユーザーの一覧
cmd-desc-statususer = ユーザーのステータス情報を表示
cmd-desc-dev-forcedrop = キャラクタードロップを強制
cmd-desc-dev-getid = IDでキャラクターデータを取得
cmd-desc-dev-createuser = 手動でユーザーを作成
cmd-desc-newtopic = 新しいトピックを作成
cmd-desc-renametopic = 現在のトピック名を変更
cmd-desc-setactiontopic = 現在のトピックをアクションのデフォルトに設定
cmd-desc-closetopic = トピックを閉じる
cmd-desc-deletetopic = トピックを削除
cmd-desc-setchattopic = ドロップメッセージのトピックを設定

############
# MISC #
############
dev-cmd-only = 開発者専用コマンドです。
dev-fail-drop = キャラクタードロップに失敗しました
inline-default-btn = 𝕯𝖔𝖒𝖎𝖓𝖆𝖙𝖎𝖔𝖓𝕾
test-create-user-success = ユーザーを作成しました ✅
test-create-user-error = ユーザー作成エラー ❌
test-log-not-found = 今日のログは見つかりませんでした。

#############################
random-character

###########################

random-character-yes-text = ㅤㅤ
random-character-no-text = ㅤㅤ

#############################
# SETLANG #
#############################
setlang-title = 🌐 言語を選択：
setlang-current = 現在の言語：{ $lang }
setlang-btn-pt = 🇧🇷 Português
setlang-btn-en = 🇺🇸 English
setlang-btn-es = 🇪🇸 Español
setlang-btn-ja = 🇯🇵 日本語
setlang-success = ✅ 言語を{ $lang }に変更しました
setlang-usage = 使い方：/setlang <pt|en|es|ja> または /setlang でオプション表示
setlang-invalid = ❌ 無効な言語です。利用可能な言語：pt, en, es, ja
setlang-name-pt = Português
setlang-name-en = English
setlang-name-es = Español
setlang-name-ja = 日本語
cmd-desc-setlang = ボットの言語を変更

############################
# ACTIVE CHATS #
############################
activechats-header = <b>📋 アクティブチャット ({$total}):</b>
activechats-none = アクティブなチャットが見つかりません。
activechats-line-group = {$n}. <b>{$title}</b>\n   👥 グループ | {$count}x | <code>{$chatId}</code>
activechats-line-channel = {$n}. <b>{$title}</b>\n   📢 チャンネル | {$count}x | <code>{$chatId}</code>
activechats-btn-prev = ◀ 前へ
activechats-btn-next = 次へ ▶
activechats-btn-close = ❌ 閉じる
activechats-no-name = 名前なし
activechats-no-access = アクセス不可

############################
# ANTI-FLOOD #
############################
use-onLimitExceeded = { $mentionUser }がチャットに大量送信しています。10分間ボットを使用できません。
