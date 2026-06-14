import type { MyContext } from "../../../utils/customTypes.js";

export function CreateLoginWeb(ctx: MyContext) {

  ctx.api.sendRichMessageDraft(ctx.chat?.id, "Gerando link de login web...");






}