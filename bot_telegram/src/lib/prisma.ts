import "dotenv/config";

//import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
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
    log: ["warn", "error",
   //  "info","query"
      ],
    transactionOptions: {
      maxWait: 5000,
      timeout: 10000,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "../../generated/prisma/client.js";