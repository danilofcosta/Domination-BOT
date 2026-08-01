import "dotenv/config";

interface TelegramResponse<T> {
  ok: boolean;
  result: T;
  description?: string;
  error_code?: number;
}

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

function log(...args: unknown[]) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

async function telegramRequest<T>(
  token: string,
  method: string,
  params?: Record<string, string>,
): Promise<TelegramResponse<T>> {
  const url = new URL(`https://api.telegram.org/bot${token}/${method}`);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  log("======================================");
  log("Método:", method);
  log("URL:", url.toString().replace(token, "<TOKEN>"));

  const start = Date.now();

  const res = await fetch(url);

  const elapsed = Date.now() - start;

  log("HTTP:", res.status, res.statusText);
  log("Tempo:", `${elapsed}ms`);

  const text = await res.text();

  log("Resposta bruta:");
  console.log(text);

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("A resposta não é um JSON válido.");
  }
}

async function getMe(token: string, label: string) {
  log(`[${label}] Testando token...`);

  const data = await telegramRequest<any>(token, "getMe");

  if (!data.ok) {
    console.error(data);
    return;
  }

  console.log(data.result);
}

async function getWebhookInfo(token: string, label: string) {
  log(`[${label}] Consultando webhook...`);

  const data = await telegramRequest<WebhookInfo>(token, "getWebhookInfo");

  console.dir(data, { depth: null });

  if (!data.ok) return;

  console.table({
    URL: data.result.url || "(vazio)",
    Pending: data.result.pending_update_count,
    LastError: data.result.last_error_message ?? "-",
    LastErrorDate: data.result.last_error_date
      ? new Date(data.result.last_error_date * 1000).toISOString()
      : "-",
    IP: data.result.ip_address ?? "-",
  });
}

async function deleteWebhook(token: string, label: string) {
  log(`[${label}] Removendo webhook...`);

  const data = await telegramRequest(
    token,
    "deleteWebhook",
    {
      drop_pending_updates: "true",
    },
  );

  console.dir(data, { depth: null });
}

async function setWebhook(
  token: string,
  label: string,
  webhookUrl: string,
) {
  log(`[${label}] Configurando webhook`);

  log("Webhook:", webhookUrl);

  const data = await telegramRequest(
    token,
    "setWebhook",
    {
      url: webhookUrl,
      drop_pending_updates: "true",
    },
  );

  console.dir(data, { depth: null });
}

async function main() {
  log("Inicializando...");

  log("BOT_TOKEN_WAIFU:", !!process.env.BOT_TOKEN_WAIFU);
  log("BOT_TOKEN_HUSBANDO:", !!process.env.BOT_TOKEN_HUSBANDO);

  log(
    "Webhook Waifu:",
    process.env.setWebhook_UR_waifu ??
      "https://domination-bot.onrender.com/webhook-waifu",
  );

  log(
    "Webhook Husbando:",
    process.env.setWebhook_UR_husbando ??
      "https://domination-bot.onrender.com/webhook-husbando",
  );

  const waifuToken = process.env.BOT_TOKEN_WAIFU?.trim();

  if (!waifuToken) {
    throw new Error("BOT_TOKEN_WAIFU não encontrado.");
  }

  await getMe(waifuToken, "WAIFU");
  await deleteWebhook(waifuToken, "WAIFU");

  await setWebhook(
    waifuToken,
    "WAIFU",
    process.env.setWebhook_UR_waifu ??
      "https://domination-bot.onrender.com/webhook-waifu",
  );

  await getWebhookInfo(waifuToken, "WAIFU");

  const husbandoToken = process.env.BOT_TOKEN_HUSBANDO?.trim();

  if (husbandoToken) {
    await getMe(husbandoToken, "HUSBANDO");

    await deleteWebhook(husbandoToken, "HUSBANDO");

    await setWebhook(
      husbandoToken,
      "HUSBANDO",
      process.env.setWebhook_UR_husbando ??
        "https://domination-bot.onrender.com/webhook-husbando",
    );

    await getWebhookInfo(husbandoToken, "HUSBANDO");
  }

  log("Finalizado.");
}

main().catch((e) => {
  console.error("ERRO FATAL");
  console.error(e);
  process.exit(1);
});