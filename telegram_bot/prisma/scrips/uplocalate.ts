 import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import { _base } from "./baseText.js";


// ==================== SEED ====================
const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log(`Upserting ${_base.length} locale keys...`);
  let cont = 0
  for (const item of _base) {
    const localeKey = await prisma.localeKey.upsert({
      where: { key: item.key },
      create: {
        key: item.key,
        description: item.description,
      },
      update: {
        description: item.description,
      },
    });

    await prisma.localeTranslation.upsert({
      where: {
        keyId_locale: {
          keyId: localeKey.id,
          locale: item.localeTraslation.locale,
        },
      },
      create: {
        keyId: localeKey.id,
        value: item.localeTraslation.value,
        locale: item.localeTraslation.locale,
        extrakey: item.localeTraslation.extrakey
          ? item.localeTraslation.extrakey.map((e) => e.key)
          : [],
      },
      update: {
        value: item.localeTraslation.value,
        locale: item.localeTraslation.locale,
        extrakey: item.localeTraslation.extrakey
          ? item.localeTraslation.extrakey.map((e) => e.key)
          : [],
      },
    });

    console.log(`  ✅ ${item.key}`);
  }

  console.log(`Seed completed! ${_base.length} keys upserted.`);
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
