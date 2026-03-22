import { prisma } from "../../../../lib/prisma.js";

interface EventInput {
  id?: number;
  code: string;
  name: string;
  emoji: string;
  description?: string | null;
  emoji_id?: string | null;
}


export async function addEvent(data: EventInput) {
  try {
    const event = await prisma.event.create({ data });
    console.log("success", event.code);
    return event;
  } catch (err) {
    console.error("error creating event:", err);
    return null;
  }
}


export async function addManyEvents(list: EventInput[]) {
  try {
    const formatted = list.map((event) => ({
      code: event.code,
      name: event.name,
      emoji: event.emoji,
      description: event.description ?? null,
      emoji_id: event.emoji_id != null ? event.emoji_id : null,
    }));

    const result = await prisma.event.createMany({
      data: formatted,
      skipDuplicates: true,
    });

    console.log(`success: ${result.count} eventos criados`);
    return result.count;
  } catch (err) {
    console.error("error creating events:", err);
    return 0;
  }
}


// async function Reset_id_Event() {
//    //ALTER SEQUENCE "Event_id_seq" RESTART WITH 1;
//    await prisma.event.deleteMany({ where: {} });
//    await prisma.event.createMany({ data: event, skipDuplicates: true });
// }

// Reset_id_Event();



// async function main() {
//   await addManyEvents(event);
//   console.log("done");
// }

// main();