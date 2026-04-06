"use server"

import { prisma } from "@/lib/prisma"
import { MediaType, SourceType } from "../../../generated/prisma/client"
import { slugify } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import fs from "fs/promises"
import path from "path"

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
    ] = await Promise.all([
      prisma.user.count(),
      prisma.characterWaifu.count(),
      prisma.characterHusbando.count(),
      prisma.waifuCollection.count(),
      prisma.husbandoCollection.count(),
      prisma.user.groupBy({
        by: ['profileType'],
        _count: {
          profileType: true,
        },
      }),
    ])

    return {
      stats: {
        totalUsers,
        totalCharacters: totalWaifus + totalHusbandos,
        totalCollections: Number(totalCollectionsWaifu) + Number(totalCollectionsHusbando),
        totalWaifus,
        totalHusbandos,
      },
      profileDistribution: profileDistribution.map(d => ({
        name: d.profileType,
        value: d._count.profileType,
      })),
    }
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error)
    return {
      stats: { totalUsers: 0, totalCharacters: 0, totalCollections: 0, totalWaifus: 0, totalHusbandos: 0 },
      profileDistribution: [],
    }
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
          }
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
    })
    
    // Tratamento de BigInt para JSON
    return users.map(u => ({
      ...u,
      telegramId: u.telegramId.toString(),
    }))
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return []
  }
}

export async function deleteUser(id: number) {
  try {
    await prisma.user.delete({ where: { id } })
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir usuário:", error)
    return { success: false, error: String(error) }
  }
}

// --- Events ---

export async function getEvents() {
  try {
    return await prisma.event.findMany({
      orderBy: { name: "asc" }
    })
  } catch (error) {
    console.error("Erro ao buscar eventos:", error)
    return []
  }
}

export async function createEvent(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const code = formData.get("code") as string
    const emoji = formData.get("emoji") as string
    const description = formData.get("description") as string

    await prisma.event.create({
      data: { name, code, emoji, description }
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Erro ao criar evento:", error)
    return { success: false, error: String(error) }
  }
}

export async function deleteEvent(id: number) {
  try {
    await prisma.event.delete({ where: { id } })
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir evento:", error)
    return { success: false, error: String(error) }
  }
}

export async function updateEvent(id: number, formData: FormData) {
  try {
    const name = formData.get("name") as string
    const code = formData.get("code") as string
    const emoji = formData.get("emoji") as string
    const description = formData.get("description") as string

    await prisma.event.update({
      where: { id },
      data: { name, code, emoji, description }
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar evento:", error)
    return { success: false, error: String(error) }
  }
}

// --- Rarities ---

export async function getRarities() {
  try {
    return await prisma.rarity.findMany({
      orderBy: { name: "asc" }
    })
  } catch (error) {
    console.error("Erro ao buscar raridades:", error)
    return []
  }
}

export async function createRarity(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const code = formData.get("code") as string
    const emoji = formData.get("emoji") as string
    const description = formData.get("description") as string

    await prisma.rarity.create({
      data: { name, code, emoji, description }
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Erro ao criar raridade:", error)
    return { success: false, error: String(error) }
  }
}

export async function deleteRarity(id: number) {
  try {
    await prisma.rarity.delete({ where: { id } })
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir raridade:", error)
    return { success: false, error: String(error) }
  }
}

export async function updateRarity(id: number, formData: FormData) {
  try {
    const name = formData.get("name") as string
    const code = formData.get("code") as string
    const emoji = formData.get("emoji") as string
    const description = formData.get("description") as string

    await prisma.rarity.update({
      where: { id },
      data: { name, code, emoji, description }
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar raridade:", error)
    return { success: false, error: String(error) }
  }
}

// --- Characters ---

async function handleFileUpload(file: File) {
  if (!file || file.size === 0 || file.name === "undefined") return null
  
  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`
  const uploadDir = path.join(process.cwd(), "public", "uploads")
  
  // Garantir que a pasta existe
  await fs.mkdir(uploadDir, { recursive: true }).catch(() => {})
  
  const filepath = path.join(uploadDir, filename)
  await fs.writeFile(filepath, buffer)
  return `/uploads/${filename}`
}

export async function createCharacter(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const origem = formData.get("origem") as string
    const type = formData.get("type") as "waifu" | "husbando"
    const sourceType = (formData.get("sourceType") as SourceType) || "ANIME"
    const mediaUrlInput = formData.get("mediaUrl") as string
    const file = formData.get("file") as File | null
    
    // Relações
    const eventIds = JSON.parse(formData.get("eventIds") as string || "[]") as number[]
    const rarityIds = JSON.parse(formData.get("rarityIds") as string || "[]") as number[]

    let finalMedia = mediaUrlInput
    if (file) {
      const uploadedPath = await handleFileUpload(file)
      if (uploadedPath) finalMedia = uploadedPath
    }

    const slug = slugify(`${name} ${origem}-${Date.now().toString().slice(-4)}`)

    if (type === "waifu") {
      await prisma.characterWaifu.create({
        data: {
          name, origem, slug, sourceType, media: finalMedia, mediaType: "IMAGE_URL",
          WaifuEvent: {
            create: eventIds.map(id => ({ eventId: id }))
          },
          WaifuRarity: {
            create: rarityIds.map(id => ({ rarityId: id }))
          }
        },
      })
    } else {
      await prisma.characterHusbando.create({
        data: {
          name, origem, slug, sourceType, media: finalMedia, mediaType: "IMAGE_URL",
          HusbandoEvent: {
            create: eventIds.map(id => ({ eventId: id }))
          },
          HusbandoRarity: {
            create: rarityIds.map(id => ({ rarityId: id }))
          }
        },
      })
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Erro ao criar personagem:", error)
    return { success: false, error: String(error) }
  }
}

export async function updateCharacter(id: number, type: "waifu" | "husbando", formData: FormData) {
  try {
    const name = formData.get("name") as string
    const origem = formData.get("origem") as string
    const sourceType = (formData.get("sourceType") as SourceType) || "ANIME"
    const mediaUrlInput = formData.get("mediaUrl") as string
    const file = formData.get("file") as File | null
    
    // Relações
    const eventIds = JSON.parse(formData.get("eventIds") as string || "[]") as number[]
    const rarityIds = JSON.parse(formData.get("rarityIds") as string || "[]") as number[]

    let finalMedia = mediaUrlInput
    if (file && file.size > 0) {
      const uploadedPath = await handleFileUpload(file)
      if (uploadedPath) finalMedia = uploadedPath
    }

    // Se o nome ou origem mudou, talvez queira atualizar o slug? 
    // Por segurança e SEO, manteremos o original ou geraremos um novo se o usuário desejar.
    // Aqui manteremos o original para evitar quebrar links, a menos que mude drasticamente.

    if (type === "waifu") {
      await prisma.$transaction([
        // Limpar relações antigas
        prisma.waifuEvent.deleteMany({ where: { characterId: id } }),
        prisma.waifuRarity.deleteMany({ where: { characterId: id } }),
        // Atualizar
        prisma.characterWaifu.update({
          where: { id },
          data: {
            name, origem, sourceType, media: finalMedia,
            WaifuEvent: { create: eventIds.map(eid => ({ eventId: eid })) },
            WaifuRarity: { create: rarityIds.map(rid => ({ rarityId: rid })) }
          }
        })
      ])
    } else {
      await prisma.$transaction([
        // Limpar relações antigas
        prisma.husbandoEvent.deleteMany({ where: { characterId: id } }),
        prisma.husbandoRarity.deleteMany({ where: { characterId: id } }),
        // Atualizar
        prisma.characterHusbando.update({
          where: { id },
          data: {
            name, origem, sourceType, media: finalMedia,
            HusbandoEvent: { create: eventIds.map(eid => ({ eventId: eid })) },
            HusbandoRarity: { create: rarityIds.map(rid => ({ rarityId: rid })) }
          }
        })
      ])
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar personagem:", error)
    return { success: false, error: String(error) }
  }
}

export async function deleteCharacter(id: number, type: "waifu" | "husbando") {
  try {
    if (type === "waifu") {
      const char = await prisma.characterWaifu.findUnique({ where: { id } })
      if (char?.media?.startsWith("/uploads/")) {
        const filepath = path.join(process.cwd(), "public", char.media)
        await fs.unlink(filepath).catch(() => {})
      }
      await prisma.characterWaifu.delete({ where: { id } })
    } else {
      const char = await prisma.characterHusbando.findUnique({ where: { id } })
      if (char?.media?.startsWith("/uploads/")) {
        const filepath = path.join(process.cwd(), "public", char.media)
        await fs.unlink(filepath).catch(() => {})
      }
      await prisma.characterHusbando.delete({ where: { id } })
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir personagem:", error)
    return { success: false, error: String(error) }
  }
}

export async function getCharacters(type: "waifu" | "husbando", search?: string) {
  try {
    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { origem: { contains: search, mode: 'insensitive' } },
      ]
    }

    const include = {
      [type === "waifu" ? "WaifuEvent" : "HusbandoEvent"]: { include: { Event: true } },
      [type === "waifu" ? "WaifuRarity" : "HusbandoRarity"]: { include: { Rarity: true } },
    }

    if (type === "waifu") {
       return await prisma.characterWaifu.findMany({
        where,
        include,
        orderBy: { createdAt: "desc" },
        take: 100,
      })
    } else {
       return await prisma.characterHusbando.findMany({
        where,
        include,
        orderBy: { createdAt: "desc" },
        take: 100,
      })
    }
  } catch (error) {
    console.error("Erro ao buscar personagens:", error)
    return []
  }
}


export async function linkCharacter(
  id: number,
  type: "waifu" | "husbando",
  slug?: string
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

export async function resolveTelegramMedia(fileId: string, type: "waifu" | "husbando" = "waifu") {
  if (!fileId) return "";

  const token = type === "waifu" ? process.env.BOT_TOKEN_WAIFU : process.env.BOT_TOKEN_HUSBANDO;
  if (!token) return "";

  const cacheKey = `${type}:${fileId}`;
  const cachedPath = mediaCache.get(cacheKey);
  if (cachedPath) {
    return `https://api.telegram.org/file/bot${token}/${cachedPath}`;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const data = await response.json();

    if (data.ok && data.result.file_path) {
      const filePath = data.result.file_path;
      mediaCache.set(cacheKey, filePath);
      
      // Atualizar linkweb no banco em background
      const link = `https://api.telegram.org/file/bot${token}/${filePath}`;
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
      
      if (type === "waifu") {
        prisma.characterWaifu.updateMany({
          where: { media: fileId },
          data: { linkweb: link, linkwebExpiresAt: expiresAt }
        }).catch(console.error);
      } else {
        prisma.characterHusbando.updateMany({
          where: { media: fileId },
          data: { linkweb: link, linkwebExpiresAt: expiresAt }
        }).catch(console.error);
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
      orderBy: { updatedAt: "desc" }
    })
    
    // Tratamento de BigInt para JSON
    return groups.map(g => ({
      ...g,
      groupId: g.groupId.toString(),
    }))
  } catch (error) {
    console.error("Erro ao buscar grupos do Telegram:", error)
    return []
  }
}

export async function updateTelegramGroup(id: number, formData: FormData) {
  try {
    const groupName = formData.get("groupName") as string
    const configuration = JSON.parse(formData.get("configuration") as string || "{}")

    await prisma.telegramGroup.update({
      where: { id },
      data: { groupName, configuration }
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar grupo do Telegram:", error)
    return { success: false, error: String(error) }
  }
}

export async function deleteTelegramGroup(id: number) {
  try {
    await prisma.telegramGroup.delete({ where: { id } })
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir grupo do Telegram:", error)
    return { success: false, error: String(error) }
  }
}
