import { unstable_cache } from "next/cache";

export function cache<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  keyParts: string[],
  options?: { revalidate?: number; tags?: string[] },
) {
  return unstable_cache(
    async (...args: Args) => fn(...args),
    keyParts,
    { revalidate: options?.revalidate ?? 60, tags: options?.tags },
  );
}
