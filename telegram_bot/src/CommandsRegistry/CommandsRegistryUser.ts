import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import {
  botPrefix,
  typeBot,
  type CommandConfig,
  addMenuCommand,
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
  },
  topchat: {
    category_user: category_user.InfoPersonalization,
    command: "topchat" + botPrefix,
    description: {
      pt: "Mostra o top de jogadores",
      en: "Show the top players",
    },
    handler: topHandlerChat,
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
  },
  Trade: {
    category_user: category_user.EconomyTrade,
    command: "trade" + botPrefix,
    description: {
      pt: "negocia a troca de personagens com outro usuario",
      en: "Trade characters with another user",
    },
    handler: TradeHandler,
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
  },
  Gift: {
    category_user: category_user.EconomyTrade,
    command: "gift" + botPrefix,
    description: {
      pt: "Presenteia um personagem para outro usuario",
      en: "Gift a character to another user",
    },
    handler: GiftHandler,
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
  },
  Random: {
    category_user: category_user.InfoPersonalization,
    command: typeBot ? typeBot.toLowerCase() : "random",
    commandPrivate: typeBot ? typeBot.toLowerCase() : "random",
    commandPrivateInChat: true,

    description: {
      pt: "Traz um personagem aleatório do DB",
      en: "Brings a random character from the DB",
    },
    handler: RandomCharacterHandler,
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
  },
  Dominar: {
    command: "dominar",
    category_user: category_user.Main,
    commandPrivateInChat: false,
    description: {
      pt: "Tenta capturar um personagem que apareceu no chat",
      en: "Try to capture a character that appeared in chat",
    },
    handler: CapturarCharacter,
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
  },
};

/**
 * Registra os comandos de usuario no menu agregado.
 * Unico ponto que conhece os escopos: nome principal em grupos, alias
 * (commandPrivate) em chats privados; nomes iguais cobrem ambos.
 */
export function addUserCommandsToMenu(menu: CommandGroup<MyContext>): void {
  for (const cfg of Object.values(userCommandsRegistryDict)) {
    addMenuCommand(menu, cfg);
  }
}
