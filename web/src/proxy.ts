import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_SECRET = process.env.AUTH_SECRET;
const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "SUPREME"];

const ADMIN_API_ROUTES = [
  "/api/admin/users",
  "/api/admin/sessions",
];

const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/telegram",
  "/api/home",
  "/api/characters",
  "/api/characters/filters",
  "/api/user",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    return handleAdminApiRoute(request);
  }

  if (pathname.startsWith("/admin")) {
    return handleAdminPageRoute(request);
  }

  return NextResponse.next();
}

async function handleAdminApiRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  for (const route of ADMIN_API_ROUTES) {
    if (pathname.startsWith(route)) {
      const token = request.cookies.get("admin_session")?.value;

      if (!token) {
        return NextResponse.json(
          { error: "Não autenticado." },
          { status: 401 }
        );
      }

      const session = await verifySessionToken(token);

      if (!session) {
        return NextResponse.json(
          { error: "Sessão inválida ou expirada." },
          { status: 401 }
        );
      }

      if (!ADMIN_ROLES.includes(session.profileType)) {
        return NextResponse.json(
          { error: "Acesso negado. Permissão insuficiente." },
          { status: 403 }
        );
      }

      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

async function handleAdminPageRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("admin_session")?.value;

  if (!token || !AUTH_SECRET) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await verifySessionToken(token);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set("admin_session", "", { maxAge: 0, path: "/" });
    return response;
  }

  if (!ADMIN_ROLES.includes(session.profileType)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

async function verifySessionToken(token: string) {
  if (!AUTH_SECRET) return null;

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

export const config = {
  matcher: [
    "/api/admin/:path*",
    "/admin/:path*",
  ],
};