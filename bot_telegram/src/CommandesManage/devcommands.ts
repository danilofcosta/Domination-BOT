import { CommandGroup } from "@grammyjs/commands";
import { DropCharacter } from "../handlers/listeners/doprar_per.js";
import type { MyContext } from "../utils/customTypes.js";
import { options } from "./botConfigCommands.js";
import { createSecureServer, emoji_id } from "../handlers/Comandos/testes_commands.js";

const devCommands = new CommandGroup<MyContext>();

const guardDevOnly = async (ctx: MyContext): Promise<boolean> => {
  if (String(ctx.message?.from.id) !== process.env.CHAT_ID_DEV) {
    await ctx.reply("Comando apenas para desenvolvedor.");
    return false;
  }
  return true;
};

async function ForceDrop(ctx: MyContext) {
  const allowed = await guardDevOnly(ctx);
  if (!allowed) return;
  const result = await DropCharacter(ctx);
  if (!result) {
    await ctx.reply("Falha ao dropar character");
  }
}

devCommands.command(
  "dev",
  "Forçar drop de personagem",
  ForceDrop,
  options,
);

devCommands.command(
  "get",
  "Obter dados do personagem por ID",
  emoji_id,
  options,
);

devCommands.command(
  "createuser",
  "Criar usuário manualmente",
  createSecureServer,
  options,
);

export { devCommands, guardDevOnly };