import { CommandGroup, LanguageCodes } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import { CapturarCharacter } from "../handlers/commands/users/dominar.js";
import { botPrefix, options, typeBot } from "./botConfigCommands.js";
import { HaremHandler } from "../handlers/commands/users/harem.js";
import { favCharacter } from "../handlers/commands/users/fav.js";
import { Myinfos } from "../handlers/commands/users/myinfos.js";
import { giftHandler } from "../handlers/commands/users/gift.js";
import { HaremmodeHandler } from "../handlers/commands/users/haremmode.js";
import { topHandler } from "../handlers/commands/users/top.js";
import { StartGreetings } from "../handlers/commands/globais/Start.js";
import { animelistCommand } from "../handlers/commands/users/animelist.js";
import { setlangHandler } from "../handlers/commands/admin_groups/setlang.js";
import { debug } from "../utils/log.js";
import { Ramdon_Character_Handler } from "../handlers/commands/globais/random_character.js";
import { Backup_harem } from "../handlers/commands/users/backup.js";
import { idHandler } from "../handlers/commands/users/id.js";
import { LoginHandler } from "../handlers/commands/globais/login.js";

const UserCommands = new CommandGroup<MyContext>();

export const ComandosUser = {
  dominar: {
    command: "dominar",
    description: {
      pt: "Domina um personagem",
      en: "Dominate a character",
    },
    handler: CapturarCharacter,
    scope: { type: "all_group_chats" },
  },
  harem: {
    command: "my" + typeBot + "s",
    private: "harem",
    description: {
      pt: "Mostra o seu Harem",
      en: "Show your Harem",
    },
    handler: HaremHandler,
    scope: "all_group_chats",
  },
  fav: {
    command: "fav" + botPrefix,
    description: {
      pt: "Mostra o seu personagem favorito",
      en: "Show your favorite character",
    },
    handler: favCharacter,
    scope: "all_group_chats",
  },
  gift: {
    command: "gift" + botPrefix,
    description: {
      pt: "Presenteia um personagem para outro usuario",
      en: "Gift a character to another user",
    },
    handler: giftHandler,
    scope: "all_group_chats",
  },
  myinfos: {
    command: "myinfo" + botPrefix,
    description: {
      pt: "Mostra as suas informacoes",
      en: "Show your information",
    },
    handler: Myinfos,
    scope: "all_group_chats",
  },
  random: {
    command: typeBot || "random",
    description: {
      pt: "Traz um personagem aleatorio do DB",
      en: "Brings a random character from the DB",
    },
    handler: Ramdon_Character_Handler,
    scope: "all_group_chats",
  },
  top: {
    command: "top" + botPrefix,
    description: {
      pt: "Mostra o top de jogadores",
      en: "Show the top players",
    },
    handler: topHandler,
    scope: "all_group_chats",
  },
  haremmode: {
    command: "haremmode" + botPrefix,
    description: {
      pt: "Altera o modo de visualizacao do seu Harem",
      en: "Change the display mode of your Harem",
    },
    handler: HaremmodeHandler,
    scope: "all_group_chats",
  },
  animelist: {
    command: "animelist" + botPrefix,
    description: {
      pt: "Lista de animes por letra",
      en: "List animes by letter",
    },
    handler: animelistCommand,
    scope: "all_group_chats",
  },
   Backup_harem: {
    command: "backup" + botPrefix,
    description: {
      pt: "backup do seu harem",
      en: "List animes by letter",
    },
    handler: Backup_harem,
    scope: "all_group_chats",
  },

  id: {
    command: "id",
    description: {
      pt: "Mostra o ID do chat e do usuario",
      en: "Show chat and user ID",
    },
    handler: idHandler,
  },

  login: {
    command: "login",
    description: {
      pt: "Gera link de login para o site",
      en: "Generate web login link",
    },
    handler: LoginHandler,
  },

} as const;

for (const [key, value] of Object.entries(ComandosUser)) {
  const handlerWrapper = async (ctx: MyContext) => {
    debug("Comando", value.command, "executado por", ctx.from?.username);
    await value.handler(ctx);
  };

  UserCommands.command(
    value.command,
    value.description.pt,
    handlerWrapper,
    options,
  )
    .addToScope({ type: "all_group_chats" }, (ctx) => handlerWrapper(ctx))
    .addToScope({ type: "all_private_chats" }, (ctx) => handlerWrapper(ctx));
}

export { UserCommands };
