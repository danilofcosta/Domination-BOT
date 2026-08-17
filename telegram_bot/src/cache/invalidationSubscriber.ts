import { createClient } from "redis";
import { redisUrl } from "./redis.js";
import { invalidateDropConfig } from "./dropConfig.js";
import { translationService } from "../locales/translationService.js";
import { debug, error } from "../utils/log.js";

const INVALIDATION_CHANNEL = "bot:cache:invalidate";

export async function startInvalidationSubscriber(): Promise<void> {
  if (!redisUrl) {
    debug(
      "[invalidate] REDIS_URL ausente — invalidação via pub/sub desativada",
    );
    return;
  }

  try {
    const subscriber = createClient({ url: redisUrl });
    subscriber.on("error", (err) =>
      debug("[invalidate] erro no subscriber:", err.message),
    );
    await subscriber.connect();

    await subscriber.subscribe(INVALIDATION_CHANNEL, (message) => {
      try {
        const payload = JSON.parse(message) as { type?: string };
        const type = payload.type ?? "all";

        if (type === "dropConfig") {
          invalidateDropConfig();
          debug("[invalidate] dropConfig invalidado");
          return;
        }

        if (type === "translations") {
          translationService.reload().catch((err) =>
            console.error("[invalidate] erro ao recarregar traduções:", err),
          );
          debug("[invalidate] traduções recarregando");
          return;
        }

        invalidateDropConfig();
        translationService.reload().catch((err) =>
          error("[invalidate] erro ao recarregar traduções:", err),
        );
        debug("[invalidate] caches invalidados (all)");
      } catch (err) {
        error ("[invalidate] erro ao processar mensagem:", err);
      }
    });

    debug(`[invalidate] inscrito no canal ${INVALIDATION_CHANNEL}`);
  } catch (err) {
    error(
      "[invalidate] falha ao iniciar subscriber (bot segue sem invalidação por pub/sub):",
      err,
    );
  }
}
