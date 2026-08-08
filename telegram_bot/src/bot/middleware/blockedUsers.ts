export const blockedUsers = new Map<string, number>();

export function blockKey(
  chatId: number | undefined,
  userId: number,
): string {
  return `${chatId ?? userId}:${userId}`;
}
