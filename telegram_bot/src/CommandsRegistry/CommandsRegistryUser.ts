import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import { debug } from "../utils/log.js";
import {
  botPrefix,
  typeBot,
  type CommandConfig,
  registerCommand,
  category_user,
} from "./botConfigCommands.js";
import {
  topHandler,
  topHandlerChat,
  topGruposHandler,
} from "../handlers/Commands/CommandsUser/top.js";
import { Myinfos } from "../handlers/Commands/CommandsUser/myinfos.js";
import { InfoHandler } from "../handlers/Commands/CommandsUser/info.js";
import { GiftHandler } from "../handlers/Commands/CommandsUser/gift.js";
import { favHandler } from "../handlers/Commands/CommandsUser/fav.js";
import { HaremHandler } from "../handlers/Commands/CommandsUser/harem.js";
import { HaremmodeHandler } from "../handlers/Commands/CommandsUser/haremmode.js";
import { CapturarCharacter } from "../handlers/Commands/CommandsUser/dominar.js";
import { TradeHandler } from "../handlers/Commands/CommandsUser/trade.js";
import { RandomCharacterHandler } from "../handlers/Commands/CommandsUser/RandomCharacterHandler.js";
import { animelistCommand } from "../handlers/Commands/CommandsUser/animelist.js";
import { DetectHandler } from "../handlers/Commands/CommandsUser/detect.js";

const userCommandsRegistry = new CommandGroup<MyContext>();

export const userCommandsRegistryDict: Record<string, CommandConfig> = {
  top: {
    category_user: category_user.InfoPersonalization,
    command: "top" + botPrefix,
    commandPrivate: "top",
    description: {
      pt: "Mostra o top de jogadores",
      en: "Show the top players",
    },
    handler: topHandler,
    scopes: ["all_group_chats", "all_private_chats"],
  },
  topchat: {
    category_user: category_user.InfoPersonalization,
    command: "topchat" + botPrefix,
    description: {
      pt: "Mostra o top de jogadores",
      en: "Show the top players",
    },
    handler: topHandlerChat,
    scopes: ["all_group_chats", ],
  },
  topgrupo: {
    category_user: category_user.InfoPersonalization,
    command: "topgrupo" + botPrefix,
    commandPrivate: "topgrupo",
    description: {
      pt: "Mostra o top de grupos",
      en: "Show the top groups",
    },
    handler: topGruposHandler,
    scopes: ["all_group_chats", "all_private_chats"],
  },
  Trade: {
    category_user: category_user.EconomyTrade,
    command: "trade" + botPrefix,
    description: {
      pt: "negocia a troca de personagens com outro usuario",
      en: "Trade characters with another user",
    },
    handler: TradeHandler,
    scopes: ["all_group_chats", ],
  },
  Myinfos: {
    category_user: category_user.InfoPersonalization,
    command: "myinfo" + botPrefix,
    commandPrivate: "myinfo",
    description: {
      pt: "Mostra o top de jogadores",
      en: "Show the top players",
    },
    handler: Myinfos,
    scopes: ["all_group_chats", ],
  },
  Info: {
    category_user: category_user.InfoPersonalization,
    command: "info" + botPrefix,
    commandPrivate: "info",
    description: {
      pt: "Mostra as informações de um usuário",
      en: "Show user info",
    },
    handler: InfoHandler,
    scopes: ["all_group_chats", ],
  },
  Gift: {
    category_user: category_user.EconomyTrade,
    command: "gift" + botPrefix,
    description: {
      pt: "Presenteia um personagem para outro usuario",
      en: "Gift a character to another user",
    },
    handler: GiftHandler,
    scopes: ["all_group_chats", ],
  },
  Fav: {
    category_user: category_user.InfoPersonalization,
    command: "fav" + botPrefix,
    commandPrivate: "fav",
    description: {
      pt: "Seleciona seu personagem favorito",
      en: "Select your favorite character",
    },
    handler: favHandler,
    scopes: ["all_group_chats", ],
  },
  Harem: {
    category_user: category_user.Main,
    command: `my${typeBot}s`,

    commandPrivate: "harem",
    description: {
      pt: "Mostra o seu harém de personagens",
      en: "Show your character harem",
    },
    handler: HaremHandler,
    scopes: ["all_group_chats", ],
  },
  HaremMode: {
    category_user: category_user.Collection,
    command: "haremmode" + botPrefix,
    commandPrivate: "haremmode",
    description: {
      pt: "Altera o modo de visualização do harém",
      en: "Change harem display mode",
    },
    handler: HaremmodeHandler,
    scopes: ["all_group_chats", ],
  },
  Random: {
    category_user: category_user.InfoPersonalization,
    command: typeBot ? typeBot.toLowerCase() : "random",
    commandPrivate: typeBot ? typeBot.toLowerCase() : "random", commandPrivateInChat: true,

    description: {
      pt: "Traz um personagem aleatório do DB",
      en: "Brings a random character from the DB",
    },
    handler: RandomCharacterHandler,
    scopes: ["all_group_chats", ],
  },
  Animelist: {
    category_user: category_user.InfoPersonalization,
    command: "animelist" + botPrefix,
    commandPrivate: "animelist" + botPrefix,
    description: {
      pt: "Lista de animes por letra",
      en: "List animes by letter",
    },
    handler: animelistCommand,
    scopes: ["all_group_chats", ],
  },
  Dominar: {
    command: "dominar",
    category_user: category_user.Main,
    description: {
      pt: "Tenta capturar um personagem que apareceu no chat",
      en: "Try to capture a character that appeared in chat",
    },
    handler: CapturarCharacter,
    scopes: ["all_group_chats", ],
  },
  Detect: {
    category_user: category_user.Main,
    command: "detect" + botPrefix,
    commandPrivate: "detect",
    description: {
      pt: "Busca um personagem e mostra quem o possui na coleção",
      en: "Search a character and show who owns it",
    },
    handler: DetectHandler,
    scopes: ["all_group_chats", ],
  },
};

for (const cfg of Object.values(userCommandsRegistryDict)) {
  const handlerWrapper = async (ctx: MyContext) => {
    debug("Comando", cfg.command, ctx.chat?.type, "executado por", ctx.from?.username);
    if
      (ctx.chat?.type !== 'private' && ctx.commandMatch?.command === cfg.commandPrivate && cfg.commandPrivateInChat === false) {
      return debug("Comando privado em", ctx.chat?.type, 'ignorado', cfg.commandPrivate, ctx.chat?.type, "executado por", ctx.from?.username);

    }
    return cfg.handler(ctx);
  };
  registerCommand(userCommandsRegistry, cfg.command, cfg.description.pt, handlerWrapper, cfg.commandPrivate);
}

export { userCommandsRegistry };
