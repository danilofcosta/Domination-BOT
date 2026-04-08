import { prisma } from "../src/lib/prisma";
import { sendTelegramPhoto, sendTelegramMessage, sendTelegramVideo } from "../src/lib/telegram";
import { createCaption } from "../src/lib/create_caption";

async function testSendToGroup() {
  const groupId = "-1003772830810";
  const type: "waifu" | "husbando" = "waifu";

  const character = type === "waifu"
    ? await prisma.characterWaifu.findFirst({
        where: { id: 164 },
        include: {
          WaifuEvent: { include: { Event: true } },
          WaifuRarity: { include: { Rarity: true } },
        },
      })
    : await prisma.characterHusbando.findFirst({
        where: { id: 164 },
        include: {
          HusbandoEvent: { include: { Event: true } },
          HusbandoRarity: { include: { Rarity: true } },
        },
      });

  if (!character) {
    console.log("Personagem não encontrado");
    return;
  }

  console.log("Personagem selecionado:", character.name);
  console.log("Media:", character.media);
  console.log("MediaType:", character.mediaType);

  const caption = createCaption(character, type, "");
  console.log("\nCaption gerada:");
  console.log(caption);

  if (character.media && character.media.startsWith("http")) {
    const isVideo = character.mediaType?.includes("VIDEO");
    if (isVideo) {
      console.log("\nEnviando vídeo...");
      const result = await sendTelegramVideo(groupId, character.media, caption, type);
      console.log("Resultado:", result);
    } else {
      console.log("\nEnviando foto...");
      const result = await sendTelegramPhoto(groupId, character.media, caption, type);
      console.log("Resultado:", result);
    }
  } else {
    console.log("\nEnviando mensagem sem foto...");
    const result = await sendTelegramMessage(groupId, caption, type);
    console.log("Resultado:", result);
  }
}

testSendToGroup().catch(console.error);
