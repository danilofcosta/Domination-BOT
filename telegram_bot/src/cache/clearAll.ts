import { clearAllCaches } from "./cache.js";
import { clearAllListeners } from "./listenerStore.js";
import { clearLocaleCache } from "./localeCache.js";
import { clearTopicCache } from "./topicCache.js";
import { clearTradeCache } from "./tradeCache.js";
import { clearAllWorkflowState } from "./workflowState.js";
import { clearGiftCache } from "../handlers/Commands/CommandsUser/gift.js";
import { clearRuntimeDrops } from "../runtime/groupRuntime.js";
import { translationService } from "../locales/translationService.js";

export async function clearAllBotCaches(): Promise<void> {
  clearAllCaches();
  clearAllListeners();
  clearLocaleCache();
  clearTopicCache();
  clearTradeCache();
  clearAllWorkflowState();
  clearGiftCache();
  clearRuntimeDrops();
  await translationService.reload();
}
