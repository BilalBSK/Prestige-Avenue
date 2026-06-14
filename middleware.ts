import {
  CSRF_COOKIE_MAX_AGE_SECONDS,
  CSRF_COOKIE_NAME,
} from "@/lib/csrf-shared";
import { generateCsrfToken } from "@/lib/csrf";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function withCsrfCookie(request: NextRequest, response: NextResponse) {
  const existingToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const token = existingToken ?? generateCsrfToken();
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    httpOnly: false,
    maxAge: CSRF_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  return withCsrfCookie(request, response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
