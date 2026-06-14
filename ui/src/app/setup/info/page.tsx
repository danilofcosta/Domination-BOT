import { Bot } from "grammy";
import { revalidatePath } from "next/cache";
import { BotDescriptionForm } from "@/components/bot-description-form";

function getBots() {
  const waifuToken = process.env.BOT_TOKEN_WAIFU || "";
  const husbandoToken = process.env.BOT_TOKEN_HUSBANDO || "";
  return {
    waifu: waifuToken ? new Bot(waifuToken) : null,
    husbando: husbandoToken ? new Bot(husbandoToken) : null,
  };
}

async function updateDescription(formData: FormData) {
  "use server";
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const shortDescription = formData.get("shortDescription") as string;

  const token =
    type === "waifu" ? process.env.BOT_TOKEN_WAIFU : process.env.BOT_TOKEN_HUSBANDO;
  if (!token) throw new Error("Token não configurado");

  const bot = new Bot(token);
  await Promise.all([
    bot.api.setMyDescription(description),
    bot.api.setMyShortDescription(shortDescription),
  ]);
  revalidatePath("/setup/bot");
}

export default async function BotInfoPage() {
  const bots = getBots();

  const botInfos = await Promise.all(
    (["waifu", "husbando"] as const).map(async (type) => {
      const bot = bots[type];
      if (!bot) return { type, error: "Token não configurado" };

      try {
        const me = await bot.api.getMe();
        const [description, shortDescription, userPhotos] = await Promise.all([
          bot.api.getMyDescription().catch(() => ({ description: "" })),
          bot.api.getMyShortDescription().catch(() => ({ short_description: "" })),
          bot.api.getUserProfilePhotos(me.id).catch(() => ({ photos: [], total_count: 0 }) as any),
        ]);
        const photo = userPhotos.photos?.[0]?.[0];
        const photoUrl = photo
          ? `https://api.telegram.org/file/bot${process.env[`BOT_TOKEN_${type.toUpperCase()}`] || ""}/${(await bot.api.getFile(photo.file_id)).file_path}`
          : null;
        return {
          type,
          id: me.id,
          username: me.username,
          firstName: me.first_name,
          lastName: me.last_name,
          canJoinGroups: me.can_join_groups,
          canReadAllGroupMessages: me.can_read_all_group_messages,
          supportsInlineQueries: me.supports_inline_queries,
          description: description.description,
          shortDescription: shortDescription.short_description,
          photoUrl,
        };
      } catch (e) {
        return { type, error: String(e) };
      }
    }),
  );

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div>
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
            Configuração
          </p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Informações do Bot</h1>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {botInfos.map((info) => (
          <div
            key={info.type}
            className="rounded-xl border border-border/70 bg-card/60 p-5 shadow-xs backdrop-blur-md"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                info.type === "waifu" ? "bg-pink-500/10 text-pink-400" : "bg-cyan-500/10 text-cyan-400"
              }`}>
                {info.type === "waifu" ? "Waifu" : "Husbando"}
              </span>
              {"error" in info ? (
                <span className="text-red-400 text-sm">Erro</span>
              ) : (
                <span className="text-emerald-400 text-sm">Online</span>
              )}
            </div>

            {"error" in info ? (
              <p className="text-muted-foreground text-sm">{info.error}</p>
            ) : (
              <div className="space-y-3 text-sm">
                {"photoUrl" in info && info.photoUrl && (
                  <div className="flex justify-center mb-4">
                    <img src={info.photoUrl} alt="Bot avatar" className="size-20 rounded-full border border-border/70 object-cover" />
                  </div>
                )}
                <Row label="ID" value={info.id} />
                <Row label="Username" value={`@${info.username}`} />
                <Row label="Nome" value={[info.firstName, info.lastName].filter(Boolean).join(" ")} />
                <Row label="Descrição" value={info.description || "—"} />
                <Row label="Desc. curta" value={info.shortDescription || "—"} />
                <div className="pt-2">
                  <BotDescriptionForm type={info.type} description={info.description || ""} shortDescription={info.shortDescription || ""} updateAction={updateDescription} />
                </div>
                <Row label="Grupos" value={info.canJoinGroups ? "Permitido" : "Negado"} />
                <Row label="Ler mensagens" value={info.canReadAllGroupMessages ? "Sim" : "Não"} />
                <Row label="Inline" value={info.supportsInlineQueries ? "Sim" : "Não"} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between border-b border-border/30 pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
