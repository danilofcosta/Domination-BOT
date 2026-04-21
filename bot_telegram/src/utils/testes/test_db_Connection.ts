import { prisma } from "../../../lib/prisma.js";

export async function testDBConnection() {
  console.log('teste de conexão com db')
  try {
    await prisma.$connect();

    // query simples pra garantir que tá funcionando
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Conectado ao banco com sucesso!");
    console.log("📊 Query teste:", result);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}
