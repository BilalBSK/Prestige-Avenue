import { CSRF_COOKIE_NAME, generateCsrfToken } from "@/lib/csrf";
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
  return withCsrfCookie(request, NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
