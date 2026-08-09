import { prisma } from "../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { error, info, warn } from "../../../utils/log.js";
import { translationService } from "../../../locales/translationService.js";
import { CreateButtunConfirmation } from "../../../utils/buildButtons/createButtonConfirmation.js";

const VOTE_YES_ICON_ID = "5318868949402667784";
const VOTE_NO_ICON_ID = "5289772607556568230";
const VOTE_COOLDOWN_MS = 30 * 60 * 1000;

const lastVoteAt = new Map<number, number>();

interface VoteCallbacks {
  likesField: "waifuLikes" | "husbandoLikes";
  dislikesField: "waifuDislikes" | "husbandoDislikes";
  charModel: "characterWaifu" | "characterHusbando";
}

function voteTargets(ctx: MyContext): VoteCallbacks {
  const isWaifu = ctx.botType === ChatType.WAIFU;
  return {
    likesField: isWaifu ? "waifuLikes" : "husbandoLikes",
    dislikesField: isWaifu ? "waifuDislikes" : "husbandoDislikes",
    charModel: isWaifu ? "characterWaifu" : "characterHusbando",
  };
}

function parseCallbackData(data: string) {
  const match = data.match(/^random-character-(yes|no)-(\d+)-(\d+)$/);
  if (!match) return null;
  const [, action, charId] = match;
  return { action: action as "yes" | "no", charId: Number(charId) };
}

let translationsRegistered = false;

async function ensureVoteTranslations() {
  if (translationsRegistered) return;
  translationsRegistered = true;
  try {
    await translationService.setTranslation("vote-like-added", "pt", "Obrigado pelo feedback! 👍");
    await translationService.setTranslation("vote-like-removed", "pt", "👍 Like removido!");
    await translationService.setTranslation("vote-dislike-added", "pt", "👎 Dislike registrado!");
    await translationService.setTranslation("vote-dislike-removed", "pt", "👎 Dislike removido!");
    await translationService.setTranslation("error-vote-invalid-char", "pt", "❌ Personagem não encontrado.");
    await translationService.setTranslation("vote-cooldown", "pt", "⏳ Aguarde 30 minutos para votar novamente.");
  } catch (e) {
    warn("voteCallback - falha ao registrar traduções", e);
  }
}

export async function voteCallbackHandler(ctx: MyContext) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  const parsed = parseCallbackData(data);
  if (!parsed) return;

  const userId = ctx.from?.id;
  if (!userId) return;

  await ensureVoteTranslations();

  const targets = voteTargets(ctx);
  const { action, charId } = parsed;

  const now = Date.now();
  const lastVote = lastVoteAt.get(userId);
  if (lastVote && now - lastVote < VOTE_COOLDOWN_MS) {
    await ctx.answerCallbackQuery(ctx.t("vote-cooldown"));
    return;
  }

  try {
    const char = await (prisma[targets.charModel] as any).findUnique({
      where: { id: charId },
      select: { id: true, likes: true, dislikes: true },
    });

    if (!char) {
      await ctx.answerCallbackQuery(ctx.t("error-vote-invalid-char"));
      return;
    }

    const user = await prisma.telegramUser.upsert({
      where: { telegramId: BigInt(userId) },
      create: { telegramId: BigInt(userId) },
      update: {},
    });

    const likes = new Set<number>(user[targets.likesField] ?? []);
    const dislikes = new Set<number>(user[targets.dislikesField] ?? []);
    const hasLike = likes.has(charId);
    const hasDislike = dislikes.has(charId);

    let likeDelta = 0;
    let dislikeDelta = 0;
    let toastKey: string;

    if (action === "yes") {
      if (hasLike) {
        likes.delete(charId);
        likeDelta = -1;
        toastKey = "vote-like-removed";
      } else {
        likes.add(charId);
        likeDelta = 1;
        if (hasDislike) {
          dislikes.delete(charId);
          dislikeDelta = -1;
        }
        toastKey = "vote-like-added";
      }
    } else {
      if (hasDislike) {
        dislikes.delete(charId);
        dislikeDelta = -1;
        toastKey = "vote-dislike-removed";
      } else {
        dislikes.add(charId);
        dislikeDelta = 1;
        if (hasLike) {
          likes.delete(charId);
          likeDelta = -1;
        }
        toastKey = "vote-dislike-added";
      }
    }

    const [updatedChar] = await prisma.$transaction([
      (prisma[targets.charModel] as any).update({
        where: { id: charId },
        data: {
          likes: { increment: likeDelta },
          dislikes: { increment: dislikeDelta },
        },
      }),
      prisma.telegramUser.update({
        where: { telegramId: BigInt(userId) },
        data: {
          [targets.likesField]: [...likes],
          [targets.dislikesField]: [...dislikes],
        },
      }),
    ]);

    info("voteCallback - voto processado", {
      userId,
      charId,
      action,
      isWaifu: ctx.botType === ChatType.WAIFU,
      likeDelta,
      dislikeDelta,
    });

    lastVoteAt.set(userId, now);

    const reply_markup = CreateButtunConfirmation(
      ctx,
      `random-character-yes-${charId}-3`,
      `random-character-no-${charId}-2`,
      `${updatedChar.likes}👍`,
      `${updatedChar.dislikes}👎`,
      VOTE_NO_ICON_ID,
      VOTE_YES_ICON_ID,
    );

    await ctx.editMessageReplyMarkup({ reply_markup });

    await ctx.answerCallbackQuery(ctx.t(toastKey));
  } catch (e) {
    error("voteCallback - erro ao processar voto", e);
    await ctx.answerCallbackQuery(ctx.t("error-generic"));
  }
}
