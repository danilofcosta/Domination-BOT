import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "../uteis/CustomTypes.js";
import { debug } from "../uteis/log.js";
import {
  botPrefix,
  typeBot,
  type CommandConfig,
  registerCommand,
} from "./botConfigCommands.js";
import {
  topHandler,
  topHandlerChat,
} from "../handlers/Commands/CommandsUser/top.js";
import { Myinfos } from "../handlers/Commands/CommandsUser/myinfos.js";
import { InfoHandler } from "../handlers/Commands/CommandsUser/info.js";
import { GiftHandler } from "../handlers/Commands/CommandsUser/gift.js";
import { favHandler } from "../handlers/Commands/CommandsUser/fav.js";
import { HaremHandler } from "../handlers/Commands/CommandsUser/harem.js";
import { HaremmodeHandler } from "../handlers/Commands/CommandsUser/haremmode.js";
import { CapturarCharacter } from "../handlers/Commands/CommandsUser/dominar.js";
import { TradeHandler } from "../handlers/Commands/CommandsUser/trade.js";
import { RandomCharacterHandler } from "../handlers/Commands/CommandsUser/RandomCharacterHander.js";
import { animelistCommand } from "../handlers/Commands/CommandsUser/animelist.js";
import { DetectHandler } from "../handlers/Commands/CommandsUser/detect.js";

const userCommandsRegistry = new CommandGroup<MyContext>();

export const userCommandsRegistryDict: Record<string, CommandConfig> = {
  top: {
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
    command: "topchat" + botPrefix,
    description: {
      pt: "Mostra o top de jogadores",
      en: "Show the top players",
    },
    handler: topHandlerChat,
    scopes: ["all_group_chats", "all_chat_administrators"],
  },
  Trade: {
    command: "trade" + botPrefix,
    description: {
      pt: "negocia a troca de personagens com outro usuario",
      en: "Trade characters with another user",
    },
    handler: TradeHandler,
    scopes: ["all_group_chats", "all_chat_administrators"],
  },
  Myinfos: {
    command: "myinfo" + botPrefix,
    commandPrivate: "myinfo",
    description: {
      pt: "Mostra o top de jogadores",
      en: "Show the top players",
    },
    handler: Myinfos,
    scopes: ["all_group_chats", "all_chat_administrators"],
  },
  Info: {
    command: "info" + botPrefix,
    commandPrivate: "info",
    description: {
      pt: "Mostra as informações de um usuário",
      en: "Show user info",
    },
    handler: InfoHandler,
    scopes: ["all_group_chats", "all_chat_administrators"],
  },
  Gift: {
    command: "gift" + botPrefix,
    description: {
      pt: "Presenteia um personagem para outro usuario",
      en: "Gift a character to another user",
    },
    handler: GiftHandler,
    scopes: ["all_group_chats", "all_chat_administrators"],
  },
  Fav: {
    command: "fav" + botPrefix,
    commandPrivate: "fav",
    description: {
      pt: "Seleciona seu personagem favorito",
      en: "Select your favorite character",
    },
    handler: favHandler,
    scopes: ["all_group_chats", "all_chat_administrators"],
  },
  Harem: {
  command: `my${typeBot}s`,

    commandPrivate: "harem",
    description: {
      pt: "Mostra o seu harém de personagens",
      en: "Show your character harem",
    },
    handler: HaremHandler,
    scopes: ["all_group_chats", "all_chat_administrators"],
  },
  HaremMode: {
    command: "haremmode" + botPrefix,
    commandPrivate: "haremmode",
    description: {
      pt: "Altera o modo de visualização do harém",
      en: "Change harem display mode",
    },
    handler: HaremmodeHandler,
    scopes: ["all_group_chats", "all_chat_administrators"],
  },
  Random: {
    command: typeBot ? typeBot.toLowerCase() : "random",
    commandPrivate: typeBot ? typeBot.toLowerCase() : "random", commandPrivateInChat: true,

    description: {
      pt: "Traz um personagem aleatório do DB",
      en: "Brings a random character from the DB",
    },
    handler: RandomCharacterHandler,
    scopes: ["all_group_chats", "all_chat_administrators"],
  },
  Animelist: {
    command: "animelist" + botPrefix,
    commandPrivate: "animelist" + botPrefix,
    description: {
      pt: "Lista de animes por letra",
      en: "List animes by letter",
    },
    handler: animelistCommand,
    scopes: ["all_group_chats", "all_chat_administrators"],
  },
  Dominar: {
    command: "dominar",

    description: {
      pt: "Tenta capturar um personagem que apareceu no chat",
      en: "Try to capture a character that appeared in chat",
    },
    handler: CapturarCharacter,
    scopes: ["all_group_chats", "all_chat_administrators"],
  },
  Detect: {
    command: "detect" + botPrefix,
    commandPrivate: "detect",
    description: {
      pt: "Busca um personagem e mostra quem o possui na coleção",
      en: "Search a character and show who owns it",
    },
    handler: DetectHandler,
    scopes: ["all_group_chats", "all_chat_administrators"],
  },
};

for (const cfg of Object.values(userCommandsRegistryDict)) {
  const handlerWrapper = async (ctx: MyContext) => {
    debug("Comando", cfg.command, ctx.chat?.type, "executado por", ctx.from?.username);
    if
        (ctx.chat?.type !== 'private' && ctx.commandMatch?.command === cfg.commandPrivate && cfg.commandPrivateInChat === false)
       {
      return debug("Comando privado em", ctx.chat?.type, 'ignorado', cfg.commandPrivate, ctx.chat?.type, "executado por", ctx.from?.username);

    }
    return cfg.handler(ctx);
  };
  registerCommand(userCommandsRegistry, cfg.command, cfg.description.pt, handlerWrapper, cfg.commandPrivate);
}

export { userCommandsRegistry };
