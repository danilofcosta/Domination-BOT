import { CommandGroup, LanguageCodes } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import { CapturarCharacter } from "../handlers/Comandos/users/dominar.js";
import { botPrefix, options, typeBot } from "./botConfigCommands.js";
import { HaremHandler } from "../handlers/Comandos/users/harem.js";
import { favCharacter } from "../handlers/Comandos/users/fav.js";
import { Myinfos } from "../handlers/Comandos/users/myinfos.js";
import { giftHandler } from "../handlers/Comandos/users/gift.js";
import { Ramdon_Character_Handler } from "../handlers/Comandos/globais/random_character.js";
import { topHandler } from "../handlers/Comandos/users/top.js";
import { StartGreetings } from "../handlers/Comandos/globais/Start.js";
import { debug } from "../utils/log.js";

const botCommands = new CommandGroup<MyContext>();
export const ComandosUser = {
  dominar: {
    command: "dominar",
    description: "Dominate a character",
    handler: CapturarCharacter,
    scope: "all_group_chats",
  },
  harem: {
    command: `my${typeBot}s`,
    description: "Get information about the Harem feature",
    handler: HaremHandler,
    scope: "all_group_chats",
  },
  fav: {
    command: `fav${botPrefix}`,
    description: "Show your favorite character",
    handler: favCharacter,
    scope: "all_group_chats",
  },
  gift: {
    command: `${botPrefix}gift`,
    description: "Gift a character to another user",
    handler: giftHandler,
    scope: "all_group_chats",
  },
  myinfos: {
    command: `myinfo${botPrefix}`,
    description: "Show your information",
    handler: Myinfos,
    scope: "all_group_chats",
  },
  random: {
    command: typeBot || "random",
    description: "traz um personagem aleatorio do db",
    handler: Ramdon_Character_Handler,
    scope: "all_group_chats",
  },
  top: {
    command: `${botPrefix}top`,
    description: "Show the top players",
    handler: topHandler,
    scope: "all_group_chats",
  },
  start: {
    command: "start",
    description: "Start the bot",
    handler: StartGreetings,
    scope: "all_group_chats",
  },
} as const;

const localizedCommands: Record<string, { es: { command: string; description: string }; pt: { command: string; description: string } }> = {
  dominar: {
    es: { command: "dominar", description: "Domina a un personaje" },
    pt: { command: "dominar", description: "Domina um personagem" }
  },
  harem: {
    es: { command: `mis${typeBot}s`, description: "Información del Harem" },
    pt: { command: `meus${typeBot}s`, description: "Informações do Harem" }
  },
  fav: {
    es: { command: `${botPrefix}fav`, description: "Tu personaje favorito" },
    pt: { command: `${botPrefix}fav`, description: "Seu personagem favorito" }
  },
  gift: {
    es: { command: `${botPrefix}regalo`, description: "Regala un personaje" },
    pt: { command: `${botPrefix}presente`, description: "Presenteia um personagem" }
  },
  myinfos: {
    es: { command: `miinfo${botPrefix}`, description: "Tu información" },
    pt: { command: `minhainfo${botPrefix}`, description: "Suas informações" }
  },
  random: {
    es: { command: "aleatorio", description: "Personaje aleatorio del DB" },
    pt: { command: "aleatorio", description: "Personagem aleatório do DB" }
  },
  top: {
    es: { command: `${botPrefix}top`, description: "Top jugadores" },
    pt: { command: `${botPrefix}top`, description: "Top jogadores" }
  },
  start: {
    es: { command: "start", description: "Iniciar el bot" },
    pt: { command: "start", description: "Iniciar o bot" }
  },
};

for (const [key, value] of Object.entries(ComandosUser)) {
  const localized = localizedCommands[key];
  // console.log("Comando", value.command, "executado por", );
  const cmd = botCommands.command(value.command, value.description).addToScope(
    { type: 'all_group_chats' },
    (ctx: MyContext) => {
      debug("Comando", value.command, "executado por", ctx.from?.username);
      value.handler(ctx)
    }
  );
  if (localized) {
    cmd
      .localize(LanguageCodes.Spanish, localized.es.command, localized.es.description)
      .localize(LanguageCodes.Portuguese, localized.pt.command, localized.pt.description);
  }
}



export { botCommands };
