"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SourceType, MediaType } from "@prisma/client";
import { nanoid } from "nanoid";

function generateSlug(name: string, origem: string) {
  const base = `${name}-${origem}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric (keep spaces and dashes for now)
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/-+/g, "-") // Remove double dashes
    .replace(/^-|-$/g, ""); // Remove leading/trailing dashes
  
  return `${base}-${nanoid(6)}`;
}

export async function createWaifu(inputData: any) {
  const { eventIds, rarityIds, slug: inputSlug, ...data } = inputData;
  const slug = inputSlug || generateSlug(data.name, data.origem);

  await prisma.characterWaifu.create({
    data: {
      ...data,
      slug:slug,

      sourceType: data.sourceType as SourceType,
      mediaType: data.mediaType as MediaType,
      events: {
        create: (eventIds || []).map((id: number) => ({ eventId: id }))
      },
      rarities: {
        create: (rarityIds || []).map((id: number) => ({ rarityId: id }))
      }
    },
  });

  revalidatePath("/admin/waifus");
  revalidatePath("/");
  redirect("/admin/waifus");
}

export async function updateWaifu(id: number, inputData: any) {
  const { eventIds, rarityIds, emoji_id, slug: inputSlug, ...data } = inputData;
  const slug = inputSlug || data.slug; // Keep existing or use new if provided

  await prisma.$transaction([
      // Limpa relações antigas
      prisma.waifuEvent.deleteMany({ where: { characterId: id } }),
      prisma.waifuRarity.deleteMany({ where: { characterId: id } }),
      // Atualiza personagem e cria novas relações
      prisma.characterWaifu.update({
          where: { id },
          data: {
              ...data,
              slug,
              emoji_id,
              sourceType: data.sourceType as SourceType,
              mediaType: data.mediaType as MediaType,
              events: {
                  create: (eventIds || []).map((eventId: number) => ({ eventId }))
              },
              rarities: {
                  create: (rarityIds || []).map((rarityId: number) => ({ rarityId }))
              }
          }
      })
  ]);

  revalidatePath("/admin/waifus");
  revalidatePath("/");
  redirect("/admin/waifus");
}

export async function createHusbando(inputData: any) {
  const { eventIds, rarityIds, slug: inputSlug, ...data } = inputData;
  const slug = inputSlug || generateSlug(data.name, data.origem);

  await prisma.characterHusbando.create({
    data: {
      ...data,
   slug:slug,

      sourceType: data.sourceType as SourceType,
      mediaType: data.mediaType as MediaType,
      events: {
        create: (eventIds || []).map((id: number) => ({ eventId: id }))
      },
      rarities: {
        create: (rarityIds || []).map((id: number) => ({ rarityId: id }))
      }
    },
  });

  revalidatePath("/admin/husbandos");
  revalidatePath("/");
  redirect("/admin/husbandos");
}

export async function updateHusbando(id: number, inputData: any) {
  const { eventIds, rarityIds, slug: inputSlug, ...data } = inputData;
  const slug = inputSlug || data.slug;

  await prisma.$transaction([
      prisma.husbandoEvent.deleteMany({ where: { characterId: id } }),
      prisma.husbandoRarity.deleteMany({ where: { characterId: id } }),
      prisma.characterHusbando.update({
          where: { id },
          data: {
              ...data,
              slug,
            
              sourceType: data.sourceType as SourceType,
              mediaType: data.mediaType as MediaType,
              events: {
                  create: (eventIds || []).map((eventId: number) => ({ eventId }))
              },
              rarities: {
                  create: (rarityIds || []).map((rarityId: number) => ({ rarityId }))
              }
          }
      })
  ]);

  revalidatePath("/admin/husbandos");
  revalidatePath("/");
  redirect("/admin/husbandos");
}

export async function deleteWaifu(id: number) {
  await prisma.characterWaifu.delete({
    where: { id },
  });
  revalidatePath("/admin/waifus");
}

export async function deleteHusbando(id: number) {
  await prisma.characterHusbando.delete({
    where: { id },
  });
  revalidatePath("/admin/husbandos");
}
