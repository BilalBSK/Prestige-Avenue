import { CSRF_COOKIE_NAME, generateCsrfToken } from "@/lib/csrf";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const token = existing ?? generateCsrfToken();

  const response = NextResponse.json({ csrfToken: token });
  if (!existing) {
    response.cookies.set(CSRF_COOKIE_NAME, token, {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      httpOnly: false,
    });
  }
  return response;
}
