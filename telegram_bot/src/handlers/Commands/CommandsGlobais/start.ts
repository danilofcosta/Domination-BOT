import type { MyContext } from "../../../uteis/CustomTypes.js";
import { debug } from "../../../uteis/log.js";
import { SendMensageCustom } from "../../../uteis/sendMensageCustom.js";
import { ProcessStartArgument } from "./ProcessStartArgument.js";



export async function StartHandler(ctx: MyContext) {
    if (ctx.match) {
        debug('comando match',{'match':ctx.match})
        return await ProcessStartArgument(ctx)
    }

    if (ctx.chat?.type !== "private") {
        try {
            await ctx.react("❤‍🔥");
        } catch (error: any) {
            if (!error.description?.includes("message to react not found")) {
                console.error("Erro ao reagir com ⚡:", error);
            }
        }
        if (!ctx.message) return;
        return await SendMensageCustom({
            ctx,
            caption: `Eu estou online :D`
        });
    }

       return await SendMensageCustom({
            ctx,
            caption: `ola eu sou o ${ctx.me.first_name}`
        });

}