import { prisma } from "../../../../lib/prisma.js";
import type { MyContext } from "../../../utils/customTypes.js"
import { Sendmedia } from "../../../utils/sendmedia.js";


export async function emoji_id(ctx: MyContext) {
  console.log('d')
ctx.reply(
  JSON.stringify(ctx.message?.reply_to_message)
)}
   //  await Sendmedia(ctx, character_db as characters_husbando, capiton);

// }
export async function add_evento(ctx: MyContext) {
  try {
  const s = await prisma.characterHusbando.update({
  where: { id: 3 },
  data: {
    // events: {
    //   create: { event: { connect: { id:  3} } }  // creates a record in HusbandoEvent linking character 3 to event 1
    // }
    rarities: {
      create: { rarity: { connect: { id:  1} } }  // creates a record in HusbandoEvent linking character
    }
  }
});
    return ctx.reply(JSON.stringify(s));
  } catch (err) {
    console.error(err);
    return ctx.reply("Failed to update character.");
  }
}



export async function teste(ctx: MyContext) {
  try {
  const s = await prisma.characterHusbando.findFirst({
    where: { id: 3 },
    include: { events: { include: { event: true }} , rarities: { include: { rarity: true } } 
  },
  })
    return ctx.reply(JSON.stringify(s, null, 2));
  } catch (err) {
    console.error(err);
    return ctx.reply("Failed to update character.");
  }
}
