import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPermission, type ProfileType } from "@/lib/permissions";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth",
  "/auth",
  "/api/verify-telegram-token",
  "/api/create-account",
  "/api/me",
  "/api/logout",
  "/api/login",
  "/profile",
];

type Permission =
  | "manage_admins"
  | "manage_users"
  | "manage_characters"
  | "manage_events"
  | "manage_rarities"
  | "manage_groups"
  | "manage_config"
  | "manage_limits"
  | "manage_drop"
  | "view_users"
  | "view_logs";

const ROUTE_PERMISSIONS: { prefix: string; permission: Permission }[] = [
  { prefix: "/setup/admins", permission: "manage_admins" },
  { prefix: "/usuarios", permission: "manage_users" },
  { prefix: "/setup/limites", permission: "manage_limits" },
  { prefix: "/setup/grupos", permission: "manage_groups" },
  { prefix: "/setup/info", permission: "manage_config" },
  { prefix: "/setup/drop", permission: "manage_drop" },
  { prefix: "/setup", permission: "manage_config" },
  { prefix: "/characters/raridades", permission: "manage_rarities" },
  { prefix: "/characters/eventos", permission: "manage_events" },
  { prefix: "/characters", permission: "manage_characters" },
  { prefix: "/logs", permission: "view_logs" },
];

export default async function handler(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isPublic) return NextResponse.next();

  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ??
    request.cookies.get("__Secure-better-auth.session_token")?.value ??
    request.cookies.get("__Host-better-auth.session_token")?.value;

  if (!sessionToken) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login para continuar." },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      select: {
        expiresAt: true,
        userId: true,
      },
    });

    if (!session || session.expiresAt < new Date()) {
      await prisma.session.deleteMany({ where: { token: sessionToken } });
      const response = pathname.startsWith("/api/")
        ? NextResponse.json({ error: "Sessão expirada." }, { status: 401 })
        : NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set("better-auth.session_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return response;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { telegramUserId: true },
    });

    let profileType: string | null = null;

    if (user?.telegramUserId) {
      const telegramUser = await prisma.telegramUser.findUnique({
        where: { id: user.telegramUserId },
        select: { profileType: true },
      });
      profileType = telegramUser?.profileType ?? null;
    }

    if (profileType === "BANNED") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Usuário banido." },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const routeCheck = ROUTE_PERMISSIONS.find((r) =>
      pathname === r.prefix || pathname.startsWith(r.prefix + "/")
    );

    if (routeCheck) {
      const allowed = await hasPermission(
        profileType as ProfileType,
        routeCheck.permission,
      );
      if (!allowed) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Sem permissão." },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL("/home", request.url));
      }
    }

    return NextResponse.next();
  } catch (e) {
    console.error("proxy auth error:", e);
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Erro ao validar sessão." },
        { status: 500 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};