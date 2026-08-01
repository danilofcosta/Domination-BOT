import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function parseFtl(text: string): Map<string, string> {
  const entries = new Map<string, string>();
  let currentKey: string | null = null;
  let currentValue: string[] = [];
  let inSelect = 0;

  const lines = text.split("\n");

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (currentKey && line.includes("->") && !line.includes("= ")) {
      inSelect++;
    }

    if (inSelect > 0) {
      currentValue.push(line);
      if (line.includes("}?")) inSelect--;
      continue;
    }

    if (/^#/.test(line.trimStart())) continue;

    if (/^\s+/.test(line) && currentKey) {
      currentValue.push(line.trimEnd());
      continue;
    }

    const match = line.match(/^([\w][\w.-]*)\s*=\s*(.*)$/);
    if (match) {
      if (currentKey) {
        entries.set(currentKey, currentValue.join("\n").trim());
      }
      currentKey = match[1];
      const val = match[2];
      if (val) {
        currentValue = [val.trimEnd()];
        if (val.includes("->")) inSelect++;
      } else {
        currentValue = [];
      }
      continue;
    }

    if (currentKey && line.trim() === "") {
      entries.set(currentKey, currentValue.join("\n").trim());
      currentKey = null;
      currentValue = [];
    }
  }

  if (currentKey) {
    entries.set(currentKey, currentValue.join("\n").trim());
  }

  return entries;
}

async function seed() {
  const ftlPath = join(__dirname, "..", "..", "bot_telegram", "src", "locales", "pt.ftl");
  const content = readFileSync(ftlPath, "utf-8");
  const entries = parseFtl(content);

  console.log(`Parsed ${entries.size} keys from pt.ftl`);

  for (const [key, value] of entries) {
    if (!value) continue;

    const existing = await prisma.localeKey.upsert({
      where: { key },
      create: { key },
      update: {},
    });

    await prisma.localeTranslation.upsert({
      where: { keyId_locale: { keyId: existing.id, locale: "pt" } },
      create: { keyId: existing.id, locale: "pt", value },
      update: { value },
    });
  }

  const configs = [
    { key: "DROP_MSG", value: "100", label: "Messages before character drop", type: "number" },
    { key: "UNDROP_MSG", value: "140", label: "Messages before undrop (DROP + 40)", type: "number" },
    { key: "DAILY_LIMIT", value: "50", label: "Daily capture limit per user", type: "number" },
  ];

  for (const cfg of configs) {
    await prisma.botConfig.upsert({
      where: { key: cfg.key },
      create: cfg,
      update: { value: cfg.value },
    });
  }

  console.log("Seed completed!");
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
