import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_SECRET = process.env.AUTH_SECRET;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_session")?.value;

  if (!token || !AUTH_SECRET) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = new TextEncoder().encode(AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const adminRoles = ["MOD", "ADMIN", "OWNER"];
    if (!adminRoles.includes(payload.profileType as string)) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    const response = NextResponse.redirect(loginUrl);
    response.cookies.set("admin_session", "", { maxAge: 0, path: "/" });
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
