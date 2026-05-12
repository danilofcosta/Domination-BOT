import "dotenv/config";

interface WebhookInfo {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  ip_address?: string;
  last_error_date?: number;
  last_error_message?: string;
  last_synchronization_error_date?: number;
  max_connections?: number;
  allowed_updates?: string[];
}

async function getWebhookInfo(token: string, label: string) {
  const url = `https://api.telegram.org/bot${token}/getWebhookInfo`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.ok) {
      console.error(`[${label}] Erro:`, data.description);
      return;
    }
    const info = data.result as WebhookInfo;
    console.log(`\n=== ${label} ===`);
    console.log(`URL:                ${info.url || "(não configurado)"}`);
    console.log(`Certificado próprio: ${info.has_custom_certificate}`);
    console.log(`Updates pendentes:   ${info.pending_update_count}`);
    if (info.ip_address) console.log(`IP:                 ${info.ip_address}`);
    if (info.max_connections) console.log(`Max conexões:       ${info.max_connections}`);
    if (info.allowed_updates) console.log(`Allowed updates:    ${info.allowed_updates.join(", ")}`);
    if (info.last_error_date) {
      const date = new Date(info.last_error_date * 1000).toLocaleString("pt-BR");
      console.log(`Último erro em:     ${date}`);
      console.log(`Mensagem:           ${info.last_error_message}`);
    }
    if (info.last_synchronization_error_date) {
      const date = new Date(info.last_synchronization_error_date * 1000).toLocaleString("pt-BR");
      console.log(`Último erro sinc.:  ${date}`);
    }
  } catch (err) {
    console.error(`[${label}] Falha na requisição:`, err);
  }
}

async function deleteWebhook(token: string, label: string) {
  const url = `https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=true`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(`[${label}] deleteWebhook: ${data.ok ? "OK" : "Falha - " + data.description}`);
}

async function setWebhook(token: string, label: string, webhookUrl: string) {
  const url = `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}&drop_pending_updates=true`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(`[${label}] setWebhook ${webhookUrl}: ${data.ok ? "OK" : "Falha - " + data.description}`);
}

async function main() {
  const waifuToken = process.env.BOT_TOKEN_WAIFU?.trim();

  if (!waifuToken) {
    console.error("BOT_TOKEN_WAIFU não encontrado no .env");
    process.exit(1);
  }

  // WAIFU
  await deleteWebhook(waifuToken, "WAIFU");
  await setWebhook(waifuToken, "WAIFU", process.env.setWebhook_UR_waifu || "https://domination-bot.onrender.com/webhook-waifu");

  // HUSBANDO
  const husbandoToken = process.env.BOT_TOKEN_HUSBANDO?.trim();
  if (husbandoToken) {
    await deleteWebhook(husbandoToken, "HUSBANDO");
    await setWebhook(husbandoToken, "HUSBANDO", process.env.setWebhook_UR_husbando || "https://domination-bot.onrender.com/webhook-husbando");
  }

  // Mostra resultado final
  await getWebhookInfo(waifuToken, "WAIFU");
  if (husbandoToken) {
    await getWebhookInfo(husbandoToken, "HUSBANDO");
  }
}

main();
