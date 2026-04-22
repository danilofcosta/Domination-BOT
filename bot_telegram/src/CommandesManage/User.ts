import { CommandGroup, LanguageCodes } from '@grammyjs/commands';
import type { MyContext } from '../utils/customTypes.js';
import { CapturarCharacter } from '../handlers/Comandos/users/dominar.js';
import { botPrefix, options, typeBot } from './botConfigCommands.js';
import { HaremHandler } from '../handlers/Comandos/users/harem.js';
import { favCharacter } from '../handlers/Comandos/users/fav.js';
import { Myinfos } from '../handlers/Comandos/users/myinfos.js';
import { giftHandler } from '../handlers/Comandos/users/gift.js';
import { HaremmodeHandler } from '../handlers/Comandos/users/haremmode.js';
import { Ramdon_Character_Handler } from '../handlers/Comandos/globais/random_character.js';
import { topHandler } from '../handlers/Comandos/users/top.js';
import { StartGreetings } from '../handlers/Comandos/globais/Start.js';
import { animelistCommand } from '../handlers/Comandos/users/animelist.js';
import { debug } from '../utils/log.js';
import type { BotCommandScope, BotCommandScopeAllGroupChats } from 'grammy/types';

const UserCommands = new CommandGroup<MyContext>();

export const ComandosUser = {
  dominar: {
    command: 'dominar',
    description: {
      pt: 'Domina um personagem',
      en: 'Dominate a character',
    },
    handler: CapturarCharacter,
    scope: { type: 'all_group_chats' } as BotCommandScopeAllGroupChats,
  },
  harem: {
    command: 'my' + typeBot + 's',
    description: {
      pt: 'Mostra o seu Harem',
      en: 'Show your Harem',
    },
    handler: HaremHandler,
    scope: 'all_group_chats',
  },
  fav: {
    command: 'fav' + botPrefix,
    description: {
      pt: 'Mostra o seu personagem favorito',
      en: 'Show your favorite character',
    },
    handler: favCharacter,
    scope: 'all_group_chats',
  },
  gift: {
    command: botPrefix + 'gift',
    description: {
      pt: 'Presenteia um personagem para outro usuario',
      en: 'Gift a character to another user',
    },
    handler: giftHandler,
    scope: 'all_group_chats',
  },
  myinfos: {
    command: 'myinfo' + botPrefix,
    description: {
      pt: 'Mostra as suas informacoes',
      en: 'Show your information',
    },
    handler: Myinfos,
    scope: 'all_group_chats',
  },
  random: {
    command: typeBot || 'random',
    description: {
      pt: 'Traz um personagem aleatorio do DB',
      en: 'Brings a random character from the DB',
    },
    handler: Ramdon_Character_Handler,
    scope: 'all_group_chats',
  },
  top: {
    command: botPrefix + 'top',
    description: {
      pt: 'Mostra o top de jogadores',
      en: 'Show the top players',
    },
    handler: topHandler,
    scope: 'all_group_chats',
  },
  haremmode: {
    command: botPrefix + 'haremmode',
    description: {
      pt: 'Altera o modo de visualizacao do seu Harem',
      en: 'Change the display mode of your Harem',
    },
    handler: HaremmodeHandler,
    scope: 'all_group_chats',
  },
  animelist: {
    command: 'animelist',
    description: {
      pt: 'Lista de animes por letra',
      en: 'List animes by letter',
    },
    handler: animelistCommand,
    scope: 'all_group_chats',
  },
} as const;

for (const [key, value] of Object.entries(ComandosUser)) {
  const handlerWrapper = (ctx: MyContext) => {
    debug('Comando', value.command, 'executado por', ctx.from?.username);
    value.handler(ctx);
  };

  UserCommands.command(value.command, value.description.pt)
    .addToScope({ type: 'all_group_chats' }, handlerWrapper)
    .addToScope({ type: 'all_private_chats' }, handlerWrapper);
}

export { UserCommands };