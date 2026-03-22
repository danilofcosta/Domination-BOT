export function Environment_validation() {
  const requiredEnvs = [
    "BOT_TOKEN_WAIFU",
    "BOT_TOKEN_HUSBANDO",
    "TYPE_BOT",
    "DATABASE_TELEGREM_ID",
    "GROUP_ADM",
    "NODE_ENV",
    "DATABASE_URL",
  ];

  const missing = requiredEnvs.filter((env) => !process.env[env]);

  if (missing.length > 0) {
    console.error("❌ Missing environment variables:");
    missing.forEach((env) => console.error(`- ${env}`));
    throw new Error("Missing environment variables");
  }

  console.log("✅ env success");
}