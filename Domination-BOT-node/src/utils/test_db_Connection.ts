
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import { connectionString } from "../../lib/prisma.js";



const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export async function testDBConnection() {
  try {
    await prisma.$connect();

    console.log("✅ Conectado ao banco com sucesso!");

    // query simples pra garantir que tá funcionando
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("📊 Query teste:", result);

  } catch (error) {
    console.error("❌ Erro ao conectar no banco:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}