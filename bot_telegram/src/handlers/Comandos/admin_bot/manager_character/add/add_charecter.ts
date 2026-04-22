import { MediaType } from '../../../../../../generated/prisma/client.js';
import { prisma } from '../../../../../../lib/prisma.js';
import { setCharacter } from '../../../../../cache/cache.js';
import { type MyContext } from '../../../../../utils/customTypes.js';
import { LinkMsg } from '../../../../../utils/manege_caption/link_msg.js';
import type { ChatType } from '../../../../../utils/customTypes.js';

export interface PreCharacter {
  idchat?: number;
  nome: string;
  anime: string;
  rarities?: number[] | undefined;
  events?: number[] | undefined;
  genero: ChatType;
  mediatype: MediaType;
  media: string;
  username: string;
  user_id: number;
  extras?: Record<string, any>;
}

export async function AddCharacterHandler(ctx: MyContext) {
  console.log('add per');
  let text_command: string | undefined;
  let reply = ctx.message?.reply_to_message;

  if (ctx.message?.caption && (ctx.message?.photo || ctx.message?.video)) {
    reply = ctx?.message as any ?? undefined;
  }

  if (!reply) {
    ctx.reply(ctx.t('add_character_not_reply'));
    return;
  }

  const media = getMedia(reply);
  if (!media) {
    ctx.reply('Only photo or video is supported.');
    return;
  }

  text_command = ctx.match?.length === 0 ? reply.caption : (ctx.match as string);

  if (!text_command) {
    text_command = '';
  }

  const isNoconf = text_command.toLowerCase().includes('noconf');
  const cleanCommand = text_command.replace(/noconf/gi, '').trim();

  if (!cleanCommand.includes(',')) {
    ctx.reply('Use: nome, anime, extras');
    return;
  }

  const [nome, anime, ...rest] = cleanCommand.split(',');

  if (!nome || !anime) {
    ctx.reply(ctx.t('add_character_not_info'));
    return;
  }

  const { rarities, events } = parseTokens(rest);

  const charData: PreCharacter = {
    idchat: ctx.message!.message_id,
    nome: nome.trim(),
    anime: anime.trim(),
    rarities,
    events,
    genero: ctx.session.settings.genero,
    mediatype: media.type,
    media: media.file_id,
    username: ctx.from?.first_name || '',
    user_id: ctx.from?.id || 0,
    extras: ctx.from as Record<string, any>,
  };

  if (isNoconf) {
    await addCharacterDirect(ctx, charData);
    return;
  }

  await confirmCharacter(ctx, charData);
}

function getMedia(reply: any): { file_id: string; type: MediaType } | undefined {
  if (reply.photo?.length) {
    return {
      file_id: reply.photo.at(-1).file_id,
      type: MediaType.IMAGE_FILEID,
    };
  }

  if (reply.video) {
    return {
      file_id: reply.video.file_id,
      type: MediaType.VIDEO_FILEID,
    };
  }

  return undefined;
}

function parseTokens(rest: string[]) {
  const tokens = rest.join(' ').toLowerCase().split(/\s+/);

  const rarities: number[] = [];
  const events: number[] = [];

  for (const token of tokens) {
    if (!token) continue;

    if (token.startsWith('r')) {
      const id = parseInt(token.slice(1), 10);
      if (!isNaN(id)) rarities.push(id);
    }

    if (token.startsWith('e')) {
      const id = parseInt(token.slice(1), 10);
      if (!isNaN(id)) events.push(id);
    }
  }

  return {
    rarities: rarities.length ? rarities : undefined,
    events: events.length ? events : undefined,
  };
}

async function getRandomRarity(genero: ChatType): Promise<number | undefined> {
  const rarities = genero === 'husbando'
    ? await prisma.husbandoRarity.findMany({ select: { rarityId: true } })
    : await prisma.waifuRarity.findMany({ select: { rarityId: true } });

  if (!rarities || rarities.length === 0) return undefined;

  const randomIndex = Math.floor(Math.random() * rarities.length);
  return rarities[randomIndex]?.rarityId;
}

async function addCharacterDirect(ctx: MyContext, data: PreCharacter) {
  let rarities = data.rarities;

  if (!rarities || rarities.length === 0) {
    const randomRarity = await getRandomRarity(data.genero);
    if (randomRarity) {
      rarities = [randomRarity];
      console.log('addCharacterDirect - raridade aleatoria:', randomRarity);
    }
  }

  const slug = generateSlug(data.nome, data.anime);
  const extras = data.extras as any;

  try {
    if (data.genero === 'husbando') {
      const char = await prisma.characterHusbando.create({
        data: {
          name: data.nome,
          origem: data.anime,
          mediaType: data.mediatype,
          media: data.media,
          slug,
          addby: extras,
        },
      });

      if (rarities && rarities.length > 0) {
        for (const rarityId of rarities) {
          await prisma.husbandoRarity.create({
            data: { characterId: char.id, rarityId },
          });
        }
      }

      if (data.events && data.events.length > 0) {
        for (const eventId of data.events) {
          await prisma.husbandoEvent.create({
            data: { characterId: char.id, eventId },
          });
        }
      }

      await ctx.reply('Personagem adicionado!\n\nID: ' + char.id + '\nNome: ' + data.nome + '\nAnime: ' + data.anime);
    } else {
      const char = await prisma.characterWaifu.create({
        data: {
          name: data.nome,
          origem: data.anime,
          mediaType: data.mediatype,
          media: data.media,
          slug,
          addby: extras,
        },
      });

      if (rarities && rarities.length > 0) {
        for (const rarityId of rarities) {
          await prisma.waifuRarity.create({
            data: { characterId: char.id, rarityId },
          });
        }
      }

      if (data.events && data.events.length > 0) {
        for (const eventId of data.events) {
          await prisma.waifuEvent.create({
            data: { characterId: char.id, eventId },
          });
        }
      }

      await ctx.reply('Personagem adicionado!\n\nID: ' + char.id + '\nNome: ' + data.nome + '\nAnime: ' + data.anime);
    }
  } catch (e: any) {
    console.error('addCharacterDirect error:', e);
    await ctx.reply('Erro ao adicionar personagem: ' + (e?.message || 'erro desconhecido'));
  }
}

function generateSlug(nome: string, anime: string): string {
  const base = (nome + '-' + anime)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base + '-' + Date.now();
}

async function confirmCharacter(ctx: MyContext, data: PreCharacter) {
  const { idchat, nome, anime, rarities, events, genero, mediatype, media } = data;

  const text = 'Nome: ' + nome + '\nAnime: ' + anime + '\nGenero: ' + genero + '\nMediatype: ' + mediatype + '\nData: ' + media + '\nLink: ' + LinkMsg(Number(ctx.chat?.id), Number(idchat)) + '\nRarities: ' + (rarities ?? 'valor padrao') + '\nEvents: ' + (events ?? 'sem evento');

  const id = Date.now();

  setCharacter(id, data);

  await ctx.reply(text, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: ctx.t('add_character_btn_confirm'),
            callback_data: 'addcharacter_confirm_' + id,
          },
          {
            text: ctx.t('add_character_btn_cancel'),
            callback_data: 'addcharacter_cancel_' + id,
          },
          {
            text: ctx.t('add_character_btn_edit'),
            callback_data: 'addcharacter_edit_' + id,
          },
        ],
      ],
    },
  });
}