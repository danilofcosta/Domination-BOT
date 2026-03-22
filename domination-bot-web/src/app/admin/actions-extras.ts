"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// EVENTS
export async function createEvent(data: any) {
  await prisma.event.create({ data });
  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function updateEvent(id: number, data: any) {
  await prisma.event.update({ where: { id }, data });
  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function deleteEvent(id: number) {
  await prisma.event.delete({ where: { id } });
  revalidatePath("/admin/events");
}

// RARITIES
export async function createRarity(data: any) {
  await prisma.rarity.create({ data });
  revalidatePath("/admin/rarities");
  redirect("/admin/rarities");
}

export async function updateRarity(id: number, data: any) {
  await prisma.rarity.update({ where: { id }, data });
  revalidatePath("/admin/rarities");
  redirect("/admin/rarities");
}

export async function deleteRarity(id: number) {
  await prisma.rarity.delete({ where: { id } });
  revalidatePath("/admin/rarities");
}
