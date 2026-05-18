import { prisma } from "../lib/prisma.js"

const userId = BigInt(0)

async function main() {  const waifus = await prisma.characterWaifu.findMany({
    select: {
      id: true,
    },
    take:122
  })

  const husbandos = await prisma.characterHusbando.findMany({
    select: {
      id: true,
    },
     take:72
  })

  // MONTA DADOS WAIFU
  const dataw = waifus.map((char) => ({
    userId,
    characterId: char.id,
    count: 1,
  }))

  // MONTA DADOS HUSBANDO
  const datah = husbandos.map((char) => ({
    userId,
    characterId: char.id,
    count: 1,
  }))

  // INSERE
  await prisma.waifuCollection.createMany({
    data: dataw,
    skipDuplicates: true,
  })

  await prisma.husbandoCollection.createMany({
    data: datah,
    skipDuplicates: true,
  })

  console.log("Tudo criado!")
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })