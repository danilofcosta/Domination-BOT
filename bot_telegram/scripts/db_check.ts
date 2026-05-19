import pg from "pg";

const { Client } = pg;

const DATABASE_URL =
  process.env.DATABASE_URL ;

const TABLES = [
  "CharacterHusbando",
  "CharacterWaifu",
  "HusbandoCollection",
  "WaifuCollection",
];
const ENUMS = ["Language", "MediaType", "ProfileType", "SourceType"];

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  console.log("✅ Connected to Neon database\n");

  // 1. Indexes
  console.log("=== INDEXES ===");
  for (const table of TABLES) {
    const res = await client.query(
      `SELECT indexname, indexdef FROM pg_indexes WHERE tablename = $1 ORDER BY indexname`,
      [table]
    );
    console.log(`\n--- ${table} ---`);
    if (res.rows.length === 0) {
      console.log("  (no indexes found)");
    }
    for (const row of res.rows) {
      console.log(`  ${row.indexname}`);
      console.log(`    ${row.indexdef}`);
    }
  }

  // 2. Enums
  console.log("\n\n=== ENUMS ===");
  for (const enumName of ENUMS) {
    const res = await client.query(
      `SELECT e.enumlabel
       FROM pg_type t
       JOIN pg_enum e ON t.oid = e.enumtypid
       WHERE t.typname = $1
       ORDER BY e.enumsortorder`,
      [enumName]
    );
    console.log(`\n--- ${enumName} ---`);
    if (res.rows.length === 0) {
      console.log("  (not found in database)");
    }
    for (const row of res.rows) {
      console.log(`  • ${row.enumlabel}`);
    }
  }

  await client.end();
  console.log("\n✅ Done");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
