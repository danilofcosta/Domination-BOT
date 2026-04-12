import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { ProfileType } from "../../../generated/prisma/client";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

const AUTH_SECRET = process.env.AUTH_SECRET;
const BOT_TOKEN = process.env.BOT_TOKEN_WAIFU;

export const ADMIN_ROLES: readonly ProfileType[] = [
  ProfileType.ADMIN,
  ProfileType.SUPER_ADMIN,
  ProfileType.SUPREME,
];

export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface SessionPayload {
  telegramId: string;
  profileType: string;
  firstName: string;
  photoUrl?: string;
}

/**
 * Valida o hash HMAC-SHA256 enviado pelo Telegram Login Widget.
 * Docs: https://core.telegram.org/widgets/login#checking-authorization
 */
export function validateTelegramHash(data: TelegramAuthData): boolean {
  if (!BOT_TOKEN) {
    console.error("[Auth] BOT_TOKEN_WAIFU não configurado");
    return false;
  }

  // Verificar se auth_date não é muito antigo (máx 1 hora)
  const now = Math.floor(Date.now() / 1000);
  if (now - data.auth_date > 86400) {
    console.warn("[Auth] auth_date expirado");
    return false;
  }

  const { hash, ...rest } = data;

  // Montar a data-check-string em ordem alfabética
  const checkString = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key as keyof typeof rest]}`)
    .filter((entry) => !entry.endsWith("=undefined"))
    .join("\n");

  // SHA256 do bot token como chave secreta
  const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();

  // HMAC-SHA256 da data-check-string
  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  return hmac === hash;
}

/**
 * Cria um JWT assinado para a sessão do admin.
 * Expira em 7 dias.
 */
export async function createSessionToken(
  payload: SessionPayload,
): Promise<string> {
  if (!AUTH_SECRET) {
    throw new Error("[Auth] AUTH_SECRET não configurado no .env");
  }

  const secret = new TextEncoder().encode(AUTH_SECRET);

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/**
 * Verifica e decodifica o JWT da sessão.
 * Compatível com Edge Runtime (usa jose).
 */
export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  if (!AUTH_SECRET) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return {
      telegramId: payload.telegramId as string,
      profileType: payload.profileType as string,
      firstName: payload.firstName as string,
      photoUrl: payload.photoUrl as string | undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Lê a sessão do cookie (server-side only).
 * Para uso em Server Components e Server Actions.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  if (!token) return null;

  return verifySessionToken(token);
}
