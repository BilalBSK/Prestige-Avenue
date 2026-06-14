import { CSRF_COOKIE_MAX_AGE_SECONDS } from "@/lib/csrf-shared";
import { CSRF_COOKIE_NAME, generateCsrfToken } from "@/lib/csrf";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const token = existing ?? generateCsrfToken();

  const response = NextResponse.json({ csrfToken: token });
  // Toujours réaffirmer le cookie = token renvoyé, même s'il existe déjà.
  // Le middleware peut avoir posé un autre token sur une requête concurrente
  // au premier chargement ; cette route fait foi et garantit cookie === header.
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    httpOnly: false,
    maxAge: CSRF_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
