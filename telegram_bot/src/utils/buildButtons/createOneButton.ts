import { InlineKeyboard } from "grammy";

//controi apenas um btn
export function CreateOneBtn(options: CreateOneBtnOptions): InlineKeyboard {
  const { typeBtn, text, callback, icon, style } = options;
  const btn = new InlineKeyboard();

  switch (typeBtn) {
    case BTN_TYPE.switch_inline_query_current_chat:
      btn.switchInlineCurrent(text, callback);
      break;
    case BTN_TYPE.callback_data:
      btn.text(text, callback);
      break;
    case BTN_TYPE.url:
      btn.url(text, callback);
      break;
    default:
      btn.text(text, callback);
      break;
  }

  if (icon) {
    btn.icon(icon);
  }
  if (style) {
    btn.style(style);
  }
  return btn;
}



export type CreateOneBtnOptions = {
  typeBtn?: BTN_TYPE;
  text: string;
  callback: string;
  icon?: string;
  style?: BTN_STYLE;
};

export enum BTN_TYPE {
  switch_inline_query_current_chat = "switch_inline_query_current_chat",
  callback_data = "callback_data",
  url = "url",
}

export type BTN_STYLE = "primary" | "success" | "danger" | undefined
