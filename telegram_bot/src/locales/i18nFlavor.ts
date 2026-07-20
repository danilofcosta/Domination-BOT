import type { Context } from "grammy";
import { translationService } from "./translationService.js";
import { localeNegotiator } from "./localeNegotiator.js";

export interface I18nFlavor {
  t: (key: string, variables?: Record<string, string>) => string;
}

export function i18nMiddleware(ctx: Context & I18nFlavor, next: () => Promise<void>) {
  return localeNegotiator(ctx).then((locale) => {
    ctx.t = (key, variables) => translationService.t(locale, key, variables);
    return next();
  });
}
