import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma/client.js";
import { _base } from "./localeData.js";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log(`Apagando ${_base.length} locale keys...`);

  await prisma.localeTranslation.deleteMany();
  await prisma.localeKey.deleteMany();

  console.log("Tabelas esvaziadas. Recriando a partir dos dados...");

  for (const item of _base) {
    const localeKey = await prisma.localeKey.create({
      data: {
        key: item.key,
        description: item.description,
      },
    });

    await prisma.localeTranslation.create({
      data: {
        keyId: localeKey.id,
        value: item.localeTraslation.value,
        locale: item.localeTraslation.locale,
        extrakey: item.localeTraslation.extrakey
          ? item.localeTraslation.extrakey.map((e) => e.key)
          : [],
      },
    });

    console.log(`  ✅ ${item.key}`);
  }

  console.log(`Seed completed! ${_base.length} keys criadas.`);
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
