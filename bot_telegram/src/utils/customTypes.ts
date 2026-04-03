// src/types.ts
import type { Context } from "grammy";
import type { I18nFlavor } from "@grammyjs/i18n";
import type { SessionFlavor } from "grammy";
import type { Character, ChatType } from "./types.js";


export interface SessionData {
  settings: {
    genero: ChatType;
  };
  grupo: {
    cont: number;
    dropId: number | null;
    data: Date | null;
    character: Character | null;
  };
  adminSetup?: {
    action: "edit_nome" | "edit_anime" | null;
    targetId: string | null;
  };
}

/* =========================
 * Contexto customizado
 * ========================= */

export type MyContext = Context &
  I18nFlavor &
  SessionFlavor<SessionData>;
