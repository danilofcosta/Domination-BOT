export interface localekey {
  key: string;
  localeTraslation: localeTraslation;
  description: string | null;
}
export interface lang {
  lang: string;
  icon: string;
  [key: string]: string;
}
export interface extraKey {
  key: string;
  description: string | null;
}
export interface localeTraslation {
  value: string;
  isButton: boolean | null;
  ButtonSetting: ButtonSetting | null;
  locale: lang;
  extrakey: extraKey[] | null;
}
export interface ButtonSetting {
  color: string;
  custonEmojId: Number;
}

export const _base: localekey[] = [
  // ==================== GENERAL ====================
  {
    key: "Logo_bt",
    description: null,
    localeTraslation: {
      value: "𝕯𝖔𝖒𝖎𝖓𝖆𝖙𝖎𝖔𝖓𝕾",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },

  // ==================== TOP ====================
  {
    key: "top_separator",
    description: null,
    localeTraslation: {
      value: " - ",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "top_header_global",
    description: null,
    localeTraslation: {
      value: "TOP GROBAL ${Logo_bt}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "Logo_bt", description: null }],
    },
  },

  {
    key: "top_header_chat",
    description: null,
    localeTraslation: {
      value: "TOP ${namegroup}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "namegroup", description: null }],
    },
  },
  {
    key: "top_init_list",
    description: null,
    localeTraslation: {
      value: "-------------",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "top_end_list",
    description: null,
    localeTraslation: {
      value: "------ * -------",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "top_user_btn_my_position",
    description: null,
    localeTraslation: {
      value: "Minha posição",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  }, {
    key: "top_user_btn_global",
    description: null,
    localeTraslation: {
      value: "top global",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "top_user_btn_chat",
    description: null,
    localeTraslation: {
      value: "top chat",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "top_user_btn_grupos",
    description: null,
    localeTraslation: {
      value: "top grupos",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "top_header_grupos",
    description: null,
    localeTraslation: {
      value: "TOP GRUPOS",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "top_grupos_empty",
    description: null,
    localeTraslation: {
      value: "Nenhum grupo no ranking ainda.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "top_btn_close",
    description: null,
    localeTraslation: {
      value: "🗑",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "top_user_position_user",
    description: null,
    localeTraslation: {
      value: "Sua posição :${position}\n Total :${total}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "position", description: null },
        { key: "total", description: null },
      ],
    },
  },
  {
    key: "top-chat-group-only",
    description: null,
    localeTraslation: {
      value: "é apenas para grupos",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "top-empty",
    description: null,
    localeTraslation: {
      value: "Nenhum usuário no ranking ainda.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "top_user_not_ranked",
    description: null,
    localeTraslation: {
      value: "Você ainda não está no ranking.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },

  {
    key: "top_user_not_ranked_chat",
    description: null,
    localeTraslation: {
      value: "Você ainda não está no ranking de ${chat_title}.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
       extrakey: [
        { key: "chat_title", description: 'nome do grupo' },
  
      ],
    },
  },

  {
    key: "top_user_position_grupos",
    description: null,
    localeTraslation: {
      value: "Posição do grupo ${chat_title} :${position}\n Total :${total}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "chat_title", description: 'nome do grupo' },
        { key: "position", description: null },
        { key: "total", description: null },
      ],
    },
  },
  {
    key: "top_user_not_ranked_grupos",
    description: null,
    localeTraslation: {
      value: "Este grupo (${chat_title}) ainda não está no ranking.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "chat_title", description: 'nome do grupo' },
      ],
    },
  },

  // ==================== ERRORS ====================
  {
    key: "error-not-registered",
    description: null,
    localeTraslation: {
      value: "Voce ainda nao esta registrado no sistema.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "error-action-not-authorized-by-id",
    description: null,
    localeTraslation: {
      value: "Não autorizado",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "error-admin-bot-only",
    description: null,
    localeTraslation: {
      value: "Comando apenas para Administradores",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "use-onLimitExceeded",
    description: null,
    localeTraslation: {
      value: "{ $mentionUser } está inundando o chat. não poderá usar o bot por 15 minutos.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "error-character-not-found",
    description: null,
    localeTraslation: {
      value: "Personagem não encontrado.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "error-fav-invalid-char",
    description: null,
    localeTraslation: {
      value: "Personagem inválido.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "error-fav-not-id",
    description: null,
    localeTraslation: {
      value: "Manda o Id Também ou selecione abaixo",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "error-generic",
    description: null,
    localeTraslation: {
      value: "Ocorreu um erro.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "error-not-implemented",
    description: null,
    localeTraslation: {
      value: "Ainda não implementado.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "error-user-not-found",
    description: null,
    localeTraslation: {
      value: "Usuário não encontrado",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "error_adding_character",
    description: null,
    localeTraslation: {
      value: "Erro ao adicionar personagem.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "invalid-callback-data",
    description: null,
    localeTraslation: {
      value: "Dados inválidos.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "cancel",
    description: null,
    localeTraslation: {
      value: "Cancelar",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },

  // ==================== DOMINAR ====================
  {
    key: "success-dominar-fallback",
    description: null,
    localeTraslation: {
      value: "vc tem um personagem novo!",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "success_dominar_title",
    description: null,
    localeTraslation: {
      value: "<tg-emoji emoji-id=\"5355035722246016995\">✅</tg-emoji> <b>${usermention} dominou ${genero}!</b>",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "usermention", description: null },
        { key: "genero", description: null },
      ],
    },
  },
  {
    key: "success-dominar-genero-waifu",
    description: null,
    localeTraslation: {
      value: "uma waifu",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "success-dominar-genero-husbando",
    description: null,
    localeTraslation: {
      value: "um husbando",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "success_dominar_name",
    description: null,
    localeTraslation: {
      value: "🏷 <b>Nome:</b> ${character_name}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "character_name", description: null }],
    },
  },
  {
    key: "success_dominar_anime",
    description: null,
    localeTraslation: {
      value: "📺 <b>Anime:</b> ${anime}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "anime", description: null }],
    },
  },
  {
    key: "success_dominar_rarity",
    description: null,
    localeTraslation: {
      value: "${rarity} <b>Raridade:</b>  ${rarity_name}  ${emoji_event}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "rarity", description: null },
        { key: "rarity_name", description: null },
        { key: "emoji_event", description: null },
      ],
    },
  },
  {
    key: "success_dominar_time",
    description: null,
    localeTraslation: {
      value: "⏱ <b>Tempo gasto:</b> <code>${time}</code>",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "time", description: null }],
    },
  },
  {
    key: "success_dominar_daily",
    description: null,
    localeTraslation: {
      value: "📊 <b>Capturas diárias:</b> <code>${count}/${limit}</code>",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "count", description: null },
        { key: "limit", description: null },
      ],
    },
  },
  {
    key: "success_dominar_btn",
    description: null,
    localeTraslation: {
      value: "𝑴𝑬𝑼 𝑯𝑨𝑹𝑬𝑴",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "drop_character_attempt_empty",
    description: null,
    localeTraslation: {
      value: "Ok mais qual nome do ${genero} ?\n     <code> /dominar Nome do personagem </code>",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "genero", description: null }],
    },
  },
  {
    key: "drop_character_attempt_incorrect",
    description: null,
    localeTraslation: {
      value: "<tg-emoji emoji-id=\"5210952531676504517\">❌</tg-emoji> Nome incorreto!",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "drop_character_attempt_incorrect_btn",
    description: null,
    localeTraslation: {
      value: "Tente novamente",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "daily_dominar_limit",
    description: null,
    localeTraslation: {
      value: "Já recolheu ${genero} demais, vamos deixar algumas para amanhã",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "genero", description: null }],
    },
  },

  // ==================== DROPS ====================
  {
    key: "new_character_secret_caption",
    description: null,
    localeTraslation: {
      value: "${emoji_raridade} ${emoji_event} <b> ${charater_genero}  Apareceu!</b>\n<b>capture enviando</b>\n /dominar <code>[Nome]</code>",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "emoji_raridade", description: null },
        { key: "emoji_event", description: null },
        { key: "charater_genero", description: null },
      ],
    },
  },
  {
    key: "drop_character_secret_caption",
    description: null,
    localeTraslation: {
      value: "${charater_genero}  ja fugiu !\n    O nome é <code> ${charater_nome} - ${charater_anime} </code>",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "charater_genero", description: null },
        { key: "charater_nome", description: null },
        { key: "charater_anime", description: null },
      ],
    },
  },
  {
    key: "drop_character_secret_btn",
    description: null,
    localeTraslation: {
      value: "Mais detalhes",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "drop-gender-husbando",
    description: null,
    localeTraslation: {
      value: "o husbando",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "drop-gender-waifu",
    description: null,
    localeTraslation: {
      value: "a waifu",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "form-caption-gender-waifu",
    description: null,
    localeTraslation: {
      value: "Uma waifu",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "form-caption-gender-husbando",
    description: null,
    localeTraslation: {
      value: "Um husbando",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },

  // ==================== HAREM ====================
  {
    key: "harem_no_user",
    description: null,
    localeTraslation: {
      value: "vc nao tem um harem",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "harem_logo",
    description: null,
    localeTraslation: {
      value: "${usermention}  ๛Harem ツ",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "usermention", description: null }],
    },
  },
  {
    key: "harem_btn_prev_page",
    description: null,
    localeTraslation: {
      value: "⬅️",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "harem_btn_current_page",
    description: null,
    localeTraslation: {
      value: "[${currentpage}/${totalpages}]",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "currentpage", description: null },
        { key: "totalpages", description: null },
      ],
    },
  },
  {
    key: "harem_btn_next_page",
    description: null,
    localeTraslation: {
      value: "➡️",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "harem_btn_inline_query",
    description: null,
    localeTraslation: {
      value: "🌐",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "harem_btn_fast_page",
    description: null,
    localeTraslation: {
      value: "⚡️²",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "harem_btn_web_app",
    description: null,
    localeTraslation: {
      value: " 🌐 web",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "harem_btn_setup",
    description: null,
    localeTraslation: {
      value: "⚙️",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "harem_btn_close",
    description: null,
    localeTraslation: {
      value: "🗑",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "harem_btn_delete",
    description: null,
    localeTraslation: {
      value: "Excluir Harem",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "harem_delete_confirm",
    description: null,
    localeTraslation: {
      value: "Tem certeza que deseja excluir o harem e banir este usuario?",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "harem_delete_choice",
    description: null,
    localeTraslation: {
      value: "O que deseja fazer com este harem?",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "harem_delete_ban",
    description: null,
    localeTraslation: {
      value: "Excluir e Banir",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "harem_delete_only",
    description: null,
    localeTraslation: {
      value: "Excluir apenas",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "harem_delete_cancel",
    description: null,
    localeTraslation: {
      value: "Cancelar",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "harem_delete_cannot_admin",
    description: null,
    localeTraslation: {
      value: "Nao e possivel excluir o harem de um administrador.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "harem_delete_success",
    description: null,
    localeTraslation: {
      value: "Harem excluido e usuario banido.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "harem_delete_only_success",
    description: null,
    localeTraslation: {
      value: "Harem excluido.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "harem_delete_no_permission",
    description: null,
    localeTraslation: {
      value: "Apenas ADMIN ou superior pode excluir harens.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },

  // ==================== HAREM MODE ====================
  {
    key: "haremmode-default",
    description: null,
    localeTraslation: {
      value: "Padrão",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "haremmode-recent",
    description: null,
    localeTraslation: {
      value: "Recentes",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "haremmode-rarity",
    description: null,
    localeTraslation: {
      value: "Por Raridade",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "haremmode-event",
    description: null,
    localeTraslation: {
      value: "Por Evento",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "haremmode-caption",
    description: null,
    localeTraslation: {
      value: "Escolha como você deseja ver seu harém",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "haremmodecb-user-not-found",
    description: null,
    localeTraslation: {
      value: "Usuário não encontrado.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "haremmodecb-no-update",
    description: null,
    localeTraslation: {
      value: "Não atualizou, talvez seu harém esteja vazio ou você escolheu o mesmo modo novamente.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "haremmodecb-selected",
    description: null,
    localeTraslation: {
      value: "Modo selecionado: <b>${mode}</b>",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "mode", description: null }],
    },
  },
  {
    key: "haremmodecb-updated",
    description: null,
    localeTraslation: {
      value: "Modo atualizado com sucesso para: ${mode}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "mode", description: null }],
    },
  },
  {
    key: "harem_mode_recent_nome",
    description: null,
    localeTraslation: {
      value: "${lapis}Nome : ${nome}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "lapis", description: null },
        { key: "nome", description: null },
      ],
    },
  },
  {
    key: "harem_mode_recent_id",
    description: null,
    localeTraslation: {
      value: "🆔 ɪᴅ:<code> ${id} </code>",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "id", description: null }],
    },
  },
  {
    key: "harem_mode_recent_rarity",
    description: null,
    localeTraslation: {
      value: "${rarity_emoji} Raridade : ${rarity_name}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "rarity_emoji", description: null },
        { key: "rarity_name", description: null },
      ],
    },
  },
  {
    key: "harem_mode_recent_anime",
    description: null,
    localeTraslation: {
      value: "${rarity_emoji_local} ${sourceType} : ${anime}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "rarity_emoji_local", description: null },
        { key: "sourceType", description: null },
        { key: "anime", description: null },
      ],
    },
  },

  // ==================== HAREM INLINE CAPTION ====================
  {
    key: "harem_inline_caption_title",
    description: null,
    localeTraslation: {
      value: "wow! veja  ${genero} ${usermention}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "genero", description: null },
        { key: "usermention", description: null },
      ],
    },
  },
  {
    key: "harem_inline_caption_name",
    description: null,
    localeTraslation: {
      value: " <b>${character_name}</b>",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "character_name", description: null }],
    },
  },
  {
    key: "harem_inline_caption_info",
    description: null,
    localeTraslation: {
      value: "${id} : ${anime}  ${emoji_event} ${repitition}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "id", description: null },
        { key: "anime", description: null },
        { key: "emoji_event", description: null },
        { key: "repitition", description: null },
      ],
    },
  },
  {
    key: "harem_inline_caption_rarity",
    description: null,
    localeTraslation: {
      value: "Raridade:  ${rarity_name} ${rarity_emoji}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "rarity_name", description: null },
        { key: "rarity_emoji", description: null },
      ],
    },
  },
  {
    key: "harem_inline_caption_event",
    description: null,
    localeTraslation: {
      value: "${emoji_event}  ${event_name} ${emoji_event}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "emoji_event", description: null },
        { key: "event_name", description: null },
      ],
    },
  },
  {
    key: "create-caption-gender-waifu",
    description: null,
    localeTraslation: {
      value: "essa waifu",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "create-caption-gender-husbando",
    description: null,
    localeTraslation: {
      value: "esse husbando",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },

  // ==================== FAV ====================
  {
    key: "fav-btn-select",
    description: null,
    localeTraslation: {
      value: "seleciona seu favorito",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "fav-character-confirm",
    description: null,
    localeTraslation: {
      value: "Confirmar favorito?",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "fav-character-success",
    description: null,
    localeTraslation: {
      value: "favorito atualizado",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "fav-not-found",
    description: null,
    localeTraslation: {
      value: "Você não possui essa ${genero} no seu Harem",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "genero", description: null }],
    },
  },

  // ==================== GIFT ====================
  {
    key: "gift_reply_instruction",
    description: null,
    localeTraslation: {
      value: "Manda em reposta a uma pessoa <code>/${command} 46 </code>",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "command", description: null }],
    },
  },
  {
    key: "gift_error_self",
    description: null,
    localeTraslation: {
      value: "Você não pode enviar presente para si mesmo.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "gift_error_bot",
    description: null,
    localeTraslation: {
      value: "agradeço, Mais não posso receber presentes",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "gift_confirm_fullharem",
    description: null,
    localeTraslation: {
      value: "Tem certeza que deseja presentear todo o seu harém para ${username}?",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "username", description: null }],
    },
  },
  {
    key: "gift_btn_select",
    description: null,
    localeTraslation: {
      value: "${name} -- >",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "name", description: null }],
    },
  },
  {
    key: "gift_error_not_id",
    description: null,
    localeTraslation: {
      value: "Manda o id tambem , ou escolha usado o batão abaixo para presentiar",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "gift_fav_not_found",
    description: null,
    localeTraslation: {
      value: "Você não possui essa ${genero} no seu Harem",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "genero", description: null }],
    },
  },
  {
    key: "gift_confirmation_message",
    description: null,
    localeTraslation: {
      value: "Você tem certeza que deseja presentear para ${username}?",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "username", description: null }],
    },
  },
  {
    key: "gift_error_ids_not_found",
    description: null,
    localeTraslation: {
      value: "IDs não encontrados na sua coleção: ${ids}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "ids", description: null }],
    },
  },
  {
    key: "gift_confirmation_message_multi",
    description: null,
    localeTraslation: {
      value: "Confirmar presente de ${qty}x personagens (${names}) para ${username}?",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "qty", description: null },
        { key: "names", description: null },
        { key: "username", description: null },
      ],
    },
  },
  {
    key: "gift_success",
    description: null,
    localeTraslation: {
      value: "Operacao completa\n    ${sender} deu ${name} para ${receiver}!",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "sender", description: null },
        { key: "name", description: null },
        { key: "receiver", description: null },
      ],
    },
  },
  {
    key: "gift-default-username",
    description: null,
    localeTraslation: {
      value: "Usuário",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },

  // ==================== MYINFO ====================
  {
    key: "myinfo-title",
    description: null,
    localeTraslation: {
      value: "📊 Suas Informações",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "myinfo-user",
    description: null,
    localeTraslation: {
      value: "👤 Usuário: ${name}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "name", description: null }],
    },
  },
  {
    key: "myinfo-id",
    description: null,
    localeTraslation: {
      value: "🆔 ID: <code>${id}</code>",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "id", description: null }],
    },
  },
  {
    key: "myinfo-total",
    description: null,
    localeTraslation: {
      value: "📦 Total de ${genero}: ${total}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "genero", description: null },
        { key: "total", description: null },
      ],
    },
  },
  {
    key: "myinfo-harem",
    description: null,
    localeTraslation: {
      value: "❤️ Harém: ${userTotal} / ${dbTotal} (${percent}%)",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "userTotal", description: null },
        { key: "dbTotal", description: null },
        { key: "percent", description: null },
      ],
    },
  },
  {
    key: "myinfo-progress",
    description: null,
    localeTraslation: {
      value: "📈 Progresso: ${bar}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "bar", description: null }],
    },
  },
  {
    key: "myinfo-end",
    description: null,
    localeTraslation: {
      value: "─────────────",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },

  // ==================== ANIMELIST ====================
  {
    key: "animelist-select-letter",
    description: null,
    localeTraslation: {
      value: "Selecione uma letra do alfabeto:",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "animelist-no-anime",
    description: null,
    localeTraslation: {
      value: "Nenhum anime encontrado com a letra ${letter}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "letter", description: null }],
    },
  },
  {
    key: "animelist-header",
    description: null,
    localeTraslation: {
      value: "Anime com ${letter} (${total})",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "letter", description: null },
        { key: "total", description: null },
      ],
    },
  },
  {
    key: "animelist-page",
    description: null,
    localeTraslation: {
      value: "Pagina ${page}/${totalPages}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "page", description: null },
        { key: "totalPages", description: null },
      ],
    },
  },
  {
    key: "animelist-instruction",
    description: null,
    localeTraslation: {
      value: "Clique em um anime para ver seus personagens",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "animelist-btn-back",
    description: null,
    localeTraslation: {
      value: "🔙 Menu",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "animelist-btn-prev",
    description: null,
    localeTraslation: {
      value: "◀️",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "animelist-btn-next",
    description: null,
    localeTraslation: {
      value: "▶️",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },

  // ==================== INLINE ====================
  {
    key: "inline-default-btn",
    description: null,
    localeTraslation: {
      value: "𝕯𝖔𝖒𝖎𝖓𝖆𝖙𝖎𝖔𝖓𝕾",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "query_not_fould",
    description: null,
    localeTraslation: {
      value: "Nenhum resultado encontrado",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "select-inline-gift",
    description: null,
    localeTraslation: {
      value: "Selecione o presente:",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "search-harem-title",
    description: null,
    localeTraslation: {
      value: "Pesquisar harem",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "search-harem-not-found",
    description: null,
    localeTraslation: {
      value: "Nada encontrado",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },

  // ==================== ADD CHARACTER ====================
  {
    key: "add_character_confirm",
    description: null,
    localeTraslation: {
      value: "⚕ ᴀᴅᴅᴇᴅ ʙʏ: ${usermention}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "usermention", description: null }],
    },
  },
  {
    key: "add_character_not_info",
    description: null,
    localeTraslation: {
      value: "file_midia ou anime ou personagem faltando",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "add_character_not_reply",
    description: null,
    localeTraslation: {
      value: "use em resposta a midia video/foto",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "add-char-success",
    description: null,
    localeTraslation: {
      value: "Personagem adicionado com sucesso!",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "add-char-error-media-unique",
    description: null,
    localeTraslation: {
      value: "❌ Esta mídia já está em uso por outro personagem. Envie uma mídia diferente.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "add-char-error",
    description: null,
    localeTraslation: {
      value: "Erro ao adicionar personagem: ${error}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "error", description: null }],
    },
  },
  {
    key: "add-char-only-photo-video",
    description: null,
    localeTraslation: {
      value: "Only photo or video is supported.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "add-char-usage",
    description: null,
    localeTraslation: {
      value: "Use: nome, anime, extras",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "edit-id-not-informed",
    description: null,
    localeTraslation: {
      value: "Use: /editchar${botPrefix} <id>",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "botPrefix", description: null }],
    },
  },
  {
    key: "edit-character-success",
    description: null,
    localeTraslation: {
      value: "Personagem ${character_id} atualizado com sucesso!",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "add-character-enter-name",
    description: null,
    localeTraslation: {
      value: "Envie o nome do personagem:",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "add-character-enter-anime",
    description: null,
    localeTraslation: {
      value: "Envie o nome do anime/origem:",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "add-character-enter-media",
    description: null,
    localeTraslation: {
      value: "Envie a mídia (foto ou vídeo):",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "add-character-cancelled",
    description: null,
    localeTraslation: {
      value: "Adição cancelada.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },

  // ==================== BUTTONS ====================
  {
    key: "Buttun-confirmation-label-yes",
    description: null,
    localeTraslation: {
      value: "✅ Sim",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "Buttun-confirmation-label-no",
    description: null,
    localeTraslation: {
      value: "❌ Não",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "btn-close",
    description: null,
    localeTraslation: {
      value: "🗑",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },

  // ==================== DEV ====================
  {
    key: "dev-cmd-only",
    description: null,
    localeTraslation: {
      value: "Comando apenas para desenvolvedor.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "dev-fail-drop",
    description: null,
    localeTraslation: {
      value: "Falha ao dropar character",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },

  // ==================== TRADE ====================
  {
    key: "trade_expired",
    description: "Sessão de trade expirada",
    localeTraslation: {
      value: "Sessão de trade expirada.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_accept_only_receiver",
    description: "Apenas o destinatário pode aceitar",
    localeTraslation: {
      value: "Somente o destinatário pode aceitar.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_incomplete",
    description: "Trade incompleto - personagens não selecionados",
    localeTraslation: {
      value: "Trade incompleto - selecione os personagens.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_not_authorized",
    description: "Usuário não autorizado a realizar a ação",
    localeTraslation: {
      value: "Não autorizado.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_counter_not_implemented",
    description: "Contra proposta ainda não implementada",
    localeTraslation: {
      value: "🔄 Contra proposta ainda não implementada",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_declined",
    description: "Negociação cancelada",
    localeTraslation: {
      value: "❌ Negociação cancelada.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_expired_or_incomplete",
    description: "Trade expirado ou incompleto",
    localeTraslation: {
      value: "Trade expirado ou incompleto.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_reply_instruction",
    description: "Instrução de reply para trade",
    localeTraslation: {
      value: "${command} 55 , 55 (em Resposta)\n ou ${command}  @Wadomination_bot 55 , 55",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "command", description: null }],
    },
  },
  {
    key: "trade_error_user",
    description: "Erro ao tentar negociar consigo mesmo",
    localeTraslation: {
      value: "Você não pode negociar consigo mesmo.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_error_bot",
    description: "Erro ao tentar negociar com o bot",
    localeTraslation: {
      value: "Não posso receber presentes.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_error_donate_harem",
    description: "Doação de harem indisponível",
    localeTraslation: {
      value: "Doação de harem está indisponível.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_error_not_id",
    description: "Usuário não encontrado",
    localeTraslation: {
      value: "Usuário não encontrado.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_error_all_id_not_info",
    description: "Faltou informar os IDs",
    localeTraslation: {
      value: "Manda o Id Também ou selecione abaixo",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "command", description: null }],
    },
  },
  {
    key: "trade_receiver_not_found",
    description: "Destinatário não possui o personagem",
    localeTraslation: {
      value: "${mention} não tem esse ${typeBot} de id: ${characterId}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "mention", description: null },
        { key: "typeBot", description: null },
        { key: "characterId", description: null },
      ],
    },
  },
  {
    key: "trade_transmitter_not_found",
    description: "Remetente não possui o personagem",
    localeTraslation: {
      value: "Você não possui esse ${typeBot} de id: ${characterId}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "typeBot", description: null },
        { key: "characterId", description: null },
      ],
    },
  },
  {
    key: "trade_btn_accept",
    description: "Botão de aceitar trade",
    localeTraslation: {
      value: "✅ Aceitar",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_btn_counter",
    description: "Botão de contra proposta",
    localeTraslation: {
      value: "🔄 Contra proposta",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_btn_decline",
    description: "Botão de recusar trade",
    localeTraslation: {
      value: "❌ Recusar",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_btn_confirm_trade",
    description: "Botão de confirmar trade",
    localeTraslation: {
      value: "Confirmar Trade",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_btn_my_label_my",
    description: "Label do botão para selecionar meu personagem",
    localeTraslation: {
      value: "Meu Personagem",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_btn_my_label_receiver",
    description: "Label do botão para selecionar personagem do receptor",
    localeTraslation: {
      value: "Personagem do Receptor",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_btn_my_label_cancel",
    description: "Label do botão de cancelar",
    localeTraslation: {
      value: "Cancelar",
      isButton: true,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_inline_confirm_transmitter",
    description: "Texto ao confirmar personagem do transmissor",
    localeTraslation: {
      value: "Confirme seu personagem",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_inline_transmitter",
    description: "Texto ao selecionar personagem do transmissor",
    localeTraslation: {
      value: "Selecione seu personagem para trade",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_inline_confirm_receiver",
    description: "Texto ao confirmar personagem do receptor",
    localeTraslation: {
      value: "Confirme seu personagem",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "trade_inline_receiver",
    description: "Texto ao selecionar personagem do receptor",
    localeTraslation: {
      value: "Selecione o personagem do receptor",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },

  // ==================== BOT NEW GROUP ====================
  {
    key: "bot_new_group_msg_group_adms",
    description: null,
    localeTraslation: {
      value: "Fui adicionado a um novo grupo!\n\n🆔 ID: ${id}\n📛 Título: ${title}\n👥 Membros: ${memberCount}\n🏷️ Tipo: ${type}\n👤 Adicionado por: ${addedBy}\n🔗 Link de convite: ${invite_link}\n✉️ Entrar para enviar mensagens: ${join_to_send_messages}\n📝 Descrição:\n<blockquote expandable>${description}</blockquote>",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "id", description: null },
        { key: "invite_link", description: null },
        { key: "join_to_send_messages", description: null },
        { key: "title", description: null },
        { key: "type", description: null },
        { key: "description", description: null },
        { key: "memberCount", description: null },
        { key: "addedBy", description: null },
      ],
    },
  },
  {
    key: "bot_new_group_msg",
    description: null,
    localeTraslation: {
      value: "<b>Que ótimo! — Agora, faço parte desse chat</b>\n\n<blockquote> <a href=\"https://t.me/${botName}?start=canal\"> Guia dominations</a> — Use /${command_config} para ajustar algumas configurações simples do Bot neste chat </blockquote>.\n\nClique no botão abaixo para me adicionar a novos grupos e garantir que eles também estejam na comunidade",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "botName", description: null }
        ,{ key: "command_config", description: null }
      ],
    },
  },
  {
    key: "start_btn_grupo",
    description: null,
    localeTraslation: {
      value: "👥 Grupo Oficial",
      isButton: true,
      ButtonSetting: { color: "primary", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  }// ==================== BOT LEAVE GROUP ====================
  ,

  {
    key: "bot_leave_group_text",
    description: null,
    localeTraslation: {
      value: "Tem certeza que deseja remover o bot do grupo?\n\nmenbros devem ter a coleção apagada : ${membrers_clean_colletion}\n menbros devem ser blockeados  : ${membrers_ban}\n mandar mensagem antes de sair ? ${send_message_to_group}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "membrers_clean_colletion", description: null },
        { key: "membrers_ban", description: null },
        { key: "send_message_to_group", description: null },

      ],
    },

  }, {
    key: "bot_leave_send_message_to_group_flood",
    description: null,
    localeTraslation: {
      value: ` Parabéns, campeãos. 👏

Conseguiu a façanha de perder suas waifus/husbands de uma vez só. Nem os protagonistas mais azarados dos animes conseguem esse feito.
Enquanto outros conquistam waifus, você conseguiu ter as suas apreendidas pela Receita Federal das Waifus por cultivo irregular. 🚔💍
Agora resta apenas olhar para o vazio e lembrar: o verdadeiro farm foram os amigos que você perdeu pelo caminho.`,
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null
    },
  },
  {
    key: "reload_no_users",
    description: null,
    localeTraslation: {
      value: "Nenhum usuário para promover. Todos os administradores do grupo já são administradores do bot.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "reload_success",
    description: null,
    localeTraslation: {
      value: "✅ ${count} administrador(es) promovido(s) a ADMIN.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "count", description: null }],
    },
  },
  {
    key: "reload_error",
    description: null,
    localeTraslation: {
      value: "❌ Erro ao atualizar lista de administradores: ${error}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "error", description: null }],
    },
  },
  {
    key: "clearcache_success",
    description: null,
    localeTraslation: {
      value: "✅ Cache do bot limpo com sucesso.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "clearcache_error",
    description: null,
    localeTraslation: {
      value: "❌ Erro ao limpar o cache: ${error}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "error", description: null }],
    },
  },
  {
    key: "ban_reply_instruction",
    description: null,
    localeTraslation: {
      value: "Responda a mensagem de um usuário ou mencione-o para banir.\nEx: /ban @usuario",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "ban_error_self",
    description: null,
    localeTraslation: {
      value: "❌ Você não pode banir a si mesmo.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "ban_error_bot",
    description: null,
    localeTraslation: {
      value: "❌ Você não pode banir um bot.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "ban_error_already_banned",
    description: null,
    localeTraslation: {
      value: "❌ Este usuário já está banido.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "ban_error_need_super_admin",
    description: null,
    localeTraslation: {
      value: "❌ Para banir um administrador você precisa ser SUPER_ADMIN.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "ban_error_not_requester",
    description: null,
    localeTraslation: {
      value: "❌ Apenas quem solicitou o ban pode confirmar.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "ban_confirm",
    description: null,
    localeTraslation: {
      value: "🚫 Tem certeza que deseja banir ${user}?\n\nCargo atual: ${role}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "user", description: null },
        { key: "role", description: null },
      ],
    },
  },
  {
    key: "ban_btn_confirm",
    description: null,
    localeTraslation: {
      value: "Banir",
      isButton: true,
      ButtonSetting: { color: "danger", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "ban_btn_cancel",
    description: null,
    localeTraslation: {
      value: "Cancelar",
      isButton: true,
      ButtonSetting: { color: "secondary", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "ban_success",
    description: null,
    localeTraslation: {
      value: "✅ Usuário banido com sucesso.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "ban_cancelled",
    description: null,
    localeTraslation: {
      value: "Ban cancelado.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "ban_error",
    description: null,
    localeTraslation: {
      value: "❌ Erro ao banir usuário: ${error}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "error", description: null }],
    },
  },
  {
    key: "clean_reply_instruction",
    description: null,
    localeTraslation: {
      value: "Responda a mensagem de um usuário ou mencione-o para limpar a coleção.\nEx: /cleanCollection @usuario",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "clean_error_self",
    description: null,
    localeTraslation: {
      value: "❌ Você não pode limpar a própria coleção.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "clean_error_bot",
    description: null,
    localeTraslation: {
      value: "❌ Você não pode limpar a coleção de um bot.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "clean_error_nothing",
    description: null,
    localeTraslation: {
      value: "ℹ️ Este usuário não possui coleção para limpar.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "clean_error_not_requester",
    description: null,
    localeTraslation: {
      value: "❌ Apenas quem solicitou a limpeza pode confirmar.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "clean_confirm",
    description: null,
    localeTraslation: {
      value: "🧹 Tem certeza que deseja limpar a coleção de ${user}?\n\nTotal de itens: ${count}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "user", description: null },
        { key: "count", description: null },
      ],
    },
  },
  {
    key: "clean_btn_confirm",
    description: null,
    localeTraslation: {
      value: "Limpar",
      isButton: true,
      ButtonSetting: { color: "danger", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "clean_btn_cancel",
    description: null,
    localeTraslation: {
      value: "Cancelar",
      isButton: true,
      ButtonSetting: { color: "secondary", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "clean_success",
    description: null,
    localeTraslation: {
      value: "✅ Coleção limpa com sucesso (${count} itens removidos).",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "count", description: null }],
    },
  },
  {
    key: "clean_cancelled",
    description: null,
    localeTraslation: {
      value: "Limpeza cancelada.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "clean_error",
    description: null,
    localeTraslation: {
      value: "❌ Erro ao limpar coleção: ${error}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "error", description: null }],
    },
  },
  {
    key: "upadmin_reply_instruction",
    description: null,
    localeTraslation: {
      value: "Responda a mensagem de um usuário ou mencione-o para promover a ADMIN.\nEx: /upadmin @usuario",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "upadmin_error_self",
    description: null,
    localeTraslation: {
      value: "❌ Você não pode promover a si mesmo.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "upadmin_error_bot",
    description: null,
    localeTraslation: {
      value: "❌ Você não pode promover um bot.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "upadmin_error_already_admin",
    description: null,
    localeTraslation: {
      value: "❌ Este usuário já é ADMIN ou superior.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "upadmin_error_not_requester",
    description: null,
    localeTraslation: {
      value: "❌ Apenas quem solicitou a promoção pode confirmar.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "upadmin_confirm",
    description: null,
    localeTraslation: {
      value: "⬆️ Tem certeza que deseja promover ${user} a ADMIN?\n\nCargo atual: ${role}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "user", description: null },
        { key: "role", description: null },
      ],
    },
  },
  {
    key: "upadmin_btn_confirm",
    description: null,
    localeTraslation: {
      value: "Promover",
      isButton: true,
      ButtonSetting: { color: "danger", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "upadmin_btn_cancel",
    description: null,
    localeTraslation: {
      value: "Cancelar",
      isButton: true,
      ButtonSetting: { color: "secondary", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "upadmin_success",
    description: null,
    localeTraslation: {
      value: "✅ Usuário promovido a ADMIN com sucesso.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "upadmin_cancelled",
    description: null,
    localeTraslation: {
      value: "Promoção cancelada.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "upadmin_error",
    description: null,
    localeTraslation: {
      value: "❌ Erro ao promover usuário: ${error}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "error", description: null }],
    },
  },
  {
    key: "unban_reply_instruction",
    description: null,
    localeTraslation: {
      value: "Responda a mensagem de um usuário ou mencione-o para desbanir.\nEx: /unban @usuario",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "unban_error_self",
    description: null,
    localeTraslation: {
      value: "❌ Você não pode desbanir a si mesmo.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "unban_error_bot",
    description: null,
    localeTraslation: {
      value: "❌ Você não pode desbanir um bot.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "unban_error_not_banned",
    description: null,
    localeTraslation: {
      value: "ℹ️ Este usuário não está banido.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "unban_error_not_requester",
    description: null,
    localeTraslation: {
      value: "❌ Apenas quem solicitou o desbanimento pode confirmar.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "unban_confirm",
    description: null,
    localeTraslation: {
      value: "🚫 Tem certeza que deseja desbanir ${user}?\n\nCargo atual: ${role}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "user", description: null },
        { key: "role", description: null },
      ],
    },
  },
  {
    key: "unban_btn_confirm",
    description: null,
    localeTraslation: {
      value: "Desbanir",
      isButton: true,
      ButtonSetting: { color: "danger", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "unban_btn_cancel",
    description: null,
    localeTraslation: {
      value: "Cancelar",
      isButton: true,
      ButtonSetting: { color: "secondary", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "unban_success",
    description: null,
    localeTraslation: {
      value: "✅ Usuário desbanido com sucesso.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "unban_cancelled",
    description: null,
    localeTraslation: {
      value: "Desbanimento cancelado.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "unban_error",
    description: null,
    localeTraslation: {
      value: "❌ Erro ao desbanir usuário: ${error}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "error", description: null }],
    },
  },
  {
    key: "unadmin_reply_instruction",
    description: null,
    localeTraslation: {
      value: "Responda a mensagem de um usuário ou mencione-o para rebaixar de ADMIN.\nEx: /unadmin @usuario",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "unadmin_error_self",
    description: null,
    localeTraslation: {
      value: "❌ Você não pode rebaixar a si mesmo.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "unadmin_error_bot",
    description: null,
    localeTraslation: {
      value: "❌ Você não pode rebaixar um bot.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "unadmin_error_not_admin",
    description: null,
    localeTraslation: {
      value: "ℹ️ Este usuário não é ADMIN ou superior.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "unadmin_error_not_requester",
    description: null,
    localeTraslation: {
      value: "❌ Apenas quem solicitou o rebaixamento pode confirmar.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "unadmin_confirm",
    description: null,
    localeTraslation: {
      value: "⬇️ Tem certeza que deseja rebaixar ${user} de ADMIN?\n\nCargo atual: ${role}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "user", description: null },
        { key: "role", description: null },
      ],
    },
  },
  {
    key: "unadmin_btn_confirm",
    description: null,
    localeTraslation: {
      value: "Rebaixar",
      isButton: true,
      ButtonSetting: { color: "danger", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "unadmin_btn_cancel",
    description: null,
    localeTraslation: {
      value: "Cancelar",
      isButton: true,
      ButtonSetting: { color: "secondary", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "unadmin_success",
    description: null,
    localeTraslation: {
      value: "✅ Usuário rebaixado de ADMIN com sucesso.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "unadmin_cancelled",
    description: null,
    localeTraslation: {
      value: "Rebaixamento cancelado.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "unadmin_error",
    description: null,
    localeTraslation: {
      value: "❌ Erro ao rebaixar usuário: ${error}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "error", description: null }],
    },
  },
  {
    key: "openharem_reply_instruction",
    description: null,
    localeTraslation: {
      value: "Responda a mensagem de um usuário ou mencione-o para abrir a coleção.\nEx: /openharem @usuario",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "openharem_error_bot",
    description: null,
    localeTraslation: {
      value: "❌ Você não pode abrir a coleção de um bot.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "openharem_error",
    description: null,
    localeTraslation: {
      value: "❌ Erro ao abrir coleção: ${error}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "error", description: null }],
    },
  },
  {
    key: "info_id",
    description: null,
    localeTraslation: {
      value: "🆔 ID: ${id} #id${id}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "id", description: null }],
    },
  },
  {
    key: "info_name",
    description: null,
    localeTraslation: {
      value: "👱 Nome: ${user}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "user", description: null }],
    },
  },
  {
    key: "info_username",
    description: null,
    localeTraslation: {
      value: "🌐 Nome de usuário: ${username}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "username", description: null }],
    },
  },
  {
    key: "info_status",
    description: null,
    localeTraslation: {
      value: "👀 Situação: ${status}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "status", description: null }],
    },
  },
  {
    key: "info_total",
    description: null,
    localeTraslation: {
      value: "total de ${genero}: ${userTotal} (${dbTotal})",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "genero", description: null },
        { key: "userTotal", description: null },
        { key: "dbTotal", description: null },
      ],
    },
  },
  {
    key: "info_rank",
    description: null,
    localeTraslation: {
      value: "ɢʟᴏʙᴀʟ ʀᴀɴᴋ: ${rank}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "rank", description: null }],
    },
  },
  {
    key: "info_error",
    description: null,
    localeTraslation: {
      value: "❌ Erro ao exibir informações: ${error}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "error", description: null }],
    },
  },
  {
    key: "start_welcome_private",
    description: null,
    localeTraslation: {
     
value: "🌌 Bem-vindo ao ${bot}!\n\nA experiência definitiva de coleção de personagens de anime no Telegram!\n\n✨ Colecione milhares de waifus e husbandos únicos.\n⚔️ Faça personagens aparecerem conversando em grupos.\n\nToque nos botões abaixo para explorar!\n\n⦾ ᴏ Qᴜᴇ Eᴜ FᴀÇᴏ: FᴀÇᴏ ᴀᴘᴀʀᴇᴄᴇʀ\n     ${gener} ɴᴏ sᴇᴜ ᴄʜᴀᴛ ᴘᴀʀᴀ\n     ᴏs ᴜsᴜÁʀɪᴏs ᴄᴀᴘᴛᴜʀᴀʀᴇᴍ.\n⦾ ᴄᴏᴍᴏ Mᴇ Usᴀʀ: Aᴅɪᴄɪᴏɴᴇ-Mᴇ ᴀᴏ\n     sᴇᴜ ɢʀᴜᴘᴏ ᴇ ᴛᴏǫᴜᴇ ɴᴏ ʙᴏᴛÃᴏ\n     ᴅᴇ Aᴊᴜᴅᴀ ᴘᴀʀᴀ Mᴀɪs Dᴇᴛᴀʟʜᴇs.\n\n➺ ᴘɪɴɢ: ${ping} ms\n➺ ᴛᴇᴍᴘᴏ ᴏɴʟɪɴᴇ: ${uptime}"

      ,isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "gener", description: null },
        { key: "bot", description: null },
        { key: "ping", description: null },
        { key: "uptime", description: null },
      ],
    },
  },
  {
    key: "start_guia_text",
    description: null,
    localeTraslation: {
      value: "<b>📖 Guia de uso</b>\n\n1️⃣ Adicione o bot ao seu grupo: toque em \"➕ Add me\".\n2️⃣ Converse normalmente no grupo — personagens aparecem para serem capturados.\n3️⃣ Use /dominar ou toque na imagem do personagem para capturá-lo.\n4️⃣ Consulte sua coleção com /harem e troque com outros jogadores via /trade.\n\nUse /help para ver todos os comandos!",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "start_redirect_caption",
    description: null,
    localeTraslation: {
      value: "🌌 Este é o personagem mais recente adicionado ao banco!",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "start_redirect_empty",
    description: null,
    localeTraslation: {
      value: "ℹ️ Nenhum personagem cadastrado ainda.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "start_creditos",
    description: null,
    localeTraslation: {
      value: "💠 Créditos\n\nBot desenvolvido com 💜 pela equipe de administração:\n${admins}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "admins", description: null }],
    },
  },
  {
    key: "start_btn_addme",
    description: null,
    localeTraslation: {
      value: "➕ Add me",
      isButton: true,
      ButtonSetting: { color: "success", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "start_btn_canal",
    description: null,
    localeTraslation: {
      value: "📢 Canal",
      isButton: true,
      ButtonSetting: { color: "primary", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "start_btn_creditos",
    description: null,
    localeTraslation: {
      value: "💠 Créditos",
      isButton: true,
      ButtonSetting: { color: "primary", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "start_btn_guia",
    description: null,
    localeTraslation: {
      value: "📖 Guia",
      isButton: true,
      ButtonSetting: { color: "primary", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "start_btn_redirect",
    description: null,
    localeTraslation: {
      value: "🔄 Redirecionar",
      isButton: true,
      ButtonSetting: { color: "primary", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "config_title",
    description: null,
    localeTraslation: {
      value: "⚙️ Configurações ${configTitleLabel}\n\nGrupo: <b>${group}</b>\n\n💧 Drops: <b>${dropStatus}</b>\n📊 Drop a cada <b>${dropMsg}</b> mensagens (mín. 100)",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "group", description: null },
        { key: "dropStatus", description: null },
        { key: "dropMsg", description: null },
      ],
    },
  },
  {
    key: "config_status_on",
    description: null,
    localeTraslation: {
      value: "✅ Ativados",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "config_status_off",
    description: null,
    localeTraslation: {
      value: "❌ Desativados",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "config_btn_toggle_off",
    description: null,
    localeTraslation: {
      value: "❌ Desativar drops",
      isButton: true,
      ButtonSetting: { color: "danger", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "config_btn_toggle_on",
    description: null,
    localeTraslation: {
      value: "✅ Ativar drops",
      isButton: true,
      ButtonSetting: { color: "success", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "config_btn_minus",
    description: null,
    localeTraslation: {
      value: "➖ -100",
      isButton: true,
      ButtonSetting: { color: "primary", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "config_btn_plus",
    description: null,
    localeTraslation: {
      value: "➕ +100",
      isButton: true,
      ButtonSetting: { color: "primary", custonEmojId: 1 },
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "config_only_admin",
    description: null,
    localeTraslation: {
      value: "⛔ Apenas administradores do grupo podem usar este menu.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "config_group_only",
    description: null,
    localeTraslation: {
      value: "ℹ️ Use ${commands} dentro de um grupo.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [{ key: "commands", description: null }],
    },
  },
  {
    key: "config_updated",
    description: null,
    localeTraslation: {
      value: "✅ Configuração atualizada!",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "config_drops_enabled",
    description: null,
    localeTraslation: {
      value: "✅ Drops ativados neste grupo!",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "config_drops_disabled",
    description: null,
    localeTraslation: {
      value: "❌ Drops desativados neste grupo!",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },

  // ==================== DROP COMMAND ====================
  {
    key: "drop_cmd_status",
    description: null,
    localeTraslation: {
      value: "Atualmente, estou dropando ${typeBot}s aos usuários: ${status}",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: [
        { key: "typeBot", description: null },
        { key: "status", description: null },
      ],
    },
  },
  {
    key: "drop_cmd_invalid",
    description: null,
    localeTraslation: {
      value: "O parâmetro não foi reconhecido, use uma das opções seguintes: yes/no/on/off",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "drop_cmd_only_admin",
    description: null,
    localeTraslation: {
      value: "⛔ Apenas administradores do grupo podem usar este comando.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
  {
    key: "drop_cmd_group_only",
    description: null,
    localeTraslation: {
      value: "ℹ️ Use /drop dentro de um grupo.",
      isButton: null,
      ButtonSetting: null,
      locale: { lang: "pt", icon: "🇧🇷" },
      extrakey: null,
    },
  },
];
