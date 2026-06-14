import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CharacterHusbando, CharacterWaifu } from "../../generated/prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
 export type Characterdb = CharacterHusbando | CharacterWaifu;

