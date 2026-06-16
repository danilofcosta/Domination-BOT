"use server";

import { prisma } from "@/lib/prisma";
import { notifyCharacterUpdate } from "@/lib/telegram/notifyCharacterUpdate";
import { generateSlug } from "@/lib/slug";
import { cookies } from "next/headers";

type NewMedia = {
  type: "url" | "file";
  value: string;
  mimeType: string;
};

export async function createCharacter(
  type: "waifu" | "husbando",
  data: {
    name: string;
    origem: string;
    sourceType: string;
    media: string;
    mediaType: string;
    rarityIds: number[];
    eventIds: number[];
  },
) {
  try {
    const slug = generateSlug(data.name, data.origem);

    if (type === "waifu") {
      const character = await prisma.characterWaifu.create({
        data: {
          name: data.name,
          origem: data.origem,
          sourceType: data.sourceType as any,
          media: data.media,
          mediaType: data.mediaType as any,
          slug,
        },
        select: { id: true, name: true },
      });

      if (data.rarityIds.length > 0) {
        await prisma.waifuRarity.createMany({
          data: data.rarityIds.map((rarityId) => ({ characterId: character.id, rarityId })),
        });
      }
      if (data.eventIds.length > 0) {
        await prisma.waifuEvent.createMany({
          data: data.eventIds.map((eventId) => ({ characterId: character.id, eventId })),
        });
      }

      return { success: true as const, message: "Waifu criada com sucesso!", id: character.id };
    } else {
      const character = await prisma.characterHusbando.create({
        data: {
          name: data.name,
          origem: data.origem,
          sourceType: data.sourceType as any,
          media: data.media,
          mediaType: data.mediaType as any,
          slug,
        },
        select: { id: true, name: true },
      });

      if (data.rarityIds.length > 0) {
        await prisma.husbandoRarity.createMany({
          data: data.rarityIds.map((rarityId) => ({ characterId: character.id, rarityId })),
        });
      }
      if (data.eventIds.length > 0) {
        await prisma.husbandoEvent.createMany({
          data: data.eventIds.map((eventId) => ({ characterId: character.id, eventId })),
        });
      }

      return { success: true as const, message: "Husbando criado com sucesso!", id: character.id };
    }
  } catch (error) {
    return {
      success: false as const,
      message: `Erro ao criar: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}

export async function updateCharacter(
  type: "waifu" | "husbando",
  id: number,
  data: {
    name: string;
    origem: string;
    mediaType: string;
    media: string;
    sourceType: string;
    rarityIds: number[];
    eventIds: number[];
    newMedia?: NewMedia;
  },
) {
  try {
    const old = type === "waifu"
      ? await prisma.characterWaifu.findUnique({
          where: { id },
          select: { name: true, origem: true, media: true, mediaType: true },
        })
      : await prisma.characterHusbando.findUnique({
          where: { id },
          select: { name: true, origem: true, media: true, mediaType: true },
        });

    const oldRarities = type === "waifu"
      ? await prisma.waifuRarity.findMany({
          where: { characterId: id },
          select: { Rarity: { select: { emoji: true, name: true } } },
        })
      : await prisma.husbandoRarity.findMany({
          where: { characterId: id },
          select: { Rarity: { select: { emoji: true, name: true } } },
        });

    const oldEvents = type === "waifu"
      ? await prisma.waifuEvent.findMany({
          where: { characterId: id },
          select: { Event: { select: { emoji: true, name: true } } },
        })
      : await prisma.husbandoEvent.findMany({
          where: { characterId: id },
          select: { Event: { select: { emoji: true, name: true } } },
        });

    const newRarities = data.rarityIds.length > 0
      ? await prisma.rarity.findMany({
          where: { id: { in: data.rarityIds } },
          select: { emoji: true, name: true },
        })
      : [];

    const newEvents = data.eventIds.length > 0
      ? await prisma.event.findMany({
          where: { id: { in: data.eventIds } },
          select: { emoji: true, name: true },
        })
      : [];

    let finalMedia = data.media;
    let finalMediaType = data.mediaType;

    console.log("[updateCharacter] type=%s id=%d", type, id);
    console.log("[updateCharacter] hasNewMedia=%s", !!data.newMedia);
    console.log("[updateCharacter] data.media (old)=%s", data.media?.slice(0, 60));
    console.log("[updateCharacter] data.mediaType (old)=%s", data.mediaType);

    if (data.newMedia) {
      console.log("[updateCharacter] newMedia.type=%s", data.newMedia.type);
      console.log("[updateCharacter] newMedia.value (first 60)=%s", data.newMedia.value?.slice(0, 60));
      console.log("[updateCharacter] newMedia.mimeType=%s", data.newMedia.mimeType);

      if (data.newMedia.type === "url") {
        finalMedia = data.newMedia.value;
        finalMediaType = data.newMedia.mimeType.startsWith("video/")
          ? "VIDEO_URL"
          : "IMAGE_URL";
      } else if (data.newMedia.type === "file") {
        finalMedia = data.newMedia.value;
        finalMediaType = data.newMedia.mimeType.startsWith("video/")
          ? "VIDEO_FILEID"
          : "IMAGE_FILEID";
      }
    }

    console.log("[updateCharacter] finalMedia (first 60)=%s", finalMedia?.slice(0, 60));
    console.log("[updateCharacter] finalMediaType=%s", finalMediaType);

    const mediaUpdateFields: Record<string, unknown> = {
      name: data.name,
      origem: data.origem,
      mediaType: finalMediaType,
      media: finalMedia,
      sourceType: data.sourceType,
    };

    if (data.newMedia) {
      mediaUpdateFields.linkweb = null;
      mediaUpdateFields.linkwebExpiresAt = null;
    }

    let up: { media: string; mediaType: string } | null = null;

    if (type === "waifu") {
      up = await prisma.characterWaifu.update({
        where: { id },
        data: mediaUpdateFields as any,
        select: { media: true, mediaType: true },
      });

      await prisma.waifuRarity.deleteMany({ where: { characterId: id } });
      if (data.rarityIds.length > 0) {
        await prisma.waifuRarity.createMany({
          data: data.rarityIds.map((rarityId) => ({ characterId: id, rarityId })),
        });
      }

      await prisma.waifuEvent.deleteMany({ where: { characterId: id } });
      if (data.eventIds.length > 0) {
        await prisma.waifuEvent.createMany({
          data: data.eventIds.map((eventId) => ({ characterId: id, eventId })),
        });
      }
    } else {
      up = await prisma.characterHusbando.update({
        where: { id },
        data: mediaUpdateFields as any,
        select: { media: true, mediaType: true },
      });

      await prisma.husbandoRarity.deleteMany({ where: { characterId: id } });
      if (data.rarityIds.length > 0) {
        await prisma.husbandoRarity.createMany({
          data: data.rarityIds.map((rarityId) => ({ characterId: id, rarityId })),
        });
      }

      await prisma.husbandoEvent.deleteMany({ where: { characterId: id } });
      if (data.eventIds.length > 0) {
        await prisma.husbandoEvent.createMany({
          data: data.eventIds.map((eventId) => ({ characterId: id, eventId })),
        });
      }
    }

    const changes: {
      name?: { from: string; to: string };
      origem?: { from: string; to: string };
      rarity?: { from: string; to: string };
      event?: { from: string; to: string };
      mediaChanged?: boolean;
    } = {};

    if (data.newMedia) {
      changes.mediaChanged = true;
    }
    if (old && old.name !== data.name) {
      changes.name = { from: old.name, to: data.name };
    }
    if (old && old.origem !== data.origem) {
      changes.origem = { from: old.origem, to: data.origem };
    }

    const oldRarityStr = oldRarities.map((r) => `${r.Rarity.emoji} ${r.Rarity.name}`).join(", ");
    const newRarityStr = newRarities.map((r) => `${r.emoji} ${r.name}`).join(", ");
    if (oldRarityStr !== newRarityStr) {
      changes.rarity = { from: oldRarityStr || "—", to: newRarityStr || "—" };
    }

    const oldEventStr = oldEvents.map((e) => `${e.Event.emoji} ${e.Event.name}`).join(", ");
    const newEventStr = newEvents.map((e) => `${e.emoji} ${e.name}`).join(", ");
    if (oldEventStr !== newEventStr) {
      changes.event = { from: oldEventStr || "—", to: newEventStr || "—" };
    }

    notifyCharacterUpdate(type, id, changes).catch(() => {});

    console.log("[updateCharacter] DB updated. media=%s mediaType=%s", up?.media?.slice(0, 60), up?.mediaType);
    console.log("[updateCharacter] matched expectation: media=%s expected=%s", up?.media === finalMedia, up?.mediaType === finalMediaType);

    return { success: true, message: "Personagem atualizado com sucesso!", updated: up };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao atualizar: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}
