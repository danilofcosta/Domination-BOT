import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function upuse() {
  await prisma.telegramUser.update({
    where: {
      telegramId: BigInt(422779743), // ou 422779743n
    },
    data: {
      profileType: "ADMIN",
    },
  });
  console.log('done')
}

upuse()
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });