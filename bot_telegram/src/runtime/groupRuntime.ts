export type RuntimeDropState = {
  cont: number;
  dropId: number | null;
  characterId: number | null;
  data: number | null;
  lock?: {
    userId: number;
    timestamp: number;
  };
};

export const runtimeDrops = new Map<number, RuntimeDropState>();

export function getRuntime(chatId: number): RuntimeDropState {
  let runtime = runtimeDrops.get(chatId);

  if (!runtime) {
    runtime = {
      cont: 0,
      dropId: null,
      characterId: null,
      data: null,
    };

    runtimeDrops.set(chatId, runtime);
  }

  return runtime;
}

setInterval(() => {
  const now = Date.now();

  for (const [chatId, runtime] of runtimeDrops.entries()) {
    if (runtime.cont === 0 && !runtime.dropId && !runtime.characterId) {
      runtimeDrops.delete(chatId);
    }
  }
}, 5 * 60 * 1000);
