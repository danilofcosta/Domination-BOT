// um link para uma mensagem específica no Telegram, considerando se o chat é um grupo privado ou público.

export function linkMsg(chatId: number, msgId: number) {
  const id = String(chatId);
  if (id.startsWith("-100")) {
    return `https://t.me/c/${id.replace("-100", "")}/${msgId}`;
  }
  return `https://t.me/c/${id}/${msgId}`;
}
