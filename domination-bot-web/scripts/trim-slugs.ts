import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const waifus = await prisma.characterWaifu.findMany();
  for (const w of waifus) {
    const trimmed = w.slug.trim();
    if (trimmed !== w.slug) {
      await prisma.characterWaifu.update({
        where: { id: w.id },
        data: { slug: trimmed }
      });
      console.log(`Fixed waifu: ${w.name}`);
    }
  }

  const husbandos = await prisma.characterHusbando.findMany();
  for (const h of husbandos) {
    const trimmed = h.slug.trim();
    if (trimmed !== h.slug) {
      await prisma.characterHusbando.update({
        where: { id: h.id },
        data: { slug: trimmed }
      });
      console.log(`Fixed husbando: ${h.name}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
