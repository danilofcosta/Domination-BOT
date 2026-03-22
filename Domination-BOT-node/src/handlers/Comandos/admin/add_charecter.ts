import {
MediaType
} from "../../../../generated/prisma/client.js";
import { characterCache, setCharacter } from "../../../cache/cache.js";
import {  type MyContext } from "../../../utils/customTypes.js";
import { LinkMsg } from "../../../utils/link_msg.js";
import type { ChatType } from "../../../utils/types.js";
// import { prisma } from "../../../../lib/prisma.js";
export interface PreCharacter {
  idchat?:number | undefined;
  nome: string;
  anime: string;
  rarities?: number[] | undefined;
  events?: number[] | undefined;
  genero: ChatType;
  mediatype: MediaType;
  media: string;
  username: string;
  user_id: number;
  extras?: JSON | undefined;
}

export async function AddCharacterHandler(ctx: MyContext) {
  // file id | url midia
  let file_data: string | undefined;
  // comando para adicionar um personagem
  // command(se for comando /command ) , nome ,anime caso
  let text_command: string | undefined;
  let Media_Type: MediaType = MediaType.IMAGE_FILEID;

  const reply = ctx.message?.reply_to_message;

  // caso não seja uma mensagem de resposta
  if (!reply) {
    console.log("No reply message");
    ctx.reply(ctx.t("add_character_not_reply"));
    return;
  }
  //  se for uma mensagem de imagem
  if (reply.photo && reply.photo !== undefined && reply.photo.length > 0) {
    // pega o file id com melhor qualidade
    file_data = reply.photo?.at(-1)?.file_id;
    Media_Type = MediaType.IMAGE_FILEID;
  }
  // se for uma mensagem de video
  else if (reply.video) {
    file_data = reply.video.file_id;
    Media_Type = MediaType.VIDEO_FILEID;
  }
  text_command = reply.text ?? reply.caption ?? "";

  const [nome, anime,...rest] = text_command.split(","); // as primaras infos do personagem devem ser separadas por virgula
  
  if (!file_data || !nome || !anime) {
    console.log("Missing fileId, nome or anime");
    ctx.reply(ctx.t("add_character_not_info"));
    return;
  }





  const raritiesToBind: number[] = [];
  const eventsToBind: number[] = [];

  if (rest.length > 0) {
    const tokens = rest.join(",").split(/[\s,.]+/);
    for (let token of tokens) {
      token = token.trim().toLowerCase();
      if (!token) continue;
      
      if (token.startsWith('r')) {
        const id = parseInt(token.replace('r', ''), 10);
        if (!isNaN(id)) raritiesToBind.push(id);
      } else if (token.startsWith('e')) {
        const id = parseInt(token.replace('e', ''), 10);
        if (!isNaN(id)) eventsToBind.push(id);
      }
    }
  }

  await confirmCharacter(ctx, {
    idchat :ctx.message.message_id,

    nome: nome.trim(),
    anime: anime.trim(),
    rarities: raritiesToBind.length > 0 ? raritiesToBind : undefined,
    events: eventsToBind.length > 0 ? eventsToBind : undefined,
    genero: ctx.session.settings.genero,
    mediatype: Media_Type,
    media: file_data,
    username: ctx.from?.first_name || "",
    user_id: ctx.from?.id || 0,
    extras: JSON.parse(JSON.stringify(ctx.from)),
  });
}



async function confirmCharacter(ctx: MyContext, data_character: PreCharacter) {
  const {
    idchat,
    nome,
    anime,
    rarities,
    events,
    genero,
    mediatype,
    media,
    username,
    user_id,
  } = data_character;

  const text = `Nome: ${nome}
Anime: ${anime}
Genero: ${genero}
Mediatype: ${mediatype}
Data: ${media}
Link: ${LinkMsg(Number(ctx.chat?.id), Number(idchat))}
Rarities: ${rarities ?? "valor padrao"}
Events: ${events ?? "sem evento "}`;

  const id = Date.now();
  // salva no cache dados recebidos
  setCharacter(Number(id), data_character);

  await ctx.reply(text, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: ctx.t("add_character_btn_confirm"),
            callback_data: "addcharacter_confirm_" + id,
          },
          {
            text: ctx.t("add_character_btn_cancel"),
            callback_data: "addcharacter_cancel_" + id,
          },
          {
            text: ctx.t("add_character_btn_edit"),
            callback_data: "addcharacter_edit_" + id,
          },
        ],
      ],
    },
  });
}




// rest = [rarities,events] 
// async function name(rest: string[]) {
//   let char_data:any[] = []
//   for (const r of rest) {

//     if (r.startsWith('r')){
//       const id = r.replace("r","").trim();//verifica  se e um numero 
//     const rarities =  prisma.events.findFirst({where:{id:Number(id)}})
//     if (rarities) {
//       char_data.push(rarities)// adiciona o rarities ao array
//     }



//     }
//     if (r.startsWith('e')){
//       const id = r.replace("e","").trim();//verifica  se e um numero 
//       const rarities =  prisma.events.findFirst({where:{id:Number(id)}})
//       if (rarities) {
//         char_data.push(rarities)// adiciona o rarities ao array
//       }
//     }
//   }
//   return char_data

    
  
// }