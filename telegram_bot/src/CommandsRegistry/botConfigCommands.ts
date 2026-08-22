import { CommandGroup, type Command } from "@grammyjs/commands";
import { ChatType, type MyContext } from "../utils/customTypes.js";
import { verbose } from "../utils/log.js";
import type { ProfileType } from "../../generated/prisma/enums.js";
//botPrefix [waifu , husbando]
const botPrefix = process.env.TYPE_BOT?.charAt(0)?.toLowerCase() ?? "";
const typeBot = process.env.TYPE_BOT
  ? process.env.TYPE_BOT.toLowerCase()
  : process.env.TYPE_BOT;
const prefixs = "./!";
const options = { ignoreCase: true, prefixs };
type ScopeType =
  "all_group_chats" | "all_private_chats" | "all_chat_administrators";

export enum category_user {
  Main = "principais user",
  Collection = "collection",
  EconomyTrade = "economia & Troca",
  InfoPersonalization = "info & Personalização",
  Hidden = "ocultos publicos",
}
export enum category_admin_group {
  main = "principais admin group",
}
export enum category_admin_bot {
  main = "principais admin bot",
  Characters = "personagens",
  Admins = "administradores",
}

export type CommandConfig = {
  command: string;
  commandPrivate?: string;
  commandPrivateInChat?: boolean;
  commandInChat?: boolean;
  minPermission?: ProfileType;
  other_commands?: [string];
  category_user?: category_user;
  category_admin_group?: category_admin_group;
  category_admin_bot?: category_admin_bot;

  description: {
    pt: string;
    en: string;
  };
  handler: (ctx: MyContext) => Promise<any> | any;
  // scopes: ScopeType[];
};

export function registerCommand(
  registry: CommandGroup<MyContext>,
  CommandsRegistryDict: CommandConfig,
) {
  verbose("registrando comando", CommandsRegistryDict.command);

  if (
    CommandsRegistryDict.commandInChat ||
    CommandsRegistryDict.commandInChat === undefined
  ) {
    const publicCmd = registry.command(
      CommandsRegistryDict.command,
      CommandsRegistryDict.description.pt,
      CommandsRegistryDict.handler,
      options,
    );
    publicCmd.addToScope(
      { type: "all_chat_administrators" },
      CommandsRegistryDict.handler,
    );
  }

  if (
    CommandsRegistryDict.commandPrivate ||
    CommandsRegistryDict.commandPrivateInChat !== false
  ) {
    if (!CommandsRegistryDict.commandPrivate) {
      return verbose(
        "comando privado nao definido para",
        CommandsRegistryDict.command,
      );
    }
    const privateCmd = registry.command(
      CommandsRegistryDict.commandPrivate,
      CommandsRegistryDict.description.pt,
      CommandsRegistryDict.handler,
      options,
    );
    privateCmd.addToScope(
      { type: "all_private_chats" },
      CommandsRegistryDict.handler,
    );
  }

  // if (CommandsRegistryDict.minPermission && process.env.GROUP_ADM) {
  //      const publicCmd = registry.command(CommandsRegistryDict.command, CommandsRegistryDict.description.pt, CommandsRegistryDict.handler, options);
  //   publicCmd.addToScope({ type: "chat_administrators",
  //   chat_id: process.env.GROUP_ADM ||0 }, CommandsRegistryDict.handler);
  // }
}

/**
 * Escopos de menu suportados (mesma forma da Bot API: objetos com `type`;
 * escopos de chat especifico levam o chat_id junto).
 */
export type ChatScope =
  | { type: "all_group_chats" }
  | { type: "all_private_chats" }
  | { type: "chat_administrators"; chat_id: number }
  | { type: "chat"; chat_id: number };

/** Adiciona o comando a um escopo, resolvendo o overload correto do plugin. */
function addToScope(
  cmd: Command<MyContext>,
  scope: ChatScope,
  mw: (ctx: MyContext) => Promise<any>,
): void {
  switch (scope.type) {
    case "all_group_chats":
      cmd.addToScope({ type: "all_group_chats" }, mw);
      break;
    case "all_private_chats":
      cmd.addToScope({ type: "all_private_chats" }, mw);
      break;
    case "chat_administrators":
      cmd.addToScope(
        { type: "chat_administrators", chat_id: scope.chat_id },
        mw,
      );
      break;
    case "chat":
      cmd.addToScope({ type: "chat", chat_id: scope.chat_id }, mw);
      break;
  }
}

export type AddMenuOptions = {
  /** Onde o nome principal aparece. Padrao: grupos (+ privado se nao houver alias com nome diferente). */
  mainScopes?: ChatScope[];
  /** Onde o ALIAS privado aparece. Padrao: all_private_chats. [] = nao criar alias no menu. */
  aliasScopes?: ChatScope[];
  /** Envolve o handler antes de registrar (ex.: checagem de permissao admin-bot). */
  wrap?: (
    handler: CommandConfig["handler"],
  ) => (ctx: MyContext) => Promise<any>;
};

/**
 * Registra um comando destinado ao MENU (setMyCommands) e ao middleware.
 *
 * Regras:
 * - NAO passa handler ao .command(): isso registraria tudo automaticamente no
 *   escopo "default", misturando todos os nomes em um unico bucket.
 * - Nome principal -> mainScopes (padrao: all_group_chats; inclui
 *   all_private_chats quando commandPrivate e igual/inexistente).
 * - Alias privado (nome diferente) -> aliasScopes (padrao: all_private_chats).
 * - localize pt/en com o MESMO nome: cria buckets language_code dedicados que
 *   SOBRESCREVEM listas manuais antigas por idioma (evita menus defasados).
 */
export function addMenuCommand(
  registry: CommandGroup<MyContext>,
  cfg: CommandConfig,
  opts: AddMenuOptions = {},
): void {
  const run = opts.wrap ? opts.wrap(cfg.handler) : cfg.handler;

  const handlerWrapper = async (ctx: MyContext) => {
    verbose(
      "Comando",
      cfg.command,
      ctx.chat?.type,
      "executado por",
      ctx.from?.username,
    );
    if (
      ctx.chat?.type !== "private" &&
      ctx.commandMatch?.command === cfg.commandPrivate &&
      cfg.commandPrivateInChat === false
    ) {
      return verbose(
        "Comando privado em",
        ctx.chat?.type,
        "ignorado",
        cfg.commandPrivate,
        "executado por",
        ctx.from?.username,
      );
    }
    return run(ctx);
  };

  const hasDistinctAlias = Boolean(
    cfg.commandPrivate && cfg.commandPrivate !== cfg.command,
  );

  const mainScopes: ChatScope[] = opts.mainScopes ?? [
    { type: "all_group_chats" },
    ...(hasDistinctAlias ? [] : [{ type: "all_private_chats" } as const]),
  ];

  verbose("registrando comando", cfg.command, "->", JSON.stringify(mainScopes));

  const cmd = registry.command(cfg.command, cfg.description.pt, {
    ignoreCase: true,
  });
  cmd.localize("pt", cfg.command, cfg.description.pt);
  cmd.localize("en", cfg.command, cfg.description.en);
  for (const scope of mainScopes) addToScope(cmd, scope, handlerWrapper);

  if (
    hasDistinctAlias &&
    (opts.aliasScopes ?? [{ type: "all_private_chats" } as const]).length > 0
  ) {
    const aliasScopes = opts.aliasScopes ?? [{ type: "all_private_chats" }];
    const privateName = cfg.commandPrivate!;
    const alias = registry.command(privateName, cfg.description.pt, {
      ignoreCase: true,
    });
    alias.localize("pt", privateName, cfg.description.pt);
    alias.localize("en", privateName, cfg.description.en);
    for (const scope of aliasScopes) addToScope(alias, scope, handlerWrapper);
  }
}

/** Escopo do grupo administrativo (GROUP_ADM), se configurado. */
export function admGroupScope():
  | {
      type: "chat_administrators";
      chat_id: number;
    }
  | undefined {
  const raw = process.env.GROUP_ADM;
  if (!raw) return undefined;
  const chatId = Number(raw);
  if (!Number.isFinite(chatId) || chatId === 0) return undefined;
  return { type: "chat_administrators", chat_id: chatId };
}

export function isWaifuBotCheck(): boolean {
  verbose("checando tipo de bot fun isWaifuBotCheck()", typeBot?.toLowerCase());

  if (typeBot?.toLowerCase() === ChatType.WAIFU) {
    return true;
  }

  if (typeBot?.toLowerCase() === ChatType.HUSBANDO) {
    return false;
  }

  return false;
}
export { botPrefix, typeBot, prefixs, options };
