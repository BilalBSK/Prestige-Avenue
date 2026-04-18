import { CSRF_COOKIE_NAME, generateCsrfToken } from "@/lib/csrf";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function withCsrfCookie(request: NextRequest, response: NextResponse) {
  if (!request.cookies.get(CSRF_COOKIE_NAME)?.value) {
    response.cookies.set(CSRF_COOKIE_NAME, generateCsrfToken(), {
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      httpOnly: false,
    });
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return withCsrfCookie(request, NextResponse.redirect(loginUrl));
    }

    if (token.role !== "ADMIN") {
      return withCsrfCookie(request, NextResponse.redirect(new URL("/", request.url)));
    }
  }

  return withCsrfCookie(request, NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
