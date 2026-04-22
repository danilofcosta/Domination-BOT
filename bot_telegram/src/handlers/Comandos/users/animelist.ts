import { prisma } from '../../../../lib/prisma';
import { ChatType, type MyContext } from '../../../utils/customTypes.js';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const animeCache = new Map<string, { letter: string; animes: string[]; genero: ChatType; userId: number }>();

function setCache(key: string, data: { letter: string; animes: string[]; genero: ChatType; userId: number }) {
  animeCache.delete(key);
  animeCache.set(key, data);
  setTimeout(() => animeCache.delete(key), 300000);
}

function getCache(key: string) {
  return animeCache.get(key);
}

async function getAnimeList(letter: string, genero: ChatType): Promise<string[]> {
  const characters = genero === ChatType.HUSBANDO
    ? await prisma.characterHusbando.findMany({
        select: { origem: true },
        distinct: ['origem'],
        where: { origem: { startsWith: letter } },
        orderBy: { origem: 'asc' },
      })
    : await prisma.characterWaifu.findMany({
        select: { origem: true },
        distinct: ['origem'],
        where: { origem: { startsWith: letter } },
        orderBy: { origem: 'asc' },
      });

  return characters.map(c => c.origem);
}

function buildLetterKeyboard(cacheKey: string) {
  const keyboard: any[] = [];
  let row: any[] = [];

  for (let i = 0; i < LETTERS.length; i++) {
    const letter = LETTERS[i];
    row.push({ text: letter, callback_data: 'al_' + letter + '_' + cacheKey });

    if (row.length === 4 || i === LETTERS.length - 1) {
      keyboard.push([...row]);
      row = [];
    }
  }

  return keyboard;
}

async function safeEditMessage(ctx: MyContext, text: string, keyboard: any[]) {
  try {
    await ctx.editMessageText(text, { reply_markup: { inline_keyboard: keyboard } });
  } catch (e: any) {
    const errCode = e?.parameters?.error_code || e?.errorCode;
    if (errCode !== 400) {
      console.error('Edit message error:', e?.message);
    }
  }
}

async function showLetterKeyboard(ctx: MyContext, cacheKey: string) {
  const text = 'Selecione uma letra do alfabeto:\n\n';
  const keyboard = buildLetterKeyboard(cacheKey);
  await safeEditMessage(ctx, text, keyboard);
}

async function showAnimeList(ctx: MyContext, letter: string, cacheKey: string, page: number = 1) {
  const userId = ctx.from?.id ?? 0;
  const envType = process.env.TYPE_BOT || 'waifu';
  const genero = (ctx.session.settings?.genero || envType) as ChatType;

  const animes = await getAnimeList(letter, genero);

  if (animes.length === 0) {
    await ctx.answerCallbackQuery('Nenhum anime encontrado com a letra ' + letter);
    await showLetterKeyboard(ctx, cacheKey);
    return;
  }

  setCache(cacheKey, { letter, animes, genero, userId });

  const pageSize = 8;
  const totalPages = Math.ceil(animes.length / pageSize);
  const clampedPage = Math.max(1, Math.min(page, totalPages));
  const start = (clampedPage - 1) * pageSize;
  const pageAnimes = animes.slice(start, start + pageSize);

  let text = 'Anime com ' + letter + ' (' + animes.length + ')\n\n';
  text += 'Pagina ' + clampedPage + '/' + totalPages + '\n\n';
  text += 'Clique em um anime para ver seus personagens';

  const keyboard: any[] = [];
  let row: any[] = [];

  for (const anime of pageAnimes) {
    row.push({
      text: anime.substring(0, 20),
      switch_inline_query_current_chat: 'anime_' + anime
    });
    if (row.length === 2) {
      keyboard.push([...row]);
      row = [];
    }
  }

  if (row.length > 0) keyboard.push([...row]);

  const navRow: any[] = [];
  if (clampedPage > 1) navRow.push({ text: '◀️', callback_data: 'alp_' + (clampedPage - 1) + '_' + cacheKey });
  navRow.push({ text: letter, callback_data: 'al_letter_' + cacheKey });
  if (clampedPage < totalPages) navRow.push({ text: '▶️', callback_data: 'alp_' + (clampedPage + 1) + '_' + cacheKey });
  keyboard.push([...navRow]);

  keyboard.push([{ text: '🔙 Menu', callback_data: 'al_back_' + cacheKey }]);

  await ctx.answerCallbackQuery();
  await safeEditMessage(ctx, text, keyboard);
}

export async function animelistCommand(ctx: MyContext) {
  const userId = ctx.from?.id ?? 0;
  const envType = process.env.TYPE_BOT || 'waifu';
  const genero = (ctx.session.settings?.genero || envType) as ChatType;
  const cacheKey = String(userId) + '_al';

  setCache(cacheKey, { letter: '', animes: [], genero, userId });

  const text = 'Selecione uma letra do alfabeto:\n\n';
  const keyboard = buildLetterKeyboard(cacheKey);

  await ctx.reply(text, { reply_markup: { inline_keyboard: keyboard } });
}

export async function animelistCallback(ctx: MyContext) {
  const data = ctx.callbackQuery?.data;
  if (!data || !data.startsWith('al_')) return;

  const parts = data.split('_');
  const action = parts[1] || '';
  const userId = ctx.from?.id ?? 0;
  const cacheKey = String(userId) + '_al';

  if (action === 'back' || action === 'letter') {
    await showLetterKeyboard(ctx, cacheKey);
    return;
  }

  if (action === 'p') {
    const page = Number(parts[2] || '1');
    const key = parts[3] || cacheKey;
    const cache = getCache(key);
    const letter = cache?.letter || parts[4] || 'A';
    await showAnimeList(ctx, letter, key, page);
    return;
  }

  await showAnimeList(ctx, action, cacheKey);
}