import { createClient } from "redis";
import { redisUrl } from "./redis.js";
import { invalidateDropConfig } from "./dropConfig.js";
import { translationService } from "../locales/translationService.js";

const INVALIDATION_CHANNEL = "bot:cache:invalidate";

export async function startInvalidationSubscriber(): Promise<void> {
  if (!redisUrl) {
    console.log(
      "[invalidate] REDIS_URL ausente — invalidação via pub/sub desativada",
    );
    return;
  }

  try {
    const subscriber = createClient({ url: redisUrl });
    subscriber.on("error", (err) =>
      console.error("[invalidate] erro no subscriber:", err.message),
    );
    await subscriber.connect();

    await subscriber.subscribe(INVALIDATION_CHANNEL, (message) => {
      try {
        const payload = JSON.parse(message) as { type?: string };
        const type = payload.type ?? "all";

        if (type === "dropConfig") {
          invalidateDropConfig();
          console.log("[invalidate] dropConfig invalidado");
          return;
        }

        if (type === "translations") {
          translationService.reload().catch((err) =>
            console.error("[invalidate] erro ao recarregar traduções:", err),
          );
          console.log("[invalidate] traduções recarregando");
          return;
        }

        invalidateDropConfig();
        translationService.reload().catch((err) =>
          console.error("[invalidate] erro ao recarregar traduções:", err),
        );
        console.log("[invalidate] caches invalidados (all)");
      } catch (err) {
        console.error("[invalidate] erro ao processar mensagem:", err);
      }
    });

    console.log(`[invalidate] inscrito no canal ${INVALIDATION_CHANNEL}`);
  } catch (err) {
    console.error(
      "[invalidate] falha ao iniciar subscriber (bot segue sem invalidação por pub/sub):",
      err,
    );
  }
}
