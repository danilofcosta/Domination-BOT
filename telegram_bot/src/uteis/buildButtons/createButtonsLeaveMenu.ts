import { InlineKeyboard } from "grammy";

interface CreateButtonsLeaveMenuOptions {
  membrers_clean_colletion: boolean;
  membrers_ban: boolean;
  send_message_to_group: boolean;
}

export function createButtonsLeaveMenu(
  options: CreateButtonsLeaveMenuOptions
) {
  const reply_markup = new InlineKeyboard();

  // Limpar membros da coleção
  reply_markup
    .text("Limpar membros da coleção", "bot_leave_membrers.clean.colletion")
    .text(
      options.membrers_clean_colletion ? "✔️" : "✖️",
      "bot_leave_membrers.clean.colletion_check"
    )
    .style(options.membrers_clean_colletion ? "success" : "danger")
    .row();

  // Banir membros
  reply_markup
    .text("Banir membros", "bot_leave_membrers.ban")
    .text(
      options.membrers_ban ? "✔️" : "✖️",
      "bot_leave_membrers.ban_check"
    )
    .style(options.membrers_ban ? "success" : "danger")
    .row();

  // Enviar mensagem ao grupo
  reply_markup
    .text("Enviar mensagem ao grupo", "bot_leave_send.message.to.group")
    .text(
      options.send_message_to_group ? "✔️" : "✖️",
      "bot_leave_send.message.to.group_check"
    )
    .style(options.send_message_to_group ? "success" : "danger")
    .row();

  // Personalizar mensagem
  reply_markup
    .text(
      "Personalizar mensagem",
      "bot_leave_personalize.message_to_group"
    )
    .row();
  reply_markup
    .text(
      "executar ",
      "bot_leave_executar.message_to_group"
    )
    .row();
  // Cancelar
  reply_markup.text("Cancelar", "bot_leave_cancel");

  return reply_markup;
}