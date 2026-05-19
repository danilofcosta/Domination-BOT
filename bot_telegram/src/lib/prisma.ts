import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaPg(connectionString, {


});

const prisma = new PrismaClient({
  adapter,

  errorFormat: "pretty",

  log: [
    { emit: "stdout", level: "warn" },
    { emit: "stdout", level: "error" },
  ],

  transactionOptions: {
    maxWait: 5000,
    timeout: 10000,
  },
});

export { prisma };