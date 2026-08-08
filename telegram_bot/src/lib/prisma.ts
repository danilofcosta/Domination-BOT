import "dotenv/config";

//import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString = process.env.DATABASE_URL!;

//const adapter = new PrismaNeon({ connectionString, });
const adapter = new PrismaPg({ connectionString, });

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

