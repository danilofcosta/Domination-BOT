import { prisma } from "../../../../lib/prisma.js";
import { Build_btn_Keyboard } from "../../../../utils/btns.js";
import { ChatType, type MyContext } from "../../../../utils/customTypes.js";
import { Sendmedia } from "../../../../utils/sendmedia.js";
import { Harem_setup_dict, type HaremBtn } from "./build.js";

export async function NavigateMenu(
  ctx: MyContext,
  menu: Record<string, HaremBtn>,
) {
  // await ctx.deleteMessage().catch(() => {});

  const keyboard = Build_btn_Keyboard(menu);
  await ctx.reply(ctx.message?.text ?? " ", {
    reply_markup: keyboard,
  });
}
export async function NavigateMenuMode(
  ctx: MyContext,
  menu: Record<string, HaremBtn>,
) {
  let currentMode = "default";
  if (ctx.from?.id) {
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(ctx.from.id) },
    });
    if (user) {
      const isHusbando = ctx.botType === ChatType.HUSBANDO;
      const config = isHusbando
        ? (user.husbandoConfig as any) || {}
        : (user.waifuConfig as any) || {};
      currentMode = config.haremMode || "default";
    }
  }
  for (const i in menu) {
    console.log(menu[i].key, currentMode, menu[i].icon);
    if (menu[i].key === currentMode) {
      menu[i].style = "success";
    } else {
      menu[i].style = undefined;
    }
  }

  const keyboard = Build_btn_Keyboard(menu);
  await ctx.reply(ctx.message?.text ?? " ", {
    reply_markup: keyboard,
  });
}

export async function SetModeHarem(ctx: MyContext, key: string) {
  const isHusbando = ctx.botType === ChatType.HUSBANDO;

  const userId = ctx.from?.id;
  if (!userId) {
    return console.log("sem id user ");
  }

  let config = {
    haremMode: key,
  };

  const result = await prisma.user.update({
    where: { telegramId: BigInt(userId) },
    data: isHusbando ? { husbandoConfig: config } : { waifuConfig: config },
  });

  if (result) {
    await Sendmedia({
      ctx,
      caption: ctx.t("harem-set-mode-sucess"),
    });
  }

  NavigateMenu(ctx, Harem_setup_dict.modo);
}
