import { fatal, info } from "./log.js";
import type { User } from "grammy/types";

export interface CheckBotTokenResult {
  me: User;
}

export async function checkBotToken(
  BOT_TOKEN: string | undefined,
  getMe: () => Promise<User>,
): Promise<User> {
  if (!BOT_TOKEN) {
    fatal(
      "BOT_TOKEN não encontrado. Defina BOT_TOKEN_WAIFU ou BOT_TOKEN_HUSBANDO no .env",
    );
  }

  let me: User;
  try {
    me = await getMe();
  } catch (err) {
    fatal(
      "ERRO ao validar BOT_TOKEN via getMe. Verifique se o token é válido.",
      err instanceof Error ? err.message : err,
    );
  }

  info(
    "RODANDO BOT Polling",
    `rodando em @${me.username ?? ""} com nome ${me.first_name} com id ${me.id}`,
  );
  return me;
}
