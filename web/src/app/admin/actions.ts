"use server";

import { prisma } from "@/lib/prisma";
import { SourceType } from "../../../generated/prisma/client";
import { slugify } from "@/lib/telegram/create_slug";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import {
  notifyDatabaseChannelWithPhoto,
  notifyDatabaseChannel,
  notifyDatabaseChannelWithVideo,
  sendLocalPhotoToTelegram,
  sendLocalVideoToTelegram,
} from "@/lib/telegram/telegram";
import { createCaption } from "@/lib/telegram/create_caption";
import { DELETE_ROLES } from "@/lib/auth/constants";

function canDelete(currentUserProfileType?: string): boolean {
  if (!currentUserProfileType) return false;
  return DELETE_ROLES.includes(
    currentUserProfileType as (typeof DELETE_ROLES)[number],
  );
}
import { getSession } from "@/lib/auth/auth";

import { LRUCache } from "lru-cache";

// Cache em memória para evitar chamadas repetitivas ao Telegram
const mediaCache = new LRUCache<string, string>({
  max: 1000,
  ttl: 1000 * 60 * 60, // 1 hora
});

// --- Dashboard & Stats ---

export async function getDashboardData() {
  try {
    const [
      totalUsers,
      totalWaifus,
      totalHusbandos,
      totalCollectionsWaifu,
      totalCollectionsHusbando,
      profileDistribution,
      totalLikes,
      totalDislikes,
      mediaTypeDistribution,
      sourceTypeDistribution,
      topEvents,
      topRarities,
      recentWaifus,
      recentHusbandos,
      totalEvents,
      totalRarities,
      totalGroups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.characterWaifu.count(),
      prisma.characterHusbando.count(),
      prisma.waifuCollection.count(),
      prisma.husbandoCollection.count(),
      prisma.user.groupBy({
        by: ["profileType"],
        _count: { profileType: true },
      }),
      prisma.$queryRaw`SELECT COALESCE(SUM(likes), 0) as total FROM "CharacterWaifu" UNION ALL SELECT COALESCE(SUM(likes), 0) FROM "CharacterHusbando"`.then(
        (r) =>
          (r as any[]).reduce(
            (acc: number, row: any) => acc + Number(row.total),
            0,
          ),
      ),
      prisma.$queryRaw`SELECT COALESCE(SUM(dislikes), 0) as total FROM "CharacterWaifu" UNION ALL SELECT COALESCE(SUM(dislikes), 0) FROM "CharacterHusbando"`.then(
        (r) =>
          (r as any[]).reduce(
            (acc: number, row: any) => acc + Number(row.total),
            0,
          ),
      ),
      prisma.$queryRaw`
        SELECT "mediaType", COUNT(*) as count FROM "CharacterWaifu" GROUP BY "mediaType"
        UNION ALL
        SELECT "mediaType", COUNT(*) FROM "CharacterHusbando" GROUP BY "mediaType"
      `.then((r) => {
        const map = new Map<string, number>();
        (r as any[]).forEach((row: any) => {
          const key = row.mediaType || "UNKNOWN";
          map.set(key, (map.get(key) || 0) + Number(row.count));
        });
        return Array.from(map.entries()).map(([name, value]) => ({
          name,
          value,
        }));
      }),
      prisma.$queryRaw`
        SELECT "sourceType", COUNT(*) as count FROM "CharacterWaifu" GROUP BY "sourceType"
        UNION ALL
        SELECT "sourceType", COUNT(*) FROM "CharacterHusbando" GROUP BY "sourceType"
      `.then((r) => {
        const map = new Map<string, number>();
        (r as any[]).forEach((row: any) => {
          const key = row.sourceType || "UNKNOWN";
          map.set(key, (map.get(key) || 0) + Number(row.count));
        });
        return Array.from(map.entries()).map(([name, value]) => ({
          name,
          value,
        }));
      }),
      prisma.$queryRaw`
        SELECT e.name, e.emoji, COUNT(*) as count 
        FROM "WaifuEvent" we
        JOIN "Event" e ON we."eventId" = e.id
        GROUP BY e.name, e.emoji
        UNION ALL
        SELECT e.name, e.emoji, COUNT(*) as count
        FROM "HusbandoEvent" he
        JOIN "Event" e ON he."eventId" = e.id
        GROUP BY e.name, e.emoji
        ORDER BY count DESC
        LIMIT 5
      `.then((r) => {
        const map = new Map<
          string,
          { name: string; emoji: string; count: number }
        >();
        (r as any[]).forEach((row: any) => {
          const existing = map.get(row.name);
          if (existing) {
            existing.count += Number(row.count);
          } else {
            map.set(row.name, {
              name: row.name,
              emoji: row.emoji,
              count: Number(row.count),
            });
          }
        });
        return Array.from(map.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      }),
      prisma.$queryRaw`
        SELECT r.name, r.emoji, COUNT(*) as count 
        FROM "WaifuRarity" wr
        JOIN "Rarity" r ON wr."rarityId" = r.id
        GROUP BY r.name, r.emoji
        UNION ALL
        SELECT r.name, r.emoji, COUNT(*) as count
        FROM "HusbandoRarity" hr
        JOIN "Rarity" r ON hr."rarityId" = r.id
        GROUP BY r.name, r.emoji
        ORDER BY count DESC
        LIMIT 5
      `.then((r) => {
        const map = new Map<
          string,
          { name: string; emoji: string; count: number }
        >();
        (r as any[]).forEach((row: any) => {
          const existing = map.get(row.name);
          if (existing) {
            existing.count += Number(row.count);
          } else {
            map.set(row.name, {
              name: row.name,
              emoji: row.emoji,
              count: Number(row.count),
            });
          }
        });
        return Array.from(map.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      }),
      prisma.characterWaifu.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          name: true,
          origem: true,
          popularity: true,
          createdAt: true,
        },
      }),
      prisma.characterHusbando.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          name: true,
          origem: true,
          popularity: true,
          createdAt: true,
        },
      }),
      prisma.event.count(),
      prisma.rarity.count(),
      prisma.telegramGroup.count(),
    ]);

    return {
      stats: {
        totalUsers,
        totalCharacters: totalWaifus + totalHusbandos,
        totalCollections:
          Number(totalCollectionsWaifu) + Number(totalCollectionsHusbando),
        totalWaifus,
        totalHusbandos,
        totalLikes,
        totalDislikes,
        totalEvents,
        totalRarities,
        totalGroups,
      },
      profileDistribution: profileDistribution.map((d) => ({
        name: d.profileType,
        value: d._count.profileType,
      })),
      mediaTypeDistribution,
      sourceTypeDistribution,
      topEvents,
      topRarities,
      recentCharacters: {
        waifus: recentWaifus,
        husbandos: recentHusbandos,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return {
      stats: {
        totalUsers: 0,
        totalCharacters: 0,
        totalCollections: 0,
        totalWaifus: 0,
        totalHusbandos: 0,
        totalLikes: 0,
        totalDislikes: 0,
        totalEvents: 0,
        totalRarities: 0,
        totalGroups: 0,
      },
      profileDistribution: [],
      mediaTypeDistribution: [],
      sourceTypeDistribution: [],
      topEvents: [],
      topRarities: [],
      recentCharacters: { waifus: [], husbandos: [] },
    };
  }
}

// --- Users ---

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "desc" },
      include: {
        _count: {
          select: {
            WaifuCollection: true,
            HusbandoCollection: true,
          },
        },
        CharacterWaifu: {
          include: {
            WaifuEvent: { include: { Event: true } },
            WaifuRarity: { include: { Rarity: true } },
          },
        },
        CharacterHusbando: {
          include: {
            HusbandoEvent: { include: { Event: true } },
            HusbandoRarity: { include: { Rarity: true } },
          },
        },
      },
    });

    // Tratamento de BigInt para JSON
    return users.map((u) => ({
      ...u,
      telegramId: u.telegramId.toString(),
    }));
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
}

export async function deleteUser(
  telegramId: string,
  currentUserProfileType?: string,
  targetUserProfileType?: string,
) {
  if (currentUserProfileType !== "SUPREME") {
    return { success: false, error: "Apenas o SUPREME pode excluir usuários" };
  }

  if (targetUserProfileType === "SUPREME") {
    return {
      success: false,
      error: "Não é possível excluir um usuário com perfil SUPREME",
    };
  }

  try {
    await prisma.user.delete({ where: { telegramId: BigInt(telegramId) } });
    revalidatePath("/admin");
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateUserProfileType(
  telegramId: bigint,
  newProfileType: string,
  currentUserProfileType?: string,
) {
  if (currentUserProfileType !== "SUPREME") {
    return {
      success: false,
      error: "Apenas o SUPREME pode alterar perfis de usuários",
    };
  }

  const validTypes = ["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"];
  if (!validTypes.includes(newProfileType)) {
    return { success: false, error: "Tipo de perfil inválido" };
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (targetUser?.profileType === "SUPREME") {
      return {
        success: false,
        error: "Não é possível alterar o perfil de um usuário SUPREME",
      };
    }

    await prisma.user.update({
      where: { telegramId },
      data: { profileType: newProfileType as any },
    });
    revalidatePath("/admin");
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { success: false, error: String(error) };
  }
}

// --- Events ---

export async function getEvents() {
  try {
    return await prisma.event.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    return [];
  }
}

export async function createEvent(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const emoji = formData.get("emoji") as string;
    const description = formData.get("description") as string;
    const emoji_id = formData.get("emoji_id") as string;

    await prisma.event.create({
      data: { name, code, emoji, description, emoji_id: emoji_id || null },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteEvent(id: number, currentUserProfileType?: string) {
  if (!canDelete(currentUserProfileType)) {
    return {
      success: false,
      error: "Apenas ADMIN, SUPER_ADMIN ou SUPREME podem excluir eventos",
    };
  }
  try {
    await prisma.event.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir evento:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateEvent(id: number, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const emoji = formData.get("emoji") as string;
    const description = formData.get("description") as string;
    const emoji_id = formData.get("emoji_id") as string;

    await prisma.event.update({
      where: { id },
      data: { name, code, emoji, description, emoji_id: emoji_id || null },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    return { success: false, error: String(error) };
  }
}

// --- Rarities ---

export async function getRarities() {
  try {
    return await prisma.rarity.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Erro ao buscar raridades:", error);
    return [];
  }
}

export async function createRarity(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const emoji = formData.get("emoji") as string;
    const description = formData.get("description") as string;
    const emoji_id = formData.get("emoji_id") as string;

    await prisma.rarity.create({
      data: { name, code, emoji, description, emoji_id: emoji_id || null },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar raridade:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteRarity(
  id: number,
  currentUserProfileType?: string,
) {
  if (!canDelete(currentUserProfileType)) {
    return {
      success: false,
      error: "Apenas ADMIN, SUPER_ADMIN ou SUPREME podem excluir raridades",
    };
  }
  try {
    await prisma.rarity.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir raridade:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateRarity(id: number, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const emoji = formData.get("emoji") as string;
    const description = formData.get("description") as string;
    const emoji_id = formData.get("emoji_id") as string;

    await prisma.rarity.update({
      where: { id },
      data: { name, code, emoji, description, emoji_id: emoji_id || null },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar raridade:", error);
    return { success: false, error: String(error) };
  }
}

// --- Characters ---

async function handleFileUpload(file: File) {
  if (!file || file.size === 0 || !file.name || file.name === "undefined")
    return null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = (file.name || "upload").replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${Date.now()}-${safeName}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await fs.mkdir(uploadDir, { recursive: true }).catch(() => {});

    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, buffer);
    return `/uploads/${filename}`;
  } catch (error) {
    console.error("Erro no upload de arquivo:", error);
    return null;
  }
}

async function deleteLocalFile(filePath: string) {
  try {
    const absolutePath = path.join(process.cwd(), "public", filePath);
    await fs.unlink(absolutePath);
  } catch (error) {
    console.error("Erro ao deletar arquivo local:", error);
  }
}

export async function createCharacter(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const origem = formData.get("origem") as string;
    const type = formData.get("type") as "waifu" | "husbando";
    const sourceType = (formData.get("sourceType") as SourceType) || "ANIME";
    const mediaUrlInput = formData.get("mediaUrl") as string;
    const file = formData.get("file") as File | null;
    const mediaTypeInput = formData.get("mediaType") as string | null;

    const eventIds = JSON.parse(
      (formData.get("eventIds") as string) || "[]",
    ) as number[];
    const rarityIds = JSON.parse(
      (formData.get("rarityIds") as string) || "[]",
    ) as number[];

    let finalMedia = mediaUrlInput;
    let finalMediaType:
      | "IMAGE_URL"
      | "VIDEO_URL"
      | "IMAGE_FILEID"
      | "VIDEO_FILEID"
      | "IMAGE_LOCAL"
      | "VIDEO_LOCAL" = (mediaTypeInput as any) || "IMAGE_URL";
    let isVideo = finalMediaType.includes("VIDEO");
    let localFilePath: string | null = null;

    if (file && file.size > 0) {
      const uploadedPath = await handleFileUpload(file);
      if (uploadedPath) {
        localFilePath = uploadedPath;
        isVideo = file.type.includes("video");
        finalMediaType = isVideo ? "VIDEO_LOCAL" : "IMAGE_LOCAL";
      }
    } else if (mediaUrlInput) {
      isVideo = mediaUrlInput.match(/\.(mp4|webm|mov|avi|mkv)$/i) !== null;
      finalMediaType = isVideo ? "VIDEO_URL" : "IMAGE_URL";
    }

    const slug = slugify(
      `${name} ${origem}-${Date.now().toString().slice(-4)}`,
    );

    const session = await getSession();

    let addbyorNull: any = undefined;
    if (session) {
      addbyorNull = {
        text: session.firstName,
        type: "mention_name",
        user_id: session.telegramId,
      };
    }

    const usermention = session
      ? `<a href="tg://user?id=${session.telegramId}"><b>${session.firstName}</b></a>`
      : "";

    let characterCreated;

    if (type === "waifu") {
      characterCreated = await prisma.characterWaifu.create({
        data: {
          name,
          origem,
          slug,
          sourceType,
          media: finalMedia,
          mediaType: finalMediaType,
          addby: addbyorNull,
          WaifuEvent: {
            create: eventIds.map((id) => ({ eventId: id })),
          },
          WaifuRarity: {
            create: rarityIds.map((id) => ({ rarityId: id })),
          },
        },
        include: {
          WaifuEvent: { include: { Event: true } },
          WaifuRarity: { include: { Rarity: true } },
        },
      });
    } else {
      characterCreated = await prisma.characterHusbando.create({
        data: {
          name,
          origem,
          slug,
          sourceType,
          media: finalMedia,
          mediaType: finalMediaType,
          addby: addbyorNull,
          HusbandoEvent: {
            create: eventIds.map((id) => ({ eventId: id })),
          },
          HusbandoRarity: {
            create: rarityIds.map((id) => ({ rarityId: id })),
          },
        },
        include: {
          HusbandoEvent: { include: { Event: true } },
          HusbandoRarity: { include: { Rarity: true } },
        },
      });
    }

    const caption = createCaption(characterCreated, type, usermention);

    if (localFilePath) {
      const result = isVideo
        ? await sendLocalVideoToTelegram(localFilePath, caption, type)
        : await sendLocalPhotoToTelegram(localFilePath, caption, type);

      if (result.success && result.fileId) {
        finalMedia = result.fileId;
        finalMediaType = isVideo ? "VIDEO_FILEID" : "IMAGE_FILEID";

        if (type === "waifu") {
          await prisma.characterWaifu.update({
            where: { id: characterCreated.id },
            data: { media: result.fileId, mediaType: finalMediaType },
          });
        } else {
          await prisma.characterHusbando.update({
            where: { id: characterCreated.id },
            data: { media: result.fileId, mediaType: finalMediaType },
          });
        }
      }

      await deleteLocalFile(localFilePath);
    } else if (finalMedia) {
      if (isVideo) {
        await notifyDatabaseChannelWithVideo(finalMedia, caption, type);
      } else {
        await notifyDatabaseChannelWithPhoto(finalMedia, caption, type);
      }
    } else {
      await notifyDatabaseChannel(caption, type);
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar personagem:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateCharacter(
  id: number,
  type: "waifu" | "husbando",
  formData: FormData,
) {
  try {
    const name = formData.get("name") as string;
    const origem = formData.get("origem") as string;
    const sourceType = (formData.get("sourceType") as SourceType) || "ANIME";
    const mediaUrlInput = formData.get("mediaUrl") as string;
    const file = formData.get("file") as File | null;
    const mediaTypeInput = formData.get("mediaType") as string | null;

    const eventIds = JSON.parse(
      (formData.get("eventIds") as string) || "[]",
    ) as number[];
    const rarityIds = JSON.parse(
      (formData.get("rarityIds") as string) || "[]",
    ) as number[];

    let finalMedia = mediaUrlInput;
    let finalMediaType:
      | "IMAGE_URL"
      | "VIDEO_URL"
      | "IMAGE_FILEID"
      | "VIDEO_FILEID"
      | "IMAGE_LOCAL"
      | "VIDEO_LOCAL" = (mediaTypeInput as any) || "IMAGE_URL";
    let isVideo = finalMediaType.includes("VIDEO");
    let localFilePath: string | null = null;

    if (file && file.size > 0) {
      const uploadedPath = await handleFileUpload(file);
      if (uploadedPath) {
        localFilePath = uploadedPath;
        isVideo =
          file.type.includes("video") ||
          /\.(mp4|webm|mov|avi|mkv)$/i.test(file.name || "");
        finalMediaType = isVideo ? "VIDEO_LOCAL" : "IMAGE_LOCAL";
      }
    } else if (mediaUrlInput) {
      isVideo = mediaUrlInput.match(/\.(mp4|webm|mov|avi|mkv)$/i) !== null;
      finalMediaType = isVideo ? "VIDEO_URL" : "IMAGE_URL";
    }

    const updateData: any = {
      name,
      origem,
      sourceType,
      media: finalMedia,
      mediaType: finalMediaType,
    };

    if (type === "waifu") {
      await prisma.$transaction([
        prisma.waifuEvent.deleteMany({ where: { characterId: id } }),
        prisma.waifuRarity.deleteMany({ where: { characterId: id } }),
        prisma.characterWaifu.update({
          where: { id },
          data: {
            ...updateData,
            WaifuEvent: { create: eventIds.map((eid) => ({ eventId: eid })) },
            WaifuRarity: {
              create: rarityIds.map((rid) => ({ rarityId: rid })),
            },
          },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.husbandoEvent.deleteMany({ where: { characterId: id } }),
        prisma.husbandoRarity.deleteMany({ where: { characterId: id } }),
        prisma.characterHusbando.update({
          where: { id },
          data: {
            ...updateData,
            HusbandoEvent: {
              create: eventIds.map((eid) => ({ eventId: eid })),
            },
            HusbandoRarity: {
              create: rarityIds.map((rid) => ({ rarityId: rid })),
            },
          },
        }),
      ]);
    }

    if (localFilePath) {
      const result = isVideo
        ? await sendLocalVideoToTelegram(localFilePath, "", type)
        : await sendLocalPhotoToTelegram(localFilePath, "", type);

      if (result.success && result.fileId) {
        finalMedia = result.fileId;
        finalMediaType = isVideo ? "VIDEO_FILEID" : "IMAGE_FILEID";

        if (type === "waifu") {
          await prisma.characterWaifu.update({
            where: { id },
            data: { media: result.fileId, mediaType: finalMediaType },
          });
        } else {
          await prisma.characterHusbando.update({
            where: { id },
            data: { media: result.fileId, mediaType: finalMediaType },
          });
        }
      }

      await deleteLocalFile(localFilePath);
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar personagem:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteCharacter(
  id: number,
  type: "waifu" | "husbando",
  currentUserProfileType?: string,
) {
  if (!canDelete(currentUserProfileType)) {
    return {
      success: false,
      error: "Apenas ADMIN, SUPER_ADMIN ou SUPREME podem excluir personagens",
    };
  }
  try {
    if (type === "waifu") {
      const char = await prisma.characterWaifu.findUnique({ where: { id } });
      if (char?.media?.startsWith("/uploads/")) {
        const filepath = path.join(process.cwd(), "public", char.media);
        await fs.unlink(filepath).catch(() => {});
      }
      await prisma.characterWaifu.delete({ where: { id } });
    } else {
      const char = await prisma.characterHusbando.findUnique({ where: { id } });
      if (char?.media?.startsWith("/uploads/")) {
        const filepath = path.join(process.cwd(), "public", char.media);
        await fs.unlink(filepath).catch(() => {});
      }
      await prisma.characterHusbando.delete({ where: { id } });
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir personagem:", error);
    return { success: false, error: String(error) };
  }
}

export async function getCharacters(
  type: "waifu" | "husbando",
  search?: string,
) {
  try {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { origem: { contains: search, mode: "insensitive" } },
      ];
    }

    const include = {
      [type === "waifu" ? "WaifuEvent" : "HusbandoEvent"]: {
        include: { Event: true },
      },
      [type === "waifu" ? "WaifuRarity" : "HusbandoRarity"]: {
        include: { Rarity: true },
      },
    };

    if (type === "waifu") {
      return await prisma.characterWaifu.findMany({
        where,
        include,
        orderBy: { createdAt: "desc" },
        take: 100,
      });
    } else {
      return await prisma.characterHusbando.findMany({
        where,
        include,
        orderBy: { createdAt: "desc" },
        take: 100,
      });
    }
  } catch (error) {
    console.error("Erro ao buscar personagens:", error);
    return [];
  }
}

export async function linkCharacter(
  id: number,
  type: "waifu" | "husbando",
  slug?: string,
) {
  try {
    if (type === "waifu") {
      await prisma.characterWaifu.update({
        where: { id },
        data: {
          likes: {
            increment: 1,
          },
        },
      });
    } else {
      await prisma.characterHusbando.update({
        where: { id },
        data: {
          likes: {
            increment: 1,
          },
        },
      });
    }

    if (slug) {
      revalidatePath(`/characters/${slug}`);
    }
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Erro ao linkar personagem:", error);
    return { success: false, error: String(error) };
  }
}

// --- Telegram Media Resolution ---

export async function resolveTelegramMedia(
  fileId: string,
  type: "waifu" | "husbando" = "waifu",
) {
  if (!fileId) return "";

  const token =
    type === "waifu"
      ? process.env.BOT_TOKEN_WAIFU
      : process.env.BOT_TOKEN_HUSBANDO;
  if (!token) return "";

  const cacheKey = `${type}:${fileId}`;
  const cachedPath = mediaCache.get(cacheKey);
  if (cachedPath) {
    return `https://api.telegram.org/file/bot${token}/${cachedPath}`;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`,
    );
    const data = await response.json();

    if (data.ok && data.result.file_path) {
      const filePath = data.result.file_path;
      mediaCache.set(cacheKey, filePath);

      // Atualizar linkweb no banco em background
      const link = `https://api.telegram.org/file/bot${token}/${filePath}`;
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

      if (type === "waifu") {
        prisma.characterWaifu
          .updateMany({
            where: { media: fileId },
            data: { linkweb: link, linkwebExpiresAt: expiresAt },
          })
          .catch(console.error);
      } else {
        prisma.characterHusbando
          .updateMany({
            where: { media: fileId },
            data: { linkweb: link, linkwebExpiresAt: expiresAt },
          })
          .catch(console.error);
      }

      return link;
    }
  } catch (error) {
    console.error("Erro ao resolver Telegram Media:", error);
  }

  return "";
}

// --- Telegram Groups ---

export async function getTelegramGroups() {
  try {
    const groups = await prisma.telegramGroup.findMany({
      orderBy: { updatedAt: "desc" },
    });

    // Tratamento de BigInt para JSON
    return groups.map((g) => ({
      ...g,
      groupId: g.groupId.toString(),
    }));
  } catch (error) {
    console.error("Erro ao buscar grupos do Telegram:", error);
    return [];
  }
}

export async function updateTelegramGroup(id: number, formData: FormData) {
  try {
    const groupName = formData.get("groupName") as string;
    const configuration = JSON.parse(
      (formData.get("configuration") as string) || "{}",
    );

    await prisma.telegramGroup.update({
      where: { id },
      data: { groupName, configuration },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar grupo do Telegram:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteTelegramGroup(
  id: number,
  currentUserProfileType?: string,
) {
  if (!canDelete(currentUserProfileType)) {
    return {
      success: false,
      error:
        "Apenas ADMIN, SUPER_ADMIN ou SUPREME podem excluir grupos do Telegram",
    };
  }
  try {
    await prisma.telegramGroup.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir grupo do Telegram:", error);
    return { success: false, error: String(error) };
  }
}

export async function adjustUserCoins(
  telegramId: string,
  amount: number,
  operation: "add" | "subtract" | "set",
  currentUserProfileType?: string,
) {
  if (!canDelete(currentUserProfileType)) {
    return {
      success: false,
      error: "Apenas ADMIN, SUPER_ADMIN ou SUPREME podem ajustar moedas",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });
    if (!user) {
      return { success: false, error: "Usuário não encontrado" };
    }

    let newCoins: number;
    switch (operation) {
      case "add":
        newCoins = user.coins + amount;
        break;
      case "subtract":
        newCoins = Math.max(0, user.coins - amount);
        break;
      case "set":
        newCoins = amount;
        break;
    }

    await prisma.user.update({
      where: { telegramId: BigInt(telegramId) },
      data: { coins: newCoins },
    });

    revalidatePath("/admin");
    return { success: true, newCoins };
  } catch (error) {
    console.error("Erro ao ajustar moedas:", error);
    return { success: false, error: String(error) };
  }
}

export async function reduceDuplicateCharacter(
  telegramId: string,
  characterId: number,
  type: "waifu" | "husbando",
  reduceBy: number,
  currentUserProfileType?: string,
) {
  if (!canDelete(currentUserProfileType)) {
    return {
      success: false,
      error: "Apenas ADMIN, SUPER_ADMIN ou SUPREME podem reduzir repetições",
    };
  }

  try {
    let existing;
    if (type === "waifu") {
      existing = await prisma.waifuCollection.findFirst({
        where: { userId: BigInt(telegramId), characterId },
      });
    } else {
      existing = await prisma.husbandoCollection.findFirst({
        where: { userId: BigInt(telegramId), characterId },
      });
    }

    if (!existing) {
      return { success: false, error: "Personagem não encontrado na coleção" };
    }

    const newCount = Math.max(0, existing.count - reduceBy);

    if (newCount === 0) {
      if (type === "waifu") {
        await prisma.waifuCollection.delete({ where: { id: existing.id } });
      } else {
        await prisma.husbandoCollection.delete({ where: { id: existing.id } });
      }
    } else {
      if (type === "waifu") {
        await prisma.waifuCollection.update({
          where: { id: existing.id },
          data: { count: newCount },
        });
      } else {
        await prisma.husbandoCollection.update({
          where: { id: existing.id },
          data: { count: newCount },
        });
      }
    }

    revalidatePath("/admin");
    return { success: true, newCount };
  } catch (error) {
    console.error("Erro ao reduzir repetições:", error);
    return { success: false, error: String(error) };
  }
}

export async function getUserCollectionDetails(telegramId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
      include: {
        WaifuCollection: {
          include: {
            Character: true,
          },
          orderBy: { count: "desc" },
        },
        HusbandoCollection: {
          include: {
            Character: true,
          },
          orderBy: { count: "desc" },
        },
      },
    });

    if (!user) return null;

    return {
      waifus: user.WaifuCollection,
      husbandos: user.HusbandoCollection,
    };
  } catch (error) {
    console.error("Erro ao buscar detalhes da coleção:", error);
    return null;
  }
}

export async function setUserFavorite(
  telegramId: string,
  characterId: number,
  type: "waifu" | "husbando",
  currentUserProfileType?: string,
) {
  if (!canDelete(currentUserProfileType)) {
    return {
      success: false,
      error: "Apenas ADMIN, SUPER_ADMIN ou SUPREME podem alterar favoritos",
    };
  }

  try {
    if (type === "waifu") {
      await prisma.user.update({
        where: { telegramId: BigInt(telegramId) },
        data: { CharacterWaifu: { connect: { id: characterId } } },
      });
    } else {
      await prisma.user.update({
        where: { telegramId: BigInt(telegramId) },
        data: { CharacterHusbando: { connect: { id: characterId } } },
      });
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao definir favorito:", error);
    return { success: false, error: String(error) };
  }
}

export async function removeUserFavorite(
  telegramId: string,
  type: "waifu" | "husbando",
  currentUserProfileType?: string,
) {
  if (!canDelete(currentUserProfileType)) {
    return {
      success: false,
      error: "Apenas ADMIN, SUPER_ADMIN ou SUPREME podem remover favoritos",
    };
  }

  try {
    if (type === "waifu") {
      await prisma.user.update({
        where: { telegramId: BigInt(telegramId) },
        data: { CharacterWaifu: { disconnect: true } },
      });
    } else {
      await prisma.user.update({
        where: { telegramId: BigInt(telegramId) },
        data: { CharacterHusbando: { disconnect: true } },
      });
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao remover favorito:", error);
    return { success: false, error: String(error) };
  }
}
