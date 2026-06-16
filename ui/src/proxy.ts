import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth",
  "/auth",
  "/api/verify-telegram-token",
  "/api/create-account",
  "/api/me",
  "/api/logout",
  "/api/login",
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
      select: { expiresAt: true },
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

    return NextResponse.next();
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};