import { InlineKeyboard } from 'grammy';
import type { MyContext } from '../../../utils/customTypes.js';
import { ComandosUser } from '../../../CommandesManage/User.js';
import { adminGroupsCommands_dict } from '../../../CommandesManage/admin_groups.js';
import { adminCommands_bot_dict } from '../../../CommandesManage/adminCommands_bot.js';
import { error, debug } from '../../../utils/log.js';
import { getUserRole, roleWeights } from '../../../utils/permissions.js';

export async function helpCallback(ctx: MyContext) {
  if (!ctx.callbackQuery?.data) return;

  const [command, btn, action, ...rest] = ctx.callbackQuery.data.split('_');

  debug('helpCallback', { action, rest, userId: ctx.from?.id });

  const handleEditOrReply = async (
    textToUse: string,
    reply_markup: InlineKeyboard,
  ) => {
    const msg = ctx.callbackQuery?.message;
    const currentText = msg?.text || msg?.caption;

    if (currentText && currentText.trim() === textToUse.trim()) {
      await ctx.answerCallbackQuery().catch(() => {});
      return;
    }

    try {
      if (!msg) {
        await ctx.reply(textToUse, { parse_mode: 'HTML', reply_markup });
      } else if (msg.text !== undefined) {
        await ctx.editMessageText(textToUse, {
          parse_mode: 'HTML',
          reply_markup,
        });
      } else if (msg.caption !== undefined) {
        await ctx.editMessageCaption({
          caption: textToUse,
          parse_mode: 'HTML',
          reply_markup,
        });
      } else {
        await ctx.reply(textToUse, { parse_mode: 'HTML', reply_markup });
      }
    } catch (e: any) {
      if (e.description?.includes('message is not modified')) {
        await ctx.answerCallbackQuery().catch(() => {});
        return;
      }
      error('helpCallback - erro ao editar/enviar ' + action, e);
    }
  };

  const ADMIN_ROLE = 3;

  if (action === 'comandos') {
    if (!rest.length) {
      const userId = ctx.from?.id;
      const userRole = userId ? await getUserRole(userId) : 'USER';
      const isBotAdmin = roleWeights[userRole] >= ADMIN_ROLE;

      const keyboard = new InlineKeyboard()
        .text('Usuario', 'help_btn_comandos_user')
        .text('Admin Grupo', 'help_btn_comandos_admin')
        .row();

      if (isBotAdmin) {
        keyboard.text('Admin Bot', 'help_btn_comandos_botadmin').row();
      }

      keyboard.text('Fechar', 'close');

      await handleEditOrReply(
        'Selecione uma categoria:',
        keyboard,
      );
    } else if (rest[0] === 'user') {
      const comandosText = Object.values(ComandosUser)
        .map((value: any) => '/' + value.command + ' - ' + value.description.pt)
        .join('\n');
      await handleEditOrReply(
        '<b>Comandos de Usuario</b>\n\n' + comandosText,
        new InlineKeyboard()
          .text('Voltar', 'help_btn_comandos')
          .text('Fechar', 'close'),
      );
    } else if (rest[0] === 'admin') {
      const comandosText = Object.values(adminGroupsCommands_dict)
        .map((value: any) => '/' + value.command + ' - ' + value.description.pt)
        .join('\n');
      await handleEditOrReply(
        '<b>Comandos Admin do Grupo</b>\n\n' + comandosText,
        new InlineKeyboard()
          .text('Voltar', 'help_btn_comandos')
          .text('Fechar', 'close'),
      );
    } else if (rest[0] === 'botadmin') {
      const userId = ctx.from?.id;
      const userRole = userId ? await getUserRole(userId) : 'USER';
      const isBotAdmin = roleWeights[userRole] >= ADMIN_ROLE;

      if (!isBotAdmin) {
        await ctx.answerCallbackQuery('Apenas admins do bot podem ver estes comandos.');
        return;
      }

      const comandosText = Object.values(adminCommands_bot_dict)
        .map((value: any) => '/' + value.command + ' - ' + value.description.pt)
        .join('\n');
      await handleEditOrReply(
        '<b>Comandos Admin do Bot</b>\n\n' + comandosText,
        new InlineKeyboard()
          .text('Voltar', 'help_btn_comandos')
          .text('Fechar', 'close'),
      );
    }
    return;
  }

  await ctx.answerCallbackQuery().catch(() => {});
}