import { Keyboard } from "grammy";
import type { MyContext } from "../../../../utils/customTypes.js";
import {
  NavigateMenu,
  NavigateMenuMode,
  SetModeHarem,
} from "./base_harem_setup.js";

type BtnStyle = Parameters<Keyboard["text"]>[1];
export function getAllButtons(data: HaremSetupDict): HaremBtn[] {
  return Object.entries(data).flatMap(([key, value]) =>
    key === "close" ? [value] : Object.values(value),
  );
}
export interface HaremBtn {
  text: string;
  icon?: string | null;
  style?: BtnStyle;
  key?: string;
  run?:
    | ((
        ctx: MyContext,
        menu?: Record<string, HaremBtn>,
        key?: string,
      ) => Promise<void>)
    | null;
}

export interface HaremSetupDict {
  main: Record<string, HaremBtn>;
  modo: Record<string, HaremBtn>;
  modos: Record<string, HaremBtn>;

  close: HaremBtn;
}

export const Harem_setup_dict: HaremSetupDict = {
  main: {
    // Backup: {
    //   text: "Backup",
    //   icon: "5443127283898405358",
    //   run: null,
    // },

    Modo: {
      text: "Modo Harem",
      icon: "5197269100878907942",
      run: (ctx) => NavigateMenu(ctx, Harem_setup_dict.modo),
    },
  },
  modo: {
    style: {
      text: "style",
      icon: "5197269100878907942",
      run: null,
    },
    Paginas: {
      text: "Paginas",
      icon: "5226794488483047978",
      run: (ctx) => NavigateMenuMode(ctx, Harem_setup_dict.modos),
    },
  },

  modos: {
    default: {
      text: "Padão",
      key: "default",
      icon: null,
      run: (ctx) => SetModeHarem(ctx, "default"),
    },
    latest: {
      text: "recente",
      icon: null,
      run: (ctx) => SetModeHarem(ctx, "latest"),
      key: "latest",
    },
    rarity: {
      text: "Raridade",
      icon: null,
      run: (ctx) => SetModeHarem(ctx, "rarity"),
      key: "rarity",
    },
    event: {
      text: "Evento",
      icon: null,

      run: (ctx) => SetModeHarem(ctx, "event"),
      key: "event",
    },
  },

  close: {
    text: "Sair",
    style: "danger",
    icon: "5237695957293875263",

    run: async (ctx: MyContext) => {
      await ctx.reply("Fechado", {
        reply_markup: {
          remove_keyboard: true,
        },
      });
    },
  },
};
