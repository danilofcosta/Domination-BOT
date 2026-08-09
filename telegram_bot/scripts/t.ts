import "dotenv/config";

async function main() {
  console.log("Script t.ts - use para testes temporarios");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
