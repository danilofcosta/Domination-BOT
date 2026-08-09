import { error, info } from "../../uteis/log.js";

export function Environment_validation() {
  const requiredEnvs = [
    "BOT_TOKEN_WAIFU",
    "BOT_TOKEN_HUSBANDO",
    "TYPE_BOT",
    "DATABASE_TELEGRAM_ID",
    "GROUP_ADM",
    "NODE_ENV",
    "DATABASE_URL",
  ];

  const missing = requiredEnvs.filter((env) => !process.env[env]);

  if (missing.length > 0) {
    error("❌ Missing environment variables:");
    missing.forEach((env) => console.error(`- ${env}`));
    throw new Error("Missing environment variables");
  }

  info("✅ env success");
}
