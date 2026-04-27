// import { GetCharacterById } from "../../../../../utils/chareter/getbyid";
// import type { Character, MyContext, PreCharacter } from "../../../../../utils/customTypes";
// import { warn } from "../../../../../utils/log";

// export async function editCharHandler(ctx: MyContext) {
//     //busca por id
//     let charid: number | undefined;
//      if (ctx.match) {
//     charid = Number(ctx.match);
//   }
//   if (!charid && ctx.message?.reply_to_message) {
//     const reply = ctx.message.reply_to_message;

//     const text = reply.text || reply.caption || "";

//     const match = text.match(/\d+/); // pega primeiro número

//     if (match) {
//       charid = Number(match[0]);
//     }
//   }
//     if (!charid || isNaN(charid)) {
//       warn(`favCharacter - ID inválido`, {
//         userId: ctx.from?.id,
//         charid,
//         match: ctx.match,
//       });
//       return ctx.reply(ctx.t("error-not-id"));
//     }

// const char :Character = GetCharacterById(
//     ctx.session.settings.genero || process.env.TYPE_BOT,charid
// )

// const charData: PreCharacter = {
//     idchat: ctx.message!.message_id,
//     nome: nome.trim(),
//     anime: anime.trim(),
//     rarities,
//     events,
//     genero: ctx.session.settings.genero,
//     mediatype: media.type,
//     media: media.file_id,
//     username: ctx.from?.first_name || '',
//     user_id: ctx.from?.id || 0,
//     extras: ctx.from as Record<string, any>,
//   };




//   await ctx.reply("Comando /editchar em desenvolvimento.");
// }