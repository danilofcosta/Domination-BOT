import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth";

async function migratePasswords() {
  console.log("Iniciando migração de senhas para bcrypt...");

  const users = await prisma.user.findMany({
    where: {
      webPassword: {
        not: null,
      },
    },
    select: {
      telegramId: true,
      webLogin: true,
      webPassword: true,
    },
  });

  console.log(`Encontrados ${users.length} usuários com senha.`);

  for (const user of users) {
    if (!user.webPassword) continue;

    if (user.webPassword.startsWith("$2")) {
      console.log(`Usuário ${user.webLogin} já tem senha com hash, pulando.`);
      continue;
    }

    const hashedPassword = await hashPassword(user.webPassword);

    await prisma.user.update({
      where: { telegramId: user.telegramId },
      data: { webPassword: hashedPassword },
    });

    console.log(`Migração concluída para usuário: ${user.webLogin}`);
  }

  console.log("Migração concluída!");
  process.exit(0);
}

migratePasswords().catch((err) => {
  console.error("Erro na migração:", err);
  process.exit(1);
});
