import { InlineKeyboard } from 'grammy';
import type { MyContext } from '../../../utils/customTypes.js';
import { ComandosUser } from '../../../CommandesManage/User.js';
import { adminGroupsCommands_dict } from '../../../CommandesManage/admin_groups.js';
import { adminCommands_bot_dict } from '../../../CommandesManage/adminCommands_bot.js';
import { debug } from '../../../utils/log.js';
import { getUserRole, roleWeights } from '../../../utils/permissions.js';
import { typeBot } from '../../../CommandesManage/botConfigCommands.js';
import { helpCommand } from '../../Comandos/globais/help.js';
import { EditOrSendText } from '../../../utils/EditOrSendText.js';

const ADMIN_ROLE = 3;

export async function helpCallback(ctx: MyContext) {
  if (!ctx.callbackQuery?.data) return;

  const [command, action, ...rest] = ctx.callbackQuery.data.split('_');

  debug('helpCallback', { action, rest, data: ctx.callbackQuery.data, userId: ctx.from?.id });

  if (action === "helpmain") {
    await helpCommand(ctx);
    await ctx.answerCallbackQuery().catch(() => {});
    return;
  }

  if (action === 'comment' && rest[0] === 'harem') {
    const keyboard = new InlineKeyboard()
      .text(ctx.t('help-btn-back'), 'help_helpmain')
      .text(ctx.t('btn-close'), 'close');

    const caption = ctx.t('help-text-comment-harem', {
      commandharem: ComandosUser.harem.command,
      commandharem2: typeBot === 'waifu' ? 'harem' : 'haremh',
      commandFav: ComandosUser.fav.command,
      command_modeharem: ComandosUser.haremmode.command,
    });

    await EditOrSendText({ ctx, caption, reply_markup: keyboard });
    await ctx.answerCallbackQuery().catch(() => {});
    return;
  }

  if (action === 'comandos') {
    if (!rest.length) {
      const userId = ctx.from?.id;
      const userRole = userId ? await getUserRole(userId) : 'USER';
      const isBotAdmin = roleWeights[userRole] >= ADMIN_ROLE;

      const keyboard = new InlineKeyboard()
        .text(ctx.t('help-label-commmads-user'), 'help_comandos_user')
        .text(ctx.t('help-label-commmads-admin-gruop'), 'help_comandos_admin')
        .row();

      if (isBotAdmin) {
        keyboard.text(ctx.t('help-label-commmads-admin-bt'), 'help_comandos_botadmin').row();
      }

      keyboard.text(ctx.t('help-btn-back'), 'help_helpmain');

      await EditOrSendText({
        ctx,
        caption: ctx.t('help-select-category'),
        reply_markup: keyboard,
      });
    } else if (rest[0] === 'user') {
      const comandosText = Object.values(ComandosUser)
        .map((value: any) => '/' + value.command + ' - ' + value.description.pt)
        .join('\n');
      const keyboard = new InlineKeyboard()
        .text(ctx.t('help-btn-back'), 'help_comandos')
        .text(ctx.t('btn-close'), 'close');
      await EditOrSendText({
        ctx,
        caption: ctx.t('help-title-commands-user') + comandosText,
        reply_markup: keyboard,
      });
    } else if (rest[0] === 'admin') {
      const comandosText = Object.values(adminGroupsCommands_dict)
        .map((value: any) => '/' + value.command + ' - ' + value.description.pt)
        .join('\n');
      const keyboard = new InlineKeyboard()
        .text(ctx.t('help-btn-back'), 'help_comandos')
        .text(ctx.t('btn-close'), 'close');
      await EditOrSendText({
        ctx,
        caption: ctx.t('help-title-commands-admin') + comandosText,
        reply_markup: keyboard,
      });
    } else if (rest[0] === 'botadmin') {
      const userId = ctx.from?.id;
      const userRole = userId ? await getUserRole(userId) : 'USER';
      const isBotAdmin = roleWeights[userRole] >= ADMIN_ROLE;

      if (!isBotAdmin) {
        await ctx.answerCallbackQuery(ctx.t('help-error-botadmin'));
        return;
      }

      const comandosText = Object.values(adminCommands_bot_dict)
        .map((value: any) => '/' + value.command + ' - ' + value.description.pt)
        .join('\n');
      const keyboard = new InlineKeyboard()
        .text(ctx.t('help-btn-back'), 'help_comandos')
        .text(ctx.t('btn-close'), 'close');
      await EditOrSendText({
        ctx,
        caption: ctx.t('help-title-commands-botadmin') + comandosText,
        reply_markup: keyboard,
      });
    }
  }

  await ctx.answerCallbackQuery().catch(() => {});
}