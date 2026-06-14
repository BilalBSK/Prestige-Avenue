import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import {
  CSRF_COOKIE_MAX_AGE_SECONDS,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from "./csrf-shared";

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };

export function generateCsrfToken(): string {
  return crypto.randomUUID();
}

export async function getOrCreateCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (existingToken) {
    return existingToken;
  }

  const token = generateCsrfToken();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    httpOnly: false,
    maxAge: CSRF_COOKIE_MAX_AGE_SECONDS,
  });

  return token;
}

export function validateCsrf(request: NextRequest): boolean {
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  return Boolean(headerToken && cookieToken && headerToken === cookieToken);
}
