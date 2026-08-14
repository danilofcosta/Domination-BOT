import "dotenv/config";

//import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL or POSTGRES_PRISMA_URL environment variable is not set."
  );
}
//const adapter = new PrismaNeon({ connectionString, });
const adapter = new PrismaPg({
  connectionString: connectionString.split("?")[0],
  ssl: { rejectUnauthorized: false },
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    errorFormat: "minimal",
    log: [
      //"warn", "error","query",
    "info"
      ],
    transactionOptions: {
      maxWait: 5000,
      timeout: 10000,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

