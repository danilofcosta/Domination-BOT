import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import pg from "pg";

// connection strings
const connectionStringOld: string = `postgresql://ryo:9090@umbrel.local:5432/ryodb?schema=public`;
const connectionStringNew: string = `postgresql://ryo:9090@umbrel.local:5434/ryodb?schema=public`;

// pools
const poolOld = new pg.Pool({ connectionString: connectionStringOld });
const poolNew = new pg.Pool({ connectionString: connectionStringNew });

// adapters
const adapterOld = new PrismaPg(poolOld);
const adapterNew = new PrismaPg(poolNew);

// prisma clients
const prismaOld = new PrismaClient({ adapter: adapterOld });
const prismaNew = new PrismaClient({ adapter: adapterNew });

// função genérica de migração em lote
async function migrateTable(
  tableName: string,
  fetchFn: () => Promise<any[]>,
  insertFn: (data: any[]) => Promise<any>
) {
  const batchSize = 1000;

  console.log(`\n🔄 Migrando tabela: ${tableName}`);

  const data = await fetchFn();
  console.log(`Total de registros: ${data.length}`);

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    await insertFn(batch);

    console.log(
      `✔ ${tableName}: ${Math.min(i + batchSize, data.length)}/${data.length}`
    );
  }

  console.log(`✅ ${tableName} migrada com sucesso`);
}

// função principal
async function migrate() {
  try {
    console.log("🚀 Iniciando migração...");

    // ordem importa se houver relações!
    await migrateTable(
      "rarity",
      () => prismaOld.rarity.findMany(),
      (batch) =>
        prismaNew.rarity.createMany({
          data: batch,
          skipDuplicates: true,
        })
    );

    await migrateTable(
      "event",
      () => prismaOld.event.findMany(),
      (batch) =>
        prismaNew.event.createMany({
          data: batch,
          skipDuplicates: true,
        })
    );

    console.log("\n🎉 Migração concluída com sucesso!");
  } catch (error) {
    console.error("❌ Erro na migração:", error);
  } finally {
    console.log("\n🔌 Fechando conexões...");

    await prismaOld.$disconnect();
    await prismaNew.$disconnect();
    await poolOld.end();
    await poolNew.end();

    console.log("✅ Conexões encerradas");
  }
}

// executar
migrate();