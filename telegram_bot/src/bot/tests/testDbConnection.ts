
import { prisma } from "../../lib/prisma.js";
import { log ,error} from "../../utils/log.js";

export async function testDbConnection() {
  log('INICIANDO teste de conexão com db')
  try {
    await prisma.$connect();

    // query simples pra garantir que tá funcionando
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    log("✅ Conectado ao banco com sucesso!");
    log("📊 Query teste:", result);

    return true;
  } catch (_error) {
    error('teste de conexão com db',{error: _error});
    return false;
  }
}
